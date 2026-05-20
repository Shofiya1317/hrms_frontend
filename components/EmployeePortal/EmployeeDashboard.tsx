'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Calendar, CheckCircle2, AlertCircle, ArrowRight, Coffee, Zap, RotateCcw, Gift, Sun, Moon, Timer, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const LEAVE_BALANCES = [
  { type: 'Privilege Leave', short: 'PL', balance: 12, used: 3, total: 15, color: '#2D7A4F', bg: '#e8f5ee' },
  { type: 'Casual Leave', short: 'CL', balance: 5, used: 2, total: 7, color: '#3b82f6', bg: '#eff6ff' },
  { type: 'Sick Leave', short: 'SL', balance: 6, used: 0, total: 6, color: '#f59e0b', bg: '#fffbeb' },
  { type: 'Comp Off', short: 'CO', balance: 2, used: 1, total: 3, color: '#8b5cf6', bg: '#f5f3ff' },
];

const RECENT_ACTIVITY = [
  { date: 'Today', action: 'Checked in', time: '09:12 AM', status: 'present', icon: CheckCircle2, color: '#2D7A4F' },
  { date: 'Yesterday', action: 'Full Day Present', time: '09:05 AM – 06:30 PM', status: 'present', icon: CheckCircle2, color: '#2D7A4F' },
  { date: 'Mar 20', action: 'Leave Applied', time: 'Casual Leave · 1 day', status: 'leave', icon: Calendar, color: '#3b82f6' },
  { date: 'Mar 19', action: 'Regularization Approved', time: 'Corrected: 09:00 AM', status: 'approved', icon: CheckCircle2, color: '#10b981' },
  { date: 'Mar 18', action: 'Comp Off Credited', time: '+1 day (Weekend work)', status: 'credited', icon: Gift, color: '#8b5cf6' },
];

const QUICK_ACTIONS = [
  { label: 'Check In / Out', icon: Clock, href: '/employee/attendance/checkin', color: '#2D7A4F', bg: '#e8f5ee' },
  { label: 'Apply Leave', icon: Calendar, href: '/employee/attendance/leave', color: '#3b82f6', bg: '#eff6ff' },
  { label: 'Regularize', icon: RotateCcw, href: '/employee/attendance/regularize', color: '#f59e0b', bg: '#fffbeb' },
  { label: 'Claim Comp Off', icon: Gift, href: '/employee/attendance/compoff', color: '#8b5cf6', bg: '#f5f3ff' },
];

const MONTHLY_STATS = [
  { label: 'Present', value: 18, icon: CheckCircle2, color: '#2D7A4F', bg: '#e8f5ee' },
  { label: 'Leaves', value: 2, icon: Calendar, color: '#3b82f6', bg: '#eff6ff' },
  { label: 'Late', value: 1, icon: AlertCircle, color: '#f59e0b', bg: '#fffbeb' },
  { label: 'WFH', value: 3, icon: Coffee, color: '#6366f1', bg: '#eef2ff' },
];

export default function EmployeeCockpit() {
  const { profile } = useAuth();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [checkInTime] = useState('09:12 AM');
  const [liveHours, setLiveHours] = useState('5h 43m');

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hour = currentTime ? currentTime?.getHours() : 12;
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const GreetIcon = hour < 12 ? Sun : hour < 17 ? Zap : Moon;

  const displayName = profile?.fullName || 'Welcome';
  const displayRole = profile?.department ? `${profile?.department}` : '';

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Greeting Hero */}
      <div className="bg-gradient-to-br from-[#0f1f2e] via-[#1a3347] to-[#0f2d1e] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#2D7A4F] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#4a9e6e] rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GreetIcon size={16} className="text-[#4a9e6e]" />
              <span className="text-[#4a9e6e] text-sm font-medium">{greeting}</span>
            </div>
            <h1 className="text-2xl font-bold text-white">{displayName}</h1>
            <p className="text-white/50 text-sm mt-0.5">
              {profile?.employeeId ? `${profile?.employeeId} · ` : ''}{displayRole}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Live clock */}
            <div className="text-right">
              <p className="text-white text-2xl font-bold tabular-nums">
                {currentTime?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p className="text-white/40 text-xs">
                {currentTime?.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>
        </div>

        {/* Today's status bar */}
        <div className="relative z-10 mt-5 flex flex-wrap items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${isCheckedIn ? 'bg-[#2D7A4F]/30 text-[#4a9e6e] border border-[#2D7A4F]/40' : 'bg-white/10 text-white/50 border border-white/10'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isCheckedIn ? 'bg-[#4a9e6e] animate-pulse' : 'bg-white/30'}`} />
            {isCheckedIn ? `Checked in · ${checkInTime}` : 'Not checked in'}
          </div>
          {isCheckedIn && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-white/70 border border-white/10">
              <Timer size={11} />
              {liveHours} worked today
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/20">
            <AlertCircle size={11} />
            1 pending approval
          </div>
        </div>
      </div>
      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS?.map((action) => (
            <Link
              key={action?.label}
              href={action?.href}
              className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: action?.bg }}
              >
                <action.icon size={18} style={{ color: action?.color }} />
              </div>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">{action?.label}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-gray-400">Open</span>
                <ChevronRight size={11} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
      {/* Stats + Leave Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Stats */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">March 2026 · Attendance</h3>
            <Link href="/employee/attendance/monthly" className="text-xs font-semibold text-[#2D7A4F] hover:underline flex items-center gap-1">
              Full view <ArrowRight size={11} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {MONTHLY_STATS?.map((stat) => (
              <div key={stat?.label} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: stat?.bg }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/60">
                  <stat.icon size={15} style={{ color: stat?.color }} />
                </div>
                <div>
                  <p className="text-xl font-bold" style={{ color: stat?.color }}>{stat?.value}</p>
                  <p className="text-xs font-medium text-gray-500">{stat?.label}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Attendance rate */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">Attendance Rate</span>
              <span className="text-sm font-bold text-[#2D7A4F]">90%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#2D7A4F] to-[#4a9e6e] rounded-full" style={{ width: '90%' }} />
            </div>
          </div>
        </div>

        {/* Leave Balances */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">Leave Balances · 2026</h3>
            <Link href="/employee/attendance/leave" className="text-xs font-semibold text-[#2D7A4F] hover:underline flex items-center gap-1">
              Apply <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-3">
            {LEAVE_BALANCES?.map((leave) => (
              <div key={leave?.type} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{ backgroundColor: leave?.bg, color: leave?.color }}
                >
                  {leave?.short}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-700">{leave?.type}</span>
                    <span className="text-xs font-bold" style={{ color: leave?.color }}>{leave?.balance} left</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(leave?.balance / leave?.total) * 100}%`, backgroundColor: leave?.color }}
                    />
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 flex-shrink-0">{leave?.used}/{leave?.total} used</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800">Recent Activity</h3>
          <Link href="/employee/attendance/monthly" className="text-xs font-semibold text-[#2D7A4F] hover:underline flex items-center gap-1">
            View all <ArrowRight size={11} />
          </Link>
        </div>
        <div className="space-y-3">
          {RECENT_ACTIVITY?.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-50">
                <item.icon size={14} style={{ color: item?.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-800">{item?.action}</p>
                  <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{item?.date}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{item?.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Pending Requests */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle size={16} className="text-amber-600" />
          <h3 className="text-sm font-bold text-amber-800">Pending Approvals</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-amber-100">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar size={13} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Casual Leave · Mar 25</p>
                <p className="text-xs text-gray-500">Submitted 2 days ago · Awaiting manager</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}
