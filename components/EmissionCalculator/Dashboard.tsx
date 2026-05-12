'use client';

import React from 'react';
import { EmissionEntry, Scope } from '@/lib/interface/IEmissionCalculator';
// import { Hexagon } from 'lucide-react';
import { Factory, Zap } from 'lucide-react';
import { Icon } from '@iconify/react';
import './Dashboard.css';

interface DashboardProps {
  entries: EmissionEntry[];
}

export const Dashboard: React.FC<DashboardProps> = ({ entries }) => {
  const scopeBreakdown = entries.reduce(
    (acc, curr) => {
      acc[curr.scope] = (acc[curr.scope] || 0) + curr.totalKgCO2e;
      return acc;
    },
    {} as Record<string, number>,
  );

  const totalEmissions = entries.reduce((sum, e) => sum + e.totalKgCO2e, 0);

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-2">
        <div className="footprint-card">
          <div className="card-content">
            <div className="flex align-items-center mb-2 gap-2">
              <div className="flex justify-between items-center gap-2">
                <div className="flex justify-center items-center icon-circle bg-[#00A9441A]">
                  <Icon
                    icon="carbon:carbon-for-ibm-product"
                    width={24}
                    height={24}
                    color="#00A944"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="label font-medium">Total Footprint</div>
                <div className="">
                  <span className="font-semibold text-xl">
                    {(totalEmissions / 1000).toFixed(3)}
                  </span>
                  <span className="font-medium text-sm ms-1">tCO2e</span>
                </div>
              </div>
            </div>

            <div className="text-content">
              <div className="badge bg-[#00A9441A]">
                Accumulated across all reported periods
              </div>
            </div>
          </div>
        </div>
        <div className="footprint-card">
          <div className="card-content">
            <div className="flex align-items-center mb-2 gap-2">
              <div className="flex justify-between items-center gap-2">
                <div className="flex justify-center items-center icon-circle bg-blue-50">
                  <Factory className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="label font-medium">Scope 1 (Direct)</div>
                <div className="">
                  <span className="font-semibold text-xl">
                    {((scopeBreakdown[Scope.SCOPE_1] || 0) / 1000).toFixed(3)}
                  </span>
                  <span className="font-medium text-sm ms-1">tCO2e</span>
                </div>
              </div>
            </div>

            <div className="text-content">
              <div className="badge bg-[#2380D31A]">
                Fuel, vehicles, and direct emissions
              </div>
            </div>
          </div>
        </div>
        <div className="footprint-card">
          <div className="card-content">
            <div className="flex align-items-center mb-2 gap-2">
              <div className="flex justify-between items-center gap-2">
                <div className="flex justify-center items-center icon-circle bg-[#FBA9001A]">
                  <Zap className="w-6 h-6 text-amber-500" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="label font-medium">Scope 2 (Indirect)</div>
                <div className="">
                  <span className="font-semibold text-xl">
                    {((scopeBreakdown[Scope.SCOPE_2] || 0) / 1000).toFixed(3)}
                  </span>
                  <span className="font-medium text-sm ms-1">tCO2e</span>
                </div>
              </div>
            </div>

            <div className="text-content">
              <div className="badge bg-[#FBA9001A]">
                Purchased electricity and utilities
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
