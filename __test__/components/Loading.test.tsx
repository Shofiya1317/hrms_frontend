import { Loader } from '@/components/Loader/Loader';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

test('renders the outer container with correct styles', () => {
  const { container } = render(<Loader />);

  const outerDiv = container.firstChild as HTMLElement;
  expect(outerDiv).toHaveClass('d-flex', 'justify-content-center', 'align-items-center');
});

test('renders the loader animation element', () => {
  render(<Loader />);

  const loader = screen.getByTestId('loader');
  expect(loader).toBeInTheDocument();
  expect(loader).toHaveClass('loader');
});

test('renders the loading text container with correct classes', () => {
  const { container } = render(<Loader />);

  const loadingDiv = container.querySelector('.loading.loading06');
  expect(loadingDiv).toBeInTheDocument();
});

test('renders all 10 loading text spans', () => {
  const { container } = render(<Loader />);

  const spans = container.querySelectorAll('.loading06 span');
  expect(spans).toHaveLength(10);
});

test('renders correct loading text characters in order', () => {
  const { container } = render(<Loader />);

  const spans = container.querySelectorAll('.loading06 span');
  const expectedText = ['L', 'O', 'A', 'D', 'I', 'N', 'G', '.', '.', '.'];

  spans.forEach((span, index) => {
    expect(span.textContent).toBe(expectedText[index]);
  });
});

test('each span has correct data-text attribute matching its content', () => {
  const { container } = render(<Loader />);

  const spans = container.querySelectorAll('.loading06 span');
  spans.forEach((span) => {
    expect(span.getAttribute('data-text')).toBe(span.textContent);
  });
});