'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  ClipboardList, 
  FileText, 
  Home, 
  Activity, 
  Plus, 
  X, 
  Search, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Check, 
  Loader2 
} from 'lucide-react';
import AttendanceLogs from '@/components/AdminPortal/AdminAttendance/AttendanceLogs';
import AdminLiveAttendance from '@/components/AdminPortal/AdminAttendance/AdminLiveAttendance';
import AdminRegularizationRequests from '@/components/AdminPortal/AdminAttendance/AdminRegularizationRequests';
import AdminWFHRequests from '@/components/AdminPortal/AdminAttendance/AdminWFHRequests';
import AdminOnDutyRequests from '@/components/AdminPortal/AdminAttendance/AdminOnDutyRequests';
import { useApprovalCounts } from '@/lib/context/ApprovalCountsContext';
import NotificationBadge from '@/components/NotificationBadge';
import { getEmployees } from '@/lib/service/employee';
import { bulkCreateRegularization } from '@/lib/service/regularization';

type Tab = 'live' | 'logs' | 'regularization' | 'wfh' | 'onduty';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'live',           label: 'Live Attendance',          icon: Activity      },
  { id: 'logs',           label: 'Attendance Records',       icon: ClipboardList },
  { id: 'regularization', label: 'Regularization Requests',  icon: FileText      },
  { id: 'wfh',            label: 'WFH Requests',             icon: Home          },
  { id: 'onduty',         label: 'On-Duty Requests',         icon: Home          },
];

export default function AttendanceLogsPage() {
  const params = useParams();
  const subdomain = params?.subdomain as string;
  const [activeTab, setActiveTab] = useState<Tab>('live');
  const { counts } = useApprovalCounts();
  
  // Bulk regularization modal state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [targetType, setTargetType] = useState<'all' | 'specific'>('specific');
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkInTime, setCheckInTime] = useState('09:00');
  const [checkOutTime, setCheckOutTime] = useState('18:00');
  const [remarks, setRemarks] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch employees for bulk select
  useEffect(() => {
    if (showBulkModal && subdomain) {
      const loadEmployees = async () => {
        try {
          setLoadingEmployees(true);
          const response = await getEmployees(subdomain, { limit: 1000, page: 1 });
          const raw = response?.data;
          const list = raw?.employees ?? (Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : []);
          setEmployees(list.map((emp: any) => ({
            id: emp.id,
            name: emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
            code: emp.employee_code || emp.employeeId || 'N/A'
          })));
        } catch (err) {
          console.error('Failed to load employees for bulk regularization:', err);
        } finally {
          setLoadingEmployees(false);
        }
      };
      loadEmployees();
    }
  }, [showBulkModal, subdomain]);

  const handleSelectEmployee = (id: string) => {
    setSelectedEmpIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    const visibleIds = filteredEmployees.map(e => e.id);
    const allSelected = visibleIds.every(id => selectedEmpIds.includes(id));
    
    if (allSelected) {
      setSelectedEmpIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedEmpIds(prev => [...new Set([...prev, ...visibleIds])]);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (targetType === 'specific' && selectedEmpIds.length === 0) {
      setErrorMessage('Please select at least one employee');
      return;
    }

    if (!remarks.trim()) {
      setErrorMessage('Remarks / Reason is required');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        employee_ids: targetType === 'all' ? ['all'] : selectedEmpIds,
        start_date: startDate,
        end_date: endDate,
        check_in_time: checkInTime || undefined,
        check_out_time: checkOutTime || undefined,
        remarks: remarks.trim()
      };

      const response: any = await bulkCreateRegularization(payload, subdomain);
      if (response?.data?.success || response?.success) {
        setSuccessMessage(response?.data?.message || response?.message || 'Bulk regularization applied successfully!');
        setTimeout(() => {
          setShowBulkModal(false);
          // Reset form
          setSelectedEmpIds([]);
          setRemarks('');
          setSuccessMessage('');
          // Refresh page to show updated logs
          window.location.reload();
        }, 1500);
      } else {
        setErrorMessage(response?.data?.message || response?.message || 'Failed to apply bulk regularization');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.response?.data?.message || err?.message || 'An error occurred during submission');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="">
      <div className="py-3 px-2 flex justify-between items-center flex-wrap gap-2">
        <div>
          <h1 className="text-lg font-bold text-[#0f1f2e]">Attendance Management</h1>
          <p className="text-xs text-gray-400 mt-0.5">View live status, historical records, and manage requests</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-auto">
        <div className="pt-3 flex items-center justify-between gap-2 p-3 border-b border-gray-100 overflow-x-auto flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              
              let badgeCount = 0;
              if (counts) {
                if (tab.id === 'regularization') badgeCount = counts.regularization;
                if (tab.id === 'wfh') badgeCount = counts.wfh;
                if (tab.id === 'onduty') badgeCount = counts.onduty;
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-[#0f766e] text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <NotificationBadge count={badgeCount} />
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0f766e] text-white rounded-xl text-[13px] font-bold shadow-sm hover:bg-[#0d635c] transition-colors whitespace-nowrap"
          >
            <Plus size={14} />
            Bulk Regularize
          </button>
        </div>

        <div className="p-4">
          {activeTab === 'live'            && <AdminLiveAttendance />}
          {activeTab === 'logs'            && <AttendanceLogs />}
          {activeTab === 'regularization'  && <AdminRegularizationRequests />}
          {activeTab === 'wfh'             && <AdminWFHRequests />}
          {activeTab === 'onduty'          && <AdminOnDutyRequests />}
        </div>
      </div>

      {/* Bulk Regularization Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="text-base font-bold text-gray-900">Bulk Attendance Regularization</h3>
                <p className="text-xs text-gray-500 mt-0.5">Regularize attendance directly for multiple employees and dates</p>
              </div>
              <button 
                onClick={() => setShowBulkModal(false)}
                className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitBulk} className="flex-1 overflow-y-auto p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={16} />
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
                  <Check size={16} className="text-emerald-600 animate-bounce" />
                  {successMessage}
                </div>
              )}

              {/* Employee Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">Select Employees</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                    <input 
                      type="radio" 
                      name="targetType" 
                      value="specific" 
                      checked={targetType === 'specific'} 
                      onChange={() => setTargetType('specific')}
                      className="accent-[#0f766e]"
                    />
                    Specific Employees
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                    <input 
                      type="radio" 
                      name="targetType" 
                      value="all" 
                      checked={targetType === 'all'} 
                      onChange={() => setTargetType('all')}
                      className="accent-[#0f766e]"
                    />
                    All Active Employees
                  </label>
                </div>

                {targetType === 'specific' && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden mt-2 bg-gray-50/50">
                    {/* Search Bar */}
                    <div className="p-2 border-b border-gray-200 bg-white relative">
                      <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search employees..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    {/* Employee list container */}
                    <div className="max-h-40 overflow-y-auto p-2 space-y-1">
                      {loadingEmployees ? (
                        <div className="py-4 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
                          <Loader2 size={14} className="animate-spin text-teal-600" />
                          Loading employee directory...
                        </div>
                      ) : filteredEmployees.length === 0 ? (
                        <div className="py-4 text-center text-xs text-gray-400">
                          No employees found
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between px-2 py-1 bg-white rounded border border-gray-100 mb-1">
                            <span className="text-[10px] font-bold text-gray-500">
                              Selected: {selectedEmpIds.length}
                            </span>
                            <button
                              type="button"
                              onClick={handleSelectAllVisible}
                              className="text-[10px] font-bold text-teal-600 hover:underline"
                            >
                              Toggle Visible
                            </button>
                          </div>
                          {filteredEmployees.map(emp => (
                            <label 
                              key={emp.id} 
                              className="flex items-center justify-between p-2 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-200"
                            >
                              <div className="flex items-center gap-2">
                                <input 
                                  type="checkbox" 
                                  checked={selectedEmpIds.includes(emp.id)}
                                  onChange={() => handleSelectEmployee(emp.id)}
                                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 accent-[#0f766e]"
                                />
                                <span className="text-xs font-semibold text-gray-700">{emp.name}</span>
                              </div>
                              <span className="text-[10px] text-gray-400 font-mono">{emp.code}</span>
                            </label>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Date Range Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                    <Calendar size={12} className="text-gray-400" />
                    Start Date
                  </label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                    <Calendar size={12} className="text-gray-400" />
                    End Date
                  </label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                  />
                </div>
              </div>

              {/* Timing Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                    <Clock size={12} className="text-gray-400" />
                    Check-in Time
                  </label>
                  <input 
                    type="time" 
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                    <Clock size={12} className="text-gray-400" />
                    Check-out Time
                  </label>
                  <input 
                    type="time" 
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                  />
                </div>
              </div>

              {/* Reason / Remarks */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">Remarks / Reason</label>
                <textarea 
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter reason for regularization..."
                  required
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white placeholder:text-gray-400"
                />
              </div>
            </form>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                disabled={submitting}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitBulk}
                disabled={submitting}
                className="px-4 py-2 bg-[#0f766e] text-white rounded-xl text-xs font-bold hover:bg-[#0d635c] shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Applying...
                  </>
                ) : (
                  'Apply Regularization'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}