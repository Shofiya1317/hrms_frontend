import ChangeAvatar from '@/components/ChangeAvatar/ChangeAvatar';
import { useUser } from '@/components/Context/userProvider';
import { IUser } from '@/lib/interface/IUser.interface';
import { UserService } from '@/lib/service';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@/components/Context/userProvider', () => ({
  useUser: jest.fn(),
}));

jest.mock('@/lib/service', () => ({
  UserService: {
    updateAvatar: jest.fn(),
    updateAccountAvatar: jest.fn(),
    deleteAvatar: jest.fn(),
    deleteAccountAvatar: jest.fn(),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

jest.mock('react-avatar', () => ({
  __esModule: true,
  default: ({ name }: { name: string }) => <div data-testid="avatar">{name}</div>,
}));

jest.mock('@/lib/utils', () => ({
  convertToPascalCase: jest.fn((str: string) => str),
  userRole: jest.fn((role: string) => role),
  getDomainFromSubdomain: jest.fn(() => 'example.com'),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockUser: IUser = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar_url: 'https://example.com/avatar.png',
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
  account: {
    account_name: 'Test Company',
    logo_path: 'https://example.com/logo.png',
    official_email_id: 'company@example.com',
    slug: 'test-company',
  } as any,
  is_guest: false,
  company_name: '',
};

const mockUserNoAvatar: IUser = {
  ...mockUser,
  avatar_url: '',
  account: {
    ...mockUser.account,
    logo_path: '',
  } as any,
};

const mockContext = {
  getCurrentUser: jest.fn(),
};

const mockRouter = {
  refresh: jest.fn(),
};

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  (useUser as jest.Mock).mockReturnValue(mockContext);
  (useRouter as jest.Mock).mockReturnValue(mockRouter);

  // Mock window.location.hostname for workspace URL rendering
  Object.defineProperty(window, 'location', {
    value: { hostname: 'test.example.com' },
    writable: true,
  });
});

// ─── Render Tests ─────────────────────────────────────────────────────────────

test('renders user name, email, and role when isUser=true', () => {
  render(<ChangeAvatar user={mockUser} apiKey="test-api-key" isUser />);

  expect(screen.getByRole('heading', { name: 'John Doe' })).toBeInTheDocument();
  expect(screen.getByText('john@example.com')).toBeInTheDocument();
  expect(screen.getByText(/Role -/i)).toBeInTheDocument();
});

test('renders account name and email when isUser=false', () => {
  render(<ChangeAvatar user={mockUser} apiKey="test-api-key" isUser={false} />);

  expect(screen.getByRole('heading', { name: 'Test Company' })).toBeInTheDocument();
  expect(screen.getByText('company@example.com')).toBeInTheDocument();
  expect(screen.getByText(/Workspace URL -/i)).toBeInTheDocument();
});

test('truncates display name longer than 15 characters', () => {
  const longNameUser = { ...mockUser, name: 'A Very Long Name Indeed' };
  render(<ChangeAvatar user={longNameUser} apiKey="test-api-key" isUser />);

  expect(screen.getByTitle('A Very Long Name Indeed')).toBeInTheDocument();
  expect(screen.getByText('A Very Long Nam...')).toBeInTheDocument();
});

test('renders delete button when avatar_url exists (isUser=true)', () => {
  render(<ChangeAvatar user={mockUser} apiKey="test-api-key" isUser />);
  expect(screen.getByTestId('avatar-delete')).toBeInTheDocument();
});

test('does not render delete button when avatar_url is empty (isUser=true)', () => {
  render(<ChangeAvatar user={mockUserNoAvatar} apiKey="test-api-key" isUser />);
  expect(screen.queryByTestId('avatar-delete')).not.toBeInTheDocument();
});

test('does not render delete button when logo_path is empty (isUser=false)', () => {
  render(<ChangeAvatar user={mockUserNoAvatar} apiKey="test-api-key" isUser={false} />);
  expect(screen.queryByTestId('avatar-delete')).not.toBeInTheDocument();
});

// ─── uploadProfilePicture (isUser=true) ───────────────────────────────────────

test('calls updateAvatar and shows success toast on upload (isUser=true)', async () => {
  (UserService.updateAvatar as jest.Mock).mockResolvedValue({
    data: { success: true, error: [] },
  });

  render(<ChangeAvatar user={mockUser} apiKey="test-api-key" isUser />);

  const file = new File(['content'], 'avatar.png', { type: 'image/png' });
  fireEvent.change(screen.getByTestId('avatar-input'), {
    target: { files: [file] },
  });

  await waitFor(() => {
    expect(UserService.updateAvatar).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Avatar updated successfully');
    expect(mockRouter.refresh).toHaveBeenCalled();
    expect(mockContext.getCurrentUser).toHaveBeenCalledWith();
  });
});

test('calls updateAvatar and shows error toast on upload failure (isUser=true)', async () => {
  (UserService.updateAvatar as jest.Mock).mockResolvedValue({
    data: { success: false, error: ['Upload failed'] },
  });

  render(<ChangeAvatar user={mockUser} apiKey="test-api-key" isUser />);

  const file = new File(['content'], 'avatar.png', { type: 'image/png' });
  fireEvent.change(screen.getByTestId('avatar-input'), {
    target: { files: [file] },
  });

  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith('Upload failed');
    expect(mockContext.getCurrentUser).not.toHaveBeenCalled();
  });
});

// ─── uploadProfilePicture (isUser=false) ──────────────────────────────────────

test('calls updateAccountAvatar on upload when isUser=false', async () => {
  (UserService.updateAccountAvatar as jest.Mock).mockResolvedValue({
    data: { success: true, error: [] },
  });

  render(<ChangeAvatar user={mockUser} apiKey="test-api-key" isUser={false} />);

  const file = new File(['content'], 'logo.png', { type: 'image/png' });
  fireEvent.change(screen.getByTestId('avatar-input'), {
    target: { files: [file] },
  });

  await waitFor(() => {
    expect(UserService.updateAccountAvatar).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Avatar updated successfully');
  });
});

// ─── deleteProfileAttachment (isUser=true) ────────────────────────────────────

test('calls deleteAvatar and shows success toast on delete (isUser=true)', async () => {
  (UserService.deleteAvatar as jest.Mock).mockResolvedValue({
    data: { success: true, error: [] },
  });

  render(<ChangeAvatar user={mockUser} apiKey="test-api-key" isUser />);

  fireEvent.click(screen.getByTestId('avatar-delete'));

  await waitFor(() => {
    expect(UserService.deleteAvatar).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Avatar deleted successfully');
    expect(mockRouter.refresh).toHaveBeenCalled();
    expect(mockContext.getCurrentUser).toHaveBeenCalledWith();
  });
});

test('calls deleteAvatar and shows error toast on delete failure (isUser=true)', async () => {
  (UserService.deleteAvatar as jest.Mock).mockResolvedValue({
    data: { success: false, error: ['Delete failed'] },
  });

  render(<ChangeAvatar user={mockUser} apiKey="test-api-key" isUser />);

  fireEvent.click(screen.getByTestId('avatar-delete'));

  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith('Delete failed');
    expect(mockContext.getCurrentUser).not.toHaveBeenCalled();
  });
});

// ─── deleteProfileAttachment (isUser=false) ───────────────────────────────────

test('calls deleteAccountAvatar on delete when isUser=false', async () => {
  (UserService.deleteAccountAvatar as jest.Mock).mockResolvedValue({
    data: { success: true, error: [] },
  });

  render(<ChangeAvatar user={mockUser} apiKey="test-api-key" isUser={false} />);

  fireEvent.click(screen.getByTestId('avatar-delete'));

  await waitFor(() => {
    expect(UserService.deleteAccountAvatar).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Avatar deleted successfully');
  });
});