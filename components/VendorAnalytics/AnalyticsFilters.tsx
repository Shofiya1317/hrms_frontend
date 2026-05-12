/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import Select from 'react-select';
import CustomStyles from '../CustomStyles/CustomStylesFilters';

type OptionType = {
  value: string;
  label: string;
};

interface AnalyticsFilters {
  vendors: OptionType | null;
  dateRange: OptionType | null;
  standards: OptionType | null;
  categories: OptionType | null;
}

interface AnalyticsFiltersProps {
  filters: AnalyticsFilters;
  onFilterChange: (filters: AnalyticsFilters) => void;
  categoryOptions: OptionType[];
  // vendorOptions: OptionType[];
  standardOptions: OptionType[];
}

const AnalyticsFilters = ({
  filters,
  onFilterChange,
  categoryOptions,
  // vendorOptions,
  standardOptions,
}: AnalyticsFiltersProps) => {
  const getYearOptions = () => {
    const startYear = 2016;
    const currentYear = new Date().getFullYear();

    const years = [];

    for (let year = currentYear; year >= startYear; year -= 1) {
      years.push({
        value: String(year),
        label: String(year),
      });
    }

    return years;
  };

  const dateOptions = getYearOptions();

  return (
    <div className="flex flex-wrap gap-3">
      {/* Date Range */}
      <div className="flex flex-col gap-1 w-[130px]">
        <label className="text-[15px] font-medium text-[#1E1E1E]">
          Time Period
        </label>
        <Select
          value={filters.dateRange}
          onChange={(selected) => onFilterChange({
            ...filters,
            dateRange: selected as OptionType,
          })}
          options={dateOptions}
          styles={CustomStyles}
        />
      </div>

      {/* Vendors */}
      {/* <div className="flex flex-col gap-1 w-[200px]">
        <label className="text-[15px] font-medium text-[#1E1E1E]">
          Vendors
        </label>
        <Select
          value={filters.vendors}
          onChange={(selected) => onFilterChange({
            ...filters,
            vendors: selected as OptionType,
          })}
          options={vendorOptions}
          styles={CustomStyles}
        />
      </div> */}

      {/* Categories */}
      <div className="flex flex-col gap-1 w-[200px]">
        <label className="text-[15px] font-medium text-[#1E1E1E]">
          Categories
        </label>
        <Select
          value={filters.categories}
          onChange={(selected) => onFilterChange({
            ...filters,
            categories: selected as OptionType,
          })}
          options={categoryOptions}
          styles={CustomStyles}
        />
      </div>

      {/* Regions */}
      {/* <div className="flex flex-col gap-1">
        <label className="text-[15px] font-medium text-[#1E1E1E]">
          Regions
        </label>
        <Select
          isMulti
          value={
            regionOptions.filter((r) => filters.regions.includes(r.value))
              .length
              ? regionOptions.filter((r) => filters.regions.includes(r.value))
              : [regionOptions[0]]
          }
          onChange={(selected) =>
            onFilterChange({
              ...filters,
              regions: selected ? selected.map((s) => s.value) : [],
            })
          }
          options={regionOptions}
          styles={CustomStyles}
        />
      </div> */}

      {/* Metrics */}
      <div className="flex flex-col gap-1 w-[200px]">
        <label className="text-[15px] font-medium text-[#1E1E1E]">
          Standards
        </label>
        <Select
          value={filters.standards}
          onChange={(selected) => onFilterChange({
            ...filters,
            standards: selected as OptionType,
          })}
          options={standardOptions}
          styles={CustomStyles}
        />
      </div>
    </div>
  );
};

export default AnalyticsFilters;
