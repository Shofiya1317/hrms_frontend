'use client';

import React, { useState } from 'react';
import { Download, Filter } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const TABS = ['Workforce', 'Attendance'];

const headcountData = [
  { month: 'Oct', count: 228 },
  { month: 'Nov', count: 234 },
  { month: 'Dec', count: 238 },
  { month: 'Jan', count: 244 },
  { month: 'Feb', count: 246 },
  { month: 'Mar', count: 248 },
];

const deptDistribution = [
  { name: 'Engineering', value: 98, color: '#7c3aed' },
  { name: 'Sales', value: 42, color: '#2D7A4F' },
  { name: 'Operations', value: 38, color: '#0ea5e9' },
  { name: 'Finance', value: 28, color: '#f59e0b' },
  { name: 'HR', value: 22, color: '#ec4899' },
  { name: 'QA', value: 20, color: '#f97316' },
];

const absenteeismData = [
  { week: 'W1', rate: 6.2 },
  { week: 'W2', rate: 5.8 },
  { week: 'W3', rate: 7.1 },
  { week: 'W4', rate: 5.4 },
  { week: 'W5', rate: 6.8 },
  { week: 'W6', rate: 4.9 },
];

const hiringFunnel = [
  { stage: 'Applied', count: 85 },
  { stage: 'Screened', count: 52 },
  { stage: 'Interviewed', count: 24 },
  { stage: 'Offered', count: 8 },
  { stage: 'Joined', count: 6 },
];

const salaryCostData = [
  { dept: 'Eng', cost: 42 },
  { dept: 'Sales', cost: 18 },
  { dept: 'Ops', cost: 16 },
  { dept: 'Finance', cost: 12 },
  { dept: 'HR', cost: 8 },
  { dept: 'QA', cost: 4 },
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('Workforce');

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0f1f2e]">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Cross-module intelligence · Data-driven decisions</p>
        </div>
      </div>
     <div className="inline-flex gap-1 bg-gray-100 p-1 rounded-xl">
  {TABS?.map((tab) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
        activeTab === tab
          ? 'bg-white text-[#0f1f2e] shadow-sm'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {tab}
    </button>
  ))}
</div>
      {activeTab === 'Workforce' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Headcount', value: '248', change: '+6 this month' },
              { label: 'Avg Tenure', value: '2.4 yrs', change: 'Stable' },
              { label: 'Attrition Rate', value: '4.2%', change: '-0.8% vs last yr' },
              { label: 'New Hires (YTD)', value: '18', change: 'Jan–Mar 2026' },
            ]?.map((s) => (
              <div key={s?.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <p className="text-xl font-black text-[#0f1f2e]">{s?.value}</p>
                <p className="text-xs font-semibold text-gray-700 mt-0.5">{s?.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{s?.change}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-[#0f1f2e] mb-4">Headcount Trend (6 months)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={headcountData}>
                  <defs>
                    <linearGradient id="headcountGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2D7A4F" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2D7A4F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[220, 260]} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
                  <Area type="monotone" dataKey="count" stroke="#2D7A4F" strokeWidth={2.5} fill="url(#headcountGrad)" name="Headcount" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-[#0f1f2e] mb-4">Department Distribution</h3>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={160}>
                  <PieChart>
                    <Pie data={deptDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                      {deptDistribution?.map((entry, index) => (
                        <Cell key={index} fill={entry?.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {deptDistribution?.map((d) => (
                    <div key={d?.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d?.color }} />
                      <span className="text-xs text-gray-600 flex-1">{d?.name}</span>
                      <span className="text-xs font-bold text-gray-800">{d?.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'Attendance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Avg Attendance Rate', value: '88.4%', color: 'text-green-600' },
              { label: 'Avg Absenteeism', value: '6.1%', color: 'text-red-500' },
              { label: 'Late Arrival Rate', value: '4.8%', color: 'text-amber-600' },
              { label: 'Shift Utilization', value: '92%', color: 'text-blue-600' },
            ]?.map((s) => (
              <div key={s?.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
                <p className={`text-2xl font-black ${s?.color}`}>{s?.value}</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">{s?.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#0f1f2e] mb-4">Absenteeism Rate Trend (Weekly)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={absenteeismData}>
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12 }} formatter={(v) => [`${v}%`, 'Absenteeism']} />
                <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={2.5} dot={{ fill: '#ef4444', r: 4 }} name="Absenteeism %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {activeTab === 'Talent' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Open Positions', value: '4', color: 'text-[#2D7A4F]' },
              { label: 'Offer Acceptance Rate', value: '75%', color: 'text-blue-600' },
              { label: 'Avg Time-to-Hire', value: '18 days', color: 'text-amber-600' },
              { label: 'Hiring Funnel Drop', value: '29%', color: 'text-red-500' },
            ]?.map((s) => (
              <div key={s?.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
                <p className={`text-2xl font-black ${s?.color}`}>{s?.value}</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">{s?.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#0f1f2e] mb-4">Hiring Funnel</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hiringFunnel} layout="vertical" barSize={20}>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12 }} />
                <Bar dataKey="count" fill="#2D7A4F" radius={[0, 4, 4, 0]} name="Candidates" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {activeTab === 'Payroll' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Payroll (Mar)', value: '₹1.24 Cr', color: 'text-[#0f1f2e]' },
              { label: 'Avg Cost/Employee', value: '₹50,000', color: 'text-[#2D7A4F]' },
              { label: 'Payroll Growth', value: '+2.1%', color: 'text-blue-600' },
              { label: 'Variable Pay %', value: '18%', color: 'text-purple-600' },
            ]?.map((s) => (
              <div key={s?.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
                <p className={`text-xl font-black ${s?.color}`}>{s?.value}</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">{s?.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#0f1f2e] mb-4">Department-wise Payroll Cost (%)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={salaryCostData} barSize={28}>
                <XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12 }} formatter={(v) => [`${v}%`, 'Cost Share']} />
                <Bar dataKey="cost" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Cost %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {activeTab === 'Custom Reports' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-[#0f1f2e] mb-4">Build Custom Report</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Module</label>
                <select className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F]">
                  <option>Attendance</option>
                  <option>Employees</option>
                  <option>Payroll</option>
                  <option>Talent</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Date Range</label>
                <select className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F]">
                  <option>This Month</option>
                  <option>Last Month</option>
                  <option>This Quarter</option>
                  <option>Custom Range</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Department</label>
                <select className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F]">
                  <option>All Departments</option>
                  <option>Engineering</option>
                  <option>Sales</option>
                  <option>HR</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors">
                <Filter size={14} /> Generate Report
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                <Download size={14} /> Export CSV
              </button>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-[#0f1f2e] mb-4">Scheduled Reports</h3>
            <div className="space-y-3">
              {[
                { name: 'Weekly Attendance Summary', schedule: 'Every Monday 8:00 AM', recipients: 'admin@impactree.in', active: true },
                { name: 'Monthly Payroll Report', schedule: '1st of every month', recipients: 'finance@impactree.in', active: true },
                { name: 'Quarterly Attrition Report', schedule: 'End of quarter', recipients: 'ceo@impactree.in', active: false },
              ]?.map((report, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{report?.name}</p>
                    <p className="text-xs text-gray-500">{report?.schedule} · To: {report?.recipients}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${report?.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {report?.active ? 'Active' : 'Paused'}
                  </span>
                  <button className="text-xs font-semibold text-[#2D7A4F] hover:underline">Edit</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
