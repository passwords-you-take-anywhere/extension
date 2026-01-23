export interface VaultItem {
  id: string;
  username_data: string;
  password_data: string;
  domains: string[];
  updated: string;
  created_at: string;
  deleted_at?: string;
  notes: string;
}

export interface SyncChangesResponse {
  changes: VaultItem[];
}

export type VaultKeyRequestProps =
  | {
      method: 'GET';
    }
  | {
      method: 'POST';
      encryptedVaultKey: string;
    };

export type VaultKeyRequestResponse = {
  encrypted_vault_key: string;
} | void;

export interface LocalVaultChanges {
  creates: VaultItem[];
  updates: VaultItem[];
  deletes: VaultItem[];
}

export interface SyncPushResponse {
  applied: number;
  conflicts: {
    id: string;
    client_updated: string;
    server_updated: string;
    reason: string;
  }[];
}
