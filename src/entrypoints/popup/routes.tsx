import { createHashRouter, redirect } from 'react-router';
import AuthPage from './pages/auth';
import GeneratorPage from './pages/generator';
import Layout from './pages/layout';
import VaultPage from './pages/vault';
import { isActiveTabPathValid, normalizeActiveTabPath } from './utils';
import { ACTIVE_TAB_KEY, SESSION_ID_KEY } from './const';

export const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <VaultPage /> },
      { path: '/generator', element: <GeneratorPage /> },
    ],
    loader: async ({ request: { url } }) => {
      const [sessionId, activeTab] = await Promise.all([
        storage.getItem<string>(SESSION_ID_KEY),
        storage.getItem<string>(ACTIVE_TAB_KEY),
      ]);
      if (!sessionId) {
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
    element: <AuthPage />,
  },
]);
