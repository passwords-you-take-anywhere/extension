export interface VaultItem {
  id: string;
  username: string;
  password: string;
  domains: string[];
  updated: string;
  notes?: string;
}
