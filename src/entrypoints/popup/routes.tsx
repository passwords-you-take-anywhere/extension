import { createHashRouter, redirect } from 'react-router';
import GeneratorPage from './pages/generator';
import RootLayout from './pages/root-layout';
import VaultPage from './pages/vault';
import { isActiveTabPathValid, normalizeActiveTabPath } from './utils';
import { ACTIVE_TAB_STORAGE_KEY, TOKEN_STORAGE_KEY } from '@/lib/const';
import AuthLayout from './pages/auth/auth-layout';
import LoginPage from './pages/auth/login';
import RegisterPage from './pages/auth/register';

export const router = createHashRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <VaultPage /> },
      { path: '/generator', element: <GeneratorPage /> },
    ],
    loader: async ({ request: { url } }) => {
      const [token, activeTab] = await Promise.all([
        storage.getItem<string>(TOKEN_STORAGE_KEY),
        storage.getItem<string>(ACTIVE_TAB_STORAGE_KEY),
      ]);
      if (!token) {
        return redirect('/auth');
      }
      if (activeTab && !isActiveTabPathValid(url, activeTab)) {
        return redirect(normalizeActiveTabPath(activeTab));
      }
      return { activeTab };
    },
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
]);
