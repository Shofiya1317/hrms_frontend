  'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  X, UserPlus, Loader2, CheckCircle, AlertCircle,
} from 'lucide-react';
import {
  createEmployee,
  updateEmployee,
  getInviteMasterData,
  getEmployeeById,
  InviteEmployeeDto,
  UpdateEmployeeDto,
} from '@/lib/service/employee';
import {
  createDesignation,
} from '@/lib/service/masters';
import Select, { components } from 'react-select';
import type { OptionProps } from 'react-select';
import customStyles from '@/components/CustomStyles/CustomStyles';

interface AddEmployeeModalProps {
  readonly onClose: () => void;
  readonly onSuccess: (employee: any) => void;
  readonly editingEmployee?: any;
  readonly isEditing?: boolean;
}

interface ManagerOption {
  id: string;
  fullName: string;
  department: string;
  jobTitle: string;
}

interface MasterOption {
  id: string;
  name: string;
  label?: string;
  code?: string;
  start_time_24hr?: string | null;
  end_time_24hr?: string | null;
}

type EmployeeRole = 'EMPLOYEE';

interface EmployeeFormState {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string; // work email
  personalEmail: string;
  role: EmployeeRole;
  departmentId: string;
  designationId: string;
  employmentType: string;
  employmentStatus: string;
  shiftId: string;
  workLocationId: string;
  gradeId: string;
  employeeCode: string;
  phone: string; // personal phone
  workPhone: string;
  managerId: string;
  joinDate: string;
  probationEndDate: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  leavePolicyId: string;
  attendancePolicyId: string;
  
  // God-mode fields
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;

  panNumber: string;
  aadhaarNumber: string;
  uanNumber: string;
  esicNumber: string;
  pfApplicable: boolean;
  esicApplicable: boolean;

  bankName: string;
  bankAccountNumber: string;
  bankIfscCode: string;
  bankBranch: string;

  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;

  homeLatitude: string;
  homeLongitude: string;

  notes: string;
  dateOfExit: string;
  exitReason: string;
}

const ROLES: { value: EmployeeRole; label: string }[] = [
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'HR_ADMIN', label: 'HR Admin' },
];

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export default function AddEmployeeModal({
  onClose,
  onSuccess,
  editingEmployee,
  isEditing = false,
}: AddEmployeeModalProps) {
  const params = useParams();
  const subdomain = params?.subdomain as string;

  const [form, setForm] = useState<EmployeeFormState>({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    personalEmail: '',
    role: 'EMPLOYEE' as const,
    employeeCode: '',
    departmentId: '',
    designationId: '',
    employmentType: '',
    employmentStatus: '',
    shiftId: '',
    workLocationId: '',
    gradeId: '',
    phone: '',
    workPhone: '',
    managerId: '',
    joinDate: new Date().toISOString().split('T')[0],
    probationEndDate: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    leavePolicyId: '',
    attendancePolicyId: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    panNumber: '',
    aadhaarNumber: '',
    uanNumber: '',
    esicNumber: '',
    pfApplicable: false,
    esicApplicable: false,
    bankName: '',
    bankAccountNumber: '',
    bankIfscCode: '',
    bankBranch: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    homeLatitude: '',
    homeLongitude: '',
    notes: '',
    dateOfExit: '',
    exitReason: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  
  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const [createdEmployee, setCreatedEmployee] = useState<any>(null);
  const [managers, setManagers] = useState<ManagerOption[]>([]);
  const [departments, setDepartments] = useState<MasterOption[]>([]);
  const [designations, setDesignations] = useState<MasterOption[]>([]);
  const [shifts, setShifts] = useState<MasterOption[]>([]);
  const [leavePolicies, setLeavePolicies] = useState<MasterOption[]>([]);
  const [attendancePolicies, setAttendancePolicies] = useState<MasterOption[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<MasterOption[]>([]);
  const [employmentStatuses, setEmploymentStatuses] = useState<MasterOption[]>([]);

  useEffect(() => {
    if (subdomain) {
      loadInviteMasterData();
    }
  }, [subdomain]);

  useEffect(() => {
    if (editingEmployee?.id && isEditing) {
      loadEmployeeById(editingEmployee.id);
    }
  }, [editingEmployee, isEditing]);

  const loadEmployeeById = async (id: string) => {
    try {
      const res = await getEmployeeById(id, subdomain, true);
      const data = res?.data;
      const emp = data?.data;
      if (!emp) return;

      const md = data?.master_data;
      if (md) {
        if (md.departments) setDepartments(md.departments.map((d: any) => ({ id: d.id, name: d.name })));
        if (md.designations) setDesignations(md.designations.map((d: any) => ({ id: d.id, name: d.name })));
        if (md.shifts) setShifts(md.shifts.map((d: any) => ({ id: d.id, name: d.label || d.name })));
        if (md.leave_policies) setLeavePolicies(md.leave_policies.map((d: any) => ({ id: d.name, name: d.name })));
        if (md.attendance_policies) setAttendancePolicies(md.attendance_policies.map((d: any) => ({ id: d.id, name: d.name })));
        if (md.employment_types) setEmploymentTypes(md.employment_types.map((d: any) => ({ id: d.id, name: d.name })));
        if (md.employment_statuses) setEmploymentStatuses(md.employment_statuses.map((d: any) => ({ id: d.id, name: d.name })));
      }
      setForm({
        firstName: emp.first_name || '',
        lastName: emp.last_name || '',
        middleName: emp.middle_name || '',
        email: emp.work_email || emp.user_email || '',
        personalEmail: emp.personal_email || '',
        role: (emp.user_role === 'HR_ADMIN' ? 'HR_ADMIN' : 'EMPLOYEE') as EmployeeRole,
        employeeCode: emp.employee_code || '',
        departmentId: emp.department_id || '',
        designationId: emp.designation_id || '',
        employmentType: emp.employment_type || '',
        employmentStatus: emp.employment_status || '',
        shiftId: emp.shift_id || '',
        workLocationId: emp.work_location_id || '',
        gradeId: emp.grade_id || '',
        phone: emp.personal_phone || '',
        workPhone: emp.work_phone || '',
        managerId: emp.reporting_manager_id || '',
        joinDate: emp.date_of_joining?.split('T')[0] || new Date().toISOString().split('T')[0],
        probationEndDate: emp.probation_end_date?.split('T')[0] || '',
        dateOfBirth: emp.date_of_birth?.split('T')[0] || '',
        gender: emp.gender || '',
        bloodGroup: emp.blood_group || '',
        leavePolicyId: emp.leave_policy_name || '',
        attendancePolicyId: emp.attendance_policy_id || '',
        address: emp.current_address || emp.address || '',
        city: emp.city || '',
        state: emp.state || '',
        postalCode: emp.pincode || emp.postal_code || '',
        country: emp.country || '',
        panNumber: emp.pan_number || '',
        aadhaarNumber: emp.aadhaar_number || emp.aadhar_last4 || '',
        uanNumber: emp.uan_number || '',
        esicNumber: emp.esic_number || '',
        pfApplicable: emp.pf_applicable ?? false,
        esicApplicable: emp.esic_applicable ?? false,
        bankName: emp.bank_name || '',
        bankAccountNumber: emp.bank_account_number || '',
        bankIfscCode: emp.bank_ifsc || emp.bank_ifsc_code || '',
        bankBranch: emp.bank_branch || '',
        emergencyContactName: emp.emergency_contact_name || '',
        emergencyContactPhone: emp.emergency_contact_phone || '',
        emergencyContactRelationship: emp.emergency_contact_relation || emp.emergency_contact_relationship || '',
        homeLatitude: emp.home_latitude?.toString() || '',
        homeLongitude: emp.home_longitude?.toString() || '',
        notes: emp.notes || '',
        dateOfExit: emp.date_of_exit?.split('T')[0] || '',
        exitReason: emp.exit_reason || '',
      });
    } catch (err) {
      console.error('Failed to load employee', err);
    }
  };

  const [newDesignationName, setNewDesignationName] = useState('');
  const [creatingDesignation, setCreatingDesignation] = useState(false);

  const loadInviteMasterData = async () => {
    try {
      const res = await getInviteMasterData(subdomain);
      const data = res?.data?.data;
      setDepartments(data?.departments ?? []);
      setDesignations(data?.designations ?? []);
      setShifts(data?.shifts?.map((d: any) => ({ id: d.id, name: d.label || d.name })) ?? []);
      setLeavePolicies(data?.leave_policies ?? []);
      setAttendancePolicies(data?.attendance_policies ?? []);
      setManagers(
        (data?.employees ?? []).map((e: any) => ({
          id: e.id,
          fullName: e.name || 'Employee',
          department: '',
          jobTitle: e.work_email || '',
        })),
      );
    } catch (err) {
      console.error('Failed to load master data', err);
    }
  };

  const handleCreateDesignation = async () => {
    const name = newDesignationName.trim();
    if (!name) return;
    setCreatingDesignation(true);
    try {
      const res = await createDesignation({ name }, subdomain);
      const created = res?.data?.data || res?.data;
      if (created?.id) {
        setDesignations((prev) => [...prev, created]);
        handleChange('designationId', created.id);
      }
      setNewDesignationName('');
    } catch (err) {
      console.error('Failed to create designation', err);
    } finally {
      setCreatingDesignation(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const selectedManager = managers.find((m) => m.id === form.managerId) ?? null;

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
    if (!form.departmentId) {
      setError('Please select a department.');
      return;
    }
    if (!form.employmentType) {
      setError('Please select an employment type.');
      return;
    }

    setLoading(true);
    try {
      const email = form.email.trim().toLowerCase();
      const firstName = form.firstName.trim();
      const lastName = form.lastName.trim();
      const departmentId = form.departmentId.trim();
      const joinDate = (form.joinDate || '').trim();

      const payload: InviteEmployeeDto = {
        email,
        role: 'EMPLOYEE', // Always default to EMPLOYEE role
        employee_code: form.employeeCode.trim() || undefined,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
        personal_phone: form.phone.trim() || undefined,
        department_id: departmentId,
        designation_id: form.designationId || undefined,
        employment_type: (form.employmentType || '').trim(),
        reporting_manager_id: form.managerId,
        shift_id: form.shiftId || undefined,
        date_of_joining: joinDate,
        leave_policy_name: form.leavePolicyId || undefined,
        attendance_policy_id: form.attendancePolicyId || undefined,
      };

      let response;
      if (isEditing && editingEmployee?.id) {
        const updatePayload: UpdateEmployeeDto = {
          employee_code: form.employeeCode.trim() || undefined,
          first_name: firstName,
          last_name: lastName,
          middle_name: form.middleName.trim() || undefined,
          date_of_birth: form.dateOfBirth || undefined,
          gender: form.gender || undefined,
          personal_email: form.personalEmail.trim() || undefined,
          personal_phone: form.phone.trim() || undefined,
          blood_group: form.bloodGroup || undefined,
          department_id: departmentId,
          designation_id: form.designationId || undefined,
          employment_type: (form.employmentType || '').trim(),
          employment_status: form.employmentStatus || undefined,
          reporting_manager_id: form.managerId || undefined,
          shift_id: form.shiftId || undefined,
          work_location_id: form.workLocationId || undefined,
          grade_id: form.gradeId || undefined,
          date_of_joining: joinDate,
          probation_end_date: form.probationEndDate || undefined,
          work_email: form.email.trim() || undefined,
          work_phone: form.workPhone.trim() || undefined,
          role: form.role,
          leave_policy_name: form.leavePolicyId || undefined,
          attendance_policy_id: form.attendancePolicyId || undefined,
          address: form.address || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          postal_code: form.postalCode || undefined,
          country: form.country || undefined,
          pan_number: form.panNumber || undefined,
          aadhaar_number: form.aadhaarNumber || undefined,
          uan_number: form.uanNumber || undefined,
          esic_number: form.esicNumber || undefined,
          pf_applicable: form.pfApplicable,
          esic_applicable: form.esicApplicable,
          bank_name: form.bankName || undefined,
          bank_account_number: form.bankAccountNumber || undefined,
          bank_ifsc_code: form.bankIfscCode || undefined,
          bank_branch: form.bankBranch || undefined,
          emergency_contact_name: form.emergencyContactName || undefined,
          emergency_contact_phone: form.emergencyContactPhone || undefined,
          emergency_contact_relationship: form.emergencyContactRelationship || undefined,
          home_latitude: form.homeLatitude ? Number(form.homeLatitude) : undefined,
          home_longitude: form.homeLongitude ? Number(form.homeLongitude) : undefined,
          notes: form.notes || undefined,
          date_of_exit: form.dateOfExit || undefined,
          exit_reason: form.exitReason || undefined,
        };
        response = await updateEmployee(editingEmployee.id, updatePayload, subdomain);
        const { success: ok, error: err } = response?.data as {
          success: boolean;
          error?: string | string[];
        };
        if (!ok) {
          const msg = Array.isArray(err)
            ? err[0]
            : (err ?? 'Failed to update employee');
          setError(msg);
          return;
        }
        const updatedEmployee = response?.data?.data;
        setCreatedEmployee(updatedEmployee);
        showToast(response?.data?.message || 'Employee updated successfully', 'success');
        
        // Wait a brief moment to let user see toast before closing/refreshing
        setTimeout(() => {
          onSuccess(updatedEmployee);
        }, 1500);
      } else {
        response = await createEmployee(payload, subdomain);
        const { success: ok, error: err } = response?.data as {
          success: boolean;
          error?: string | string[];
        };
        if (!ok) {
          const msg = Array.isArray(err)
            ? err[0]
            : (err ?? 'Failed to create employee');
          setError(msg);
          return;
        }
        const newEmployee = response?.data?.data;
        setCreatedEmployee({
          ...newEmployee,
          fullName: `${form.firstName.trim()} ${form.lastName.trim()}`,
          employeeId: newEmployee?.employee_id || `EMP-${Date.now()}`,
          managerName: selectedManager?.fullName || '',
          email: form.email.trim().toLowerCase(),
          role: form.role,
          department:
            departments.find((d) => d.id === form.departmentId)?.name || '',
        });
        onSuccess(newEmployee);
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (success && createdEmployee && !isEditing) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
          style={{ maxHeight: 'calc(100vh - 2rem)' }}
        >
          <div className="overflow-y-auto p-6">
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={28} className="text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-[#0f1f2e]">
                Employee Created!
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Share these credentials with the employee.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2 mb-5 border border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Name</span>
                <span className="font-semibold text-gray-800">
                  {createdEmployee.fullName}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Employee ID</span>
                <span className="font-mono font-semibold text-[#2D7A4F]">
                  {createdEmployee.employeeId}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Email</span>
                <span className="font-semibold text-gray-800">
                  {createdEmployee.email}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Role</span>
                <span className="font-semibold text-gray-800 capitalize">
                  {createdEmployee.role}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Department</span>
                <span className="font-semibold text-gray-800">
                  {createdEmployee.department}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="fixed inset-0 bg-black/10 z-50 flex items-center justify-center pt-5 mt-4 px-4 overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-lg border ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
            {toast.type === 'success' ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
            {toast.msg}
          </div>
        </div>
      )}
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col"
        style={{ maxHeight: 'calc(100vh - 8rem)', height: 'auto' }}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-100 rounded-t-2xl bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#e8f5ee] flex items-center justify-center">
              <UserPlus size={17} className="text-[#2D7A4F]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0f1f2e]">
                {isEditing ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <p className="text-xs text-gray-400">
                {isEditing
                  ? 'Update employee information'
                  : 'Fill in the details to add a new employee'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Row 1: Full Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-xs font-semibold text-gray-600 mb-1.5">First Name <span className="text-red-500">*</span></label>
                <input id="firstName" type="text" value={form.firstName} onChange={(e) => handleChange('firstName', e.target.value)} placeholder="John" className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" required />
              </div>
              {isEditing && (
                <div>
                  <label htmlFor="middleName" className="block text-xs font-semibold text-gray-600 mb-1.5">Middle Name</label>
                  <input id="middleName" type="text" value={form.middleName} onChange={(e) => handleChange('middleName', e.target.value)} placeholder="M" className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                </div>
              )}
              <div>
                <label htmlFor="lastName" className="block text-xs font-semibold text-gray-600 mb-1.5">Last Name <span className="text-red-500">*</span></label>
                <input id="lastName" type="text" value={form.lastName} onChange={(e) => handleChange('lastName', e.target.value)} placeholder="Doe" className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-gray-600 mb-1.5">Work Email <span className="text-red-500">*</span></label>
                <input id="email" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="john.doe@company.com" className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" required />
              </div>
              {isEditing ? (
                <div>
                  <label htmlFor="personalEmail" className="block text-xs font-semibold text-gray-600 mb-1.5">Personal Email</label>
                  <input id="personalEmail" type="email" value={form.personalEmail} onChange={(e) => handleChange('personalEmail', e.target.value)} placeholder="john@gmail.com" className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                </div>
              ) : (
                <div>
                  <label htmlFor="employeeCode" className="block text-xs font-semibold text-gray-600 mb-1.5">Employee Code</label>
                  <input id="employeeCode" type="text" value={form.employeeCode} onChange={(e) => handleChange('employeeCode', e.target.value)} placeholder="e.g. IM05" className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                </div>
              )}
              {isEditing && (
                <>
                  <div>
                    <label htmlFor="phone" className="block text-xs font-semibold text-gray-600 mb-1.5">Personal Phone</label>
                    <input id="phone" type="tel" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+91 98765 43210" className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                  </div>
                  <div>
                    <label htmlFor="workPhone" className="block text-xs font-semibold text-gray-600 mb-1.5">Work Phone</label>
                    <input id="workPhone" type="tel" value={form.workPhone} onChange={(e) => handleChange('workPhone', e.target.value)} placeholder="+91 88888 88888" className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                  </div>
                  <div>
                    <label htmlFor="employeeCode" className="block text-xs font-semibold text-gray-600 mb-1.5">Employee Code</label>
                    <input id="employeeCode" type="text" value={form.employeeCode} onChange={(e) => handleChange('employeeCode', e.target.value)} placeholder="e.g. IM05" className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="employmentTypeId" className="block text-xs font-semibold text-gray-600 mb-1.5">Employment Type <span className="text-red-500">*</span></label>
                <Select
                  inputId="employmentTypeId"
                  options={isEditing && employmentTypes.length > 0 ? employmentTypes.map((type) => ({ value: type.id, label: type.name })) : [
                    { value: 'full_time', label: 'Full Time' },
                    { value: 'probation', label: 'Probation' },
                    { value: 'intern', label: 'Intern' },
                  ]}
                  value={form.employmentType ? { value: form.employmentType, label: (isEditing ? employmentTypes.find((t) => t.id === form.employmentType)?.name : null) || form.employmentType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) } : null}
                  onChange={(opt) => handleChange('employmentType', opt?.value ?? '')}
                  placeholder="Select employment type"
                  styles={customStyles()}
                />
              </div>
              {isEditing && (
                <div>
                  <label htmlFor="employmentStatus" className="block text-xs font-semibold text-gray-600 mb-1.5">Employment Status</label>
                  <Select
                    inputId="employmentStatus"
                    options={employmentStatuses.length > 0 ? employmentStatuses.map((status) => ({ value: status.id, label: status.name })) : [
                      { value: 'ACTIVE', label: 'Active' },
                      { value: 'INACTIVE', label: 'Inactive' },
                      { value: 'TERMINATED', label: 'Terminated' },
                    ]}
                    value={form.employmentStatus ? { value: form.employmentStatus, label: employmentStatuses.find((t) => t.id === form.employmentStatus)?.name || form.employmentStatus } : null}
                    onChange={(opt) => handleChange('employmentStatus', opt?.value ?? '')}
                    placeholder="Select status"
                    styles={customStyles()}
                  />
                </div>
              )}
            </div>

            {/* Row 5: Department + Reporting Manager */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="departmentId"
                  className="block text-xs font-semibold text-gray-600 mb-1.5"
                >
                  Department
                  {' '}
                  <span className="text-red-500">*</span>
                </label>
                <Select
                  inputId="departmentId"
                  options={departments.map((d) => ({
                    value: d.id,
                    label: `${d.name}${d.code ? ` (${d.code})` : ''}`,
                  }))}
                  value={
                    departments
                      .map((d) => ({
                        value: d.id,
                        label: `${d.name}${d.code ? ` (${d.code})` : ''}`,
                      }))
                      .find((o) => o.value === form.departmentId) ?? null
                  }
                  onChange={(opt) => handleChange('departmentId', opt?.value ?? '')}
                  placeholder="Select department"
                  styles={customStyles()}
                />
              </div>
              <div>
                <label
                  htmlFor="managerId"
                  className="block text-xs font-semibold text-gray-600 mb-1.5"
                >
                  Reporting Manager
                </label>
                <Select
                  inputId="managerId"
                  options={managers.map((m) => ({
                    value: m.id,
                    label: `${m.fullName}${m.jobTitle ? ` — ${m.jobTitle}` : ''}${m.department ? ` (${m.department})` : ''}`,
                  }))}
                  value={
                    managers
                      .map((m) => ({ value: m.id, label: m.fullName }))
                      .find((o) => o.value === form.managerId) ?? null
                  }
                  onChange={(opt) => handleChange('managerId', opt?.value ?? '')}
                  placeholder="No manager / Top-level"
                  isClearable
                  styles={customStyles()}
                />
                {selectedManager ? (
                  <p className="text-xs text-[#2D7A4F] mt-1 font-medium">
                    Reports to:
                    {' '}
                    {selectedManager.fullName || 'Selected manager'}
                    {selectedManager.department
                      ? ` · ${selectedManager.department}`
                      : ''}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Row 6: Designation + Shift */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="designationId"
                  className="block text-xs font-semibold text-gray-600 mb-1.5"
                >
                  Designation
                </label>
                <Select
                  inputId="designationId"
                  options={[
                    ...designations.map((d) => ({
                      value: d.id,
                      label: `${d.name}${d.code ? ` (${d.code})` : ''}`,
                      isCustom: false,
                    })),
                    // {
                    //   value: '__custom__',
                    //   label: '+ Add custom designation',
                    //   isCustom: true,
                    // },
                  ]}
                  value={
                    designations
                      .map((d) => ({
                        value: d.id,
                        label: `${d.name}${d.code ? ` (${d.code})` : ''}`,
                        isCustom: false,
                      }))
                      .find((o) => o.value === form.designationId) ?? null
                  }
                  onChange={(opt) => {
                    if (opt?.value === '__custom__') return;
                    handleChange('designationId', opt?.value ?? '');
                  }}
                  components={{
                    Option: (props: OptionProps<any>) => (props.data.isCustom ? (
                      <div className="px-3 py-2">
                        <div className="flex gap-2">
                          <input
                            className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#2D7A4F]"
                            placeholder="Designation name"
                            value={newDesignationName}
                            onChange={(e) => setNewDesignationName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleCreateDesignation();
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            type="button"
                            disabled={
                                creatingDesignation
                                || !newDesignationName.trim()
                              }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreateDesignation();
                            }}
                            className="px-2 py-1 text-xs font-semibold text-white bg-[#2D7A4F] rounded-lg disabled:opacity-50"
                          >
                            {creatingDesignation ? '...' : 'Add'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <components.Option {...props} />
                    )),
                  }}
                  placeholder="Select designation"
                  isClearable
                  styles={customStyles()}
                />
              </div>
              <div>
                <label
                  htmlFor="shiftId"
                  className="block text-xs font-semibold text-gray-600 mb-1.5"
                >
                  Shift
                </label>
                <Select
                  inputId="shiftId"
                  options={shifts.map((s) => ({
                    value: s.id,
                    label: s.name,
                  }))}
                  value={
                    shifts
                      .map((s) => ({
                        value: s.id,
                        label: s.name,
                      }))
                      .find((o) => o.value === form.shiftId) ?? null
                  }
                  onChange={(opt) => handleChange('shiftId', opt?.value ?? '')}
                  placeholder="Select shift"
                  styles={customStyles()}
                />
              </div>
            </div>

            {/* Leave Policy + Attendance Policy */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="leavePolicyId"
                  className="block text-xs font-semibold text-gray-600 mb-1.5"
                >
                  Leave Policy
                </label>
                <Select
                  inputId="leavePolicyId"
                  options={leavePolicies.map((p) => ({ value: p.name, label: p.label ?? p.name }))}
                  value={form.leavePolicyId ? { value: form.leavePolicyId, label: form.leavePolicyId } : null}
                  onChange={(opt) => handleChange('leavePolicyId', opt?.value ?? '')}
                  placeholder="Select leave policy"
                  isClearable
                  styles={customStyles()}
                />
              </div>
              <div>
                <label
                  htmlFor="attendancePolicyId"
                  className="block text-xs font-semibold text-gray-600 mb-1.5"
                >
                  Attendance Policy
                </label>
                <Select
                  inputId="attendancePolicyId"
                  options={attendancePolicies.map((p) => ({ value: p.id, label: p.name }))}
                  value={attendancePolicies.map((p) => ({ value: p.id, label: p.name })).find((o) => o.value === form.attendancePolicyId) ?? null}
                  onChange={(opt) => handleChange('attendancePolicyId', opt?.value ?? '')}
                  placeholder="Select attendance policy"
                  isClearable
                  styles={customStyles()}
                />
              </div>
            </div>

            {/* Row 7: Date of Birth + Gender */}
            <div className={`grid gap-4 ${isEditing ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <div>
                <label htmlFor="dateOfBirth" className="block text-xs font-semibold text-gray-600 mb-1.5">Date of Birth</label>
                <input id="dateOfBirth" type="date" value={form.dateOfBirth} onChange={(e) => handleChange('dateOfBirth', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
              </div>
              <div>
                <label htmlFor="gender" className="block text-xs font-semibold text-gray-600 mb-1.5">Gender</label>
                <Select
                  inputId="gender"
                  options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]}
                  value={form.gender ? { value: form.gender, label: capitalize(form.gender) } : null}
                  onChange={(opt) => handleChange('gender', opt?.value ?? '')}
                  placeholder="Select gender"
                  styles={customStyles()}
                />
              </div>
              {isEditing && (
                <div>
                  <label htmlFor="bloodGroup" className="block text-xs font-semibold text-gray-600 mb-1.5">Blood Group</label>
                  <input id="bloodGroup" type="text" value={form.bloodGroup} onChange={(e) => handleChange('bloodGroup', e.target.value)} placeholder="O+" className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                </div>
              )}
            </div>

            {!isEditing ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold text-gray-600 mb-1.5">Personal Phone</label>
                  <input id="phone" type="tel" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+91 98765 43210" className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                </div>
                <div>
                  <label htmlFor="joinDate" className="block text-xs font-semibold text-gray-600 mb-1.5">Date of Joining <span className="text-red-500">*</span></label>
                  <input id="joinDate" type="date" value={form.joinDate} onChange={(e) => handleChange('joinDate', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" required />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="joinDate" className="block text-xs font-semibold text-gray-600 mb-1.5">Date of Joining <span className="text-red-500">*</span></label>
                  <input id="joinDate" type="date" value={form.joinDate} onChange={(e) => handleChange('joinDate', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" required />
                </div>
                <div>
                  <label htmlFor="probationEndDate" className="block text-xs font-semibold text-gray-600 mb-1.5">Probation End Date</label>
                  <input id="probationEndDate" type="date" value={form.probationEndDate} onChange={(e) => handleChange('probationEndDate', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                </div>
              </div>
            )}

            {/* Additional Admin Edit Fields (only relevant if expanding all fields) */}
            {isEditing && (
              <>
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800 mb-4">Address Details</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Address</label>
                      <input type="text" value={form.address} onChange={(e) => handleChange('address', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">City</label>
                      <input type="text" value={form.city} onChange={(e) => handleChange('city', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">State</label>
                      <input type="text" value={form.state} onChange={(e) => handleChange('state', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Postal Code (Pincode)</label>
                      <input type="text" value={form.postalCode} onChange={(e) => handleChange('postalCode', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Country</label>
                      <input type="text" value={form.country} onChange={(e) => handleChange('country', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800 mb-4">Statutory & Bank Details</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">PAN Number</label>
                      <input type="text" value={form.panNumber} onChange={(e) => handleChange('panNumber', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Aadhaar Number</label>
                      <input type="text" value={form.aadhaarNumber} onChange={(e) => handleChange('aadhaarNumber', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">UAN Number</label>
                      <input type="text" value={form.uanNumber} onChange={(e) => handleChange('uanNumber', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">ESIC Number</label>
                      <input type="text" value={form.esicNumber} onChange={(e) => handleChange('esicNumber', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <input type="checkbox" id="pfApplicable" checked={form.pfApplicable} onChange={(e) => handleChange('pfApplicable', e.target.checked as any)} className="w-4 h-4 text-[#2D7A4F] border-gray-300 rounded focus:ring-[#2D7A4F]" />
                      <label htmlFor="pfApplicable" className="text-sm text-gray-700 font-medium">PF Applicable</label>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <input type="checkbox" id="esicApplicable" checked={form.esicApplicable} onChange={(e) => handleChange('esicApplicable', e.target.checked as any)} className="w-4 h-4 text-[#2D7A4F] border-gray-300 rounded focus:ring-[#2D7A4F]" />
                      <label htmlFor="esicApplicable" className="text-sm text-gray-700 font-medium">ESIC Applicable</label>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Bank Name</label>
                      <input type="text" value={form.bankName} onChange={(e) => handleChange('bankName', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Bank Account Number</label>
                      <input type="text" value={form.bankAccountNumber} onChange={(e) => handleChange('bankAccountNumber', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Bank IFSC Code</label>
                      <input type="text" value={form.bankIfscCode} onChange={(e) => handleChange('bankIfscCode', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Bank Branch</label>
                      <input type="text" value={form.bankBranch} onChange={(e) => handleChange('bankBranch', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800 mb-4">Other Admin Details</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Work Location ID</label>
                      <input type="text" value={form.workLocationId} onChange={(e) => handleChange('workLocationId', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Grade ID</label>
                      <input type="text" value={form.gradeId} onChange={(e) => handleChange('gradeId', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Emergency Contact Name</label>
                      <input type="text" value={form.emergencyContactName} onChange={(e) => handleChange('emergencyContactName', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Emergency Contact Phone</label>
                      <input type="text" value={form.emergencyContactPhone} onChange={(e) => handleChange('emergencyContactPhone', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Emergency Contact Relationship</label>
                      <input type="text" value={form.emergencyContactRelationship} onChange={(e) => handleChange('emergencyContactRelationship', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Home Latitude</label>
                      <input type="number" step="any" value={form.homeLatitude} onChange={(e) => handleChange('homeLatitude', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Home Longitude</label>
                      <input type="number" step="any" value={form.homeLongitude} onChange={(e) => handleChange('homeLongitude', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date of Exit</label>
                      <input type="date" value={form.dateOfExit} onChange={(e) => handleChange('dateOfExit', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Exit Reason</label>
                      <input type="text" value={form.exitReason} onChange={(e) => handleChange('exitReason', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes</label>
                      <textarea value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] transition-all min-h-[80px]" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                <AlertCircle
                  size={15}
                  className="text-red-500 mt-0.5 flex-shrink-0"
                />
                <p className="text-xs text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Actions Buttons */}
            <div className="flex gap-3 pt-2">
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
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0f766e] rounded-xl hover:bg-[#1e5c3a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <UserPlus size={15} />
                    {isEditing ? 'Update Employee' : 'Create Employee'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
