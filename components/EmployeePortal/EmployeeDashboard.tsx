'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sun, Zap, Moon, Timer, AlertCircle, MapPin, Wifi,
  LogIn, LogOut, CheckCircle2, Loader2, XCircle,
  Clock, Calendar, RotateCcw, Gift, ChevronRight,
  TrendingUp, Award, Users, Bell, Check, X, ArrowRight,
  Coffee, Activity, Briefcase,
} from 'lucide-react';
import CheckInOutCard from './CheckInOutCard'; // Import the external component

// ─── Types ────────────────────────────────────────────────────────────────────
interface LocationData { lat: number; lng: number; address: string; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pad(n: number) { return String(n).padStart(2, '0'); }
function fmtTime(d: Date) { return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); }
function toTimeString(d: Date) { return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; }
function toDateString(d: Date) { return d.toISOString().split('T')[0]; }

async function fetchLocation(): Promise<LocationData | null> {
  return new Promise((resolve) => {
    if (!navigator?.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, { headers: { 'Accept-Language': 'en' } });
          const data = await res.json();
          resolve({ lat, lng, address: data?.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
        } catch { resolve({ lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` }); }
      },
      () => resolve(null),
      { timeout: 8000 },
    );
  });
}

// ─── Static Data ──────────────────────────────────────────────────────────────
const LEAVE_BALANCES = [
  { type: 'Privilege Leave', short: 'PL', balance: 12, used: 3, total: 15, color: '#16a34a', bg: '#f0fdf4' },
  { type: 'Casual Leave',    short: 'CL', balance: 5,  used: 2, total: 7,  color: '#2563eb', bg: '#eff6ff' },
  { type: 'Sick Leave',      short: 'SL', balance: 6,  used: 0, total: 6,  color: '#d97706', bg: '#fffbeb' },
  { type: 'Comp Off',        short: 'CO', balance: 2,  used: 1, total: 3,  color: '#7c3aed', bg: '#f5f3ff' },
];

const RECENT_ACTIVITY = [
  { date: 'Today',    action: 'Checked in',              time: '09:12 AM',                 icon: CheckCircle2, color: '#16a34a' },
  { date: 'Yesterday',action: 'Full Day Present',         time: '09:05 AM – 06:30 PM',      icon: CheckCircle2, color: '#16a34a' },
  { date: 'Mar 20',   action: 'Leave Applied',            time: 'Casual Leave · 1 day',     icon: Calendar,     color: '#2563eb' },
  { date: 'Mar 19',   action: 'Regularization Approved',  time: 'Corrected: 09:00 AM',      icon: CheckCircle2, color: '#10b981' },
  { date: 'Mar 18',   action: 'Comp Off Credited',        time: '+1 day (Weekend work)',    icon: Gift,         color: '#7c3aed' },
];

const QUICK_ACTIONS = [
  { label: 'Apply Leave',   icon: Calendar,  href: '/employee/attendance/leave',      color: '#2563eb', bg: '#eff6ff',  desc: 'Request time off'    },
  { label: 'Regularize',   icon: RotateCcw, href: '/employee/attendance/regularize', color: '#d97706', bg: '#fffbeb',  desc: 'Fix missed punches'  },
  { label: 'Claim Comp Off',icon: Gift,      href: '/employee/attendance/compoff',    color: '#7c3aed', bg: '#f5f3ff',  desc: 'Claim overtime'      },
  { label: 'View History',  icon: Activity,  href: '/employee/attendance/history',    color: '#0891b2', bg: '#ecfeff',  desc: 'Full attendance log' },
];

const MONTHLY_STATS = [
  { label: 'Present', value: 18, icon: CheckCircle2, color: '#16a34a', sub: '18 / 22 days' },
  { label: 'On Leave', value: 2,  icon: Calendar,     color: '#2563eb', sub: '2 days taken' },
  { label: 'Late',    value: 1,  icon: AlertCircle,  color: '#d97706', sub: '1 occurrence'  },
  { label: 'WFH',     value: 3,  icon: Coffee,       color: '#6366f1', sub: '3 days remote' },
];

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function EmployeeDashboard({ employee, apiKey, token }: { employee: any; apiKey: string; token: string }) {
  const fullName    = `${employee?.first_name ?? ''} ${employee?.last_name ?? ''}`.trim() || 'Employee';
  const employeeId  = employee?.employee_code ?? '';
  const designation = employee?.designation?.name ?? '';
  const location    = employee?.city ?? employee?.country ?? '';

  return (
    <div className="min-h-screen ">
      <div className=" px-3 py-4 sm:px-5 sm:py-5 lg:px-8 lg:py-6">

        {/* ── Check In/Out ── */}
        <CheckInOutCard 
          apiKey={apiKey} 
          token={token} 
          fullName={fullName} 
          employeeId={employeeId} 
          designation={designation} 
          defaultLocation={location}
        />

        {/* ── Top Stats Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          {[
            { label: 'Attendance Rate', value: '92%', sub: '+2% vs last month', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', bar: 92 },
            { label: 'Days Present',    value: '18',  sub: '22 working days',   icon: Award,      color: 'text-blue-600',    bg: 'bg-blue-50',    bar: null },
            { label: 'Hours Worked',    value: '168', sub: '8.4 hrs/day avg',   icon: Clock,      color: 'text-amber-600',   bg: 'bg-amber-50',   bar: null },
            { label: 'Team Members',    value: '12',  sub: '3 on leave today',  icon: Users,      color: 'text-violet-600',  bg: 'bg-violet-50',  bar: null },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center`}>
                  <s.icon size={16} className={s.color}/>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-tight">{s.label}</p>
              <p className="text-[10px] text-slate-400 mt-1">{s.sub}</p>
              {s.bar && <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full bg-emerald-500 rounded-full`} style={{width:`${s.bar}%`}}/></div>}
            </div>
          ))}
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">

          {/* Left col (spans 2) */}
          <div className="xl:col-span-2 space-y-4">

            {/* Monthly Stats */}
            <div className="bg-white rounded-xl border border-slate-100 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">March 2026</h3>
                  <p className="text-xs text-slate-400">Monthly overview</p>
                </div>
                <Link href="/employee/attendance/monthly" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">Full view <ArrowRight size={12}/></Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {MONTHLY_STATS.map((s) => (
                  <div key={s.label} className="flex flex-col items-center py-3 px-2 rounded-xl bg-slate-50 border border-slate-100">
                    <s.icon size={18} style={{color: s.color}} className="mb-1.5"/>
                    <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{s.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-slate-100 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800">Quick Actions</h3>
                <Link href="/employee/actions" className="text-xs font-semibold text-blue-600 hover:underline">View all</Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {QUICK_ACTIONS.map((a) => (
                  <Link key={a.label} href={a.href} className="group flex flex-col items-center gap-2 py-3.5 px-2 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all text-center">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" style={{backgroundColor: a.bg}}>
                      <a.icon size={18} style={{color: a.color}}/>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700 leading-tight">{a.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-tight hidden sm:block">{a.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Leave Balances */}
            <div className="bg-white rounded-xl border border-slate-100 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Leave Balances</h3>
                  <p className="text-xs text-slate-400">Annual · 2026</p>
                </div>
                <Link href="/employee/attendance/leave" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">Apply <ArrowRight size={12}/></Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LEAVE_BALANCES.map((l) => (
                  <div key={l.type} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0" style={{backgroundColor: l.bg, color: l.color}}>{l.short}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-semibold text-slate-700 truncate">{l.type}</p>
                        <span className="text-xs font-bold ml-2 flex-shrink-0" style={{color: l.color}}>{l.balance}d</span>
                      </div>
                      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{width:`${(l.balance/l.total)*100}%`, backgroundColor: l.color}}/>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">{l.used} of {l.total} used</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right col */}
          <div className="space-y-4">

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-slate-100 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800">Recent Activity</h3>
                <Link href="/employee/attendance/history" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">All <ArrowRight size={12}/></Link>
              </div>
              <div className="space-y-0.5">
                {RECENT_ACTIVITY.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 px-2 py-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-50 mt-0.5">
                      <item.icon size={14} style={{color: item.color}}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{item.action}</p>
                      <p className="text-[11px] text-slate-400">{item.time}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 flex-shrink-0 pt-0.5">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="bg-white rounded-xl border border-amber-100 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Bell size={14} className="text-amber-500"/>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Pending</h3>
                  <p className="text-[10px] text-slate-400">Awaiting manager review</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {[
                  { title: 'Casual Leave', sub: 'Mar 25, 2026 · 1 day', note: 'Submitted 2 days ago', icon: Calendar, color: '#2563eb', bg: '#eff6ff', actions: true },
                  { title: 'Comp Off Claim', sub: 'Weekend · Mar 22',   note: 'Pending review',       icon: Gift,     color: '#7c3aed', bg: '#f5f3ff', actions: false },
                ].map((item) => (
                  <div key={item.title} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{backgroundColor: item.bg}}>
                      <item.icon size={15} style={{color: item.color}}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700">{item.title}</p>
                      <p className="text-[10px] text-slate-400">{item.sub}</p>
                      <p className="text-[10px] text-amber-500 font-medium">{item.note}</p>
                    </div>
                    {item.actions && (
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button className="w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center hover:bg-emerald-100 transition-colors"><Check size={12} className="text-emerald-600"/></button>
                        <button className="w-6 h-6 bg-red-50 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors"><X size={12} className="text-red-500"/></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}