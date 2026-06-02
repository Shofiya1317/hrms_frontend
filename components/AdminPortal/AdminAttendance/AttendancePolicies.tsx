'use client';

import { Settings } from 'lucide-react';

export default function AttendancePolicies() {
  return (
    <div className="space-y-5 p-3 sm:p-4 lg:p-6">
      <div>
        <h1 className="text-xl font-bold text-[#0f1f2e]">Attendance Policies</h1>
        <p className="text-sm text-gray-500 mt-0.5">Configure rules and attendance thresholds</p>
      </div>

      <div className="space-y-6 rounded-lg border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-bold text-[#0f1f2e]">Attendance Rules & Policies</h3>
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1e5c3a] sm:w-auto">
            <Settings size={14} /> Save Changes
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          {[
            { label: 'Grace Time (minutes)', value: '10', desc: 'Late arrival tolerance before marking late' },
            { label: 'Standard Work Hours', value: '9', desc: 'Hours required per working day' },
            { label: 'Overtime Threshold (hours)', value: '9', desc: 'Hours after which overtime is flagged' },
            { label: 'Half-Day Threshold (hours)', value: '4.5', desc: 'Minimum hours for half-day attendance' },
            { label: 'Week Off Days', value: 'Saturday, Sunday', desc: 'Days marked as weekly off' },
            { label: 'Shift Start Time', value: '09:00 AM', desc: 'Default shift start for all employees' },
          ].map((policy) => (
            <div key={policy.label} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <label className="block text-xs font-semibold text-gray-600 mb-1">{policy.label}</label>
              <input
                type="text"
                defaultValue={policy.value}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all"
              />
              <p className="text-[10px] text-gray-400 mt-1">{policy.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
