import Filter from '@/components/Filter/Filter';
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  (usePathname as jest.Mock).mockReturnValue('/home');
});

describe('Filter Component', () => {
  it('renders the dropdown toggle button', () => {
    render(
      <Filter>
        <div>Filter Content</div>
      </Filter>,
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  // FIX: Dropdown.Menu is fully removed from DOM when closed in jsdom.
  // Must click the toggle first, then assert children are present.
  it('renders children inside the dropdown menu', async () => {
    render(
      <Filter>
        <div>Filter Content</div>
      </Filter>,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(screen.getByText('Filter Content')).toBeInTheDocument();
  });

  it('opens the dropdown menu when toggle button is clicked', async () => {
    render(
      <Filter>
        <div>Filter Content</div>
      </Filter>,
    );

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

    await act(async () => {
      fireEvent.click(toggleButton);
    });

    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Filter Content')).toBeInTheDocument();
  });

  it('applies "relative" class to the dropdown wrapper', () => {
    render(
      <Filter>
        <div>Filter Content</div>
      </Filter>,
    );

    // data-testid="Filter Content" is on the Dropdown wrapper — query by testid
    const dropdown = screen.getByTestId('Filter Content');
    expect(dropdown).toHaveClass('relative');
  });

  it('renders the filter icon (svg) inside the toggle button', () => {
    render(
      <Filter>
        <div>Filter Content</div>
      </Filter>,
    );

    const button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('applies dropdown-toggle-color class when pathname starts with /users', () => {
    (usePathname as jest.Mock).mockReturnValue('/users/list');

    render(
      <Filter>
        <div>Filter Content</div>
      </Filter>,
    );

    expect(screen.getByRole('button')).toHaveClass('dropdown-toggle-color');
  });

  it('does not apply dropdown-toggle-color class when pathname does not start with /users', () => {
    (usePathname as jest.Mock).mockReturnValue('/home');

    render(
      <Filter>
        <div>Filter Content</div>
      </Filter>,
    );

    expect(screen.getByRole('button')).not.toHaveClass('dropdown-toggle-color');
  });
});