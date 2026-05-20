'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Calendar, RotateCcw, Gift, ChevronRight, TrendingUp, Timer } from 'lucide-react';

const ATTENDANCE_MODULES = [
  {
    title: 'Check-in / Check-out',
    description: 'Log your daily attendance with live work hour tracking',
    icon: Clock,
    href: '/employee/attendance/checkin',
    color: '#2D7A4F',
    bg: '#e8f5ee',
    badge: 'Active',
    badgeColor: '#2D7A4F',
    badgeBg: '#e8f5ee',
  },
  {
    title: 'Monthly View',
    description: 'Calendar view of your full attendance history',
    icon: Calendar,
    href: '/employee/attendance/monthly',
    color: '#3b82f6',
    bg: '#eff6ff',
    badge: '18 Present',
    badgeColor: '#3b82f6',
    badgeBg: '#eff6ff',
  },
  {
    title: 'Apply Leave',
    description: 'Apply for PL, CL, SL or Comp Off leave',
    icon: Calendar,
    href: '/employee/attendance/leave',
    color: '#6366f1',
    bg: '#eef2ff',
    badge: '1 Pending',
    badgeColor: '#f59e0b',
    badgeBg: '#fffbeb',
  },
  {
    title: 'Regularize Attendance',
    description: 'Correct missed punches or wrong entries',
    icon: RotateCcw,
    href: '/employee/attendance/regularize',
    color: '#f59e0b',
    bg: '#fffbeb',
    badge: null,
    badgeColor: '',
    badgeBg: '',
  },
  {
    title: 'Comp Off',
    description: 'Claim compensatory off for overtime & holiday work',
    icon: Gift,
    href: '/employee/attendance/compoff',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    badge: '2 Eligible',
    badgeColor: '#8b5cf6',
    badgeBg: '#f5f3ff',
  },
];

const PRIORITY_LOGIC = [
  { priority: 1, label: 'Approved Leave', color: '#3b82f6', description: 'Highest priority — overrides all' },
  { priority: 2, label: 'Approved Regularization', color: '#10b981', description: 'Corrects raw attendance data' },
  { priority: 3, label: 'System Attendance', color: '#2D7A4F', description: 'Raw check-in/out logs' },
  { priority: 4, label: 'Absence (Default)', color: '#ef4444', description: 'When no data exists' },
];

export default function AttendanceOverviewPage() {
  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Attendance Module</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your attendance, leaves, and regularizations</p>
      </div>
      {/* Today's quick status */}
      <div className="bg-gradient-to-br from-[#0f1f2e] via-[#1a3347] to-[#0f2d1e] rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#2D7A4F] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-white/50 text-xs font-medium mb-1">Today · March 22, 2026</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#2D7A4F]/30 border border-[#2D7A4F]/40 rounded-full px-3 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4a9e6e] animate-pulse" />
                <span className="text-[#4a9e6e] text-xs font-semibold">Checked in · 09:12 AM</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-3 py-1.5">
                <Timer size={11} className="text-white/60" />
                <span className="text-white/60 text-xs font-semibold">5h 43m worked</span>
              </div>
            </div>
          </div>
          <Link
            href="/employee/attendance/checkin"
            className="flex items-center gap-2 bg-[#2D7A4F] hover:bg-[#1e5c3a] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Clock size={15} />
            Check Out
          </Link>
        </div>
      </div>
      {/* Module Cards */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Attendance Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ATTENDANCE_MODULES?.map((mod) => (
            <Link
              key={mod?.title}
              href={mod?.href}
              className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: mod?.bg }}
                >
                  <mod.icon size={18} style={{ color: mod?.color }} />
                </div>
                {mod?.badge && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: mod?.badgeBg, color: mod?.badgeColor }}
                  >
                    {mod?.badge}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">{mod?.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{mod?.description}</p>
              <div className="flex items-center gap-1 mt-3">
                <span className="text-xs font-semibold" style={{ color: mod?.color }}>Open</span>
                <ChevronRight size={12} style={{ color: mod?.color }} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
      {/* Final Attendance Truth Layer */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-[#2D7A4F]" />
          <h3 className="text-sm font-bold text-gray-800">Final Attendance Resolution</h3>
          <span className="text-[10px] font-semibold bg-[#e8f5ee] text-[#2D7A4F] px-2 py-0.5 rounded-full ml-auto">Priority Logic</span>
        </div>
        <p className="text-xs text-gray-500 mb-4">All inputs converge into one final attendance truth. Higher priority always wins.</p>
        <div className="space-y-2">
          {PRIORITY_LOGIC?.map((item) => (
            <div key={item?.priority} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ backgroundColor: item?.color }}
              >
                {item?.priority}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-800">{item?.label}</p>
                <p className="text-[10px] text-gray-400">{item?.description}</p>
              </div>
              {item?.priority === 1 && (
                <span className="text-[10px] font-semibold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Highest</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
