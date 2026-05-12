/* eslint-disable no-nested-ternary */

'use client';

import React from 'react';
import Chart from 'react-apexcharts';

interface PerformanceChartProps {
  data: Array<{ month: string; score: number }>;
}

const PerformanceChart = ({ data }: PerformanceChartProps) => {
  const hasData = data && data.length > 0;
  const months = hasData ? data.map((d) => d.month) : ['No Data'];
  const scores = hasData ? data.map((d) => d.score) : [0];
  const average = hasData ? data.reduce((sum, item) => sum + item.score, 0) / data.length : 0;
  const change = hasData && data.length > 1
    ? ((data[data.length - 1].score - data[0].score) / (data[0].score || 1)) * 100
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
      },
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 4,
    },
    dataLabels: { enabled: false },
    tooltip: {
      theme: 'dark',
      y: { formatter: (value: number) => `${value}` },
    },
    colors: ['#10b981'],
    noData: {
      text: 'No trend data yet',
      align: 'center',
      verticalAlign: 'middle',
      style: { color: '#6b7280', fontSize: '14px' },
    },
  };

  const series = [{ name: 'Sustainability Score', data: scores }];

  return (
    <div className="bg-surface border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Vendor Performance Trend</h3>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <div className="w-3 h-3 bg-emerald-500 rounded-full" />
          <span>Sustainability Score</span>
        </div>
      </div>

      <Chart options={options} series={series} type="area" height={300} />

      <div className="mt-8 pt-4 border-t border-border flex items-center justify-between text-sm">
        <div>
          <span className="text-text-secondary">Average: </span>
          <span className="font-semibold text-text-primary">{average.toFixed(1)}</span>
        </div>
        <div>
          <span className="text-text-secondary">Change: </span>
          <span className={`font-semibold ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'}`}>
            {change.toFixed(1)}
            %
          </span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
