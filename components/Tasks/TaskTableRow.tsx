/* eslint-disable jsx-a11y/click-events-have-key-events */

'use client';

import { useState, useRef } from 'react';
import { BsClipboardPlus } from 'react-icons/bs';
import { IoEyeOutline } from 'react-icons/io5';
import { PiDotsThreeOutlineVerticalFill } from 'react-icons/pi';

interface TaskRow {
  id: string;
  vendor: string;
  vendorCategory: string;
  tasksSent?: number;
  completed?: number;
  inprogress?: number;
  overdue?: number;
  completionRate?: number;
}

interface TaskTableRowProps {
  task: TaskRow;
  index: number;
  onAssignTask: (id: string) => void;
  onViewTask: (id: string) => void;
}

const TaskTableRow = ({
  task,
  index,
  onAssignTask,
  onViewTask,
}: TaskTableRowProps) => {
  const [showActions, setShowActions] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const getRateStyle = (rate: number) => {
    if (rate <= 50) {
      return {
        backgroundColor: '#DD40141A',
        color: '#DD4014',
      };
    }

    if (rate < 90) {
      return {
        backgroundColor: '#FBA9001A',
        color: '#FB8C00',
      };
    }

    return {
      backgroundColor: '#00A9441A',
      color: '#00A944',
    };
  };

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors duration-fast relative">
      {/* S.No */}
      <td className="px-4 py-1 text-sm text-text-primary text-center">
        {index + 1}
        )
      </td>

      {/* Vendor */}
      <td className="px-4 py-1 ">
        <div className="">
          <p className="font-medium text-text-primary truncate text-sm mt-2 mb-0">
            {task.vendor}
          </p>
          <p className="text-text-secondary text-muted truncate text-xs">
            {task.vendorCategory}
          </p>
        </div>
      </td>

      {/* Tasks Sent */}
      <td className="px-4 py-1 text-sm text-text-primary text-center">
        {task.tasksSent ?? 0}
      </td>

      {/* Completed */}
      <td className="px-4 py-1 text-sm text-text-primary text-center">
        {task.completed ?? 0}
      </td>

      {/* Inprogress */}
      <td className="px-4 py-1 text-sm text-text-primary text-center">
        {task.inprogress ?? 0}
      </td>

      {/* Overdue */}
      <td className="px-4 py-1 text-sm text-text-primary text-center">
        {task.overdue ?? 0}
      </td>

      {/* Completion Rate */}
      <td className="px-4 py-1 text-center">
        <span
          className="font-medium text-sm px-3 py-1 rounded-full inline-block"
          style={getRateStyle(task?.completionRate ?? 0)}
        >
          {task.completionRate ?? 0}
          %
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-1 relative text-center">
        <button
          type="button"
          ref={buttonRef}
          onClick={() => {
            if (buttonRef.current) {
              const rect = buttonRef.current.getBoundingClientRect();
              setDropdownPos({
                top: rect.bottom + 4,
                left: rect.right - 140,
              });
            }
            setShowActions(!showActions);
          }}
        >
          <PiDotsThreeOutlineVerticalFill size={20} color="#64656D" />
        </button>

        {showActions && dropdownPos && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowActions(false)}
            />

            {/* Dropdown */}
            <div
              className="fixed z-50 w-[170px] bg-white rounded-lg border border-[#E4E7EC] shadow-md"
              style={{ top: dropdownPos.top, left: dropdownPos.left }}
            >
              {/* Assign Task */}
              <button
                type="button"
                onClick={() => {
                  onAssignTask(task.id); // ✅ FIXED
                  setShowActions(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50"
              >
                <BsClipboardPlus size={20} className="text-[#FBA900]" />
                Assign Task
              </button>

              <div className="h-px bg-[#E4E7EC]" />

              {/* View Task */}
              <button
                type="button"
                onClick={() => {
                  onViewTask(task.id); // ✅ FIXED
                  setShowActions(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50"
              >
                <IoEyeOutline size={20} className="text-[#FBA900]" />
                View Task
              </button>
            </div>
          </>
        )}
      </td>
    </tr>
  );
};

export default TaskTableRow;
