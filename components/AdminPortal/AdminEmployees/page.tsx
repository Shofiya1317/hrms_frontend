'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Download, Upload, Mail, Phone, Building2, MapPin, Eye, Edit, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useParams } from 'next/navigation';
import AddEmployeeModal from '../AdminEmployees/AddEmployeeModal';
import { deleteEmployee, getEmployees } from '@/lib/service/employee';

interface Employee {
  id: string;
  name: string;
  avatar: string;
  role: string;
  department: string;
  designation?: string;
  employmentType?: string;
  email: string;
  phone: string;
  location: string;
  manager: string;
  managerId: string | null;
  reporting_manager_id?: string | null;
  joinDate: string;
  status: 'active' | 'inactive' | 'on-leave';
  employeeId: string;
  dateOfBirth?: string | null;
  gender?: string | null;
}

const DEPARTMENTS = ['All Departments', 'Engineering', 'Human Resources', 'Sales', 'Finance', 'Operations', 'Quality Assurance', 'Executive'];
const STATUSES = ['All Status', 'active', 'inactive', 'on-leave'];

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-600', icon: XCircle },
  'on-leave': { label: 'On Leave', color: 'bg-amber-100 text-amber-700', icon: Clock },
};

const TABS = ['Registry', 'Profile', 'ID Management', 'Documents', 'Lifecycle'];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function EmployeesPage() {
  const params = useParams();
  const tenantId = (params?.subdomain as string) || 'tenant-id-placeholder';

  const [activeTab, setActiveTab] = useState('Registry');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getEmployees(tenantId);
      console.log('Employee API response:', response);

      let rawEmployees = [];

      if (Array.isArray(response?.data?.employees)) {
        rawEmployees = response.data.employees;
      } else if (Array.isArray(response?.data?.data?.employees)) {
        rawEmployees = response.data.data.employees;
      } else if (Array.isArray(response?.data?.data)) {
        rawEmployees = response.data.data;
      } else if (Array.isArray(response?.data)) {
        rawEmployees = response.data;
      }

      console.log('Mapped employee list:', rawEmployees);

      if (rawEmployees.length > 0) {
        setEmployees(rawEmployees.map((emp: any) => {
          const statusValue = (emp.status || 'ACTIVE').toLowerCase();
          const name = emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Unknown Employee';
          return {
            id: emp.id,
            name,
            avatar: getInitials(name),
            role: emp.role || 'EMPLOYEE',
            department: emp.department || emp.department_name || 'Unassigned',
            designation: emp.designation || emp.designation_name || '',
            employmentType: emp.employmentType || emp.employment_type || '',
            email: emp.email || emp.work_email || '',
            phone: emp.phone || emp.personal_phone || '',
            location: emp.location || emp.city || emp.country || '',
            manager: emp.reporting_manager_name || emp.managerName || '',
            managerId: emp.reporting_manager_id || emp.managerId || null,
            reporting_manager_id: emp.reporting_manager_id || null,
            joinDate: emp.joinDate || (emp.date_of_joining
              ? new Date(emp.date_of_joining).toLocaleString('default', { month: 'short', year: 'numeric' })
              : ''),
            status: (statusValue === 'active' || statusValue === 'inactive' || statusValue === 'on-leave')
              ? statusValue as 'active' | 'inactive' | 'on-leave'
              : 'active',
            employeeId: emp.employeeId || emp.employee_code || emp.employee_id || `EMP-${String(emp.id || '').slice(0, 6)}`,
            dateOfBirth: emp.dateOfBirth || emp.date_of_birth || null,
            gender: emp.gender || null,
          };
        }));
        return;
      }

      console.warn('No employee data returned from service.');
      setEmployees([]);
    } catch (err: any) {
      console.error('Failed to load employees:', err);
      setEmployees([]);
      setError(err?.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowAddModal(true);
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    try {
      await deleteEmployee(id, tenantId);
      await fetchEmployees();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete employee');
    }
  };

  const handleEmployeeCreated = (created: any) => {
    const fullName = created.fullName || `${created.first_name || ''} ${created.last_name || ''}`.trim() || 'Employee';
    const initials = getInitials(fullName);
    const rawDate = created.date_of_joining || created.joinDate;
    const joinMonth = rawDate
      ? new Date(rawDate).toLocaleString('default', { month: 'short', year: 'numeric' })
      : '';

    const newEmployee: Employee = {
      id: created.id,
      name: fullName,
      avatar: initials,
      role: created.role === 'manager' ? 'Manager' : 'Employee',
      department: created.department || created.department?.name || '',
      email: created.email || created.work_email || '',
      phone: created.phone || created.personal_phone || '',
      location: created.location || '',
      manager: created.managerName || '',
      managerId: created.managerId || null,
      joinDate: joinMonth,
      status: 'active',
      employeeId: created.employeeId || created.employee_code || `EMP-${String(created.id || '').slice(0, 6)}`,
    };

    setEmployees((prev) => [newEmployee, ...prev]);
  };

  const filtered = employees.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All Departments' || e.department === deptFilter;
    const matchStatus = statusFilter === 'All Status' || e.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  return (
    <div className="space-y-5 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0f1f2e]">Employees</h1>
          <p className="text-sm text-gray-500 mt-0.5">Single source of truth · {employees.length} total records</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 sm:w-auto">
            <Upload size={15} />
            <span className="hidden sm:inline">Bulk Upload</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2D7A4F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1e5c3a] sm:w-auto"
          >
            <Plus size={15} />
            Add Employee
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex w-full gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1 sm:w-fit">
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

      {activeTab === 'Registry' && (
        <>
          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <div className="relative min-w-0 flex-1 sm:min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-[#2D7A4F] focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 sm:w-auto"
            >
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-[#2D7A4F] focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 sm:w-auto"
            >
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 sm:w-auto">
              <Download size={14} />
              Export
            </button>
          </div>

          {/* Loading / Error */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-[#2D7A4F] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Loading employees…</p>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={fetchEmployees} className="font-semibold underline ml-3">Retry</button>
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Department</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Manager</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Location</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                          {employees.length === 0 ? 'No employees found. Add your first employee.' : 'No results match your filters.'}
                        </td>
                      </tr>
                    ) : (
                      filtered.map((emp) => {
                        const statusCfg = STATUS_CONFIG[emp.status];
                        return (
                          <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2D7A4F] to-[#1e5c3a] flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-xs font-bold">{emp.avatar}</span>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{emp.name}</p>
                                  <p className="text-xs text-gray-400">{emp.employeeId} · {emp.role}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              <span className="text-sm text-gray-600">{emp.department}</span>
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell">
                              <span className="text-sm text-gray-600">{emp.manager || '—'}</span>
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell">
                              <div className="flex items-center gap-1.5">
                                <MapPin size={12} className="text-gray-400" />
                                <span className="text-sm text-gray-600">{emp.location || '—'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell">
                              <span className="text-sm text-gray-600">{emp.joinDate || '—'}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.color}`}>
                                <statusCfg.icon size={11} />
                                {statusCfg.label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => { setSelectedEmployee(emp); setActiveTab('Profile'); }}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#2D7A4F] hover:bg-[#e8f5ee] transition-colors"
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  onClick={() => handleEditEmployee(emp)}
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
              <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-gray-500">Showing {filtered.length} of {employees.length} employees</p>
                <div className="flex items-center gap-1">
                  <button className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Prev</button>
                  <button className="px-3 py-1.5 text-xs font-medium text-white bg-[#2D7A4F] rounded-lg">1</button>
                  <button className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Next</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'Profile' && (
        <EmployeeProfile employee={selectedEmployee || employees[0] || null} managerNames={{}} />
      )}

      {activeTab === 'ID Management' && <IDManagement employees={employees} />}
      {activeTab === 'Documents' && <DocumentManagement />}
      {activeTab === 'Lifecycle' && <EmployeeLifecycle employees={employees} />}

      {/* Add Employee Modal */}
      {showAddModal && (
        <AddEmployeeModal
          onClose={() => {
            setShowAddModal(false);
            setEditingEmployee(null);
          }}
          onSuccess={(created) => {
            if (editingEmployee) {
              setShowAddModal(false);
              setEditingEmployee(null);
              fetchEmployees();
              return;
            }
            handleEmployeeCreated(created);
          }}
          editingEmployee={editingEmployee || undefined}
          isEditing={Boolean(editingEmployee)}
        />
      )}
    </div>
  );
}

function EmployeeProfile({ employee, managerNames }: Readonly<{ employee: Employee | null; managerNames: Record<string, string> }>) {
  if (!employee) {
    return (
      <div className="rounded-lg border border-gray-100 bg-white p-8 text-center shadow-sm sm:p-12">
        <p className="text-sm text-gray-400">Select an employee from the Registry to view their profile.</p>
      </div>
    );
  }
  const statusCfg = STATUS_CONFIG[employee.status];
  const managerName = employee.manager || '—';
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      {/* Left card */}
      <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
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
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#e8f5ee] flex items-center justify-center">
                <item.icon size={13} className="text-[#2D7A4F]" />
              </div>
              <span className="text-sm text-gray-700 font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panels */}
      <div className="space-y-4 xl:col-span-2">
        {/* Job details */}
        <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <h3 className="text-sm font-bold text-[#0f1f2e] mb-4">Job Details</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <h3 className="text-sm font-bold text-[#0f1f2e] mb-4">Attendance Summary (This Month)</h3>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
        <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
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

function IDManagement({ employees }: Readonly<{ employees: Employee[] }>) {
  return (
    <div className="space-y-6 rounded-lg border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-bold text-[#0f1f2e]">Employee ID Management</h3>
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2D7A4F] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1e5c3a] sm:w-auto">
          <Plus size={14} /> Generate IDs
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
        <table className="w-full min-w-[560px]">
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

function DocumentManagement(): JSX.Element {
  const docs = [
    { name: 'Offer Letter - New Employee.pdf', tag: 'HR', size: '245 KB', date: 'Mar 2026', expiry: null },
    { name: 'Aadhaar Card - Employee.pdf', tag: 'KYC', size: '1.2 MB', date: 'Jan 2026', expiry: 'Dec 2030' },
    { name: 'PAN Card - Employee.pdf', tag: 'KYC', size: '890 KB', date: 'Jun 2025', expiry: null },
    { name: 'NDA Agreement - Employee.pdf', tag: 'Legal', size: '320 KB', date: 'Sep 2025', expiry: 'Sep 2028' },
    { name: 'Salary Slip - Feb 2026.pdf', tag: 'HR', size: '180 KB', date: 'Feb 2026', expiry: null },
  ];
  const tagColors: Record<string, string> = {
    KYC: 'bg-blue-100 text-blue-700',
    HR: 'bg-green-100 text-green-700',
    Legal: 'bg-purple-100 text-purple-700',
  };
  return (
    <div className="space-y-4 rounded-lg border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-bold text-[#0f1f2e]">Document Management</h3>
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2D7A4F] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1e5c3a] sm:w-auto">
          <Upload size={14} /> Upload Document
        </button>
      </div>
      <div className="space-y-2">
        {docs.map((doc) => (
          <div key={doc.name} className="group flex flex-col gap-3 rounded-xl bg-gray-50 p-3 transition-colors hover:bg-gray-100 sm:flex-row sm:items-center">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <span className="text-red-500 text-xs font-bold">PDF</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{doc.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${tagColors[doc.tag]}`}>{doc.tag}</span>
                <span className="text-xs text-gray-400">{doc.size} · {doc.date}</span>
                {doc.expiry && <span className="text-xs text-amber-600 font-medium">Expires {doc.expiry}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
              <button className="p-1.5 rounded-lg text-gray-400 hover:text-[#2D7A4F] hover:bg-[#e8f5ee] transition-colors"><Download size={14} /></button>
              <button className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmployeeLifecycle({ employees }: Readonly<{ employees: Employee[] }>) {
  const recentEmployees = employees.slice(0, 5);
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
  return (
    <div className="space-y-4 rounded-lg border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <h3 className="text-sm font-bold text-[#0f1f2e]">Employment Lifecycle Events</h3>
      {recentEmployees.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No employees found.</p>
      ) : (
        <div className="space-y-3">
          {recentEmployees.map((emp) => (
            <div key={emp.id} className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 sm:flex-row sm:items-center sm:gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2D7A4F] to-[#1e5c3a] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">{emp.avatar}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800">{emp.name}</p>
                <p className="text-xs text-gray-500">{emp.role} · {emp.department || 'N/A'}</p>
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
