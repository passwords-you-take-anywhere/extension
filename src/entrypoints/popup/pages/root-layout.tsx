import { RectangleEllipsisIcon, VaultIcon } from 'lucide-react';
import { Link, Outlet, useLoaderData } from 'react-router';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PopupBox from '../components/popup-box';
import { RootLoaderProps } from '../types/routes';
import { ACTIVE_TAB_STORAGE_KEY } from '@/lib/const';

export default function RootLayout() {
  const { activeTab: initialActiveTab } = useLoaderData<RootLoaderProps>();
  const [activeTab, setActiveTab] = useState(initialActiveTab || 'vault');

  function handleTabChange(tab: string) {
    setActiveTab(tab);
    storage.setItem(ACTIVE_TAB_STORAGE_KEY, tab);
  }
  return (
    <PopupBox>
      <main className="p-4">
        <Outlet />
      </main>
      <nav>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="">
          <TabsList className="w-full rounded-none">
            <TabsTrigger value="vault" asChild>
              <Link to="/">
                Vault <VaultIcon />
              </Link>
            </TabsTrigger>
            <TabsTrigger value="generator" asChild>
              <Link to="/generator">
                Generator <RectangleEllipsisIcon />
              </Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </nav>
    </PopupBox>
  );
}
