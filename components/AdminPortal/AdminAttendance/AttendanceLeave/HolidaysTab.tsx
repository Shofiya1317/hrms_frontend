'use client';

import { Plus } from 'lucide-react';

const HOLIDAYS = [
  { date: '26 Jan', month: 'JAN', name: 'Republic Day',         type: 'National', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { date: '14 Mar', month: 'MAR', name: 'Holi',                 type: 'Festival', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  { date: '14 Apr', month: 'APR', name: 'Dr. Ambedkar Jayanti', type: 'National', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { date: '15 Aug', month: 'AUG', name: 'Independence Day',     type: 'National', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { date: '02 Oct', month: 'OCT', name: 'Gandhi Jayanti',       type: 'National', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { date: '20 Oct', month: 'OCT', name: 'Dussehra',             type: 'Festival', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  { date: '01 Nov', month: 'NOV', name: 'Diwali',               type: 'Festival', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  { date: '25 Dec', month: 'DEC', name: 'Christmas',            type: 'Festival', color: 'bg-amber-50 text-amber-700 border-amber-100' },
];

export default function HolidaysTab() {
  const national = HOLIDAYS.filter(h => h.type === 'National');
  const festival = HOLIDAYS.filter(h => h.type === 'Festival');

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Holiday calendar 2026</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {HOLIDAYS.length} holidays · {national.length} national · {festival.length} festivals
          </p>
        </div>
        <button className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0f766e] hover:bg-teal-700 rounded-lg transition-all shadow-sm">
          <Plus size={13} /> Add holiday
        </button>
      </div>
      <div className="divide-y divide-slate-100">
        {HOLIDAYS.map(h => (
          <div key={h.date + h.name} className="group flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
            <div className="min-w-[50px] text-center">
              <p className="text-xs font-bold text-slate-400 uppercase">{h.month}</p>
              <p className="text-lg font-bold text-slate-900 leading-tight">{h.date.split(' ')[0]}</p>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="flex-1 text-sm font-semibold text-slate-800">{h.name}</span>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${h.color}`}>
              {h.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}