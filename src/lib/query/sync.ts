import { useQuery } from '@tanstack/react-query';
import { LAST_SYNC_STORAGE_KEY, VAULT_STORAGE_KEY } from '../../const';
import {
  LocalVaultChanges,
  SyncChangesResponse,
  SyncPushResponse,
  VaultItem,
} from '@/types/vault';

function findLocalChanges(
  currentVault: VaultItem[],
  lastSync: string
): LocalVaultChanges {
  const filteredVault = currentVault.filter(
    (item) => new Date(item.updated) > new Date(lastSync)
  );

  return filteredVault.reduce(
    (
      acc: { creates: VaultItem[]; updates: VaultItem[]; deletes: VaultItem[] },
      i
    ) => {
      if (i.deleted_at) {
        acc.deletes.push(i);
      } else if (new Date(i.created_at) > new Date(lastSync)) {
        acc.creates.push(i);
      } else {
        acc.updates.push(i);
      }

      return acc;
    },
    {
      creates: [],
      updates: [],
      deletes: [],
    }
  );
}

async function syncChanges(lastSync?: string | null) {
  if (!import.meta.env.WXT_API_URL) {
    throw new Error('WXT_API_URL env variable is not defined.');
  }

  const url = new URL(`${import.meta.env.WXT_API_URL}/sync/changes`);
  if (lastSync) {
    url.searchParams.append('since', lastSync);
  }
  const res = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(
      `[${res.status}] sync changes request failed:\n ${await res.text()}`
    );
  }

  return res.json() as Promise<SyncChangesResponse>;
}

async function syncPush(changes: LocalVaultChanges) {
  if (!import.meta.env.WXT_API_URL) {
    throw new Error('WXT_API_URL env variable is not defined.');
  }
  const url = new URL(`${import.meta.env.WXT_API_URL}/sync/push`);
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(changes),
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(
      `[${res.status}] sync push request failed:\n ${await res.text()}`
    );
  }

  return res.json() as Promise<SyncPushResponse>;
}

function categorizeChanges(vault: VaultItem[], changes: VaultItem[]) {
  return changes.reduce(
    (acc: { existingItems: VaultItem[]; newItems: VaultItem[] }, i) => {
      if (vault.find((c) => c.id === i.id)) {
        acc.existingItems.push(i);
      } else {
        acc.newItems.push(i);
      }
      return acc;
    },
    { existingItems: [], newItems: [] }
  );
}

function updateVault(vault: VaultItem[], changes: VaultItem[]) {
  const { existingItems, newItems } = categorizeChanges(vault, changes);

  const updatedVault = vault.map((item) => {
    // TODO: handle by timestamp comparison
    const updatedItem = existingItems.find((i) => i.id === item.id);
    return updatedItem ? updatedItem : item;
  });

  return [...updatedVault, ...newItems];
}

export function useSync() {
  return useQuery({
    queryKey: ['syncChanges'],
    queryFn: async () => {
      const lastSync = await storage.getItem<string>(LAST_SYNC_STORAGE_KEY);

      const { changes } = await syncChanges(lastSync);

      if (!lastSync) {
        await storage.setItems([
          { key: VAULT_STORAGE_KEY, value: changes },
          { key: LAST_SYNC_STORAGE_KEY, value: new Date().toISOString() },
        ]);
        return changes;
      }

      const existingVault =
        await storage.getItem<VaultItem[]>(VAULT_STORAGE_KEY);

      if (!existingVault) {
        throw new Error('Existing vault not found');
      }

      const updatedVault = updateVault(existingVault, changes);

      const { creates, deletes, updates } = findLocalChanges(
        existingVault,
        lastSync
      );

      await storage.setItem(VAULT_STORAGE_KEY, updatedVault);

      await syncPush({ creates, updates, deletes });

      await storage.setItem(LAST_SYNC_STORAGE_KEY, new Date().toISOString());

      return updatedVault;
    },
  });
}
