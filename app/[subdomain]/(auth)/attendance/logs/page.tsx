'use client';

import { useState } from 'react';
import { ClipboardList, FileText, Home } from 'lucide-react';
import AttendanceLogs from '@/components/AdminPortal/AdminAttendance/AttendanceLogs';
import AdminRegularizationRequests from '@/components/AdminPortal/AdminAttendance/AdminRegularizationRequests';
import AdminWFHRequests from '@/components/AdminPortal/AdminAttendance/AdminWFHRequests';
import AdminOnDutyRequests from '@/components/AdminPortal/AdminAttendance/AdminOnDutyRequests';

type Tab = 'logs' | 'regularization' | 'wfh' | 'onduty';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'logs',           label: 'Attendance Logs',          icon: ClipboardList },
  { id: 'regularization', label: 'Regularization Requests',  icon: FileText      },
  { id: 'wfh',            label: 'WFH Requests',             icon: Home          },
  { id: 'onduty',         label: 'On-Duty Requests',         icon: Home          },
];

export default function AttendanceLogsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('logs');

  return (
    <div className="">
      <div className='py-3 px-2'>
        <h1 className="text-lg font-bold text-[#0f1f2e]">Attendance Management</h1>
        <p className="text-xs text-gray-400 mt-0.5">View logs, manage regularization and WFH requests</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="pt-3 flex items-center gap-1 p-3 border-b border-gray-100 overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all whitespace-nowrap ${
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
          {activeTab === 'logs'           && <AttendanceLogs />}
          {activeTab === 'regularization' && <AdminRegularizationRequests />}
          {activeTab === 'wfh'            && <AdminWFHRequests />}
          {activeTab === 'onduty'         && <AdminOnDutyRequests />}


          </div>
      </div>
    </div>
  );
}