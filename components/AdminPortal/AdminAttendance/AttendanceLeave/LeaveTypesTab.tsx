'use client';

import { useState, useEffect } from 'react';
import {
  Plus, CheckCircle2, Pencil, Trash2, X, AlertTriangle, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getLeaveTypes,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
  LeaveTypePayload,
} from '@/lib/service/leave';

// ── Types ─────────────────────────────────────────────────────────
interface LeaveType extends LeaveTypePayload {
  id: string;
}

// ── Constants ─────────────────────────────────────────────────────
const EMPTY_FORM: LeaveTypePayload = {
  name: '',
  // code: '',
  description: '',
  is_paid: true,
  is_encashable: false,
  requires_document: false,
  applicable_gender: 'all',
  is_system_type: false,
  max_consecutive_days: undefined,
  notice_days_required: 0,
};

const genderBadge: Record<string, string> = {
  male: 'bg-blue-50 text-blue-700',
  female: 'bg-pink-50 text-pink-700',
  all: 'bg-slate-100 text-slate-600',
};

// ── Leave Type Modal ──────────────────────────────────────────────
interface LeaveTypeModalProps {
  mode: 'create' | 'edit';
  initial?: LeaveType;
  onClose: () => void;
  onSave: (payload: LeaveTypePayload, id?: string) => Promise<void>;
  saving: boolean;
}

function LeaveTypeModal({
  mode, initial, onClose, onSave, saving,
}: LeaveTypeModalProps) {
  const [form, setForm] = useState<LeaveTypePayload>(
    initial ? { ...initial } : { ...EMPTY_FORM },
  );

  // Reset form when initial changes (for edit mode)
  useEffect(() => {
    if (initial) {
      setForm({ ...initial });
    } else if (mode === 'create') {
      setForm({ ...EMPTY_FORM });
    }
  }, [initial, mode]);

  const set = (field: keyof LeaveTypePayload, value: unknown) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    await onSave(form, initial?.id);
  };

  const Toggle = ({
    field,
    label,
  }: {
    field: 'is_paid' | 'is_encashable' | 'requires_document' | 'is_system_type';
    label: string;
  }) => (
    <button
      type="button"
      onClick={() => set(field, !form[field])}
      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
        form[field]
          ? 'bg-teal-50 border-teal-300 text-teal-700'
          : 'bg-slate-50 border-slate-200 text-slate-500'
      }`}
    >
      <span>{label}</span>
      <div
        className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
          form[field] ? 'bg-teal-600' : 'border border-slate-300'
        }`}
      >
        {form[field] && <CheckCircle2 size={10} className="text-white" />}
      </div>
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3 pt-5 mt-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {mode === 'create' ? 'Add leave type' : `Edit — ${initial?.name}`}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === 'create' ? 'Configure a new leave type' : 'Update leave type details'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-3 py-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Name
                {' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Annual Leave"
                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>
            {/* <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.code}
                onChange={e => set('code', e.target.value.toUpperCase())}
                placeholder="AL"
                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-mono uppercase"
              />
            </div> */}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Description</label>
            <textarea
              value={form.description || ''}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Optional description..."
              rows={2}
              className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Applicable gender</label>
              <select
                value={form.applicable_gender || 'all'}
                onChange={(e) => set('applicable_gender', e.target.value as LeaveTypePayload['applicable_gender'])}
                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-white"
              >
                <option value="all">All</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Max consecutive days</label>
              <input
                type="number"
                min={1}
                value={form.max_consecutive_days ?? ''}
                onChange={(e) => set('max_consecutive_days', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="e.g. 18"
                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Notice days</label>
              <input
                type="number"
                min={0}
                value={form.notice_days_required ?? 0}
                onChange={(e) => set('notice_days_required', parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Flags</label>
            <div className="grid grid-cols-2 gap-2">
              <Toggle field="is_paid" label="Paid leave" />
              <Toggle field="is_encashable" label="Encashable" />
              <Toggle field="requires_document" label="Document required" />
              <Toggle field="is_system_type" label="System type" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
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

// ── Delete Confirm Modal ──────────────────────────────────────────
interface DeleteModalProps {
  leaveType: LeaveType;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  deleting: boolean;
}

function DeleteModal({
  leaveType, onClose, onConfirm, deleting,
}: DeleteModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={16} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Delete leave type</h3>
            <p className="text-xs text-slate-400 mt-0.5">This action cannot be undone</p>
          </div>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete
            {' '}
            <span className="font-semibold text-slate-900">{leaveType.name}</span>
            ?
            This may affect existing leave requests linked to this type.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
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

// ── Main Component ────────────────────────────────────────────────
interface LeaveTypesTabProps {
  apiKey: string;
  token?: string;
}

export default function LeaveTypesTab({ apiKey, token }: LeaveTypesTabProps) {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [selected, setSelected] = useState<LeaveType | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchLeaveTypes();
  }, [apiKey, token]);

  async function fetchLeaveTypes() {
    setLoading(true);
    setError(null);

    try {
      const res = await getLeaveTypes(apiKey, token);

      // Improved response handling
      let list: LeaveType[] = [];
      if (res?.data?.data && Array.isArray(res.data.data)) {
        list = res.data.data;
      } else if (res?.data && Array.isArray(res.data)) {
        list = res.data;
      } else if (Array.isArray(res)) {
        list = res;
      }

      setLeaveTypes(list);
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : 'Failed to load leave types';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(payload: LeaveTypePayload, id?: string) {
    setSaving(true);
    setError(null);
    const savingToast = toast.loading(id ? 'Updating leave type...' : 'Creating leave type...');

    try {
      let response;
      let newLeaveType: LeaveType;

      if (id) {
        // Edit existing
        response = await updateLeaveType(id, payload, apiKey, token);

        // Extract the updated leave type from response
        const responseData = response?.data?.data || response?.data;
        newLeaveType = { ...payload, id, ...responseData };

        // Update the list with the new data
        setLeaveTypes((prev) => prev.map((lt) => (lt.id === id ? newLeaveType : lt)));

        toast.success(`Leave type "${payload.name}" updated successfully`, { id: savingToast });
      } else {
        // Create new
        response = await createLeaveType(payload, apiKey, token);

        // Extract the created leave type from response
        const responseData = response?.data?.data || response?.data;
        newLeaveType = { ...payload, ...responseData, id: responseData?.id || Date.now().toString() };

        // Add to list
        setLeaveTypes((prev) => [...prev, newLeaveType]);

        toast.success(`Leave type "${payload.name}" created successfully`, { id: savingToast });
      }

      setModal(null);
      setSelected(null);
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : 'Failed to save leave type';
      setError(errorMsg);
      toast.error(errorMsg, { id: savingToast });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;

    setDeleting(true);
    setError(null);
    const deletingToast = toast.loading(`Deleting ${selected.name}...`);

    try {
      await deleteLeaveType(selected.id, apiKey, token);
      // Remove from list
      setLeaveTypes((prev) => prev.filter((lt) => lt.id !== selected.id));
      toast.success(`Leave type "${selected.name}" deleted successfully`, { id: deletingToast });
      setModal(null);
      setSelected(null);
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : 'Failed to delete leave type';
      setError(errorMsg);
      toast.error(errorMsg, { id: deletingToast });
    } finally {
      setDeleting(false);
    }
  }

  const openEdit = (lt: LeaveType) => {
    setSelected(lt);
    setModal('edit');
  };

  const openDelete = (lt: LeaveType) => {
    setSelected(lt);
    setModal('delete');
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
  };

  // Table row component for better performance
  const TableRow = ({ leaveType }: { leaveType: LeaveType }) => (
    <tr className="group hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">{leaveType.name}</p>
          {leaveType.description && (
            <p className="text-xs text-slate-400 mt-0.5 max-w-[160px] truncate">
              {leaveType.description}
            </p>
          )}
        </div>
      </td>
      {/* <td className="px-4 py-3">
        <code className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
          {leaveType.code}
        </code>
      </td> */}
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
          leaveType.is_paid ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-400'
        }`}
        >
          {leaveType.is_paid && <CheckCircle2 size={11} />}
          {leaveType.is_paid ? 'Yes' : 'No'}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
          leaveType.is_encashable ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-400'
        }`}
        >
          {leaveType.is_encashable && <CheckCircle2 size={11} />}
          {leaveType.is_encashable ? 'Yes' : 'No'}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
          leaveType.requires_document ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-400'
        }`}
        >
          {leaveType.requires_document && <CheckCircle2 size={11} />}
          {leaveType.requires_document ? 'Yes' : 'No'}
        </span>
      </td>
      <td className="px-4 py-3">
        {leaveType.applicable_gender ? (
          <span className={`inline-flex text-xs font-semibold px-2 py-1 rounded-full capitalize ${
            genderBadge[leaveType.applicable_gender] ?? 'bg-slate-100 text-slate-500'
          }`}
          >
            {leaveType.applicable_gender}
          </span>
        ) : '—'}
      </td>
      <td className="px-4 py-3 text-sm text-slate-700">
        {leaveType.max_consecutive_days != null ? `${leaveType.max_consecutive_days}d` : '—'}
      </td>
      <td className="px-4 py-3 text-sm text-slate-700">
        {leaveType.notice_days_required != null ? `${leaveType.notice_days_required}d` : '—'}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openEdit(leaveType)}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-teal-50 hover:border-teal-300 hover:text-teal-600 text-slate-400 transition-all"
            title="Edit"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => openDelete(leaveType)}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-red-50 hover:border-red-300 hover:text-red-500 text-slate-400 transition-all"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  );

  // Mobile card component
  const MobileCard = ({ leaveType }: { leaveType: LeaveType }) => (
    <div className="px-4 py-4 border-b border-slate-100">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-800">{leaveType.name}</span>
            {/* <code className="text-xs font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
              {leaveType.code}
            </code> */}
          </div>
          {leaveType.description && (
            <p className="text-xs text-slate-400 mt-0.5">{leaveType.description}</p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {leaveType.is_paid && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
                Paid
              </span>
            )}
            {leaveType.is_encashable && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                Encashable
              </span>
            )}
            {leaveType.requires_document && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                Doc required
              </span>
            )}
            {leaveType.applicable_gender && leaveType.applicable_gender !== 'all' && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                genderBadge[leaveType.applicable_gender]
              }`}
              >
                {leaveType.applicable_gender}
              </span>
            )}
            {leaveType.max_consecutive_days != null && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Max
                {' '}
                {leaveType.max_consecutive_days}
                d
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => openEdit(leaveType)}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-teal-50 hover:border-teal-300 hover:text-teal-600 text-slate-400 transition-all"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => openDelete(leaveType)}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-red-50 hover:border-red-300 hover:text-red-500 text-slate-400 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Leave types</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {loading ? 'Loading…' : `${leaveTypes.length} types configured`}
            </p>
          </div>
          <button
            onClick={() => setModal('create')}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0f766e] hover:bg-teal-700 rounded-lg transition-all shadow-sm"
          >
            <Plus size={13} />
            {' '}
            Add type
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertTriangle size={13} />
            {' '}
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
            <Loader2 size={16} className="animate-spin" />
            {' '}
            Loading leave types…
          </div>
        )}

        {/* Desktop Table */}
        {!loading && leaveTypes.length > 0 && (
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Leave type', 'Code', 'Paid', 'Encashable', 'Doc required', 'Gender', 'Max days', 'Notice days', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaveTypes.map((lt) => (
                  <TableRow key={lt.id} leaveType={lt} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile Cards */}
        {!loading && leaveTypes.length > 0 && (
          <div className="sm:hidden divide-y divide-slate-100">
            {leaveTypes.map((lt) => (
              <MobileCard key={lt.id} leaveType={lt} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && leaveTypes.length === 0 && (
          <div className="px-4 py-12 text-center">
            <div className="text-slate-400 mb-2">
              <Plus size={32} className="mx-auto opacity-50" />
            </div>
            <p className="text-sm text-slate-500">No leave types found</p>
            <button
              onClick={() => setModal('create')}
              className="mt-3 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
            >
              Create your first leave type →
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {(modal === 'create' || modal === 'edit') && (
        <LeaveTypeModal
          mode={modal}
          initial={modal === 'edit' && selected ? selected : undefined}
          onClose={closeModal}
          onSave={handleSave}
          saving={saving}
        />
      )}

      {modal === 'delete' && selected && (
        <DeleteModal
          leaveType={selected}
          onClose={closeModal}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </>
  );
}
