export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  session_id: string;
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
