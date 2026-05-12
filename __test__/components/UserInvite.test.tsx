import UserInviteForm, {
  getIcon,
  handleDelete,
  handleUserInviteSubmit,
  isButtonDisabled,
  pushNewUser,
} from '@/components/UserInviteForm/UserInviteForm';
import { AuthService } from '@/lib/service';
import { fireEvent, render, screen } from '@testing-library/react';
import { FieldArray, Formik, FormikHelpers } from 'formik';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

jest.mock('@/lib/service', () => ({
  AuthService: {
    invitePeople: jest.fn(),
    inviteUsers: jest.fn(),
  },
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('@/hooks/useDeviceDetection', () => ({
  useDeviceDetection: () => ({ isMobileOnly: false }),
}));

const mockPush = jest.fn();
const mockRefresh = jest.fn();

const defaultProps = {
  slug: 'test-slug',
};

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
    refresh: mockRefresh,
  });
  (usePathname as jest.Mock).mockReturnValue('/company_profile/invite_user');
});

const renderComponent = (props = {}) => {
  return render(<UserInviteForm {...defaultProps} {...props} />);
};

// ─── Render Tests ────────────────────────────────────────────────────────────

test('renders the form with Submit & Proceed button on non-dashboard path', () => {
  renderComponent();
  expect(screen.getByText('Submit & Proceed')).toBeInTheDocument();
});

test('renders the form with Invite button on dashboard path', () => {
  (usePathname as jest.Mock).mockReturnValue('/home/dashboard');
  renderComponent();
  expect(screen.getByText('Invite')).toBeInTheDocument();
});

test('renders page title and subtitle', () => {
  renderComponent();
  expect(screen.getByText('Invite users')).toBeInTheDocument();
  expect(screen.getByText('Please invite people and assign tasks')).toBeInTheDocument();
});

// ─── handleUserInviteSubmit ───────────────────────────────────────────────────

test('handles successful invite submission on non-dashboard (invitePeople)', async () => {
  const values = {
    invitation: [
      { email: 'test@example.com', name: '', role: 'MANAGER' },
    ],
  };
  const slug = 'test-slug';
  const setSubmitting = jest.fn();
  const validateForm = jest.fn();

  (AuthService.invitePeople as jest.Mock).mockResolvedValue({
    data: { success: true, error: [] },
  });

  await handleUserInviteSubmit(
    values as any,
    slug,
    { setSubmitting, validateForm } as unknown as FormikHelpers<{ invitation: any[] }>,
    { push: mockPush, refresh: mockRefresh } as any,
    false, // isDashboard
  );

  expect(AuthService.invitePeople).toHaveBeenCalledWith({
    invitation: [{ email: 'test@example.com', name: '', role: 'MANAGER' }],
    slug,
  });
  expect(toast.success).toHaveBeenCalledWith('User Invited Successfully');
  expect(mockPush).toHaveBeenCalledWith('/home');
  expect(mockRefresh).toHaveBeenCalled();
  expect(setSubmitting).toHaveBeenCalledWith(false);
});

test('handles successful invite submission on dashboard (inviteUsers)', async () => {
  const values = {
    invitation: [
      { email: 'test@example.com', name: '', role: 'GUEST' },
    ],
  };
  const slug = 'test-slug';
  const setSubmitting = jest.fn();
  const validateForm = jest.fn();

  (AuthService.inviteUsers as jest.Mock).mockResolvedValue({
    data: { success: true, error: [] },
  });

  await handleUserInviteSubmit(
    values as any,
    slug,
    { setSubmitting, validateForm } as unknown as FormikHelpers<{ invitation: any[] }>,
    { push: mockPush, refresh: mockRefresh } as any,
    true, // isDashboard
  );

  expect(AuthService.inviteUsers).toHaveBeenCalled();
  expect(toast.success).toHaveBeenCalledWith('User Invited Successfully');
  // router.push should NOT be called on dashboard
  expect(mockPush).not.toHaveBeenCalled();
  expect(mockRefresh).toHaveBeenCalled();
  expect(setSubmitting).toHaveBeenCalledWith(false);
});

test('handles failed user invite submission', async () => {
  const values = {
    invitation: [
      { email: 'test@example.com', name: '', role: 'MANAGER' },
    ],
  };
  const slug = 'test-slug';
  const setSubmitting = jest.fn();
  const validateForm = jest.fn();

  (AuthService.invitePeople as jest.Mock).mockResolvedValue({
    data: { success: false, error: ['Failed to invite'] },
  });

  await handleUserInviteSubmit(
    values as any,
    slug,
    { setSubmitting, validateForm } as unknown as FormikHelpers<{ invitation: any[] }>,
    { push: mockPush, refresh: mockRefresh } as any,
    false,
  );

  expect(toast.error).toHaveBeenCalledWith('Failed to invite');
  expect(mockPush).not.toHaveBeenCalled();
  expect(setSubmitting).toHaveBeenCalledWith(false);
});

// ─── isButtonDisabled ────────────────────────────────────────────────────────

test('returns true if any email is empty', () => {
  const invitations = [{ email: '' }];
  expect(isButtonDisabled(invitations as any)).toBe(true);
});

test('returns false if all emails are filled', () => {
  const invitations = [{ email: 'test@example.com' }];
  expect(isButtonDisabled(invitations as any)).toBe(false);
});

// ─── handleDelete ────────────────────────────────────────────────────────────

test('calls arrayHelpers.remove with the correct index', () => {
  const mockRemove = jest.fn();
  const arrayHelpers = { remove: mockRemove };
  handleDelete(2, arrayHelpers);
  expect(mockRemove).toHaveBeenCalledTimes(1);
  expect(mockRemove).toHaveBeenCalledWith(2);
});

// ─── pushNewUser ─────────────────────────────────────────────────────────────

test('calls arrayHelpers.push with a new user object with role GUEST', () => {
  const mockArrayPush = jest.fn();
  const arrayHelpers = { push: mockArrayPush };

  pushNewUser(arrayHelpers);

  expect(mockArrayPush).toHaveBeenCalledTimes(1);
  expect(mockArrayPush).toHaveBeenCalledWith({
    email: '',
    name: '',
    role: 'GUEST',
  });
});

// ─── getIcon ─────────────────────────────────────────────────────────────────

test('renders delete icon for index > 0', () => {
  const mockInitialValues = {
    invitation: [
      { email: 'test1@example.com' },
      { email: 'test2@example.com' },
    ],
  };

  render(
    <Formik initialValues={mockInitialValues} onSubmit={() => {}}>
      <FieldArray
        name="invitation"
        render={(arrayHelpers) => (
          <div>
            {mockInitialValues.invitation.map((_, index) => (
              <div key={index}>
                <input
                  type="text"
                  placeholder={`Email ${index + 1}`}
                  data-testid={`email-input-${index}`}
                />
                {getIcon(index, arrayHelpers as any)}
              </div>
            ))}
          </div>
        )}
      />
    </Formik>,
  );

  const deleteIcon = screen.getByTestId('delete-icon-1');
  expect(deleteIcon).toBeInTheDocument();
  fireEvent.click(deleteIcon);
});

test('does not render delete icon for index 0', () => {
  const mockInitialValues = {
    invitation: [{ email: 'test1@example.com' }],
  };

  render(
    <Formik initialValues={mockInitialValues} onSubmit={() => {}}>
      <FieldArray
        name="invitation"
        render={(arrayHelpers) => (
          <div>{getIcon(0, arrayHelpers as any)}</div>
        )}
      />
    </Formik>,
  );

  expect(screen.queryByTestId('delete-icon-0')).not.toBeInTheDocument();
});