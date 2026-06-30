'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ShieldCheck, CalendarDays, MapPin, Clock } from 'lucide-react';
import PolicyTab from './SettingsTabs/PolicyTab';
import WorkScheduleTab from './SettingsTabs/WorkScheduleTab';
import WorkLocationTab from './SettingsTabs/WorkLocationTab';
import NoticePeriodTab from './SettingsTabs/NoticePeriodTab';

type Tab = 'policies' | 'work-schedule' | 'work-location' | 'notice-period';

export default function AttendancePolicies() {
  const params = useParams();
  const subdomain = params?.subdomain as string;

  const [activeTab, setActiveTab] = useState<Tab>('policies');

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'policies', label: 'Attendance Policies', icon: <ShieldCheck size={14} /> },
    { key: 'work-schedule', label: 'Work Schedule', icon: <CalendarDays size={14} /> },
    { key: 'work-location', label: 'Work Location', icon: <MapPin size={14} /> },
    { key: 'notice-period', label: 'Notice Period', icon: <Clock size={14} /> },
  ];

  return (
    <div className="space-y-5 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0f1f2e]">Attendance Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage policies, schedules and work locations</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === t.key
                ? 'bg-white text-[#0f766e] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'policies' && <PolicyTab subdomain={subdomain} />}
        {activeTab === 'work-schedule' && <WorkScheduleTab subdomain={subdomain} />}
        {activeTab === 'work-location' && <WorkLocationTab subdomain={subdomain} />}
        {activeTab === 'notice-period' && <NoticePeriodTab subdomain={subdomain} />}
      </div>
    </div>
  );
}
