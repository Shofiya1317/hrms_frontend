/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ComparisonChartsProps {
  vendors: Array<{ id: string; name: string; rating: string }>;
  overallScores: Array<{ vendorId: string; score: number }>;
  categoryScores: Array<{ vendorId: string; category: string; score: number }>;
}

const ComparisonChartsApex = ({
  vendors,
  overallScores,
  categoryScores: _categoryScores,
}: ComparisonChartsProps) => {
  // -------------------------
  // 📊 Overall Bar Chart Data
  // -------------------------
  const overallLabels = vendors.map((v) => v.name);
  const overallSeries = [
    {
      name: 'Sustainability Score (%)',
      data: vendors.map((v) => {
        const s = overallScores.find((o) => o.vendorId === v.id);
        return s?.score ?? 0;
      }),
    },
  ];

  const overallOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
    },
    colors: ['#10b981'],
    xaxis: {
      categories: overallLabels,
      labels: { style: { colors: '#616161' } },
    },
    yaxis: {
      min: 0,
      max: 100,
      labels: { style: { colors: '#616161' } },
    },
    grid: { borderColor: '#E0E0E0' },
    tooltip: { theme: 'light' },
    legend: { show: true },
  };

  // -------------------------
  // 🌐 Radar Chart Data
  // -------------------------
  // const categories = Array.from(new Set(categoryScores.map((s) => s.category)));

  // const radarSeries = vendors.map((vendor, index) => ({
  //   name: vendor.name,
  //   data: categories.map((cat) => {
  //     const s = categoryScores.find((cs) => cs.vendorId === vendor.id && cs.category === cat);
  //     return s?.score ?? 0;
  //   }),
  //   color: colors[index % colors.length],
  // }));

  // const radarOptions: ApexCharts.ApexOptions = {
  //   chart: {
  //     type: 'radar',
  //     toolbar: { show: false },
  //   },
  //   xaxis: {
  //     categories,
  //     labels: { style: { colors: '#616161' } },
  //   },
  //   yaxis: {
  //     min: 0,
  //     max: 100,
  //   },
  //   stroke: { width: 2 },
  //   fill: { opacity: 0.2 },
  //   colors,
  //   tooltip: { theme: 'light' },
  //   legend: { show: true },
  //   grid: { borderColor: '#E0E0E0' },
  // };

  return (
    <div className="space-y-6">
      {/* ===========================
              BAR CHART
         =========================== */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Overall Sustainability Scores</h3>
        <div className="w-full h-80">
          <Chart options={overallOptions} series={overallSeries} type="bar" height="100%" />
        </div>
      </div>

      {/* ===========================
              RADAR CHART
         =========================== */}
      {/* <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Category Breakdown Comparison</h3>
        <div className="w-full h-96">
          <Chart options={radarOptions} series={radarSeries} type="radar" height="100%" />
        </div>
      </div> */}
    </div>
  );
};

export default ComparisonChartsApex;
