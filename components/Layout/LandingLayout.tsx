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
    <div className="min-h-screen bg-[#f5f7f6]">
      <Header
        user={context?.currentUser}
        profileMenu={profileMenu}
        pathname={pathname}
        menuItems={menuItems}
      />
      <main className="min-h-screen w-full bg-[#f5f7f6] pt-16 sm:pt-20">
        <div className="mx-auto w-full max-w-[1600px] px-3 py-3 transition-all duration-base sm:px-4 lg:px-5 xl:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
