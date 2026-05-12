/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable-next-line react-hooks/exhaustive-deps */

'use client';

import { useEffect, useState } from 'react';
import { VendorService } from '@/lib/service';
import VendorSelector from './VendorSelector';
import ComparisonTable from './ComparisonTable';
import ComparisonCharts from './ComparisonCharts';
// import SummaryPanel from './SummaryPanel';
// import ComparisonFilters from './ComparisonFilters';
// import ExportPanel from './ExportPanel';
// import MobileComparisonView from './MobileComparisonView';

interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: string;
  score: number;
}

interface Indicator {
  id: string;
  name: string;
  weightage: number;
  scores: {
    vendorId: string;
    score: number;
    status: string;
  }[];
}

interface MetricCategory {
  category: string;
  indicators: Indicator[];
}

interface ApiResponse {
  vendors: Vendor[];
  metrics: MetricCategory[];
  overallScores: { vendorId: string; score: number }[];
  categoryScores: CategoryScore[];
  summaries: VendorSummary[];
}

interface Metric {
  id: string;
  name: string;
  category: string;
  weight: number;
}

interface VendorScore {
  vendorId: string;
  metricId: string;
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
}

interface CategoryScore {
  vendorId: string;
  category: string;
  score: number;
  status: string;
}

interface VendorSummary {
  vendorId: string;
  vendorName: string;
  strengths: string[];
  weaknesses: string[];
  recommendation:
    | 'highly-recommended'
    | 'recommended'
    | 'conditional'
    | 'not-recommended';
}

interface FilterState {
  skuCategory: string;
  dateRange: string;
  questionnaireVersion: string;
}

interface ExportOptions {
  includeCharts: boolean;
  includeMetrics: boolean;
  includeSummary: boolean;
  includeRecommendations: boolean;
}

// const mockVendors: Vendor[] = [
//   {
//     id: 'v1',
//     name: 'EcoSupply Co.',
//     category: 'Raw Materials',
//     rating: 'A',
//     score: 92,
//   },
//   {
//     id: 'v2',
//     name: 'GreenTech Industries',
//     category: 'Electronics',
//     rating: 'A',
//     score: 88,
//   },
//   {
//     id: 'v3',
//     name: 'Sustainable Packaging Ltd.',
//     category: 'Packaging',
//     rating: 'B',
//     score: 78,
//   },
//   {
//     id: 'v4',
//     name: 'Global Textiles Inc.',
//     category: 'Textiles',
//     rating: 'B',
//     score: 75,
//   },
//   {
//     id: 'v5',
//     name: 'Renewable Resources Corp.',
//     category: 'Raw Materials',
//     rating: 'C',
//     score: 65,
//   },
//   {
//     id: 'v6',
//     name: 'Standard Materials Co.',
//     category: 'Raw Materials',
//     rating: 'C',
//     score: 58,
//   },
// ];

// const mockMetrics: Metric[] = [
//   {
//     id: 'm1',
//     name: 'Carbon Emissions Reduction',
//     category: 'Environmental',
//     weight: 25,
//   },
//   {
//     id: 'm2',
//     name: 'Renewable Energy Usage',
//     category: 'Environmental',
//     weight: 20,
//   },
//   {
//     id: 'm3',
//     name: 'Waste Management',
//     category: 'Environmental',
//     weight: 15,
//   },
//   {
//     id: 'm4',
//     name: 'Water Conservation',
//     category: 'Environmental',
//     weight: 10,
//   },
//   {
//     id: 'm5',
//     name: 'Fair Labor Practices',
//     category: 'Social',
//     weight: 15,
//   },
//   {
//     id: 'm6',
//     name: 'Community Engagement',
//     category: 'Social',
//     weight: 10,
//   },
//   {
//     id: 'm7',
//     name: 'Supply Chain Transparency',
//     category: 'Governance',
//     weight: 15,
//   },
//   {
//     id: 'm8',
//     name: 'Ethics & Compliance',
//     category: 'Governance',
//     weight: 10,
//   },
// ];

const VendorComparisonInteractive = ({ tenantId, token }: { tenantId: string; token: string }) => {
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [vendorList, setVendorList] = useState<Vendor[]>([]);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await VendorService.getVendors(undefined, tenantId, token || undefined);

        // Check if API call was successful
        if (res.status !== 200 || !res.data.success) {
          setVendorList([]);
          return;
        }

        const vendors = res.data.vendors || [];

        if (!Array.isArray(vendors)) {
          setVendorList([]);
          return;
        }

        const transformedVendors: Vendor[] = vendors.map((v: any) => ({
          id: v.id,
          name: v.company_name,
          category: v.vendor_category?.name || 'Uncategorized',
          rating: v.rating,
          score: v.avg_score,
        }));
        setVendorList(transformedVendors);
      } catch (error) {
        setVendorList([]);
      }
    };

    fetchVendors();
  }, [tenantId, token]);

  // Fetch comparison data when vendors are selected
  useEffect(() => {
    if (selectedVendors.length < 2) {
      setApiData(null);
      return;
    }

    const fetchComparison = async () => {
      setLoading(true);
      try {
        const res = await VendorService.getVendorComparison(selectedVendors, '', '', tenantId, token);
        if (res.data) {
          setApiData(res.data);
        }
      } catch (error) {
        // console.error('Failed to fetch comparison data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [selectedVendors, tenantId, token]);

  const selectedVendorData = apiData?.vendors || [];
  const flatMetrics = (apiData?.metrics || []).flatMap((m: MetricCategory) => m.indicators.map((ind: Indicator) => ({
    id: ind.id,
    name: ind.name,
    category: m.category,
    weight: ind.weightage,
  })));
  const flatScores: VendorScore[] = (apiData?.metrics || []).flatMap((m: MetricCategory) => m.indicators.flatMap((ind: Indicator) => ind.scores.map((s: any) => ({
    vendorId: s.vendorId,
    metricId: ind.id,
    score: s.score,
    status: s.status as 'excellent' | 'good' | 'fair' | 'poor',
  }))));
  const selectedScores = flatScores;
  const selectedCategoryScores = apiData?.categoryScores || [];
  const selectedSummaries = apiData?.summaries || [];

  // Calculate overall scores from category scores if API returns 0
  const overallScores = (apiData?.overallScores || []).map((os) => {
    if (os.score === 0 && selectedCategoryScores.length > 0) {
      const vendorCategoryScores = selectedCategoryScores.filter((cs) => cs.vendorId === os.vendorId);
      const avgScore = vendorCategoryScores.length > 0
        ? vendorCategoryScores.reduce((sum, cs) => sum + cs.score, 0) / vendorCategoryScores.length
        : 0;
      return { ...os, score: avgScore };
    }
    return os;
  });

  const handleExport = (format: string, _options: ExportOptions) => {
    // eslint-disable-next-line no-alert
    alert(
      `Exporting ${format.toUpperCase()} report for ${selectedVendors.length} vendors`,
    );
  };

  return (
    <div className="space-y-6 p-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">
            Vendor Comparison
          </h1>
          <p className="text-sm text-text-secondary">
            Compare sustainability performance across multiple vendors
          </p>
        </div>
        {/* <ExportPanel
          selectedVendors={selectedVendors}
          onExport={handleExport}
        /> */}
      </div>

      <VendorSelector
        vendors={vendorList}
        selectedVendors={selectedVendors}
        onVendorSelect={setSelectedVendors}
        maxSelection={4}
      />

      {selectedVendors.length > 0 ? (
        <div>
          {loading ? (
            <div className="p-6 text-center">Loading comparison data...</div>
          ) : apiData ? (
            <>
              {/* <ComparisonFilters onFilterChange={handleFilterChange} /> */}

              <div className="lg:block">
                <ComparisonTable
                  vendors={selectedVendorData}
                  metrics={flatMetrics}
                  scores={selectedScores}
                />
              </div>

              {/* <MobileComparisonView
                vendors={selectedVendorData}
                categoryScores={selectedCategoryScores}
              /> */}

              <ComparisonCharts
                vendors={selectedVendorData}
                overallScores={overallScores}
                categoryScores={selectedCategoryScores}
              />

              {/* <SummaryPanel summaries={selectedSummaries} /> */}
            </>
          ) : (
            <div className="p-6 text-center">Select at least 2 vendors to compare</div>
          )}
        </div>
      ) : (
        <div className="bg-surface rounded-lg border border-border p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No Vendors Selected
            </h3>
            <p className="text-sm text-text-secondary">
              Select at least 2 vendors from the list above to start comparing
              their sustainability performance
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorComparisonInteractive;
