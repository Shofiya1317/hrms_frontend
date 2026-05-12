/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/button-has-type */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable-next-line react-hooks/exhaustive-deps */
/* eslint-disable no-nested-ternary */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';
// import { LuFileDown } from 'react-icons/lu';
import { VendorService, TaskService } from '@/lib/service';
import {
  VendorPortfolioOverviewResponse,
  PerformanceCategoryResponse,
} from '@/lib/interface/IVendor.interface';
import AnalyticsFilters from './AnalyticsFilters';
import VendorPortfolioOverview from './VendorPortfolioOverview';
import PerformanceByQuestion from './PerformanceByQuestion';
import VendorRatings from './VendorRatings';
import MetricsDashboard from './MetricsDashboard';

type OptionType = {
  value: string;
  label: string;
};

interface AnalyticsFilter {
  vendors: OptionType | null;
  dateRange: OptionType | null;
  standards: OptionType | null;
  categories: OptionType | null;
}

type VendorPortfolioFilters = {
  years?: string[];
  vendors?: string[];
  vendorCategories?: string[];
  tenantStandards?: string[];
};

type TabType = 'portfolio' | 'questions' | 'ratings' | 'metrics';

const VendorAnalyticsDashboardInteractive = ({
  apiKey,
  token,
}: {
  apiKey: string;
  token: string;
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('portfolio');

  // const [isExporting, setIsExporting] = useState(false);

  const [categoryOptions, setCategoryOptions] = useState<
    { value: string; label: string }[]
  >([]);

  // const [vendorOptions, setVendorOptions] = useState<
  //   { value: string; label: string }[]
  // >([]);

  const [standardOptions, setStandardOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const [portfolioData, setPortfolioData] = useState<VendorPortfolioOverviewResponse | null>(null);

  const [performanceData, setPerformanceData] = useState<PerformanceCategoryResponse | null>(null);

  const ALL_VENDORS = { value: 'all', label: 'All Vendors' };
  const ALL_CATEGORIES = { value: 'all', label: 'All Categories' };

  const getCurrentYearOption = (): OptionType => {
    const year = new Date().getFullYear().toString();
    return { value: year, label: year };
  };

  const [filters, setFilters] = useState<AnalyticsFilter>({
    dateRange: getCurrentYearOption(),
    vendors: ALL_VENDORS,
    standards: null,
    categories: ALL_CATEGORIES,
  });

  const fetchCategories = useCallback(async () => {
    try {
      const res = await VendorService.getVendorCategories(apiKey, token);
      const vendors = res?.data?.vendor_categories ?? [];

      const options = [
        { value: 'all', label: 'All Categories' },
        ...vendors
          .filter((c: any) => !c?.is_deleted)
          .map((c: any) => ({
            value: c.id,
            label: c.name,
          })),
      ];

      setCategoryOptions(options);
    } catch (error) {
      console.error('Failed to fetch categories', error);
      setCategoryOptions([]);
    }
  }, [apiKey, token]);

  // const fetchVendors = useCallback(async () => {
  //   try {
  //     const res = await VendorService.getVendors(undefined, apiKey, token);
  //     const categories = res?.data?.vendors ?? [];

  //     const options = [
  //       { value: 'all', label: 'All Vendors' },
  //       ...categories
  //         .filter((c: any) => !c?.is_deleted)
  //         .map((c: any) => ({
  //           value: c.id,
  //           label: c.company_name,
  //         })),
  //     ];

  //     setVendorOptions(options);
  //   } catch (error) {
  //     console.error('Failed to fetch vendors', error);
  //     setVendorOptions([]);
  //   }
  // }, [apiKey, token]);

  const fetchStandards = useCallback(async () => {
    try {
      const res = await TaskService.getTenantStandards(apiKey, token);
      const standards = res?.data ?? [];

      const options = standards
        .filter((s: any) => !s.is_deleted && s.is_active)
        .map((s: any) => ({
          value: s.id,
          label: s.name,
        }));

      setStandardOptions(options);

      if (options.length > 0) {
        setFilters((prev) => ({
          ...prev,
          standards: options[0],
        }));
      }
    } catch (error) {
      console.error('Failed to fetch standards', error);
      setStandardOptions([]);
    }
  }, [apiKey, token]);

  const buildVendorFilters = (
    filter: AnalyticsFilter,
    opts?: { includeVendors?: boolean },
  ): VendorPortfolioFilters => {
    const { includeVendors = true } = opts || {};

    const apiFilters: VendorPortfolioFilters = {
      years: filter.dateRange?.value ? [filter.dateRange.value] : undefined,

      // ✅ only include when API supports it
      ...(includeVendors && {
        vendors:
          filter.vendors?.value === 'all'
            ? undefined
            : filter.vendors?.value
              ? [filter.vendors.value]
              : undefined,
      }),

      vendorCategories:
        filter.categories?.value === 'all'
          ? undefined
          : filter.categories?.value
            ? [filter.categories.value]
            : undefined,

      tenantStandards: filter.standards?.value
        ? [filter.standards.value]
        : undefined,
    };

    return Object.fromEntries(
      Object.entries(apiFilters).filter(([, v]) => v !== undefined),
    );
  };

  const fetchVendorPortfolio = useCallback(async () => {
    try {
      const cleanedFilters = buildVendorFilters(filters, {
        includeVendors: false, // ⭐ important
      });

      const res = await TaskService.getVendorPortfolio(
        apiKey,
        token,
        cleanedFilters,
      );

      setPortfolioData(res?.data ?? res);
    } catch {
      setPortfolioData(null);
    }
  }, [apiKey, token, filters]);

  const fetchVendorPerformance = useCallback(async () => {
    try {
      const cleanedFilters = buildVendorFilters(filters, {
        includeVendors: true,
      });

      const res = await TaskService.getVendorPerformance(
        apiKey,
        token,
        cleanedFilters,
      );

      setPerformanceData(res?.data ?? res);
    } catch {
      setPerformanceData(null);
    }
  }, [apiKey, token, filters]);

  useEffect(() => {
    fetchCategories();
    // fetchVendors();
    fetchStandards();
  }, [
    fetchCategories,
    // fetchVendors,
    fetchStandards]);

  useEffect(() => {
    if (!filters.standards) return; // ⭐ VERY IMPORTANT

    fetchVendorPortfolio();
    fetchVendorPerformance();
  }, [filters, fetchVendorPortfolio, fetchVendorPerformance]);

  const tabs = [
    {
      id: 'portfolio' as TabType,
      label: 'Vendor Portfolio',
      icon: 'ChartPieIcon',
    },
    {
      id: 'questions' as TabType,
      label: 'Performance by Category',
      icon: 'QuestionMarkCircleIcon',
    },
    { id: 'ratings' as TabType, label: 'Vendor Ratings', icon: 'StarIcon' },
    {
      id: 'metrics' as TabType,
      label: 'Metrics Dashboard',
      icon: 'PresentationChartLineIcon',
    },
  ];

  // const handleExport = async () => {
  //   setIsExporting(true);

  //   await new Promise((resolve) => {
  //     setTimeout(resolve, 1500);
  //   });

  //   const exportData = {
  //     generatedAt: new Date().toISOString(),
  //     filters,
  //     tab: activeTab,
  //     reportType: 'vendor-analytics',
  //   };

  //   const blob = new Blob([JSON.stringify(exportData, null, 2)], {
  //     type: 'application/json',
  //   });
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement('a');
  //   link.href = url;
  //   link.download = `vendor-analytics-${activeTab}-${new Date().toISOString()
  // .split('T')[0]}.json`;
  //   link.click();

  //   setIsExporting(false);
  // };

  return (
    <div className="space-y-0 p-3">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-1">
          Vendor Analytics Dashboard
        </h1>
        <p className="text-text-secondary text-sm">
          Comprehensive performance insights and trend analysis across
          emissions, social, governance, and legal metrics.
        </p>
      </div>
      {/* Filters Section */}
      <div className="flex items-center justify-between bg-surface rounded-lg shadow-card py-3">
        <AnalyticsFilters
          filters={filters}
          onFilterChange={setFilters}
          categoryOptions={categoryOptions}
          // vendorOptions={vendorOptions}
          standardOptions={standardOptions}
        />
        {/* <div className="mt-5">
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-2 py-2 bg-[#383838]
            text-white text-[14px] rounded-lg hover:bg-primary/90 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LuFileDown color="#FBA900" size={20} />
            <img src="/assets/file-export.png" width={20} height={20} />
            Export Report
          </button>
        </div> */}
      </div>

      {/* Tab Navigation */}
      <div className="bg-surface rounded-lg ">
        <div className="border-b border-border">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-accent text-accent bg-primary/5'
                      : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-muted'
                  }
                `}
              >
                <Icon name={tab.icon} size={20} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'portfolio' && (
            <VendorPortfolioOverview portfolioData={portfolioData} />
          )}

          {activeTab === 'questions' && (
            <PerformanceByQuestion performanceData={performanceData} />
          )}

          {activeTab === 'ratings' && (
            <VendorRatings apiKey={apiKey} token={token} />
          )}

          {activeTab === 'metrics' && (
            <MetricsDashboard apiKey={apiKey} token={token} filters={filters} />
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorAnalyticsDashboardInteractive;
