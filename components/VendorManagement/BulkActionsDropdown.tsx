/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface BulkActionsDropdownProps {
  selectedCount: number;
  onSendInvitations: () => void;
  onExportData: () => void;
  onClearSelection: () => void;
}

const BulkActionsDropdown = ({
  selectedCount,
  onSendInvitations,
  onExportData,
  onClearSelection,
}: BulkActionsDropdownProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!isHydrated) {
    return (
      <div className="h-10 w-40 bg-muted rounded-md animate-pulse" />
    );
  }

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors duration-fast"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>
          Bulk Actions (
          {selectedCount}
          )
        </span>
        <Icon name="ChevronDownIcon" size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-md shadow-modal z-dropdown">
          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                onSendInvitations();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-muted transition-colors duration-fast"
            >
              <Icon name="PaperAirplaneIcon" size={16} className="text-text-secondary" />
              <span>Send Invitations</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onExportData();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-muted transition-colors duration-fast"
            >
              <Icon name="ArrowDownTrayIcon" size={16} className="text-text-secondary" />
              <span>Export Selected</span>
            </button>
            <div className="border-t border-border my-1" />
            <button
              type="button"
              onClick={() => {
                onClearSelection();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10 transition-colors duration-fast"
            >
              <Icon name="XMarkIcon" size={16} className="text-error" />
              <span>Clear Selection</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkActionsDropdown;
