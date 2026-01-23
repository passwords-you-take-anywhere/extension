import { VaultItem } from '@/types/vault';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { VAULT_STORAGE_KEY } from '../const';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function updateVault(item: VaultItem) {
  const vault = (await storage.getItem<VaultItem[]>(VAULT_STORAGE_KEY)) ?? [];

  const itemExists = vault.some((i) => i.id === item.id);

  const updatedVault = itemExists
    ? vault.map((i) => (i.id === item.id ? item : i))
    : [...vault, item];

  return storage.setItem<VaultItem[]>(VAULT_STORAGE_KEY, updatedVault);
}

export function getPathname(fullUrl: string) {
  return new URL(fullUrl).pathname;
}
