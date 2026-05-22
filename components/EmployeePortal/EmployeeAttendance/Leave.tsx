'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Info, CheckCircle2, Plus, X, Calendar, Clock, 
  ChevronRight, ArrowRight, Users, Bell, AlertCircle,
  FileText, Send, Sun, Moon, Zap
} from 'lucide-react';

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

  const currentTime = new Date();
  const hour = currentTime.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const GreetIcon = hour < 12 ? Sun : hour < 17 ? Zap : Moon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Success Toast */}
      {submitted && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border bg-[#e8f5ee] border-[#bbddc9] text-[#2D7A4F] text-sm font-medium animate-slide-up">
          <CheckCircle2 size={16} />
          Leave application submitted! Awaiting manager approval.
        </div>
      )}

      <div className="w-full px-4 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Calendar size={14} />
            <span>Leave Management</span>
            <ChevronRight size={12} />
            <span className="text-[#2D7A4F] font-semibold">Apply Leave</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Apply for Leave</h1>
              <p className="text-sm text-gray-500 mt-1">Submit a leave request for manager approval</p>
            </div>
            {!showForm && (
              <button
                onClick={() => { setShowForm(true); setFromDate(''); setToDate(''); setReason(''); }}
                className="flex items-center gap-2 bg-[#2D7A4F] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#1e5c3a] transition-all shadow-sm"
              >
                <Plus size={16} />
                New Application
              </button>
            )}
          </div>
        </div>

        {/* Greeting Section */}
        <div className="bg-gradient-to-br from-[#0f1f2e] via-[#1a3347] to-[#0f2d1e] rounded-2xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#2D7A4F] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <GreetIcon size={16} className="text-[#4a9e6e]" />
                <span className="text-[#4a9e6e] text-sm font-medium">{greeting}</span>
              </div>
              <h2 className="text-xl font-bold text-white">John Doe</h2>
              <p className="text-white/40 text-sm mt-0.5">EMP-2024-001 · Senior Software Engineer</p>
            </div>
            <div className="text-right">
              <p className="text-white text-2xl font-bold tabular-nums">
                {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-white/40 text-xs mt-1">
                {currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>
        </div>

        {/* Leave Balances */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-800">Leave Balances</h3>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">2026</span>
            </div>
            <span className="text-xs text-gray-400">Financial year</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {LEAVE_TYPES.map((lt) => (
              <div
                key={lt.key}
                className={`bg-white rounded-2xl border-2 p-5 cursor-pointer hover:shadow-lg transition-all ${
                  selectedType === lt.key && showForm ? 'border-current' : 'border-gray-200'
                }`}
                style={selectedType === lt.key && showForm ? { borderColor: lt.color } : {}}
                onClick={() => { setSelectedType(lt.key); setShowForm(true); }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-lg"
                    style={{ backgroundColor: lt.bg, color: lt.color }}
                  >
                    {lt.label}
                  </span>
                  {selectedType === lt.key && showForm && (
                    <div className="w-2 h-2 rounded-full bg-[#2D7A4F] animate-pulse" />
                  )}
                </div>
                <p className="text-3xl font-bold" style={{ color: lt.color }}>{lt.balance}</p>
                <p className="text-sm text-gray-600 mt-1">{lt.full}</p>
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all" 
                    style={{ width: `${(lt.balance / 20) * 100}%`, backgroundColor: lt.color }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#e8f5ee] rounded-lg flex items-center justify-center">
                  <FileText size={16} className="text-[#2D7A4F]" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">New Leave Application</h3>
              </div>
              <button 
                onClick={() => setShowForm(false)} 
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Leave Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Select Leave Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {LEAVE_TYPES.map((lt) => (
                    <button
                      key={lt.key}
                      type="button"
                      onClick={() => setSelectedType(lt.key)}
                      className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all ${
                        selectedType === lt.key
                          ? 'border-current shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={selectedType === lt.key ? { borderColor: lt.color, backgroundColor: lt.bg + '40' } : {}}
                    >
                      <span className="text-base font-bold" style={{ color: lt.color }}>{lt.label}</span>
                      <span className="text-xs text-gray-500">{lt.full}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: lt.bg, color: lt.color }}>
                        {lt.balance} left
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">From Date</label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      required
                      className="w-full h-11 pl-10 pr-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/25 focus:border-[#2D7A4F] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">To Date</label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={toDate}
                      min={fromDate}
                      onChange={(e) => setToDate(e.target.value)}
                      required
                      className="w-full h-11 pl-10 pr-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/25 focus:border-[#2D7A4F] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Days count */}
              {days > 0 && (
                <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                  days > selectedLeaveType.balance ? 'bg-red-50' : 'bg-[#e8f5ee]'
                }`}>
                  <Clock size={16} className={days > selectedLeaveType.balance ? 'text-red-600' : 'text-[#2D7A4F]'} />
                  <div className="flex-1">
                    <span className={`text-sm font-semibold ${days > selectedLeaveType.balance ? 'text-red-700' : 'text-[#2D7A4F]'}`}>
                      {days} day{days > 1 ? 's' : ''} of {selectedLeaveType.full}
                    </span>
                  </div>
                  {days > selectedLeaveType.balance && (
                    <span className="text-xs font-semibold text-red-600">⚠ Exceeds available balance</span>
                  )}
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Leave</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={4}
                  placeholder="Briefly describe the reason for your leave..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/25 focus:border-[#2D7A4F] transition-all resize-none"
                />
              </div>

              {/* Info note */}
              <div className="flex items-start gap-3 bg-blue-50 rounded-xl px-4 py-3">
                <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-blue-800 font-medium">
                    Your leave request will be sent to <strong>Priya Nair (Manager)</strong> for approval.
                  </p>
                  <p className="text-xs text-blue-600 mt-1">You'll be notified once a decision is made.</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={!fromDate || !toDate || !reason.trim() || days > selectedLeaveType.balance}
                className="w-full py-3.5 bg-gradient-to-r from-[#2D7A4F] to-[#4a9e6e] hover:from-[#1e5c3a] hover:to-[#2D7A4F] disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl transition-all duration-200 shadow-md flex items-center justify-center gap-2"
              >
                <Send size={18} />
                Submit Leave Application
              </button>
            </form>
          </div>
        )}

        {/* Past Applications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-800">My Applications</h3>
              <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{applications.length}</span>
            </div>
            <Link href="/employee/attendance/leave/history" className="text-sm font-semibold text-[#2D7A4F] hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {applications.map((app) => {
              const lt = LEAVE_TYPES.find((l) => l.key === app.type)!;
              const sc = STATUS_CONFIG[app.status];
              return (
                <div key={app.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold flex-shrink-0"
                        style={{ backgroundColor: lt.bg, color: lt.color }}
                      >
                        {lt.label}
                      </div>
                      <div>
                        <p className="text-base font-bold text-gray-800">{lt.full}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(app.from)} {app.from !== app.to ? `→ ${formatDate(app.to)}` : ''} · {app.days} day{app.days > 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Applied on {formatDate(app.appliedOn)}
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: sc.bg, color: sc.color }}
                    >
                      {sc.label}
                    </span>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-gray-800">Reason:</span> {app.reason}
                    </p>
                    {app.managerNote && (
                      <div className="mt-2 flex items-start gap-2 bg-red-50 rounded-lg p-3">
                        <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">
                          <span className="font-semibold">Manager note:</span> {app.managerNote}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}