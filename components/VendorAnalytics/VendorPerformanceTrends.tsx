/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/button-has-type */
/* eslint-disable no-mixed-operators */

'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import Icon from '@/components/ui/AppIcon';

interface VendorPerformanceTrendsProps {
  filters: any;
}

const VendorPerformanceTrends = ({ filters }: VendorPerformanceTrendsProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedMetric, setSelectedMetric] = useState('emissions');

  useEffect(() => {
    fetchChartData();
  }, [filters, selectedMetric]);

  const fetchChartData = async () => {
    setIsLoading(true);

    await new Promise((resolve) => {
      setTimeout(resolve, 800);
    });

    // Mock data
    const mockData = [
      {
        month: 'Jan', emissions: 1250, social: 72, governance: 68, legal: 85,
      },
      {
        month: 'Feb', emissions: 1180, social: 74, governance: 70, legal: 87,
      },
      {
        month: 'Mar', emissions: 1120, social: 76, governance: 72, legal: 88,
      },
      {
        month: 'Apr', emissions: 1080, social: 78, governance: 74, legal: 89,
      },
      {
        month: 'May', emissions: 1040, social: 79, governance: 76, legal: 90,
      },
      {
        month: 'Jun', emissions: 1020, social: 81, governance: 78, legal: 91,
      },
    ];

    setChartData(mockData);
    setIsLoading(false);
  };

  const metrics = [
    { id: 'emissions', label: 'Emissions (kg CO₂e)', color: '#10b981' },
    { id: 'social', label: 'Social Score', color: '#3b82f6' },
    { id: 'governance', label: 'Governance Score', color: '#8b5cf6' },
    { id: 'legal', label: 'Legal Compliance', color: '#f59e0b' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">
          Vendor Performance Evolution
        </h3>

        <div className="flex gap-2">
          {metrics.map((metric) => (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${selectedMetric === metric.id
                ? 'bg-primary text-white' : 'bg-muted text-text-secondary hover:bg-muted/80'
                }
              `}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-border p-6">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={selectedMetric}
              stroke={metrics.find((m) => m.id === selectedMetric)?.color}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const currentValue = chartData[chartData.length - 1]?.[metric.id] || 0;
          const previousValue = chartData[chartData.length - 2]?.[metric.id] || 0;
          const change = ((currentValue - previousValue) / previousValue * 100).toFixed(1);
          const isPositive = parseFloat(change) > 0;

          return (
            <div key={metric.id} className="bg-white rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">{metric.label}</span>
                <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  <Icon name={isPositive ? 'ArrowTrendingUpIcon' : 'ArrowTrendingDownIcon'} size={16} />
                  {Math.abs(parseFloat(change))}
                  %
                </div>
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {currentValue}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VendorPerformanceTrends;
