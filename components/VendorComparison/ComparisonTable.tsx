/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import React from 'react';

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

interface ComparisonTableProps {
  vendors: Array<{ id: string; name: string; rating: string }>;
  metrics: Metric[];
  scores: VendorScore[];
}

const ComparisonTable = ({ vendors, metrics, scores }: ComparisonTableProps) => {
  const categories = Array.from(new Set(metrics.map((m) => m.category)));

  const getScore = (vendorId: string, metricId: string): VendorScore | undefined => (
    scores.find((s) => s.vendorId === vendorId && s.metricId === metricId)
  );

  const getRatingClass = (rating: string) => {
    if (rating === 'A') return 'bg-success/10 text-success';
    if (rating === 'B') return 'bg-accent/10 text-accent';
    if (rating === 'C') return 'bg-warning/10 text-warning';
    return 'bg-error/10 text-error';
  };

  const getScoreColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-gray-50 text-success';
      case 'good':
        return 'bg-gray-50 text-accent';
      case 'fair':
        return 'bg-gray-50 text-warning';
      case 'poor':
        return 'bg-gray-50 text-error';
      default:
        return 'bg-muted text-text-secondary';
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="sticky left-0 bg-muted px-6 py-4 text-left text-sm font-semibold text-text-primary border-r border-border min-w-[250px]">
                Sustainability Metrics
              </th>
              {vendors.map((vendor) => (
                <th
                  key={vendor.id}
                  className="px-6 py-4 text-center text-sm font-semibold text-text-primary min-w-[150px]"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span>{vendor.name}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRatingClass(vendor.rating)}`}>
                      Rating
                      {' '}
                      {vendor.rating}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map((category) => {
              const categoryMetrics = metrics.filter((m) => m.category === category);

              return (
                <React.Fragment key={category}>
                  <tr className="bg-muted/50">
                    <td
                      colSpan={vendors.length + 1}
                      className="px-6 py-3 text-sm font-semibold text-text-primary"
                    >
                      {category}
                    </td>
                  </tr>
                  {categoryMetrics.map((metric) => (
                    <tr
                      key={metric.id}
                      className="hover:bg-muted/30 transition-colors duration-fast"
                    >
                      <td className="sticky left-0 bg-surface px-6 py-4 text-sm text-text-primary border-r border-border">
                        <div className="flex items-center justify-between">
                          <span>{metric.name}</span>
                          <span className="text-xs text-text-secondary ml-2">
                            Weight:
                            {' '}
                            {metric.weight}
                            %
                          </span>
                        </div>
                      </td>
                      {vendors.map((vendor) => {
                        const scoreData = getScore(vendor.id, metric.id);

                        return (
                          <td key={vendor.id} className="px-6 py-4 text-center">
                            {scoreData ? (
                              <div className="flex flex-col items-center gap-1">
                                <span
                                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${getScoreColor(scoreData.status)}`}
                                >
                                  {scoreData.score}
                                  %
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-text-secondary">N/A</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonTable;
