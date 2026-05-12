/* eslint-disable react/no-array-index-key */

'use client';

import { ITaskDashboardStats } from '@/lib/interface/ITask.interface';
import Vendors from '@/assests/TaskPage/Vector.svg';
import Product from '@/assests/TaskPage/fluent-mdl2_product.svg';
import ClipboardList from '@/assests/TaskPage/clipboard-list.svg';
import Taskcompleted from '@/assests/TaskPage/material-symbols_task-alt-rounded.svg';
import LineIcons from '@/assests/TaskPage/lineicons_trend-up.svg';
import ClipboardClock from '@/assests/TaskPage/clipboard-clock.svg';
import Progress from '@/assests/TaskPage/tabler_progress-alert.svg';
import SolarCalendar from '@/assests/TaskPage/solar_calendar-outline.svg';
import Image from 'next/image';

export default function TaskDashboard({
  dashboardStats,
}: {
  dashboardStats: ITaskDashboardStats;
}) {
  // console.log(dashboardStats, 'stats');

  const tasksDetails = [
    {
      title: 'Total Active Vendors',
      icon: Vendors,
      backgroundColor: '#AE1AF81A',
      value: dashboardStats?.vendors?.active,
    },
    {
      title: 'Total Active Products',
      icon: Product,
      backgroundColor: '#FB8C001A',
      value: dashboardStats?.products?.active,
    },
    {
      title: 'Total Tasks',
      icon: ClipboardList,
      backgroundColor: '#BE8B221A',
      value: dashboardStats?.tasks?.total,
    },
    {
      title: 'Tasks Completed',
      icon: Taskcompleted,
      backgroundColor: '#00A9441A',
      value: dashboardStats?.tasks?.completed,
    },
    {
      title: 'Completion Rate',
      icon: LineIcons,
      backgroundColor: '#00BFA61A',
      value: `${dashboardStats?.tasks?.completion_rate}%`,
    },
    {
      title: 'Tasks Inprogress',
      icon: ClipboardClock,
      backgroundColor: '#00A5CE1A',
      value: dashboardStats?.tasks?.in_progress,
    },
    {
      title: 'Pending',
      icon: Progress,
      backgroundColor: '#F2C6441A',
      value: dashboardStats?.tasks?.pending,
    },
    {
      title: 'Overdue',
      icon: SolarCalendar,
      backgroundColor: '#DD40141A',
      value: dashboardStats?.tasks?.overdue,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
      {tasksDetails.map((task, index) => (
        <div
          key={index}
          className="
          w-full
          h-[95px]
          bg-white
          rounded-[5px]
          border-l-[3px]
          border-l-[#FBA900]
          shadow-[0px_2px_13.7px_0px_rgba(0,0,0,0.06)]
          flex
          items-center
          px-4
        "
        >
          {/* Icon */}
          <div
            className="flex items-center justify-center w-12 h-12 rounded-full"
            style={{ backgroundColor: task.backgroundColor }}
          >
            <Image src={task.icon} alt={task.title} width={22} height={22} />
          </div>

          {/* Text */}
          <div className="ml-5 mt-2">
            <p className="text-sm text-gray-500 mt-2 mb-2">{task.title}</p>
            <p className="text-xl font-semibold text-gray-900">{task.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
