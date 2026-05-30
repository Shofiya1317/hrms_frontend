'use client';

import React from 'react';
import Link from 'next/link';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Coffee,
  RotateCcw,
  Gift,
  ChevronRight,
  TrendingUp,
  Award,
  Users,
  Bell,
  Check,
  X,
  Clock as ClockIcon,
} from 'lucide-react';
import CheckInOutCard from './CheckInOutCard';

// ─────────────────────────────────────────────
// Static data
// ─────────────────────────────────────────────
const LEAVE_BALANCES = [
  {
    type: 'Privilege Leave',
    short: 'PL',
    balance: 12,
    used: 3,
    total: 15,
    color: '#2D7A4F',
    bg: '#e8f5ee',
  },
  {
    type: 'Casual Leave',
    short: 'CL',
    balance: 5,
    used: 2,
    total: 7,
    color: '#3b82f6',
    bg: '#eff6ff',
  },
  {
    type: 'Sick Leave',
    short: 'SL',
    balance: 6,
    used: 0,
    total: 6,
    color: '#f59e0b',
    bg: '#fffbeb',
  },
  {
    type: 'Comp Off',
    short: 'CO',
    balance: 2,
    used: 1,
    total: 3,
    color: '#8b5cf6',
    bg: '#f5f3ff',
  },
];

const RECENT_ACTIVITY = [
  {
    date: 'Today',
    action: 'Checked in',
    time: '09:12 AM',
    icon: CheckCircle2,
    color: '#2D7A4F',
  },
  {
    date: 'Yesterday',
    action: 'Full Day Present',
    time: '09:05 AM – 06:30 PM',
    icon: CheckCircle2,
    color: '#2D7A4F',
  },
  {
    date: 'Mar 20',
    action: 'Leave Applied',
    time: 'Casual Leave · 1 day',
    icon: Calendar,
    color: '#3b82f6',
  },
  {
    date: 'Mar 19',
    action: 'Regularization Approved',
    time: 'Corrected: 09:00 AM',
    icon: CheckCircle2,
    color: '#10b981',
  },
  {
    date: 'Mar 18',
    action: 'Comp Off Credited',
    time: '+1 day (Weekend work)',
    icon: Gift,
    color: '#8b5cf6',
  },
];

const QUICK_ACTIONS = [
  {
    label: 'Check In / Out',
    icon: Clock,
    href: '/employee/attendance/checkin',
    color: '#2D7A4F',
    bg: '#e8f5ee',
    description: 'Mark your attendance',
  },
  {
    label: 'Apply Leave',
    icon: Calendar,
    href: '/employee/attendance/leave',
    color: '#3b82f6',
    bg: '#eff6ff',
    description: 'Request time off',
  },
  {
    label: 'Regularize',
    icon: RotateCcw,
    href: '/employee/attendance/regularize',
    color: '#f59e0b',
    bg: '#fffbeb',
    description: 'Fix missed punches',
  },
  {
    label: 'Claim Comp Off',
    icon: Gift,
    href: '/employee/attendance/compoff',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    description: 'Claim overtime',
  },
];

const MONTHLY_STATS = [
  {
    label: 'Present',
    value: 18,
    icon: CheckCircle2,
    color: '#2D7A4F',
    bg: '#e8f5ee',
    change: '+2 vs last month',
  },
  {
    label: 'Leaves',
    value: 2,
    icon: Calendar,
    color: '#3b82f6',
    bg: '#eff6ff',
    change: '-1 vs last month',
  },
  {
    label: 'Late',
    value: 1,
    icon: AlertCircle,
    color: '#f59e0b',
    bg: '#fffbeb',
    change: 'Same as last month',
  },
  {
    label: 'WFH',
    value: 3,
    icon: Coffee,
    color: '#6366f1',
    bg: '#eef2ff',
    change: '+1 vs last month',
  },
];

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function EmployeeDashboard({ employee, apiKey, token }: { employee: any; apiKey:string; token: string;}) {
  console.log(employee, 'employee')
  const fullName = `${employee?.first_name ?? ''} ${employee?.last_name ?? ''}`.trim() || 'Employee';
  const employeeId = employee?.employee_code ?? '';
  const designation = employee?.designation?.name ?? ''; // populate via API join
  const location = employee?.city ?? employee?.country ?? '';
  const tenantId = employee?.tenant_id ?? ''; // currently null — wire from auth

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full px-4 lg:px-8 py-6">

        {/* ── Check In / Out Card ── */}
        <CheckInOutCard
          apiKey={apiKey}
          token={token}
          fullName={fullName}
          employeeId={employeeId}
          designation={designation}
          defaultLocation={location}
        />

        {/* ══════════════════════════════════════════
            STATS GRID
        ══════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#e8f5ee] rounded-xl flex items-center justify-center">
                <TrendingUp size={24} className="text-[#2D7A4F]" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                +12%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">92%</h3>
            <p className="text-sm text-gray-500 mt-1">Attendance Rate</p>
            <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#2D7A4F] to-[#4a9e6e] rounded-full"
                style={{ width: '92%' }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#eff6ff] rounded-xl flex items-center justify-center">
                <Award size={24} className="text-[#3b82f6]" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                Excellent
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">25</h3>
            <p className="text-sm text-gray-500 mt-1">Days Present (This Month)</p>
            <p className="text-xs text-gray-400 mt-2">18 working days completed</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#fffbeb] rounded-xl flex items-center justify-center">
                <ClockIcon size={24} className="text-[#f59e0b]" />
              </div>
              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                On Track
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">168</h3>
            <p className="text-sm text-gray-500 mt-1">Total Hours Worked</p>
            <p className="text-xs text-gray-400 mt-2">8.4 hours/day average</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#f5f3ff] rounded-xl flex items-center justify-center">
                <Users size={24} className="text-[#8b5cf6]" />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                Team
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">12</h3>
            <p className="text-sm text-gray-500 mt-1">Team Members</p>
            <p className="text-xs text-gray-400 mt-2">3 on leave today</p>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            QUICK ACTIONS
        ══════════════════════════════════════════ */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Quick Actions</h2>
            <Link
              href="/employee/actions"
              className="text-xs font-semibold text-[#2D7A4F] hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="group bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-200"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105"
                  style={{ backgroundColor: action.bg }}
                >
                  <action.icon size={22} style={{ color: action.color }} />
                </div>
                <p className="text-base font-semibold text-gray-800 group-hover:text-gray-900">
                  {action.label}
                </p>
                <p className="text-xs text-gray-400 mt-1">{action.description}</p>
                <div className="flex items-center gap-1 mt-3">
                  <span className="text-xs text-gray-400">Click to open</span>
                  <ChevronRight
                    size={12}
                    className="text-gray-300 group-hover:text-gray-500 transition-colors"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            MONTHLY STATS + LEAVE BALANCES
        ══════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Monthly Stats */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  March 2026 · Attendance
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Monthly performance overview
                </p>
              </div>
              <Link
                href="/employee/attendance/monthly"
                className="text-sm font-semibold text-[#2D7A4F] hover:underline flex items-center gap-1"
              >
                Full view <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {MONTHLY_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-3 p-4 rounded-xl"
                  style={{ backgroundColor: stat.bg }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/80">
                    <stat.icon size={18} style={{ color: stat.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-gray-600">{stat.label}</p>
                      <span className="text-[10px] font-medium" style={{ color: stat.color }}>
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: stat.color }}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leave Balances */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Leave Balances</h3>
                <p className="text-xs text-gray-500 mt-1">Annual leave summary · 2026</p>
              </div>
              <Link
                href="/employee/attendance/leave"
                className="text-sm font-semibold text-[#2D7A4F] hover:underline flex items-center gap-1"
              >
                Apply <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-4">
              {LEAVE_BALANCES.map((leave) => (
                <div key={leave.type} className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
                    style={{ backgroundColor: leave.bg, color: leave.color }}
                  >
                    {leave.short}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-gray-700">
                        {leave.type}
                      </span>
                      <span className="text-sm font-bold" style={{ color: leave.color }}>
                        {leave.balance} left
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(leave.balance / leave.total) * 100}%`,
                          backgroundColor: leave.color,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {leave.used} out of {leave.total} days used
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            RECENT ACTIVITY + PENDING APPROVALS
        ══════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
                <p className="text-xs text-gray-500 mt-1">Your latest attendance updates</p>
              </div>
              <Link
                href="/employee/attendance/history"
                className="text-sm font-semibold text-[#2D7A4F] hover:underline flex items-center gap-1"
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-1">
              {RECENT_ACTIVITY.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-50">
                    <item.icon size={18} style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-800">{item.action}</p>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {item.date}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Bell size={20} className="text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-800">Pending Approvals</h3>
                <p className="text-xs text-amber-600">Items awaiting your manager's review</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-white rounded-xl p-4 border border-amber-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Calendar size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Casual Leave Request</p>
                      <p className="text-xs text-gray-500">Mar 25, 2026 · 1 day</p>
                      <p className="text-xs text-amber-600 mt-1">Submitted 2 days ago</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1.5 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                      <Check size={16} className="text-green-600" />
                    </button>
                    <button className="p-1.5 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                      <X size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Gift size={18} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Comp Off Claim</p>
                    <p className="text-xs text-gray-500">Weekend work · Mar 22, 2026</p>
                    <p className="text-xs text-amber-600 mt-1">Pending review</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}