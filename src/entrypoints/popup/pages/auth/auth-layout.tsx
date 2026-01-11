import { LogInIcon, UserRoundPlusIcon } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AuthLayout() {
  const { pathname } = useLocation();

  return (
    <>
      <main className="flex-1 overflow-y-auto p-4">
        <Outlet />
      </main>
      <nav>
        <Tabs value={pathname}>
          <TabsList className="w-full rounded-none">
            <TabsTrigger value="/auth/login" asChild>
              <Link to="/auth/login" viewTransition>
                Login <LogInIcon />
              </Link>
            </TabsTrigger>
            <TabsTrigger value="/auth/register" asChild>
              <Link to="/auth/register" viewTransition>
                Register <UserRoundPlusIcon />
              </Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </nav>
    </>
  );
}
