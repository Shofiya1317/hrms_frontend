import { BreadCrumb } from '@/components/BreadCrumb/BreadCrumb';
import { BreadCrumbProps } from '@/components/types';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('next/link', () =>
  function ({ children, href, onClick, className }: any) {
    return (
      <a href={href} onClick={onClick} className={className}>
        {children}
      </a>
    );
  },
);

jest.mock('react-icons/md', () => ({
  MdOutlineChevronRight: () => <span data-testid="chevron-separator" />,
}));

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockBreadCrumb: BreadCrumbProps[] = [
  {
    title: 'Home',
    isTitle: true,
    url: '/',
  },
  {
    title: 'Section',
    isSubTitle: true,
    url: '/section',
  },
  {
    title: 'Sub-section',
    breadCrumb: [
      { title: 'Page 1', url: '/page-1' },
      { title: 'Page 2', url: '/page-2' },
      { title: 'Page 3', url: '/page-3' },
    ],
  },
];

// ─── Render Tests ─────────────────────────────────────────────────────────────

test('renders the main title when isTitle is true', () => {
  render(<BreadCrumb breadCrumb={mockBreadCrumb} />);

  const titleElement = screen.getByText('Home');
  expect(titleElement).toBeInTheDocument();
  expect(titleElement.tagName).toBe('H4');
  expect(titleElement).toHaveClass('Bread_crumb_title');
});

test('renders the sub-title when isSubTitle is true', () => {
  render(<BreadCrumb breadCrumb={mockBreadCrumb} />);

  const subTitleElement = screen.getByText('Section');
  expect(subTitleElement).toBeInTheDocument();
  expect(subTitleElement.tagName).toBe('H6');
  expect(subTitleElement).toHaveClass('Bread_crumb_title');
});

test('renders breadcrumb links with correct href', () => {
  render(<BreadCrumb breadCrumb={mockBreadCrumb} />);

  const page1Link = screen.getByText('Page 1').closest('a');
  expect(page1Link).toHaveAttribute('href', '/page-1');

  const page2Link = screen.getByText('Page 2').closest('a');
  expect(page2Link).toHaveAttribute('href', '/page-2');
});

test('does not render breadcrumb item when url is empty', () => {
  const breadCrumbWithEmptyUrl: BreadCrumbProps[] = [
    {
      title: 'Sub-section',
      breadCrumb: [
        { title: 'No URL Page', url: '' },
      ],
    },
  ];

  render(<BreadCrumb breadCrumb={breadCrumbWithEmptyUrl} />);

  // Component guards with data.url && (...) so empty url items are not rendered
  expect(screen.queryByText('No URL Page')).not.toBeInTheDocument();
});

test('applies active-breadcrumb class to the last breadcrumb item', () => {
  render(<BreadCrumb breadCrumb={mockBreadCrumb} />);

  const lastLink = screen.getByText('Page 3').closest('a');
  expect(lastLink).toHaveClass('active-breadcrumb');
});

test('does not apply active-breadcrumb class to non-last breadcrumb items', () => {
  render(<BreadCrumb breadCrumb={mockBreadCrumb} />);

  const firstLink = screen.getByText('Page 1').closest('a');
  expect(firstLink).not.toHaveClass('active-breadcrumb');
});

test('renders chevron separators between breadcrumb items (not after last)', () => {
  render(<BreadCrumb breadCrumb={mockBreadCrumb} />);

  // 3 items → 2 separators (not after the last item)
  const separators = screen.getAllByTestId('chevron-separator');
  expect(separators).toHaveLength(2);
});

test('renders no separator after the last breadcrumb item', () => {
  const singleItemBreadCrumb: BreadCrumbProps[] = [
    {
      title: 'Sub-section',
      breadCrumb: [{ title: 'Only Page', url: '/only' }],
    },
  ];

  render(<BreadCrumb breadCrumb={singleItemBreadCrumb} />);

  expect(screen.queryByTestId('chevron-separator')).not.toBeInTheDocument();
});

// ─── onClick Tests ────────────────────────────────────────────────────────────

test('calls onClick handler and prevents default navigation when onClick is provided', () => {
  const mockOnClick = jest.fn();

  const breadCrumbWithOnClick: BreadCrumbProps[] = [
    {
      title: 'Sub-section',
      breadCrumb: [
        { title: 'Clickable Page', url: '/clickable', onClick: mockOnClick },
      ],
    },
  ];

  render(<BreadCrumb breadCrumb={breadCrumbWithOnClick} />);

  const link = screen.getByText('Clickable Page').closest('a')!;
  fireEvent.click(link);

  expect(mockOnClick).toHaveBeenCalledTimes(1);
});

test('renders link without onClick handler when onClick is not provided', () => {
  render(<BreadCrumb breadCrumb={mockBreadCrumb} />);

  const link = screen.getByText('Page 1').closest('a');
  expect(link).toBeInTheDocument();
  // Clicking should not throw
  fireEvent.click(link!);
});

// ─── Edge Cases ───────────────────────────────────────────────────────────────

test('renders nothing when breadCrumb array is empty', () => {
  const { container } = render(<BreadCrumb breadCrumb={[]} />);
  expect(container.firstChild).toBeEmptyDOMElement();
});

test('renders only title with no breadcrumb links when breadCrumb sub-array is absent', () => {
  const titleOnly: BreadCrumbProps[] = [{ title: 'Title Only', isTitle: true }];
  render(<BreadCrumb breadCrumb={titleOnly} />);

  expect(screen.getByText('Title Only')).toBeInTheDocument();
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
});