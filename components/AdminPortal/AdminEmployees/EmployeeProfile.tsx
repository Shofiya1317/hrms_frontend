'use client';

import React from 'react';
import { Search, Plus, Download, Upload, Mail, Phone, Building2, MapPin, Eye, Edit, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
interface Employee {
  id: string;
  name: string;
  avatar: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  manager: string;
  managerId: string | null;
  joinDate: string;
  status: 'active' | 'inactive' | 'on-leave';
  employeeId: string;
}

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-600', icon: XCircle },
  'on-leave': { label: 'On Leave', color: 'bg-amber-100 text-amber-700', icon: Clock },
};

interface EmployeeProfileProps {
  employee: Employee | null;
  managerNames: Record<string, string>;
}

export default function EmployeeProfile({ employee, managerNames }: EmployeeProfileProps) {
  if (!employee) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <p className="text-sm text-gray-400">Select an employee from the Registry to view their profile.</p>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[employee.status];
  const managerName = employee.managerId ? (managerNames[employee.managerId] || employee.manager || '—') : '—';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-[#2D7A4F] to-[#1e5c3a] p-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3 border-2 border-white/30">
            <span className="text-white text-2xl font-black">{employee.avatar}</span>
          </div>
          <h2 className="text-white font-bold text-lg">{employee.name}</h2>
          <p className="text-white/70 text-sm mt-0.5">{employee.role}</p>
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full mt-3 ${statusCfg.color}`}>
            <statusCfg.icon size={11} />
            {statusCfg.label}
          </span>
        </div>
        <div className="p-4 space-y-3">
          {[
            { icon: Mail, label: employee.email || '—' },
            { icon: Phone, label: employee.phone || '—' },
            { icon: Building2, label: employee.department || '—' },
            { icon: MapPin, label: employee.location || '—' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#e8f5ee] flex items-center justify-center">
                <item.icon size={13} className="text-[#2D7A4F]" />
              </div>
              <span className="text-sm text-gray-700 font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panels */}
      <div className="lg:col-span-2 space-y-4">
        {/* Job details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#0f1f2e] mb-4">Job Details</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Employee ID', value: employee.employeeId || '—' },
              { label: 'Manager', value: managerName },
              { label: 'Join Date', value: employee.joinDate || '—' },
              { label: 'Department', value: employee.department || '—' },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs text-gray-400 font-medium mb-0.5">{item.label}</p>
                <p className="text-sm font-semibold text-gray-800">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#0f1f2e] mb-4">Attendance Summary (This Month)</h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Present', value: '18', color: 'text-green-600 bg-green-50' },
              { label: 'Absent', value: '2', color: 'text-red-500 bg-red-50' },
              { label: 'Late', value: '3', color: 'text-amber-600 bg-amber-50' },
              { label: 'Leave', value: '1', color: 'text-blue-600 bg-blue-50' },
            ].map((item) => (
              <div key={item.label} className={`rounded-xl p-3 text-center ${item.color}`}>
                <p className="text-xl font-black">{item.value}</p>
                <p className="text-xs font-semibold mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Leave balance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#0f1f2e] mb-4">Leave Balance</h3>
          <div className="space-y-3">
            {[
              { type: 'Annual Leave', used: 5, total: 18 },
              { type: 'Sick Leave', used: 2, total: 12 },
              { type: 'Casual Leave', used: 1, total: 6 },
            ].map((leave) => (
              <div key={leave.type}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">{leave.type}</span>
                  <span className="text-xs font-bold text-gray-800">{leave.used}/{leave.total} used</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#2D7A4F] to-[#4a9e6e]"
                    style={{ width: `${(leave.used / leave.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}