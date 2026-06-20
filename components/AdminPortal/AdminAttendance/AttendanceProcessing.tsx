'use client';

import { CheckCircle } from 'lucide-react';

const STATUS_STYLE: Record<string, string> = {
  present: 'bg-green-100 text-green-700',
  late: 'bg-amber-100 text-amber-700',
  absent: 'bg-red-100 text-red-700',
  'missing-out': 'bg-orange-100 text-orange-700',
};

const LOGS = [
  {
    id: 1, name: 'Rahul Sharma', punchIn: '09:02', punchOut: '18:15', status: 'present',
  },
  {
    id: 2, name: 'Priya Nair', punchIn: '08:55', punchOut: '18:00', status: 'present',
  },
  {
    id: 3, name: 'Ananya Krishnan', punchIn: '10:22', punchOut: '19:00', status: 'late',
  },
  {
    id: 4, name: 'Vikram Patel', punchIn: '09:10', punchOut: null, status: 'missing-out',
  },
  {
    id: 5, name: 'Sneha Reddy', punchIn: null, punchOut: null, status: 'absent',
  },
];

export default function AttendanceProcessing() {
  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[#0f1f2e]">Attendance Processing</h1>
        <p className="text-sm text-gray-500 mt-0.5">Review and process daily attendance records</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#0f1f2e]">Daily Attendance Grid · 20 Mar 2026</h3>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors">
            <CheckCircle size={14} />
            {' '}
            Process Attendance
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Total Records', value: '248', color: 'text-[#0f1f2e]' },
            { label: 'Processed', value: '231', color: 'text-green-600' },
            { label: 'Exceptions', value: '17', color: 'text-amber-600' },
            { label: 'Pending', value: '0', color: 'text-gray-400' },
          ].map((s) => (
            <div key={s.label} className="p-3 rounded-xl bg-gray-50 text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Employee', 'Scheduled', 'Actual In', 'Actual Out', 'Status', 'Action'].map((h) => (
                  <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50">
                  <td className="px-3 py-2.5 text-sm font-medium text-gray-800">{log.name}</td>
                  <td className="px-3 py-2.5 text-sm text-gray-500">09:00 – 18:00</td>
                  <td className="px-3 py-2.5 text-sm font-mono text-gray-700">{log.punchIn || '—'}</td>
                  <td className="px-3 py-2.5 text-sm font-mono text-gray-700">{log.punchOut || '—'}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[log.status]}`}>
                      {log.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <button className="text-xs font-semibold text-[#2D7A4F] hover:underline">Correct</button>
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
