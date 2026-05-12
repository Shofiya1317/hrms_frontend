/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ComparisonFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

interface FilterState {
  skuCategory: string;
  dateRange: string;
  questionnaireVersion: string;
}

const ComparisonFilters = ({ onFilterChange }: ComparisonFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    skuCategory: 'all',
    dateRange: 'current',
    questionnaireVersion: 'latest',
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const skuCategories = [
    { value: 'all', label: 'All SKU Categories' },
    { value: 'raw-materials', label: 'Raw Materials' },
    { value: 'packaging', label: 'Packaging' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'textiles', label: 'Textiles' },
  ];

  const dateRanges = [
    { value: 'current', label: 'Current Period' },
    { value: 'last-quarter', label: 'Last Quarter' },
    { value: 'last-year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const questionnaireVersions = [
    { value: 'latest', label: 'Latest Version' },
    { value: 'v2.0', label: 'Version 2.0' },
    { value: 'v1.5', label: 'Version 1.5' },
    { value: 'v1.0', label: 'Version 1.0' },
  ];

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const defaultFilters: FilterState = {
      skuCategory: 'all',
      dateRange: 'current',
      questionnaireVersion: 'latest',
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">Comparison Filters</h2>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors duration-fast"
        >
          <span>
            {isExpanded ? 'Hide' : 'Show'}
            {' '}
            Filters
          </span>
          <Icon name={isExpanded ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={16} />
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                SKU Category
              </label>
              <select
                value={filters.skuCategory}
                onChange={(e) => handleFilterChange('skuCategory', e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                {skuCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                {dateRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Questionnaire Version
              </label>
              <select
                value={filters.questionnaireVersion}
                onChange={(e) => handleFilterChange('questionnaireVersion', e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                {questionnaireVersions.map((version) => (
                  <option key={version.value} value={version.value}>
                    {version.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary border border-border rounded-md hover:bg-muted transition-colors duration-fast"
            >
              <Icon name="ArrowPathIcon" size={16} />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonFilters;
