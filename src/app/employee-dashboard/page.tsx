'use client';

import React, { useState } from 'react';
import { User, Users, Mail, Phone, Building2, MapPin, ChevronRight, LogOut, Shield, Star } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  avatar: string;
  status: 'active' | 'on-leave';
}

const EMPLOYEE_PROFILE = {
  name: 'Rahul Sharma',
  role: 'Senior Software Engineer',
  department: 'Engineering',
  email: 'employee@impactree.in',
  phone: '+91 98765 43210',
  location: 'Bangalore, India',
  employeeId: 'EMP-2024-042',
  joinDate: 'March 2022',
  manager: 'Priya Nair',
  avatar: 'RS',
};

const REPORTING_EMPLOYEES: Employee[] = [
  {
    id: 1,
    name: 'Ananya Krishnan',
    role: 'Software Engineer',
    department: 'Engineering',
    email: 'ananya.k@impactree.in',
    phone: '+91 91234 56789',
    avatar: 'AK',
    status: 'active',
  },
  {
    id: 2,
    name: 'Vikram Patel',
    role: 'Junior Developer',
    department: 'Engineering',
    email: 'vikram.p@impactree.in',
    phone: '+91 87654 32109',
    avatar: 'VP',
    status: 'active',
  },
  {
    id: 3,
    name: 'Sneha Reddy',
    role: 'QA Engineer',
    department: 'Quality Assurance',
    email: 'sneha.r@impactree.in',
    phone: '+91 76543 21098',
    avatar: 'SR',
    status: 'on-leave',
  },
  {
    id: 4,
    name: 'Arjun Das',
    role: 'Frontend Developer',
    department: 'Engineering',
    email: 'arjun.d@impactree.in',
    phone: '+91 65432 10987',
    avatar: 'AD',
    status: 'active',
  },
];

export default function EmployeeDashboard() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#2D7A4F] flex items-center justify-center">
              <span className="text-white text-xs font-bold">IW</span>
            </div>
            <span className="font-bold text-sm text-gray-900">Impactree Workflo</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#e8f5ee] rounded-full px-3 py-1">
              <User size={13} className="text-[#2D7A4F]" />
              <span className="text-xs font-semibold text-[#2D7A4F]">Employee</span>
            </div>
            <button
              onClick={() => (window.location.href = '/sign-up-login-screen')}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* My Profile Section */}
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            My Profile
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Profile header */}
            <div className="bg-gradient-to-r from-[#2D7A4F] to-[#1e5c3a] px-6 py-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                  <span className="text-white text-xl font-bold">{EMPLOYEE_PROFILE.avatar}</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{EMPLOYEE_PROFILE.name}</h1>
                  <p className="text-[#a8d5bc] text-sm font-medium mt-0.5">{EMPLOYEE_PROFILE.role}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Shield size={11} className="text-[#a8d5bc]" />
                    <span className="text-[#a8d5bc] text-xs">{EMPLOYEE_PROFILE.employeeId}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile details */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#e8f5ee] flex items-center justify-center flex-shrink-0">
                  <Mail size={14} className="text-[#2D7A4F]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Email</p>
                  <p className="text-sm font-semibold text-gray-800">{EMPLOYEE_PROFILE.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#e8f5ee] flex items-center justify-center flex-shrink-0">
                  <Phone size={14} className="text-[#2D7A4F]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Phone</p>
                  <p className="text-sm font-semibold text-gray-800">{EMPLOYEE_PROFILE.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#e8f5ee] flex items-center justify-center flex-shrink-0">
                  <Building2 size={14} className="text-[#2D7A4F]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Department</p>
                  <p className="text-sm font-semibold text-gray-800">{EMPLOYEE_PROFILE.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#e8f5ee] flex items-center justify-center flex-shrink-0">
                  <MapPin size={14} className="text-[#2D7A4F]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Location</p>
                  <p className="text-sm font-semibold text-gray-800">{EMPLOYEE_PROFILE.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#e8f5ee] flex items-center justify-center flex-shrink-0">
                  <Star size={14} className="text-[#2D7A4F]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Reports To</p>
                  <p className="text-sm font-semibold text-gray-800">{EMPLOYEE_PROFILE.manager}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#e8f5ee] flex items-center justify-center flex-shrink-0">
                  <User size={14} className="text-[#2D7A4F]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Joined</p>
                  <p className="text-sm font-semibold text-gray-800">{EMPLOYEE_PROFILE.joinDate}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reporting Employees Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Reporting Employees
            </h2>
            <div className="flex items-center gap-1.5 bg-[#e8f5ee] rounded-full px-2.5 py-1">
              <Users size={12} className="text-[#2D7A4F]" />
              <span className="text-xs font-semibold text-[#2D7A4F]">{REPORTING_EMPLOYEES.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {REPORTING_EMPLOYEES.map((emp) => (
              <button
                key={emp.id}
                onClick={() => setSelectedEmployee(selectedEmployee?.id === emp.id ? null : emp)}
                className="bg-white rounded-2xl border border-gray-200 p-4 text-left hover:border-[#2D7A4F]/30 hover:shadow-md transition-all duration-200 cursor-pointer group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2D7A4F] to-[#1e5c3a] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">{emp.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">{emp.name}</p>
                      <span
                        className={`flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          emp.status === 'active' ?'bg-green-100 text-green-700' :'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {emp.status === 'active' ? 'Active' : 'On Leave'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium truncate mt-0.5">{emp.role}</p>
                  </div>
                  <ChevronRight
                    size={15}
                    className={`text-gray-300 group-hover:text-[#2D7A4F] transition-all duration-200 flex-shrink-0 ${
                      selectedEmployee?.id === emp.id ? 'rotate-90 text-[#2D7A4F]' : ''
                    }`}
                  />
                </div>

                {/* Expanded details */}
                {selectedEmployee?.id === emp.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-2.5 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <Mail size={12} className="text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-600 font-medium truncate">{emp.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={12} className="text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-600 font-medium">{emp.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 size={12} className="text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-600 font-medium">{emp.department}</span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
