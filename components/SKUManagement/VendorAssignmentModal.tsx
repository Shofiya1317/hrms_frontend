/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Vendor {
  id: string;
  name: string;
  category: string;
  sustainabilityScore: number;
}

interface VendorAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vendorIds: string[]) => void;
  vendors: Vendor[];
  currentAssignments: string[];
  skuName: string;
}

const VendorAssignmentModal = ({
  isOpen,
  onClose,
  onSave,
  vendors,
  currentAssignments,
  skuName,
}: VendorAssignmentModalProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState<string[]>(currentAssignments);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    setSelectedVendors(currentAssignments);
  }, [currentAssignments, isOpen]);

  const handleToggle = (vendorId: string) => {
    setSelectedVendors((prev) => (prev.includes(vendorId)
      ? prev.filter((id) => id !== vendorId)
      : [...prev, vendorId]));
  };

  const handleSave = () => {
    onSave(selectedVendors);
    onClose();
  };

  const filteredVendors = vendors.filter(
    (vendor) => vendor.name.toLowerCase().includes(searchQuery.toLowerCase())
      || vendor.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (!isHydrated || !isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-surface rounded-lg shadow-modal z-overlay max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              Assign Vendors
            </h2>
            <p className="text-sm text-text-secondary mt-1">{skuName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-md transition-colors duration-fast"
            aria-label="Close modal"
          >
            <Icon name="XMarkIcon" size={24} className="text-text-secondary" />
          </button>
        </div>

        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          <div className="relative">
            <Icon
              name="MagnifyingGlassIcon"
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendors..."
              className="w-full pl-10 pr-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            {filteredVendors.map((vendor) => (
              <label
                key={vendor.id}
                className="flex items-center gap-3 p-3 border border-border rounded-md hover:bg-muted cursor-pointer transition-colors duration-fast"
              >
                <input
                  type="checkbox"
                  checked={selectedVendors.includes(vendor.id)}
                  onChange={() => handleToggle(vendor.id)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/20"
                />
                <div className="flex-1">
                  <div className="font-medium text-text-primary">
                    {vendor.name}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {vendor.category}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-text-primary">
                    Score:
                    {' '}
                    {vendor.sustainabilityScore}
                    %
                  </div>
                </div>
              </label>
            ))}
          </div>

          {filteredVendors.length === 0 && (
            <div className="text-center py-8 text-text-secondary">
              <Icon
                name="MagnifyingGlassIcon"
                size={48}
                className="mx-auto mb-2 opacity-50"
              />
              <p>No vendors found</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <div className="text-sm text-text-secondary">
            {selectedVendors.length}
            {' '}
            vendor(s) selected
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-md text-text-primary hover:bg-muted transition-colors duration-fast"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-fast"
            >
              Save Assignments
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VendorAssignmentModal;
