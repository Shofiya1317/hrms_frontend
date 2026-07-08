'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Plus, Pencil, Trash2, Loader2, X, AlertCircle, CheckCircle2,
  Building2, Briefcase, Clock, Factory,
} from 'lucide-react';
import {
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getDesignations, createDesignation, updateDesignation, deleteDesignation,
  getShifts, createShift, updateShift, deleteShift,
  // getIndustries, createIndustry, updateIndustry, deleteIndustry,
} from '@/lib/service/masters';

// ─── Types ────────────────────────────────────────────────────────

interface MasterItem {
  id: string;
  name: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  start_time_24hr?: string;
  end_time_24hr?: string;
  shift_type?: 'FIXED' | 'FLEXIBLE';
  flex_start_time?: string;
  flex_end_time?: string;
  required_work_hours?: number;
  level?: string;
  code?: string;
}

type TabKey = 'department' | 'designation' | 'shift' ;

interface TabConfig {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
}

// ─── Constants ───────────────────────────────────────────────────

const TABS: TabConfig[] = [
  { key: 'department', label: 'Departments', icon: <Building2 size={14} />, color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200' },
  { key: 'designation', label: 'Designations', icon: <Briefcase size={14} />, color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  { key: 'shift', label: 'Shifts', icon: <Clock size={14} />, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  // { key: 'industry', label: 'Industries', icon: <Factory size={14} />, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
];

// ─── Helpers ─────────────────────────────────────────────────────

function extractList(res: any): MasterItem[] {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  return [];
}

function fmtTime(t?: string) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  if (isNaN(h)) return t;
  const p = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, '0')}:${String(m ?? 0).padStart(2, '0')} ${p}`;
}

// ─── CRUD Modal ───────────────────────────────────────────────────

function CrudModal({ tab, editing, tenantId, onClose, onDone }: {
  tab: TabKey; editing: MasterItem | null;
  tenantId: string; onClose: () => void; onDone: () => void;
}) {
  const isEdit = !!editing;
  const [name, setName] = useState(editing?.name ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [level, setLevel] = useState(editing?.level ?? '');
  const [code, setCode] = useState(editing?.code ?? '');
  const [startTime, setStartTime] = useState(editing?.start_time_24hr ?? editing?.start_time ?? '');
  const [endTime, setEndTime] = useState(editing?.end_time_24hr ?? editing?.end_time ?? '');
  const [shiftType, setShiftType] = useState<'FIXED' | 'FLEXIBLE'>(editing?.shift_type ?? 'FIXED');
  const [flexStartTime, setFlexStartTime] = useState(editing?.flex_start_time ?? '');
  const [flexEndTime, setFlexEndTime] = useState(editing?.flex_end_time ?? '');
  const [requiredWorkHours, setRequiredWorkHours] = useState(editing?.required_work_hours?.toString() ?? '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const tabCfg = TABS.find((t) => t.key === tab)!;
  const singularLabel = tabCfg.label.replace(/s$/, '');
  const inputCls = 'w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all';

  const handleSubmit = async () => {
    if (!name.trim()) { setErr('Name is required.'); return; }
    if (tab === 'shift') {
      if (shiftType === 'FIXED') {
        if (!startTime) { setErr('Start time is required.'); return; }
        if (!endTime) { setErr('End time is required.'); return; }
      } else {
        if (!flexStartTime) { setErr('Flex start time is required.'); return; }
        if (!flexEndTime) { setErr('Flex end time is required.'); return; }
        if (!requiredWorkHours) { setErr('Required work hours is required.'); return; }
      }
    }
    setSaving(true); setErr('');
    try {
      if (tab === 'department') {
        const body = { name: name.trim(), ...(description && { description }) };
        isEdit ? await updateDepartment(editing!.id, body, tenantId) : await createDepartment(body, tenantId);
      } else if (tab === 'designation') {
        const body = { name: name.trim(), ...(description && { description }), ...(level && { level }), ...(code && { code }) };
        isEdit ? await updateDesignation(editing!.id, body, tenantId) : await createDesignation(body, tenantId);
      } else if (tab === 'shift') {
        const body = { 
          name: name.trim(), 
          ...(description && { description }), 
          shift_type: shiftType,
          ...(shiftType === 'FIXED' && { start_time: startTime, end_time: endTime }),
          ...(shiftType === 'FLEXIBLE' && { 
              flex_start_time: flexStartTime, 
              flex_end_time: flexEndTime, 
              required_work_hours: requiredWorkHours ? parseFloat(requiredWorkHours) : null 
          })
        };
        isEdit ? await updateShift(editing!.id, body, tenantId) : await createShift(body, tenantId);
      }
      //  else if (tab === 'industry') {
      //   const body = { name: name.trim(), ...(description && { description }) };
      //   isEdit ? await updateIndustry(editing!.id, body, tenantId) : await createIndustry(body, tenantId);
      // }
      onDone();
    } catch (e: any) {
      const d = e?.response?.data;
      setErr(Array.isArray(d?.error) ? d.error[0] : (d?.message ?? 'Something went wrong.'));
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className={`h-1 w-full ${tabCfg.bg.replace('bg-', 'bg-gradient-to-r from-')} bg-gradient-to-r from-teal-400 to-emerald-500`} />
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl ${tabCfg.bg} flex items-center justify-center`}>
                <span className={tabCfg.color}>{tabCfg.icon}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                {isEdit ? `Edit ${singularLabel}` : `Add ${singularLabel}`}
              </h3>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
              <X size={15} />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Enter ${singularLabel.toLowerCase()} name`}
                className={inputCls}
              />
            </div>

            {tab === 'designation' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Level</label>
                  <input type="text" value={level} onChange={(e) => setLevel(e.target.value)} placeholder="e.g. Senior" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Code</label>
                  <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. SDE" className={inputCls} />
                </div>
              </div>
            )}

            {tab === 'shift' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Shift Type</label>
                  <select
                    value={shiftType}
                    onChange={(e) => setShiftType(e.target.value as 'FIXED' | 'FLEXIBLE')}
                    className={inputCls}
                  >
                    <option value="FIXED">Fixed Shift</option>
                    <option value="FLEXIBLE">Flexible Shift</option>
                  </select>
                </div>
                {shiftType === 'FIXED' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Start Time <span className="text-red-500">*</span>
                      </label>
                      <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        End Time <span className="text-red-500">*</span>
                      </label>
                      <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputCls} />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Flex Start <span className="text-red-500">*</span>
                      </label>
                      <input type="time" value={flexStartTime} onChange={(e) => setFlexStartTime(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Flex End <span className="text-red-500">*</span>
                      </label>
                      <input type="time" value={flexEndTime} onChange={(e) => setFlexEndTime(e.target.value)} className={inputCls} />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Required Work Hours <span className="text-red-500">*</span>
                      </label>
                      <input type="number" step="0.5" value={requiredWorkHours} onChange={(e) => setRequiredWorkHours(e.target.value)} placeholder="e.g. 8.5" className={inputCls} />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Optional description"
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>

          {err && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mt-3">
              <AlertCircle size={13} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-600">{err}</p>
            </div>
          )}

          <div className="flex gap-2.5 mt-4">
            <button onClick={onClose} disabled={saving} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-sm font-bold text-white disabled:opacity-60 transition-all">
              {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────

function DeleteModal({ item, tab, tenantId, onClose, onDone }: {
  item: MasterItem; tab: TabKey; tenantId: string; onClose: () => void; onDone: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState('');

  const handleDelete = async () => {
    setDeleting(true); setErr('');
    try {
      if (tab === 'department') await deleteDepartment(item.id, tenantId);
      else if (tab === 'designation') await deleteDesignation(item.id, tenantId);
      else if (tab === 'shift') await deleteShift(item.id, tenantId);
      // else if (tab === 'industry') await deleteIndustry(item.id, tenantId);
      onDone();
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? 'Failed to delete.');
    } finally { setDeleting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
            <Trash2 size={20} className="text-red-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Delete &quot;{item.name}&quot;?</h3>
          <p className="text-xs text-slate-400 mb-4">This action cannot be undone.</p>
          {err && <p className="text-xs text-red-500 mb-3">{err}</p>}
          <div className="flex gap-2.5">
            <button onClick={onClose} disabled={deleting} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40">
              Cancel
            </button>
            <button onClick={handleDelete} disabled={deleting} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-bold text-white disabled:opacity-60">
              {deleting ? <><Loader2 size={13} className="animate-spin" /> Deleting…</> : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Item Row ────────────────────────────────────────────────────

function ItemRow({ item, tab, onEdit, onDelete }: {
  item: MasterItem; tab: TabKey; onEdit: () => void; onDelete: () => void;
}) {
  const tabCfg = TABS.find((t) => t.key === tab)!;
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
      <div className={`w-9 h-9 rounded-xl ${tabCfg.bg} flex items-center justify-center flex-shrink-0`}>
        <span className={tabCfg.color}>{tabCfg.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
        <div className="flex items-center gap-2 flex-wrap mt-0.5">
          {item.description && (
            <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{item.description}</p>
          )}
          {tab === 'designation' && item.level && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">{item.level}</span>
          )}
          {tab === 'designation' && item.code && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">{item.code}</span>
          )}
          {tab === 'shift' && (item.start_time_24hr || item.start_time) && (
            <span className="text-[10px] text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded-full">
              {fmtTime(item.start_time_24hr ?? item.start_time)} – {fmtTime(item.end_time_24hr ?? item.end_time)}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          title="Edit"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────

export default function MastersSetup({ slug }: { slug: string }) {
  const params = useParams();
  const tenantId = slug || (params?.subdomain as string);

  const [activeTab, setActiveTab] = useState<TabKey>('department');
  const [items, setItems] = useState<MasterItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<MasterItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MasterItem | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => { fetchItems(); }, [activeTab, tenantId]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      let res: any;
      if (activeTab === 'department') res = await getDepartments(tenantId);
      else if (activeTab === 'designation') res = await getDesignations(tenantId);
      else if (activeTab === 'shift') res = await getShifts(tenantId);
      // else if (activeTab === 'industry') res = await getIndustries(tenantId);
      setItems(extractList(res));
    } catch { setItems([]); } finally { setLoading(false); }
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleDone = (msg: string) => {
    setShowModal(false);
    setEditing(null);
    setDeletingItem(null);
    showToast(msg, 'success');
    fetchItems();
  };

  const activeCfg = TABS.find((t) => t.key === activeTab)!;
  const singularLabel = activeCfg.label.replace(/s$/, '');

  return (
    <div className="space-y-4">

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-right-2 duration-300 bg-white ${toast.type === 'success' ? 'border-emerald-200' : 'border-red-200'}`}>
          {toast.type === 'success'
            ? <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
            : <AlertCircle size={16} className="text-red-600 flex-shrink-0" />}
          <p className={`text-sm font-semibold ${toast.type === 'success' ? 'text-emerald-900' : 'text-red-900'}`}>{toast.msg}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Masters Configuration</h3>
          <p className="text-xs text-slate-400 mt-0.5">Manage your organisation master data</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition-all shadow-sm"
        >
          <Plus size={13} />
          Add {singularLabel}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === tab.key
                ? `bg-white shadow-sm ${tab.color}`
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Count badge */}
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${activeCfg.bg} border ${activeCfg.border}`}>
        <span className={activeCfg.color}>{activeCfg.icon}</span>
        <span className={`text-xs font-bold ${activeCfg.color}`}>
          {loading ? '…' : items.length} {activeCfg.label}
        </span>
        <span className="text-xs text-slate-400 ml-0.5">configured</span>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={20} className="animate-spin text-teal-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className={`w-12 h-12 rounded-2xl ${activeCfg.bg} flex items-center justify-center mb-3`}>
            <span className={activeCfg.color}>{activeCfg.icon}</span>
          </div>
          <p className="text-sm font-semibold text-slate-400">No {activeCfg.label.toLowerCase()} yet</p>
          <p className="text-xs text-slate-300 mt-1">Click &quot;Add {singularLabel}&quot; to create the first one</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
          {items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              tab={activeTab}
              onEdit={() => { setEditing(item); setShowModal(true); }}
              onDelete={() => setDeletingItem(item)}
            />
          ))}
        </div>
      )}

      {/* CRUD Modal */}
      {showModal && (
        <CrudModal
          tab={activeTab}
          editing={editing}
          tenantId={tenantId}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onDone={() => handleDone(`${singularLabel} ${editing ? 'updated' : 'created'} successfully`)}
        />
      )}

      {/* Delete Modal */}
      {deletingItem && (
        <DeleteModal
          item={deletingItem}
          tab={activeTab}
          tenantId={tenantId}
          onClose={() => setDeletingItem(null)}
          onDone={() => handleDone(`${singularLabel} deleted successfully`)}
        />
      )}
    </div>
  );
}
