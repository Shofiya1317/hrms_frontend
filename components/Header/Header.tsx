'use client';

import rubicrDashboardLogo from '@/assests/RubiCrLogo 2.png';
import { IUser } from '@/lib/interface/IUser.interface';
import { signOut, useSession } from 'next-auth/react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import toast from 'react-hot-toast';
import { FaRegBell } from 'react-icons/fa';
import { HiOutlineChevronDown } from 'react-icons/hi';
import { TiWarning } from 'react-icons/ti';
import {
  BarChart3, CalendarClock, CalendarDays, ClipboardCheck,
  FileText, LayoutDashboard, Shield, UserRoundCheck, UsersRound,
} from 'lucide-react';
import Avatar from '../Avatar/Avatar';
import { Button } from '../Button/Button';
import { useModal } from '../Modal/Context';
import 'bootstrap/dist/css/bootstrap.min.css';

export interface IMenuItem {
  label: string;
  path: string;
  icon?: ReactNode;
  isActive?: boolean;
  featureName?: string;
  menuItems?: IMenuItem[];
}

export interface IProfileItem {
  label: string;
  path: string;
  icon: ReactNode;
  isActive?: boolean;
  menuItems?: { label: string; path: string; isActive: boolean }[];
}

export interface HeaderProps {
  user: IUser | undefined;
  profileMenu: IProfileItem[];
  pathname: string;
  menuItems: IMenuItem[];
}

// ── Role-based Menu Configuration ────────────────────────────────
export const adminMenuItems: IMenuItem[] = [
  { label: 'Overview', path: '/dashboard', icon: <LayoutDashboard size={16} /> },
  {
    label: 'Attendance', path: '', icon: <CalendarClock size={16} />,
    menuItems: [
      { label: 'Dashboard', path: '/attendance/dashboard' },
      { label: 'Attendance Logs', path: '/attendance/logs' },
      { label: 'Leave Management', path: '/attendance/leave' },
      { label: 'Attendance Policies', path: '/attendance/policies' },
    ],
  },
  {
    label: 'People', path: '', icon: <UsersRound size={16} />,
    menuItems: [
      { label: 'Employee Registry', path: '/employees/registry' },
      // { label: 'ID Management', path: '/employees/id_management' },
      { label: 'Employee Documents', path: '/employees/documents' },
    ],
  },
  { label: 'Workforce Analytics', path: '/analytics', icon: <BarChart3 size={16} /> },
  { label: 'Reports', path: '/reports', icon: <FileText size={16} /> }, // 👈
];

export const employeeMenuItems: IMenuItem[] = [
  { label: 'My Workspace', path: '/employee/dashboard', icon: <UserRoundCheck size={16} /> },
  {
    label: 'Attendance', path: '', icon: <ClipboardCheck size={16} />,
    menuItems: [
      { label: 'Overview', path: '/employee/attendance/overview' },
      { label: 'Check-in/Check-out', path: '/employee/attendance/check-in-out' },
      { label: 'Monthly View', path: '/employee/attendance/monthly-view' },
    ],
  },
  {
    label: 'Leave Management', path: '', icon: <CalendarDays size={16} />,
    menuItems: [
      { label: 'Apply Leave', path: '/employee/attendance/apply-leave' },
      { label: 'Comp Off', path: '/employee/attendance/comp-off' },
    ],
  },
  {
    label: 'Requests', path: '', icon: <FileText size={16} />,
    menuItems: [
      { label: 'Regularization', path: '/employee/attendance/regularization' },
      { label: 'Work From Home', path: '/employee/attendance/work-from-home' },
    ],
  },
];

export const getMenuItemsByRole = (role: string): IMenuItem[] => {
  switch (role?.toLowerCase()) {
    case 'admin': return adminMenuItems;
    case 'employee': return employeeMenuItems;
    default: return adminMenuItems;
  }
};

// ── Active helpers ────────────────────────────────────────────────
const isMenuItemActive = (item: IMenuItem, pathname: string): boolean => {
  if (item.path && item.path !== '' && pathname.startsWith(item.path)) return true;
  if (item.menuItems) return item.menuItems.some(sub => sub.path && pathname.startsWith(sub.path));
  return false;
};

const isProfileItemActive = (item: IMenuItem, pathname: string): boolean => {
  switch (item.label) {
    case 'Settings':
      return ['/settings/profile', '/settings/change_password', '/settings/company_profile', '/settings/business_unit'].includes(pathname);
    case 'Users':
      return pathname === '/users' || pathname === '/users/invite';
    default: return false;
  }
};

// ── Desktop Dropdown (absolute, used only on lg+) ─────────────────
function DesktopDropdownMenu({
  items, router, pathname, onClose,
}: {
  items: IMenuItem[]; router: AppRouterInstance; pathname: string; onClose: () => void;
}) {
  return (
    <ul className="user-dropdown-submenusection p-2 pb-3">
      {items.map(item => (
        <li
          key={item.label}
          aria-hidden
          className={`sub_item flex items-center justify-between ${item.path && pathname.startsWith(item.path) ? 'active' : ''}`}
          style={{ cursor: 'pointer' }}
          onClick={() => { router.push(item.path); onClose(); }}
        >
          <p className="mb-0 text-sm font-medium">{item.label}</p>
          {item.icon}
        </li>
      ))}
    </ul>
  );
}

// ── Desktop Nav Item (keeps absolute dropdown for lg screens) ─────
function DesktopNavbarItem({
  item, pathname, openMenu, setOpenMenu,
}: {
  item: IMenuItem; pathname: string;
  openMenu: string | null; setOpenMenu: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const router = useRouter();
  const hasChildren = !!(item.menuItems && item.menuItems.length > 0);
  const isOpen = openMenu === item.label;
  const isActive = isMenuItemActive(item, pathname);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasChildren) {
      setOpenMenu(isOpen ? null : item.label);
    } else {
      router.push(item.path);
      setOpenMenu(null);
    }
  };

  return (
    <Nav.Link as="span">
      <span
        role="button"
        tabIndex={0}
        className={`menu_item_routes ${isActive ? 'active' : ''}`}
        style={{ cursor: 'pointer' }}
        onClick={handleClick}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleClick(e as unknown as React.MouseEvent); }}
      >
        <div className="relative flex items-center whitespace-nowrap">
          {item.icon && <span className="mr-2 inline-flex">{item.icon}</span>}
          <span className="mr-1">{item.label}</span>
          {hasChildren && (
            <HiOutlineChevronDown
              size={16}
              color="currentColor"
              style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          )}
          {/* Absolute dropdown — desktop only, safe because container has enough width */}
          {hasChildren && isOpen && item.menuItems && (
            <div className="show-insights-menu">
              <DesktopDropdownMenu
                items={item.menuItems}
                router={router}
                pathname={pathname}
                onClose={() => setOpenMenu(null)}
              />
            </div>
          )}
        </div>
      </span>
    </Nav.Link>
  );
}

// ── Mobile Nav Item (accordion — renders sub-items inline in flow) ─
function MobileNavItem({
  item, pathname, router, onClose,
}: {
  item: IMenuItem; pathname: string; router: AppRouterInstance; onClose: () => void;
}) {
  const hasChildren = !!(item.menuItems && item.menuItems.length > 0);
  const isActive = isMenuItemActive(item, pathname);
  const [expanded, setExpanded] = useState(isActive && hasChildren);

  const handleParentClick = () => {
    if (hasChildren) {
      setExpanded(prev => !prev);
    } else {
      router.push(item.path);
      onClose();
    }
  };

  return (
    <li className="list-none">
      {/* Parent row */}
      <button
        type="button"
        onClick={handleParentClick}
        className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-colors text-left
          ${isActive
            ? 'text-[color:var(--primary,#0d9488)] bg-[color:var(--primary-light,#f0fdfa)] font-semibold'
            : 'text-slate-700 hover:bg-slate-50 font-medium'
          }`}
      >
        <span className="flex items-center gap-2.5">
          {item.icon && (
            <span className={`${isActive ? 'text-[color:var(--primary,#0d9488)]' : 'text-slate-400'}`}>
              {item.icon}
            </span>
          )}
          <span className="text-sm">{item.label}</span>
        </span>
        {hasChildren && (
          <HiOutlineChevronDown
            size={15}
            className="flex-shrink-0 text-slate-400 transition-transform duration-200"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        )}
      </button>

      {/* Inline accordion sub-items — fully in normal flow, no absolute */}
      {hasChildren && expanded && item.menuItems && (
        <ul className="mt-0.5 mb-1 ml-7 space-y-0.5 border-l-2 border-slate-100 pl-3">
          {item.menuItems.map(sub => {
            const subActive = sub.path && pathname.startsWith(sub.path);
            return (
              <li key={sub.label} className="list-none">
                <button
                  type="button"
                  onClick={() => { router.push(sub.path); onClose(); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors
                    ${subActive
                      ? 'text-[color:var(--primary,#0d9488)] bg-[color:var(--primary-light,#f0fdfa)] font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                    }`}
                >
                  {sub.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

// ── Profile Menu Item ─────────────────────────────────────────────
function ProfileNavbarItem({
  item, router, pathname,
}: {
  item: IMenuItem; router: AppRouterInstance; pathname: string;
}) {
  const hideModal = useModal({});
  const logoutModal = useModal({
    content: (
      <div className="text-center">
        <div className="flex items-center justify-center">
          <TiWarning color="var(--danger)" size={40} className="mr-2" />
          <h5 className="mb-0 font-bold text-[#424242]">Are you sure you want to logout?</h5>
        </div>
        <div className="flex justify-center gap-3 mt-4">
          <Button text="Cancel" onClick={hideModal} />
          <Button text="Confirm" onClick={() => { router.push(item?.path); signOut({ redirect: false }); hideModal(); }} isSolid />
        </div>
      </div>
    ),
  });

  return (
    <li
      aria-hidden
      className={`sub_item flex items-center justify-between ${isProfileItemActive(item, pathname) ? 'active' : ''}`}
      onClick={() => { if (item.label === 'Logout') logoutModal(); else router.push(item?.path); }}
    >
      <p className="mb-0 text-sm font-medium">{item.label}</p>
      {item.icon}
    </li>
  );
}

// ── Desktop Profile Dropdown ──────────────────────────────────────
function ProfileDropdown({
  profileMenu, router, pathname,
}: {
  profileMenu: IProfileItem[]; router: AppRouterInstance; pathname: string;
}) {
  return (
    <ul className="user-dropdown-submenusection p-2 pb-3">
      {profileMenu.map((item: IMenuItem) => (
        <ProfileNavbarItem item={item} key={item.label} router={router} pathname={pathname} />
      ))}
    </ul>
  );
}

// ── Mobile Profile List (inline, no absolute) ─────────────────────
function MobileProfileList({
  profileMenu, router, pathname, onClose,
}: {
  profileMenu: IProfileItem[]; router: AppRouterInstance; pathname: string; onClose: () => void;
}) {
  const hideModal = useModal({});

  return (
    <ul className="space-y-0.5 p-4 m-0" style={{ backgroundColor: 'var(--bgHeader)' }}>
      {profileMenu.map((item: IProfileItem) => {
        const active = isProfileItemActive(item as unknown as IMenuItem, pathname);
        return (
          <li key={item.label} className="list-none">
            <button
              type="button"
              onClick={() => {
                if (item.label === 'Logout') {
                  signOut({ redirect: false });
                  router.push(item.path);
                  onClose();
                } else {
                  router.push(item.path);
                  onClose();
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm transition-colors text-left
                ${active
                  ? 'text-[color:var(--primary,#0d9488)] bg-[color:var(--primary-light,#f0fdfa)] font-semibold'
                  : 'text-slate-700 hover:bg-slate-50 font-medium'
                }`}
            >
              <span>{item.label}</span>
              {item.icon && <span className="text-slate-400">{item.icon}</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// ── Main Header ───────────────────────────────────────────────────
function Header(props: HeaderProps) {
  const { menuItems, pathname, profileMenu, user } = props;
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'menu' | 'profile'>('menu');
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafId = useRef<number>(0);
  const navRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const router = useRouter();
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    toast.success('Signed Out', { duration: 3000 });
    signOut({ redirect: false });
    router.push('/sign_in');
  };

  useEffect(() => {
    if (!session) return undefined;
    timeoutId.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT);
    const handleActivity = () => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        if (timeoutId.current) clearTimeout(timeoutId.current);
        timeoutId.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT);
      });
    };
    document.addEventListener('mousemove', handleActivity, { passive: true });
    document.addEventListener('keydown', handleActivity, { passive: true });
    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current);
      cancelAnimationFrame(rafId.current);
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('keydown', handleActivity);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const closeMobile = () => setIsMobileOpen(false);

  return (
    <div className="fixed inset-x-0 top-0 p-0" style={{ zIndex: 1030 }}>
      <Navbar expand="lg" className="header_bg px-3 py-0 sm:px-4 lg:px-6">

        {/* ── Logo ── */}
        <Navbar.Brand href="/dashboard" className="p-0">
          <div className="flex items-center font-semibold">
            <Image src={rubicrDashboardLogo} alt="logo" />
          </div>
        </Navbar.Brand>

        {/* ── Mobile hamburger button ── */}
        <button
          type="button"
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
          onClick={() => setIsMobileOpen(prev => !prev)}
        >
          {isMobileOpen ? (
            /* X icon */
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            /* Hamburger */
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
              <path d="M0 1h18M0 7h18M0 13h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>

        {/* ── Mobile slide-down drawer ── */}
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <div
              className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm"
              style={{ zIndex: 1029, top: 56 }}
              onClick={closeMobile}
              aria-hidden
            />

            {/* Drawer panel — position: fixed, full width, below navbar, scrollable */}
            <div
              className="lg:hidden fixed left-0 right-0 shadow-xl overflow-y-auto"
              style={{
                zIndex: 1031,
                top: 56,           /* matches navbar height */
                maxHeight: 'calc(100vh - 56px)',
                backgroundColor: 'var(--bgHeader)',
              }}
            >
              {/* Tab switcher */}
              <div
                className="flex items-center justify-center gap-0 border-b sticky top-0"
                style={{ backgroundColor: 'var(--bgHeader)', borderColor: 'var(--bgColor)' }}
              >
                <button
                  type="button"
                  onClick={() => setMobileView('menu')}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-colors relative
                    ${mobileView === 'menu'
                      ? 'text-[color:var(--primary,#0d9488)]'
                      : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  Menu
                  {mobileView === 'menu' && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-t-full bg-[color:var(--primary,#0d9488)]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setMobileView('profile')}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-colors relative
                    ${mobileView === 'profile'
                      ? 'text-[color:var(--primary,#0d9488)]'
                      : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  Profile
                  {mobileView === 'profile' && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-t-full bg-[color:var(--primary,#0d9488)]" />
                  )}
                </button>
              </div>

              {/* Menu view — accordion list, no absolute children */}
              {mobileView === 'menu' && (
                <ul className="space-y-1 p-4 m-0">
                  {menuItems.map(item => (
                    <MobileNavItem
                      key={item.label}
                      item={item}
                      pathname={pathname}
                      router={router}
                      onClose={closeMobile}
                    />
                  ))}
                </ul>
              )}

              {/* Profile view */}
              {mobileView === 'profile' && (
                <MobileProfileList
                  profileMenu={profileMenu}
                  router={router}
                  pathname={pathname}
                  onClose={closeMobile}
                />
              )}
            </div>
          </>
        )}

        {/* ── Desktop nav ── */}
        <Navbar.Collapse id="navbarScroll">
          <div className="custom-nav-container">
            <div className="flex min-w-0 flex-grow items-center justify-between">
              <Nav className="flex min-w-0 flex-grow justify-center gap-1 xl:gap-2" ref={navRef}>
                {menuItems.map(item => (
                  <DesktopNavbarItem
                    item={item}
                    key={item.label}
                    pathname={pathname}
                    openMenu={openMenu}
                    setOpenMenu={setOpenMenu}
                  />
                ))}
              </Nav>

              {/* Bell + avatar */}
              <div className="flex shrink-0 items-center gap-3">
                <button className="hrms-header-icon-btn" type="button" aria-label="Notifications">
                  <FaRegBell size={18} />
                </button>
                <div
                  role="button"
                  tabIndex={0}
                  className="relative"
                  ref={profileRef}
                  onClick={() => setShowProfileMenu(prev => !prev)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowProfileMenu(prev => !prev); }}
                >
                  <div className="flex items-center gap-3" title={user?.name}>
                    <Avatar
                      name={user?.name?.charAt(0)?.toLocaleUpperCase() || ''}
                      size="40px"
                      className="rounded-full"
                      avator={user?.avatar_url || ''}
                    />
                    <HiOutlineChevronDown
                      size={22}
                      color="#64748b"
                      style={{ transition: 'transform 0.2s', transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </div>
                  {showProfileMenu && (
                    <div className="show-profile-menu">
                      <ProfileDropdown profileMenu={profileMenu} router={router} pathname={pathname} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
}

export default React.memo(Header);