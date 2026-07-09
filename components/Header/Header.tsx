'use client';

import rubicrDashboardLogo from '@/assests/RubiCrLogo 2.png';
import { IUser } from '@/lib/interface/IUser.interface';
import { signOut, useSession } from 'next-auth/react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, {
  ReactNode, useEffect, useRef, useState,
} from 'react';
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
  Bell,
  CheckCircle2,
  XCircle,
  Info,
  Mail,
} from 'lucide-react';
import { getApprovalCounts, IApprovalCounts,} from '@/lib/service/employee';
import Avatar from '../Avatar/Avatar';
import { Button } from '../Button/Button';
import { useModal } from '../Modal/Context';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useParams } from 'next/navigation';
import { useApprovalCounts } from '@/lib/context/ApprovalCountsContext';
import { useTeamApprovalCounts } from '@/lib/context/TeamApprovalCountsContext';
import NotificationBadge from '@/components/NotificationBadge';
import { useNotifications } from '@/lib/context/NotificationContext';

export interface IMenuItem {
  label: string;
  path: string;
  icon?: ReactNode;
  isActive?: boolean;
  featureName?: string;
  menuItems?: IMenuItem[];
  badgeCount?: number;
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
      // { label: 'Dashboard', path: '/attendance/dashboard' },
      { label: 'Attendance Logs', path: '/attendance/logs' },
      { label: 'Leave Management', path: '/attendance/leave' },
      { label: 'Attendance Policies', path: '/attendance/policies' },
    ],
  },
  {
    label: 'Organization',
    path: '',
    icon: <UsersRound size={16} />,
    menuItems: [
      { label: 'People', path: '/employees/registry' },
      { label: 'Organization Chart', path: '/employees/organogram' },
      // { label: 'ID Management', path: '/employees/id_management' },
      // { label: 'Employee Documents', path: '/employees/documents' },
    ],
  },
  // {
  //   label: 'Workforce Analytics',
  //   path: '/analytics',
  //   icon: <BarChart3 size={16} />,
  // },
  { label: 'Reports', path: '/reports', icon: <FileText size={16} /> }, // 👈
];

export const employeeMenuItems: IMenuItem[] = [
  {
    label: 'My Workspace',
    path: '/employee/dashboard',
    icon: <UserRoundCheck size={16} />,
  },
  {
    label: 'Attendance Management',
    path: '',
    icon: <ClipboardCheck size={16} />,
    menuItems: [
      // { label: 'Overview', path: '/employee/attendance/overview' },
      // {
      //   label: 'Check-in/Check-out',
      //   path: '/employee/attendance/check-in-out',
      // },
      { label: 'Monthly View', path: '/employee/attendance/monthly-view' },
      { label: 'Apply Leave', path: '/employee/attendance/apply-leave' },
      { label: 'Comp Off', path: '/employee/attendance/comp-off' },
    ],
  },
  // {
  //   label: 'Leave Management',
  //   path: '',
  //   icon: <CalendarDays size={16} />,
  //   menuItems: [
  //     { label: 'Apply Leave', path: '/employee/attendance/apply-leave' },
  //     { label: 'Comp Off', path: '/employee/attendance/comp-off' },
  //   ],
  // },
  {
    label: 'Requests',
    path: '',
    icon: <FileText size={16} />,
    menuItems: [
      { label: 'Regularization', path: '/employee/attendance/regularization' },
      { label: 'Work From Home', path: '/employee/attendance/wfh-request' },
      { label: 'On Duty', path: '/employee/attendance/on-duty' },
      { label: 'Resignation', path: '/employee/attendance/resignation' },
    ],
  },
  {
    label: 'My Team',
    path: '/employee/my-team',
    icon: <UsersRound size={16} />,
  },
];

export const getMenuItemsByRole = (role: string): IMenuItem[] => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return adminMenuItems;
    case 'employee':
      return employeeMenuItems;
    default:
      return adminMenuItems;
  }
};

// ── Active helpers ────────────────────────────────────────────────
const isMenuItemActive = (item: IMenuItem, pathname: string): boolean => {
  if (item.path && item.path !== '' && pathname.startsWith(item.path)) { return true; }
  if (item.menuItems) {
    return item.menuItems.some(
      (sub) => sub.path && pathname.startsWith(sub.path),
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

// ── Desktop Dropdown (absolute, used only on lg+) ─────────────────
function DesktopDropdownMenu({
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
    <ul className="min-w-[180px] bg-white rounded-xl shadow-lg border border-slate-100 py-1">
      {items.map((item, index) => (
        <li
          key={item.label}
          aria-hidden
          className={`sub_item flex items-center justify-between mx-1 px-3 py-2 rounded-lg transition-colors ${item.path && pathname.startsWith(item.path)
            ? 'bg-teal-50 text-teal-700'
            : 'hover:bg-slate-50'
            } ${index === 0 ? 'mt-1' : ''} ${index === items.length - 1 ? 'mb-1' : ''}`}
          style={{ cursor: 'pointer' }}
          onClick={() => {
            router.push(item.path);
            onClose();
          }}
        >
          <div className="flex items-center gap-2 relative">
            <NotificationBadge count={item.badgeCount} />
            <p className="mb-0 text-sm font-medium">{item.label}</p>
          </div>
          {item.icon}
        </li>
      ))}
    </ul>
  );
}

// ── Desktop Nav Item (keeps absolute dropdown for lg screens) ─────
function DesktopNavbarItem({
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
        className={`menu_item_routes ${isActive ? 'active' : ''} relative`}
        style={{ cursor: 'pointer' }}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { handleClick(e as unknown as React.MouseEvent); }
        }}
      >
        <div className="flex items-center whitespace-nowrap">
          <NotificationBadge count={item.badgeCount} />
          {item.icon && <span className="mr-2 inline-flex">{item.icon}</span>}
          <span className="mr-1">
            {item.label}
          </span>
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
  item,
  pathname,
  router,
  onClose,
}: {
  item: IMenuItem;
  pathname: string;
  router: AppRouterInstance;
  onClose: () => void;
}) {
  const hasChildren = !!(item.menuItems && item.menuItems.length > 0);
  const isActive = isMenuItemActive(item, pathname);
  const [expanded, setExpanded] = useState(isActive && hasChildren);

  const handleParentClick = () => {
    if (hasChildren) {
      setExpanded((prev) => !prev);
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
            <span
              className={`${isActive ? 'text-[color:var(--primary,#0d9488)]' : 'text-slate-400'}`}
            >
              {item.icon}
            </span>
          )}
          <span className="text-sm flex items-center gap-2">
            {item.label}
            {item.badgeCount && item.badgeCount > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ring-1 ring-white">
                {item.badgeCount > 99 ? '99+' : item.badgeCount}
              </span>
            )}
          </span>
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
          {item.menuItems.map((sub) => {
            const subActive = sub.path && pathname.startsWith(sub.path);
            return (
              <li key={sub.label} className="list-none">
                <button
                  type="button"
                  onClick={() => {
                    router.push(sub.path);
                    onClose();
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors
                    ${subActive
                      ? 'text-[color:var(--primary,#0d9488)] bg-[color:var(--primary-light,#f0fdfa)] font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    {sub.label}
                    {sub.badgeCount && sub.badgeCount > 0 && (
                      <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ring-1 ring-white">
                        {sub.badgeCount > 99 ? '99+' : sub.badgeCount}
                      </span>
                    )}
                  </div>
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
  item,
  router,
  pathname,
  isFirst,
  isLast,
}: {
  item: IMenuItem;
  router: AppRouterInstance;
  pathname: string;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  const hideModal = useModal({});
  const logoutModal = useModal({
    content: (
      <div className="text-center">
        <div className="flex items-center justify-center">
          <TiWarning color="var(--danger)" size={40} className="mr-2" />
          <h5 className="mb-0 font-bold text-[#424242]">
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
      className={`sub_item flex items-center justify-between mx-1 px-3 py-2 rounded-lg transition-colors ${isProfileItemActive(item, pathname)
        ? 'bg-teal-50 text-teal-700'
        : 'hover:bg-slate-50'
        } ${isFirst ? 'mt-1' : ''} ${isLast ? 'mb-1' : ''}`}
      onClick={() => {
        if (item.label === 'Logout') logoutModal();
        else router.push(item?.path);
      }}
    >
      <p className="mb-0 text-sm font-medium">{item.label}</p>
      {item.icon}
    </li>
  );
}

// ── Desktop Profile Dropdown ──────────────────────────────────────
function ProfileDropdown({
  profileMenu,
  router,
  pathname,
}: {
  profileMenu: IProfileItem[];
  router: AppRouterInstance;
  pathname: string;
}) {
  return (
    <ul className="min-w-[200px] bg-white rounded-xl shadow-lg border border-slate-100 py-1">
      {profileMenu.map((item: IMenuItem, index) => (
        <ProfileNavbarItem
          item={item}
          key={item.label}
          router={router}
          pathname={pathname}
          isFirst={index === 0}
          isLast={index === profileMenu.length - 1}
        />
      ))}
    </ul>
  );
}
// ── Mobile Profile List (inline, no absolute) ─────────────────────
function MobileProfileList({
  profileMenu,
  router,
  pathname,
  onClose,
}: {
  profileMenu: IProfileItem[];
  router: AppRouterInstance;
  pathname: string;
  onClose: () => void;
}) {
  const hideModal = useModal({});

  return (
    <ul
      className="space-y-0.5 p-4 m-0"
      style={{ backgroundColor: 'var(--bgHeader)' }}
    >
      {profileMenu.map((item: IProfileItem) => {
        const active = isProfileItemActive(
          item as unknown as IMenuItem,
          pathname,
        );
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

function Header(props: HeaderProps) {
  const {
    menuItems, pathname, profileMenu, user,
  } = props;
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mobileView, setMobileView] = useState<
    'menu' | 'profile' | 'notifications'
  >('menu');

  const params = useParams();
  const subdomain = params?.subdomain as string;
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafId = useRef<number>(0);
  const navRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { data: session } = useSession();
  const router = useRouter();
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

  // Check if notifications page is active
  const isNotificationsActive = pathname === '/notifications';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) { setOpenMenu(null); }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) { setShowProfileMenu(false); }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) { setShowNotifications(false); }
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

  const { counts: approvalCounts } = useApprovalCounts();
  const { teamCounts } = useTeamApprovalCounts();

  const closeMobile = () => setIsMobileOpen(false);

  const handleNotificationClick = async (notif: any, onCloseMobile?: () => void) => {
    if (!notif.is_read) {
      await markAsRead(notif.id);
    }
    
    const type = notif.type;
    let targetPath = '';

    if (type === 'LEAVE_REQUEST') {
      targetPath = '/employee/my-team?tab=leave-requests';
    } else if (type === 'WFH_REQUEST') {
      targetPath = '/employee/my-team?tab=wfh-requests';
    } else if (type === 'ON_DUTY_REQUEST') {
      targetPath = '/employee/my-team?tab=onduty-requests';
    } else if (type === 'COMP_OFF_REQUEST') {
      targetPath = '/employee/my-team?tab=comp-off';
    } else if (type === 'ATTENDANCE_REGULARIZATION') {
      targetPath = '/employee/my-team?tab=regularization';
    } else if (type === 'RESIGNATION_SUBMITTED') {
      targetPath = '/employee/my-team';
    } else if (type === 'LEAVE_APPROVED' || type === 'LEAVE_REJECTED') {
      targetPath = '/employee/attendance/apply-leave';
    } else if (type === 'WFH_APPROVED' || type === 'WFH_REJECTED') {
      targetPath = '/employee/attendance/wfh-request';
    } else if (type === 'ON_DUTY_APPROVED' || type === 'ON_DUTY_REJECTED') {
      targetPath = '/employee/attendance/on-duty';
    } else if (type === 'COMP_OFF_APPROVED' || type === 'COMP_OFF_REJECTED') {
      targetPath = '/employee/attendance/comp-off';
    } else if (type === 'ATTENDANCE_REGULARIZATION_APPROVED' || type === 'ATTENDANCE_REGULARIZATION_REJECTED') {
      targetPath = '/employee/attendance/regularization';
    } else if (type === 'PROBATION_CONFIRMED') {
      targetPath = '/employee/dashboard';
    } else if (type === 'RESIGNATION_APPROVED' || type === 'RESIGNATION_REJECTED') {
      targetPath = '/employee/attendance/resignation';
    }

    if (targetPath) {
      router.push(targetPath);
    }
    setShowNotifications(false);
    if (onCloseMobile) onCloseMobile();
  };

  // Mobile Notifications View Component
  const MobileNotificationsView = ({ onClose }: { onClose: () => void }) => {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-teal-600 font-medium hover:text-teal-700"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No notifications yet</p>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif, onClose)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  !notif.is_read
                    ? 'bg-teal-50/50 border-teal-100 hover:bg-teal-100/30'
                    : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                }`}
              >
                <p className="text-sm font-semibold text-gray-900 flex justify-between items-center">
                  <span>{notif.title}</span>
                  {!notif.is_read && <span className="w-2 h-2 bg-teal-600 rounded-full" />}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {notif.message}
                </p>
                <p className="text-[10px] text-gray-400 mt-2">
                  {new Date(notif.created_at || (notif as any).createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

        <button
          onClick={() => {
            router.push('/notifications');
            onClose();
          }}
          className="w-full mt-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
        >
          View All Notifications
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-x-0 top-0 p-0" style={{ zIndex: 1030 }}>
      <Navbar expand="lg" className="header_bg px-3 py-0 sm:px-4 lg:px-6" expanded>
        {/* ── Logo ── */}
        <Navbar.Brand href="/dashboard" className="p-0">
          <div className="flex items-center font-semibold">
            <Image src={rubicrDashboardLogo} alt="logo" />
          </div>
        </Navbar.Brand>

        {/* ── Mobile hamburger button with notification badge ── */}
        <div className="flex items-center gap-2 lg:hidden">
          {/* Mobile Notification Icon */}
          <button
            className={`relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${isNotificationsActive
              ? 'bg-teal-50 text-teal-600'
              : 'text-slate-600 hover:bg-slate-100'
              }`}
            type="button"
            aria-label="Notifications"
            onClick={() => {
              setIsMobileOpen(true);
              setMobileView('notifications');
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[8px] flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Hamburger button */}
          <button
            type="button"
            className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
            onClick={() => setIsMobileOpen((prev) => !prev)}
          >
            {isMobileOpen ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M2 2l14 14M16 2L2 16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                <path
                  d="M0 1h18M0 7h18M0 13h18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>

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
                top: 56 /* matches navbar height */,
                maxHeight: 'calc(100vh - 56px)',
                backgroundColor: 'var(--bgHeader)',
              }}
            >
              {/* Tab switcher - Updated with 3 tabs */}
              <div
                className="flex items-center justify-center gap-0 border-b sticky top-0"
                style={{
                  backgroundColor: 'var(--bgHeader)',
                  borderColor: 'var(--bgColor)',
                }}
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
                  onClick={() => setMobileView('notifications')}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-colors relative
                    ${mobileView === 'notifications'
                      ? 'text-[color:var(--primary,#0d9488)]'
                      : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  Notifications
                  {mobileView === 'notifications' && (
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
                  {menuItems.map((item) => {
                    let parentBadge = 0;
                    let enrichedItem = { ...item };

                    if (item.label === 'My Team' && teamCounts) {
                      const sumAll = Object.values(teamCounts).reduce((a, b) => a + Number(b), 0);
                      parentBadge = sumAll;

                      if (item.menuItems) {
                        enrichedItem.menuItems = item.menuItems.map((sub) => {
                          let subBadge = 0;
                          if (sub.label === 'Leave Requests' || sub.label === 'Apply Leave') subBadge = teamCounts.leave;
                          if (sub.label === 'Regularization') subBadge = teamCounts.regularization;
                          if (sub.label === 'Comp Off') subBadge = teamCounts.compOff;
                          if (sub.label === 'WFH Requests') subBadge = teamCounts.wfh;
                          if (sub.label === 'On-Duty Requests') subBadge = teamCounts.onduty;
                          if (sub.label === 'Resignation') subBadge = teamCounts.resignation;

                          parentBadge += subBadge;
                          return { ...sub, badgeCount: subBadge };
                        });
                      }

                      enrichedItem.badgeCount = parentBadge;
                    } else if (approvalCounts && item.label !== 'My Team') {
                      const sumAll = Object.values(approvalCounts).reduce((a, b) => a + Number(b), 0);

                      if (item.menuItems) {
                        enrichedItem.menuItems = item.menuItems.map((sub) => {
                          let subBadge = 0;
                          if (sub.label === 'Leave Management' || sub.label === 'Apply Leave') subBadge = approvalCounts.leave;
                          if (sub.label === 'Regularization') subBadge = approvalCounts.regularization;
                          if (sub.label === 'Comp Off') subBadge = approvalCounts.compOff;
                          if (sub.label === 'Work From Home') subBadge = approvalCounts.wfh;
                          if (sub.label === 'On Duty') subBadge = approvalCounts.onduty;
                          if (sub.label === 'Resignation') subBadge = approvalCounts.resignation;

                          parentBadge += subBadge;
                          return { ...sub, badgeCount: subBadge };
                        });
                      }

                      enrichedItem.badgeCount = parentBadge;
                    }

                    return (
                      <MobileNavItem
                        key={enrichedItem.label}
                        item={enrichedItem}
                        pathname={pathname}
                        router={router}
                        onClose={closeMobile}
                      />
                    );
                  })}
                </ul>
              )}

              {/* Notifications view */}
              {mobileView === 'notifications' && (
                <MobileNotificationsView onClose={closeMobile} />
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
        <div className="hidden lg:flex flex-1 min-w-0">
          <div className="custom-nav-container">
            <div className="flex min-w-0 flex-grow items-center justify-between">
              <Nav className="mx-auto flex items-center gap-4 lg:gap-5 xl:gap-8 header-menu mt-2">
                {menuItems.map((item) => {
                  let parentBadge = 0;
                  let enrichedItem = { ...item };

                  if (item.label === 'My Team' && teamCounts) {
                    const sumAll = Object.values(teamCounts).reduce((a, b) => a + Number(b), 0);
                    parentBadge = sumAll;

                    if (item.menuItems) {
                      enrichedItem.menuItems = item.menuItems.map((sub) => {
                        let subBadge = 0;
                        if (sub.label === 'Leave Requests' || sub.label === 'Apply Leave') subBadge = teamCounts.leave;
                        if (sub.label === 'Regularization') subBadge = teamCounts.regularization;
                        if (sub.label === 'Comp Off') subBadge = teamCounts.compOff;
                        if (sub.label === 'WFH Requests') subBadge = teamCounts.wfh;
                        if (sub.label === 'On-Duty Requests') subBadge = teamCounts.onduty;
                        if (sub.label === 'Resignation') subBadge = teamCounts.resignation;

                        parentBadge += subBadge;
                        return { ...sub, badgeCount: subBadge };
                      });
                    }

                    enrichedItem.badgeCount = parentBadge;
                  } else if (approvalCounts && item.label !== 'My Team') {
                    const sumAll = Object.values(approvalCounts).reduce((a, b) => a + Number(b), 0);

                    if (item.menuItems) {
                      enrichedItem.menuItems = item.menuItems.map((sub) => {
                        let subBadge = 0;
                        if (sub.label === 'Leave Management' || sub.label === 'Apply Leave') subBadge = approvalCounts.leave;
                        if (sub.label === 'Regularization') subBadge = approvalCounts.regularization;
                        if (sub.label === 'Comp Off') subBadge = approvalCounts.compOff;
                        if (sub.label === 'Work From Home') subBadge = approvalCounts.wfh;
                        if (sub.label === 'On Duty') subBadge = approvalCounts.onduty;
                        if (sub.label === 'Resignation') subBadge = approvalCounts.resignation;

                        parentBadge += subBadge;
                        return { ...sub, badgeCount: subBadge };
                      });
                    }

                    enrichedItem.badgeCount = parentBadge;
                  }

                  return (
                    <DesktopNavbarItem
                      key={enrichedItem.label}
                      item={enrichedItem}
                      pathname={pathname}
                      openMenu={openMenu}
                      setOpenMenu={setOpenMenu}
                    />
                  );
                })}
              </Nav>

              {/* Bell + avatar - Desktop view */}
              <div className="shrink-0 items-center gap-3 hidden lg:flex relative" ref={notificationsRef}>
                <button
                  className={`hrms-header-icon-btn transition-all duration-200 relative ${showNotifications || isNotificationsActive
                    ? 'bg-[#eef5f2] text-[#0f766e]'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-teal-600'
                    }`}
                  type="button"
                  aria-label="Notifications"
                  onClick={() => setShowNotifications((prev) => !prev)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Desktop Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden" style={{ zIndex: 1050, top: '44px' }}>
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAllAsRead();
                          }}
                          className="text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    {/* List */}
                    <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-50">
                      {notifications.length === 0 ? (
                        <div className="py-8 px-4 text-center text-slate-400 text-xs">
                          <Bell className="mx-auto mb-2 text-slate-300" size={24} />
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          let Icon = Bell;
                          let iconColor = 'text-slate-500 bg-slate-50';

                          if (notif.type.includes('APPROVED') || notif.type.includes('CONFIRMED')) {
                            Icon = CheckCircle2;
                            iconColor = 'text-emerald-500 bg-emerald-50';
                          } else if (notif.type.includes('REJECTED')) {
                            Icon = XCircle;
                            iconColor = 'text-rose-500 bg-rose-50';
                          } else if (notif.type.includes('INVITED')) {
                            Icon = Mail;
                            iconColor = 'text-teal-500 bg-teal-50';
                          } else if (notif.type.includes('REQUEST') || notif.type.includes('SUBMITTED')) {
                            Icon = Info;
                            iconColor = 'text-amber-500 bg-amber-50';
                          }

                          return (
                            <div
                              key={notif.id}
                              onClick={() => {
                                handleNotificationClick(notif);
                              }}
                              className={`p-3 flex gap-3 cursor-pointer transition-colors relative text-left ${
                                !notif.is_read ? 'bg-teal-50/30 hover:bg-teal-50/60' : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconColor}`}>
                                <Icon size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-1">
                                  <p className="text-xs font-semibold text-slate-800 truncate">{notif.title}</p>
                                  {!notif.is_read && (
                                    <span className="w-1.5 h-1.5 bg-teal-600 rounded-full mt-1.5 shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-normal">{notif.message}</p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {new Date(notif.created_at || (notif as any).createdAt).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2.5 border-t border-slate-100 text-center bg-slate-50/30">
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          router.push('/notifications');
                        }}
                        className="text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors w-full"
                      >
                        View All Notifications
                      </button>
                    </div>
                  </div>
                )}

                <div
                  role="button"
                  tabIndex={0}
                  className="relative"
                  ref={profileRef}
                  onClick={() => setShowProfileMenu((prev) => !prev)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') { setShowProfileMenu((prev) => !prev); }
                  }}
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
                      <ProfileDropdown
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
        </div>
      </Navbar>
    </div>
  );
}

export default React.memo(Header);
