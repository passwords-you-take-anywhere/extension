import { RectangleEllipsisIcon, VaultIcon } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function VaultLayout() {
  const { pathname } = useLocation();

  return (
    <>
      <main className="flex-1 overflow-y-auto px-4">
        <Outlet />
      </main>
      <nav className="shrink-0">
        <Tabs value={pathname.split('/')[1]} className="">
          <TabsList className="w-full rounded-none">
            <TabsTrigger value="vault" asChild>
              <Link to="/vault" viewTransition>
                Vault <VaultIcon />
              </Link>
            </TabsTrigger>
            <TabsTrigger value="generator" asChild>
              <Link to="/generator" viewTransition>
                Generator <RectangleEllipsisIcon />
              </Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </nav>
    </>
  );
}
