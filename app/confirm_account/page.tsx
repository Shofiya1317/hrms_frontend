'use client';

import { AuthService } from '@/lib/service';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Form, Formik } from 'formik';
import { object, string, boolean } from 'yup';
import toast from 'react-hot-toast';
import { FormikField } from '@/components/FormikField/FormikField';
import CustomCheckbox from '@/components/Checkbox/Checkbox';
import { Button } from '@/components/Button/Button';
import { MdArrowForward } from 'react-icons/md';
import { Loader2 } from 'lucide-react';

interface IFields {
  password: string;
  confirm_password: string;
  accept_terms_and_conditions: boolean;
}

export default function ConfirmAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        toast.error('Invalid confirmation link');
        setLoading(false);
        return;
      }
      try {
        const res = await AuthService.getVerifyAdminToken(token);
        const { success } = res?.data as { success: boolean };
        if (success) {
          setTokenValid(true);
        } else {
          toast.error('Invalid or expired token');
          setTimeout(() => router.push('/sign_up'), 2000);
        }
      } catch {
        toast.error('Failed to verify token');
        setTimeout(() => router.push('/sign_up'), 2000);
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, [token, router]);

  const validationSchema = object({
    password: string()
      .min(8, 'Password must be at least 8 characters')
      .max(16, 'Password must not exceed 16 characters')
      .matches(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,16}$/,
        'Password must contain uppercase, lowercase, number and special character'
      )
      .required('Password is required'),
    confirm_password: string()
      .oneOf([string().nullable().required().valueOf()], 'Passwords must match')
      .required('Please confirm your password'),
    accept_terms_and_conditions: boolean()
      .oneOf([true], 'You must accept terms and conditions')
      .required('You must accept terms and conditions'),
  });

  const onSubmit = async (values: IFields, { setSubmitting }: any) => {
    try {
      const res = await AuthService.acceptAccountInvitation(token, '', {
        password: values.password,
        confirm_password: values.confirm_password,
        accept_terms_and_conditions: values.accept_terms_and_conditions,
      });

      const { success, error } = res?.data as {
        success: boolean;
        error?: string[];
      };

      if (success) {
        toast.success('Account confirmed successfully!');
        setTimeout(() => router.push('/sign_in'), 1500);
      } else {
        const errorMsg = Array.isArray(error) ? error[0] : 'Failed to confirm account';
        toast.error(errorMsg);
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error?.[0] || error?.message || 'Something went wrong';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex vh-100 justify-content-center align-items-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-primary mb-3" />
          <p className="text-muted">Verifying your account...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="d-flex vh-100 justify-content-center align-items-center">
        <div className="text-center">
          <div className="mb-4">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="mx-auto">
              <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/>
              <path d="M15 9l-6 6m0-6l6 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h3 className="fs-4 fw-bold text-danger mb-2">Invalid Link</h3>
          <p className="text-muted">This confirmation link is invalid or has expired.</p>
          <p className="text-muted small">Redirecting to sign up...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex vh-100 justify-content-center align-items-center">
      <div style={{ width: '500px', maxWidth: '95%' }}>
        <div className="text-center mb-4">
          <h5 className="page-title">Confirm Your Account</h5>
          <span className="page-subtitle">
            Set your password to complete registration
          </span>
        </div>

        <Formik
          initialValues={{
            password: '',
            confirm_password: '',
            accept_terms_and_conditions: false,
          }}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
          validateOnChange={false}
        >
          {({ handleSubmit, errors, isSubmitting }) => (
            <Form onSubmit={handleSubmit}>
              <div className="mb-3">
                <FormikField
                  name="password"
                  errors={errors}
                  validationSchema={validationSchema}
                  label="Password"
                  type={passwordVisible ? 'text' : 'password'}
                  isPassword
                  placeholder="Enter your password"
                  passwordIcon={passwordVisible}
                  setPasswordIcon={setPasswordVisible}
                />
              </div>

              <div className="mb-3">
                <FormikField
                  name="confirm_password"
                  errors={errors}
                  validationSchema={validationSchema}
                  label="Confirm Password"
                  type={confirmPasswordVisible ? 'text' : 'password'}
                  isPassword
                  placeholder="Confirm your password"
                  passwordIcon={confirmPasswordVisible}
                  setPasswordIcon={setConfirmPasswordVisible}
                />
              </div>

              <div className="mb-4">
                <CustomCheckbox
                  name="accept_terms_and_conditions"
                  label={
                    <span className="agree-terms">
                      I agree to the terms and conditions
                    </span>
                  }
                  type="checkbox"
                  errors={errors}
                  validationSchema={validationSchema}
                />
              </div>

              <div className="d-flex justify-content-center">
                <Button
                  text={isSubmitting ? 'Confirming...' : 'Confirm Account'}
                  isDisabled={isSubmitting}
                  isLoading={isSubmitting}
                  type="submit"
                  isSolid
                  className="w-100"
                  sufixIconChildren={
                    <MdArrowForward
                      size={20}
                      color="var(--icon-color)"
                      className="ms-3"
                    />
                  }
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
