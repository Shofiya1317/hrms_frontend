'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Gift, CheckCircle2, Info, Zap, TrendingUp, Calendar, Clock,
  Award, Bell, ChevronRight, ArrowRight, XCircle, Loader2,
  AlertCircle, RefreshCw,
} from 'lucide-react';
import {
  getCompOffBalance,
  getCompOffs,
  applyCompOff,
  getAvailableCompOffs,
  ICompOff,
  ICompOffBalance,
  CompOffStatus,
} from '@/lib/service/compoff';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  [CompOffStatus.PENDING]: {
    label: 'Pending', color: '#b45309', bg: '#fffbeb', border: '#fde68a', icon: <Clock size={10} />,
  },
  [CompOffStatus.APPROVED]: {
    label: 'Approved', color: '#0f766e', bg: '#f0fdf9', border: '#99f6e4', icon: <CheckCircle2 size={10} />,
  },
  [CompOffStatus.REJECTED]: {
    label: 'Rejected', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: <XCircle size={10} />,
  },
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatHours(hours: number) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, accent, textColor,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; accent: string; textColor: string;
}) {
  return (
    <div className={`${accent} rounded-2xl border border-white p-5 shadow-sm flex items-center gap-3`}>
      <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center flex-shrink-0 shadow-sm">
        <Icon size={16} className={textColor} />
      </div>
      <div>
        <p className={`text-2xl font-bold leading-none ${textColor}`}>{value}</p>
        <p className="text-[11px] text-slate-500 mt-1 font-semibold">{label}</p>
        {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? {
    label: status, color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', icon: null,
  };
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border"
      style={{ color: meta.color, backgroundColor: meta.bg, borderColor: meta.border }}
    >
      {meta.icon}
      <span className="ml-0.5">{meta.label}</span>
    </span>
  );
}

// ─────────────────────────────────────────────
// Apply Modal
// ─────────────────────────────────────────────

interface ApplyModalProps {
  tenantId: string;
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}

function ApplyModal({
  tenantId, token, onClose, onSuccess,
}: ApplyModalProps) {
  const [form, setForm] = useState({
    worked_date: '',
    // comp_off_date: '',
    worked_hours: '',
    reason: '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.worked_date || !form.worked_hours || !form.reason.trim()) {
      setErr('All fields are required.'); return;
    }
    const hours = parseFloat(form.worked_hours);
    if (isNaN(hours) || hours <= 0) { setErr('Enter valid worked hours.'); return; }

    setSaving(true); setErr('');
    try {
      const response = await applyCompOff(
        {
          worked_date: form.worked_date,
          worked_hours: hours,
          reason: form.reason,
        },
        tenantId,
        token,
      );

      console.log('Comp Off API Response:', response);

      // Check if the response indicates an error
      const responseData = response?.data as any;
      const status = response?.status;

      // Handle error responses (status 400, 404, etc. or success: false)
      if (status && (status >= 400 || responseData?.success === false)) {
        const errorMsg = Array.isArray(responseData?.error)
          ? responseData.error[0]
          : responseData?.error || responseData?.message || 'Failed to submit comp off request.';
        setErr(errorMsg);
        setSaving(false);
        return;
      }

      // If we reach here, it's successful
      onSuccess();
    } catch (e: any) {
      console.error('Comp Off Submit Error:', e);
      const errorData = e?.response?.data;
      const errorMsg = Array.isArray(errorData?.error)
        ? errorData.error[0]
        : errorData?.error || errorData?.message || 'Something went wrong. Please try again.';
      setErr(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-indigo-500" />
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center">
              <Gift size={20} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Apply for Comp Off</h3>
              <p className="text-xs text-gray-400">Fill in your overtime/extra work details</p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Date Worked
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.worked_date}
                  onChange={(e) => set('worked_date', e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
              </div>
              {/* <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Comp Off Date <span className="text-red-500">*</span></label>
                <input
                  type="date" value={form.comp_off_date}
                  onChange={e => set('comp_off_date', e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
              </div> */}
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Hours Worked
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={form.worked_hours}
                onChange={(e) => set('worked_hours', e.target.value)}
                placeholder="e.g. 4 or 8.5"
                className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Reason
                <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={form.reason}
                onChange={(e) => set('reason', e.target.value)}
                placeholder="Describe why you worked extra (e.g. project deadline, holiday deployment...)"
                className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2 bg-blue-50 rounded-xl px-3 py-2.5 mt-3">
            <Info size={13} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-700 leading-relaxed">
              Once submitted, your manager will review and approve the request. Approved comp offs will be credited to your leave balance.
            </p>
          </div>

          {/* Error */}
          {err && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 mt-3">
              <AlertCircle size={13} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">{err}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2.5 mt-5">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-sm font-bold text-white disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {' '}
                  Submitting…
                </>
              ) : 'Submit Claim'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

interface CompOffPageProps {
  apiKey: string;
  token: string;
  employeeId: string;
}

export default function CompOffPage({ apiKey, token, employeeId }: CompOffPageProps) {
  const params = useParams();
  const tenantId = params?.subdomain as string || apiKey;

  // API state
  const [balance, setBalance] = useState<ICompOffBalance | null>(null);
  const [compOffs, setCompOffs] = useState<ICompOff[]>([]);
  const [available, setAvailable] = useState<ICompOff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (tenantId) fetchAll();
  }, [tenantId]);

  const fetchAll = async () => {
    setLoading(true); setError('');
    try {
      const [balRes, listRes, availRes] = await Promise.all([
        getCompOffBalance(tenantId, token),
        getCompOffs(tenantId, { employee_id: employeeId }, token),
        getAvailableCompOffs(tenantId, token),
      ]);

      // Balance
      if (balRes?.data) setBalance(balRes.data?.data ?? balRes.data);

      // All comp offs
      const raw = Array.isArray(balRes?.data?.data?.comp_offs)
        ? balRes.data.data.comp_offs
        : Array.isArray(listRes?.data?.data)
          ? listRes.data.data
          : Array.isArray(listRes?.data)
            ? listRes.data
            : [];
      setCompOffs(raw);

      // Available (unused approved ones)
      const avail = Array.isArray(availRes?.data?.data)
        ? availRes.data.data
        : Array.isArray(availRes?.data)
          ? availRes.data
          : [];
      setAvailable(avail);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load comp off data.');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleApplySuccess = () => {
    setShowApplyModal(false);
    showToast('Comp off request submitted successfully!', 'success');
    fetchAll();
  };

  const handleApplyError = (errorMsg: string) => {
    setShowApplyModal(false);
    showToast(errorMsg, 'error');
  };

  // Derived stats
  const stats = useMemo(() => ({
    balance: balance?.comp_off_balance ?? 0,
    pending: compOffs.filter((c) => c.status === CompOffStatus.PENDING).length,
    approved: compOffs.filter((c) => c.status === CompOffStatus.APPROVED).length,
    availed: compOffs.filter((c) => c.is_availed).length,
  }), [compOffs, balance]);

  const pendingList = useMemo(() => compOffs.filter((c) => c.status === CompOffStatus.PENDING), [compOffs]);
  const approvedList = useMemo(() => compOffs.filter((c) => c.status === CompOffStatus.APPROVED && !c.is_availed), [compOffs]);
  const historyList = useMemo(() => compOffs.filter((c) => c.status === CompOffStatus.REJECTED || c.is_availed), [compOffs]);

  // ── Render ─────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 size={28} className="animate-spin text-purple-600" />
        <p className="text-sm text-slate-400">Loading comp off data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
          <AlertCircle size={24} className="text-red-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">{error}</p>
          <p className="text-xs text-slate-400 mt-1">Please try again</p>
        </div>
        <button onClick={fetchAll} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-all">
          <RefreshCw size={14} />
          {' '}
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border max-w-md animate-in slide-in-from-right-2 duration-300 ${
          toast.type === 'success' ? 'bg-white border-emerald-200' : 'bg-white border-red-200'
        }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            toast.type === 'success' ? 'bg-emerald-50' : 'bg-red-50'
          }`}
          >
            {toast.type === 'success'
              ? <CheckCircle2 size={16} className="text-emerald-600" />
              : <XCircle size={16} className="text-red-600" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${
              toast.type === 'success' ? 'text-emerald-900' : 'text-red-900'
            }`}
            >
              {toast.type === 'success' ? 'Success' : 'Error'}
            </p>
            <p className={`text-xs mt-0.5 leading-relaxed ${
              toast.type === 'success' ? 'text-emerald-700' : 'text-red-700'
            }`}
            >
              {toast.msg}
            </p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <Gift size={12} />
            <span>Leave Management</span>
            <ChevronRight size={11} />
            <span className="text-purple-600 font-semibold">Compensatory Off</span>
          </div>
          <h1 className="text-lg font-bold text-gray-900">Compensatory Off</h1>
          <p className="text-xs text-gray-400 mt-0.5">Claim comp off for overtime, weekend, and holiday work</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-all"
          >
            <RefreshCw size={12} />
            {' '}
            Refresh
          </button>
          <button
            onClick={() => setShowApplyModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-sm font-semibold text-white transition-all shadow-sm shadow-purple-200"
          >
            <Gift size={14} />
            {' '}
            Apply Comp Off
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Balance"
          value={stats.balance}
          sub="Available days"
          icon={TrendingUp}
          accent="bg-gradient-to-br from-purple-50 to-indigo-50"
          textColor="text-purple-700"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          sub="Awaiting approval"
          icon={Clock}
          accent="bg-gradient-to-br from-amber-50 to-orange-50"
          textColor="text-amber-700"
        />
        <StatCard
          label="Approved"
          value={stats.approved}
          sub="Ready to use"
          icon={CheckCircle2}
          accent="bg-gradient-to-br from-teal-50 to-emerald-50"
          textColor="text-teal-700"
        />
        <StatCard
          label="Availed"
          value={stats.availed}
          sub="Days consumed"
          icon={Award}
          accent="bg-gradient-to-br from-slate-50 to-slate-100"
          textColor="text-slate-600"
        />
      </div>

      {/* ── Workflow Guide ── */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Zap size={15} className="text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-purple-900 mb-2">How it works</p>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              {['Apply with details', 'Manager reviews', 'On approval — credited', 'Use as leave'].map((step, i, arr) => (
                <React.Fragment key={step}>
                  <span className="bg-white/70 px-2.5 py-1 rounded-lg text-purple-800 font-medium">
                    {i + 1}
                    .
                    {' '}
                    {step}
                  </span>
                  {i < arr.length - 1 && <span className="text-purple-300">→</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Pending Requests ── */}
      {pendingList.length > 0 && (
        <Section
          title="Pending Approval"
          count={pendingList.length}
          dot="bg-amber-400 animate-pulse"
          icon={<Clock size={13} className="text-amber-500" />}
        >
          {pendingList.map((item) => <CompOffCard key={item.id} item={item} />)}
        </Section>
      )}

      {/* ── Approved (available to use) ── */}
      {approvedList.length > 0 && (
        <Section
          title="Approved & Available"
          count={approvedList.length}
          dot="bg-teal-400"
          icon={<CheckCircle2 size={13} className="text-teal-500" />}
        >
          {approvedList.map((item) => <CompOffCard key={item.id} item={item} />)}
        </Section>
      )}

      {/* ── Empty state ── */}
      {compOffs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mb-3">
            <Gift size={22} className="text-purple-300" />
          </div>
          <p className="text-sm font-bold text-slate-400">No comp off requests yet</p>
          <p className="text-xs text-slate-300 mt-1">Apply for your first comp off to get started</p>
          <button
            onClick={() => setShowApplyModal(true)}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-all"
          >
            <Gift size={13} />
            {' '}
            Apply Now
          </button>
        </div>
      )}

      {/* ── History (rejected + availed) ── */}
      {historyList.length > 0 && (
        <Section
          title="History"
          count={historyList.length}
          dot="bg-slate-300"
          icon={<Calendar size={13} className="text-slate-400" />}
          action={(
            <Link href="/employee/attendance/compoff/history" className="text-xs font-semibold text-purple-600 hover:underline flex items-center gap-1">
              View all
              {' '}
              <ArrowRight size={12} />
            </Link>
          )}
        >
          {historyList.slice(0, 5).map((item) => <CompOffCard key={item.id} item={item} />)}
        </Section>
      )}

      {/* ── Info Banner ── */}
      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Info size={14} className="text-blue-600" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-800 mb-0.5">Expiry reminder</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Comp off eligibility expires after 90 days. Make sure to apply before it lapses.
          </p>
        </div>
      </div>

      {/* ── Apply Modal ── */}
      {showApplyModal && (
        <ApplyModal
          tenantId={tenantId}
          token={token}
          onClose={() => setShowApplyModal(false)}
          onSuccess={handleApplySuccess}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Section wrapper
// ─────────────────────────────────────────────

function Section({
  title, count, dot, icon, children, action,
}: {
  title: string; count: number; dot: string;
  icon: React.ReactNode; children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dot}`} />
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{count}</span>
        </div>
        {action}
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Comp Off Card (row)
// ─────────────────────────────────────────────

function CompOffCard({ item }: { item: ICompOff }) {
  const isAvailed = item.is_availed;
  const expiresOn = item.expires_on;

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-all">
      {/* Icon */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
        item.status === CompOffStatus.APPROVED ? 'bg-teal-50'
          : item.status === CompOffStatus.REJECTED ? 'bg-red-50'
            : 'bg-amber-50'}`}
      >
        {item.status === CompOffStatus.APPROVED
          ? <CheckCircle2 size={16} className="text-teal-600" />
          : item.status === CompOffStatus.REJECTED
            ? <XCircle size={16} className="text-red-500" />
            : <Clock size={16} className="text-amber-500" />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-slate-800">
            {formatDate(item.worked_date)}
          </span>
          <StatusBadge status={isAvailed ? 'availed' : item.status} />
          {isAvailed && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Used</span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{item.reason}</p>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="text-[10px] text-slate-400">
            Worked:
            {' '}
            <span className="font-medium text-slate-600">{formatHours(item.worked_hours)}</span>
          </span>
          {/* <span className="text-[10px] text-slate-400">
            Comp off: <span className="font-medium text-slate-600">{formatDate(item.comp_off_date)}</span>
          </span> */}
          {expiresOn && item.status === CompOffStatus.APPROVED && !isAvailed && (
            <span className="text-[10px] text-amber-600 font-medium">
              Expires
              {' '}
              {formatDate(expiresOn)}
            </span>
          )}
        </div>
        {item.status === CompOffStatus.REJECTED && item.rejection_reason && (
          <p className="text-[10px] text-red-500 mt-1">
            Reason:
            {' '}
            {item.rejection_reason}
          </p>
        )}
      </div>

      {/* Meta right */}
      <div className="flex-shrink-0 text-right hidden sm:block">
        <p className="text-[10px] text-slate-400">Applied</p>
        <p className="text-[11px] font-medium text-slate-600">{formatDate(item.created_at)}</p>
        {item.approved_at && (
          <>
            <p className="text-[10px] text-slate-400 mt-1">Approved</p>
            <p className="text-[11px] font-medium text-slate-600">{formatDate(item.approved_at)}</p>
          </>
        )}
      </div>
    </div>
  );
}
