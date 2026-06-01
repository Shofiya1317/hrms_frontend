'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Info, CheckCircle2, Plus, X, Calendar, Clock, 
  ChevronRight, ArrowRight, Users, Bell, AlertCircle,
  FileText, Send, TrendingUp, Award, Target, Battery,
  History, Filter, Search, Sparkles, Shield, Heart, Briefcase,
  Star, Zap, Gem
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

const LEAVE_TYPES: { key: LeaveType; label: string; full: string; balance: number; total: number; color: string; bg: string; gradient: string; icon: any; description: string }[] = [
  { key: 'PL', label: 'PL', full: 'Privilege Leave', balance: 12, total: 15, color: '#16a34a', bg: '#f0fdf4', gradient: 'from-emerald-500 to-emerald-600', icon: Star, description: 'Annual earned leave' },
  { key: 'CL', label: 'CL', full: 'Casual Leave', balance: 5, total: 7, color: '#2563eb', bg: '#eff6ff', gradient: 'from-blue-500 to-blue-600', icon: Zap, description: 'Short notice leave' },
  { key: 'SL', label: 'SL', full: 'Sick Leave', balance: 6, total: 6, color: '#d97706', bg: '#fffbeb', gradient: 'from-amber-500 to-amber-600', icon: Heart, description: 'Medical & health' },
  { key: 'CO', label: 'CO', full: 'Comp Off', balance: 2, total: 3, color: '#7c3aed', bg: '#f5f3ff', gradient: 'from-purple-500 to-purple-600', icon: Gem, description: 'Overtime compensation' },
];

const PAST_APPLICATIONS: LeaveApplication[] = [
  {
    id: 'L001',
    type: 'CL',
    from: '2026-03-25',
    to: '2026-03-25',
    days: 1,
    reason: 'Personal work - need to attend to urgent family matters',
    status: 'pending',
    appliedOn: '2026-03-20',
  },
  {
    id: 'L002',
    type: 'CL',
    from: '2026-03-05',
    to: '2026-03-05',
    days: 1,
    reason: 'Family function - brother\'s wedding',
    status: 'approved',
    appliedOn: '2026-03-03',
  },
  {
    id: 'L003',
    type: 'SL',
    from: '2026-02-14',
    to: '2026-02-15',
    days: 2,
    reason: 'High fever and doctor advised rest',
    status: 'approved',
    appliedOn: '2026-02-14',
  },
  {
    id: 'L004',
    type: 'PL',
    from: '2026-01-20',
    to: '2026-01-22',
    days: 3,
    reason: 'Annual vacation with family',
    status: 'rejected',
    appliedOn: '2026-01-15',
    managerNote: 'Critical project deadline during this period. Please reschedule.',
  },
];

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', icon: Clock },
  approved: { label: 'Approved', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: X },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatRelativeDate(dateStr: string) {
  const date = new Date(dateStr);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(dateStr);
}

export default function LeaveApplicationPage() {
  const [selectedType, setSelectedType] = useState<LeaveType>('CL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [applications, setApplications] = useState<LeaveApplication[]>(PAST_APPLICATIONS);
  const [showForm, setShowForm] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

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
    setFromDate('');
    setToDate('');
    setReason('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  const filteredApplications = applications.filter(app => 
    filterStatus === 'all' ? true : app.status === filterStatus
  );

  const stats = {
    totalLeaves: applications.length,
    approved: applications.filter(a => a.status === 'approved').length,
    pending: applications.filter(a => a.status === 'pending').length,
    totalDays: applications.reduce((acc, app) => acc + app.days, 0),
  };

  return (
    <div className="min-h-screen">
      {/* Success Toast */}
      {submitted && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold shadow-lg border animate-slide-up bg-emerald-50 border-emerald-200 text-emerald-800">
          <CheckCircle2 size={15} />
          Leave application submitted! Awaiting manager approval.
        </div>
      )}

      <div className="w-full px-3 py-4 sm:px-3 sm:py-6 lg:px-4 lg:py-6">
        
        {/* Header */}
        <div className="mb-3 lg:mb-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-2">
            <Calendar size={14} />
            <span>Leave Management</span>
            <ChevronRight size={12} />
            <span className="text-emerald-600 font-semibold">Apply Leave</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">Apply for Leave</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Submit a leave request for manager approval</p>
            </div>
            {!showForm && (
              <button
                onClick={() => { setShowForm(true); setFromDate(''); setToDate(''); setReason(''); }}
                className="flex items-center justify-center gap-2 bg-emerald-600 text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Plus size={16} />
                New Application
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 lg:mb-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Calendar size={16} className="text-emerald-600" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-slate-800">{stats.totalLeaves}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">Total Applications</p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-1">This year</p>
          </div>
          
          <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle2 size={16} className="text-green-600" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-slate-800">{stats.approved}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">Approved</p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-1">{((stats.approved / stats.totalLeaves) * 100) || 0}% acceptance</p>
          </div>
          
          <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <Clock size={16} className="text-amber-600" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-slate-800">{stats.pending}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">Pending</p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-1">Awaiting review</p>
          </div>
          
          <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <TrendingUp size={16} className="text-purple-600" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-slate-800">{stats.totalDays}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">Total Days</p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-1">Leave taken</p>
          </div>
        </div>

        {/* Enhanced Leave Balances */}
        <div className="mb-3 lg:mb-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800">Leave Balances</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Annual leave summary · 2026</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {LEAVE_TYPES.map((lt) => {
              const Icon = lt.icon;
              const used = lt.total - lt.balance;
              const percent = (used / lt.total) * 100;
              const remainingPercent = (lt.balance / lt.total) * 100;
              const isSelected = selectedType === lt.key && showForm;
              
              return (
                <div
                  key={lt.key}
                  className={`group relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'shadow-xl scale-[1.02] border-2'
                      : 'hover:shadow-lg hover:scale-[1.01] border border-slate-200'
                  }`}
                  style={isSelected ? { borderColor: lt.color } : {}}
                  onClick={() => { setSelectedType(lt.key); setShowForm(true); }}
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${lt.gradient} opacity-0 group-hover:opacity-5 rounded-xl sm:rounded-2xl transition-opacity duration-300`} />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
                        style={{ backgroundColor: lt.bg }}
                      >
                        <Icon size={20} style={{ color: lt.color }} />
                      </div>
                      {isSelected && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-semibold text-emerald-600">Selected</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex items-baseline justify-between">
                        <p className="text-2xl sm:text-3xl font-bold" style={{ color: lt.color }}>{lt.balance}</p>
                        <p className="text-xs text-slate-400">/ {lt.total} days</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 mt-1">{lt.full}</p>
                      <p className="text-[10px] text-slate-500">{lt.description}</p>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1.5">
                        <span>Used: {used} days</span>
                        <span>Remaining: {lt.balance} days</span>
                      </div>
                      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%`, backgroundColor: lt.color + '30' }}
                        />
                        <div 
                          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                          style={{ width: `${remainingPercent}%`, backgroundColor: lt.color }}
                        />
                      </div>
                    </div>
                    
                    {/* Usage indicator */}
                    {used > lt.total * 0.8 && (
                      <div className="mt-2 flex items-center gap-1">
                        <AlertCircle size={10} className="text-amber-500" />
                        <p className="text-[9px] text-amber-600 font-medium">Running low on balance</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Application Form */}
        {showForm && (
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-4 mb-5 lg:mb-6 shadow-lg animate-fade-in">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <FileText size={16} className="text-emerald-600" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800">New Leave Application</h3>
              </div>
              <button 
                onClick={() => setShowForm(false)} 
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={16} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* Enhanced Leave Type Selection */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3">Select Leave Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {LEAVE_TYPES.map((lt) => {
                    const Icon = lt.icon;
                    const isSelected = selectedType === lt.key;
                    return (
                      <button
                        key={lt.key}
                        type="button"
                        onClick={() => setSelectedType(lt.key)}
                        className={`group relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
                          isSelected
                            ? 'shadow-lg scale-[1.02]'
                            : 'hover:shadow-md hover:scale-[1.01] border-slate-200'
                        }`}
                        style={isSelected ? { borderColor: lt.color, backgroundColor: lt.bg + '40' } : {}}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                            isSelected ? 'scale-110' : ''
                          }`}
                          style={{ backgroundColor: lt.bg }}
                        >
                          <Icon size={20} style={{ color: lt.color }} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold" style={{ color: lt.color }}>{lt.label}</p>
                            {isSelected && (
                              <CheckCircle2 size={12} className="text-emerald-500" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500">{lt.full}</p>
                          <p className="text-[9px] font-semibold mt-0.5" style={{ color: lt.color }}>
                            {lt.balance} days left
                          </p>
                        </div>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">From Date</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      required
                      className="w-full h-10 sm:h-11 pl-9 sm:pl-10 pr-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">To Date</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={toDate}
                      min={fromDate}
                      onChange={(e) => setToDate(e.target.value)}
                      required
                      className="w-full h-10 sm:h-11 pl-9 sm:pl-10 pr-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Days count */}
              {days > 0 && (
                <div className={`flex items-center gap-2 sm:gap-3 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 ${
                  days > selectedLeaveType.balance ? 'bg-red-50' : 'bg-emerald-50'
                }`}>
                  <Clock size={16} className={days > selectedLeaveType.balance ? 'text-red-600' : 'text-emerald-600'} />
                  <div className="flex-1">
                    <span className={`text-xs sm:text-sm font-semibold ${days > selectedLeaveType.balance ? 'text-red-700' : 'text-emerald-700'}`}>
                      {days} day{days > 1 ? 's' : ''} of {selectedLeaveType.full}
                    </span>
                  </div>
                  {days > selectedLeaveType.balance && (
                    <span className="text-[10px] sm:text-xs font-semibold text-red-600">⚠ Exceeds available balance</span>
                  )}
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Reason for Leave</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={4}
                  placeholder="Briefly describe the reason for your leave..."
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all resize-none"
                />
              </div>

              {/* Info note */}
              <div className="flex items-start gap-2 sm:gap-3 bg-blue-50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3">
                <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-blue-800 font-medium">
                    Your leave request will be sent to <strong>Manager</strong> for approval.
                  </p>
                  <p className="text-[10px] sm:text-xs text-blue-600 mt-1">You'll be notified once a decision is made.</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={!fromDate || !toDate || !reason.trim() || days > selectedLeaveType.balance}
                className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl transition-all duration-200 shadow-md flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Send size={18} />
                Submit Leave Application
              </button>
            </form>
          </div>
        )}

        {/* Past Applications */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <History size={16} className="text-slate-600" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800">My Applications</h3>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{applications.length}</span>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-all capitalize ${
                      filterStatus === status
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {filteredApplications.length === 0 ? (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-8 sm:p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar size={24} className="text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium">No applications found</p>
                <p className="text-xs text-slate-400 mt-1">Apply for leave to see your applications here</p>
              </div>
            ) : (
              filteredApplications.map((app) => {
                const lt = LEAVE_TYPES.find((l) => l.key === app.type)!;
                const sc = STATUS_CONFIG[app.status];
                const StatusIcon = sc.icon;
                const Icon = lt.icon;
                return (
                  <div key={app.id} className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-5 hover:shadow-md transition-all duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: lt.bg }}
                        >
                          <Icon size={20} style={{ color: lt.color }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm sm:text-base font-bold text-slate-800">{lt.full}</p>
                            <span
                              className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                              style={{ backgroundColor: sc.bg, color: sc.color }}
                            >
                              <StatusIcon size={10} />
                              {sc.label}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            {formatDate(app.from)} {app.from !== app.to ? `→ ${formatDate(app.to)}` : ''} · {app.days} day{app.days > 1 ? 's' : ''}
                          </p>
                          <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
                            Applied {formatRelativeDate(app.appliedOn)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100">
                      <p className="text-xs sm:text-sm text-slate-700">
                        <span className="font-semibold text-slate-800">Reason:</span> {app.reason}
                      </p>
                      {app.managerNote && (
                        <div className="mt-2 flex items-start gap-2 bg-red-50 rounded-lg p-2.5 sm:p-3">
                          <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs sm:text-sm text-red-700">
                            <span className="font-semibold">Manager note:</span> {app.managerNote}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}