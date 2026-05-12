/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

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

interface SKUMobileCardProps {
  sku: SKU ;
  onEdit: (sku: SKU) => void;
  onDelete: (id: string) => void;
  onAssignVendors?: (sku: SKU) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const SKUMobileCard = ({
  sku,
  onEdit,
  onDelete,
  onAssignVendors,
  isSelected,
  onSelect,
}: SKUMobileCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success';
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'inactive':
        return 'bg-muted text-text-secondary';
      default:
        return 'bg-muted text-text-secondary';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-4 mb-3">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(sku.id)}
          className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/20"
          aria-label={`Select ${sku.name}`}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-text-primary truncate">{sku.name}</h3>
              <p className="text-sm text-text-secondary">{sku.skuCode}</p>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowActions(!showActions)}
                className="p-1 hover:bg-muted rounded-md transition-colors duration-fast"
                aria-label="More actions"
              >
                <Icon name="EllipsisVerticalIcon" size={20} className="text-text-secondary" />
              </button>
              {showActions && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowActions(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 top-8 w-48 bg-popover border border-border rounded-md shadow-modal z-20">
                    <button
                      type="button"
                      onClick={() => {
                        onEdit(sku);
                        setShowActions(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-muted transition-colors duration-fast"
                    >
                      <Icon name="PencilIcon" size={16} className="text-text-secondary" />
                      <span>Edit SKU</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onAssignVendors?.(sku);
                        setShowActions(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-muted transition-colors duration-fast"
                    >
                      <Icon name="UserGroupIcon" size={16} className="text-text-secondary" />
                      <span>Assign Vendors</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(sku.id);
                        setShowActions(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10 transition-colors duration-fast"
                    >
                      <Icon name="TrashIcon" size={16} className="text-error" />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(
                sku.status,
              )}`}
            >
              {sku.status.charAt(0).toUpperCase() + sku.status.slice(1)}
            </span>
            <span className="text-xs text-text-secondary">{sku.category}</span>
          </div>

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Icon name="UserGroupIcon" size={16} className="text-text-secondary" />
              <span className="text-sm text-text-primary">
                {sku.assignedVendors.length}
                {' '}
                vendors
              </span>
              <button
                type="button"
                onClick={() => onAssignVendors?.(sku)}
                className="text-primary hover:text-primary/80 transition-colors duration-fast"
                aria-label="Manage vendor assignments"
              >
                <Icon name="PlusCircleIcon" size={16} />
              </button>
            </div>
            <div>
              {sku.averageScore > 0 ? (
                <span className={`text-sm font-semibold ${getScoreColor(sku.averageScore)}`}>
                  Score:
                  {' '}
                  {sku.averageScore}
                  %
                </span>
              ) : (
                <span className="text-sm text-text-secondary">No score</span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors duration-fast"
          >
            <span>{isExpanded ? 'Show less' : 'Show more'}</span>
            <Icon
              name={isExpanded ? 'ChevronUpIcon' : 'ChevronDownIcon'}
              size={16}
              className="text-primary"
            />
          </button>

          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-border space-y-2">
              <div className="text-sm">
                <span className="text-text-secondary">Created: </span>
                <span className="text-text-primary">{sku.createdDate}</span>
              </div>
              <div className="text-sm">
                <span className="text-text-secondary">Last Updated: </span>
                <span className="text-text-primary">{sku.lastUpdated}</span>
              </div>
              {sku.assignedVendors.length > 0 && (
                <div>
                  <div className="text-sm text-text-secondary mb-1">Assigned Vendors:</div>
                  <div className="space-y-1">
                    {sku.assignedVendors.slice(0, 3).map((vendor) => (
                      <div
                        key={vendor.id}
                        className="text-sm text-text-primary flex items-center justify-between"
                      >
                        <span>{vendor.name}</span>
                        <span className="text-xs text-text-secondary">
                          {vendor.sustainabilityScore}
                          %
                        </span>
                      </div>
                    ))}
                    {sku.assignedVendors.length > 3 && (
                      <div className="text-xs text-text-secondary">
                        +
                        {sku.assignedVendors.length - 3}
                        {' '}
                        more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SKUMobileCard;
