'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, ShieldCheck, User, Info, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import AppImage from '@/components/ui/AppImage';

interface LoginFormProps {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
}

interface FormData {
  email: string;
  password: string;
}

const ROLES: { key: UserRole; label: string; icon: React.ReactNode; description: string }[] = [
  {
    key: 'admin',
    label: 'Product Admin',
    icon: <ShieldCheck size={15} />,
    description: 'Full system access',
  },
  {
    key: 'employee',
    label: 'Employee / Manager',
    icon: <User size={15} />,
    description: 'Self-service portal',
  },
];

const DEMO_CREDENTIALS: Record<UserRole, { email: string; password: string; name: string }[]> = {
  admin: [
    { email: 'admin@impactree.in', password: 'Admin@Workflo26', name: 'Arjun Mehta (Admin)' },
  ],
  manager: [
    { email: 'manager@impactree.in', password: 'Mgr@Workflo26', name: 'Rahul Sharma (Manager)' },
  ],
  employee: [
    { email: 'employee@impactree.in', password: 'Emp@Workflo26', name: 'Ananya Krishnan (Employee)' },
    { email: 'manager@impactree.in', password: 'Mgr@Workflo26', name: 'Rahul Sharma (Manager)' },
  ],
};

export default function LoginForm({ activeRole, setActiveRole }: LoginFormProps) {
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleBackToLogin = () => setShowForgotPassword(false);

  const handleRoleSwitch = (role: UserRole) => {
    setActiveRole(role);
    setLoginError(null);
    setEmailError('');
    setPasswordError('');
    setEmail('');
    setPassword('');
  };

  const fillDemoCredentials = (cred: { email: string; password: string }) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setLoginError(null);
    setEmailError('');
    setPasswordError('');
  };

  const validate = () => {
    let valid = true;
    if (!email.trim()) {
      setEmailError('Email is required');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Enter a valid email address');
      valid = false;
    } else {
      setEmailError('');
    }
    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      valid = false;
    } else {
      setPasswordError('');
    }
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent double-submit if already loading
    if (isLoading) return;
    if (!validate()) return;

    setIsLoading(true);
    setLoginError(null);

    try {
      await signIn(email.trim().toLowerCase(), password);
      // Navigation is handled by AuthContext onAuthStateChange.
      // Keep isLoading=true so the button stays disabled during redirect.
    } catch (err: any) {
      setIsLoading(false);
      const msg = err?.message || 'Login failed';
      if (
        msg.toLowerCase().includes('invalid login') ||
        msg.toLowerCase().includes('invalid credentials') ||
        msg.toLowerCase().includes('email not confirmed')
      ) {
        setLoginError('Invalid email or password. Please check your credentials and try again.');
      } else if (msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('too many')) {
        setLoginError('Too many login attempts. Please wait a moment before trying again.');
      } else {
        setLoginError(msg);
      }
    }
  };

  const activeRoleData = ROLES.find((r) => r.key === activeRole)!;
  const demoCreds = DEMO_CREDENTIALS[activeRole];

  if (showForgotPassword) {
    return (
      <div className="animate-fade-in">
        <div className="mb-8">
          <button
            type="button"
            onClick={handleBackToLogin}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#2D7A4F] hover:text-[#1e5c3a] mb-5 transition-colors duration-150 cursor-pointer"
          >
            <ArrowLeft size={15} />
            Back to sign in
          </button>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-1.5">Reset your password</h2>
          <p className="text-sm text-gray-500 font-medium">
            Password reset is not available in demo mode. Use the credentials shown below.
          </p>
        </div>
        <button
          type="button"
          onClick={handleBackToLogin}
          className="w-full h-11 rounded-xl font-semibold text-sm text-white bg-[#2D7A4F] hover:bg-[#1e5c3a] transition-all duration-200 cursor-pointer"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        {/* Mobile logo */}
        <div className="flex items-center gap-2.5 mb-7 lg:hidden">
          <AppImage
            src="/assets/images/ChatGPT_Image_Mar_20_2026_from_HRMS_System_Design-1773983355969.png"
            alt="Impactree Workflo brand logo"
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

        <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-1.5">
          Sign in to your account
        </h2>
        <p className="text-sm text-gray-500 font-medium">
          Select your role and enter your credentials below.
        </p>
      </div>

      {/* Role Selector Tabs */}
      <div className="mb-7">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
          I am a
        </p>
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
          {ROLES.map((role) => (
            <button
              key={role.key}
              type="button"
              onClick={() => handleRoleSwitch(role.key)}
              className={`
                relative flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg text-center
                transition-all duration-200 cursor-pointer
                ${
                  activeRole === role.key
                    ? 'bg-white shadow-sm text-[#2D7A4F] border border-[#2D7A4F]/15'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
                }
              `}
              aria-pressed={activeRole === role.key}
              aria-label={`Sign in as ${role.label}`}
            >
              <span
                className={`transition-colors duration-200 ${
                  activeRole === role.key ? 'text-[#2D7A4F]' : 'text-gray-400'
                }`}
              >
                {role.icon}
              </span>
              <span
                className={`text-xs font-semibold leading-tight transition-colors duration-200 ${
                  activeRole === role.key ? 'text-[#2D7A4F]' : 'text-gray-500'
                }`}
              >
                {role.label}
              </span>
              <span
                className={`text-[10px] leading-tight transition-colors duration-200 hidden sm:block ${
                  activeRole === role.key ? 'text-[#2D7A4F]/70' : 'text-gray-400'
                }`}
              >
                {role.description}
              </span>
              {activeRole === role.key && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[#2D7A4F]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate>
        {/* Global error */}
        {loginError && (
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium leading-snug">{loginError}</p>
          </div>
        )}

        {/* Email field */}
        <div className="mb-5">
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Work Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={`e.g. ${activeRole}@impactree.in`}
            className={`
              w-full h-11 px-4 rounded-xl border text-sm font-medium text-gray-900
              placeholder:text-gray-400 placeholder:font-normal
              bg-white transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/25 focus:border-[#2D7A4F]
              ${emailError ? 'border-red-400 bg-red-50/30' : 'border-gray-200 hover:border-gray-300'}
            `}
          />
          {emailError && (
            <p className="mt-1.5 text-xs font-medium text-red-600 flex items-center gap-1">
              <AlertCircle size={11} />
              {emailError}
            </p>
          )}
        </div>

        {/* Password field */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <button
              type="button"
              onClick={() => { setShowForgotPassword(true) }}
              className="text-xs font-semibold text-[#2D7A4F] hover:text-[#1e5c3a] transition-colors duration-150 cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={`
                w-full h-11 px-4 pr-11 rounded-xl border text-sm font-medium text-gray-900
                placeholder:text-gray-400 placeholder:font-normal
                bg-white transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/25 focus:border-[#2D7A4F]
                ${passwordError ? 'border-red-400 bg-red-50/30' : 'border-gray-200 hover:border-gray-300'}
              `}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-150 cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {passwordError && (
            <p className="mt-1.5 text-xs font-medium text-red-600 flex items-center gap-1">
              <AlertCircle size={11} />
              {passwordError}
            </p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`
            w-full h-11 rounded-xl font-semibold text-sm text-white
            flex items-center justify-center gap-2
            transition-all duration-200
            ${
              isLoading
                ? 'bg-[#2D7A4F]/70 cursor-not-allowed'
                : 'bg-[#2D7A4F] hover:bg-[#1e5c3a] active:scale-[0.98] cursor-pointer shadow-sm shadow-[#2D7A4F]/25 hover:shadow-md hover:shadow-[#2D7A4F]/20'
            }
          `}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin flex-shrink-0" />
              <span>Signing in…</span>
            </>
          ) : (
            <span>Sign in as {activeRoleData.label}</span>
          )}
        </button>
      </form>

      {/* Demo credentials */}
      <div className="mt-6 rounded-xl border border-[#2D7A4F]/20 bg-[#e8f5ee]/60 p-4">
        <div className="flex items-start gap-2.5 mb-3">
          <Info size={14} className="text-[#2D7A4F] flex-shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-[#1e5c3a] uppercase tracking-wider">
            Demo credentials — {activeRoleData.label}
          </p>
        </div>

        <div className="space-y-3">
          {demoCreds.map((cred) => (
            <div key={cred.email} className="space-y-1.5 pb-3 border-b border-[#2D7A4F]/10 last:border-0 last:pb-0">
              <p className="text-[10px] font-bold text-[#2D7A4F]/70 uppercase tracking-wider">{cred.name}</p>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-gray-500 font-medium w-16 flex-shrink-0">Email</span>
                <span className="text-xs font-semibold text-gray-800 tabular-nums truncate">{cred.email}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-gray-500 font-medium w-16 flex-shrink-0">Password</span>
                <span className="text-xs font-semibold text-gray-800 tabular-nums">{cred.password}</span>
              </div>
              <button
                type="button"
                onClick={() => fillDemoCredentials(cred)}
                className="w-full h-7 rounded-lg border border-[#2D7A4F]/30 bg-white text-xs font-semibold text-[#2D7A4F] hover:bg-[#2D7A4F] hover:text-white transition-all duration-200 cursor-pointer active:scale-[0.98]"
              >
                Fill credentials
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-6 text-center text-xs text-gray-400 font-medium leading-relaxed">
        By signing in, you agree to Impactree&apos;s{' '}
        <a href="#" className="text-[#2D7A4F] hover:underline font-semibold">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="text-[#2D7A4F] hover:underline font-semibold">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}