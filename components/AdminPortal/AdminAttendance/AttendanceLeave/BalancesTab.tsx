'use client';

import { Users } from 'lucide-react';

const EMPLOYEES = [
  { name: 'Rahul Sharma',    annual: [13, 18], sick: [10, 12], casual: [5, 6], avatar: 'RS', color: 'bg-teal-500' },
  { name: 'Priya Nair',      annual: [8,  18], sick: [12, 12], casual: [4, 6], avatar: 'PN', color: 'bg-violet-500' },
  { name: 'Ananya Krishnan', annual: [16, 18], sick: [11, 12], casual: [6, 6], avatar: 'AK', color: 'bg-rose-500' },
  { name: 'Vikram Patel',    annual: [17, 18], sick: [12, 12], casual: [5, 6], avatar: 'VP', color: 'bg-amber-500' },
];

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const trackColor = pct >= 90 ? 'bg-red-100' : pct >= 70 ? 'bg-amber-100' : 'bg-slate-100';
  const fillColor  = pct >= 90 ? 'bg-red-400'  : pct >= 70 ? 'bg-amber-400' : color;
  return (
    <div className={`h-1.5 w-full rounded-full ${trackColor} overflow-hidden`}>
      <div className={`h-full rounded-full transition-all duration-500 ${fillColor}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function BalancesTab() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Leave balances</h3>
          <p className="text-xs text-slate-400 mt-0.5">{EMPLOYEES.length} employees · Current year</p>
        </div>
        <button className="self-start sm:self-auto flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-lg transition-colors">
          <Users size={12} /> All employees
        </button>
      </div>
      <div className="divide-y divide-slate-100">
        {EMPLOYEES.map(emp => (
          <div key={emp.name} className="px-4 py-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-lg ${emp.color} text-white text-xs font-bold flex items-center justify-center`}>
                {emp.avatar}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{emp.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {emp.annual[0] + emp.sick[0] + emp.casual[0]} days used
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Annual', used: emp.annual[0], total: emp.annual[1], color: 'bg-teal-500' },
                { label: 'Sick',   used: emp.sick[0],   total: emp.sick[1],   color: 'bg-rose-400' },
                { label: 'Casual', used: emp.casual[0], total: emp.casual[1], color: 'bg-amber-400' },
              ].map(b => (
                <div key={b.label} className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600">{b.label}</span>
                    <span className="text-xs font-bold text-slate-900">
                      {b.used}<span className="text-slate-400">/{b.total}</span>
                    </span>
                  </div>
                  <ProgressBar value={b.used} max={b.total} color={b.color} />
                  <p className="text-xs text-slate-400 mt-1.5">{b.total - b.used} remaining</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}