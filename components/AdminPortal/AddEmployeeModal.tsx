'use client';

import React, { useState, useEffect } from 'react';
import { X, UserPlus, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
interface AddEmployeeModalProps {
  onClose: () => void;
  onSuccess: (employee: CreatedEmployee) => void;
}

export interface CreatedEmployee {
  id: string;
  fullName: string;
  email: string;
  role: 'employee' | 'manager';
  department: string;
  phone: string;
  location: string;
  managerId: string;
  managerName: string;
  joinDate: string;
  employeeId: string;
}

interface ManagerOption {
  id: string;
  fullName: string;
  department: string;
  jobTitle: string;
}

const DEPARTMENTS = [
  'Engineering',
  'Human Resources',
  'Sales',
  'Finance',
  'Operations',
  'Quality Assurance',
  'Executive',
];

const ROLES: { value: 'employee' | 'manager'; label: string }[] = [
  { value: 'employee', label: 'Employee' },
  { value: 'manager', label: 'Manager' },
];

function generateEmployeeId(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(Math.random() * 900) + 100;
  return `EMP-${year}-${num}`;
}

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$';
  let pwd = '';
  for (let i = 0; i < 12; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}

export default function AddEmployeeModal({ onClose, onSuccess }: AddEmployeeModalProps) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'employee' as 'employee' | 'manager',
    department: '',
    phone: '',
    location: '',
    managerId: '',
    joinDate: new Date().toISOString().split('T')[0],
  });
  const [password, setPassword] = useState(generateTempPassword());
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdEmployee, setCreatedEmployee] = useState<CreatedEmployee | null>(null);
  const [managers, setManagers] = useState<ManagerOption[]>([]);

  useEffect(() => {
    setManagers([
      { id: '1', fullName: 'Arjun Mehta', department: 'Management', jobTitle: 'Admin' },
      { id: '2', fullName: 'Rahul Sharma', department: 'Operations', jobTitle: 'Team Lead' },
    ]);
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const selectedManager = managers.find((m) => m.id === form.managerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First and last name are required.');
      return;
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('A valid email address is required.');
      return;
    }
    if (!form.department) {
      setError('Please select a department.');
      return;
    }

    setLoading(true);
    try {
      const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`;
      const employeeId = generateEmployeeId();
      const created: CreatedEmployee = {
        id: crypto.randomUUID(),
        fullName,
        email: form.email.trim().toLowerCase(),
        role: form.role,
        department: form.department,
        phone: form.phone,
        location: form.location,
        managerId: form.managerId,
        managerName: selectedManager?.fullName || '',
        joinDate: form.joinDate,
        employeeId,
      };
      setCreatedEmployee(created);
      setSuccess(true);
      onSuccess(created);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success && createdEmployee) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div className="text-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={28} className="text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-[#0f1f2e]">Employee Created!</h2>
            <p className="text-sm text-gray-500 mt-1">Share these credentials with the employee.</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2 mb-5 border border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Name</span>
              <span className="font-semibold text-gray-800">{createdEmployee.fullName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Employee ID</span>
              <span className="font-mono font-semibold text-[#2D7A4F]">{createdEmployee.employeeId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Email</span>
              <span className="font-semibold text-gray-800">{createdEmployee.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Temp Password</span>
              <span className="font-mono font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg">{password}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Role</span>
              <span className="font-semibold text-gray-800 capitalize">{createdEmployee.role}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Department</span>
              <span className="font-semibold text-gray-800">{createdEmployee.department}</span>
            </div>
          </div>

          <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2 mb-4 border border-amber-100">
            ⚠️ Save these credentials now. The password cannot be retrieved after closing this dialog.
          </p>

          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#e8f5ee] flex items-center justify-center">
              <UserPlus size={17} className="text-[#2D7A4F]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0f1f2e]">Add New Employee</h2>
              <p className="text-xs text-gray-400">Fill in the details to add a new employee</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">First Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Priya"
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Last Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Nair"
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Work Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="priya.n@impactree.in"
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all"
              required
            />
          </div>

          {/* Temp Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Temporary Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Auto-generated. Employee must change on first login.</p>
          </div>

          {/* Role + Department */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Role <span className="text-red-500">*</span></label>
              <select
                value={form.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] text-gray-700"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Department <span className="text-red-500">*</span></label>
              <select
                value={form.department}
                onChange={(e) => handleChange('department', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] text-gray-700"
                required
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Manager (from user_profiles) */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Manager</label>
            <select
              value={form.managerId}
              onChange={(e) => handleChange('managerId', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] text-gray-700"
            >
              <option value="">No manager / Top-level</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName}{m.jobTitle ? ` — ${m.jobTitle}` : ''}{m.department ? ` (${m.department})` : ''}
                </option>
              ))}
            </select>
            {selectedManager && (
              <p className="text-xs text-[#2D7A4F] mt-1 font-medium">
                Reports to: {selectedManager.fullName}{selectedManager.department ? ` · ${selectedManager.department}` : ''}
              </p>
            )}
          </div>

          {/* Phone + Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+91 98765 XXXXX"
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Bangalore"
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all"
              />
            </div>
          </div>

          {/* Join Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Join Date</label>
            <input
              type="date"
              value={form.joinDate}
              onChange={(e) => handleChange('joinDate', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus size={15} />
                  Create Employee
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
