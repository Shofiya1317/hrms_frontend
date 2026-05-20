'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Calendar, RotateCcw } from 'lucide-react';

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
  { label: 'Present', value: 18, status: 'present' },
  { label: 'Leave', value: 2, status: 'leave' },
  { label: 'Late', value: 1, status: 'late' },
  { label: 'Absent', value: 0, status: 'absent' },
  { label: 'Holiday', value: 1, status: 'holiday' },
  { label: 'Regularized', value: 1, status: 'regularized' },
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// March 2026 starts on Sunday (day 0)
const FIRST_DAY_OFFSET = 0;
const TOTAL_DAYS = 31;

export default function MonthlyAttendancePage() {
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  const cells: (DayData | null)[] = [
    ...Array(FIRST_DAY_OFFSET).fill(null),
    ...Array.from({ length: TOTAL_DAYS }, (_, i) => MONTH_DATA[i + 1] || { date: i + 1, status: 'future' }),
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Monthly Attendance</h1>
          <p className="text-sm text-gray-500 mt-0.5">March 2026 · Rahul Sharma</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
            <ChevronLeft size={16} className="text-gray-500" />
          </button>
          <span className="text-sm font-semibold text-gray-700 px-2">Mar 2026</span>
          <button className="w-8 h-8 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
            <ChevronRight size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {MONTH_STATS.map((stat) => {
          const cfg = STATUS_CONFIG[stat.status];
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border p-3 text-center"
              style={{ borderColor: cfg.border }}
            >
              <p className="text-xl font-bold" style={{ color: cfg.color }}>{stat.value}</p>
              <p className="text-[10px] font-semibold text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAYS_OF_WEEK.map((d) => (
            <div key={d} className="py-3 text-center text-xs font-semibold text-gray-400">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (!day) {
              return <div key={`empty-${i}`} className="aspect-square border-b border-r border-gray-50" />;
            }
            const cfg = STATUS_CONFIG[day.status] || STATUS_CONFIG.future;
            const isSelected = selectedDay?.date === day.date;
            const isToday = day.status === 'active';

            return (
              <button
                key={day.date}
                onClick={() => day.status !== 'future' && day.status !== 'weekend' ? setSelectedDay(isSelected ? null : day) : undefined}
                className={`aspect-square border-b border-r border-gray-50 p-1.5 flex flex-col items-center justify-center gap-0.5 transition-all duration-150 ${
                  day.status !== 'future' && day.status !== 'weekend' ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                } ${isSelected ? 'ring-2 ring-inset ring-[#2D7A4F]' : ''}`}
                style={{ backgroundColor: isSelected ? cfg.bg : day.status === 'future' ? '#fafafa' : cfg.bg }}
              >
                <span
                  className={`text-xs font-bold ${isToday ? 'w-5 h-5 rounded-full bg-[#2D7A4F] text-white flex items-center justify-center text-[10px]' : ''}`}
                  style={{ color: isToday ? undefined : cfg.color }}
                >
                  {day.date}
                </span>
                {cfg.label && day.status !== 'future' && (
                  <span
                    className="text-[8px] font-semibold px-1 rounded-sm hidden sm:block"
                    style={{ color: cfg.color }}
                  >
                    {cfg.label}
                  </span>
                )}
                {day.status !== 'future' && day.status !== 'weekend' && (
                  <span className="w-1 h-1 rounded-full" style={{ backgroundColor: cfg.dot }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: STATUS_CONFIG[selectedDay.status]?.bg, color: STATUS_CONFIG[selectedDay.status]?.color }}
              >
                {selectedDay.date}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">March {selectedDay.date}, 2026</p>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: STATUS_CONFIG[selectedDay.status]?.bg,
                    color: STATUS_CONFIG[selectedDay.status]?.color,
                  }}
                >
                  {STATUS_CONFIG[selectedDay.status]?.label}
                </span>
              </div>
            </div>
            <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {selectedDay.checkIn && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Check-in</p>
                <p className="text-sm font-bold text-gray-800">{selectedDay.checkIn}</p>
              </div>
            )}
            {selectedDay.checkOut && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Check-out</p>
                <p className="text-sm font-bold text-gray-800">{selectedDay.checkOut}</p>
              </div>
            )}
            {selectedDay.hours && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Hours</p>
                <p className="text-sm font-bold text-gray-800">{selectedDay.hours}</p>
              </div>
            )}
            {selectedDay.note && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Note</p>
                <p className="text-sm font-bold text-gray-800">{selectedDay.note}</p>
              </div>
            )}
          </div>

          {(selectedDay.status === 'absent' || selectedDay.status === 'late') && (
            <div className="mt-3 flex gap-2">
              <Link
                href="/employee/attendance/regularize"
                className="flex items-center gap-2 text-xs font-semibold text-[#2D7A4F] bg-[#e8f5ee] px-3 py-2 rounded-xl hover:bg-[#d0ead9] transition-colors"
              >
                <RotateCcw size={12} />
                Regularize this day
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Legend</p>
        <div className="flex flex-wrap gap-3">
          {LEGEND.map((l) => {
            const cfg = STATUS_CONFIG[l.status];
            return (
              <div key={l.status} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
                <span className="text-xs font-medium text-gray-600">{l.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
