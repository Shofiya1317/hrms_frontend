'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock, MapPin, Timer, CheckCircle2, LogIn, LogOut,
  Coffee, Wifi, TrendingUp, ChevronRight, Sun, Moon,
  Zap, Calendar, Award, Target, Battery, Activity,
  ArrowRight, Bell, AlertCircle, Gift, RotateCcw, Users,
  Check, X, Briefcase,
} from 'lucide-react';
import CheckInOutCard from '@/components/EmployeePortal/CheckInOutCard';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LocationData { lat: number; lng: number; address: string; }

// ─── Static Data ──────────────────────────────────────────────────────────────
const TODAYS_LOG = [
  {
    time: '09:12 AM', event: 'Check-in', type: 'in', location: 'Office · Bangalore',
  },
];

const WEEK_SUMMARY = [
  {
    day: 'Mon', date: '18', status: 'present', hours: '9h 15m', in: '09:05', out: '18:20',
  },
  {
    day: 'Tue', date: '19', status: 'present', hours: '8h 45m', in: '09:30', out: '18:15',
  },
  {
    day: 'Wed', date: '20', status: 'leave', hours: '—', in: '—', out: '—',
  },
  {
    day: 'Thu', date: '21', status: 'present', hours: '9h 00m', in: '09:10', out: '18:10',
  },
  {
    day: 'Fri', date: '22', status: 'active', hours: '5h 43m', in: '09:12', out: '—',
  },
  {
    day: 'Sat', date: '23', status: 'holiday', hours: '—', in: '—', out: '—',
  },
  {
    day: 'Sun', date: '24', status: 'holiday', hours: '—', in: '—', out: '—',
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  present: {
    label: 'Present', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0',
  },
  leave: {
    label: 'Leave', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe',
  },
  absent: {
    label: 'Absent', color: '#ef4444', bg: '#fef2f2', border: '#fecaca',
  },
  active: {
    label: 'Active', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a',
  },
  holiday: {
    label: 'Holiday', color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe',
  },
};

const QUICK_STATS = [
  {
    label: 'Today\'s Hours', value: '5h 43m', target: '8h', icon: Timer, color: '#16a34a', bg: '#f0fdf4',
  },
  {
    label: 'Weekly Total', value: '36h 43m', target: '40h', icon: Calendar, color: '#2563eb', bg: '#eff6ff',
  },
  {
    label: 'Attendance Rate', value: '92%', target: '95%', icon: Target, color: '#f59e0b', bg: '#fffbeb',
  },
  {
    label: 'Streak', value: '12 days', target: '20', icon: Battery, color: '#8b5cf6', bg: '#f5f3ff',
  },
];

const LEAVE_BALANCES = [
  {
    type: 'Privilege Leave', short: 'PL', balance: 12, used: 3, total: 15, color: '#16a34a', bg: '#f0fdf4',
  },
  {
    type: 'Casual Leave', short: 'CL', balance: 5, used: 2, total: 7, color: '#2563eb', bg: '#eff6ff',
  },
  {
    type: 'Sick Leave', short: 'SL', balance: 6, used: 0, total: 6, color: '#d97706', bg: '#fffbeb',
  },
  {
    type: 'Comp Off', short: 'CO', balance: 2, used: 1, total: 3, color: '#7c3aed', bg: '#f5f3ff',
  },
];

const QUICK_ACTIONS = [
  {
    label: 'Apply Leave', icon: Calendar, href: '/employee/attendance/leave', color: '#2563eb', bg: '#eff6ff', desc: 'Request time off',
  },
  {
    label: 'Regularize', icon: RotateCcw, href: '/employee/attendance/regularize', color: '#d97706', bg: '#fffbeb', desc: 'Fix missed punches',
  },
  {
    label: 'Claim Comp Off', icon: Gift, href: '/employee/attendance/compoff', color: '#7c3aed', bg: '#f5f3ff', desc: 'Claim overtime',
  },
  {
    label: 'View History', icon: Activity, href: '/employee/attendance/history', color: '#0891b2', bg: '#ecfeff', desc: 'Full attendance log',
  },
];

export default function CheckInPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hour = currentTime.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const GreetIcon = hour < 12 ? Sun : hour < 17 ? Zap : Moon;

  const getProgressPercentage = (value: string, target: string) => {
    const numValue = parseFloat(value.split('h')[0] || value.split('%')[0]);
    const numTarget = parseFloat(target.split('h')[0] || target.split('%')[0]);
    return (numValue / numTarget) * 100;
  };

  return (
    <div className="min-h-screen">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold shadow-lg border animate-fade-in ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800'
            : toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}
        >
          {toast.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
          {toast.msg}
        </div>
      )}

      <div className="w-full px-3 py-2 sm:px-5 sm:py-3 lg:px-6 lg:py-4">
        {/* Header */}
        <div className="mb-3 lg:mb-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-2">
            <Activity size={14} />
            <span>Attendance Management</span>
            <ChevronRight size={12} />
            <span className="text-emerald-600 font-semibold">Check-in/Check-out</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-2xl font-bold text-slate-900">Check-in / Check-out</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Log your daily attendance and track work hours</p>
        </div>

        {/* Main Check-in/out Card */}
        <CheckInOutCard
          apiKey=""
          token=""
          fullName="John Doe"
          employeeId="EMP-2024-001"
          designation="Senior Software Engineer"
          defaultLocation="Office · Bangalore"
        />

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-3 lg:mb-4">
          {QUICK_STATS.map((stat) => {
            const progress = getProgressPercentage(stat.value, stat.target);
            const StatIcon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.bg }}>
                    <StatIcon size={18} style={{ color: stat.color }} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] sm:text-xs text-slate-500">
                      Target:
                      {stat.target}
                    </p>
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-1">{stat.label}</p>
                <div className="mt-2 sm:mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: stat.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 mb-3 lg:mb-4">
          {/* Today's Log */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Clock size={16} className="text-slate-600" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-800">Today's Timeline</h3>
              </div>
              <span className="text-[10px] sm:text-xs text-slate-400">
                {currentTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            </div>

            <div className="relative">
              <div className="absolute left-3.5 sm:left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
              <div className="space-y-3 sm:space-y-4">
                {TODAYS_LOG.map((log, i) => (
                  <div key={i} className="relative flex items-start gap-3 sm:gap-4">
                    <div className="relative z-10">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                        log.type === 'in' ? 'bg-emerald-50' : 'bg-rose-50'
                      }`}
                      >
                        {log.type === 'in' ? <LogIn size={14} className="text-emerald-600" /> : <LogOut size={14} className="text-rose-600" />}
                      </div>
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-xl p-2.5 sm:p-3 hover:bg-slate-100 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs sm:text-sm font-semibold text-slate-800">{log.event}</p>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-700 tabular-nums">{log.time}</span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-500">{log.location}</p>
                    </div>
                  </div>
                ))}

                {/* Check-out pending indicator */}
                <div className="relative flex items-start gap-3 sm:gap-4 opacity-60">
                  <div className="relative z-10">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-rose-50 flex items-center justify-center border-2 border-dashed border-rose-200">
                      <LogOut size={14} className="text-rose-400" />
                    </div>
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-xl p-2.5 sm:p-3 border-2 border-dashed border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs sm:text-sm font-medium text-slate-400">Check-out pending</p>
                      <span className="text-[10px] sm:text-xs text-slate-300 tabular-nums">—</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-400">Not yet checked out</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* This Week Summary */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Calendar size={16} className="text-slate-600" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-800">This Week</h3>
              </div>
              <Link href="/employee/attendance/monthly" className="text-[10px] sm:text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1">
                Monthly view
                {' '}
                <ArrowRight size={11} />
              </Link>
            </div>

            {/* Responsive Week Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {WEEK_SUMMARY.map((day) => {
                const cfg = STATUS_CONFIG[day.status] || STATUS_CONFIG.present;
                const isToday = day.date === currentTime.getDate().toString();
                return (
                  <div
                    key={day.day}
                    className={`flex flex-col items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-lg sm:rounded-xl border transition-all ${
                      isToday ? 'ring-2 ring-emerald-500 ring-offset-1 sm:ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
                  >
                    <span className="text-[8px] sm:text-[10px] font-semibold text-slate-500">{day.day}</span>
                    <span className="text-xs sm:text-sm font-bold" style={{ color: cfg.color }}>{day.date}</span>
                    <span
                      className="text-[7px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full whitespace-nowrap"
                      style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                    <span className="text-[7px] sm:text-[9px] text-slate-500 tabular-nums whitespace-nowrap">{day.hours}</span>
                    {day.in !== '—' && (
                      <div className="text-[6px] sm:text-[8px] text-slate-400 tabular-nums hidden sm:block">
                        {day.in}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Week Progress */}
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-[10px] sm:text-xs">
                <span className="text-slate-500">Week Progress</span>
                <span className="font-semibold text-emerald-600">92%</span>
              </div>
              <div className="mt-1.5 sm:mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500" style={{ width: '92%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Leave Balances Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm mb-3 lg:mb-4">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800">Leave Balances</h3>
              <p className="text-[10px] sm:text-xs text-slate-400">Annual · 2026</p>
            </div>
            <Link href="/employee/attendance/leave" className="text-[10px] sm:text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1">
              Apply
              {' '}
              <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {LEAVE_BALANCES.map((l) => (
              <div key={l.type} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all duration-200 hover:shadow-sm">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0" style={{ backgroundColor: l.bg, color: l.color }}>
                  {l.short}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[11px] sm:text-xs font-semibold text-slate-700 truncate">{l.type}</p>
                    <span className="text-xs sm:text-sm font-bold ml-2 flex-shrink-0" style={{ color: l.color }}>
                      {l.balance}
                      d
                    </span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(l.balance / l.total) * 100}%`, backgroundColor: l.color }} />
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 mt-1">
                    {l.used}
                    {' '}
                    of
                    {' '}
                    {l.total}
                    {' '}
                    used
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3 mb-3 lg:mb-4">
          {QUICK_ACTIONS.map((action) => {
            const ActionIcon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="group flex flex-col items-center gap-1.5 sm:gap-2 py-3 sm:py-3.5 px-2 rounded-xl sm:rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-center"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ backgroundColor: action.bg }}>
                  <ActionIcon size={18} style={{ color: action.color }} />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-700 leading-tight">{action.label}</p>
                  <p className="text-[8px] sm:text-[10px] text-slate-400 mt-0.5 leading-tight hidden xs:block">{action.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Info Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3">
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-4 flex items-center gap-3 hover:shadow-md transition-all duration-200">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <Clock size={18} className="text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-slate-500">Working Hours</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">09:00 AM – 06:00 PM</p>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-4 flex items-center gap-3 hover:shadow-md transition-all duration-200">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Coffee size={18} className="text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-slate-500">Lunch Break</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">01:00 PM – 02:00 PM</p>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-4 flex items-center gap-3 hover:shadow-md transition-all duration-200">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={18} className="text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-slate-500">This Week Total</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">36h 43m / 40h</p>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-4 flex items-center gap-3 hover:shadow-md transition-all duration-200">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
              <Award size={18} className="text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-slate-500">Current Streak</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">12 days · Great!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
