'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Clock, Briefcase, DollarSign,
  LogOut, ChevronRight, Bell, Menu, X,
  UserCheck, ChevronDown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const NAV_ITEMS = [
  {
    id: 'cockpit',
    label: 'My Cockpit',
    icon: LayoutDashboard,
    href: '/employee',
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: Clock,
    href: '/employee/attendance',
    children: [
      { label: 'Overview', href: '/employee/attendance' },
      { label: 'Check-in / Out', href: '/employee/attendance/checkin' },
      { label: 'Monthly View', href: '/employee/attendance/monthly' },
      { label: 'Apply Leave', href: '/employee/attendance/leave' },
      { label: 'Regularize', href: '/employee/attendance/regularize' },
      { label: 'Comp Off', href: '/employee/attendance/compoff' },
    ],
  },
  {
    id: 'talent',
    label: 'Talent',
    icon: Briefcase,
    href: '/employee/talent',
  },
  {
    id: 'payroll',
    label: 'Payroll',
    icon: DollarSign,
    href: '/employee/payroll',
  },
];

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(true);
  const { profile, signOut } = useAuth();

  const isActive = (href: string) => {
    if (href === '/employee') return pathname === '/employee';
    return pathname.startsWith(href);
  };

  const isManagerView = pathname.startsWith('/employee/manager');

  const displayName = profile?.fullName || 'Employee';
  const employeeId = profile?.employeeId || 'EMP-2024-001';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex h-screen bg-[#f4f6f9] overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-60 bg-[#0f1f2e] flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2D7A4F] to-[#4a9e6e] flex items-center justify-center shadow-lg">
            <span className="text-white text-xs font-black">IW</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Impactree</p>
            <p className="text-[#4a9e6e] text-[10px] font-semibold tracking-widest uppercase">Workflo</p>
          </div>
          <button
            className="ml-auto lg:hidden text-white/50 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2 bg-white/8 rounded-xl px-3 py-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2D7A4F] to-[#1e5c3a] flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{displayName}</p>
              <p className="text-white/40 text-[10px] truncate">{employeeId}</p>
            </div>
          </div>
        </div>

        {/* View toggle */}
        <div className="px-4 py-3 border-b border-white/10">
          <div className="grid grid-cols-2 gap-1 bg-white/8 rounded-xl p-1">
            <Link
              href="/employee"
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                !isManagerView ? 'bg-[#2D7A4F] text-white shadow' : 'text-white/50 hover:text-white'
              }`}
            >
              <span>Employee</span>
            </Link>
            <Link
              href="/employee/manager"
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                isManagerView ? 'bg-[#2D7A4F] text-white shadow' : 'text-white/50 hover:text-white'
              }`}
            >
              <UserCheck size={11} />
              <span>Manager</span>
            </Link>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const hasChildren = item.children && item.children.length > 0;

            if (hasChildren) {
              return (
                <div key={item.id}>
                  <button
                    onClick={() => setAttendanceOpen(!attendanceOpen)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                      active
                        ? 'bg-[#2D7A4F] text-white shadow-lg shadow-[#2D7A4F]/30'
                        : 'text-white/60 hover:text-white hover:bg-white/8'
                    }`}
                  >
                    <item.icon size={16} className={active ? 'text-white' : 'text-white/50 group-hover:text-white/80'} />
                    <span>{item.label}</span>
                    <ChevronDown
                      size={13}
                      className={`ml-auto transition-transform duration-200 ${attendanceOpen ? 'rotate-180' : ''} ${active ? 'text-white/70' : 'text-white/30'}`}
                    />
                  </button>
                  {attendanceOpen && (
                    <div className="mt-0.5 ml-3 pl-3 border-l border-white/10 space-y-0.5">
                      {item.children!.map((child) => {
                        const childActive = pathname === child.href;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                              childActive
                                ? 'bg-white/12 text-white' :'text-white/45 hover:text-white/80 hover:bg-white/6'
                            }`}
                          >
                            {childActive && <span className="w-1 h-1 rounded-full bg-[#4a9e6e] flex-shrink-0" />}
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  active
                    ? 'bg-[#2D7A4F] text-white shadow-lg shadow-[#2D7A4F]/30'
                    : 'text-white/60 hover:text-white hover:bg-white/8'
                }`}
              >
                <item.icon size={16} className={active ? 'text-white' : 'text-white/50 group-hover:text-white/80'} />
                <span>{item.label}</span>
                {active && <ChevronRight size={13} className="ml-auto opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/8 transition-all"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 h-14 flex items-center gap-4 flex-shrink-0">
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">
              {isManagerView ? 'Manager View' : 'Employee Self-Service'}
            </p>
            <p className="text-xs text-gray-400">Impactree Workflo · Attendance Module</p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
              <Bell size={15} className="text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </button>
            <div className="flex items-center gap-2 bg-[#e8f5ee] rounded-xl px-3 py-1.5">
              <div className="w-5 h-5 rounded-md bg-[#2D7A4F] flex items-center justify-center">
                <span className="text-white text-[9px] font-bold">{initials}</span>
              </div>
              <span className="text-xs font-semibold text-[#2D7A4F]">{displayName}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
