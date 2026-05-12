/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/no-array-index-key */

'use client';

import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
} from 'recharts';

interface SKUPerformanceComparisonProps {
  filters: any;
}

const SKUPerformanceComparison = ({ filters }: SKUPerformanceComparisonProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [skuData, setSKUData] = useState<any[]>([]);
  const [selectedSKU, setSelectedSKU] = useState('');

  useEffect(() => {
    fetchSKUData();
  }, [filters]);

  const fetchSKUData = async () => {
    setIsLoading(true);

    await new Promise((resolve) => {
      setTimeout(resolve, 800);
    });

    // Mock SKU data with donut chart breakdown
    const mockData = [
      {
        sku: 'SKU-001',
        name: 'Organic Cotton T-Shirt',
        vendors: 5,
        avgScore: 85.2,
        breakdown: [
          { name: 'Emissions', value: 88, color: '#10b981' },
          { name: 'Social', value: 85, color: '#3b82f6' },
          { name: 'Governance', value: 82, color: '#8b5cf6' },
          { name: 'Legal', value: 86, color: '#f59e0b' },
        ],
      },
      {
        sku: 'SKU-002',
        name: 'Recycled Polyester Jacket',
        vendors: 3,
        avgScore: 78.5,
        breakdown: [
          { name: 'Emissions', value: 82, color: '#10b981' },
          { name: 'Social', value: 76, color: '#3b82f6' },
          { name: 'Governance', value: 75, color: '#8b5cf6' },
          { name: 'Legal', value: 81, color: '#f59e0b' },
        ],
      },
      {
        sku: 'SKU-003',
        name: 'Bamboo Fiber Pants',
        vendors: 4,
        avgScore: 82.3,
        breakdown: [
          { name: 'Emissions', value: 85, color: '#10b981' },
          { name: 'Social', value: 80, color: '#3b82f6' },
          { name: 'Governance', value: 81, color: '#8b5cf6' },
          { name: 'Legal', value: 83, color: '#f59e0b' },
        ],
      },
    ];

    setSKUData(mockData);
    setSelectedSKU(mockData[0]?.sku || '');
    setIsLoading(false);
  };

  const currentSKU = skuData.find((item) => item.sku === selectedSKU);

  const getRatingBadge = (score: number) => {
    if (score >= 85) return { label: 'A', color: 'bg-green-500' };
    if (score >= 70) return { label: 'B', color: 'bg-blue-500' };
    if (score >= 55) return { label: 'C', color: 'bg-yellow-500' };
    return { label: 'D', color: 'bg-red-500' };
  };

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
          SKU Sustainability Score Breakdown
        </h3>

        <select
          value={selectedSKU}
          onChange={(e) => setSelectedSKU(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {skuData.map((item) => (
            <option key={item.sku} value={item.sku}>
              {item.sku}
              {' '}
              -
              {item.name}
            </option>
          ))}
        </select>
      </div>

      {currentSKU && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donut Chart */}
          <div className="bg-white rounded-lg border border-border p-6">
            <h4 className="text-md font-semibold text-text-primary mb-4">
              Performance Distribution
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={currentSKU.breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {currentSKU.breakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Metrics */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-text-secondary">Overall Score</div>
                  <div className="text-3xl font-bold text-text-primary">
                    {currentSKU.avgScore}
                  </div>
                </div>
                <div className={`${getRatingBadge(currentSKU.avgScore).color} text-white px-4 py-2 rounded-lg text-xl font-bold`}>
                  {getRatingBadge(currentSKU.avgScore).label}
                </div>
              </div>
              <div className="text-sm text-text-secondary">
                Based on
                {' '}
                {currentSKU.vendors}
                {' '}
                vendor submissions
              </div>
            </div>

            <div className="bg-white rounded-lg border border-border p-4">
              <h4 className="text-md font-semibold text-text-primary mb-3">
                Metric Scores
              </h4>
              <div className="space-y-3">
                {currentSKU.breakdown.map((metric: any, index: number) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-text-secondary">{metric.name}</span>
                      <span className="text-sm font-semibold text-text-primary">
                        {metric.value}
                        /100
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${metric.value}%`,
                          backgroundColor: metric.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SKU Comparison Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Vendors
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Avg Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Rating
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {skuData.map((item) => {
                const rating = getRatingBadge(item.avgScore);
                return (
                  <tr key={item.sku} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                      {item.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {item.vendors}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-text-primary">
                      {item.avgScore}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`${rating.color} text-white px-2 py-1 rounded text-xs font-bold`}>
                        {rating.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SKUPerformanceComparison;
