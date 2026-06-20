// 'use client';

// import { useEffect, useState, useMemo } from 'react';
// import { useParams } from 'next/navigation';
// import {
//   CheckCircle2, XCircle, Clock, Loader2, X, AlertCircle,
//   Search, FileText,
// } from 'lucide-react';
// import {
//   getRegularizations, reviewRegularization,
//   IRegularization, RegularizationStatus, IReviewRegularizationPayload,
// } from '@/lib/service/regularization';
// import { regularizeAttendance, IRegularizeAttendancePayload } from '@/lib/service/attendance';

// const STATUS_META: Record<RegularizationStatus, { label: string; bg: string; text: string; dot: string; border: string; icon: any }> = {
//   [RegularizationStatus.PENDING]:  { label: 'Pending',  bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400',  border: 'border-amber-200',  icon: Clock },
//   [RegularizationStatus.APPROVED]: { label: 'Approved', bg: 'bg-teal-50',   text: 'text-teal-700',   dot: 'bg-teal-500',   border: 'border-teal-200',   icon: CheckCircle2 },
//   [RegularizationStatus.REJECTED]: { label: 'Rejected', bg: 'bg-red-50',    text: 'text-red-600',    dot: 'bg-red-400',    border: 'border-red-200',    icon: XCircle },
// };

// function fmtDate(iso: string) {
//   const d = new Date(iso);
//   return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
// }

// function fmtTime(iso: string | null) {
//   if (!iso) return '—';
//   const d = new Date(iso);
//   return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
// }

// function ReviewDrawer({ req, onClose, onDone }: { req: IRegularization; onClose: () => void; onDone: () => void }) {
//   const params = useParams();
//   const subdomain = params?.subdomain as string;
//   const [action, setAction] = useState<'approved' | 'rejected'>('approved');
//   const [rejectionReason, setRejectionReason] = useState('');
//   const [saving, setSaving] = useState(false);
//   const [err, setErr] = useState('');
//   const meta = STATUS_META[req.status];
//   const employeeName = req.employee_name || req.employee?.name || `${req.employee?.first_name} ${req.employee?.last_name}`.trim() || 'Employee';

//   const handleSubmit = async () => {
//     if (action === 'rejected' && !rejectionReason.trim()) {
//       setErr('Rejection reason is required');
//       return;
//     }
//     setSaving(true);
//     setErr('');
//     try {
//       if (action === 'approved') {
//         // First, regularize the attendance record
//         const regularizePayload: IRegularizeAttendancePayload = {
//           check_in_time: req.requested_check_in || req.original_check_in || '',
//           check_out_time: req.requested_check_out || req.original_check_out || undefined,
//           regularization_request_id: req.id,
//           remarks: req.remarks || 'Approved by manager',
//         };
//         await regularizeAttendance(req.attendance_log_id, regularizePayload, subdomain);
//       }

//       // Then update the regularization request status
//       const payload: IReviewRegularizationPayload = {
//         status: action,
//         ...(action === 'rejected' ? { rejection_reason: rejectionReason } : {}),
//       };
//       await reviewRegularization(req.id, payload, subdomain);
//       onDone();
//     } catch (e: any) {
//       setErr(e?.response?.data?.message || 'Something went wrong.');
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex">
//       <div className="flex-1 bg-black/30" onClick={onClose} />
//       <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-y-auto">
//         <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
//           <h2 className="text-sm font-bold text-[#0f1f2e]">Review Regularization Request</h2>
//           <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
//             <X size={15} />
//           </button>
//         </div>
//         <div className="px-5 py-4 border-b border-gray-50">
//           <div className="mb-4">
//             <p className="text-sm font-bold text-[#0f1f2e]">{employeeName}</p>
//             <p className="text-[10px] text-gray-400 mt-0.5">
//               {req.employee_code && `${req.employee_code} • `}
//               {fmtDate(req.attendance_date)}
//             </p>
//             <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-2 ${meta.bg} ${meta.text}`}>
//               <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
//               {meta.label}
//             </span>
//           </div>
//           <div className="space-y-2">
//             <div className="bg-gray-50 rounded-xl px-3 py-2">
//               <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wide">Original Times</p>
//               <p className="text-xs font-bold text-gray-600 mt-0.5">
//                 {fmtTime(req.original_check_in)} – {fmtTime(req.original_check_out)}
//               </p>
//             </div>
//             <div className="bg-teal-50 rounded-xl px-3 py-2 border border-teal-200">
//               <p className="text-[9px] text-teal-600 font-medium uppercase tracking-wide">Requested Times</p>
//               <p className="text-xs font-bold text-teal-700 mt-0.5">
//                 {fmtTime(req.requested_check_in)} – {fmtTime(req.requested_check_out)}
//               </p>
//             </div>
//             <div className="bg-gray-50 rounded-xl px-3 py-2">
//               <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wide">Submitted On</p>
//               <p className="text-xs font-bold text-gray-600 mt-0.5">{fmtDate(req.created_at)}</p>
//             </div>
//           </div>
//           {req.remarks && (
//             <div className="mt-2 bg-gray-50 rounded-xl px-3 py-2">
//               <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Remarks</p>
//               <p className="text-xs text-gray-600">{req.remarks}</p>
//             </div>
//           )}
//         </div>
//         {req.status === RegularizationStatus.PENDING && (
//           <div className="px-5 py-4 space-y-4 flex-1">
//             <div className="grid grid-cols-2 gap-2">
//               {(['approved', 'rejected'] as const).map(a => (
//                 <button
//                   key={a}
//                   onClick={() => setAction(a)}
//                   className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all ${
//                     action === a
//                       ? a === 'approved'
//                         ? 'bg-teal-50 text-teal-700 border-teal-300'
//                         : 'bg-red-50 text-red-600 border-red-300'
//                       : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300'
//                   }`}
//                 >
//                   {a === 'approved' ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
//                   {a === 'approved' ? 'Approve' : 'Reject'}
//                 </button>
//               ))}
//             </div>
//             {action === 'rejected' && (
//               <div>
//                 <label className="block text-xs font-semibold text-gray-600 mb-1.5">
//                   Rejection Reason <span className="text-red-500">*</span>
//                 </label>
//                 <textarea
//                   value={rejectionReason}
//                   onChange={e => setRejectionReason(e.target.value)}
//                   rows={3}
//                   placeholder="Enter reason for rejection..."
//                   className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all resize-none"
//                 />
//               </div>
//             )}
//             {err && (
//               <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
//                 <AlertCircle size={13} className="text-red-500 mt-0.5 flex-shrink-0" />
//                 <p className="text-xs text-red-600">{err}</p>
//               </div>
//             )}
//             <button
//               onClick={handleSubmit}
//               disabled={saving}
//               className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-60 ${
//                 action === 'approved' ? 'bg-[#0f766e] hover:bg-[#0d6460]' : 'bg-red-500 hover:bg-red-600'
//               }`}
//             >
//               {saving ? (
//                 <>
//                   <Loader2 size={14} className="animate-spin" /> Submitting...
//                 </>
//               ) : action === 'approved' ? (
//                 <>
//                   <CheckCircle2 size={14} /> Approve Request
//                 </>
//               ) : (
//                 <>
//                   <XCircle size={14} /> Reject Request
//                 </>
//               )}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function RequestRow({ req, onSelect }: { req: IRegularization; onSelect: () => void }) {
//   const meta = STATUS_META[req.status];
//   const Icon = meta.icon;
//   const employeeName = req.employee?.name || `${req.employee?.first_name} ${req.employee?.last_name}`.trim() || 'Employee';

//   return (
//     <div
//       onClick={onSelect}
//       className="group flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0"
//     >
//       <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
//         {employeeName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
//       </div>
//       <div className="flex-1 min-w-0">
//         <div className="flex items-center gap-2 flex-wrap">
//           <span className="text-sm font-semibold text-[#0f1f2e] truncate">{employeeName}</span>
//           <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${meta.bg} ${meta.text} ${meta.border}`}>
//             <Icon size={10} />
//             <span className="ml-0.5">{meta.label}</span>
//           </span>
//         </div>
//         <div className="flex items-center gap-2 mt-1 flex-wrap">
//           <span className="text-[10px] text-gray-500 font-medium">
//             {req.attendanceLog?.attendance_date ? fmtDate(req.attendanceLog.attendance_date) : fmtDate(req.attendance_date)}
//           </span>
//           <span className="text-gray-300">·</span>
//           <span className="text-[10px] text-gray-500">
//             {fmtTime(req.requested_check_in)} – {fmtTime(req.requested_check_out)}
//           </span>
//         </div>
//       </div>
//       <span className="text-[10px] text-gray-400 group-hover:text-[#0f766e] transition-colors flex-shrink-0 hidden sm:block">
//         View →
//       </span>
//     </div>
//   );
// }

// export default function TeamRegularization({ teamIds }: { teamIds: string[] }) {
//   const params = useParams();
//   const subdomain = params?.subdomain as string;
//   const [requests, setRequests] = useState<IRegularization[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState<RegularizationStatus | 'ALL'>('ALL');
//   const [selectedRequest, setSelectedRequest] = useState<IRegularization | null>(null);

//   useEffect(() => {
//     if (subdomain && teamIds.length > 0) fetchRequests();
//   }, [subdomain, teamIds]);

//   const fetchRequests = async () => {
//     setLoading(true);
//     try {
//       const res = await getRegularizations(subdomain, { limit: 100 });
//       const raw = Array.isArray(res?.data) ? res.data : res?.data?.data ?? [];
//       const teamRequests = raw.filter((r: IRegularization) => teamIds.includes(r.employee_id));
//       setRequests(teamRequests);
//     } catch {
//       /* silent */
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filtered = useMemo(() => {
//     let list = requests;
//     if (statusFilter !== 'ALL') list = list.filter(r => r.status === statusFilter);
//     if (search.trim()) {
//       const q = search.toLowerCase();
//       list = list.filter(
//         r =>
//           r.employee?.name?.toLowerCase().includes(q) ||
//           r.employee?.first_name?.toLowerCase().includes(q) ||
//           r.employee?.last_name?.toLowerCase().includes(q) ||
//           r.employee?.employee_code?.toLowerCase().includes(q) ||
//           r.remarks?.toLowerCase().includes(q)
//       );
//     }
//     return list;
//   }, [requests, statusFilter, search]);

//   const stats = useMemo(
//     () => ({
//       total: requests.length,
//       pending: requests.filter(r => r.status === RegularizationStatus.PENDING).length,
//       approved: requests.filter(r => r.status === RegularizationStatus.APPROVED).length,
//       rejected: requests.filter(r => r.status === RegularizationStatus.REJECTED).length,
//     }),
//     [requests]
//   );

//   return (
//     <div className="space-y-4">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//         <p className="text-xs text-gray-400">
//           {stats.total} requests · {stats.pending} pending approval
//         </p>
//         <div className="flex items-center gap-2 flex-wrap">
//           <div className="relative">
//             <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
//             <input
//               value={search}
//               onChange={e => setSearch(e.target.value)}
//               placeholder="Search..."
//               className="pl-7 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all w-36"
//             />
//           </div>
//           <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
//             {(['ALL', RegularizationStatus.PENDING, RegularizationStatus.APPROVED, RegularizationStatus.REJECTED] as const).map(s => (
//               <button
//                 key={s}
//                 onClick={() => setStatusFilter(s)}
//                 className={`px-2 py-1 text-[9px] font-bold rounded-lg transition-colors capitalize ${
//                   statusFilter === s ? 'bg-white text-[#0f766e] shadow-sm' : 'text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 {s === 'ALL' ? 'All' : STATUS_META[s].label}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-4 gap-2">
//         {[
//           { label: 'Total', value: stats.total, color: 'text-[#0f766e]', bg: 'bg-[#e8f5ee]', dot: 'bg-[#0f766e]' },
//           { label: 'Pending', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-400' },
//           { label: 'Approved', value: stats.approved, color: 'text-teal-600', bg: 'bg-teal-50', dot: 'bg-teal-500' },
//           { label: 'Rejected', value: stats.rejected, color: 'text-red-500', bg: 'bg-red-50', dot: 'bg-red-400' },
//         ].map(s => (
//           <div key={s.label} className={`${s.bg} rounded-xl px-3 py-2 border border-gray-100`}>
//             <div className="flex items-center gap-1.5 mb-1">
//               <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
//               <p className="text-[9px] font-bold text-gray-500 uppercase">{s.label}</p>
//             </div>
//             <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
//           </div>
//         ))}
//       </div>

//       {loading ? (
//         <div className="flex justify-center py-12">
//           <Loader2 size={20} className="animate-spin text-[#0f766e]" />
//         </div>
//       ) : filtered.length === 0 ? (
//         <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl border border-gray-100">
//           <FileText size={28} className="text-gray-200 mb-2" />
//           <p className="text-sm font-semibold text-gray-400">No regularization requests</p>
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
//           {[RegularizationStatus.PENDING, RegularizationStatus.APPROVED, RegularizationStatus.REJECTED].map(status => {
//             const group = filtered.filter(r => r.status === status);
//             if (!group.length) return null;
//             const meta = STATUS_META[status];
//             return (
//               <div key={status}>
//                 <div className={`px-4 py-2 flex items-center justify-between ${meta.bg} border-b ${meta.border}`}>
//                   <div className="flex items-center gap-2">
//                     <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
//                     <span className={`text-[10px] font-bold uppercase tracking-wide ${meta.text}`}>{meta.label}</span>
//                   </div>
//                   <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/60 ${meta.text}`}>
//                     {group.length}
//                   </span>
//                 </div>
//                 {group.map(req => (
//                   <RequestRow key={req.id} req={req} onSelect={() => setSelectedRequest(req)} />
//                 ))}
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {selectedRequest && (
//         <ReviewDrawer
//           req={selectedRequest}
//           onClose={() => setSelectedRequest(null)}
//           onDone={() => {
//             setSelectedRequest(null);
//             fetchRequests();
//           }}
//         />
//       )}
//     </div>
//   );
// }

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  CheckCircle2, XCircle, Clock, Loader2, X, AlertCircle,
  Search, FileText,
} from 'lucide-react';
import {
  getRegularizations, reviewRegularization,
  IRegularization, RegularizationStatus, IReviewRegularizationPayload,
  getTeamRegularizations,
} from '@/lib/service/regularization';
import { regularizeAttendance, IRegularizeAttendancePayload } from '@/lib/service/attendance';

const STATUS_META: Record<RegularizationStatus, { label: string; bg: string; text: string; dot: string; border: string; icon: any }> = {
  [RegularizationStatus.PENDING]: {
    label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', border: 'border-amber-200', icon: Clock,
  },
  [RegularizationStatus.APPROVED]: {
    label: 'Approved', bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-500', border: 'border-teal-200', icon: CheckCircle2,
  },
  [RegularizationStatus.REJECTED]: {
    label: 'Rejected', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400', border: 'border-red-200', icon: XCircle,
  },
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtTime(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// Robust employee name/code extraction
function getEmployeeName(req: IRegularization) {
  if (req.employee_name && typeof req.employee_name === 'string' && req.employee_name.trim()) {
    return req.employee_name.trim();
  }
  if (req.employee?.name && typeof req.employee.name === 'string' && req.employee.name.trim()) {
    return req.employee.name.trim();
  }
  if (req.employee?.first_name || req.employee?.last_name) {
    const full = `${req.employee.first_name || ''} ${req.employee.last_name || ''}`.trim();
    if (full) return full;
  }
  return 'Employee';
}

function getEmployeeCode(req: IRegularization) {
  return req.employee_code || req.employee?.employee_code || '';
}

function ReviewDrawer({ req, onClose, onDone }: { req: IRegularization; onClose: () => void; onDone: () => void }) {
  const params = useParams();
  const subdomain = params?.subdomain as string;
  const [action, setAction] = useState<'approved' | 'rejected'>('approved');
  const [rejectionReason, setRejectionReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const meta = STATUS_META[req.status];

  const employeeName = getEmployeeName(req);
  const employeeCode = getEmployeeCode(req);

  const handleSubmit = async () => {
    if (action === 'rejected' && !rejectionReason.trim()) {
      setErr('Rejection reason is required');
      return;
    }
    setSaving(true);
    setErr('');
    try {
      if (action === 'approved') {
        const regularizePayload: IRegularizeAttendancePayload = {
          check_in_time: req.requested_check_in || req.original_check_in || '',
          check_out_time: req.requested_check_out || req.original_check_out || undefined,
          regularization_request_id: req.id,
          remarks: req.remarks || 'Approved by manager',
        };
        await regularizeAttendance(req.attendance_log_id, regularizePayload, subdomain);
      }

      const payload: IReviewRegularizationPayload = {
        status: action,
        ...(action === 'rejected' ? { rejection_reason: rejectionReason } : {}),
      };
      await reviewRegularization(req.id, payload, subdomain);
      onDone();
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-[#0f1f2e]">Review Regularization Request</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="px-5 py-4 border-b border-gray-50">
          <div className="mb-4">
            <p className="text-sm font-bold text-[#0f1f2e]">{employeeName}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {employeeCode && `${employeeCode} • `}
              {fmtDate(req.attendance_date)}
            </p>
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-2 ${meta.bg} ${meta.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
              {meta.label}
            </span>
          </div>
          <div className="space-y-2">
            <div className="bg-gray-50 rounded-xl px-3 py-2">
              <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wide">Original Times</p>
              <p className="text-xs font-bold text-gray-600 mt-0.5">
                {fmtTime(req.original_check_in)}
                {' '}
                –
                {fmtTime(req.original_check_out)}
              </p>
            </div>
            <div className="bg-teal-50 rounded-xl px-3 py-2 border border-teal-200">
              <p className="text-[9px] text-teal-600 font-medium uppercase tracking-wide">Requested Times</p>
              <p className="text-xs font-bold text-teal-700 mt-0.5">
                {fmtTime(req.requested_check_in)}
                {' '}
                –
                {fmtTime(req.requested_check_out)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl px-3 py-2">
              <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wide">Submitted On</p>
              <p className="text-xs font-bold text-gray-600 mt-0.5">{fmtDate(req.created_at)}</p>
            </div>
          </div>
          {req.remarks && (
            <div className="mt-2 bg-gray-50 rounded-xl px-3 py-2">
              <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Remarks</p>
              <p className="text-xs text-gray-600">{req.remarks}</p>
            </div>
          )}
          {req.status !== RegularizationStatus.PENDING && req.reviewed_by_name && (
            <div className="mt-2 bg-gray-50 rounded-xl px-3 py-2">
              <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Reviewed By</p>
              <p className="text-xs text-gray-600">
                {req.reviewed_by_name}
                {req.reviewed_at && ` • ${fmtDate(req.reviewed_at)}`}
              </p>
              {req.status === RegularizationStatus.REJECTED && req.rejection_reason && (
                <p className="text-xs text-red-500 mt-1">{req.rejection_reason}</p>
              )}
            </div>
          )}
        </div>
        {req.status === RegularizationStatus.PENDING && (
          <div className="px-5 py-4 space-y-4 flex-1">
            <div className="grid grid-cols-2 gap-2">
              {(['approved', 'rejected'] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAction(a)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    action === a
                      ? a === 'approved'
                        ? 'bg-teal-50 text-teal-700 border-teal-300'
                        : 'bg-red-50 text-red-600 border-red-300'
                      : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {a === 'approved' ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                  {a === 'approved' ? 'Approve' : 'Reject'}
                </button>
              ))}
            </div>
            {action === 'rejected' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Rejection Reason
                  {' '}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  placeholder="Enter reason for rejection..."
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all resize-none"
                />
              </div>
            )}
            {err && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                <AlertCircle size={13} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-600">{err}</p>
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={saving}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-60 ${
                action === 'approved' ? 'bg-[#0f766e] hover:bg-[#0d6460]' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {' '}
                  Submitting...
                </>
              ) : action === 'approved' ? (
                <>
                  <CheckCircle2 size={14} />
                  {' '}
                  Approve Request
                </>
              ) : (
                <>
                  <XCircle size={14} />
                  {' '}
                  Reject Request
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function RequestRow({ req, onSelect }: { req: IRegularization; onSelect: () => void }) {
  const meta = STATUS_META[req.status];
  const Icon = meta.icon;
  const employeeName = getEmployeeName(req);
  const employeeCode = getEmployeeCode(req);

  return (
    <div
      onClick={onSelect}
      className="group flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0"
    >
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
        {employeeName.split(' ').map((w) => w[0]).join('').slice(0, 2)
          .toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-[#0f1f2e] truncate">{employeeName}</span>
          <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${meta.bg} ${meta.text} ${meta.border}`}>
            <Icon size={10} />
            <span className="ml-0.5">{meta.label}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {employeeCode && (
            <>
              <span className="text-[10px] text-gray-500 font-medium">{employeeCode}</span>
              <span className="text-gray-300">·</span>
            </>
          )}
          <span className="text-[10px] text-gray-500 font-medium">
            {req.attendance_date ? fmtDate(req.attendance_date) : (req.attendanceLog?.attendance_date ? fmtDate(req.attendanceLog.attendance_date) : 'N/A')}
          </span>
          <span className="text-gray-300">·</span>
          <span className="text-[10px] text-gray-500">
            {fmtTime(req.requested_check_in)}
            {' '}
            –
            {fmtTime(req.requested_check_out)}
          </span>
        </div>
      </div>
      <span className="text-[10px] text-gray-400 group-hover:text-[#0f766e] transition-colors flex-shrink-0 hidden sm:block">
        View →
      </span>
    </div>
  );
}

export default function TeamRegularization() {
  const params = useParams();
  const subdomain = params?.subdomain as string;
  const [requests, setRequests] = useState<IRegularization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RegularizationStatus | 'ALL'>('ALL');
  const [selectedRequest, setSelectedRequest] = useState<IRegularization | null>(null);

  useEffect(() => {
    if (subdomain) fetchRequests();
  }, [subdomain]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await getTeamRegularizations(subdomain, { limit: 100 });
      const raw = Array.isArray(res?.data) ? res.data : res?.data?.data ?? [];
      setRequests(raw);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = requests;
    if (statusFilter !== 'ALL') list = list.filter((r) => r.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) => r.employee_name?.toLowerCase().includes(q)
          || r.employee_code?.toLowerCase().includes(q)
          || r.employee?.employee_code?.toLowerCase().includes(q)
          || r.employee?.name?.toLowerCase().includes(q)
          || r.remarks?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [requests, statusFilter, search]);

  const stats = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((r) => r.status === RegularizationStatus.PENDING).length,
      approved: requests.filter((r) => r.status === RegularizationStatus.APPROVED).length,
      rejected: requests.filter((r) => r.status === RegularizationStatus.REJECTED).length,
    }),
    [requests],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-gray-400">
          {stats.total}
          {' '}
          requests ·
          {stats.pending}
          {' '}
          pending approval
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-7 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all w-36"
            />
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {(['ALL', RegularizationStatus.PENDING, RegularizationStatus.APPROVED, RegularizationStatus.REJECTED] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2 py-1 text-[9px] font-bold rounded-lg transition-colors capitalize ${
                  statusFilter === s ? 'bg-white text-[#0f766e] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {s === 'ALL' ? 'All' : STATUS_META[s].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          {
            label: 'Total', value: stats.total, color: 'text-[#0f766e]', bg: 'bg-[#e8f5ee]', dot: 'bg-[#0f766e]',
          },
          {
            label: 'Pending', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-400',
          },
          {
            label: 'Approved', value: stats.approved, color: 'text-teal-600', bg: 'bg-teal-50', dot: 'bg-teal-500',
          },
          {
            label: 'Rejected', value: stats.rejected, color: 'text-red-500', bg: 'bg-red-50', dot: 'bg-red-400',
          },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl px-3 py-2 border border-gray-100`}>
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              <p className="text-[9px] font-bold text-gray-500 uppercase">{s.label}</p>
            </div>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={20} className="animate-spin text-[#0f766e]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl border border-gray-100">
          <FileText size={28} className="text-gray-200 mb-2" />
          <p className="text-sm font-semibold text-gray-400">No regularization requests</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {[RegularizationStatus.PENDING, RegularizationStatus.APPROVED, RegularizationStatus.REJECTED].map((status) => {
            const group = filtered.filter((r) => r.status === status);
            if (!group.length) return null;
            const meta = STATUS_META[status];
            return (
              <div key={status}>
                <div className={`px-4 py-2 flex items-center justify-between ${meta.bg} border-b ${meta.border}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wide ${meta.text}`}>{meta.label}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/60 ${meta.text}`}>
                    {group.length}
                  </span>
                </div>
                {group.map((req) => (
                  <RequestRow key={req.id} req={req} onSelect={() => setSelectedRequest(req)} />
                ))}
              </div>
            );
          })}
        </div>
      )}

      {selectedRequest && (
        <ReviewDrawer
          req={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onDone={() => {
            setSelectedRequest(null);
            fetchRequests();
          }}
        />
      )}
    </div>
  );
}
