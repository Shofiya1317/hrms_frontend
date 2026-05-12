/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface Vendor {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  category: string;
  region: string;
  rating: string;
  ratingScore: number;
  assignedSKUs: number;
  invitationStatus: 'pending' | 'active' | 'inactive' | 'not-sent';
  logo: string;
  logoAlt: string;
  lastSubmission: string;
}

interface VendorMobileCardProps {
  vendor: Vendor;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (vendor: Vendor) => void;
  onViewHistory: (vendor: Vendor) => void;
  onManageSKUs: (vendor: Vendor) => void;
}

const VendorMobileCard = ({
  vendor,
  isSelected,
  onSelect,
  onEdit,
  onViewHistory,
  onManageSKUs,
}: VendorMobileCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success';
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'overdue':
        return 'bg-error/10 text-error';
      default:
        return 'bg-muted text-text-secondary';
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'A':
        return 'bg-success/10 text-success';
      case 'B':
        return 'bg-primary/10 text-primary';
      case 'C':
        return 'bg-warning/10 text-warning';
      case 'D':
        return 'bg-error/10 text-error';
      default:
        return 'bg-muted text-text-secondary';
    }
  };

  const formatStatus = (status: string) => status
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-card">
      <div className="flex items-start gap-3 mb-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(vendor.id)}
          className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/20"
          aria-label={`Select ${vendor.companyName}`}
        />
        <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
          <AppImage src={vendor.logo} alt={vendor.logoAlt} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-text-primary truncate">{vendor.companyName}</h3>
          <p className="text-sm text-text-secondary truncate">{vendor.contactName}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-muted rounded-md transition-colors duration-fast"
          aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
        >
          <Icon
            name={isExpanded ? 'ChevronUpIcon' : 'ChevronDownIcon'}
            size={20}
            className="text-text-secondary"
          />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span
          className={`inline-flex items-center justify-center w-10 h-10 rounded-md text-base font-semibold ${getRatingColor(vendor.rating)}`}
        >
          {vendor.rating}
        </span>
        <div className="flex-1">
          <p className="text-sm text-text-secondary">Sustainability Rating</p>
          <p className="text-sm font-medium text-text-primary">
            {vendor.ratingScore}
            %
          </p>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(vendor.invitationStatus)}`}
        >
          {formatStatus(vendor.invitationStatus)}
        </span>
      </div>

      {isExpanded && (
        <div className="space-y-3 pt-3 border-t border-border">
          <div>
            <p className="text-xs text-text-secondary mb-1">Contact Information</p>
            <p className="text-sm text-text-primary">{vendor.email}</p>
            <p className="text-sm text-text-primary">{vendor.phone}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-text-secondary mb-1">Category</p>
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                {vendor.category}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-xs text-text-secondary mb-1">Region</p>
              <p className="text-sm text-text-primary">{vendor.region}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-text-secondary mb-1">Assigned SKUs</p>
              <p className="text-sm font-medium text-text-primary">{vendor.assignedSKUs}</p>
            </div>
            <div className="flex-1">
              <p className="text-xs text-text-secondary mb-1">Last Submission</p>
              <p className="text-sm text-text-primary">{vendor.lastSubmission}</p>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => onEdit(vendor)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors duration-fast"
            >
              <Icon name="PencilIcon" size={16} />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => onViewHistory(vendor)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-muted text-text-primary rounded-md text-sm font-medium hover:bg-muted/80 transition-colors duration-fast"
            >
              <Icon name="ClockIcon" size={16} />
              <span>History</span>
            </button>
            <button
              type="button"
              onClick={() => onManageSKUs(vendor)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-muted text-text-primary rounded-md text-sm font-medium hover:bg-muted/80 transition-colors duration-fast"
            >
              <Icon name="CubeIcon" size={16} />
              <span>SKUs</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorMobileCard;
