'use client';

import React, { useEffect, useState } from 'react';
import {
  Users, UserCheck, UserX, Clock, AlertTriangle,
  CheckCircle, TrendingUp, TrendingDown, Plus, ThumbsUp,
  Building2, Calendar, ArrowRight, Activity, RefreshCw,
  BarChart2, Zap,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

interface DashboardStats {
  totalEmployees: number;
  activeToday: number;
  onLeave: number;
  lateToday: number;
  pendingRegularizations: number;
  missingCheckout: number;
  overtimeFlagged: number;
  weeklyTrend: { day: string; present: number; absent: number }[];
  deptAttendance: { dept: string; rate: number }[];
  recentActivity: { id: string; action: string; name: string; dept: string; time: string; type: string }[];
}

/* ── Custom chart tooltip ── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs shadow-xl">
      <p className="text-slate-400 uppercase tracking-widest text-[10px] font-semibold mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="font-semibold my-0.5" style={{ color: p.color }}>
          <span className="text-slate-400 font-normal">{p.name}: </span>{p.value}
        </p>
      ))}
    </div>
  );
};

/* ── Skeleton card ── */
const SkeletonCard = () => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse">
    <div className="w-10 h-10 rounded-xl bg-slate-100 mb-4" />
    <div className="h-7 w-14 bg-slate-100 rounded-md mb-2" />
    <div className="h-3 w-24 bg-slate-100 rounded" />
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(r => setTimeout(r, 600));
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weeklyTrend = days.map(day => ({
        day,
        present: Math.floor(Math.random() * 3),
        absent: Math.floor(Math.random() * 2),
      }));
      setStats({
        totalEmployees: 3,
        activeToday: 3,
        onLeave: 0,
        lateToday: 0,
        pendingRegularizations: 0,
        missingCheckout: 0,
        overtimeFlagged: 0,
        weeklyTrend,
        deptAttendance: [
          { dept: 'Engineering', rate: 100 },
          { dept: 'Operations', rate: 85 },
          { dept: 'Management', rate: 92 },
        ],
        recentActivity: [
          { id: '1', action: 'Admin role granted', name: 'Arjun Mehta', dept: 'Management', time: 'just now', type: 'add' },
          { id: '2', action: 'Employee onboarded', name: 'Rahul Sharma', dept: 'Operations', time: '1 day ago', type: 'add' },
          { id: '3', action: 'Account created', name: 'Ananya Krishnan', dept: 'Engineering', time: '2 days ago', type: 'add' },
        ],
      });
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-sm text-slate-400 mt-0.5">{today}</p>
          </div>
          <span className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3.5 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Loading…
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-10 flex flex-col items-center gap-3 shadow-sm max-w-sm w-full text-center">
          <AlertTriangle size={36} className="text-red-500 mb-1" />
          <p className="font-bold text-slate-900">Failed to load dashboard</p>
          <p className="text-sm text-slate-400">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 active:scale-95 px-5 py-2 rounded-xl transition-all mt-2"
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const s = stats!;
  const attendanceRate = s.totalEmployees > 0
    ? Math.round((s.activeToday / s.totalEmployees) * 100)
    : 0;
  const leaveRate = s.totalEmployees > 0
    ? Math.round((s.onLeave / s.totalEmployees) * 100)
    : 0;
  const totalAlerts = s.missingCheckout + s.pendingRegularizations + s.lateToday + s.overtimeFlagged;

  const STAT_CARDS = [
    {
      label: 'Total Employees',
      value: s.totalEmployees,
      sub: 'All active staff',
      icon: Users,
      iconCls: 'text-indigo-500',
      bgCls: 'bg-indigo-50',
      trend: null,
    },
    {
      label: 'Active Today',
      value: s.activeToday,
      sub: `${attendanceRate}% attendance`,
      icon: UserCheck,
      iconCls: 'text-emerald-500',
      bgCls: 'bg-emerald-50',
      trend: 'up' as const,
    },
    {
      label: 'On Leave',
      value: s.onLeave,
      sub: `${leaveRate}% of workforce`,
      icon: UserX,
      iconCls: 'text-amber-500',
      bgCls: 'bg-amber-50',
      trend: s.onLeave > 0 ? 'down' as const : null,
    },
    {
      label: 'Late Arrivals',
      value: s.lateToday,
      sub: 'Today',
      icon: Clock,
      iconCls: 'text-red-500',
      bgCls: 'bg-red-50',
      trend: s.lateToday > 0 ? 'down' as const : null,
    },
  ];

  const ALERTS = [
    { id: 1, icon: AlertTriangle, iconCls: 'text-amber-500', bgCls: 'bg-amber-50', label: 'Missing punch-out', count: s.missingCheckout, sub: 'Needs attention' },
    { id: 2, icon: Clock, iconCls: 'text-indigo-500', bgCls: 'bg-indigo-50', label: 'Regularization pending', count: s.pendingRegularizations, sub: 'Awaiting action' },
    { id: 3, icon: TrendingDown, iconCls: 'text-red-500', bgCls: 'bg-red-50', label: 'Late arrivals today', count: s.lateToday, sub: 'Before shift start' },
    { id: 4, icon: TrendingUp, iconCls: 'text-violet-500', bgCls: 'bg-violet-50', label: 'Overtime flagged', count: s.overtimeFlagged, sub: 'This week' },
  ];

  const QUICK_ACTIONS = [
    { label: 'Add Employee', icon: Users, href: '/admin/employees', iconCls: 'text-indigo-500', bgCls: 'bg-indigo-50' },
    { label: 'Approve Leave', icon: CheckCircle, href: '/admin/attendance', iconCls: 'text-emerald-500', bgCls: 'bg-emerald-50' },
    { label: 'Run Payroll', icon: Calendar, href: '/admin/payroll', iconCls: 'text-violet-500', bgCls: 'bg-violet-50' },
    { label: 'View Reports', icon: BarChart2, href: '/admin/analytics', iconCls: 'text-amber-500', bgCls: 'bg-amber-50' },
  ];

  const getDeptClasses = (rate: number) => {
    if (rate >= 90) return { bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700' };
    if (rate >= 75) return { bar: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700' };
    return { bar: 'bg-red-500', badge: 'bg-red-50 text-red-700' };
  };

  return (
    <div className="min-h-screen p-2 space-y-4 sm:space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start sm:items-center justify-between flex-wrap gap-3 pb-1">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-medium truncate">
            {today} · Workforce overview
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw size={12} />
            <span className="hidden xs:inline">Refresh</span>
          </button>
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ boxShadow: '0 0 0 2px #a7f3d0' }} />
            Live
          </span>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {STAT_CARDS.map(card => (
          <div
            key={card.label}
            className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Icon + trend row */}
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${card.bgCls} flex items-center justify-center flex-shrink-0`}>
                <card.icon size={18} className={card.iconCls} />
              </div>
              {card.trend ? (
                <span className={`flex items-center gap-1 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  card.trend === 'up'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-red-50 text-red-500'
                }`}>
                  {card.trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  <span className="hidden sm:inline">{card.trend === 'up' ? 'Good' : 'Flag'}</span>
                </span>
              ) : (
                <div className="w-5" /> /* spacer so icon stays left-aligned */
              )}
            </div>
            {/* Value */}
            <p className="text-3xl sm:text-4xl font-black text-slate-900 leading-none tracking-tight">
              {card.value}
            </p>
            {/* Label */}
            <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-1.5 leading-tight">
              {card.label}
            </p>
            {/* Sub */}
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5">
              {card.sub}
            </p>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Weekly Attendance Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm xl:col-span-2">
          {/* Card header */}
          <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
            <div className="min-w-0">
              <p className="text-sm sm:text-[15px] font-bold text-slate-900 leading-tight">Weekly Attendance</p>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Present vs Absent · This week</p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 flex-shrink-0" />
                Present
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 flex-shrink-0" />
                Absent
              </span>
            </div>
          </div>

          {s.weeklyTrend.every(d => d.present === 0 && d.absent === 0) ? (
            <div className="flex flex-col items-center justify-center h-44 text-slate-300">
              <Activity size={28} className="mb-2" />
              <p className="text-sm font-medium text-slate-400">No attendance data this week</p>
            </div>
          ) : (
            <div className="h-44 sm:h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={s.weeklyTrend} barSize={20} barGap={3} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                  <Bar dataKey="present" fill="#6366f1" radius={[5, 5, 0, 0]} name="Present" />
                  <Bar dataKey="absent" fill="#fbbf24" radius={[5, 5, 0, 0]} name="Absent" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Dept Attendance */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-sm sm:text-[15px] font-bold text-slate-900 leading-tight">By Department</p>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Attendance rate today</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Building2 size={15} className="text-slate-500" />
            </div>
          </div>

          {s.deptAttendance.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-300">
              <Building2 size={24} className="mb-2" />
              <p className="text-sm text-slate-400">No department data</p>
            </div>
          ) : (
            <div className="space-y-4">
              {s.deptAttendance.map(d => {
                const c = getDeptClasses(d.rate);
                return (
                  <div key={d.dept}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate mr-2">{d.dept}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${c.badge}`}>
                        {d.rate}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${c.bar}`}
                        style={{ width: `${d.rate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Alerts + Activity ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Alerts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-start justify-between mb-4 gap-3">
            <div>
              <p className="text-sm sm:text-[15px] font-bold text-slate-900 leading-tight">Alerts & Exceptions</p>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Items requiring attention</p>
            </div>
            {totalAlerts > 0 && (
              <span className="flex-shrink-0 text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">
                {totalAlerts}
              </span>
            )}
          </div>
          <div className="space-y-2">
            {ALERTS.map(alert => (
              <div
                key={alert.id}
                className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer group"
              >
                <div className={`w-9 h-9 rounded-xl ${alert.bgCls} flex items-center justify-center flex-shrink-0`}>
                  <alert.icon size={15} className={alert.iconCls} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight">{alert.label}</p>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">{alert.sub}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-lg sm:text-xl font-black leading-none ${alert.count > 0 ? alert.iconCls : 'text-slate-200'}`}>
                    {alert.count}
                  </span>
                  <ArrowRight size={13} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-start justify-between mb-4 gap-3">
            <div>
              <p className="text-sm sm:text-[15px] font-bold text-slate-900 leading-tight">Recent Activity</p>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Latest system events</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Zap size={15} className="text-slate-500" />
            </div>
          </div>

          {s.recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-300">
              <Activity size={24} className="mb-2" />
              <p className="text-sm text-slate-400">No recent activity</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {s.recentActivity.map(item => (
                <div key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    item.type === 'add' ? 'bg-emerald-50' :
                    item.type === 'approve' ? 'bg-blue-50' : 'bg-amber-50'
                  }`}>
                    {item.type === 'add'
                      ? <Plus size={13} className="text-emerald-500" />
                      : item.type === 'approve'
                      ? <ThumbsUp size={13} className="text-blue-500" />
                      : <CheckCircle size={13} className="text-amber-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight">{item.action}</p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="text-xs text-slate-500">{item.name}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                        {item.dept}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium flex-shrink-0 whitespace-nowrap pt-0.5">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="mb-4">
          <p className="text-sm sm:text-[15px] font-bold text-slate-900 leading-tight">Quick Actions</p>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Common tasks at a glance</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(action => (
            <a
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-2.5 p-4 sm:p-5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer group no-underline"
            >
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${action.bgCls} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <action.icon size={20} className={action.iconCls} />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-slate-800 text-center leading-tight">
                {action.label}
              </span>
              <span className="text-[10px] text-slate-400">Go to module</span>
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}