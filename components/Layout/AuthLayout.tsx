/* eslint-disable max-len */

'use client';

import LoginImage from '@/assests/hrms-auth-background.svg';
import rubicrDashboardLogo from '@/assests/rubic-logo-white 2.png';
import appLogoMobile from '@/assests/RubiCrLogo 2.png';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { AuthService } from '@/lib/service';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { Button } from '../Button/Button';
import MultiStepProgressBar from '../MultiStepProgressBar/MultiStepProgressBar';
import './AuthLayout.css';
import LandingLayout from './LandingLayout';

export function AuthLayout({
  children,
  slug,
}: Readonly<{
  children: ReactNode;
  slug: string;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile } = useDeviceDetection();
  const isSignIn = ['/sign_in', '/forgot_password', '/reset_password'].some(
    (path) => pathname.startsWith(path)
  );

  const isSignUp = [
    '/sign_up',
    '/accept_invitation',
    '/accept-invitation',  // Add hyphenated version
    '/email_verify',
    '/terms_of_service',
    '/privacy_policy',
    '/confirm_account',
  ].some((path) => pathname.startsWith(path));

  const isAuthorized = ['/company_profile'].some((path) =>
    pathname.startsWith(path)
  );

  const isLanding = [
    '/dashboard',
    '/employees',
    '/employee',
    '/employee/attendance',
    '/attendance',
    '/analytics',
    '/users',
    '/settings',
    '/reports',
    '/notifications',
  ].some((path) => pathname.startsWith(path));

  const renderAuthButton = () => {
    if (isAuthorized && !isSignUp) {
      return (
        <div>
          <Button
            onClick={async () => {
              await AuthService.logout({ slug });
              await signOut({ redirect: false });
              router.refresh();
              router.push('/sign_in');
            }}
            text="Logout!"
            isDanger
          />
        </div>
      );
    }
    return isSignUp ||
      pathname === '/forgot_password' ||
      pathname.includes('reset_password') ? (
      <Button
        onClick={() => router.push('/sign_in')}
        text="Sign In"
        className="mt-1"
        isSolid
      />
    ) : (
      <Button
        onClick={() => router.push('/sign_up')}
        text="Sign up"
        className="mt-1"
        isSolid
      />
    );
  };

  return (
    <main className="layout-container relative min-h-screen">
      {/* ── Company Profile / Onboarding ── */}
      {(isAuthorized || pathname.startsWith('/company_profile')) && (
        <div className="hrms-onboarding-shell">
          <div className="header-container hrms-onboarding-header flex w-full items-center justify-between gap-3 p-3">
            <div aria-hidden="true" onClick={() => router.push('/sign_in')}>
              <Image
                src={appLogoMobile}
                alt="App Logo"
                width={isMobile ? 110 : 130}
              />
            </div>
            {renderAuthButton()}
          </div>
          <div className="hrms-onboarding-body">
            <div className="hrms-onboarding-intro">
              <p className="hrms-kicker">Workspace setup</p>
              <h1>Build your HR foundation</h1>
              <span>
                Set company details, teams, shifts, schedules, and invite users
                into the right flow.
              </span>
            </div>
            <div className="company-profile-progress-header w-full overflow-x-auto py-4">
              <MultiStepProgressBar />
            </div>
            <div className="animated-element w-full min-w-0">{children}</div>
          </div>
        </div>
      )}

      {/* ── Main App (with Header) ── */}
      {isLanding && <LandingLayout>{children}</LandingLayout>}

      {/* ── Auth Pages (Sign In / Sign Up / Accept Invitation) ── */}
      {(isSignUp || isSignIn) && (
        <div className="layout-containers relative grid min-h-screen overflow-hidden lg:grid-cols-2 hrms-auth-shell">
          {/* Left image panel — desktop only */}
          <div className="sticky top-0 hidden h-screen shrink-0 overflow-hidden p-1 lg:block">
            <div className="relative flex h-full w-full justify-center overflow-hidden object-contain hrms-auth-visual">
              <Image
                src={LoginImage}
                alt="HRMS workspace"
                fill
                sizes="50vw"
                quality={85}
                priority
              />
              <div className="hrms-auth-overlay" />
              <div className="absolute hrms-auth-copy">
                <div className="mb-5">
                  <Image
                    src={rubicrDashboardLogo}
                    alt="Rubicr"
                    width={140}
                    priority
                  />
                </div>
                <p className="hrms-kicker text-white">
                  Human Resource Management
                </p>
                <h2>Run people operations with clarity.</h2>
                <p>
                  Track attendance, leaves, employees, documents, approvals, and
                  workforce insights from one calm HR portal.
                </p>
                <div className="hrms-auth-metrics">
                  <div>
                    <strong>24</strong>
                    <span>Pending approvals</span>
                  </div>
                  <div>
                    <strong>96%</strong>
                    <span>Attendance health</span>
                  </div>
                  <div>
                    <strong>3</strong>
                    <span>New joiners</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right form panel */}
          <div className="relative h-screen overflow-y-auto p-0 right-panel-container">
            <div
              className="relative flex min-h-full w-full justify-center right-panel"
              style={{
                alignItems: 'flex-start',
                paddingTop: 'clamp(1.5rem, 5vh, 3rem)',
              }}
            >
              <div className="animated-element flex w-full items-center justify-center px-3 pb-5 sm:px-4 md:pb-0">
                {children}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
