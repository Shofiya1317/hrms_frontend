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
    (path) => pathname.startsWith(path),
  );

  const isSignUp = [
    '/sign_up',
    '/accept_invitation',
    '/email_verify',
    '/terms_of_service',
    '/privacy_policy',
    '/confirm_account',
  ].some((path) => pathname.startsWith(path));

  const isAuthorized = ['/company_profile'].some((path) => pathname.startsWith(path));

  const isLanding = [
    '/dashboard',
    '/employees',
    '/employee',
    '/employee/attendance',
    '/attendance',
    '/analytics',
    '/users',
    '/settings',
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
    return isSignUp
      || pathname === '/forgot_password'
      || pathname.includes('reset_password') ? (
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
    <main className="layout-container relative">

      {/* ── Company Profile / Onboarding ── */}
      {(isAuthorized || pathname.startsWith('/company_profile')) && (
        <div className="hrms-onboarding-shell">
          <div className="header-container hrms-onboarding-header p-3 w-full">
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
              <span>Set company details, teams, shifts, schedules, and invite users into the right flow.</span>
            </div>
            <div className="w-full py-4 company-profile-progress-header">
              <MultiStepProgressBar />
            </div>
            <div className="animated-element">{children}</div>
          </div>
        </div>
      )}

      {/* ── Main App (with Header) ── */}
      {isLanding && (
        <LandingLayout>{children}</LandingLayout>
      )}

      {/* ── Auth Pages (Sign In / Sign Up) ── */}
      {(isSignUp || isSignIn) && (
  <div
    className="row layout-containers position-relative d-flex hrms-auth-shell"
    style={{ minHeight: '100vh', maxHeight: '100vh', overflow: 'hidden' }}
  >

    {/* Left image panel — desktop only */}
    <div
      className="col-lg-6 d-none d-lg-block p-1 position-sticky top-0"
      style={{ height: '100vh', overflow: 'hidden', flexShrink: 0 }}
    >
      <div className="position-relative w-100 h-100 ml-3 d-flex justify-content-center overflow-hidden hrms-auth-visual object-contain">
        <Image
          src={LoginImage}
          alt="HRMS workspace"
          fill
          sizes="50vw"
          quality={85}
          priority
        />
        <div className="hrms-auth-overlay" />
        <div className="position-absolute hrms-auth-copy">
          <div className="mb-5">
            <Image
              src={rubicrDashboardLogo}
              alt="Rubicr"
              width={140}
              priority
            />
          </div>
          <p className="hrms-kicker text-white">Human Resource Management</p>
          <h2>Run people operations with clarity.</h2>
          <p>
            Track attendance, leaves, employees, documents, approvals, and workforce insights from one calm HR portal.
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
    <div
      className="col-12 col-lg-6 p-0 right-panel-container position-relative"
      style={{ height: '100vh', overflowY: 'auto' }}
    >
      <div
        className="position-relative w-100 d-flex justify-content-center right-panel"
        style={{
          minHeight: '100%',
          alignItems: 'flex-start',
          paddingTop: 'clamp(1.5rem, 5vh, 3rem)',
        }}
      >
        <div className="animated-element d-flex justify-content-center align-items-center px-2 pb-5 pb-md-0 w-100">
          {children}
        </div>
      </div>
    </div>

  </div>
)}
    </main>
  );
}
