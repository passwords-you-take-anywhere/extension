import { ACTIVE_TAB_STORAGE_KEY } from '@/const';
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';

export default function PopupBox() {
  const { pathname } = useLocation();
  console.log(pathname, 'pathname');
  useEffect(() => {
    storage.setItem(ACTIVE_TAB_STORAGE_KEY, pathname);
  }, [pathname]);

  return (
    <div className="dark bg-background text-foreground flex h-128 w-xs flex-col justify-between">
      <Outlet />
    </div>
  );
}
