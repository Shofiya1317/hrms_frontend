'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  CheckCircle2, XCircle, Clock3, Loader2, X, AlertCircle,
  ChevronLeft, ChevronRight, CalendarDays, LayoutList,
  BarChart2, Search, Users, Calendar, TrendingUp,
} from 'lucide-react';
import {
  getLeaveApplications, approveRejectLeave,
  ILeaveApplication, ILeaveApprovalPayload, LeaveStatus,
} from '@/lib/service/leaveApplication';

// ── constants ─────────────────────────────────────────────────────
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const STATUS_META: Record<LeaveStatus, { label: string; bg: string; text: string; dot: string; border: string; icon: React.ReactNode }> = {
  [LeaveStatus.PENDING]: {
    label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', border: 'border-amber-200', icon: <Clock3 size={10} />,
  },
  [LeaveStatus.APPROVED]: {
    label: 'Approved', bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-500', border: 'border-teal-200', icon: <CheckCircle2 size={10} />,
  },
  [LeaveStatus.REJECTED]: {
    label: 'Rejected', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400', border: 'border-red-200', icon: <XCircle size={10} />,
  },
  [LeaveStatus.CANCELLED]: {
    label: 'Cancelled', bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400', border: 'border-slate-200', icon: <X size={10} />,
  },
};

const BAR_COLORS: Record<LeaveStatus, string> = {
  [LeaveStatus.APPROVED]: '#0f766e',
  [LeaveStatus.PENDING]: '#f59e0b',
  [LeaveStatus.REJECTED]: '#ef4444',
  [LeaveStatus.CANCELLED]: '#94a3b8',
};

const AVATAR_PALETTE = [
  'from-teal-400 to-teal-600', 'from-blue-400 to-blue-600', 'from-violet-400 to-violet-600',
  'from-rose-400 to-rose-600', 'from-amber-400 to-amber-600', 'from-cyan-400 to-cyan-600',
  'from-pink-400 to-pink-600', 'from-indigo-400 to-indigo-600',
];

// ── helpers ───────────────────────────────────────────────────────
function getEmployeeName(app: ILeaveApplication) {
  if (app.employee?.name) return app.employee.name;
  if (app.employee?.first_name || app.employee?.last_name) return `${app.employee.first_name ?? ''} ${app.employee.last_name ?? ''}`.trim();
  return app.employee_name ?? '—';
}

function getLeaveTypeName(app: ILeaveApplication) {
  return app.leave_type?.name ?? app.leave_type_name ?? '—';
}

function initials(name: string) {
  return name.split(' ').filter(Boolean).map((w) => w[0]).join('')
    .slice(0, 2)
    .toUpperCase();
}

function avatarGradient(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[h];
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function fmtShort(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]}`;
}

function daysBetween(from: string, to: string) {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000) + 1;
}

function getDays(app: ILeaveApplication) {
  if (app.total_days != null) return Math.round(Number(app.total_days));
  return daysBetween(app.from_date, app.to_date);
}

// ── Approval Drawer ───────────────────────────────────────────────
function ApprovalDrawer({ app, onClose, onDone }: {
  app: ILeaveApplication; onClose: () => void; onDone: () => void;
}) {
  const params = useParams();
  const subdomain = params?.subdomain as string;
  const [action, setAction] = useState<LeaveStatus>(LeaveStatus.APPROVED);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const meta = STATUS_META[app.status];
  const name = getEmployeeName(app);
  const days = getDays(app);

  const handleSubmit = async () => {
    if (action === LeaveStatus.REJECTED && !reason.trim()) { setErr('Rejection reason is required.'); return; }
    setSaving(true); setErr('');
    try {
      const payload: ILeaveApprovalPayload = action === LeaveStatus.REJECTED
        ? { status: action, rejection_reason: reason }
        : { status: action };
      await approveRejectLeave(app.id, payload, subdomain);
      onDone();
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Something went wrong.');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-[360px] bg-white shadow-2xl flex flex-col overflow-y-auto border-l border-slate-100">
        <div className="h-1 w-full bg-gradient-to-r from-teal-400 via-teal-600 to-emerald-500" />

        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Review Request</h2>
            <p className="text-xs text-slate-400 mt-0.5">Leave application details</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-slate-50">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${avatarGradient(name)} text-white text-xs font-bold flex items-center justify-center shadow-sm flex-shrink-0`}>
              {initials(name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{name}</p>
              {app.employee?.employee_code && <p className="text-[10px] text-slate-400">{app.employee.employee_code}</p>}
            </div>
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${meta.bg} ${meta.text} ${meta.border}`}>
              {meta.icon}
              <span className="ml-0.5">{meta.label}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Leave Type', value: getLeaveTypeName(app) },
              { label: 'Duration', value: `${days} day${days !== 1 ? 's' : ''}${app.half_day ? ' · Half' : ''}` },
              { label: 'From', value: fmtDate(app.from_date) },
              { label: 'To', value: fmtDate(app.to_date) },
            ].map((r) => (
              <div key={r.label} className="bg-slate-50 rounded-xl px-3 py-2.5">
                <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide">{r.label}</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{r.value}</p>
              </div>
            ))}
          </div>

          {app.reason && (
            <div className="mt-2 bg-slate-50 rounded-xl px-3 py-2.5">
              <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide mb-1">Reason</p>
              <p className="text-xs text-slate-600 leading-relaxed">{app.reason}</p>
            </div>
          )}

          {app.rejection_reason && app.status === LeaveStatus.REJECTED && (
            <div className="mt-2 bg-red-50 rounded-xl px-3 py-2.5 border border-red-100">
              <p className="text-[9px] text-red-400 font-semibold uppercase tracking-wide mb-1">Rejection Reason</p>
              <p className="text-xs text-red-600 leading-relaxed">{app.rejection_reason}</p>
            </div>
          )}
        </div>

        {app.status === LeaveStatus.PENDING && (
          <div className="px-5 py-4 space-y-4 flex-1">
            <p className="text-xs font-semibold text-slate-500">Select action</p>
            <div className="grid grid-cols-2 gap-2">
              {([LeaveStatus.APPROVED, LeaveStatus.REJECTED] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAction(a)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold border-2 transition-all ${
                    action === a
                      ? a === LeaveStatus.APPROVED ? 'bg-teal-50 text-teal-700 border-teal-400 shadow-sm' : 'bg-red-50 text-red-600 border-red-400 shadow-sm'
                      : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {a === LeaveStatus.APPROVED ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  {a === LeaveStatus.APPROVED ? 'Approve' : 'Reject'}
                </button>
              ))}
            </div>

            {action === LeaveStatus.REJECTED && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  Rejection Reason
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Enter reason for rejection..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                />
              </div>
            )}

            {err && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                <AlertCircle size={13} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-600">{err}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={saving}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 shadow-sm ${
                action === LeaveStatus.APPROVED ? 'bg-[#0f766e] hover:bg-teal-700' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {' '}
                  Submitting…
                </>
              )
                : action === LeaveStatus.APPROVED ? (
                  <>
                    <CheckCircle2 size={14} />
                    {' '}
                    Approve Leave
                  </>
                ) : (
                  <>
                    <XCircle size={14} />
                    {' '}
                    Reject Leave
                  </>
                )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Chart view ────────────────────────────────────────────────────
function ChartView({ apps }: { apps: ILeaveApplication[] }) {
  const monthData = useMemo(() => {
    const map: Record<number, Record<LeaveStatus, number>> = {};
    for (let i = 0; i < 12; i++) {
      map[i] = {
        [LeaveStatus.PENDING]: 0,
        [LeaveStatus.APPROVED]: 0,
        [LeaveStatus.REJECTED]: 0,
        [LeaveStatus.CANCELLED]: 0,
      };
    }
    apps.forEach((a) => {
      const m = new Date(a.from_date).getMonth();
      if (map[m] && a.status in map[m]) map[m][a.status]++;
    });
    return map;
  }, [apps]);

  const maxVal = Math.max(...Object.values(monthData).map((m) => Object.values(m).reduce((a, b) => a + b, 0)), 1);

  const byType = useMemo(() => {
    const map: Record<string, { name: string; count: number }> = {};
    apps.forEach((a) => {
      const k = a.leave_type?.id ?? a.leave_type_id ?? 'unknown';
      if (!map[k]) map[k] = { name: getLeaveTypeName(a), count: 0 };
      map[k].count++;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [apps]);

  const typeMax = Math.max(...byType.map((t) => t.count), 1);
  const TYPE_COLORS = ['#0f766e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
  const ALL_STATUSES = [LeaveStatus.APPROVED, LeaveStatus.PENDING, LeaveStatus.REJECTED, LeaveStatus.CANCELLED];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-3">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={14} className="text-teal-600" />
          <p className="text-sm font-bold text-slate-900">Monthly Applications</p>
        </div>
        <p className="text-[12px] text-slate-400 mb-5 ml-5">Stacked by status across the year</p>
        <div className="flex items-end gap-1.5 h-36 px-1">
          {Object.entries(monthData).map(([mIdx, counts]) => {
            const total = Object.values(counts).reduce((a, b) => a + b, 0);
            const h = Math.max((total / maxVal) * 112, total > 0 ? 6 : 0);
            return (
              <div key={mIdx} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full rounded-t-md overflow-hidden flex flex-col-reverse" style={{ height: `${h}px` }}>
                  {ALL_STATUSES.map((s) => (counts[s] > 0 ? (
                    <div
                      key={s}
                      style={{ flex: counts[s], backgroundColor: BAR_COLORS[s] }}
                      title={`${STATUS_META[s].label}: ${counts[s]}`}
                      className="transition-all"
                    />
                  ) : null))}
                </div>
                <span className="text-[12px] text-slate-500 font-semibold">{MONTHS[Number(mIdx)]}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 flex-wrap border-t border-slate-50 pt-3">
          {ALL_STATUSES.map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: BAR_COLORS[s] }} />
              <span className="text-[12px] text-slate-500 font-semibold">{STATUS_META[s].label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3">
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 size={14} className="text-blue-500" />
          <p className="text-sm font-bold text-slate-900">By Leave Type</p>
        </div>
        <p className="text-[12px] text-slate-400 mb-3 ml-5">Total applications per type</p>
        <div className="space-y-3.5">
          {byType.slice(0, 6).map((t, i) => (
            <div key={t.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] font-semibold text-slate-700 truncate">{t.name}</span>
                <span className="text-[13px] font-bold ml-2 px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">{t.count}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(t.count / typeMax) * 100}%`, backgroundColor: TYPE_COLORS[i % 6] }}
                />
              </div>
            </div>
          ))}
          {byType.length === 0 && <p className="text-xs text-slate-400 text-center py-6">No data available</p>}
        </div>
      </div>
    </div>
  );
}

// ── Calendar view ─────────────────────────────────────────────────
function CalendarView({
  apps, calMonth, calYear, setCalMonth, setCalYear, onSelect,
}: {
  apps: ILeaveApplication[]; calMonth: number; calYear: number;
  setCalMonth: (m: number) => void; setCalYear: (y: number) => void;
  onSelect: (a: ILeaveApplication) => void;
}) {
  const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const firstDow = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDow).fill(null)];
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const byDay = useMemo(() => {
    const map: Record<string, ILeaveApplication[]> = {};
    apps.forEach((a) => {
      const from = new Date(a.from_date);
      const to = new Date(a.to_date);
      for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        if (d.getMonth() !== calMonth || d.getFullYear() !== calYear) continue;
        const key = d.getDate().toString();
        if (!map[key]) map[key] = [];
        map[key].push(a);
      }
    });
    return map;
  }, [apps, calMonth, calYear]);

  const today = new Date();
  const prevMonth = () => (calMonth === 0 ? (setCalYear(calYear - 1), setCalMonth(11)) : setCalMonth(calMonth - 1));
  const nextMonth = () => (calMonth === 11 ? (setCalYear(calYear + 1), setCalMonth(0)) : setCalMonth(calMonth + 1));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
        <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-500 transition-all">
          <ChevronLeft size={14} />
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-900">{MONTH_FULL[calMonth]}</p>
          <p className="text-[10px] text-slate-400">{calYear}</p>
        </div>
        <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-500 transition-all">
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-7 px-3 pt-3">
        {DAYS.map((d) => <div key={d} className="text-center text-[9px] font-bold text-slate-300 pb-2 uppercase tracking-wide">{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1 px-3 pb-3">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dayApps = byDay[day.toString()] ?? [];
          const isToday = today.getDate() === day && today.getMonth() === calMonth && today.getFullYear() === calYear;
          const hasPending = dayApps.some((a) => a.status === LeaveStatus.PENDING);
          const hasApproved = dayApps.some((a) => a.status === LeaveStatus.APPROVED);
          return (
            <div key={i} className="min-h-[56px] p-1 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50/80 transition-all group">
              <div className="flex items-center justify-between mb-0.5">
                <span className={`inline-flex w-5 h-5 items-center justify-center text-[10px] font-bold rounded-full ${isToday ? 'bg-[#0f766e] text-white' : 'text-slate-600'}`}>
                  {day}
                </span>
                {dayApps.length > 0 && (
                  <span className={`w-1.5 h-1.5 rounded-full ${hasPending ? 'bg-amber-400' : hasApproved ? 'bg-teal-400' : 'bg-slate-300'}`} />
                )}
              </div>
              <div className="space-y-0.5">
                {dayApps.slice(0, 2).map((a) => {
                  const m = STATUS_META[a.status];
                  return (
                    <div
                      key={a.id}
                      onClick={() => onSelect(a)}
                      className={`text-[8px] font-semibold px-1 py-0.5 rounded cursor-pointer truncate ${m.bg} ${m.text} hover:opacity-80 transition-opacity`}
                    >
                      {getEmployeeName(a).split(' ')[0]}
                    </div>
                  );
                })}
                {dayApps.length > 2 && (
                <p className="text-[8px] text-slate-400 px-1 font-medium">
                  +
                  {dayApps.length - 2}
                  {' '}
                  more
                </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Request Card ──────────────────────────────────────────────────
function RequestCard({ app, onSelect }: { app: ILeaveApplication; onSelect: () => void }) {
  const meta = STATUS_META[app.status];
  const name = getEmployeeName(app);
  const days = getDays(app);

  return (
    <div
      onClick={onSelect}
      className="group relative flex items-center gap-4 px-5 py-4 hover:bg-slate-50/80 transition-all cursor-pointer border-b border-slate-100/80 last:border-0"
    >
      <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${meta.dot}`} />

      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${avatarGradient(name)} text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-sm`}>
        {initials(name)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-slate-800 truncate">{name}</span>
          <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${meta.bg} ${meta.text} ${meta.border}`}>
            {meta.icon}
            <span className="ml-0.5">{meta.label}</span>
          </span>
          {app.half_day && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">½ Day</span>}
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-[10px] font-semibold text-slate-500">{getLeaveTypeName(app)}</span>
          {app.employee?.employee_code && (
          <>
            <span className="text-slate-300">·</span>
            <span className="text-[10px] text-slate-400">{app.employee.employee_code}</span>
          </>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <CalendarDays size={10} className="text-slate-400" />
          <span className="text-[10px] text-slate-400">
            {fmtShort(app.from_date)}
            {' '}
            –
            {' '}
            {fmtShort(app.to_date)}
          </span>
        </div>
      </div>

      <div className="flex-shrink-0 text-right hidden sm:block">
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 mb-2">
          <span className="text-xs font-bold text-teal-700">{days}</span>
          <span className="text-[9px] text-teal-500 font-medium">
            day
            {days !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${meta.dot}`} style={{ width: `${Math.min((days / 14) * 100, 100)}%` }} />
        </div>
      </div>

      <span className="text-[10px] text-slate-300 group-hover:text-teal-500 transition-colors flex-shrink-0 font-bold">→</span>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────
type ViewMode = 'list' | 'calendar' | 'chart';

const ALL_STATUSES = [LeaveStatus.PENDING, LeaveStatus.APPROVED, LeaveStatus.REJECTED, LeaveStatus.CANCELLED];

export default function RequestsTab() {
  const params = useParams();
  const subdomain = params?.subdomain as string;

  const [apps, setApps] = useState<ILeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | 'ALL'>('ALL');
  const [selectedApp, setSelectedApp] = useState<ILeaveApplication | null>(null);

  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());

  useEffect(() => { if (subdomain) fetchApps(); }, [subdomain]);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await getLeaveApplications(subdomain);
      const raw: ILeaveApplication[] = Array.isArray(res?.data?.data) ? res.data.data
        : Array.isArray(res?.data) ? res.data : [];
      setApps(raw);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const filtered = useMemo(() => {
    let list = apps;
    if (statusFilter !== 'ALL') list = list.filter((a) => a.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) => getEmployeeName(a).toLowerCase().includes(q)
        || getLeaveTypeName(a).toLowerCase().includes(q)
        || (a.employee?.employee_code ?? '').toLowerCase().includes(q));
    }
    return list;
  }, [apps, statusFilter, search]);

  const stats = useMemo(() => ({
    total: apps.length,
    pending: apps.filter((a) => a.status === LeaveStatus.PENDING).length,
    approved: apps.filter((a) => a.status === LeaveStatus.APPROVED).length,
    rejected: apps.filter((a) => a.status === LeaveStatus.REJECTED).length,
  }), [apps]);

  const STAT_CARDS = [
    {
      label: 'Total', value: stats.total, icon: Users, accent: 'from-slate-50 to-slate-100', text: 'text-slate-700',
    },
    {
      label: 'Pending', value: stats.pending, icon: Clock3, accent: 'from-amber-50 to-amber-100', text: 'text-amber-700',
    },
    {
      label: 'Approved', value: stats.approved, icon: CheckCircle2, accent: 'from-teal-50 to-emerald-100', text: 'text-teal-700',
    },
    {
      label: 'Rejected', value: stats.rejected, icon: XCircle, accent: 'from-red-50 to-rose-100', text: 'text-red-600',
    },
  ];

  return (
    <div className="space-y-5 mt-4">

      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Leave Requests</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {stats.total}
            {' '}
            total ·
            {' '}
            {stats.pending}
            {' '}
            pending approval
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee"
              className="pl-8 pr-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all w-44"
            />
          </div>
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 text-[12px] font-bold rounded-lg transition-all ${statusFilter === 'ALL' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              All
            </button>
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 text-[12px] font-bold rounded-lg transition-all capitalize ${statusFilter === s ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {STATUS_META[s].label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            {([['list', LayoutList], ['calendar', CalendarDays], ['chart', BarChart2]] as [ViewMode, any][]).map(([v, Icon]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`p-2 rounded-lg transition-all ${view === v ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STAT_CARDS.map((s) => (
          <div key={s.label} className={`bg-gradient-to-br ${s.accent} border border-white rounded-2xl px-4 py-3.5 shadow-sm flex items-center gap-3`}>
            <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center flex-shrink-0 shadow-sm">
              <s.icon size={15} className={s.text} />
            </div>
            <div>
              <p className={`text-xl font-bold leading-none ${s.text}`}>{s.value}</p>
              <p className="text-[12px] text-slate-500 mt-0.5 font-semibold">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={24} className="animate-spin text-teal-600" />
          <p className="text-xs text-slate-400 font-medium">Loading requests…</p>
        </div>
      ) : view === 'chart' ? (
        <ChartView apps={filtered} />
      ) : view === 'calendar' ? (
        <CalendarView
          apps={filtered}
          calMonth={calMonth}
          calYear={calYear}
          setCalMonth={setCalMonth}
          setCalYear={setCalYear}
          onSelect={(a) => setSelectedApp(a)}
        />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
            <Users size={24} className="text-slate-300" />
          </div>
          <p className="text-sm font-bold text-slate-400">No requests found</p>
          <p className="text-xs text-slate-300 mt-1">{search ? `No results for "${search}"` : 'Try adjusting your filters'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 bg-slate-50/50">
            <Calendar size={13} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">
              {filtered.length}
              {' '}
              request
              {filtered.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-2 ml-auto">
              {ALL_STATUSES.map((s) => {
                const count = filtered.filter((a) => a.status === s).length;
                if (!count) return null;
                const m = STATUS_META[s];
                return (
                  <span key={s} className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${m.bg} ${m.text}`}>
                    {count}
                    {' '}
                    {m.label}
                  </span>
                );
              })}
            </div>
          </div>

          {ALL_STATUSES.map((status) => {
            const group = filtered.filter((a) => a.status === status);
            if (!group.length) return null;
            const meta = STATUS_META[status];
            return (
              <div key={status}>
                <div className={`px-5 py-2 flex items-center justify-between ${meta.bg} border-y ${meta.border}`}>
                  <div className="flex items-center gap-2">
                    <span className={meta.text}>{meta.icon}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${meta.text}`}>{meta.label}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/60 ${meta.text}`}>{group.length}</span>
                </div>
                {group.map((a) => <RequestCard key={a.id} app={a} onSelect={() => setSelectedApp(a)} />)}
              </div>
            );
          })}
        </div>
      )}

      {selectedApp && (
        <ApprovalDrawer
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onDone={() => { setSelectedApp(null); fetchApps(); }}
        />
      )}
    </div>
  );
}
