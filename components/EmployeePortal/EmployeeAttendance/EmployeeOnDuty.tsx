'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  MapPin, Plus, X, Loader2, CheckCircle2, XCircle,
  Clock, AlertCircle, Pencil, CalendarDays, FileText, Clock3,
} from 'lucide-react';
import {
  getMyOnDutyApplications, applyOnDuty, updateOnDuty, cancelOnDuty,
  IOnDuty, OnDutyStatus, OnDutyType,
  IApplyOnDutyPayload, IUpdateOnDutyPayload,
} from '@/lib/service/onduty';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const STATUS_META: Record<OnDutyStatus, {
  label: string; bg: string; text: string; dot: string; border: string; icon: any;
}> = {
  [OnDutyStatus.PENDING]:   { label: 'Pending',   bg: 'bg-amber-50',  text: 'text-amber-700', dot: 'bg-amber-400', border: 'border-amber-200',  icon: Clock        },
  [OnDutyStatus.APPROVED]:  { label: 'Approved',  bg: 'bg-teal-50',   text: 'text-teal-700',  dot: 'bg-teal-500',  border: 'border-teal-200',   icon: CheckCircle2 },
  [OnDutyStatus.REJECTED]:  { label: 'Rejected',  bg: 'bg-red-50',    text: 'text-red-600',   dot: 'bg-red-400',   border: 'border-red-200',    icon: XCircle      },
  [OnDutyStatus.CANCELLED]: { label: 'Cancelled', bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-300', border: 'border-slate-200',  icon: X            },
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function toInputDate(iso: string) {
  return iso?.split('T')[0] ?? '';
}

// ─────────────────────────────────────────────
// Apply / Edit Modal
// ─────────────────────────────────────────────

interface ModalProps {
  editing: IOnDuty | null;
  tenantId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function ApplyModal({ editing, tenantId, onClose, onSuccess }: ModalProps) {
  const isEdit = !!editing;

  const [date,      setDate]      = useState(editing ? toInputDate(editing.date) : '');
  const [type,      setType]      = useState<OnDutyType>(editing?.onduty_type ?? OnDutyType.FULL_DAY);
  const [fromTime,  setFromTime]  = useState(editing?.from_time ?? '');
  const [toTime,    setToTime]    = useState(editing?.to_time ?? '');
  const [purpose,   setPurpose]   = useState(editing?.purpose ?? '');
  const [location,  setLocation]  = useState(editing?.location ?? '');
  const [remarks,   setRemarks]   = useState(editing?.remarks ?? '');
  const [saving,    setSaving]    = useState(false);
  const [err,       setErr]       = useState('');

  const handleSubmit = async () => {
    if (!date)            { setErr('Date is required.');     return; }
    if (!purpose.trim())  { setErr('Purpose is required.');  return; }
    if (!location.trim()) { setErr('Location is required.'); return; }
    if (type === OnDutyType.PARTIAL && (!fromTime || !toTime)) {
      setErr('From and To times are required for partial on-duty.'); return;
    }
    setSaving(true); setErr('');
    try {
      if (isEdit) {
        const payload: IUpdateOnDutyPayload = {
          date, onduty_type: type, purpose, location, remarks,
          from_time: type === OnDutyType.PARTIAL ? fromTime : null,
          to_time:   type === OnDutyType.PARTIAL ? toTime   : null,
        };
        await updateOnDuty(editing!.id, payload, tenantId);
      } else {
        const payload: IApplyOnDutyPayload = {
          date, onduty_type: type, purpose, location, remarks,
          from_time: type === OnDutyType.PARTIAL ? fromTime : null,
          to_time:   type === OnDutyType.PARTIAL ? toTime   : null,
        };
        await applyOnDuty(payload, tenantId);
      }
      onSuccess();
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally { setSaving(false); }
  };

  const inputCls = "w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className={`h-1 w-full ${isEdit ? 'bg-amber-400' : 'bg-gradient-to-r from-teal-400 to-emerald-500'}`} />

        <div className="p-5 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 6rem)' }}>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isEdit ? 'bg-amber-50' : 'bg-teal-50'}`}>
                {isEdit ? <Pencil size={15} className="text-amber-600" /> : <MapPin size={15} className="text-teal-600" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{isEdit ? 'Edit On-Duty' : 'Apply for On-Duty'}</h3>
                <p className="text-[10px] text-slate-400">{isEdit ? 'Update your request' : 'Submit an on-duty request'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
              <X size={15} />
            </button>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Date <span className="text-red-500">*</span>
            </label>
            <input type="date" value={date} min={new Date().toISOString().split('T')[0]}
              onChange={e => setDate(e.target.value)} className={inputCls} />
          </div>

          {/* Type toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {([OnDutyType.FULL_DAY, OnDutyType.PARTIAL] as const).map(t => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                    type === t
                      ? 'bg-teal-50 text-teal-700 border-teal-300'
                      : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300'
                  }`}>
                  {t === OnDutyType.FULL_DAY ? 'Full Day' : 'Partial'}
                </button>
              ))}
            </div>
          </div>

          {/* Time range (partial only) */}
          {type === OnDutyType.PARTIAL && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  From <span className="text-red-500">*</span>
                </label>
                <input type="time" value={fromTime} onChange={e => setFromTime(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  To <span className="text-red-500">*</span>
                </label>
                <input type="time" value={toTime} onChange={e => setToTime(e.target.value)} className={inputCls} />
              </div>
            </div>
          )}

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Location <span className="text-red-500">*</span>
            </label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Client Office, Bangalore" className={inputCls} />
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Purpose <span className="text-red-500">*</span>
            </label>
            <textarea value={purpose} onChange={e => setPurpose(e.target.value)} rows={3}
              placeholder="e.g. Client meeting to discuss Q4 delivery…"
              className={`${inputCls} resize-none`} />
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Remarks</label>
            <input type="text" value={remarks} onChange={e => setRemarks(e.target.value)}
              placeholder="Optional additional notes" className={inputCls} />
          </div>

          {err && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle size={13} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-600">{err}</p>
            </div>
          )}

          <div className="flex gap-2.5 pt-1">
            <button onClick={onClose} disabled={saving}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={saving}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition-all shadow-sm ${
                isEdit ? 'bg-amber-500 hover:bg-amber-600' : 'bg-teal-600 hover:bg-teal-700'
              }`}>
              {saving
                ? <><Loader2 size={13} className="animate-spin" /> {isEdit ? 'Updating…' : 'Submitting…'}</>
                : isEdit ? 'Update Request' : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Cancel Confirm Modal
// ─────────────────────────────────────────────

function CancelModal({ req, tenantId, onClose, onSuccess }: {
  req: IOnDuty; tenantId: string; onClose: () => void; onSuccess: () => void;
}) {
  const [cancelling, setCancelling] = useState(false);
  const [err, setErr] = useState('');

  const handleCancel = async () => {
    setCancelling(true); setErr('');
    try {
      await cancelOnDuty(req.id, tenantId);
      onSuccess();
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Failed to cancel. Please try again.');
    } finally { setCancelling(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
            <X size={20} className="text-red-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Cancel On-Duty Request</h3>
          <p className="text-xs text-slate-400 mb-1">Are you sure you want to cancel your on-duty request for</p>
          <p className="text-sm font-semibold text-slate-800 mb-4">{fmtDate(req.date)}?</p>
          {err && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mb-3 text-left">
              <AlertCircle size={13} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-600">{err}</p>
            </div>
          )}
          <div className="flex gap-2.5">
            <button onClick={onClose} disabled={cancelling}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">
              Keep it
            </button>
            <button onClick={handleCancel} disabled={cancelling}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-bold text-white disabled:opacity-60 transition-all">
              {cancelling ? <><Loader2 size={13} className="animate-spin" /> Cancelling…</> : 'Yes, Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Request Card
// ─────────────────────────────────────────────

function RequestCard({ req, onEdit, onCancel }: {
  req: IOnDuty; onEdit: (r: IOnDuty) => void; onCancel: (r: IOnDuty) => void;
}) {
  const meta = STATUS_META[req.status];
  const Icon = meta.icon;
  const isPending = req.status === OnDutyStatus.PENDING;

  return (
    <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
        <MapPin size={15} className={meta.text} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-slate-800">{fmtDate(req.date)}</span>
          <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${meta.bg} ${meta.text} ${meta.border}`}>
            <Icon size={9} /><span className="ml-0.5">{meta.label}</span>
          </span>
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
            req.onduty_type === OnDutyType.FULL_DAY ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
          }`}>
            {req.onduty_type === OnDutyType.FULL_DAY ? 'Full Day' : 'Partial'}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-0.5 flex-wrap text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <MapPin size={9} className="text-teal-500" /> {req.location}
          </span>
          {req.onduty_type === OnDutyType.PARTIAL && req.from_time && (
            <>
              <span className="text-gray-300">·</span>
              <span className="flex items-center gap-1">
                <Clock3 size={9} /> {req.from_time} – {req.to_time ?? '?'}
              </span>
            </>
          )}
        </div>

        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{req.purpose}</p>

        <div className="flex items-center gap-3 mt-1 flex-wrap text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <CalendarDays size={9} /> Applied {fmtDate(req.applied_on)}
          </span>
          {req.approved_at && (
            <span className="flex items-center gap-1 text-teal-600">
              <CheckCircle2 size={9} /> Approved {fmtDate(req.approved_at)}
            </span>
          )}
          {req.approver && (
            <span>by {req.approver.first_name} {req.approver.last_name}</span>
          )}
        </div>
        {req.rejection_reason && (
          <p className="text-[10px] text-red-500 mt-1">Reason: {req.rejection_reason}</p>
        )}
      </div>

      {isPending && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => onEdit(req)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="Edit">
            <Pencil size={13} />
          </button>
          <button onClick={() => onCancel(req)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Cancel">
            <X size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className="fixed top-4 right-4 z-[100]">
      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
        type === 'success' ? 'bg-white border-emerald-200 text-emerald-700' : 'bg-white border-red-200 text-red-600'
      }`}>
        {type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
        {msg}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────

export default function EmployeeOnDuty() {
  const params   = useParams();
  const tenantId = params?.subdomain as string;

  const [requests,     setRequests]     = useState<IOnDuty[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [statusFilter, setStatusFilter] = useState<OnDutyStatus | 'ALL'>('ALL');
  const [showApply,    setShowApply]    = useState(false);
  const [editingReq,   setEditingReq]   = useState<IOnDuty | null>(null);
  const [cancelReq,    setCancelReq]    = useState<IOnDuty | null>(null);
  const [toast,        setToast]        = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => { if (tenantId) fetchRequests(); }, [tenantId]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await getMyOnDutyApplications(tenantId);
      const raw: IOnDuty[] = Array.isArray(res?.data) ? res.data : (res?.data?.data ?? []);
      setRequests(raw);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSuccess = (msg: string) => {
    setShowApply(false); setEditingReq(null); setCancelReq(null);
    showToast(msg, 'success');
    fetchRequests();
  };

  const filtered = useMemo(() => {
    if (statusFilter === 'ALL') return requests;
    return requests.filter(r => r.status === statusFilter);
  }, [requests, statusFilter]);

  const stats = useMemo(() => ({
    total:    requests.length,
    pending:  requests.filter(r => r.status === OnDutyStatus.PENDING).length,
    approved: requests.filter(r => r.status === OnDutyStatus.APPROVED).length,
    rejected: requests.filter(r => r.status === OnDutyStatus.REJECTED).length,
  }), [requests]);

  const ALL_FILTER_STATUSES = [OnDutyStatus.PENDING, OnDutyStatus.APPROVED, OnDutyStatus.REJECTED, OnDutyStatus.CANCELLED];

  return (
    <>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0f1f2e]">My On-Duty Requests</h2>
            <p className="text-xs text-gray-400 mt-0.5">{stats.total} total · {stats.pending} pending</p>
          </div>
          <button onClick={() => setShowApply(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm shadow-teal-200">
            <Plus size={13} /> Apply On-Duty
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Total',    value: stats.total,    color: 'text-[#0f766e]', bg: 'bg-[#e8f5ee]', dot: 'bg-[#0f766e]' },
            { label: 'Pending',  value: stats.pending,  color: 'text-amber-600', bg: 'bg-amber-50',   dot: 'bg-amber-400' },
            { label: 'Approved', value: stats.approved, color: 'text-teal-600',  bg: 'bg-teal-50',    dot: 'bg-teal-500'  },
            { label: 'Rejected', value: stats.rejected, color: 'text-red-500',   bg: 'bg-red-50',     dot: 'bg-red-400'   },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl px-3 py-2 border border-white`}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                <p className="text-[9px] font-bold text-gray-500 uppercase">{s.label}</p>
              </div>
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          <button onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1 text-[9px] font-bold rounded-lg transition-colors ${statusFilter === 'ALL' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            All
          </button>
          {ALL_FILTER_STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 text-[9px] font-bold rounded-lg transition-colors ${statusFilter === s ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {STATUS_META[s].label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-teal-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-3">
              <FileText size={20} className="text-teal-300" />
            </div>
            <p className="text-sm font-semibold text-gray-400">
              {statusFilter === 'ALL' ? 'No on-duty requests yet' : `No ${STATUS_META[statusFilter as OnDutyStatus]?.label} requests`}
            </p>
            <p className="text-xs text-gray-300 mt-1">Click "Apply On-Duty" to submit your first request</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {filtered.map(req => (
              <RequestCard key={req.id} req={req} onEdit={r => setEditingReq(r)} onCancel={r => setCancelReq(r)} />
            ))}
          </div>
        )}
      </div>

      {(showApply || editingReq) && (
        <ApplyModal
          editing={editingReq}
          tenantId={tenantId}
          onClose={() => { setShowApply(false); setEditingReq(null); }}
          onSuccess={() => handleSuccess(editingReq ? 'On-duty request updated!' : 'On-duty request submitted!')}
        />
      )}
      {cancelReq && (
        <CancelModal req={cancelReq} tenantId={tenantId}
          onClose={() => setCancelReq(null)}
          onSuccess={() => handleSuccess('On-duty request cancelled.')} />
      )}
    </>
  );
}