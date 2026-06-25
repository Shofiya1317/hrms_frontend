'use client';

import { AuthService, UserService } from '@/lib/service';
import { Form, Formik, FormikHelpers } from 'formik';
import { signOut } from 'next-auth/react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { object, ref, string } from 'yup';
import {
  KeyRound, Eye, EyeOff, Loader2, CheckCircle2,
} from 'lucide-react';

interface IFields {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const handleChangePassword = async (
  values: IFields,
  slug: string,
  helpers: FormikHelpers<IFields>,
  router: AppRouterInstance,
) => {
  await helpers.validateForm(values);
  const res = await UserService.changePassword({
    oldPassword: values.oldPassword,
    password: values.newPassword,
    passwordConfirmation: values.confirmPassword,
  }, slug);

  const { success, error } = res?.data as {
    success: boolean;
    error: string[];
  };

  if (success) {
    toast.success('Password updated successfully');
    await AuthService.logout({ slug });
    signOut({ redirect: false });
    router.push('/sign_in');
  } else {
    toast.error(error[0]);
  }
};

interface PasswordFieldProps {
  label: string;
  name: keyof IFields;
  value: string;
  error?: string;
  visible: boolean;
  placeholder?: string;
  onToggleVisible: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}

// Styled to match the Field component in EmployeeProfileEdit exactly,
// with a show/hide toggle for password input.
function PasswordField({
  label, name, value, error, visible, placeholder, onToggleVisible, onChange, onBlur,
}: PasswordFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          className="w-full px-3.5 py-2.5 pr-10 text-sm text-slate-800 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={onToggleVisible}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

export default function ChangePassword({ slug }: Readonly<{ slug: string }>) {
  const router = useRouter();
  const [oldPasswordVisible, setOldPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const validationSchema = object({
    oldPassword: string()
      .required('Old password is required')
      .max(18, 'Password must be between 8 and 18 characters')
      .min(8, 'Password must be between 8 and 18 characters')
      .matches(/^(?=.{8,18}$)/, 'Password must be between 8 and 18 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])/,
        'Must contains uppercase, special character and number',
      )
      .matches(
        /^(?=.*?[!"#$%&'()*+,-./:;<=>?@_`{}~])/,
        'Must contains uppercase, special character and number',
      )
      .matches(
        /^(?=.*\d)/,
        'Must contains uppercase, special character and number',
      ),
    newPassword: string()
      .max(18, 'Password must be between 8 and 18 characters')
      .min(8, 'Password must be between 8 and 18 characters')
      .matches(/^(?=.{8,18}$)/, 'Password must be between 8 and 18 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])/,
        'Must contains uppercase, special character and number',
      )
      .matches(
        /^(?=.*?[!"#$%&'()*+,-./:;<=>?@_`{}~])/,
        'Must contains uppercase, special character and number',
      )
      .matches(
        /^(?=.*\d)/,
        'Must contains uppercase, special character and number',
      )
      .notOneOf([ref('oldPassword')], 'Old Password must not match')
      .required('New password is required'),
    confirmPassword: string()
      .oneOf([ref('newPassword')], 'Passwords must match')
      .required('Please confirm your password'),
  });

  const onSubmit = async (
    values: IFields,
    formikHelpers: FormikHelpers<IFields>,
  ) => {
    await handleChangePassword(values, slug, formikHelpers, router);
  };

  return (
    <div className="p-3 sm:p-5">
      {/* <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
          <KeyRound size={15} />
        </div>
        <h3 className="text-sm font-bold text-slate-800">Change Password</h3>
      </div> */}

      <Formik
        initialValues={{
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        }}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        validateOnChange={false}
      >
        {({
          values, errors, isSubmitting, handleChange, handleBlur, handleSubmit, resetForm, dirty,
        }) => (
          <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <PasswordField
              label="Old Password"
              name="oldPassword"
              value={values.oldPassword}
              error={errors.oldPassword}
              visible={oldPasswordVisible}
              onToggleVisible={() => setOldPasswordVisible((v) => !v)}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your old password"
            />
            <PasswordField
              label="New Password"
              name="newPassword"
              value={values.newPassword}
              error={errors.newPassword}
              visible={newPasswordVisible}
              onToggleVisible={() => setNewPasswordVisible((v) => !v)}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your new password"
            />
            <PasswordField
              label="Confirm Password"
              name="confirmPassword"
              value={values.confirmPassword}
              error={errors.confirmPassword}
              visible={confirmPasswordVisible}
              onToggleVisible={() => setConfirmPasswordVisible((v) => !v)}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your confirm password"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => resetForm()}
                className="px-5 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !dirty}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#0f766e] text-white text-sm font-bold rounded-xl shadow-[0_4px_14px_rgba(16,185,129,0.35)] transition-all active:scale-95 disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Update Password
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}