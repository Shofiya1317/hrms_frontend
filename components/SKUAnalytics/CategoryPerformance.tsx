/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-shadow */

'use client';

import {
  BarChart,
  Bar,
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
import { SKUPerformanceResponse } from '@/lib/interface/IProduct.interface';
import { CHART_ORDERED_PALETTE } from '../ui/ChartColors';

interface CategoryPerformanceProps {
  performanceData: SKUPerformanceResponse | null;
}

const renderLegendText = (value: string) => (
  <span style={{ color: '#1E1E1E', fontSize: 14 }}>{value}</span>
);

const CategoryPerformance = ({ performanceData }: CategoryPerformanceProps) => {
  if (!performanceData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Selector */}
      {/* <div className="bg-white rounded-lg border border-border p-4">
        <label className="block text-sm font-medium text-text-secondary mb-3">
          Select Category for Detailed Analysis
        </label>
        <div className="flex flex-wrap gap-2">
          {categoryData.categories.map((category: any) => (
            <button
              type="button"
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${selectedCategory === category.name
                ? 'bg-[#383838] text-white' : 'bg-muted text-text-secondary hover:bg-muted/80'
                }
              `}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div> */}

      {/* Selected Category Overview */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-border p-4">
          <div className="text-sm text-text-secondary mb-1">Total SKUs</div>
          <div className="text-2xl font-bold text-text-primary">
            {performanceData.summary.total_skus}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-4">
          <div className="text-sm text-text-secondary mb-1">Avg Score</div>
          <div className="text-2xl font-bold text-text-primary">
            {performanceData.summary.avg_score}
            %
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-4">
          <div className="text-sm text-text-secondary mb-1">Trend</div>
          <div className="flex items-center gap-1 text-green-600">
            <Icon name="ArrowTrendingUpIcon" size={20} />
            <span className="text-2xl font-bold">
              {performanceData.summary.trend}
              %
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-4">
          <div className="text-sm text-text-secondary mb-1">Category Rank</div>
          <div className="text-2xl font-bold text-text-primary">
            {performanceData.summary.category_rank}
          </div>
        </div>
      </div>

      {/* Score Evolution */}

      <div className="bg-white rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Sustainability Score Evolution
        </h3>
        <div className="mb-5 border-t border-border" />

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData.score_evolution}>
            <XAxis dataKey="financial_year" />

            <YAxis domain={[0, 100]} />

            <Tooltip />
            <Legend />

            <Line
              type="monotone"
              dataKey="avg_score"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Avg Sustainability Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Sustainability Metrics Breakdown */}

      <div className="bg-white rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Sustainability Metrics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(performanceData.sustainability_metrics || []).map(
            (theme, index) => {
              const colors = [
                {
                  bg: 'bg-green-50',
                  border: 'border-green-200',
                  text: 'text-green-600',
                  title: 'text-green-900',
                },
                {
                  bg: 'bg-blue-50',
                  border: 'border-blue-200',
                  text: 'text-blue-600',
                  title: 'text-blue-900',
                },
                {
                  bg: 'bg-purple-50',
                  border: 'border-purple-200',
                  text: 'text-purple-600',
                  title: 'text-purple-900',
                },
                {
                  bg: 'bg-orange-50',
                  border: 'border-orange-200',
                  text: 'text-orange-600',
                  title: 'text-orange-900',
                },
              ];
              const formatTheme = (theme: string) => theme.replace(/\b\w/g, (c) => c.toUpperCase());

              const style = colors[index % colors.length];

              return (
                <div
                  key={theme.theme_name}
                  className={`${style.bg} rounded-lg border ${style.border} p-4`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-sm font-medium ${style.title}`}>
                      {formatTheme(theme.theme_name)}
                    </span>
                  </div>

                  <div className={`text-3xl font-bold ${style.text}`}>
                    {Number(theme.score) || 0}
                    %
                  </div>
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* Cross-Category Comparison */}
      <div className="bg-white rounded-lg border border-border p-4 h-[470px]">
        <h3 className="text-[16px] font-semibold text-text-primary mb-4">
          Cross-Category Performance Comparison
        </h3>
        <div className="mb-4 border-t border-border" />
        <div className="w-full">
          <ResponsiveContainer width="100%" height={450}>
            <BarChart
              data={performanceData.cross_category_comparison}
              barGap={10}
              barCategoryGap="10%"
              margin={{
                top: 20,
                right: 10,
                bottom: 100,
              }}
            >
              <CartesianGrid
                horizontal
                vertical={false}
                stroke="#E4E7EC"
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="category_name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64656D', fontSize: 12 }}
              />

              <YAxis
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64656D', fontSize: 12 }}
              />

              <Tooltip cursor={{ fill: 'transparent' }} />

              {/* ================= DYNAMIC GRADIENTS ================= */}
              <defs>
                {Array.from(
                  new Set(
                    performanceData.cross_category_comparison.flatMap((c) => c.themes?.map((t) => t.theme_name)),
                  ),
                ).map((theme, index) => {
                  const color = CHART_ORDERED_PALETTE[index % CHART_ORDERED_PALETTE.length];

                  return (
                    <linearGradient
                      key={theme}
                      id={`gradient-${index}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={color.base}
                        stopOpacity={1}
                      />
                      <stop
                        offset="100%"
                        stopColor={color.gradient}
                        stopOpacity={0.6}
                      />
                    </linearGradient>
                  );
                })}
              </defs>

              {/* ================= DYNAMIC BARS ================= */}
              {Array.from(
                new Set(
                  performanceData.cross_category_comparison.flatMap((c) => c.themes?.map((t) => t.theme_name)),
                ),
              ).map((theme, index) => (
                <Bar
                  key={theme}
                  name={theme}
                  radius={[10, 10, 0, 0]}
                  barSize={55}
                  fill={`url(#gradient-${index})`}
                  dataKey={(entry) => entry.themes?.find((t: any) => t.theme_name === theme)
                    ?.score ?? 0}
                />
              ))}

              <Legend
                verticalAlign="bottom"
                align="left"
                formatter={renderLegendText}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CategoryPerformance;
