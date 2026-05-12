/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import Icon from '@/components/ui/AppIcon';

interface VendorSummary {
  vendorId: string;
  vendorName: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: 'highly-recommended' | 'recommended' | 'conditional' | 'not-recommended';
}

interface SummaryPanelProps {
  summaries: VendorSummary[];
}

const SummaryPanel = ({ summaries }: SummaryPanelProps) => {
  const getRecommendationConfig = (recommendation: string) => {
    switch (recommendation) {
      case 'highly-recommended':
        return {
          icon: 'CheckCircleIcon',
          color: 'text-success',
          bg: 'bg-gray-100',
          label: 'Highly Recommended',
        };
      case 'recommended':
        return {
          icon: 'CheckCircleIcon',
          color: 'text-primary',
          bg: 'bg-gray-100',
          label: 'Recommended',
        };
      case 'conditional':
        return {
          icon: 'ExclamationTriangleIcon',
          color: 'text-warning',
          bg: 'bg-gray-100',
          label: 'Conditional Approval',
        };
      case 'not-recommended':
        return {
          icon: 'XCircleIcon',
          color: 'text-error',
          bg: 'bg-gray-100',
          label: 'Not Recommended',
        };
      default:
        return {
          icon: 'InformationCircleIcon',
          color: 'text-text-secondary',
          bg: 'bg-muted',
          label: 'Under Review',
        };
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <h2 className="text-lg font-semibold text-text-primary mb-6">
        Vendor Summary & Recommendations
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {summaries.map((summary) => {
          const config = getRecommendationConfig(summary.recommendation);

          return (
            <div key={summary.vendorId} className="border border-border rounded-lg p-5">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-base font-semibold text-text-primary">{summary.vendorName}</h3>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg}`}>
                  <Icon
                    name={
                      config.icon as
                        | 'CheckCircleIcon'
                        | 'ExclamationTriangleIcon'
                        | 'XCircleIcon'
                        | 'InformationCircleIcon'
                    }
                    size={16}
                    className={config.color}
                  />
                  <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="ArrowTrendingUpIcon" size={16} className="text-success" />
                    <h4 className="text-sm font-semibold text-text-primary">Key Strengths</h4>
                  </div>
                  <ul className="space-y-1.5 ml-6">
                    {summary.strengths.map((strength) => (
                      <li
                        key={strength}
                        className="text-sm text-text-secondary flex items-center gap-2"
                      >
                        <span className="text-success">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="ArrowTrendingDownIcon" size={16} className="text-error" />
                    <h4 className="text-sm font-semibold text-text-primary">
                      Areas for Improvement
                    </h4>
                  </div>
                  <ul className="space-y-1.5 ml-6">
                    {summary.weaknesses.map((weakness) => (
                      <li
                        key={weakness}
                        className="text-sm text-text-secondary flex items-start gap-2"
                      >
                        <span className="text-error mt-0">•</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SummaryPanel;
