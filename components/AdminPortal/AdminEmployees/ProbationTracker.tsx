'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  Clock,
  Calendar,
  TrendingUp,
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
  FileText,
  AlertTriangle,
  X,
} from 'lucide-react';
import {
  getProbationDashboard,
  getProbationEmployees,
  confirmProbation,
  submitProbationReview,
  extendProbation,
  failProbation,
  IProbationDashboard,
  IProbationEmployee,
  IProbationFilters,
  IProbationReviewPayload,
  IConfirmProbationPayload,
  IExtendProbationPayload,
  IFailProbationPayload,
} from '@/lib/service/probation';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionType = 'confirm' | 'review' | 'extend' | 'fail';

interface ActionModal {
  type: ActionType | null;
  employee: IProbationEmployee | null;
}

interface ActionFormState {
  // confirm
  confirmation_date: string;
  confirmation_remarks: string;
  // extend
  extension_months: number;
  extension_reason: string;
  // fail
  failure_remarks: string;
  exit_date: string;
  // review
  performance_rating: number;
  work_quality_rating: number;
  productivity_rating: number;
  attendance_rating: number;
  discipline_rating: number;
  communication_rating: number;
  team_collaboration_rating: number;
  recommendation: 'confirm' | 'extend' | 'fail';
  review_extension_months: number;
  review_extension_reason: string;
  review_remarks: string;
}

const DEFAULT_FORM: ActionFormState = {
  confirmation_date: new Date().toISOString().split('T')[0],
  confirmation_remarks: '',
  extension_months: 1,
  extension_reason: '',
  failure_remarks: '',
  exit_date: '',
  performance_rating: 3,
  work_quality_rating: 3,
  productivity_rating: 3,
  attendance_rating: 3,
  discipline_rating: 3,
  communication_rating: 3,
  team_collaboration_rating: 3,
  recommendation: 'confirm',
  review_extension_months: 1,
  review_extension_reason: '',
  review_remarks: '',
};

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  active: {
    label: 'Active',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Clock,
  },
  under_review: {
    label: 'Under Review',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: AlertCircle,
  },
  extended: {
    label: 'Extended',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: TrendingUp,
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle,
  },
  failed: {
    label: 'Failed',
    color: 'bg-red-50 text-red-600 border-red-200',
    icon: XCircle,
  },
};

const ACTION_CONFIG: Record<
  ActionType,
  { label: string; btnClass: string; icon: React.ElementType }
> = {
  confirm: {
    label: 'Confirm Probation',
    btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    icon: UserCheck,
  },
  review: {
    label: 'Submit Review',
    btnClass: 'bg-purple-600 hover:bg-purple-700 text-white',
    icon: FileText,
  },
  extend: {
    label: 'Extend Probation',
    btnClass: 'bg-amber-600 hover:bg-amber-700 text-white',
    icon: Clock,
  },
  fail: {
    label: 'Fail Probation',
    btnClass: 'bg-red-600 hover:bg-red-700 text-white',
    icon: AlertTriangle,
  },
};

const RATING_FIELDS: { key: keyof ActionFormState; label: string }[] = [
  { key: 'performance_rating', label: 'Performance' },
  { key: 'work_quality_rating', label: 'Work Quality' },
  { key: 'productivity_rating', label: 'Productivity' },
  { key: 'attendance_rating', label: 'Attendance' },
  { key: 'discipline_rating', label: 'Discipline' },
  { key: 'communication_rating', label: 'Communication' },
  { key: 'team_collaboration_rating', label: 'Team Collaboration' },
];

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

function RatingInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-gray-600 w-36 flex-shrink-0">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
              star <= value
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            {star}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProbationEmployeeCard({
  employee,
  onAction,
}: {
  employee: IProbationEmployee;
  onAction: (type: ActionType) => void;
}) {
  const statusCfg = STATUS_CONFIG[employee.probation_details.status] ?? STATUS_CONFIG.active;
  const StatusIcon = statusCfg.icon;

  const { days_remaining, extension_count, probation_end_date, status } =
    employee.probation_details;

  const isExpiringSoon = days_remaining <= 30 && days_remaining > 0;
  const isExpired = days_remaining <= 0;
  const canTakeAction = ['active', 'under_review', 'extended'].includes(status);

  const initials = employee.employee_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white text-base font-bold">{initials}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">
              {employee.employee_name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {employee.employee_code}
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
          <span className="truncate">{employee.department.name}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Award size={12} className="text-gray-400 flex-shrink-0" />
          <span className="truncate">{employee.designation.name}</span>
        </div>
        {employee.reporting_manager && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <User size={12} className="text-gray-400 flex-shrink-0" />
            <span className="truncate">
              {employee.reporting_manager.name}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Calendar size={12} className="text-gray-400 flex-shrink-0" />
          <span>
            Ends: {new Date(probation_end_date).toLocaleDateString()}
          </span>
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
            {days_remaining > 0 ? `${days_remaining} days` : 'Expired'}
          </span>
        </div>
        {extension_count > 0 && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">Extensions</span>
            <span className="text-xs font-semibold text-amber-600">
              {extension_count}x
            </span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {canTakeAction && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => onAction('confirm')}
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <UserCheck size={12} />
            Confirm
          </button>
          <button
            onClick={() => onAction('review')}
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <FileText size={12} />
            Review
          </button>
          <button
            onClick={() => onAction('extend')}
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
          >
            <Clock size={12} />
            Extend
          </button>
          <button
            onClick={() => onAction('fail')}
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <AlertTriangle size={12} />
            Fail
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
  if (type === 'confirm') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirmation Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={form.confirmation_date}
            onChange={(e) => onChange({ confirmation_date: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Remarks <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.confirmation_remarks}
            onChange={(e) =>
              onChange({ confirmation_remarks: e.target.value })
            }
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            rows={3}
            placeholder="Add confirmation remarks..."
          />
        </div>
      </div>
    );
  }

  if (type === 'extend') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Extension (months) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={form.extension_months}
            onChange={(e) =>
              onChange({ extension_months: Number(e.target.value) })
            }
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            min={1}
            max={12}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.extension_reason}
            onChange={(e) => onChange({ extension_reason: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            rows={3}
            placeholder="Reason for extension..."
          />
        </div>
      </div>
    );
  }

  if (type === 'fail') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Exit Date
          </label>
          <input
            type="date"
            value={form.exit_date}
            onChange={(e) => onChange({ exit_date: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Failure Remarks <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.failure_remarks}
            onChange={(e) => onChange({ failure_remarks: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            rows={3}
            placeholder="Reason for failing probation..."
          />
        </div>
      </div>
    );
  }

  // review
  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Ratings (1–5)
        </p>
        {RATING_FIELDS.map(({ key, label }) => (
          <RatingInput
            key={key}
            label={label}
            value={form[key] as number}
            onChange={(v) => onChange({ [key]: v })}
          />
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Recommendation <span className="text-red-500">*</span>
        </label>
        <select
          value={form.recommendation}
          onChange={(e) =>
            onChange({
              recommendation: e.target.value as 'confirm' | 'extend' | 'fail',
            })
          }
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="confirm">Confirm</option>
          <option value="extend">Extend</option>
          <option value="fail">Fail</option>
        </select>
      </div>

      {form.recommendation === 'extend' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Extension Months
            </label>
            <input
              type="number"
              value={form.review_extension_months}
              onChange={(e) =>
                onChange({ review_extension_months: Number(e.target.value) })
              }
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              min={1}
              max={12}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Extension Reason
            </label>
            <textarea
              value={form.review_extension_reason}
              onChange={(e) =>
                onChange({ review_extension_reason: e.target.value })
              }
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
              rows={2}
              placeholder="Reason for extension..."
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Remarks <span className="text-red-500">*</span>
        </label>
        <textarea
          value={form.review_remarks}
          onChange={(e) => onChange({ review_remarks: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
          rows={3}
          placeholder="Overall review remarks..."
        />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProbationTracker() {
  const params = useParams();
  const subdomain = params?.subdomain as string;

  const [dashboard, setDashboard] = useState<IProbationDashboard | null>(null);
  const [employees, setEmployees] = useState<IProbationEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<IProbationFilters>({});
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
        getProbationDashboard(subdomain),
        getProbationEmployees(subdomain, filters),
      ]);
      setDashboard(dashboardRes?.data?.data ?? dashboardRes?.data ?? null);
      setEmployees(employeesRes?.data?.data ?? []);
    } catch (error) {
      console.error('Failed to load probation data:', error);
      toast.error('Failed to load probation data');
    } finally {
      setLoading(false);
    }
  }, [subdomain, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenModal = (employee: IProbationEmployee, type: ActionType) => {
    setForm(DEFAULT_FORM);
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

    const employeeId = actionModal.employee.employee_id;

    // Basic validation
    if (actionModal.type === 'confirm' && !form.confirmation_remarks.trim()) {
      toast.error('Please add confirmation remarks');
      return;
    }
    if (actionModal.type === 'extend' && !form.extension_reason.trim()) {
      toast.error('Please add a reason for extension');
      return;
    }
    if (actionModal.type === 'fail' && !form.failure_remarks.trim()) {
      toast.error('Please add failure remarks');
      return;
    }
    if (actionModal.type === 'review' && !form.review_remarks.trim()) {
      toast.error('Please add review remarks');
      return;
    }

    try {
      setActionLoading(true);

      switch (actionModal.type) {
        case 'confirm': {
          const payload: IConfirmProbationPayload = {
            confirmation_date: form.confirmation_date,
            confirmation_remarks: form.confirmation_remarks,
          };
          await confirmProbation(subdomain, employeeId, payload);
          toast.success('Probation confirmed successfully');
          break;
        }
        case 'extend': {
          const payload: IExtendProbationPayload = {
            extension_months: form.extension_months,
            extension_reason: form.extension_reason,
          };
          await extendProbation(subdomain, employeeId, payload);
          toast.success('Probation extended successfully');
          break;
        }
        case 'fail': {
          const payload: IFailProbationPayload = {
            failure_remarks: form.failure_remarks,
            ...(form.exit_date ? { exit_date: form.exit_date } : {}),
          };
          await failProbation(subdomain, employeeId, payload);
          toast.success('Probation failed and recorded');
          break;
        }
        case 'review': {
          const payload: IProbationReviewPayload = {
            performance_rating: form.performance_rating,
            work_quality_rating: form.work_quality_rating,
            productivity_rating: form.productivity_rating,
            attendance_rating: form.attendance_rating,
            discipline_rating: form.discipline_rating,
            communication_rating: form.communication_rating,
            team_collaboration_rating: form.team_collaboration_rating,
            recommendation: form.recommendation,
            extension_months:
              form.recommendation === 'extend'
                ? form.review_extension_months
                : null,
            extension_reason:
              form.recommendation === 'extend'
                ? form.review_extension_reason
                : null,
            remarks: form.review_remarks,
          };
          await submitProbationReview(subdomain, employeeId, payload);
          toast.success('Review submitted successfully');
          break;
        }
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

  // ─── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 size={20} className="animate-spin text-blue-600" />
          <span className="text-sm text-gray-500">
            Loading probation data...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      {dashboard && (
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-3">Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard
              title="Total on Probation"
              value={dashboard.overview.total_on_probation}
              icon={Clock}
              color="text-blue-600"
              bgColor="bg-blue-50"
            />
            <StatCard
              title="Expiring This Week"
              value={dashboard.overview.expiring_this_week}
              icon={AlertCircle}
              color="text-red-600"
              bgColor="bg-red-50"
            />
            <StatCard
              title="Expiring This Month"
              value={dashboard.overview.expiring_this_month}
              icon={Calendar}
              color="text-amber-600"
              bgColor="bg-amber-50"
            />
            <StatCard
              title="Confirmed"
              value={dashboard.status_breakdown.confirmed}
              icon={CheckCircle}
              color="text-emerald-600"
              bgColor="bg-emerald-50"
            />
            <StatCard
              title="Extended"
              value={dashboard.status_breakdown.extended}
              icon={TrendingUp}
              color="text-amber-600"
              bgColor="bg-amber-50"
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
                    status:
                      (e.target.value as IProbationFilters['status']) ||
                      undefined,
                  })
                }
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="under_review">Under Review</option>
                <option value="extended">Extended</option>
                <option value="confirmed">Confirmed</option>
                <option value="failed">Failed</option>
              </select>

              <select
                value={filters.expiring_within_days ?? ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    expiring_within_days: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">All Dates</option>
                <option value="7">Expiring in 7 days</option>
                <option value="15">Expiring in 15 days</option>
                <option value="30">Expiring in 30 days</option>
                <option value="60">Expiring in 60 days</option>
              </select>

              <button
                onClick={() => setFilters({})}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Employee List */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-3">
          Probation Employees ({employees.length})
        </h3>

        {employees.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Clock size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">
              No probation employees found
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {employees.map((emp) => (
              <ProbationEmployeeCard
                key={emp.employee_id}
                employee={emp}
                onAction={(type) => handleOpenModal(emp, type)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionModal.type && actionModal.employee && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            {/* Modal header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {ACTION_CONFIG[actionModal.type].label}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Employee info */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-900">
                {actionModal.employee.employee_name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {actionModal.employee.employee_code} ·{' '}
                {actionModal.employee.department.name}
              </p>
            </div>

            {/* Dynamic form */}
            <ActionModalContent
              type={actionModal.type}
              form={form}
              onChange={handleFormChange}
            />

            {/* Footer buttons */}
            <div className="flex gap-2 mt-5">
              <button
                onClick={handleCloseModal}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={actionLoading}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${ACTION_CONFIG[actionModal.type].btnClass}`}
              >
                {actionLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  ACTION_CONFIG[actionModal.type].label
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}