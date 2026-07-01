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
  Building2,
  Award,
  Loader2,
  Filter,
  ChevronDown,
  UserCheck,
  AlertTriangle,
  X,
} from 'lucide-react';
import {
  getResignationDashboard,
  getNoticePeriods,
  approveResignation,
  rejectResignation,
  updateNoticePeriod,
  completeNoticePeriod,
  withdrawResignation,
  IResignationDashboard,
  IResignationFilters,
  INoticePeriodResponse,
} from '@/lib/service/noticePeriod';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionType = 'approve' | 'reject' | 'update' | 'complete' | 'withdraw';

interface ActionModal {
  type: ActionType | null;
  employee: INoticePeriodResponse | null;
}

interface ActionFormState {
  manager_remarks: string;
  hr_remarks: string;
  expected_last_working_day: string;
  buyout_days: number | '';
  buyout_amount: number | '';
  actual_last_working_day: string;
}

const DEFAULT_FORM: ActionFormState = {
  manager_remarks: '',
  hr_remarks: '',
  expected_last_working_day: '',
  buyout_days: '',
  buyout_amount: '',
  actual_last_working_day: '',
};

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  pending: {
    label: 'Pending Approval',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  active: {
    label: 'Serving Notice',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Clock,
  },
  approved: {
    label: 'Serving Notice',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-50 text-red-600 border-red-200',
    icon: XCircle,
  },
  // withdrawn: {
  //   label: 'Withdrawn',
  //   color: 'bg-gray-50 text-gray-700 border-gray-200',
  //   icon: XCircle,
  // },
  completed: {
    label: 'Completed',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: CheckCircle,
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <div
          className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}
        >
          <Icon size={18} className={color} />
        </div>
        <span className="text-2xl font-bold text-gray-800">{value}</span>
      </div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
    </div>
  );
}

function NoticePeriodEmployeeCard({
  employee,
  onAction,
}: {
  employee: INoticePeriodResponse;
  onAction: (type: ActionType) => void;
}) {
  const status = employee.status ? employee.status.toLowerCase() : 'pending';
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;

  const expected_last_day = employee.expected_last_working_day || employee.requested_last_working_day || '';
  const reason = employee.reason || 'Personal Reasons';

  let days_remaining = 0;
  if (expected_last_day && status === 'active') {
    const diff = new Date(expected_last_day).getTime() - new Date().getTime();
    days_remaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  const isExpiringSoon = days_remaining <= 15 && days_remaining > 0;
  const isExpired = days_remaining <= 0 && status === 'active';

  const employeeName = employee.employee
    ? `${employee.employee.first_name} ${employee.employee.last_name}`
    : 'Unknown Employee';
  const initials = employeeName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Top Header Section */}
      <div className="p-5 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center flex-shrink-0 shadow-sm text-white font-bold text-lg">
            {initials}
          </div>
          <div>
            <p className="text-base font-bold text-gray-900 leading-tight">
              {employeeName}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                {employee.employee?.employee_code || 'EMP'}
              </span>
              <span className="text-xs text-gray-500">{employee.employment_type?.replace('_', ' ') || 'Full Time'}</span>
            </div>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${statusCfg.color}`}
        >
          <StatusIcon size={12} />
          {statusCfg.label}
        </span>
      </div>

      {/* Main Details Body */}
      <div className="p-5 space-y-4 flex-1">
        
        {/* Timeline Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar size={12} /> Requested
            </p>
            <p className="text-sm font-semibold text-gray-900">
              {employee.requested_last_working_day ? new Date(employee.requested_last_working_day).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div className={`rounded-xl p-3 border ${status === 'completed' ? 'bg-purple-50 border-purple-100' : 'bg-blue-50 border-blue-100'}`}>
            <p className={`text-[11px] font-semibold uppercase tracking-wider mb-1 flex items-center gap-1 ${status === 'completed' ? 'text-purple-600' : 'text-blue-600'}`}>
              <CheckCircle size={12} /> {status === 'completed' ? 'Actual Exit' : 'Expected Exit'}
            </p>
            <p className={`text-sm font-bold ${status === 'completed' ? 'text-purple-700' : 'text-blue-700'}`}>
              {status === 'completed' && employee.actual_last_working_day
                ? new Date(employee.actual_last_working_day).toLocaleDateString()
                : (expected_last_day ? new Date(expected_last_day).toLocaleDateString() : 'TBD')}
            </p>
          </div>
        </div>

        {/* Reason */}
        <div>
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <AlertCircle size={12} /> Reason for leaving
          </p>
          <p className="text-sm font-medium text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
            {reason}
          </p>
        </div>

        {/* Buyout Details & Days Remaining */}
        {(employee.buyout_days || status === 'active') && (
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            {employee.buyout_days ? (
              <div>
                <p className="text-xs text-gray-500">Buyout Details</p>
                <p className="text-sm font-semibold text-gray-900">
                  {employee.buyout_days} days (₹{employee.buyout_amount || 0})
                </p>
              </div>
            ) : (
              <div /> // Spacer
            )}
            
            {status === 'active' && (
              <div className="text-right">
                <p className="text-xs text-gray-500">Notice Left</p>
                <p className={`text-sm font-bold ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : 'text-teal-600'}`}>
                  {days_remaining > 0 ? `${days_remaining} days` : 'Expired'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Footers */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        {status === 'pending' && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onAction('approve')}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <UserCheck size={16} /> Approve
            </button>
            <button
              onClick={() => onAction('reject')}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 hover:border-red-300 transition-colors"
            >
              <AlertTriangle size={16} /> Reject
            </button>
          </div>
        )}
        
        {(status === 'active' || status === 'approved') && (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onAction('complete')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
              >
                <CheckCircle size={14} /> Complete Exit
              </button>
              <button
                onClick={() => onAction('update')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Calendar size={14} /> Update Notice
              </button>
            </div>
            {/* <button
              onClick={() => onAction('withdraw')}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={12} /> Withdraw Resignation
            </button> */}
          </div>
        )}

        {(status === 'rejected' || status === 'completed') && (
          <div className="text-center">
            <p className="text-xs text-gray-400 font-medium">No actions available for this record.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Action Modal ─────────────────────────────────────────────────────────────

function ActionModalContent({
  type,
  form,
  onChange,
}: {
  type: ActionType;
  form: ActionFormState;
  onChange: (patch: Partial<ActionFormState>) => void;
}) {
  if (type === 'approve') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expected Exit Date (Optional Override)
          </label>
          <input 
            type="date" 
            value={form.expected_last_working_day} 
            onChange={e => onChange({ expected_last_working_day: e.target.value })} 
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buyout Days (if early)</label>
            <input 
              type="number" 
              value={form.buyout_days} 
              onChange={e => onChange({ buyout_days: e.target.value === '' ? '' : Number(e.target.value) })} 
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buyout Amount (₹)</label>
            <input 
              type="number" 
              value={form.buyout_amount} 
              onChange={e => onChange({ buyout_amount: e.target.value === '' ? '' : Number(e.target.value) })} 
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Manager Remarks
          </label>
          <textarea
            value={form.manager_remarks}
            onChange={(e) => onChange({ manager_remarks: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            rows={2}
            placeholder="Add approval remarks or transition plan details..."
          />
        </div>
      </div>
    );
  }

  if (type === 'reject') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rejection Reason / Manager Remarks <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.manager_remarks}
            onChange={(e) => onChange({ manager_remarks: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            rows={3}
            placeholder="Reason for rejecting the resignation (e.g., retention discussed)..."
          />
        </div>
      </div>
    );
  }

  if (type === 'update') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expected Exit Date</label>
          <input type="date" value={form.expected_last_working_day} onChange={e => onChange({ expected_last_working_day: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buyout Days</label>
            <input type="number" value={form.buyout_days} onChange={e => onChange({ buyout_days: e.target.value === '' ? '' : Number(e.target.value) })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buyout Amount (₹)</label>
            <input type="number" value={form.buyout_amount} onChange={e => onChange({ buyout_amount: e.target.value === '' ? '' : Number(e.target.value) })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Manager Remarks</label>
          <textarea value={form.manager_remarks} onChange={e => onChange({ manager_remarks: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" rows={2} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">HR Remarks</label>
          <textarea value={form.hr_remarks} onChange={e => onChange({ hr_remarks: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" rows={2} />
        </div>
      </div>
    );
  }

  if (type === 'complete') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Actual Exit Date <span className="text-red-500">*</span></label>
          <input type="date" value={form.actual_last_working_day} onChange={e => onChange({ actual_last_working_day: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">HR Remarks</label>
          <textarea value={form.hr_remarks} onChange={e => onChange({ hr_remarks: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" rows={3} placeholder="Final remarks for completion..." />
        </div>
      </div>
    );
  }

  // if (type === 'withdraw') {
  //   return (
  //     <div className="space-y-4">
  //       <p className="text-sm font-medium text-gray-800">Are you sure you want to withdraw the resignation for this employee?</p>
  //       <p className="text-xs text-gray-500">This action will cancel the resignation process entirely.</p>
  //     </div>
  //   );
  // }

  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NoticePeriodTracker() {
  const params = useParams();
  const subdomain = params?.subdomain as string;

  const [dashboard, setDashboard] = useState<IResignationDashboard | null>(null);
  const [employees, setEmployees] = useState<INoticePeriodResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<IResignationFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [actionModal, setActionModal] = useState<ActionModal>({
    type: null,
    employee: null,
  });
  const [form, setForm] = useState<ActionFormState>(DEFAULT_FORM);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!subdomain) return;
    try {
      setLoading(true);
      const [dashboardRes, employeesRes] = await Promise.all([
        getResignationDashboard(subdomain).catch(() => ({ data: { data: null } })),
        getNoticePeriods(subdomain, filters).catch(() => ({ data: { data: [] } })),
      ]);
      setDashboard(dashboardRes?.data?.data ?? dashboardRes?.data ?? null);
      setEmployees(employeesRes?.data?.data ?? employeesRes?.data ?? []);
    } catch (error) {
      console.error('Failed to load resignation data:', error);
      toast.error('Failed to load resignation data');
    } finally {
      setLoading(false);
    }
  }, [subdomain, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenModal = (employee: INoticePeriodResponse, type: ActionType) => {
    setForm({
      ...DEFAULT_FORM,
      expected_last_working_day: employee.expected_last_working_day 
                               ? new Date(employee.expected_last_working_day).toISOString().split('T')[0]
                               : employee.requested_last_working_day 
                                 ? new Date(employee.requested_last_working_day).toISOString().split('T')[0]
                                 : '',
      buyout_days: employee.buyout_days ?? '',
      buyout_amount: employee.buyout_amount ?? '',
      manager_remarks: employee.manager_remarks || '',
      hr_remarks: employee.hr_remarks || '',
    });
    setActionModal({ type, employee });
  };

  const handleCloseModal = () => {
    setActionModal({ type: null, employee: null });
  };

  const handleFormChange = (patch: Partial<ActionFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const handleAction = async () => {
    if (!actionModal.employee || !actionModal.type || !subdomain) return;

    const recordId = actionModal.employee.id;

    if (actionModal.type === 'reject' && !form.manager_remarks.trim()) {
      toast.error('Please add rejection reason');
      return;
    }

    try {
      setActionLoading(true);

      if (actionModal.type === 'approve') {
        await approveResignation(subdomain, recordId, {
          manager_remarks: form.manager_remarks || undefined,
          expected_last_working_day: form.expected_last_working_day || undefined,
          buyout_days: form.buyout_days === '' ? undefined : Number(form.buyout_days),
          buyout_amount: form.buyout_amount === '' ? undefined : Number(form.buyout_amount),
        });
        toast.success('Resignation approved successfully');
      } else if (actionModal.type === 'reject') {
        await rejectResignation(subdomain, recordId, {
          manager_remarks: form.manager_remarks,
        });
        toast.success('Resignation rejected');
      } else if (actionModal.type === 'update') {
        await updateNoticePeriod(subdomain, recordId, {
          expected_last_working_day: form.expected_last_working_day || undefined,
          buyout_days: form.buyout_days === '' ? undefined : Number(form.buyout_days),
          buyout_amount: form.buyout_amount === '' ? undefined : Number(form.buyout_amount),
          manager_remarks: form.manager_remarks || undefined,
          hr_remarks: form.hr_remarks || undefined,
        });
        toast.success('Notice period details updated');
      } else if (actionModal.type === 'complete') {
        if (!form.actual_last_working_day) {
          toast.error('Actual last working day is required');
          setActionLoading(false);
          return;
        }
        await completeNoticePeriod(subdomain, recordId, {
          actual_last_working_day: form.actual_last_working_day,
          hr_remarks: form.hr_remarks || undefined,
        });
        toast.success('Notice period completed');
       } 
      //else if (actionModal.type === 'withdraw') {
      //   await withdrawResignation(subdomain, recordId);
      //   toast.success('Resignation withdrawn');
      //}

      handleCloseModal();
      loadData();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ?? 'Action failed. Please try again.',
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 size={20} className="animate-spin text-[#0f766e]" />
          <span className="text-sm text-gray-500">
            Loading resignation data...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      {dashboard && dashboard.overview && (
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-3">Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard
              title="Total on Notice"
              value={dashboard.overview.total_on_notice || 0}
              icon={Clock}
              color="text-indigo-600"
              bgColor="bg-indigo-50"
            />
            <StatCard
              title="Expiring This Week"
              value={dashboard.overview.expiring_this_week || 0}
              icon={AlertCircle}
              color="text-amber-600"
              bgColor="bg-amber-50"
            />
            <StatCard
              title="Pending Approval"
              value={dashboard.status_breakdown?.pending || 0}
              icon={Clock}
              color="text-blue-600"
              bgColor="bg-blue-50"
            />
            <StatCard
              title="Approved"
              value={dashboard.status_breakdown?.approved || 0}
              icon={CheckCircle}
              color="text-emerald-600"
              bgColor="bg-emerald-50"
            />
            <StatCard
              title="Rejected"
              value={dashboard.status_breakdown?.rejected || 0}
              icon={XCircle}
              color="text-red-600"
              bgColor="bg-red-50"
            />
          </div>
        </div>
      )}

      {/* Filters */}
      <div>
        <button
          onClick={() => setShowFilters((p) => !p)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Filter size={14} />
          Filters
          <ChevronDown
            size={14}
            className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}
          />
        </button>

        {showFilters && (
          <div className="mt-3 p-4 bg-white border border-gray-200 rounded-xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={filters.status ?? ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    status: e.target.value || undefined,
                  })
                }
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Employees Grid */}
      {employees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((employee, idx) => (
            <NoticePeriodEmployeeCard
              key={employee.employee_id || idx}
              employee={employee}
              onAction={(type) => handleOpenModal(employee, type)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
          <User size={32} className="text-gray-300 mb-3" />
          <h3 className="text-sm font-semibold text-gray-700">
            No records found
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            No employees match the current filters.
          </p>
        </div>
      )}

      {/* Action Modal */}
      {actionModal.type && actionModal.employee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {actionModal.type === 'approve' ? (
                  <UserCheck size={18} className="text-emerald-600" />
                ) : (
                  <AlertTriangle size={18} className="text-red-600" />
                )}
                <h3 className="text-sm font-bold text-gray-900 capitalize">
                  {actionModal.type} Resignation
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5">
              <div className="mb-5 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Employee</p>
                <p className="text-sm font-bold text-gray-900">
                  {actionModal.employee.employee
                    ? `${actionModal.employee.employee.first_name} ${actionModal.employee.employee.last_name}`
                    : 'Unknown'}
                </p>
                <p className="text-xs text-gray-600">
                  {actionModal.employee.employee?.employee_code || 'EMP'}
                </p>
              </div>

              <ActionModalContent
                type={actionModal.type}
                form={form}
                onChange={handleFormChange}
              />
            </div>

            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={actionLoading}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${
                  actionModal.type === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionLoading && <Loader2 size={14} className="animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
