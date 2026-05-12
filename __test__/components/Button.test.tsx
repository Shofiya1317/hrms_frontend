import { Button } from '@/components/Button/Button';
import { ButtonProps } from '@/components/types';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('react-bootstrap', () => ({
  Button: ({ children, onClick, onDoubleClick, disabled, type, id, style, className, 'data-testid': testId }: any) => (
    <button
      type={type}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      disabled={disabled}
      id={id}
      style={style}
      className={className}
      data-testid={testId}
    >
      {children}
    </button>
  ),
  Spinner: ({ size }: any) => <span data-testid="spinner" />,
}));

// ─── Setup ────────────────────────────────────────────────────────────────────

const mockOnClick = jest.fn();
const mockOnDoubleClick = jest.fn();

const defaultProps: ButtonProps = {
  text: 'Test Button',
  type: 'button',
  onClick: mockOnClick,
  onDoubleClick: mockOnDoubleClick,
  isSolid: false,
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Render Tests ─────────────────────────────────────────────────────────────

test('renders the button with the correct text', () => {
  render(<Button {...defaultProps} />);

  const button = screen.getByTestId('button-Test Button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveTextContent('Test Button');
});

test('renders prefix and suffix icons if provided', () => {
  render(
    <Button
      {...defaultProps}
      prefixIconChildren={<span data-testid="prefix-icon">Prefix</span>}
      sufixIconChildren={<span data-testid="suffix-icon">Suffix</span>}
    />,
  );

  expect(screen.getByTestId('prefix-icon')).toBeInTheDocument();
  expect(screen.getByTestId('suffix-icon')).toBeInTheDocument();
});

test('renders spinner when isLoading is true', () => {
  render(<Button {...defaultProps} isLoading />);

  expect(screen.getByTestId('spinner')).toBeInTheDocument();
  expect(screen.getByTestId('button-Test Button')).toBeDisabled();
});

// ─── getButtonClassName Tests ─────────────────────────────────────────────────

test('applies common_solid_button class when isSolid is true', () => {
  const { container } = render(<Button {...defaultProps} isSolid />);
  expect(container.querySelector('.common_solid_button')).toBeInTheDocument();
});

test('applies common_hallowdanger_button class when isDanger is true', () => {
  const { container } = render(<Button {...defaultProps} isDanger />);
  expect(container.querySelector('.common_hallowdanger_button')).toBeInTheDocument();
});

test('applies common_link_button class when isLink is true', () => {
  const { container } = render(<Button {...defaultProps} isLink />);
  expect(container.querySelector('.common_link_button')).toBeInTheDocument();
});

test('applies common_secondary_button class when isSolidSecondary is true and isSolid is false', () => {
  const { container } = render(<Button {...defaultProps} isSolidSecondary isSolid={false} />);
  expect(container.querySelector('.common_secondary_button')).toBeInTheDocument();
});

test('applies common_pill_button class when isPill is true', () => {
  const { container } = render(<Button {...defaultProps} isPill />);
  expect(container.querySelector('.common_pill_button')).toBeInTheDocument();
});

test('applies common_border_button class when isBorderButton is true', () => {
  const { container } = render(<Button {...defaultProps} isBorderButton />);
  expect(container.querySelector('.common_border_button')).toBeInTheDocument();
});

test('applies common_hallow_button class by default', () => {
  const { container } = render(<Button {...defaultProps} />);
  expect(container.querySelector('.common_hallow_button')).toBeInTheDocument();
});

// ─── Interaction Tests ────────────────────────────────────────────────────────

test('calls onClick handler when clicked', () => {
  render(<Button {...defaultProps} />);

  fireEvent.click(screen.getByTestId('button-Test Button'));
  expect(mockOnClick).toHaveBeenCalledTimes(1);
});

test('calls onDoubleClick handler when double-clicked', () => {
  render(<Button {...defaultProps} />);

  fireEvent.doubleClick(screen.getByTestId('button-Test Button'));
  expect(mockOnDoubleClick).toHaveBeenCalledTimes(1);
});

test('does not throw when onClick is not provided and button is clicked', () => {
  render(<Button {...defaultProps} onClick={undefined} />);

  expect(() => fireEvent.click(screen.getByTestId('button-Test Button'))).not.toThrow();
});

test('does not throw when onDoubleClick is not provided and button is double-clicked', () => {
  render(<Button {...defaultProps} onDoubleClick={undefined} />);

  expect(() => fireEvent.doubleClick(screen.getByTestId('button-Test Button'))).not.toThrow();
});

// ─── Disabled Tests ───────────────────────────────────────────────────────────

test('disables the button when isDisabled is true', () => {
  render(<Button {...defaultProps} isDisabled />);
  expect(screen.getByTestId('button-Test Button')).toBeDisabled();
});

test('disables the button when isLoading is true', () => {
  render(<Button {...defaultProps} isLoading />);
  expect(screen.getByTestId('button-Test Button')).toBeDisabled();
});