'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getMonthlyConsolidatedReport } from '@/lib/service/attendance';
import {
  FileText,
  CalendarDays,
  UserX,
  PalmtreeIcon,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  CalendarRange,
  X,
  LogIn,
  LogOut,
  Timer,
  BarChart3,
  Calendar,
  DollarSign,
  Activity,
  Umbrella,
  CheckCircle,
  User,
  AlertTriangle,
  XCircle,
  Clock,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = 'monthly' | 'leave' | 'absent' | 'calendar';

type DayStatus =
  | 'present'
  | 'absent'
  | 'leave'
  | 'holiday'
  | 'weekend'
  | 'future';

interface DayRecord {
  checkIn?: string;
  checkOut?: string;
  status: DayStatus;
  leaveType?: 'casual' | 'sick' | 'earned' | 'lop';
  hoursWorked?: string;
  late?: boolean;
}

interface CalendarEmployee {
  id: number;
  name: string;
  department: string;
  avatar: string;
  days: Record<number, DayRecord>; // key = day of month
}

interface Employee {
  id: number;
  name: string;
  department: string;
  avatar: string;
}

interface MonthlyRecord extends Employee {
  present: number;
  absent: number;
  late: number;
  leaves: number;
  workingDays: number;
  attendancePct: number;
  trend: 'up' | 'down' | 'stable';
}

interface LeaveRecord extends Employee {
  casual: number;
  sick: number;
  earned: number;
  lop: number;
  totalTaken: number;
  totalAllowed: number;
}

interface AbsentRecord extends Employee {
  absentDates: string[];
  totalAbsent: number;
  notified: boolean;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const departments = [
  'All Departments',
  'Engineering',
  'Design',
  'HR',
  'Accounts',
  'Operations',
];

const months = [
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
];

const years = ['2024', '2025', '2026', '2027'];

const mockMonthly: MonthlyRecord[] = [
  {
    id: 1,
    name: 'Arjun Ramesh',
    department: 'Engineering',
    avatar: 'AR',
    present: 22,
    absent: 2,
    late: 3,
    leaves: 1,
    workingDays: 26,
    attendancePct: 88,
    trend: 'up',
  },
  {
    id: 2,
    name: 'Priya Nair',
    department: 'Design',
    avatar: 'PN',
    present: 25,
    absent: 0,
    late: 1,
    leaves: 1,
    workingDays: 26,
    attendancePct: 98,
    trend: 'stable',
  },
  {
    id: 3,
    name: 'Karthik Menon',
    department: 'Engineering',
    avatar: 'KM',
    present: 20,
    absent: 4,
    late: 2,
    leaves: 2,
    workingDays: 26,
    attendancePct: 80,
    trend: 'down',
  },
  {
    id: 4,
    name: 'Divya Sharma',
    department: 'HR',
    avatar: 'DS',
    present: 24,
    absent: 1,
    late: 0,
    leaves: 1,
    workingDays: 26,
    attendancePct: 96,
    trend: 'up',
  },
  {
    id: 5,
    name: 'Rahul Iyer',
    department: 'Accounts',
    avatar: 'RI',
    present: 23,
    absent: 2,
    late: 4,
    leaves: 1,
    workingDays: 26,
    attendancePct: 92,
    trend: 'stable',
  },
  {
    id: 6,
    name: 'Meera Krishnan',
    department: 'Operations',
    avatar: 'MK',
    present: 18,
    absent: 6,
    late: 1,
    leaves: 2,
    workingDays: 26,
    attendancePct: 72,
    trend: 'down',
  },
  {
    id: 7,
    name: 'Suresh Pillai',
    department: 'Engineering',
    avatar: 'SP',
    present: 26,
    absent: 0,
    late: 0,
    leaves: 0,
    workingDays: 26,
    attendancePct: 100,
    trend: 'up',
  },
];

const mockLeave: LeaveRecord[] = [
  {
    id: 1,
    name: 'Arjun Ramesh',
    department: 'Engineering',
    avatar: 'AR',
    casual: 1,
    sick: 0,
    earned: 0,
    lop: 0,
    totalTaken: 1,
    totalAllowed: 18,
  },
  {
    id: 2,
    name: 'Priya Nair',
    department: 'Design',
    avatar: 'PN',
    casual: 0,
    sick: 1,
    earned: 0,
    lop: 0,
    totalTaken: 1,
    totalAllowed: 18,
  },
  {
    id: 3,
    name: 'Karthik Menon',
    department: 'Engineering',
    avatar: 'KM',
    casual: 1,
    sick: 1,
    earned: 0,
    lop: 2,
    totalTaken: 4,
    totalAllowed: 18,
  },
  {
    id: 4,
    name: 'Divya Sharma',
    department: 'HR',
    avatar: 'DS',
    casual: 1,
    sick: 0,
    earned: 0,
    lop: 0,
    totalTaken: 1,
    totalAllowed: 18,
  },
  {
    id: 5,
    name: 'Rahul Iyer',
    department: 'Accounts',
    avatar: 'RI',
    casual: 0,
    sick: 0,
    earned: 1,
    lop: 0,
    totalTaken: 1,
    totalAllowed: 18,
  },
  {
    id: 6,
    name: 'Meera Krishnan',
    department: 'Operations',
    avatar: 'MK',
    casual: 0,
    sick: 2,
    earned: 0,
    lop: 4,
    totalTaken: 6,
    totalAllowed: 18,
  },
  {
    id: 7,
    name: 'Suresh Pillai',
    department: 'Engineering',
    avatar: 'SP',
    casual: 0,
    sick: 0,
    earned: 0,
    lop: 0,
    totalTaken: 0,
    totalAllowed: 18,
  },
];

const mockAbsent: AbsentRecord[] = [
  {
    id: 1,
    name: 'Karthik Menon',
    department: 'Engineering',
    avatar: 'KM',
    absentDates: ['May 5', 'May 8', 'May 19', 'May 22'],
    totalAbsent: 4,
    notified: true,
  },
  {
    id: 2,
    name: 'Meera Krishnan',
    department: 'Operations',
    avatar: 'MK',
    absentDates: ['May 1', 'May 2', 'May 9', 'May 14', 'May 15', 'May 28'],
    totalAbsent: 6,
    notified: false,
  },
  {
    id: 3,
    name: 'Arjun Ramesh',
    department: 'Engineering',
    avatar: 'AR',
    absentDates: ['May 12', 'May 26'],
    totalAbsent: 2,
    notified: true,
  },
  {
    id: 4,
    name: 'Divya Sharma',
    department: 'HR',
    avatar: 'DS',
    absentDates: ['May 20'],
    totalAbsent: 1,
    notified: true,
  },
  {
    id: 5,
    name: 'Rahul Iyer',
    department: 'Accounts',
    avatar: 'RI',
    absentDates: ['May 7', 'May 21'],
    totalAbsent: 2,
    notified: false,
  },
] as unknown as AbsentRecord[];

// ─── Calendar Mock Data ────────────────────────────────────────────────────────

function generateDays(
  presentDays: number[],
  absentDays: number[],
  leaveDays: { day: number; type: 'casual' | 'sick' | 'earned' | 'lop' }[],
  lateDays: number[],
  totalDays: number,
  today = 26,
): Record<number, DayRecord> {
  const result: Record<number, DayRecord> = {};
  const holidays = [1]; // May 1 = Labour Day

  for (let d = 1; d <= totalDays; d++) {
    const dow = new Date(2025, 4, d).getDay(); // May 2025
    if (dow === 0 || dow === 6) {
      result[d] = { status: 'weekend' };
      continue;
    }
    if (holidays.includes(d)) {
      result[d] = { status: 'holiday' };
      continue;
    }
    if (d > today) {
      result[d] = { status: 'future' };
      continue;
    }

    const leave = leaveDays.find((l) => l.day === d);
    if (leave) {
      result[d] = { status: 'leave', leaveType: leave.type };
      continue;
    }
    if (absentDays.includes(d)) {
      result[d] = { status: 'absent' };
      continue;
    }

    if (presentDays.includes(d)) {
      const isLate = lateDays.includes(d);
      const inH = isLate ? 9 + Math.floor(Math.random() * 2) + 1 : 9;
      const inM = isLate
        ? Math.floor(Math.random() * 50) + 10
        : Math.floor(Math.random() * 10);
      const outH = 18 + Math.floor(Math.random() * 2);
      const outM = Math.floor(Math.random() * 60);
      const totalMin = outH * 60 + outM - (inH * 60 + inM);
      const hrs = Math.floor(totalMin / 60);
      const mins = totalMin % 60;
      result[d] = {
        status: 'present',
        checkIn: `${String(inH).padStart(2, '0')}:${String(inM).padStart(2, '0')} AM`,
        checkOut: `${String(outH - 12 > 0 ? outH - 12 : outH).padStart(2, '0')}:${String(outM).padStart(2, '0')} PM`,
        hoursWorked: `${hrs}h ${mins}m`,
        late: isLate,
      };
    }
  }
  return result;
}

const mockCalendar: CalendarEmployee[] = [
  {
    id: 1,
    name: 'Arjun Ramesh',
    department: 'Engineering',
    avatar: 'AR',
    days: generateDays(
      [
        2, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 19, 20, 21, 22, 23, 27, 28, 29,
        30,
      ],
      [12, 26],
      [{ day: 25, type: 'casual' }],
      [5, 13, 20],
      31,
    ),
  },
  {
    id: 2,
    name: 'Priya Nair',
    department: 'Design',
    avatar: 'PN',
    days: generateDays(
      [
        2, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 19, 20, 21, 22, 23, 25, 27, 28,
        29, 30,
      ],
      [],
      [{ day: 26, type: 'sick' }],
      [9],
      31,
    ),
  },
  {
    id: 3,
    name: 'Karthik Menon',
    department: 'Engineering',
    avatar: 'KM',
    days: generateDays(
      [2, 6, 7, 9, 12, 14, 15, 16, 20, 21, 23, 27, 28, 29],
      [5, 8, 22],
      [
        { day: 13, type: 'lop' },
        { day: 26, type: 'lop' },
      ],
      [6, 12],
      31,
    ),
  },
  {
    id: 4,
    name: 'Divya Sharma',
    department: 'HR',
    avatar: 'DS',
    days: generateDays(
      [
        2, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 19, 21, 22, 23, 25, 27, 28, 29,
        30,
      ],
      [20],
      [{ day: 26, type: 'earned' }],
      [],
      31,
    ),
  },
  {
    id: 5,
    name: 'Rahul Iyer',
    department: 'Accounts',
    avatar: 'RI',
    days: generateDays(
      [2, 5, 6, 8, 9, 12, 13, 14, 15, 16, 19, 20, 22, 23, 25, 27, 28, 29, 30],
      [7, 21],
      [{ day: 26, type: 'casual' }],
      [5, 9, 13, 20],
      31,
    ),
  },
  {
    id: 6,
    name: 'Meera Krishnan',
    department: 'Operations',
    avatar: 'MK',
    days: generateDays(
      [2, 6, 7, 8, 12, 16, 19, 20, 21, 22, 23, 27, 28],
      [5, 9, 14, 15, 28],
      [
        { day: 13, type: 'sick' },
        { day: 26, type: 'sick' },
      ],
      [6],
      31,
    ),
  },
  {
    id: 7,
    name: 'Suresh Pillai',
    department: 'Engineering',
    avatar: 'SP',
    days: generateDays(
      [
        2, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 19, 20, 21, 22, 23, 25, 26, 27,
        28, 29, 30,
      ],
      [],
      [],
      [],
      31,
    ),
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function Avatar({
  initials,
  size = 'md',
}: {
  initials: string;
  size?: 'sm' | 'md';
}) {
  const colors: Record<string, string> = {
    AR: 'bg-violet-100 text-violet-700',
    PN: 'bg-pink-100 text-pink-700',
    KM: 'bg-amber-100 text-amber-700',
    DS: 'bg-emerald-100 text-emerald-700',
    RI: 'bg-sky-100 text-sky-700',
    MK: 'bg-rose-100 text-rose-700',
    SP: 'bg-indigo-100 text-indigo-700',
  };
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-semibold ${colors[initials] ?? 'bg-slate-100 text-slate-600'}`}
    >
      {initials}
    </div>
  );
}

function TrendBadge({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') {
    return (
      <span className="flex items-center gap-0.5 text-emerald-600 text-xs font-medium">
        <TrendingUp size={13} />
        {' '}
        Better
      </span>
    );
  }
  if (trend === 'down') {
    return (
      <span className="flex items-center gap-0.5 text-rose-500 text-xs font-medium">
        <TrendingDown size={13} />
        {' '}
        Worse
      </span>
    );
  }
  return (
    <span className="flex items-center gap-0.5 text-slate-400 text-xs font-medium">
      <Minus size={13} />
      {' '}
      Same
    </span>
  );
}

function PctBar({ value }: { value: number }) {
  const color = value >= 95
    ? 'bg-emerald-500'
    : value >= 80
      ? 'bg-amber-400'
      : 'bg-rose-500';
  return (
    <div className="flex min-w-[120px] items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 sm:w-24">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span
        className={`text-xs font-semibold ${value >= 95 ? 'text-emerald-600' : value >= 80 ? 'text-amber-600' : 'text-rose-500'}`}
      >
        {value}
        %
      </span>
    </div>
  );
}

function SelectFilter({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="relative w-full sm:w-auto">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 sm:w-auto"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
    </div>
  );
}

// ─── Summary Cards ──────────────────────────────────────────────────────────────
function SummaryCards({
  tab,
  data,
  apiData,
}: {
  tab: TabId;
  data: MonthlyRecord[] | LeaveRecord[] | AbsentRecord[];
  apiData?: any;
}) {
  if (tab === 'monthly') {
    const d = data as MonthlyRecord[];
    const avgPct = apiData?.company_overview?.avg_attendance_rate
      ? parseInt(apiData.company_overview.avg_attendance_rate)
      : Math.round(d.reduce((s, r) => s + r.attendancePct, 0) / (d.length || 1));
    const totalPresent = apiData?.company_overview?.total_present_days ?? d.reduce((s, r) => s + r.present, 0);
    const totalAbsent = apiData?.company_overview?.total_absent_days ?? d.reduce((s, r) => s + r.absent, 0);
    const totalLate = apiData?.company_overview?.total_late_arrivals ?? d.reduce((s, r) => s + r.late, 0);
    const totalEmp = apiData?.total_employees ?? d.length;
    const cards = [
      {
        label: 'Avg Attendance',
        value: `${avgPct}%`,
        sub: 'across all employees',
        icon: BarChart3,
        color: 'text-teal-600',
        bg: 'bg-teal-50',
      },
      {
        label: 'Total Present Days',
        value: totalPresent,
        sub: 'across the month',
        icon: CheckCircle,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
      },
      {
        label: 'Total Absent Days',
        value: totalAbsent,
        sub: 'across the month',
        icon: CalendarDays,
        color: 'text-rose-500',
        bg: 'bg-rose-50',
      },
      {
        label: 'Late Arrivals',
        value: totalLate,
        sub: `${totalEmp} employees total`,
        icon: Users,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
      },
    ];
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {cards.map((c) => (
          <div
            key={c.label}
            className="bg-white border border-slate-200 rounded-xl p-3 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">
                  {c.label}
                </p>
                <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
                <p className="text-[10px] text-slate-400 mt-1">{c.sub}</p>
              </div>
              <div
                className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}
              >
                <c.icon size={16} className={c.color} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tab === 'leave') {
    const d = data as LeaveRecord[];
    const totalLOP = d.reduce((s, r) => s + r.lop, 0);
    const totalSick = d.reduce((s, r) => s + r.sick, 0);
    const totalCasual = d.reduce((s, r) => s + r.casual, 0);
    const noLeave = d.filter((r) => r.totalTaken === 0).length;
    const cards = [
      {
        label: 'LOP Days',
        value: totalLOP,
        sub: 'loss of pay leaves',
        icon: DollarSign,
        color: 'text-rose-500',
        bg: 'bg-rose-50',
      },
      {
        label: 'Sick Leaves',
        value: totalSick,
        sub: 'medical absences',
        icon: Activity,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
      },
      {
        label: 'Casual Leaves',
        value: totalCasual,
        sub: 'personal leaves',
        icon: Umbrella,
        color: 'text-sky-600',
        bg: 'bg-sky-50',
      },
      {
        label: 'No Leave Taken',
        value: noLeave,
        sub: 'employees',
        icon: CheckCircle,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
      },
    ];
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {cards.map((c) => (
          <div
            key={c.label}
            className="bg-white border border-slate-200 rounded-xl p-3 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">
                  {c.label}
                </p>
                <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
                <p className="text-[10px] text-slate-400 mt-1">{c.sub}</p>
              </div>
              <div
                className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}
              >
                <c.icon size={16} className={c.color} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const d = data as AbsentRecord[];
  const totalDays = d.reduce((s, r) => s + r.totalAbsent, 0);
  const unnotified = d.filter((r) => !r.notified).length;
  const chronic = d.filter((r) => r.totalAbsent >= 4).length;
  const cards = [
    {
      label: 'Employees Absent',
      value: d.length,
      sub: 'at least once',
      icon: User,
      color: 'text-rose-500',
      bg: 'bg-rose-50',
    },
    {
      label: 'Total Absent Days',
      value: totalDays,
      sub: 'combined',
      icon: Calendar,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Unnotified',
      value: unnotified,
      sub: 'no prior intimation',
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Chronic Absence',
      value: chronic,
      sub: '4+ days absent',
      icon: TrendingUp,
      color: 'text-slate-600',
      bg: 'bg-slate-100',
    },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white border border-slate-200 rounded-xl p-3 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">
                {c.label}
              </p>
              <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
              <p className="text-[10px] text-slate-400 mt-1">{c.sub}</p>
            </div>
            <div
              className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}
            >
              <c.icon size={16} className={c.color} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Tables ─────────────────────────────────────────────────────────────────────

function MonthlyTable({ data }: { data: MonthlyRecord[] }) {
  return (
    <div className="overflow-x-auto rounded-lg">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {[
              'Employee',
              'Present',
              'Absent',
              'Late',
              'Leaves',
              'Attendance',
              'Trend',
            ].map((h) => (
              <th
                key={h}
                className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 last:pr-0"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((r) => (
            <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
              <td className="py-3 pr-4">
                <div className="flex min-w-[180px] items-center gap-2.5">
                  <Avatar initials={r.avatar} />
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 leading-tight">
                      {r.name}
                    </p>
                    <p className="text-xs text-slate-400">{r.department}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 pr-4">
                <span className="font-semibold text-slate-700">
                  {r.present}
                </span>
                <span className="text-slate-400 text-xs">
                  /
                  {r.workingDays}
                </span>
              </td>
              <td className="py-3 pr-4">
                <span
                  className={`font-semibold ${r.absent > 3 ? 'text-rose-500' : 'text-slate-700'}`}
                >
                  {r.absent}
                </span>
              </td>
              <td className="py-3 pr-4">
                <span
                  className={`font-semibold ${r.late > 2 ? 'text-amber-500' : 'text-slate-700'}`}
                >
                  {r.late}
                </span>
              </td>
              <td className="py-3 pr-4">
                <span className="font-semibold text-slate-700">{r.leaves}</span>
              </td>
              <td className="py-3 pr-4">
                <PctBar value={r.attendancePct} />
              </td>
              <td className="py-3">
                <TrendBadge trend={r.trend} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LeaveTable({ data }: { data: LeaveRecord[] }) {
  return (
    <div className="overflow-x-auto rounded-lg">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {[
              'Employee',
              'Casual',
              'Sick',
              'Earned',
              'LOP',
              'Total Taken',
              'Balance',
            ].map((h) => (
              <th
                key={h}
                className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 last:pr-0"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((r) => (
            <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
              <td className="py-3 pr-4">
                <div className="flex min-w-[180px] items-center gap-2.5">
                  <Avatar initials={r.avatar} />
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 leading-tight">
                      {r.name}
                    </p>
                    <p className="text-xs text-slate-400">{r.department}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 pr-4">
                <span className="font-semibold text-slate-700">{r.casual}</span>
              </td>
              <td className="py-3 pr-4">
                <span className="font-semibold text-slate-700">{r.sick}</span>
              </td>
              <td className="py-3 pr-4">
                <span className="font-semibold text-slate-700">{r.earned}</span>
              </td>
              <td className="py-3 pr-4">
                <span
                  className={`font-semibold ${r.lop > 0 ? 'text-rose-500' : 'text-slate-700'}`}
                >
                  {r.lop}
                </span>
                {r.lop > 0 && (
                  <span className="ml-1 text-xs bg-rose-100 text-rose-500 px-1.5 py-0.5 rounded-full font-medium">
                    LOP
                  </span>
                )}
              </td>
              <td className="py-3 pr-4">
                <span className="font-semibold text-slate-700">
                  {r.totalTaken}
                </span>
              </td>
              <td className="py-3">
                <span
                  className={`font-semibold ${r.totalAllowed - r.totalTaken < 5 ? 'text-amber-500' : 'text-emerald-600'}`}
                >
                  {r.totalAllowed - r.totalTaken}
                </span>
                <span className="text-slate-400 text-xs">
                  /
                  {r.totalAllowed}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AbsentTable({ data }: { data: AbsentRecord[] }) {
  return (
    <div className="overflow-x-auto rounded-lg">
      <table className="w-full min-w-[680px] text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {['Employee', 'Absent Dates', 'Total Days', 'Notified'].map((h) => (
              <th
                key={h}
                className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 last:pr-0"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((r) => (
            <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
              <td className="py-3 pr-4">
                <div className="flex min-w-[180px] items-center gap-2.5">
                  <Avatar initials={r.avatar} />
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 leading-tight">
                      {r.name}
                    </p>
                    <p className="text-xs text-slate-400">{r.department}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 pr-4">
                <div className="flex flex-wrap gap-1">
                  {r.absentDates.map((d) => (
                    <span
                      key={d}
                      className="text-xs bg-rose-50 text-rose-500 border border-rose-100 px-2 py-0.5 rounded-full"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </td>
              <td className="py-3 pr-4">
                <span
                  className={`font-bold ${r.totalAbsent >= 4 ? 'text-rose-500' : 'text-slate-700'}`}
                >
                  {r.totalAbsent}
                </span>
                {r.totalAbsent >= 4 && (
                  <span className="ml-1.5 text-xs bg-rose-100 text-rose-500 px-1.5 py-0.5 rounded-full font-medium">
                    High
                  </span>
                )}
              </td>
              <td className="py-3">
                {r.notified ? (
                  <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-1 rounded-full font-medium">
                    Yes
                  </span>
                ) : (
                  <span className="text-xs bg-red-50 text-red-500 border border-red-100 px-2 py-1 rounded-full font-medium">
                    No
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Calendar View ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<DayStatus, string> = {
  present:
    'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer',
  absent: 'bg-rose-100 text-rose-600 hover:bg-rose-200 cursor-pointer',
  leave: 'bg-amber-100 text-amber-700 hover:bg-amber-200 cursor-pointer',
  holiday: 'bg-violet-100 text-violet-500 cursor-default',
  weekend: 'bg-slate-50 text-slate-300 cursor-default',
  future:
    'bg-white text-slate-200 cursor-default border border-dashed border-slate-100',
};

const STATUS_DOT: Record<DayStatus, string> = {
  present: 'bg-emerald-400',
  absent: 'bg-rose-400',
  leave: 'bg-amber-400',
  holiday: 'bg-violet-400',
  weekend: 'bg-slate-200',
  future: 'bg-slate-100',
};

const LEAVE_LABELS: Record<string, string> = {
  casual: 'Casual Leave',
  sick: 'Sick Leave',
  earned: 'Earned Leave',
  lop: 'Loss of Pay',
};

interface ModalData {
  employee: CalendarEmployee;
  day: number;
  record: DayRecord;
}

function DayModal({ data, onClose }: { data: ModalData; onClose: () => void }) {
  const { employee, day, record } = data;
  const dateStr = new Date(2025, 4, day).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const statusLabel = record.status === 'present'
    ? record.late
      ? 'Present (Late)'
      : 'Present'
    : record.status === 'leave'
      ? LEAVE_LABELS[record.leaveType ?? 'casual']
      : record.status.charAt(0).toUpperCase() + record.status.slice(1);

  const statusColor = record.status === 'present'
    ? record.late
      ? 'text-amber-600 bg-amber-50 border-amber-200'
      : 'text-emerald-700 bg-emerald-50 border-emerald-200'
    : record.status === 'absent'
      ? 'text-rose-600 bg-rose-50 border-rose-200'
      : record.status === 'leave'
        ? 'text-amber-700 bg-amber-50 border-amber-200'
        : 'text-violet-600 bg-violet-50 border-violet-200';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center px-2 pb-2 pt-10 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div
        className="relative flex max-h-[calc(100vh-1rem)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-slate-100 bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 sm:right-4 sm:top-4"
          aria-label="Close attendance detail"
        >
          <X size={16} />
        </button>

        <div className="min-h-0 overflow-y-auto px-4 pb-4 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
          {/* Employee */}
          <div className="mb-5 flex min-w-0 items-start gap-3 pr-10 sm:items-center">
            <Avatar initials={employee.avatar} />
            <div className="min-w-0">
              <p className="break-words font-semibold leading-snug text-slate-800">
                {employee.name}
              </p>
              <p className="mt-0.5 break-words text-xs text-slate-400">
                {employee.department}
              </p>
            </div>
          </div>

          {/* Date */}
          <div className="mb-4 flex min-w-0 items-start gap-2">
            <CalendarDays
              size={14}
              className="mt-0.5 shrink-0 text-slate-400"
            />
            <p className="break-words text-sm leading-5 text-slate-500">
              {dateStr}
            </p>
          </div>

          {/* Status badge */}
          <div
            className={`mb-5 inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium ${statusColor}`}
          >
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[record.status]}`}
            />
            <span className="truncate">{statusLabel}</span>
          </div>

          {/* Check-in / out */}
          {record.status === 'present' && (
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-slate-400">
                  <LogIn size={13} className="shrink-0" />
                  <span className="text-xs font-medium uppercase tracking-wide">
                    Check In
                  </span>
                </div>
                <p className="text-base font-bold text-slate-800">
                  {record.checkIn}
                </p>
                {record.late && (
                  <p className="mt-0.5 text-xs font-medium text-amber-500">
                    Late arrival
                  </p>
                )}
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-slate-400">
                  <LogOut size={13} className="shrink-0" />
                  <span className="text-xs font-medium uppercase tracking-wide">
                    Check Out
                  </span>
                </div>
                <p className="text-base font-bold text-slate-800">
                  {record.checkOut}
                </p>
              </div>
            </div>
          )}

          {record.status === 'present' && record.hoursWorked && (
            <div className="flex flex-col gap-2 rounded-xl bg-indigo-50 px-4 py-3 sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-center gap-2">
                <Timer size={15} className="shrink-0 text-indigo-400" />
                <span className="text-sm font-medium text-indigo-600">
                  Total hours worked:
                </span>
              </div>
              <span className="text-sm font-bold text-indigo-700 sm:ml-auto">
                {record.hoursWorked}
              </span>
            </div>
          )}

          {record.status === 'absent' && (
            <div className="rounded-xl bg-rose-50 px-4 py-3 text-center text-sm font-medium leading-5 text-rose-500">
              No check-in or check-out recorded
            </div>
          )}

          {record.status === 'leave' && (
            <div className="rounded-xl bg-amber-50 px-4 py-3 text-center text-sm font-medium leading-5 text-amber-600">
              {LEAVE_LABELS[record.leaveType ?? 'casual']}
              {' '}
              applied
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CalendarView({ data }: { data: CalendarEmployee[] }) {
  const [modal, setModal] = useState<ModalData | null>(null);

  const daysInMonth = 31; // May 2025
  const firstDow = new Date(2025, 4, 1).getDay();

  // dates in the grid (nulls for leading blanks)
  const gridDays: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function handleCell(emp: CalendarEmployee, day: number) {
    const rec = emp.days[day];
    if (
      !rec
      || rec.status === 'weekend'
      || rec.status === 'future'
      || rec.status === 'holiday'
    ) { return; }
    setModal({ employee: emp, day, record: rec });
  }

  return (
    <div className="min-w-0">
      {/* Legend */}
      <div className="mb-5 flex flex-wrap gap-2 sm:gap-3">
        {[
          { label: 'Present', cls: 'bg-emerald-100 text-emerald-700' },
          { label: 'Absent', cls: 'bg-rose-100 text-rose-600' },
          { label: 'Leave', cls: 'bg-amber-100 text-amber-700' },
          { label: 'Holiday', cls: 'bg-violet-100 text-violet-500' },
          { label: 'Weekend', cls: 'bg-slate-100 text-slate-400' },
        ].map((l) => (
          <span
            key={l.label}
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${l.cls}`}
          >
            {l.label}
          </span>
        ))}
        <span className="w-full text-xs italic text-slate-400 sm:ml-auto sm:w-auto sm:self-center">
          Click a cell to see check-in/out details
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-[1040px] border-separate border-spacing-0 text-xs">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="sticky left-0 z-10 w-44 bg-white pb-3 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                Employee
              </th>
              {gridDays.map((d, i) => (
                <th key={i} className="w-8 pb-3 text-center">
                  {d !== null && (
                    <span className="text-xs font-medium text-slate-500">
                      {d}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((emp) => (
              <tr key={emp.id} className="group">
                {/* Employee name — sticky */}
                <td className="sticky left-0 z-10 bg-white py-2 pr-3 transition-colors group-hover:bg-slate-50/70">
                  <div className="flex items-center gap-2">
                    <Avatar initials={emp.avatar} size="sm" />
                    <div className="min-w-0">
                      <p className="whitespace-nowrap font-medium leading-tight text-slate-700">
                        {emp.name}
                      </p>
                      <p className="text-slate-400 text-xs">{emp.department}</p>
                    </div>
                  </div>
                </td>
                {/* Day cells */}
                {gridDays.map((day, i) => {
                  if (day === null) return <td key={i} />;
                  const rec = emp.days[day];
                  if (!rec) return <td key={i} />;
                  const style = STATUS_STYLES[rec.status];
                  const isClickable = rec.status !== 'weekend'
                    && rec.status !== 'future'
                    && rec.status !== 'holiday';
                  return (
                    <td key={i} className="px-0.5 py-1.5">
                      <button
                        type="button"
                        disabled={!isClickable}
                        className={`mx-auto flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold transition-all disabled:pointer-events-none ${style}`}
                        title={
                          rec.status === 'present'
                            ? `${rec.checkIn} → ${rec.checkOut}`
                            : rec.status === 'leave'
                              ? LEAVE_LABELS[rec.leaveType ?? 'casual']
                              : rec.status
                        }
                        onClick={() => isClickable && handleCell(emp, day)}
                      >
                        {rec.status === 'present'
                          ? rec.late
                            ? 'L'
                            : 'P'
                          : rec.status === 'absent'
                            ? 'A'
                            : rec.status === 'leave'
                              ? rec.leaveType === 'lop'
                                ? 'LO'
                                : 'L'
                              : rec.status === 'holiday'
                                ? 'H'
                                : ''}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && <DayModal data={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function Reports() {
  const params = useParams();
  const subdomain = params?.subdomain as string;
  const [activeTab, setActiveTab] = useState<TabId>('monthly');
  const [selectedMonth, setSelectedMonth] = useState('June');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    {
      id: 'monthly',
      label: 'Monthly Summary',
      icon: <CalendarDays size={15} />,
    },
    // { id: 'leave', label: 'Leave Summary', icon: <PalmtreeIcon size={15} /> },
    // { id: 'absent', label: 'Absent Report', icon: <UserX size={15} /> },
    // {
    //   id: 'calendar',
    //   label: 'Calendar View',
    //   icon: <CalendarRange size={15} />,
    // },
  ];

  useEffect(() => {
    if (!subdomain) return;
    const fetchData = async () => {
      setLoading(true);
      setApiError(null);
      try {
        const monthNum = months.indexOf(selectedMonth) + 1;
        const year = parseInt(selectedYear);
        const response = await getMonthlyConsolidatedReport(subdomain, { year, month: monthNum });
        const payload = response?.data?.data ?? response?.data;
        if (response?.status === 200 && payload?.employee_summaries) {
          setApiData(payload);
        } else {
          setApiData(null);
          setApiError(`API returned status ${response?.status}`);
        }
      } catch (error) {
        console.error('Error fetching report:', error);
        setApiError('Failed to fetch report data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedMonth, selectedYear, subdomain]);

  function filterByDept<T extends { department: string }>(data: T[]): T[] {
    if (selectedDept === 'All Departments') return data;
    return data.filter((r) => r.department === selectedDept);
  }

  const transformedMonthly: MonthlyRecord[] = apiData?.employee_summaries?.map((emp: any) => ({
    id: emp.employee_id,
    name: emp.employee_name,
    department: emp.department || 'N/A',
    avatar: (emp.employee_name as string)?.split(' ').map((w: string) => w[0]).join('').slice(0, 2)
      .toUpperCase() || 'NA',
    present: emp.monthly_overview?.present_days ?? 0,
    absent: emp.monthly_overview?.absent_days ?? 0,
    late: emp.monthly_overview?.late_arrivals ?? 0,
    leaves: emp.leave_impact?.approved_leave ?? 0,
    workingDays: emp.monthly_overview?.working_days ?? 0,
    attendancePct: parseInt(emp.monthly_overview?.attendance_rate) || 0,
    trend: 'stable' as const,
  })) || [];

  const monthlyData = filterByDept(transformedMonthly);
  const leaveData = filterByDept(mockLeave);
  const absentData = filterByDept(mockAbsent);

  return (
    <div className="min-h-screen p-3 sm:p-3 lg:p-4">
      <div className="mx-auto w-full max-w-[1600px]">
        {/* Header */}
        <div className="mb-4">
          <div className="mb-1 flex items-center gap-2">
            <FileText size={20} className="text-slate-500" />
            <h1 className="text-xl font-bold text-slate-800">Reports</h1>
          </div>
          <p className="text-sm text-slate-400">
            Monthly attendance, leave & absence records
          </p>
        </div>

        {/* Filters */}
        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center">
          <SelectFilter
            value={selectedMonth}
            onChange={setSelectedMonth}
            options={months}
          />
          <SelectFilter
            value={selectedYear}
            onChange={setSelectedYear}
            options={years}
          />
          <SelectFilter
            value={selectedDept}
            onChange={setSelectedDept}
            options={departments}
          />
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs text-slate-400 sm:col-span-2 lg:ml-auto">
            <Users size={13} />
            <span>
              {loading ? '...'
                : activeTab === 'monthly'
                  ? monthlyData.length
                  : activeTab === 'leave'
                    ? leaveData.length
                    : activeTab === 'absent'
                      ? absentData.length
                      : mockCalendar.length}
              {' '}
              employees
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-4">
          {tabs.map((t) => (
            <button
              type="button"
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                activeTab === t.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-teal-200 hover:text-teal-600'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                {t.icon}
                {t.label}
              </span>
            </button>
          ))}
        </div>

        {/* Summary Cards — only for non-calendar tabs */}
        {activeTab !== 'calendar' && (
          <SummaryCards
            tab={activeTab}
            data={
              activeTab === 'monthly'
                ? monthlyData
                : activeTab === 'leave'
                  ? leaveData
                  : absentData
            }
            apiData={apiData}
          />
        )}

        {/* Table / Calendar Card */}
        <div className="rounded-lg border border-slate-200 bg-white p-3 sm:p-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
                <p className="text-sm text-slate-400">Loading report data...</p>
              </div>
            </div>
          ) : apiError ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <p className="text-sm font-medium text-rose-500">Failed to load report</p>
              <p className="text-xs text-slate-400">{apiError}</p>
            </div>
          ) : (
            <>
              {activeTab !== 'calendar' && (
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="font-semibold text-slate-700 text-sm">
                    {activeTab === 'monthly'
                      ? 'Attendance Breakdown'
                      : activeTab === 'leave'
                        ? 'Leave Breakdown'
                        : 'Absence Log'}
                    {' '}
                    <span className="font-normal text-slate-400">
                      —
                      {' '}
                      {apiData?.period_label || `${selectedMonth} ${selectedYear}`}
                    </span>
                  </h2>
                  {selectedDept !== 'All Departments' && (
                    <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-full font-medium">
                      {selectedDept}
                    </span>
                  )}
                </div>
              )}

              {activeTab === 'calendar' && (
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="font-semibold text-slate-700 text-sm">
                    Daily Attendance Calendar
                    <span className="font-normal text-slate-400">
                      {' '}
                      —
                      {' '}
                      {selectedMonth}
                      {' '}
                      {selectedYear}
                    </span>
                  </h2>
                  {selectedDept !== 'All Departments' && (
                    <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-full font-medium">
                      {selectedDept}
                    </span>
                  )}
                </div>
              )}

              {activeTab === 'monthly' && <MonthlyTable data={monthlyData} />}
              {activeTab === 'leave' && <LeaveTable data={leaveData} />}
              {activeTab === 'absent' && <AbsentTable data={absentData} />}
              {activeTab === 'calendar' && (
                <CalendarView
                  data={
                    selectedDept === 'All Departments'
                      ? mockCalendar
                      : mockCalendar.filter((e) => e.department === selectedDept)
                  }
                />
              )}

              {activeTab !== 'calendar'
                && (activeTab === 'monthly'
                  ? monthlyData
                  : activeTab === 'leave'
                    ? leaveData
                    : absentData
                ).length === 0 && (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    {apiData === null ? 'No data available for this period.' : 'No records found for this department.'}
                  </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
