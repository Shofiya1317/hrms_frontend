'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, MapPin, Timer, CheckCircle2, LogIn, LogOut, Coffee, Wifi, TrendingUp, ChevronRight } from 'lucide-react';

const TODAYS_LOG = [
  { time: '09:12 AM', event: 'Check-in', type: 'in', location: 'Office · Bangalore' },
];

const WEEK_SUMMARY = [
  { day: 'Mon', date: '18', status: 'present', hours: '9h 15m', in: '09:05', out: '18:20' },
  { day: 'Tue', date: '19', status: 'present', hours: '8h 45m', in: '09:30', out: '18:15' },
  { day: 'Wed', date: '20', status: 'leave', hours: '—', in: '—', out: '—' },
  { day: 'Thu', date: '21', status: 'present', hours: '9h 00m', in: '09:10', out: '18:10' },
  { day: 'Fri', date: '22', status: 'active', hours: '5h 43m', in: '09:12', out: '—' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  present: { label: 'Present', color: '#2D7A4F', bg: '#e8f5ee', border: '#bbddc9' },
  leave: { label: 'Leave', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  absent: { label: 'Absent', color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
  active: { label: 'Active', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  holiday: { label: 'Holiday', color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
};

export default function CheckInPage() {
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [checkInTime] = useState(new Date(Date.now() - 5 * 60 * 60 * 1000 - 43 * 60 * 1000));
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showConfirm, setShowConfirm] = useState<'in' | 'out' | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' } | null>(null);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const liveSeconds = isCheckedIn ? Math.floor((currentTime.getTime() - checkInTime.getTime()) / 1000) : 0;
  const liveHours = Math.floor(liveSeconds / 3600);
  const liveMinutes = Math.floor((liveSeconds % 3600) / 60);
  const liveSecs = liveSeconds % 60;

  const handleAction = (type: 'in' | 'out') => {
    setShowConfirm(null);
    if (type === 'in') {
      setIsCheckedIn(true);
      setToast({ msg: 'Checked in successfully at ' + currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), type: 'success' });
    } else {
      setIsCheckedIn(false);
      setToast({ msg: 'Checked out. Total: 5h 43m. Great work today!', type: 'info' });
    }
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-slide-up ${
          toast.type === 'success' ? 'bg-[#e8f5ee] border-[#bbddc9] text-[#2D7A4F]' : 'bg-blue-50 border-blue-200 text-blue-700'
        }`}>
          <CheckCircle2 size={16} />
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="text-xl font-bold text-gray-900">Check-in / Check-out</h1>
        <p className="text-sm text-gray-500 mt-0.5">Log your attendance for today</p>
      </div>

      {/* Main Check-in Card */}
      <div className="bg-gradient-to-br from-[#0f1f2e] via-[#1a3347] to-[#0f2d1e] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#2D7A4F] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        </div>
        <div className="relative z-10">
          {/* Live clock */}
          <div className="text-center mb-6">
            <p className="text-4xl font-bold text-white tabular-nums tracking-tight">
              {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="text-white/50 text-sm mt-1">
              {currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Status */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${
              isCheckedIn
                ? 'bg-[#2D7A4F]/30 text-[#4a9e6e] border-[#2D7A4F]/40'
                : 'bg-white/10 text-white/50 border-white/10'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isCheckedIn ? 'bg-[#4a9e6e] animate-pulse' : 'bg-white/30'}`} />
              {isCheckedIn ? 'Currently Working' : 'Not Checked In'}
            </div>
          </div>

          {/* Live timer */}
          {isCheckedIn && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-2xl px-6 py-3">
                <Timer size={18} className="text-[#4a9e6e]" />
                <span className="text-2xl font-bold text-white tabular-nums">
                  {String(liveHours).padStart(2, '0')}:{String(liveMinutes).padStart(2, '0')}:{String(liveSecs).padStart(2, '0')}
                </span>
                <span className="text-white/50 text-sm">worked</span>
              </div>
              <p className="text-white/40 text-xs mt-2">Checked in at 09:12 AM</p>
            </div>
          )}

          {/* Action button */}
          <div className="flex justify-center">
            {!isCheckedIn ? (
              <button
                onClick={() => setShowConfirm('in')}
                className="flex items-center gap-3 bg-[#2D7A4F] hover:bg-[#1e5c3a] text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-[#2D7A4F]/30 hover:shadow-[#2D7A4F]/50 hover:scale-105 active:scale-95"
              >
                <LogIn size={20} />
                Check In Now
              </button>
            ) : (
              <button
                onClick={() => setShowConfirm('out')}
                className="flex items-center gap-3 bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-red-500/30 hover:scale-105 active:scale-95"
              >
                <LogOut size={20} />
                Check Out
              </button>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <MapPin size={12} className="text-white/30" />
            <span className="text-white/30 text-xs">Office · Bangalore, India</span>
            <Wifi size={12} className="text-white/30" />
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-slide-up">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${showConfirm === 'in' ? 'bg-[#e8f5ee]' : 'bg-red-50'}`}>
              {showConfirm === 'in' ? <LogIn size={22} className="text-[#2D7A4F]" /> : <LogOut size={22} className="text-red-500" />}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {showConfirm === 'in' ? 'Confirm Check-in' : 'Confirm Check-out'}
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              {showConfirm === 'in'
                ? `You are checking in at ${currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
                : `You are checking out at ${currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}. Total time: 5h 43m`
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(showConfirm)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${showConfirm === 'in' ? 'bg-[#2D7A4F] hover:bg-[#1e5c3a]' : 'bg-red-500 hover:bg-red-600'}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Today's Log */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-4">Today's Punch Log</h3>
        <div className="space-y-3">
          {TODAYS_LOG.map((log, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${log.type === 'in' ? 'bg-[#e8f5ee]' : 'bg-red-50'}`}>
                {log.type === 'in' ? <LogIn size={14} className="text-[#2D7A4F]" /> : <LogOut size={14} className="text-red-500" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{log.event}</p>
                <p className="text-xs text-gray-500">{log.location}</p>
              </div>
              <span className="text-sm font-bold text-gray-700 tabular-nums">{log.time}</span>
            </div>
          ))}
          {isCheckedIn && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <LogOut size={14} className="text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-400">Check-out pending</p>
                <p className="text-xs text-gray-400">Not yet checked out</p>
              </div>
              <span className="text-sm text-gray-300 tabular-nums">—</span>
            </div>
          )}
        </div>
      </div>

      {/* This Week */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800">This Week</h3>
          <Link href="/employee/attendance/monthly" className="text-xs font-semibold text-[#2D7A4F] hover:underline flex items-center gap-1">
            Monthly view <ChevronRight size={11} />
          </Link>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {WEEK_SUMMARY.map((day) => {
            const cfg = STATUS_CONFIG[day.status] || STATUS_CONFIG.present;
            return (
              <div
                key={day.day}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl border"
                style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
              >
                <span className="text-[10px] font-semibold text-gray-500">{day.day}</span>
                <span className="text-sm font-bold" style={{ color: cfg.color }}>{day.date}</span>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: cfg.color + '20', color: cfg.color }}
                >
                  {cfg.label}
                </span>
                <span className="text-[9px] text-gray-400 tabular-nums">{day.hours}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#e8f5ee] flex items-center justify-center">
            <Clock size={16} className="text-[#2D7A4F]" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Shift</p>
            <p className="text-sm font-bold text-gray-800">09:00 – 18:00</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
            <Coffee size={16} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Grace Time</p>
            <p className="text-sm font-bold text-gray-800">15 minutes</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <TrendingUp size={16} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">This Week</p>
            <p className="text-sm font-bold text-gray-800">36h 43m</p>
          </div>
        </div>
      </div>
    </div>
  );
}
