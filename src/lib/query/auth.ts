import { AuthRequest, AuthResponse } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { TOKEN_STORAGE_KEY } from '../const';

async function authRequest(endpoint: 'login' | 'register', data: AuthRequest) {
  if (!import.meta.env.WXT_API_URL) {
    throw new Error('WXT_API_URL env variable is not defined.');
  }

  const response = await fetch(
    `${import.meta.env.WXT_API_URL}/auth/${endpoint}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    }
  );
  if (!response.ok) {
    throw new Error(
      `[${response.status}] ${endpoint} request failed:\n ${await response.text()}`
    );
  }
  return response.json() as Promise<AuthResponse>;
}

export function useLogin() {
  return useMutation({
    mutationFn: (data: AuthRequest) => authRequest('login', data),
    onSuccess: (data) => {
      storage.setItem(TOKEN_STORAGE_KEY, data.token);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: AuthRequest) => authRequest('register', data),
    onSuccess: (data) => {
      storage.setItem(TOKEN_STORAGE_KEY, data.token);
    },
  });
}
