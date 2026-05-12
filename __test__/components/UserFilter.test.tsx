import UserFilter from '@/components/Filter/UserFilter/UserFilter';
import { IUserFilter } from '@/lib/interface/IUser.interface';
import { applyFilter, resetFilter } from '@/lib/utils';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { usePathname, useRouter } from 'next/navigation';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('@/lib/utils', () => ({
  applyFilter: jest.fn(),
  resetFilter: jest.fn(),
  convertToPascalCase: jest.fn((str: string) => str),
  userRole: jest.fn((str: string) => str),
}));

jest.mock('@/components/Filter/UserFilter/../FilterHeader', () =>
  ({ resetButton }: { resetButton: () => void }) => (
    <div>
      <span>Filters</span>
      <button onClick={resetButton}>Reset</button>
    </div>
  ),
);

jest.mock('@/components/CustomSelect/CustomSelect', () =>
  ({ options, onChange, value, id }: any) => (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange?.({ value: e.target.value })}
    >
      {options?.map((option: any) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
);

// ─── Setup ────────────────────────────────────────────────────────────────────

const mockRouter = { push: jest.fn() };
const mockPathname = '/users';

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue(mockRouter);
  (usePathname as jest.Mock).mockReturnValue(mockPathname);
  jest.clearAllMocks();
});

const params: IUserFilter = { role: 'GUEST', status: 'ACTIVE' };

// ─── Render Tests ─────────────────────────────────────────────────────────────

test('renders FilterHeader, form fields, and action buttons', () => {
  render(<UserFilter params={params} />);

  expect(screen.getByText('Filters')).toBeInTheDocument();
  expect(screen.getByLabelText('Role *')).toBeInTheDocument();
  expect(screen.getByLabelText('Status *')).toBeInTheDocument();
  expect(screen.getByText('Apply')).toBeInTheDocument();
  expect(screen.getByText('Cancel')).toBeInTheDocument();
});

test('renders initial values from params', () => {
  render(<UserFilter params={params} />);

  expect(screen.getByLabelText('Role *')).toHaveValue('GUEST');
  expect(screen.getByLabelText('Status *')).toHaveValue('ACTIVE');
});

// FIX 1: Role select has no empty option — Roles array starts with 'GUEST'.
// When initialValues.role is '' the select falls back to the first option 'GUEST'.
// Status select does have an empty '' ('All') option so it correctly shows ''.
test('renders with empty params gracefully', () => {
  render(<UserFilter params={{} as IUserFilter} />);

  // Role has no '' option so the select shows the first available: 'GUEST'
  expect(screen.getByLabelText('Role *')).toHaveValue('GUEST');
  // Status has an explicit '' / 'All' option so it correctly defaults to ''
  expect(screen.getByLabelText('Status *')).toHaveValue('');
});

// ─── Field Interaction Tests ──────────────────────────────────────────────────

// FIX 2: 'ADMIN' is not in the Roles array — DOM confirmed only 'GUEST' and
// 'MANAGER' are rendered. Use 'MANAGER' which is a real option.
test('updates role field value on change', () => {
  render(<UserFilter params={params} />);

  const roleSelect = screen.getByLabelText('Role *');
  fireEvent.change(roleSelect, { target: { value: 'MANAGER' } });

  expect(roleSelect).toHaveValue('MANAGER');
});

test('updates status field value on change', () => {
  render(<UserFilter params={params} />);

  const statusSelect = screen.getByLabelText('Status *');
  fireEvent.change(statusSelect, { target: { value: 'PENDING' } });

  expect(statusSelect).toHaveValue('PENDING');
});

// ─── Submit Tests ─────────────────────────────────────────────────────────────

// FIX 3: Use 'MANAGER' instead of 'ADMIN' — only valid options get set in
// Formik state via setFieldValue. 'ADMIN' is not in Roles so the value
// stays as '' after the change, causing applyFilter to receive role: ''.
test('calls applyFilter with form values on Apply click', async () => {
  render(<UserFilter params={params} />);

  fireEvent.change(screen.getByLabelText('Role *'), {
    target: { value: 'MANAGER' },
  });
  fireEvent.change(screen.getByLabelText('Status *'), {
    target: { value: 'PENDING' },
  });
  fireEvent.click(screen.getByText('Apply'));

  await waitFor(() => {
    expect(applyFilter).toHaveBeenCalledWith(
      { role: 'MANAGER', status: 'PENDING' },
      mockRouter,
      params,
      mockPathname,
    );
  });
});

test('calls applyFilter with initial values when Apply is clicked without changes', async () => {
  render(<UserFilter params={params} />);

  fireEvent.click(screen.getByText('Apply'));

  await waitFor(() => {
    expect(applyFilter).toHaveBeenCalledWith(
      { role: 'GUEST', status: 'ACTIVE' },
      mockRouter,
      params,
      mockPathname,
    );
  });
});

// ─── Reset Tests ──────────────────────────────────────────────────────────────

test('calls resetFilter with correct args when Cancel button is clicked', () => {
  render(<UserFilter params={params} />);

  fireEvent.click(screen.getByText('Cancel'));

  expect(resetFilter).toHaveBeenCalledWith(
    mockRouter,
    expect.any(Function),
    mockPathname,
  );
});

test('calls resetFilter with correct args when FilterHeader reset button is clicked', () => {
  render(<UserFilter params={params} />);

  fireEvent.click(screen.getByText('Reset'));

  expect(resetFilter).toHaveBeenCalledWith(
    mockRouter,
    expect.any(Function),
    mockPathname,
  );
});