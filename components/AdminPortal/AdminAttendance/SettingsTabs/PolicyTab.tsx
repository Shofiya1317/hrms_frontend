'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import {
  getAttendancePolicies,
  createAttendancePolicy,
  updateAttendancePolicy,
  deleteAttendancePolicy,
  IAttendancePolicyPayload,
} from '@/lib/service/attendance';
import Toggle from './Toggle';

interface Policy extends IAttendancePolicyPayload {
  id: string;
  name: string;
}

const defaultPolicyForm: IAttendancePolicyPayload = {
  name: '',
  grace_period_minutes: 15,
  auto_checkout_hours: 12,
  max_regularization_per_month: 2,
  sandwich_policy_enabled: false,
  sandwich_include_weekoff: false,
  // sandwich_include_public_holiday: false,
  sandwich_include_company_holiday: false,
};

export default function PolicyTab({ subdomain }: { subdomain: string }) {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<IAttendancePolicyPayload>(defaultPolicyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subdomain) fetchPolicies();
  }, [subdomain]);

  const fetchPolicies = async () => {
    setLoadingList(true);
    try {
      const res = await getAttendancePolicies(subdomain);
      setPolicies(res?.data?.data ?? []);
    } catch { /* silent */ } finally {
      setLoadingList(false);
    }
  };

  const openCreate = () => {
    setForm(defaultPolicyForm);
    setEditingId(null);
    setError(null);
    setShowModal(true);
  };

  const openEdit = (p: Policy) => {
    setForm({
      name: p.name,
      grace_period_minutes: p.grace_period_minutes,
      auto_checkout_hours: p.auto_checkout_hours,
      max_regularization_per_month: p.max_regularization_per_month,
      sandwich_policy_enabled: p.sandwich_policy_enabled,
      sandwich_include_weekoff: p.sandwich_include_weekoff,
      //sandwich_include_public_holiday: p.sandwich_include_public_holiday,
      sandwich_include_company_holiday: p.sandwich_include_company_holiday,
    });
    setEditingId(p.id);
    setError(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Policy name is required.'); return; }
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await updateAttendancePolicy(editingId, form, subdomain);
      } else {
        await createAttendancePolicy(form, subdomain);
      }
      setShowModal(false);
      fetchPolicies();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this attendance policy?')) return;
    setDeletingId(id);
    try {
      await deleteAttendancePolicy(id, subdomain);
      setPolicies((prev) => prev.filter((p) => p.id !== id));
    } catch { /* silent */ } finally {
      setDeletingId(null);
    }
  };

  const setNum = (field: keyof IAttendancePolicyPayload, val: string) => setForm((prev) => ({ ...prev, [field]: Number(val) }));

  const setBool = (field: keyof IAttendancePolicyPayload, val: boolean) => setForm((prev) => ({ ...prev, [field]: val }));

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0d6460] transition-colors"
        >
          <Plus size={15} /> Add Policy
        </button>
      </div>

      {loadingList ? (
        <div className="flex justify-center py-16">
          <Loader2 size={22} className="animate-spin text-[#0f766e]" />
        </div>
      ) : policies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShieldCheck size={36} className="text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-500">No attendance policies yet</p>
          <p className="text-xs text-gray-400 mt-1">Click &quot;Add Policy&quot; to create one</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {policies.map((p) => (
            <div key={p.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-4 py-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#e8f5ee] flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={15} className="text-[#2D7A4F]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#0f1f2e] leading-snug">{p.name}</h3>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#0f766e] hover:bg-[#e8f5ee] transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {deletingId === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Grace Period', value: `${p.grace_period_minutes} min` },
                  { label: 'Auto Checkout', value: `${p.auto_checkout_hours} hrs` },
                  { label: 'Max Regularization', value: `${p.max_regularization_per_month}/mo` },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-gray-50 px-3 py-2.5 text-center">
                    <p className="text-xs font-bold text-[#0f1f2e]">{item.value}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${p.sandwich_policy_enabled ? 'bg-[#e8f5ee] text-[#2D7A4F]' : 'bg-gray-100 text-gray-400'}`}>
                  Sandwich Policy {p.sandwich_policy_enabled ? 'ON' : 'OFF'}
                </span>
                {p.sandwich_policy_enabled && (
                  <>
                    {p.sandwich_include_weekoff && <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-500">Week-off</span>}
                    {p.sandwich_include_company_holiday && <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-500">Company Holiday</span>}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#e8f5ee] flex items-center justify-center">
                  <ShieldCheck size={15} className="text-[#2D7A4F]" />
                </div>
                <h2 className="text-sm font-bold text-[#0f1f2e]">
                  {editingId ? 'Edit Attendance Policy' : 'New Attendance Policy'}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Policy Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Standard Office Policy"
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Grace Period (min)', field: 'grace_period_minutes' as const },
                  { label: 'Auto Checkout (hrs)', field: 'auto_checkout_hours' as const },
                  { label: 'Max Regularization / mo', field: 'max_regularization_per_month' as const },
                ].map(({ label, field }) => (
                  <div key={field}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                    <input
                      type="number"
                      min={0}
                      value={form[field] as number}
                      onChange={(e) => setNum(field, e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all"
                    />
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Sandwich Policy</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Count intervening off-days as leave</p>
                  </div>
                  <Toggle
                    checked={form.sandwich_policy_enabled}
                    onChange={(v) => setBool('sandwich_policy_enabled', v)}
                  />
                </div>

                {form.sandwich_policy_enabled && (
                  <div className="space-y-2 pt-1 border-t border-gray-200">
                    {[
                      { label: 'Include Week-off days', field: 'sandwich_include_weekoff' as const },
                      // { label: 'Include Public Holidays', field: 'sandwich_include_public_holiday' as const },
                      { label: 'Include Company Holidays', field: 'sandwich_include_company_holiday' as const },
                    ].map(({ label, field }) => (
                      <div key={field} className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">{label}</span>
                        <Toggle
                          checked={!!form[field]}
                          onChange={(v) => setBool(field, v)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-600 font-medium">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0f766e] rounded-xl hover:bg-[#0d6460] transition-colors disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      {' '}
                      Saving...
                    </>
                  ) : editingId ? 'Update Policy' : 'Create Policy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
