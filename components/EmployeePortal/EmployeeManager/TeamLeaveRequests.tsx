'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  CheckCircle2, XCircle, Clock3, Loader2, X, AlertCircle,
  Search, CalendarDays, Users,
} from 'lucide-react';
import {
  approveRejectLeave,
  ILeaveApplication, ILeaveApprovalPayload, LeaveStatus,
} from '@/lib/service/leaveApplication';
import { getTeamLeaves } from '@/lib/service/employee';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const STATUS_META: Record<LeaveStatus, { label: string; bg: string; text: string; dot: string; border: string }> = {
  [LeaveStatus.PENDING]: {
    label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', border: 'border-amber-200',
  },
  [LeaveStatus.APPROVED]: {
    label: 'Approved', bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-500', border: 'border-teal-200',
  },
  [LeaveStatus.REJECTED]: {
    label: 'Rejected', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400', border: 'border-red-200',
  },
  [LeaveStatus.CANCELLED]: {
    label: 'Cancelled', bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400', border: 'border-gray-200',
  },
};

const AVATAR_COLORS = ['bg-[#0f766e]', 'bg-blue-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2)
    .toUpperCase();
}
function avatarColor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}
function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]}`;
}
function daysBetween(from: string, to: string) {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000) + 1;
}

function ApprovalDrawer({ app, onClose, onDone }: { app: ILeaveApplication; onClose: () => void; onDone: () => void }) {
  const params = useParams();
  const subdomain = params?.subdomain as string;
  const queryClient = useQueryClient();
  const [action, setAction] = useState<LeaveStatus>(LeaveStatus.APPROVED);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const meta = STATUS_META[app.status];
  const days = Number(app.total_days) || daysBetween(app.from_date, app.to_date);
  const employeeName = app.employee?.name || app.employee_name || 'Employee';

  const mutation = useMutation({
    mutationFn: async (payload: ILeaveApprovalPayload) => {
      return approveRejectLeave(app.id, payload, subdomain);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvalCounts'] });
      queryClient.invalidateQueries({ queryKey: ['teamApprovalCounts'] });
      onDone();
    },
    onError: (e: any) => {
      setErr(e?.response?.data?.message || 'Something went wrong.');
    },
    onSettled: () => {
      setSaving(false);
    },
  });

  const handleSubmit = async () => {
    if (action === LeaveStatus.REJECTED && !reason.trim()) { setErr('Rejection reason is required.'); return; }
    setSaving(true); setErr('');
    const payload: ILeaveApprovalPayload = action === LeaveStatus.REJECTED
      ? { status: action, rejection_reason: reason }
      : { status: action };
    mutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-full max-w-sm bg-white shadow-2xl flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-[#0f1f2e]">Review Leave Request</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X size={15} /></button>
        </div>
        <div className="px-5 py-4 border-b border-gray-50">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl ${avatarColor(employeeName)} text-white text-xs font-bold flex items-center justify-center`}>
              {initials(employeeName)}
            </div>
            <div>
              <p className="text-sm font-bold text-[#0f1f2e]">{employeeName}</p>
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.bg} ${meta.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                {meta.label}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Leave Type', value: app.leave_type?.name || app.leave_type_name || '—' },
              { label: 'Duration', value: `${days} day${days !== 1 ? 's' : ''}${app.half_day ? ' (Half)' : ''}` },
              { label: 'From', value: fmtDate(app.from_date) },
              { label: 'To', value: fmtDate(app.to_date) },
            ].map((r) => (
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
        {app.status === LeaveStatus.PENDING && (
          <div className="px-5 py-4 space-y-4 flex-1">
            <div className="grid grid-cols-2 gap-2">
              {([LeaveStatus.APPROVED, LeaveStatus.REJECTED] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAction(a)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    action === a ? a === LeaveStatus.APPROVED ? 'bg-teal-50 text-teal-700 border-teal-300' : 'bg-red-50 text-red-600 border-red-300'
                      : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300'}`}
                >
                  {a === LeaveStatus.APPROVED ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                  {a === LeaveStatus.APPROVED ? 'Approve' : 'Reject'}
                </button>
              ))}
            </div>
            {action === LeaveStatus.REJECTED && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Rejection Reason
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
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
                action === LeaveStatus.APPROVED ? 'bg-[#0f766e] hover:bg-[#0d6460]' : 'bg-red-500 hover:bg-red-600'}`}
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {' '}
                  Submitting...
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

function RequestRow({ app, onSelect }: { app: ILeaveApplication; onSelect: () => void }) {
  const meta = STATUS_META[app.status];
  const days = Number(app.total_days) || daysBetween(app.from_date, app.to_date);
  const employeeName = app.employee?.name || app.employee_name || '—';
  return (
    <div
      onClick={onSelect}
      className="group flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0"
    >
      <div className={`w-9 h-9 rounded-xl ${avatarColor(employeeName)} text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0`}>
        {initials(employeeName)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-[#0f1f2e] truncate">{employeeName}</span>
          <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${meta.bg} ${meta.text} ${meta.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
          {app.half_day && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">Half Day</span>}
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-[10px] text-gray-500 font-medium">{app.leave_type?.name || app.leave_type_name || '—'}</span>
          <span className="text-gray-300">·</span>
          <span className="text-[10px] text-gray-500">
            {fmtDate(app.from_date)}
            {' '}
            –
            {' '}
            {fmtDate(app.to_date)}
          </span>
          <span className="text-[10px] font-bold text-[#0f766e] bg-[#e8f5ee] px-1.5 py-0.5 rounded-full">
            {days}
            d
          </span>
        </div>
      </div>
      <span className="text-[10px] text-gray-400 group-hover:text-[#0f766e] transition-colors flex-shrink-0 hidden sm:block">View →</span>
    </div>
  );
}

export default function TeamLeaveRequests({ teamIds }: { teamIds: string[] }) {
  const params = useParams();
  const subdomain = params?.subdomain as string;
  const [apps, setApps] = useState<ILeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | 'ALL'>(LeaveStatus.PENDING);
  const [selectedApp, setSelectedApp] = useState<ILeaveApplication | null>(null);

  useEffect(() => { if (subdomain) fetchApps(LeaveStatus.PENDING); }, [subdomain]);

  const fetchApps = async (status: LeaveStatus | 'ALL') => {
    setLoading(true);
    try {
      const params = status !== 'ALL' ? { status } : undefined;
      const res = await getTeamLeaves(subdomain, params);
      const raw = Array.isArray(res?.data) ? res.data : (res?.data?.data ?? []);
      setApps(raw);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return apps;
    return apps.filter((a) => (a.employee?.name || a.employee_name || '').toLowerCase().includes(search.toLowerCase()));
  }, [apps, search]);

  const stats = useMemo(() => ({
    total: apps.length,
    pending: apps.filter((a) => a.status === LeaveStatus.PENDING).length,
    approved: apps.filter((a) => a.status === LeaveStatus.APPROVED).length,
    rejected: apps.filter((a) => a.status === LeaveStatus.REJECTED).length,
  }), [apps]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-gray-400">
          {stats.total}
          {' '}
          total ·
          {' '}
          {stats.pending}
          {' '}
          pending approval
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-7 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all w-36"
            />
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {(['ALL', LeaveStatus.PENDING, LeaveStatus.APPROVED, LeaveStatus.REJECTED] as const).map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); fetchApps(s); }}
                className={`px-2 py-1 text-[12px] font-bold rounded-lg transition-colors capitalize ${statusFilter === s ? 'bg-white text-[#0f766e] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {s === 'ALL' ? 'All' : STATUS_META[s].label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[
          {
            label: 'Total', value: stats.total, color: 'text-[#0f766e]', bg: 'bg-[#e8f5ee]', dot: 'bg-[#0f766e]',
          },
          {
            label: 'Pending', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-400',
          },
          {
            label: 'Approved', value: stats.approved, color: 'text-teal-600', bg: 'bg-teal-50', dot: 'bg-teal-500',
          },
          {
            label: 'Rejected', value: stats.rejected, color: 'text-red-500', bg: 'bg-red-50', dot: 'bg-red-400',
          },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl px-3 py-2 border border-gray-100`}>
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              <p className="text-[12px] font-bold text-gray-500 uppercase">{s.label}</p>
            </div>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-[#0f766e]" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl border border-gray-100">
          <Users size={28} className="text-gray-200 mb-2" />
          <p className="text-sm font-semibold text-gray-400">No requests found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {[LeaveStatus.PENDING, LeaveStatus.APPROVED, LeaveStatus.REJECTED, LeaveStatus.CANCELLED].map((status) => {
            const group = filtered.filter((a) => a.status === status);
            if (!group.length) return null;
            const meta = STATUS_META[status];
            return (
              <div key={status}>
                <div className={`px-4 py-2 flex items-center justify-between ${meta.bg} border-b ${meta.border}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wide ${meta.text}`}>{meta.label}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/60 ${meta.text}`}>{group.length}</span>
                </div>
                {group.map((a) => <RequestRow key={a.id} app={a} onSelect={() => setSelectedApp(a)} />)}
              </div>
            );
          })}
        </div>
      )}
      {selectedApp && (
        <ApprovalDrawer app={selectedApp} onClose={() => setSelectedApp(null)} onDone={() => { setSelectedApp(null); fetchApps(statusFilter); }} />
      )}
    </div>
  );
}
