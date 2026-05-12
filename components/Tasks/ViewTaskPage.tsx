/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable-next-line react-hooks/exhaustive-deps */
/* eslint-disable-next-line max-len */
/* eslint-disable max-len */

'use client';

import {
  useState, useEffect, useMemo, useCallback,
} from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import Select from 'react-select';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import { TaskService } from '@/lib/service';

import customStyles from '../CustomStyles/CustomStyles';

type OptionType = {
  value: string;
  label: string;
  logo?: string; // ✅ ADD THIS
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  productOptions: OptionType[];
  standardOptions: OptionType[];
  vendorDetails: any; // ✅ ADD THIS
  apiKey: string; // ✅ you are using this
  token?: string; // ✅ and this
};

export default function ViewTaskPage({
  isOpen,
  onClose,
  productOptions,
  standardOptions,
  vendorDetails,
  apiKey,
  token,
}: Props) {
  const [isSkuOpen, setIsSkuOpen] = useState(true);
  const [isStandardOpen, setIsStandardOpen] = useState(true);

  const [selectedSku, setSelectedSku] = useState<OptionType | null>(null);
  const [selectedStandard, setSelectedStandard] = useState<OptionType | null>(
    null,
  );

  const [financialYear, setFinancialYear] = useState<OptionType | null>(null);
  const [businessUnit, setBusinessUnit] = useState<OptionType | null>(null);
  const [siteLocation, setSiteLocation] = useState<OptionType | null>(null);

  const [taskDetails, setTaskDetails] = useState<any[]>([]);

  // ✅ set default SKU when productOptions arrive
  useEffect(() => {
    if (productOptions?.length > 0) {
      setSelectedSku(productOptions[0]);
    } else {
      setSelectedSku(null);
    }
  }, [productOptions]);

  // ✅ set default Standard when standardOptions arrive
  useEffect(() => {
    if (standardOptions?.length > 0) {
      setSelectedStandard(standardOptions[0]);
    } else {
      setSelectedStandard(null);
    }
  }, [standardOptions]);

  const getMatchingTaskIds = useCallback(() => {
    if (!vendorDetails?.task?.length) return [];
    if (!selectedSku || !selectedStandard) return [];

    return vendorDetails.task
      .filter((t: any) => {
        const productId = t?.product?.id;
        const standardId = t?.tenant_standard?.id;

        return (
          String(productId) === String(selectedSku.value)
          && String(standardId) === String(selectedStandard.value)
        );
      })
      .map((t: any) => t.id);
  }, [vendorDetails, selectedSku, selectedStandard]);

  useEffect(() => {
    const fetchTasks = async () => {
      const taskIds = getMatchingTaskIds();

      if (!taskIds.length) {
        setTaskDetails([]);
        return;
      }

      try {
        const responses = await Promise.all(
          taskIds.map((id: string) => TaskService.getTaskScores(id, apiKey, token)),
        );

        const tasks = responses
          .map((res: any) => res?.data || res)
          .filter((task: any) => task?.status === 'completed');

        setTaskDetails(tasks);
      } catch (err) {
        // silent
      }
    };

    if (selectedSku && selectedStandard) {
      fetchTasks();
    }
  }, [
    selectedSku,
    selectedStandard,
    vendorDetails,
    apiKey,
    token,
    getMatchingTaskIds, // ✅ REQUIRED
  ]);

  const financialYearOptions = useMemo(() => {
    if (!taskDetails.length) return [];

    return Array.from(
      new Set(taskDetails.map((t: any) => t.financial_year).filter(Boolean)),
    )
      .sort()
      .map((fy) => ({ value: fy, label: fy }));
  }, [taskDetails]);

  useEffect(() => {
    if (financialYearOptions.length > 0) {
      setFinancialYear(financialYearOptions[0]);
    } else {
      setFinancialYear(null);
    }
  }, [financialYearOptions]);

  const filteredTasksByYear = financialYear?.value
    ? taskDetails.filter(
      (task: any) => task.financial_year === financialYear.value,
    )
    : taskDetails;

  const businessUnitOptions = useMemo(() => {
    if (!filteredTasksByYear.length) return [];

    const unique = new Map();

    filteredTasksByYear.forEach((task: any) => {
      const bu = task?.product?.business_unit;
      if (bu?.id) {
        unique.set(bu.id, { value: bu.id, label: bu.name });
      }
    });

    return Array.from(unique.values());
  }, [filteredTasksByYear]);

  const siteOptions = useMemo(() => {
    if (!filteredTasksByYear.length) return [];

    const unique = new Map();

    filteredTasksByYear.forEach((task: any) => {
      const site = task?.product?.site;
      if (site?.id) {
        unique.set(site.id, { value: site.id, label: site.name });
      }
    });

    return Array.from(unique.values());
  }, [filteredTasksByYear]);

  useEffect(() => {
    setBusinessUnit(businessUnitOptions[0] || null);
  }, [businessUnitOptions]);

  useEffect(() => {
    setSiteLocation(siteOptions[0] || null);
  }, [siteOptions]);

  if (!isOpen) {
    return false;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 pt-16">
      <div className="relative bg-white w-[70vw] h-[80vh] rounded-lg overflow-hidden">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 mb-1"
        >
          <X size={22} strokeWidth={3} />
        </button>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-12 h-full pt-4 mt-1">
          {/* LEFT PANEL */}
          <aside className="col-span-3 overflow-y-auto">
            {/* SKU Accordion */}
            <div className="border-y border-x-0 border-[#E4E7EC]">
              <button
                type="button"
                onClick={() => setIsSkuOpen(!isSkuOpen)}
                className="h-[40px] w-full flex justify-between items-center px-4 py-2 text-sm font-medium"
              >
                <span className="text-[#1E1E1E] font-medium font-[12px]">
                  Select SKU
                </span>
                {isSkuOpen ? (
                  <MdKeyboardArrowUp size={24} color="#64656D" />
                ) : (
                  <MdKeyboardArrowDown size={24} color="#64656D" />
                )}
              </button>
            </div>

            {isSkuOpen && (
              <div className="max-h-[250px] overflow-y-auto p-3">
                <div className="flex flex-wrap gap-2">
                  {productOptions.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-500">
                      No SKU available
                    </p>
                  ) : (
                    productOptions.map((sku) => {
                      const isActive = selectedSku?.value === sku.value;

                      return (
                        <button
                          key={sku.value}
                          type="button"
                          onClick={() => setSelectedSku(sku)}
                          className={`
                            w-full h-[50px] flex items-center text-left
                            rounded-lg border-[1px] text-sm transition-all
                            px-[12px] py-[5px]
                            ${
                              isActive
                                ? 'bg-[#F2C6441A] border-[#F2C644] font-medium text-[#1E1E1E]'
                                : 'border-[#E4E7EC] text-gray-700 hover:bg-gray-50'
                            }
                          `}
                        >
                          {sku.label}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Standard Accordion */}
            <div className="border-y border-x-0 border-[#E4E7EC] mt-2">
              <button
                type="button"
                onClick={() => setIsStandardOpen(!isStandardOpen)}
                className="h-[40px] w-full flex justify-between items-center px-4 py-2 text-sm font-medium"
              >
                <span className="text-[#1E1E1E] font-medium font-[12px]">
                  Select Standard
                </span>
                {isStandardOpen ? (
                  <MdKeyboardArrowUp size={24} color="#64656D" />
                ) : (
                  <MdKeyboardArrowDown size={24} color="#64656D" />
                )}
              </button>
            </div>

            {isStandardOpen && (
              <div className="max-h-[250px] overflow-y-auto p-3">
                <div className="flex flex-wrap gap-2">
                  {standardOptions.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-500">
                      No Standards available
                    </p>
                  ) : (
                    standardOptions.map((std) => {
                      const isActive = selectedStandard?.value === std.value;

                      return (
                        <button
                          key={std.value}
                          type="button"
                          onClick={() => setSelectedStandard(std)}
                          className={`
                            w-full h-[50px] flex items-center text-left
                            rounded-lg border-[1px] text-sm transition-all
                            px-[12px] py-[5px] gap-3
                            ${
                              isActive
                                ? 'bg-[#F2C6441A] border-[#F2C644] font-medium text-[#1E1E1E]'
                                : 'border-[#E4E7EC] text-gray-700 hover:bg-gray-50'
                            }
                          `}
                        >
                          {/* ✅ Logo */}
                          {std.logo && (
                            <Image
                              src={std.logo}
                              alt={std.label}
                              width={35}
                              height={35}
                              className="rounded-full object-cover flex-shrink-0"
                            />
                          )}

                          {/* ✅ Name */}
                          <span className="truncate">{std.label}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </aside>

          {/* MAIN CONTENT */}
          <main className="col-span-9 border-l border-[#F9F9F9] p-3 overflow-y-auto">
            <div>
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center mb-1 gap-4 pt-1">
                {/* Title */}
                <h2 className="text-lg font-semibold ml-3 mt-2">View Score</h2>

                {/* Filters */}
                <div className="ml-auto flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  {/* Financial Year */}
                  <div className="min-w-[150px]">
                    <Select
                      styles={customStyles(true)}
                      options={financialYearOptions}
                      value={financialYear}
                      onChange={(selected) => {
                        setFinancialYear(selected);
                      }}
                      placeholder="Financial Year"
                      isDisabled={financialYearOptions.length === 0}
                    />
                  </div>

                  {/* Business Unit */}
                  <div className="min-w-[150px]">
                    <Select
                      styles={customStyles(true)}
                      options={businessUnitOptions}
                      value={businessUnit}
                      onChange={(selected) => setBusinessUnit(selected)}
                      placeholder="Business Unit"
                      isDisabled={businessUnitOptions.length === 0}
                    />
                  </div>

                  {/* Site Location */}
                  <div className="min-w-[150px]">
                    <Select
                      styles={customStyles(true)}
                      options={siteOptions}
                      value={siteLocation}
                      onChange={(selected) => setSiteLocation(selected)}
                      placeholder="Site Location"
                      isDisabled={siteOptions.length === 0}
                    />
                  </div>
                </div>
              </div>

              <hr className="text-[#e5e7eb]" />
              <div className="mt-0">
                {/* 1️⃣ STANDARD HEADER */}
                {filteredTasksByYear.length === 0 ? (
                  <div className="p-6 text-sm text-gray-500 text-center">
                    No tasks found for selected SKU & Standard
                  </div>
                ) : (
                  filteredTasksByYear.map((task: any) => {
                    const tenantStandard = task?.tenant_standard;

                    return (
                      <div key={task.id} className="">
                        {/* 1️⃣ STANDARD HEADER */}
                        <div
                          className="
                            w-full
                            rounded-lg border border-[#E4E7EC]
                            p-3 mb-2
                            flex flex-wrap items-center gap-2
                            justify-between
                          "
                          style={{
                            background:
                              'linear-gradient(90deg, rgba(242,198,68,0.1) 0%, rgba(255,255,255,0.1) 85%)',
                          }}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Standard */}
                            <div className="text-sm">
                              <span className="font-semibold text-[#1E1E1E]">
                                {tenantStandard?.name || '-'}
                              </span>
                            </div>

                            {/* Created At */}
                            <div
                              className="
                                text-xs font-medium
                                rounded-full
                                px-[10px] py-[2px]
                                bg-[#AE1AF81A]
                                whitespace-nowrap
                                text-[#AE1AF8]
                              "
                            >
                              Created on:
                              {' '}
                              {task?.createdAt
                                ? new Date(task.createdAt).toLocaleDateString()
                                : '-'}
                            </div>

                            {/* Submitted At */}
                            <div
                              className="
                            text-xs font-medium
                            rounded-full
                            px-[10px] py-[2px]
                            bg-[#00A9441A]
                            whitespace-nowrap
                            text-[#00A944]
                          "
                            >
                              Submitted on:
                              {' '}
                              {task?.updatedAt
                                ? new Date(task.updatedAt).toLocaleDateString()
                                : '-'}
                            </div>
                          </div>

                          {/* ✅ STANDARD SCORE (RIGHT SIDE) */}
                          <div
                            className="
                              h-[16px]
                              px-[12px]
                              py-[2px]
                              rounded-[60px]
                              text-xs
                              font-medium
                              flex items-center justify-center
                              whitespace-nowrap
                            "
                            style={{
                              background: '#00A9441A',
                              color: '#00A944',
                            }}
                          >
                            Overall Score:
                            {' '}
                            {task?.standard_score ?? '-'}
                          </div>
                        </div>

                        {/* 🔷 THEMES */}
                        {task?.themes?.map((theme: any) => theme?.indicators?.map((indicator: any) => (
                          <div key={indicator.id} className="mb-4">
                            {/* 🔷 Indicator header */}
                            <div
                              className="
                                  w-full
                                  rounded-lg border border-[#E4E7EC]
                                  px-3 py-1 mb-2
                                  flex items-center gap-2
                                  justify-between
                                "
                              style={{
                                background:
                                    'linear-gradient(90deg, rgba(242,198,68,0.1) 0%, rgba(255,255,255,0.1) 85%)',
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <h2 className="text-sm font-medium text-[#1E1E1E] mt-1 whitespace-nowrap">
                                  {indicator?.name || '-'}
                                </h2>

                                <span
                                  className="
                                      text-xs font-medium
                                      rounded-full
                                      px-[10px] py-[2px]
                                      bg-[#FF78001A]
                                      whitespace-nowrap
                                      text-[#FB8C00]
                                    "
                                >
                                  {theme?.name || '-'}
                                </span>
                              </div>

                              {/* ✅ INDICATOR SCORE */}
                              <div
                                className="
                                    h-[16px]
                                    px-[12px]
                                    py-[2px]
                                    rounded-[60px]
                                    text-xs
                                    font-medium
                                    flex items-center justify-center
                                    whitespace-nowrap
                                  "
                                style={{
                                  background: '#00A9441A',
                                  color: '#00A944',
                                }}
                              >
                                Score:
                                {' '}
                                {indicator?.indicator_score ?? '-'}
                              </div>
                            </div>

                            {/* 🔷 Questions */}
                            {[...(indicator.questions || [])]
                              .filter((q: any) => {
                                // ❌ hide dependent questions with no answer
                                if (
                                  q?.is_dependent
                                    && (q?.answer === null
                                      || q?.answer === undefined
                                      || q?.answer === '')
                                ) {
                                  return false;
                                }
                                return true;
                              })
                              .sort(
                                (a: any, b: any) => (a.sequence ?? 0) - (b.sequence ?? 0),
                              )
                              .map((question: any, qIndex: number) => (
                                <div
                                  key={question.id}
                                  className="border rounded-lg p-3 bg-[#FAFAFA] mb-2"
                                >
                                  <div className="text-[13px] text-[#1E1E1E] font-semibold mb-2">
                                    Question
                                    {' '}
                                    {qIndex + 1}
                                    {' '}
                                    :
                                  </div>

                                  <div className="text-[13px] text-[#1E1E1E] mb-1">
                                    {question?.title || '-'}
                                  </div>

                                  <hr className="my-1" />

                                  <div className="text-sm mb-0">
                                    {/* Line 1 — Label */}
                                    <div className=" text-[#1E1E1E] text-[13px] font-medium">
                                      Answer :
                                    </div>

                                    {/* Line 2 — Answer + Score */}
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-[#1E1E1E]">
                                        {question?.answer ?? '-'}
                                      </span>

                                      <div
                                        className="
                                          h-[16px]
                                          px-[12px]
                                          py-[2px]
                                          rounded-[60px]
                                          text-xs
                                          font-medium
                                          flex items-center justify-center
                                          whitespace-nowrap
                                          shrink-0
                                        "
                                        style={{
                                          background: '#00A9441A',
                                          color: '#00A944',
                                        }}
                                      >
                                        Score:
                                        {' '}
                                        {question?.question_score ?? '-'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )))}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
