/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { FaRegTrashAlt } from 'react-icons/fa';
import { FiEdit } from 'react-icons/fi';

interface Vendor {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  category: string;
  categoryId: string;
  region: string;
  rating: string;
  ratingScore: number;
  assignedSKUs: number;
  invitationStatus: 'pending' | 'active' | 'inactive' | 'not-sent';
  logo: string;
  logoAlt: string;
  lastSubmission: string;
}

interface VendorTableRowProps {
  vendor: Vendor;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (vendor: Vendor) => void;
  onDelete: (vendor: Vendor) => void;
}

const VendorTableRow = ({
  vendor,
  isSelected: _isSelected,
  onSelect: _onSelect,
  onEdit,
  onDelete,
}: VendorTableRowProps) => {
  const [showActions, setShowActions] = useState(false);

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

  const getSKUColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-success';
      case 'pending':
        return 'text-warning';
      case 'inactive':
        return 'text-text-secondary';
      default:
        return 'text-text-secondary';
    }
  };

  const formatStatus = (status: string) => status
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors duration-fast relative">
      <td className="px-4 py-1">
        <div className="flex items-center">
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-semibold"
          >
            {vendor.rating}
          </span>
          {/* <span className="text-sm text-text-secondary">{vendor.ratingScore}%</span> */}
        </div>
      </td>

      <td className="px-4 py-1">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="font-medium text-text-primary truncate text-sm mt-2 mb-0">{vendor.companyName}</p>
            <p className="text-text-secondary text-muted truncate text-xs">{vendor.contactName}</p>
          </div>
        </div>
      </td>

      <td className="px-4 py-1">
        <div className="">
          <p className="font-medium text-text-primary truncate text-sm mt-2 mb-0">{vendor.email}</p>
          <p className="text-text-secondary text-muted truncate text-xs">{vendor.phone}</p>
        </div>
      </td>

      <td className="px-4 py-1">
        <span className="inline-flex items-center py-1 rounded-md  font-medium text-text-primary truncate bg-primary/10 text-sm">
          {vendor.category}
        </span>
      </td>

      {/* <td className="px-4 py-3">
        <span className="text-sm text-text-primary">{vendor.region}</span>
      </td> */}

      <td className="px-4 py-1">
        <span className={`text-sm font-medium ${getSKUColor(vendor.invitationStatus)}`}>
          {vendor.assignedSKUs}
        </span>
      </td>

      <td className="px-4 py-1">
        <span
          className={`inline-flex items-center h-[21px] rounded-full px-[10px] py-[3px] gap-[10px] text-xs font-medium ${getStatusColor(vendor.invitationStatus)}`}
        >
          {formatStatus(vendor.invitationStatus)}
        </span>
      </td>

      <td className="px-4 py-1">
        <span className="text-sm text-text-secondary">{vendor.lastSubmission}</span>
      </td>

      <td className="px-4 py-1">
        <div className="relative">
          {/* Trigger button */}
          <button
            type="button"
            onClick={() => setShowActions(!showActions)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setShowActions(!showActions);
              }
            }}
            className="p-1 hover:bg-muted rounded-md transition-colors duration-fast"
            aria-label="More actions"
          >
            <Icon name="EllipsisVerticalIcon" size={20} className="text-text-secondary" />
          </button>
          {showActions && (
            <>
              {/* Overlay */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowActions(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setShowActions(false);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="Close menu"
              />

              {/* Dropdown container */}
              <div className="absolute right-0 top-8 z-20 flex flex-col w-[111px] bg-white rounded-lg border border-[#E4E7EC] shadow-md">
                {/* Edit button */}
                <button
                  type="button"
                  onClick={() => {
                    onEdit(vendor);
                    setShowActions(false);
                  }}
                  className="w-[111px] h-[36px] flex items-center gap-2 px-3 text-sm text-text-primary rounded-t-lg border-l border-r border-t border-[#E4E7EC]"
                >
                  <FiEdit size={18} color="#FBA900" />
                  <span>Edit</span>
                </button>

                {/* Divider line */}
                <div className="border-t border-[#E4E7EC]" />

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => {
                    onDelete(vendor);
                    setShowActions(false);
                  }}
                  className="w-[111px] h-[36px] flex items-center gap-2 px-3 text-sm text-text-primary rounded-b-lg border-l border-r border-b border-[#E4E7EC]"
                >
                  <FaRegTrashAlt size={18} color="#FBA900" />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default VendorTableRow;
