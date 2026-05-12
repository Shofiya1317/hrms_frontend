/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable max-len */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import Icon from '@/components/ui/AppIcon';
import { TaskService } from '@/lib/service';
import { MetricsDashboardResponse } from '@/lib/interface/IVendor.interface';
import { selectEndOfBlockAboveSelection } from '@udecode/plate-common';
import { CHART_ORDERED_PALETTE } from '../ui/ChartColors';

interface MetricsDashboardProps {
  apiKey: string;
  token: string;
  filters: any;
}

interface ThemeMetric {
  name: string;
  score: number;
  target: number;
  change: number;
}

interface ThemeData {
  id: string;
  label: string;
  icon: string;
  color: string;
  overall: number;
  trend: number;
  distribution: { name: string; value: number; color: string }[];
  subMetrics: ThemeMetric[];
  description: string;
}

const MetricsDashboard = ({
  apiKey,
  token,
  filters,
}: MetricsDashboardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [metricsData, setMetricsData] = useState<MetricsDashboardResponse | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string>('');

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await TaskService.getMetricsDashboard(
        apiKey,
        token,
        selectedTheme || '',
      );

      setMetricsData(res?.data);

      // auto-select first theme if none selected
      if (!selectedTheme && res?.data?.themes?.length > 0) {
        setSelectedTheme(res.data.themes[0].themeId);
      }
    } catch (err) {
      console.error('Failed to fetch metrics dashboard', err);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, token, selectedTheme]);

  useEffect(() => {
    if (apiKey) {
      fetchDashboard();
    }
  }, [apiKey, fetchDashboard]);

  // const themes = [
  //   {
  //     id: 'environment',
  //     label: 'Environment',
  //     icon: 'GlobeAltIcon',
  //     color: 'text-green-600',
  //   },
  //   {
  //     id: 'labour',
  //     label: 'Labour & Human Rights',
  //     icon: 'UsersIcon',
  //     color: 'text-blue-600',
  //   },
  //   {
  //     id: 'ethics',
  //     label: 'Ethics',
  //     icon: 'ShieldCheckIcon',
  //     color: 'text-purple-600',
  //   },
  //   {
  //     id: 'carbon',
  //     label: 'Carbon Management',
  //     icon: 'CloudIcon',
  //     color: 'text-orange-600',
  //   },
  //   {
  //     id: 'procurement',
  //     label: 'Sustainable Procurement',
  //     icon: 'TruckIcon',
  //     color: 'text-teal-600',
  //   },
  // ];

  const themeUIMap: Record<string, { icon: string; color: string }> = {
    Environment: {
      icon: 'GlobeAltIcon',
      color: 'text-green-600',
    },
    'Labour & Human Rights': {
      icon: 'UsersIcon',
      color: 'text-blue-600',
    },
    Ethics: {
      icon: 'ShieldCheckIcon',
      color: 'text-purple-600',
    },
    'Carbon Management': {
      icon: 'CloudIcon',
      color: 'text-orange-600',
    },
  };

  const themeKey = metricsData?.detailedThemeData?.themeName ?? '';

  const currentThemeUI = themeUIMap[themeKey] ?? {
    icon: 'GlobeAltIcon',
    color: 'text-gray-600',
  };

  const renderLegendText = (value: string) => (
    <span style={{ color: '#00000088', fontSize: 14 }}>{value}</span>
  );

  if (isLoading || !metricsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  // const currentThemeData = metricsData[selectedTheme];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Sustainability Metrics Dashboard
        </h3>
        <p className="text-sm text-text-secondary">
          Comprehensive analysis across environmental, social, and governance
          themes
        </p>
      </div>

      {/* Theme Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {metricsData?.themes?.map((theme) => {
          const isSelected = selectedTheme === theme.themeId;

          const ui = themeUIMap[theme.themeName] || {
            icon: 'GlobeAltIcon',
            color: 'text-gray-600',
          };

          return (
            <button
              key={theme.themeId}
              onClick={() => setSelectedTheme(theme.themeId)}
              className={`bg-white rounded-lg border-2 p-4
        text-left transition-all hover:shadow-md ${isSelected ? 'border-[#383838] shadow-md' : 'border-border'
                }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10
            ${ui.color.replace('text-', 'bg-').replace('600', '100')}
            rounded-lg flex items-center justify-center`}
                >
                  <Icon name={ui.icon} size={20} className={ui.color} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-xs text-text-secondary truncate">
                    {theme.themeName}
                  </div>
                  <div className="text-xl font-bold text-text-primary">
                    {theme.score}
                  </div>
                </div>
              </div>

              <div
                className={`flex items-center gap-1 text-xs ${theme.trend > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                <Icon
                  name={
                    theme.trend > 0
                      ? 'ArrowTrendingUpIcon'
                      : 'ArrowTrendingDownIcon'
                  }
                  size={14}
                />
                {Math.abs(theme.trend)}
                % vs last period
              </div>
            </button>
          );
        })}
      </div>

      {/* Overall Performance Radar Chart */}
      <div className="bg-white rounded-lg border border-border p-6">
        <h3 className="text-[16px] font-semibold text-text-primary mb-4">
          Overall Sustainability Performance
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart
            data={
              metricsData?.themes?.map((theme) => ({
                theme: theme.themeName,
                score: theme.score,
                fullMark: 100,
              })) ?? []
            }
          >
            <PolarGrid />
            <PolarAngleAxis dataKey="theme" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Theme Analysis */}
      <div className="bg-white rounded-lg border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`w-12 h-12 ${currentThemeUI.color
              .replace('text-', 'bg-')
              .replace(
                '600',
                '100',
              )} rounded-lg flex items-center justify-center`}
          >
            <Icon
              name={currentThemeUI.icon}
              size={24}
              className={currentThemeUI.color}
            />
          </div>

          <div>
            <h4 className="text-lg font-semibold text-text-primary">
              {metricsData?.detailedThemeData?.themeName}
            </h4>
            <p className="text-sm text-text-secondary">
              {metricsData?.detailedThemeData?.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Distribution Pie Chart */}
          <div>
            <h5 className="text-sm font-semibold text-text-primary mb-4">
              Performance Distribution
            </h5>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <defs>
                  {CHART_ORDERED_PALETTE.map((color, index) => (
                    <linearGradient
                      key={index}
                      id={`pieGradient-${index}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={color.base} />
                      <stop offset="100%" stopColor={color.gradient} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={metricsData?.detailedThemeData?.performanceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent = 0 }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {metricsData?.detailedThemeData?.performanceDistribution?.map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#pieGradient-${index % CHART_ORDERED_PALETTE.length
                        })`}
                      />
                    ),
                  )}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {metricsData?.detailedThemeData?.performanceDistribution?.map(
                (item, index) => {
                  const palette = CHART_ORDERED_PALETTE[index % CHART_ORDERED_PALETTE.length];

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: palette.base }}
                        />
                        <span className="text-sm text-text-secondary">
                          {item.label}
                        </span>
                      </div>

                      <span className="text-sm font-semibold text-text-primary">
                        {item.percentage}
                        %
                      </span>
                    </div>
                  );
                },
              )}
            </div>
          </div>

          {/* Sub-Metrics Bar Chart */}
          <div>
            <h5 className="text-sm font-semibold text-text-primary mb-4">
              Sub-Metric Performance
            </h5>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={metricsData?.detailedThemeData?.indicators}
                layout="vertical"
              >
                <defs>
                  <linearGradient
                    id="currentGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop
                      offset="0%"
                      stopColor={CHART_ORDERED_PALETTE[1].base}
                    />
                    <stop
                      offset="100%"
                      stopColor={CHART_ORDERED_PALETTE[1].gradient}
                    />
                  </linearGradient>

                  <linearGradient
                    id="targetGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop
                      offset="0%"
                      stopColor={CHART_ORDERED_PALETTE[0].base}
                    />
                    <stop
                      offset="100%"
                      stopColor={CHART_ORDERED_PALETTE[0].gradient}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  yAxisId="left" // ⭐⭐ THIS IS THE MISSING PIECE
                  horizontal={false}
                  vertical
                  stroke="#E4E7EC"
                  strokeDasharray="3 3"
                />

                <XAxis
                  type="number"
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64656D', fontSize: 12 }}
                />

                <YAxis
                  dataKey="indicatorName"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64656D', fontSize: 12 }}
                />

                <Tooltip cursor={{ fill: 'transparent' }} />
                <Legend formatter={renderLegendText} />

                <Bar
                  dataKey="currentScore"
                  fill="url(#currentGradient)"
                  name="Current Score"
                  radius={[0, 6, 6, 0]}
                />

                <Bar
                  dataKey="targetScore"
                  fill="url(#targetGradient)"
                  name="Target"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Sub-Metrics Table */}
        {/* <div>
          <h5 className="text-sm font-semibold text-text-primary mb-4">
            Detailed Metrics Breakdown
          </h5>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Metric
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Current Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Gap
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Progress Bar
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {currentThemeData.subMetrics.map((metric, index) => {
                  const gap = metric.target - metric.score;
                  const progress = (metric.score / metric.target) * 100;
                  return (
                    <tr key={index} className="hover:bg-muted/50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm font-medium text-text-primary">
                          {metric.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm font-bold text-text-primary">
                          {metric.score}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-text-secondary">
                          {metric.target}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`text-sm font-semibold ${gap > 5 ? 'text-red-600' : gap > 0 ? 'text-orange-600' : 'text-green-600'}`}
                        >
                          {gap > 0 ? `-${gap}` : 'Met'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              progress >= 100
                                ? 'bg-green-600'
                                : progress >= 90
                                  ? 'bg-blue-600'
                                  : 'bg-orange-600'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div
                          className={`flex items-center gap-1 text-sm ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          <Icon
                            name={
                              metric.change > 0
                                ? 'ArrowTrendingUpIcon'
                                : 'ArrowTrendingDownIcon'
                            }
                            size={14}
                          />
                          {Math.abs(metric.change)}
                          %
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div> */}
      </div>

      {/* Performance Insights */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="CheckCircleIcon" size={20} className="text-green-600" />
            <h5 className="text-sm font-semibold text-green-900">Strengths</h5>
          </div>
          <ul className="text-sm text-green-800 space-y-1">
            {currentThemeData.subMetrics
              .filter((m) => m.score >= m.target - 2)
              .slice(0, 3)
              .map((metric, idx) => (
                <li key={idx}>
                  •
                  {metric.name}
                </li>
              ))}
          </ul>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="ExclamationTriangleIcon" size={20} className="text-orange-600" />
            <h5 className="text-sm font-semibold text-orange-900">Areas for Improvement</h5>
          </div>
          <ul className="text-sm text-orange-800 space-y-1">
            {currentThemeData.subMetrics
              .filter((m) => m.score < m.target - 2)
              .slice(0, 3)
              .map((metric, idx) => (
                <li key={idx}>
                  •
                  {metric.name}
                </li>
              ))}
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="ChartBarIcon" size={20} className="text-blue-600" />
            <h5 className="text-sm font-semibold text-blue-900">Top Improvers</h5>
          </div>
          <ul className="text-sm text-blue-800 space-y-1">
            {currentThemeData.subMetrics
              .sort((a, b) => b.change - a.change)
              .slice(0, 3)
              .map((metric, idx) => (
                <li key={idx}>
                  •
                  {metric.name}
                  {' '}
                  (+
                  {metric.change.toFixed(1)}
                  %)
                </li>
              ))}
          </ul>
        </div>
      </div> */}
    </div>
  );
};

export default MetricsDashboard;
