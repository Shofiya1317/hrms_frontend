import ChangeAvatar from '@/components/ChangeAvatar/ChangeAvatar';
import { SettingsNavBar } from '@/components/SettingsNavBar/SettingsNavBar';
import SettingsMobileView from '@/components/SettingsNavBar/SettingsMobileView';
import { auth } from '@/lib/auth';
import { IUser } from '@/lib/interface/IUser.interface';
import { UserService } from '@/lib/service';
import { convertToPascalCase } from '@/lib/utils';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import {
  User, KeyRound, Building2, UserPlus, Briefcase, Settings2,
} from 'lucide-react';

const accountMenu = [
  {
    text: 'Profile',
    subText: 'Personal details',
    settingIcon: <User size={18} />,
  },
  {
    text: 'Change Password',
    subText: 'Security',
    settingIcon: <KeyRound size={18} />,
  },
];

const orgMenu = [
  {
    text: 'Organisation Setup',
    subText: 'Departments & units',
    settingIcon: <Building2 size={18} />,
    roles: ['ADMIN', 'HR'],
  },
  {
    text: 'Masters Setup',
    subText: 'Designations, shifts & more',
    settingIcon: <Settings2 size={18} />,
    roles: ['ADMIN', 'HR'],
  },
  // {
  //   text: 'Invite Users',
  //   subText: 'Onboard employees',
  //   settingIcon: <UserPlus size={18} />,
  //   roles: ['ADMIN', 'HR'],
  // },
  {
    text: 'Company Profile',
    subText: 'Organisation details',
    settingIcon: <Briefcase size={18} />,
    roles: ['ADMIN'],
  },
];

export default async function layout({
  children,
  params,
}: {
  children: ReactNode;
  params: { slug: string };
}) {
  const session = await auth();
  if (!session) return redirect('/sign_in');

  const apiKey = (session?.user as unknown as { apiKey: string })?.apiKey;
  const accessToken = (session?.user as unknown as { accessToken: string })?.accessToken;

  const userRes = await UserService.getCurrentUser(apiKey, accessToken);
  const { user, success } = userRes?.data as { user: IUser; success: boolean };

  if (!success) return redirect('/sign_in');

  const role = user?.role;
  const visibleOrgMenu = orgMenu.filter((item) => item.roles.includes(role));
  const activeMenu = convertToPascalCase(params?.slug?.replaceAll('_', ' ') ?? '');
  const allMenuItems = [...accountMenu, ...visibleOrgMenu];

  // Shape the items for SettingsMobileNav (url derived the same way as SettingsNavBar uses it)
  const mobileNavItems = allMenuItems.map((item) => ({
    text: item.text,
    subText: item.subText,
    settingIcon: item.settingIcon,
    url: item.text.toLowerCase().replaceAll(' ', '_'),
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-100 px-4 py-4 lg:px-8">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Manage your account and organisation</p>
      </div>

      <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-73px)]">

        {/* ── MOBILE: bottom-sheet nav trigger ── */}
        <div className="lg:hidden">
          <SettingsMobileView items={mobileNavItems} activeMenu={activeMenu} />
        </div>

        {/* ── DESKTOP: fixed left sidebar — avatar pinned, nav scrolls ── */}
        <aside className="hidden lg:flex flex-col w-96 bg-white border-r border-slate-100 shrink-0 h-full">

          {/* Avatar — pinned, never scrolls */}
          <div className="shrink-0 px-5 py-4 border-b border-slate-100">
            <ChangeAvatar
              user={user}
              apiKey={apiKey}
              isUser={params?.slug !== 'company_profile'}
            />
          </div>

          {/* Nav items — scrollable independently */}
          <div className="flex-1 overflow-y-auto px-4 py-4">

            {/* My account */}
            <p className="px-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              My account
            </p>
            <div className="flex flex-col gap-1 mb-4">
              {accountMenu.map((item) => (
                <SettingsNavBar
                  key={item.text}
                  url={item.text.toLowerCase().replaceAll(' ', '_')}
                  text={item.text}
                  subText={item.subText}
                  isRadius
                  settingIcon={item.settingIcon}
                  menu={activeMenu}
                />
              ))}
            </div>

            {/* Company — hidden for EMPLOYEE */}
            {visibleOrgMenu.length > 0 && (
              <>
                <p className="px-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Company
                </p>
                <div className="flex flex-col gap-1">
                  {visibleOrgMenu.map((item) => (
                    <SettingsNavBar
                      key={item.text}
                      url={item.text.toLowerCase().replaceAll(' ', '_')}
                      text={item.text}
                      subText={item.subText}
                      isRadius
                      settingIcon={item.settingIcon}
                      menu={activeMenu}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </aside>

        {/* ── Main content area ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-full mx-auto px-3 py-2 lg:px-10 lg:py-5">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}