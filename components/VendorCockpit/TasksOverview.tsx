/* eslint-disable
  no-nested-ternary,
  react/no-array-index-key,
  react/no-unused-prop-types,
  max-len,
  camelcase
*/

'use client';

import React, { ReactNode, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Select, { StylesConfig } from 'react-select';
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { LuTrendingUp } from 'react-icons/lu';
import {
  NotepadText,
  BookText,
  Headset,
  Timer,
  CircleCheckBig,
} from 'lucide-react';
import { HiOutlineQuestionMarkCircle } from 'react-icons/hi';
import { RxCalendar } from 'react-icons/rx';
import { FaRegClock } from 'react-icons/fa';
import { TbProgress } from 'react-icons/tb';
import {
  TaskStatus,
  ITask,
  ISustainabilityData,
} from '@/lib/interface/ITask.interface';
import TaskNotFound from '@/assests/no-task-found.svg';
import PercentageBar from '../PercentageBar/PercentageBar';
import './TasksOverview.css';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface RingMetric {
  label: string;
  value: number;
  color: string;
}

interface ResourceItem {
  label: string;
  description: string;
  bgColor: string;
  icon: ReactNode;
}

interface SelectOption {
  value: string;
  label: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const THEME_COLORS = [
  '#00A944',
  '#2380D3',
  '#FF7800',
  '#AE1AF8',
  '#FBA900',
  '#FA4817',
];

const RESOURCES: ResourceItem[] = [
  {
    label: 'Sustainability Guidelines',
    description: 'Complete guide to our sustainability standards',
    bgColor: '#AE1AF8',
    icon: <NotepadText color="#ffffff" />,
  },
  {
    label: 'FAQ',
    description: 'Frequently asked questions and answers',
    bgColor: '#FF7800',
    icon: <HiOutlineQuestionMarkCircle color="#ffffff" size={25} />,
  },
  {
    label: 'Training Materials',
    description: 'Educational resources and tutorials',
    bgColor: '#2380D3',
    icon: <BookText color="#ffffff" />,
  },
  {
    label: 'Contact Support',
    description: 'Get help from our team',
    bgColor: '#3AB37E',
    icon: <Headset color="#ffffff" />,
  },
];

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; bg: string; textColor: string; Icon: React.ElementType }
> = {
  pending: {
    label: 'Pending',
    bg: '#FBA90012',
    Icon: Timer,
    textColor: '#FBA900',
  },
  in_progress: {
    label: 'In Progress',
    bg: '#FF780012',
    Icon: TbProgress,
    textColor: '#FF7800',
  },
  completed: {
    label: 'Completed',
    bg: '#00A94412',
    Icon: CircleCheckBig,
    textColor: '#00A944',
  },
};

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'completed', label: 'Completed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending', label: 'Pending' },
];

// ─── Styles ────────────────────────────────────────────────────────────────────

const customStyles: StylesConfig<SelectOption, false> = {
  control: (provided) => ({
    ...provided,
    minWidth: '130px',
    height: '34px',
    borderRadius: '8px',
    border: '1px solid #E4E7EC',
    backgroundColor: '#ffffff',
    boxShadow: 'none',
    cursor: 'pointer',
    '&:hover': { borderColor: '#D0D5DD' },
  }),
  option: (provided, { isFocused, isSelected }) => ({
    ...provided,
    backgroundColor: isSelected ? '#fba900' : isFocused ? '#e9eaed' : '#ffffff',
    color: isSelected ? '#ffffff' : isFocused ? '#fba900' : '#64656D',
    cursor: 'pointer',
    fontSize: '13px',
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '8px',
    marginTop: 4,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    zIndex: 50,
  }),
  menuList: (provided) => ({
    ...provided,
    maxHeight: '160px',
    overflowY: 'auto',
    padding: '4px',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#1E1E1E',
    fontSize: '13px',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#9DA4AE',
    fontSize: '13px',
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    padding: '0 6px',
    color: '#9DA4AE',
    display: state.hasValue ? 'none' : 'flex',
  }),
  clearIndicator: (provided) => ({
    ...provided,
    padding: '0 6px',
    cursor: 'pointer',
    color: '#9DA4AE',
    '&:hover': { color: '#666' },
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  valueContainer: (provided) => ({
    ...provided,
    paddingRight: '0px',
  }),
};

// ─── FilterSelect ──────────────────────────────────────────────────────────────

const FilterSelect: React.FC<{
  options: SelectOption[];
  value: SelectOption | null;
  onChange: (opt: SelectOption | null) => void;
  placeholder: string;
}> = ({
  options, value, onChange, placeholder,
}) => (
  <Select<SelectOption>
    options={options}
    value={value}
    onChange={onChange}
    styles={customStyles}
    isSearchable={false}
    placeholder={placeholder}
    isClearable
  />
);

// ─── GaugeChart ────────────────────────────────────────────────────────────────

const GaugeChart: React.FC<{ value?: number }> = ({ value = 55 }) => {
  const totalSegments = 20;
  const filled = Math.round((value / 100) * totalSegments);
  const outerR = 115;
  const innerR = 90;
  const centerX = 140;
  const centerY = 152;
  const angleStep = 180 / (totalSegments - 1);

  const segments = Array.from({ length: totalSegments }, (_, i) => {
    const angle = 180 - i * angleStep;
    const rad = (angle * Math.PI) / 180;
    return (
      <line
        key={i}
        x1={centerX + outerR * Math.cos(rad)}
        y1={centerY - outerR * Math.sin(rad)}
        x2={centerX + innerR * Math.cos(rad)}
        y2={centerY - innerR * Math.sin(rad)}
        stroke={i < filled ? '#16a34a' : '#e5e7eb'}
        strokeWidth={8}
        strokeLinecap="butt"
      />
    );
  });

  return (
    <div
      style={{
        position: 'relative',
        width: '280px',
        height: '160px',
        margin: '0 auto',
      }}
    >
      <svg width="280" height="160" viewBox="0 0 280 160">
        {segments}
      </svg>
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '22px', fontWeight: 'bold' }}>
          {value}
          %
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>Total</div>
      </div>
    </div>
  );
};

// ─── SmallRingGauge ────────────────────────────────────────────────────────────

const SmallRingGauge: React.FC<{
  value: number;
  color: string;
  label: string;
}> = ({ value, color, label }) => (
  <div className="flex items-center gap-3">
    <div className="w-11 h-11">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius={14}
          outerRadius={20}
          startAngle={90}
          endAngle={-270}
          data={[{ value, fill: color }]}
          barSize={5}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar
            dataKey="value"
            cornerRadius={8}
            background={{ fill: '#f1f5f9' }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
    <div>
      <div className="text-lg font-bold text-slate-800">
        {value}
        %
      </div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  </div>
);

// ─── SemiCircularProgress ──────────────────────────────────────────────────────

const SemiCircularProgress: React.FC<{ value: number; color: string }> = ({
  value,
  color,
}) => (
  <div className="relative max-w-[260px] h-[160px] mx-auto mb-5">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={[
            { value, fill: color },
            { value: 100 - value, fill: '#f1f5f9' },
          ]}
          cx="50%"
          cy="80%"
          startAngle={180}
          endAngle={0}
          innerRadius={80}
          outerRadius={90}
          paddingAngle={0}
          dataKey="value"
          cornerRadius={6}
          stroke="none"
        >
          {[color, '#f1f5f9'].map((fill, idx) => (
            <Cell key={idx} fill={fill} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
    <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
      <div className="text-[26px] font-bold text-slate-800">
        {value}
        %
      </div>
      <div className="text-[12px] text-slate-400 mt-1">Total</div>
    </div>
  </div>
);

// ─── TaskRow ───────────────────────────────────────────────────────────────────

const TaskRow: React.FC<{ task: ITask }> = React.memo(({ task }) => {
  const router = useRouter();
  const config = STATUS_CONFIG[task.status];

  const handleClick = () => {
    router.push(
      task.status === 'completed' ? `/task/${task.id}/view` : `/task/${task.id}`,
    );
  };

  const formattedDueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    : 'No Due Date';

  const due = task.due_date ? new Date(task.due_date) : null;
  const diffDays = due
    ? Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const daysLeftLabel = diffDays !== null && diffDays >= 0 ? `Days left: ${diffDays}` : 'Overdue';

  return (
    <div
      className="w-full text-left group border border-gray-200 rounded-xl p-3 mb-3 bg-white hover:shadow-md transition-all duration-200 h-[120px] cursor-pointer"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
      }}
    >
      <div className="flex justify-between items-center gap-4 h-full">
        <div className="flex-1">
          <div className="flex justify-between">
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-gray-800">
                {task.tenant_standard?.name?.replace(/_[^_]*$/, '')
                  ?? 'Unknown Standard'}
              </h3>
              <span className="text-sm text-[#64656D]">
                {task.product?.product_name ?? 'Unknown SKU'}
              </span>
            </div>
            {config && (
              <span
                className="h-[25px] inline-flex items-center gap-[3px] rounded-full py-[4px] pr-[9px] pl-[6px] text-xs font-medium"
                style={{ backgroundColor: config.bg, color: config.textColor }}
              >
                <config.Icon size={14} />
                {config.label}
              </span>
            )}
          </div>
          <div className="flex justify-between">
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="px-[15px] py-[8px] rounded-full bg-[#2380D312] text-[#2380D3] text-[12px] font-semibold">
                {task.financial_year ?? '—'}
              </span>
              <span className="flex items-center gap-[7px] px-[15px] py-[8px] rounded-full bg-[#FB8C0012] text-[#FB8C00] text-[12px] font-semibold">
                <FaRegClock size={18} />
                {task.due_date ? `Due: ${formattedDueDate}` : 'No Due Date'}
              </span>
              {task.status !== 'completed' && (
                <span className="flex items-center gap-[7px] px-[15px] py-[8px] rounded-full bg-[#FA481712] text-[#FA4817] text-[12px] font-semibold">
                  <RxCalendar size={18} />
                  {daysLeftLabel}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-3 w-[190px]">
              <PercentageBar
                value={task.progressPercentage}
                prefixValueShown={false}
                suffixValueShown
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center h-full justify-between min-w-[100px]">
          <div className="bg-[#00A944] text-white rounded-lg px-3 py-2 text-center w-[120px]">
            <p className="text-[14px] opacity-90">Score</p>
            <p className="text-xl font-bold leading-none">
              {task.standardScore}
              %
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

TaskRow.displayName = 'TaskRow';

// ─── TasksOverview ─────────────────────────────────────────────────────────────

interface TasksOverviewProps {
  tasks: ITask[];
  apiKey: string;
  token: string;
  sustainabilityData: ISustainabilityData;
}

export default function TasksOverview({
  tasks,
  sustainabilityData,
}: TasksOverviewProps) {
  // ── Filter state ───────────────────────────────────────────────────────────
  const [selectedSku, setSelectedSku] = useState<SelectOption | null>(null);
  const [selectedFy, setSelectedFy] = useState<SelectOption | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<SelectOption | null>(
    null,
  );

  // ── Derived ring metrics from sustainabilityData ───────────────────────────
  const ringMetrics = useMemo<RingMetric[]>(
    () => sustainabilityData.performance_summary.theme_scores.map(
      (theme, index) => ({
        label: theme.theme_name,
        value: theme.score,
        color: THEME_COLORS[index % THEME_COLORS.length],
      }),
    ),
    [sustainabilityData.performance_summary.theme_scores],
  );

  // ── Derive filter options dynamically from tasks ───────────────────────────
  const skuOptions = useMemo<SelectOption[]>(() => {
    const seen = new Set<string>();
    const opts: SelectOption[] = [];
    tasks.forEach((t) => {
      const name = t.product?.product_name;
      if (name && !seen.has(name)) {
        seen.add(name);
        opts.push({ value: name, label: name });
      }
    });
    return opts;
  }, [tasks]);

  const fyOptions = useMemo<SelectOption[]>(() => {
    const seen = new Set<string>();
    const opts: SelectOption[] = [];
    tasks.forEach((t) => {
      if (t.financial_year && !seen.has(t.financial_year)) {
        seen.add(t.financial_year);
        opts.push({ value: t.financial_year, label: t.financial_year });
      }
    });
    return opts.sort((a, b) => b.value.localeCompare(a.value));
  }, [tasks]);

  // ── Apply filters ──────────────────────────────────────────────────────────
  const filteredTasks = useMemo(
    () => tasks.filter((task) => {
      const skuMatch = !selectedSku || task.product?.product_name === selectedSku.value;
      const fyMatch = !selectedFy || task.financial_year === selectedFy.value;
      const statusMatch = !selectedStatus
          || task.status === (selectedStatus.value as TaskStatus);
      return skuMatch && fyMatch && statusMatch;
    }),
    [tasks, selectedSku, selectedFy, selectedStatus],
  );

  // ── Progress tracking stats from sustainabilityData ───────────────────────
  const { overall_sustainability_score } = sustainabilityData.performance_summary;
  const {
    overall_completion_rate, total, completed, in_progress, pending,
  } = sustainabilityData.progress_tracking;

  const progressStats = useMemo(
    () => [
      {
        label: 'Total',
        value: total,
        bgColor: '#E4E7EC7D',
        textColor: '#1E1E1E',
      },
      {
        label: 'Completed',
        value: completed,
        bgColor: '#00A9441A',
        textColor: '#00A944',
      },
      {
        label: 'In Progress',
        value: in_progress,
        bgColor: '#2380D31A',
        textColor: '#2380D3',
      },
      {
        label: 'Pending',
        value: pending,
        bgColor: '#F2C6441A',
        textColor: '#FBA900',
      },
    ],
    [total, completed, in_progress, pending],
  );

  return (
    <div className="min-h-screen p-2">
      <div className="max-w-full">
        {/* ── Top Grid ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-2">
          {/* Performance Summary */}
          <div className="col-span-4 px-3 border border-border rounded-lg h-[710px]">
            <h3 className="px-2 text-[16px] font-semibold text-[#1E1E1E] mb-4 mt-4">
              Performance Summary
            </h3>
            <div className="p-3 text-center border border-border rounded-lg">
              <h4 className="text-[14px] font-semibold text-[#1E1E1E] mb-3 mt-2">
                Overall Sustainability Rating
              </h4>
              <GaugeChart value={overall_sustainability_score} />
              <div className="mt-4">
                <span className="inline-flex items-center gap-2 bg-[#00A944] text-[#ffffff] text-[13px] py-1 px-2 rounded-full">
                  <LuTrendingUp color="#ffffff" size={20} />
                  +
                  {overall_sustainability_score}
                  {' '}
                  points
                </span>
              </div>
            </div>
            <div className="max-h-[330px] overflow-y-auto custom-scroll pr-0.5">
              {ringMetrics.map((metric, idx) => (
                <div
                  className="border border-border rounded-lg mt-3 py-2 px-3 h-[65px]"
                  key={`${metric.label}-${idx}`}
                >
                  <SmallRingGauge
                    value={metric.value}
                    color={metric.color}
                    label={metric.label}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Task Overview */}
          <div className="col-span-8 border border-border rounded-lg p-3 h-[710px]">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[16px] px-2 font-semibold text-[#1E1E1E]">
                Task Overview
              </h3>
              <div className="flex gap-2 mb-2">
                <FilterSelect
                  options={skuOptions}
                  value={selectedSku}
                  onChange={setSelectedSku}
                  placeholder="SKU"
                />
                <FilterSelect
                  options={fyOptions}
                  value={selectedFy}
                  onChange={setSelectedFy}
                  placeholder="Financial Year"
                />
                <FilterSelect
                  options={STATUS_OPTIONS}
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  placeholder="Status"
                />
              </div>
            </div>
            <div className="max-h-[610px] overflow-y-auto pr-1 custom-scroll">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))
              ) : (
                <div className="w-full mt-5 min-h-[50vh] flex flex-col items-center justify-center text-gray-500 text-center">
                  <Image
                    src={TaskNotFound}
                    alt="No tasks found"
                    width={500}
                    height={600}
                    className="mb-2"
                    priority
                  />

                  <p className="text-[15px] font-semibold">
                    {tasks.length === 0
                      ? 'No tasks found'
                      : 'No tasks match the selected filters'}
                  </p>

                  {tasks.length > 0 && (
                    <p className="text-[12px] mt-1">
                      Try changing or clearing your filters
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom Grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-2 mt-2">
          {/* Progress Tracking */}
          <div className="col-span-7 bg-white rounded-lg px-3 border border-slate-100">
            <h3 className="px-2 text-[16px] font-semibold text-[#1E1E1E] mb-4 mt-4">
              Progress Tracking
            </h3>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-4 p-3 text-center border border-border rounded-lg mb-3">
                <h4 className="text-[14px] font-semibold text-[#1E1E1E] text-center mb-4 mt-3">
                  Overall Completion Rate
                </h4>
                <SemiCircularProgress
                  value={overall_completion_rate}
                  color="#AE1AF8"
                />
              </div>
              <div className="col-span-8">
                {progressStats.map((stat, idx) => (
                  <div
                    key={`${stat.label}-${idx}`}
                    className="flex justify-between items-center px-4 rounded-xl mb-3 h-[65px]"
                    style={{ backgroundColor: stat.bgColor }}
                  >
                    <span className="text-[13px] font-medium text-[#64656D]">
                      {stat.label}
                    </span>
                    <span
                      className="font-bold text-[15px]"
                      style={{ color: stat.textColor }}
                    >
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resource Center */}
          <div className="col-span-5 bg-white rounded-lg px-3 border border-slate-100">
            <h3 className="text-[16px] font-semibold text-[#1E1E1E] mb-4 px-2 mt-4">
              Resource Center
            </h3>
            <div>
              {RESOURCES.map((resource, idx) => (
                <div
                  key={`${resource.label}-${idx}`}
                  className="flex items-start gap-3 px-2 py-3 border border-border rounded-lg mb-3 h-[65px]"
                >
                  <div
                    className="w-[35px] h-[35px] rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: resource.bgColor }}
                  >
                    {resource.icon}
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-[#64656D]">
                      {resource.label}
                    </div>
                    <div className="text-[12px] text-slate-500">
                      {resource.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
