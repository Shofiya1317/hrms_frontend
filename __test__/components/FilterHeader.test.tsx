import FilterHeader from '@/components/Filter/FilterHeader';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

describe('FilterHeader Component', () => {
  it('renders the header with text "Filters"', () => {
    render(<FilterHeader resetButton={jest.fn()} />);
    expect(screen.getByText(/Filters/i)).toBeInTheDocument();
  });

  it('renders the "Reset All" button', () => {
    render(<FilterHeader resetButton={jest.fn()} />);
    const resetSpan = screen.getByText(/Reset All/i);
    expect(resetSpan).toBeInTheDocument();
    expect(resetSpan).toHaveClass('resetAll_btn');
  });

  it('calls the resetButton callback when the button is clicked', () => {
    const mockResetButton = jest.fn();
    render(<FilterHeader resetButton={mockResetButton} />);

    // Click the <button> element directly, not the inner <span>
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockResetButton).toHaveBeenCalledTimes(1);
  });

  it('applies the correct classes to the outer container div', () => {
    const { container } = render(<FilterHeader resetButton={jest.fn()} />);

    // Get the outer wrapper div directly via container
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv).toHaveClass('d-flex');
    expect(outerDiv).toHaveClass('justify-content-between');
    expect(outerDiv).toHaveClass('align-items-center');
  });

  it('applies the correct classes to the reset button', () => {
    render(<FilterHeader resetButton={jest.fn()} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('d-flex');
    expect(button).toHaveClass('justify-content-between');
    expect(button).toHaveClass('align-items-center');
    expect(button).toHaveClass('border-0');
    expect(button).toHaveClass('bg-white');
  });
});