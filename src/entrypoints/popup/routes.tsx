import {
  ACTIVE_TAB_STORAGE_KEY,
  TOKEN_STORAGE_KEY,
  VAULT_STORAGE_KEY,
} from '@/const';
import { createHashRouter, LoaderFunctionArgs, redirect } from 'react-router';
import AuthLayout from './pages/auth/auth-layout';
import LoginPage from './pages/auth/login';
import RegisterPage from './pages/auth/register';
import GeneratorPage from './pages/generator';
import VaultLayout from './pages/vault-layout';
import EditPage from './pages/vault/edit';
import NewPage from './pages/vault/new';
import VaultPage from './pages/vault/vault';
import ViewPage from './pages/vault/view';
import { getPathname } from '@/lib/utils';
import PopupBox from './components/popup-box';
import { VaultItem } from '@/types/vault';

async function rootLoader({ request: { url } }: LoaderFunctionArgs) {
  const [token, activeTab] = await Promise.all([
    storage.getItem<string>(TOKEN_STORAGE_KEY),
    storage.getItem<string>(ACTIVE_TAB_STORAGE_KEY),
  ]);
  if (!token && !url.includes('auth')) {
    return redirect('/auth');
  }
  if (activeTab && activeTab !== getPathname(url)) {
    return redirect(activeTab);
  }
  return { activeTab };
}

export const router = createHashRouter([
  {
    element: <PopupBox />,
    loader: rootLoader,
    children: [
      { index: true, loader: () => redirect('/vault') },
      {
        element: <VaultLayout />,
        children: [
          {
            path: '/vault',
            children: [
              {
                index: true,
                element: <VaultPage />,
              },
              {
                path: 'new',
                element: <NewPage />,
              },
              {
                path: ':id',
                element: <ViewPage />,
                loader: async ({ params }) => {
                  const items =
                    await storage.getItem<VaultItem[]>(VAULT_STORAGE_KEY);

                  const item = items?.find((i) => i.id === params.id);

                  return { item };
                },
              },
              {
                path: ':id/edit',
                element: <EditPage />,
                loader: async ({ params }) => {
                  const items =
                    await storage.getItem<VaultItem[]>(VAULT_STORAGE_KEY);

                  const item = items?.find((i) => i.id === params.id);

                  return { item };
                },
              },
            ],
          },
          { path: '/generator', element: <GeneratorPage /> },
        ],
      },
      {
        path: '/auth',
        element: <AuthLayout />,
        children: [
          {
            index: true,
            loader: () => redirect('/auth/login'),
          },
          {
            path: 'login',
            element: <LoginPage />,
          },
          {
            path: 'register',
            element: <RegisterPage />,
          },
        ],
      },
    ],
  },
]);
