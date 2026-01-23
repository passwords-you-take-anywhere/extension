import { AuthRequest, AuthResponse } from '@/types/auth';
import { useMutation } from '@tanstack/react-query';
import { TOKEN_STORAGE_KEY, VAULT_KEY_STORAGE_KEY } from '@/const';
import {
  createMasterKey,
  createAuthKey,
  encryptVaultKey,
  generateVaultKey,
  decryptVaultKey,
} from '../hash';
import { VaultKeyRequestProps, VaultKeyRequestResponse } from '@/types/vault';

async function authRequest(endpoint: 'login' | 'register', data: AuthRequest) {
  if (!import.meta.env.WXT_API_URL) {
    throw new Error('WXT_API_URL env variable is not defined.');
  }

  const masterKey = await createMasterKey(data.password, data.email);
  const authKey = await createAuthKey(masterKey, data.password);

  const response = await fetch(
    `${import.meta.env.WXT_API_URL}/auth/${endpoint}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: data.email, password: authKey }),
      credentials: 'include',
    }
  );
  if (!response.ok) {
    throw new Error(
      `[${response.status}] ${endpoint} request failed:\n ${await response.text()}`
    );
  }
  const { session_id } = (await response.json()) as AuthResponse;

  return { masterKey, session_id };
}

async function vaultKeyRequest(props: {
  method: 'GET';
}): Promise<{ encrypted_vault_key: string }>;

async function vaultKeyRequest(props: {
  method: 'POST';
  encryptedVaultKey: string;
}): Promise<void>;

async function vaultKeyRequest(
  props: VaultKeyRequestProps
): Promise<VaultKeyRequestResponse> {
  const response = await fetch(
    `${import.meta.env.WXT_API_URL}/auth/vault-key`,
    {
      method: props.method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body:
        props.method === 'POST'
          ? JSON.stringify({ encrypted_vault_key: props.encryptedVaultKey })
          : undefined,
    }
  );

  if (!response.ok) {
    throw new Error(
      `[${response.status}] vault-key request failed:\n ${await response.text()}`
    );
  }

  if (props.method === 'POST') {
    return;
  }

  return response.json() as Promise<VaultKeyRequestResponse>;
}

export function useLogin() {
  return useMutation({
    mutationFn: async (data: AuthRequest) => {
      const { session_id, masterKey } = await authRequest('login', data);

      const { encrypted_vault_key } = await vaultKeyRequest({ method: 'GET' });

      const { symmetricKey: vaultKey } = await decryptVaultKey(
        encrypted_vault_key,
        masterKey
      );

      return { session_id, masterKey, vaultKey };
    },
    onSuccess: (data) => {
      storage.setItems([
        { key: TOKEN_STORAGE_KEY, value: data.session_id },
        { key: VAULT_KEY_STORAGE_KEY, value: data.vaultKey.toString() },
      ]);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (data: AuthRequest) => {
      const { session_id, masterKey } = await authRequest('register', data);

      const vaultKey = generateVaultKey();
      const encryptedVaultKey = await encryptVaultKey(vaultKey, masterKey);

      await vaultKeyRequest({
        method: 'POST',
        encryptedVaultKey,
      });

      return { session_id, masterKey, vaultKey };
    },
    onSuccess: (data) => {
      storage.setItems([
        { key: TOKEN_STORAGE_KEY, value: data.session_id },
        { key: VAULT_KEY_STORAGE_KEY, value: data.vaultKey.toString() },
      ]);
    },
  });
}
