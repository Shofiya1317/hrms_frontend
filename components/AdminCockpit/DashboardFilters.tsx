/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */

// import Icon from '@/components/ui/AppIcon';
import Select from 'react-select';
import CustomStyles from '../CustomStyles/CustomStylesFilters';

interface VendorCategory {
  id: string;
  name: string;
}

type OptionType = {
  value: string;
  label: string;
};

interface DashboardFiltersProps {
  filters: {
    financialYear: string;
    vendorCategory: string;
  };
  onFilterChange: (filters: any) => void;
  vendorCategories?: VendorCategory[];
}

// Generate financial year options dynamically (last 5 years + current)
const generateFinancialYears = () => {
  const years: { value: string; label: string }[] = [];
  const startYear = 2016;
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= startYear; y -= 1) {
    years.push({ value: String(y), label: String(y) });
  }
  return years;
};

const financialYearOptions = generateFinancialYears();

const DashboardFilters = ({
  filters,
  onFilterChange,
  vendorCategories = [],
}: DashboardFiltersProps) => {
  const financialYearValue = financialYearOptions.find(
    (opt) => opt.value === filters.financialYear,
  );

  const vendorCategoryValue = filters.vendorCategory === 'all'
    ? { label: 'All Categories', value: 'all' }
    : vendorCategories
      .map((cat) => ({ label: cat.name, value: cat.id }))
      .find((opt) => opt.value === filters.vendorCategory);

  return (
    <div className="flex flex-wrap gap-4">

      {/* Financial Year */}
      <div className="flex flex-col gap-1 w-[160px]">
        <label className="text-[15px] font-medium text-[#1E1E1E]">
          Financial Year
        </label>
        <Select
          value={financialYearValue}
          onChange={(selected) => onFilterChange({
            ...filters,
            financialYear: (selected as OptionType)?.value,
          })}
          options={financialYearOptions}
          styles={CustomStyles}
        />
      </div>

      {/* Vendor Category */}
      <div className="flex flex-col gap-1 w-[180px]">
        <label className="text-[15px] font-medium text-[#1E1E1E]">
          Vendor Category
        </label>
        <Select
          value={vendorCategoryValue}
          onChange={(selected) => onFilterChange({
            ...filters,
            vendorCategory: (selected as OptionType)?.value,
          })}
          options={[
            { label: 'All Categories', value: 'all' },
            ...vendorCategories.map((cat) => ({
              label: cat.name,
              value: cat.id,
            })),
          ]}
          styles={CustomStyles}
        />
      </div>

    </div>
  );
};

export default DashboardFilters;
