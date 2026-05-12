/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
}: DeleteConfirmationModalProps) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  if (!isHydrated || !isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface rounded-lg shadow-modal z-overlay p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-error/10 rounded-full flex items-center justify-center">
            <Icon name="ExclamationTriangleIcon" size={24} className="text-error" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-text-primary mb-2">Confirm Deletion</h2>
            <p className="text-sm text-text-secondary mb-4">
              Are you sure you want to delete
              {' '}
              <strong>{itemName}</strong>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-border rounded-md text-text-primary hover:bg-muted transition-colors duration-fast"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-error text-error-foreground rounded-md hover:bg-error/90 transition-colors duration-fast"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteConfirmationModal;
