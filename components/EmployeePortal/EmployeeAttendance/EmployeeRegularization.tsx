'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  CheckCircle2, XCircle, Clock, Loader2, X, AlertCircle,
  Calendar, Search, Plus, Trash2, FileText,
} from 'lucide-react';
import {
  getRegularizations, createRegularization, deleteRegularization,
  IRegularization, RegularizationStatus, ICreateRegularizationPayload,
} from '@/lib/service/regularization';
import { getAttendances } from '@/lib/service/attendance';

const STATUS_META: Record<RegularizationStatus, { label: string; bg: string; text: string; dot: string; border: string; icon: any }> = {
  [RegularizationStatus.PENDING]:  { label: 'Pending',  bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400',  border: 'border-amber-200',  icon: Clock },
  [RegularizationStatus.APPROVED]: { label: 'Approved', bg: 'bg-teal-50',   text: 'text-teal-700',   dot: 'bg-teal-500',   border: 'border-teal-200',   icon: CheckCircle2 },
  [RegularizationStatus.REJECTED]: { label: 'Rejected', bg: 'bg-red-50',    text: 'text-red-600',    dot: 'bg-red-400',    border: 'border-red-200',    icon: XCircle },
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtTime(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function CreateRequestDrawer({ onClose, onDone, attendanceLogs }: {
  onClose: () => void;
  onDone: () => void;
  attendanceLogs: any[];
}) {
  const params = useParams();
  const subdomain = params?.subdomain as string;
  const [attendanceLogId, setAttendanceLogId] = useState('');
  const [requestedCheckIn, setRequestedCheckIn] = useState('');
  const [requestedCheckOut, setRequestedCheckOut] = useState('');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const selectedLog = attendanceLogs.find(log => log.id === attendanceLogId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendanceLogId) { setErr('Please select an attendance log'); return; }
    setSaving(true); setErr('');
    try {
      const payload: ICreateRegularizationPayload = {
        attendance_log_id: attendanceLogId,
        remarks,
      };
      
      // Convert time to ISO 8601 datetime format
      if (requestedCheckIn && selectedLog) {
        const date = new Date(selectedLog.attendance_date);
        const [hours, minutes] = requestedCheckIn.split(':');
        date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        payload.requested_check_in = date.toISOString();
      }
      
      if (requestedCheckOut && selectedLog) {
        const date = new Date(selectedLog.attendance_date);
        const [hours, minutes] = requestedCheckOut.split(':');
        date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        payload.requested_check_out = date.toISOString();
      }
      
      await createRegularization(payload, subdomain);
      onDone();
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Failed to create request');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-[#0f1f2e]">New Regularization Request</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={15} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Select Attendance Log *</label>
            <select
              value={attendanceLogId}
              onChange={e => setAttendanceLogId(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all">
              <option value="">-- Select date --</option>
              {attendanceLogs.map(log => (
                <option key={log.id} value={log.id}>
                  {fmtDate(log.attendance_date)} - {log.attendance_status}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Requested Check-in (Optional)</label>
            <input
              type="time"
              value={requestedCheckIn}
              onChange={e => setRequestedCheckIn(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Requested Check-out (Optional)</label>
            <input
              type="time"
              value={requestedCheckOut}
              onChange={e => setRequestedCheckOut(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Remarks *</label>
            <textarea
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              required
              rows={4}
              placeholder="Explain why you need regularization..."
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all resize-none" />
          </div>
          {err && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle size={13} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-600">{err}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white bg-[#0f766e] hover:bg-[#0d6460] transition-colors disabled:opacity-60">
            {saving ? <><Loader2 size={14} className="animate-spin" /> Submitting...</> : <><Plus size={14} /> Create Request</>}
          </button>
        </form>
      </div>
    </div>
  );
}

function RequestCard({ req, onDelete }: { req: IRegularization; onDelete: (id: string) => void }) {
  const params = useParams();
  const subdomain = params?.subdomain as string;
  const [deleting, setDeleting] = useState(false);
  const meta = STATUS_META[req.status];
  const Icon = meta.icon;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to cancel this request?')) return;
    setDeleting(true);
    try {
      await deleteRegularization(req.id, subdomain);
      onDelete(req.id);
    } catch (error) {
      alert('Failed to cancel request');
    } finally { setDeleting(false); }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0`}>
            <Icon size={16} className={meta.text} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-[#0f1f2e]">
                {fmtDate(req.attendance_date)}
              </p>
              <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${meta.bg} ${meta.text} ${meta.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                {meta.label}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Original: {fmtTime(req.original_check_in)} – {fmtTime(req.original_check_out)}
            </p>
            <p className="text-[10px] text-teal-600 font-medium">
              Requested: {fmtTime(req.requested_check_in)} – {fmtTime(req.requested_check_out)}
            </p>
            <p className="text-xs text-gray-600 mt-2">{req.remarks}</p>
          </div>
        </div>
        {req.status === RegularizationStatus.PENDING && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors disabled:opacity-50">
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </button>
        )}
      </div>
      {req.rejection_reason && req.status === RegularizationStatus.REJECTED && (
        <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg p-2.5">
          <AlertCircle size={12} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-600">
            <span className="font-semibold">Rejection reason:</span> {req.rejection_reason}
          </p>
        </div>
      )}
      {req.reviewed_at && req.status !== RegularizationStatus.PENDING && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-[10px] text-gray-400">
            Reviewed by {req.reviewed_by_name || 'Manager'} on {fmtDate(req.reviewed_at)}
          </p>
        </div>
      )}
    </div>
  );
}

export default function EmployeeRegularization() {
  const params = useParams();
  const subdomain = params?.subdomain as string;
  const [requests, setRequests] = useState<IRegularization[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RegularizationStatus | 'ALL'>('ALL');
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);

  useEffect(() => { if (subdomain) { fetchRequests(); fetchAttendanceLogs(); } }, [subdomain]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await getRegularizations(subdomain, { limit: 100 });
      const raw = Array.isArray(res?.data) ? res.data : (res?.data?.data ?? []);
      setRequests(raw);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const fetchAttendanceLogs = async () => {
    try {
      const res = await getAttendances(subdomain, { limit: 30 });
      const raw = Array.isArray(res?.data) ? res.data : (res?.data?.data ?? []);
      setAttendanceLogs(raw);
    } catch { /* silent */ }
  };

  const filtered = useMemo(() => {
    let list = requests;
    if (statusFilter !== 'ALL') list = list.filter(r => r.status === statusFilter);
    if (search.trim()) list = list.filter(r => r.remarks?.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [requests, statusFilter, search]);

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter(r => r.status === RegularizationStatus.PENDING).length,
    approved: requests.filter(r => r.status === RegularizationStatus.APPROVED).length,
    rejected: requests.filter(r => r.status === RegularizationStatus.REJECTED).length,
  }), [requests]);

  const handleCreateDone = () => {
    setShowCreateDrawer(false);
    fetchRequests();
  };

  const handleDelete = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#0f1f2e]">Attendance Regularization</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {stats.total} requests · {stats.pending} pending · {stats.approved} approved
          </p>
        </div>
        <button
          onClick={() => setShowCreateDrawer(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#0f766e] rounded-xl hover:bg-[#0d6460] transition-colors">
          <Plus size={14} />
          New Request
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-7 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all" />
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {(['ALL', RegularizationStatus.PENDING, RegularizationStatus.APPROVED, RegularizationStatus.REJECTED] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-2 py-1 text-[9px] font-bold rounded-lg transition-colors capitalize ${statusFilter === s ? 'bg-white text-[#0f766e] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {s === 'ALL' ? 'All' : STATUS_META[s]?.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Total', value: stats.total, color: 'text-[#0f766e]', bg: 'bg-[#e8f5ee]', dot: 'bg-[#0f766e]' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-400' },
          { label: 'Approved', value: stats.approved, color: 'text-teal-600', bg: 'bg-teal-50', dot: 'bg-teal-500' },
          { label: 'Rejected', value: stats.rejected, color: 'text-red-500', bg: 'bg-red-50', dot: 'bg-red-400' },
        ].map(s => (
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
        <div className="flex justify-center py-12">
          <Loader2 size={20} className="animate-spin text-[#0f766e]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl border border-gray-100">
          <FileText size={28} className="text-gray-200 mb-2" />
          <p className="text-sm font-semibold text-gray-400">No regularization requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => (
            <RequestCard key={req.id} req={req} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showCreateDrawer && (
        <CreateRequestDrawer
          onClose={() => setShowCreateDrawer(false)}
          onDone={handleCreateDone}
          attendanceLogs={attendanceLogs}
        />
      )}
    </div>
  );
}
