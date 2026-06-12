'use client';

import { useState } from 'react';
import { ClipboardList, FileText } from 'lucide-react';
import AttendanceLogs from '@/components/AdminPortal/AdminAttendance/AttendanceLogs';
import AdminRegularizationRequests from '@/components/AdminPortal/AdminAttendance/AdminRegularizationRequests';

type Tab = 'logs' | 'regularization';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'logs', label: 'Attendance Logs', icon: ClipboardList },
  { id: 'regularization', label: 'Regularization Requests', icon: FileText },
];

export default function AttendanceLogsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('logs');

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6">
      <div>
        <h1 className="text-lg font-bold text-[#0f1f2e]">Attendance Management</h1>
        <p className="text-xs text-gray-400 mt-0.5">View logs and manage regularization requests</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-1 p-2 border-b border-gray-100 overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#0f766e] text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-4">
          {activeTab === 'logs' && <AttendanceLogs />}
          {activeTab === 'regularization' && <AdminRegularizationRequests />}
        </div>
      </div>
    </div>
  );
}