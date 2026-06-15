'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  ChevronLeft, ChevronRight, Calendar, Loader2, CheckCircle2,
  Clock, AlertCircle, Award, RotateCcw, Sun, Moon, Zap, Info, TrendingUp,
  Star, Gift, Heart, Briefcase, CalendarDays, Shield, Building, Users,
  MapPin, Timer
} from 'lucide-react';
import { getAttendances } from '@/lib/service/attendance';
import {
  getMonthlyCalendar, getWorkSchedule,
  ICalendarDay, IMonthlyCalendar, IWorkSchedule
} from '@/lib/service/companyHoliday';

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

// Calendar day status configuration
const CALENDAR_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string; icon: any }> = {
  working: { label: 'Working Day', color: '#16a34a', bg: '#f0fdf4', dot: '#16a34a', icon: Briefcase },
  holiday: { label: 'Holiday', color: '#ef4444', bg: '#fef2f2', dot: '#ef4444', icon: CalendarDays },
  weekend: { label: 'Weekend', color: '#9ca3af', bg: '#f9fafb', dot: '#9ca3af', icon: Sun },
  working_override: { label: 'Working Override', color: '#2563eb', bg: '#eff6ff', dot: '#2563eb', icon: Shield },
  holiday_override: { label: 'Holiday Override', color: '#f59e0b', bg: '#fffbeb', dot: '#f59e0b', icon: Award },
};

// Attendance status configuration  
const ATTENDANCE_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  present: { label: 'Present', color: '#16a34a', bg: '#f0fdf4', dot: '#16a34a' },
  late: { label: 'Late', color: '#f59e0b', bg: '#fffbeb', dot: '#f59e0b' },
  on_leave: { label: 'Leave', color: '#2563eb', bg: '#eff6ff', dot: '#2563eb' },
  absent: { label: 'Absent', color: '#ef4444', bg: '#fef2f2', dot: '#ef4444' },
  regularized: { label: 'Regularized', color: '#10b981', bg: '#ecfdf5', dot: '#10b981' },
  future: { label: '', color: '#d1d5db', bg: '#f9fafb', dot: '#d1d5db' },
};

const LEGEND = [
  { status: 'working', label: 'Working Day' },
  { status: 'holiday', label: 'Holiday' },
  { status: 'weekend', label: 'Weekend' },
  { status: 'working_override', label: 'Working Override' },
  { status: 'holiday_override', label: 'Holiday Override' },
  { status: 'present', label: 'Present' },
  { status: 'absent', label: 'Absent' },
  { status: 'on_leave', label: 'Leave' },
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
  const [calendarData, setCalendarData] = useState<IMonthlyCalendar | null>(null);
  const [workSchedule, setWorkSchedule] = useState<IWorkSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<{ attendance?: IAttendanceLog; calendar?: ICalendarDay } | null>(null);

  useEffect(() => {
    if (subdomain) {
      Promise.all([fetchAttendance(), fetchCalendarData(), fetchWorkSchedule()]);
    }
  }, [subdomain, currentMonth, currentYear]);

  const fetchAttendance = async () => {
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
    }
  };

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const res = await getMonthlyCalendar(currentYear, currentMonth + 1, subdomain);
      setCalendarData(res?.data || null);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkSchedule = async () => {
    try {
      const res = await getWorkSchedule(subdomain);
      setWorkSchedule(res?.data || null);
    } catch (error) {
      console.error('Error fetching work schedule:', error);
    }
  };

  // Create attendance lookup by date
  const attendanceByDate = useMemo(() => {
    const map: Record<string, IAttendanceLog> = {};
    logs.forEach(log => {
      map[log.attendance_date] = log;
    });
    return map;
  }, [logs]);

  const stats = useMemo(() => {
    if (!calendarData) return {
      present: 0, absent: 0, leave: 0, late: 0, regularized: 0,
      workingDays: 0, holidays: 0, weekends: 0, workingOverrides: 0, holidayOverrides: 0,
      total: 0, attendanceRate: 0
    };

    const present = logs.filter(l => l.attendance_status === 'present').length;
    const absent = logs.filter(l => l.attendance_status === 'absent').length;
    const leave = logs.filter(l => l.attendance_status === 'on_leave').length;
    const late = logs.filter(l => l.is_late).length;
    const regularized = logs.filter(l => l.is_regularized).length;
    
    const workingDays = calendarData.days.filter(d => d.status === 'working').length;
    const holidays = calendarData.days.filter(d => d.status === 'holiday').length;
    const weekends = calendarData.days.filter(d => d.status === 'weekend').length;
    const workingOverrides = calendarData.days.filter(d => d.status === 'working_override').length;
    const holidayOverrides = calendarData.days.filter(d => d.status === 'holiday_override').length;
    
    const totalWorkingDays = calendarData.total_working_days;
    const attendanceRate = totalWorkingDays > 0 ? Math.round((present / totalWorkingDays) * 100) : 0;
    
    return {
      present, absent, leave, late, regularized,
      workingDays, holidays, weekends, workingOverrides, holidayOverrides,
      total: calendarData.days.length, attendanceRate
    };
  }, [logs, calendarData]);

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
    { label: 'Absent', value: stats.absent, status: 'absent', icon: Clock },
    { label: 'Leave', value: stats.leave, status: 'on_leave', icon: Calendar },
    { label: 'Late', value: stats.late, status: 'late', icon: AlertCircle },
    { label: 'Working Days', value: stats.workingDays, status: 'working', icon: Briefcase },
    { label: 'Holidays', value: stats.holidays, status: 'holiday', icon: CalendarDays },
    { label: 'Weekends', value: stats.weekends, status: 'weekend', icon: Sun },
    { label: 'Working Override', value: stats.workingOverrides, status: 'working_override', icon: Shield },
    { label: 'Holiday Override', value: stats.holidayOverrides, status: 'holiday_override', icon: Award },
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
                  {stats.present}/{calendarData?.total_working_days || 0}
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
            {workSchedule && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs font-semibold text-blue-800">{workSchedule.name}</p>
                <p className="text-[10px] text-blue-600 mt-1">{workSchedule.description}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-3 sm:gap-4">
            {MONTH_STATS.slice(0, 6).map((stat) => {
              const cfg = CALENDAR_STATUS_CONFIG[stat.status] || ATTENDANCE_STATUS_CONFIG[stat.status];
              const StatIcon = stat.icon;
              return (
                <div key={stat.label} className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: cfg?.bg }}>
                      <StatIcon size={14} style={{ color: cfg?.color }} />
                    </div>
                    <span className="text-xs sm:text-sm font-bold" style={{ color: cfg?.color }}>
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
        ) : calendarData ? (
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
                {(() => {
                  const firstDay = new Date(currentYear, currentMonth, 1);
                  const firstDayOfWeek = firstDay.getDay();
                  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                  
                  const cells: (ICalendarDay | null | 'future')[] = [];
                  
                  // Add empty cells for days before month starts
                  for (let i = 0; i < firstDayOfWeek; i++) {
                    cells.push(null);
                  }
                  
                  // Add calendar days or future placeholders
                  for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const calendarDay = calendarData.days.find(d => d.date === dateStr);
                    const cellDate = new Date(dateStr);
                    const isFuture = cellDate > today;
                    
                    if (isFuture && !calendarDay) {
                      cells.push('future');
                    } else {
                      cells.push(calendarDay || null);
                    }
                  }
                  
                  return cells.map((cell, i) => {
                    if (cell === null) {
                      return (
                        <div key={`empty-${i}`} className="aspect-square border-b border-r border-slate-100 bg-slate-50/30" />
                      );
                    }
                    
                    if (cell === 'future') {
                      const day = i - firstDayOfWeek + 1;
                      return (
                        <div key={`future-${i}`} className="aspect-square border-b border-r border-slate-100 p-1 sm:p-2 flex flex-col items-center justify-center bg-slate-50/30">
                          <span className="text-xs sm:text-sm font-bold text-gray-300">{day}</span>
                        </div>
                      );
                    }

                    const calendarDay = cell as ICalendarDay;
                    const day = new Date(calendarDay.date).getDate();
                    const dateStr = calendarDay.date;
                    const attendance = attendanceByDate[dateStr];
                    
                    // Determine primary display based on calendar status
                    const calendarCfg = CALENDAR_STATUS_CONFIG[calendarDay.status] || CALENDAR_STATUS_CONFIG.working;
                    let attendanceStatus = '';
                    let attendanceCfg = null;
                    
                    if (attendance) {
                      attendanceStatus = attendance.is_regularized ? 'regularized' : 
                                        attendance.is_late ? 'late' : 
                                        attendance.attendance_status;
                      attendanceCfg = ATTENDANCE_STATUS_CONFIG[attendanceStatus];
                    }
                    
                    const isSelected = selectedDay?.calendar?.date === calendarDay.date;
                    const isToday = new Date(calendarDay.date).toDateString() === today.toDateString();
                    const CalendarIcon = calendarCfg.icon;

                    return (
                      <button
                        key={calendarDay.date}
                        onClick={() => setSelectedDay(isSelected ? null : { calendar: calendarDay, attendance })}
                        className={`aspect-square border-b border-r border-slate-100 p-1 sm:p-2 flex flex-col items-center justify-center gap-0.5 transition-all duration-200 cursor-pointer hover:opacity-80 ${
                          isSelected ? 'ring-2 ring-inset ring-emerald-500 shadow-sm' : ''
                        }`}
                        style={{ backgroundColor: calendarCfg.bg }}
                      >
                        {/* Day number */}
                        <span
                          className={`text-xs sm:text-sm font-bold ${
                            isToday
                              ? 'w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center'
                              : ''
                          }`}
                          style={{ color: isToday ? undefined : calendarCfg.color }}
                        >
                          {day}
                        </span>
                        
                        {/* Calendar status icon */}
                        <CalendarIcon size={10} className="flex-shrink-0" style={{ color: calendarCfg.color }} />
                        
                        {/* Holiday/Override name or attendance status */}
                        {calendarDay.holiday_name || calendarDay.override_name ? (
                          <span className="text-[6px] sm:text-[7px] font-medium text-center leading-none" style={{ color: calendarCfg.color }}>
                            {(calendarDay.holiday_name || calendarDay.override_name || '').length > 6 ? 
                             (calendarDay.holiday_name || calendarDay.override_name || '').slice(0, 6) + '..' : 
                             (calendarDay.holiday_name || calendarDay.override_name)}
                          </span>
                        ) : attendanceCfg ? (
                          <span
                            className="text-[6px] sm:text-[7px] font-semibold px-1 py-0.5 rounded-full"
                            style={{ backgroundColor: attendanceCfg.dot + '20', color: attendanceCfg.color }}
                          >
                            {attendanceCfg.label.slice(0, 3)}
                          </span>
                        ) : null}
                        
                        {/* Status dots */}
                        <div className="flex items-center gap-0.5">
                          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: calendarCfg.dot }} />
                          {attendanceCfg && (
                            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: attendanceCfg.dot }} />
                          )}
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Selected day detail */}
            {selectedDay && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 mb-5 lg:mb-6 shadow-lg animate-fade-in">
                <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-5">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const calendarDay = selectedDay.calendar!;
                      const attendance = selectedDay.attendance;
                      const calendarCfg = CALENDAR_STATUS_CONFIG[calendarDay.status] || CALENDAR_STATUS_CONFIG.working;
                      const CalendarIcon = calendarCfg.icon;
                      
                      return (
                        <>
                          <div
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-base sm:text-lg font-bold"
                            style={{
                              backgroundColor: calendarCfg.bg,
                              color: calendarCfg.color,
                            }}
                          >
                            <CalendarIcon size={20} />
                          </div>
                          <div>
                            <p className="text-base sm:text-lg font-bold text-slate-800">
                              {new Date(calendarDay.date).toLocaleDateString('en-GB', { 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span
                                className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: calendarCfg.bg,
                                  color: calendarCfg.color,
                                }}
                              >
                                {calendarCfg.label}
                              </span>
                              {calendarDay.is_override && (
                                <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                                  Override
                                </span>
                              )}
                              {attendance?.is_late && (
                                <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                  Late by {fmtHours(attendance.late_by_minutes)}
                                </span>
                              )}
                              {attendance?.is_regularized && (
                                <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                  Regularized
                                </span>
                              )}
                            </div>
                            
                            {/* Calendar day details */}
                            <div className="mt-3 space-y-2">
                              <div className="text-xs text-slate-600">
                                <span className="font-semibold">Status:</span> {calendarDay.reason}
                              </div>
                              {(calendarDay.holiday_name || calendarDay.override_name) && (
                                <div className="text-xs text-slate-700">
                                  <span className="font-semibold">
                                    {calendarDay.holiday_name ? 'Holiday:' : 'Override:'}
                                  </span> {calendarDay.holiday_name || calendarDay.override_name}
                                </div>
                              )}
                              {attendance && (
                                <div className="text-xs text-slate-600">
                                  <span className="font-semibold">Attendance:</span> {attendance.attendance_status}
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <span className="text-slate-400 hover:text-slate-600 text-sm sm:text-base">✕</span>
                  </button>
                </div>

                {selectedDay.attendance && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    {selectedDay.attendance.check_in_time && (
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-[10px] sm:text-xs text-slate-500 mb-1">Check-in</p>
                        <p className="text-sm sm:text-base font-bold text-slate-800">
                          {fmtTime(selectedDay.attendance.check_in_time)}
                        </p>
                      </div>
                    )}
                    {selectedDay.attendance.check_out_time && (
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-[10px] sm:text-xs text-slate-500 mb-1">Check-out</p>
                        <p className="text-sm sm:text-base font-bold text-slate-800">
                          {fmtTime(selectedDay.attendance.check_out_time)}
                        </p>
                      </div>
                    )}
                    {selectedDay.attendance.total_worked_hours && (
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-[10px] sm:text-xs text-slate-500 mb-1">Hours Worked</p>
                        <p className="text-sm sm:text-base font-bold text-slate-800">
                          {selectedDay.attendance.total_worked_hours}
                        </p>
                      </div>
                    )}
                    {selectedDay.attendance.shift_name && (
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-[10px] sm:text-xs text-slate-500 mb-1">Shift</p>
                        <p className="text-xs sm:text-sm font-medium text-slate-800">
                          {selectedDay.attendance.shift_name}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {selectedDay.attendance?.remarks && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                    <p className="text-[10px] sm:text-xs text-amber-700 font-semibold mb-1">Note</p>
                    <p className="text-xs text-amber-800">{selectedDay.attendance.remarks}</p>
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
                    const cfg = CALENDAR_STATUS_CONFIG[l.status] || ATTENDANCE_STATUS_CONFIG[l.status];
                    return (
                      <div key={l.status} className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: cfg?.dot }} />
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
                      Monthly Calendar Summary
                    </h4>
                    <p className="text-[10px] sm:text-xs text-slate-600 leading-relaxed mb-2">
                      You have maintained {stats.attendanceRate}% attendance this month.
                      {stats.attendanceRate >= 90 ? ' Excellent performance! Keep it up! 🎉' : ' Keep up the good work!'}
                    </p>
                    {calendarData && (
                      <div className="text-[10px] sm:text-xs text-slate-500 leading-relaxed space-y-1">
                        <p>
                          <span className="font-semibold">Working Days:</span> {calendarData.total_working_days}
                          <span className="mx-2">•</span>
                          <span className="font-semibold">Holidays:</span> {calendarData.total_holidays}
                        </p>
                        {workSchedule && (
                          <p>
                            <span className="font-semibold">Schedule:</span> {workSchedule.name}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex justify-center py-20 bg-white rounded-2xl border border-slate-200">
            <div className="text-center">
              <Calendar size={40} className="text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No calendar data available</p>
              <p className="text-xs text-slate-400 mt-1">Please check your connection and try again</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
