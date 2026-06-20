'use client';

import React, { useState } from 'react';

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

const typeConfig: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-red-100 text-red-700',
  'on-leave': 'bg-amber-100 text-amber-700',
};

const eventLabel: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  'on-leave': 'On Leave',
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
    employeeId: 'EMP-001',
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
    employeeId: 'EMP-002',
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
    employeeId: 'EMP-003',
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
    employeeId: 'EMP-004',
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
    employeeId: 'EMP-005',
  },
];

export default function EmployeeLifecycle() {
  const [employees] = useState<Employee[]>(initialEmployees);
  const recentEmployees = employees.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      <h3 className="text-sm font-bold text-[#0f1f2e]">Employment Lifecycle Events</h3>
      {recentEmployees.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No employees found.</p>
      ) : (
        <div className="space-y-3">
          {recentEmployees.map((emp) => (
            <div key={emp.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2D7A4F] to-[#1e5c3a] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">{emp.avatar}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{emp.name}</p>
                <p className="text-xs text-gray-500">
                  {emp.role}
                  {' '}
                  ·
                  {' '}
                  {emp.department || 'N/A'}
                </p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeConfig[emp.status]}`}>
                {eventLabel[emp.status]}
              </span>
              <span className="text-xs text-gray-400 font-medium">{emp.joinDate || '—'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
