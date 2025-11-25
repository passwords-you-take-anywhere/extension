import { LogInIcon, UserRoundPlusIcon } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PopupBox from '../../components/popup-box';

export default function AuthLayout() {
  const { pathname } = useLocation();

  return (
    <PopupBox>
      <main className="p-4">
        <Outlet />
      </main>
      <nav>
        <Tabs value={pathname}>
          <TabsList className="w-full rounded-none">
            <TabsTrigger value="/auth/login" asChild>
              <Link to="/auth/login">
                Login <LogInIcon />
              </Link>
            </TabsTrigger>
            <TabsTrigger value="/auth/register" asChild>
              <Link to="/auth/register">
                Register <UserRoundPlusIcon />
              </Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </nav>
    </PopupBox>
  );
}
