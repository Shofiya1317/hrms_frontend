import AcceptInvitationForm, {
  handleSubmitAcceptInvitation,
} from '@/components/AcceptInvitation/AcceptInvitationForm';
import { IUser } from '@/lib/interface/IUser.interface';
import { AuthService } from '@/lib/service';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('@/lib/service', () => ({
  AuthService: {
    acceptInvitation: jest.fn(),
    acceptInvitationByAdmin: jest.fn(),
  },
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

jest.mock('@/hooks/useDeviceDetection', () => ({
  useDeviceDetection: () => ({ isMobileOnly: false }),
}));

jest.mock('react-phone-number-input', () => ({
  isValidPhoneNumber: jest.fn((phone: string) => phone === '+12345678901'),
}));

jest.mock('react-phone-number-input', () => ({
  isValidPhoneNumber: jest.fn((phone: string) => phone === '+12345678901'),
  default: ({ onChange, value, placeholder }: any) => (
    <input
      placeholder={placeholder}
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}));

jest.mock('@/components/FormikPhoneNumber/FormikPhoneNumber', () => ({
  FormikPhoneNumber: ({ label }: { label: string }) => (
    <div>
      <label htmlFor="phone_number">{label}</label>
      <input id="phone_number" name="phone_number" />
    </div>
  ),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockPush = jest.fn();

const mockRouter: Partial<AppRouterInstance> = { push: mockPush };

const mockValidateForm = jest.fn();
const mockSetFieldError = jest.fn();

const slug = 'test-slug';
const token = 'test-token';

const user: IUser = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar_url: '',
  id: '1',
  createdAt: '',
  updatedAt: '',
  created_by_type: null,
  created_by: null,
  phone_number: null,
  status: '',
  confirmed_at: '',
  password_reset_on: null,
  accept_terms_of_service: false,
  last_login_at: '',
  block_reason: null,
  blocked_on: null,
  role: 'ADMIN',
  departments: null,
  account: null,
  is_guest: false,
  company_name: '',
};

// Valid values (phone passes isValidPhoneNumber mock)
const validValues = {
  email: 'john@example.com',
  name: 'John Doe',
  company_name: 'Test Co',
  phone_number: '+12345678901',
  password: 'Password1!',
  confirm_password: 'Password1!',
  accept_terms_and_conditions: true,
  isAccount: false,
};

// Invalid phone values
const invalidPhoneValues = {
  ...validValues,
  phone_number: '1234567890', // fails isValidPhoneNumber
};

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
});

afterEach(() => {
  jest.clearAllMocks();
});

// ─── Render Tests ─────────────────────────────────────────────────────────────

test('renders all fields when isAccount is false', () => {
  render(
    <AcceptInvitationForm isAccount={false} slug={slug} token={token} user={user} />,
  );

  expect(screen.getByLabelText(/Enter Your Name/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
  expect(screen.getByText(/I agree to/i)).toBeInTheDocument();
  expect(screen.getByText(/Let me in/i)).toBeInTheDocument();
});

test('hides name, email, and phone fields when isAccount is true', () => {
  render(
    <AcceptInvitationForm isAccount slug={slug} token={token} user={user} />,
  );

  expect(screen.queryByLabelText(/Enter Your Name/i)).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/Phone Number/i)).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/Email Address/i)).not.toBeInTheDocument();
  expect(screen.getByLabelText(/Enter Password/i)).toBeInTheDocument();
});

test('renders submit button with correct text', () => {
  render(
    <AcceptInvitationForm isAccount={false} slug={slug} token={token} user={user} />,
  );
  expect(screen.getByText(/Let me in/i)).toBeInTheDocument();
});

test('pre-fills email and name from user prop', () => {
  render(
    <AcceptInvitationForm isAccount={false} slug={slug} token={token} user={user} />,
  );

  expect(screen.getByLabelText(/Enter Your Name/i)).toHaveValue('John Doe');
  expect(screen.getByLabelText(/Email Address/i)).toHaveValue('john@example.com');
});

test('clicking submit triggers form submission', () => {
  render(
    <AcceptInvitationForm isAccount={false} slug={slug} token={token} user={user} />,
  );

  fireEvent.change(screen.getByLabelText(/Enter Your Name/i), {
    target: { value: 'Jane Doe' },
  });
  fireEvent.click(screen.getByText(/I agree/i));
  fireEvent.click(screen.getByText(/Let me in/i));
});

// ─── handleSubmitAcceptInvitation ─────────────────────────────────────────────

test('sets phone_number field error for invalid phone number', async () => {
  await handleSubmitAcceptInvitation(
    invalidPhoneValues as any,
    slug,
    token,
    { validateForm: mockValidateForm, setFieldError: mockSetFieldError } as any,
    mockRouter as any,
    false,
  );

  expect(mockSetFieldError).toHaveBeenCalledWith(
    'phone_number',
    'Must be valid Phone Number',
  );
  expect(mockPush).not.toHaveBeenCalled();
  expect(AuthService.acceptInvitation).not.toHaveBeenCalled();
});

test('calls acceptInvitation and redirects to /sign_in on success (isAccount: false)', async () => {
  (AuthService.acceptInvitation as jest.Mock).mockResolvedValue({
    data: { success: true, error: [] },
  });

  await handleSubmitAcceptInvitation(
    validValues as any,
    slug,
    token,
    { validateForm: mockValidateForm, setFieldError: mockSetFieldError } as any,
    mockRouter as any,
    false,
  );

  expect(AuthService.acceptInvitation).toHaveBeenCalledWith(
    token,
    slug,
    expect.objectContaining({ confirm_password: validValues.password }),
  );
  expect(toast.success).toHaveBeenCalledWith('Invitation Accepted!');
  expect(mockPush).toHaveBeenCalledWith('/sign_in');
});

test('calls acceptInvitationByAdmin and redirects to /sign_in on success (isAccount: true)', async () => {
  (AuthService.acceptInvitationByAdmin as jest.Mock).mockResolvedValue({
    data: { success: true, error: [] },
  });

  await handleSubmitAcceptInvitation(
    validValues as any,
    slug,
    token,
    { validateForm: mockValidateForm, setFieldError: mockSetFieldError } as any,
    mockRouter as any,
    true,
  );

  expect(AuthService.acceptInvitationByAdmin).toHaveBeenCalledWith(
    token,
    slug,
    expect.objectContaining({
      password: validValues.password,
      confirm_password: validValues.password,
      accept_terms_and_conditions: true,
    }),
  );
  expect(toast.success).toHaveBeenCalledWith('Invitation Accepted!');
  expect(mockPush).toHaveBeenCalledWith('/sign_in');
});

test('shows error toast and does not redirect when acceptInvitation fails (isAccount: false)', async () => {
  (AuthService.acceptInvitation as jest.Mock).mockResolvedValue({
    data: { success: false, error: ['Failed to accept invitation'] },
  });

  await handleSubmitAcceptInvitation(
    validValues as any,
    slug,
    token,
    { validateForm: mockValidateForm, setFieldError: mockSetFieldError } as any,
    mockRouter as any,
    false,
  );

  expect(toast.error).toHaveBeenCalledWith('Failed to accept invitation');
  expect(mockPush).not.toHaveBeenCalled();
});

test('shows error toast and does not redirect when acceptInvitationByAdmin fails (isAccount: true)', async () => {
  (AuthService.acceptInvitationByAdmin as jest.Mock).mockResolvedValue({
    data: { success: false, error: ['Admin invite failed'] },
  });

  await handleSubmitAcceptInvitation(
    validValues as any,
    slug,
    token,
    { validateForm: mockValidateForm, setFieldError: mockSetFieldError } as any,
    mockRouter as any,
    true,
  );

  expect(toast.error).toHaveBeenCalledWith('Admin invite failed');
  expect(mockPush).not.toHaveBeenCalled();
});

test('calls validateForm when phone number is valid', async () => {
  (AuthService.acceptInvitation as jest.Mock).mockResolvedValue({
    data: { success: true, error: [] },
  });

  await handleSubmitAcceptInvitation(
    validValues as any,
    slug,
    token,
    { validateForm: mockValidateForm, setFieldError: mockSetFieldError } as any,
    mockRouter as any,
    false,
  );

  expect(mockValidateForm).toHaveBeenCalledWith(validValues);
});