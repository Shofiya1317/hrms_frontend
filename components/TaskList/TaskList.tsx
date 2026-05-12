/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-nested-ternary */

'use client';

import Image from 'next/image';
import Select from 'react-select';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Timer, CircleCheckBig } from 'lucide-react';
import { RxCalendar } from 'react-icons/rx';
import { FaRegClock } from 'react-icons/fa';
import { TbProgress } from 'react-icons/tb';
import { TaskStatus, ITask } from '@/lib/interface/ITask.interface';
import TaskNotFound from '@/assests/no-task-found.svg';
import CustomStyles from '../CustomStyles/CustomStylesFilters';
import PercentageBar from '../PercentageBar/PercentageBar';
import Avatar from '../Avatar/Avatar';

type OptionType = {
  value: string;
  label: string;
};

export default function TaskList({
  taskList,
}: {
  taskList: ITask[];
}) {
  const skuOptions: OptionType[] = useMemo(() => {
    const map = new Map<string, OptionType>();

    taskList.forEach((task) => {
      const { product } = task;
      if (!product) return;

      if (!map.has(product.id)) {
        map.set(product.id, {
          value: product.id,
          label: product.product_name,
        });
      }
    });

    return Array.from(map.values());
  }, [taskList]);

  const standardOptions: OptionType[] = useMemo(() => {
    const map = new Map<string, OptionType>();

    taskList.forEach((task) => {
      const standard = task.tenant_standard;
      if (!standard) return;

      if (!map.has(standard.id)) {
        map.set(standard.id, {
          value: standard.id,
          label: standard.name,
        });
      }
    });

    return Array.from(map.values());
  }, [taskList]);

  const financialYearOptions: OptionType[] = useMemo(() => {
    const uniqueYears = Array.from(
      new Set(taskList.map((task) => task.financial_year).filter(Boolean)),
    );

    return uniqueYears.map((year) => ({
      value: year,
      label: year,
    }));
  }, [taskList]);

  const taskCounts = useMemo(() => taskList.reduce(
    (acc, task) => {
      if (task.status === 'pending') acc.pending += 1;
      if (task.status === 'in_progress') acc.in_progress += 1;
      if (task.status === 'completed') acc.completed += 1;
      return acc;
    },
    {
      pending: 0,
      in_progress: 0,
      completed: 0,
    },
  ), [taskList]);

  const router = useRouter();
  const [sku, setSku] = useState<OptionType | null>(null);
  const [standard, setStandard] = useState<OptionType | null>(null);
  const [financialYear, setFinancialYear] = useState<OptionType | null>(null);

  const tasks = taskList;
  // const [loading, setLoading] = useState(true);

  const filteredTasks = useMemo(() => tasks.filter((task) => {
    const matchesSku = sku ? task.product?.id === sku.value : true;

    const matchesStandard = standard
      ? task.tenant_standard?.id === standard.value
      : true;

    const matchesFinancialYear = financialYear
      ? task.financial_year === financialYear.value
      : true;

    return matchesSku && matchesStandard && matchesFinancialYear;
  }), [tasks, sku, standard, financialYear]);

  const STATUS_CONFIG = {
    pending: {
      label: 'Pending',
      bg: '#F2C644',
      Icon: Timer,
      textColor: '#000000',
    },
    in_progress: {
      label: 'In Progress',
      bg: '#FF7800',
      Icon: TbProgress,
      textColor: '#FFFFFF',
    },
    completed: {
      label: 'Completed',
      bg: '#00A944',
      Icon: CircleCheckBig,
      textColor: '#FFFFFF',
    },
  };

  const getStatusBadge = (status: TaskStatus) => {
    const config = STATUS_CONFIG[status];

    if (!config) return null;

    const { label, bg, Icon } = config;

    return (
      <span
        className="inline-flex items-center gap-[3px]
                 rounded-full
                 py-[4px] pr-[9px] pl-[6px]
                 text-xs font-medium text-white"
        style={{
          backgroundColor: bg,
        }}
      >
        <Icon size={14} />
        {label}
      </span>
    );
  };

  const ACTION_LABEL: Record<TaskStatus, string> = {
    pending: 'Start',
    in_progress: 'Continue',
    completed: 'View',
  };

  return (
    <div className="p-3">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Left side: Title & status */}
        <div className="flex items-center gap-3">
          {/* Title */}
          <h1 className="text-xl font-semibold mt-1">Task Overview</h1>

          {/* Status pills */}
          <div className="flex gap-2 text-xs font-medium">
            <span className="px-[10px] py-[4px] rounded-full bg-[#F2C644] text-white">
              {taskCounts.pending}
              {' '}
              Pending
            </span>

            <span className="px-[10px] py-[4px] rounded-full bg-[#FF7800] text-white">
              {taskCounts.in_progress}
              {' '}
              Inprogress
            </span>
          </div>
        </div>

        {/* Right side: Filters */}
        <div className="ml-auto flex flex-wrap gap-3">
          <div className="min-w-[160px]">
            <Select
              styles={CustomStyles}
              options={skuOptions}
              value={sku}
              onChange={(v) => setSku(v)}
              placeholder="SKU"
              isClearable
            />
          </div>

          <div className="min-w-[160px]">
            <Select
              styles={CustomStyles}
              options={standardOptions}
              value={standard}
              onChange={(v) => setStandard(v)}
              placeholder="Standard"
              isClearable
            />
          </div>

          <div className="min-w-[160px]">
            <Select
              styles={CustomStyles}
              options={financialYearOptions}
              value={financialYear}
              onChange={(v) => setFinancialYear(v)}
              placeholder="Financial Year"
              isClearable
            />
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-gray-500 text-center">
            <Image
              src={TaskNotFound}
              alt="No tasks found"
              width={400}
              height={400}
              className="mb-2"
              priority
            />

            <p className="text-[15px] font-semibold">
              {taskList.length === 0
                ? 'No tasks found'
                : 'No tasks match the selected filters'}
            </p>

            {taskList.length > 0 && (
              <p className="text-[12px] mt-1">
                Try changing or clearing your filters
              </p>
            )}
          </div>
        ) : (
          filteredTasks.map((task) => {
            const daysLeft = Math.ceil(
              (new Date(task.due_date).getTime() - Date.now())
                / (1000 * 60 * 60 * 24),
            );

            const isOverdue = daysLeft < 0;

            const progressValue = task.status === 'completed'
              ? 100
              : task.status === 'in_progress'
                ? 50
                : 0;

            return (
              <div
                key={task.id}
                className="w-full h-[160px] p-[20px] rounded-[5px] border border-[#E4E7EC] flex flex-col gap-[8px]"
              >
                {/* Row 1 */}
                <div className="flex items-center justify-between mb-1">
                  <div
                    className="inline-flex items-center gap-2
                border border-[#E4E7EC]
                rounded-full
                px-[10px] pl-[5px] py-[3px]
                h-[30px]
                bg-white"
                  >
                    <Avatar
                      name={task.tenant_standard.name || ''}
                      size="24px"
                      avator={task.tenant_standard.logo_url || ''}
                    />

                    <span className="text-[14px] font-semibold text-gray-800 leading-none whitespace-nowrap">
                      {task.tenant_standard.name}
                    </span>
                  </div>

                  {getStatusBadge(task.status as TaskStatus)}
                </div>

                {/* Row 2 */}
                <div className="flex flex-wrap items-center gap-2 h-[26px] mb-1">
                  <span className="px-[15px] py-[8px] rounded-full bg-[#2380D31A] text-[#2380D3] text-[12px] font-semibold">
                    {task.product.product_name}
                  </span>

                  <span className="px-[15px] py-[8px] rounded-full bg-[#AE1AF81A] text-[#AE1AF8] text-[12px] font-semibold">
                    {task.financial_year}
                  </span>

                  <span className="flex items-center gap-[7px] px-[15px] py-[8px] rounded-full bg-[#FB8C001A] text-[#FB8C00] text-[12px] font-semibold">
                    <FaRegClock size={18} />
                    Due:
                    {' '}
                    {new Date(task.due_date).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </span>

                  <span
                    className={`flex items-center gap-[7px] px-[15px] py-[8px] rounded-full text-[12px] font-semibold ${
                      isOverdue
                        ? 'bg-red-100 text-red-600'
                        : 'bg-[#FA48171A] text-[#FA4817]'
                    }`}
                  >
                    <RxCalendar size={18} />
                    {isOverdue
                      ? `Overdue by ${Math.abs(daysLeft)} days`
                      : `Days left: ${daysLeft}`}
                  </span>
                </div>

                {/* Row 3 */}
                <div className="flex items-center justify-between mt-1 mb-2">
                  <div className="w-full max-w-[70vw]">
                    <p className="mb-0 text-sm font-medium text-black">
                      Progress
                    </p>
                    <PercentageBar
                      value={progressValue}
                      prefixValueShown={false}
                      suffixValueShown
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        if (task.status === 'completed') {
                          router.push(`/task_list/${task?.id}/view`);
                        } else {
                          router.push(`/task_list/${task?.id}`);
                        }
                      }}
                      className="border-none w-[100px] h-[30px] bg-[#383838] text-[12px] font-semibold rounded-md text-white"
                    >
                      {ACTION_LABEL[task.status as TaskStatus]}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
