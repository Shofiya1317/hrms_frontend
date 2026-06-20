'use client';

import { AlertTriangle } from 'lucide-react';

const exceptions = [
  {
    name: 'Vikram Patel', type: 'Missing Punch-Out', date: '20 Mar', severity: 'medium',
  },
  {
    name: 'Ananya Krishnan', type: 'Late Arrival (1h 22m)', date: '20 Mar', severity: 'low',
  },
  {
    name: 'Rohit Gupta', type: 'Absent – No Leave Applied', date: '19 Mar', severity: 'high',
  },
  {
    name: 'Kavya Menon', type: 'Overtime (2h 15m)', date: '19 Mar', severity: 'low',
  },
  {
    name: 'Arjun Das', type: 'Missing Punch-In', date: '18 Mar', severity: 'medium',
  },
];

const SEV_COLOR: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-blue-100 text-blue-700',
};

export default function AttendanceExceptions() {
  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[#0f1f2e]">Exceptions</h1>
        <p className="text-sm text-gray-500 mt-0.5">Attendance anomalies that need attention</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#0f1f2e]">Open Exceptions</h3>
          <span className="text-xs font-semibold text-white bg-red-500 rounded-full px-2.5 py-1">
            {exceptions.length}
            {' '}
            open
          </span>
        </div>
        <div className="space-y-2.5">
          {exceptions.map((ex, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2D7A4F] to-[#1e5c3a] flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={15} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{ex.name}</p>
                <p className="text-xs text-gray-500">
                  {ex.type}
                  {' '}
                  ·
                  {' '}
                  {ex.date}
                </p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${SEV_COLOR[ex.severity]}`}>{ex.severity}</span>
              <button className="text-xs font-semibold text-[#2D7A4F] hover:underline">Resolve</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
