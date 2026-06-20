'use client';

import React, { useState } from 'react';
import {
  Download, Play, CheckCircle, AlertCircle, Plus,
} from 'lucide-react';

const TABS = ['Salary Structure', 'Processing', 'Compliance', 'Payslips', 'Reimbursements', 'Reports'];

const SALARY_COMPONENTS = [
  {
    component: 'Basic Salary', type: 'Fixed', percentage: '40% of CTC', taxable: true,
  },
  {
    component: 'HRA', type: 'Fixed', percentage: '20% of Basic', taxable: false,
  },
  {
    component: 'Special Allowance', type: 'Fixed', percentage: '20% of CTC', taxable: true,
  },
  {
    component: 'Performance Bonus', type: 'Variable', percentage: 'Up to 15% of CTC', taxable: true,
  },
  {
    component: 'PF Contribution', type: 'Deduction', percentage: '12% of Basic', taxable: false,
  },
  {
    component: 'Professional Tax', type: 'Deduction', percentage: '₹200/month', taxable: false,
  },
];

const PAYROLL_RUNS = [
  {
    month: 'February 2026', employees: 247, gross: '₹1.24 Cr', net: '₹1.09 Cr', status: 'processed', date: '28 Feb 2026',
  },
  {
    month: 'January 2026', employees: 246, gross: '₹1.23 Cr', net: '₹1.08 Cr', status: 'processed', date: '31 Jan 2026',
  },
  {
    month: 'December 2025', employees: 244, gross: '₹1.21 Cr', net: '₹1.07 Cr', status: 'processed', date: '31 Dec 2025',
  },
];

const REIMBURSEMENTS = [
  {
    name: 'Rahul Sharma', type: 'Travel', amount: '₹4,200', date: '15 Mar 2026', status: 'pending',
  },
  {
    name: 'Priya Nair', type: 'Medical', amount: '₹8,500', date: '12 Mar 2026', status: 'approved',
  },
  {
    name: 'Kavya Menon', type: 'Internet', amount: '₹1,200', date: '10 Mar 2026', status: 'approved',
  },
  {
    name: 'Arjun Das', type: 'Travel', amount: '₹3,800', date: '08 Mar 2026', status: 'pending',
  },
];

export default function PayrollPage() {
  const [activeTab, setActiveTab] = useState('Salary Structure');

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0f1f2e]">Payroll</h1>
          <p className="text-sm text-gray-500 mt-0.5">Module 3 · Salary, Compliance & Payslips</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-purple-100 text-purple-700">Phase 3</span>
      </div>
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {TABS?.map((tab) => (
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
      {activeTab === 'Salary Structure' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Avg CTC', value: '₹12.4L', sub: 'Per annum' },
              { label: 'Total Payroll', value: '₹1.24 Cr', sub: 'This month' },
              { label: 'Fixed Cost', value: '₹1.02 Cr', sub: '82% of payroll' },
              { label: 'Variable Cost', value: '₹22L', sub: '18% of payroll' },
            ]?.map((s) => (
              <div key={s?.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <p className="text-xl font-black text-[#0f1f2e]">{s?.value}</p>
                <p className="text-xs font-semibold text-gray-700 mt-0.5">{s?.label}</p>
                <p className="text-[10px] text-gray-400">{s?.sub}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0f1f2e]">Salary Components</h3>
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors">
                <Plus size={14} />
                {' '}
                Add Component
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    {['Component', 'Type', 'Calculation', 'Taxable']?.map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {SALARY_COMPONENTS?.map((comp) => (
                    <tr key={comp?.component} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">{comp?.component}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          comp?.type === 'Fixed' ? 'bg-blue-100 text-blue-700'
                            : comp?.type === 'Variable' ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-700'
                        }`}
                        >
                          {comp?.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{comp?.percentage}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${comp?.taxable ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                          {comp?.taxable ? 'Taxable' : 'Exempt'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'Processing' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#0f1f2e]">Run Payroll · March 2026</h3>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors">
                <Play size={14} />
                {' '}
                Run Payroll
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {[
                { label: 'Employees', value: '248' },
                { label: 'Attendance Linked', value: '248' },
                { label: 'Deductions Computed', value: '248' },
                { label: 'Ready to Process', value: '248' },
              ]?.map((s) => (
                <div key={s?.label} className="p-3 rounded-xl bg-gray-50 text-center">
                  <p className="text-xl font-black text-[#2D7A4F]">{s?.value}</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">{s?.label}</p>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-xl bg-[#e8f5ee] border border-[#2D7A4F]/20">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-[#2D7A4F]" />
                <p className="text-sm font-semibold text-[#1e5c3a]">All pre-checks passed. Ready to process March 2026 payroll.</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-[#0f1f2e]">Payroll History</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {PAYROLL_RUNS?.map((run) => (
                <div key={run?.month} className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#e8f5ee] flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={18} className="text-[#2D7A4F]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">{run?.month}</p>
                    <p className="text-xs text-gray-500">
                      {run?.employees}
                      {' '}
                      employees · Processed
                      {' '}
                      {run?.date}
                    </p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-gray-800">{run?.gross}</p>
                    <p className="text-xs text-gray-400">
                      Gross · Net:
                      {run?.net}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">{run?.status}</span>
                  <button className="p-1.5 rounded-lg text-gray-400 hover:text-[#2D7A4F] hover:bg-[#e8f5ee] transition-colors">
                    <Download size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {activeTab === 'Compliance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: 'Provident Fund (PF)', desc: 'Employee & employer contribution at 12% of basic salary', status: 'Compliant', detail: 'Last filed: Feb 2026', color: 'green',
            },
            {
              title: 'ESI (Employee State Insurance)', desc: 'Applicable for employees earning ≤ ₹21,000/month', status: 'Compliant', detail: 'Last filed: Feb 2026', color: 'green',
            },
            {
              title: 'TDS (Tax Deducted at Source)', desc: 'Monthly TDS computation and quarterly filing', status: 'Due Soon', detail: 'Q4 filing due: 31 Mar 2026', color: 'amber',
            },
            {
              title: 'Professional Tax', desc: '₹200/month per employee (Karnataka slab)', status: 'Compliant', detail: 'Last filed: Feb 2026', color: 'green',
            },
          ]?.map((comp) => (
            <div key={comp?.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-bold text-[#0f1f2e]">{comp?.title}</h3>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${comp?.color === 'green' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {comp?.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">{comp?.desc}</p>
              <div className={`flex items-center gap-2 p-2.5 rounded-xl ${comp?.color === 'green' ? 'bg-green-50' : 'bg-amber-50'}`}>
                {comp?.color === 'green' ? <CheckCircle size={13} className="text-green-600" /> : <AlertCircle size={13} className="text-amber-600" />}
                <span className={`text-xs font-medium ${comp?.color === 'green' ? 'text-green-700' : 'text-amber-700'}`}>{comp?.detail}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {activeTab === 'Payslips' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0f1f2e]">Payslip Generation</h3>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                <Download size={14} />
                {' '}
                Bulk Download
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {['Employee', 'Month', 'Gross', 'Deductions', 'Net Pay', 'Actions']?.map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  {
                    name: 'Rahul Sharma', month: 'Feb 2026', gross: '₹1,04,167', deductions: '₹14,200', net: '₹89,967',
                  },
                  {
                    name: 'Priya Nair', month: 'Feb 2026', gross: '₹83,333', deductions: '₹11,800', net: '₹71,533',
                  },
                  {
                    name: 'Ananya Krishnan', month: 'Feb 2026', gross: '₹62,500', deductions: '₹9,200', net: '₹53,300',
                  },
                  {
                    name: 'Vikram Patel', month: 'Feb 2026', gross: '₹41,667', deductions: '₹6,400', net: '₹35,267',
                  },
                  {
                    name: 'Deepa Iyer', month: 'Feb 2026', gross: '₹91,667', deductions: '₹13,100', net: '₹78,567',
                  },
                ]?.map((slip) => (
                  <tr key={slip?.name} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">{slip?.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{slip?.month}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-700">{slip?.gross}</td>
                    <td className="px-4 py-3 text-sm font-mono text-red-500">{slip?.deductions}</td>
                    <td className="px-4 py-3 text-sm font-mono font-bold text-[#2D7A4F]">{slip?.net}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="text-xs font-semibold text-[#2D7A4F] hover:underline">View</button>
                        <button className="text-xs font-semibold text-gray-500 hover:underline">Email</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'Reimbursements' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0f1f2e]">Expense Reimbursements</h3>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors">
              <Plus size={14} />
              {' '}
              New Claim
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {REIMBURSEMENTS?.map((r, i) => (
              <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2D7A4F] to-[#1e5c3a] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{r?.name?.split(' ')?.map((n) => n?.[0])?.join('')}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{r?.name}</p>
                  <p className="text-xs text-gray-500">
                    {r?.type}
                    {' '}
                    ·
                    {' '}
                    {r?.date}
                  </p>
                </div>
                <span className="text-sm font-bold text-gray-800">{r?.amount}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${r?.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {r?.status}
                </span>
                {r?.status === 'pending' && (
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
      {activeTab === 'Reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Salary Register', desc: 'Complete salary details for all employees', icon: '📊' },
            { title: 'Tax Report (Form 16)', desc: 'Annual TDS certificate for employees', icon: '📋' },
            { title: 'PF Report', desc: 'Monthly PF contribution statement', icon: '🏦' },
            { title: 'ESI Report', desc: 'ESI contribution and challan details', icon: '🏥' },
            { title: 'Department-wise Cost', desc: 'Payroll cost breakdown by department', icon: '🏢' },
            { title: 'Cost Per Employee', desc: 'CTC analysis and cost trends', icon: '💰' },
          ]?.map((report) => (
            <div key={report?.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                {report?.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-[#0f1f2e]">{report?.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{report?.desc}</p>
              </div>
              <button className="flex items-center gap-1.5 text-xs font-semibold text-[#2D7A4F] hover:underline flex-shrink-0">
                <Download size={13} />
                {' '}
                Export
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
