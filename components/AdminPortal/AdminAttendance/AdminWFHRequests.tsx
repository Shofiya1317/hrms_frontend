'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  CheckCircle2, XCircle, Clock, Loader2, X,
  Search, Home, FileText,
} from 'lucide-react';
import {
  getAllWFHRequests,
  IWFH, WFHStatus,
} from '@/lib/service/wfh';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const STATUS_META: Record<WFHStatus, {
  label: string; bg: string; text: string; dot: string; border: string; icon: any;
}> = {
  [WFHStatus.PENDING]: {
    label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', border: 'border-amber-200', icon: Clock,
  },
  [WFHStatus.APPROVED]: {
    label: 'Approved', bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-500', border: 'border-teal-200', icon: CheckCircle2,
  },
  [WFHStatus.REJECTED]: {
    label: 'Rejected', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400', border: 'border-red-200', icon: XCircle,
  },
  [WFHStatus.CANCELLED]: {
    label: 'Cancelled', bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400', border: 'border-slate-200', icon: X,
  },
};

const ALL_STATUSES = [WFHStatus.PENDING, WFHStatus.APPROVED, WFHStatus.REJECTED, WFHStatus.CANCELLED];

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
// Review Drawer
// ─────────────────────────────────────────────

function ReviewDrawer({ req, onClose }: {
  req: IWFH; onClose: () => void;
}) {
  const name = req.employee?.name ?? '—';
  const meta = STATUS_META[req.status];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-y-auto">

        {/* Top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-teal-400 to-emerald-500" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-[#0f1f2e]">WFH Request</h2>
            <p className="text-xs text-gray-400 mt-0.5">Review and take action</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Employee + details */}
        <div className="px-5 py-4 border-b border-gray-50 space-y-3">
          {/* Employee row */}
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${avatarColor(name)} text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-sm`}>
              {initials(name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#0f1f2e] truncate">{name}</p>
              {req.employee?.employee_code && (
                <p className="text-[10px] text-gray-400">{req.employee.employee_code}</p>
              )}
            </div>
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${meta.bg} ${meta.text} ${meta.border}`}>
              {meta.label}
            </span>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'WFH Date', value: fmtDate(req.date) },
              { label: 'Applied On', value: fmtDate(req.applied_on) },
              { label: 'Approved At', value: fmtDateTime(req.approved_at) },
              { label: 'Approver', value: req.approver?.name ?? '—' },
            ].map((r) => (
              <div key={r.label} className="bg-slate-50 rounded-xl px-3 py-2.5">
                <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide">{r.label}</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{r.value}</p>
              </div>
            ))}
          </div>

          {/* Reason */}
          <div className="bg-slate-50 rounded-xl px-3 py-2.5">
            <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide mb-1">Reason</p>
            <p className="text-xs text-slate-600 leading-relaxed">{req.reason || '—'}</p>
          </div>

          {/* Rejection reason (if already rejected) */}
          {req.status === WFHStatus.REJECTED && req.rejection_reason && (
            <div className="bg-red-50 rounded-xl px-3 py-2.5 border border-red-100">
              <p className="text-[9px] text-red-400 font-semibold uppercase tracking-wide mb-1">Rejection Reason</p>
              <p className="text-xs text-red-600 leading-relaxed">{req.rejection_reason}</p>
            </div>
          )}
        </div>


      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Request Row
// ─────────────────────────────────────────────

function RequestRow({ req, onSelect }: { req: IWFH; onSelect: () => void }) {
  const meta = STATUS_META[req.status];
  const Icon = meta.icon;
  const name = req.employee?.name ?? '—';

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
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {req.employee?.employee_code && (
            <>
              <span className="text-[12px] text-gray-500 font-medium">{req.employee.employee_code}</span>
              <span className="text-gray-300">·</span>
            </>
          )}
          <span className="flex items-center gap-1 text-[12px] text-gray-500">
            <Home size={9} className="text-teal-500" />
            WFH on
            {' '}
            <span className="font-semibold ml-0.5">{fmtDate(req.date)}</span>
          </span>
          <span className="text-gray-300">·</span>
          <span className="text-[12px] text-gray-400">
            Applied
            {fmtDate(req.applied_on)}
          </span>
        </div>
        {req.reason && (
          <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{req.reason}</p>
        )}
      </div>
      <span className="text-[10px] text-gray-400 group-hover:text-[#0f766e] transition-colors flex-shrink-0 hidden sm:block font-bold">
        View →
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export default function AdminWFHRequests() {
  const params = useParams();
  const tenantId = params?.subdomain as string;

  const [requests, setRequests] = useState<IWFH[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<WFHStatus | 'ALL'>('ALL');
  const [selected, setSelected] = useState<IWFH | null>(null);

  useEffect(() => { if (tenantId) fetchRequests(); }, [tenantId]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await getAllWFHRequests(tenantId);
      const raw: IWFH[] = Array.isArray(res?.data) ? res.data : (res?.data?.data ?? []);
      setRequests(raw);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const filtered = useMemo(() => {
    let list = requests;
    if (statusFilter !== 'ALL') list = list.filter((r) => r.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.employee?.name?.toLowerCase().includes(q)
        || r.employee?.employee_code?.toLowerCase().includes(q)
        || r.reason?.toLowerCase().includes(q));
    }
    return list;
  }, [requests, statusFilter, search]);

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((r) => r.status === WFHStatus.PENDING).length,
    approved: requests.filter((r) => r.status === WFHStatus.APPROVED).length,
    rejected: requests.filter((r) => r.status === WFHStatus.REJECTED).length,
  }), [requests]);

  return (
    <div className="space-y-4">

      {/* Sub-header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-gray-400">
          {stats.total}
          {' '}
          requests ·
          {stats.pending}
          {' '}
          pending approval
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative min-w-[150px]">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Employee"
              className=" pl-6 pr-1 py-2  text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all w-36"
            />
          </div>
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2 py-1 text-[12px] font-bold rounded-lg transition-colors ${statusFilter === 'ALL' ? 'bg-white text-[#0f766e] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              All
            </button>
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2 py-1 text-[12px] font-bold rounded-lg transition-colors capitalize ${statusFilter === s ? 'bg-white text-[#0f766e] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {STATUS_META[s].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stat chips */}
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

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={20} className="animate-spin text-[#0f766e]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl border border-gray-100">
          <FileText size={28} className="text-gray-200 mb-2" />
          <p className="text-sm font-semibold text-gray-400">No WFH requests found</p>
          <p className="text-xs text-gray-400 mt-1">{search ? `No results for "${search}"` : 'Try adjusting your filters'}</p>
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
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/60 ${meta.text}`}>
                    {group.length}
                  </span>
                </div>
                {group.map((req) => (
                  <RequestRow key={req.id} req={req} onSelect={() => setSelected(req)} />
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Drawer */}
      {selected && (
        <ReviewDrawer
          req={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
