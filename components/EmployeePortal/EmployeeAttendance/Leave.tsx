'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Info, CheckCircle2, Plus, X, Calendar, Clock, 
  ChevronRight, ArrowRight, Users, Bell, AlertCircle,
  FileText, Send, TrendingUp, Award, Target, Battery,
  History, Filter, Search, Sparkles, Shield, Heart, Briefcase,
  Star, Zap, Gem, Upload, Loader2
} from 'lucide-react';
import { 
  applyLeave, 
  getLeaveApplications, 
  cancelLeave, 
  updateLeaveApplication,
  HalfDaySession,
  ILeaveApplication,
  ILeaveApplicationPayload 
} from '@/lib/service/leaveApplication';
import { getEmployeeLeaveBalanceDetailed, EmployeeLeaveBalance } from '@/lib/service/leave';
import ConfirmModal from '@/components/common/ConfirmModal';

interface LeaveTypeData {
  id: string;
  name: string;
  code: string;
  description?: string;
  is_paid?: boolean;
  requires_document?: boolean;
  balance: number;
  total: number;
  min_days?: number;
  max_days?: number;
  color: string;
  bg: string;
  icon: any;
}

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

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', icon: Clock },
  approved: { label: 'Approved', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: X },
  cancelled: { label: 'Cancelled', color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', icon: X },
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

interface LeaveApplicationPageProps {
  apiKey: string;
  token: string;
  employeeId: string;
}

export default function LeaveApplicationPage({ apiKey, token, employeeId }: LeaveApplicationPageProps) {
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeData[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [halfDay, setHalfDay] = useState(false);
  const [halfDaySession, setHalfDaySession] = useState<HalfDaySession>(HalfDaySession.MORNING);
  const [reason, setReason] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [applications, setApplications] = useState<ILeaveApplication[]>([]);
  const [showForm, setShowForm] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'cancelled'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState<string>('');

  // Fetch leave types and applications on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' | 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), type === 'error' ? 6000 : 4000);
  };

  const fetchInitialData = async () => {
    try {
      setIsLoadingData(true);
      
      const tenantId = apiKey || '';
      const authToken = token || '';
      const currentYear = new Date().getFullYear();
      
      const [balanceRes, appsRes] = await Promise.all([
        getEmployeeLeaveBalanceDetailed(employeeId, currentYear, tenantId, authToken),
        getLeaveApplications(tenantId, { employee_id: employeeId }, authToken)
      ]);

      // Map leave types from employee leave balance API
      if (balanceRes?.data) {
        const balanceData: EmployeeLeaveBalance = balanceRes.data;
        
        const colors = [
          { color: '#16a34a', bg: '#f0fdf4', icon: Star },
          { color: '#2563eb', bg: '#eff6ff', icon: Zap },
          { color: '#d97706', bg: '#fffbeb', icon: Heart },
          { color: '#7c3aed', bg: '#f5f3ff', icon: Gem },
        ];
        
        const mappedTypes: LeaveTypeData[] = balanceData.leave_types
          .filter(lt => lt.leave_type_properties.is_active)
          .map((lt, idx) => {
            const colorSet = colors[idx % colors.length];
            return {
              id: lt.leave_type_id,
              name: lt.leave_type_name,
              code: lt.leave_type_code,
              description: lt.leave_type_properties.description || 'Leave type',
              is_paid: lt.leave_type_properties.is_paid,
              requires_document: lt.leave_type_properties.requires_document,
              balance: lt.balance.available,
              total: lt.balance.total_entitled,
              min_days: parseFloat(lt.policy_rules.min_days_per_application),
              max_days: parseFloat(lt.policy_rules.max_days_per_application),
              ...colorSet
            };
          });
        
        setLeaveTypes(mappedTypes);
        if (mappedTypes.length > 0) {
          setSelectedTypeId(mappedTypes[0].id);
        }
      }

      if (appsRes?.data) {
        const employeeApps = Array.isArray(appsRes.data) 
          ? appsRes.data
          : Array.isArray(appsRes.data?.data)
          ? appsRes.data.data
          : [];
        setApplications(employeeApps);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      showToast(error?.response?.data?.message || 'Failed to load data', 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  const selectedLeaveType = leaveTypes.find((l) => l.id === selectedTypeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate || !reason.trim() || !selectedTypeId) return;

    try {
      setIsLoading(true);
      const payload: ILeaveApplicationPayload = {
        leave_type_id: selectedTypeId,
        from_date: fromDate,
        to_date: toDate,
        half_day: halfDay,
        half_day_session: halfDay ? halfDaySession : undefined,
        reason: reason.trim(),
        attachment_url: attachmentUrl.trim() || undefined,
      };

      const response = await applyLeave(payload, apiKey, token);

      // Check if response has data (successful creation returns the leave object directly)
      if (response?.data && (response?.data?.success === true || response?.data?.id)) {
        const successMsg = response?.data?.message || 'Leave application submitted successfully!';
        showToast(successMsg, 'success');
        setSubmitted(true);
        setShowForm(false);
        setFromDate('');
        setToDate('');
        setReason('');
        setHalfDay(false);
        setAttachmentUrl('');
        fetchInitialData();
        setTimeout(() => setSubmitted(false), 5000);
      } else if (response?.data?.success === false) {
        // Handle explicit failure response
        const errorMsg = Array.isArray(response?.data?.error) 
          ? response.data.error.join(', ') 
          : response?.data?.error || response?.data?.message || 'Failed to submit leave application';
        throw new Error(errorMsg);
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error: any) {
      console.error('Error submitting leave:', error);
      
      let errorMsg = 'Failed to submit leave application';
      
      if (error?.response?.data?.error) {
        if (Array.isArray(error.response.data.error)) {
          errorMsg = error.response.data.error.join(', ');
        } else if (typeof error.response.data.error === 'string') {
          errorMsg = error.response.data.error;
        }
      } else if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      
      showToast(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelLeave = async (leaveId: string) => {
    setSelectedLeaveId(leaveId);
    setShowCancelModal(true);
  };

  const confirmCancelLeave = async () => {
    if (!selectedLeaveId) return;
    
    try {
      setIsLoading(true);
      const response = await cancelLeave(selectedLeaveId, apiKey, token);
      
      if (response?.data) {
        showToast(response?.data?.message || 'Leave application cancelled successfully', 'success');
        setShowCancelModal(false);
        setSelectedLeaveId('');
        fetchInitialData();
      }
    } catch (error: any) {
      console.error('Error cancelling leave:', error);
      
      let errorMsg = 'Failed to cancel leave';
      
      if (error?.response?.data?.error) {
        if (Array.isArray(error.response.data.error)) {
          errorMsg = error.response.data.error.join(', ');
        } else if (typeof error.response.data.error === 'string') {
          errorMsg = error.response.data.error;
        }
      } else if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      
      showToast(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    // Filter by status
    if (filterStatus !== 'all' && app.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    totalLeaves: applications.length,
    approved: applications.filter(a => a.status === 'approved').length,
    pending: applications.filter(a => a.status === 'pending').length,
    totalDays: applications.reduce((acc, app) => acc + (parseFloat(String(app.total_days || 0))), 0),
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading leave data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedLeaveId('');
        }}
        onConfirm={confirmCancelLeave}
        title="Cancel Leave Application"
        message="Are you sure you want to cancel this leave application? This action cannot be undone."
        confirmText="Yes, Cancel Leave"
        cancelText="No, Keep It"
        type="danger"
        isLoading={isLoading}
      />

      {/* Success Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-[100] animate-in slide-in-from-bottom-2 fade-in duration-300 max-w-md w-full sm:w-auto mx-4 sm:mx-0`}>
          <div className={`flex items-start gap-3 px-5 py-4 rounded-2xl text-sm font-semibold shadow-2xl border backdrop-blur-xl ${
            toast.type === 'success' ? 'bg-emerald-500/95 border-emerald-400/50 text-white'
            : toast.type === 'error' ? 'bg-rose-500/95 border-rose-400/50 text-white'
            : 'bg-blue-500/95 border-blue-400/50 text-white'}`}>
            {toast.type === 'error' ? <X size={20} strokeWidth={2.5} className="flex-shrink-0 mt-0.5"/> : <CheckCircle2 size={20} strokeWidth={2.5} className="flex-shrink-0 mt-0.5"/>}
            <span className="flex-1 leading-relaxed">{toast.msg}</span>
          </div>
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
                onClick={() => { 
                  setShowForm(true); 
                  setFromDate(''); 
                  setToDate(''); 
                  setReason(''); 
                  setHalfDay(false); 
                  setAttachmentUrl(''); 
                }}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 bg-emerald-600 text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <Plus size={16} />
                New Application
              </button>
            )}}
          </div>
        </div>

        {/* Quick Stats Row */}
        {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 lg:mb-4">
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
            <p className="text-[10px] sm:text-xs text-slate-400 mt-1">{stats.totalLeaves > 0 ? Math.round((stats.approved / stats.totalLeaves) * 100) : 0}% acceptance</p>
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
        </div> */}

        {/* Leave Balance Cards */}
        {leaveTypes.length > 0 && (
          <div className="mb-5 lg:mb-6">
            {/* <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-800">Leave Balance</h3>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Available leave types for the year</p>
              </div>
            </div> */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {leaveTypes.map((lt) => {
                const Icon = lt.icon;
                const usedPercent = lt.total > 0 ? ((lt.total - lt.balance) / lt.total) * 100 : 0;
                const availablePercent = lt.total > 0 ? (lt.balance / lt.total) * 100 : 0;
                
                return (
                  <div
                    key={lt.id}
                    className="bg-white rounded-xl sm:rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: lt.bg }}
                      >
                        <Icon size={20} style={{ color: lt.color }} />
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold" style={{ color: lt.color }}>{lt.balance}</p>
                        <p className="text-[10px] text-slate-400">of {lt.total} days</p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm font-bold text-slate-800">{lt.name}</p>
                      <p className="text-[10px] text-slate-500">{lt.code} · {lt.description}</p>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1.5">
                        <span>Used: {lt.total - lt.balance}</span>
                        <span>Available: {lt.balance}</span>
                      </div>
                      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                          style={{ width: `${usedPercent}%`, backgroundColor: lt.color + '40' }}
                        />
                        <div 
                          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                          style={{ width: `${availablePercent}%`, backgroundColor: lt.color }}
                        />
                      </div>
                    </div>
                    
                    {/* Additional info */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{lt.is_paid ? '✓ Paid' : '✗ Unpaid'}</span>
                      {lt.requires_document && <span>📄 Doc Required</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-800">Apply Leave here...</h3>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Available leave types for the year</p>
              </div>
            </div>

        {/* Application Form */}
        {showForm && (
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-5 mb-5 lg:mb-6 shadow-lg">
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

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Leave Type Selection */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Select Leave Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {leaveTypes.filter(lt => lt.balance > 0).map((lt) => {
                    const Icon = lt.icon;
                    const isSelected = selectedTypeId === lt.id;
                    return (
                      <button
                        key={lt.id}
                        type="button"
                        onClick={() => setSelectedTypeId(lt.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'shadow-lg scale-[1.02]'
                            : 'hover:shadow-md hover:scale-[1.01] border-slate-200'
                        }`}
                        style={isSelected ? { borderColor: lt.color, backgroundColor: lt.bg } : {}}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: lt.bg }}
                        >
                          <Icon size={18} style={{ color: lt.color }} />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-bold text-slate-800">{lt.name}</p>
                          <p className="text-[10px] text-slate-500">{lt.code} · {lt.balance} days available</p>
                        </div>
                        {isSelected && <CheckCircle2 size={16} className="text-emerald-500" />}
                      </button>
                    );
                  })}
                </div>
                {leaveTypes.filter(lt => lt.balance > 0).length === 0 && (
                  <div className="text-center py-6 text-sm text-slate-500">
                    No leave types available with balance
                  </div>
                )}
              </div>

              {/* Half Day Toggle */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={halfDay}
                    onChange={(e) => setHalfDay(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs sm:text-sm font-semibold text-slate-700">Half Day Leave</span>
                </label>
                {halfDay && (
                  <div className="mt-3 flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="halfDaySession"
                        checked={halfDaySession === HalfDaySession.MORNING}
                        onChange={() => setHalfDaySession(HalfDaySession.MORNING)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs text-slate-600">Morning</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="halfDaySession"
                        checked={halfDaySession === HalfDaySession.AFTERNOON}
                        onChange={() => setHalfDaySession(HalfDaySession.AFTERNOON)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs text-slate-600">Afternoon</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">From Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">To Date</label>
                  <input
                    type="date"
                    value={toDate}
                    min={fromDate}
                    onChange={(e) => setToDate(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Document requirement notice */}
              {selectedLeaveType?.requires_document && (
                <div className="flex items-start gap-2 bg-amber-50 rounded-xl px-3 py-2.5">
                  <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 font-medium">
                    Document required for this leave type
                  </p>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Reason for Leave</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={3}
                  placeholder="Briefly describe the reason..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Attachment URL */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                  Attachment URL {selectedLeaveType?.requires_document && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="url"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  required={selectedLeaveType?.requires_document}
                  placeholder="https://example.com/document.pdf"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={!fromDate || !toDate || !reason.trim() || isLoading}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Submit Leave Application
                  </>
                )}
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
                {(['all', 'pending', 'approved', 'rejected', 'cancelled'] as const).map((status) => (
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
                const lt = leaveTypes.find((l) => l.id === app.leave_type_id) || {
                  name: app.leave_type_name || app.leave_type?.name || 'Unknown',
                  code: app.leave_type?.code || 'N/A',
                  bg: '#f8fafc',
                  color: '#64748b',
                  icon: Calendar
                };
                const sc = STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                const StatusIcon = sc.icon;
                const Icon = lt.icon;
                const canCancel = app.status === 'pending';
                
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
                            <p className="text-sm sm:text-base font-bold text-slate-800">{lt.name}</p>
                            <span
                              className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                              style={{ backgroundColor: sc.bg, color: sc.color }}
                            >
                              <StatusIcon size={10} />
                              {sc.label}
                            </span>
                            {app.half_day && (
                              <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                                Half Day ({app.half_day_session || 'morning'})
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            {formatDate(app.from_date)} {app.from_date !== app.to_date ? `→ ${formatDate(app.to_date)}` : ''} · {app.total_days} day{parseFloat(String(app.total_days)) > 1 ? 's' : ''}
                          </p>
                          <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
                            Applied {formatRelativeDate(app.applied_on || app.createdAt || '')}
                          </p>
                        </div>
                      </div>
                      
                      {canCancel && (
                        <button
                          onClick={() => handleCancelLeave(app.id)}
                          disabled={isLoading}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Cancel Leave
                        </button>
                      )}
                    </div>
                    
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100">
                      <p className="text-xs sm:text-sm text-slate-700">
                        <span className="font-semibold text-slate-800">Reason:</span> {app.reason}
                      </p>
                      {app.attachment_url && (
                        <a 
                          href={app.attachment_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <Upload size={12} />
                          View Attachment
                        </a>
                      )}
                      {app.rejection_reason && (
                        <div className="mt-2 flex items-start gap-2 bg-red-50 rounded-lg p-2.5 sm:p-3">
                          <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs sm:text-sm text-red-700">
                            <span className="font-semibold">Rejection reason:</span> {app.rejection_reason}
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