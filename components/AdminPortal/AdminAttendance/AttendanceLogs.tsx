'use client';

import { Filter } from 'lucide-react';

const ATTENDANCE_LOGS = [
  { id: 1, name: 'Rahul Sharma', empId: 'EMP-2022-042', date: '20 Mar 2026', punchIn: '09:02', punchOut: '18:15', status: 'present', hours: '9h 13m' },
  { id: 2, name: 'Priya Nair', empId: 'EMP-2021-001', date: '20 Mar 2026', punchIn: '08:55', punchOut: '18:00', status: 'present', hours: '9h 05m' },
  { id: 3, name: 'Ananya Krishnan', empId: 'EMP-2022-058', date: '20 Mar 2026', punchIn: '10:22', punchOut: '19:00', status: 'late', hours: '8h 38m' },
  { id: 4, name: 'Vikram Patel', empId: 'EMP-2023-091', date: '20 Mar 2026', punchIn: '09:10', punchOut: null, status: 'missing-out', hours: '—' },
  { id: 5, name: 'Sneha Reddy', empId: 'EMP-2022-074', date: '20 Mar 2026', punchIn: null, punchOut: null, status: 'absent', hours: '—' },
  { id: 6, name: 'Arjun Das', empId: 'EMP-2023-012', date: '20 Mar 2026', punchIn: '09:00', punchOut: '18:30', status: 'present', hours: '9h 30m' },
  { id: 7, name: 'Kavya Menon', empId: 'EMP-2023-087', date: '20 Mar 2026', punchIn: '09:45', punchOut: '18:45', status: 'late', hours: '9h 00m' },
  { id: 8, name: 'Deepa Iyer', empId: 'EMP-2020-008', date: '20 Mar 2026', punchIn: '08:30', punchOut: '17:30', status: 'present', hours: '9h 00m' },
];

const STATUS_STYLE: Record<string, string> = {
  present: 'bg-green-100 text-green-700',
  late: 'bg-amber-100 text-amber-700',
  absent: 'bg-red-100 text-red-700',
  'missing-out': 'bg-orange-100 text-orange-700',
};

export default function AttendanceLogs() {
  return (
    <div className="space-y-5 p-3 sm:p-4 lg:p-6">
      <div>
        <h1 className="text-xl font-bold text-[#0f1f2e]">Attendance Logs</h1>
        <p className="text-sm text-gray-500 mt-0.5">Daily punch-in & punch-out records</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-3 sm:flex-row sm:flex-wrap sm:p-4">
          <input type="date" defaultValue="2026-03-20" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-[#2D7A4F] focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 sm:w-auto" />
          <input type="text" placeholder="Search employee..." className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-[#2D7A4F] focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 sm:min-w-40" />
          <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 sm:w-auto">
            <Filter size={14} /> Filter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {['Employee', 'Date', 'Punch In', 'Punch Out', 'Hours', 'Status'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ATTENDANCE_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-gray-800">{log.name}</p>
                    <p className="text-xs text-gray-400">{log.empId}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{log.date}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-700">{log.punchIn || '—'}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-700">{log.punchOut || '—'}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-700">{log.hours}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[log.status]}`}>
                      {log.status.replace('-', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
