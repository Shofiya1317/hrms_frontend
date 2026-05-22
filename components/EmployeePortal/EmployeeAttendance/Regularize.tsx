'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  RotateCcw, CheckCircle2, Info, Plus, X, 
  Calendar, Clock, AlertCircle, ChevronRight, 
  Sun, Moon, Zap, Send, FileText, Users,
  Briefcase, Home, MapPin, Train
} from 'lucide-react';

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

const REG_TYPES: { key: RegType; label: string; description: string; icon: any; color: string; bg: string }[] = [
  { key: 'missed_checkin', label: 'Missed Check-in', description: 'Forgot to punch in', icon: Clock, color: '#f59e0b', bg: '#fffbeb' },
  { key: 'missed_checkout', label: 'Missed Check-out', description: 'Forgot to punch out', icon: Clock, color: '#f59e0b', bg: '#fffbeb' },
  { key: 'late_entry', label: 'Late Entry', description: 'Arrived late due to valid reason', icon: AlertCircle, color: '#ef4444', bg: '#fef2f2' },
  { key: 'wfh', label: 'Work From Home', description: 'Worked from home that day', icon: Home, color: '#3b82f6', bg: '#eff6ff' },
  { key: 'field_work', label: 'Field Work', description: 'Was on field / client site', icon: MapPin, color: '#8b5cf6', bg: '#f5f3ff' },
  { key: 'travel', label: 'Official Travel', description: 'Travelling for work', icon: Train, color: '#2D7A4F', bg: '#e8f5ee' },
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

  const currentTime = new Date();
  const hour = currentTime.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const GreetIcon = hour < 12 ? Sun : hour < 17 ? Zap : Moon;

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
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Toast Notification */}
      {submitted && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border bg-[#e8f5ee] border-[#bbddc9] text-[#2D7A4F] text-sm font-medium animate-slide-up">
          <CheckCircle2 size={16} />
          Regularization request submitted! Awaiting manager review.
        </div>
      )}

      <div className="w-full px-4 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <RotateCcw size={14} />
            <span>Attendance</span>
            <ChevronRight size={12} />
            <span className="text-[#2D7A4F] font-semibold">Regularization</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Attendance Regularization</h1>
              <p className="text-sm text-gray-500 mt-1">Correct missed or incorrect attendance entries</p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-[#2D7A4F] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#1e5c3a] transition-all shadow-sm"
              >
                <Plus size={16} />
                New Request
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
              <h2 className="text-xl font-bold text-white">Rahul Sharma</h2>
              <p className="text-white/40 text-sm mt-0.5">EMP-2024-001 · Senior Software Engineer</p>
            </div>
            <div className="flex items-center gap-6">
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
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock size={14} className="text-amber-600" />
              </div>
              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Active</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{pendingCount}</p>
            <p className="text-xs text-gray-500 mt-1">Pending Requests</p>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#e8f5ee] flex items-center justify-center">
                <CheckCircle2 size={14} className="text-[#2D7A4F]" />
              </div>
              <span className="text-xs font-medium text-[#2D7A4F] bg-[#e8f5ee] px-2 py-0.5 rounded-full">This Year</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{requests.filter(r => r.status === 'approved').length}</p>
            <p className="text-xs text-gray-500 mt-1">Approved Requests</p>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Calendar size={14} className="text-blue-600" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">30 Days</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{requests.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total Requests</p>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Info size={18} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800 mb-2">How Regularization Works</p>
              <p className="text-sm text-amber-700 leading-relaxed">
                Submit a request with corrected punch times and a reason. Your manager will review and approve/reject. 
                Once approved, your attendance record is automatically updated and any flags (late, absent) are removed.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                  <FileText size={16} className="text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">New Regularization Request</h3>
              </div>
              <button 
                onClick={() => setShowForm(false)} 
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date to Regularize</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full h-11 pl-10 pr-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/25 focus:border-[#2D7A4F] transition-all"
                  />
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Regularization Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {REG_TYPES.map((t) => {
                    const IconComponent = t.icon;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setSelectedType(t.key)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                          selectedType === t.key
                            ? 'border-current shadow-md'
                            : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                        }`}
                        style={selectedType === t.key ? { borderColor: t.color, backgroundColor: t.bg } : {}}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: t.bg }}
                        >
                          <IconComponent size={14} style={{ color: t.color }} />
                        </div>
                        <div className="text-left flex-1">
                          <p className={`text-sm font-semibold ${selectedType === t.key ? 'text-gray-900' : 'text-gray-700'}`}>
                            {t.label}
                          </p>
                          <p className="text-xs text-gray-500">{t.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Corrected Times */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Corrected Check-in</label>
                  <div className="relative">
                    <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="time"
                      value={correctedIn}
                      onChange={(e) => setCorrectedIn(e.target.value)}
                      required
                      className="w-full h-11 pl-10 pr-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/25 focus:border-[#2D7A4F] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Corrected Check-out</label>
                  <div className="relative">
                    <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="time"
                      value={correctedOut}
                      onChange={(e) => setCorrectedOut(e.target.value)}
                      required
                      className="w-full h-11 pl-10 pr-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/25 focus:border-[#2D7A4F] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reason / Explanation</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={4}
                  placeholder="Explain why the attendance needs to be corrected..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/25 focus:border-[#2D7A4F] transition-all resize-none"
                />
              </div>

              {/* Info note */}
              <div className="flex items-start gap-3 bg-blue-50 rounded-xl px-4 py-3">
                <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-blue-800 font-medium">
                    Request will be sent to <strong>Priya Nair (Manager)</strong> for review.
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Once approved, your attendance for {date ? formatDate(date) : 'the selected date'} will be updated automatically.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={!date || !correctedIn || !correctedOut || !reason.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-[#2D7A4F] to-[#4a9e6e] hover:from-[#1e5c3a] hover:to-[#2D7A4F] disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl transition-all duration-200 shadow-md flex items-center justify-center gap-2"
              >
                <Send size={18} />
                Submit Regularization Request
              </button>
            </form>
          </div>
        )}

        {/* Past Requests */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-800">My Requests</h3>
              <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{requests.length}</span>
            </div>
            <Link href="/employee/attendance/regularize/history" className="text-sm font-semibold text-[#2D7A4F] hover:underline flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {requests.map((req) => {
              const sc = STATUS_CONFIG[req.status];
              const typeData = REG_TYPES.find((t) => t.key === req.type)!;
              const IconComponent = typeData.icon;
              return (
                <div key={req.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: typeData.bg }}
                      >
                        <IconComponent size={20} style={{ color: typeData.color }} />
                      </div>
                      <div>
                        <p className="text-base font-bold text-gray-800">{typeData.label}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(req.date)} · {req.correctedIn} – {req.correctedOut}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Submitted on {formatDate(req.submittedOn)}
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
                      <span className="font-semibold text-gray-800">Reason:</span> {req.reason}
                    </p>
                    {req.managerNote && (
                      <div className="mt-3 flex items-start gap-2 bg-red-50 rounded-lg p-3">
                        <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">
                          <span className="font-semibold">Manager note:</span> {req.managerNote}
                        </p>
                      </div>
                    )}
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
              <h4 className="text-sm font-bold text-gray-800 mb-1">Pro Tip</h4>
              <p className="text-sm text-gray-600">
                Regularize missed punches within 7 days. Late regularizations may be subject to manager discretion.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}