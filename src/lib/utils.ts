import { VaultItem } from '@/types/vault';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { VAULT_STORAGE_KEY } from '../const';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function updateVault(item: VaultItem) {
  const vault = await storage.getItem<VaultItem[]>(VAULT_STORAGE_KEY);

  if (!vault) {
    throw new Error('Vault not found');
  }

  const itemExists = vault.some((i) => i.id === item.id);

  let updatedVault = vault;
  if (itemExists) {
    updatedVault = vault.map((i) => (i.id === item.id ? item : i));
  } else {
    updatedVault = [...vault, item];
  }

  return storage.setItem<VaultItem[]>(VAULT_STORAGE_KEY, updatedVault);
}

export function getPathname(fullUrl: string) {
  return new URL(fullUrl).pathname;
}
