'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Mail,
  Phone,
  Building2,
  X,
  Filter,
  Grid3x3,
  List,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  UserPlus,
  Calendar,
  Briefcase,
  TrendingUp,
  Award,
} from 'lucide-react';
import AddEmployeeModal from '@/components/AdminPortal/AdminEmployees/AddEmployeeModal';
import { getEmployees, deleteEmployee } from '@/lib/service/employee';
import { getDepartments } from '@/lib/service/masters';
import { useParams } from 'next/navigation';

import ProbationTracker from './ProbationTracker';

enum EmploymentStatus {
  ACTIVE = 'ACTIVE',
  ON_NOTICE = 'ON_NOTICE',
  EXITED = 'EXITED',
}

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
  reporting_manager_name?: string;
  joinDate: string;
  status: string;
  employeeId: string;
  dateOfBirth?: string;
  gender?: string;
  designation?: string;
  employmentType?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  ACTIVE: { label: 'Active', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
  active: { label: 'Active', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
  ON_NOTICE: { label: 'On Notice', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  EXITED: { label: 'Exited', color: 'bg-gray-50 text-gray-600 border-gray-200', icon: XCircle },
  INACTIVE: { label: 'Inactive', color: 'bg-gray-50 text-gray-600 border-gray-200', icon: XCircle },
  inactive: { label: 'Inactive', color: 'bg-gray-50 text-gray-600 border-gray-200', icon: XCircle },
  ON_LEAVE: { label: 'On Leave', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  'on-leave': { label: 'On Leave', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  PROBATION: { label: 'Probation', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock },
  TERMINATED: { label: 'Terminated', color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle },
};

const DEFAULT_STATUS = { label: 'Unknown', color: 'bg-gray-50 text-gray-500 border-gray-200', icon: Clock };

// Stats Card Component
function StatCard({
  title, value, icon: Icon, color, bgColor,
}: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <div
          className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}
        >
          <Icon size={18} className={color} />
        </div>
        <span className="text-2xl font-bold text-gray-800">{value}</span>
      </div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-xs text-gray-400 mt-1">vs last month</p>
    </div>
  );
}

// Employee Card View for Mobile
function EmployeeCard({
  employee,
  onView,
  onEdit,
  onDelete,
}: {
  employee: Employee;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const statusCfg = STATUS_CONFIG[employee.status] ?? DEFAULT_STATUS;
  const StatusIcon = statusCfg.icon;
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2D7A4F] to-[#1e5c3a] flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white text-base font-bold">
              {employee.avatar}
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{employee.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {employee.employmentType}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{employee.role}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MoreVertical size={16} className="text-gray-400" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
              <button
                onClick={() => {
                  onView();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2"
              >
                <Eye size={12} />
                {' '}
                View Details
              </button>
              <button
                onClick={() => {
                  onEdit();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit size={12} />
                {' '}
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs hover:bg-red-50 text-red-600 flex items-center gap-2"
              >
                <Trash2 size={12} />
                {' '}
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Building2 size={12} className="text-gray-400 flex-shrink-0" />
          <span className="truncate">{employee.department || '—'}</span>
        </div>
        {employee.designation && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Award size={12} className="text-gray-400 flex-shrink-0" />
            <span className="truncate">{employee.designation}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Mail size={12} className="text-gray-400 flex-shrink-0" />
          <span className="truncate">{employee.email}</span>
        </div>
        {employee.phone && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Phone size={12} className="text-gray-400 flex-shrink-0" />
            <span className="truncate">{employee.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Calendar size={12} className="text-gray-400 flex-shrink-0" />
          <span> 
            Joined {' '}
            {employee.joinDate} 
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusCfg.color}`}
        >
          <StatusIcon size={10} />
          {statusCfg.label}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onView}
            className="p-1.5 rounded-lg text-gray-400 hover:text-[#2D7A4F] hover:bg-emerald-50 transition-colors"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Edit size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function EmployeeProfileModal({
  employee,
  onClose,
}: {
  employee: Employee;
  onClose: () => void;
}) {
  const statusCfg = STATUS_CONFIG[employee.status] ?? DEFAULT_STATUS;
  const StatusIcon = statusCfg.icon;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Employee Profile</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-shrink-0 text-center md:text-left">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#2D7A4F] to-[#1e5c3a] flex items-center justify-center mx-auto md:mx-0 shadow-md">
                <span className="text-white text-2xl font-bold">
                  {employee.avatar}
                </span>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-gray-900">
                {employee.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {employee.employmentType}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border ${statusCfg.color}`}
                >
                  <StatusIcon size={11} />
                  {statusCfg.label}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  <Briefcase size={11} />
                  {employee.role}
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <UserPlus size={14} className="text-[#2D7A4F]" />
                Personal Information
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Email Address</p>
                  <p className="text-sm font-medium text-gray-800 break-words">
                    {employee.email || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone Number</p>
                  <p className="text-sm font-medium text-gray-800">
                    {employee.phone || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date of Birth</p>
                  <p className="text-sm font-medium text-gray-800">
                    {employee.dateOfBirth || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Gender</p>
                  <p className="text-sm font-medium text-gray-800">
                    {employee.gender || '—'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Briefcase size={14} className="text-[#2D7A4F]" />
                Employment Details
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="text-sm font-medium text-gray-800">
                    {employee.department || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Designation</p>
                  <p className="text-sm font-medium text-gray-800">
                    {employee.designation || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Employment Type</p>
                  <p className="text-sm font-medium text-gray-800">
                    {employee.employmentType || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Reporting Manager</p>
                  <p className="text-sm font-medium text-gray-800">
                    {employee.reporting_manager_name || employee.manager || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date of Joining</p>
                  <p className="text-sm font-medium text-gray-800">
                    {employee.joinDate || '—'}
                  </p>
                </div>
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

  const [activeTab, setActiveTab] = useState<'registry' | 'probation'>('registry');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<EmploymentStatus | ''>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [showFilters, setShowFilters] = useState(false);

  // Stats calculations
  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.status === 'ACTIVE' || e.status === 'active').length,
    onLeave: employees.filter((e) => e.status === 'ON_LEAVE' || e.status === 'on-leave' || e.status === 'PROBATION').length,
    departments: new Set(employees.map((e) => e.department).filter(Boolean)).size,
  };

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await getDepartments(subdomain);
        const depts = response?.data?.data || response?.data || [];
        setDepartments(depts.map((d: any) => ({ id: d.id, name: d.name })));
      } catch (err) {
        console.error('Failed to fetch departments:', err);
      }
    };
    fetchDepartments();
  }, [subdomain]);

  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        limit: 100,
      };
      if (search) params.search = search;
      if (deptFilter) params.department_id = deptFilter;
      if (statusFilter) params.employment_status = statusFilter;

      const response = await getEmployees(subdomain, params);
      const raw = response?.data;
      const list: any[] = raw?.employees ?? (Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : []);

      setEmployees(
        list.map((emp: any) => {
          const initials = emp.name
            ? emp.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)
              .toUpperCase()
            : (emp.id?.slice(0, 2) ?? 'E').toUpperCase();
          return {
            id: emp.id,
            name: emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
            avatar: initials,
            role: emp.role || 'EMPLOYEE',
            department: emp.department || '',
            email: emp.email || '',
            phone: emp.phone || emp.personal_phone || '',
            location: emp.location || '',
            manager: emp.reporting_manager_name || emp.reporting_manager?.name || '',
            managerId: emp.reportingManagerId || emp.reporting_manager_id || null,
            reporting_manager_name: emp.reporting_manager_name || '',
            joinDate: emp.joinDate
              ? emp.joinDate
              : emp.date_of_joining
                ? new Date(emp.date_of_joining).toLocaleDateString('default', { month: 'short', year: 'numeric' })
                : '',
            status: emp.status || 'ACTIVE',
            employeeId: emp.employee_code || `EMP-${emp.id?.slice(0, 6)}`,
            dateOfBirth: emp.dateOfBirth || emp.date_of_birth || '',
            gender: emp.gender || '',
            designation: emp.designation || emp.designation?.name || '',
            employmentType: emp.employmentType || emp.employment_type?.name || '',
          };
        }),
      );
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [subdomain, search, deptFilter, statusFilter]);

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
      await deleteEmployee(id, subdomain);
      loadEmployees();
    } catch {
      alert('Failed to delete employee. Please try again.');
    }
  };

  const handleExport = () => {
    const headers = [
      'Employee ID',
      'Name',
      'Email',
      'Role',
      'Department',
      'Phone',
      'Location',
      'Manager',
      'Join Date',
      'Status',
    ];
    const rows = filtered.map((e) => [
      // e.employeeId,
      e.name,
      e.email,
      e.role,
      e.department,
      e.phone,
      e.location,
      e.manager,
      e.joinDate,
      e.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filtered = employees;

  return (
    <div className="min-h-screen">
      <div className="px-3 sm:px-5 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-[#0f766e] flex items-center justify-center shadow-md">
              <Users size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-xl lg:text-xl font-bold text-gray-900">
                Employee Management
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Manage employees, track probation and monitor workforce
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('registry')}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'registry'
                  ? 'border-[#0f766e] text-[#0f766e]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users size={16} />
                Employee Registry
              </div>
            </button>
            <button
              onClick={() => setActiveTab('probation')}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'probation'
                  ? 'border-[#0f766e] text-[#0f766e]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock size={16} />
                Probation Tracker
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'probation' ? (
          <ProbationTracker />
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <StatCard
                title="Total Employees"
                value={stats.total}
                icon={Users}
                color="text-[#2D7A4F]"
                bgColor="bg-emerald-50"
              />
              <StatCard
                title="Active"
                value={stats.active}
                icon={CheckCircle}
                color="text-emerald-600"
                bgColor="bg-emerald-50"
              />
              <StatCard
                title="On Leave"
                value={stats.onLeave}
                icon={Clock}
                color="text-amber-600"
                bgColor="bg-amber-50"
              />
              <StatCard
                title="Departments"
                value={stats.departments}
                icon={Building2}
                color="text-blue-600"
                bgColor="bg-blue-50"
              />
            </div>

            {/* Search and Filters */}
            <div className="mb-4">
              {/* Mobile View */}
              <div className="block sm:hidden space-y-2">
                {/* Search Bar - Full width */}
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                {/* Three buttons in one row */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg"
                  >
                    <Filter size={14} />
                    {showFilters ? (
                      <ChevronUp size={12} />
                    ) : (
                      <ChevronDown size={12} />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setEditingEmployee(null);
                      setShowAddModal(true);
                    }}
                    className="flex-1 flex items-center justify-center px-2 py-2 text-white bg-[#0f766e] rounded-lg"
                  >
                    <Plus size={16} />
                    {' '}
                    Add
                  </button>

                  <button
                    onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
                    className="flex-1 flex items-center justify-center px-2 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg"
                  >
                    {viewMode === 'table' ? (
                      <Grid3x3 size={16} />
                    ) : (
                      <List size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* Desktop View - Same as before */}
              <div className="hidden sm:flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search by name, ID, email or role..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-gray-400"
                  />
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  <Filter size={14} />
                  Filters
                  {showFilters ? (
                    <ChevronUp size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                </button>

                <button
                  onClick={() => {
                    setEditingEmployee(null);
                    setShowAddModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0f766e] rounded-xl shadow-sm hover:bg-teal-700 transition-all whitespace-nowrap"
                >
                  <Plus size={16} />
                  {' '}
                  Add Employee
                </button>

                <button
                  onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  {viewMode === 'table' ? (
                    <Grid3x3 size={16} />
                  ) : (
                    <List size={16} />
                  )}
                  <span className="hidden sm:inline">
                    {viewMode === 'table' ? 'Card View' : 'Table View'}
                  </span>
                </button>
              </div>

              {/* Filter Options - Below for both views */}
              {showFilters && (
              <div className="flex flex-col sm:flex-row gap-3 mt-3 animate-fade-in">
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as EmploymentStatus | '')}
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="">All Status</option>
                  <option value={EmploymentStatus.ACTIVE}>Active</option>
                  <option value={EmploymentStatus.ON_NOTICE}>On Notice</option>
                  <option value={EmploymentStatus.EXITED}>Exited</option>
                </select>
              </div>
              )}
            </div>

            {/* Results Info */}
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Showing
                {' '}
                <span className="font-semibold text-gray-700">
                  {filtered.length}
                </span>
                {' '}
                of
                {' '}
                <span className="font-semibold text-gray-700">
                  {employees.length}
                </span>
                {' '}
                employees
              </p>
              {search && (
              <button
                onClick={() => setSearch('')}
                className="text-xs text-[#2D7A4F] hover:underline"
              >
                Clear search
              </button>
              )}
            </div>

            {/* Card View (Mobile Default) */}
            {viewMode === 'cards' && (
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-[#2D7A4F] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-gray-500">
                      Loading employees...
                    </span>
                  </div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users size={24} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">
                    No employees found
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Try adjusting your search or filters
                  </p>
                  <button
                    onClick={() => {
                      setSearch('');
                      setDeptFilter('');
                      setStatusFilter('');
                    }}
                    className="mt-3 text-sm text-[#2D7A4F] hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                filtered.map((emp) => (
                  <EmployeeCard
                    key={emp.id}
                    employee={emp}
                    onView={() => handleViewEmployee(emp)}
                    onEdit={() => handleEditEmployee(emp)}
                    onDelete={() => handleDeleteEmployee(emp.id)}
                  />
                ))
              )}
            </div>
            )}

            {/* Table View (Desktop) */}
            {viewMode === 'table' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Department
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Designation
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
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-[#2D7A4F] border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm text-gray-500">
                              Loading employees...
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-12 text-center text-sm text-gray-500"
                        >
                          No employees found
                        </td>
                      </tr>
                    ) : (
                      filtered.map((emp) => {
                        const statusCfg = STATUS_CONFIG[emp.status] ?? DEFAULT_STATUS;
                        const StatusIcon = statusCfg.icon;
                        return (
                          <tr
                            key={emp.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[#0f766e] flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-xs font-bold">
                                    {emp.avatar}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {emp.name}
                                  </p>
                                  {/* <p className="text-xs text-gray-500">
                                    {emp.employeeId}
                                  </p> */}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              <span className="text-sm text-gray-600">
                                {emp.department}
                              </span>
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell">
                              <span className="text-sm text-gray-600">
                                {emp.designation || '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell">
                              <span className="text-sm text-gray-600">
                                {emp.joinDate || '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusCfg.color}`}
                              >
                                <StatusIcon size={10} />
                                {statusCfg.label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleViewEmployee(emp)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#2D7A4F] hover:bg-emerald-50 transition-colors"
                                  title="View Profile"
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  onClick={() => handleEditEmployee(emp)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                  title="Edit Employee"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteEmployee(emp.id)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                  title="Delete Employee"
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
            </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddEmployeeModal
          onClose={() => {
            setShowAddModal(false);
            setEditingEmployee(null);
          }}
          onSuccess={handleEmployeeAdded}
          editingEmployee={editingEmployee}
          isEditing={!!editingEmployee}
        />
      )}

      {showViewModal && selectedEmployee && (
        <EmployeeProfileModal
          employee={selectedEmployee}
          onClose={() => {
            setShowViewModal(false);
            setSelectedEmployee(null);
          }}
        />
      )}
    </div>
  );
}
