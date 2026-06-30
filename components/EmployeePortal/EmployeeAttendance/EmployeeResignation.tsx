'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  Clock,
  Send,
} from 'lucide-react';
import { submitResignation, getEmployeeResignationStatus } from '@/lib/service/noticePeriod';
import toast from 'react-hot-toast';

export default function EmployeeResignation() {
  const params = useParams();
  const subdomain = params?.subdomain as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusData, setStatusData] = useState<any>(null);

  const [form, setForm] = useState({
    reason: '',
    requested_last_working_day: '',
    employee_remarks: '',
  });

  const loadStatus = useCallback(async () => {
    if (!subdomain) return;
    try {
      setLoading(true);
      const res = await getEmployeeResignationStatus(subdomain).catch(() => ({ data: { data: null } }));
      setStatusData(res?.data?.data ?? res?.data ?? null);
    } catch (error) {
      console.error('Failed to load resignation status', error);
    } finally {
      setLoading(false);
    }
  }, [subdomain]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subdomain) return;
    if (!form.reason || !form.requested_last_working_day) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await submitResignation(subdomain, form);
      toast.success('Resignation submitted successfully');
      loadStatus();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to submit resignation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 size={24} className="animate-spin text-[#0f766e]" />
          <span className="text-gray-500 font-medium">Loading details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resignation</h1>
          <p className="text-sm text-gray-500 mt-1">Submit or track your resignation request</p>
        </div>
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
          <FileText size={24} />
        </div>
      </div>

      {statusData?.status ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Current Status</h2>
            {statusData.status === 'pending' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-sm font-semibold">
                <Clock size={16} /> Pending Approval
              </span>
            )}
            {statusData.status === 'approved' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-semibold">
                <CheckCircle size={16} /> Approved
              </span>
            )}
            {statusData.status === 'rejected' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-200 text-sm font-semibold">
                <XCircle size={16} /> Rejected
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Requested Last Working Day</p>
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                {new Date(statusData.requested_last_working_day || statusData.expected_last_day).toLocaleDateString()}
              </p>
            </div>
            {statusData.status === 'approved' && statusData.expected_last_working_day && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Confirmed Exit Date</p>
                <p className="font-semibold text-emerald-600 flex items-center gap-2">
                  <CheckCircle size={16} />
                  {new Date(statusData.expected_last_working_day).toLocaleDateString()}
                </p>
              </div>
            )}
            <div className="col-span-1 md:col-span-2">
              <p className="text-sm text-gray-500 mb-1">Reason</p>
              <p className="text-gray-900">{statusData.reason}</p>
            </div>
            {(statusData.manager_remarks || statusData.admin_remarks || statusData.hr_remarks) && (
              <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                  <AlertCircle size={16} className="text-[#0f766e]" />
                  Remarks
                </p>
                <p className="text-sm text-gray-600">{statusData.manager_remarks || statusData.admin_remarks || statusData.hr_remarks}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Submit Resignation</h2>
          <p className="text-sm text-gray-500 mb-6">Please provide the details for your resignation request. Once submitted, it will be sent to HR and your manager for review.</p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Reason for Resignation <span className="text-red-500">*</span>
              </label>
              <select
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all"
                required
              >
                <option value="">Select a reason</option>
                <option value="Better Career Opportunity">Better Career Opportunity</option>
                <option value="Higher Education">Higher Education</option>
                <option value="Personal Reasons">Personal Reasons</option>
                <option value="Health Issues">Health Issues</option>
                <option value="Relocation">Relocation</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Expected Last Working Day <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.requested_last_working_day}
                onChange={(e) => setForm({ ...form, requested_last_working_day: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Additional Comments
              </label>
              <textarea
                value={form.employee_remarks}
                onChange={(e) => setForm({ ...form, employee_remarks: e.target.value })}
                className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all resize-none min-h-[120px]"
                placeholder="Any additional information you'd like to provide..."
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#0f766e] rounded-xl hover:bg-[#0d6460] transition-colors shadow-sm disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
