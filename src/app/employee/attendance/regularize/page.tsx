'use client';

import React, { useState } from 'react';
import { RotateCcw, CheckCircle2, Info, Plus, X } from 'lucide-react';

type RegType = 'missed_checkin' | 'missed_checkout' | 'late_entry' | 'wfh' | 'field_work' | 'travel';

interface RegRequest {
  id: string;
  date: string;
  type: RegType;
  correctedIn: string;
  correctedOut: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedOn: string;
  managerNote?: string;
}

const REG_TYPES: { key: RegType; label: string; description: string }[] = [
  { key: 'missed_checkin', label: 'Missed Check-in', description: 'Forgot to punch in' },
  { key: 'missed_checkout', label: 'Missed Check-out', description: 'Forgot to punch out' },
  { key: 'late_entry', label: 'Late Entry', description: 'Arrived late due to valid reason' },
  { key: 'wfh', label: 'Work From Home', description: 'Worked from home that day' },
  { key: 'field_work', label: 'Field Work', description: 'Was on field / client site' },
  { key: 'travel', label: 'Official Travel', description: 'Travelling for work' },
];

const PAST_REQUESTS: RegRequest[] = [
  {
    id: 'R001',
    date: '2026-03-19',
    type: 'missed_checkin',
    correctedIn: '09:00',
    correctedOut: '18:00',
    reason: 'Biometric device was not working in the morning',
    status: 'approved',
    submittedOn: '2026-03-19',
  },
  {
    id: 'R002',
    date: '2026-03-13',
    type: 'late_entry',
    correctedIn: '09:15',
    correctedOut: '18:30',
    reason: 'Metro delay due to signal failure',
    status: 'approved',
    submittedOn: '2026-03-13',
  },
  {
    id: 'R003',
    date: '2026-03-10',
    type: 'wfh',
    correctedIn: '09:00',
    correctedOut: '18:00',
    reason: 'Had to stay home for plumber visit',
    status: 'rejected',
    submittedOn: '2026-03-10',
    managerNote: 'WFH requires prior approval. Please follow the process.',
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

export default function RegularizePage() {
  const [showForm, setShowForm] = useState(true);
  const [selectedType, setSelectedType] = useState<RegType>('missed_checkin');
  const [date, setDate] = useState('');
  const [correctedIn, setCorrectedIn] = useState('');
  const [correctedOut, setCorrectedOut] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [requests, setRequests] = useState<RegRequest[]>(PAST_REQUESTS);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !correctedIn || !correctedOut || !reason.trim()) return;

    const newReq: RegRequest = {
      id: `R${String(requests.length + 1).padStart(3, '0')}`,
      date,
      type: selectedType,
      correctedIn,
      correctedOut,
      reason,
      status: 'pending',
      submittedOn: new Date().toISOString().split('T')[0],
    };

    setRequests([newReq, ...requests]);
    setSubmitted(true);
    setShowForm(false);
    setDate('');
    setCorrectedIn('');
    setCorrectedOut('');
    setReason('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  const selectedTypeData = REG_TYPES.find((t) => t.key === selectedType)!;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
      {submitted && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border bg-[#e8f5ee] border-[#bbddc9] text-[#2D7A4F] text-sm font-medium animate-slide-up">
          <CheckCircle2 size={16} />
          Regularization request submitted! Awaiting manager review.
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Attendance Regularization</h1>
          <p className="text-sm text-gray-500 mt-0.5">Correct missed or incorrect attendance entries</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[#2D7A4F] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#1e5c3a] transition-colors"
          >
            <Plus size={15} />
            New Request
          </button>
        )}
      </div>

      {/* How it works */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800 mb-1">How Regularization Works</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              Submit a request with corrected punch times and a reason. Your manager will review and approve/reject. Once approved, your attendance record is automatically updated and any flags (late, absent) are removed.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-gray-800">New Regularization Request</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date to Regularize</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/25 focus:border-[#2D7A4F] transition-all"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Regularization Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {REG_TYPES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setSelectedType(t.key)}
                    className={`flex flex-col items-start gap-0.5 p-3 rounded-xl border-2 text-left transition-all ${
                      selectedType === t.key
                        ? 'border-[#2D7A4F] bg-[#e8f5ee]'
                        : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                    }`}
                  >
                    <span className={`text-xs font-bold ${selectedType === t.key ? 'text-[#2D7A4F]' : 'text-gray-700'}`}>
                      {t.label}
                    </span>
                    <span className="text-[10px] text-gray-400">{t.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Corrected Times */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Corrected Check-in</label>
                <input
                  type="time"
                  value={correctedIn}
                  onChange={(e) => setCorrectedIn(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/25 focus:border-[#2D7A4F] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Corrected Check-out</label>
                <input
                  type="time"
                  value={correctedOut}
                  onChange={(e) => setCorrectedOut(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/25 focus:border-[#2D7A4F] transition-all"
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Reason / Explanation</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                rows={3}
                placeholder="Explain why the attendance needs to be corrected..."
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/25 focus:border-[#2D7A4F] transition-all resize-none"
              />
            </div>

            <div className="flex items-start gap-2 bg-blue-50 rounded-xl px-4 py-3">
              <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 font-medium">
                Request will be sent to <strong>Priya Nair</strong> for review. Once approved, your attendance for {date ? formatDate(date) : 'the selected date'} will be updated automatically.
              </p>
            </div>

            <button
              type="submit"
              disabled={!date || !correctedIn || !correctedOut || !reason.trim()}
              className="w-full py-3 bg-[#2D7A4F] hover:bg-[#1e5c3a] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl transition-all duration-200"
            >
              Submit Regularization Request
            </button>
          </form>
        </div>
      )}

      {/* Past Requests */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-3">My Requests</h3>
        <div className="space-y-3">
          {requests.map((req) => {
            const sc = STATUS_CONFIG[req.status];
            const typeData = REG_TYPES.find((t) => t.key === req.type)!;
            return (
              <div key={req.id} className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <RotateCcw size={16} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{typeData.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDate(req.date)} · {req.correctedIn} – {req.correctedOut}
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
                  <p className="text-xs text-gray-500"><span className="font-semibold text-gray-600">Reason:</span> {req.reason}</p>
                  {req.managerNote && (
                    <p className="text-xs text-red-600 mt-1"><span className="font-semibold">Manager note:</span> {req.managerNote}</p>
                  )}
                  <p className="text-[10px] text-gray-400 mt-1">Submitted {formatDate(req.submittedOn)} · {req.id}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
