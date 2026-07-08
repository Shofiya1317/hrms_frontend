'use client';
 
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  RotateCcw,
  Gift,
  ArrowRight,
  Users,
  Bell,
  CheckCircle2,
  Clock,
  Loader2,
  LogIn,
  LogOut,
  GraduationCap,
  Hourglass,
  Search,
  Ban,
  CircleDot,
  Circle,
  Palmtree,
  Moon,
  PartyPopper,
  XCircle,
  Sunrise,
  Home,
  Briefcase,
} from 'lucide-react';
import {
  getEmployeeLeaveBalanceDetailed,
  EmployeeLeaveBalance,
} from '@/lib/service/leave';
import { getMyTeam, getProbationStatus, IProbationStatus } from '@/lib/service/employee';
import { getMyApplications, LeaveStatus } from '@/lib/service/leaveApplication';
import { getMyOnDutyApplications, OnDutyStatus } from '@/lib/service/onDuty';
import { getMyWFHRequests, WFHStatus } from '@/lib/service/wfh';
import {
  getMyRegularizations,
  RegularizationStatus,
} from '@/lib/service/regularization';
import {
  getEmployeeAttendanceDashboard,
  IEmployeeAttendanceDashboard,
} from '@/lib/service/attendance';
import { getEmployeeResignationStatus } from '@/lib/service/noticePeriod';
import CheckInOutCard from './CheckInOutCard';
 
// ─── Types ─────────────────────────────────────────────────────────────────────
interface LeaveBalanceCard {
  id: string;
  type: string;
  short: string;
  balance: number;
  used: number;
  total: number;
  color: string;
  bg: string;
  gradientFrom: string;
  gradientTo: string;
}
 
// ─── Shared layout tokens ───────────────────────────────────────────────────────
// Keeping these consistent avoids the "every card invents its own spacing" problem.
const CARD =
  'rounded-3xl bg-white/80 backdrop-blur-sm border border-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-4';
const CARD_HEADER = 'flex items-center justify-between gap-2 mb-3';
const ICON_BADGE = 'w-8 h-8 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0';
const PILL = 'text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 whitespace-nowrap';
 
// ─── Constants ─────────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    label: 'Apply Leave',
    icon: Calendar,
    href: '/employee/attendance/apply-leave',
    gradFrom: '#3b82f6',
    gradTo: '#6366f1',
    shadow: 'rgba(99,102,241,0.35)',
    desc: 'Request time off',
  },
  {
    label: 'Regularize',
    icon: RotateCcw,
    href: '/employee/attendance/regularization',
    gradFrom: '#f59e0b',
    gradTo: '#f97316',
    shadow: 'rgba(249,115,22,0.35)',
    desc: 'Fix missed punches',
  },
  {
    label: 'Comp Off',
    icon: Gift,
    href: '/employee/attendance/comp-off',
    gradFrom: '#8b5cf6',
    gradTo: '#a855f7',
    shadow: 'rgba(168,85,247,0.35)',
    desc: 'Claim overtime days',
  },
  {
    label: 'Work from Home',
    icon: Home,
    href: '/employee/attendance/wfh-request',
    gradFrom: '#14b8a6',
    gradTo: '#06b6d4',
    shadow: 'rgba(6,182,212,0.35)',
    desc: 'Remote work request',
  },
  {
    label: 'On Duty',
    icon: Briefcase,
    href: '/employee/attendance/on-duty',
    gradFrom: '#84cc16',
    gradTo: '#22c55e',
    shadow: 'rgba(34,197,94,0.35)',
    desc: 'Outdoor duty claim',
  },
];
 
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  present: {
    label: 'P',
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
  },
  absent: {
    label: 'A',
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
  },
  late: {
    label: 'L',
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
  },
  half_day: {
    label: 'HD',
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#e9d5ff',
  },
  week_off: {
    label: 'WO',
    color: '#64748b',
    bg: '#f8fafc',
    border: '#e2e8f0',
  },
  holiday: {
    label: 'H',
    color: '#0891b2',
    bg: '#ecfeff',
    border: '#a5f3fc',
  },
  on_leave: {
    label: 'OL',
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
  wfh: {
    label: 'WFH',
    color: '#6366f1',
    bg: '#eef2ff',
    border: '#c7d2fe',
  },
  upcoming: {
    label: '–',
    color: '#94a3b8',
    bg: '#f8fafc',
    border: '#e2e8f0',
  },
  on_duty: {
    label: 'OD',
    color: '#0891b2',
    bg: '#ecfeff',
    border: '#a5f3fc',
  },
};
 
const TODAY_STATUS_META: Record<
  string,
  { label: string; Icon: any; color: string; bg: string; border: string }
> = {
  on_leave: {
    label: 'On Leave',
    Icon: Palmtree,
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
  week_off: {
    label: 'Week Off',
    Icon: Moon,
    color: '#64748b',
    bg: '#f8fafc',
    border: '#e2e8f0',
  },
  holiday: {
    label: 'Holiday',
    Icon: PartyPopper,
    color: '#0891b2',
    bg: '#ecfeff',
    border: '#a5f3fc',
  },
  absent: {
    label: 'Absent',
    Icon: XCircle,
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
  },
  half_day: {
    label: 'Half Day',
    Icon: Sunrise,
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#e9d5ff',
  },
};
 
const LEAVE_COLOR_RAMPS = [
  {
    color: '#16a34a',
    bg: '#f0fdf4',
    gradientFrom: '#86efac',
    gradientTo: '#4ade80',
  },
  {
    color: '#2563eb',
    bg: '#eff6ff',
    gradientFrom: '#93c5fd',
    gradientTo: '#60a5fa',
  },
  {
    color: '#d97706',
    bg: '#fffbeb',
    gradientFrom: '#fcd34d',
    gradientTo: '#fbbf24',
  },
  {
    color: '#7c3aed',
    bg: '#f5f3ff',
    gradientFrom: '#c4b5fd',
    gradientTo: '#a78bfa',
  },
];
 
// ─── Probation Card ────────────────────────────────────────────────────────────
const PROBATION_STATUS_META: Record<string, { label: string; color: string; bg: string; border: string; Icon: any }> = {
  active: { label: 'Active', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', Icon: CircleDot },
  under_review: { label: 'Under Review', color: '#d97706', bg: '#fffbeb', border: '#fde68a', Icon: Search },
  extended: { label: 'Extended', color: '#7c3aed', bg: '#f5f3ff', border: '#e9d5ff', Icon: Hourglass },
  confirmed: { label: 'Confirmed', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', Icon: CheckCircle2 },
  failed: { label: 'Failed', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', Icon: XCircle },
  terminated: { label: 'Terminated', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', Icon: Ban },
};
 
function ProbationCard({ probation }: { probation: IProbationStatus }) {
  const meta = PROBATION_STATUS_META[probation.probation_status] ?? PROBATION_STATUS_META.active;
  const StatusIcon = meta.Icon;
  const { status_card, progress, milestones, reporting_manager, outcome } = probation;
 
  return (
    <div className="h-full flex flex-col rounded-3xl bg-white/80 backdrop-blur-sm border shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-4"
      style={{ borderColor: meta.border }}>
      {/* Header */}
      <div className={CARD_HEADER}>
        <div className="flex items-center gap-2 min-w-0">
          <div className={ICON_BADGE} style={{ background: `linear-gradient(135deg, ${meta.color}cc, ${meta.color})` }}>
            <GraduationCap size={15} className="text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-800 truncate">Probation Period</h3>
            <p className="text-[11px] text-slate-400 truncate">{progress.label}</p>
          </div>
        </div>
        <span className={`${PILL} flex items-center gap-1 border`}
          style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}>
          <StatusIcon size={11} />
          {meta.label}
        </span>
      </div>
 
      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
          <span>{status_card.start_date}</span>
          <span className="font-bold" style={{ color: meta.color }}>{progress.percent}%</span>
          <span>{status_card.end_date}</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <div className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progress.percent}%`,
              background: `linear-gradient(90deg, ${meta.color}99, ${meta.color})`,
              boxShadow: `0 0 8px ${meta.color}66`,
            }} />
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          {progress.elapsed_days} of {progress.total_days} days elapsed
          {!outcome && status_card.days_remaining > 0 && ` · ${status_card.days_remaining} days remaining`}
        </p>
      </div>
 
      {/* Milestones */}
      <div className="flex gap-2 mb-3">
        {milestones.map((m) => (
          <div key={m.day} className="flex-1 flex flex-col items-center gap-1 p-2 rounded-2xl border"
            style={{
              background: m.completed ? '#f0fdf4' : '#f8fafc',
              borderColor: m.completed ? '#bbf7d0' : '#e2e8f0',
            }}>
            {m.completed ? (
              <CheckCircle2 size={16} style={{ color: '#16a34a' }} />
            ) : (
              <Circle size={16} style={{ color: '#94a3b8' }} />
            )}
            <span className="text-[10px] font-bold text-center leading-tight"
              style={{ color: m.completed ? '#16a34a' : '#94a3b8' }}>{m.label}</span>
          </div>
        ))}
      </div>
 
      {/* Footer — manager + outcome */}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
        {reporting_manager ? (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-[10px] font-black text-white flex-shrink-0">
              {reporting_manager.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-700 truncate">{reporting_manager.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{reporting_manager.designation}</p>
            </div>
          </div>
        ) : <div />}
        {outcome && (
          <span className={PILL}
            style={{
              color: outcome.result === 'confirmed' ? '#16a34a' : '#dc2626',
              background: outcome.result === 'confirmed' ? '#f0fdf4' : '#fef2f2',
            }}>
            {outcome.label} · {outcome.effective_date}
          </span>
        )}
      </div>
    </div>
  );
}
 
// ─── Notice Period Card ────────────────────────────────────────────────────────
function NoticePeriodCard({ resignation }: { resignation: any }) {
  const status = resignation.status?.toLowerCase() || 'pending';
  const expectedLastDay = resignation.expected_last_working_day || resignation.requested_last_working_day;
 
  let daysLeft = 0;
  if (expectedLastDay && (status === 'active' || status === 'approved')) {
    const diff = new Date(expectedLastDay).getTime() - new Date().getTime();
    daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
 
  const isCompleted = status === 'completed';
  const isPending = status === 'pending';
 
  return (
    <div className="h-full flex flex-col rounded-3xl bg-white/80 backdrop-blur-sm border border-orange-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-4">
      <div className={CARD_HEADER}>
        <div className="flex items-center gap-2 min-w-0">
          <div className={`${ICON_BADGE} bg-gradient-to-br from-orange-400 to-orange-600`}>
            <Hourglass size={15} className="text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-800 truncate">Notice Period</h3>
            <p className="text-[11px] text-slate-400 truncate">Status: {status.charAt(0).toUpperCase() + status.slice(1)}</p>
          </div>
        </div>
        {status === 'active' || status === 'approved' ? (
          <span className={`${PILL} border border-orange-200 bg-orange-50 text-orange-600`}>
            {daysLeft} days left
          </span>
        ) : isPending ? (
          <span className={`${PILL} border border-amber-200 bg-amber-50 text-amber-600`}>
            Pending
          </span>
        ) : isCompleted ? (
          <span className={`${PILL} border border-purple-200 bg-purple-50 text-purple-600`}>
            Completed
          </span>
        ) : null}
      </div>
 
      <div className="mt-auto flex flex-wrap justify-between items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Expected Exit</p>
          <p className="text-sm font-bold text-slate-700 truncate">
            {expectedLastDay ? new Date(expectedLastDay).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'TBD'}
          </p>
        </div>
        <Link href="/employee/attendance/resignation" className="flex-shrink-0 text-[10px] font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 transition-colors whitespace-nowrap">
          View Details &rarr;
        </Link>
      </div>
    </div>
  );
}
 
// ─── Main Dashboard ─────────────────────────────────────────────────────────────
export default function EmployeeDashboard({
  employee,
  apiKey,
  token,
  reportingManager,
}: {
  employee: any;
  apiKey: string;
  token: string;
  reportingManager?: { id: string; name: string; role: string; status: string } | null;
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
 
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
 
  const fullName =
    `${employee?.first_name ?? ''} ${employee?.last_name ?? ''}`.trim() ||
    'Employee';
  const employeeId = employee?.id;
  const designation = employee?.designation?.name ?? '';
  const location = employee?.city ?? employee?.country ?? '';
 
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalanceCard[]>([]);
  const [loadingLeaveBalance, setLoadingLeaveBalance] = useState(true);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teamCount, setTeamCount] = useState(0);
  const [teamLoading, setTeamLoading] = useState(false);
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [attendanceDashboard, setAttendanceDashboard] =
    useState<IEmployeeAttendanceDashboard | null>(null);
  const [attendanceDashboardLoading, setAttendanceDashboardLoading] =
    useState(false);
  const [probation, setProbation] = useState<IProbationStatus | null>(null);
  const [resignation, setResignation] = useState<any | null>(null);
 
  useEffect(() => {
    fetchAttendanceDashboard();
    fetchMyTeam();
    fetchLeaveBalances();
    fetchPendingRequests();
    fetchProbation();
    fetchResignation();
  }, []);
 
  const fetchResignation = async () => {
    try {
      const res = await getEmployeeResignationStatus(apiKey, token);
      const data = res?.data?.data ?? res?.data;
      if (data && data.status && data.status.toLowerCase() !== 'withdrawn' && data.status.toLowerCase() !== 'rejected') {
        setResignation(data);
      }
    } catch { /* ignore */ }
  };
 
  const fetchProbation = async () => {
    try {
      const res = await getProbationStatus(apiKey, token);
      const d = res?.data as any;
      const data = d?.data ?? d;
      if (data?.is_on_probation) setProbation(data);
    } catch { /* not on probation or not available */ }
  };
 
  const fetchAttendanceDashboard = async () => {
    try {
      setAttendanceDashboardLoading(true);
      const response = await getEmployeeAttendanceDashboard(
        employeeId,
        apiKey,
        token
      );
      setAttendanceDashboard(response?.data?.data || null);
    } catch (error) {
      console.error('Failed to fetch attendance dashboard', error);
    } finally {
      setAttendanceDashboardLoading(false);
    }
  };
 
  const fetchPendingRequests = async () => {
    if (!employeeId) return;
    try {
      setPendingLoading(true);
      const [leaveRes, onDutyRes, wfhRes, regularizationRes] =
        await Promise.all([
          getMyApplications(
            apiKey,
            { status: LeaveStatus.PENDING, limit: 1 },
            token
          ),
          getMyOnDutyApplications(
            apiKey,
            { status: OnDutyStatus.PENDING, limit: 1 },
            token
          ),
          getMyWFHRequests(
            apiKey,
            { status: WFHStatus.PENDING, limit: 1 },
            token
          ),
          getMyRegularizations(
            apiKey,
            { status: RegularizationStatus.PENDING, limit: 1 },
            token
          ),
        ]);
 
      const extract = (res: any) => {
        const raw = res?.data?.data ?? res?.data ?? [];
        return Array.isArray(raw) ? raw.slice(0, 1) : [];
      };
 
      const consolidated = [
        ...extract(leaveRes).map((item: any) => ({
          id: item.id,
          type: 'leave',
          title:
            item.leave_type_name || item.leave_type?.name || 'Leave Request',
          date: item.from_date || item.applied_on,
          status: item.status,
        })),
        ...extract(onDutyRes).map((item: any) => ({
          id: item.id,
          type: 'onduty',
          title: 'On Duty',
          date: item.date || item.applied_on,
          status: item.status,
        })),
        ...extract(wfhRes).map((item: any) => ({
          id: item.id,
          type: 'wfh',
          title: 'Work From Home',
          date: item.date || item.applied_on,
          status: item.status,
        })),
        ...extract(regularizationRes).map((item: any) => ({
          id: item.id,
          type: 'regularization',
          title: 'Attendance Regularization',
          date: item.attendance_date || item.created_at,
          status: item.status,
        })),
      ];
      setPendingItems(consolidated);
    } catch (error) {
      console.error(error);
    } finally {
      setPendingLoading(false);
    }
  };
 
  const fetchMyTeam = async () => {
    try {
      setTeamLoading(true);
      const response = await getMyTeam(apiKey, token);
      const raw = response?.data?.data ?? response?.data;
      // API returns either a flat array or { data: [...] }
      const members = Array.isArray(raw) ? raw : (raw?.data ?? []);
      setTeamMembers(members);
      setTeamCount(raw?.total_team_size || members.length);
    } catch (error) { console.error(error); } finally { setTeamLoading(false); }
  };
 
  const fetchLeaveBalances = async () => {
    try {
      setLoadingLeaveBalance(true);
      if (!employee?.id) return;
      const response = await getEmployeeLeaveBalanceDetailed(
        employee.id,
        new Date().getFullYear(),
        apiKey,
        token
      );
      if (response?.data?.leave_types) {
        const balances: LeaveBalanceCard[] = response.data.leave_types
          .filter((lt: any) => lt.leave_type_properties?.is_active)
          .map((lt: any, index: number) => ({
            id: lt.leave_type_id,
            type: lt.leave_type_name,
            short: lt.leave_type_code,
            balance: Number(lt.balance.available || 0),
            total: Number(lt.balance.total_entitled || 0),
            used:
              Number(lt.balance.total_entitled || 0) -
              Number(lt.balance.available || 0),
            ...LEAVE_COLOR_RAMPS[index % LEAVE_COLOR_RAMPS.length],
          }));
        setLeaveBalances(balances);
      }
    } catch (error) {
      console.error('Failed to fetch leave balances', error);
    } finally {
      setLoadingLeaveBalance(false);
    }
  };
 
  const getInitials = (name: string) =>
    name
      ?.split(' ')
      ?.map((w) => w[0])
      ?.slice(0, 2)
      ?.join('')
      ?.toUpperCase();
 
  // ── Pending type icons & colors ──
  const pendingTypeConfig: Record<
    string,
    { color: string; bg: string; gradFrom: string; gradTo: string; icon: any }
  > = {
    leave: {
      color: '#2563eb',
      bg: '#eff6ff',
      gradFrom: '#60a5fa',
      gradTo: '#818cf8',
      icon: Calendar,
    },
    wfh: {
      color: '#14b8a6',
      bg: '#f0fdfa',
      gradFrom: '#5eead4',
      gradTo: '#22d3ee',
      icon: Home,
    },
    onduty: {
      color: '#84cc16',
      bg: '#f7fee7',
      gradFrom: '#a3e635',
      gradTo: '#4ade80',
      icon: Briefcase,
    },
    regularization: {
      color: '#f59e0b',
      bg: '#fffbeb',
      gradFrom: '#fbbf24',
      gradTo: '#fb923c',
      icon: RotateCcw,
    },
  };
 
  return (
    <div className="min-h-screen">
      <div className="px-3 py-4 sm:px-4 sm:py-6 space-y-4 sm:space-y-5">
 
        {/* ── Dashboard Header ── */}
        <div className="flex flex-wrap justify-between items-center gap-2 px-1">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            Welcome, {fullName}
          </h1>
          {employee?.employment_type && (
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider shadow-sm border border-indigo-200 flex items-center gap-1.5 flex-shrink-0">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
              {employee.employment_type.replace('_', ' ')}
            </span>
          )}
        </div>
 
        {/* ── Check In/Out ── */}
        <CheckInOutCard
          apiKey={apiKey}
          token={token}
          defaultLocation={location}
          onAttendanceUpdate={fetchAttendanceDashboard}
          reportingManager={reportingManager}
        />
 
        {/* ── Quick Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: 'Present Days',
              value: attendanceDashboard?.week_stats?.present_days ?? '--',
              sub: `of ${attendanceDashboard?.week_stats?.working_days ?? '--'} days`,
              gradFrom: '#86efac',
              gradTo: '#4ade80',
              shadow: 'rgba(74,222,128,0.25)',
              icon: CheckCircle2,
            },
            {
              label: 'Working Hours',
              value: attendanceDashboard?.week_stats?.total_hours ?? '--',
              sub: 'this week',
              gradFrom: '#93c5fd',
              gradTo: '#818cf8',
              shadow: 'rgba(129,140,248,0.25)',
              icon: Clock,
            },
            {
              label: 'Leave Balance',
              value: leaveBalances.reduce((s, l) => s + l.balance, 0) || '--',
              sub: 'days remaining',
              gradFrom: '#fcd34d',
              gradTo: '#fb923c',
              shadow: 'rgba(251,146,60,0.25)',
              icon: Calendar,
            },
            {
              label: 'Team Size',
              value: teamLoading ? '…' : teamCount || teamMembers.length,
              sub: 'reporting to you',
              gradFrom: '#c4b5fd',
              gradTo: '#e879f9',
              shadow: 'rgba(232,121,249,0.25)',
              icon: Users,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-3xl bg-white border border-white/80 p-3 sm:p-4 flex flex-col h-full min-w-0"
              style={{
                boxShadow: `0 4px 24px ${stat.shadow}, 0 1px 4px rgba(0,0,0,0.04)`,
              }}
            >
              {/* bg blob */}
              <div
                className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-20 blur-xl pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${stat.gradTo}, ${stat.gradFrom})`,
                }}
              />
              <div
                className="w-8 h-8 rounded-2xl flex items-center justify-center mb-3 shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${stat.gradFrom}, ${stat.gradTo})`,
                }}
              >
                <stat.icon size={15} className="text-white" />
              </div>
              <p className="text-2xl font-black text-slate-900 tracking-tight leading-none truncate">
                {stat.value}
              </p>
              <p className="text-xs font-semibold text-slate-500 mt-1 leading-tight">
                {stat.label}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>
 
        {/* ── This Week + Timeline ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch">
          {/* Today's Timeline */}
          <div className={`h-full flex flex-col ${CARD}`}>
            <div className={CARD_HEADER}>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.2)] flex-shrink-0">
                  <Clock size={14} className="text-white" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 truncate">
                  Today's Timeline
                </h3>
              </div>
              <span className={`${PILL} text-slate-400 bg-slate-100`}>
                {currentTime.toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>
 
            <div className="relative pl-5 flex-1">
              <div className="absolute left-2 top-0 bottom-0 w-px bg-gradient-to-b from-slate-200 via-slate-100 to-transparent" />
              <div className="space-y-3">
                {/* Today status banner for non-working states */}
                {(() => {
                  const s = attendanceDashboard?.today?.status;
                  const meta = s ? TODAY_STATUS_META[s] : null;
                  if (!meta || attendanceDashboard?.today?.timeline?.length)
                    return null;
                  const StatusIcon = meta.Icon;
                  return (
                    <div
                      className="flex items-center gap-3 rounded-2xl border px-4 py-3"
                      style={{ background: meta.bg, borderColor: meta.border }}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: '#ffffffaa' }}>
                        <StatusIcon size={18} style={{ color: meta.color }} />
                      </div>
                      <div>
                        <p
                          className="text-xs font-bold"
                          style={{ color: meta.color }}
                        >
                          {meta.label}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          No attendance activity today
                        </p>
                      </div>
                    </div>
                  );
                })()}
 
                {attendanceDashboard?.today?.timeline?.length ? (
                  <div className="space-y-3">
                    {attendanceDashboard.today.timeline.map((log, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-3 ${log.type === 'check_in'
                            ? 'bg-emerald-400'
                            : 'bg-rose-400'
                            }`}
                        >
                          {log.type === 'check_in' ? (
                            <LogIn size={10} className="text-white" />
                          ) : (
                            <LogOut size={10} className="text-white" />
                          )}
                        </div>
                        <div className="flex-1 rounded-2xl bg-slate-50/80 border border-slate-100 p-3 min-w-0">
                          <div className="flex justify-between items-center gap-2">
                            <p className="text-xs font-bold text-slate-800">
                              {log.type === 'check_in'
                                ? 'Check In'
                                : 'Check Out'}
                            </p>
                            <span className="text-xs font-bold text-slate-600 tabular-nums flex-shrink-0">
                              {log.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                            {log.location || 'Attendance system'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Clock size={24} className="mx-auto text-slate-200 mb-2" />
                    <p className="text-sm text-slate-400">No activity today</p>
                  </div>
                )}
 
                {attendanceDashboard?.today?.check_in &&
                  !attendanceDashboard?.today?.check_out && (
                    <div className="flex items-start gap-3 opacity-50">
                      <div className="w-5 h-5 rounded-full border-2 border-dashed border-rose-300 flex items-center justify-center bg-white mt-3 flex-shrink-0">
                        <LogOut size={9} className="text-rose-400" />
                      </div>
                      <div className="flex-1 rounded-2xl bg-white border-2 border-dashed border-slate-200 p-3">
                        <p className="text-xs font-medium text-slate-400">
                          Check-out pending
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
 
          {/* This Week */}
          <div className={`h-full flex flex-col ${CARD}`}>
            <div className={CARD_HEADER}>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-[0_4px_12px_rgba(20,184,166,0.3)] flex-shrink-0">
                  <Calendar size={14} className="text-white" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 truncate">This Week</h3>
              </div>
              <Link
                href="/employee/attendance/monthly-view"
                className={`${PILL} text-teal-600 bg-teal-50 flex items-center gap-1 hover:bg-teal-100 transition-colors`}
              >
                Monthly <ArrowRight size={10} />
              </Link>
            </div>
 
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {attendanceDashboard?.week_summary?.map((day) => {
                const cfg = STATUS_CONFIG[day.status] || STATUS_CONFIG.present;
                const isToday = day.date === currentTime.getDate().toString();
                return (
                  <div
                    key={`${day.day}-${day.date}`}
                    className={`flex flex-col items-center gap-1 p-1 sm:p-1.5 rounded-2xl border transition-all ${isToday ? 'shadow-[0_0_0_2px_#14b8a6,0_4px_12px_rgba(20,184,166,0.2)] scale-105' : 'shadow-sm hover:scale-105'}`}
                    style={{
                      backgroundColor: cfg.bg,
                      borderColor: isToday ? '#14b8a6' : cfg.border,
                    }}
                  >
                    <span className="text-[9px] font-bold uppercase text-slate-500">
                      {day.day}
                    </span>
                    <span
                      className="text-sm font-black"
                      style={{ color: cfg.color }}
                    >
                      {day.date}
                    </span>
                    <span
                      className="text-[8px] font-bold px-1 py-0.5 rounded-full"
                      style={{ background: `${cfg.color}20`, color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                    <span className="text-[8px] text-slate-400 font-medium">
                      {day.hours}
                    </span>
                  </div>
                );
              })}
            </div>
 
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-semibold text-slate-500">
                  Week Progress
                </span>
                <span className="text-[11px] font-black text-teal-600">
                  {attendanceDashboard?.week_progress || 0}%
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${attendanceDashboard?.week_progress || 0}%`,
                    background: 'linear-gradient(90deg, #14b8a6, #10b981)',
                    boxShadow: '0 0 8px rgba(20,184,166,0.4)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
 
        {/* ── Quick Actions ── */}
        <div className={CARD}>
          <h3 className="text-sm font-bold text-slate-800 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className="group flex flex-col items-center gap-2 py-3 px-2 rounded-3xl border border-slate-100/80 bg-white/60 hover:border-slate-200 hover:-translate-y-1 transition-all duration-200 text-center h-full min-w-0"
                style={{ boxShadow: `0 4px 16px ${a.shadow}22` }}
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${a.gradFrom}, ${a.gradTo})`,
                    boxShadow: `0 6px 16px ${a.shadow}`,
                  }}
                >
                  <a.icon size={18} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-slate-700 leading-tight">
                    {a.label}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-tight hidden sm:block">
                    {a.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
 
        {/* ── Leave Balances ── */}
        <div className={CARD}>
          <div className={CARD_HEADER}>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-800">
                Leave Balances
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Annual · {new Date().getFullYear()}
              </p>
            </div>
            <Link href="/employee/attendance/apply-leave" className={`${PILL} text-indigo-600 bg-indigo-50 flex items-center gap-1 hover:bg-indigo-100 transition-colors`}>
              Apply
              <ArrowRight size={10} />
            </Link>
          </div>
 
          {loadingLeaveBalance ? (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="animate-spin text-emerald-500" />
            </div>
          ) : leaveBalances.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-6">
              No leave types configured
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 auto-rows-fr">
              {leaveBalances.map((l) => {
                const availPct = l.total > 0 ? (l.balance / l.total) * 100 : 0;
                return (
                  <div
                    key={l.id}
                    className="relative overflow-hidden rounded-2xl border p-4 transition-all hover:scale-[1.01] h-full flex flex-col min-w-0"
                    style={{
                      background: l.bg,
                      borderColor: `${l.color}30`,
                      boxShadow: `0 4px 20px ${l.color}18`,
                    }}
                  >
                    <div
                      className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-10 blur-lg pointer-events-none"
                      style={{
                        background: `radial-gradient(${l.gradientTo}, ${l.gradientFrom})`,
                      }}
                    />
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div
                        className="w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-black text-white shadow-sm flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${l.gradientFrom}, ${l.gradientTo})`,
                          boxShadow: `0 4px 12px ${l.color}40`,
                        }}
                      >
                        {l.short}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p
                          className="text-2xl font-black leading-none"
                          style={{ color: l.color }}
                        >
                          {l.balance}
                        </p>
                        <p className="text-[11px] font-semibold text-slate-500">
                          days left
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-800 mb-2 truncate">
                      {l.type}
                    </p>
                    <div className="mt-auto">
                      <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${availPct}%`,
                            background: `linear-gradient(90deg, ${l.gradientFrom}, ${l.gradientTo})`,
                          }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1.5">
                        {l.used} used · {l.total} total
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
 
        {/* ── Team + Pending row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch">
          {/* Team Members */}
          <div className={`h-full flex flex-col ${CARD}`}>
            <div className={CARD_HEADER}>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-[0_4px_12px_rgba(139,92,246,0.3)] flex-shrink-0">
                  <Users size={14} className="text-white" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 truncate">My Team</h3>
              </div>
              {!teamLoading && (
                <span className={`${PILL} text-violet-600 bg-violet-50`}>
                  {teamCount} members
                </span>
              )}
            </div>
 
            {teamLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={20} className="animate-spin text-violet-500" />
              </div>
            ) : teamMembers.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-6">
                No direct reports
              </p>
            ) : (
              <div className="space-y-2">
                {teamMembers.slice(0, 5).map((member, i) => {
                  const colors = [
                    'from-violet-400 to-purple-500',
                    'from-blue-400 to-indigo-500',
                    'from-teal-400 to-emerald-500',
                    'from-rose-400 to-pink-500',
                    'from-amber-400 to-orange-500',
                  ];
                  return (
                    <div key={member.id} className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50/80 transition-colors">
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.employee_name}
                          className="w-9 h-9 rounded-2xl object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className={`w-9 h-9 rounded-2xl bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center text-xs font-black text-white shadow-sm flex-shrink-0`}>
                          {getInitials(member.employee_name)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{member.employee_name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{member.designation || member.department || 'Team member'}</p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)] flex-shrink-0" />
                    </div>
                  );
                })}
                {teamCount > 5 && (
                  <p className="text-center text-[11px] font-bold text-slate-400 pt-1">
                    +{teamCount - 5} more members
                  </p>
                )}
              </div>
            )}
          </div>
 
          {/* Pending Requests */}
          <div className="h-full flex flex-col rounded-3xl bg-white/80 backdrop-blur-sm border border-amber-200/60 shadow-[0_4px_24px_rgba(245,158,11,0.1)] p-4">
            <div className={CARD_HEADER}>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-[0_4px_12px_rgba(245,158,11,0.3)] flex-shrink-0">
                  <Bell size={14} className="text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-800 truncate">Pending</h3>
                  <p className="text-[11px] text-slate-400 truncate">Awaiting review</p>
                </div>
              </div>
              {pendingItems.length > 0 && (
                <span className="text-[11px] font-black text-white bg-gradient-to-r from-amber-400 to-orange-500 px-2.5 py-1 rounded-full shadow-[0_4px_12px_rgba(245,158,11,0.3)] flex-shrink-0">
                  {pendingItems.length}
                </span>
              )}
            </div>
 
            {pendingLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={20} className="animate-spin text-amber-500" />
              </div>
            ) : pendingItems.length === 0 ? (
              <div className="flex flex-col items-center py-8">
                <div className="w-12 h-12 rounded-3xl bg-emerald-50 flex items-center justify-center mb-2 shadow-[0_4px_12px_rgba(16,185,129,0.15)]">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                </div>
                <p className="text-sm font-semibold text-slate-600">
                  All caught up!
                </p>
                <p className="text-[11px] text-slate-400">
                  No pending requests
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingItems.slice(0, 4).map((item) => {
                  const cfg =
                    pendingTypeConfig[item.type] || pendingTypeConfig.leave;
                  const ItemIcon = cfg.icon;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-white/60 hover:bg-white/90 transition-all"
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                        style={{
                          background: `linear-gradient(135deg, ${cfg.gradFrom}, ${cfg.gradTo})`,
                        }}
                      >
                        <ItemIcon size={13} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(item.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: '2-digit',
                          })}
                        </p>
                      </div>
                      <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 flex-shrink-0">
                        Pending
                      </span>
                    </div>
                  );
                })}
                {pendingItems.length > 4 && (
                  <p className="text-center text-[11px] font-bold text-slate-400 pt-1">
                    +{pendingItems.length - 4} more requests
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
 
        {/* ── Probation & Notice Period Status ── */}
        {(probation || resignation) && (
          <div className={`grid grid-cols-1 ${probation && resignation ? 'lg:grid-cols-2' : ''} gap-3 items-stretch`}>
            {probation && <ProbationCard probation={probation} />}
            {resignation && <NoticePeriodCard resignation={resignation} />}
          </div>
        )}
 
        {/* ── Upcoming Holidays ── */}
        {(attendanceDashboard?.upcoming_holidays?.length ?? 0) > 0 && (
          <div className={CARD}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-[0_4px_12px_rgba(6,182,212,0.3)] flex-shrink-0">
                <Calendar size={14} className="text-white" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Upcoming Holidays</h3>
            </div>
            <div className="space-y-2">
              {attendanceDashboard!.upcoming_holidays!.map((h, i) => {
                const isOptional = h.type === 'optional';
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-2xl border"
                    style={{
                      background: isOptional ? '#fefce8' : '#eff6ff',
                      borderColor: isOptional ? '#fde68a' : '#bfdbfe',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 text-white"
                      style={{ background: isOptional ? 'linear-gradient(135deg,#fbbf24,#f59e0b)' : 'linear-gradient(135deg,#60a5fa,#3b82f6)' }}
                    >
                      <span className="text-[10px] font-bold leading-none">
                        {new Date(h.date).toLocaleDateString('en-IN', { month: 'short' }).toUpperCase()}
                      </span>
                      <span className="text-sm font-black leading-none">
                        {new Date(h.date).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate capitalize">{h.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(h.date).toLocaleDateString('en-IN', { weekday: 'long' })}
                      </p>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0"
                      style={{
                        color: isOptional ? '#b45309' : '#1d4ed8',
                        background: isOptional ? '#fef9c3' : '#dbeafe',
                        borderColor: isOptional ? '#fde68a' : '#bfdbfe',
                      }}
                    >
                      {h.badge}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
 
      </div>
    </div>
  );
}