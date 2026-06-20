'use client';

import { Clock, Plus } from 'lucide-react';

const SHIFTS = [
  {
    name: 'General Shift', time: '09:00 – 18:00', days: 'Mon–Fri', employees: 180, type: 'Fixed',
  },
  {
    name: 'Morning Shift', time: '06:00 – 14:00', days: 'Mon–Sat', employees: 32, type: 'Rotational',
  },
  {
    name: 'Evening Shift', time: '14:00 – 22:00', days: 'Mon–Sat', employees: 28, type: 'Rotational',
  },
  {
    name: 'Night Shift', time: '22:00 – 06:00', days: 'Mon–Sun', employees: 8, type: 'Fixed',
  },
];

export default function AttendanceShifts() {
  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0f1f2e]">Shift Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configure and manage employee shifts</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors">
          <Plus size={14} />
          {' '}
          Create Shift
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SHIFTS.map((shift) => (
          <div key={shift.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-[#0f1f2e]">{shift.name}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{shift.days}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${shift.type === 'Fixed' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                {shift.type}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-[#2D7A4F]" />
              <span className="text-sm font-semibold text-gray-700">{shift.time}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {shift.employees}
                {' '}
                employees assigned
              </span>
              <button className="text-xs font-semibold text-[#2D7A4F] hover:underline">Manage →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
