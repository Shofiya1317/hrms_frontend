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
  BarChart3,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Shield,
  UserRoundCheck,
  UsersRound,
} from 'lucide-react';
import Avatar from '../Avatar/Avatar';
import { Button } from '../Button/Button';
import { useModal } from '../Modal/Context';
import 'bootstrap/dist/css/bootstrap.min.css';
// Note: move this import to app/globals.css to avoid it being bundled per-component

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
  menuItems: IMenuItem[]; // Now receives menu items from parent
}

// ── Role-based Menu Configuration ─────────────────────────────────
export const adminMenuItems: IMenuItem[] = [
  {
    label: 'Overview',
    path: '/dashboard',
    icon: <LayoutDashboard size={16} />,
  },
  {
    label: 'Attendance',
    path: '',
    icon: <CalendarClock size={16} />,
    menuItems: [
      { label: 'Dashboard', path: '/attendance/dashboard' },
      { label: 'Attendance Logs', path: '/attendance/logs' },
      { label: 'Leave Management', path: '/attendance/leave' },
      { label: 'Attendance Policies', path: '/attendance/policies' },
    ],
  },
  {
    label: 'People',
    path: '',
    icon: <UsersRound size={16} />,
    menuItems: [
      { label: 'Employee Registry', path: '/employees/registry' },
      { label: 'ID Management', path: '/employees/id_management' },
      { label: 'Employee Documents', path: '/employees/documents' },
    ],
  },
  {
    label: 'Workforce Analytics',
    path: '/analytics',
    icon: <BarChart3 size={16} />,
  },
  {
    label: 'Access Control',
    path: '/users',
    icon: <Shield size={16} />,
  },
];

// export const adminMenuItems: IMenuItem[] = [
//   {
//     label: 'Cockpit',
//     path: '/employee/dashboard',
//   },
//   {
//     label: 'Attendance',
//     path: '',
//     menuItems: [
//       { label: 'Overview', path: '/employee/attendance/overview' },
//       { label: 'Check-in/Check-out', path: '/employee/attendance/check-in-out' },
//       { label: 'Monthly View', path: '/employee/attendance/monthly-view' },
//       { label: 'Apply Leave', path: '/employee/attendance/apply-leave' },
//       { label: 'Regularization', path: '/employee/attendance/regularization' },
//       { label: 'Comp Off', path: '/employee/attendance/comp-off' },
//     ],
//   },
// ];

export const employeeMenuItems: IMenuItem[] = [
  {
    label: 'My Workspace',
    path: '/employee/dashboard',
    icon: <UserRoundCheck size={16} />,
  },

  {
    label: 'Attendance',
    path: '',
    icon: <ClipboardCheck size={16} />,
    menuItems: [
      { label: 'Overview', path: '/employee/attendance/overview' },
      {
        label: 'Check-in/Check-out',
        path: '/employee/attendance/check-in-out',
      },
      { label: 'Monthly View', path: '/employee/attendance/monthly-view' },
    ],
  },

  {
    label: 'Leave Management',
    path: '',
    icon: <CalendarDays size={16} />,
    menuItems: [
      { label: 'Apply Leave', path: '/employee/attendance/apply-leave' },
      { label: 'Comp Off', path: '/employee/attendance/comp-off' },
    ],
  },

  {
    label: 'Requests',
    path: '',
    icon: <FileText size={16} />,
    menuItems: [
      {
        label: 'Regularization',
        path: '/employee/attendance/regularization',
      },
      {
        label: 'Work From Home',
        path: '/employee/attendance/work-from-home',
      },
    ],
  },
];

// Helper function to get menu items based on role
export const getMenuItemsByRole = (role: string): IMenuItem[] => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return adminMenuItems;
    case 'employee':
      return employeeMenuItems;
    default:
      return adminMenuItems; // Default to admin or empty array
  }
};

// ── Active helpers ────────────────────────────────────────────────
const isMenuItemActive = (item: IMenuItem, pathname: string): boolean => {
  if (item.path && item.path !== '' && pathname.startsWith(item.path))
    return true;
  if (item.menuItems) {
    return item.menuItems.some(
      (sub) => sub.path && pathname.startsWith(sub.path)
    );
  }
  return false;
};

const isProfileItemActive = (item: IMenuItem, pathname: string): boolean => {
  switch (item.label) {
    case 'Settings':
      return [
        '/settings/profile',
        '/settings/change_password',
        '/settings/company_profile',
        '/settings/business_unit',
      ].includes(pathname);
    case 'Users':
      return pathname === '/users' || pathname === '/users/invite';
    default:
      return false;
  }
};

// ── Dropdown Menu ─────────────────────────────────────────────────
function DropdownMenu({
  items,
  router,
  pathname,
  onClose,
}: {
  items: IMenuItem[];
  router: AppRouterInstance;
  pathname: string;
  onClose: () => void;
}) {
  return (
    <ul className="user-dropdown-submenusection p-2 pb-3">
      {items.map((item) => (
        <li
          key={item.label}
          aria-hidden
          className={`sub_item flex justify-between items-center ${
            item.path && pathname.startsWith(item.path) ? 'active' : ''
          }`}
          style={{ cursor: 'pointer' }}
          onClick={() => {
            router.push(item.path);
            onClose();
          }}
        >
          <p className="fs-14 fw-500 mb-0" style={{ letterSpacing: '1.1px' }}>
            {item.label}
          </p>
          {item.icon}
        </li>
      ))}
    </ul>
  );
}

// ── Single Navbar Item ────────────────────────────────────────────
function NavbarItem({
  item,
  pathname,
  openMenu,
  setOpenMenu,
}: {
  item: IMenuItem;
  pathname: string;
  openMenu: string | null;
  setOpenMenu: React.Dispatch<React.SetStateAction<string | null>>;
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
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ')
            handleClick(e as unknown as React.MouseEvent);
        }}
      >
        <div className="flex items-center relative">
          {item.icon && <span className="mr-2 d-inline-flex">{item.icon}</span>}
          <span className="mr-1">{item.label}</span>
          {hasChildren && (
            <HiOutlineChevronDown
              size={16}
              color="currentColor"
              style={{
                transition: 'transform 0.2s',
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          )}
          {hasChildren && isOpen && item.menuItems && (
            <div className="show-insights-menu">
              <DropdownMenu
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

// ── Profile Menu Item ─────────────────────────────────────────────
function ProfileNavbarItem({
  item,
  router,
  pathname,
}: {
  item: IMenuItem;
  router: AppRouterInstance;
  pathname: string;
}) {
  const hideModal = useModal({});
  const logoutModal = useModal({
    content: (
      <div className="text-center">
        <div className="flex items-center justify-center">
          <TiWarning color="var(--danger)" size={40} className="mr-2" />
          <h5 className="font-bold text-dark mb-0">
            Are you sure you want to logout?
          </h5>
        </div>
        <div className="flex justify-center gap-3 mt-4">
          <Button text="Cancel" onClick={hideModal} />
          <Button
            text="Confirm"
            onClick={() => {
              router.push(item?.path);
              signOut({ redirect: false });
              hideModal();
            }}
            isSolid
          />
        </div>
      </div>
    ),
  });

  return (
    <li
      aria-hidden
      className={`sub_item flex justify-between items-center ${
        isProfileItemActive(item, pathname) ? 'active' : ''
      }`}
      onClick={() => {
        if (item.label === 'Logout') {
          logoutModal();
        } else {
          router.push(item?.path);
        }
      }}
    >
      <p className="fs-14 fw-500 mb-0" style={{ letterSpacing: '1.1px' }}>
        {item.label}
      </p>
      {item.icon}
    </li>
  );
}

// ── Profile Dropdown ──────────────────────────────────────────────
function Profile({
  profileMenu,
  router,
  pathname,
}: {
  profileMenu: IProfileItem[];
  router: AppRouterInstance;
  pathname: string;
}) {
  return (
    <ul className="user-dropdown-submenusection p-2 pb-3">
      {profileMenu.map((item: IMenuItem) => (
        <ProfileNavbarItem
          item={item}
          key={item.label}
          router={router}
          pathname={pathname}
        />
      ))}
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

  // Close dropdowns only when clicking OUTSIDE the nav/profile areas
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setShowProfileMenu(false);
      }
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

  return (
    <div className="fixed-top container-fluid p-0" style={{ zIndex: 1030 }}>
      <Navbar expand="lg" className="header_bg p-4">
        {/* Logo */}
        <Navbar.Brand href="/dashboard" className="p-0">
          <div className="flex items-center font-semibold">
            <Image src={rubicrDashboardLogo} alt="logo" />
          </div>
        </Navbar.Brand>

        {/* Mobile hamburger */}
        <div className="lg:hidden md:block hamburger">
          <input type="checkbox" id="active" style={{ display: 'none' }} />
          <label
            aria-hidden
            htmlFor="active"
            className="menu-btn"
            onClick={() => setIsMobileOpen(true)}
          >
            <span />
          </label>
          {isMobileOpen && (
            <label
              aria-hidden
              htmlFor="active"
              className="close"
              onClick={() => setIsMobileOpen(false)}
            />
          )}
          {isMobileOpen && (
            <div className="wrapper">
              <div
                className="flex justify-center"
                style={{ height: '80px', background: 'var(--bgHeader)' }}
              >
                <div className="flex items-center">
                  <h5
                    aria-hidden
                    className={`mx-3 font-semibold menu_item_routes cursor-pointer ${
                      mobileView === 'menu' ? 'active' : ''
                    }`}
                    onClick={() => setMobileView('menu')}
                  >
                    Menu
                  </h5>
                  <h5
                    aria-hidden
                    className={`mx-3 font-semibold menu_item_routes cursor-pointer ${
                      mobileView === 'profile' ? 'active' : ''
                    }`}
                    onClick={() => setMobileView('profile')}
                  >
                    Profile
                  </h5>
                </div>
              </div>
              {mobileView === 'menu' ? (
                <ul
                  style={{
                    backgroundColor: 'var(--bgHeader)',
                    borderTop: '1px solid var(--bgColor)',
                    padding: '20px',
                    margin: '0px',
                  }}
                >
                  {menuItems.map((item) => (
                    <li key={item.label} className="mb-3 list-unstyled">
                      <NavbarItem
                        item={item}
                        pathname={pathname}
                        openMenu={openMenu}
                        setOpenMenu={setOpenMenu}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <Profile
                  profileMenu={profileMenu}
                  router={router}
                  pathname={pathname}
                />
              )}
            </div>
          )}
        </div>

        {/* Desktop nav */}
        <Navbar.Collapse id="navbarScroll">
          <div className="custom-nav-container">
            <div className="flex justify-between items-center flex-grow">
              {/* Nav items — ref attached here for outside-click detection */}
              <Nav className="flex-grow flex justify-center gap-2" ref={navRef}>
                {menuItems.map((item) => (
                  <NavbarItem
                    item={item}
                    key={item.label}
                    pathname={pathname}
                    openMenu={openMenu}
                    setOpenMenu={setOpenMenu}
                  />
                ))}
              </Nav>

              {/* Right side: bell + avatar */}
              <div className="flex items-center gap-3">
                <button
                  className="hrms-header-icon-btn"
                  type="button"
                  aria-label="Notifications"
                >
                  <FaRegBell size={18} />
                </button>
                <div
                  role="button"
                  tabIndex={0}
                  className="relative"
                  ref={profileRef}
                  onClick={() => setShowProfileMenu((prev) => !prev)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setShowProfileMenu((prev) => !prev);
                    }
                  }}
                >
                  <div className="flex items-center gap-3" title={user?.name}>
                    <Avatar
                      name={user?.name?.charAt(0)?.toLocaleUpperCase() || ''}
                      size="40px"
                      className="rounded-circle"
                      avator={user?.avatar_url || ''}
                    />
                    <HiOutlineChevronDown
                      size={22}
                      color="#64748b"
                      style={{
                        transition: 'transform 0.2s',
                        transform: showProfileMenu
                          ? 'rotate(180deg)'
                          : 'rotate(0deg)',
                      }}
                    />
                  </div>
                  {showProfileMenu && (
                    <div className="show-profile-menu">
                      <Profile
                        profileMenu={profileMenu}
                        router={router}
                        pathname={pathname}
                      />
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
