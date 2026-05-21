'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

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

export default function AttendanceLeave() {
  const [subTab, setSubTab] = useState('Requests');

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[#0f1f2e]">Leave Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">Requests, balances, types and holidays</p>
      </div>

      <div className="flex gap-2">
        {['Requests', 'Leave Types', 'Balances', 'Holidays'].map((t) => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${subTab === t ? 'bg-[#2D7A4F] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {subTab === 'Requests' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-[#0f1f2e]">Leave Requests</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {LEAVE_REQUESTS.map((req) => (
              <div key={req.id} className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2D7A4F] to-[#1e5c3a] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{req.name.split(' ').map((n) => n[0]).join('')}</span>
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

      {subTab === 'Leave Types' && (
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

      {subTab === 'Balances' && (
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
                  <span className="text-white text-[10px] font-bold">{emp.name.split(' ').map((n) => n[0]).join('')}</span>
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

      {subTab === 'Holidays' && (
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