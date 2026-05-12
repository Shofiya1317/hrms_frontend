/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: string;
  score: number;
}

interface VendorSelectorProps {
  vendors: Vendor[];
  selectedVendors: string[];
  onVendorSelect: (vendorIds: string[]) => void;
  maxSelection?: number;
  onCategoryChange?: (category: string) => void;
  onRatingChange?: (rating: string) => void;
}

const VendorSelector = ({
  vendors,
  selectedVendors,
  onVendorSelect,
  maxSelection = 4,
  onCategoryChange,
  onRatingChange,
}: VendorSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const categories = ['all', ...Array.from(new Set(vendors.map((v) => v.category)))];
  const ratings = ['all', 'A', 'B', 'C', 'D'];

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || vendor.category === categoryFilter;
    const matchesRating = ratingFilter === 'all' || vendor.rating === ratingFilter;
    return matchesSearch && matchesCategory && matchesRating;
  });

  const handleVendorToggle = (vendorId: string) => {
    if (selectedVendors.includes(vendorId)) {
      onVendorSelect(selectedVendors.filter((id) => id !== vendorId));
    } else if (selectedVendors.length < maxSelection) {
      onVendorSelect([...selectedVendors, vendorId]);
    }
  };

  const selectedVendorObjects = vendors.filter((v) => selectedVendors.includes(v.id));

  const getRatingClass = (rating: string) => {
    if (rating === 'A') return 'bg-success/10 text-success';
    if (rating === 'B') return 'bg-primary/10 text-primary';
    if (rating === 'C') return 'bg-warning/10 text-warning';
    return 'bg-error/10 text-error';
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">
          Select Vendors to Compare (
          {selectedVendors.length}
          /
          {maxSelection}
          )
        </h2>
        {selectedVendors.length > 0 && (
          <button
            type="button"
            onClick={() => onVendorSelect([])}
            className="text-sm text-error hover:text-error/80 transition-colors duration-fast"
          >
            Clear All
          </button>
        )}
      </div>

      {selectedVendorObjects.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedVendorObjects.map((vendor) => (
            <div
              key={vendor.id}
              className="flex items-center gap-2 bg-gray-100 text-[#383838] px-3 py-1.5 rounded-md"
            >
              <span className="text-sm font-medium">{vendor.name}</span>
              <button
                type="button"
                onClick={() => handleVendorToggle(vendor.id)}
                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors duration-fast"
                aria-label={`Remove ${vendor.name}`}
              >
                <Icon name="XMarkIcon" size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="relative">
          <Icon
            name="MagnifyingGlassIcon"
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
          />
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm h-[40px]"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            onCategoryChange?.(e.target.value === 'all' ? '' : e.target.value);
          }}
          className="px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>

        <select
          value={ratingFilter}
          onChange={(e) => {
            setRatingFilter(e.target.value);
            onRatingChange?.(e.target.value === 'all' ? '' : e.target.value);
          }}
          className="px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        >
          {ratings.map((rating) => (
            <option key={rating} value={rating}>
              {rating === 'all' ? 'All Ratings' : `Rating ${rating}`}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center justify-between px-4 py-2 bg-[#383838] text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-fast text-sm"
        >
          <span>Add Vendors</span>
          <Icon name={isDropdownOpen ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={20} />
        </button>
      </div>

      {isDropdownOpen && (
        <div className="border border-border rounded-md max-h-64 overflow-y-auto">
          {filteredVendors.length === 0 ? (
            <div className="p-4 text-center text-text-secondary">
              No vendors found matching your criteria
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredVendors.map((vendor) => {
                const isSelected = selectedVendors.includes(vendor.id);
                const isDisabled = !isSelected && selectedVendors.length >= maxSelection;

                return (
                  <button
                    type="button"
                    key={vendor.id}
                    onClick={() => !isDisabled && handleVendorToggle(vendor.id)}
                    disabled={isDisabled}
                    className={`w-full flex items-center justify-between p-4 hover:bg-muted transition-colors duration-fast ${
                      isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                        disabled={isDisabled}
                      />
                      <div className="text-left">
                        <p className="font-medium text-text-primary">{vendor.name}</p>
                        <p className="text-sm text-text-secondary">{vendor.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getRatingClass(vendor.rating)}`}>
                        {vendor.rating}
                      </span>
                      <span className="text-sm text-text-secondary">
                        {vendor.score}
                        %
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VendorSelector;
