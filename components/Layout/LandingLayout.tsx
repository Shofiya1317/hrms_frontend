'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AiOutlineSetting } from 'react-icons/ai';
import { MdOutlineLogout } from 'react-icons/md';
import { useUser } from '../Context/userProvider';
import Header, { IProfileItem, IMenuItem, getMenuItemsByRole } from '../Header/Header';

export default function LandingLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const context = useUser();
  const pathname = usePathname();
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);

  useEffect(() => {
    if (context) {
      context?.getCurrentUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update menu items when user role changes
  useEffect(() => {
    if (context?.currentUser?.role) {
      const items = getMenuItemsByRole(context.currentUser.role);
      setMenuItems(items);
    }
  }, [context?.currentUser?.role]);

  const profileMenu: IProfileItem[] = [
    {
      label: 'Settings',
      path: '/settings/profile',
      icon: <AiOutlineSetting size={20} />,
    },
    {
      label: 'Logout',
      path: '/sign_in',
      icon: <MdOutlineLogout size={20} />,
    },
  ];

  return (
    <div>
      <Header
        user={context?.currentUser}
        profileMenu={profileMenu}
        pathname={pathname}
        menuItems={menuItems}
      />
      <main className="flex-1 w-full min-h-screen bg-background">
        <div className="transition-all duration-base p-4">
          <div className="bg-card">{children}</div>
        </div>
      </main>
    </div>
  );
}