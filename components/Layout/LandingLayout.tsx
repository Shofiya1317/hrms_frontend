'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AiOutlineSetting } from 'react-icons/ai';
import { MdOutlineLogout } from 'react-icons/md';
import { useUser } from '../Context/userProvider';
import Header, { IMenuItem, IProfileItem } from '../Header/Header';

export default function LandingLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const context = useUser();
  const pathname = usePathname();
  useEffect(() => {
    if (context) {
      context?.getCurrentUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isVendor = context?.currentUser?.role === 'VENDOR';

  const rootMenu: IMenuItem[] = isVendor
    ? [
      {
        label: 'Cockpit',
        path: '/home',
      },
    ]
    : [
      {
        label: 'Cockpit',
        path: '/home',
      },
      {
        label: 'SKU',
        path: '',
      },
      {
        label: 'Vendor',
        path: '',
      },
      {
        label: 'Tasks',
        path: '/tasks',
      },
      {
        label: 'Emission Calculator',
        path: '/emission_calculator',
      },
      {
        label: 'Users',
        path: '/users',
      },
    ];

  const insightsMenu: IMenuItem[] = [
    {
      label: 'Management',
      path: '/sku_management',
    },
    {
      label: 'Analytics',
      path: '/sku_analytics_dashboard',
    },
  ];

  const disclosureMenu: IMenuItem[] = [
    {
      label: 'Management',
      path: '/vendor_management',
    },
    {
      label: 'Analytics',
      path: '/vendor_analytics_dashboard',
    },
    {
      label: 'Comparison',
      path: '/vendor_comparison',
    },
  ];

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
  // const hasAccess = (feature: string) => context?.currentRole?.HEADER?.includes(feature);

  // const filteredItems = rootMenu.filter((item) =>
  // hasAccess(item.label?.toLocaleUpperCase()?.replaceAll(' ', '_')));
  // if (
  //   context?.currentUser?.role === 'MANAGER'
  //   // context?.currentUser?.role === 'OWNER'
  //   || context?.currentUser?.role === 'ADMIN'
  // ) {
  //   // filteredItems.unshift(rootMenu[0]);
  //   // filteredItems.push(rootMenu[4]);
  //   // filteredItems.push(rootMenu[5]);
  //   // filteredItems.push(rootMenu[6]);
  //   // filteredItems.push(rootMenu[7]);
  //   // filteredItems.push(rootMenu[8]);
  // }

  return (
    <div>
      <Header
        user={context?.currentUser}
        menuItems={rootMenu}
        profileMenu={profileMenu}
        skuMenu={insightsMenu}
        vendorMenu={disclosureMenu}
        pathname={pathname}
      />
      <main className="flex-1 w-full min-h-screen bg-background">
        <div className="transition-all duration-base p-4">
          <div className="bg-card">{children}</div>
        </div>
      </main>
    </div>
  );
}
