'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Plus, Pencil, Trash2, X, AlertTriangle, Loader2, ChevronDown, ChevronUp, Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getLeavePolicies,
  getLeavePolicyByName,
  createLeavePolicy,
  updateLeavePolicy,
  deleteLeavePolicy,
  getLeaveTypes,
  LeavePolicyPayload,
  LeavePolicyTypeConfig,
  LeavePolicyItem,
} from '@/lib/service/leave';

// ── Types ─────────────────────────────────────────────────────────
interface LeaveTypeOption {
  id: string;
  name: string;
}

// ── Constants ─────────────────────────────────────────────────────
const EMPTY_CONFIG: LeavePolicyTypeConfig = {
  leave_type_id: '',
  days_per_year: 12,
  accrual_type: 'yearly',
  is_carry_forward: false,
  carry_forward_max_days: 0,
  is_encashable: false,
  min_days_per_application: 0.5,
  max_days_per_application: 5,
};

// Map API response item → form payload for editing
function itemToPayload(item: LeavePolicyItem): LeavePolicyPayload {
  return {
    name: item.policy_name,
    leave_type_configs: (item.leave_types ?? []).map((lt) => ({
      leave_type_id: lt.leave_type_id,
      days_per_year: parseFloat(lt.days_per_year) || 0,
      accrual_type: lt.accrual_type,
      is_carry_forward: lt.is_carry_forward,
      carry_forward_max_days: parseFloat(lt.carry_forward_max_days) || 0,
      is_encashable: lt.is_encashable,
      min_days_per_application: parseFloat(lt.min_days_per_application) || 0,
      max_days_per_application: parseFloat(lt.max_days_per_application) || 0,
    })),
  };
}

// ── Policy Modal ──────────────────────────────────────────────────
interface PolicyModalProps {
  mode: 'create' | 'edit';
  initial?: LeavePolicyItem;
  leaveTypes: LeaveTypeOption[];
  onClose: () => void;
  onSave: (payload: LeavePolicyPayload, originalName?: string) => Promise<void>;
  saving: boolean;
}

function PolicyModal({
  mode, initial, leaveTypes, onClose, onSave, saving,
}: PolicyModalProps) {
  const [form, setForm] = useState<LeavePolicyPayload>(
    initial ? itemToPayload(initial) : { name: '', leave_type_configs: [{ ...EMPTY_CONFIG }] },
  );

  useEffect(() => {
    setForm(initial ? itemToPayload(initial) : { name: '', leave_type_configs: [{ ...EMPTY_CONFIG }] });
  }, [initial, mode]);

  const setConfig = (index: number, field: keyof LeavePolicyTypeConfig, value: unknown) => setForm((prev) => {
    const configs = [...prev.leave_type_configs];
    configs[index] = { ...configs[index], [field]: value };
    return { ...prev, leave_type_configs: configs };
  });

  const addConfig = () => setForm((prev) => ({ ...prev, leave_type_configs: [...prev.leave_type_configs, { ...EMPTY_CONFIG }] }));

  const removeConfig = (index: number) => setForm((prev) => ({ ...prev, leave_type_configs: prev.leave_type_configs.filter((_, i) => i !== index) }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Policy name is required'); return; }
    if (form.leave_type_configs.some((c) => !c.leave_type_id)) {
      toast.error('Select a leave type for each config'); return;
    }
    await onSave(form, initial?.policy_name);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3 pt-5 mt-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {mode === 'create' ? 'Add leave policy' : `Edit — ${initial?.policy_name}`}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === 'create' ? 'Configure a new leave policy' : 'Update leave policy details'}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-4 py-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Policy name
              {' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Contract Leave Policy 2025"
              className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600">Leave type configurations</label>
              <button type="button" onClick={addConfig} className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors">
                <Plus size={12} />
                {' '}
                Add config
              </button>
            </div>

            {form.leave_type_configs.map((config, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-3 space-y-3 bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    Config #
                    {index + 1}
                  </span>
                  {form.leave_type_configs.length > 1 && (
                    <button type="button" onClick={() => removeConfig(index)} className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-semibold text-slate-600">
                      Leave type
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={config.leave_type_id}
                      onChange={(e) => setConfig(index, 'leave_type_id', e.target.value)}
                      className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white transition-all"
                    >
                      <option value="">Select leave type</option>
                      {leaveTypes.map((lt) => (
                        <option key={lt.id} value={lt.id}>{lt.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Days per year</label>
                    <input
                      type="number"
                      min={0}
                      value={config.days_per_year}
                      onChange={(e) => setConfig(index, 'days_per_year', Number(e.target.value))}
                      className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Accrual type</label>
                    <select
                      value={config.accrual_type}
                      onChange={(e) => setConfig(index, 'accrual_type', e.target.value)}
                      className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white transition-all"
                    >
                      <option value="yearly">Yearly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Min days / application</label>
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={config.min_days_per_application}
                      onChange={(e) => setConfig(index, 'min_days_per_application', Number(e.target.value))}
                      className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Max days / application</label>
                    <input
                      type="number"
                      min={0}
                      value={config.max_days_per_application}
                      onChange={(e) => setConfig(index, 'max_days_per_application', Number(e.target.value))}
                      className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {(['is_carry_forward', 'is_encashable'] as const).map((field) => (
                    <button
                      key={field}
                      type="button"
                      onClick={() => setConfig(index, field, !config[field])}
                      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                        config[field] ? 'bg-teal-50 border-teal-300 text-teal-700' : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      <span>{field === 'is_carry_forward' ? 'Carry forward' : 'Encashable'}</span>
                      <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border ${config[field] ? 'bg-teal-600 border-teal-600' : 'border-slate-300'}`}>
                        {config[field] && <span className="text-white text-[9px] font-bold">✓</span>}
                      </div>
                    </button>
                  ))}
                </div>

                {config.is_carry_forward && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Carry forward max days</label>
                    <input
                      type="number"
                      min={0}
                      value={config.carry_forward_max_days}
                      onChange={(e) => setConfig(index, 'carry_forward_max_days', Number(e.target.value))}
                      className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !form.name.trim()}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0f766e] hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all"
          >
            {saving && <Loader2 size={12} className="animate-spin" />}
            {mode === 'create' ? 'Create' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Modal ──────────────────────────────────────────────────
function DeleteModal({
  policy, onClose, onConfirm, deleting,
}: {
  policy: LeavePolicyItem; onClose: () => void; onConfirm: () => Promise<void>; deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={16} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Delete leave policy</h3>
            <p className="text-xs text-slate-400 mt-0.5">This action cannot be undone</p>
          </div>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete
            {' '}
            <span className="font-semibold text-slate-900">{policy.policy_name}</span>
            ?
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all"
          >
            {deleting && <Loader2 size={12} className="animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Policy Card ───────────────────────────────────────────────────
function PolicyCard({
  policy, leaveTypes, onEdit, onDelete,
}: {
  policy: LeavePolicyItem;
  leaveTypes: LeaveTypeOption[];
  onEdit: (p: LeavePolicyItem) => void;
  onDelete: (p: LeavePolicyItem) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const configs = policy.leave_types ?? [];

  return (
    <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{policy.policy_name}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {policy.leave_types_count ?? configs.length}
            {' '}
            leave type
            {(policy.leave_types_count ?? configs.length) !== 1 ? 's' : ''}
            {' '}
            configured
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 transition-all"
            title="View configs"
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <button
            onClick={() => onEdit(policy)}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-teal-50 hover:border-teal-300 hover:text-teal-600 text-slate-400 transition-all"
            title="Edit"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(policy)}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-red-50 hover:border-red-300 hover:text-red-500 text-slate-400 transition-all"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {expanded && configs.length > 0 && (
        <div className="border-t border-slate-100 divide-y divide-slate-100">
          {configs.map((c, i) => (
            <div key={i} className="px-4 py-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50">
              <div>
                <p className="text-slate-400 font-medium">Leave type</p>
                <p className="text-slate-700 font-semibold mt-0.5">{c.leave_type?.name ?? c.leave_type_id}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Days / year</p>
                <p className="text-slate-700 font-semibold mt-0.5">
                  {c.days_per_year}
                  {' '}
                  <span className="text-slate-400">
                    (
                    {c.accrual_type}
                    )
                  </span>
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Application range</p>
                <p className="text-slate-700 font-semibold mt-0.5">
                  {c.min_days_per_application}
                  –
                  {c.max_days_per_application}
                  d
                </p>
              </div>
              <div className="flex flex-wrap gap-1 items-start">
                {c.is_carry_forward && (
                  <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold whitespace-nowrap">
                    Carry fwd (
                    {c.carry_forward_max_days}
                    d)
                  </span>
                )}
                {c.is_encashable && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">Encashable</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
interface LeavePolicyTabProps {
  apiKey: string;
  token?: string;
}

export default function LeavePolicyTab({ apiKey, token }: LeavePolicyTabProps) {
  const [policies, setPolicies] = useState<LeavePolicyItem[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [selected, setSelected] = useState<LeavePolicyItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { fetchAll(); }, [apiKey, token]);

  const extractList = (res: any): any[] => {
    if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
    if (res?.data && Array.isArray(res.data)) return res.data;
    if (Array.isArray(res)) return res;
    return [];
  };

  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      const [policiesRes, typesRes] = await Promise.all([
        getLeavePolicies(apiKey, undefined, token),
        getLeaveTypes(apiKey, token),
      ]);
      setPolicies(extractList(policiesRes));
      setLeaveTypes(extractList(typesRes));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  // Debounced search by name
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!value.trim()) { fetchAll(); return; }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      setError(null);
      try {
        const res = await getLeavePolicyByName(value.trim(), apiKey, token);
        const list = extractList(res);
        // API may return single object or array
        setPolicies(list.length ? list : res?.data ? [res.data] : []);
      } catch {
        setPolicies([]);
      } finally {
        setSearching(false);
      }
    }, 500);
  };

  async function handleSave(payload: LeavePolicyPayload, originalName?: string) {
    setSaving(true);
    const t = toast.loading(originalName ? 'Updating policy...' : 'Creating policy...');
    try {
      if (originalName) {
        await updateLeavePolicy(originalName, payload, apiKey, token);
        toast.success(`Policy "${payload.name}" updated`, { id: t });
      } else {
        await createLeavePolicy(payload, apiKey, token);
        toast.success(`Policy "${payload.name}" created`, { id: t });
      }
      setModal(null);
      setSelected(null);
      setSearch('');
      await fetchAll();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to save policy';
      setError(msg);
      toast.error(msg, { id: t });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;
    setDeleting(true);
    const t = toast.loading(`Deleting ${selected.policy_name}...`);
    try {
      await deleteLeavePolicy(selected.policy_name, apiKey, token);
      toast.success(`Policy "${selected.policy_name}" deleted`, { id: t });
      setModal(null);
      setSelected(null);
      setSearch('');
      await fetchAll();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to delete policy';
      setError(msg);
      toast.error(msg, { id: t });
    } finally {
      setDeleting(false);
    }
  }

  const closeModal = () => { setModal(null); setSelected(null); };

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Leave policies</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {loading ? 'Loading…' : `${policies.length} polic${policies.length !== 1 ? 'ies' : 'y'} configured`}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Search by name */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by name…"
                className="pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all w-48"
              />
              {searching && <Loader2 size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />}
            </div>
            <button
              onClick={() => setModal('create')}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0f766e] hover:bg-teal-700 rounded-lg transition-all shadow-sm whitespace-nowrap"
            >
              <Plus size={13} />
              {' '}
              Add policy
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-4 mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertTriangle size={13} />
            {' '}
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
            <Loader2 size={16} className="animate-spin" />
            {' '}
            Loading policies…
          </div>
        )}

        {!loading && policies.length > 0 && (
          <div className="p-4 space-y-3">
            {policies.map((p, i) => (
              <PolicyCard
                key={p.policy_name + i}
                policy={p}
                leaveTypes={leaveTypes}
                onEdit={(policy) => { setSelected(policy); setModal('edit'); }}
                onDelete={(policy) => { setSelected(policy); setModal('delete'); }}
              />
            ))}
          </div>
        )}

        {!loading && policies.length === 0 && (
          <div className="px-4 py-12 text-center">
            <div className="text-slate-400 mb-2">
              <Plus size={32} className="mx-auto opacity-50" />
            </div>
            <p className="text-sm text-slate-500">{search ? `No policies found for "${search}"` : 'No leave policies found'}</p>
            {!search && (
              <button onClick={() => setModal('create')} className="mt-3 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors">
                Create your first policy →
              </button>
            )}
          </div>
        )}
      </div>

      {(modal === 'create' || modal === 'edit') && (
        <PolicyModal
          mode={modal}
          initial={modal === 'edit' && selected ? selected : undefined}
          leaveTypes={leaveTypes}
          onClose={closeModal}
          onSave={handleSave}
          saving={saving}
        />
      )}

      {modal === 'delete' && selected && (
        <DeleteModal
          policy={selected}
          onClose={closeModal}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </>
  );
}
