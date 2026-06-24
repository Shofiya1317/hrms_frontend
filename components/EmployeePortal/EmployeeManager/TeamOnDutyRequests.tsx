'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  CheckCircle2, XCircle, Clock, Loader2, X, AlertCircle,
  Search, MapPin, FileText, Clock3,
} from 'lucide-react';
import {
  getTeamOnDutyApplications, approveRejectOnDuty,
  IOnDuty, OnDutyStatus, OnDutyType, IApproveRejectOnDutyPayload,
} from '@/lib/service/onduty';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const STATUS_META: Record<OnDutyStatus, {
  label: string; bg: string; text: string; dot: string; border: string; icon: any;
}> = {
  [OnDutyStatus.PENDING]: {
    label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', border: 'border-amber-200', icon: Clock,
  },
  [OnDutyStatus.APPROVED]: {
    label: 'Approved', bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-500', border: 'border-teal-200', icon: CheckCircle2,
  },
  [OnDutyStatus.REJECTED]: {
    label: 'Rejected', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400', border: 'border-red-200', icon: XCircle,
  },
  [OnDutyStatus.CANCELLED]: {
    label: 'Cancelled', bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400', border: 'border-slate-200', icon: X,
  },
};

const ALL_STATUSES = [OnDutyStatus.PENDING, OnDutyStatus.APPROVED, OnDutyStatus.REJECTED, OnDutyStatus.CANCELLED];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDateTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function getEmployeeName(req: IOnDuty) {
  if (req.employee?.first_name || req.employee?.last_name) {
    return `${req.employee.first_name ?? ''} ${req.employee.last_name ?? ''}`.trim();
  }
  return 'Employee';
}

function initials(name: string) {
  return name.split(' ').filter(Boolean).map((w) => w[0]).join('')
    .slice(0, 2)
    .toUpperCase();
}

const AVATAR_COLORS = [
  'from-teal-400 to-teal-600', 'from-blue-400 to-blue-600',
  'from-violet-400 to-violet-600', 'from-rose-400 to-rose-600',
  'from-amber-400 to-amber-600', 'from-indigo-400 to-indigo-600',
];

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

// ─────────────────────────────────────────────
// Approval Drawer
// ─────────────────────────────────────────────

function ApprovalDrawer({ req, onClose, onDone }: {
  req: IOnDuty; onClose: () => void; onDone: () => void;
}) {
  const params = useParams();
  const tenantId = params?.subdomain as string;
  const name = getEmployeeName(req);
  const meta = STATUS_META[req.status];

  const [action, setAction] = useState<OnDutyStatus.APPROVED | OnDutyStatus.REJECTED>(OnDutyStatus.APPROVED);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async () => {
    if (action === OnDutyStatus.REJECTED && !reason.trim()) {
      setErr('Rejection reason is required.'); return;
    }
    setSaving(true); setErr('');
    try {
      const payload: IApproveRejectOnDutyPayload = action === OnDutyStatus.REJECTED
        ? { status: OnDutyStatus.REJECTED, rejection_reason: reason }
        : { status: OnDutyStatus.APPROVED };
      await approveRejectOnDuty(req.id, payload, tenantId);
      onDone();
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Something went wrong.');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-full max-w-sm bg-white shadow-2xl flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-[#0f1f2e]">Review On-Duty Request</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-gray-50 space-y-3">
          {/* Employee */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarColor(name)} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}>
              {initials(name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#0f1f2e] truncate">{name}</p>
              {req.employee?.employee_code && (
                <p className="text-[10px] text-gray-400">{req.employee.employee_code}</p>
              )}
            </div>
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.bg} ${meta.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
              {meta.label}
            </span>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Date', value: fmtDate(req.date) },
              { label: 'Type', value: req.onduty_type === OnDutyType.FULL_DAY ? 'Full Day' : 'Partial' },
              { label: 'Applied On', value: fmtDate(req.applied_on) },
              { label: 'Approved At', value: fmtDateTime(req.approved_at) },
            ].map((r) => (
              <div key={r.label} className="bg-gray-50 rounded-xl px-3 py-2">
                <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wide">{r.label}</p>
                <p className="text-xs font-bold text-[#0f1f2e] mt-0.5">{r.value}</p>
              </div>
            ))}
          </div>

          {/* Partial times */}
          {req.onduty_type === OnDutyType.PARTIAL && (req.from_time || req.to_time) && (
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'From', value: req.from_time ?? '—' },
                { label: 'To', value: req.to_time ?? '—' },
              ].map((r) => (
                <div key={r.label} className="bg-gray-50 rounded-xl px-3 py-2">
                  <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wide">{r.label}</p>
                  <p className="text-xs font-bold text-[#0f1f2e] mt-0.5">{r.value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="bg-gray-50 rounded-xl px-3 py-2">
            <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wide mb-0.5 flex items-center gap-1">
              <MapPin size={9} />
              {' '}
              Location
            </p>
            <p className="text-xs font-bold text-[#0f1f2e]">{req.location}</p>
          </div>
          <div className="bg-gray-50 rounded-xl px-3 py-2">
            <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Purpose</p>
            <p className="text-xs text-gray-600">{req.purpose}</p>
          </div>
          {req.remarks && (
            <div className="bg-gray-50 rounded-xl px-3 py-2">
              <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Remarks</p>
              <p className="text-xs text-gray-600">{req.remarks}</p>
            </div>
          )}
          {req.status === OnDutyStatus.REJECTED && req.rejection_reason && (
            <div className="bg-red-50 rounded-xl px-3 py-2 border border-red-100">
              <p className="text-[9px] text-red-400 font-semibold uppercase tracking-wide mb-0.5">Rejection Reason</p>
              <p className="text-xs text-red-600">{req.rejection_reason}</p>
            </div>
          )}
        </div>

        {/* Actions — pending only */}
        {req.status === OnDutyStatus.PENDING && (
          <div className="px-5 py-4 space-y-4 flex-1">
            <div className="grid grid-cols-2 gap-2">
              {([OnDutyStatus.APPROVED, OnDutyStatus.REJECTED] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAction(a)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    action === a
                      ? a === OnDutyStatus.APPROVED
                        ? 'bg-teal-50 text-teal-700 border-teal-300'
                        : 'bg-red-50 text-red-600 border-red-300'
                      : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {a === OnDutyStatus.APPROVED ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                  {a === OnDutyStatus.APPROVED ? 'Approve' : 'Reject'}
                </button>
              ))}
            </div>

            {action === OnDutyStatus.REJECTED && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Rejection Reason
                  {' '}
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
                action === OnDutyStatus.APPROVED ? 'bg-[#0f766e] hover:bg-[#0d6460]' : 'bg-red-500 hover:bg-red-600'
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
                : action === OnDutyStatus.APPROVED
                  ? (
                    <>
                      <CheckCircle2 size={14} />
                      {' '}
                      Approve On-Duty
                    </>
                  )
                  : (
                    <>
                      <XCircle size={14} />
                      {' '}
                      Reject On-Duty
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
// Request Row
// ─────────────────────────────────────────────

function RequestRow({ req, onSelect }: { req: IOnDuty; onSelect: () => void }) {
  const meta = STATUS_META[req.status];
  const Icon = meta.icon;
  const name = getEmployeeName(req);

  return (
    <div
      onClick={onSelect}
      className="group flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0"
    >
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarColor(name)} text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0`}>
        {initials(name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-[#0f1f2e] truncate">{name}</span>
          <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${meta.bg} ${meta.text} ${meta.border}`}>
            <Icon size={9} />
            <span className="ml-0.5">{meta.label}</span>
          </span>
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
            req.onduty_type === OnDutyType.FULL_DAY ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
          }`}
          >
            {req.onduty_type === OnDutyType.FULL_DAY ? 'Full Day' : 'Partial'}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {req.employee?.employee_code && (
            <>
              <span className="text-[10px] text-gray-500 font-medium">{req.employee.employee_code}</span>
              <span className="text-gray-300">·</span>
            </>
          )}
          <span className="flex items-center gap-1 text-[10px] text-gray-500">
            <MapPin size={9} className="text-teal-500" />
            {' '}
            {req.location}
          </span>
          <span className="text-gray-300">·</span>
          <span className="text-[10px] text-gray-500">{fmtDate(req.date)}</span>
          {req.onduty_type === OnDutyType.PARTIAL && req.from_time && (
            <>
              <span className="text-gray-300">·</span>
              <span className="flex items-center gap-1 text-[10px] text-gray-500">
                <Clock3 size={9} />
                {' '}
                {req.from_time}
                {' '}
                –
                {' '}
                {req.to_time ?? '?'}
              </span>
            </>
          )}
        </div>
        {req.purpose && (
          <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{req.purpose}</p>
        )}
      </div>
      <span className="text-[10px] text-gray-400 group-hover:text-[#0f766e] transition-colors flex-shrink-0 hidden sm:block">View →</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────

export default function TeamOnDutyRequests() {
  const params = useParams();
  const tenantId = params?.subdomain as string;

  const [requests, setRequests] = useState<IOnDuty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OnDutyStatus | 'ALL'>(OnDutyStatus.PENDING);
  const [selected, setSelected] = useState<IOnDuty | null>(null);

  useEffect(() => { if (tenantId) fetchRequests(OnDutyStatus.PENDING); }, [tenantId]);

  const fetchRequests = async (status: OnDutyStatus | 'ALL') => {
    setLoading(true);
    try {
      const params = status !== 'ALL' ? { status } : undefined;
      const res = await getTeamOnDutyApplications(tenantId, params);
      const raw: IOnDuty[] = Array.isArray(res?.data) ? res.data : (res?.data?.data ?? []);
      setRequests(raw);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return requests;
    const q = search.toLowerCase();
    return requests.filter((r) => getEmployeeName(r).toLowerCase().includes(q)
      || r.employee?.employee_code?.toLowerCase().includes(q)
      || r.location?.toLowerCase().includes(q)
      || r.purpose?.toLowerCase().includes(q));
  }, [requests, search]);

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((r) => r.status === OnDutyStatus.PENDING).length,
    approved: requests.filter((r) => r.status === OnDutyStatus.APPROVED).length,
    rejected: requests.filter((r) => r.status === OnDutyStatus.REJECTED).length,
  }), [requests]);

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
              className="pl-7 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all w-36"
            />
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {(['ALL', ...ALL_STATUSES] as const).map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); fetchRequests(s); }}
                className={`px-2 py-1 text-[9px] font-bold rounded-lg transition-colors capitalize ${
                  statusFilter === s ? 'bg-white text-[#0f766e] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
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
              <p className="text-[9px] font-bold text-gray-500 uppercase">{s.label}</p>
            </div>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-[#0f766e]" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl border border-gray-100">
          <FileText size={28} className="text-gray-200 mb-2" />
          <p className="text-sm font-semibold text-gray-400">No on-duty requests found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {ALL_STATUSES.map((status) => {
            const group = filtered.filter((r) => r.status === status);
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
                {group.map((req) => (
                  <RequestRow key={req.id} req={req} onSelect={() => setSelected(req)} />
                ))}
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <ApprovalDrawer req={selected} onClose={() => setSelected(null)} onDone={() => { setSelected(null); fetchRequests(statusFilter); }} />
      )}
    </div>
  );
}
