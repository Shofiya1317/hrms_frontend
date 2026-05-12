import { AuthLayout } from '@/components/Layout/AuthLayout';
import { AuthService } from '@/lib/service';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
  useParams: jest.fn(() => ({ slug: 'test-subdomain' })),
}));

jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
  useSession: jest.fn(() => ({ data: null })),
}));

jest.mock('@/lib/service', () => ({
  AuthService: {
    logout: jest.fn(),
  },
}));

jest.mock('@/hooks/useDeviceDetection', () => ({
  useDeviceDetection: () => ({ isMobile: false, isMobileOnly: false }),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

jest.mock('@/components/MultiStepProgressBar/MultiStepProgressBar', () => ({
  __esModule: true,
  default: () => <div data-testid="multi-step-progress-bar" />,
}));

jest.mock('@/components/Layout/LandingLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="landing-layout">{children}</div>
  ),
}));

// ─── Setup ────────────────────────────────────────────────────────────────────

const mockPush = jest.fn();
const mockRefresh = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
    refresh: mockRefresh,
  });
  (AuthService.logout as jest.Mock).mockResolvedValue({});
  (signOut as jest.Mock).mockResolvedValue({});
});

// ─── Sign In / Sign Up Layout ─────────────────────────────────────────────────

test('renders children on /sign_in path', () => {
  (usePathname as jest.Mock).mockReturnValue('/sign_in');

  render(
    <AuthLayout slug="test-slug">
      <div>Sign In Page</div>
    </AuthLayout>,
  );

  expect(screen.getByText('Sign In Page')).toBeInTheDocument();
});

test('renders children on /sign_up path', () => {
  (usePathname as jest.Mock).mockReturnValue('/sign_up');

  render(
    <AuthLayout slug="test-slug">
      <div>Sign Up Page</div>
    </AuthLayout>,
  );

  expect(screen.getByText('Sign Up Page')).toBeInTheDocument();
});

test('renders children on /accept_invitation path', () => {
  (usePathname as jest.Mock).mockReturnValue('/accept_invitation');

  render(
    <AuthLayout slug="test-slug">
      <div>Accept Invitation Page</div>
    </AuthLayout>,
  );

  expect(screen.getByText('Accept Invitation Page')).toBeInTheDocument();
});

// ─── renderAuthButton ─────────────────────────────────────────────────────────
// NOTE: renderAuthButton is only rendered inside the isAuthorized block.
// On /sign_in, /sign_up, /forgot_password, /reset_password paths the layout
// renders only the two-column image+form panel — NO navigation button is shown.
// These tests verify the correct layout section renders for each auth path.

test('renders two-column layout on /sign_in path — no nav button', () => {
  (usePathname as jest.Mock).mockReturnValue('/sign_in');

  render(
    <AuthLayout slug="test-slug">
      <div>Sign In Page</div>
    </AuthLayout>,
  );

  // Children are rendered in the right panel
  expect(screen.getByText('Sign In Page')).toBeInTheDocument();
  // No nav button exists in this layout branch
  expect(screen.queryByText('Sign up')).not.toBeInTheDocument();
  expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
});

test('renders two-column layout on /sign_up path — no nav button', () => {
  (usePathname as jest.Mock).mockReturnValue('/sign_up');

  render(
    <AuthLayout slug="test-slug">
      <div>Sign Up Page</div>
    </AuthLayout>,
  );

  expect(screen.getByText('Sign Up Page')).toBeInTheDocument();
  // No nav button exists in this layout branch
  expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
  expect(screen.queryByText('Sign up')).not.toBeInTheDocument();
});

test('renders two-column layout on /forgot_password path — no nav button', () => {
  (usePathname as jest.Mock).mockReturnValue('/forgot_password');

  render(
    <AuthLayout slug="test-slug">
      <div>Forgot Password Page</div>
    </AuthLayout>,
  );

  expect(screen.getByText('Forgot Password Page')).toBeInTheDocument();
  expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
});

test('renders two-column layout on /reset_password path — no nav button', () => {
  // The component uses pathname.includes('reset_password') so any subpath works
  (usePathname as jest.Mock).mockReturnValue('/reset_password/token123');

  render(
    <AuthLayout slug="test-slug">
      <div>Reset Password Page</div>
    </AuthLayout>,
  );

  expect(screen.getByText('Reset Password Page')).toBeInTheDocument();
  expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
});

// ─── Authorized Layout (/company_profile) ────────────────────────────────────

test('renders authorized layout with Logout! button on /company_profile path', () => {
  (usePathname as jest.Mock).mockReturnValue('/company_profile');

  render(
    <AuthLayout slug="test-slug">
      <div>Authorized Page</div>
    </AuthLayout>,
  );

  expect(screen.getByText('Authorized Page')).toBeInTheDocument();
  expect(screen.getByText('Logout!')).toBeInTheDocument();
  expect(screen.getByTestId('multi-step-progress-bar')).toBeInTheDocument();
});

test('calls AuthService.logout, signOut, refresh, and push on Logout click', async () => {
  (usePathname as jest.Mock).mockReturnValue('/company_profile');

  render(
    <AuthLayout slug="test-slug">
      <div>Authorized Page</div>
    </AuthLayout>,
  );

  fireEvent.click(screen.getByText('Logout!'));

  await waitFor(() => {
    expect(AuthService.logout).toHaveBeenCalledWith({ slug: 'test-slug' });
    expect(signOut).toHaveBeenCalledWith({ redirect: false });
    expect(mockRefresh).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/sign_in');
  });
});

test('renders app logo image on /company_profile path', () => {
  (usePathname as jest.Mock).mockReturnValue('/company_profile');

  render(
    <AuthLayout slug="test-slug">
      <div>Authorized Page</div>
    </AuthLayout>,
  );

  expect(screen.getByAltText('App Logo')).toBeInTheDocument();
});

// ─── Landing Layout ───────────────────────────────────────────────────────────

test('renders LandingLayout for /home path', () => {
  (usePathname as jest.Mock).mockReturnValue('/home');

  render(
    <AuthLayout slug="test-slug">
      <div>Home Page</div>
    </AuthLayout>,
  );

  expect(screen.getByTestId('landing-layout')).toBeInTheDocument();
  expect(screen.getByText('Home Page')).toBeInTheDocument();
});

test('renders LandingLayout for /settings path', () => {
  (usePathname as jest.Mock).mockReturnValue('/settings');

  render(
    <AuthLayout slug="test-slug">
      <div>Settings Page</div>
    </AuthLayout>,
  );

  expect(screen.getByTestId('landing-layout')).toBeInTheDocument();
  expect(screen.getByText('Settings Page')).toBeInTheDocument();
});

test('renders LandingLayout for /users path', () => {
  (usePathname as jest.Mock).mockReturnValue('/users');

  render(
    <AuthLayout slug="test-slug">
      <div>Users Page</div>
    </AuthLayout>,
  );

  expect(screen.getByTestId('landing-layout')).toBeInTheDocument();
});

// ─── Unknown / Unmatched Path ─────────────────────────────────────────────────

test('renders nothing visible for an unrecognized path', () => {
  (usePathname as jest.Mock).mockReturnValue('/unknown-path');

  const { container } = render(
    <AuthLayout slug="test-slug">
      <div>Unknown Page</div>
    </AuthLayout>,
  );

  expect(screen.queryByText('Unknown Page')).not.toBeInTheDocument();
  expect(container.querySelector('main')).toBeInTheDocument();
});