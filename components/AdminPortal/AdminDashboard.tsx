'use client';

import React, { useEffect, useState } from 'react';
import {
  Users, UserCheck, UserX, Clock, AlertTriangle,
  CheckCircle, TrendingUp, TrendingDown, Plus, ThumbsUp,
  Building2, Calendar, ArrowRight, Activity, RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} day ago`;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const weeklyTrend = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day) => ({
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
          { dept: 'Operations', rate: 100 },
          { dept: 'Management', rate: 100 },
        ],
        recentActivity: [
          { id: '1', action: 'Admin added', name: 'Arjun Mehta', dept: 'Management', time: 'just now', type: 'add' },
          { id: '2', action: 'New employee added', name: 'Rahul Sharma', dept: 'Operations', time: '1 day ago', type: 'add' },
          { id: '3', action: 'New employee added', name: 'Ananya Krishnan', dept: 'Engineering', time: '2 days ago', type: 'add' },
        ],
      });
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#0f1f2e]">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">{today} · Workforce at a glance</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-medium text-[#2D7A4F] bg-[#e8f5ee] px-3 py-1.5 rounded-full">
            <Activity size={12} />
            Loading…
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-gray-100 mb-3" />
              <div className="h-7 w-16 bg-gray-100 rounded mb-1" />
              <div className="h-3 w-24 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm animate-pulse h-64" />
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm animate-pulse h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 lg:p-6">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex flex-col items-center gap-3">
          <AlertTriangle size={32} className="text-red-400" />
          <p className="text-sm font-semibold text-red-700">Failed to load dashboard</p>
          <p className="text-xs text-red-500">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl transition-colors"
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const s = stats!;

  const attendanceRate = s.totalEmployees > 0
    ? ((s.activeToday / s.totalEmployees) * 100).toFixed(1)
    : '0.0';

  const leaveRate = s.totalEmployees > 0
    ? ((s.onLeave / s.totalEmployees) * 100).toFixed(1)
    : '0.0';

  const STAT_CARDS = [
    { label: 'Total Employees', value: String(s.totalEmployees), change: 'All active staff', up: true, icon: Users, color: 'from-[#2D7A4F] to-[#4a9e6e]', bg: 'bg-[#e8f5ee]', iconColor: 'text-[#2D7A4F]' },
    { label: 'Active Today', value: String(s.activeToday), change: `${attendanceRate}% attendance`, up: true, icon: UserCheck, color: 'from-blue-500 to-blue-400', bg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { label: 'On Leave', value: String(s.onLeave), change: `${leaveRate}% of workforce`, up: false, icon: UserX, color: 'from-amber-500 to-amber-400', bg: 'bg-amber-50', iconColor: 'text-amber-600' },
    { label: 'Late Arrivals', value: String(s.lateToday), change: 'Today', up: s.lateToday === 0, icon: Clock, color: 'from-red-500 to-red-400', bg: 'bg-red-50', iconColor: 'text-red-500' },
  ];

  const ALERTS = [
    { id: 1, type: 'missing', icon: AlertTriangle, color: 'text-amber-600 bg-amber-50', label: 'Missing punch-out', count: s.missingCheckout, sub: 'Today' },
    { id: 2, type: 'pending', icon: Clock, color: 'text-blue-600 bg-blue-50', label: 'Regularization pending', count: s.pendingRegularizations, sub: 'Awaiting action' },
    { id: 3, type: 'late', icon: TrendingDown, color: 'text-red-500 bg-red-50', label: 'Late arrivals today', count: s.lateToday, sub: 'Before shift start' },
    { id: 4, type: 'overtime', icon: TrendingUp, color: 'text-purple-600 bg-purple-50', label: 'Overtime flagged', count: s.overtimeFlagged, sub: 'This week' },
  ];

  const totalAlerts = ALERTS.reduce((a, b) => a + b.count, 0);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0f1f2e]">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">{today} · Workforce at a glance</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full transition-colors"
          >
            <RefreshCw size={12} />
            Refresh
          </button>
          <span className="flex items-center gap-1.5 text-xs font-medium text-[#2D7A4F] bg-[#e8f5ee] px-3 py-1.5 rounded-full">
            <Activity size={12} />
            Live
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {STAT_CARDS?.map((card) => (
          <div key={card?.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${card?.bg} flex items-center justify-center`}>
                <card.icon size={18} className={card?.iconColor} />
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${card?.up ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                {card?.change}
              </span>
            </div>
            <p className="text-2xl font-black text-[#0f1f2e]">{card?.value}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{card?.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Attendance trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#0f1f2e]">Weekly Attendance Trend</h3>
              <p className="text-xs text-gray-400 mt-0.5">Present vs Absent this week</p>
            </div>
          </div>
          {s.weeklyTrend.every((d) => d.present === 0 && d.absent === 0) ? (
            <div className="flex flex-col items-center justify-center h-44 text-gray-400">
              <Activity size={28} className="mb-2 opacity-40" />
              <p className="text-xs font-medium">No attendance data this week</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={s.weeklyTrend} barSize={20} barGap={4}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                />
                <Bar dataKey="present" fill="#2D7A4F" radius={[4, 4, 0, 0]} name="Present" />
                <Bar dataKey="absent" fill="#fde68a" radius={[4, 4, 0, 0]} name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Dept attendance */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#0f1f2e] mb-1">Dept. Attendance Rate</h3>
          <p className="text-xs text-gray-400 mb-4">Today's snapshot</p>
          {s.deptAttendance.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <Building2 size={24} className="mb-2 opacity-40" />
              <p className="text-xs font-medium">No department data</p>
            </div>
          ) : (
            <div className="space-y-3">
              {s.deptAttendance?.map((d) => (
                <div key={d?.dept}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">{d?.dept}</span>
                    <span className="text-xs font-bold text-[#0f1f2e]">{d?.rate}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#2D7A4F] to-[#4a9e6e]"
                      style={{ width: `${d?.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alerts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Alerts */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#0f1f2e]">Alerts & Exceptions</h3>
            {totalAlerts > 0 && (
              <span className="text-xs font-semibold text-white bg-red-500 rounded-full px-2 py-0.5">
                {totalAlerts}
              </span>
            )}
          </div>
          <div className="space-y-2.5">
            {ALERTS?.map((alert) => (
              <div key={alert?.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                <div className={`w-9 h-9 rounded-xl ${alert?.color} flex items-center justify-center flex-shrink-0`}>
                  <alert.icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{alert?.label}</p>
                  <p className="text-xs text-gray-400">{alert?.sub}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-[#0f1f2e]">{alert?.count}</span>
                  <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#0f1f2e] mb-4">Recent Activity</h3>
          {s.recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <Activity size={24} className="mb-2 opacity-40" />
              <p className="text-xs font-medium">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {s.recentActivity?.map((item) => (
                <div key={item?.id} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    item?.type === 'add' ? 'bg-green-50' : item?.type === 'approve' ? 'bg-blue-50' : 'bg-amber-50'
                  }`}>
                    {item?.type === 'add' ? <Plus size={13} className="text-green-600" /> :
                     item?.type === 'approve' ? <ThumbsUp size={13} className="text-blue-600" /> :
                     <CheckCircle size={13} className="text-amber-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">{item?.action}</p>
                    <p className="text-xs text-gray-500">{item?.name} · <span className="text-gray-400">{item?.dept}</span></p>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium flex-shrink-0">{item?.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-[#0f1f2e] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Add Employee', icon: Users, href: '/admin/employees', color: 'bg-[#e8f5ee] text-[#2D7A4F]' },
            { label: 'Approve Leave', icon: CheckCircle, href: '/admin/attendance', color: 'bg-blue-50 text-blue-600' },
            { label: 'Run Payroll', icon: Calendar, href: '/admin/payroll', color: 'bg-purple-50 text-purple-600' },
            { label: 'View Reports', icon: Building2, href: '/admin/analytics', color: 'bg-amber-50 text-amber-600' },
          ]?.map((action) => (
            <a
              key={action?.label}
              href={action?.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className={`w-10 h-10 rounded-xl ${action?.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <action.icon size={18} />
              </div>
              <span className="text-xs font-semibold text-gray-700 text-center">{action?.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
