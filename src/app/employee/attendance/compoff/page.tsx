'use client';

import React, { useState } from 'react';
import { Gift, CheckCircle2, Info, Zap } from 'lucide-react';

type CompOffReason = 'weekend_work' | 'holiday_work' | 'overtime_4h' | 'overtime_8h';

interface CompOffEligibility {
  id: string;
  date: string;
  reason: CompOffReason;
  hoursWorked: string;
  creditDays: number;
  status: 'eligible' | 'requested' | 'approved' | 'credited' | 'used';
}

interface CompOffRequest {
  id: string;
  eligibilityId: string;
  date: string;
  reason: CompOffReason;
  creditDays: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedOn: string;
  usedOn?: string;
}

const REASON_CONFIG: Record<CompOffReason, { label: string; description: string; color: string; bg: string }> = {
  weekend_work: { label: 'Weekend Work', description: 'Worked on Saturday/Sunday', color: '#8b5cf6', bg: '#f5f3ff' },
  holiday_work: { label: 'Holiday Work', description: 'Worked on public holiday', color: '#ef4444', bg: '#fef2f2' },
  overtime_4h: { label: 'Overtime 4h+', description: 'Worked 4+ extra hours', color: '#f59e0b', bg: '#fffbeb' },
  overtime_8h: { label: 'Overtime 8h+', description: 'Worked 8+ extra hours', color: '#2D7A4F', bg: '#e8f5ee' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  eligible: { label: 'Eligible', color: '#3b82f6', bg: '#eff6ff' },
  requested: { label: 'Requested', color: '#f59e0b', bg: '#fffbeb' },
  approved: { label: 'Approved', color: '#2D7A4F', bg: '#e8f5ee' },
  credited: { label: 'Credited', color: '#8b5cf6', bg: '#f5f3ff' },
  used: { label: 'Used', color: '#9ca3af', bg: '#f9fafb' },
  pending: { label: 'Pending', color: '#f59e0b', bg: '#fffbeb' },
  rejected: { label: 'Rejected', color: '#ef4444', bg: '#fef2f2' },
};

const ELIGIBILITIES: CompOffEligibility[] = [
  { id: 'E001', date: '2026-03-15', reason: 'holiday_work', hoursWorked: '8h 30m', creditDays: 1, status: 'eligible' },
  { id: 'E002', date: '2026-03-08', reason: 'weekend_work', hoursWorked: '6h 00m', creditDays: 0.5, status: 'eligible' },
  { id: 'E003', date: '2026-03-01', reason: 'overtime_8h', hoursWorked: '10h 15m', creditDays: 1, status: 'credited' },
  { id: 'E004', date: '2026-02-22', reason: 'weekend_work', hoursWorked: '4h 30m', creditDays: 0.5, status: 'used' },
];

const PAST_REQUESTS: CompOffRequest[] = [
  {
    id: 'CO001',
    eligibilityId: 'E003',
    date: '2026-03-01',
    reason: 'overtime_8h',
    creditDays: 1,
    status: 'approved',
    submittedOn: '2026-03-03',
  },
  {
    id: 'CO002',
    eligibilityId: 'E004',
    date: '2026-02-22',
    reason: 'weekend_work',
    creditDays: 0.5,
    status: 'approved',
    submittedOn: '2026-02-24',
    usedOn: '2026-03-10',
  },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CompOffPage() {
  const [eligibilities, setEligibilities] = useState<CompOffEligibility[]>(ELIGIBILITIES);
  const [requests, setRequests] = useState<CompOffRequest[]>(PAST_REQUESTS);
  const [showForm, setShowForm] = useState(false);
  const [selectedEligibility, setSelectedEligibility] = useState<CompOffEligibility | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const eligibleItems = eligibilities.filter((e) => e.status === 'eligible');
  const totalBalance = eligibilities
    .filter((e) => e.status === 'credited')
    .reduce((sum, e) => sum + e.creditDays, 0);

  const handleClaim = (eligibility: CompOffEligibility) => {
    setSelectedEligibility(eligibility);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!selectedEligibility) return;

    const newReq: CompOffRequest = {
      id: `CO${String(requests.length + 1).padStart(3, '0')}`,
      eligibilityId: selectedEligibility.id,
      date: selectedEligibility.date,
      reason: selectedEligibility.reason,
      creditDays: selectedEligibility.creditDays,
      status: 'pending',
      submittedOn: new Date().toISOString().split('T')[0],
    };

    setRequests([newReq, ...requests]);
    setEligibilities(eligibilities.map((e) =>
      e.id === selectedEligibility.id ? { ...e, status: 'requested' } : e
    ));
    setShowForm(false);
    setSelectedEligibility(null);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
      {submitted && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border bg-[#e8f5ee] border-[#bbddc9] text-[#2D7A4F] text-sm font-medium animate-slide-up">
          <CheckCircle2 size={16} />
          Comp Off claim submitted! Awaiting manager approval.
        </div>
      )}

      <div>
        <h1 className="text-xl font-bold text-gray-900">Compensatory Off</h1>
        <p className="text-sm text-gray-500 mt-0.5">Claim comp off for overtime, weekend, and holiday work</p>
      </div>

      {/* Balance + Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-[#0f1f2e] to-[#1a3347] rounded-2xl p-4 col-span-2 sm:col-span-1">
          <p className="text-white/50 text-xs font-medium mb-1">Available Balance</p>
          <p className="text-3xl font-bold text-white">{totalBalance}</p>
          <p className="text-[#4a9e6e] text-xs font-medium mt-0.5">Comp Off days</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-gray-400 text-xs font-medium mb-1">Eligible</p>
          <p className="text-2xl font-bold text-blue-600">{eligibleItems.length}</p>
          <p className="text-gray-400 text-xs mt-0.5">Unclaimed</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-gray-400 text-xs font-medium mb-1">Approved</p>
          <p className="text-2xl font-bold text-[#2D7A4F]">{requests.filter((r) => r.status === 'approved').length}</p>
          <p className="text-gray-400 text-xs mt-0.5">This year</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-gray-400 text-xs font-medium mb-1">Used</p>
          <p className="text-2xl font-bold text-gray-600">{eligibilities.filter((e) => e.status === 'used').length}</p>
          <p className="text-gray-400 text-xs mt-0.5">Days consumed</p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <Zap size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-purple-800 mb-1">Comp Off Workflow</p>
            <div className="flex flex-wrap gap-2 text-xs text-purple-700 font-medium">
              <span className="bg-purple-100 px-2 py-1 rounded-lg">1. Overtime/Weekend detected</span>
              <span className="text-purple-400">→</span>
              <span className="bg-purple-100 px-2 py-1 rounded-lg">2. Eligibility created</span>
              <span className="text-purple-400">→</span>
              <span className="bg-purple-100 px-2 py-1 rounded-lg">3. You claim it</span>
              <span className="text-purple-400">→</span>
              <span className="bg-purple-100 px-2 py-1 rounded-lg">4. Manager approves</span>
              <span className="text-purple-400">→</span>
              <span className="bg-purple-100 px-2 py-1 rounded-lg">5. Credited to balance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Eligible to Claim */}
      {eligibleItems.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Eligible to Claim ({eligibleItems.length})
          </h3>
          <div className="space-y-3">
            {eligibleItems.map((item) => {
              const rc = REASON_CONFIG[item.reason];
              return (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: rc.bg }}
                  >
                    <Gift size={16} style={{ color: rc.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800">{rc.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(item.date)} · {item.hoursWorked} worked
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold" style={{ color: rc.color }}>+{item.creditDays} day{item.creditDays !== 1 ? 's' : ''}</p>
                    <button
                      onClick={() => handleClaim(item)}
                      className="mt-1 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-colors"
                      style={{ backgroundColor: rc.color }}
                    >
                      Claim
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Claim Confirmation Modal */}
      {showForm && selectedEligibility && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-slide-up">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
              <Gift size={22} className="text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Claim Comp Off</h3>
            <p className="text-sm text-gray-500 mb-4">
              You are claiming <strong>{selectedEligibility.creditDays} comp off day{selectedEligibility.creditDays !== 1 ? 's' : ''}</strong> for{' '}
              <strong>{REASON_CONFIG[selectedEligibility.reason].label}</strong> on{' '}
              <strong>{formatDate(selectedEligibility.date)}</strong>.
            </p>
            <div className="bg-gray-50 rounded-xl p-3 mb-5 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Date worked</span>
                <span className="font-semibold text-gray-800">{formatDate(selectedEligibility.date)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Hours worked</span>
                <span className="font-semibold text-gray-800">{selectedEligibility.hoursWorked}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Credit</span>
                <span className="font-semibold text-[#2D7A4F]">+{selectedEligibility.creditDays} day{selectedEligibility.creditDays !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-blue-50 rounded-xl px-3 py-2.5 mb-5">
              <Info size={13} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 font-medium">
                This will be sent to <strong>Priya Nair</strong> for approval. Once approved, it will be credited to your leave balance.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowForm(false); setSelectedEligibility(null); }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-sm font-bold text-white transition-colors"
              >
                Submit Claim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Eligibilities History */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-3">Comp Off History</h3>
        <div className="space-y-3">
          {eligibilities.map((item) => {
            const rc = REASON_CONFIG[item.reason];
            const sc = STATUS_CONFIG[item.status];
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: rc.bg }}
                >
                  <Gift size={16} style={{ color: rc.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800">{rc.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(item.date)} · {item.hoursWorked}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold" style={{ color: rc.color }}>+{item.creditDays}d</p>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block"
                    style={{ backgroundColor: sc.bg, color: sc.color }}
                  >
                    {sc.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
