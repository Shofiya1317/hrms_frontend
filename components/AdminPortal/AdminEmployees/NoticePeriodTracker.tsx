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
  IResignationDashboard,
  IResignationFilters,
} from '@/lib/service/noticePeriod';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionType = 'approve' | 'reject';

interface ActionModal {
  type: ActionType | null;
  employee: any | null; // Using any for IResignationEmployee for now since not fully typed in guide
}

interface ActionFormState {
  manager_remarks: string;
}

const DEFAULT_FORM: ActionFormState = {
  manager_remarks: '',
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
  approved: {
    label: 'Approved',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-50 text-red-600 border-red-200',
    icon: XCircle,
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
  employee: any;
  onAction: (type: ActionType) => void;
}) {
  // Using fallback in case structure is slightly different
  const status = employee.status || 'pending';
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;

  const days_remaining = employee.days_remaining || 0;
  const expected_last_day = employee.expected_last_day || '';
  const reason = employee.reason || 'Personal Reasons';

  const isExpiringSoon = days_remaining <= 15 && days_remaining > 0;
  const isExpired = days_remaining <= 0;
  const canTakeAction = status === 'pending';

  const employeeName = employee.employee_name || 'Unknown Employee';
  const initials = employeeName
    .split(' ')
    .map((w: any) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white text-base font-bold">{initials}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">
              {employeeName}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {employee.employee_code || 'EMP'}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusCfg.color}`}
        >
          <StatusIcon size={10} />
          {statusCfg.label}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Building2 size={12} className="text-gray-400 flex-shrink-0" />
          <span className="truncate">{employee.department?.name || 'Department'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Award size={12} className="text-gray-400 flex-shrink-0" />
          <span className="truncate">{employee.designation?.name || 'Designation'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Calendar size={12} className="text-gray-400 flex-shrink-0" />
          <span>
            Expected LWD: {expected_last_day ? new Date(expected_last_day).toLocaleDateString() : 'TBD'}
          </span>
        </div>
        <div className="flex items-start gap-2 text-xs text-gray-600 pt-1">
          <AlertCircle size={12} className="text-gray-400 flex-shrink-0 mt-0.5" />
          <span className="italic line-clamp-2">{employee.reason || reason}</span>
        </div>
      </div>

      {/* Days remaining */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Days Remaining</span>
          <span
            className={`text-sm font-bold ${
              isExpired
                ? 'text-red-600'
                : isExpiringSoon
                ? 'text-amber-600'
                : 'text-gray-700'
            }`}
          >
            {days_remaining > 0 ? `${days_remaining} days` : '0 days'}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      {canTakeAction && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => onAction('approve')}
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <UserCheck size={12} />
            Approve
          </button>
          <button
            onClick={() => onAction('reject')}
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <AlertTriangle size={12} />
            Reject
          </button>
        </div>
      )}
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
            Manager Remarks
          </label>
          <textarea
            value={form.manager_remarks}
            onChange={(e) =>
              onChange({ manager_remarks: e.target.value })
            }
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            rows={3}
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

  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NoticePeriodTracker() {
  const params = useParams();
  const subdomain = params?.subdomain as string;

  const [dashboard, setDashboard] = useState<IResignationDashboard | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
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
      setEmployees(employeesRes?.data?.data ?? []);
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

  const handleOpenModal = (employee: any, type: ActionType) => {
    setForm({
      ...DEFAULT_FORM,
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

    const employeeId = actionModal.employee.employee_id || actionModal.employee.id;

    if (actionModal.type === 'reject' && !form.manager_remarks.trim()) {
      toast.error('Please add rejection reason');
      return;
    }

    try {
      setActionLoading(true);

      if (actionModal.type === 'approve') {
        await approveResignation(subdomain, employeeId, {
          manager_remarks: form.manager_remarks,
        });
        toast.success('Resignation approved successfully');
      } else if (actionModal.type === 'reject') {
        await rejectResignation(subdomain, employeeId, {
          manager_remarks: form.manager_remarks,
        });
        toast.success('Resignation rejected');
      }

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
                  {actionModal.employee.employee_name || 'Unknown'}
                </p>
                <p className="text-xs text-gray-600">
                  {actionModal.employee.employee_code || 'EMP'}
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
