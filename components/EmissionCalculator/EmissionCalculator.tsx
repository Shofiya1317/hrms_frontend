'use client';

import React, { useState } from 'react';
import { EmissionEntry } from '@/lib/interface/IEmissionCalculator';
import { Trash2 } from 'lucide-react';
import { EmissionForm } from './EmissionForm';
import { Dashboard } from './Dashboard';

const EmissionCalculator: React.FC = () => {
  const [entries, setEntries] = useState<EmissionEntry[]>([]);
  // const [insights, setInsights] = useState<any[]>([]);
  // const [loadingInsights, setLoadingInsights] = useState(false);

  const addEntry = (entry: EmissionEntry) => {
    setEntries((prev) => [entry, ...prev]);
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  // const fetchInsights = async () => {
  //   if (entries.length === 0) return;
  //   setLoadingInsights(true);
  //   try {
  //     const response = await fetch('/api/gemini', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         action: 'insights',
  //         data: { entries },
  //       }),
  //     });
  //     const data = await response.json();
  //     setInsights(data.insights);
  //   } catch (err) {
  //     console.error(err);
  //   } finally {
  //     setLoadingInsights(false);
  //   }
  // };

  return (
    <div className="min-h-screen pt-3">
      <main className="max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-10 gap-8 px-8 py-3">
          {/* Left Panel - Forms & AI */}
          <div className="lg:col-span-5 xl:col-span-3 space-y-6 md:space-y-8">
            <EmissionForm onAdd={addEntry} />
          </div>

          {/* Right Panel - Dashboard & History */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-7">
            <Dashboard entries={entries} />
            <div className="p-0 border-slate-100 flex flex-col justify-between items-start gap-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Calculation Activity Log
              </h3>
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full">
                <span className="text-xs font-bold text-slate-600">
                  {entries.length}
                  {' '}
                  Total Records
                </span>
              </div>
            </div>

            <div className="bg-white rounded-[5px] shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-[#F2C6441A] text-[14px] font-medium">
                    <tr>
                      <th className="px-6 py-4">Period</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Type / Fuel</th>
                      <th className="px-6 py-4 text-right">Usage</th>
                      <th className="px-6 py-4 text-left">Unit</th>
                      <th className="px-6 py-4 text-right">kgCO2e</th>
                      <th className="px-6 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((e) => (
                      <tr
                        key={e.id}
                        className="hover:bg-slate-50/50 transition-colors group "
                        style={{
                          backgroundImage:
                            'linear-gradient(to right, transparent 15px, #e2e8f0 15px, #e2e8f0 calc(100% - 15px), transparent calc(100% - 15px))',
                          backgroundSize: '100% 1px',
                          backgroundPosition: 'bottom',
                          backgroundRepeat: 'no-repeat',
                        }}
                      >
                        <td className="px-6 py-4 text-sm text-[#64656D] font-medium">
                          {e.month}
                          {' '}
                          {e.year}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-1 rounded-xl ${
                              e.scope.includes('Scope 1')
                                ? 'bg-[#2380D31A] text-[#2380D3]'
                                : 'bg-[#FBA9001A] text-[#FBA900] '
                            }`}
                          >
                            {e.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          {e.details.subType}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-medium">
                          {e.value.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-center font-medium">
                          {e.unit}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-right">
                          {e.totalKgCO2e.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => removeEntry(e.id)}
                            className="p-1.5 text-slate-300  "
                            title="Delete entry"
                          >
                            <Trash2 className="w-5 h-5 text-red-500" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {entries.length === 0 && (
                  <div className="p-12 text-center text-slate-400 italic text-sm">
                    No recorded activities in the log.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmissionCalculator;
