import Header from '@/components/Header/Header';
import { IUser } from '@/lib/interface/IUser.interface';
import { fireEvent, render, screen, act } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { ModalProvider } from '@/components/Modal/Context';

// ─── Mocks ────────────────────────────────────────────────────────────────────

// FIX: Mock the full axios instance to break the import chain that leads to
// next-auth/jwt (axiosInstance → service/auth → service/index → userProvider → Header)
jest.mock('@/lib/axiosInstance', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

// FIX: Mock the entire service layer to prevent next-auth/jwt from being imported
jest.mock('@/lib/service', () => ({
  AuthService: {
    logout: jest.fn(),
    forgotPassword: jest.fn(),
  },
  UserService: {
    getCurrentUser: jest.fn(),
    updateCurrentUser: jest.fn(),
  },
}));

// FIX: Mock userProvider to prevent the Context import chain
jest.mock('@/components/Context/userProvider', () => ({
  useUser: jest.fn(() => ({
    user: null,
    getCurrentUser: jest.fn(),
  })),
}));

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ data: { user: { name: 'John Doe' } } })),
  signOut: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

// Mock react-avatar to prevent the act() warning
jest.mock('react-avatar', () => ({
  __esModule: true,
  default: ({ name, size, round }: any) => (
    <div 
      className="rounded-circle sb-avatar" 
      style={{ width: size, height: size, borderRadius: '100%' }}
    >
      {name || 'A'}
    </div>
  ),
}));

// Mock Modal Context to prevent errors
jest.mock('@/components/Modal/Context', () => {
  const actual = jest.requireActual('@/components/Modal/Context');
  return {
    ...actual,
    useModal: jest.fn(() => jest.fn()),
    ModalProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockUser: IUser = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar_url: '',
  id: '123',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  created_by_type: 'user',
  created_by: 'admin',
  phone_number: '1234567890',
  status: 'active',
  confirmed_at: '2024-01-01',
  password_reset_on: '2024-01-01',
  accept_terms_of_service: true,
  last_login_at: '2024-01-01',
  block_reason: '',
  blocked_on: '',
  role: 'ADMIN',
  departments: null,
  account: null,
  is_guest: false,
  company_name: 'Test Company',
};

const mockProps: any = {
  user: mockUser,
  menuItems: [
    { label: 'Dashboard', path: '/dashboard', isActive: false },
    { label: 'Users', path: '/users', isActive: false },
    { label: 'Accounts', path: '/accounts', isActive: false },
    { label: 'Masters', path: '/masters', isActive: false },
  ],
  profileMenu: [
    { label: 'Profile', path: '/profile', icon: <span>P</span> },
    { label: 'Logout', path: '/sign_in', icon: <span>L</span> },
  ],
  pathname: '/dashboard',
};

// Helper function to render Header with ModalProvider
const renderWithModalProvider = (ui: React.ReactElement) => {
  return render(
    <ModalProvider>
      {ui}
    </ModalProvider>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue('/dashboard');
  });

  test('renders the header with logo and menu items', () => {
    renderWithModalProvider(<Header {...mockProps} />);

    expect(screen.getByAltText('logo')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Accounts')).toBeInTheDocument();
    expect(screen.getByText('Masters')).toBeInTheDocument();
  });

  test('triggers logout on clicking logout button', async () => {
    const { signOut } = require('next-auth/react');
    const { useRouter } = require('next/navigation');
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    
    // Mock the useModal to return a function that shows the modal
    const { useModal } = require('@/components/Modal/Context');
    const mockLogoutModal = jest.fn();
    (useModal as jest.Mock).mockReturnValue(mockLogoutModal);

    renderWithModalProvider(<Header {...mockProps} />);

    // First, click on the profile area to open the dropdown menu
    const profileArea = screen.getByTitle(mockUser.name);
    fireEvent.click(profileArea);

    // Now the Logout option should be visible
    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeInTheDocument();
    
    // Click logout - this should call the modal function
    fireEvent.click(logoutButton);
    
    // Verify that the logout modal function was called
    expect(mockLogoutModal).toHaveBeenCalled();
  });

  test('triggers logout after session timeout', async () => {
    const { signOut } = require('next-auth/react');
    const { useRouter } = require('next/navigation');
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    const { useSession } = require('next-auth/react');
    (useSession as jest.Mock).mockReturnValue({ data: { user: { name: 'John Doe' } } });

    jest.useFakeTimers();
    
    renderWithModalProvider(<Header {...mockProps} />);

    // Advance timers to trigger logout
    await act(async () => {
      jest.advanceTimersByTime(30 * 60 * 1000);
    });

    // Allow promises to resolve
    await act(async () => {
      await Promise.resolve();
    });

    // Verify logout was called
    expect(signOut).toHaveBeenCalledWith({ redirect: false });
    expect(mockPush).toHaveBeenCalledWith('/sign_in');
    
    jest.useRealTimers();
  });

  test('does not logout before timeout', () => {
    const { signOut } = require('next-auth/react');
    const { useRouter } = require('next/navigation');
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    const { useSession } = require('next-auth/react');
    (useSession as jest.Mock).mockReturnValue({ data: { user: { name: 'John Doe' } } });

    jest.useFakeTimers();
    
    renderWithModalProvider(<Header {...mockProps} />);

    // Advance timers partially (not enough to trigger logout)
    act(() => {
      jest.advanceTimersByTime(29 * 60 * 1000);
    });

    // Logout should not have been called yet
    expect(signOut).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
    
    jest.useRealTimers();
  });

  test('resets timer on user activity', () => {
    const { signOut } = require('next-auth/react');
    const { useRouter } = require('next/navigation');
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    const { useSession } = require('next-auth/react');
    (useSession as jest.Mock).mockReturnValue({ data: { user: { name: 'John Doe' } } });

    jest.useFakeTimers();
    
    renderWithModalProvider(<Header {...mockProps} />);

    // Advance timers partially
    act(() => {
      jest.advanceTimersByTime(20 * 60 * 1000);
    });

    // Simulate user activity
    act(() => {
      fireEvent.click(document.body);
    });

    // Advance timers again
    act(() => {
      jest.advanceTimersByTime(20 * 60 * 1000);
    });

    // Logout should not have been called because timer was reset
    expect(signOut).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
    
    // Advance full timeout from last activity
    act(() => {
      jest.advanceTimersByTime(30 * 60 * 1000);
    });

    // Now logout should be called
    expect(signOut).toHaveBeenCalledWith({ redirect: false });
    expect(mockPush).toHaveBeenCalledWith('/sign_in');
    
    jest.useRealTimers();
  });
});