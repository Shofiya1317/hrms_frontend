/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable-next-line react-hooks/exhaustive-deps */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';
// import { LuFileDown } from 'react-icons/lu';
import { SKUService, TaskService } from '@/lib/service';
import {
  SKUPortfolioResponse,
  SKUPerformanceResponse,
  VendorListItem,
} from '@/lib/interface/IProduct.interface';
import AnalyticsFilters from './AnalyticsFilters';
import PortfolioOverview from './PortfolioOverview';
import CategoryPerformance from './CategoryPerformance';
import VendorContribution from './VendorContribution';
import TrendAnalysis from './TrendAnalysis';

type OptionType = {
  value: string;
  label: string;
};

interface AnalyticsFilter {
  dateRange: OptionType | null;
  standards: OptionType | null;
  categories: OptionType | null;
}

type TabType = 'portfolio' | 'category' | 'vendor-contribution' | 'trends';

const SKUAnalyticsDashboardInteractive = ({
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

  const [standardOptions, setStandardOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const [portfolioData, setPortfolioData] = useState<SKUPortfolioResponse | null>(null);

  const [performanceData, setPerformanceData] = useState<SKUPerformanceResponse | null>(null);

  const [vendorContributionData, setVendorContributionData] = useState<
    VendorListItem[] | null
  >(null);
  const [trendAnalysisData, setTrendAnalysisData] = useState<any>(null);

  const ALL_CATEGORIES = { value: 'all', label: 'All Categories' };

  const getCurrentYearOption = (): OptionType => {
    const year = new Date().getFullYear().toString();
    return { value: year, label: year };
  };

  const [filters, setFilters] = useState<AnalyticsFilter>({
    dateRange: getCurrentYearOption(),
    standards: null,
    categories: ALL_CATEGORIES,
  });

  // console.log(filters, '---filters---');

  const fetchCategories = useCallback(async () => {
    try {
      const res = await SKUService.getProductCategories(apiKey, token);
      const categories = res?.data?.categories ?? [];

      const options = [
        { value: 'all', label: 'All Categories' },
        ...categories
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

  const fetchPortfolio = useCallback(async () => {
    try {
      const standardId = filters?.standards?.value || undefined;

      const categoryId = filters?.categories?.value && filters.categories.value !== 'all'
        ? filters.categories.value
        : undefined;

      const financialYear = filters?.dateRange?.value || undefined;

      const res = await TaskService.getSKUPortfolio(
        apiKey,
        token,
        standardId,
        categoryId,
        financialYear,
      );

      if (res?.data?.success) {
        setPortfolioData(res.data.data);
      }
    } catch (error) {
      console.error('SKU portfolio error:', error);
    }
  }, [apiKey, token, filters]);

  const fetchPerformance = useCallback(async () => {
    try {
      const standardId = filters?.standards?.value || undefined;

      const categoryId = filters?.categories?.value && filters.categories.value !== 'all'
        ? filters.categories.value
        : undefined;

      const financialYear = filters?.dateRange?.value || undefined;

      const res = await TaskService.getSKUPerformance(
        apiKey,
        token,
        standardId,
        categoryId,
        financialYear,
      );

      if (res?.data?.success) {
        setPerformanceData(res.data.data);
      }
    } catch (error) {
      console.error('SKU performance error:', error);
    }
  }, [apiKey, token, filters]);

  const fetchVendorContribution = useCallback(async () => {
    try {
      const standardId = filters?.standards?.value || undefined;

      const categoryId = filters?.categories?.value && filters.categories.value !== 'all'
        ? filters.categories.value
        : undefined;

      const financialYear = filters?.dateRange?.value || undefined;

      const res = await TaskService.getVendorContribution(
        apiKey,
        token,
        standardId,
        categoryId,
        financialYear,
      );

      if (res?.data?.success) {
        setVendorContributionData(res.data.data.vendor_list);
      }
    } catch (error) {
      console.error('SKU vendor contribution error:', error);
    }
  }, [apiKey, token, filters]);

  const fetchTrendAnalysis = useCallback(async () => {
    try {
      const standardId = filters?.standards?.value || undefined;

      const categoryId = filters?.categories?.value && filters.categories.value !== 'all'
        ? filters.categories.value
        : undefined;

      const financialYear = filters?.dateRange?.value || undefined;

      const res = await TaskService.getSKUTrendAnalysis(
        apiKey,
        token,
        standardId,
        categoryId,
        financialYear,
      );

      if (res?.data?.success) {
        setTrendAnalysisData(res.data.data);
      }
    } catch (error) {
      console.error('SKU trend analysis error:', error);
    }
  }, [apiKey, token, filters]);

  useEffect(() => {
    fetchCategories();
    fetchStandards();
  }, [fetchCategories, fetchStandards]);

  useEffect(() => {
    if (!filters.standards) return;
    fetchPortfolio();
    fetchPerformance();
    fetchVendorContribution();
    fetchTrendAnalysis();
  }, [
    filters,
    fetchPortfolio,
    fetchPerformance,
    fetchVendorContribution,
    fetchTrendAnalysis,
  ]);

  const tabs = [
    {
      id: 'portfolio' as TabType,
      label: 'Portfolio Overview',
      icon: 'ChartPieIcon',
    },
    {
      id: 'category' as TabType,
      label: 'Category Performance',
      icon: 'SquaresIcon',
    },
    {
      id: 'vendor-contribution' as TabType,
      label: 'Vendor Contribution',
      icon: 'BuildingOfficeIcon',
    },
    { id: 'trends' as TabType, label: 'Trend Analysis', icon: 'ChartBarIcon' },
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
  //     reportType: 'sku-analytics',
  //   };

  //   const blob = new Blob([JSON.stringify(exportData, null, 2)], {
  //     type: 'application/json',
  //   });
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement('a');
  //   link.href = url;
  //   link.download = `sku-analytics-${activeTab}-${new Date().toISOString().split('T')[0]}.json`;
  //   link.click();

  //   setIsExporting(false);
  // };

  return (
    <div className="space-y-0 p-3">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-text-primary mb-1">
          SKU Analytics Dashboard
        </h1>
        <p className="text-text-secondary text-sm">
          Comprehensive product portfolio insights and sustainability
          performance analysis across all SKUs.
        </p>
      </div>

      {/* Filters Section */}
      <div className="flex items-center justify-between py-3">
        <AnalyticsFilters
          filters={filters}
          onFilterChange={setFilters}
          categoryOptions={categoryOptions}
          standardOptions={standardOptions}
        />
        {/* <button
          type="button"
          // onClick={handleExport}
          disabled
          className="mt-5 flex items-center gap-2 px-2 py-2 bg-[#383838]
          text-white text-[14px] rounded-lg hover:bg-primary/90 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LuFileDown color="#FBA900" size={20} />
          Export Report
        </button> */}
      </div>

      {/* Tab Navigation */}
      <div className="bg-surface rounded-lg">
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
                      ? 'border-[#FBA900] text-[#FBA900]'
                      : 'border-transparent text-text-secondary hover:text-[#FBA900]'
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
            <PortfolioOverview portfolioData={portfolioData} />
          )}

          {activeTab === 'category' && (
            <CategoryPerformance performanceData={performanceData} />
          )}

          {activeTab === 'vendor-contribution' && (
            <VendorContribution vendorData={vendorContributionData} />
          )}

          {activeTab === 'trends' && (
            <TrendAnalysis trendData={trendAnalysisData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SKUAnalyticsDashboardInteractive;
