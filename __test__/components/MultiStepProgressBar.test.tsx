import MultiStepProgressBar from '@/components/MultiStepProgressBar/MultiStepProgressBar';
import { render, screen } from '@testing-library/react';
import { useParams } from 'next/navigation';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}));

// Mock react-step-progress-bar to render children functionally
jest.mock('react-step-progress-bar', () => ({
  ProgressBar: ({ children, percent }: { children: React.ReactNode; percent: number }) => (
    <div data-testid="progress-bar" data-percent={percent}>
      {children}
    </div>
  ),
  Step: ({
    children,
  }: {
    children: (props: { accomplished: boolean; position: number }) => React.ReactNode;
  }) => <div>{children({ accomplished: false, position: 0 })}</div>,
}));

// ─── Setup ────────────────────────────────────────────────────────────────────

const mockUseParams = useParams as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Step Count Tests ─────────────────────────────────────────────────────────

test('renders 4 Step components (only active steps)', () => {
  mockUseParams.mockReturnValue({ slug: 'company_information' });

  render(<MultiStepProgressBar />);
  const steps = screen.getAllByTestId('step');

  // Active steps: Signup, Company Information, Business Unit, Invite Users
  expect(steps).toHaveLength(4);
});

test('renders all step labels', () => {
  mockUseParams.mockReturnValue({ slug: 'company_information' });

  render(<MultiStepProgressBar />);

  expect(screen.getByText('Signup')).toBeInTheDocument();
  expect(screen.getByText('Company Information')).toBeInTheDocument();
  expect(screen.getByText('Business Unit')).toBeInTheDocument();
  expect(screen.getByText('Invite users')).toBeInTheDocument();
});

// ─── Percentage Calculation Tests ─────────────────────────────────────────────

// steps array = ['company_information', 'business_unit', 'invite_user'] (length 3)
// stepPercentage = ((stepIndex + 1) * 100) / 3

test('sets stepPercentage to ~33 when slug is "company_information" (index 0)', () => {
  mockUseParams.mockReturnValue({ slug: 'company_information' });

  render(<MultiStepProgressBar />);
  const progressBar = screen.getByTestId('progress-bar');

  expect(progressBar).toHaveAttribute(
    'data-percent',
    String((1 * 100) / 3),
  );
});

test('sets stepPercentage to ~67 when slug is "business_unit" (index 1)', () => {
  mockUseParams.mockReturnValue({ slug: 'business_unit' });

  render(<MultiStepProgressBar />);
  const progressBar = screen.getByTestId('progress-bar');

  expect(progressBar).toHaveAttribute(
    'data-percent',
    String((2 * 100) / 3),
  );
});

test('sets stepPercentage to 100 when slug is "invite_user" (index 2)', () => {
  mockUseParams.mockReturnValue({ slug: 'invite_user' });

  render(<MultiStepProgressBar />);
  const progressBar = screen.getByTestId('progress-bar');

  expect(progressBar).toHaveAttribute('data-percent', String((3 * 100) / 3));
});

test('sets stepPercentage to 0 when slug is invalid', () => {
  mockUseParams.mockReturnValue({ slug: 'invalid_slug' });

  render(<MultiStepProgressBar />);
  const progressBar = screen.getByTestId('progress-bar');

  expect(progressBar).toHaveAttribute('data-percent', '0');
});

test('sets stepPercentage to 0 when slug is a commented-out step like "standard_regulations"', () => {
  mockUseParams.mockReturnValue({ slug: 'standard_regulations' });

  render(<MultiStepProgressBar />);
  const progressBar = screen.getByTestId('progress-bar');

  expect(progressBar).toHaveAttribute('data-percent', '0');
});

test('sets stepPercentage to 0 when slug is a commented-out step like "plans"', () => {
  mockUseParams.mockReturnValue({ slug: 'plans' });

  render(<MultiStepProgressBar />);
  const progressBar = screen.getByTestId('progress-bar');

  expect(progressBar).toHaveAttribute('data-percent', '0');
});

// ─── Accomplished Class Tests ─────────────────────────────────────────────────
// Note: accomplished is driven by ProgressBar library passing percent to Step.
// Since we mock Step to always pass accomplished=false, we test the
// class application logic directly via the mock.

test('step div renders with "indexedStep" class', () => {
  mockUseParams.mockReturnValue({ slug: 'company_information' });

  render(<MultiStepProgressBar />);
  const steps = screen.getAllByTestId('step');

  steps.forEach((step) => {
    expect(step).toHaveClass('indexedStep');
  });
});

test('step div does not have "accomplished" class when mock returns accomplished=false', () => {
  mockUseParams.mockReturnValue({ slug: 'invite_user' });

  render(<MultiStepProgressBar />);
  const steps = screen.getAllByTestId('step');

  steps.forEach((step) => {
    expect(step).not.toHaveClass('accomplished');
  });
});