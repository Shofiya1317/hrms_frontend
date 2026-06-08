'use client';

import React from 'react';
import { X, Mail, Phone, Building2, MapPin, Calendar, Users, Briefcase, Award, Clock, CheckCircle, XCircle } from 'lucide-react';

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

interface EmployeeProfileViewProps {
  employee: Employee;
  onClose: () => void;
}

export default function EmployeeProfileView({ employee, onClose }: EmployeeProfileViewProps) {
  const statusCfg = STATUS_CONFIG[employee.status];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2D7A4F] to-[#1e5c3a] flex items-center justify-center">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0f1f2e]">Employee Profile</h2>
              <p className="text-xs text-gray-500">Complete employee information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Personal Info */}
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="bg-gradient-to-br from-[#2D7A4F] to-[#1e5c3a] rounded-2xl p-6 text-center text-white">
                <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4 border-2 border-white/30">
                  <span className="text-white text-3xl font-black">{employee.avatar}</span>
                </div>
                <h3 className="text-xl font-bold">{employee.name}</h3>
                <p className="text-white/80 text-sm mt-1">{employee.role}</p>
                <div className="mt-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${statusCfg.color}`}>
                    <statusCfg.icon size={12} />
                    {statusCfg.label}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <h4 className="text-sm font-bold text-[#0f1f2e] mb-3 flex items-center gap-2">
                  <Mail size={14} className="text-[#2D7A4F]" />
                  Contact Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={14} className="text-gray-400" />
                    <span className="text-gray-700">{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={14} className="text-gray-400" />
                    <span className="text-gray-700">{employee.phone || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={14} className="text-gray-400" />
                    <span className="text-gray-700">{employee.location || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              {(employee.dateOfBirth || employee.gender) && (
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <h4 className="text-sm font-bold text-[#0f1f2e] mb-3 flex items-center gap-2">
                    <Award size={14} className="text-[#2D7A4F]" />
                    Personal Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    {employee.dateOfBirth && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date of Birth</span>
                        <span className="font-medium text-gray-700">
                          {new Date(employee.dateOfBirth).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {employee.gender && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Gender</span>
                        <span className="font-medium text-gray-700 capitalize">{employee.gender}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Job Details */}
            <div className="lg:col-span-2 space-y-4">
              {/* Employment Information */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h4 className="text-sm font-bold text-[#0f1f2e] mb-4 flex items-center gap-2">
                  <Briefcase size={14} className="text-[#2D7A4F]" />
                  Employment Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-1">Employee ID</p>
                    <p className="text-sm font-semibold text-gray-800">{employee.employeeId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-1">Department</p>
                    <p className="text-sm font-semibold text-gray-800">{employee.department || '—'}</p>
                  </div>
                  {employee.designation && (
                    <div>
                      <p className="text-xs text-gray-400 font-medium mb-1">Designation</p>
                      <p className="text-sm font-semibold text-gray-800">{employee.designation}</p>
                    </div>
                  )}
                  {employee.employmentType && (
                    <div>
                      <p className="text-xs text-gray-400 font-medium mb-1">Employment Type</p>
                      <p className="text-sm font-semibold text-gray-800">{employee.employmentType}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-1">Reporting Manager</p>
                    <p className="text-sm font-semibold text-gray-800">{employee.manager && employee.manager !== 'null' ? employee.manager : '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-1">Date of Joining</p>
                    <p className="text-sm font-semibold text-gray-800">{employee.joinDate || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Attendance Summary */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h4 className="text-sm font-bold text-[#0f1f2e] mb-4 flex items-center gap-2">
                  <Calendar size={14} className="text-[#2D7A4F]" />
                  Attendance Summary (This Month)
                </h4>
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-green-600">18</p>
                    <p className="text-xs font-semibold text-green-700 mt-1">Present</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-red-500">2</p>
                    <p className="text-xs font-semibold text-red-600 mt-1">Absent</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-amber-600">3</p>
                    <p className="text-xs font-semibold text-amber-700 mt-1">Late</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-blue-600">1</p>
                    <p className="text-xs font-semibold text-blue-700 mt-1">Leave</p>
                  </div>
                </div>
              </div>

              {/* Leave Balance */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h4 className="text-sm font-bold text-[#0f1f2e] mb-4">Leave Balance</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">Annual Leave</span>
                      <span className="text-xs font-semibold text-gray-800">5/18 used</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#2D7A4F] to-[#4a9e6e]" style={{ width: '27.7%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">Sick Leave</span>
                      <span className="text-xs font-semibold text-gray-800">2/12 used</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#2D7A4F] to-[#4a9e6e]" style={{ width: '16.6%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">Casual Leave</span>
                      <span className="text-xs font-semibold text-gray-800">1/6 used</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#2D7A4F] to-[#4a9e6e]" style={{ width: '16.6%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}