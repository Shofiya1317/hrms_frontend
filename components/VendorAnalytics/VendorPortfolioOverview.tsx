/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/no-array-index-key */
/* eslint-disable max-len */
/* eslint-disable react/no-unstable-nested-components */

'use client';

import Image from 'next/image';
import { useState, useMemo } from 'react';
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
import totalVendorsIcon from '@/assests/totalVendors.png';
import totalQuestionnaireIcon from '@/assests/totalQuestionnarie.png';
import avgComplianceIcon from '@/assests/avg_compliance.png';
import earthIcon from '@/assests/earth.png';
import completeIcon from '@/assests/complete.png';
import partialIcon from '@/assests/partial.png';
import pendingIcon from '@/assests/pending.png';
import { VendorPortfolioOverviewResponse } from '@/lib/interface/IVendor.interface';
import { getChartColor, CHART_ORDERED_PALETTE } from '../ui/ChartColors';

interface VendorPortfolioOverviewProps {
  portfolioData: VendorPortfolioOverviewResponse | null;
}

const VendorPortfolioOverview = ({
  portfolioData,
}: VendorPortfolioOverviewProps) => {
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading || !portfolioData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="bg-white border border-[#E4E7EC] rounded-lg px-3 py-2 shadow-md">
        {/* Label */}
        <div className="bg-[#F5F7FA] text-[#1E1E1E] text-xs font-semibold px-2 py-1 rounded mb-2">
          {label}
        </div>

        {/* Values */}
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm"
              style={{ color: entry.color }}
            >
              {/* Color dot */}
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />

              <span>
                {entry.name}
                :
                {' '}
                <span className="font-semibold">{entry.value}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const shortName = (data.payload.label || data.name).split('(')[0].trim();

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

  const distribution = portfolioData?.performanceDistribution || [];

  const getValue = (rating: string) => distribution.find((d: any) => d.name === rating)?.value || 0;

  const computedRiskSignals = {
    low: getValue('A') + getValue('B'),
    medium: getValue('C'),
    high: getValue('D'),
  };

  return (
    <div className="space-y-2 w-full">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
        <div className="bg-white rounded-lg border border-border p-3 h-[80px]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Image
                src={totalVendorsIcon}
                alt="Total Vendors"
                width={20}
                height={20}
              />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Total Vendors</div>
              <div className="text-[16px] font-bold text-text-primary">
                {portfolioData.totalVendors}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-3 h-[80px]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Image
                src={totalQuestionnaireIcon}
                alt="Active Questionnaires"
                width={20}
                height={20}
              />
            </div>
            <div>
              <div className="text-sm text-text-secondary">
                Active Questionnaires
              </div>
              <div className="text-[16px] font-bold text-text-primary">
                {portfolioData.activeQuestionnaires}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-3 h-[80px]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Image
                src={avgComplianceIcon}
                alt="Avg Compliance"
                width={20}
                height={20}
              />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Avg Compliance</div>
              <div className="text-[16px] font-bold text-text-primary">
                {portfolioData.averageCompliance}
                %
              </div>
            </div>
          </div>
        </div>

        {/* <div className="bg-white rounded-lg border border-border p-4 h-[80px]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Image
                src={earthIcon}
                alt="Avg Sustainability"
                width={20}
                height={20}
              />
            </div>
            <div>
              <div className="text-sm text-text-secondary">
                Avg Sustainability
              </div>
              <div className="text-[16px] font-bold text-text-primary">
                {portfolioData.averageSustainability}
                %
              </div>
            </div>
          </div>
        </div> */}
      </div>

      {/* Performance Distribution and Risk Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <div className="bg-white rounded-lg border border-border p-4 h-[370px]">
          <h3 className="text-[16px] font-semibold text-text-primary mb-4">
            Vendor Performance Distribution
          </h3>
          <div className="mb-3 border-t border-border" />

          <div className="mt-3">
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
                  data={portfolioData.performanceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  dataKey="value"
                  label={false}
                >
                  {portfolioData?.performanceDistribution?.map(
                    (entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#vendorPerfPie-${index % CHART_ORDERED_PALETTE.length
                        })`}
                      />
                    ),
                  )}
                </Pie>

                {/* You can keep tooltip or remove it, depending on your UI */}
                <Tooltip
                  content={<CustomPieTooltip />}
                  cursor={{ fill: 'transparent' }}
                  wrapperStyle={{ zIndex: 100, outline: 'none' }}
                  contentStyle={{ backgroundColor: 'transparent', border: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend in row */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
            {portfolioData?.performanceDistribution?.map(
              (item: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: getChartColor(index),
                      }}
                    />
                    <span className="text-sm text-black">{item.name}</span>
                  </div>
                  {/* <span className="text-sm font-semibold text-text-primary">{item.value} SKUs</span> */}
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
          <div className="mb-3 border-t border-border" />
          <div className="space-y-4">
            <div
              className="w-full h-[64px] flex items-center justify-between rounded-[5px]
              border border-[#DD401480] bg-[#DD40140D] px-[20px] py-[10px] gap-[10px] mt-7"
            >
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-[#DD4014]" />

                <div>
                  <div className="text-[14px] font-medium text-black">
                    High Risk Vendors
                  </div>
                  <div className="text-[12px] text-text-secondary">
                    Immediate attention required
                  </div>
                </div>
              </div>

              <div className="text-[16px] font-bold text-black">
                {computedRiskSignals.high}
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
                    Medium Risk Vendors
                  </div>
                  <div className="text-[12px] text-text-secondary">
                    Monitoring recommended
                  </div>
                </div>
              </div>
              <div className="text-[16px] font-bold text-black">
                {computedRiskSignals.high}
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
                    Low Risk Vendors
                  </div>
                  <div className="text-[12px] text-text-secondary">
                    Performance on track
                  </div>
                </div>
              </div>
              <div className="text-[16px] font-bold text-black">
                {computedRiskSignals.medium}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Response Rate Overview */}
      <div className="bg-white rounded-lg p-1 mt-4">
        <h3 className="text-[16px] font-semibold text-text-primary mb-2">
          Questionnaire Response Status
        </h3>
        <div className="mb-3 border-t border-border" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          {/* Complete */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div
                className="w-[50px] h-[45px] rounded-[5px] bg-[#00A9441A] flex items-center justify-center"
                style={{ padding: '7.51px 10.52px' }}
              >
                <Image
                  src={completeIcon}
                  alt="Complete"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>

              <div>
                <div className="text-base font-medium text-success">
                  Complete
                </div>
                <div className="text-sm text-text-secondary">
                  All questions answered
                </div>
              </div>
            </div>

            <div className="text-[16px] font-bold text-black">
              {portfolioData?.questionnaireStatus?.completed}
            </div>
          </div>

          {/* Partial */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div
                className="w-[50px] h-[45px] rounded-[5px] bg-[#F2C6441A] flex items-center justify-center"
                style={{ padding: '7.51px 10.52px' }}
              >
                <Image
                  src={partialIcon}
                  alt="Partial"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>

              <div>
                <div className="text-base font-medium text-warning">
                  Partial
                </div>
                <div className="text-sm text-text-secondary">In progress</div>
              </div>
            </div>

            <div className="text-[16px] font-bold text-black">
              {portfolioData?.questionnaireStatus?.inProgress}
            </div>
          </div>

          {/* Pending */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div
                className="w-[50px] h-[45px] rounded-[5px] bg-[#DD40141A] flex items-center justify-center"
                style={{ padding: '7.51px 10.52px' }}
              >
                <Image
                  src={pendingIcon}
                  alt="Pending"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>

              <div>
                <div className="text-base font-medium text-red-500">
                  Pending
                </div>
                <div className="text-sm text-text-secondary">Not started</div>
              </div>
            </div>

            <div className="text-[16px] font-bold text-black">
              {portfolioData?.questionnaireStatus?.pending}
            </div>
          </div>
        </div>
      </div>

      {/* Category Performance Breakdown */}
      <div className="bg-white rounded-lg border border-border p-4 h-[460px]">
        <h3 className="text-[16px] font-semibold text-text-primary mb-4">
          Category Performance Breakdown
        </h3>
        <div className="mb-3 border-t border-border" />
        <div className="w-full">
          <ResponsiveContainer width="100%" height={450}>
            <BarChart
              data={portfolioData.categoryPerformance}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 100,
              }} // increase bottom margin for spacing
            >
              <CartesianGrid
                yAxisId="left" // ⭐⭐ THIS IS THE MISSING PIECE
                horizontal
                vertical={false}
                stroke="#E4E7EC"
                strokeDasharray="3 3"
              />

              {/* X Axis */}
              <XAxis
                dataKey="category"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64656D', fontSize: 12 }}
              />

              {/* Y Axis Left */}
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64656D', fontSize: 12 }}
                allowDecimals={false}
                label={{
                  value: 'Vendor Count',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#ACACAC',
                }}
              />

              {/* Y Axis Right */}
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64656D', fontSize: 12 }}
                allowDecimals={false}
                label={{
                  value: 'Avg Score',
                  angle: 90,
                  position: 'insideRight',
                  fill: '#ACACAC',
                }}
              />

              {/* Tooltip */}
              <Tooltip
                cursor={{ fill: 'transparent' }}
                content={<CustomTooltip />}
              />

              {/* Define gradient */}
              <defs>
                {/* Vendor Count → primary[0] */}
                <linearGradient
                  id="vendorCountGradient"
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

              {/* Bars with colors */}
              <Bar
                yAxisId="left"
                dataKey="vendorCount"
                fill="url(#vendorCountGradient)"
                name="Participating Vendors"
                radius={[10, 10, 0, 0]}
                barSize={75}
              />
              <Bar
                yAxisId="right"
                dataKey="avgScore"
                fill="url(#avgScoreGradient)"
                name="Average Score"
                radius={[10, 10, 0, 0]}
                barSize={75}
              />

              {/* Legend below chart */}
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

export default VendorPortfolioOverview;
