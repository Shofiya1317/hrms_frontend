'use client';

import { ReactNode, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { AiOutlineSetting } from 'react-icons/ai';
import { MdOutlineLogout } from 'react-icons/md';
import { useUser } from '../Context/userProvider';
import Header, { IProfileItem, IMenuItem, getMenuItemsByRole } from '../Header/Header';

// Defined outside component — stable reference, prevents React.memo(Header) from re-rendering
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

export default function LandingLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const context = useUser();
  const pathname = usePathname();

  useEffect(() => {
    if (context && !context.currentUser) {
      context.getCurrentUser();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useMemo replaces useState + useEffect — zero extra renders
  const menuItems: IMenuItem[] = useMemo(
    () => (context?.currentUser?.role ? getMenuItemsByRole(context.currentUser.role) : []),
    [context?.currentUser?.role],
  );

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