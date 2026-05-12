/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable max-len */
/* eslint-disable no-nested-ternary */

'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import Icon from '@/components/ui/AppIcon';
import { getChartColor, CHART_ORDERED_PALETTE } from '../ui/ChartColors';

interface TrendAnalysisProps {
  trendData: any;
}

const TrendAnalysis = ({ trendData }: TrendAnalysisProps) => {
  if (!trendData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Trend Overview */}
      <div className="bg-white rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Portfolio Sustainability Score Trend
        </h3>

        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={trendData.trends}>
            <defs>
              {(() => {
                const color = CHART_ORDERED_PALETTE[0 % CHART_ORDERED_PALETTE.length];

                return (
                  <linearGradient
                    id="trendGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={color.base}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={color.gradient}
                      stopOpacity={0}
                    />
                  </linearGradient>
                );
              })()}
            </defs>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="financial_year" />

            <YAxis
              yAxisId="left"
              domain={[0, 100]}
              label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
            />

            <Tooltip />
            <Legend />

            <Area
              yAxisId="left"
              type="monotone"
              dataKey="avg_score"
              stroke={getChartColor(0)}
              fillOpacity={1}
              fill="url(#trendGradient)"
              name="Avg Sustainability Score"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Sustainability Metrics Trends */}
      <div className="bg-white rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Sustainability Metrics Evolution
        </h3>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={trendData?.sustainability_metric_evolution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="financial_year" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />

            {/* dynamically render lines from first year's themes */}
            {trendData?.sustainability_metric_evolution?.[0]?.themes?.map(
              (theme: any, index: number) => {
                const themeName = theme.theme_name || '';
                const displayName = themeName.charAt(0).toUpperCase() + themeName.slice(1);

                return (
                  <Line
                    key={themeName}
                    type="monotone"
                    dataKey={(data) => {
                      const found = data.themes?.find(
                        (t: any) => t.theme_name === themeName,
                      );
                      return found?.score ?? 0;
                    }}
                    name={displayName}
                    stroke={getChartColor(index + 1)}
                    strokeWidth={2}
                  />
                );
              },
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Movement Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {(trendData.sustainability_metric_cards || []).map(
          (card: any, index: number) => {
            const styles = [
              {
                wrapper: 'bg-green-50 border-green-200',
                iconBg: 'bg-green-100',
                iconColor: 'text-green-600',
                title: 'text-green-700',
                value: 'text-green-600',
                icon: 'ArrowTrendingUpIcon',
                description: 'SKUs showing positive trend over the period',
              },
              {
                wrapper: 'bg-blue-50 border-blue-200',
                iconBg: 'bg-blue-100',
                iconColor: 'text-blue-600',
                title: 'text-blue-700',
                value: 'text-blue-600',
                icon: 'MinusIcon',
                description: 'SKUs maintaining consistent scores',
              },
              {
                wrapper: 'bg-red-50 border-red-200',
                iconBg: 'bg-red-100',
                iconColor: 'text-red-600',
                title: 'text-red-700',
                value: 'text-red-600',
                icon: 'ArrowTrendingDownIcon',
                description: 'SKUs requiring attention and intervention',
              },
            ];

            const style = styles[index % styles.length];

            return (
              <div
                key={card.label}
                className={`rounded-lg border p-6 ${style.wrapper}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${style.iconBg}`}
                  >
                    <Icon
                      name={style.icon}
                      size={24}
                      className={style.iconColor}
                    />
                  </div>

                  <div>
                    <div className={`text-sm ${style.title}`}>{card.label}</div>
                    <div className={`text-3xl font-bold ${style.value}`}>
                      {card.value ?? 0}
                    </div>
                  </div>
                </div>

                <div className={`text-sm ${style.title}`}>
                  {style.description}
                </div>
              </div>
            );
          },
        )}
      </div>

      {/* Predictive Insights */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Predictive Analytics - Next Quarter
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <div className="text-sm text-blue-700 mb-1">Predicted Score</div>
                <div className="text-3xl font-bold text-blue-600">
                  {trendData.predictiveInsights.nextQuarter.predictedScore}
                  %
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-700 mb-1">Confidence</div>
                <div className="text-xl font-bold text-blue-600">
                  {trendData.predictiveInsights.nextQuarter.confidence}
                  %
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <Icon name="ArrowTrendingUpIcon" size={20} className="text-green-600" />
              <div>
                <div className="text-sm font-semibold text-green-900">Upward Trend Expected</div>
                <div className="text-xs text-green-700">Based on current improvement patterns</div>
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-sm font-semibold text-purple-900 mb-2">Key Drivers</div>
              <ul className="text-xs text-purple-700 space-y-1">
                <li>• Strong vendor performance in electronics category</li>
                <li>• Improved legal compliance scores across portfolio</li>
                <li>• Sustained emission reduction initiatives</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Risk Areas & Opportunities
          </h3>

          <div className="space-y-3">
            {trendData.predictiveInsights.riskAreas.map((item: any) => (
              <div
                key={item.area}
                className={`p-4 rounded-lg border ${
                  item.risk === 'high' ? 'bg-red-50 border-red-200'
                    : item.risk === 'medium' ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon
                    name={item.risk === 'high' ? 'ExclamationTriangleIcon'
                      : item.risk === 'medium' ? 'ExclamationCircleIcon' : 'CheckCircleIcon'}
                    size={20}
                    className={
                      item.risk === 'high' ? 'text-red-600'
                        : item.risk === 'medium' ? 'text-orange-600' : 'text-green-600'
                    }
                  />
                  <span className={`text-sm font-semibold ${
                    item.risk === 'high' ? 'text-red-900'
                      : item.risk === 'medium' ? 'text-orange-900' : 'text-green-900'
                  }`}
                  >
                    {item.area}
                  </span>
                  <span className={`ml-auto px-2 py-1 text-xs rounded-full ${
                    item.risk === 'high' ? 'bg-red-200 text-red-800'
                      : item.risk === 'medium' ? 'bg-orange-200 text-orange-800' : 'bg-green-200 text-green-800'
                  }`}
                  >
                    {item.risk}
                    {' '}
                    risk
                  </span>
                </div>
                <p className={`text-xs ${
                  item.risk === 'high' ? 'text-red-700'
                    : item.risk === 'medium' ? 'text-orange-700' : 'text-green-700'
                }`}
                >
                  {item.impact}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default TrendAnalysis;
