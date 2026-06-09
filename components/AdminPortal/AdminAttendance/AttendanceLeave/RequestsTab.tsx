'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  CheckCircle2, XCircle, Clock3, Loader2, X, AlertCircle,
  ChevronLeft, ChevronRight, CalendarDays, LayoutList,
  BarChart2, Search, SlidersHorizontal, Users,
} from 'lucide-react';
import {
  getLeaveApplications, approveRejectLeave, cancelLeave,
  ILeaveApplication, LeaveStatus,
} from '@/lib/service/leaveApplication';

// ── constants ─────────────────────────────────────────────────────────────────
const STATUS_META: Record<LeaveStatus, { label: string; bg: string; text: string; dot: string; border: string }> = {
  PENDING:   { label: 'Pending',   bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400',  border: 'border-amber-200' },
  APPROVED:  { label: 'Approved',  bg: 'bg-teal-50',   text: 'text-teal-700',   dot: 'bg-teal-500',   border: 'border-teal-200' },
  REJECTED:  { label: 'Rejected',  bg: 'bg-red-50',    text: 'text-red-600',    dot: 'bg-red-400',    border: 'border-red-200' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-gray-100',  text: 'text-gray-500',   dot: 'bg-gray-400',   border: 'border-gray-200' },
};

const AVATAR_COLORS = [
  'bg-[#0f766e]','bg-blue-500','bg-violet-500','bg-rose-500',
  'bg-amber-500','bg-cyan-500','bg-pink-500','bg-indigo-500',
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}
function avatarColor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}
function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,'0')} ${MONTHS[d.getMonth()]}`;
}
function daysBetween(from: string, to: string) {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000) + 1;
}

// ── Approve / Reject Drawer ───────────────────────────────────────────────────
function ApprovalDrawer({
  app, onClose, onDone,
}: { app: ILeaveApplication; onClose: () => void; onDone: () => void }) {
  const params = useParams();
  const subdomain = params?.subdomain as string;
  const [action, setAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const meta = STATUS_META[app.status];
  const days = daysBetween(app.from_date, app.to_date);

  const handleSubmit = async () => {
    if (action === 'REJECTED' && !reason.trim()) { setErr('Rejection reason is required.'); return; }
    setSaving(true); setErr('');
    try {
      await approveRejectLeave(app.id, { status: action, rejection_reason: reason || undefined }, subdomain);
      onDone();
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Something went wrong.');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-full max-w-sm bg-white shadow-2xl flex flex-col overflow-y-auto">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-[#0f1f2e]">Review Leave Request</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X size={15} /></button>
        </div>

        {/* employee info */}
        <div className="px-5 py-4 border-b border-gray-50">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl ${avatarColor(app.employee_name)} text-white text-xs font-bold flex items-center justify-center`}>
              {initials(app.employee_name)}
            </div>
            <div>
              <p className="text-sm font-bold text-[#0f1f2e]">{app.employee_name ?? 'Employee'}</p>
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.bg} ${meta.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />{meta.label}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Leave Type', value: app.leave_type_name ?? '—' },
              { label: 'Duration',   value: `${days} day${days > 1 ? 's' : ''}${app.half_day ? ' (Half)' : ''}` },
              { label: 'From',       value: fmtDate(app.from_date) },
              { label: 'To',         value: fmtDate(app.to_date) },
            ].map(r => (
              <div key={r.label} className="bg-gray-50 rounded-xl px-3 py-2">
                <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wide">{r.label}</p>
                <p className="text-xs font-bold text-[#0f1f2e] mt-0.5">{r.value}</p>
              </div>
            ))}
          </div>
          {app.reason && (
            <div className="mt-2 bg-gray-50 rounded-xl px-3 py-2">
              <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Reason</p>
              <p className="text-xs text-gray-600">{app.reason}</p>
            </div>
          )}
        </div>

        {/* action */}
        {app.status === 'PENDING' && (
          <div className="px-5 py-4 space-y-4 flex-1">
            <div className="grid grid-cols-2 gap-2">
              {(['APPROVED', 'REJECTED'] as const).map(a => (
                <button
                  key={a}
                  onClick={() => setAction(a)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    action === a
                      ? a === 'APPROVED'
                        ? 'bg-teal-50 text-teal-700 border-teal-300'
                        : 'bg-red-50 text-red-600 border-red-300'
                      : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {a === 'APPROVED' ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                  {a === 'APPROVED' ? 'Approve' : 'Reject'}
                </button>
              ))}
            </div>
            {action === 'REJECTED' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows={3}
                  placeholder="Enter reason for rejection..."
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all resize-none"
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
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-60 ${
                action === 'APPROVED' ? 'bg-[#0f766e] hover:bg-[#0d6460]' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {saving
                ? <><Loader2 size={14} className="animate-spin" /> Submitting...</>
                : action === 'APPROVED' ? <><CheckCircle2 size={14} /> Approve Leave</> : <><XCircle size={14} /> Reject Leave</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Bar chart view ────────────────────────────────────────────────────────────
function ChartView({ apps }: { apps: ILeaveApplication[] }) {
  // group by month + status
  const monthData = useMemo(() => {
    const map: Record<number, Record<LeaveStatus, number>> = {};
    for (let i = 0; i < 12; i++) map[i] = { PENDING: 0, APPROVED: 0, REJECTED: 0, CANCELLED: 0 };
    apps.forEach(a => {
      const m = new Date(a.from_date).getMonth();
      if (map[m]) map[m][a.status]++;
    });
    return map;
  }, [apps]);

  const maxVal = Math.max(...Object.values(monthData).map(m => m.PENDING + m.APPROVED + m.REJECTED + m.CANCELLED), 1);

  // leave type distribution
  const byType = useMemo(() => {
    const map: Record<string, { name: string; count: number }> = {};
    apps.forEach(a => {
      const k = a.leave_type_id;
      if (!map[k]) map[k] = { name: a.leave_type_name ?? 'Unknown', count: 0 };
      map[k].count++;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [apps]);

  const typeMax = Math.max(...byType.map(t => t.count), 1);

  const BAR_COLORS: Record<LeaveStatus, string> = {
    APPROVED: '#0f766e', PENDING: '#f59e0b', REJECTED: '#ef4444', CANCELLED: '#9ca3af',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* monthly stacked bar */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-bold text-[#0f1f2e] mb-1">Monthly Applications</p>
        <p className="text-[10px] text-gray-400 mb-4">Stacked by status</p>
        <div className="flex items-end gap-1 h-32">
          {Object.entries(monthData).map(([mIdx, counts]) => {
            const total = counts.PENDING + counts.APPROVED + counts.REJECTED + counts.CANCELLED;
            const heightPct = total / maxVal;
            return (
              <div key={mIdx} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col-reverse rounded-t-sm overflow-hidden" style={{ height: `${Math.max(heightPct * 96, total > 0 ? 4 : 0)}px` }}>
                  {(['APPROVED','PENDING','REJECTED','CANCELLED'] as LeaveStatus[]).map(s =>
                    counts[s] > 0 ? (
                      <div key={s} style={{ flex: counts[s], backgroundColor: BAR_COLORS[s] }} title={`${s}: ${counts[s]}`} />
                    ) : null
                  )}
                </div>
                <span className="text-[8px] text-gray-400 font-medium">{MONTHS[Number(mIdx)]}</span>
              </div>
            );
          })}
        </div>
        {/* legend */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          {(['APPROVED','PENDING','REJECTED','CANCELLED'] as LeaveStatus[]).map(s => (
            <div key={s} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: BAR_COLORS[s] }} />
              <span className="text-[9px] text-gray-500 font-medium">{STATUS_META[s].label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* leave type breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-bold text-[#0f1f2e] mb-1">By Leave Type</p>
        <p className="text-[10px] text-gray-400 mb-4">Total applications</p>
        <div className="space-y-3">
          {byType.slice(0, 6).map((t, i) => {
            const pal = ['#0f766e','#3b82f6','#f59e0b','#8b5cf6','#ec4899','#06b6d4'][i % 6];
            return (
              <div key={t.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold text-gray-700 truncate">{t.name}</span>
                  <span className="text-[10px] font-bold text-gray-500 ml-2">{t.count}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(t.count / typeMax) * 100}%`, backgroundColor: pal }} />
                </div>
              </div>
            );
          })}
          {byType.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No data</p>}
        </div>
      </div>
    </div>
  );
}

// ── Calendar heatmap view ─────────────────────────────────────────────────────
function CalendarView({ apps, calMonth, calYear, setCalMonth, setCalYear, onSelect }: {
  apps: ILeaveApplication[]; calMonth: number; calYear: number;
  setCalMonth: (m: number) => void; setCalYear: (y: number) => void;
  onSelect: (a: ILeaveApplication) => void;
}) {
  const DAYS_SHORT = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const firstDow = new Date(calYear, calMonth, 1).getDay();
  const totalDays = new Date(calYear, calMonth + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDow).fill(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  // map ISO date → apps active on that day
  const byDay = useMemo(() => {
    const map: Record<string, ILeaveApplication[]> = {};
    apps.forEach(a => {
      const from = new Date(a.from_date);
      const to   = new Date(a.to_date);
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

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* month nav */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"><ChevronLeft size={14} /></button>
        <span className="text-sm font-bold text-[#0f1f2e]">{MONTH_FULL[calMonth]} {calYear}</span>
        <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"><ChevronRight size={14} /></button>
      </div>
      {/* headers */}
      <div className="grid grid-cols-7 border-b border-gray-50 px-2 pt-2">
        {DAYS_SHORT.map(d => <div key={d} className="text-center text-[9px] font-bold text-gray-300 pb-1">{d}</div>)}
      </div>
      {/* cells */}
      <div className="grid grid-cols-7 gap-1 p-2">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dayApps = byDay[day.toString()] ?? [];
          const isToday = today.getDate() === day && today.getMonth() === calMonth && today.getFullYear() === calYear;
          const hasPending  = dayApps.some(a => a.status === 'PENDING');
          const hasApproved = dayApps.some(a => a.status === 'APPROVED');

          return (
            <div key={i} className="relative group min-h-[52px] p-1 rounded-xl border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-all cursor-default">
              <span className={`inline-flex w-5 h-5 items-center justify-center text-[10px] font-bold rounded-full ${isToday ? 'bg-[#0f766e] text-white' : 'text-gray-600'}`}>
                {day}
              </span>
              <div className="mt-0.5 space-y-0.5">
                {dayApps.slice(0, 2).map(a => {
                  const m = STATUS_META[a.status];
                  return (
                    <div
                      key={a.id}
                      onClick={() => onSelect(a)}
                      className={`text-[8px] font-semibold px-1 py-0.5 rounded truncate cursor-pointer ${m.bg} ${m.text} hover:opacity-80`}
                    >
                      {a.employee_name?.split(' ')[0] ?? '—'}
                    </div>
                  );
                })}
                {dayApps.length > 2 && (
                  <div className="text-[8px] text-gray-400 px-1">+{dayApps.length - 2}</div>
                )}
              </div>
              {/* capacity dot */}
              {dayApps.length > 0 && (
                <div className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${hasPending ? 'bg-amber-400' : hasApproved ? 'bg-teal-400' : 'bg-gray-300'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── List row ──────────────────────────────────────────────────────────────────
function RequestRow({ app, onSelect }: { app: ILeaveApplication; onSelect: () => void }) {
  const meta = STATUS_META[app.status];
  const days = daysBetween(app.from_date, app.to_date);
  return (
    <div
      onClick={onSelect}
      className="group flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0"
    >
      <div className={`w-9 h-9 rounded-xl ${avatarColor(app.employee_name)} text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0`}>
        {initials(app.employee_name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-[#0f1f2e] truncate">{app.employee_name ?? '—'}</span>
          <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${meta.bg} ${meta.text} ${meta.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />{meta.label}
          </span>
          {app.half_day && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">Half Day</span>}
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-[10px] text-gray-500 font-medium">{app.leave_type_name ?? '—'}</span>
          <span className="text-gray-300">·</span>
          <span className="text-[10px] text-gray-500">{fmtDate(app.from_date)} – {fmtDate(app.to_date)}</span>
          <span className="text-[10px] font-bold text-[#0f766e] bg-[#e8f5ee] px-1.5 py-0.5 rounded-full">{days}d</span>
        </div>
      </div>
      {/* timeline bar */}
      <div className="hidden sm:flex items-center">
        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${app.status === 'APPROVED' ? 'bg-teal-500' : app.status === 'PENDING' ? 'bg-amber-400' : app.status === 'REJECTED' ? 'bg-red-400' : 'bg-gray-300'}`}
            style={{ width: `${Math.min((days / 10) * 100, 100)}%` }} />
        </div>
      </div>
      <span className="text-[10px] text-gray-400 group-hover:text-[#0f766e] transition-colors flex-shrink-0 hidden sm:block">View →</span>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
type ViewMode = 'list' | 'calendar' | 'chart';

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
  const [calYear,  setCalYear]  = useState(today.getFullYear());

  useEffect(() => { if (subdomain) fetchApps(); }, [subdomain]);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await getLeaveApplications(subdomain);
      const raw = Array.isArray(res?.data) ? res.data : (res?.data?.data ?? []);
      setApps(raw);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const filtered = useMemo(() => {
    let list = apps;
    if (statusFilter !== 'ALL') list = list.filter(a => a.status === statusFilter);
    if (search.trim()) list = list.filter(a => a.employee_name?.toLowerCase().includes(search.toLowerCase()) || a.leave_type_name?.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [apps, statusFilter, search]);

  const stats = useMemo(() => ({
    total:     apps.length,
    pending:   apps.filter(a => a.status === 'PENDING').length,
    approved:  apps.filter(a => a.status === 'APPROVED').length,
    rejected:  apps.filter(a => a.status === 'REJECTED').length,
  }), [apps]);

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#0f1f2e]">Leave Requests</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {stats.total} total · {stats.pending} pending approval
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* search */}
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
              className="pl-7 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all w-36" />
          </div>
          {/* status filter */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-2 py-1 text-[9px] font-bold rounded-lg transition-colors capitalize ${statusFilter === s ? 'bg-white text-[#0f766e] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {s === 'ALL' ? 'All' : STATUS_META[s].label}
              </button>
            ))}
          </div>
          {/* view toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {([['list', LayoutList], ['calendar', CalendarDays], ['chart', BarChart2]] as [ViewMode, any][]).map(([v, Icon]) => (
              <button key={v} onClick={() => setView(v)}
                className={`p-1.5 rounded-lg transition-colors ${view === v ? 'bg-white text-[#0f766e] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                <Icon size={13} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total',    value: stats.total,    color: 'text-[#0f766e]',  bg: 'bg-[#e8f5ee]', dot: 'bg-[#0f766e]' },
          { label: 'Pending',  value: stats.pending,  color: 'text-amber-600',  bg: 'bg-amber-50',  dot: 'bg-amber-400' },
          { label: 'Approved', value: stats.approved, color: 'text-teal-600',   bg: 'bg-teal-50',   dot: 'bg-teal-500' },
          { label: 'Rejected', value: stats.rejected, color: 'text-red-500',    bg: 'bg-red-50',    dot: 'bg-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 px-4 py-3 shadow-sm flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
            </div>
            <div>
              <p className={`text-lg font-bold leading-none ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={22} className="animate-spin text-[#0f766e]" />
        </div>
      ) : view === 'chart' ? (
        <ChartView apps={filtered} />
      ) : view === 'calendar' ? (
        <CalendarView
          apps={filtered}
          calMonth={calMonth} calYear={calYear}
          setCalMonth={setCalMonth} setCalYear={setCalYear}
          onSelect={a => setSelectedApp(a)}
        />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
          <Users size={32} className="text-gray-200 mb-3" />
          <p className="text-sm font-semibold text-gray-400">No requests found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* pending section first */}
          {['PENDING','APPROVED','REJECTED','CANCELLED'].map(status => {
            const group = filtered.filter(a => a.status === status);
            if (!group.length) return null;
            const meta = STATUS_META[status as LeaveStatus];
            return (
              <div key={status}>
                <div className={`px-4 py-2 flex items-center justify-between ${meta.bg} border-b ${meta.border}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wide ${meta.text}`}>{meta.label}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/60 ${meta.text}`}>{group.length}</span>
                </div>
                {group.map(a => (
                  <RequestRow key={a.id} app={a} onSelect={() => setSelectedApp(a)} />
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Approval Drawer ── */}
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
