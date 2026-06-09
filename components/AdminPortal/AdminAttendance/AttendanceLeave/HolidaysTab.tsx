'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  Plus, Pencil, Trash2, X, Loader2, CalendarDays,
  AlertCircle, ChevronLeft, ChevronRight, Download,
} from 'lucide-react';
import {
  getHolidaysByYear, createHoliday, updateHoliday, deleteHoliday, bulkImportHolidays,
  IHoliday, IHolidayPayload, HolidayType,
} from '@/lib/service/companyHoliday';

const MONTH_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_SHORT = ['S','M','T','W','T','F','S'];

const TYPE_META: Record<HolidayType, {
  label: string; bg: string; text: string; dot: string; border: string; ringColor: string;
}> = {
  public:     { label: 'Public',     bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500',   border: 'border-blue-200',   ringColor: 'ring-blue-400' },
  optional:   { label: 'Optional',   bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-500',  border: 'border-amber-200',  ringColor: 'ring-amber-400' },
  restricted: { label: 'Restricted', bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500', border: 'border-purple-200', ringColor: 'ring-purple-400' },
};

const HOLIDAY_TYPES: HolidayType[] = ['public', 'optional', 'restricted'];

const defaultForm = (): IHolidayPayload => ({
  name: '', date: '', holiday_type: 'public', description: '', is_active: true,
});

const isoToInput = (iso: string) => iso?.split('T')[0] ?? '';

// ── Day Cell with self-contained hover card ──────────────────────────────────
function DayCell({
  day, iso, holidays, isToday, onDayClick, onEdit, onConfirmDelete, deletingId, colIndex,
}: {
  day: number; iso: string; holidays: IHoliday[]; isToday: boolean;
  onDayClick: (iso: string) => void;
  onEdit: (h: IHoliday) => void;
  onConfirmDelete: (id: string, name: string) => void;
  deletingId: string | null;
  colIndex: number; // 0-6, used to flip card left/right
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const h = holidays[0];
  const meta = h ? TYPE_META[h.holiday_type] : null;

  const keep = () => { if (closeTimer.current) clearTimeout(closeTimer.current); };
  const leave = () => { closeTimer.current = setTimeout(() => setOpen(false), 150); };

  if (!h) return (
    <button
      onClick={() => onDayClick(iso)}
      className={`w-full aspect-square flex items-center justify-center rounded-lg text-[10px] font-semibold transition-colors select-none ${
        isToday ? 'bg-[#0f766e] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
      }`}
    >{day}</button>
  );

  // flip card to left side for days in col 5-6 to avoid right-edge clipping
  const flipLeft = colIndex >= 5;

  return (
    <div className="relative" onMouseEnter={() => { keep(); setOpen(true); }} onMouseLeave={leave}>
      {/* day box */}
      <div className={`w-full aspect-square flex items-center justify-center rounded-lg text-[10px] font-semibold border cursor-default select-none transition-all ${
        meta!.bg} ${meta!.text} ${meta!.border} ${open ? `ring-2 ${meta!.ringColor}` : ''}`}>
        {day}
        {holidays.length > 1 && (
          <span className="absolute top-0.5 right-0.5 w-[9px] h-[9px] rounded-full bg-white/90 text-[6px] font-bold text-gray-600 flex items-center justify-center shadow-sm">
            {holidays.length}
          </span>
        )}
      </div>

      {/* hover card — sits below the box, overlapping via negative top margin so there's zero gap */}
      {open && (
        <div
          onMouseEnter={keep}
          onMouseLeave={leave}
          className={`absolute top-full z-50 w-44 -mt-1 ${
            flipLeft ? 'right-0' : 'left-0'
          }`}
        >
          {/* invisible bridge strip to cover the 1px gap between box bottom and card top */}
          <div className="h-2" />
          <div className={`bg-white rounded-2xl shadow-2xl border ${meta!.border} p-3 space-y-2`}>
            {holidays.map((hh, idx) => {
              const m = TYPE_META[hh.holiday_type];
              return (
                <div key={hh.id} className={idx > 0 ? 'pt-2 border-t border-gray-100' : ''}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${m.dot}`} />
                    <p className={`text-[11px] font-bold ${m.text} truncate leading-tight`}>{hh.name}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => { setOpen(false); onEdit(hh); }}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold text-[#0f766e] bg-[#e8f5ee] hover:bg-[#d4eddf] transition-colors"
                    >
                      <Pencil size={10} /> Edit
                    </button>
                    <button
                      onClick={() => { setOpen(false); onConfirmDelete(hh.id, hh.name); }}
                      disabled={deletingId === hh.id}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {deletingId === hh.id ? <Loader2 size={10} className="animate-spin" /> : <><Trash2 size={10} />Del</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Mini Month ────────────────────────────────────────────────────────────────
function MiniMonth({
  year, monthIdx, byDate, filterType, onDayClick, onEdit, onConfirmDelete, deletingId,
}: {
  year: number; monthIdx: number; byDate: Record<string, IHoliday[]>;
  filterType: HolidayType | 'all';
  onDayClick: (iso: string) => void;
  onEdit: (h: IHoliday) => void;
  onConfirmDelete: (id: string, name: string) => void;
  deletingId: string | null;
}) {
  const today = new Date();
  const firstDow = new Date(year, monthIdx, 1).getDay();
  const totalDays = new Date(year, monthIdx + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDow).fill(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const monthHolidayCount = useMemo(() => {
    let count = 0;
    for (let d = 1; d <= totalDays; d++) {
      const iso = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hs = byDate[iso] ?? [];
      count += filterType === 'all' ? hs.length : hs.filter(h => h.holiday_type === filterType).length;
    }
    return count;
  }, [byDate, year, monthIdx, totalDays, filterType]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="px-3 py-2.5 bg-gradient-to-r from-[#f0faf5] to-white rounded-t-2xl border-b border-gray-100 flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#0f1f2e] uppercase tracking-wider">{MONTH_FULL[monthIdx]}</span>
        {monthHolidayCount > 0 && (
          <span className="text-[9px] font-bold text-[#0f766e] bg-[#e8f5ee] px-1.5 py-0.5 rounded-full">{monthHolidayCount}</span>
        )}
      </div>
      <div className="grid grid-cols-7 px-2 pt-2">
        {DAYS_SHORT.map((d, i) => (
          <div key={i} className="text-center text-[8px] font-bold text-gray-300 pb-1">{d}</div>
        ))}
      </div>
      {/* overflow-visible so hover cards are never clipped by the card boundary */}
      <div className="grid grid-cols-7 gap-0.5 px-2 pb-2.5 overflow-visible">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const iso = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const allH = byDate[iso] ?? [];
          const filtered = filterType === 'all' ? allH : allH.filter(h => h.holiday_type === filterType);
          const isToday = today.getFullYear() === year && today.getMonth() === monthIdx && today.getDate() === day;
          const colIndex = i % 7;
          return (
            <DayCell
              key={i}
              day={day}
              iso={iso}
              holidays={filtered}
              isToday={isToday}
              onDayClick={onDayClick}
              onEdit={onEdit}
              onConfirmDelete={onConfirmDelete}
              deletingId={deletingId}
              colIndex={colIndex}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function HolidaysTab() {
  const params = useParams();
  const subdomain = params?.subdomain as string;

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [filterType, setFilterType] = useState<HolidayType | 'all'>('all');
  const [holidays, setHolidays] = useState<IHoliday[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<IHolidayPayload>(defaultForm());
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [showImport, setShowImport] = useState(false);
  const [importIds, setImportIds] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState<string>('');

  useEffect(() => { if (subdomain) fetchHolidays(); }, [subdomain, year]);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await getHolidaysByYear(year, subdomain);
      const raw: IHoliday[] = Array.isArray(res?.data) ? res.data : (res?.data?.data ?? []);
      setHolidays(raw.filter(h => !h.is_deleted));
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const byDate = useMemo(() => {
    const map: Record<string, IHoliday[]> = {};
    holidays.forEach(h => {
      const key = isoToInput(h.date);
      if (!map[key]) map[key] = [];
      map[key].push(h);
    });
    return map;
  }, [holidays]);

  const stats = useMemo(() => ({
    total: holidays.length,
    public: holidays.filter(h => h.holiday_type === 'public').length,
    optional: holidays.filter(h => h.holiday_type === 'optional').length,
    restricted: holidays.filter(h => h.holiday_type === 'restricted').length,
  }), [holidays]);

  const openCreate = (date?: string) => {
    setForm({ ...defaultForm(), date: date ?? '' });
    setEditingId(null); setModalError(null); setShowModal(true);
  };

  const openEdit = (h: IHoliday) => {
    setForm({ name: h.name, date: isoToInput(h.date), holiday_type: h.holiday_type, description: h.description ?? '', is_active: h.is_active });
    setEditingId(h.id); setModalError(null); setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setModalError('Name is required.'); return; }
    if (!form.date) { setModalError('Date is required.'); return; }
    setSaving(true); setModalError(null);
    try {
      editingId ? await updateHoliday(editingId, form, subdomain) : await createHoliday(form, subdomain);
      setShowModal(false); fetchHolidays();
    } catch (e: any) {
      setModalError(e?.response?.data?.message || 'Something went wrong.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteHoliday(id, subdomain);
      setHolidays(prev => prev.filter(h => h.id !== id));
    } catch { /* silent */ }
    finally { setDeletingId(null); setConfirmDeleteId(null); }
  };

  const handleBulkImport = async () => {
    const ids = importIds.split(',').map(s => s.trim()).filter(Boolean);
    if (!ids.length) { setImportError('Enter at least one holiday ID.'); return; }
    setImporting(true); setImportError(null);
    try {
      await bulkImportHolidays({ year, holiday_ids: ids }, subdomain);
      setShowImport(false); setImportIds(''); fetchHolidays();
    } catch (e: any) {
      setImportError(e?.response?.data?.message || 'Import failed.');
    } finally { setImporting(false); }
  };

  const setField = (k: keyof IHolidayPayload, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#0f1f2e]">Holiday Calendar {year}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {stats.total} total · {stats.public} public · {stats.optional} optional · {stats.restricted} restricted
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl px-2 py-1">
            <button onClick={() => setYear(y => y - 1)} className="p-1 rounded-lg hover:bg-white transition-colors text-gray-500"><ChevronLeft size={13} /></button>
            <span className="text-xs font-bold text-[#0f1f2e] px-1 min-w-[36px] text-center">{year}</span>
            <button onClick={() => setYear(y => y + 1)} className="p-1 rounded-lg hover:bg-white transition-colors text-gray-500"><ChevronRight size={13} /></button>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {(['all', ...HOLIDAY_TYPES] as const).map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg transition-colors capitalize ${filterType === t ? 'bg-white text-[#0f766e] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {t === 'all' ? 'All' : TYPE_META[t].label}
              </button>
            ))}
          </div>
          <button onClick={() => { setImportIds(''); setImportError(null); setShowImport(true); }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0f766e] bg-[#e8f5ee] hover:bg-[#d4eddf] rounded-xl transition-colors">
            <Download size={13} /> Import
          </button>
          <button onClick={() => openCreate()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#0f766e] hover:bg-[#0d6460] rounded-xl transition-colors">
            <Plus size={13} /> Add Holiday
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total',      value: stats.total,      color: 'text-[#0f766e]',  bg: 'bg-[#e8f5ee]',  dot: 'bg-[#0f766e]' },
          { label: 'Public',     value: stats.public,     color: 'text-blue-600',   bg: 'bg-blue-50',    dot: 'bg-blue-500' },
          { label: 'Optional',   value: stats.optional,   color: 'text-amber-600',  bg: 'bg-amber-50',   dot: 'bg-amber-500' },
          { label: 'Restricted', value: stats.restricted, color: 'text-purple-600', bg: 'bg-purple-50',  dot: 'bg-purple-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 px-4 py-3 shadow-sm flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
            </div>
            <div>
              <p className={`text-lg font-bold leading-none ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center gap-4 px-1 flex-wrap">
        {HOLIDAY_TYPES.map(t => {
          const m = TYPE_META[t];
          return (
            <div key={t} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-sm ${m.bg} border ${m.border}`} />
              <span className="text-[10px] text-gray-500 font-medium">{m.label}</span>
            </div>
          );
        })}
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#0f766e]" />
          <span className="text-[10px] text-gray-500 font-medium">Today</span>
        </div>
        <span className="text-[10px] text-gray-400 ml-auto hidden sm:block">Hover a holiday day to edit or delete</span>
      </div>

      {/* ── Year Grid ── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={22} className="animate-spin text-[#0f766e]" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }, (_, i) => (
            <MiniMonth
              key={i}
              year={year}
              monthIdx={i}
              byDate={byDate}
              filterType={filterType}
              onDayClick={openCreate}
              onEdit={openEdit}
              onConfirmDelete={(id, name) => { setConfirmDeleteId(id); setConfirmDeleteName(name); }}
              deletingId={deletingId}
            />
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#e8f5ee] flex items-center justify-center">
                  <CalendarDays size={15} className="text-[#2D7A4F]" />
                </div>
                <h2 className="text-sm font-bold text-[#0f1f2e]">{editingId ? 'Edit Holiday' : 'Add Holiday'}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Holiday Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={e => setField('name', e.target.value)} placeholder="e.g. Independence Day"
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date <span className="text-red-500">*</span></label>
                  <input type="date" value={form.date} onChange={e => setField('date', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Type</label>
                  <div className="flex flex-col gap-1.5">
                    {HOLIDAY_TYPES.map(t => {
                      const meta = TYPE_META[t];
                      return (
                        <button key={t} type="button" onClick={() => setField('holiday_type', t)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${form.holiday_type === t ? `${meta.bg} ${meta.text} ${meta.border}` : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                          <span className={`w-2 h-2 rounded-full ${form.holiday_type === t ? meta.dot : 'bg-gray-300'}`} />
                          {meta.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Optional description..." rows={2}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all resize-none" />
              </div>
              <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="text-xs font-semibold text-gray-700">Active</p>
                  <p className="text-[10px] text-gray-400">Inactive holidays won&apos;t appear to employees</p>
                </div>
                <button type="button" onClick={() => setField('is_active', !form.is_active)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${form.is_active ? 'bg-[#0f766e]' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              {modalError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-600 font-medium">{modalError}</p>
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="button" onClick={handleSave} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0f766e] rounded-xl hover:bg-[#0d6460] transition-colors disabled:opacity-60">
                  {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : editingId ? 'Update Holiday' : 'Add Holiday'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                <Trash2 size={20} className="text-red-500" />
              </div>
              <h3 className="text-sm font-bold text-[#0f1f2e] mb-1">Delete Holiday</h3>
              <p className="text-xs text-gray-400 mb-1">Are you sure you want to delete</p>
              <p className="text-sm font-semibold text-[#0f1f2e] mb-5">&quot;{confirmDeleteName}&quot;?</p>
              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(confirmDeleteId)}
                  disabled={deletingId === confirmDeleteId}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-60"
                >
                  {deletingId === confirmDeleteId
                    ? <><Loader2 size={14} className="animate-spin" /> Deleting...</>
                    : <><Trash2 size={14} /> Delete</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Import Modal ── */}
      {showImport && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#e8f5ee] flex items-center justify-center">
                  <Download size={15} className="text-[#2D7A4F]" />
                </div>
                <h2 className="text-sm font-bold text-[#0f1f2e]">Bulk Import Holidays</h2>
              </div>
              <button onClick={() => setShowImport(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Holiday IDs <span className="text-red-500">*</span></label>
                <textarea value={importIds} onChange={e => setImportIds(e.target.value)} placeholder="Paste comma-separated holiday IDs..." rows={3}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all resize-none" />
                <p className="text-[10px] text-gray-400 mt-1">Importing into year <span className="font-semibold text-[#0f766e]">{year}</span></p>
              </div>
              {importError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-600 font-medium">{importError}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowImport(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="button" onClick={handleBulkImport} disabled={importing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0f766e] rounded-xl hover:bg-[#0d6460] transition-colors disabled:opacity-60">
                  {importing ? <><Loader2 size={14} className="animate-spin" /> Importing...</> : 'Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
