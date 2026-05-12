'use client';

import React from 'react';
import Chart from 'react-apexcharts';

interface EmissionsChartProps {
  data: Array<{ month: string; emissions: number }>;
  /** The current emissions value from the API (shown in the footer "Current" field) */
  currentEmissions?: number;
}

const EmissionsChart = ({ data, currentEmissions }: EmissionsChartProps) => {
  const hasData = data && data.length > 0;
  const months = hasData ? data.map((d) => d.month) : ['No Data'];
  const emissions = hasData ? data.map((d) => d.emissions) : [0];

  // Use the API-provided currentEmissions value; fall back to last trend point or 0
  const current = currentEmissions ?? (hasData ? data[data.length - 1].emissions : 0);

  const reduction = hasData && data.length > 1
    ? ((data[0].emissions - data[data.length - 1].emissions) / (data[0].emissions || 1)) * 100
    : 0;

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: {
      curve: 'smooth',
      width: 3,
      colors: ['#10b981'],
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 1,
        opacityTo: 0,
        stops: [0, 180],
      },
    },
    markers: {
      size: 4,
      colors: ['#10b981'],
      strokeWidth: 1,
      hover: { size: 6 },
    },
    xaxis: {
      categories: months,
      labels: {
        style: { colors: '#6b7280', fontSize: '12px' },
      },
      axisTicks: { show: false },
      axisBorder: { show: false },
    },
    yaxis: {
      min: 0,
      labels: {
        style: { colors: '#6b7280', fontSize: '12px' },
        formatter: (value: number) => `${value} tons`,
      },
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 4,
    },
    tooltip: {
      theme: 'dark',
      y: { formatter: (value: number) => `${value} tons` },
    },
    dataLabels: { enabled: false },
    colors: ['#10b981'],
    noData: {
      text: 'No emissions data yet',
      align: 'center',
      verticalAlign: 'middle',
      style: { color: '#6b7280', fontSize: '14px' },
    },
  };

  const series = [{ name: 'CO₂ Emissions', data: emissions }];

  return (
    <div className="bg-surface border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Emissions Tracking</h3>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <div className="w-3 h-3 bg-emerald-500 rounded-full" />
          <span>CO₂ Emissions (tons)</span>
        </div>
      </div>

      <Chart options={options} series={series} type="area" height={300} />

      <div className="mt-8 pt-4 border-t border-border flex items-center justify-between text-sm">
        <div>
          <span className="text-text-secondary">Current: </span>
          <span className="font-semibold text-text-primary">
            {current.toLocaleString()}
            {' '}
            tons
          </span>
        </div>
        <div>
          <span className="text-text-secondary">Reduction: </span>
          <span className={`font-semibold ${reduction > 0 ? 'text-green-600' : 'text-gray-500'}`}>
            {reduction.toFixed(1)}
            %
          </span>
        </div>
      </div>
    </div>
  );
};

export default EmissionsChart;
