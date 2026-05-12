/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import { useState, useEffect } from 'react';
import { IoSearchSharp } from 'react-icons/io5';
import Select from 'react-select';
import CustomStyles from '../CustomStyles/CustomStylesFilters';

interface SKUFiltersProps {
  categories: { value: string; label: string }[];
  onFilterChange: (filters: FilterState) => void;
  totalResults: number;
}

interface FilterState {
  category: string;
  status: string;
  vendorAssignment: string;
  searchQuery: string;
}

const SKUFilters = ({
  categories,
  onFilterChange,
  totalResults,
}: SKUFiltersProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    status: 'all',
    vendorAssignment: 'all',
    searchQuery: '',
  });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      onFilterChange(filters);
    }
  }, [filters, isHydrated, onFilterChange]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (!isHydrated) {
    return (
      <div className="bg-surface p-4 mb-6">
        <div className="h-10 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="bg-surface py-0 mb-4 ">
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Search SKU */}
        <div className="flex flex-col gap-1">
          <label className="text-[15px] font-medium text-[#1E1E1E]">
            Search SKU’s
          </label>

          <div className="relative w-[218px] h-[40px]">
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              placeholder="Search by name or code"
              className="w-full h-full border border-[#E4E7EC] rounded-lg pl-4 pr-10 py-[9px] text-[14px] text-[#64656D] font-normal outline-none"
            />

            <IoSearchSharp
              size={20}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64656D] pointer-events-none"
            />
          </div>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1 w-[150px]">
          <label className="text-[15px] font-medium text-[#1E1E1E]">
            Category
          </label>
          <Select
            value={{
              value: filters.category,
              label:
                filters.category === 'all'
                  ? 'All Categories'
                  : categories.find((c) => c.value === filters.category)?.label || filters.category,
            }}
            onChange={(selected) => handleFilterChange('category', selected?.value || 'all')}
            options={[{ value: 'all', label: 'All Categories' }, ...categories]}
            styles={CustomStyles}
          />
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1 w-[150px]">
          <label className="text-[15px] font-medium text-[#1E1E1E]">
            Status
          </label>
          <Select
            value={{
              value: filters.status,
              label:
                filters.status === 'all'
                  ? 'All Status'
                  : filters.status.charAt(0).toUpperCase() + filters.status.slice(1),
            }}
            onChange={(selected) => handleFilterChange('status', selected?.value || 'all')}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'pending', label: 'Pending' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            styles={CustomStyles}
          />
        </div>

        {/* Vendor Assignment */}
        <div className="flex flex-col gap-1 w-[150px]">
          <label className="text-[15px] font-medium text-[#1E1E1E]">
            Vendor
          </label>
          <Select
            value={{
              value: filters.vendorAssignment,
              label:
                filters.vendorAssignment === 'all'
                  ? 'All Vendors'
                  : filters.vendorAssignment.charAt(0).toUpperCase()
                    + filters.vendorAssignment.slice(1),
            }}
            onChange={(selected) => handleFilterChange('vendorAssignment', selected?.value || 'all')}
            options={[
              { value: 'all', label: 'All Vendors' },
              { value: 'assigned', label: 'Assigned' },
              { value: 'unassigned', label: 'Unassigned' },
            ]}
            styles={CustomStyles}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="text-[13px] text-[#667085]">
          Showing
          {' '}
          <span className="font-medium text-[#1E1E1E]">{totalResults}</span>
          {' '}
          results
        </div>
      </div>
    </div>
  );
};

export default SKUFilters;
