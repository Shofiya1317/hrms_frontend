'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppImage from '@/components/ui/AppImage';
import {
  Building2,
  User,
  Lock,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Globe,
  MapPin,
  Briefcase,
  Users,
  Phone,
  Mail,
  BadgeCheck,
} from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface CompanyDetails {
  companyName: string;
  industry: string;
  companySize: string;
  website: string;
  address: string;
  city: string;
  country: string;
}

interface AdminDetails {
  fullName: string;
  designation: string;
  phone: string;
  department: string;
}

interface Credentials {
  email: string;
  password: string;
  confirmPassword: string;
}

const INDUSTRIES = [
  'Technology', 'Finance & Banking', 'Healthcare', 'Education', 'Manufacturing',
  'Retail & E-commerce', 'Media & Entertainment', 'Real Estate', 'Consulting', 'Other',
];

const COMPANY_SIZES = [
  '1–10 employees', '11–50 employees', '51–200 employees',
  '201–500 employees', '501–1000 employees', '1000+ employees',
];

const STEPS = [
  { id: 1, label: 'Company', icon: Building2 },
  { id: 2, label: 'Your Profile', icon: User },
  { id: 3, label: 'Credentials', icon: Lock },
];

export default function AdminSetupScreen() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [company, setCompany] = useState<CompanyDetails>({
    companyName: '', industry: '', companySize: '', website: '',
    address: '', city: '', country: '',
  });

  const [admin, setAdmin] = useState<AdminDetails>({
    fullName: '', designation: '', phone: '', department: '',
  });

  const [creds, setCreds] = useState<Credentials>({
    email: '', password: '', confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Validation ───────────────────────────────────────────────────────────
  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!company.companyName.trim()) e.companyName = 'Company name is required';
    if (!company.industry) e.industry = 'Please select an industry';
    if (!company.companySize) e.companySize = 'Please select company size';
    if (!company.country.trim()) e.country = 'Country is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!admin.fullName.trim()) e.fullName = 'Full name is required';
    if (!admin.designation.trim()) e.designation = 'Designation is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (!creds.email.trim()) {
      e.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(creds.email)) {
      e.email = 'Enter a valid email address';
    }
    if (!creds.password) {
      e.password = 'Password is required';
    } else if (creds.password.length < 8) {
      e.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[A-Z])(?=.*[0-9])/.test(creds.password)) {
      e.password = 'Must include at least one uppercase letter and one number';
    }
    if (!creds.confirmPassword) {
      e.confirmPassword = 'Please confirm your password';
    } else if (creds.password !== creds.confirmPassword) {
      e.confirmPassword = 'Passwords do not match';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    setGlobalError(null);
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleBack = () => {
    setErrors({});
    setGlobalError(null);
    setStep((s) => s - 1);
  };

  // ─── Final Submit ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateStep3()) return;
    setIsSubmitting(true);
    router.push('/admin');
  };

  // ─── Field helpers ─────────────────────────────────────────────────────────
  const fieldClass = (name: string) =>
    `w-full h-11 px-4 rounded-xl border text-sm font-medium text-gray-900 placeholder:text-gray-400 placeholder:font-normal bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/25 focus:border-[#2D7A4F] ${
      errors[name] ? 'border-red-400 bg-red-50/30' : 'border-gray-200 hover:border-gray-300'
    }`;

  const FieldError = ({ name }: { name: string }) =>
    errors[name] ? (
      <p className="mt-1.5 text-xs font-medium text-red-600 flex items-center gap-1">
        <AlertCircle size={11} />
        {errors[name]}
      </p>
    ) : null;

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[45%] flex-shrink-0 bg-gradient-to-br from-[#1a4d30] via-[#2D7A4F] to-[#3a9e68] relative overflow-hidden flex-col items-center justify-center px-12 py-16">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-white/20 blur-3xl" />
        </div>

        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <AppImage
              src="/assets/images/ChatGPT_Image_Mar_20_2026_from_HRMS_System_Design-1773983355969.png"
              alt="Impactree Workflo logo"
              width={52}
              height={52}
              className="h-13 w-13 object-contain"
            />
            <div className="text-left">
              <span className="block font-bold text-xl text-white leading-none">Impactree</span>
              <span className="block text-xs font-semibold tracking-widest text-white/70 uppercase mt-0.5">
                Workflo
              </span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
            Welcome to<br />Impactree Workflo
          </h1>
          <p className="text-white/75 text-base leading-relaxed max-w-xs mx-auto mb-10">
            Set up your workspace in minutes. You&apos;ll be the first admin and employee of your organisation.
          </p>

          {/* Step indicators */}
          <div className="flex flex-col gap-4 text-left max-w-xs mx-auto">
            {STEPS.map((s) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isDone = step > s.id;
              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-white/20 border border-white/30'
                      : isDone
                      ? 'bg-white/10 border border-white/15' :'opacity-50'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isDone ? 'bg-white text-[#2D7A4F]' : isActive ? 'bg-white/30 text-white' : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {isDone ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isActive || isDone ? 'text-white' : 'text-white/60'}`}>
                      Step {s.id}: {s.label}
                    </p>
                    <p className={`text-xs ${isActive ? 'text-white/70' : 'text-white/40'}`}>
                      {s.id === 1 && 'Company name, industry & size'}
                      {s.id === 2 && 'Your name, role & contact'}
                      {s.id === 3 && 'Email & secure password'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center bg-white min-h-screen px-6 py-10 sm:px-10 lg:px-12 xl:px-16">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-7 lg:hidden">
            <AppImage
              src="/assets/images/ChatGPT_Image_Mar_20_2026_from_HRMS_System_Design-1773983355969.png"
              alt="Impactree Workflo logo"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
            <div>
              <span className="font-bold text-base text-gray-900 leading-none">Impactree</span>
              <span className="block text-[10px] font-semibold tracking-widest text-[#2D7A4F] uppercase leading-none mt-0.5">
                Workflo
              </span>
            </div>
          </div>

          {/* Mobile step indicator */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
                  step >= s.id ? 'bg-[#2D7A4F]' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-[#2D7A4F] uppercase tracking-wider mb-1">
              Step {step} of {STEPS.length}
            </p>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-1.5">
              {step === 1 && 'Tell us about your company'}
              {step === 2 && 'Your personal details'}
              {step === 3 && 'Set your login credentials'}
            </h2>
            <p className="text-sm text-gray-500">
              {step === 1 && 'This information helps personalise your HRMS workspace.'}
              {step === 2 && 'You will be registered as the first employee and admin.'}
              {step === 3 && 'Choose a strong password. You can change it later from settings.'}
            </p>
          </div>

          {/* Global error */}
          {globalError && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium leading-snug">{globalError}</p>
            </div>
          )}

          {/* ── STEP 1: Company Details ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g. Impactree Technologies Pvt Ltd"
                    value={company.companyName}
                    onChange={(e) => setCompany({ ...company, companyName: e.target.value })}
                    className={`${fieldClass('companyName')} pl-10`}
                  />
                </div>
                <FieldError name="companyName" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Industry <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={company.industry}
                    onChange={(e) => setCompany({ ...company, industry: e.target.value })}
                    className={`${fieldClass('industry')} appearance-none`}
                  >
                    <option value="">Select industry</option>
                    {INDUSTRIES.map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                  <FieldError name="industry" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Company Size <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={company.companySize}
                    onChange={(e) => setCompany({ ...company, companySize: e.target.value })}
                    className={`${fieldClass('companySize')} appearance-none`}
                  >
                    <option value="">Select size</option>
                    {COMPANY_SIZES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <FieldError name="companySize" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Website <span className="text-gray-400 font-normal text-xs">(optional)</span>
                </label>
                <div className="relative">
                  <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    placeholder="https://yourcompany.com"
                    value={company.website}
                    onChange={(e) => setCompany({ ...company, website: e.target.value })}
                    className={`${fieldClass('website')} pl-10`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Office Address <span className="text-gray-400 font-normal text-xs">(optional)</span>
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Street address"
                    value={company.address}
                    onChange={(e) => setCompany({ ...company, address: e.target.value })}
                    className={`${fieldClass('address')} pl-10`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru"
                    value={company.city}
                    onChange={(e) => setCompany({ ...company, city: e.target.value })}
                    className={fieldClass('city')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. India"
                    value={company.country}
                    onChange={(e) => setCompany({ ...company, country: e.target.value })}
                    className={fieldClass('country')}
                  />
                  <FieldError name="country" />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Admin Personal Details ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="bg-[#2D7A4F]/5 border border-[#2D7A4F]/15 rounded-xl px-4 py-3 flex items-start gap-2.5">
                <BadgeCheck size={16} className="text-[#2D7A4F] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#2D7A4F] font-medium leading-snug">
                  You will be registered as <strong>Employee #EMP-001</strong> and the system admin.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g. Arjun Mehta"
                    value={admin.fullName}
                    onChange={(e) => setAdmin({ ...admin, fullName: e.target.value })}
                    className={`${fieldClass('fullName')} pl-10`}
                  />
                </div>
                <FieldError name="fullName" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Designation / Job Title <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g. CEO, HR Manager, Founder"
                    value={admin.designation}
                    onChange={(e) => setAdmin({ ...admin, designation: e.target.value })}
                    className={`${fieldClass('designation')} pl-10`}
                  />
                </div>
                <FieldError name="designation" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Department <span className="text-gray-400 font-normal text-xs">(optional)</span>
                  </label>
                  <div className="relative">
                    <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. Management"
                      value={admin.department}
                      onChange={(e) => setAdmin({ ...admin, department: e.target.value })}
                      className={`${fieldClass('department')} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Phone <span className="text-gray-400 font-normal text-xs">(optional)</span>
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={admin.phone}
                      onChange={(e) => setAdmin({ ...admin, phone: e.target.value })}
                      className={`${fieldClass('phone')} pl-10`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Credentials ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Work Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="e.g. admin@yourcompany.com"
                    value={creds.email}
                    onChange={(e) => setCreds({ ...creds, email: e.target.value })}
                    className={`${fieldClass('email')} pl-10`}
                  />
                </div>
                <FieldError name="email" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Min. 8 chars, 1 uppercase, 1 number"
                    value={creds.password}
                    onChange={(e) => setCreds({ ...creds, password: e.target.value })}
                    className={`${fieldClass('password')} pl-10 pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <FieldError name="password" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    value={creds.confirmPassword}
                    onChange={(e) => setCreds({ ...creds, confirmPassword: e.target.value })}
                    className={`${fieldClass('confirmPassword')} pl-10 pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <FieldError name="confirmPassword" />
              </div>

              {/* Password strength hints */}
              <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-1.5">
                <p className="text-xs font-semibold text-gray-500 mb-2">Password requirements:</p>
                {[
                  { label: 'At least 8 characters', met: creds.password.length >= 8 },
                  { label: 'One uppercase letter (A–Z)', met: /[A-Z]/.test(creds.password) },
                  { label: 'One number (0–9)', met: /[0-9]/.test(creds.password) },
                ].map((req) => (
                  <div key={req.label} className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                        req.met ? 'bg-[#2D7A4F]' : 'bg-gray-200'
                      }`}
                    >
                      {req.met && <CheckCircle2 size={10} className="text-white" />}
                    </div>
                    <span className={`text-xs ${req.met ? 'text-[#2D7A4F] font-medium' : 'text-gray-400'}`}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2D7A4F] text-white text-sm font-semibold hover:bg-[#245f3e] transition-all duration-200 shadow-sm"
              >
                Continue
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2D7A4F] text-white text-sm font-semibold hover:bg-[#245f3e] transition-all duration-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Complete Setup
                  </>
                )}
              </button>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Already have an account?{' '}
            <a href="/sign-up-login-screen" className="text-[#2D7A4F] font-semibold hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
