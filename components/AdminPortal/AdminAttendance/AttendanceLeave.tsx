'use client';

import { useState } from 'react';
import {
  Plus, CheckCircle2, XCircle, Clock3, CalendarDays,
  ChevronRight, Palmtree, Stethoscope, Coffee, Baby,
  Heart, RefreshCw, ArrowUpRight, Users, Calendar,
  Filter, Search,
} from 'lucide-react';

// ── Data ──────────────────────────────────────────────────────────
const LEAVE_TYPES = [
  { type: 'Annual Leave',      days: 18,  carry: true,  encash: true,  icon: Palmtree,   color: 'text-teal-600', bg: 'bg-teal-50' },
  { type: 'Sick Leave',        days: 12,  carry: false, encash: false, icon: Stethoscope, color: 'text-rose-500',    bg: 'bg-rose-50' },
  { type: 'Casual Leave',      days: 6,   carry: false, encash: false, icon: Coffee,      color: 'text-amber-500',   bg: 'bg-amber-50' },
  { type: 'Maternity Leave',   days: 180, carry: false, encash: false, icon: Baby,        color: 'text-pink-500',    bg: 'bg-pink-50' },
  { type: 'Paternity Leave',   days: 15,  carry: false, encash: false, icon: Heart,       color: 'text-violet-500',  bg: 'bg-violet-50' },
  { type: 'Compensatory Off',  days: 0,   carry: true,  encash: true,  icon: RefreshCw,   color: 'text-blue-500',    bg: 'bg-blue-50' },
];

const LEAVE_REQUESTS = [
  { id: 1, name: 'Rohit Gupta',     type: 'Annual Leave',  from: '22 Mar', to: '24 Mar', days: 3, status: 'pending',  reason: 'Family vacation',    avatar: 'RG', color: 'bg-teal-500' },
  { id: 2, name: 'Sneha Reddy',     type: 'Sick Leave',    from: '18 Mar', to: '21 Mar', days: 4, status: 'approved', reason: 'Medical treatment',   avatar: 'SR', color: 'bg-rose-500' },
  { id: 3, name: 'Kavya Menon',     type: 'Casual Leave',  from: '25 Mar', to: '25 Mar', days: 1, status: 'pending',  reason: 'Personal work',       avatar: 'KM', color: 'bg-amber-500' },
  { id: 4, name: 'Arjun Mehta',     type: 'Annual Leave',  from: '01 Apr', to: '03 Apr', days: 3, status: 'rejected', reason: 'Travel plans',        avatar: 'AM', color: 'bg-indigo-500' },
];

const EMPLOYEES = [
  { name: 'Rahul Sharma',   annual: [13, 18], sick: [10, 12], casual: [5, 6],  avatar: 'RS', color: 'bg-teal-500' },
  { name: 'Priya Nair',     annual: [8,  18], sick: [12, 12], casual: [4, 6],  avatar: 'PN', color: 'bg-violet-500' },
  { name: 'Ananya Krishnan',annual: [16, 18], sick: [11, 12], casual: [6, 6],  avatar: 'AK', color: 'bg-rose-500' },
  { name: 'Vikram Patel',   annual: [17, 18], sick: [12, 12], casual: [5, 6],  avatar: 'VP', color: 'bg-amber-500' },
];

const HOLIDAYS = [
  { date: '26 Jan', month: 'JAN', name: 'Republic Day',          type: 'National', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { date: '14 Mar', month: 'MAR', name: 'Holi',                  type: 'Festival', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  { date: '14 Apr', month: 'APR', name: 'Dr. Ambedkar Jayanti',  type: 'National', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { date: '15 Aug', month: 'AUG', name: 'Independence Day',      type: 'National', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { date: '02 Oct', month: 'OCT', name: 'Gandhi Jayanti',        type: 'National', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { date: '20 Oct', month: 'OCT', name: 'Dussehra',              type: 'Festival', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  { date: '01 Nov', month: 'NOV', name: 'Diwali',                type: 'Festival', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  { date: '25 Dec', month: 'DEC', name: 'Christmas',             type: 'Festival', color: 'bg-amber-50 text-amber-700 border-amber-100' },
];

const TABS = ['Requests', 'Leave Types', 'Balances', 'Holidays'] as const;
type Tab = typeof TABS[number];

// ── Helpers ───────────────────────────────────────────────────────
const statusConfig = {
  pending:  { label: 'Pending',  cls: 'bg-amber-50 text-amber-700 border border-amber-200',   dot: 'bg-amber-400',  icon: Clock3 },
  approved: { label: 'Approved', cls: 'bg-teal-50 text-teal-700 border border-teal-200', dot: 'bg-teal-400', icon: CheckCircle2 },
  rejected: { label: 'Rejected', cls: 'bg-red-50 text-red-600 border border-red-200',         dot: 'bg-red-400',    icon: XCircle },
};

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const trackColor = pct >= 90 ? 'bg-red-100' : pct >= 70 ? 'bg-amber-100' : 'bg-slate-100';
  const fillColor = pct >= 90 ? 'bg-red-400' : pct >= 70 ? 'bg-amber-400' : color;
  return (
    <div className={`h-1.5 w-full rounded-full ${trackColor} overflow-hidden`}>
      <div className={`h-full rounded-full transition-all duration-500 ${fillColor}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ── Summary strip ─────────────────────────────────────────────────
function SummaryStrip() {
  const pending  = LEAVE_REQUESTS.filter(r => r.status === 'pending').length;
  const approved = LEAVE_REQUESTS.filter(r => r.status === 'approved').length;
  const total    = LEAVE_REQUESTS.length;
  const cards = [
    { label: 'Total Requests', value: total,    icon: CalendarDays,  bg: 'bg-indigo-50',  text: 'text-indigo-600' },
    { label: 'Pending',        value: pending,  icon: Clock3,        bg: 'bg-amber-50',   text: 'text-amber-600' },
    { label: 'Approved',       value: approved, icon: CheckCircle2,  bg: 'bg-teal-50', text: 'text-teal-600' },
    { label: 'Holidays 2026',  value: HOLIDAYS.length, icon: Calendar, bg: 'bg-blue-50',  text: 'text-blue-600' },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map(c => (
        <div key={c.label} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-all">
          <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
            <c.icon size={18} className={c.text} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{c.value}</p>
            <p className="text-xs text-slate-500 font-medium">{c.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Requests Tab ─────────────────────────────────────────────────
function RequestsTab() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Leave Requests</h3>
          <p className="text-xs text-slate-400 mt-0.5">{LEAVE_REQUESTS.length} total · {LEAVE_REQUESTS.filter(r => r.status === 'pending').length} awaiting</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-lg transition-colors">
            <Filter size={12} /> Filter
          </button>
          <button className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-lg transition-colors">
            <Search size={12} /> Search
          </button>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100">
        {LEAVE_REQUESTS.map(req => {
          const sc = statusConfig[req.status as keyof typeof statusConfig];
          return (
            <div key={req.id} className="group px-4 py-4 hover:bg-slate-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex items-start gap-3 flex-1">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-lg ${req.color} flex items-center justify-center flex-shrink-0 text-white text-xs font-bold shadow-sm`}>
                    {req.avatar}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-slate-900">{req.name}</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${sc.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-1.5">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                        <CalendarDays size={12} /> {req.type}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md">
                        {req.from} – {req.to}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded-md">
                        {req.days}d
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-2">"{req.reason}"</p>
                  </div>
                </div>

                {/* Actions */}
                {req.status === 'pending' && (
                  <div className="flex sm:flex-col gap-2 mt-3 sm:mt-0">
                    <button className="flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-[#0f766e] hover:bg-teal-700 px-3 py-2 rounded-lg transition-all">
                      <CheckCircle2 size={13} /> Approve
                    </button>
                    <button className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-all">
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Leave Types Tab ───────────────────────────────────────────────
function LeaveTypesTab() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Leave Types</h3>
          <p className="text-xs text-slate-400 mt-0.5">{LEAVE_TYPES.length} types configured</p>
        </div>
        <button className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0f766e] hover:bg-teal-700 rounded-lg transition-all shadow-sm">
          <Plus size={13} /> Add Type
        </button>
      </div>

      {/* Mobile view - Grid */}
      <div className="sm:hidden divide-y divide-slate-100">
        {LEAVE_TYPES.map(lt => (
          <div key={lt.type} className="px-4 py-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${lt.bg} flex items-center justify-center flex-shrink-0`}>
                <lt.icon size={16} className={lt.color} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{lt.type}</p>
                <p className="text-xs text-slate-500 mt-0.5">{lt.days === 0 ? 'As earned' : `${lt.days} days/year`}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3 ml-13">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${lt.carry ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>
                {lt.carry ? 'Carry Forward ✓' : 'No carry'}
              </span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${lt.encash ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                {lt.encash ? 'Encashable ✓' : 'No encash'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['Leave Type', 'Days / Year', 'Carry Forward', 'Encashable', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {LEAVE_TYPES.map(lt => (
              <tr key={lt.type} className="group hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${lt.bg} flex items-center justify-center`}>
                      <lt.icon size={14} className={lt.color} />
                    </div>
                    <span className="text-sm font-semibold text-slate-800">{lt.type}</span>
                  </div>
                 </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-semibold text-slate-900">
                    {lt.days === 0 ? '—' : lt.days}
                  </span>
                  {lt.days > 0 && <span className="text-xs text-slate-400 ml-1">days</span>}
                 </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${lt.carry ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-400'}`}>
                    {lt.carry && <CheckCircle2 size={11} />} {lt.carry ? 'Yes' : 'No'}
                  </span>
                 </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${lt.encash ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                    {lt.encash && <CheckCircle2 size={11} />} {lt.encash ? 'Yes' : 'No'}
                  </span>
                 </td>
                <td className="px-4 py-3">
                  <button className="opacity-0 group-hover:opacity-100 text-xs font-medium text-slate-400 hover:text-teal-600 flex items-center gap-1 transition-all">
                    Edit <ChevronRight size={12} />
                  </button>
                 </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Balances Tab ──────────────────────────────────────────────────
function BalancesTab() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Leave Balances</h3>
          <p className="text-xs text-slate-400 mt-0.5">{EMPLOYEES.length} employees · Current year</p>
        </div>
        <button className="self-start sm:self-auto flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-lg transition-colors">
          <Users size={12} /> All Employees
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {EMPLOYEES.map(emp => (
          <div key={emp.name} className="px-4 py-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-lg ${emp.color} text-white text-xs font-bold flex items-center justify-center`}>
                {emp.avatar}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{emp.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {emp.annual[0] + emp.sick[0] + emp.casual[0]} days used
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Annual', used: emp.annual[0], total: emp.annual[1], color: 'bg-teal-500' },
                { label: 'Sick',   used: emp.sick[0],   total: emp.sick[1],   color: 'bg-rose-400' },
                { label: 'Casual', used: emp.casual[0], total: emp.casual[1], color: 'bg-amber-400' },
              ].map(b => (
                <div key={b.label} className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600">{b.label}</span>
                    <span className="text-xs font-bold text-slate-900">{b.used}<span className="text-slate-400">/{b.total}</span></span>
                  </div>
                  <ProgressBar value={b.used} max={b.total} color={b.color} />
                  <p className="text-xs text-slate-400 mt-1.5">{b.total - b.used} remaining</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Holidays Tab ──────────────────────────────────────────────────
function HolidaysTab() {
  const national = HOLIDAYS.filter(h => h.type === 'National');
  const festival = HOLIDAYS.filter(h => h.type === 'Festival');

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Holiday Calendar 2026</h3>
            <p className="text-xs text-slate-400 mt-0.5">{HOLIDAYS.length} holidays · {national.length} national · {festival.length} festivals</p>
          </div>
          <button className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0f766e] hover:bg-teal-700 rounded-lg transition-all shadow-sm">
            <Plus size={13} /> Add Holiday
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {HOLIDAYS.map(h => (
            <div key={h.date + h.name} className="group flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
              <div className="min-w-[50px] text-center">
                <p className="text-xs font-bold text-slate-400 uppercase">{h.month}</p>
                <p className="text-lg font-bold text-slate-900 leading-tight">{h.date.split(' ')[0]}</p>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="flex-1 text-sm font-semibold text-slate-800">{h.name}</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${h.color}`}>
                {h.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function AttendanceLeave() {
  const [subTab, setSubTab] = useState<Tab>('Requests');

  return (
    <div className="min-h-screen">
      <div className="space-y-4 p-3 sm:p-4 lg:p-6">
        {/* Page header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Leave Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Requests, balances, types and holidays</p>
        </div>

        {/* Summary strip */}
        <SummaryStrip />

        {/* Tabs - No scroll, grid layout on mobile */}
        <div className="grid grid-cols-2 sm:flex sm:gap-2 gap-2">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setSubTab(t)}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                subTab === t
                  ? 'bg-[#0f766e] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-teal-200 hover:text-teal-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {subTab === 'Requests'    && <RequestsTab />}
        {subTab === 'Leave Types' && <LeaveTypesTab />}
        {subTab === 'Balances'    && <BalancesTab />}
        {subTab === 'Holidays'    && <HolidaysTab />}
      </div>
    </div>
  );
}