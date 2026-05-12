/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface BulkActionsBarProps {
  selectedCount: number;
  onBulkAssign: () => void;
  onBulkExport: () => void;
  onBulkDelete?: () => void;
  onClearSelection: () => void;
}

const BulkActionsBar = ({
  selectedCount,
  onBulkAssign,
  onBulkExport,
  onBulkDelete,
  onClearSelection,
}: BulkActionsBarProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated || selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface border border-border rounded-lg shadow-modal px-4 py-3 flex items-center gap-4 z-overlay">
      <div className="flex items-center gap-2">
        <Icon name="CheckCircleIcon" size={20} className="text-primary" />
        <span className="font-medium text-text-primary">
          {selectedCount}
          {' '}
          selected
        </span>
      </div>

      <div className="h-6 w-px bg-border" />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBulkAssign}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-primary hover:bg-muted rounded-md transition-colors duration-fast"
        >
          <Icon name="UserGroupIcon" size={16} />
          <span>Assign Vendors</span>
        </button>

        <button
          type="button"
          onClick={onBulkExport}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-primary hover:bg-muted rounded-md transition-colors duration-fast"
        >
          <Icon name="ArrowDownTrayIcon" size={16} />
          <span>Export</span>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowActions(!showActions)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-primary hover:bg-muted rounded-md transition-colors duration-fast"
          >
            <Icon name="EllipsisHorizontalIcon" size={16} />
            <span>More</span>
          </button>

          {showActions && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowActions(false)}
                aria-hidden="true"
              />
              <div className="absolute bottom-full mb-2 right-0 w-48 bg-popover border border-border rounded-md shadow-modal z-20">
                <button
                  type="button"
                  onClick={() => {
                    onBulkDelete?.();
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10 transition-colors duration-fast"
                >
                  <Icon name="TrashIcon" size={16} className="text-error" />
                  <span>Delete Selected</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="h-6 w-px bg-border" />

      <button
        type="button"
        onClick={onClearSelection}
        className="p-1 hover:bg-muted rounded-md transition-colors duration-fast"
        aria-label="Clear selection"
      >
        <Icon name="XMarkIcon" size={20} className="text-text-secondary" />
      </button>
    </div>
  );
};

export default BulkActionsBar;
