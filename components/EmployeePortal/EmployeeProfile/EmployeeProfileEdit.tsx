// 'use client';

// import React, { useState } from 'react';
// import {
//   User, Phone, MapPin, Building2, AlertCircle,
//   CheckCircle2, Loader2, ChevronRight, Activity,
// } from 'lucide-react';
// import { updateEmployeeSelf, UpdateEmployeeSelfDto } from '@/lib/service/employee';

// interface EmployeeProfileEditProps {
//   employee: any;
//   token: string;
//   slug: string;
// }

// interface SectionProps {
//   title: string;
//   icon: React.ReactNode;
//   children: React.ReactNode;
// }

// function Section({ title, icon, children }: SectionProps) {
//   return (
//     <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
//       <div className="flex items-center gap-2 mb-5">
//         <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
//           {icon}
//         </div>
//         <h3 className="text-sm font-bold text-slate-800">{title}</h3>
//       </div>
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
//     </div>
//   );
// }

// interface FieldProps {
//   label: string;
//   name: keyof UpdateEmployeeSelfDto;
//   value: string;
//   type?: string;
//   placeholder?: string;
//   onChange: (name: keyof UpdateEmployeeSelfDto, value: string) => void;
// }

// function Field({
//   label, name, value, type = 'text', placeholder, onChange,
// }: FieldProps) {
//   return (
//     <div className="flex flex-col gap-1.5">
//       <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
//       <input
//         type={type}
//         value={value}
//         placeholder={placeholder || `Enter ${label.toLowerCase()}`}
//         onChange={(e) => onChange(name, e.target.value)}
//         className="w-full px-3.5 py-2.5 text-sm text-slate-800 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
//       />
//     </div>
//   );
// }

// export default function EmployeeProfileEdit({ employee, token, slug }: EmployeeProfileEditProps) {
//   const [form, setForm] = useState<UpdateEmployeeSelfDto>({
//     personal_email: employee?.personal_email ?? '',
//     personal_phone: employee?.personal_phone ?? '',
//     blood_group: employee?.blood_group ?? '',
//     current_address: employee?.current_address ?? '',
//     permanent_address: employee?.permanent_address ?? '',
//     city: employee?.city ?? '',
//     state: employee?.state ?? '',
//     pincode: employee?.pincode ?? '',
//     country: employee?.country ?? '',
//     profile_photo_url: employee?.profile_photo_url ?? '',
//     bank_ifsc: employee?.bank_ifsc ?? '',
//     bank_name: employee?.bank_name ?? '',
//     bank_account_number: employee?.bank_account_number ?? '',
//     emergency_contact_name: employee?.emergency_contact_name ?? '',
//     emergency_contact_phone: employee?.emergency_contact_phone ?? '',
//     emergency_contact_relation: employee?.emergency_contact_relation ?? '',
//   });

//   const [saving, setSaving] = useState(false);
//   const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

//   const handleChange = (name: keyof UpdateEmployeeSelfDto, value: string) => {
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const showToast = (msg: string, type: 'success' | 'error') => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3500);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSaving(true);
//     try {
//       const payload: UpdateEmployeeSelfDto = Object.fromEntries(
//         Object.entries(form).filter(([, v]) => v !== ''),
//       ) as UpdateEmployeeSelfDto;
//       await updateEmployeeSelf(payload, slug, token);
//       showToast('Profile updated successfully', 'success');
//     } catch {
//       showToast('Failed to update profile. Please try again.', 'error');
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="min-h-screen">
//       {/* Toast */}
//       {toast && (
//         <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
//           <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-lg border ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
//             {toast.type === 'success' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
//             {toast.msg}
//           </div>
//         </div>
//       )}

//       <div className="w-full px-3 py-2 sm:px-5 sm:py-3 lg:px-6 lg:py-4">
//         {/* Header */}
//         <div className="mb-4">
//           <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-2">
//             <Activity size={14} />
//             <span>Employee</span>
//             <ChevronRight size={12} />
//             <span className="text-emerald-600 font-semibold">Edit Profile</span>
//           </div>
//           <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Edit Profile</h1>
//           <p className="text-xs sm:text-sm text-slate-500 mt-1">Update your personal and contact information</p>
//         </div>

//         {/* Read-only identity strip */}
//         <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 mb-4 flex items-center gap-4">
//           <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
//             {employee?.profile_photo_url
//               ? <img src={employee.profile_photo_url} alt="avatar" className="w-14 h-14 rounded-2xl object-cover" />
//               : <User size={24} className="text-emerald-500" />}
//           </div>
//           <div>
//             <p className="text-base font-bold text-slate-900">
//               {employee?.first_name}
//               {' '}
//               {employee?.last_name}
//             </p>
//             <p className="text-xs text-slate-500">{employee?.work_email}</p>
//             <p className="text-xs text-slate-400 mt-0.5">
//               {employee?.designation?.name ?? ''}
//               {employee?.department?.name ? ` · ${employee.department.name}` : ''}
//             </p>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//           {/* Contact */}
//           <Section title="Contact Information" icon={<Phone size={15} />}>
//             <Field label="Personal Email" name="personal_email" type="email" value={form.personal_email ?? ''} onChange={handleChange} />
//             <Field label="Personal Phone" name="personal_phone" value={form.personal_phone ?? ''} onChange={handleChange} placeholder="+91 9876543210" />
//             <Field label="Blood Group" name="blood_group" value={form.blood_group ?? ''} onChange={handleChange} placeholder="e.g. O+" />
//             <Field label="Profile Photo URL" name="profile_photo_url" value={form.profile_photo_url ?? ''} onChange={handleChange} placeholder="https://..." />
//           </Section>

//           {/* Address */}
//           <Section title="Address" icon={<MapPin size={15} />}>
//             <div className="sm:col-span-2">
//               <Field label="Current Address" name="current_address" value={form.current_address ?? ''} onChange={handleChange} placeholder="123 Main Street" />
//             </div>
//             <div className="sm:col-span-2">
//               <Field label="Permanent Address" name="permanent_address" value={form.permanent_address ?? ''} onChange={handleChange} placeholder="456 Home Town" />
//             </div>
//             <Field label="City" name="city" value={form.city ?? ''} onChange={handleChange} placeholder="Bangalore" />
//             <Field label="State" name="state" value={form.state ?? ''} onChange={handleChange} placeholder="Karnataka" />
//             <Field label="Pincode" name="pincode" value={form.pincode ?? ''} onChange={handleChange} placeholder="560001" />
//             <Field label="Country" name="country" value={form.country ?? ''} onChange={handleChange} placeholder="India" />
//           </Section>

//           {/* Bank */}
//           <Section title="Bank Details" icon={<Building2 size={15} />}>
//             <Field label="Bank Name" name="bank_name" value={form.bank_name ?? ''} onChange={handleChange} placeholder="HDFC Bank" />
//             <Field label="Account Number" name="bank_account_number" value={form.bank_account_number ?? ''} onChange={handleChange} placeholder="1234567890" />
//             <Field label="IFSC Code" name="bank_ifsc" value={form.bank_ifsc ?? ''} onChange={handleChange} placeholder="HDFC0001234" />
//           </Section>

//           {/* Emergency Contact */}
//           <Section title="Emergency Contact" icon={<AlertCircle size={15} />}>
//             <Field label="Name" name="emergency_contact_name" value={form.emergency_contact_name ?? ''} onChange={handleChange} placeholder="Jane Doe" />
//             <Field label="Phone" name="emergency_contact_phone" value={form.emergency_contact_phone ?? ''} onChange={handleChange} placeholder="+91 9876543211" />
//             <Field label="Relation" name="emergency_contact_relation" value={form.emergency_contact_relation ?? ''} onChange={handleChange} placeholder="Spouse" />
//           </Section>

//           {/* Submit */}
//           <div className="flex justify-end pb-6">
//             <button
//               type="submit"
//               disabled={saving}
//               className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-[0_4px_14px_rgba(16,185,129,0.35)] transition-all active:scale-95 disabled:opacity-60"
//             >
//               {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
//               Save Changes
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }


'use client';

import React, { useEffect, useState } from 'react';
import {
  User, Phone, MapPin, Building2, AlertCircle,
  CheckCircle2, Loader2, ChevronRight, Activity,
} from 'lucide-react';
import {
  getEmployeeMe, updateEmployeeSelf, UpdateEmployeeSelfDto,
} from '@/lib/service/employee';

interface EmployeeProfileEditProps {
  employee: any; // initial data passed from the server (used as fallback while client-fetch runs)
  token: string;
  slug: string;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function Section({ title, icon, children }: SectionProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
          {icon}
        </div>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

interface FieldProps {
  label: string;
  name: keyof UpdateEmployeeSelfDto;
  value: string;
  type?: string;
  placeholder?: string;
  onChange: (name: keyof UpdateEmployeeSelfDto, value: string) => void;
}

function Field({
  label, name, value, type = 'text', placeholder, onChange,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full px-3.5 py-2.5 text-sm text-slate-800 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
      />
    </div>
  );
}

const buildFormFromEmployee = (employee: any): UpdateEmployeeSelfDto => ({
  personal_email: employee?.personal_email ?? '',
  personal_phone: employee?.personal_phone ?? '',
  blood_group: employee?.blood_group ?? '',
  current_address: employee?.current_address ?? '',
  permanent_address: employee?.permanent_address ?? '',
  city: employee?.city ?? '',
  state: employee?.state ?? '',
  pincode: employee?.pincode ?? '',
  country: employee?.country ?? '',
  profile_photo_url: employee?.profile_photo_url ?? '',
  bank_ifsc: employee?.bank_ifsc ?? '',
  bank_name: employee?.bank_name ?? '',
  bank_account_number: employee?.bank_account_number ?? '',
  emergency_contact_name: employee?.emergency_contact_name ?? '',
  emergency_contact_phone: employee?.emergency_contact_phone ?? '',
  emergency_contact_relation: employee?.emergency_contact_relation ?? '',
});

export default function EmployeeProfileEdit({ employee, token, slug }: EmployeeProfileEditProps) {
  const [employeeData, setEmployeeData] = useState<any>(employee ?? null);
  const [form, setForm] = useState<UpdateEmployeeSelfDto>(buildFormFromEmployee(employee));

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Always pull the freshest saved data on mount, in case the server-passed
  // `employee` prop is stale (e.g. cached page render).
  useEffect(() => {
    let isMounted = true;

    const loadEmployee = async () => {
      try {
        const res = await getEmployeeMe(slug, token);
        const fresh = res?.data?.data ?? null;
        if (isMounted && fresh) {
          setEmployeeData(fresh);
          setForm(buildFormFromEmployee(fresh));
        }
      } catch {
        if (isMounted && !employee) {
          showToast('Could not load your profile data', 'error');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadEmployee();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (name: keyof UpdateEmployeeSelfDto, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: UpdateEmployeeSelfDto = Object.fromEntries(
        Object.entries(form).filter(([, v]) => v !== ''),
      ) as UpdateEmployeeSelfDto;

      const res = await updateEmployeeSelf(payload, slug, token);

      // Reflect the freshly saved values back into the form/identity strip
      const updated = res?.data?.data ?? { ...employeeData, ...payload };
      setEmployeeData(updated);
      setForm(buildFormFromEmployee(updated));

      showToast('Profile updated successfully', 'success');
    } catch {
      showToast('Failed to update profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Loader2 size={16} className="animate-spin" />
          Loading your profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-lg border ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
            {toast.msg}
          </div>
        </div>
      )}

    
        {/* Header */}
      

        {/* Read-only identity strip */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 mb-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            {employeeData?.profile_photo_url
              ? <img src={employeeData.profile_photo_url} alt="avatar" className="w-14 h-14 rounded-2xl object-cover" />
              : <User size={24} className="text-emerald-500" />}
          </div>
          <div>
            <p className="text-base font-bold text-slate-900">
              {employeeData?.first_name}
              {' '}
              {employeeData?.last_name}
            </p>
            <p className="text-xs text-slate-500">{employeeData?.work_email}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {employeeData?.designation?.name ?? ''}
              {employeeData?.department?.name ? ` · ${employeeData.department.name}` : ''}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Contact */}
          <Section title="Contact Information" icon={<Phone size={15} />}>
            <Field label="Personal Email" name="personal_email" type="email" value={form.personal_email ?? ''} onChange={handleChange} />
            <Field label="Personal Phone" name="personal_phone" value={form.personal_phone ?? ''} onChange={handleChange} placeholder="+91 9876543210" />
            <Field label="Blood Group" name="blood_group" value={form.blood_group ?? ''} onChange={handleChange} placeholder="e.g. O+" />
            <Field label="Profile Photo URL" name="profile_photo_url" value={form.profile_photo_url ?? ''} onChange={handleChange} placeholder="https://..." />
          </Section>

          {/* Address */}
          <Section title="Address" icon={<MapPin size={15} />}>
            <div className="sm:col-span-2">
              <Field label="Current Address" name="current_address" value={form.current_address ?? ''} onChange={handleChange} placeholder="123 Main Street" />
            </div>
            <div className="sm:col-span-2">
              <Field label="Permanent Address" name="permanent_address" value={form.permanent_address ?? ''} onChange={handleChange} placeholder="456 Home Town" />
            </div>
            <Field label="City" name="city" value={form.city ?? ''} onChange={handleChange} placeholder="Bangalore" />
            <Field label="State" name="state" value={form.state ?? ''} onChange={handleChange} placeholder="Karnataka" />
            <Field label="Pincode" name="pincode" value={form.pincode ?? ''} onChange={handleChange} placeholder="560001" />
            <Field label="Country" name="country" value={form.country ?? ''} onChange={handleChange} placeholder="India" />
          </Section>

          {/* Bank */}
          <Section title="Bank Details" icon={<Building2 size={15} />}>
            <Field label="Bank Name" name="bank_name" value={form.bank_name ?? ''} onChange={handleChange} placeholder="HDFC Bank" />
            <Field label="Account Number" name="bank_account_number" value={form.bank_account_number ?? ''} onChange={handleChange} placeholder="1234567890" />
            <Field label="IFSC Code" name="bank_ifsc" value={form.bank_ifsc ?? ''} onChange={handleChange} placeholder="HDFC0001234" />
          </Section>

          {/* Emergency Contact */}
          <Section title="Emergency Contact" icon={<AlertCircle size={15} />}>
            <Field label="Name" name="emergency_contact_name" value={form.emergency_contact_name ?? ''} onChange={handleChange} placeholder="Jane Doe" />
            <Field label="Phone" name="emergency_contact_phone" value={form.emergency_contact_phone ?? ''} onChange={handleChange} placeholder="+91 9876543211" />
            <Field label="Relation" name="emergency_contact_relation" value={form.emergency_contact_relation ?? ''} onChange={handleChange} placeholder="Spouse" />
          </Section>

          {/* Submit */}
          <div className="flex justify-end pb-6">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-[0_4px_14px_rgba(16,185,129,0.35)] transition-all active:scale-95 disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              Save Changes
            </button>
          </div>
        </form>
      
    </div>
  );
}