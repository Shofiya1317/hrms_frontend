// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams } from 'next/navigation';
// import { Plus, Pencil, Trash2, X, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
// import {
//   getAttendancePolicies,
//   createAttendancePolicy,
//   updateAttendancePolicy,
//   deleteAttendancePolicy,
//   IAttendancePolicyPayload,
// } from '@/lib/service/attendance';

// interface Policy extends IAttendancePolicyPayload {
//   id: string;
//   name: string;
// }

// const defaultForm: IAttendancePolicyPayload = {
//   name: '',
//   grace_period_minutes: 15,
//   auto_checkout_hours: 12,
//   max_regularization_per_month: 2,
//   sandwich_policy_enabled: false,
//   sandwich_include_weekoff: false,
//   sandwich_include_public_holiday: false,
//   sandwich_include_company_holiday: false,
// };

// export default function AttendancePolicies() {
//   const params = useParams();
//   const subdomain = params?.subdomain as string;

//   const [policies, setPolicies] = useState<Policy[]>([]);
//   const [loadingList, setLoadingList] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [form, setForm] = useState<IAttendancePolicyPayload>(defaultForm);
//   const [saving, setSaving] = useState(false);
//   const [deletingId, setDeletingId] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (subdomain) fetchPolicies();
//   }, [subdomain]);

//   const fetchPolicies = async () => {
//     setLoadingList(true);
//     try {
//       const res = await getAttendancePolicies(subdomain);
//       setPolicies(res?.data?.data ?? []);
//     } catch {
//       // silent
//     } finally {
//       setLoadingList(false);
//     }
//   };

//   const openCreate = () => {
//     setForm(defaultForm);
//     setEditingId(null);
//     setError(null);
//     setShowModal(true);
//   };

//   const openEdit = (p: Policy) => {
//     setForm({
//       name: p.name,
//       grace_period_minutes: p.grace_period_minutes,
//       auto_checkout_hours: p.auto_checkout_hours,
//       max_regularization_per_month: p.max_regularization_per_month,
//       sandwich_policy_enabled: p.sandwich_policy_enabled,
//       sandwich_include_weekoff: p.sandwich_include_weekoff,
//       sandwich_include_public_holiday: p.sandwich_include_public_holiday,
//       sandwich_include_company_holiday: p.sandwich_include_company_holiday,
//     });
//     setEditingId(p.id);
//     setError(null);
//     setShowModal(true);
//   };

//   const handleSave = async () => {
//     if (!form.name.trim()) { setError('Policy name is required.'); return; }
//     setSaving(true);
//     setError(null);
//     try {
//       if (editingId) {
//         await updateAttendancePolicy(editingId, form, subdomain);
//       } else {
//         await createAttendancePolicy(form, subdomain);
//       }
//       setShowModal(false);
//       fetchPolicies();
//     } catch (e: any) {
//       setError(e?.response?.data?.message || 'Something went wrong.');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = async (id: string) => {
//     if (!confirm('Delete this attendance policy?')) return;
//     setDeletingId(id);
//     try {
//       await deleteAttendancePolicy(id, subdomain);
//       setPolicies((prev) => prev.filter((p) => p.id !== id));
//     } catch {
//       // silent
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   const setNum = (field: keyof IAttendancePolicyPayload, val: string) =>
//     setForm((prev) => ({ ...prev, [field]: Number(val) }));

//   const setBool = (field: keyof IAttendancePolicyPayload, val: boolean) =>
//     setForm((prev) => ({ ...prev, [field]: val }));

//   return (
//     <div className="space-y-5 p-3 sm:p-4 lg:p-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-xl font-bold text-[#0f1f2e]">Attendance Policies</h1>
//           <p className="text-sm text-gray-500 mt-0.5">Configure rules and attendance thresholds</p>
//         </div>
//         <button
//           onClick={openCreate}
//           className="flex items-center gap-2 rounded-xl bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0d6460] transition-colors"
//         >
//           <Plus size={15} /> Add Policy
//         </button>
//       </div>

//       {loadingList ? (
//         <div className="flex justify-center py-16">
//           <Loader2 size={22} className="animate-spin text-[#0f766e]" />
//         </div>
//       ) : policies.length === 0 ? (
//         <div className="flex flex-col items-center justify-center py-16 text-center">
//           <ShieldCheck size={36} className="text-gray-300 mb-3" />
//           <p className="text-sm font-semibold text-gray-500">No attendance policies yet</p>
//           <p className="text-xs text-gray-400 mt-1">Click &quot;Add Policy&quot; to create one</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
//           {policies.map((p) => (
//             <div key={p.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
//               <div className="flex items-start justify-between gap-2">
//                 <div className="flex items-center gap-2">
//                   <div className="w-8 h-8 rounded-xl bg-[#e8f5ee] flex items-center justify-center flex-shrink-0">
//                     <ShieldCheck size={15} className="text-[#2D7A4F]" />
//                   </div>
//                   <h3 className="text-sm font-bold text-[#0f1f2e] leading-snug">{p.name}</h3>
//                 </div>
//                 <div className="flex gap-1.5 flex-shrink-0">
//                   <button
//                     onClick={() => openEdit(p)}
//                     className="p-1.5 rounded-lg text-gray-400 hover:text-[#0f766e] hover:bg-[#e8f5ee] transition-colors"
//                   >
//                     <Pencil size={14} />
//                   </button>
//                   <button
//                     onClick={() => handleDelete(p.id)}
//                     disabled={deletingId === p.id}
//                     className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
//                   >
//                     {deletingId === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
//                   </button>
//                 </div>
//               </div>

//               <div className="grid grid-cols-3 gap-3">
//                 {[
//                   { label: 'Grace Period', value: `${p.grace_period_minutes} min` },
//                   { label: 'Auto Checkout', value: `${p.auto_checkout_hours} hrs` },
//                   { label: 'Max Regularization', value: `${p.max_regularization_per_month}/mo` },
//                 ].map((item) => (
//                   <div key={item.label} className="rounded-xl bg-gray-50 px-3 py-2.5 text-center">
//                     <p className="text-xs font-bold text-[#0f1f2e]">{item.value}</p>
//                     <p className="text-[10px] text-gray-400 mt-0.5">{item.label}</p>
//                   </div>
//                 ))}
//               </div>

//               <div className="flex flex-wrap gap-2">
//                 <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${p.sandwich_policy_enabled ? 'bg-[#e8f5ee] text-[#2D7A4F]' : 'bg-gray-100 text-gray-400'}`}>
//                   Sandwich Policy {p.sandwich_policy_enabled ? 'ON' : 'OFF'}
//                 </span>
//                 {p.sandwich_policy_enabled && (
//                   <>
//                     {p.sandwich_include_weekoff && <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-500">Week-off</span>}
//                     {p.sandwich_include_public_holiday && <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-500">Public Holiday</span>}
//                     {p.sandwich_include_company_holiday && <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-500">Company Holiday</span>}
//                   </>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
//             <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
//               <div className="flex items-center gap-3">
//                 <div className="w-8 h-8 rounded-xl bg-[#e8f5ee] flex items-center justify-center">
//                   <ShieldCheck size={15} className="text-[#2D7A4F]" />
//                 </div>
//                 <h2 className="text-sm font-bold text-[#0f1f2e]">
//                   {editingId ? 'Edit Attendance Policy' : 'New Attendance Policy'}
//                 </h2>
//               </div>
//               <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
//                 <X size={16} />
//               </button>
//             </div>

//             <div className="overflow-y-auto p-5 space-y-4">
//               {/* Name */}
//               <div>
//                 <label className="block text-xs font-semibold text-gray-600 mb-1.5">
//                   Policy Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={form.name}
//                   onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
//                   placeholder="e.g. Standard Office Policy"
//                   className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all"
//                 />
//               </div>

//               {/* Numeric fields */}
//               <div className="grid grid-cols-3 gap-3">
//                 {[
//                   { label: 'Grace Period (min)', field: 'grace_period_minutes' as const },
//                   { label: 'Auto Checkout (hrs)', field: 'auto_checkout_hours' as const },
//                   { label: 'Max Regularization / mo', field: 'max_regularization_per_month' as const },
//                 ].map(({ label, field }) => (
//                   <div key={field}>
//                     <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
//                     <input
//                       type="number"
//                       min={0}
//                       value={form[field] as number}
//                       onChange={(e) => setNum(field, e.target.value)}
//                       className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all"
//                     />
//                   </div>
//                 ))}
//               </div>

//               {/* Sandwich policy toggle */}
//               <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs font-semibold text-gray-700">Sandwich Policy</p>
//                     <p className="text-[10px] text-gray-400 mt-0.5">Count intervening off-days as leave</p>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={() => setBool('sandwich_policy_enabled', !form.sandwich_policy_enabled)}
//                     className={`relative w-10 h-5 rounded-full transition-colors ${form.sandwich_policy_enabled ? 'bg-[#0f766e]' : 'bg-gray-300'}`}
//                   >
//                     <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.sandwich_policy_enabled ? 'translate-x-5' : 'translate-x-0'}`} />
//                   </button>
//                 </div>

//                 {form.sandwich_policy_enabled && (
//                   <div className="space-y-2 pt-1 border-t border-gray-200">
//                     {[
//                       { label: 'Include Week-off days', field: 'sandwich_include_weekoff' as const },
//                       { label: 'Include Public Holidays', field: 'sandwich_include_public_holiday' as const },
//                       { label: 'Include Company Holidays', field: 'sandwich_include_company_holiday' as const },
//                     ].map(({ label, field }) => (
//                       <div key={field} className="flex items-center justify-between">
//                         <span className="text-xs text-gray-600">{label}</span>
//                         <button
//                           type="button"
//                           onClick={() => setBool(field, !form[field])}
//                           className={`relative w-9 h-5 rounded-full transition-colors ${form[field] ? 'bg-[#0f766e]' : 'bg-gray-300'}`}
//                         >
//                           <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form[field] ? 'translate-x-4' : 'translate-x-0'}`} />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {error && (
//                 <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
//                   <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
//                   <p className="text-xs text-red-600 font-medium">{error}</p>
//                 </div>
//               )}

//               <div className="flex gap-3 pt-1">
//                 <button
//                   type="button"
//                   onClick={() => setShowModal(false)}
//                   className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handleSave}
//                   disabled={saving}
//                   className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0f766e] rounded-xl hover:bg-[#0d6460] transition-colors disabled:opacity-60"
//                 >
//                   {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : editingId ? 'Update Policy' : 'Create Policy'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }













'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Plus, Pencil, Trash2, X, Loader2, ShieldCheck, AlertCircle,
  CalendarDays, MapPin, Save, Check,
} from 'lucide-react';
import {
  getAttendancePolicies,
  createAttendancePolicy,
  updateAttendancePolicy,
  deleteAttendancePolicy,
  IAttendancePolicyPayload,
} from '@/lib/service/attendance';
import {
  getWorkSchedule,
  updateWorkSchedule,
  getWorkLocationSchedule,
  updateWorkLocationSchedule,
} from '@/lib/service/companyHoliday';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Policy extends IAttendancePolicyPayload {
  id: string;
  name: string;
}

type Tab = 'policies' | 'work-schedule' | 'work-location';

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday_week_1' | 'saturday_week_2' | 'saturday_week_3' | 'saturday_week_4' | 'saturday_week_5' | 'sunday';
type LocationDayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

interface WorkScheduleForm {
  name: string;
  description: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday_week_1: boolean;
  saturday_week_2: boolean;
  saturday_week_3: boolean;
  saturday_week_4: boolean;
  saturday_week_5: boolean;
  sunday: boolean;
}

type WorkLocationForm = Record<LocationDayKey, 'office' | 'wfh'>;

// ─── Constants ───────────────────────────────────────────────────────────────

const defaultPolicyForm: IAttendancePolicyPayload = {
  name: '',
  grace_period_minutes: 15,
  auto_checkout_hours: 12,
  max_regularization_per_month: 2,
  sandwich_policy_enabled: false,
  sandwich_include_weekoff: false,
  sandwich_include_public_holiday: false,
  sandwich_include_company_holiday: false,
};

const defaultWorkSchedule: WorkScheduleForm = {
  name: '',
  description: '',
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday_week_1: false,
  saturday_week_2: false,
  saturday_week_3: false,
  saturday_week_4: false,
  saturday_week_5: false,
  sunday: false,
};

const defaultWorkLocation: WorkLocationForm = {
  monday: 'office',
  tuesday: 'office',
  wednesday: 'office',
  thursday: 'office',
  friday: 'office',
  saturday: 'office',
};

const WEEKDAYS: { key: DayKey; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'sunday', label: 'Sunday' },
];

const SATURDAYS: { key: DayKey; label: string }[] = [
  { key: 'saturday_week_1', label: '1st Saturday' },
  { key: 'saturday_week_2', label: '2nd Saturday' },
  { key: 'saturday_week_3', label: '3rd Saturday' },
  { key: 'saturday_week_4', label: '4th Saturday' },
  { key: 'saturday_week_5', label: '5th Saturday' },
];

const LOCATION_DAYS: { key: LocationDayKey; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
];

// ─── Toggle ──────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-[#0f766e]' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AttendancePolicies() {
  const params = useParams();
  const subdomain = params?.subdomain as string;

  const [activeTab, setActiveTab] = useState<Tab>('policies');

  // ── Policies state ──
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<IAttendancePolicyPayload>(defaultPolicyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Work Schedule state ──
  const [wsForm, setWsForm] = useState<WorkScheduleForm>(defaultWorkSchedule);
  const [wsLoading, setWsLoading] = useState(false);
  const [wsSaving, setWsSaving] = useState(false);
  const [wsError, setWsError] = useState<string | null>(null);
  const [wsSaved, setWsSaved] = useState(false);

  // ── Work Location state ──
  const [wlForm, setWlForm] = useState<WorkLocationForm>(defaultWorkLocation);
  const [wlLoading, setWlLoading] = useState(false);
  const [wlSaving, setWlSaving] = useState(false);
  const [wlError, setWlError] = useState<string | null>(null);
  const [wlSaved, setWlSaved] = useState(false);

  // ─── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!subdomain) return;
    if (activeTab === 'policies') fetchPolicies();
    else if (activeTab === 'work-schedule') fetchWorkSchedule();
    else if (activeTab === 'work-location') fetchWorkLocation();
  }, [subdomain, activeTab]);

  // ─── Policies ──────────────────────────────────────────────────────────────

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
      sandwich_include_public_holiday: p.sandwich_include_public_holiday,
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

  const setNum = (field: keyof IAttendancePolicyPayload, val: string) =>
    setForm((prev) => ({ ...prev, [field]: Number(val) }));

  const setBool = (field: keyof IAttendancePolicyPayload, val: boolean) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  // ─── Work Schedule ─────────────────────────────────────────────────────────

  const fetchWorkSchedule = async () => {
    setWsLoading(true);
    setWsError(null);
    try {
      const res = await getWorkSchedule(subdomain);
      const data = res?.data?.data ?? res?.data;
      if (data?.schedule) {
        setWsForm({
          name: data.name ?? '',
          description: data.description ?? '',
          ...data.schedule,
        });
      }
    } catch {
      setWsError('Failed to load work schedule.');
    } finally {
      setWsLoading(false);
    }
  };

  const handleSaveWorkSchedule = async () => {
    setWsSaving(true);
    setWsError(null);
    setWsSaved(false);
    try {
      await updateWorkSchedule(wsForm, subdomain);
      setWsSaved(true);
      setTimeout(() => setWsSaved(false), 2500);
    } catch (e: any) {
      setWsError(e?.response?.data?.message || 'Failed to save work schedule.');
    } finally {
      setWsSaving(false);
    }
  };

  const toggleWsDay = (key: DayKey) =>
    setWsForm((prev) => ({ ...prev, [key]: !prev[key] }));

  // ─── Work Location ─────────────────────────────────────────────────────────

  const fetchWorkLocation = async () => {
    setWlLoading(true);
    setWlError(null);
    try {
      const res = await getWorkLocationSchedule(subdomain);
      const schedule = res?.data?.data?.schedule ?? res?.data?.schedule;
      if (schedule) {
        setWlForm({
          monday: schedule.monday ?? 'office',
          tuesday: schedule.tuesday ?? 'office',
          wednesday: schedule.wednesday ?? 'office',
          thursday: schedule.thursday ?? 'office',
          friday: schedule.friday ?? 'office',
          saturday: schedule.saturday ?? 'office',
        });
      }
    } catch {
      setWlError('Failed to load work location schedule.');
    } finally {
      setWlLoading(false);
    }
  };

  const handleSaveWorkLocation = async () => {
    setWlSaving(true);
    setWlError(null);
    setWlSaved(false);
    try {
      await updateWorkLocationSchedule(wlForm, subdomain);
      setWlSaved(true);
      setTimeout(() => setWlSaved(false), 2500);
    } catch (e: any) {
      setWlError(e?.response?.data?.message || 'Failed to save work location schedule.');
    } finally {
      setWlSaving(false);
    }
  };

  const toggleLocation = (key: LocationDayKey) =>
    setWlForm((prev) => ({ ...prev, [key]: prev[key] === 'office' ? 'wfh' : 'office' }));

  // ─── Render ────────────────────────────────────────────────────────────────

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'policies', label: 'Attendance Policies', icon: <ShieldCheck size={14} /> },
    { key: 'work-schedule', label: 'Work Schedule', icon: <CalendarDays size={14} /> },
    { key: 'work-location', label: 'Work Location', icon: <MapPin size={14} /> },
  ];

  return (
    <div className="space-y-5 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0f1f2e]">Attendance Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage policies, schedules and work locations</p>
        </div>
        {activeTab === 'policies' && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0d6460] transition-colors"
          >
            <Plus size={15} /> Add Policy
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === t.key
                ? 'bg-white text-[#0f766e] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Attendance Policies ── */}
      {activeTab === 'policies' && (
        <>
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
                <div key={p.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
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
                        {p.sandwich_include_public_holiday && <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-500">Public Holiday</span>}
                        {p.sandwich_include_company_holiday && <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-500">Company Holiday</span>}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Tab: Work Schedule ── */}
      {activeTab === 'work-schedule' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-[#e8f5ee] flex items-center justify-center">
              <CalendarDays size={15} className="text-[#2D7A4F]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0f1f2e]">Work Schedule</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Define which days are working days</p>
            </div>
          </div>

          {wsLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={22} className="animate-spin text-[#0f766e]" />
            </div>
          ) : (
            <div className="p-5 space-y-5">
              {/* Name & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Schedule Name</label>
                  <input
                    type="text"
                    value={wsForm.name}
                    onChange={(e) => setWsForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Standard 5-Day Week"
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
                  <input
                    type="text"
                    value={wsForm.description}
                    onChange={(e) => setWsForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="e.g. Monday to Friday working days"
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all"
                  />
                </div>
              </div>

              {/* Weekdays */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-700">Weekdays</p>
                <div className="space-y-2.5">
                  {WEEKDAYS.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{wsForm[key] ? 'Working' : 'Off'}</span>
                        <Toggle checked={!!wsForm[key]} onChange={() => toggleWsDay(key)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Saturdays */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-700">Saturdays</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SATURDAYS.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-gray-100">
                      <span className="text-sm text-gray-700">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{wsForm[key] ? 'Working' : 'Off'}</span>
                        <Toggle checked={!!wsForm[key]} onChange={() => toggleWsDay(key)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary badges */}
              {(wsForm.monday || wsForm.tuesday || wsForm.wednesday || wsForm.thursday || wsForm.friday ||
                wsForm.saturday_week_1 || wsForm.saturday_week_2 || wsForm.saturday_week_3 ||
                wsForm.saturday_week_4 || wsForm.saturday_week_5 || wsForm.sunday) && (
                <div className="rounded-xl border border-[#e8f5ee] bg-[#f6fcf9] p-3 space-y-1.5">
                  <p className="text-[10px] font-semibold text-[#2D7A4F] uppercase tracking-wide">Working Days</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[...WEEKDAYS, ...SATURDAYS]
                      .filter(({ key }) => wsForm[key])
                      .map(({ key, label }) => (
                        <span key={key} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#e8f5ee] text-[#2D7A4F]">{label}</span>
                      ))}
                  </div>
                </div>
              )}

              {wsError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-600 font-medium">{wsError}</p>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleSaveWorkSchedule}
                  disabled={wsSaving}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0f766e] rounded-xl hover:bg-[#0d6460] transition-colors disabled:opacity-60"
                >
                  {wsSaving ? (
                    <><Loader2 size={14} className="animate-spin" /> Saving...</>
                  ) : wsSaved ? (
                    <><Check size={14} /> Saved</>
                  ) : (
                    <><Save size={14} /> Save Schedule</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Work Location ── */}
      {activeTab === 'work-location' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-[#e8f5ee] flex items-center justify-center">
              <MapPin size={15} className="text-[#2D7A4F]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0f1f2e]">Work Location Schedule</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Set office or WFH for each day of the week</p>
            </div>
          </div>

          {wlLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={22} className="animate-spin text-[#0f766e]" />
            </div>
          ) : (
            <div className="p-5 space-y-4">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2.5">
                {LOCATION_DAYS.map(({ key, label }) => {
                  const isOffice = wlForm[key] === 'office';
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{label}</span>
                      <div className="flex items-center gap-3">
                        <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => setWlForm((p) => ({ ...p, [key]: 'office' }))}
                            className={`px-3 py-1.5 transition-colors ${isOffice ? 'bg-[#0f766e] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                          >
                            Office
                          </button>
                          <button
                            type="button"
                            onClick={() => setWlForm((p) => ({ ...p, [key]: 'wfh' }))}
                            className={`px-3 py-1.5 transition-colors ${!isOffice ? 'bg-[#0f766e] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                          >
                            WFH
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-3">
                {(['office', 'wfh'] as const).map((type) => {
                  const days = LOCATION_DAYS.filter(({ key }) => wlForm[key] === type).map((d) => d.label);
                  return (
                    <div key={type} className={`rounded-xl p-3 border ${type === 'office' ? 'bg-[#f6fcf9] border-[#e8f5ee]' : 'bg-blue-50 border-blue-100'}`}>
                      <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1.5 ${type === 'office' ? 'text-[#2D7A4F]' : 'text-blue-600'}`}>
                        {type === 'office' ? '🏢 Office' : '🏠 WFH'}
                      </p>
                      {days.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {days.map((d) => (
                            <span key={d} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${type === 'office' ? 'bg-[#e8f5ee] text-[#2D7A4F]' : 'bg-blue-100 text-blue-600'}`}>{d}</span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">None</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {wlError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-600 font-medium">{wlError}</p>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleSaveWorkLocation}
                  disabled={wlSaving}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0f766e] rounded-xl hover:bg-[#0d6460] transition-colors disabled:opacity-60"
                >
                  {wlSaving ? (
                    <><Loader2 size={14} className="animate-spin" /> Saving...</>
                  ) : wlSaved ? (
                    <><Check size={14} /> Saved</>
                  ) : (
                    <><Save size={14} /> Save Location</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Policy Modal ── */}
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
                      { label: 'Include Public Holidays', field: 'sandwich_include_public_holiday' as const },
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
                  {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : editingId ? 'Update Policy' : 'Create Policy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}