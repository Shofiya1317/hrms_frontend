'use client';

import React, { useState } from 'react';
import { Download, Filter, TrendingUp, TrendingDown, Users, Calendar, DollarSign, Clock, PieChart as PieChartIcon, BarChart3, LineChart as LineChartIcon } from 'lucide-react';
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
  { name: 'Engineering', value: 98, color: '#0f766e' },
  { name: 'Sales', value: 42, color: '#f59e0b' },
  { name: 'Operations', value: 38, color: '#0ea5e9' },
  { name: 'Finance', value: 28, color: '#8b5cf6' },
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
    <div className="min-h-screen bg-slate-50">
      <div className="p-4 sm:p-5 lg:p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Analytics</h1>
            <p className="text-sm text-slate-500 mt-0.5">Cross-module intelligence · Data-driven decisions</p>
          </div>
        </div>

        {/* Tabs - Responsive grid on mobile */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                activeTab === tab
                  ? 'bg-[#0f766e] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-teal-200 hover:text-teal-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Workforce Tab */}
        {activeTab === 'Workforce' && (
          <div className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Total Headcount', value: '248', sub: '+6 this month', icon: Users, trend: 'up' },
                { label: 'Avg Tenure', value: '2.4 yrs', sub: 'Stable', icon: Clock, trend: 'stable' },
                { label: 'Attrition Rate', value: '4.2%', sub: '-0.8% vs last yr', icon: TrendingDown, trend: 'down' },
                { label: 'New Hires (YTD)', value: '18', sub: 'Jan–Mar 2026', icon: Users, trend: 'up' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                      <p className="text-xs font-medium text-slate-600 mt-1">{s.label}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{s.sub}</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                      <s.icon size={16} className="text-teal-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  {/* Headcount Trend Chart */}
  <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center">
        <LineChartIcon size={14} className="text-teal-600" />
      </div>
      <h3 className="text-sm font-bold text-slate-900">Headcount Trend (6 months)</h3>
    </div>
    <div className="w-full h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={headcountData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="headcountGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0f766e" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[220, 260]} />
          <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', fontSize: 12 }} />
          <Area type="monotone" dataKey="count" stroke="#0f766e" strokeWidth={2.5} fill="url(#headcountGrad)" name="Headcount" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>

  {/* Department Distribution Chart */}
  <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center">
        <PieChartIcon size={14} className="text-teal-600" />
      </div>
      <h3 className="text-sm font-bold text-slate-900">Department Distribution</h3>
    </div>
    
    {/* Fixed layout for pie chart + legend */}
    <div className="flex flex-col sm:flex-row items-center gap-4">
      {/* Pie Chart - Fixed width */}
      <div className="w-full sm:w-[180px] md:w-[200px] h-[180px] flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={deptDistribution} 
              cx="50%" 
              cy="50%" 
              innerRadius={45} 
              outerRadius={70} 
              dataKey="value" 
              paddingAngle={3}
            >
              {deptDistribution.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend - Scrollable on mobile if needed */}
      <div className="flex-1 w-full">
        <div className="grid grid-cols-2 gap-2">
          {deptDistribution.map((d) => (
            <div key={d.name} className="flex items-center gap-2 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-xs text-slate-600 flex-1 truncate">{d.name}</span>
              <span className="text-xs font-bold text-slate-800 flex-shrink-0">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'Attendance' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Avg Attendance Rate', value: '88.4%', color: 'text-teal-600', icon: Calendar },
                { label: 'Avg Absenteeism', value: '6.1%', color: 'text-red-500', icon: TrendingDown },
                { label: 'Late Arrival Rate', value: '4.8%', color: 'text-amber-600', icon: Clock },
                { label: 'Shift Utilization', value: '92%', color: 'text-blue-600', icon: Users },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
                  <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center bg-slate-50">
                    <s.icon size={18} className={s.color} />
                  </div>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center">
                  <LineChartIcon size={14} className="text-teal-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Absenteeism Rate Trend (Weekly)</h3>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={absenteeismData}>
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} formatter={(v) => [`${v}%`, 'Absenteeism']} />
                  <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={2.5} dot={{ fill: '#ef4444', r: 4 }} name="Absenteeism %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Talent Tab */}
        {activeTab === 'Talent' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Open Positions', value: '4', icon: Users, color: 'text-teal-600' },
                { label: 'Offer Acceptance Rate', value: '75%', icon: TrendingUp, color: 'text-blue-600' },
                { label: 'Avg Time-to-Hire', value: '18 days', icon: Clock, color: 'text-amber-600' },
                { label: 'Hiring Funnel Drop', value: '29%', icon: TrendingDown, color: 'text-red-500' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs font-medium text-slate-600 mt-1">{s.label}</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                      <s.icon size={16} className="text-teal-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center">
                  <BarChart3 size={14} className="text-teal-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Hiring Funnel</h3>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={hiringFunnel} layout="vertical" barSize={24}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="stage" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Bar dataKey="count" fill="#0f766e" radius={[0, 6, 6, 0]} name="Candidates" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Payroll Tab */}
        {activeTab === 'Payroll' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Total Payroll (Mar)', value: '₹1.24 Cr', icon: DollarSign, color: 'text-slate-900' },
                { label: 'Avg Cost/Employee', value: '₹50,000', icon: Users, color: 'text-teal-600' },
                { label: 'Payroll Growth', value: '+2.1%', icon: TrendingUp, color: 'text-blue-600' },
                { label: 'Variable Pay %', value: '18%', icon: PieChartIcon, color: 'text-purple-600' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs font-medium text-slate-600 mt-1">{s.label}</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                      <s.icon size={16} className="text-teal-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center">
                  <BarChart3 size={14} className="text-teal-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Department-wise Payroll Cost (%)</h3>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={salaryCostData} barSize={32}>
                  <XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} formatter={(v) => [`${v}%`, 'Cost Share']} />
                  <Bar dataKey="cost" fill="#0f766e" radius={[6, 6, 0, 0]} name="Cost %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Custom Reports Tab */}
        {activeTab === 'Custom Reports' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Build Custom Report</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Module</label>
                  <select className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500">
                    <option>Attendance</option>
                    <option>Employees</option>
                    <option>Payroll</option>
                    <option>Talent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date Range</label>
                  <select className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500">
                    <option>This Month</option>
                    <option>Last Month</option>
                    <option>This Quarter</option>
                    <option>Custom Range</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
                  <select className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500">
                    <option>All Departments</option>
                    <option>Engineering</option>
                    <option>Sales</option>
                    <option>HR</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors">
                  <Filter size={14} /> Generate Report
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                  <Download size={14} /> Export CSV
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Scheduled Reports</h3>
              <div className="space-y-3">
                {[
                  { name: 'Weekly Attendance Summary', schedule: 'Every Monday 8:00 AM', recipients: 'admin@impactree.in', active: true },
                  { name: 'Monthly Payroll Report', schedule: '1st of every month', recipients: 'finance@impactree.in', active: true },
                  { name: 'Quarterly Attrition Report', schedule: 'End of quarter', recipients: 'ceo@impactree.in', active: false },
                ].map((report, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">{report.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{report.schedule} · To: {report.recipients}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${report.active ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>
                        {report.active ? 'Active' : 'Paused'}
                      </span>
                      <button className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline">Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}