'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Clock, MapPin, Timer, CheckCircle2, LogIn, LogOut, 
  Coffee, Wifi, TrendingUp, ChevronRight, Sun, Moon, 
  Zap, Calendar, Award, Target, Battery, Activity,
  ArrowRight, Bell
} from 'lucide-react';

const TODAYS_LOG = [
  { time: '09:12 AM', event: 'Check-in', type: 'in', location: 'Office · Bangalore' },
];

const WEEK_SUMMARY = [
  { day: 'Mon', date: '18', status: 'present', hours: '9h 15m', in: '09:05', out: '18:20' },
  { day: 'Tue', date: '19', status: 'present', hours: '8h 45m', in: '09:30', out: '18:15' },
  { day: 'Wed', date: '20', status: 'leave', hours: '—', in: '—', out: '—' },
  { day: 'Thu', date: '21', status: 'present', hours: '9h 00m', in: '09:10', out: '18:10' },
  { day: 'Fri', date: '22', status: 'active', hours: '5h 43m', in: '09:12', out: '—' },
  { day: 'Sat', date: '23', status: 'holiday', hours: '—', in: '—', out: '—' },
  { day: 'Sun', date: '24', status: 'holiday', hours: '—', in: '—', out: '—' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  present: { label: 'Present', color: '#2D7A4F', bg: '#e8f5ee', border: '#bbddc9' },
  leave: { label: 'Leave', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  absent: { label: 'Absent', color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
  active: { label: 'Active', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  holiday: { label: 'Holiday', color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
};

const QUICK_STATS = [
  { label: 'Today\'s Hours', value: '5h 43m', target: '8h', icon: Timer, color: '#2D7A4F', bg: '#e8f5ee' },
  { label: 'Weekly Total', value: '36h 43m', target: '40h', icon: Calendar, color: '#3b82f6', bg: '#eff6ff' },
  { label: 'Attendance Rate', value: '92%', target: '95%', icon: Target, color: '#f59e0b', bg: '#fffbeb' },
  { label: 'Streak', value: '12 days', target: '20', icon: Battery, color: '#8b5cf6', bg: '#f5f3ff' },
];

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

  const hour = currentTime.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const GreetIcon = hour < 12 ? Sun : hour < 17 ? Zap : Moon;

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-slide-up ${
          toast.type === 'success' ? 'bg-[#e8f5ee] border-[#bbddc9] text-[#2D7A4F]' : 'bg-blue-50 border-blue-200 text-blue-700'
        }`}>
          <CheckCircle2 size={16} />
          {toast.msg}
        </div>
      )}

      <div className="w-full px-4 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Activity size={14} />
            <span>Attendance Management</span>
            <ChevronRight size={12} />
            <span className="text-[#2D7A4F] font-semibold">Check-in/Check-out</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Check-in / Check-out</h1>
          <p className="text-sm text-gray-500 mt-1">Log your daily attendance and track work hours</p>
        </div>

        {/* Main Check-in Card */}
        <div className="w-full bg-gradient-to-br from-[#0f1f2e] via-[#1a3347] to-[#0f2d1e] rounded-2xl p-6 lg:p-8 relative overflow-hidden mb-6">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#2D7A4F] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4a9e6e] rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
          </div>
          
          <div className="relative z-10">
            {/* Greeting and Time */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <GreetIcon size={20} className="text-[#4a9e6e]" />
                  <span className="text-[#4a9e6e] text-sm font-medium">{greeting}</span>
                </div>
                <h2 className="text-2xl font-bold text-white">John Doe</h2>
                <p className="text-white/40 text-sm mt-1">EMP-2024-001 · Senior Software Engineer</p>
              </div>
              
              <div className="text-right">
                <p className="text-3xl lg:text-4xl font-bold text-white tabular-nums tracking-tight">
                  {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
                <p className="text-white/40 text-sm mt-1">
                  {currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Status and Timer */}
            <div className="flex flex-col items-center justify-center mb-8">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border mb-4 ${
                isCheckedIn
                  ? 'bg-[#2D7A4F]/30 text-[#4a9e6e] border-[#2D7A4F]/40'
                  : 'bg-white/10 text-white/50 border-white/10'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isCheckedIn ? 'bg-[#4a9e6e] animate-pulse' : 'bg-white/30'}`} />
                {isCheckedIn ? 'Currently Working' : 'Not Checked In'}
              </div>

              {isCheckedIn && (
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-4">
                    <Timer size={24} className="text-[#4a9e6e]" />
                    <span className="text-3xl lg:text-4xl font-bold text-white tabular-nums">
                      {String(liveHours).padStart(2, '0')}:{String(liveMinutes).padStart(2, '0')}:{String(liveSecs).padStart(2, '0')}
                    </span>
                    <span className="text-white/60 text-sm">worked today</span>
                  </div>
                  <p className="text-white/40 text-xs mt-3">
                    Checked in at {checkInTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
            </div>

            {/* Action button */}
            <div className="flex justify-center">
              {!isCheckedIn ? (
                <button
                  onClick={() => setShowConfirm('in')}
                  className="flex items-center gap-3 bg-[#2D7A4F] hover:bg-[#1e5c3a] text-white font-bold px-10 py-5 rounded-2xl transition-all duration-200 shadow-lg shadow-[#2D7A4F]/30 hover:shadow-[#2D7A4F]/50 hover:scale-105 active:scale-95 text-lg"
                >
                  <LogIn size={22} />
                  Check In Now
                </button>
              ) : (
                <button
                  onClick={() => setShowConfirm('out')}
                  className="flex items-center gap-3 bg-red-500 hover:bg-red-600 text-white font-bold px-10 py-5 rounded-2xl transition-all duration-200 shadow-lg shadow-red-500/30 hover:scale-105 active:scale-95 text-lg"
                >
                  <LogOut size={22} />
                  Check Out
                </button>
              )}
            </div>

            {/* Location & Info */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-white/30" />
                <span className="text-white/40 text-xs">Office · Bangalore</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <div className="flex items-center gap-2">
                <Wifi size={14} className="text-white/30" />
                <span className="text-white/40 text-xs">Secure Connection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {QUICK_STATS.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.bg }}>
                  <stat.icon size={18} style={{ color: stat.color }} />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Target: {stat.target}</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all" 
                  style={{ 
                    width: `${(parseFloat(stat.value.split('h')[0] || stat.value.split('%')[0]) / parseFloat(stat.target.split('h')[0] || stat.target.split('%')[0])) * 100}%`,
                    backgroundColor: stat.color 
                  }} 
                />
              </div>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Today's Log */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Clock size={16} className="text-gray-600" />
                </div>
                <h3 className="text-base font-bold text-gray-800">Today's Timeline</h3>
              </div>
              <span className="text-xs text-gray-400">{currentTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
            </div>
            
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-4">
                {TODAYS_LOG.map((log, i) => (
                  <div key={i} className="relative flex items-start gap-4">
                    <div className="relative z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${log.type === 'in' ? 'bg-[#e8f5ee]' : 'bg-red-50'}`}>
                        {log.type === 'in' ? <LogIn size={14} className="text-[#2D7A4F]" /> : <LogOut size={14} className="text-red-500" />}
                      </div>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-gray-800">{log.event}</p>
                        <span className="text-xs font-bold text-gray-700 tabular-nums">{log.time}</span>
                      </div>
                      <p className="text-xs text-gray-500">{log.location}</p>
                    </div>
                  </div>
                ))}
                
                {isCheckedIn && (
                  <div className="relative flex items-start gap-4 opacity-60">
                    <div className="relative z-10">
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center border-2 border-dashed border-red-200">
                        <LogOut size={14} className="text-red-400" />
                      </div>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl p-3 border-2 border-dashed border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-400">Check-out pending</p>
                        <span className="text-xs text-gray-300 tabular-nums">—</span>
                      </div>
                      <p className="text-xs text-gray-400">Not yet checked out</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* This Week Summary */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Calendar size={16} className="text-gray-600" />
                </div>
                <h3 className="text-base font-bold text-gray-800">This Week</h3>
              </div>
              <Link href="/employee/attendance/monthly" className="text-xs font-semibold text-[#2D7A4F] hover:underline flex items-center gap-1">
                Monthly view <ArrowRight size={11} />
              </Link>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {WEEK_SUMMARY.map((day) => {
                const cfg = STATUS_CONFIG[day.status] || STATUS_CONFIG.present;
                const isToday = day.date === currentTime.getDate().toString();
                return (
                  <div
                    key={day.day}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                      isToday ? 'ring-2 ring-[#2D7A4F] ring-offset-2' : ''
                    }`}
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
                    <span className="text-[9px] text-gray-500 tabular-nums">{day.hours}</span>
                    {day.in !== '—' && (
                      <div className="text-[8px] text-gray-400 tabular-nums">
                        {day.in}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Week Progress</span>
                <span className="font-semibold text-[#2D7A4F]">92%</span>
              </div>
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#2D7A4F] to-[#4a9e6e] rounded-full" style={{ width: '92%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#e8f5ee] flex items-center justify-center">
              <Clock size={18} className="text-[#2D7A4F]" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Working Hours</p>
              <p className="text-sm font-bold text-gray-800">09:00 AM – 06:00 PM</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Coffee size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Lunch Break</p>
              <p className="text-sm font-bold text-gray-800">01:00 PM – 02:00 PM</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <TrendingUp size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">This Week Total</p>
              <p className="text-sm font-bold text-gray-800">36h 43m / 40h</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Award size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Current Streak</p>
              <p className="text-sm font-bold text-gray-800">12 days · Great!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-slide-up">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
              showConfirm === 'in' ? 'bg-[#e8f5ee]' : 'bg-red-50'
            }`}>
              {showConfirm === 'in' ? (
                <LogIn size={24} className="text-[#2D7A4F]" />
              ) : (
                <LogOut size={24} className="text-red-500" />
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {showConfirm === 'in' ? 'Confirm Check-in' : 'Confirm Check-out'}
            </h3>
            <p className="text-gray-500 mb-6">
              {showConfirm === 'in'
                ? `You are checking in at ${currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
                : `You are checking out at ${currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}. Total time: ${liveHours}h ${liveMinutes}m`
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(showConfirm)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold text-white transition-colors ${
                  showConfirm === 'in' ? 'bg-[#2D7A4F] hover:bg-[#1e5c3a]' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}