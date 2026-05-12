/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/no-array-index-key */
/* eslint-disable max-len */

'use client';

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import Icon from '@/components/ui/AppIcon';
import { CHART_ORDERED_PALETTE } from '../ui/ChartColors';

interface PerformanceByQuestionProps {
  performanceData: any;
}

const PerformanceByQuestion = ({
  performanceData,
}: PerformanceByQuestionProps) => {
  if (!performanceData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const renderLegendText = (value: string) => (
    <span style={{ color: '#00000088', fontSize: 14 }}>{value}</span>
  );
  return (
    <div className="space-y-6">
      {/* Category Filter */}
      {/* <div className="flex items-center gap-4 flex-wrap">
        <span className="text-sm font-medium text-text-secondary">Filter by Category:</span>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'all'
              ? 'bg-[#383838] text-white'
              : 'bg-muted text-text-secondary hover:bg-muted/80'
            }`}
          >
            All Categories
          </button>
          {questionData.categories.map((category: string) => (
            <button
              type="button"
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-[#383838] text-white' : 'bg-muted text-text-secondary hover:bg-muted/80'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div> */}

      {/* Performance Trend Over Time */}
      <div className="bg-white rounded-lg border border-border p-6">
        <h3 className="text-[16px] font-semibold text-text-primary mb-4">
          Performance Trends by Category
        </h3>
        <div className="mb-5 border-t border-border" />
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={Object.values(
              (performanceData?.[0]?.performanceTrends ?? []).reduce(
                (acc: Record<string, any>, trend: any) => {
                  trend.data.forEach((point: any) => {
                    if (!acc[point.year]) {
                      acc[point.year] = { year: point.year };
                    }
                    acc[point.year][trend.categoryName] = point.score;
                  });
                  return acc;
                },
                {},
              ),
            )}
          >
            <CartesianGrid
              horizontal
              vertical={false}
              stroke="#E4E7EC"
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="year"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64656D', fontSize: 12 }}
            />

            <YAxis
              label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64656D', fontSize: 12 }}
              allowDecimals={false}
            />

            <Tooltip cursor={{ fill: 'transparent' }} />
            <Legend formatter={renderLegendText} />

            {/* ✅ dynamic lines with palette */}
            {(performanceData?.[0]?.performanceTrends ?? []).map(
              (trend: any, index: number) => {
                const palette = CHART_ORDERED_PALETTE[index % CHART_ORDERED_PALETTE.length];

                return (
                  <Line
                    key={trend.categoryName}
                    type="monotone"
                    dataKey={trend.categoryName}
                    stroke={palette.base}
                    strokeWidth={2}
                    name={trend.categoryName}
                  />
                );
              },
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Question-Level Performance Table */}
      <div className="bg-white rounded-lg border border-border p-6">
        <h3 className="text-[16px] font-semibold text-text-primary mb-4">
          Detailed Standard Performance
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Standard
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Avg Score
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Response Rate
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Trend
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Top Performers
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Needs Improvement
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {performanceData?.length ? (
                performanceData.flatMap((standard: any) => standard.categories.map((category: any, index: number) => (
                  <tr
                    key={`${standard.standardName}-${index}`}
                    className="hover:bg-muted/50"
                  >
                    {/* Standard Name */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-text-primary">
                        {standard.standardName}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-[#383838]">
                        {category.categoryName}
                      </span>
                    </td>

                    {/* Avg Score */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#383838] h-2 rounded-full"
                            style={{ width: `${category.avgScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-text-primary w-12 text-right">
                          {category.avgScore}
                        </span>
                      </div>
                    </td>

                    {/* Response Rate */}
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-text-secondary">
                        {category.responseRate}
                        %
                      </span>
                    </td>

                    {/* Trend */}
                    <td className="px-4 py-3">
                      <div
                        className={`flex items-center gap-1 text-sm ${
                          category.trend > 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        <Icon
                          name={
                              category.trend > 0
                                ? 'ArrowTrendingUpIcon'
                                : 'ArrowTrendingDownIcon'
                            }
                          size={14}
                        />
                        {Math.abs(category.trend)}
                        %
                      </div>
                    </td>

                    {/* Top Performers */}
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {category.topPerformers}
                        {' '}
                        vendors
                      </span>
                    </td>

                    {/* Needs Improvement */}
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {category.needsImprovement}
                        {' '}
                        vendors
                      </span>
                    </td>
                  </tr>
                )))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-text-secondary"
                  >
                    No Standard available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Statistics */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="TrophyIcon" size={20} className="text-green-600" />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Highest Scoring</div>
              <div className="text-lg font-bold text-text-primary">Workplace Safety</div>
              <div className="text-xs text-green-600">88.3% average</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="ChartBarIcon" size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Best Participation</div>
              <div className="text-lg font-bold text-text-primary">Workplace Safety</div>
              <div className="text-xs text-blue-600">100% response rate</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Icon name="ExclamationTriangleIcon" size={20} className="text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Needs Attention</div>
              <div className="text-lg font-bold text-text-primary">Board Diversity</div>
              <div className="text-xs text-orange-600">74.2% average</div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default PerformanceByQuestion;
