'use client';

import React, { useState } from 'react';
import { Plus, Save, Shield, Building2, Settings, Activity, Clock, Calendar, Trash2 } from 'lucide-react';

const TABS = ['Organization', 'Office Timings', 'RBAC', 'Policies', 'Integrations', 'Audit Logs'];

const ROLES = [
  { name: 'Super Admin', users: 1, permissions: 'Full access', color: 'bg-red-100 text-red-700' },
  { name: 'HR Admin', users: 3, permissions: 'Employees, Attendance, Payroll', color: 'bg-purple-100 text-purple-700' },
  { name: 'Finance Admin', users: 2, permissions: 'Payroll, Reports', color: 'bg-amber-100 text-amber-700' },
  { name: 'Manager', users: 12, permissions: 'Team Attendance, Leave Approvals', color: 'bg-blue-100 text-blue-700' },
  { name: 'Employee', users: 230, permissions: 'Self-service only', color: 'bg-green-100 text-green-700' },
];

const AUDIT_LOGS = [
  { action: 'Employee Created', user: 'admin@impactree.in', target: 'Arjun Mehta (EMP-2026-001)', time: '20 Mar 2026, 10:32 AM', type: 'create' },
  { action: 'Leave Approved', user: 'priya.n@impactree.in', target: 'Sneha Reddy – Sick Leave', time: '20 Mar 2026, 09:15 AM', type: 'update' },
  { action: 'Payroll Processed', user: 'admin@impactree.in', target: 'February 2026 – 247 employees', time: '28 Feb 2026, 06:00 PM', type: 'process' },
  { action: 'Role Changed', user: 'admin@impactree.in', target: 'Kavya Menon – HR Executive', time: '01 Mar 2026, 11:00 AM', type: 'update' },
  { action: 'Device Added', user: 'admin@impactree.in', target: 'Mumbai Sales Office Biometric', time: '15 Feb 2026, 02:30 PM', type: 'create' },
  { action: 'Policy Updated', user: 'admin@impactree.in', target: 'Grace Time: 5min → 10min', time: '10 Feb 2026, 04:00 PM', type: 'update' },
];

const LOG_TYPE_COLOR: Record<string, string> = {
  create: 'bg-green-100 text-green-700',
  update: 'bg-blue-100 text-blue-700',
  process: 'bg-purple-100 text-purple-700',
  delete: 'bg-red-100 text-red-700',
};

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const INDIA_PUBLIC_HOLIDAYS_2026 = [
  { date: '2026-01-01', name: "New Year\'s Day", type: 'National' },
  { date: '2026-01-14', name: 'Makar Sankranti', type: 'Regional' },
  { date: '2026-01-26', name: 'Republic Day', type: 'National' },
  { date: '2026-03-17', name: 'Holi', type: 'National' },
  { date: '2026-04-02', name: 'Ram Navami', type: 'National' },
  { date: '2026-04-03', name: 'Good Friday', type: 'National' },
  { date: '2026-04-14', name: 'Dr. Ambedkar Jayanti', type: 'National' },
  { date: '2026-05-01', name: 'Labour Day', type: 'National' },
  { date: '2026-08-15', name: 'Independence Day', type: 'National' },
  { date: '2026-08-22', name: 'Janmashtami', type: 'National' },
  { date: '2026-10-02', name: 'Gandhi Jayanti', type: 'National' },
  { date: '2026-10-20', name: 'Dussehra', type: 'National' },
  { date: '2026-11-09', name: 'Diwali', type: 'National' },
  { date: '2026-11-10', name: 'Diwali (Laxmi Puja)', type: 'National' },
  { date: '2026-12-25', name: 'Christmas Day', type: 'National' },
];

interface PublicHoliday {
  date: string;
  name: string;
  type: string;
}

function OfficeTImingsTab() {
  const [officeStart, setOfficeStart] = useState('09:00');
  const [officeEnd, setOfficeEnd] = useState('18:00');
  const [lunchStart, setLunchStart] = useState('13:00');
  const [lunchEnd, setLunchEnd] = useState('14:00');
  const [workingDays, setWorkingDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [weeklyOffs, setWeeklyOffs] = useState<string[]>(['Saturday', 'Sunday']);
  const [altSaturday, setAltSaturday] = useState(false);
  const [holidays, setHolidays] = useState<PublicHoliday[]>(INDIA_PUBLIC_HOLIDAYS_2026);
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '', type: 'National' });
  const [showAddHoliday, setShowAddHoliday] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2026');
  const [saved, setSaved] = useState(false);

  const toggleDay = (day: string) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter((d) => d !== day));
      setWeeklyOffs([...weeklyOffs, day]);
    } else {
      setWeeklyOffs(weeklyOffs.filter((d) => d !== day));
      setWorkingDays([...workingDays, day]);
    }
  };

  const addHoliday = () => {
    if (!newHoliday.date || !newHoliday.name) return;
    setHolidays([...holidays, { ...newHoliday }].sort((a, b) => a.date.localeCompare(b.date)));
    setNewHoliday({ date: '', name: '', type: 'National' });
    setShowAddHoliday(false);
  };

  const removeHoliday = (date: string) => {
    setHolidays(holidays.filter((h) => h.date !== date));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const totalWorkHours = (() => {
    const [sh, sm] = officeStart.split(':').map(Number);
    const [eh, em] = officeEnd.split(':').map(Number);
    const [lsh, lsm] = lunchStart.split(':').map(Number);
    const [leh, lem] = lunchEnd.split(':').map(Number);
    const total = (eh * 60 + em) - (sh * 60 + sm);
    const lunch = (leh * 60 + lem) - (lsh * 60 + lsm);
    const net = total - lunch;
    return `${Math.floor(net / 60)}h ${net % 60 > 0 ? `${net % 60}m` : ''}`.trim();
  })();

  return (
    <div className="space-y-4">
      {/* Header save */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#0f1f2e]">Office Timings & Calendar</h3>
          <p className="text-xs text-gray-500 mt-0.5">Configure working hours, weekly offs, and public holidays for the year</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all"
          >
            {['2025', '2026', '2027'].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all ${saved ? 'bg-green-600' : 'bg-[#2D7A4F] hover:bg-[#1e5c3a]'}`}
          >
            <Save size={14} /> {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Office Hours */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-[#e8f5ee] flex items-center justify-center">
            <Clock size={15} className="text-[#2D7A4F]" />
          </div>
          <h4 className="text-sm font-bold text-[#0f1f2e]">Office Hours</h4>
          <span className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-[#e8f5ee] text-[#2D7A4F]">
            Net: {totalWorkHours} / day
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Check-in Time</label>
            <input
              type="time"
              value={officeStart}
              onChange={(e) => setOfficeStart(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Check-out Time</label>
            <input
              type="time"
              value={officeEnd}
              onChange={(e) => setOfficeEnd(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Lunch Break Start</label>
            <input
              type="time"
              value={lunchStart}
              onChange={(e) => setLunchStart(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Lunch Break End</label>
            <input
              type="time"
              value={lunchEnd}
              onChange={(e) => setLunchEnd(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all"
            />
          </div>
        </div>
        <div className="mt-4 p-3 rounded-xl bg-gray-50 flex flex-wrap gap-4 text-xs text-gray-600">
          <span>🕘 Office: <strong className="text-gray-800">{officeStart} – {officeEnd}</strong></span>
          <span>🍽 Lunch: <strong className="text-gray-800">{lunchStart} – {lunchEnd}</strong></span>
          <span>⏱ Net working: <strong className="text-[#2D7A4F]">{totalWorkHours}</strong></span>
        </div>
      </div>

      {/* Working Days & Weekly Offs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
            <Calendar size={15} className="text-blue-600" />
          </div>
          <h4 className="text-sm font-bold text-[#0f1f2e]">Working Days & Weekly Offs</h4>
          <span className="ml-auto text-xs text-gray-500">{workingDays.length} working days / week</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {DAYS_OF_WEEK.map((day) => {
            const isWorking = workingDays.includes(day);
            return (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  isWorking
                    ? 'bg-[#2D7A4F] text-white border-[#2D7A4F] shadow-sm'
                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
              >
                {day.slice(0, 3)}
                <span className="ml-1.5 text-[10px] opacity-70">{isWorking ? 'Work' : 'Off'}</span>
              </button>
            );
          })}
        </div>

        {/* Alternate Saturday option */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
          <button
            onClick={() => setAltSaturday(!altSaturday)}
            className={`relative w-10 h-5 rounded-full transition-all flex-shrink-0 ${altSaturday ? 'bg-[#2D7A4F]' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${altSaturday ? 'left-5' : 'left-0.5'}`} />
          </button>
          <div>
            <p className="text-xs font-semibold text-gray-700">Alternate Saturday Off</p>
            <p className="text-[10px] text-gray-500">2nd and 4th Saturdays will be marked as weekly off</p>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-3 flex flex-wrap gap-2">
          {weeklyOffs.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 border border-red-100">
              <span className="text-xs font-semibold text-red-600">Weekly Offs:</span>
              <span className="text-xs text-red-500">{weeklyOffs.join(', ')}</span>
            </div>
          )}
          {altSaturday && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-100">
              <span className="text-xs font-semibold text-amber-600">+ Alternate Saturdays Off</span>
            </div>
          )}
        </div>
      </div>

      {/* Public Holidays */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
              <Calendar size={15} className="text-purple-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#0f1f2e]">Public Holidays — {selectedYear}</h4>
              <p className="text-[10px] text-gray-500">{holidays.length} holidays configured</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddHoliday(!showAddHoliday)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors"
          >
            <Plus size={14} /> Add Holiday
          </button>
        </div>

        {/* Add holiday form */}
        {showAddHoliday && (
          <div className="mb-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
            <p className="text-xs font-bold text-gray-700 mb-3">Add New Holiday</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Holiday Name</label>
                <input
                  type="text"
                  placeholder="e.g. Eid al-Fitr"
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
                <select
                  value={newHoliday.type}
                  onChange={(e) => setNewHoliday({ ...newHoliday, type: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all"
                >
                  <option value="National">National</option>
                  <option value="Regional">Regional</option>
                  <option value="Company">Company</option>
                  <option value="Optional">Optional</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={addHoliday}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors"
              >
                Add Holiday
              </button>
              <button
                onClick={() => setShowAddHoliday(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Holiday list */}
        <div className="space-y-1.5">
          {holidays.map((holiday) => {
            const d = new Date(holiday.date);
            const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' });
            const formattedDate = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            const typeColor: Record<string, string> = {
              National: 'bg-blue-100 text-blue-700',
              Regional: 'bg-amber-100 text-amber-700',
              Company: 'bg-purple-100 text-purple-700',
              Optional: 'bg-gray-100 text-gray-600',
            };
            return (
              <div key={holiday.date} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{dayName}</span>
                  <span className="text-sm font-bold text-[#0f1f2e]">{d.getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{holiday.name}</p>
                  <p className="text-xs text-gray-500">{formattedDate}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${typeColor[holiday.type] || 'bg-gray-100 text-gray-600'}`}>
                  {holiday.type}
                </span>
                <button
                  onClick={() => removeHoliday(holiday.date)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Holiday type legend */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-3">
          {[
            { type: 'National', color: 'bg-blue-100 text-blue-700' },
            { type: 'Regional', color: 'bg-amber-100 text-amber-700' },
            { type: 'Company', color: 'bg-purple-100 text-purple-700' },
            { type: 'Optional', color: 'bg-gray-100 text-gray-600' },
          ].map((t) => (
            <span key={t.type} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${t.color}`}>
              {t.type}
            </span>
          ))}
          <span className="text-[10px] text-gray-400 ml-auto">Hover a holiday to remove it</span>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Organization');

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0f1f2e]">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">System control · Configuration & Access</p>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeTab === tab ? 'bg-white text-[#0f1f2e] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Organization' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-[#0f1f2e]">Company Details</h3>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors">
                <Save size={14} /> Save Changes
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Company Name', value: 'Impactree Technologies Pvt. Ltd.' },
                { label: 'CIN', value: 'U72900KA2020PTC123456' },
                { label: 'Industry', value: 'Software / HRMS' },
                { label: 'Founded', value: '2020' },
                { label: 'Registered Address', value: 'Bangalore, Karnataka, India' },
                { label: 'PAN', value: 'AABCI1234A' },
                { label: 'GST Number', value: '29AABCI1234A1Z5' },
                { label: 'Employee Strength', value: '248' },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{field.label}</label>
                  <input
                    type="text"
                    defaultValue={field.value}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#0f1f2e]">Office Locations</h3>
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors">
                <Plus size={14} /> Add Location
              </button>
            </div>
            <div className="space-y-2">
              {[
                { city: 'Bangalore', type: 'HQ', employees: 180, address: 'Koramangala, Bangalore – 560034' },
                { city: 'Mumbai', type: 'Branch', employees: 42, address: 'BKC, Mumbai – 400051' },
                { city: 'Pune', type: 'Branch', employees: 18, address: 'Hinjewadi, Pune – 411057' },
                { city: 'Delhi', type: 'Branch', employees: 8, address: 'Connaught Place, Delhi – 110001' },
              ].map((loc) => (
                <div key={loc.city} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-[#e8f5ee] flex items-center justify-center flex-shrink-0">
                    <Building2 size={16} className="text-[#2D7A4F]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{loc.city}</p>
                    <p className="text-xs text-gray-500">{loc.address}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${loc.type === 'HQ' ? 'bg-[#e8f5ee] text-[#2D7A4F]' : 'bg-gray-100 text-gray-600'}`}>{loc.type}</span>
                  <span className="text-xs text-gray-500">{loc.employees} emp</span>
                </div>
              ))}
            </div>
          </div>

          {/* Departments */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#0f1f2e]">Departments</h3>
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors">
                <Plus size={14} /> Add Department
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Engineering', 'Human Resources', 'Sales', 'Finance', 'Operations', 'Quality Assurance', 'Marketing', 'Legal'].map((dept) => (
                <span key={dept} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer">
                  {dept}
                  <span className="text-gray-400 hover:text-red-500 text-xs">×</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Office Timings' && <OfficeTImingsTab />}

      {activeTab === 'RBAC' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0f1f2e]">Role-Based Access Control</h3>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors">
              <Plus size={14} /> Create Role
            </button>
          </div>
          <div className="space-y-3">
            {ROLES.map((role) => (
              <div key={role.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Shield size={18} className="text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="text-sm font-bold text-[#0f1f2e]">{role.name}</h4>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${role.color}`}>{role.users} users</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{role.permissions}</p>
                  </div>
                  <button className="text-xs font-semibold text-[#2D7A4F] hover:underline">Edit Permissions</button>
                </div>
              </div>
            ))}
          </div>

          {/* Permission matrix */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-[#0f1f2e]">Permission Matrix</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Module</th>
                    {['Super Admin', 'HR Admin', 'Finance', 'Manager', 'Employee'].map((r) => (
                      <th key={r} className="text-center px-3 py-3 text-xs font-semibold text-gray-500">{r}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { module: 'Dashboard', access: [true, true, true, true, false] },
                    { module: 'Employees', access: [true, true, false, false, false] },
                    { module: 'Organogram', access: [true, true, false, true, true] },
                    { module: 'Attendance', access: [true, true, false, true, true] },
                    { module: 'Payroll', access: [true, true, true, false, false] },
                    { module: 'Analytics', access: [true, true, true, false, false] },
                    { module: 'Settings', access: [true, false, false, false, false] },
                  ].map((row) => (
                    <tr key={row.module} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">{row.module}</td>
                      {row.access.map((has, i) => (
                        <td key={i} className="px-3 py-3 text-center">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${has ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                            {has ? '✓' : '—'}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Policies' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-[#0f1f2e]">Policy Configuration</h3>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors">
                <Save size={14} /> Save All
              </button>
            </div>
            <div className="space-y-6">
              {[
                {
                  section: 'Attendance Rules',
                  fields: [
                    { label: 'Grace Time (minutes)', value: '10' },
                    { label: 'Standard Work Hours', value: '9' },
                    { label: 'Overtime Threshold', value: '9 hours' },
                    { label: 'Half-Day Minimum Hours', value: '4.5' },
                  ]
                },
                {
                  section: 'Leave Policies',
                  fields: [
                    { label: 'Annual Leave Days', value: '18' },
                    { label: 'Sick Leave Days', value: '12' },
                    { label: 'Leave Carry Forward Limit', value: '5 days' },
                    { label: 'Leave Encashment', value: 'Enabled' },
                  ]
                },
                {
                  section: 'Payroll Rules',
                  fields: [
                    { label: 'Payroll Processing Day', value: '28th of month' },
                    { label: 'PF Contribution Rate', value: '12%' },
                    { label: 'ESI Threshold', value: '₹21,000/month' },
                    { label: 'Professional Tax (KA)', value: '₹200/month' },
                  ]
                },
              ].map((section) => (
                <div key={section.section}>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{section.section}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {section.fields.map((field) => (
                      <div key={field.label} className="p-3 rounded-xl bg-gray-50">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{field.label}</label>
                        <input
                          type="text"
                          defaultValue={field.value}
                          className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Integrations' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#0f1f2e]">Connected Integrations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Biometric Devices', desc: 'ZKTeco / Suprema fingerprint scanners', status: 'connected', icon: '🔐' },
              { name: 'Email (SMTP)', desc: 'Payslip & notification delivery', status: 'connected', icon: '📧' },
              { name: 'SMS Gateway', desc: 'OTP and alert notifications', status: 'pending', icon: '📱' },
              { name: 'Tally / Zoho Books', desc: 'Payroll accounting integration', status: 'coming-soon', icon: '📊' },
              { name: 'Google Workspace', desc: 'SSO and calendar sync', status: 'coming-soon', icon: '🔗' },
              { name: 'Slack / Teams', desc: 'Leave and attendance notifications', status: 'coming-soon', icon: '💬' },
            ].map((integration) => (
              <div key={integration.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl flex-shrink-0">
                  {integration.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-[#0f1f2e]">{integration.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{integration.desc}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                  integration.status === 'connected' ? 'bg-green-100 text-green-700' :
                  integration.status === 'pending'? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {integration.status === 'coming-soon' ? 'Coming Soon' : integration.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Audit Logs' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-[#2D7A4F]" />
              <h3 className="text-sm font-bold text-[#0f1f2e]">System Audit Logs</h3>
            </div>
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
              <Settings size={14} /> Filter
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {AUDIT_LOGS.map((log, i) => (
              <div key={i} className="flex items-start gap-4 p-4 hover:bg-gray-50/50 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${LOG_TYPE_COLOR[log.type]}`}>
                  <Activity size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{log.action}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    <span className="font-medium text-gray-700">{log.user}</span> · {log.target}
                  </p>
                </div>
                <span className="text-[10px] text-gray-400 font-medium flex-shrink-0 text-right">{log.time}</span>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-100 text-center">
            <button className="text-xs font-semibold text-[#2D7A4F] hover:underline">Load More Logs →</button>
          </div>
        </div>
      )}
    </div>
  );
}
