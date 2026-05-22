'use client';

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Users,
} from 'lucide-react';
import AddEmployeeModal from '../AddEmployeeModal';

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

interface CreatedEmployee {
  id: string;
  fullName: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  managerName: string;
  managerId: string | null;
  joinDate: string;
  employeeId: string;
}

const STATUS_CONFIG = {
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
  },
  inactive: {
    label: 'Inactive',
    color: 'bg-gray-100 text-gray-600',
    icon: XCircle,
  },
  'on-leave': {
    label: 'On Leave',
    color: 'bg-amber-100 text-amber-700',
    icon: Clock,
  },
};

const DEPARTMENTS = [
  'All Departments',
  'Engineering',
  'Human Resources',
  'Sales',
  'Finance',
  'Operations',
  'Quality Assurance',
  'Executive',
];
const STATUSES = ['All Status', 'active', 'inactive', 'on-leave'];

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
];

export default function EmployeesRegistry() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleEmployeeAdded = (created: CreatedEmployee) => {
    const initials = created.fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const joinMonth = new Date(created.joinDate).toLocaleString('default', {
      month: 'short',
      year: 'numeric',
    });

    const newEmployee: Employee = {
      id: created.id,
      name: created.fullName,
      avatar: initials,
      role: created.role === 'manager' ? 'Manager' : 'Employee',
      department: created.department,
      email: created.email,
      phone: created.phone || '',
      location: created.location || '',
      manager: created.managerName || '',
      managerId: created.managerId || null,
      joinDate: joinMonth,
      status: 'active',
      employeeId: created.employeeId,
    };

    setEmployees([newEmployee, ...employees]);
  };

  const handleDeleteEmployee = (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      setEmployees(employees.filter((emp) => emp.id !== id));
    }
  };

  const filtered = employees.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase());
    const matchDept =
      deptFilter === 'All Departments' || e.department === deptFilter;
    const matchStatus =
      statusFilter === 'All Status' || e.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  return (
    <>
      <div className='mb-5 p-3'>
        {/* Page Title */}
        <div className="mb-6 p-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2D7A4F] to-[#1e5c3a] flex items-center justify-center">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0f1f2e]">Employees Registry</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage and track all employee information in one place
              </p>
            </div>
          </div>
        </div>

        {/* Header with Add Button */}
        <div className="flex items-center justify-between mb-4 p-2">
          <div className="flex flex-wrap gap-3 flex-1">
            <div className="relative flex-1 min-w-48">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by name, ID, role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all"
              />
            </div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] text-gray-700"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] text-gray-700"
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Download size={14} />
              Export
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors shadow-sm ml-3"
          >
            <Plus size={15} />
            Add Employee
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden m-2">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Department
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Location
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Joined
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-sm text-gray-400"
                    >
                      No employees found. Add your first employee.
                    </td>
                  </tr>
                ) : (
                  filtered.map((emp) => {
                    const statusCfg = STATUS_CONFIG[emp.status];
                    return (
                      <tr
                        key={emp.id}
                        className="hover:bg-gray-50/50 transition-colors group"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2D7A4F] to-[#1e5c3a] flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-bold">
                                {emp.avatar}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {emp.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {emp.employeeId} · {emp.role}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sm text-gray-600">
                            {emp.department}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={12} className="text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {emp.location || '—'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-sm text-gray-600">
                            {emp.joinDate || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.color}`}
                          >
                            <statusCfg.icon size={11} />
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => alert(`View ${emp.name}`)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-[#2D7A4F] hover:bg-[#e8f5ee] transition-colors"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => alert(`Edit ${emp.name}`)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(emp.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Showing {filtered.length} of {employees.length} employees
            </p>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Prev
              </button>
              <button className="px-3 py-1.5 text-xs font-medium text-white bg-[#2D7A4F] rounded-lg">
                1
              </button>
              <button className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleEmployeeAdded}
        />
      )}
    </>
  );
}