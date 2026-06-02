'use client';

import React from 'react';
import Link from 'next/link';
import {
  Clock,
  Calendar,
  RotateCcw,
  Gift,
  ChevronRight,
  TrendingUp,
  Timer,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Shield,
  Zap,
  Users,
  Briefcase,
  MapPin,
  Sun,
  Moon,
} from 'lucide-react';

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
    stats: 'Today: 5h 43m',
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
    stats: 'Mar 2026',
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
    stats: '12 days left',
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
    stats: '2 pending',
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
    stats: 'Balance: 2 days',
  },
  {
    title: 'Attendance Analytics',
    description: 'Insights and trends of your attendance patterns',
    icon: BarChart3,
    href: '/employee/attendance/analytics',
    color: '#ec489a',
    bg: '#fdf2f8',
    badge: '92%',
    badgeColor: '#ec489a',
    badgeBg: '#fdf2f8',
    stats: '+12% vs last month',
  },
];

const PRIORITY_LOGIC = [
  {
    priority: 1,
    label: 'Approved Leave',
    color: '#3b82f6',
    description: 'Highest priority — overrides all',
    icon: Calendar,
  },
  {
    priority: 2,
    label: 'Approved Regularization',
    color: '#10b981',
    description: 'Corrects raw attendance data',
    icon: RotateCcw,
  },
  {
    priority: 3,
    label: 'System Attendance',
    color: '#2D7A4F',
    description: 'Raw check-in/out logs',
    icon: Clock,
  },
  {
    priority: 4,
    label: 'Absence (Default)',
    color: '#ef4444',
    description: 'When no data exists',
    icon: AlertCircle,
  },
];

const QUICK_STATS = [
  {
    label: 'Attendance Rate',
    value: '92%',
    change: '+12%',
    color: '#2D7A4F',
    bg: '#e8f5ee',
  },
  {
    label: 'Days Present',
    value: '18',
    change: '+2',
    color: '#3b82f6',
    bg: '#eff6ff',
  },
  {
    label: 'Leaves Taken',
    value: '2',
    change: '-1',
    color: '#f59e0b',
    bg: '#fffbeb',
  },
  {
    label: 'Comp Off Balance',
    value: '2',
    change: 'Available',
    color: '#8b5cf6',
    bg: '#f5f3ff',
  },
];

export default function AttendanceOverviewPage() {
  const currentTime = new Date();
  const hour = currentTime.getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const GreetIcon = hour < 12 ? Sun : hour < 17 ? Zap : Moon;

  return (
    <div className="min-h-screen">
      <div className="w-full px-4 lg:px-5 py-3">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-2xl font-bold text-gray-900">
            Attendance Module
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your attendance, leaves, and regularizations
          </p>
        </div>

        {/* Greeting & Quick Status Hero */}
        <div className="w-full bg-gradient-to-br from-[#0f1f2e] via-[#1a3347] to-[#0f2d1e] rounded-2xl p-6 lg:p-8 relative overflow-hidden mb-6">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#2D7A4F] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4a9e6e] rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <GreetIcon size={20} className="text-[#4a9e6e]" />
                  <span className="text-[#4a9e6e] text-sm font-medium">
                    {greeting}
                  </span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  John Doe
                </h2>
                <p className="text-white/50 text-sm">
                  EMP-2024-001 · Senior Software Engineer · Engineering
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1 text-white/40 text-xs">
                    <MapPin size={12} />
                    <span>Bangalore</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/40 text-xs">
                    <Briefcase size={12} />
                    <span>Joined Jan 2024</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-white text-2xl lg:text-3xl font-bold tabular-nums">
                  {currentTime.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </p>
                <p className="text-white/40 text-sm mt-1">
                  {currentTime.toLocaleDateString('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Status Bar */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-[#2D7A4F]/30 border border-[#2D7A4F]/40 rounded-full px-4 py-2">
                <span className="w-2 h-2 rounded-full bg-[#4a9e6e] animate-pulse" />
                <span className="text-[#4a9e6e] text-sm font-semibold">
                  Checked in · 09:12 AM
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2">
                <Timer size={14} className="text-white/60" />
                <span className="text-white/60 text-sm font-semibold">
                  5h 43m worked today
                </span>
              </div>
              <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/20 rounded-full px-4 py-2">
                <AlertCircle size={14} className="text-amber-300" />
                <span className="text-amber-300 text-sm font-semibold">
                  1 pending approval
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {QUICK_STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    {stat.label}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {stat.change}
                  </p>
                </div>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0`}
                  style={{ backgroundColor: stat.bg }}
                >
                  <TrendingUp size={14} style={{ color: stat.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Module Cards */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Attendance Tools
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Everything you need to manage your attendance
              </p>
            </div>
            <Link
              href="/employee/attendance/all"
              className="text-sm font-semibold text-[#2D7A4F] hover:underline"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ATTENDANCE_MODULES.map((mod) => (
              <Link
                key={mod.title}
                href={mod.href}
                className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{ backgroundColor: mod.bg }}
                  >
                    <mod.icon size={20} style={{ color: mod.color }} />
                  </div>
                  {mod.badge && (
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: mod.badgeBg,
                        color: mod.badgeColor,
                      }}
                    >
                      {mod.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-gray-800 mb-1 group-hover:text-gray-900">
                  {mod.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-3">
                  {mod.description}
                </p>

                {mod.stats && (
                  <div className="flex items-center gap-1 mb-3">
                    <div className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {mod.stats}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1 mt-2">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: mod.color }}
                  >
                    Access Module
                  </span>
                  <ChevronRight
                    size={14}
                    style={{ color: mod.color }}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
          {/* Final Attendance Truth Layer */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[#e8f5ee] rounded-xl flex items-center justify-center">
                <Shield size={20} className="text-[#2D7A4F]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800">
                  Final Attendance Resolution
                </h3>
                <p className="text-xs text-gray-500">
                  Priority-based attendance calculation
                </p>
              </div>
              <span className="text-xs font-semibold bg-[#e8f5ee] text-[#2D7A4F] px-2 py-1 rounded-full ml-auto">
                Priority Logic
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-5">
              All inputs converge into one final attendance truth. Higher
              priority always wins.
            </p>

            <div className="space-y-3">
              {PRIORITY_LOGIC.map((item) => (
                <div
                  key={item.priority}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.priority}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <item.icon size={14} style={{ color: item.color }} />
                      <p className="text-sm font-bold text-gray-800">
                        {item.label}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                  {item.priority === 1 && (
                    <span className="text-xs font-semibold bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                      Highest
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity & Tips */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Clock size={16} className="text-gray-600" />
                  </div>
                  <h3 className="text-base font-bold text-gray-800">
                    Recent Activity
                  </h3>
                </div>
                <Link
                  href="/employee/attendance/history"
                  className="text-xs font-semibold text-[#2D7A4F] hover:underline"
                >
                  View All →
                </Link>
              </div>

              <div className="space-y-3">
                {[
                  {
                    action: 'Checked in',
                    time: 'Today at 09:12 AM',
                    icon: Clock,
                    color: '#2D7A4F',
                  },
                  {
                    action: 'Leave Applied',
                    time: 'Mar 20, 2026 · Casual Leave',
                    icon: Calendar,
                    color: '#3b82f6',
                  },
                  {
                    action: 'Regularization Approved',
                    time: 'Mar 19, 2026 · Corrected entry',
                    icon: RotateCcw,
                    color: '#10b981',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
                      <item.icon size={14} style={{ color: item.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {item.action}
                      </p>
                      <p className="text-xs text-gray-500">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Tip */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap size={20} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-1">
                    Pro Tip
                  </h4>
                  <p className="text-sm text-gray-600">
                    Regularize missed punches within 7 days to maintain accurate
                    attendance records.
                  </p>
                  <Link
                    href="/employee/attendance/regularize"
                    className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-blue-600 hover:underline"
                  >
                    Regularize now
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
