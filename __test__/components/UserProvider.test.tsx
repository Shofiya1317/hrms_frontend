import {
  UserContextProp,
  UserProvider,
  useUser,
} from '@/components/Context/userProvider';
import { IRoleAccess } from '@/lib/interface/IRole.interface';
import { IUser } from '@/lib/interface/IUser.interface';
import { RoleService, UserService } from '@/lib/service';
import { act, render, screen, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock('@/lib/service', () => ({
  UserService: {
    getCurrentUser: jest.fn(),
  },
  RoleService: {
    getRoleDetails: jest.fn(),
    getCurrentAccess: jest.fn(),
  },
}));

jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ subdomain: 'test-subdomain' })),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockUser: IUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  avatar_url: '',
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

const mockRoleAccess = {
  admin: ['read', 'write'],
} as unknown as IRoleAccess;

const mockAccess: Record<string, string[]> = {
  dashboard: ['read'],
};

const MockComponent = () => {
  const context = useUser() as UserContextProp;
  const { currentUser, currentRole, roleAccessDetails, getCurrentUser, getCurrentRoleAccess, getRoleAccess } = context;

  return (
    <>
      <div>{currentUser ? `User: ${currentUser.name}` : 'No user'}</div>
      <div>{currentRole ? `Role: ${JSON.stringify(currentRole)}` : 'No role'}</div>
      <div>{roleAccessDetails ? 'Has role access' : 'No role access'}</div>
      <button onClick={() => getCurrentUser()}>Get User</button>
      <button onClick={() => getCurrentRoleAccess()}>Get Role Access</button>
      <button onClick={() => getRoleAccess()}>Get Role Details</button>
    </>
  );
};

const Wrapper = ({ children }: { children: ReactNode }) => (
  <UserProvider>{children}</UserProvider>
);

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();

  // Default mocks so tests don't fail on incidental calls
  (RoleService.getCurrentAccess as jest.Mock).mockResolvedValue({
    data: { access: mockAccess, success: true },
  });
  (RoleService.getRoleDetails as jest.Mock).mockResolvedValue({
    data: { role_access: mockRoleAccess, success: true },
  });
});

// ─── Render Tests ─────────────────────────────────────────────────────────────

test('renders the context provider with children after mount', async () => {
  await act(async () => {
    render(
      <Wrapper>
        <MockComponent />
      </Wrapper>,
    );
  });

  expect(screen.getByText('No user')).toBeInTheDocument();
  expect(screen.getByText('No role')).toBeInTheDocument();
});

test('restores currentUser from localStorage on init', async () => {
  localStorage.setItem('currentUser', JSON.stringify(mockUser));

  await act(async () => {
    render(
      <Wrapper>
        <MockComponent />
      </Wrapper>,
    );
  });

  expect(screen.getByText('User: John Doe')).toBeInTheDocument();
});

test('restores currentRole from localStorage on init', async () => {
  localStorage.setItem('currentRole', JSON.stringify(mockAccess));

  await act(async () => {
    render(
      <Wrapper>
        <MockComponent />
      </Wrapper>,
    );
  });

  expect(screen.getByText(`Role: ${JSON.stringify(mockAccess)}`)).toBeInTheDocument();
});

// ─── getCurrentUser ───────────────────────────────────────────────────────────

test('calls getCurrentUser and sets currentUser in context on success', async () => {
  (UserService.getCurrentUser as jest.Mock).mockResolvedValueOnce({
    data: { user: mockUser, success: true },
  });

  await act(async () => {
    render(
      <Wrapper>
        <MockComponent />
      </Wrapper>,
    );
  });

  await act(async () => {
    screen.getByText('Get User').click();
  });

  expect(UserService.getCurrentUser).toHaveBeenCalledWith('test-subdomain');
  expect(screen.getByText('User: John Doe')).toBeInTheDocument();
});

test('persists currentUser and currentRole to localStorage on successful getCurrentUser', async () => {
  (UserService.getCurrentUser as jest.Mock).mockResolvedValueOnce({
    data: { user: mockUser, success: true },
  });

  await act(async () => {
    render(
      <Wrapper>
        <MockComponent />
      </Wrapper>,
    );
  });

  await act(async () => {
    screen.getByText('Get User').click();
  });

  expect(JSON.parse(localStorage.getItem('currentUser')!)).toEqual(mockUser);
  expect(JSON.parse(localStorage.getItem('currentRole')!)).toEqual(mockAccess);
});

test('does not set currentUser if getCurrentUser returns success: false', async () => {
  (UserService.getCurrentUser as jest.Mock).mockResolvedValueOnce({
    data: { user: null, success: false },
  });

  await act(async () => {
    render(
      <Wrapper>
        <MockComponent />
      </Wrapper>,
    );
  });

  await act(async () => {
    screen.getByText('Get User').click();
  });

  expect(screen.getByText('No user')).toBeInTheDocument();
  expect(localStorage.getItem('currentUser')).toBeNull();
});

// ─── getCurrentRoleAccess ─────────────────────────────────────────────────────

test('calls getCurrentRoleAccess and sets currentRole in context on success', async () => {
  await act(async () => {
    render(
      <Wrapper>
        <MockComponent />
      </Wrapper>,
    );
  });

  await act(async () => {
    screen.getByText('Get Role Access').click();
  });

  expect(RoleService.getCurrentAccess).toHaveBeenCalledWith('test-subdomain');

  await waitFor(() => {
    expect(screen.getByText(`Role: ${JSON.stringify(mockAccess)}`)).toBeInTheDocument();
  });
});

test('does not set currentRole if getCurrentRoleAccess returns success: false', async () => {
  (RoleService.getCurrentAccess as jest.Mock).mockResolvedValueOnce({
    data: { access: null, success: false },
  });

  await act(async () => {
    render(
      <Wrapper>
        <MockComponent />
      </Wrapper>,
    );
  });

  await act(async () => {
    screen.getByText('Get Role Access').click();
  });

  expect(screen.getByText('No role')).toBeInTheDocument();
});

// ─── getRoleAccess ────────────────────────────────────────────────────────────

test('calls getRoleAccess and sets roleAccessDetails in context on success', async () => {
  await act(async () => {
    render(
      <Wrapper>
        <MockComponent />
      </Wrapper>,
    );
  });

  await act(async () => {
    screen.getByText('Get Role Details').click();
  });

  expect(RoleService.getRoleDetails).toHaveBeenCalledWith('test-subdomain');

  await waitFor(() => {
    expect(screen.getByText('Has role access')).toBeInTheDocument();
  });
});

test('does not set roleAccessDetails if getRoleAccess returns success: false', async () => {
  (RoleService.getRoleDetails as jest.Mock).mockResolvedValueOnce({
    data: { role_access: null, success: false },
  });

  await act(async () => {
    render(
      <Wrapper>
        <MockComponent />
      </Wrapper>,
    );
  });

  await act(async () => {
    screen.getByText('Get Role Details').click();
  });

  expect(screen.getByText('No role access')).toBeInTheDocument();
});