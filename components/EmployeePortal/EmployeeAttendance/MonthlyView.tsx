'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  ChevronLeft, ChevronRight, Calendar, Loader2, CheckCircle2, XCircle,
  Clock, AlertCircle, Award, RotateCcw, Sun, Moon, Zap, Info, TrendingUp,
} from 'lucide-react';
import { getAttendances } from '@/lib/service/attendance';

type AttendanceStatus = 'present' | 'absent' | 'on_leave' | 'weekend' | 'holiday';

interface IAttendanceLog {
  id: string;
  attendance_date: string;
  attendance_status: AttendanceStatus;
  check_in_time: string | null;
  check_out_time: string | null;
  total_worked_hours: string;
  is_late: boolean;
  late_by_minutes: number;
  is_regularized: boolean;
  remarks: string | null;
  day_type: string;
  shift_name: string;
  leave_info: any;
  holiday_info: any;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  present: { label: 'Present', color: '#16a34a', bg: '#f0fdf4', dot: '#16a34a' },
  late: { label: 'Late', color: '#f59e0b', bg: '#fffbeb', dot: '#f59e0b' },
  on_leave: { label: 'Leave', color: '#2563eb', bg: '#eff6ff', dot: '#2563eb' },
  absent: { label: 'Absent', color: '#ef4444', bg: '#fef2f2', dot: '#ef4444' },
  holiday: { label: 'Holiday', color: '#8b5cf6', bg: '#f5f3ff', dot: '#8b5cf6' },
  weekend: { label: 'Weekend', color: '#9ca3af', bg: '#f9fafb', dot: '#9ca3af' },
  regularized: { label: 'Regularized', color: '#10b981', bg: '#ecfdf5', dot: '#10b981' },
  future: { label: '', color: '#d1d5db', bg: '#f9fafb', dot: '#d1d5db' },
};

const LEGEND = [
  { status: 'present', label: 'Present' },
  { status: 'late', label: 'Late' },
  { status: 'on_leave', label: 'Leave' },
  { status: 'absent', label: 'Absent' },
  { status: 'holiday', label: 'Holiday' },
  { status: 'regularized', label: 'Regularized' },
  { status: 'weekend', label: 'Weekend' },
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function fmtTime(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function fmtHours(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export default function MonthlyAttendancePage() {
  const params = useParams();
  const subdomain = params?.subdomain as string;
  
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [logs, setLogs] = useState<IAttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<IAttendanceLog | null>(null);

  useEffect(() => {
    if (subdomain) fetchAttendance();
  }, [subdomain, currentMonth, currentYear]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      
      const params = {
        from_date: firstDay.toISOString().split('T')[0],
        to_date: lastDay.toISOString().split('T')[0],
        limit: 100,
      };
      
      const res = await getAttendances(subdomain, params);
      const raw = Array.isArray(res?.data) ? res.data : res?.data?.data ?? [];
      setLogs(raw);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const present = logs.filter(l => l.attendance_status === 'present').length;
    const absent = logs.filter(l => l.attendance_status === 'absent').length;
    const leave = logs.filter(l => l.attendance_status === 'on_leave').length;
    const late = logs.filter(l => l.is_late).length;
    const holiday = logs.filter(l => l.attendance_status === 'holiday').length;
    const regularized = logs.filter(l => l.is_regularized).length;
    
    const workingDays = logs.filter(l => l.day_type === 'working_day').length;
    const attendanceRate = workingDays > 0 ? Math.round((present / workingDays) * 100) : 0;
    
    return { present, absent, leave, late, holiday, regularized, total: logs.length, attendanceRate, workingDays };
  }, [logs]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  const cells: (IAttendanceLog | null | 'future')[] = [
    ...Array(firstDayOfMonth).fill(null),
  ];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const log = logs.find(l => l.attendance_date === dateStr);
    const cellDate = new Date(dateStr);
    const isFuture = cellDate > today;
    
    if (isFuture) {
      cells.push('future');
    } else {
      cells.push(log || null);
    }
  }

  const currentTime = new Date();
  const hour = currentTime.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const GreetIcon = hour < 12 ? Sun : hour < 17 ? Zap : Moon;

  const MONTH_STATS = [
    { label: 'Present', value: stats.present, status: 'present', icon: CheckCircle2 },
    { label: 'Leave', value: stats.leave, status: 'on_leave', icon: Calendar },
    { label: 'Late', value: stats.late, status: 'late', icon: AlertCircle },
    { label: 'Absent', value: stats.absent, status: 'absent', icon: Clock },
    { label: 'Holiday', value: stats.holiday, status: 'holiday', icon: Award },
    { label: 'Regularized', value: stats.regularized, status: 'regularized', icon: RotateCcw },
  ];

  return (
    <div className="min-h-screen">
      <div className="w-full px-3 py-3 sm:px-5 sm:py-5 lg:px-8 lg:py-6">
        {/* Header */}
        <div className="mb-4 lg:mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
                Monthly Attendance
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {MONTH_NAMES[currentMonth]} {currentYear} · Track your daily attendance
              </p>
            </div>
          </div>
        </div>

        {/* Greeting Card */}
        <div className="relative mb-4 rounded-2xl overflow-hidden bg-slate-900">
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)',
            }}
          />
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 bg-emerald-400 pointer-events-none" />

          <div className="relative z-10 p-4 sm:p-5 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <GreetIcon size={14} className="text-emerald-400" />
                  <span className="text-emerald-400 text-xs sm:text-sm font-medium">
                    {greeting}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  My Attendance
                </h2>
                <p className="text-white/40 text-xs sm:text-sm mt-0.5">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-white text-2xl sm:text-3xl font-bold tabular-nums">
                  {currentTime.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-white/40 text-xs mt-1">
                  {currentTime.toLocaleDateString('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 lg:mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <Calendar size={18} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
                {daysInMonth} days · {stats.workingDays} working days
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-all duration-200 shadow-sm">
              <ChevronLeft size={16} className="text-slate-600" />
            </button>
            <span className="text-xs sm:text-sm font-semibold text-slate-700 px-2 sm:px-3">
              {MONTH_NAMES[currentMonth].slice(0, 3)} {currentYear}
            </span>
            <button onClick={nextMonth} className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-all duration-200 shadow-sm">
              <ChevronRight size={16} className="text-slate-600" />
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 mb-3 lg:mb-4">
          <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                Attendance Overview
              </h4>
              <TrendingUp size={16} className="text-emerald-600" />
            </div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {stats.attendanceRate}%
                </p>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
                  Attendance Rate
                </p>
              </div>
              <div className="text-right">
                <p className="text-base sm:text-lg font-semibold text-emerald-600">
                  {stats.present}/{stats.workingDays}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-500">
                  Days Present
                </p>
              </div>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${stats.attendanceRate}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 sm:gap-4">
            {MONTH_STATS.slice(0, 4).map((stat) => {
              const cfg = STATUS_CONFIG[stat.status];
              const StatIcon = stat.icon;
              return (
                <div key={stat.label} className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: cfg.bg }}>
                      <StatIcon size={14} style={{ color: cfg.color }} />
                    </div>
                    <span className="text-xs sm:text-sm font-bold" style={{ color: cfg.color }}>
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-500">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 bg-white rounded-2xl border border-slate-200">
            <Loader2 size={22} className="animate-spin text-emerald-600" />
          </div>
        ) : (
          <>
            {/* Calendar Section */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden shadow-sm mb-3 lg:mb-4">
              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                {DAYS_OF_WEEK.map((d) => (
                  <div key={d} className="py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-slate-500">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {cells.map((cell, i) => {
                  if (cell === null) {
                    return (
                      <div key={`empty-${i}`} className="aspect-square border-b border-r border-slate-100 bg-slate-50/30" />
                    );
                  }
                  
                  if (cell === 'future') {
                    const day = i - firstDayOfMonth + 1;
                    return (
                      <div key={`future-${i}`} className="aspect-square border-b border-r border-slate-100 p-1 sm:p-2 flex flex-col items-center justify-center bg-slate-50/30">
                        <span className="text-xs sm:text-sm font-bold text-gray-300">{day}</span>
                      </div>
                    );
                  }

                  const log = cell as IAttendanceLog;
                  const day = new Date(log.attendance_date).getDate();
                  const displayStatus = log.is_regularized ? 'regularized' : log.is_late ? 'late' : log.attendance_status;
                  const cfg = STATUS_CONFIG[displayStatus] || STATUS_CONFIG.present;
                  const isSelected = selectedDay?.id === log.id;
                  const isToday = new Date(log.attendance_date).toDateString() === today.toDateString();

                  return (
                    <button
                      key={log.id}
                      onClick={() => setSelectedDay(isSelected ? null : log)}
                      className={`aspect-square border-b border-r border-slate-100 p-1 sm:p-2 flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all duration-200 cursor-pointer hover:opacity-80 ${
                        isSelected ? 'ring-2 ring-inset ring-emerald-500 shadow-sm' : ''
                      }`}
                      style={{ backgroundColor: isSelected ? cfg.bg : cfg.bg }}
                    >
                      <span
                        className={`text-xs sm:text-sm font-bold ${
                          isToday
                            ? 'w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs sm:text-sm'
                            : ''
                        }`}
                        style={{ color: isToday ? undefined : cfg.color }}
                      >
                        {day}
                      </span>
                      {cfg.label && (
                        <span
                          className="text-[7px] sm:text-[9px] font-semibold px-1 sm:px-1.5 py-0.5 rounded-full whitespace-nowrap hidden sm:block"
                          style={{
                            backgroundColor: cfg.dot + '20',
                            color: cfg.color,
                          }}
                        >
                          {cfg.label}
                        </span>
                      )}
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected day detail */}
            {selectedDay && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 mb-5 lg:mb-6 shadow-lg animate-fade-in">
                <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-base sm:text-lg font-bold"
                      style={{
                        backgroundColor: STATUS_CONFIG[selectedDay.attendance_status]?.bg,
                        color: STATUS_CONFIG[selectedDay.attendance_status]?.color,
                      }}
                    >
                      {new Date(selectedDay.attendance_date).getDate()}
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-bold text-slate-800">
                        {new Date(selectedDay.attendance_date).toLocaleDateString('en-GB', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: STATUS_CONFIG[selectedDay.attendance_status]?.bg,
                            color: STATUS_CONFIG[selectedDay.attendance_status]?.color,
                          }}
                        >
                          {STATUS_CONFIG[selectedDay.attendance_status]?.label}
                        </span>
                        {selectedDay.is_late && (
                          <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                            Late by {fmtHours(selectedDay.late_by_minutes)}
                          </span>
                        )}
                        {selectedDay.is_regularized && (
                          <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            Regularized
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <span className="text-slate-400 hover:text-slate-600 text-sm sm:text-base">✕</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  {selectedDay.check_in_time && (
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] sm:text-xs text-slate-500 mb-1">Check-in</p>
                      <p className="text-sm sm:text-base font-bold text-slate-800">
                        {fmtTime(selectedDay.check_in_time)}
                      </p>
                    </div>
                  )}
                  {selectedDay.check_out_time && (
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] sm:text-xs text-slate-500 mb-1">Check-out</p>
                      <p className="text-sm sm:text-base font-bold text-slate-800">
                        {fmtTime(selectedDay.check_out_time)}
                      </p>
                    </div>
                  )}
                  {selectedDay.total_worked_hours && (
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] sm:text-xs text-slate-500 mb-1">Hours Worked</p>
                      <p className="text-sm sm:text-base font-bold text-slate-800">
                        {selectedDay.total_worked_hours}
                      </p>
                    </div>
                  )}
                  {selectedDay.shift_name && (
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] sm:text-xs text-slate-500 mb-1">Shift</p>
                      <p className="text-xs sm:text-sm font-medium text-slate-800">
                        {selectedDay.shift_name}
                      </p>
                    </div>
                  )}
                </div>

                {selectedDay.remarks && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                    <p className="text-[10px] sm:text-xs text-amber-700 font-semibold mb-1">Note</p>
                    <p className="text-xs text-amber-800">{selectedDay.remarks}</p>
                  </div>
                )}
              </div>
            )}

            {/* Legend and Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Info size={14} className="text-slate-400" />
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status Legend
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  {LEGEND.map((l) => {
                    const cfg = STATUS_CONFIG[l.status];
                    return (
                      <div key={l.status} className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: cfg.dot }} />
                        <span className="text-[10px] sm:text-xs text-slate-600">{l.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-emerald-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Info size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 mb-1">
                      Attendance Summary
                    </h4>
                    <p className="text-[10px] sm:text-xs text-slate-600 leading-relaxed">
                      You have maintained {stats.attendanceRate}% attendance this month.
                      {stats.attendanceRate >= 90 ? ' Excellent performance! Keep it up! 🎉' : ' Keep up the good work!'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
