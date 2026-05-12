/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import Select from 'react-select';
import CustomStyles from '../CustomStyles/CustomStylesFilters';

type OptionType = {
  value: string;
  label: string;
};

interface AnalyticsFilters {
  dateRange: OptionType | null;
  standards: OptionType | null;
  categories: OptionType | null;
}

interface AnalyticsFiltersProps {
  filters: AnalyticsFilters;
  onFilterChange: (filters: AnalyticsFilters) => void;
  categoryOptions: OptionType[];
  standardOptions: OptionType[];
}

const AnalyticsFilters = ({
  filters,
  onFilterChange,
  categoryOptions,
  standardOptions,
}: AnalyticsFiltersProps) => {
  const getYearOptions = () => {
    const startYear = 2016;
    const currentYear = new Date().getFullYear();

    const years: { value: string; label: string }[] = [];

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
      {/* Time Period */}
      <div className="flex flex-col gap-1 w-[130px]">
        <label className="text-[15px] font-medium text-[#1E1E1E]">
          Financial Year
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

      {/* Performance Level */}
      {/* <div className="flex flex-col gap-1 w-[200px]">
        <label className="text-[15px] font-medium text-[#1E1E1E]">
          Performance Level
        </label>
        <Select
          value={performanceOptions.find(
            (d) => d.value === filters.performanceThreshold,
          )}
          onChange={(selected: any) => onFilterChange({
            ...filters,
            performanceThreshold: selected?.value,
          })}
          options={performanceOptions}
          styles={getCustomStyles(false)}
        />
      </div> */}

      {/* Product Categories */}
      <div className="flex flex-col gap-1 w-[200px]">
        <label className="text-[15px] font-medium text-[#1E1E1E]">
          Product Categories
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

      {/* Vendor Assignment */}
      {/* <div className="flex flex-col gap-1 w-[200px]">
        <label className="text-[15px] font-medium text-[#1E1E1E]">
          Vendor Assignment
        </label>
        <Select
          isMulti
          value={vendorOptions.filter((opt) => filters.vendors.includes(opt.value))}
          onChange={(selected: any) => onFilterChange({
            ...filters,
            vendors: selected ? selected.map((s: any) => s.value) : [],
          })}
          options={vendorOptions}
          styles={getCustomStyles(true)}
        />
      </div> */}

      {/* Sustainability Metrics */}
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
