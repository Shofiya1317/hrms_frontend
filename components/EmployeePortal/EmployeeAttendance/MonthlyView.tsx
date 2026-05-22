'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, ChevronRight, Calendar, RotateCcw, 
  TrendingUp, Clock, MapPin, Users, Award, 
  ChevronRight as ArrowRight, Sun, Moon, Zap,
  Info, CheckCircle2, AlertCircle, Briefcase
} from 'lucide-react';

interface DayData {
  date: number;
  status: string;
  checkIn?: string;
  checkOut?: string;
  hours?: string;
  note?: string;
}

const MONTH_DATA: Record<number, DayData> = {
  1: { date: 1, status: 'weekend' },
  2: { date: 2, status: 'weekend' },
  3: { date: 3, status: 'present', checkIn: '09:05', checkOut: '18:20', hours: '9h 15m' },
  4: { date: 4, status: 'present', checkIn: '09:30', checkOut: '18:15', hours: '8h 45m' },
  5: { date: 5, status: 'leave', note: 'Casual Leave' },
  6: { date: 6, status: 'present', checkIn: '09:10', checkOut: '18:10', hours: '9h 00m' },
  7: { date: 7, status: 'present', checkIn: '09:12', checkOut: '18:30', hours: '9h 18m' },
  8: { date: 8, status: 'weekend' },
  9: { date: 9, status: 'weekend' },
  10: { date: 10, status: 'present', checkIn: '09:00', checkOut: '18:00', hours: '9h 00m' },
  11: { date: 11, status: 'present', checkIn: '09:15', checkOut: '18:45', hours: '9h 30m' },
  12: { date: 12, status: 'present', checkIn: '09:05', checkOut: '18:20', hours: '9h 15m' },
  13: { date: 13, status: 'late', checkIn: '09:45', checkOut: '18:30', hours: '8h 45m', note: 'Late by 30 min' },
  14: { date: 14, status: 'present', checkIn: '09:00', checkOut: '18:00', hours: '9h 00m' },
  15: { date: 15, status: 'weekend' },
  16: { date: 16, status: 'weekend' },
  17: { date: 17, status: 'holiday', note: 'Holi' },
  18: { date: 18, status: 'present', checkIn: '09:05', checkOut: '18:20', hours: '9h 15m' },
  19: { date: 19, status: 'regularized', checkIn: '09:00', checkOut: '18:00', hours: '9h 00m', note: 'Regularized' },
  20: { date: 20, status: 'leave', note: 'Casual Leave' },
  21: { date: 21, status: 'present', checkIn: '09:10', checkOut: '18:10', hours: '9h 00m' },
  22: { date: 22, status: 'active', checkIn: '09:12', hours: '5h 43m', note: 'Today' },
  23: { date: 23, status: 'future' },
  24: { date: 24, status: 'future' },
  25: { date: 25, status: 'future' },
  26: { date: 26, status: 'future' },
  27: { date: 27, status: 'future' },
  28: { date: 28, status: 'future' },
  29: { date: 29, status: 'future' },
  30: { date: 30, status: 'future' },
  31: { date: 31, status: 'future' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
  present: { label: 'Present', color: '#2D7A4F', bg: '#e8f5ee', border: '#bbddc9', dot: '#2D7A4F' },
  late: { label: 'Late', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', dot: '#f59e0b' },
  leave: { label: 'Leave', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', dot: '#3b82f6' },
  absent: { label: 'Absent', color: '#ef4444', bg: '#fef2f2', border: '#fecaca', dot: '#ef4444' },
  holiday: { label: 'Holiday', color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', dot: '#8b5cf6' },
  weekend: { label: 'Weekend', color: '#9ca3af', bg: '#f9fafb', border: '#e5e7eb', dot: '#9ca3af' },
  regularized: { label: 'Regularized', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', dot: '#10b981' },
  active: { label: 'Active', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', dot: '#f59e0b' },
  future: { label: '', color: '#d1d5db', bg: '#f9fafb', border: '#f3f4f6', dot: '#d1d5db' },
  compoff: { label: 'Comp Off', color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', dot: '#8b5cf6' },
};

const LEGEND = [
  { status: 'present', label: 'Present' },
  { status: 'late', label: 'Late' },
  { status: 'leave', label: 'Leave' },
  { status: 'absent', label: 'Absent' },
  { status: 'holiday', label: 'Holiday' },
  { status: 'regularized', label: 'Regularized' },
  { status: 'weekend', label: 'Weekend' },
];

const MONTH_STATS = [
  { label: 'Present', value: 18, status: 'present', icon: CheckCircle2 },
  { label: 'Leave', value: 2, status: 'leave', icon: Calendar },
  { label: 'Late', value: 1, status: 'late', icon: AlertCircle },
  { label: 'Absent', value: 0, status: 'absent', icon: Clock },
  { label: 'Holiday', value: 1, status: 'holiday', icon: Award },
  { label: 'Regularized', value: 1, status: 'regularized', icon: RotateCcw },
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FIRST_DAY_OFFSET = 0;
const TOTAL_DAYS = 31;

export default function MonthlyAttendancePage() {
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  const cells: (DayData | null)[] = [
    ...Array(FIRST_DAY_OFFSET).fill(null),
    ...Array.from({ length: TOTAL_DAYS }, (_, i) => MONTH_DATA[i + 1] || { date: i + 1, status: 'future' }),
  ];

  const currentTime = new Date();
  const hour = currentTime.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const GreetIcon = hour < 12 ? Sun : hour < 17 ? Zap : Moon;

  const totalPresent = MONTH_STATS.find(s => s.label === 'Present')?.value || 0;
  const attendanceRate = Math.round((totalPresent / 22) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full px-4 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Calendar size={14} />
            <span>Attendance</span>
            <ChevronRight size={12} />
            <span className="text-[#2D7A4F] font-semibold">Monthly View</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Monthly Attendance</h1>
              <p className="text-sm text-gray-500 mt-1">March 2026 · Track your daily attendance</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Calendar size={14} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Export Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Greeting Section */}
        <div className="bg-gradient-to-br from-[#0f1f2e] via-[#1a3347] to-[#0f2d1e] rounded-2xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#2D7A4F] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <GreetIcon size={16} className="text-[#4a9e6e]" />
                <span className="text-[#4a9e6e] text-sm font-medium">{greeting}</span>
              </div>
              <h2 className="text-xl font-bold text-white">Rahul Sharma</h2>
              <p className="text-white/40 text-sm mt-0.5">EMP-2024-001 · Senior Software Engineer</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-white text-2xl font-bold tabular-nums">
                  {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-white/40 text-xs mt-1">
                  {currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
              <Calendar size={20} className="text-[#2D7A4F]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">March 2026</h3>
              <p className="text-xs text-gray-500 mt-0.5">31 days · 22 working days</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
            <span className="text-sm font-semibold text-gray-700 px-3">Mar 2026</span>
            <button className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ChevronRight size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Key Metrics */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-gray-800">Attendance Overview</h4>
              <TrendingUp size={16} className="text-[#2D7A4F]" />
            </div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-3xl font-bold text-gray-900">{attendanceRate}%</p>
                <p className="text-xs text-gray-500 mt-1">Attendance Rate</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-[#2D7A4F]">{totalPresent}/22</p>
                <p className="text-xs text-gray-500">Days Present</p>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#2D7A4F] to-[#4a9e6e] rounded-full transition-all" 
                style={{ width: `${attendanceRate}%` }} 
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            {MONTH_STATS.slice(0, 4).map((stat) => {
              const cfg = STATUS_CONFIG[stat.status];
              return (
                <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: cfg.bg }}>
                      <stat.icon size={14} style={{ color: cfg.color }} />
                    </div>
                    <span className="text-xs font-semibold" style={{ color: cfg.color }}>{stat.value}</span>
                  </div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-6">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
            {DAYS_OF_WEEK.map((d) => (
              <div key={d} className="py-3 text-center text-xs font-semibold text-gray-500">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              if (!day) {
                return <div key={`empty-${i}`} className="aspect-square border-b border-r border-gray-100 bg-gray-50/30" />;
              }
              const cfg = STATUS_CONFIG[day.status] || STATUS_CONFIG.future;
              const isSelected = selectedDay?.date === day.date;
              const isToday = day.status === 'active';

              return (
                <button
                  key={day.date}
                  onClick={() => day.status !== 'future' && day.status !== 'weekend' ? setSelectedDay(isSelected ? null : day) : undefined}
                  className={`aspect-square border-b border-r border-gray-100 p-2 flex flex-col items-center justify-center gap-1 transition-all duration-150 ${
                    day.status !== 'future' && day.status !== 'weekend' ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                  } ${isSelected ? 'ring-2 ring-inset ring-[#2D7A4F] shadow-sm' : ''}`}
                  style={{ backgroundColor: isSelected ? cfg.bg : day.status === 'future' ? '#fafafa' : cfg.bg }}
                >
                  <span
                    className={`text-sm font-bold ${isToday ? 'w-7 h-7 rounded-full bg-[#2D7A4F] text-white flex items-center justify-center text-xs' : ''}`}
                    style={{ color: isToday ? undefined : cfg.color }}
                  >
                    {day.date}
                  </span>
                  {cfg.label && day.status !== 'future' && (
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full hidden sm:block"
                      style={{ backgroundColor: cfg.dot + '20', color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                  )}
                  {day.status !== 'future' && day.status !== 'weekend' && (
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected day detail */}
        {selectedDay && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
                  style={{ backgroundColor: STATUS_CONFIG[selectedDay.status]?.bg, color: STATUS_CONFIG[selectedDay.status]?.color }}
                >
                  {selectedDay.date}
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-800">March {selectedDay.date}, 2026</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: STATUS_CONFIG[selectedDay.status]?.bg,
                        color: STATUS_CONFIG[selectedDay.status]?.color,
                      }}
                    >
                      {STATUS_CONFIG[selectedDay.status]?.label}
                    </span>
                    {selectedDay.status === 'active' && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        Today
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDay(null)} 
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-400 hover:text-gray-600">✕</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {selectedDay.checkIn && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Check-in</p>
                  <p className="text-base font-bold text-gray-800">{selectedDay.checkIn}</p>
                </div>
              )}
              {selectedDay.checkOut && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Check-out</p>
                  <p className="text-base font-bold text-gray-800">{selectedDay.checkOut}</p>
                </div>
              )}
              {selectedDay.hours && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Hours Worked</p>
                  <p className="text-base font-bold text-gray-800">{selectedDay.hours}</p>
                </div>
              )}
              {selectedDay.note && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Note</p>
                  <p className="text-sm font-medium text-gray-800">{selectedDay.note}</p>
                </div>
              )}
            </div>

            {(selectedDay.status === 'absent' || selectedDay.status === 'late') && (
              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <Link
                  href="/employee/attendance/regularize"
                  className="flex items-center gap-2 text-sm font-semibold text-[#2D7A4F] bg-[#e8f5ee] px-4 py-2.5 rounded-xl hover:bg-[#d0ead9] transition-colors"
                >
                  <RotateCcw size={14} />
                  Regularize this day
                </Link>
                <Link
                  href="/employee/attendance/apply-leave"
                  className="flex items-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2.5 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <Calendar size={14} />
                  Apply for Leave
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info size={14} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status Legend</p>
          </div>
          <div className="flex flex-wrap gap-4">
            {LEGEND.map((l) => {
              const cfg = STATUS_CONFIG[l.status];
              return (
                <div key={l.status} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cfg.dot }} />
                  <span className="text-sm text-gray-600">{l.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Info size={18} className="text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-1">Attendance Summary</h4>
              <p className="text-sm text-gray-600">
                You have maintained {attendanceRate}% attendance this month. 
                {totalPresent < 20 ? ' Keep up the good work!' : ' Excellent performance!'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}