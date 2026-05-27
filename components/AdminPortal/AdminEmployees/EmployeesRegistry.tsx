'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Download, Eye, Edit, Trash2,
  CheckCircle, XCircle, Clock, MapPin, Users,
  Mail, Phone, Building2, X,
} from 'lucide-react';
import AddEmployeeModal from '@/components/AdminPortal/AdminEmployees/AddEmployeeModal';
import { getEmployees, deleteEmployee } from '@/lib/service/employee';
import { useParams } from 'next/navigation';

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
  dateOfBirth?: string;
  gender?: string;
  designation?: string;
  employmentType?: string;
}

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-600', icon: XCircle },
  'on-leave': { label: 'On Leave', color: 'bg-amber-100 text-amber-700', icon: Clock },
};

const DEPARTMENTS = [
  'All Departments', 'Engineering', 'Human Resources', 'Sales',
  'Finance', 'Operations', 'Quality Assurance', 'Executive',
];
const STATUSES = ['All Status', 'active', 'inactive', 'on-leave'];

function EmployeeProfileModal({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const statusCfg = STATUS_CONFIG[employee.status];
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-base font-bold text-[#0f1f2e]">Employee Profile</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-[#2D7A4F] to-[#1e5c3a] p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3 border-2 border-white/30">
                <span className="text-white text-xl font-black">{employee.avatar}</span>
              </div>
              <h3 className="text-white font-bold">{employee.name}</h3>
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
          {/* Right */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-[#0f1f2e] mb-4">Job Details</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Employee ID', value: employee.employeeId || '—' },
                  { label: 'Manager', value: employee.manager || '—' },
                  { label: 'Join Date', value: employee.joinDate || '—' },
                  { label: 'Department', value: employee.department || '—' },
                  { label: 'Gender', value: employee.gender || '—' },
                  { label: 'Date of Birth', value: employee.dateOfBirth || '—' },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-xs text-gray-400 font-medium mb-0.5">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-800">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmployeesRegistry() {
  const params = useParams();
  const subdomain = params?.subdomain as string;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      // getEmployees(tenantId, params?, token?)
      const response = await getEmployees(subdomain);
      const raw = response?.data;
      // handle both { success, data: [] } and plain []
      const list: any[] = Array.isArray(raw) ? raw : (raw?.data ?? []);

      setEmployees(list.map((emp: any) => ({
        id: emp.id,
        name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
        avatar: `${emp.first_name?.[0] || ''}${emp.last_name?.[0] || ''}`.toUpperCase(),
        role: emp.role || 'EMPLOYEE',
        department: emp.department?.name || emp.department || '',
        email: emp.email || '',
        phone: emp.personal_phone || '',
        location: emp.location || '',
        manager: emp.reporting_manager?.name || emp.reporting_manager?.first_name || '',
        managerId: emp.reporting_manager_id || null,
        joinDate: emp.date_of_joining
          ? new Date(emp.date_of_joining).toLocaleString('default', { month: 'short', year: 'numeric' })
          : '',
        status: (emp.status as 'active' | 'inactive' | 'on-leave') || 'active',
        employeeId: emp.employee_id || `EMP-${emp.id?.slice(0, 6)}`,
        dateOfBirth: emp.date_of_birth || '',
        gender: emp.gender || '',
        designation: emp.designation?.name || '',
        employmentType: emp.employment_type?.name || '',
      })));
    } catch {
      // silent — table shows empty state
    } finally {
      setLoading(false);
    }
  }, [subdomain]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleEmployeeAdded = () => loadEmployees();

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowAddModal(true);
  };

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    try {
      // deleteEmployee(id, tenantId, token?)
      await deleteEmployee(id, subdomain);
      loadEmployees();
    } catch {
      alert('Failed to delete employee. Please try again.');
    }
  };

  const handleExport = () => {
    const headers = ['Employee ID', 'Name', 'Email', 'Role', 'Department', 'Phone', 'Location', 'Manager', 'Join Date', 'Status'];
    const rows = filtered.map((e) => [e.employeeId, e.name, e.email, e.role, e.department, e.phone, e.location, e.manager, e.joinDate, e.status]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filtered = employees.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All Departments' || e.department === deptFilter;
    const matchStatus = statusFilter === 'All Status' || e.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  return (
    <>
      <div className="mb-5 p-3">
        {/* Title */}
        <div className="mb-6 p-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2D7A4F] to-[#1e5c3a] flex items-center justify-center">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0f1f2e]">Employees Registry</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage and track all employee information in one place</p>
            </div>
          </div>
        </div>

        {/* Filters + Add */}
        <div className="flex items-center justify-between mb-4 p-2">
          <div className="flex flex-wrap gap-3 flex-1">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID, role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all"
              />
            </div>
            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] text-gray-700">
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] text-gray-700">
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <button type="button"
            onClick={() => { setEditingEmployee(null); setShowAddModal(true); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors shadow-sm ml-3">
            <Plus size={15} /> Add Employee
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden m-2">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Department</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-[#2D7A4F] border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-gray-400">Loading employees...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                      No employees found. Add your first employee.
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
                            <button onClick={() => handleViewEmployee(emp)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-[#2D7A4F] hover:bg-[#e8f5ee] transition-colors" title="View Profile">
                              <Eye size={14} />
                            </button>
                            <button onClick={() => handleEditEmployee(emp)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit Employee">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeleteEmployee(emp.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete Employee">
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
            <p className="text-xs text-gray-500">Showing {filtered.length} of {employees.length} employees</p>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <AddEmployeeModal
          onClose={() => { setShowAddModal(false); setEditingEmployee(null); }}
          onSuccess={handleEmployeeAdded}
          editingEmployee={editingEmployee}
          isEditing={!!editingEmployee}
        />
      )}

      {/* View Profile Modal */}
      {showViewModal && selectedEmployee && (
        <EmployeeProfileModal
          employee={selectedEmployee}
          onClose={() => { setShowViewModal(false); setSelectedEmployee(null); }}
        />
      )}
    </>
  );
}
