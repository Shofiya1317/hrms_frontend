'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Loader2,
  Filter,
} from 'lucide-react';
import {
  getInternDashboard,
  getInternEmployees,
  convertIntern,
  extendInternship,
  terminateInternship,
  IInternDashboard,
  IInternEmployee,
  IInternFilters,
  IConvertInternPayload,
  IExtendInternPayload,
  ITerminateInternPayload,
} from '@/lib/service/intern';
import toast from 'react-hot-toast';

type ActionType = 'convert' | 'extend' | 'terminate';

interface ActionModal {
  type: ActionType | null;
  employee: IInternEmployee | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: 'Active', color: 'text-blue-600 bg-blue-50 ring-blue-500/20', icon: Clock },
  extended: { label: 'Extended', color: 'text-orange-600 bg-orange-50 ring-orange-500/20', icon: Calendar },
  converted: { label: 'Converted', color: 'text-green-600 bg-green-50 ring-green-500/20', icon: CheckCircle },
  terminated: { label: 'Terminated', color: 'text-red-600 bg-red-50 ring-red-500/20', icon: XCircle },
};

export default function InternTracker() {
  const params = useParams();
  const tenantId = params?.subdomain as string;

  const [dashboard, setDashboard] = useState<IInternDashboard | null>(null);
  const [employees, setEmployees] = useState<IInternEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState<IInternFilters>({
    page: 1,
    limit: 10,
    status: 'active'
  });

  const [modal, setModal] = useState<ActionModal>({ type: null, employee: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [convertForm, setConvertForm] = useState<IConvertInternPayload>({
    conversion_date: new Date().toISOString().split('T')[0],
    remarks: '',
  });
  const [extendForm, setExtendForm] = useState<IExtendInternPayload>({
    extension_months: 1,
    reason: '',
  });
  const [terminateForm, setTerminateForm] = useState<ITerminateInternPayload>({
    exit_date: new Date().toISOString().split('T')[0],
    reason: '',
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashRes, empRes] = await Promise.all([
        getInternDashboard(tenantId),
        getInternEmployees(tenantId, filters),
      ]);
      setDashboard((dashRes as any)?.data?.data ?? (dashRes as any)?.data ?? dashRes);
      setEmployees((empRes as any)?.data?.data ?? (empRes as any)?.data ?? []);
    } catch (error) {
      toast.error('Failed to fetch intern data');
    } finally {
      setLoading(false);
    }
  }, [tenantId, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async () => {
    if (!modal.employee) return;
    setIsSubmitting(true);
    try {
      if (modal.type === 'convert') {
        await convertIntern(tenantId, modal.employee.id, convertForm);
        toast.success('Intern converted to Full-Time successfully');
      } else if (modal.type === 'extend') {
        await extendInternship(tenantId, modal.employee.id, extendForm);
        toast.success('Internship extended successfully');
      } else if (modal.type === 'terminate') {
        await terminateInternship(tenantId, modal.employee.id, terminateForm);
        toast.success('Internship terminated successfully');
      }
      setModal({ type: null, employee: null });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !dashboard) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Interns</p>
            <p className="text-2xl font-bold mt-1">{dashboard.summary.total_interns}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Active</p>
            <p className="text-2xl font-bold mt-1 text-blue-600">{dashboard.summary.active}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Converted</p>
            <p className="text-2xl font-bold mt-1 text-green-600">{dashboard.summary.converted}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Expiring This Month</p>
            <p className="text-2xl font-bold mt-1 text-orange-600">{dashboard.summary.expiring_this_month}</p>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            Interns Directory
          </h2>
          <div className="flex gap-2">
            <select 
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="extended">Extended</option>
              <option value="converted">Converted</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role / Dept</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timeline</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No interns found matching the criteria.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const statusConf = STATUS_CONFIG[emp.status || 'active'];
                  const Icon = statusConf?.icon || User;
                  
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {emp.profile_photo_url ? (
                            <img src={emp.profile_photo_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                              {emp.first_name[0]}{emp.last_name[0]}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{emp.first_name} {emp.last_name}</div>
                            <div className="text-xs text-gray-500">{emp.employee_code} • {emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{emp.designation || '-'}</div>
                        <div className="text-xs text-gray-500">{emp.department || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">Joined: {emp.joining_date}</div>
                        <div className="text-xs text-gray-500">Ends: {emp.internship_end_date || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${statusConf?.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {statusConf?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {(emp.status === 'active' || emp.status === 'extended') && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setModal({ type: 'convert', employee: emp })}
                              className="text-xs font-medium text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Convert
                            </button>
                            <button
                              onClick={() => setModal({ type: 'extend', employee: emp })}
                              className="text-xs font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Extend
                            </button>
                            <button
                              onClick={() => setModal({ type: 'terminate', employee: emp })}
                              className="text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Terminate
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal overlays */}
      {modal.type && modal.employee && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 capitalize">
                {modal.type} Internship
              </h3>
              <button onClick={() => setModal({ type: null, employee: null })} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {modal.type === 'convert' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Conversion Date</label>
                    <input 
                      type="date" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      value={convertForm.conversion_date}
                      onChange={e => setConvertForm({...convertForm, conversion_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      rows={3}
                      value={convertForm.remarks}
                      onChange={e => setConvertForm({...convertForm, remarks: e.target.value})}
                    />
                  </div>
                </>
              )}

              {modal.type === 'extend' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Extension (Months)</label>
                    <input 
                      type="number" min="1" max="12"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      value={extendForm.extension_months}
                      onChange={e => setExtendForm({...extendForm, extension_months: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      rows={3}
                      value={extendForm.reason}
                      onChange={e => setExtendForm({...extendForm, reason: e.target.value})}
                    />
                  </div>
                </>
              )}

              {modal.type === 'terminate' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exit Date</label>
                    <input 
                      type="date" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      value={terminateForm.exit_date}
                      onChange={e => setTerminateForm({...terminateForm, exit_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      rows={3}
                      value={terminateForm.reason}
                      onChange={e => setTerminateForm({...terminateForm, reason: e.target.value})}
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button 
                onClick={() => setModal({ type: null, employee: null })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleAction}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
