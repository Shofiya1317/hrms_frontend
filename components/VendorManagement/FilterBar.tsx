/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import { useState, useEffect } from 'react';
import { IoSearchSharp } from 'react-icons/io5';
import Select from 'react-select';
import CustomStyles from '../CustomStyles/CustomStylesFilters';

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void;
  resultsCount: number;
  categories: { value: string; label: string }[];
}

export interface FilterState {
  search: string;
  category: string;
  rating: string;
  status: string;
}

const categoryAllOption = { value: 'all', label: 'All Categories' };

const ratingOptions = [
  { value: 'all', label: 'All Ratings' },
  { value: 'A', label: 'A (90–100%)' },
  { value: 'B', label: 'B (75–89%)' },
  { value: 'C', label: 'C (60–74%)' },
  { value: 'D', label: 'D (<60%)' },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'inactive', label: 'Inactive' },
];

const INITIAL_FILTERS: FilterState = {
  search: '',
  category: 'all',
  rating: 'all',
  status: 'all',
};

const FilterBar = ({ onFilterChange, resultsCount, categories }: FilterBarProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

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

  const categoryOptions = [categoryAllOption, ...categories];

  if (!isHydrated) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1 min-w-[200px]">
              <div className="h-10 bg-muted rounded-md animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface p-0 mb-1">
      <div className="flex flex-wrap gap-4 mb-2">

        {/* Search */}
        <div className="flex flex-col gap-1">
          <label className="text-[15px] font-medium text-[#1E1E1E]">
            Search Vendor
          </label>
          <div className="relative w-[218px] h-[40px]">
            <input
              type="text"
              placeholder="Search by name"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full h-full border border-[#E4E7EC] rounded-lg pl-4 pr-10 py-[9px] text-[14px] text-[#64656D] font-normal outline-none"
            />
            <IoSearchSharp
              size={20}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64656D] pointer-events-none"
            />
          </div>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1">
          <label className="text-[15px] font-medium text-[#1E1E1E]">Category</label>
          <Select
            value={categoryOptions.find((c) => c.value === filters.category) || categoryAllOption}
            onChange={(s) => handleFilterChange('category', s?.value || 'all')}
            options={categoryOptions}
            styles={CustomStyles}
          />
        </div>

        {/* Rating */}
        <div className="flex flex-col gap-1">
          <label className="text-[15px] font-medium text-[#1E1E1E]">Rating Band</label>
          <Select
            value={ratingOptions.find((r) => r.value === filters.rating) || ratingOptions[0]}
            onChange={(s) => handleFilterChange('rating', s?.value || 'all')}
            options={ratingOptions}
            styles={CustomStyles}
          />
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1">
          <label className="text-[15px] font-medium text-[#1E1E1E]">Invitation Status</label>
          <Select
            value={statusOptions.find((s) => s.value === filters.status) || statusOptions[0]}
            onChange={(s) => handleFilterChange('status', s?.value || 'all')}
            options={statusOptions}
            styles={CustomStyles}
          />
        </div>

      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-[13px] text-[#667085]">
          Showing
          {' '}
          <span className="font-medium text-[#1E1E1E]">{resultsCount}</span>
          {' '}
          vendors
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
