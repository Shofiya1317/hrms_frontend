'use client';

import { useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, Calendar } from 'lucide-react';
import RequestsTab  from './RequestsTab';
import BalancesTab  from './BalancesTab';
import HolidaysTab  from './HolidaysTab';
import LeaveTypesTab from './LeaveTypesTab';
import LeavePolicyTab from './LeavePolicy';

const TABS = ['Requests', 'Leave Types', 'Balances', 'Holidays','Leave policy',] as const;
type Tab = typeof TABS[number];

const SUMMARY_DATA = [
  { label: 'Total Requests', value: 4, icon: CalendarDays, bg: 'bg-indigo-50', text: 'text-indigo-600' },
  { label: 'Pending',        value: 2, icon: Clock3,       bg: 'bg-amber-50',  text: 'text-amber-600' },
  { label: 'Approved',       value: 1, icon: CheckCircle2, bg: 'bg-teal-50',   text: 'text-teal-600' },
  { label: 'Holidays 2026',  value: 8, icon: Calendar,     bg: 'bg-blue-50',   text: 'text-blue-600' },
];

// function SummaryStrip() {
//   return (
//     <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//       {SUMMARY_DATA.map(c => (
//         <div key={c.label} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-all">
//           <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
//             <c.icon size={18} className={c.text} />
//           </div>
//           <div>
//             <p className="text-2xl font-bold text-slate-900">{c.value}</p>
//             <p className="text-xs text-slate-500 font-medium">{c.label}</p>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

interface AttendanceLeaveProps {
  apiKey: string;
  token?: string;
}

export default function AttendanceLeave({ apiKey, token }: AttendanceLeaveProps) {
  const [subTab, setSubTab] = useState<Tab>('Requests');

  return (
    <div className="min-h-screen">
      <div className="space-y-4 p-3 sm:p-4 lg:p-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Leave management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Requests, balances, types and holidays</p>
        </div>

        {/* <SummaryStrip /> */}

        <div className="grid grid-cols-2 sm:flex sm:gap-2 gap-2">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setSubTab(t)}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                subTab === t
                  ? 'bg-[#0f766e] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-teal-200 hover:text-teal-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {subTab === 'Requests'    && <RequestsTab />}
        {subTab === 'Leave Types' && <LeaveTypesTab apiKey={apiKey} token={token} />}
        {subTab === 'Balances'    && <BalancesTab />}
        {subTab === 'Holidays'    && <HolidaysTab />}
        {subTab === 'Leave policy'    && <LeavePolicyTab apiKey={apiKey} token={token} />}
      </div>
    </div>
  );
}