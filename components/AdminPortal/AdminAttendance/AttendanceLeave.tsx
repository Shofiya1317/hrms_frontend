'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Plus,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import {
  createLeavePolicyWithTypes,
  getAssignedLeavePolicyWithTypes,
  getLeaveTypes,
  updateAssignedLeavePolicyWithTypes,
} from '@/lib/service/leave';

const LEAVE_REQUESTS = [
  { id: 1, name: 'Rohit Gupta', type: 'Annual Leave', from: '22 Mar', to: '24 Mar', days: 3, status: 'pending', reason: 'Family vacation' },
  { id: 2, name: 'Sneha Reddy', type: 'Sick Leave', from: '18 Mar', to: '21 Mar', days: 4, status: 'approved', reason: 'Medical treatment' },
  { id: 3, name: 'Kavya Menon', type: 'Casual Leave', from: '25 Mar', to: '25 Mar', days: 1, status: 'pending', reason: 'Personal work' },
];

export default function AttendanceLeave() {
  const params = useParams();
  const subdomain = params?.subdomain as string;

  const [subTab, setSubTab] = useState('Requests');
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [policyName, setPolicyName] = useState('');
  const [selectedLeaveTypeIds, setSelectedLeaveTypeIds] = useState<string[]>([]);
  const [policyConfigs, setPolicyConfigs] = useState<Record<string, any>>({});
  const [leaveTypes, setLeaveTypes] = useState<Array<{ id: string; name: string; code?: string }>>([]);
  const [policies, setPolicies] = useState<Array<{ id: string; name: string; leave_types?: Array<{ leave_type_id?: string; leave_type?: { id?: string; name?: string; code?: string }; days_per_year?: number | null; accrual_type?: string | null; carry_forward_max_days?: number | null; is_carry_forward?: boolean; is_encashable?: boolean; min_days_per_application?: number | null; max_days_per_application?: number | null; }> }>>([]);
  const [loadingLeaveTypes, setLoadingLeaveTypes] = useState(false);
  const [loadingPolicy, setLoadingPolicy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const normalizePolicy = (policy: any) => ({
    id: policy?.id || 'assigned-policy',
    name: policy?.name || 'Assigned Leave Policy',
    leave_types: policy?.leave_types || [],
  });

  const parseNullableNumber = (value: any): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  useEffect(() => {
    if (!subdomain) return;

    const loadLeaveTypes = async () => {
      setLoadingLeaveTypes(true);
      try {
        const response = await getLeaveTypes(subdomain);
        const data = (response?.data?.data || response?.data || []) as Array<{ id: string; name: string; code?: string }>;
        setLeaveTypes(data);
      } catch (err: any) {
        console.error('Failed to load leave types', err);
      } finally {
        setLoadingLeaveTypes(false);
      }
    };

    const loadAssignedPolicy = async () => {
      setLoadingPolicy(true);
      try {
        const response = await getAssignedLeavePolicyWithTypes(subdomain);
        const policyData = response?.data?.data || response?.data || null;
        setPolicies(policyData ? [normalizePolicy(policyData)] : []);
      } catch (err: any) {
        console.error('Failed to load assigned leave policy', err);
        setPolicies([]);
      } finally {
        setLoadingPolicy(false);
      }
    };

    loadLeaveTypes();
    loadAssignedPolicy();
  }, [subdomain]);

  const toggleLeaveTypeSelection = (leaveTypeId: string) => {
    setSelectedLeaveTypeIds((prev) => {
      const next = prev.includes(leaveTypeId)
        ? prev.filter((id) => id !== leaveTypeId)
        : [...prev, leaveTypeId];

      setPolicyConfigs((prevConfigs) => {
        const nextConfigs = { ...prevConfigs };

        if (next.includes(leaveTypeId) && !nextConfigs[leaveTypeId]) {
          nextConfigs[leaveTypeId] = {
            days_per_year: null,
            accrual_type: '',
            is_carry_forward: false,
            carry_forward_max_days: null,
            is_encashable: false,
            min_days_per_application: null,
            max_days_per_application: null,
          };
        }

        if (!next.includes(leaveTypeId)) {
          return Object.fromEntries(
            Object.entries(nextConfigs).filter(([key]) => key !== leaveTypeId),
          ) as Record<string, any>;
        }

        return nextConfigs;
      });

      return next;
    });

    setError(null);
  };

  const updatePolicyConfig = (leaveTypeId: string, field: string, value: string | number | boolean | null) => {
    setPolicyConfigs((prev) => ({
      ...prev,
      [leaveTypeId]: {
        ...(prev[leaveTypeId] || {}),
        [field]: value,
      },
    }));
  };

  const openCreateModal = () => {
    setEditingPolicyId(null);
    setPolicyName('');
    setSelectedLeaveTypeIds([]);
    setPolicyConfigs({});
    setError(null);
    setSuccessMessage(null);
    setShowPolicyModal(true);
  };

  const openEditModal = async () => {
    try {
      const response = await getAssignedLeavePolicyWithTypes(subdomain);
      const policyData = response?.data?.data || response?.data || null;

      const selectedIds = (policyData?.leave_types || [])
        .map((item: any) => item.leave_type_id || item.leave_type?.id || '')
        .filter(Boolean);

      setEditingPolicyId(policyData?.id || 'assigned-policy');
      setPolicyName(policyData?.name || '');
      setSelectedLeaveTypeIds(selectedIds);
      setPolicyConfigs(selectedIds.reduce((acc: Record<string, any>, id: string) => {
        const existing = (policyData?.leave_types || []).find((item: any) => (item.leave_type_id || item.leave_type?.id || '') === id);
        acc[id] = {
          days_per_year: parseNullableNumber(existing?.days_per_year),
          accrual_type: existing?.accrual_type ?? '',
          is_carry_forward: existing?.is_carry_forward ?? false,
          carry_forward_max_days: parseNullableNumber(existing?.carry_forward_max_days),
          is_encashable: existing?.is_encashable ?? false,
          min_days_per_application: parseNullableNumber(existing?.min_days_per_application),
          max_days_per_application: parseNullableNumber(existing?.max_days_per_application),
        };
        return acc;
      }, {}));
      setError(null);
      setSuccessMessage(null);
      setShowPolicyModal(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to load policy details for editing.');
    }
  };

  const syncPolicyToTable = (policy: { id: string; name: string; leave_types?: Array<{ leave_type_id?: string; leave_type?: { id?: string; name?: string } }> }) => {
    setPolicies((prev) => {
      const existing = prev.find((item) => item.id === policy.id);
      if (existing) {
        return prev.map((item) => (item.id === policy.id ? policy : item));
      }
      return [policy, ...prev];
    });
  };

  const validatePolicyForm = () => {
    if (!policyName.trim()) {
      throw new Error('Policy name is required.');
    }

    if (selectedLeaveTypeIds.length === 0) {
      throw new Error('Select at least one leave type.');
    }
  };

  const buildLeaveTypeConfigs = (detail: any) => selectedLeaveTypeIds.map((leaveTypeId) => {
    const existing = (detail?.leave_types || []).find((item: any) => (item.leave_type_id || item.leave_type?.id || '') === leaveTypeId);
    const config = policyConfigs[leaveTypeId] || {};

    return {
      leave_type_id: leaveTypeId,
      days_per_year: config.days_per_year ?? existing?.days_per_year ?? null,
      accrual_type: config.accrual_type ?? existing?.accrual_type ?? null,
      accrual_amount: existing?.accrual_amount ?? null,
      is_carry_forward: config.is_carry_forward ?? existing?.is_carry_forward ?? false,
      carry_forward_max_days: config.carry_forward_max_days ?? existing?.carry_forward_max_days ?? null,
      carry_forward_expiry: existing?.carry_forward_expiry ?? null,
      is_encashable: config.is_encashable ?? existing?.is_encashable ?? false,
      max_encash_days: existing?.max_encash_days ?? null,
      min_days_per_application: config.min_days_per_application ?? existing?.min_days_per_application ?? null,
      max_days_per_application: config.max_days_per_application ?? existing?.max_days_per_application ?? null,
      max_applications_per_year: existing?.max_applications_per_year ?? null,
      sandwich_applicable: existing?.sandwich_applicable ?? false,
      sandwich_count_as: existing?.sandwich_count_as ?? null,
    };
  });

  const handleSubmitPolicy = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      validatePolicyForm();
      setSubmitting(true);

      if (editingPolicyId) {
        const response = await getAssignedLeavePolicyWithTypes(subdomain);
        const detail = response?.data?.data || response?.data || null;
        const updateResponse = await updateAssignedLeavePolicyWithTypes(
          { name: policyName.trim(), leave_type_configs: buildLeaveTypeConfigs(detail) },
          subdomain,
        );

        if ((updateResponse?.data?.success ?? true) === false) {
          throw new Error('Failed to update leave policy.');
        }

        setSuccessMessage('Leave policy updated successfully.');
      } else {
        const response = await createLeavePolicyWithTypes(
          {
            name: policyName.trim(),
            leave_type_ids: selectedLeaveTypeIds,
            leave_type_configs: selectedLeaveTypeIds.map((leaveTypeId) => {
              const config = policyConfigs[leaveTypeId] || {};
              return {
                leave_type_id: leaveTypeId,
                days_per_year: parseNullableNumber(config.days_per_year),
                accrual_type: config.accrual_type ?? null,
                accrual_amount: null,
                is_carry_forward: config.is_carry_forward ?? false,
                carry_forward_max_days: parseNullableNumber(config.carry_forward_max_days),
                carry_forward_expiry: null,
                is_encashable: config.is_encashable ?? false,
                max_encash_days: null,
                min_days_per_application: parseNullableNumber(config.min_days_per_application),
                max_days_per_application: parseNullableNumber(config.max_days_per_application),
                max_applications_per_year: null,
                sandwich_applicable: false,
                sandwich_count_as: null,
              };
            }),
          },
          subdomain,
        );

        const createdPolicy = (response?.data?.data || response?.data || null) as {
          id?: string;
          name?: string;
          leave_types?: Array<{ leave_type_id?: string; leave_type?: { id?: string; name?: string } }>;
        } | null;

        if ((response?.data?.success ?? true) === false) {
          const apiError = response?.data?.error;
          const msg = Array.isArray(apiError) ? apiError[0] : apiError || 'Failed to create leave policy.';
          throw new Error(typeof msg === 'string' ? msg : 'Failed to create leave policy.');
        }

        if (createdPolicy?.id) {
          syncPolicyToTable({
            id: createdPolicy.id,
            name: createdPolicy.name || policyName.trim(),
            leave_types: createdPolicy.leave_types || selectedLeaveTypeIds.map((leaveTypeId) => ({ leave_type_id: leaveTypeId })),
          });
        }

        setSuccessMessage('Leave policy configured successfully.');
      }

      setPolicyName('');
      setSelectedLeaveTypeIds([]);
      setEditingPolicyId(null);
      setShowPolicyModal(false);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while saving the leave policy.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[#0f1f2e]">Leave Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">Requests, balances, types and holidays</p>
      </div>

      <div className="flex gap-2">
        {['Requests', 'Leave Types', 'Balances', 'Holidays'].map((t) => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${subTab === t ? 'bg-[#2D7A4F] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {subTab === 'Requests' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-[#0f1f2e]">Leave Requests</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {LEAVE_REQUESTS.map((req) => (
              <div key={req.id} className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2D7A4F] to-[#1e5c3a] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{req.name.split(' ').map((n) => n[0]).join('')}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{req.name}</p>
                  <p className="text-xs text-gray-500">{req.type} · {req.from} – {req.to} ({req.days}d) · {req.reason}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {req.status}
                </span>
                {req.status === 'pending' && (
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs font-semibold text-white bg-[#2D7A4F] rounded-lg hover:bg-[#1e5c3a] transition-colors">Approve</button>
                    <button className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Reject</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'Leave Types' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0f1f2e]">Leave Types Configuration</h3>
              <p className="text-xs text-gray-500 mt-0.5">Create a leave policy by selecting leave types.</p>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors"
            >
              <Plus size={14} /> Configure Policy
            </button>
          </div>
          <div className="overflow-x-auto">
            {loadingPolicy && <div className="p-4 text-sm text-gray-500">Loading configured leave policy…</div>}
            {!loadingPolicy && policies.length === 0 && <div className="p-4 text-sm text-gray-500">No leave policies created yet. Use “Configure Policy” to add one.</div>}
            {policies.length > 0 && (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Policy Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Leave Types</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {policies.map((policy) => (
                    <tr key={policy.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">{policy.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {policy.leave_types?.length
                          ? policy.leave_types.map((item) => `${item.leave_type?.name || item.leave_type_id} (${item.days_per_year ?? '—'} days${item.is_carry_forward ? ', carry-forward' : ''})`).join(', ')
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          type="button"
                          onClick={openEditModal}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {showPolicyModal && (
        <div className="fixed inset-0 bg-black/10 z-50 flex items-center justify-center pt-5 mt-4 px-4 overflow-hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-100 rounded-t-2xl bg-white z-10">
              <div>
                <h2 className="text-base font-bold text-[#0f1f2e]">{editingPolicyId ? 'Edit Leave Policy' : 'Configure Leave Policy'}</h2>
                <p className="text-xs text-gray-400">{editingPolicyId ? 'Update the selected policy and leave type mapping' : 'Create a policy using available leave types'}</p>
              </div>
              <button
                onClick={() => setShowPolicyModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 p-6">
              <form onSubmit={handleSubmitPolicy} className="space-y-5">
                <div>
                  <label htmlFor="policyName" className="block text-xs font-semibold text-gray-600 mb-1.5">Policy Name <span className="text-red-500">*</span></label>
                  <input
                    id="policyName"
                    type="text"
                    value={policyName}
                    onChange={(e) => {
                      setPolicyName(e.target.value);
                      setError(null);
                    }}
                    placeholder="TCS Leave Policy"
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Leave Types <span className="text-red-500">*</span></label>
                  <div className="min-h-[160px] max-h-56 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-3">
                    {loadingLeaveTypes && <div className="text-sm text-gray-500">Loading leave types...</div>}
                    {!loadingLeaveTypes && leaveTypes.length === 0 && <div className="text-sm text-gray-500">No leave types available</div>}
                    {!loadingLeaveTypes && leaveTypes.length > 0 && leaveTypes.map((item) => {
                      const checked = selectedLeaveTypeIds.includes(item.id);
                      return (
                        <label key={item.id} className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 mb-2 cursor-pointer hover:bg-gray-100 transition-colors">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleLeaveTypeSelection(item.id)}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-[#2D7A4F] focus:ring-[#2D7A4F]"
                          />
                          <span className="text-sm text-gray-700">
                            {item.name} {item.code ? `(${item.code})` : ''}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Select one or more leave types for this policy.</p>
                </div>

                {selectedLeaveTypeIds.length > 0 && (
                  <div className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div>
                      <h3 className="text-xs font-semibold text-gray-700">Leave Type Settings</h3>
                      <p className="text-xs text-gray-400 mt-1">Adjust the days and carry-forward/encashment rules for each selected leave type.</p>
                    </div>
                    {selectedLeaveTypeIds.map((leaveTypeId) => {
                      const leaveType = leaveTypes.find((item) => item.id === leaveTypeId);
                      const config = policyConfigs[leaveTypeId] || {};

                      return (
                        <div key={leaveTypeId} className="rounded-xl border border-gray-200 bg-white p-3 space-y-3">
                          <div className="text-sm font-semibold text-gray-800">{leaveType?.name || leaveTypeId}</div>
                          <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                            <label className="space-y-1">
                              <span>Days / year</span>
                              <input type="number" min="0" value={config.days_per_year ?? ''} onChange={(e) => updatePolicyConfig(leaveTypeId, 'days_per_year', e.target.value === '' ? null : Number(e.target.value))} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
                            </label>
                            <label className="space-y-1">
                              <span>Accrual type</span>
                              <input type="text" value={config.accrual_type ?? ''} onChange={(e) => updatePolicyConfig(leaveTypeId, 'accrual_type', e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm" placeholder="Monthly" />
                            </label>
                            <label className="space-y-1">
                              <span>Carry forward max days</span>
                              <input type="number" min="0" value={config.carry_forward_max_days ?? ''} onChange={(e) => updatePolicyConfig(leaveTypeId, 'carry_forward_max_days', e.target.value === '' ? null : Number(e.target.value))} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
                            </label>
                            <label className="space-y-1">
                              <span>Min days / application</span>
                              <input type="number" min="0" value={config.min_days_per_application ?? ''} onChange={(e) => updatePolicyConfig(leaveTypeId, 'min_days_per_application', e.target.value === '' ? null : Number(e.target.value))} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
                            </label>
                            <label className="space-y-1">
                              <span>Max days / application</span>
                              <input type="number" min="0" value={config.max_days_per_application ?? ''} onChange={(e) => updatePolicyConfig(leaveTypeId, 'max_days_per_application', e.target.value === '' ? null : Number(e.target.value))} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
                            </label>
                          </div>
                          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={Boolean(config.is_carry_forward)} onChange={(e) => updatePolicyConfig(leaveTypeId, 'is_carry_forward', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#2D7A4F] focus:ring-[#2D7A4F]" /> Carry forward</label>
                            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={Boolean(config.is_encashable)} onChange={(e) => updatePolicyConfig(leaveTypeId, 'is_encashable', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#2D7A4F] focus:ring-[#2D7A4F]" /> Encashable</label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    <AlertCircle size={16} className="mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                    <CheckCircle size={16} className="mt-0.5" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPolicyModal(false)}
                    className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] disabled:opacity-60 transition-colors"
                  >
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
                    {submitting && (editingPolicyId ? 'Updating...' : 'Creating...')}
                    {!submitting && (editingPolicyId ? 'Update Policy' : 'Create Policy')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {subTab === 'Balances' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#0f1f2e] mb-4">Leave Balances Overview</h3>
          <div className="space-y-3">
            {[
              { name: 'Rahul Sharma', annual: '13/18', sick: '10/12', casual: '5/6' },
              { name: 'Priya Nair', annual: '8/18', sick: '12/12', casual: '4/6' },
              { name: 'Ananya Krishnan', annual: '16/18', sick: '11/12', casual: '6/6' },
              { name: 'Vikram Patel', annual: '17/18', sick: '12/12', casual: '5/6' },
            ].map((emp) => (
              <div key={emp.name} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2D7A4F] to-[#1e5c3a] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[10px] font-bold">{emp.name.split(' ').map((n) => n[0]).join('')}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800 w-36 flex-shrink-0">{emp.name}</span>
                <div className="flex gap-4 text-xs">
                  <span className="text-gray-600">Annual: <strong>{emp.annual}</strong></span>
                  <span className="text-gray-600">Sick: <strong>{emp.sick}</strong></span>
                  <span className="text-gray-600">Casual: <strong>{emp.casual}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'Holidays' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#0f1f2e]">Holiday Calendar 2026</h3>
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors">
              <Plus size={14} /> Add Holiday
            </button>
          </div>
          <div className="space-y-2">
            {[
              { date: '26 Jan', name: 'Republic Day', type: 'National' },
              { date: '14 Mar', name: 'Holi', type: 'Festival' },
              { date: '14 Apr', name: 'Dr. Ambedkar Jayanti', type: 'National' },
              { date: '15 Aug', name: 'Independence Day', type: 'National' },
              { date: '02 Oct', name: 'Gandhi Jayanti', type: 'National' },
              { date: '20 Oct', name: 'Dussehra', type: 'Festival' },
              { date: '01 Nov', name: 'Diwali', type: 'Festival' },
              { date: '25 Dec', name: 'Christmas', type: 'Festival' },
            ].map((h) => (
              <div key={h.date} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-14 text-center">
                  <span className="text-sm font-bold text-[#2D7A4F]">{h.date}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800 flex-1">{h.name}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${h.type === 'National' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                  {h.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}