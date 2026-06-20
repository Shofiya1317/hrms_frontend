'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  CheckCircle2, XCircle, Clock, Loader2, X, AlertCircle,
  RefreshCw, Search, Users, Calendar, Filter, ChevronDown,
  CalendarDays, Clock3, Award,
} from 'lucide-react';
import {
  getTeamCompOffs,
  approveRejectCompOff,
  ICompOff,
  IApproveRejectCompOffPayload,
  CompOffStatus,
} from '@/lib/service/compOff';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const STATUS_META: Record<string, {
  label: string; color: string; bg: string;
  border: string; dot: string; icon: React.ReactNode;
}> = {
  [CompOffStatus.PENDING]: {
    label: 'Pending', color: '#b45309', bg: '#fffbeb', border: '#fde68a', dot: 'bg-amber-400', icon: <Clock3 size={10} />,
  },
  [CompOffStatus.APPROVED]: {
    label: 'Approved', color: '#0f766e', bg: '#f0fdf9', border: '#99f6e4', dot: 'bg-teal-500', icon: <CheckCircle2 size={10} />,
  },
  [CompOffStatus.REJECTED]: {
    label: 'Rejected', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', dot: 'bg-red-400', icon: <XCircle size={10} />,
  },
  [CompOffStatus.CANCELLED]: {
    label: 'Cancelled', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', dot: 'bg-slate-400', icon: <X size={10} />,
  },
  [CompOffStatus.EXPIRED]: {
    label: 'Expired', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', dot: 'bg-slate-300', icon: <Clock size={10} />,
  },
};

const ALL_STATUSES = [
  CompOffStatus.PENDING,
  CompOffStatus.APPROVED,
  CompOffStatus.REJECTED,
  CompOffStatus.CANCELLED,
  CompOffStatus.EXPIRED,
];

const AVATAR_COLORS = [
  'from-teal-400 to-teal-600', 'from-blue-400 to-blue-600',
  'from-violet-400 to-violet-600', 'from-rose-400 to-rose-600',
  'from-amber-400 to-amber-600', 'from-indigo-400 to-indigo-600',
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getEmployeeName(item: ICompOff): string {
  if (!item.employee) return '—';
  if (item.employee.name) return item.employee.name;
  return `${item.employee.first_name ?? ''} ${item.employee.last_name ?? ''}`.trim() || '—';
}

function initials(name: string): string {
  return name.split(' ').filter(Boolean).map((w) => w[0]).join('')
    .slice(0, 2)
    .toUpperCase();
}

function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ─────────────────────────────────────────────
// Approval Drawer
// ─────────────────────────────────────────────

function ApprovalDrawer({
  item, onClose, onDone,
}: {
  item: ICompOff; onClose: () => void; onDone: () => void;
}) {
  const params = useParams();
  const tenantId = params?.subdomain as string;
  const name = getEmployeeName(item);

  const [action, setAction] = useState<'approved' | 'rejected'>('approved');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const meta = STATUS_META[item.status] ?? STATUS_META[CompOffStatus.PENDING];

  const handleSubmit = async () => {
    if (action === 'rejected' && !reason.trim()) {
      setErr('Rejection reason is required.'); return;
    }
    setSaving(true); setErr('');
    try {
      const payload: IApproveRejectCompOffPayload = action === 'rejected'
        ? { status: 'rejected', rejection_reason: reason }
        : { status: 'approved' };
      await approveRejectCompOff(item.id, payload, tenantId);
      onDone();
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-[360px] bg-white shadow-2xl flex flex-col overflow-y-auto border-l border-slate-100">

        {/* Top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-teal-400 via-teal-500 to-emerald-500" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Review Comp Off</h2>
            <p className="text-xs text-slate-400 mt-0.5">Comp off request details</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Employee + request info */}
        <div className="px-5 py-4 border-b border-slate-50">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${avatarColor(name)} text-white text-xs font-bold flex items-center justify-center shadow-sm flex-shrink-0`}>
              {initials(name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{name}</p>
              {item.employee?.employee_code && (
                <p className="text-[10px] text-slate-400">{item.employee.employee_code}</p>
              )}
              {item.employee?.designation && (
                <p className="text-[10px] text-slate-400">{item.employee.designation}</p>
              )}
            </div>
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border"
              style={{ color: meta.color, backgroundColor: meta.bg, borderColor: meta.border }}
            >
              {meta.icon}
              <span className="ml-0.5">{meta.label}</span>
            </span>
          </div>

          {/* Detail grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Date Worked', value: formatDate(item.worked_date) },
              { label: 'Hours Worked', value: formatHours(item.worked_hours) },
            //   { label: 'Comp Off Date', value: formatDate(item.comp_off_date) },
            //   { label: 'Applied On',    value: formatDate(item.created_at) },
            ].map((r) => (
              <div key={r.label} className="bg-slate-50 rounded-xl px-3 py-2.5">
                <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide">{r.label}</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{r.value}</p>
              </div>
            ))}
          </div>

          {/* Reason */}
          <div className="mt-2 bg-slate-50 rounded-xl px-3 py-2.5">
            <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide mb-1">Reason</p>
            <p className="text-xs text-slate-600 leading-relaxed">{item.reason || '—'}</p>
          </div>

          {/* Expiry */}
          {item.expires_on && (
            <div className="mt-2 bg-amber-50 rounded-xl px-3 py-2.5 border border-amber-100">
              <p className="text-[9px] text-amber-600 font-semibold uppercase tracking-wide mb-1">Expires On</p>
              <p className="text-xs text-amber-700 font-bold">{formatDate(item.expires_on)}</p>
            </div>
          )}

          {/* Prior rejection reason */}
          {item.status === CompOffStatus.REJECTED && item.rejection_reason && (
            <div className="mt-2 bg-red-50 rounded-xl px-3 py-2.5 border border-red-100">
              <p className="text-[9px] text-red-400 font-semibold uppercase tracking-wide mb-1">Rejection Reason</p>
              <p className="text-xs text-red-600 leading-relaxed">{item.rejection_reason}</p>
            </div>
          )}
        </div>

        {/* Action (only for pending) */}
        {item.status === CompOffStatus.PENDING && (
          <div className="px-5 py-4 space-y-4 flex-1">
            <p className="text-xs font-semibold text-slate-500">Select action</p>

            <div className="grid grid-cols-2 gap-2">
              {(['approved', 'rejected'] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAction(a)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold border-2 transition-all ${
                    action === a
                      ? a === 'approved'
                        ? 'bg-teal-50 text-teal-700 border-teal-400 shadow-sm'
                        : 'bg-red-50 text-red-600 border-red-400 shadow-sm'
                      : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {a === 'approved' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  {a === 'approved' ? 'Approve' : 'Reject'}
                </button>
              ))}
            </div>

            {action === 'rejected' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  Rejection Reason
                  {' '}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Enter reason for rejection…"
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
                action === 'approved'
                  ? 'bg-teal-600 hover:bg-teal-700'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {saving
                ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    {' '}
                    Submitting…
                  </>
                )
                : action === 'approved'
                  ? (
                    <>
                      <CheckCircle2 size={14} />
                      {' '}
                      Approve Request
                    </>
                  )
                  : (
                    <>
                      <XCircle size={14} />
                      {' '}
                      Reject Request
                    </>
                  )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Request Row Card
// ─────────────────────────────────────────────

function RequestRow({ item, onSelect }: { item: ICompOff; onSelect: () => void }) {
  const name = getEmployeeName(item);
  const meta = STATUS_META[item.status] ?? STATUS_META[CompOffStatus.PENDING];

  return (
    <div
      onClick={onSelect}
      className="group relative flex items-center gap-4 px-5 py-4 hover:bg-slate-50/80 transition-all cursor-pointer border-b border-slate-100/80 last:border-0"
    >
      {/* Left accent on hover */}
      <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${meta.dot}`} />

      {/* Avatar */}
      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${avatarColor(name)} text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-sm`}>
        {initials(name)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-slate-800 truncate">{name}</span>
          <span
            className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border"
            style={{ color: meta.color, backgroundColor: meta.bg, borderColor: meta.border }}
          >
            {meta.icon}
            <span className="ml-0.5">{meta.label}</span>
          </span>
          {item.is_availed && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">Used</span>
          )}
        </div>

        {item.employee?.employee_code && (
          <p className="text-[10px] text-slate-400 mt-0.5">{item.employee.employee_code}</p>
        )}

        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            <CalendarDays size={10} />
            Worked:
            {' '}
            <span className="font-medium text-slate-600">{formatDate(item.worked_date)}</span>
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            <Clock size={10} />
            <span className="font-medium text-slate-600">{formatHours(item.worked_hours)}</span>
          </span>
        </div>

        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{item.reason}</p>
      </div>

      {/* Right meta */}
      <div className="flex-shrink-0 text-right hidden sm:block">
        {/* <p className="text-[10px] text-slate-400">Comp off date</p> */}
        <p className="text-[11px] font-semibold text-slate-700">{formatDate(item.comp_off_date)}</p>
        <p className="text-[10px] text-slate-400 mt-1">Applied</p>
        <p className="text-[11px] font-medium text-slate-500">{formatDate(item.created_at)}</p>
      </div>

      <span className="text-[10px] text-slate-300 group-hover:text-teal-500 transition-colors flex-shrink-0 font-bold">→</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Filters Bar
// ─────────────────────────────────────────────

interface Filters {
  status: string;
  search: string;
  from_worked_date: string;
  to_worked_date: string;
}

function FiltersBar({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const [showDate, setShowDate] = useState(false);
  const set = (k: keyof Filters, v: string) => onChange({ ...filters, [k]: v });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative">
        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          placeholder="Search employee…"
          className="pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all w-40"
        />
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
        <button
          onClick={() => set('status', 'ALL')}
          className={`px-2.5 py-1 text-[9px] font-bold rounded-lg transition-all ${
            filters.status === 'ALL' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          All
        </button>
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => set('status', s)}
            className={`px-2.5 py-1 text-[9px] font-bold rounded-lg transition-all capitalize ${
              filters.status === s ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {STATUS_META[s]?.label ?? s}
          </button>
        ))}
      </div>

      {/* Date range toggle */}
      <button
        onClick={() => setShowDate((p) => !p)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
          filters.from_worked_date || filters.to_worked_date
            ? 'border-teal-400 bg-teal-50 text-teal-700'
            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}
      >
        <Filter size={11} />
        {' '}
        Date range
        <ChevronDown size={11} className={`transition-transform ${showDate ? 'rotate-180' : ''}`} />
      </button>

      {showDate && (
        <>
          <input
            type="date"
            value={filters.from_worked_date}
            onChange={(e) => set('from_worked_date', e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-teal-500"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={filters.to_worked_date}
            onChange={(e) => set('to_worked_date', e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-teal-500"
          />
          {(filters.from_worked_date || filters.to_worked_date) && (
            <button
              onClick={() => onChange({ ...filters, from_worked_date: '', to_worked_date: '' })}
              className="text-xs text-red-400 hover:text-red-600 font-medium"
            >
              Clear
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export default function TeamCompOffRequests() {
  const params = useParams();
  const tenantId = params?.subdomain as string;

  const [items, setItems] = useState<ICompOff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState<ICompOff | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [filters, setFilters] = useState<Filters>({
    status: 'ALL',
    search: '',
    from_worked_date: '',
    to_worked_date: '',
  });

  useEffect(() => { if (tenantId) fetchTeam(); }, [tenantId]);

  const fetchTeam = async () => {
    setLoading(true); setError('');
    try {
      // Build query params — only pass non-empty values
      const params: Record<string, string> = {};
      if (filters.status !== 'ALL') params.status = filters.status;
      if (filters.from_worked_date) params.from_worked_date = filters.from_worked_date;
      if (filters.to_worked_date) params.to_worked_date = filters.to_worked_date;

      const res = await getTeamCompOffs(tenantId, params);
      const raw: ICompOff[] = Array.isArray(res?.data?.data) ? res.data.data
        : Array.isArray(res?.data) ? res.data : [];
      setItems(raw);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load team requests.');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when date filters change (server-side)
  useEffect(() => {
    if (tenantId) fetchTeam();
  }, [filters.status, filters.from_worked_date, filters.to_worked_date]);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Client-side filter for search (employee name/code)
  const filtered = useMemo(() => {
    if (!filters.search.trim()) return items;
    const q = filters.search.toLowerCase();
    return items.filter((item) => {
      const name = getEmployeeName(item).toLowerCase();
      const code = item.employee?.employee_code?.toLowerCase() ?? '';
      return name.includes(q) || code.includes(q);
    });
  }, [items, filters.search]);

  // Stats
  const stats = useMemo(() => ({
    total: items.length,
    pending: items.filter((i) => i.status === CompOffStatus.PENDING).length,
    approved: items.filter((i) => i.status === CompOffStatus.APPROVED).length,
    rejected: items.filter((i) => i.status === CompOffStatus.REJECTED).length,
  }), [items]);

  // Grouped by status for display
  const groups = useMemo(() => {
    const order = [CompOffStatus.PENDING, CompOffStatus.APPROVED, CompOffStatus.REJECTED, CompOffStatus.CANCELLED, CompOffStatus.EXPIRED];
    return order.map((status) => ({
      status,
      list: filtered.filter((i) => i.status === status),
    })).filter((g) => g.list.length > 0);
  }, [filtered]);

  const STAT_CARDS = [
    {
      label: 'Total Requests', value: stats.total, icon: Users, accent: 'from-slate-50 to-slate-100', text: 'text-slate-700',
    },
    {
      label: 'Pending', value: stats.pending, icon: Clock3, accent: 'from-amber-50 to-amber-100', text: 'text-amber-700',
    },
    {
      label: 'Approved', value: stats.approved, icon: CheckCircle2, accent: 'from-teal-50 to-emerald-50', text: 'text-teal-700',
    },
    {
      label: 'Rejected', value: stats.rejected, icon: XCircle, accent: 'from-red-50 to-rose-100', text: 'text-red-600',
    },
  ];

  return (
    <div className="space-y-4">

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-in slide-in-from-top-2 duration-300 ${
          toast.type === 'success' ? 'bg-white border-emerald-200 text-emerald-700' : 'bg-white border-red-200 text-red-600'
        }`}
        >
          {toast.type === 'success' ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Team Comp Off Requests</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {stats.total}
            {' '}
            total ·
            {stats.pending}
            {' '}
            pending your approval
          </p>
        </div>
        <button
          onClick={fetchTeam}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-all self-start sm:self-auto"
        >
          <RefreshCw size={12} />
          {' '}
          Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STAT_CARDS.map((s) => (
          <div key={s.label} className={`bg-gradient-to-br ${s.accent} border border-white rounded-2xl px-4 py-3.5 shadow-sm flex items-center gap-3`}>
            <div className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center flex-shrink-0 shadow-sm">
              <s.icon size={15} className={s.text} />
            </div>
            <div>
              <p className={`text-xl font-bold leading-none ${s.text}`}>{s.value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <FiltersBar filters={filters} onChange={setFilters} />

      {/* ── Content ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={24} className="animate-spin text-teal-600" />
          <p className="text-xs text-slate-400 font-medium">Loading team requests…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
            <AlertCircle size={20} className="text-red-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">{error}</p>
            <p className="text-xs text-slate-400 mt-1">Please try again</p>
          </div>
          <button
            onClick={fetchTeam}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-all"
          >
            <RefreshCw size={13} />
            {' '}
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
            <Users size={22} className="text-slate-300" />
          </div>
          <p className="text-sm font-bold text-slate-400">No requests found</p>
          <p className="text-xs text-slate-300 mt-1">
            {filters.search ? `No results for "${filters.search}"` : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* List header */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 bg-slate-50/50">
            <Calendar size={13} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">
              {filtered.length}
              {' '}
              request
              {filtered.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              {ALL_STATUSES.map((s) => {
                const count = filtered.filter((i) => i.status === s).length;
                if (!count) return null;
                const m = STATUS_META[s];
                return (
                  <span
                    key={s}
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{ color: m.color, backgroundColor: m.bg }}
                  >
                    {count}
                    {' '}
                    {m.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Grouped rows */}
          {groups.map(({ status, list }) => {
            const meta = STATUS_META[status];
            return (
              <div key={status}>
                {/* Group header */}
                <div
                  className="px-5 py-2 flex items-center justify-between border-y"
                  style={{ backgroundColor: meta.bg, borderColor: meta.border }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ color: meta.color }}>{meta.icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: meta.color }}>
                      {meta.label}
                    </span>
                  </div>
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/60"
                    style={{ color: meta.color }}
                  >
                    {list.length}
                  </span>
                </div>

                {/* Rows */}
                {list.map((item) => (
                  <RequestRow key={item.id} item={item} onSelect={() => setSelectedItem(item)} />
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Approval Drawer ── */}
      {selectedItem && (
        <ApprovalDrawer
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onDone={() => {
            setSelectedItem(null);
            showToast(
              `Request ${selectedItem.status === CompOffStatus.PENDING ? 'processed' : 'updated'} successfully.`,
              'success',
            );
            fetchTeam();
          }}
        />
      )}
    </div>
  );
}
