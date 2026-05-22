'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Gift, CheckCircle2, Info, Zap, TrendingUp, Calendar, Clock, 
  Award, Bell, ChevronRight, ArrowRight, Sun, Moon 
} from 'lucide-react';

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

const REASON_CONFIG: Record<CompOffReason, { label: string; description: string; color: string; bg: string; icon: any }> = {
  weekend_work: { label: 'Weekend Work', description: 'Worked on Saturday/Sunday', color: '#8b5cf6', bg: '#f5f3ff', icon: Calendar },
  holiday_work: { label: 'Holiday Work', description: 'Worked on public holiday', color: '#ef4444', bg: '#fef2f2', icon: Calendar },
  overtime_4h: { label: 'Overtime 4h+', description: 'Worked 4+ extra hours', color: '#f59e0b', bg: '#fffbeb', icon: Clock },
  overtime_8h: { label: 'Overtime 8h+', description: 'Worked 8+ extra hours', color: '#2D7A4F', bg: '#e8f5ee', icon: Award },
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
  const totalApproved = requests.filter((r) => r.status === 'approved').length;
  const totalUsed = eligibilities.filter((e) => e.status === 'used').length;

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Toast Notification */}
      {submitted && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border bg-[#e8f5ee] border-[#bbddc9] text-[#2D7A4F] text-sm font-medium animate-slide-up">
          <CheckCircle2 size={16} />
          Comp Off claim submitted! Awaiting manager approval.
        </div>
      )}

      <div className="w-full px-4 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Gift size={14} />
            <span>Leave Management</span>
            <ChevronRight size={12} />
            <span className="text-[#2D7A4F] font-semibold">Compensatory Off</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Compensatory Off</h1>
          <p className="text-sm text-gray-500 mt-1">Claim comp off for overtime, weekend, and holiday work</p>
        </div>

        {/* Balance + Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-[#0f1f2e] to-[#1a3347] rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#2D7A4F] rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            </div>
            <div className="relative z-10">
              <p className="text-white/50 text-xs font-medium mb-1">Available Balance</p>
              <p className="text-4xl font-bold text-white">{totalBalance}</p>
              <p className="text-[#4a9e6e] text-xs font-medium mt-1">Comp Off days</p>
              <div className="mt-3 flex items-center gap-1">
                <TrendingUp size={12} className="text-[#4a9e6e]" />
                <span className="text-[#4a9e6e] text-xs">+2 this year</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Bell size={18} className="text-blue-600" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Ready to claim</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">{eligibleItems.length}</p>
            <p className="text-sm text-gray-600 mt-1">Eligible</p>
            <p className="text-xs text-gray-400 mt-2">Unclaimed opportunities</p>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#e8f5ee] flex items-center justify-center">
                <CheckCircle2 size={18} className="text-[#2D7A4F]" />
              </div>
              <span className="text-xs font-medium text-[#2D7A4F] bg-[#e8f5ee] px-2 py-1 rounded-full">This year</span>
            </div>
            <p className="text-3xl font-bold text-[#2D7A4F]">{totalApproved}</p>
            <p className="text-sm text-gray-600 mt-1">Approved</p>
            <p className="text-xs text-gray-400 mt-2">Claims approved</p>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Clock size={18} className="text-gray-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Consumed</span>
            </div>
            <p className="text-3xl font-bold text-gray-700">{totalUsed}</p>
            <p className="text-sm text-gray-600 mt-1">Used</p>
            <p className="text-xs text-gray-400 mt-2">Days consumed</p>
          </div>
        </div>

        {/* Workflow Guide */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Zap size={20} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-purple-900 mb-3">Comp Off Workflow</p>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="bg-white/60 px-3 py-1.5 rounded-lg text-purple-800 font-medium">1. Overtime/Weekend detected</span>
                <span className="text-purple-400">→</span>
                <span className="bg-white/60 px-3 py-1.5 rounded-lg text-purple-800 font-medium">2. Eligibility created</span>
                <span className="text-purple-400">→</span>
                <span className="bg-white/60 px-3 py-1.5 rounded-lg text-purple-800 font-medium">3. You claim it</span>
                <span className="text-purple-400">→</span>
                <span className="bg-white/60 px-3 py-1.5 rounded-lg text-purple-800 font-medium">4. Manager approves</span>
                <span className="text-purple-400">→</span>
                <span className="bg-white/60 px-3 py-1.5 rounded-lg text-purple-800 font-medium">5. Credited to balance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Eligible to Claim Section */}
        {eligibleItems.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <h3 className="text-lg font-bold text-gray-800">Eligible to Claim</h3>
                <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{eligibleItems.length}</span>
              </div>
              <span className="text-xs text-gray-400">Last updated today</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eligibleItems.map((item) => {
                const rc = REASON_CONFIG[item.reason];
                const IconComponent = rc.icon;
                return (
                  <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-200 group">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                        style={{ backgroundColor: rc.bg }}
                      >
                        <IconComponent size={20} style={{ color: rc.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-base font-bold text-gray-800">{rc.label}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(item.date)} · {item.hoursWorked} worked
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-lg font-bold" style={{ color: rc.color }}>+{item.creditDays}</p>
                            <p className="text-[10px] text-gray-400">day{item.creditDays !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleClaim(item)}
                          className="mt-3 w-full text-sm font-semibold text-white px-4 py-2 rounded-xl transition-all hover:scale-105"
                          style={{ backgroundColor: rc.color }}
                        >
                          Claim Comp Off
                        </button>
                      </div>
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
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-slide-up">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
                <Gift size={24} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Claim Comp Off</h3>
              <p className="text-gray-600 mb-5">
                You are claiming <strong>{selectedEligibility.creditDays} comp off day{selectedEligibility.creditDays !== 1 ? 's' : ''}</strong> for{' '}
                <strong>{REASON_CONFIG[selectedEligibility.reason].label}</strong> on{' '}
                <strong>{formatDate(selectedEligibility.date)}</strong>.
              </p>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date worked</span>
                  <span className="font-semibold text-gray-800">{formatDate(selectedEligibility.date)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Hours worked</span>
                  <span className="font-semibold text-gray-800">{selectedEligibility.hoursWorked}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Credit</span>
                  <span className="font-semibold text-[#2D7A4F]">+{selectedEligibility.creditDays} day{selectedEligibility.creditDays !== 1 ? 's' : ''}</span>
                </div>
              </div>
              
              <div className="flex items-start gap-2 bg-blue-50 rounded-xl px-4 py-3 mb-6">
                <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  This will be sent to <strong>Priya Nair (Manager)</strong> for approval. Once approved, it will be credited to your leave balance.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowForm(false); setSelectedEligibility(null); }}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-sm font-bold text-white transition-colors"
                >
                  Submit Claim
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Comp Off History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-800">Comp Off History</h3>
              <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{eligibilities.length}</span>
            </div>
            <Link href="/employee/attendance/compoff/history" className="text-sm font-semibold text-[#2D7A4F] hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {eligibilities.map((item) => {
              const rc = REASON_CONFIG[item.reason];
              const sc = STATUS_CONFIG[item.status];
              const IconComponent = rc.icon;
              return (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: rc.bg }}
                    >
                      <IconComponent size={20} style={{ color: rc.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-base font-bold text-gray-800">{rc.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatDate(item.date)} · {item.hoursWorked} worked
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold" style={{ color: rc.color }}>+{item.creditDays}d</p>
                          <span
                            className="text-[10px] font-bold px-2 py-1 rounded-full mt-1 inline-block"
                            style={{ backgroundColor: sc.bg, color: sc.color }}
                          >
                            {sc.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Info size={18} className="text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-1">Did you know?</h4>
              <p className="text-sm text-gray-600">
                Unclaimed comp off eligibility expires after 90 days. Claim your eligible comp offs before they expire!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}