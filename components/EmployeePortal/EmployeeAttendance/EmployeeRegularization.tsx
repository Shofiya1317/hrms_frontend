'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useParams } from 'next/navigation';
import {
  CheckCircle2, XCircle, Clock, Loader2, X, AlertCircle,
  Calendar, Search, Plus, Trash2, FileText,
} from 'lucide-react';
import {
  getMyRegularizations, createRegularization, deleteRegularization,
  IRegularization, RegularizationStatus, ICreateRegularizationPayload,
} from '@/lib/service/regularization';
import { getAttendances } from '@/lib/service/attendance';
import '@/components/OrganisationSetupForm/OrganisationSetupForm.css';

const STATUS_META: Record<RegularizationStatus, { label: string; bg: string; text: string; dot: string; border: string; icon: any }> = {
  [RegularizationStatus.PENDING]: {
    label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', border: 'border-amber-200', icon: Clock,
  },
  [RegularizationStatus.APPROVED]: {
    label: 'Approved', bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-500', border: 'border-teal-200', icon: CheckCircle2,
  },
  [RegularizationStatus.REJECTED]: {
    label: 'Rejected', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400', border: 'border-red-200', icon: XCircle,
  },
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtTime(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ─── Time Picker ──────────────────────────────────────────────────────────
// ─── TimePicker (custom scroll columns — no library quirks) ───────────────
function TimePicker({
  label,
  value,
  onChange,
  attendanceDate,   // 'YYYY-MM-DD' — needed to compute the maxTime cap
}: {
  label: string;
  value: string;           // '' | 'HH:MM'
  onChange: (v: string) => void;
  attendanceDate?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pendingH, setPendingH] = useState<number | null>(null);
  const [pendingM, setPendingM] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const hrRef  = useRef<HTMLDivElement>(null);
  const minRef = useRef<HTMLDivElement>(null);

  // ── helpers ──────────────────────────────────────────────────────────────
  const isToday = (dateStr?: string): boolean => {
    if (!dateStr) return false;
    const [y, m, d] = dateStr.split('-').map(Number);
    const t = new Date();
    return t.getFullYear() === y && t.getMonth() + 1 === m && t.getDate() === d;
  };

  /** Returns { h, m } cap only when the attendance date is today */
  // const maxHM = (): { h: number; m: number } | null => {
  //   if (!isToday(attendanceDate)) return null;
  //   const n = new Date();
  //   return { h: n.getHours(), m: n.getMinutes() };
  // };


  const maxHM = (): { h: number; m: number } | null => {
  return null;
};              /// this function could be change later for validation max time



  const isHourDisabled = (h: number) => {
    const cap = maxHM();
    return cap !== null && h > cap.h;
  };

  const isMinDisabled = (m: number) => {
    const cap = maxHM();
    if (!cap || pendingH === null) return false;
    return pendingH === cap.h && m > cap.m;
  };

  // ── open / close ─────────────────────────────────────────────────────────
  const openPicker = () => {
    if (!open) {
      // Seed pending state from current value (or now as a sensible default)
      if (value) {
        const [h, m] = value.split(':').map(Number);
        setPendingH(h); setPendingM(m);
      } else {
        const now = new Date();
        setPendingH(now.getHours()); setPendingM(now.getMinutes());
      }
    }
    setOpen((v) => !v);
  };

  // Scroll selected item into view after paint
  useEffect(() => {
    if (!open) return;
    const scroll = (ref: React.RefObject<HTMLDivElement>, sel: number) => {
      const item = ref.current?.querySelector<HTMLElement>(`[data-val="${sel}"]`);
      item?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    };
    setTimeout(() => {
      if (pendingH !== null) scroll(hrRef, pendingH);
      if (pendingM !== null) scroll(minRef, pendingM);
    }, 50);
  }, [open]);

  // Click-outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (open && wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // ── confirm / clear ───────────────────────────────────────────────────────
  const confirm = () => {
    if (pendingH !== null && pendingM !== null) {
      onChange(`${String(pendingH).padStart(2, '0')}:${String(pendingM).padStart(2, '0')}`);
    }
    setOpen(false);
  };

  const clear = () => {
    onChange('');
    setPendingH(null); setPendingM(null);
    setOpen(false);
  };

  // When the hour changes, clamp the minute if it now exceeds the cap
  const pickHour = (h: number) => {
    if (isHourDisabled(h)) return;
    const cap = maxHM();
    if (cap && h === cap.h && pendingM !== null && pendingM > cap.m) {
      setPendingM(cap.m);
    }
    setPendingH(h);
  };

  const pickMin = (m: number) => {
    if (isMinDisabled(m)) return;
    setPendingM(m);
  };

  const cap = maxHM();

  return (
    <div ref={wrapRef} className="relative">
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>

      {/* Trigger */}
      <button
        type="button"
        onClick={openPicker}
        className={`
          w-full flex items-center gap-2 px-3 py-2 text-sm
          bg-gray-50 border rounded-xl transition-all text-left
          ${open
            ? 'border-[#0f766e] ring-2 ring-[#0f766e]/20'
            : 'border-gray-200 hover:border-gray-300'}
        `}
      >
        <Clock size={13} className="text-gray-400 flex-shrink-0" />
        <span className={`flex-1 ${value ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
          {value || 'HH : MM'}
        </span>
        {value && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); clear(); }}
            onKeyDown={(e) => e.key === 'Enter' && clear()}
            className="text-gray-400 hover:text-red-500 text-base leading-none"
            aria-label="Clear time"
          >
            ×
          </span>
        )}
      </button>

      {/* Hint when today */}
      {cap && attendanceDate && (
        <p className="text-[10px] text-gray-400 mt-1">
          Max: {String(cap.h).padStart(2, '0')}:{String(cap.m).padStart(2, '0')} (now)
        </p>
      )}

      {/* Popup */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-2" style={{ height: 180 }}>
            {/* Hours column */}
            <div ref={hrRef} className="overflow-y-auto border-r border-gray-100 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
              <div className="sticky top-0 bg-white text-[9px] font-bold text-gray-400 text-center py-1.5 border-b border-gray-100 uppercase tracking-widest">
                Hour
              </div>
              {Array.from({ length: 24 }, (_, h) => (
                <button
                  key={h}
                  type="button"
                  data-val={h}
                  disabled={isHourDisabled(h)}
                  onClick={() => pickHour(h)}
                  className={`
                    w-full py-1.5 text-sm text-center transition-colors
                    ${pendingH === h
                      ? 'bg-[#0f766e] text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'}
                    ${isHourDisabled(h) ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {String(h).padStart(2, '0')}
                </button>
              ))}
            </div>

            {/* Minutes column */}
            <div ref={minRef} className="overflow-y-auto scroll-smooth" style={{ scrollbarWidth: 'none' }}>
              <div className="sticky top-0 bg-white text-[9px] font-bold text-gray-400 text-center py-1.5 border-b border-gray-100 uppercase tracking-widest">
                Min
              </div>
              {Array.from({ length: 60 }, (_, m) => (
                <button
                  key={m}
                  type="button"
                  data-val={m}
                  disabled={isMinDisabled(m)}
                  onClick={() => pickMin(m)}
                  className={`
                    w-full py-1.5 text-sm text-center transition-colors
                    ${pendingM === m
                      ? 'bg-[#0f766e] text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'}
                    ${isMinDisabled(m) ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {String(m).padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 px-3 py-2 border-t border-gray-100">
            <button
              type="button"
              onClick={clear}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={confirm}
              className="px-3 py-1.5 text-xs bg-[#0f766e] text-white rounded-lg hover:bg-[#0d6460]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Drawer ───────────────────────────────────────────────────────────────
function CreateRequestDrawer({ onClose, onDone, attendanceLogs }: {
  onClose: () => void;
  onDone: () => void;
  attendanceLogs: any[];
}) {
  const params = useParams();
  const subdomain = params?.subdomain as string;

  const [attendanceLogId, setAttendanceLogId] = useState('');
  const [remarks, setRemarks]                 = useState('');
  const [requestedCheckIn, setRequestedCheckIn]   = useState('');   // 'HH:MM' | ''
  const [requestedCheckOut, setRequestedCheckOut] = useState('');   // 'HH:MM' | ''
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  const selectedLog = attendanceLogs.find((l) => l.id === attendanceLogId);

  // Reset times whenever the log changes
  useEffect(() => {
    setRequestedCheckIn('');
    setRequestedCheckOut('');
    setErr('');
  }, [attendanceLogId]);

  // ── helpers ──────────────────────────────────────────────────────────────
  /**
   * Builds an ISO datetime string from a 'HH:MM' picker value + the
   * attendance record's 'YYYY-MM-DD' date, anchored in LOCAL time
   * (same as the IST-based backend logic). Clamps to "now" so a
   * future timestamp can never reach the backend even if the picker
   * is somehow bypassed.
   */
  const buildISO = (hhmm: string, attendanceDate: string): string => {
    const [h, m]          = hhmm.split(':').map(Number);
    const [y, mo, d]      = attendanceDate.split('-').map(Number);
    const dt              = new Date(y, mo - 1, d, h, m, 0, 0);
    const now             = new Date();
    return (dt > now ? now : dt).toISOString();
  };

  /** Returns true if 'HH:MM' exceeds the current wall-clock time on
   *  a "today" attendance date — final guard before submission. */
  const exceedsNow = (hhmm: string): boolean => {
    if (!selectedLog) return false;
    const [ly, lm, ld] = selectedLog.attendance_date.split('-').map(Number);
    const logDate = new Date(ly, lm - 1, ld);
    const today   = new Date();
    const isToday = (
      logDate.getFullYear() === today.getFullYear() &&
      logDate.getMonth()    === today.getMonth()    &&
      logDate.getDate()     === today.getDate()
    );
    if (!isToday) return false;
    const [h, m] = hhmm.split(':').map(Number);
    const now    = new Date();
    return h > now.getHours() || (h === now.getHours() && m > now.getMinutes());
  };

  // ── submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');

    if (!attendanceLogId || !selectedLog) {
      setErr('Please select an attendance date.');
      return;
    }

    // Client-side mirrors of every backend validation in the service
    if (requestedCheckIn && exceedsNow(requestedCheckIn)) {
      setErr('Requested check-in time cannot be later than the current time.');
      return;
    }
    if (requestedCheckOut && exceedsNow(requestedCheckOut)) {
      setErr('Requested check-out time cannot be later than the current time.');
      return;
    }
    if (requestedCheckIn && requestedCheckOut) {
      const [ch, cm] = requestedCheckIn.split(':').map(Number);
      const [oh, om] = requestedCheckOut.split(':').map(Number);
      if (oh < ch || (oh === ch && om <= cm)) {
        setErr('Check-out time must be after check-in time.');
        return;
      }
      const diffMin = (oh * 60 + om) - (ch * 60 + cm);
      if (diffMin > 24 * 60) {
        setErr('Worked duration cannot exceed 24 hours.');
        return;
      }
    }

    setSaving(true);
    try {
      const payload: ICreateRegularizationPayload = {
        attendance_log_id: attendanceLogId,
        ...(remarks.trim()         && { remarks: remarks.trim() }),
        ...(requestedCheckIn       && {
          requested_check_in:  buildISO(requestedCheckIn,  selectedLog.attendance_date),
        }),
        ...(requestedCheckOut      && {
          requested_check_out: buildISO(requestedCheckOut, selectedLog.attendance_date),
        }),
      };

      const res = await createRegularization(payload, subdomain);

      if (res?.data?.success === false) {
        const apiErr = res.data.error;
        setErr(Array.isArray(apiErr) ? apiErr[0] : (typeof apiErr === 'string' ? apiErr : 'Failed to create request'));
        return;
      }
      onDone();
    } catch {
      setErr('Failed to create request. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col h-full">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-[#0f1f2e]">New Regularization Request</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 px-5 py-4 space-y-4 overflow-y-auto overflow-x-visible">

          {/* Attendance log select */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Select Attendance Date *
            </label>
            <select
              value={attendanceLogId}
              onChange={(e) => setAttendanceLogId(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all"
            >
              <option value="">— Select date —</option>
              {attendanceLogs.map((log) => (
                <option key={log.id} value={log.id}>
                  {fmtDate(log.attendance_date)} · {log.attendance_status}
                  {log.check_in_time ? ` · in ${fmtTime(log.check_in_time)}` : ''}
                  {log.check_out_time ? ` out ${fmtTime(log.check_out_time)}` : ''}
                </option>
              ))}
            </select>

            {/* Show original times as a subtle reminder */}
            {selectedLog && (
              <p className="text-[10px] text-gray-400 mt-1.5 flex gap-3">
                <span>Original in: <strong>{fmtTime(selectedLog.check_in_time)}</strong></span>
                <span>Original out: <strong>{fmtTime(selectedLog.check_out_time)}</strong></span>
              </p>
            )}
          </div>

          {/* Time pickers side-by-side */}
          <div className="grid grid-cols-2 gap-3">
            <TimePicker
              label="Requested Check-in (optional)"
              value={requestedCheckIn}
              onChange={setRequestedCheckIn}
              attendanceDate={selectedLog?.attendance_date}
            />
            <TimePicker
              label="Requested Check-out (optional)"
              value={requestedCheckOut}
              onChange={setRequestedCheckOut}
              attendanceDate={selectedLog?.attendance_date}
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              placeholder="Explain why you need regularization…"
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] resize-none"
            />
          </div>

          {/* Error */}
          {err && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle size={13} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-600">{err}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white bg-[#0f766e] hover:bg-[#0d6460] disabled:opacity-60"
          >
            {saving
              ? <><Loader2 size={14} className="animate-spin" /> Submitting…</>
              : <><Plus size={14} /> Create Request</>}
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
              Original:
              {' '}
              {fmtTime(req.original_check_in)}
              {' '}
              –
              {' '}
              {fmtTime(req.original_check_out)}
            </p>
            <p className="text-[10px] text-teal-600 font-medium">
              Requested:
              {' '}
              {fmtTime(req.requested_check_in)}
              {' '}
              –
              {' '}
              {fmtTime(req.requested_check_out)}
            </p>
            <p className="text-xs text-gray-600 mt-2">{req.remarks}</p>
          </div>
        </div>
        {req.status === RegularizationStatus.PENDING && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors disabled:opacity-50"
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </button>
        )}
      </div>
      {req.rejection_reason && req.status === RegularizationStatus.REJECTED && (
        <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg p-2.5">
          <AlertCircle size={12} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-600">
            <span className="font-semibold">Rejection reason:</span>
            {' '}
            {req.rejection_reason}
          </p>
        </div>
      )}
      {req.reviewed_at && req.status !== RegularizationStatus.PENDING && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-[10px] text-gray-400">
            Reviewed by
            {' '}
            {req.reviewed_by_name || 'Manager'}
            {' '}
            on
            {' '}
            {fmtDate(req.reviewed_at)}
          </p>
        </div>
      )}
    </div>
  );
}

export default function EmployeeRegularization({ employeeId }: { employeeId: string }) {
  const params = useParams();
  const subdomain = params?.subdomain as string;
  const [requests, setRequests] = useState<IRegularization[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RegularizationStatus | 'ALL'>(RegularizationStatus.PENDING);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);

  useEffect(() => { if (subdomain && employeeId) { fetchRequests(RegularizationStatus.PENDING); fetchAttendanceLogs(); } }, [subdomain, employeeId]);

  const fetchRequests = async (status: RegularizationStatus | 'ALL') => {
    setLoading(true);
    try {
      const params = status !== 'ALL' ? { status, limit: 100 } : { limit: 100 };
      const res = await getMyRegularizations(subdomain, params);
      const raw = Array.isArray(res?.data) ? res.data : (res?.data?.data ?? []);
      setRequests(raw);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const fetchAttendanceLogs = async () => {
    try {
      const res = await getAttendances(subdomain, { limit: 30, employee_id: employeeId  });
      const raw = Array.isArray(res?.data) ? res.data : (res?.data?.data ?? []);

      // Dedupe by date — keeps the dropdown from showing the same date
      // multiple times if the API returns duplicate/split records.
      // If you actually need multiple distinct logs per day shown separately,
      // change the key below to `log.id` instead.
      const byDate = new Map<string, any>();
      raw.forEach((log: any) => {
        const key = new Date(log.attendance_date).toDateString();
        byDate.set(key, log); // last one wins
      });
      const deduped = Array.from(byDate.values()).sort(
        (a, b) => new Date(b.attendance_date).getTime() - new Date(a.attendance_date).getTime(),
      );

      setAttendanceLogs(deduped);
    } catch { /* silent */ }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return requests;
    return requests.filter((r) => r.remarks?.toLowerCase().includes(search.toLowerCase()));
  }, [requests, search]);

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((r) => r.status === RegularizationStatus.PENDING).length,
    approved: requests.filter((r) => r.status === RegularizationStatus.APPROVED).length,
    rejected: requests.filter((r) => r.status === RegularizationStatus.REJECTED).length,
  }), [requests]);

  const handleCreateDone = () => {
    setShowCreateDrawer(false);
    fetchRequests(statusFilter);
  };

  const handleDelete = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#0f1f2e]">Attendance Regularization</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {stats.total}
            {' '}
            requests ·
            {stats.pending}
            {' '}
            pending ·
            {stats.approved}
            {' '}
            approved
          </p>
        </div>
        <button
          onClick={() => setShowCreateDrawer(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#0f766e] rounded-xl hover:bg-[#0d6460] transition-colors"
        >
          <Plus size={14} />
          New Request
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-7 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all"
          />
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {(['ALL', RegularizationStatus.PENDING, RegularizationStatus.APPROVED, RegularizationStatus.REJECTED] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); fetchRequests(s); }}
              className={`px-2 py-1 text-[9px] font-bold rounded-lg transition-colors capitalize ${statusFilter === s ? 'bg-white text-[#0f766e] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {s === 'ALL' ? 'All' : STATUS_META[s]?.label}
            </button>
          ))}
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
          {filtered.map((req) => (
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