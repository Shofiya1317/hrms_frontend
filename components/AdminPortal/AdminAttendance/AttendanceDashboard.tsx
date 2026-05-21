'use client';

import { Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const weeklyData = [
  { day: 'Mon', present: 142, absent: 18, late: 8 },
  { day: 'Tue', present: 148, absent: 12, late: 5 },
  { day: 'Wed', present: 151, absent: 9, late: 3 },
  { day: 'Thu', present: 145, absent: 15, late: 7 },
  { day: 'Fri', present: 138, absent: 22, late: 11 },
  { day: 'Sat', present: 62, absent: 8, late: 2 },
];

export default function AttendanceDashboard() {
  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0f1f2e]">Attendance Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Live tracking & management</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          <Download size={14} /> Export
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Present Today', value: '213', sub: '85.9%', color: 'text-green-600' },
          { label: 'Absent', value: '18', sub: '7.3%', color: 'text-red-500' },
          { label: 'Late Arrivals', value: '9', sub: 'Before 10 AM', color: 'text-amber-600' },
          { label: 'On Leave', value: '8', sub: 'Approved', color: 'text-blue-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <p className="text-xs font-semibold text-gray-700 mt-1">{s.label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-[#0f1f2e] mb-4">Weekly Attendance Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyData} barSize={18} barGap={3}>
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
            <Bar dataKey="present" fill="#2D7A4F" radius={[4, 4, 0, 0]} name="Present" />
            <Bar dataKey="absent" fill="#fde68a" radius={[4, 4, 0, 0]} name="Absent" />
            <Bar dataKey="late" fill="#fb923c" radius={[4, 4, 0, 0]} name="Late" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}