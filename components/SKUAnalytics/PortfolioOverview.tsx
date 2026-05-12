/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-shadow */

'use client';

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Icon from '@/components/ui/AppIcon';
import { SKUPortfolioResponse } from '@/lib/interface/IProduct.interface';
import { getChartColor, CHART_ORDERED_PALETTE } from '../ui/ChartColors';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

const CustomPieTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const shortName = (data.payload.label || data.name).split('(')[0].trim();

    // The fill is an SVG gradient URL (url(#vendorPerfPie-0)).
    // We must extract the index or look it up to get the real hex color from CHART_ORDERED_PALETTE

    // Fallback: match by name from context, or just string parsing out the index
    const match = data.payload.fill ? data.payload.fill.match(/vendorPerfPie-(\d+)/) : null;
    const colorIndex = match ? parseInt(match[1], 10) : 0;
    const color = CHART_ORDERED_PALETTE[colorIndex % CHART_ORDERED_PALETTE.length].base;

    return (
      <div className="flex items-center rounded-md bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] overflow-hidden border border-gray-100">
        <div
          className="px-2 py-1 text-white font-semibold text-xs h-full flex items-center"
          style={{ backgroundColor: color }}
        >
          {data.payload.percentage || 0}
          %
        </div>
        <div className="px-2 py-1 text-gray-800 font-semibold text-xs bg-white h-full flex items-center">
          {shortName}
        </div>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#E4E7EC] rounded-lg px-3 py-2 shadow-md">
        <div className="bg-[#F5F7FA] text-[#1E1E1E] text-xs font-semibold px-2 py-1 rounded mb-2">
          {label}
        </div>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color || '#FBA900' }}
              />
              <span className="text-[#64656D]">
                {entry.name}
                :
              </span>
              <span className="font-semibold text-[#1E1E1E]">
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

interface PortfolioOverviewProps {
  portfolioData: SKUPortfolioResponse | null;
}

const PortfolioOverview = ({ portfolioData }: PortfolioOverviewProps) => {
  if (!portfolioData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-2 w-full">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="bg-white rounded-lg border border-border p-3 h-[80px]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="CubeIcon" size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Total SKUs</div>
              <div className="text-[16px] font-bold text-text-primary">
                {portfolioData.summary.total_skus}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-3 h-[80px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon name="SquaresIcon" size={20} className="text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Categories</div>
              <div className="text-[16px] font-bold text-text-primary">
                {portfolioData.summary.categories_count}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-3 h-[80px]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon
                name="BuildingOfficeIcon"
                size={20}
                className="text-green-600"
              />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Active Vendors</div>
              <div className="text-[16px] font-bold text-text-primary">
                {portfolioData.summary.active_vendors_count}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-3 h-[80px]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Icon name="ChartBarIcon" size={20} className="text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-text-secondary">
                Avg Sustainability
              </div>
              <div className="text-[16px] font-bold text-text-primary">
                {portfolioData.summary.avg_sustainability_score}
                %
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <div className="bg-white rounded-lg border border-border p-4 h-[370px]">
          <h3 className="text-[16px] font-semibold text-text-primary mb-4">
            Performance Distribution
          </h3>
          <div className="mb-4 border-t border-border" />
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <defs>
                {CHART_ORDERED_PALETTE.map((color, index) => (
                  <linearGradient
                    key={index}
                    id={`vendorPerfPie-${index}`}
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
                data={portfolioData.performance_distribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                dataKey="value"
                label={false}
              >
                {portfolioData.performance_distribution.map(
                  (entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#vendorPerfPie-${index % CHART_ORDERED_PALETTE.length
                      })`}
                    />
                  ),
                )}
              </Pie>
              <Tooltip
                content={<CustomPieTooltip />}
                cursor={{ fill: 'transparent' }}
                wrapperStyle={{ zIndex: 100, outline: 'none' }}
                contentStyle={{ backgroundColor: 'transparent', border: 'none' }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
            {portfolioData.performance_distribution.map(
              (item: any, index: number) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: getChartColor(index),
                    }}
                  />
                  <span className="text-sm text-black">{item.label}</span>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Risk Signals */}
        <div className="bg-white rounded-lg border border-border p-4">
          <h3 className="text-[16px] font-semibold text-text-primary mb-4">
            Portfolio Risk Signals
          </h3>
          <hr />
          <div className="space-y-4">
            <div
              className="w-full h-[64px] flex items-center justify-between rounded-[5px]
              border border-[#DD401480] bg-[#DD40140D] px-[20px] py-[10px] gap-[10px] mt-7"
            >
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-[#DD4014]" />
                <div>
                  <div className="text-[14px] font-medium text-black">
                    High Risk SKUs
                  </div>
                  <div className="text-[12px] text-text-secondary">
                    Immediate attention required
                  </div>
                </div>
              </div>
              <div className="text-[16px] font-bold text-black">
                {portfolioData.portfolio_risk_signals.high_risk}
              </div>
            </div>

            <div
              className="w-full h-[64px] flex items-center justify-between rounded-[5px]
              border border-[#FBA90080] bg-[#FBA9000D] px-[20px] py-[10px] gap-[10px] mt-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-[#FBA900]" />
                <div>
                  <div className="text-[14px] font-medium text-black">
                    Medium Risk SKUs
                  </div>
                  <div className="text-[12px] text-text-secondary">
                    Monitoring recommended
                  </div>
                </div>
              </div>
              <div className="text-[16px] font-bold text-black">
                {portfolioData.portfolio_risk_signals.medium_risk}
              </div>
            </div>

            <div
              className="w-full h-[64px] flex items-center justify-between rounded-[5px]
              border border-[#00A94480] bg-[#00A9440D] px-[20px] py-[10px] gap-[10px] mt-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-[#00A944]" />
                <div>
                  <div className="text-[14px] font-medium text-black">
                    Low Risk SKUs
                  </div>
                  <div className="text-[12px] text-text-secondary">
                    Performance on track
                  </div>
                </div>
              </div>
              <div className="text-[16px] font-bold text-black">
                {portfolioData.portfolio_risk_signals.low_risk}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-lg border border-border p-4 h-[460px]">
        <h3 className="text-[16px] font-semibold text-text-primary mb-4">
          Category Breakdown & Performance
        </h3>
        <div className="mb-4 border-t border-border" />
        <div className="w-full">
          <ResponsiveContainer width="100%" height={450}>
            <BarChart
              data={portfolioData.category_breakdown}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 100,
              }}
            >
              <CartesianGrid
                yAxisId="left" // ⭐⭐ THIS IS THE MISSING PIECE
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
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64656D', fontSize: 12 }}
                label={{
                  value: 'SKU Count',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#ACACAC',
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64656D', fontSize: 12 }}
                label={{
                  value: 'Avg Score',
                  angle: 90,
                  position: 'insideRight',
                  fill: '#ACACAC',
                }}
              />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                content={<CustomBarTooltip />}
              />
              <defs>
                {/* Vendor Count → primary[0] */}
                <linearGradient
                  id="skuCountGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="20%"
                    stopColor={CHART_ORDERED_PALETTE[0].base}
                  />
                  <stop
                    offset="100%"
                    stopColor={CHART_ORDERED_PALETTE[0].gradient}
                  />
                </linearGradient>

                {/* Avg Score → secondary[0] */}
                <linearGradient
                  id="avgScoreGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="20%"
                    stopColor={CHART_ORDERED_PALETTE[3].base}
                  />
                  <stop
                    offset="100%"
                    stopColor={CHART_ORDERED_PALETTE[3].gradient}
                  />
                </linearGradient>
              </defs>

              <Bar
                yAxisId="left"
                dataKey="sku_count"
                fill="url(#skuCountGradient)"
                name="SKU Count"
                radius={[10, 10, 0, 0]}
                barSize={55}
              />

              <Bar
                yAxisId="right"
                dataKey="avg_score"
                fill="url(#avgScoreGradient)"
                name="Avg Sustainability Score"
                radius={[10, 10, 0, 0]}
                barSize={55}
              />

              <Legend
                verticalAlign="bottom"
                align="left"
                formatter={(value) => (
                  <span style={{ color: '#1E1E1E', fontSize: 14 }}>
                    {value}
                  </span>
                )}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PortfolioOverview;
