import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { Dropdown } from 'react-bootstrap';
import { IoFilterSharp } from 'react-icons/io5';
import './Filter.css';

const Filter = ({
  children,
}: {
  children: ReactNode;
}) => {
  const pathname = usePathname();
  return (
    <Dropdown className="relative" data-testid="Filter Content">
      <Dropdown.Toggle
        variant=""
        className={`${pathname?.startsWith('/users') ? 'dropdown-toggle-color border text-center border' : 'border text-center border'}`}
      >
        <IoFilterSharp fontSize={24} />
      </Dropdown.Toggle>

      <Dropdown.Menu className="dropdown_filter_css">
        {children}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default Filter;
