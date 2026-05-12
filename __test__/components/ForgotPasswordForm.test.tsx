import ForgotPasswordForm, { handleForgotPasswordSubmit } from '@/components/ForgotPasswordForm/ForgotPasswordForm';
import { AuthService } from '@/lib/service';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FormikHelpers } from 'formik';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('@/lib/service', () => ({
  AuthService: {
    forgotPassword: jest.fn(),
  },
}));

jest.mock('@/components/Notify/Notify', () => ({
  Notify: jest.fn(),
}));

jest.mock('@/hooks/useDeviceDetection', () => ({
  useDeviceDetection: () => ({ isMobile: false, isMobileOnly: false }),
}));

jest.mock('react-hot-toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockPush = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
});

const mockSetSubmitting = jest.fn();
const mockSetFieldError = jest.fn();
const mockValidateForm = jest.fn();

const formikHelpers: Partial<FormikHelpers<{ email: string }>> = {
  setSubmitting: mockSetSubmitting,
  validateForm: mockValidateForm,
  setFieldError: mockSetFieldError,
};

const mockRouter: Partial<AppRouterInstance> = {
  push: mockPush,
};

afterEach(() => {
  jest.clearAllMocks();
});

const values = { email: 'test@example.com' };
const slug = 'test-slug';

// FIX: The button text is 'Reset Link' not 'Send Password Reset Link'.
// Use data-testid="button-Reset Link" or getByRole with the correct name.

test('renders the form and validates input', async () => {
  render(<ForgotPasswordForm slug="test-slug" />);

  const emailInput = screen.getByPlaceholderText('Enter Email Address');
  // FIX: actual button name is 'Reset Link'
  const resetButton = screen.getByTestId('button-Reset Link');

  // Test empty submission
  fireEvent.click(resetButton);

  await waitFor(() => {
    expect(screen.getByText('Email address is required')).toBeInTheDocument();
  });

  fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
  fireEvent.click(resetButton);

  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  fireEvent.click(resetButton);

  await waitFor(() => {
    expect(screen.queryByText('Invalid email address')).not.toBeInTheDocument();
  });
});

test('handles successful form submission', async () => {
  (AuthService.forgotPassword as jest.Mock).mockResolvedValueOnce({
    data: { success: true },
  });

  render(<ForgotPasswordForm slug="test-slug" />);

  const emailInput = screen.getByPlaceholderText('Enter Email Address');
  // FIX: actual button name is 'Reset Link'
  const resetButton = screen.getByTestId('button-Reset Link');

  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  fireEvent.click(resetButton);

  await waitFor(() => {
    expect(AuthService.forgotPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      slug: 'test-slug',
    });
    expect(mockPush).toHaveBeenCalledWith('/sign_in');
  });
});

test('handles failure in form submission', async () => {
  (AuthService.forgotPassword as jest.Mock).mockResolvedValueOnce({
    data: { success: false },
  });

  render(<ForgotPasswordForm slug="test-slug" />);

  const emailInput = screen.getByPlaceholderText('Enter Email Address');
  // FIX: actual button name is 'Reset Link'
  const resetButton = screen.getByTestId('button-Reset Link');

  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  fireEvent.click(resetButton);

  await waitFor(() => {
    expect(AuthService.forgotPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      slug: 'test-slug',
    });
  });
});

test('handles unexpected errors during submission', async () => {
  (AuthService.forgotPassword as jest.Mock).mockRejectedValueOnce(new Error('Unexpected error'));

  render(<ForgotPasswordForm slug="test-slug" />);

  const emailInput = screen.getByPlaceholderText('Enter Email Address');
  // FIX: actual button name is 'Reset Link'
  const resetButton = screen.getByTestId('button-Reset Link');

  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  fireEvent.click(resetButton);

  await waitFor(() => {
    expect(AuthService.forgotPassword).toHaveBeenCalled();
  });
});

test('handles successful password reset link submission', async () => {
  (AuthService.forgotPassword as jest.Mock).mockResolvedValueOnce({
    data: { success: true },
  });

  await handleForgotPasswordSubmit(
    values,
    slug,
    formikHelpers as FormikHelpers<{ email: string }>,
    mockRouter as AppRouterInstance,
  );

  expect(mockValidateForm).toHaveBeenCalledWith(values);
  expect(mockSetSubmitting).toHaveBeenCalledWith(true);
  expect(AuthService.forgotPassword).toHaveBeenCalledWith({
    email: values.email,
    slug,
  });
  expect(mockPush).toHaveBeenCalledWith('/sign_in');
  expect(mockSetSubmitting).toHaveBeenCalledWith(false);
});

test('handles API failure with success: false', async () => {
  (AuthService.forgotPassword as jest.Mock).mockResolvedValueOnce({
    data: { success: false },
  });

  await handleForgotPasswordSubmit(
    values,
    slug,
    formikHelpers as FormikHelpers<{ email: string }>,
    mockRouter as AppRouterInstance,
  );

  expect(AuthService.forgotPassword).toHaveBeenCalledWith({
    email: values.email,
    slug,
  });
  expect(mockSetFieldError).toHaveBeenCalledWith(
    'email',
    'Account not found / Accept Invitation',
  );
  expect(mockPush).not.toHaveBeenCalled();
  expect(mockSetSubmitting).toHaveBeenCalledWith(false);
});

test('handles unexpected errors', async () => {
  (AuthService.forgotPassword as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

  await handleForgotPasswordSubmit(
    values,
    slug,
    formikHelpers as FormikHelpers<{ email: string }>,
    mockRouter as AppRouterInstance,
  );

  expect(mockSetFieldError).toHaveBeenCalledWith('email', 'Unexpected error occurred');
  expect(mockPush).not.toHaveBeenCalled();
  expect(mockSetSubmitting).toHaveBeenCalledWith(false);
});