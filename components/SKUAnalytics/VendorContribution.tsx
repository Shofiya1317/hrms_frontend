/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */

'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  // PieChart,
  // Pie,
  // Cell,
} from 'recharts';
import { VendorListItem } from '../../lib/interface/IProduct.interface';

interface VendorContributionProps {
  vendorData: VendorListItem[] | null;
}

const renderLegendText = (value: string) => (
  <span style={{ color: '#1E1E1E', fontSize: 14 }}>{value}</span>
);

const VendorContribution = ({ vendorData }: VendorContributionProps) => {
  if (!vendorData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Vendors Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-text-primary">
            Top Vendor Contributors
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Vendor Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  SKUs Supplied
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Avg Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Portfolio %
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Actions
                </th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {vendorData && vendorData.length > 0 ? (
                vendorData.map((vendor: any) => (
                  <tr key={vendor.vendor_name} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                        {vendor.rank}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-text-primary">
                        {vendor.vendor_name}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-primary">
                        {vendor.sku_count}
                        {' '}
                        SKUs
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-text-primary">
                          {vendor.avg_score}
                          %
                        </div>
                        <div className="w-16 h-2 rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-green-500"
                            style={{ width: `${vendor.avg_score}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-primary">
                        {vendor.portfolio_percentage}
                        %
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-text-secondary"
                  >
                    No vendors found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* <div className="lg:col-span-12 bg-white rounded-lg border border-border p-3">
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Vendor Portfolio Distribution
          </h3>

          <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start">
            <div className="w-full lg:w-1/2 flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={vendorData.vendorDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {vendorData.vendorDistribution.map((entry: any) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full lg:w-1/2 space-y-5 px-5 py-5 mt-3 ml-9">
              {vendorData.vendorDistribution.map((item: any) => (
                <div key={item.name} className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-text-secondary">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-text-primary">
                    {item.value}
                    %
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div> */}

        {/* Vendor Switching Scenario */}
        {/* <div className="bg-white rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Vendor Impact Optimization
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Icon
                  name="LightBulbIcon"
                  size={20}
                  className="text-blue-600"
                />
                <span className="text-sm font-semibold text-blue-900">
                  Optimization Opportunity
                </span>
              </div>
              <p className="text-sm text-blue-800">
                Switching 15% of SKUs from lower-performing vendors to top 3
                vendors could improve overall portfolio sustainability score by
                4.2%.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-green-900">
                  Potential Score Gain
                </span>
                <span className="text-lg font-bold text-green-600">+4.2%</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium text-orange-900">
                  SKUs to Reassign
                </span>
                <span className="text-lg font-bold text-orange-600">
                  187 SKUs
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-purple-900">
                  Estimated Timeline
                </span>
                <span className="text-lg font-bold text-purple-600">
                  3-6 months
                </span>
              </div>
            </div>

            <button
              type="button"
              className="w-full mt-4 px-4 py-3 bg-primary text-white rounded-lg
              hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="DocumentArrowUpIcon" size={20} />
              Generate Switching Scenario Report
            </button>
          </div>
        </div> */}
      </div>

      {/* Sustainability Impact by Vendor */}
      {/* <div className="bg-white rounded-lg border border-border p-4 h-[470px]">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Sustainability Impact by Top Vendors
        </h3>
        <div className="mb-4 border-t border-border" />

        <div className="w-full">
          <ResponsiveContainer width="100%" height={450}>
            <BarChart
              data={vendorData.impactAnalysis}
              barGap={10} // 👈 gap between bars
              barCategoryGap="10%" // 👈 gap between category groups
              margin={{
                top: 20,
                right: 10,
                // left: 10,
                bottom: 100,
              }}
            >
              <CartesianGrid
                horizontal={true}
                vertical={false}
                stroke="#E4E7EC"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="vendor"
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
              <defs>
                <linearGradient
                  id="emissionsGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="19.71%" stopColor="#00BFA6" />
                  <stop offset="100%" stopColor="rgba(0, 191, 166, 0.6)" />
                </linearGradient>

                <linearGradient id="socialGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="19.71%" stopColor="#2380D3" />
                  <stop offset="100%" stopColor="rgba(35, 128, 211, 0.6)" />
                </linearGradient>

                <linearGradient
                  id="governanceGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.5} />
                </linearGradient>

                <linearGradient id="legalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <Bar
                dataKey="emissions"
                fill="url(#emissionsGradient)"
                name="Emissions"
                radius={[10, 10, 0, 0]}
                barSize={55}
              />

              <Bar
                dataKey="social"
                fill="url(#socialGradient)"
                name="Social"
                radius={[10, 10, 0, 0]}
                barSize={55}
              />

              <Bar
                dataKey="governance"
                fill="url(#governanceGradient)"
                name="Governance"
                radius={[10, 10, 0, 0]}
                barSize={55}
              />

              <Bar
                dataKey="legal"
                fill="url(#legalGradient)"
                name="Legal"
                radius={[10, 10, 0, 0]}
                barSize={55}
              />
              <Legend
                verticalAlign="bottom"
                align="left"
                formatter={renderLegendText}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div> */}
    </div>
  );
};

export default VendorContribution;
