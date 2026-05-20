'use client';

import React, { useState } from 'react';
import { Info, CheckCircle2, Plus, X } from 'lucide-react';

type LeaveType = 'PL' | 'CL' | 'SL' | 'CO';

interface LeaveApplication {
  id: string;
  type: LeaveType;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedOn: string;
  managerNote?: string;
}

const LEAVE_TYPES: { key: LeaveType; label: string; full: string; balance: number; color: string; bg: string }[] = [
  { key: 'PL', label: 'PL', full: 'Privilege Leave', balance: 12, color: '#2D7A4F', bg: '#e8f5ee' },
  { key: 'CL', label: 'CL', full: 'Casual Leave', balance: 5, color: '#3b82f6', bg: '#eff6ff' },
  { key: 'SL', label: 'SL', full: 'Sick Leave', balance: 6, color: '#f59e0b', bg: '#fffbeb' },
  { key: 'CO', label: 'CO', full: 'Comp Off', balance: 2, color: '#8b5cf6', bg: '#f5f3ff' },
];

const PAST_APPLICATIONS: LeaveApplication[] = [
  {
    id: 'L001',
    type: 'CL',
    from: '2026-03-25',
    to: '2026-03-25',
    days: 1,
    reason: 'Personal work',
    status: 'pending',
    appliedOn: '2026-03-20',
  },
  {
    id: 'L002',
    type: 'CL',
    from: '2026-03-05',
    to: '2026-03-05',
    days: 1,
    reason: 'Family function',
    status: 'approved',
    appliedOn: '2026-03-03',
  },
  {
    id: 'L003',
    type: 'SL',
    from: '2026-02-14',
    to: '2026-02-15',
    days: 2,
    reason: 'Fever and rest',
    status: 'approved',
    appliedOn: '2026-02-14',
  },
  {
    id: 'L004',
    type: 'PL',
    from: '2026-01-20',
    to: '2026-01-22',
    days: 3,
    reason: 'Vacation',
    status: 'rejected',
    appliedOn: '2026-01-15',
    managerNote: 'Critical project deadline. Please reschedule.',
  },
];

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#f59e0b', bg: '#fffbeb' },
  approved: { label: 'Approved', color: '#2D7A4F', bg: '#e8f5ee' },
  rejected: { label: 'Rejected', color: '#ef4444', bg: '#fef2f2' },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function LeaveApplicationPage() {
  const [selectedType, setSelectedType] = useState<LeaveType>('CL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [applications, setApplications] = useState<LeaveApplication[]>(PAST_APPLICATIONS);
  const [showForm, setShowForm] = useState(true);

  const selectedLeaveType = LEAVE_TYPES.find((l) => l.key === selectedType)!;

  const calcDays = () => {
    if (!fromDate || !toDate) return 0;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diff = Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(0, diff);
  };

  const days = calcDays();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate || !reason.trim()) return;

    const newApp: LeaveApplication = {
      id: `L${String(applications.length + 1).padStart(3, '0')}`,
      type: selectedType,
      from: fromDate,
      to: toDate,
      days,
      reason,
      status: 'pending',
      appliedOn: new Date().toISOString().split('T')[0],
    };

    setApplications([newApp, ...applications]);
    setSubmitted(true);
    setShowForm(false);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Success toast */}
      {submitted && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border bg-[#e8f5ee] border-[#bbddc9] text-[#2D7A4F] text-sm font-medium animate-slide-up">
          <CheckCircle2 size={16} />
          Leave application submitted! Awaiting manager approval.
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Apply for Leave</h1>
          <p className="text-sm text-gray-500 mt-0.5">Submit a leave request for manager approval</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setFromDate(''); setToDate(''); setReason(''); }}
            className="flex items-center gap-2 bg-[#2D7A4F] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#1e5c3a] transition-colors"
          >
            <Plus size={15} />
            New Application
          </button>
        )}
      </div>

      {/* Leave Balances */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {LEAVE_TYPES.map((lt) => (
          <div
            key={lt.key}
            className="bg-white rounded-2xl border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all"
            onClick={() => { setSelectedType(lt.key); setShowForm(true); }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-lg"
                style={{ backgroundColor: lt.bg, color: lt.color }}
              >
                {lt.label}
              </span>
              {selectedType === lt.key && showForm && (
                <span className="w-2 h-2 rounded-full bg-[#2D7A4F]" />
              )}
            </div>
            <p className="text-2xl font-bold" style={{ color: lt.color }}>{lt.balance}</p>
            <p className="text-xs text-gray-500 mt-0.5">{lt.full}</p>
          </div>
        ))}
      </div>

      {/* Application Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-gray-800">New Leave Application</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Leave Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Leave Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {LEAVE_TYPES.map((lt) => (
                  <button
                    key={lt.key}
                    type="button"
                    onClick={() => setSelectedType(lt.key)}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all ${
                      selectedType === lt.key
                        ? 'border-current shadow-sm'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                    style={selectedType === lt.key ? { borderColor: lt.color, backgroundColor: lt.bg } : {}}
                  >
                    <span className="text-sm font-bold" style={{ color: lt.color }}>{lt.label}</span>
                    <span className="text-[10px] text-gray-500">{lt.full}</span>
                    <span className="text-[10px] font-semibold" style={{ color: lt.color }}>{lt.balance} left</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/25 focus:border-[#2D7A4F] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  min={fromDate}
                  onChange={(e) => setToDate(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/25 focus:border-[#2D7A4F] transition-all"
                />
              </div>
            </div>

            {/* Days count */}
            {days > 0 && (
              <div className="flex items-center gap-2 bg-[#e8f5ee] rounded-xl px-4 py-2.5">
                <Info size={14} className="text-[#2D7A4F]" />
                <span className="text-sm font-semibold text-[#2D7A4F]">
                  {days} day{days > 1 ? 's' : ''} of {selectedLeaveType.full}
                </span>
                {days > selectedLeaveType.balance && (
                  <span className="text-xs font-semibold text-red-600 ml-auto">⚠ Exceeds balance ({selectedLeaveType.balance} left)</span>
                )}
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                rows={3}
                placeholder="Briefly describe the reason for your leave..."
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/25 focus:border-[#2D7A4F] transition-all resize-none"
              />
            </div>

            {/* Info note */}
            <div className="flex items-start gap-2 bg-blue-50 rounded-xl px-4 py-3">
              <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 font-medium">
                Your leave request will be sent to <strong>Priya Nair</strong> (your manager) for approval. You'll be notified once a decision is made.
              </p>
            </div>

            <button
              type="submit"
              disabled={!fromDate || !toDate || !reason.trim() || days > selectedLeaveType.balance}
              className="w-full py-3 bg-[#2D7A4F] hover:bg-[#1e5c3a] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl transition-all duration-200"
            >
              Submit Leave Application
            </button>
          </form>
        </div>
      )}

      {/* Past Applications */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-3">My Applications</h3>
        <div className="space-y-3">
          {applications.map((app) => {
            const lt = LEAVE_TYPES.find((l) => l.key === app.type)!;
            const sc = STATUS_CONFIG[app.status];
            return (
              <div key={app.id} className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: lt.bg, color: lt.color }}
                    >
                      {lt.label}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{lt.full}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDate(app.from)} {app.from !== app.to ? `→ ${formatDate(app.to)}` : ''} · {app.days} day{app.days > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ backgroundColor: sc.bg, color: sc.color }}
                  >
                    {sc.label}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500"><span className="font-semibold text-gray-600">Reason:</span> {app.reason}</p>
                  {app.managerNote && (
                    <p className="text-xs text-red-600 mt-1"><span className="font-semibold">Manager note:</span> {app.managerNote}</p>
                  )}
                  <p className="text-[10px] text-gray-400 mt-1">Applied on {formatDate(app.appliedOn)} · {app.id}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
