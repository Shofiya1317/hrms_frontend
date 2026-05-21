'use client';

import React, { useState } from 'react';
import { Plus, CheckCircle, XCircle, Clock } from 'lucide-react';

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

// Static employee data
const initialEmployees: Employee[] = [
  { 
    id: '1', 
    name: 'Arjun Mehta', 
    avatar: 'AM', 
    role: 'Admin', 
    department: 'Management', 
    email: 'admin@impactree.in', 
    phone: '', 
    location: 'Bengaluru', 
    manager: '', 
    managerId: null, 
    joinDate: 'Jan 2024', 
    status: 'active', 
    employeeId: 'EMP-001' 
  },
  { 
    id: '2', 
    name: 'Rahul Sharma', 
    avatar: 'RS', 
    role: 'Manager', 
    department: 'Operations', 
    email: 'manager@impactree.in', 
    phone: '', 
    location: 'Mumbai', 
    manager: 'Arjun Mehta', 
    managerId: '1', 
    joinDate: 'Mar 2024', 
    status: 'active', 
    employeeId: 'EMP-002' 
  },
  { 
    id: '3', 
    name: 'Ananya Krishnan', 
    avatar: 'AK', 
    role: 'Employee', 
    department: 'Engineering', 
    email: 'employee@impactree.in', 
    phone: '', 
    location: 'Bengaluru', 
    manager: 'Rahul Sharma', 
    managerId: '2', 
    joinDate: 'Jun 2024', 
    status: 'active', 
    employeeId: 'EMP-003' 
  },
  { 
    id: '4', 
    name: 'Priya Patel', 
    avatar: 'PP', 
    role: 'Lead', 
    department: 'Sales', 
    email: 'priya@impactree.in', 
    phone: '', 
    location: 'Mumbai', 
    manager: 'Rahul Sharma', 
    managerId: '2', 
    joinDate: 'Feb 2024', 
    status: 'active', 
    employeeId: 'EMP-004' 
  },
  { 
    id: '5', 
    name: 'Vikram Singh', 
    avatar: 'VS', 
    role: 'Employee', 
    department: 'Quality Assurance', 
    email: 'vikram@impactree.in', 
    phone: '', 
    location: 'Bengaluru', 
    manager: 'Ananya Krishnan', 
    managerId: '3', 
    joinDate: 'Jan 2025', 
    status: 'on-leave', 
    employeeId: 'EMP-005' 
  },
  { 
    id: '6', 
    name: 'Neha Gupta', 
    avatar: 'NG', 
    role: 'Employee', 
    department: 'Finance', 
    email: 'neha@impactree.in', 
    phone: '', 
    location: 'Delhi', 
    manager: 'Arjun Mehta', 
    managerId: '1', 
    joinDate: 'Aug 2024', 
    status: 'active', 
    employeeId: 'EMP-006' 
  },
  { 
    id: '7', 
    name: 'Rajesh Kumar', 
    avatar: 'RK', 
    role: 'Employee', 
    department: 'IT Support', 
    email: 'rajesh@impactree.in', 
    phone: '', 
    location: 'Bengaluru', 
    manager: 'Ananya Krishnan', 
    managerId: '3', 
    joinDate: 'Oct 2024', 
    status: 'inactive', 
    employeeId: 'EMP-007' 
  },
  { 
    id: '8', 
    name: 'Sneha Reddy', 
    avatar: 'SR', 
    role: 'Manager', 
    department: 'Human Resources', 
    email: 'sneha@impactree.in', 
    phone: '', 
    location: 'Hyderabad', 
    manager: 'Arjun Mehta', 
    managerId: '1', 
    joinDate: 'Apr 2024', 
    status: 'active', 
    employeeId: 'EMP-008' 
  },
];

export default function IDManagement() {
  const [employees] = useState<Employee[]>(initialEmployees);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#0f1f2e]">Employee ID Management</h3>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors">
          <Plus size={14} /> Generate IDs
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'ID Format', value: 'EMP-YYYY-NNN', desc: 'Auto-incremented format' },
          { label: 'Total Employees', value: `${employees.length}`, desc: 'Active records in database' },
          { label: 'Duplicate Check', value: 'Enabled', desc: 'Real-time validation active' },
        ].map((item) => (
          <div key={item.label} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-400 font-medium mb-1">{item.label}</p>
            <p className="text-base font-bold text-[#0f1f2e]">{item.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">Employee ID</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">Name</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">Joined</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {employees.slice(0, 8).map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50/50">
                <td className="py-2.5 px-3 text-sm font-mono font-semibold text-[#2D7A4F]">{emp.employeeId || '—'}</td>
                <td className="py-2.5 px-3 text-sm text-gray-700">{emp.name}</td>
                <td className="py-2.5 px-3 text-sm text-gray-500">{emp.joinDate || '—'}</td>
                <td className="py-2.5 px-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_CONFIG[emp.status].color}`}>
                    {STATUS_CONFIG[emp.status].label}
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