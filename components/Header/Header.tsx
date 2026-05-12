/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
/* eslint-disable react/jsx-props-no-multi-spaces */
/* eslint-disable no-unused-vars */
/* eslint @typescript-eslint/no-unused-vars: off */
/* eslint-disable react/destructuring-assignment */

'use client';

import rubicrDashboardLogo from '@/assests/rubic-logo-white 2.png';
import { IUser } from '@/lib/interface/IUser.interface';
import { signOut, useSession } from 'next-auth/react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, {
  ReactNode, useEffect, useRef, useState,
} from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import toast from 'react-hot-toast';
import { FaRegBell } from 'react-icons/fa';
import { HiOutlineChevronDown } from 'react-icons/hi';
import { TiWarning } from 'react-icons/ti';
import Avatar from '../Avatar/Avatar';
import { Button } from '../Button/Button';
import { useUser } from '../Context/userProvider';
import { useModal } from '../Modal/Context';
import 'bootstrap/dist/css/bootstrap.min.css';
// export interface IMenuItem {
//   label: string;
//   path: string;
//   icon?: ReactNode;
//   isActive?: boolean;
//   featureName?: string;
//   menuItems?: { label: string; path: string; isActive: boolean }[];
// }

export interface IMenuItem {
  label: string;
  path: string;
  icon?: ReactNode;
  isActive?: boolean;
  featureName?: string;
  menuItems?: IMenuItem[]; // recursive type
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
  menuItems: IMenuItem[];
  profileMenu: IProfileItem[];
  skuMenu?: IMenuItem[];
  vendorMenu?: IMenuItem[];
  pathname: string; // ✅ ADD THIS
}

const getCurrentUrlActive = (item: IMenuItem, pathname: string): string => {
  switch (item.label) {
    case 'Cockpit':
      return pathname?.startsWith('/home') ? 'active' : '';
    case 'Tasks':
      return pathname?.startsWith('/tasks') || pathname?.startsWith('/task_list') ? 'active' : '';
    case 'Users':
      return pathname?.startsWith('/users') ? 'active' : '';
    case 'Questionnarie':
      return pathname?.startsWith('/questionnaire_builder') ? 'active' : '';
    case 'Emission Calculator':
      return pathname?.startsWith('/emission_calculator') ? 'active' : '';
    case 'SKU':
      return pathname?.startsWith('/sku_management')
        || pathname?.startsWith('/sku_analytics_dashboard')

        ? 'active'
        : '';
    case 'Vendor':
      return pathname?.startsWith('/vendor_management')
        || pathname?.startsWith('/vendor_analytics_dashboard')
        || pathname?.startsWith('/vendor_comparison')
        ? 'active'
        : '';
    default:
      return '';
  }
};

const getCurrentProfileUrlActive = (
  item: IMenuItem,
  pathname: string,
): string => {
  switch (item.label) {
    case 'Settings':
      return pathname === '/settings/profile'
        || pathname === '/settings/change_password'
        || pathname === '/settings/company_profile'
        || pathname === '/settings/business_unit'
        ? 'active'
        : '';
    case 'Users':
      return pathname === '/users' || pathname === '/users/invite'
        ? 'active'
        : '';
    default:
      return '';
  }
};

function InsightNavbarItem({
  item,
  router,
  pathname,
  onItemClick,
}: {
  item: IMenuItem;
  router: AppRouterInstance;
  pathname: string;
  onItemClick: () => void;
}) {
  return (
    <div>
      <li
        aria-hidden
        className={`sub_item flex justify-between items-center ${getCurrentUrlActive(item, pathname)}`}
        style={{ cursor: 'pointer' }}
        onClick={() => {
          router.push(item?.path);
          onItemClick();
        }}
      >
        <p className="fs-14 fw-500 mb-0" style={{ letterSpacing: '1.1px' }}>
          {item.label}
        </p>
        {item.icon}
      </li>

    </div>
  );
}

function InsightsMenu({
  skuMenu,
  router,
  pathname,
  onItemClick,
}: {
  skuMenu: IMenuItem[];
  router: AppRouterInstance;
  pathname: string;
  onItemClick: () => void;
}) {
  return (
    <ul className="user-dropdown-submenusection p-2 pb-3">
      {skuMenu.map((item) => (
        <InsightNavbarItem
          item={item}
          key={item.label}
          router={router}
          pathname={pathname}
          onItemClick={onItemClick}
        />
      ))}
    </ul>
  );
}

function DisclosureNavbarItem({
  item,
  router,
  pathname,
  onItemClick,
}: {
  item: IMenuItem;
  router: AppRouterInstance;
  pathname: string;
  onItemClick: () => void;
}) {
  return (
    <div>
      <li
        aria-hidden
        className={`sub_item flex justify-between items-center ${getCurrentProfileUrlActive(item, pathname)}`}
        onClick={() => {
          router.push(item?.path);
          onItemClick();
        }}
      >
        <p className="fs-14 fw-500 mb-0" style={{ letterSpacing: '1.1px' }}>
          {item.label}
        </p>
        {item.icon}
      </li>
    </div>
  );
}

function DisclosureMenu({
  disclosureMenu,
  router,
  pathname,
  onItemClick,
}: {
  disclosureMenu: IMenuItem[];
  router: AppRouterInstance;
  pathname: string;
  onItemClick: () => void;
}) {
  return (
    <ul className="user-dropdown-submenusection p-2 pb-3">
      {disclosureMenu.map((item: IMenuItem) => (
        <DisclosureNavbarItem
          item={item}
          key={item.label}
          router={router}
          pathname={item.path || pathname}
          onItemClick={onItemClick}
        />
      ))}
    </ul>
  );
}

function NavbarItem({
  item,
  pathname,
  skuMenu,
  vendorMenu,
  showSkuMenu,
  setShowSkuMenu,
  showVendorMenu,
  setShowVendorMenu,
}: {
  item: IMenuItem;
  pathname: string;
  skuMenu?: IMenuItem[];
  vendorMenu?: IMenuItem[];
  showSkuMenu: boolean;
  setShowSkuMenu: React.Dispatch<React.SetStateAction<boolean>>;
  showVendorMenu: boolean;
  setShowVendorMenu: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();

  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!item.path) return;

    // prevent navigation for dropdown parents
    if (item.label === 'SKU' || item.label === 'Vendor') return;

    router.push(item.path);
    setShowSkuMenu(false);
    setShowVendorMenu(false);
  };

  return (
    <Nav.Link as="span">
      <span
        className={`menu_item_routes ${getCurrentUrlActive(item, pathname)}`}
        style={{ cursor: 'pointer' }}
        onClick={handleNavigate}
      >
        {item.label === 'SKU' && skuMenu ? (
          <div className="flex items-center relative">
            {/* Label */}
            <span className="mr-2">{item.label}</span>

            {/* Chevron */}
            <HiOutlineChevronDown
              size={20}
              color="var(--white)"
              className={`cursor-pointer ${
                skuMenu.some((menu) => (menu.path
                  ? pathname.startsWith(menu.path)
                  : menu.menuItems?.some((sub) => pathname.startsWith(sub.path))))
                  ? 'active'
                  : ''
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowSkuMenu((prev) => !prev);
                setShowVendorMenu(false);
              }}
            />

            {showSkuMenu && (
              <div className="show-insights-menu">
                <InsightsMenu
                  skuMenu={skuMenu}
                  router={router}
                  pathname={pathname}
                  onItemClick={() => setShowSkuMenu(false)}
                />
              </div>
            )}
          </div>
        ) : item.label === 'Vendor' && vendorMenu ? (
          <div className="flex items-center relative">
            <span className="mr-2">{item.label}</span>

            <HiOutlineChevronDown
              size={20}
              color="var(--white)"
              className={`cursor-pointer ${
                vendorMenu.some((menu) => pathname.startsWith(menu.path))
                  ? 'active'
                  : ''
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowVendorMenu((prev) => !prev);
                setShowSkuMenu(false);
              }}
            />

            {showVendorMenu && (
              <div className="show-insights-menu">
                <DisclosureMenu
                  disclosureMenu={vendorMenu}
                  router={router}
                  pathname={pathname}
                  onItemClick={() => setShowVendorMenu(false)}
                />
              </div>
            )}
          </div>
        ) : (
          <span>{item.label}</span>
        )}
      </span>
    </Nav.Link>
  );
}

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
            // isDisabled={actionType === 'Block' && !reason}
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
    <div>
      <li
        aria-hidden
        className={`sub_item flex justify-between items-center ${getCurrentProfileUrlActive(item, pathname)}`}
        onClick={() => {
          if (item.label === 'Logout') {
            logoutModal();
            // signOut({ redirect: false });
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
    </div>
  );
}

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

function Header(props: HeaderProps) {
  const [isProfileActive, setProfileActive] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSkuMenu, setShowSkuMenu] = useState(false);
  const [showVendorMenu, setShowVendorMenu] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const timeoutId = useRef<any>(null);
  const { data: session } = useSession();
  const router = useRouter();
  const INACTIVITYTIMEOUT = 30 * 60 * 1000;
  const context = useUser();

  const notifySignout = () => toast.success('Signed Out', { duration: 3000 });

  const handleLogout = () => {
    // ✅ clear persisted user data
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentRole');

    notifySignout();
    signOut({ redirect: false });
    router.push('/sign_in');
  };

  useEffect(() => {
    const handleLogoutOnTimeout = () => handleLogout();
    const handleUserActivity = () => {
      clearTimeout(timeoutId.current);
      timeoutId.current = setTimeout(handleLogoutOnTimeout, INACTIVITYTIMEOUT);
    };
    if (session) {
      timeoutId.current = setTimeout(handleLogoutOnTimeout, INACTIVITYTIMEOUT);
      document.addEventListener('click', handleUserActivity);
      document.addEventListener('mousemove', handleUserActivity);
      document.addEventListener('keydown', handleUserActivity);
    }
    return () => {
      clearTimeout(timeoutId.current);
      document.removeEventListener('click', handleUserActivity);
      document.removeEventListener('mousemove', handleUserActivity);
      document.removeEventListener('keydown', handleUserActivity);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return (
    <div className="sticky-top container-fluid p-0">
      <Navbar expand="lg" className="header_bg p-3">
        <Navbar.Brand
          href="/home"
          className="p-0"
        >
          <div className="flex justify-between">
            <div className="flex items-center font-semibold">
              <Image src={rubicrDashboardLogo} alt="logo" />
            </div>
          </div>
        </Navbar.Brand>
        <div className="lg:hidden md:block hamburger">
          <input type="checkbox" id="active" style={{ display: 'none' }} />
          <label
            aria-hidden
            htmlFor="active"
            className="menu-btn"
            onClick={() => setIsActive(true)}
          >
            <span />
          </label>
          {isActive && (
            <label
              aria-hidden
              htmlFor="active"
              className="close"
              onClick={() => setIsActive(false)}
            />
          )}
          {isActive && (
            <div className="wrapper">
              <div
                className="flex justify-center"
                style={{ height: '80px', background: 'var(--bgHeader)' }}
              >
                <div className="flex items-center">
                  <h5
                    aria-hidden
                    className={`mx-3 font-semibold menu_item_routes cursor-pointer ${isProfileActive ? 'active' : ''}`}
                    onClick={() => setProfileActive(true)}
                  >
                    Home
                  </h5>
                  <h5
                    aria-hidden
                    className={`mx-3 font-semibold menu_item_routes cursor-pointer ${!isProfileActive ? 'active' : ''}`}
                    onClick={() => setProfileActive(false)}
                  >
                    Profile
                  </h5>
                </div>
              </div>
              {isProfileActive ? (
                <ul
                  style={{
                    backgroundColor: 'var(--bgHeader)',
                    borderTop: '1px solid var(--bgColor)',
                    padding: '20px',
                    margin: '0px',
                  }}
                  data-testid="profile"
                >
                  {props?.menuItems?.map((item: IMenuItem) => (
                    <li key={item.label} className="mb-3 list-unstyled">
                      <NavbarItem
                        item={item}
                        pathname={props.pathname}
                        showSkuMenu={showSkuMenu}
                        setShowSkuMenu={setShowSkuMenu}
                        showVendorMenu={showVendorMenu}
                        setShowVendorMenu={setShowVendorMenu}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <Profile
                  profileMenu={props?.profileMenu}
                  router={router}
                  pathname={props.pathname}
                />
              )}
            </div>
          )}
        </div>
        <Navbar.Collapse role="button" id="navbarScroll">
          <div className={`custom-nav-container ${isActive ? 'open' : ''}`}>
            <div className="flex justify-between items-center flex-grow">
              <Nav className="flex-grow flex justify-center gap-5">
                {props?.menuItems.map((item: IMenuItem) => (
                  <NavbarItem
                    item={item}
                    key={item?.label}
                    pathname={props.pathname}
                    skuMenu={props?.skuMenu}
                    vendorMenu={props?.vendorMenu}
                    showSkuMenu={showSkuMenu}
                    setShowSkuMenu={setShowSkuMenu}
                    showVendorMenu={showVendorMenu}
                    setShowVendorMenu={setShowVendorMenu}
                  />
                ))}
              </Nav>
              <div className="flex items-center gap-3">
                <div>
                  <FaRegBell size={22} color="var(--white)" />
                </div>
                <div
                  className=" relative"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <div
                    className="flex items-center gap-3"
                    title={props?.user?.name}
                  >
                    <Avatar
                      name={
                        props?.user?.name?.charAt(0)?.toLocaleUpperCase() || ''
                      }
                      size="40px"
                      className="rounded-circle"
                      avator={props?.user?.avatar_url || ''}
                    />
                    <div>
                      <HiOutlineChevronDown size={22} color="var(--white)" />
                    </div>
                  </div>

                  {showProfileMenu && (
                    <div className="show-profile-menu">
                      <Profile
                        profileMenu={props?.profileMenu}
                        router={router}
                        pathname={props.pathname}
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
