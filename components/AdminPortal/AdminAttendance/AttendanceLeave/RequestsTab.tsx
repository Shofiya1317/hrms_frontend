'use client';

import { Filter, Search, CalendarDays, CheckCircle2, XCircle, Clock3 } from 'lucide-react';

const LEAVE_REQUESTS = [
  { id: 1, name: 'Rohit Gupta',  type: 'Annual Leave', from: '22 Mar', to: '24 Mar', days: 3, status: 'pending',  reason: 'Family vacation',  avatar: 'RG', color: 'bg-teal-500' },
  { id: 2, name: 'Sneha Reddy',  type: 'Sick Leave',   from: '18 Mar', to: '21 Mar', days: 4, status: 'approved', reason: 'Medical treatment', avatar: 'SR', color: 'bg-rose-500' },
  { id: 3, name: 'Kavya Menon',  type: 'Casual Leave', from: '25 Mar', to: '25 Mar', days: 1, status: 'pending',  reason: 'Personal work',    avatar: 'KM', color: 'bg-amber-500' },
  { id: 4, name: 'Arjun Mehta',  type: 'Annual Leave', from: '01 Apr', to: '03 Apr', days: 3, status: 'rejected', reason: 'Travel plans',      avatar: 'AM', color: 'bg-indigo-500' },
];

const statusConfig = {
  pending:  { label: 'Pending',  cls: 'bg-amber-50 text-amber-700 border border-amber-200',   dot: 'bg-amber-400',  icon: Clock3 },
  approved: { label: 'Approved', cls: 'bg-teal-50 text-teal-700 border border-teal-200',       dot: 'bg-teal-400',   icon: CheckCircle2 },
  rejected: { label: 'Rejected', cls: 'bg-red-50 text-red-600 border border-red-200',          dot: 'bg-red-400',    icon: XCircle },
};

export default function RequestsTab() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Leave requests</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {LEAVE_REQUESTS.length} total · {LEAVE_REQUESTS.filter(r => r.status === 'pending').length} awaiting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-lg transition-colors">
            <Filter size={12} /> Filter
          </button>
          <button className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-lg transition-colors">
            <Search size={12} /> Search
          </button>
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {LEAVE_REQUESTS.map(req => {
          const sc = statusConfig[req.status as keyof typeof statusConfig];
          return (
            <div key={req.id} className="group px-4 py-4 hover:bg-slate-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-lg ${req.color} flex items-center justify-center flex-shrink-0 text-white text-xs font-bold shadow-sm`}>
                    {req.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-slate-900">{req.name}</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${sc.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                        <CalendarDays size={12} /> {req.type}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md">
                        {req.from} – {req.to}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded-md">
                        {req.days}d
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">"{req.reason}"</p>
                  </div>
                </div>
                {req.status === 'pending' && (
                  <div className="flex sm:flex-col gap-2 mt-3 sm:mt-0">
                    <button className="flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-[#0f766e] hover:bg-teal-700 px-3 py-2 rounded-lg transition-all">
                      <CheckCircle2 size={13} /> Approve
                    </button>
                    <button className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-all">
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}