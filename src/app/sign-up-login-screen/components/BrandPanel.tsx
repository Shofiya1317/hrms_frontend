'use client';

import React from 'react';
import { UserRole } from './LoginScreen';
import AppImage from '@/components/ui/AppImage';

interface BrandPanelProps {
  activeRole: UserRole;
}

const roleContent: Record<
  UserRole,
  { headline: string; subline: string; badge: string; badgeColor: string }
> = {
  admin: {
    headline: 'Full system control at your fingertips.',
    subline:
      'Configure roles, manage departments, oversee payroll cycles, and keep your organisation running smoothly.',
    badge: 'Product Admin',
    badgeColor: 'bg-amber-400/20 text-amber-200 border border-amber-400/30',
  },
  manager: {
    headline: 'Lead your team with clarity and confidence.',
    subline:
      'Approve leave requests, track attendance, review performance, and keep your team aligned — all in one place.',
    badge: 'Manager',
    badgeColor: 'bg-sky-400/20 text-sky-200 border border-sky-400/30',
  },
  employee: {
    headline: 'Your work life, beautifully organised.',
    subline:
      'Mark attendance, apply for leave, view your payslips, and stay on top of your goals with Impactree Workflo.',
    badge: 'Employee',
    badgeColor: 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30',
  },
};

const features = [
  { icon: '🗓️', label: 'Smart Attendance Tracking' },
  { icon: '📋', label: 'Leave & Approval Workflows' },
  { icon: '💰', label: 'Automated Payroll Processing' },
  { icon: '📈', label: 'Performance & Goal Management' },
];

export default function BrandPanel({ activeRole }: BrandPanelProps) {
  const content = roleContent[activeRole];

  return (
    <div className="brand-gradient w-full relative overflow-hidden flex flex-col">
      {/* Decorative circles */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute top-1/3 -right-16 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-20 left-1/4 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute bottom-1/4 -right-8 w-32 h-32 rounded-full bg-white/8 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full px-10 xl:px-14 2xl:px-16 py-12">
        {/* Logo */}
        <div className="flex items-center gap-4 mb-auto">
          <div className="bg-white/20 rounded-2xl p-3 shadow-lg shadow-black/20">
            <AppImage
              src="/assets/images/ChatGPT_Image_Mar_20_2026_from_HRMS_System_Design-1773983355969.png"
              alt="Impactree Workflo logo — white tree icon on green background"
              width={64}
              height={64}
              className="h-16 w-16 object-contain brightness-0 invert"
              priority
            />
          </div>
          <div>
            <p className="text-white font-extrabold text-2xl leading-tight tracking-tight">
              Impactree
            </p>
            <p className="text-white/80 text-sm font-semibold tracking-widest uppercase">
              Workflo
            </p>
          </div>
        </div>

        {/* Main copy — transitions with role */}
        <div className="mt-16 mb-10">
          {/* Role badge */}
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-5 ${content.badgeColor}`}
          >
            {content.badge} Portal
          </span>

          <h1
            key={activeRole + '-headline'}
            className="text-white text-3xl xl:text-4xl font-bold leading-tight text-balance mb-4 animate-slide-up"
          >
            {content.headline}
          </h1>
          <p
            key={activeRole + '-sub'}
            className="text-white/75 text-base leading-relaxed animate-slide-up"
            style={{ animationDelay: '60ms' }}
          >
            {content.subline}
          </p>
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-2 gap-3 mb-12">
          {features.map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-2.5 bg-white/10 rounded-xl px-4 py-3 border border-white/10"
            >
              <span className="text-lg">{f.icon}</span>
              <span className="text-white/85 text-sm font-medium leading-tight">
                {f.label}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom tagline */}
        <div className="border-t border-white/15 pt-6">
          <p className="text-white/50 text-xs font-medium">
            © 2026 Impactree Technologies Pvt. Ltd. · All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}