'use client';

import { Settings } from 'lucide-react';

export default function AttendancePolicies() {
  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[#0f1f2e]">Attendance Policies</h1>
        <p className="text-sm text-gray-500 mt-0.5">Configure rules and attendance thresholds</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#0f1f2e]">Attendance Rules & Policies</h3>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors">
            <Settings size={14} /> Save Changes
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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