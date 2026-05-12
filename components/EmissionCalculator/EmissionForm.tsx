/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
/* eslint-disable no-nested-ternary */
/* eslint-disable radix */

'use client';

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { Category, EmissionEntry } from '@/lib/interface/IEmissionCalculator';
import { Play } from 'lucide-react';
import { Icon } from '@iconify/react';
import customStyles from '@/components/CustomStyles/CustomStyles';
import { Button } from './Button';
import {
  CATEGORY_CONFIG,
  EMISSION_FACTORS,
  UNIT_CONVERSIONS,
} from './constants';
import './EmissionForm.css';

interface EmissionFormProps {
  onAdd: (entry: EmissionEntry) => void;
}

export const EmissionForm: React.FC<EmissionFormProps> = ({ onAdd }) => {
  const [category, setCategory] = useState<Category>(Category.TRANSPORT);
  const [subType, setSubType] = useState<string>('');
  const [unit, setUnit] = useState<string>('');
  const [country, setCountry] = useState<string>('India');
  const [state, setState] = useState<string>('Maharashtra');
  const [month, setMonth] = useState<string>(
    new Date().toLocaleString('default', { month: 'long' }),
  );
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [value, setValue] = useState<number>(0);
  // const [isAuditing, setIsAuditing] = useState(false);
  const [auditMessage, setAuditMessage] = useState<string | null>(null);
  const [previewEmission, setPreviewEmission] = useState<number | null>(null);

  useEffect(() => {
    const config = CATEGORY_CONFIG[category];
    setSubType(config.options[0]);
    setUnit(config.units[0]);
    if (category === Category.ELECTRICITY) {
      setCountry('India');
      setState('Maharashtra');
    }
    setAuditMessage(null);
    setPreviewEmission(null);
  }, [category]);

  useEffect(() => {
    setPreviewEmission(null);
    setAuditMessage(null);
  }, [value, subType, country, state, unit]);

  const getCalculationData = () => {
    const config = CATEGORY_CONFIG[category];
    let baseFactor = 0;
    let finalDescription = '';
    let displayType = subType;

    if (category === Category.ELECTRICITY) {
      if (country === 'India') {
        baseFactor = (EMISSION_FACTORS.ELECTRICITY_INDIA as any)[state];
        displayType = `Grid (${state})`;
        finalDescription = `Electricity (India - ${state})`;
      } else {
        baseFactor = (EMISSION_FACTORS.ELECTRICITY_GLOBAL as any)[subType] || 0.21;
        displayType = subType;
        finalDescription = `Electricity (${subType})`;
      }
    } else {
      const factorsMap = (EMISSION_FACTORS as any)[
        category === Category.TRANSPORT
          ? 'TRANSPORT'
          : category === Category.STATIONARY_FUEL
            ? 'FUEL'
            : 'REFRIGERANTS'
      ];
      baseFactor = factorsMap[subType];
      displayType = subType;
      finalDescription = subType;
    }

    const conversion = UNIT_CONVERSIONS[unit] || 1;
    const finalFactor = baseFactor * conversion;

    return {
      factor: finalFactor,
      finalDescription,
      config,
      displayType,
    };
  };

  const handleCalculate = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (value <= 0) return;
    const { factor } = getCalculationData();
    setPreviewEmission(value * factor);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const {
      factor, finalDescription, config, displayType,
    } = getCalculationData();
    const emissionValue = value * factor;

    const newEntry: EmissionEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      month,
      year,
      scope: config.scope,
      category,
      description: finalDescription,
      value,
      unit,
      emissionFactor: factor,
      totalKgCO2e: emissionValue,
      details: { subType: displayType, country, state },
    };

    onAdd(newEntry);
    setValue(0);
    setPreviewEmission(null);
    setAuditMessage(null);
  };

  // const runAudit = async (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   if (value <= 0) return;
  //   setIsAuditing(true);
  //   try {
  //     const auditType = category === Category.ELECTRICITY && country === 'India' ? `India ${state} Grid` : subType;
  //     const response = await fetch('/api/gemini', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         action: 'audit',
  //         data: { category, subType: `${auditType} in ${unit}`, value },
  //       }),
  //     });
  //     const result = await response.json();
  //     setAuditMessage(result.message || 'Calculation verified by AI.');
  //   } catch (err) {
  //     setAuditMessage('Audit service unavailable.');
  //   } finally {
  //     setIsAuditing(false);
  //   }
  // };

  return (
    <div
      className="bg-white p-6 rounded-[8px] shadow-sm border border-slate-200 space-y-6"
      style={{ minWidth: '320px' }}
    >
      <div className="flex items-center gap-2">
        {/* <div className="w-1.5 h-5 bg-emerald-500 rounded-full"></div> */}
        <h2 className="text-lg font-bold">Emissions Calculator</h2>
      </div>

      <div className="space-y-6">
        {/* Month and Year Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="form-legend">Select Month</label>
            <Select
              value={{ value: month, label: month }}
              onChange={(option) => option && setMonth(option.value)}
              options={[
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
              ].map((m) => ({ value: m, label: m }))}
              styles={customStyles()}
            />
          </div>
          <div className="space-y-1.5">
            <label className="form-legend">Reporting Year</label>
            <Select
              value={{ value: year, label: year.toString() }}
              onChange={(option) => option && setYear(parseInt(option.value.toString()))}
              options={[2023, 2024, 2025, 2026].map((y) => ({
                value: y,
                label: y.toString(),
              }))}
              styles={customStyles()}
            />
          </div>
        </div>

        {/* Category Row */}
        <div className="space-y-1.5">
          <label className="form-legend">Main Category</label>
          <Select
            value={{ value: category, label: category }}
            onChange={(option) => option && setCategory(option.value as Category)}
            options={Object.values(Category).map((c) => ({
              value: c,
              label: c,
            }))}
            styles={customStyles()}
          />
        </div>

        {/* Dynamic Type/Fuel Row */}
        {category === Category.ELECTRICITY ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="form-legend">Region</label>
              <Select
                value={{ value: country, label: country }}
                onChange={(option) => option && setCountry(option.value)}
                options={[
                  { value: 'India', label: 'India' },
                  { value: 'Global', label: 'Global/Other' },
                ]}
                styles={customStyles()}
              />
            </div>
            <div className="space-y-1.5">
              <label className="form-legend">
                {country === 'India' ? 'State Node' : 'Source Type'}
              </label>
              <Select
                value={{
                  value: country === 'India' ? state : subType,
                  label: country === 'India' ? state : subType,
                }}
                onChange={(option) => option
                  && (country === 'India'
                    ? setState(option.value)
                    : setSubType(option.value))}
                options={
                  country === 'India'
                    ? Object.keys(EMISSION_FACTORS.ELECTRICITY_INDIA).map(
                      (s) => ({ value: s, label: s }),
                    )
                    : Object.keys(EMISSION_FACTORS.ELECTRICITY_GLOBAL).map(
                      (opt) => ({ value: opt, label: opt }),
                    )
                }
                styles={customStyles()}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="form-legend">Specific Type / Fuel</label>
            <Select
              value={{ value: subType, label: subType }}
              onChange={(option) => option && setSubType(option.value)}
              options={CATEGORY_CONFIG[category].options.map((opt) => ({
                value: opt,
                label: opt,
              }))}
              styles={customStyles()}
              className="border-[#E4E7EC]"
            />
          </div>
        )}

        {/* Usage and Unit Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="form-legend">Usage Quantity</label>
            <input
              type="number"
              value={value || ''}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="form-control"
            />
          </div>
          <div className="space-y-1.5">
            <label className="form-legend">Select Unit</label>
            <Select
              value={{ value: unit, label: unit }}
              onChange={(option) => option && setUnit(option.value)}
              options={CATEGORY_CONFIG[category].units.map((u) => ({
                value: u,
                label: u,
              }))}
              styles={customStyles()}
            />
          </div>
        </div>
      </div>

      {/* Action Hub */}
      <div className="border-slate-100 space-y-4">
        {/* Step 1: Calculate Button and Result Area */}
        <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-[8px] border border-slate-200 card">
          <Button
            type="button"
            onClick={handleCalculate}
            // disabled={value <= 0}
            className="glass-button text-[14px] font-medium"
          >
            <span>
              <Play className="w-4 h-4 mr-1" color="#FBA900" />
            </span>
            Run Calculation
          </Button>

          <div className="flex items-center justify-between px-2 pt-6">
            <span className="text-[14px] font-medium text-[#F9F9F9]">
              Emission Result
            </span>
            {previewEmission !== null ? (
              <div className="animate-in fade-in slide-in-from-right-2 flex items-baseline gap-1">
                <span className="text-[14px] text-slate-300 font-medium text-[#F9F9F9]">
                  {previewEmission.toFixed(2)}
                </span>
                <span className="text-[14px] text-slate-300 font-medium text-[#F9F9F9]">
                  kgCO2e
                </span>
              </div>
            ) : (
              <span className="text-[14px] text-slate-300 font-medium italic">
                Pending input...
              </span>
            )}
          </div>
        </div>

        {/* Step 2: Add to Report Button */}
        <Button
          type="button"
          fullWidth
          onClick={handleSubmit}
          // disabled={value <= 0 || previewEmission === null}
          className="h-[40px] text-[14px] font-medium log-btn "
        >
          {' '}
          <span>
            <Icon
              icon="boxicons:arrow-in-right-square-half"
              width={24}
              height={24}
              color="#FBA900"
            />
          </span>
          Commit to Log
        </Button>
      </div>

      {auditMessage && (
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-start gap-3 animate-in fade-in zoom-in-95 duration-200 shadow-sm">
          <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-sm">
            🤖
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">
              AI Audit Verdict
            </p>
            <p className="text-xs text-emerald-700 italic leading-relaxed font-medium">
              {auditMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
