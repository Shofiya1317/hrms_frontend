/* eslint-disable max-len */
/* eslint-disable no-nested-ternary */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
// import Icon from '@/components/ui/AppIcon';
import dynamic from 'next/dynamic';
import { getCockpitOverview } from '@/lib/service/task';
import { getVendorCategories } from '@/lib/service/vendor';
import MetricCard from './MetricCard';
import CategoryBreakdownChart from './CategoryBreakdownChart';
import VendorLeaderboard from './VendorLeaderboard';
import AlertsPanel from './AlertsPanel';
import DashboardFilters from './DashboardFilters';

const PerformanceCharts = dynamic(() => import('./PerformanceChart'), {
  ssr: false,
});

const EmissionsCharts = dynamic(() => import('./EmissionsChart'), {
  ssr: false,
});

// ─── API response shape ───────────────────────────────────────────────────────

interface CockpitOverviewResponse {
  totalVendors: number;
  vendorChange: number;
  totalSKUs: number;
  skuChange: number;
  avgSustainabilityScore: number;
  scoreChange: number;
  totalEmissions: number;
  emissionsReduction: number;
  currentEmissions: number;
  emissionsChange: number;
  complianceRate: number;
  complianceChange: number;
  performanceTrend: Array<{ year: string; score: number }>;
  emissionsTrend: Array<{ year: string; emissions: number }>;
  categoryBreakdown: Array<{ category: string; score: number; count: number }>;
  topPerformers: Array<{
    id: string;
    name: string;
    score: number;
    rating: string;
    trend: 'up' | 'down' | 'stable';
    category: string;
  }>;
  bottomPerformers: Array<{
    id: string;
    name: string;
    score: number;
    rating: string;
    trend: 'up' | 'down' | 'stable';
    category: string;
  }>;
  alerts: Array<{
    id: string;
    type: 'critical' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: string;
    vendorName?: string;
  }>;
}

// ─── Internal dashboard shape (what child components consume) ─────────────────

interface DashboardData {
  totalVendors: number;
  vendorChange: number;
  totalSKUs: number;
  skuChange: number;
  avgSustainabilityScore: number;
  scoreChange: number;
  totalEmissions: number;
  emissionsReduction: number;
  currentEmissions: number;
  emissionsChange: number;
  complianceRate: number;
  complianceChange: number;
  /** PerformanceChart expects { month, score } – we reuse `year` as the label */
  performanceTrend: Array<{ month: string; score: number }>;
  /** EmissionsChart expects { month, emissions } */
  emissionsTrend: Array<{ month: string; emissions: number }>;
  categoryBreakdown: Array<{ category: string; score: number; count: number }>;
  topPerformers: Array<{
    id: string;
    name: string;
    score: number;
    rating: string;
    trend: 'up' | 'down' | 'stable';
    category: string;
  }>;
  bottomPerformers: Array<{
    id: string;
    name: string;
    score: number;
    rating: string;
    trend: 'up' | 'down' | 'stable';
    category: string;
  }>;
  alerts: Array<{
    id: string;
    type: 'critical' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: string;
    vendorName?: string;
  }>;
}

interface FilterState {
  financialYear: string;
  vendorCategory: string;
  rating: string;
}

/** Map the raw API response to DashboardData that the child components consume */
const mapApiResponse = (raw: CockpitOverviewResponse): DashboardData => ({
  totalVendors: raw.totalVendors ?? 0,
  vendorChange: raw.vendorChange ?? 0,
  totalSKUs: raw.totalSKUs ?? 0,
  skuChange: raw.skuChange ?? 0,
  avgSustainabilityScore: raw.avgSustainabilityScore ?? 0,
  scoreChange: raw.scoreChange ?? 0,
  totalEmissions: raw.totalEmissions ?? 0,
  emissionsReduction: raw.emissionsReduction ?? 0,
  currentEmissions: raw.currentEmissions ?? 0,
  emissionsChange: raw.emissionsChange ?? 0,
  complianceRate: raw.complianceRate ?? 0,
  complianceChange: raw.complianceChange ?? 0,
  performanceTrend: (raw.performanceTrend ?? []).map((p) => ({
    month: p.year,
    score: p.score,
  })),
  emissionsTrend: (raw.emissionsTrend ?? []).map((e) => ({
    month: e.year,
    emissions: e.emissions,
  })),
  categoryBreakdown: raw.categoryBreakdown ?? [],
  topPerformers: raw.topPerformers ?? [],
  bottomPerformers: raw.bottomPerformers ?? [],
  alerts: raw.alerts ?? [],
});

const DashboardOverviewInteractive = () => {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    financialYear: (new Date().getFullYear()).toString(),
    vendorCategory: 'all',
    rating: 'all',
  });
  const [isLoading, setIsLoading] = useState(false);
  // const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vendorCategories, setVendorCategories] = useState<{ id: string; name: string }[]>([]);

  // Fetch vendor category list once for the filter dropdown
  useEffect(() => {
    if (!session?.user) return;
    const user = session.user as { apiKey?: string; accessToken?: string };
    const tenantId = user?.apiKey ?? '';
    const token = user?.accessToken;
    getVendorCategories(tenantId, token)
      .then((res) => {
        const body = res?.data as { vendor_categories?: { id: string; name: string }[] };
        setVendorCategories(body?.vendor_categories ?? []);
      })
      .catch(() => { });
  }, [session]);

  const fetchDashboardData = async () => {
    if (!session?.user) return;

    // Only show full-page spinner on first load (no cached data yet)
    if (!dashboardData) setIsLoading(true);
    setError(null);

    try {
      const user = session.user as {
        apiKey?: string;
        accessToken?: string;
      };
      const tenantId = user?.apiKey ?? '';
      const token = user?.accessToken;

      const vendorCategory = filters.vendorCategory !== 'all' ? filters.vendorCategory : undefined;
      const financialYear = filters.financialYear !== 'all' ? filters.financialYear : undefined;
      const rating = filters.rating !== 'all' ? filters.rating : undefined;

      const response = await getCockpitOverview(tenantId, token, {
        vendorCategory,
        financialYear,
        rating,
      });

      // The API may return the payload directly OR wrapped in { success, data: {...} }
      // Try both shapes and pick whichever has 'totalVendors'
      const body = response?.data as Record<string, unknown>;
      const raw: CockpitOverviewResponse | null = (body?.data && typeof (body.data as Record<string, unknown>).totalVendors !== 'undefined')
        ? (body.data as CockpitOverviewResponse)
        : (typeof body?.totalVendors !== 'undefined')
          ? (body as unknown as CockpitOverviewResponse)
          : null;

      if (raw) {
        setDashboardData(mapApiResponse(raw));
      }
    } catch (err) {
      console.error('Failed to fetch cockpit overview:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, session]);

  // const handleExport = async () => {
  //   setIsExporting(true);

  //   await new Promise((resolve) => {
  //     setTimeout(resolve, 1500);
  //   });

  //   const exportData = {
  //     generatedAt: new Date().toISOString(),
  //     financialYear: filters.financialYear,
  //     vendorCategory: filters.vendorCategory,
  //     metrics: dashboardData,
  //   };

  //   const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement('a');
  //   link.href = url;
  //   link.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
  //   link.click();

  //   setIsExporting(false);
  // };

  // Full-page spinner only on very first load (no data at all yet)
  if (isLoading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-3">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--textprimary)' }}>Cockpit Overview</h1>
          <p className="text-sm" style={{ color: 'var(--textLight)' }}>
            Real-time view of vendor sustainability performance, emissions tracking, and key ESG
            indicators.
          </p>
        </div>
        {/* Subtle background-refresh indicator */}
        {isLoading && dashboardData && (
          <div className="flex items-center gap-2 text-xs text-text-secondary animate-pulse mt-1">
            <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
            Refreshing…
          </div>
        )}
      </div>
      {/* Filters and Export */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <DashboardFilters filters={filters} onFilterChange={setFilters} vendorCategories={vendorCategories} />

        {/* <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-[#383838] text-sm text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon name="ArrowDownTrayIcon" size={20} />
          {isExporting ? 'Exporting...' : 'Export Report'}
        </button> */}
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <MetricCard
          title="Total Vendors"
          value={String(dashboardData.totalVendors ?? 0)}
          icon="BuildingOfficeIcon"
          // trend={{
          //   value: Math.abs(dashboardData.vendorChange),
          //   direction: dashboardData.vendorChange >= 0 ? 'up' : 'down',
          // }}
          color="blue"
        />
        <MetricCard
          title="Total SKUs"
          value={String(dashboardData.totalSKUs ?? 0)}
          icon="CubeIcon"
          // trend={{
          //   value: Math.abs(dashboardData.skuChange),
          //   direction: dashboardData.skuChange >= 0 ? 'up' : 'down',
          // }}
          color="orange"
        />
        <MetricCard
          title="Avg Sustainability Score"
          value={dashboardData.avgSustainabilityScore.toFixed(1)}
          icon="ChartBarIcon"
          trend={{
            value: Math.abs(dashboardData.scoreChange),
            direction: dashboardData.scoreChange >= 0 ? 'up' : 'down',
          }}
          color="green"
          suffix="/100"
        />
        <MetricCard
          title="Total Emissions"
          value={dashboardData.totalEmissions.toFixed(1)}
          icon="ArrowTrendingDownIcon"
          trend1={{
            value: Math.abs(dashboardData.emissionsChange),
            direction: dashboardData.emissionsChange >= 0 ? 'up' : 'down',
          }}
          color="emerald"
          suffix="tCO2e"
        />
        <MetricCard
          title="Emissions Reduction"
          value={dashboardData.emissionsReduction.toFixed(1)}
          icon="ArrowTrendingDownIcon"
          // trend={{
          //   value: Math.abs(dashboardData.emissionsChange),
          //   direction: dashboardData.emissionsChange >= 0 ? 'up' : 'down',
          // }}
          color="emerald"
          suffix="%"
        />
        <MetricCard
          title="Compliance Rate"
          value={dashboardData.complianceRate.toFixed(1)}
          icon="ShieldCheckIcon"
          trend={{
            value: Math.abs(dashboardData.complianceChange),
            direction: dashboardData.complianceChange >= 0 ? 'up' : 'down',
          }}
          color="purple"
          suffix="%"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceCharts data={dashboardData.performanceTrend} />
        <EmissionsCharts data={dashboardData.emissionsTrend} currentEmissions={dashboardData.currentEmissions} />
      </div>

      {/* Category Breakdown */}
      <CategoryBreakdownChart
        data={dashboardData.categoryBreakdown}
        currentRating={filters.rating}
        onRatingChange={(rating) => setFilters({ ...filters, rating })}
      />

      {/* Vendor Leaderboard and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VendorLeaderboard
            topPerformers={dashboardData.topPerformers}
            bottomPerformers={dashboardData.bottomPerformers}
          />
        </div>
        <div className="lg:col-span-1">
          <AlertsPanel alerts={dashboardData.alerts} />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverviewInteractive;
