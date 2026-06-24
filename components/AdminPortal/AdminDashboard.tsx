'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Plus,
  ThumbsUp,
  Building2,
  Calendar,
  ArrowRight,
  Activity,
  RefreshCw,
  BarChart2,
  Zap,
  Home,
  LogIn,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  getAdminStats,
  getAdminWeeklyChart,
  getDepartmentStats,
  IAdminStats,
  IAdminWeeklyChart,
  IDepartmentStatsResponse,
  IWeeklyChartDay,
} from '../../lib/service/adminDashboard';

/* ── Custom chart tooltip ── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs shadow-xl">
      <p className="text-slate-400 uppercase tracking-widest text-[10px] font-semibold mb-1.5">
        {label}
      </p>
      {payload.map((p: any) => (
        <p
          key={p.dataKey}
          className="font-semibold my-0.5"
          style={{ color: p.color }}
        >
          <span className="text-slate-400 font-normal">
            {p.name}
            {': '}
          </span>
          {p.value}
        </p>
      ))}
    </div>
  );
};

const getDeptClasses = (rate: number) => {
  if (rate >= 80) return { bar: 'bg-teal-600', badge: 'bg-teal-50 text-teal-700' };
  if (rate >= 60) return { bar: 'bg-amber-300', badge: 'bg-amber-50 text-amber-700' };
  return { bar: 'bg-red-400', badge: 'bg-red-50 text-red-700' };
};

/* ── Loading skeleton ── */
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-slate-50 p-2 space-y-4 sm:space-y-5">
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div>
        <div className="h-7 sm:h-8 w-32 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-4 w-48 bg-slate-200 rounded-md mt-2 animate-pulse" />
      </div>
      <div className="h-8 w-24 bg-slate-200 rounded-full animate-pulse" />
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-7 w-16 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-20 bg-slate-200 rounded mt-1.5 animate-pulse" />
              <div className="h-2 w-24 bg-slate-200 rounded mt-1.5 animate-pulse" />
            </div>
            <div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse" />
          </div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 xl:col-span-2">
        <div className="h-5 w-40 bg-slate-200 rounded animate-pulse mb-1" />
        <div className="h-3 w-56 bg-slate-200 rounded animate-pulse mb-4" />
        <div className="h-[220px] w-full bg-slate-100 rounded-lg animate-pulse" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
        <div className="h-5 w-32 bg-slate-200 rounded animate-pulse mb-4" />
        <div className="space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-3 w-full bg-slate-200 rounded animate-pulse mb-2" />
              <div className="h-1.5 w-full bg-slate-100 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const QUICK_ACTIONS = [
  {
    label: 'Add Employee',
    icon: Users,
    href: '/employee/registry',
    iconCls: 'text-indigo-500',
    bgCls: 'bg-indigo-50',
  },
  {
    label: 'Approve Leave',
    icon: CheckCircle,
    href: '/attendance/leave',
    iconCls: 'text-emerald-500',
    bgCls: 'bg-emerald-50',
  },
  // {
  //   label: 'Run Payroll',
  //   icon: Calendar,
  //   href: '/admin/payroll',
  //   iconCls: 'text-violet-500',
  //   bgCls: 'bg-violet-50',
  // },
  {
    label: 'View Reports',
    icon: BarChart2,
    href: '/reports',
    iconCls: 'text-amber-500',
    bgCls: 'bg-amber-50',
  },
];

export default function AdminDashboard() {
  const { subdomain } = useParams<{ subdomain: string }>();

  const [adminStats, setAdminStats] = useState<IAdminStats | null>(null);
  const [weeklyChart, setWeeklyChart] = useState<IAdminWeeklyChart | null>(null);
  const [deptStats, setDeptStats] = useState<IDepartmentStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, chartRes, deptRes] = await Promise.all([
        getAdminStats(subdomain),
        getAdminWeeklyChart(subdomain),
        getDepartmentStats(subdomain, { mode: 'today' }),
      ]);

      setAdminStats(statsRes?.data?.data ?? statsRes?.data ?? null);
      setWeeklyChart(chartRes?.data?.data ?? chartRes?.data ?? null);
      setDeptStats(deptRes?.data?.data ?? deptRes?.data ?? null);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [subdomain]);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-10 flex flex-col items-center gap-3 shadow-sm max-w-sm w-full text-center">
          <AlertTriangle size={36} className="text-red-500 mb-1" />
          <p className="font-bold text-slate-900">Failed to load dashboard</p>
          <p className="text-sm text-slate-400">{error}</p>
          <button
            onClick={fetchAll}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 active:scale-95 px-5 py-2 rounded-xl transition-all mt-2"
          >
            <RefreshCw size={13} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ── Derived values ── */
  const s = adminStats!;
  const w = weeklyChart!;
  const d = deptStats!;

  const asOfTime = s?.as_of
    ? new Date(s.as_of).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : null;

  // Map weekly chart data → { day, present, absent } for Recharts
  const chartData = (w?.chart ?? []).map((item: IWeeklyChartDay) => ({
    day: item.day,
    displayDate: item.display_date,
    present: item.present_count,
    absent: item.absent_count,
    notMarked: item.not_marked,
    pct: item.attendance_percentage,
  }));

  const STAT_CARDS = [
    {
      label: 'Total Employees',
      value: s?.total_employees ?? 0,
      sub: 'All active staff',
      icon: Users,
      iconCls: 'text-indigo-500',
      bgCls: 'bg-indigo-50',
    },
    {
      label: 'Present Today',
      value: s?.present_today ?? 0,
      sub: `${s?.attendance_percentage ?? 0}% attendance`,
      icon: UserCheck,
      iconCls: 'text-emerald-500',
      bgCls: 'bg-emerald-50',
    },
    {
      label: 'On Leave',
      value: s?.on_leave ?? 0,
      sub: `${s?.absent_today ?? 0} absent today`,
      icon: UserX,
      iconCls: 'text-amber-500',
      bgCls: 'bg-amber-50',
    },
    {
      label: 'Late Check-ins',
      value: s?.late_check_ins ?? 0,
      sub: 'Today',
      icon: Clock,
      iconCls: 'text-red-500',
      bgCls: 'bg-red-50',
    },
  ];

  const ALERTS = [
    {
      id: 1,
      icon: Home,
      iconCls: 'text-sky-500',
      bgCls: 'bg-sky-50',
      label: 'Work From Home',
      count: s?.work_from_home ?? 0,
      sub: 'Active today',
    },
    {
      id: 2,
      icon: LogIn,
      iconCls: 'text-violet-500',
      bgCls: 'bg-violet-50',
      label: 'Not Checked In Yet',
      count: s?.not_checked_in_yet ?? 0,
      sub: 'Expected today',
    },
    {
      id: 3,
      icon: TrendingDown,
      iconCls: 'text-red-500',
      bgCls: 'bg-red-50',
      label: 'Absent Today',
      count: s?.absent_today ?? 0,
      sub: 'Unplanned absence',
    },
    
  ];

  const totalAlerts = (s?.work_from_home ?? 0) + (s?.not_checked_in_yet ?? 0) + (s?.absent_today ?? 0);

  return (
    <div className="min-h-screen p-2 space-y-4 sm:space-y-5">
      {/* ── Header ── */}
      <div className="flex items-start sm:items-center justify-between flex-wrap gap-3 pb-1">
        <div className="min-w-0">
          <h1 className="text-lg md:text-xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 font-medium truncate">
            {today}
            {asOfTime && (
              <span className="text-slate-400">
                {' '}
                · As of
                {' '}
                {asOfTime}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={fetchAll}
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STAT_CARDS.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-slate-200 rounded-xl p-3 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                <p className="text-xs font-medium text-slate-600 mt-0.5">{card.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{card.sub}</p>
              </div>
              <div className={`w-8 h-8 rounded-lg ${card.bgCls} flex items-center justify-center flex-shrink-0`}>
                <card.icon size={16} className={card.iconCls} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 mt-3">
        {/* Weekly Attendance Chart */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm xl:col-span-2">
          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
              <div>
                <p className="text-sm sm:text-[15px] font-bold text-slate-900">
                  Weekly Attendance
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {w?.period ?? 'This week'}
                  {' '}
                  ·
                  {' '}
                  {w?.avg_attendance_percentage ?? 0}
                  % avg
                </p>
              </div>
              <div className="flex items-center gap-4">
                {w?.best_day && (
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-slate-400 font-medium">Best day</p>
                    <p className="text-xs font-bold text-emerald-600">
                      {w.best_day.day}
                      {' '}
                      ·
                      {' '}
                      {w.best_day.percentage}
                      %
                    </p>
                  </div>
                )}
                {w?.worst_day && (
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-slate-400 font-medium">Worst day</p>
                    <p className="text-xs font-bold text-red-500">
                      {w.worst_day.day}
                      {' '}
                      ·
                      {' '}
                      {w.worst_day.percentage}
                      %
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-sm bg-teal-600" />
                    Present
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
                    Absent
                  </span>
                </div>
              </div>
            </div>

            {chartData.length === 0 || chartData.every((d) => d.present === 0 && d.absent === 0) ? (
              <div className="flex flex-col items-center justify-center h-44 text-slate-300">
                <Activity size={28} className="mb-2" />
                <p className="text-sm text-slate-400">No attendance data this week</p>
              </div>
            ) : (
              <div className="h-44 sm:h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    barSize={20}
                    barGap={3}
                    margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
                  >
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
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: 'rgba(15, 118, 110, 0.05)' }}
                    />
                    <Bar dataKey="present" fill="#0f766e" radius={[5, 5, 0, 0]} name="Present" />
                    <Bar dataKey="absent" fill="#fbbf24" radius={[5, 5, 0, 0]} name="Absent" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Department Attendance */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm sm:text-[15px] font-bold text-slate-900">By Department</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {d?.period ?? 'Today'}
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                <Building2 size={15} className="text-teal-600" />
              </div>
            </div>

            {/* Best / Worst summary */}
            {(d?.best_department || d?.worst_department) && (
              <div className="flex gap-2 mb-4">
                {d.best_department && (
                  <div className="flex-1 bg-teal-50 rounded-lg px-2.5 py-2">
                    <p className="text-[10px] text-teal-600 font-semibold">Best</p>
                    <p className="text-xs font-bold text-teal-800 truncate">{d.best_department.name}</p>
                    <p className="text-[10px] text-teal-600">{d.best_department.percentage}%</p>
                  </div>
                )}
                {d.worst_department && (
                  <div className="flex-1 bg-red-50 rounded-lg px-2.5 py-2">
                    <p className="text-[10px] text-red-500 font-semibold">Needs Attention</p>
                    <p className="text-xs font-bold text-red-800 truncate">{d.worst_department.name}</p>
                    <p className="text-[10px] text-red-500">{d.worst_department.percentage}%</p>
                  </div>
                )}
              </div>
            )}

            {!d?.departments?.length ? (
              <div className="flex flex-col items-center justify-center h-32 text-slate-300">
                <Building2 size={24} className="mb-2" />
                <p className="text-sm text-slate-400">No department data</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
                {d.departments.map((dept) => {
                  const c = getDeptClasses(dept.attendance_percentage);
                  return (
                    <div key={dept.department_id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-slate-800 truncate mr-2">
                          {dept.department_name}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${c.badge}`}>
                          {dept.attendance_percentage}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${c.bar}`}
                          style={{ width: `${dept.attendance_percentage}%` }}
                        />
                      </div>
                      <div className="flex gap-3 mt-1">
                        <span className="text-[10px] text-slate-400">
                          {dept.present}
                          {' '}
                          present
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {dept.absent}
                          {' '}
                          absent
                        </span>
                        {dept.not_marked > 0 && (
                          <span className="text-[10px] text-slate-400">
                            {dept.not_marked}
                            {' '}
                            not marked
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Alerts + Attendance Breakdown ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mt-3">
        {/* Alerts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-start justify-between mb-4 gap-3">
            <div>
              <p className="text-sm sm:text-[15px] font-bold text-slate-900 leading-tight">
                Today&apos;s Breakdown
              </p>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Live workforce snapshot</p>
            </div>
            {totalAlerts > 0 && (
              <span className="flex-shrink-0 text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">
                {totalAlerts}
                {' '}
                flagged
              </span>
            )}
          </div>
          <div className="space-y-2">
            {ALERTS.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer group"
              >
                <div className={`w-9 h-9 rounded-xl ${alert.bgCls} flex items-center justify-center flex-shrink-0`}>
                  <alert.icon size={15} className={alert.iconCls} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight">
                    {alert.label}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">{alert.sub}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-lg sm:text-xl font-black leading-none ${alert.count > 0 ? alert.iconCls : 'text-slate-200'}`}>
                    {alert.count}
                    {'suffix' in alert ? alert.suffix : ''}
                  </span>
                  <ArrowRight size={13} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly summary cards */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-start justify-between mb-4 gap-3">
            <div>
              <p className="text-sm sm:text-[15px] font-bold text-slate-900 leading-tight">
                Weekly Summary
              </p>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                {w?.period ?? 'This week'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Zap size={15} className="text-slate-500" />
            </div>
          </div>

          {!w?.chart?.length ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-300">
              <Activity size={24} className="mb-2" />
              <p className="text-sm text-slate-400">No weekly data</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {w.chart.map((item: IWeeklyChartDay) => (
                <div key={item.date} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  {/* Day badge */}
                  <div className="w-10 text-center flex-shrink-0">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">{item.day}</p>
                    <p className="text-xs font-bold text-slate-700">{item.display_date}</p>
                  </div>

                  {/* Mini progress bar */}
                  <div className="flex-1 min-w-0">
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-teal-600 transition-all duration-700"
                        style={{ width: `${item.attendance_percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Percentage + variance */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-xs font-bold text-slate-700 w-9 text-right">
                      {item.attendance_percentage}
                      %
                    </span>
                    {item.variance_direction === 'up' && (
                      <TrendingUp size={11} className="text-emerald-500" />
                    )}
                    {item.variance_direction === 'down' && (
                      <TrendingDown size={11} className="text-red-400" />
                    )}
                  </div>

                  {/* Present / Absent counts */}
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <p className="text-[10px] text-emerald-600 font-semibold">
                      {item.present_count}
                      P
                    </p>
                    <p className="text-[10px] text-red-400 font-semibold">
                      {item.absent_count}
                      A
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm mt-3">
        <div className="mb-4">
          <p className="text-sm sm:text-[15px] font-bold text-slate-900 leading-tight">Quick Actions</p>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Common tasks at a glance</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-2.5 p-3 sm:p-5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer group no-underline"
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