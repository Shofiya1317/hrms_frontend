'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Clock, Calendar, TrendingUp, AlertCircle, CheckCircle, XCircle,
  User, Building2, Award, Loader2, Filter, ChevronDown, UserCheck, FileText, AlertTriangle, X
} from 'lucide-react';
import {
  getProbationDashboard,
  getProbationEmployees,
  confirmProbation,
  reviewProbation,
  extendProbation,
  failProbation,
  IProbationDashboard,
  IProbationEmployee,
  IProbationFilters,
} from '@/lib/service/probation';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  active: { label: 'Active', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock },
  under_review: { label: 'Under Review', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: AlertCircle },
  extended: { label: 'Extended', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: TrendingUp },
  confirmed: { label: 'Confirmed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
  failed: { label: 'Failed', color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle },
};

function StatCard({ title, value, icon: Icon, color, bgColor }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}>
          <Icon size={18} className={color} />
        </div>
        <span className="text-2xl font-bold text-gray-800">{value}</span>
      </div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
    </div>
  );
}

function ProbationEmployeeCard({ employee, onAction }: { employee: IProbationEmployee; onAction: () => void }) {
  const statusCfg = STATUS_CONFIG[employee.probation_details.status];
  const StatusIcon = statusCfg.icon;

  const daysRemaining = employee.probation_details.days_remaining;
  const isExpiringSoon = daysRemaining <= 30 && daysRemaining > 0;
  const isExpired = daysRemaining <= 0;

  const canTakeAction = ['active', 'under_review', 'extended'].includes(employee.probation_details.status);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white text-base font-bold">
              {employee.employee_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{employee.employee_name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{employee.employee_code}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusCfg.color}`}>
          <StatusIcon size={10} />
          {statusCfg.label}
        </span>
      </div>

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
            <span className="truncate">{employee.reporting_manager.name}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Calendar size={12} className="text-gray-400 flex-shrink-0" />
          <span>Ends: {new Date(employee.probation_details.probation_end_date).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Days Remaining</span>
          <span className={`text-sm font-bold ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : 'text-gray-700'}`}>
            {daysRemaining > 0 ? `${daysRemaining} days` : 'Expired'}
          </span>
        </div>
        {employee.probation_details.extension_count > 0 && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">Extensions</span>
            <span className="text-xs font-semibold text-amber-600">{employee.probation_details.extension_count}x</span>
          </div>
        )}
      </div>

      {canTakeAction && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => onAction()}
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <UserCheck size={12} />
            Confirm
          </button>
          <button
            onClick={() => onAction()}
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <FileText size={12} />
            Review
          </button>
          <button
            onClick={() => onAction()}
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
          >
            <Clock size={12} />
            Extend
          </button>
          <button
            onClick={() => onAction()}
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

export default function ProbationTracker() {
  const params = useParams();
  const subdomain = params?.subdomain as string;

  const [dashboard, setDashboard] = useState<IProbationDashboard | null>(null);
  const [employees, setEmployees] = useState<IProbationEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<IProbationFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [actionModal, setActionModal] = useState<{ type: 'confirm' | 'review' | 'extend' | 'fail' | null; employee: IProbationEmployee | null }>({ type: null, employee: null });
  const [actionData, setActionData] = useState({ remarks: '', extension_days: 30 });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!subdomain) return;
    loadData();
  }, [subdomain, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, employeesRes] = await Promise.all([
        getProbationDashboard(subdomain),
        getProbationEmployees(subdomain, filters),
      ]);

      setDashboard(dashboardRes?.data?.data || dashboardRes?.data);
      setEmployees(employeesRes?.data?.data || []);
    } catch (error) {
      console.error('Failed to load probation data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 size={20} className="animate-spin text-blue-600" />
          <span className="text-sm text-gray-500">Loading probation data...</span>
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
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Filter size={14} />
          Filters
          <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {showFilters && (
          <div className="mt-3 p-4 bg-white border border-gray-200 rounded-xl space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="under_review">Under Review</option>
                <option value="extended">Extended</option>
                <option value="confirmed">Confirmed</option>
                <option value="failed">Failed</option>
              </select>

              <select
                value={filters.expiring_within_days || ''}
                onChange={(e) => setFilters({ ...filters, expiring_within_days: e.target.value ? Number(e.target.value) : undefined })}
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
            <p className="text-sm text-gray-500 font-medium">No probation employees found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {employees.map((emp) => (
              <ProbationEmployeeCard key={emp.employee_id} employee={emp} onAction={() => handleOpenModal(emp)} />
            ))}
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionModal.type && actionModal.employee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {actionModal.type === 'confirm' && 'Confirm Probation'}
                {actionModal.type === 'review' && 'Send for Review'}
                {actionModal.type === 'extend' && 'Extend Probation'}
                {actionModal.type === 'fail' && 'Fail Probation'}
              </h3>
              <button onClick={() => setActionModal({ type: null, employee: null })} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-900">{actionModal.employee.employee_name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{actionModal.employee.employee_code}</p>
            </div>

            {actionModal.type === 'extend' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Extension Days</label>
                <input
                  type="number"
                  value={actionData.extension_days}
                  onChange={(e) => setActionData({ ...actionData, extension_days: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  min="1"
                  max="180"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
              <textarea
                value={actionData.remarks}
                onChange={(e) => setActionData({ ...actionData, remarks: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                rows={3}
                placeholder="Add remarks..."
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActionModal({ type: null, employee: null })}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={actionLoading}
                className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${
                  actionModal.type === 'confirm' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  actionModal.type === 'review' ? 'bg-purple-600 hover:bg-purple-700' :
                  actionModal.type === 'extend' ? 'bg-amber-600 hover:bg-amber-700' :
                  'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function handleOpenModal(employee: IProbationEmployee) {
    setActionModal({ type: 'confirm', employee });
    setActionData({ remarks: '', extension_days: 30 });
  }

  async function handleAction() {
    if (!actionModal.employee || !subdomain) return;

    try {
      setActionLoading(true);
      const employeeId = actionModal.employee.employee_id;

      if (actionModal.type === 'confirm') {
        await confirmProbation(subdomain, employeeId, { remarks: actionData.remarks });
        toast.success('Probation confirmed successfully');
      } else if (actionModal.type === 'review') {
        await reviewProbation(subdomain, employeeId, { remarks: actionData.remarks });
        toast.success('Sent for review successfully');
      } else if (actionModal.type === 'extend') {
        await extendProbation(subdomain, employeeId, { extension_days: actionData.extension_days, remarks: actionData.remarks });
        toast.success('Probation extended successfully');
      } else if (actionModal.type === 'fail') {
        await failProbation(subdomain, employeeId, { remarks: actionData.remarks });
        toast.success('Probation failed');
      }

      setActionModal({ type: null, employee: null });
      loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  }
}
