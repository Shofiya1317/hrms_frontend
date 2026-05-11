'use client';

import React, { useState } from 'react';
import { Clock, AlertTriangle, CheckCircle, Upload, Download, Plus, Filter, Calendar, Settings, Wifi } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const TABS = [
  'Dashboard', 'Logs', 'Processing', 'Exceptions',
  'Shifts', 'Leave', 'Devices', 'Upload', 'Policies'
];

const weeklyData = [
  { day: 'Mon', present: 142, absent: 18, late: 8 },
  { day: 'Tue', present: 148, absent: 12, late: 5 },
  { day: 'Wed', present: 151, absent: 9, late: 3 },
  { day: 'Thu', present: 145, absent: 15, late: 7 },
  { day: 'Fri', present: 138, absent: 22, late: 11 },
  { day: 'Sat', present: 62, absent: 8, late: 2 },
];

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

const SHIFTS = [
  { name: 'General Shift', time: '09:00 – 18:00', days: 'Mon–Fri', employees: 180, type: 'Fixed' },
  { name: 'Morning Shift', time: '06:00 – 14:00', days: 'Mon–Sat', employees: 32, type: 'Rotational' },
  { name: 'Evening Shift', time: '14:00 – 22:00', days: 'Mon–Sat', employees: 28, type: 'Rotational' },
  { name: 'Night Shift', time: '22:00 – 06:00', days: 'Mon–Sun', employees: 8, type: 'Fixed' },
];

const LEAVE_TYPES = [
  { type: 'Annual Leave', days: 18, carry: true, encash: true },
  { type: 'Sick Leave', days: 12, carry: false, encash: false },
  { type: 'Casual Leave', days: 6, carry: false, encash: false },
  { type: 'Maternity Leave', days: 180, carry: false, encash: false },
  { type: 'Paternity Leave', days: 15, carry: false, encash: false },
  { type: 'Compensatory Off', days: 0, carry: true, encash: true },
];

const LEAVE_REQUESTS = [
  { id: 1, name: 'Rohit Gupta', type: 'Annual Leave', from: '22 Mar', to: '24 Mar', days: 3, status: 'pending', reason: 'Family vacation' },
  { id: 2, name: 'Sneha Reddy', type: 'Sick Leave', from: '18 Mar', to: '21 Mar', days: 4, status: 'approved', reason: 'Medical treatment' },
  { id: 3, name: 'Kavya Menon', type: 'Casual Leave', from: '25 Mar', to: '25 Mar', days: 1, status: 'pending', reason: 'Personal work' },
];

const DEVICES = [
  { id: 'DEV-001', name: 'Main Entrance Biometric', location: 'Bangalore HQ – Gate 1', ip: '192.168.1.101', status: 'online', lastSync: '2 min ago' },
  { id: 'DEV-002', name: 'Office Floor Scanner', location: 'Bangalore HQ – Floor 3', ip: '192.168.1.102', status: 'online', lastSync: '5 min ago' },
  { id: 'DEV-003', name: 'Pune Office Entry', location: 'Pune Branch – Main Door', ip: '10.0.0.51', status: 'offline', lastSync: '2 hr ago' },
  { id: 'DEV-004', name: 'Mumbai Sales Office', location: 'Mumbai Branch', ip: '10.0.1.20', status: 'online', lastSync: '1 min ago' },
];

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0f1f2e]">Attendance</h1>
          <p className="text-sm text-gray-500 mt-0.5">Module 1 · Live tracking & management</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Tabs */}
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

      {activeTab === 'Dashboard' && <AttendanceDashboard />}
      {activeTab === 'Logs' && <AttendanceLogs />}
      {activeTab === 'Processing' && <AttendanceProcessing />}
      {activeTab === 'Exceptions' && <ExceptionsTab />}
      {activeTab === 'Shifts' && <ShiftsTab />}
      {activeTab === 'Leave' && <LeaveTab />}
      {activeTab === 'Devices' && <DevicesTab />}
      {activeTab === 'Upload' && <UploadTab />}
      {activeTab === 'Policies' && <PoliciesTab />}
    </div>
  );
}

function AttendanceDashboard() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Present Today', value: '213', sub: '85.9%', color: 'bg-green-50 text-green-600' },
          { label: 'Absent', value: '18', sub: '7.3%', color: 'bg-red-50 text-red-500' },
          { label: 'Late Arrivals', value: '9', sub: 'Before 10 AM', color: 'bg-amber-50 text-amber-600' },
          { label: 'On Leave', value: '8', sub: 'Approved', color: 'bg-blue-50 text-blue-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className={`text-2xl font-black ${s.color.split(' ')[1]}`}>{s.value}</div>
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

function AttendanceLogs() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3">
        <input type="date" defaultValue="2026-03-20" className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F]" />
        <input type="text" placeholder="Search employee..." className="flex-1 min-w-40 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F]" />
        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
          <Filter size={14} /> Filter
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
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
  );
}

function AttendanceProcessing() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#0f1f2e]">Daily Attendance Grid · 20 Mar 2026</h3>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors">
            <CheckCircle size={14} /> Process Attendance
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
              {ATTENDANCE_LOGS.slice(0, 5).map((log) => (
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

function ExceptionsTab() {
  const exceptions = [
    { name: 'Vikram Patel', type: 'Missing Punch-Out', date: '20 Mar', severity: 'medium' },
    { name: 'Ananya Krishnan', type: 'Late Arrival (1h 22m)', date: '20 Mar', severity: 'low' },
    { name: 'Rohit Gupta', type: 'Absent – No Leave Applied', date: '19 Mar', severity: 'high' },
    { name: 'Kavya Menon', type: 'Overtime (2h 15m)', date: '19 Mar', severity: 'low' },
    { name: 'Arjun Das', type: 'Missing Punch-In', date: '18 Mar', severity: 'medium' },
  ];
  const sevColor: Record<string, string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-blue-100 text-blue-700',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#0f1f2e]">Exceptions Management</h3>
        <span className="text-xs font-semibold text-white bg-red-500 rounded-full px-2.5 py-1">{exceptions.length} open</span>
      </div>
      <div className="space-y-2.5">
        {exceptions.map((ex, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2D7A4F] to-[#1e5c3a] flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={15} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">{ex.name}</p>
              <p className="text-xs text-gray-500">{ex.type} · {ex.date}</p>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sevColor[ex.severity]}`}>{ex.severity}</span>
            <button className="text-xs font-semibold text-[#2D7A4F] hover:underline">Resolve</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShiftsTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#0f1f2e]">Shift Management</h3>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors">
          <Plus size={14} /> Create Shift
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
              <span className="text-xs text-gray-500">{shift.employees} employees assigned</span>
              <button className="text-xs font-semibold text-[#2D7A4F] hover:underline">Manage →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeaveTab() {
  const [leaveSubTab, setLeaveSubTab] = useState('Requests');
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['Requests', 'Leave Types', 'Balances', 'Holidays'].map((t) => (
          <button
            key={t}
            onClick={() => setLeaveSubTab(t)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${leaveSubTab === t ? 'bg-[#2D7A4F] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {leaveSubTab === 'Requests' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-[#0f1f2e]">Leave Requests</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {LEAVE_REQUESTS.map((req) => (
              <div key={req.id} className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2D7A4F] to-[#1e5c3a] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{req.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{req.name}</p>
                  <p className="text-xs text-gray-500">{req.type} · {req.from} – {req.to} ({req.days}d) · {req.reason}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {req.status}
                </span>
                {req.status === 'pending' && (
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs font-semibold text-white bg-[#2D7A4F] rounded-lg hover:bg-[#1e5c3a] transition-colors">Approve</button>
                    <button className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Reject</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {leaveSubTab === 'Leave Types' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0f1f2e]">Leave Types Configuration</h3>
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors">
              <Plus size={14} /> Add Type
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {['Leave Type', 'Days/Year', 'Carry Forward', 'Encashable'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {LEAVE_TYPES.map((lt) => (
                  <tr key={lt.type} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">{lt.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{lt.days === 0 ? 'As earned' : `${lt.days} days`}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${lt.carry ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {lt.carry ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${lt.encash ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {lt.encash ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {leaveSubTab === 'Balances' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#0f1f2e] mb-4">Leave Balances Overview</h3>
          <div className="space-y-3">
            {[
              { name: 'Rahul Sharma', annual: '13/18', sick: '10/12', casual: '5/6' },
              { name: 'Priya Nair', annual: '8/18', sick: '12/12', casual: '4/6' },
              { name: 'Ananya Krishnan', annual: '16/18', sick: '11/12', casual: '6/6' },
              { name: 'Vikram Patel', annual: '17/18', sick: '12/12', casual: '5/6' },
            ].map((emp) => (
              <div key={emp.name} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2D7A4F] to-[#1e5c3a] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[10px] font-bold">{emp.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800 w-36 flex-shrink-0">{emp.name}</span>
                <div className="flex gap-4 text-xs">
                  <span className="text-gray-600">Annual: <strong>{emp.annual}</strong></span>
                  <span className="text-gray-600">Sick: <strong>{emp.sick}</strong></span>
                  <span className="text-gray-600">Casual: <strong>{emp.casual}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {leaveSubTab === 'Holidays' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#0f1f2e]">Holiday Calendar 2026</h3>
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors">
              <Plus size={14} /> Add Holiday
            </button>
          </div>
          <div className="space-y-2">
            {[
              { date: '26 Jan', name: 'Republic Day', type: 'National' },
              { date: '14 Mar', name: 'Holi', type: 'Festival' },
              { date: '14 Apr', name: 'Dr. Ambedkar Jayanti', type: 'National' },
              { date: '15 Aug', name: 'Independence Day', type: 'National' },
              { date: '02 Oct', name: 'Gandhi Jayanti', type: 'National' },
              { date: '20 Oct', name: 'Dussehra', type: 'Festival' },
              { date: '01 Nov', name: 'Diwali', type: 'Festival' },
              { date: '25 Dec', name: 'Christmas', type: 'Festival' },
            ].map((h) => (
              <div key={h.date} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-14 text-center">
                  <span className="text-sm font-bold text-[#2D7A4F]">{h.date}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800 flex-1">{h.name}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${h.type === 'National' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                  {h.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DevicesTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#0f1f2e]">Biometric Device Integration</h3>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors">
          <Plus size={14} /> Add Device
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DEVICES.map((device) => (
          <div key={device.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${device.status === 'online' ? 'bg-green-50' : 'bg-red-50'}`}>
                  <Wifi size={18} className={device.status === 'online' ? 'text-green-600' : 'text-red-500'} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0f1f2e]">{device.name}</h4>
                  <p className="text-xs text-gray-500">{device.id}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${device.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {device.status}
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-gray-500">
              <p>📍 {device.location}</p>
              <p>🌐 IP: <span className="font-mono font-semibold text-gray-700">{device.ip}</span></p>
              <p>🔄 Last sync: <span className="font-semibold text-gray-700">{device.lastSync}</span></p>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 px-3 py-1.5 text-xs font-semibold text-[#2D7A4F] bg-[#e8f5ee] rounded-lg hover:bg-[#d0ead9] transition-colors">Sync Now</button>
              <button className="flex-1 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">View Logs</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UploadTab() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-[#0f1f2e] mb-4">Upload Attendance (Excel)</h3>
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-[#2D7A4F]/40 transition-colors cursor-pointer group">
          <div className="w-14 h-14 rounded-2xl bg-[#e8f5ee] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Upload size={24} className="text-[#2D7A4F]" />
          </div>
          <p className="text-sm font-semibold text-gray-700">Drop your Excel file here</p>
          <p className="text-xs text-gray-400 mt-1">Supports .xlsx, .xls · Max 10MB</p>
          <button className="mt-4 px-4 py-2 text-sm font-semibold text-[#2D7A4F] bg-[#e8f5ee] rounded-xl hover:bg-[#d0ead9] transition-colors">Browse File</button>
        </div>
        <div className="flex items-center justify-between mt-4 p-3 rounded-xl bg-gray-50">
          <span className="text-xs text-gray-600">Need the template?</span>
          <button className="flex items-center gap-2 text-xs font-semibold text-[#2D7A4F] hover:underline">
            <Download size={13} /> Download Template
          </button>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-[#0f1f2e] mb-4">Upload History</h3>
        <div className="space-y-2">
          {[
            { file: 'attendance_march_w3.xlsx', date: '18 Mar 2026', records: 248, status: 'success' },
            { file: 'attendance_march_w2.xlsx', date: '11 Mar 2026', records: 245, status: 'success' },
            { file: 'attendance_march_w1.xlsx', date: '04 Mar 2026', records: 241, status: 'error' },
          ].map((upload, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 text-[10px] font-bold">XLS</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-800">{upload.file}</p>
                <p className="text-[10px] text-gray-400">{upload.date} · {upload.records} records</p>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${upload.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {upload.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PoliciesTab() {
  return (
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
  );
}
