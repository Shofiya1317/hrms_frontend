import { useState } from 'react';
import { FaSortDown, FaSortUp } from 'react-icons/fa6';

interface TaskTableHeaderProps {
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  onSort: (key: string, direction: 'asc' | 'desc') => void;
}

const TaskTableHeader = ({ sortConfig, onSort }: TaskTableHeaderProps) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const getSortIcon = (key: string) => {
    // Show icon if column is sorted (always visible)
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? (
        <FaSortUp className="inline ml-1 mt-2 text-[#FBA900]" size={14} />
      ) : (
        <FaSortDown className="inline ml-1 mb-2 text-[#FBA900]" size={14} />
      );
    }

    // Show icon only on hover for non-sorted columns
    if (hoveredKey === key) {
      return <FaSortDown className="inline ml-1 mb-2 text-gray-400" size={14} />;
    }

    // Empty placeholder to prevent layout shift
    return <span className="inline-block w-4 ml-1" />;
  };

  const handleHeaderClick = (key: string) => {
    if (sortConfig?.key === key) {
      onSort(key, sortConfig.direction === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(key, 'asc');
    }
  };

  return (
    <thead>
      <tr className="bg-[#F2C6441A] h-[54px]">
        <th className="px-4 py-3 text-sm text-text-primary text-center">
          S.No
        </th>

        <th
          className="px-4 py-3 text-sm text-text-primary text-left cursor-pointer"
          onMouseEnter={() => setHoveredKey('vendor')}
          onMouseLeave={() => setHoveredKey(null)}
          onClick={() => handleHeaderClick('vendor')}
        >
          <span>Vendor</span>
          {getSortIcon('vendor')}
        </th>

        <th
          className="px-4 py-3 text-sm text-text-primary text-center cursor-pointer"
          onMouseEnter={() => setHoveredKey('tasksSent')}
          onMouseLeave={() => setHoveredKey(null)}
          onClick={() => handleHeaderClick('tasksSent')}
        >
          <span>Tasks Sent</span>
          {getSortIcon('tasksSent')}
        </th>

        <th
          className="px-4 py-3 text-sm text-text-primary text-center cursor-pointer"
          onMouseEnter={() => setHoveredKey('completed')}
          onMouseLeave={() => setHoveredKey(null)}
          onClick={() => handleHeaderClick('completed')}
        >
          <span>Completed</span>
          {getSortIcon('completed')}
        </th>

        <th
          className="px-4 py-3 text-sm text-text-primary text-center cursor-pointer"
          onMouseEnter={() => setHoveredKey('inprogress')}
          onMouseLeave={() => setHoveredKey(null)}
          onClick={() => handleHeaderClick('inprogress')}
        >
          <span>Inprogress</span>
          {getSortIcon('inprogress')}
        </th>

        <th
          className="px-4 py-3 text-sm text-text-primary text-center cursor-pointer"
          onMouseEnter={() => setHoveredKey('overdue')}
          onMouseLeave={() => setHoveredKey(null)}
          onClick={() => handleHeaderClick('overdue')}
        >
          <span>Overdue</span>
          {getSortIcon('overdue')}
        </th>

        <th
          className="px-4 py-3 text-sm text-text-primary text-center cursor-pointer"
          onMouseEnter={() => setHoveredKey('completionRate')}
          onMouseLeave={() => setHoveredKey(null)}
          onClick={() => handleHeaderClick('completionRate')}
        >
          <span>Completion Rate</span>
          {getSortIcon('completionRate')}
        </th>

        <th className="px-4 py-3 text-sm text-text-primary text-center">
          Actions
        </th>
      </tr>
    </thead>
  );
};

export default TaskTableHeader;
