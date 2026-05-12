/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable jsx-a11y/click-events-have-key-events */

'use client';

import { useState, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';
import { FaRegTrashAlt } from 'react-icons/fa';
import { FiEdit } from 'react-icons/fi';

interface Vendor {
  id: string;
  name: string;
  category: string;
  sustainabilityScore: number;
}

interface SKU {
  id: string;
  skuCode: string;
  name: string;
  category: string;
  assignedVendors: Vendor[];
  businessUnit: string;
  site: string;
  averageScore: number;
  status: 'active' | 'pending' | 'inactive';
  createdDate: string;
  lastUpdated: string;
}

interface SKUTableRowProps {
  sku: SKU;
  onEdit: (sku: SKU) => void;
  onDelete: (id: string) => void;
  // onAssignVendors: (sku: SKU) => void;
}

const SKUTableRow = ({
  sku,
  onEdit,
  onDelete,
  // onAssignVendors,
}: SKUTableRowProps) => {
  const [showActions, setShowActions] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[#00A9441A] text-success';
      case 'pending':
        return 'bg-[#FBA9001A] text-warning';
      case 'inactive':
        return 'bg-muted text-text-secondary';
      default:
        return 'bg-muted text-text-secondary';
    }
  };

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors duration-fast relative">
      {/* SKU Code */}
      <td className="px-4 py-2">
        <div className="font-medium text-text-primary text-sm">
          {sku.skuCode}
        </div>
      </td>

      {/* Product details */}
      <td className="px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <div className="font-medium text-text-primary text-sm mt-2 mb-0">
              {sku.name}
            </div>
            <div className="text-text-secondary text-muted truncate text-xs mb-1">
              {sku.category}
            </div>
          </div>
        </div>
      </td>

      {/* Assigned Vendors */}
      <td className="px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-text-primary text-sm">
            {sku.assignedVendors.length}
          </span>
        </div>
      </td>

      {/* Business unit */}
      <td className="px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-text-primary text-sm">{sku.businessUnit}</span>
        </div>
      </td>

      {/* Score */}
      {/* <td className="px-4 py-3">
        {sku.averageScore > 0 ? (
          <span className={`font-semibold text-sm ${getScoreColor(sku.averageScore)} `}>
            {sku.averageScore}%
          </span>
        ) : (
          <span className="text-text-secondary text-sm">N/A</span>
        )}
      </td> */}

      {/* Status */}
      <td className="px-4 py-2">
        <span
          className={`inline-flex items-center h-[21px] rounded-full px-[10px] py-[3px] gap-[10px] text-xs font-medium ${getStatusColor(
            sku.status,
          )}`}
        >
          {sku.status.charAt(0).toUpperCase() + sku.status.slice(1)}
        </span>
      </td>

      {/* Last Updated */}
      <td className="px-4 py-2 text-[14px] font-medium leading-[100%] text-[#1E1E1E] text-sm">
        {sku.lastUpdated}
      </td>

      {/* Actions */}
      <td className="px-4 py-2 relative overflow-visible">
        <div className="relative">
          <button
            type="button"
            ref={buttonRef}
            onClick={() => {
              if (buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                setDropdownPos({
                  top: rect.bottom + 4,
                  left: rect.right - 120,
                });
              }
              setShowActions(!showActions);
            }}
          >
            <Icon
              name="EllipsisVerticalIcon"
              size={20}
              className="text-text-secondary"
            />
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
                className="fixed z-50 w-[120px] bg-white rounded-lg border border-[#E4E7EC] shadow-md overflow-hidden"
                style={{
                  top: dropdownPos.top,
                  left: dropdownPos.left,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    onEdit(sku);
                    setShowActions(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  <FiEdit size={18} color="#FBA900" />
                  Edit
                </button>

                <div className="h-px bg-[#E4E7EC]" />

                <button
                  type="button"
                  onClick={() => {
                    onDelete(sku.id);
                    setShowActions(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  <FaRegTrashAlt size={18} color="#FBA900" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default SKUTableRow;
