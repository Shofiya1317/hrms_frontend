'use client';

import React, { useState, useEffect } from 'react';
import {
  Sun,
  Zap,
  Moon,
  Timer,
  AlertCircle,
  MapPin,
  Wifi,
  LogIn,
  LogOut,
  CheckCircle2,
  Loader2,
  XCircle,
} from 'lucide-react';
import { checkIn, checkOut } from '@/lib/service/attendance';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function pad(n: number) {
  return String(n).padStart(2, '0');
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}



function toDateString(d: Date) {
  return d.toISOString().split('T')[0];
}

/**
 * Collects device and browser information
 */
function getDeviceInfo(): string {
  const nav = navigator;
  const ua = nav.userAgent;
  
  // Extract browser
  let browser = 'Unknown';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  
  // Extract OS
  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  
  return `${os}, ${browser}`;
}

/**
 * Fetches browser geolocation then reverse-geocodes via Nominatim (free, no key).
 * Returns null silently if denied or on any error — never blocks the flow.
 */
async function fetchLocation(): Promise<LocationData | null> {
  return new Promise((resolve) => {
    if (!navigator?.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en' } },
          );
          const data = await res.json();
          resolve({
            lat,
            lng,
            address: data?.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          });
        } catch {
          resolve({ lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
        }
      },
      () => resolve(null),
      { timeout: 8000 },
    );
  });
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
interface CheckInOutCardProps {
  apiKey: string;
  slug?: string;
  token: string;
  fullName: string;
  employeeId: string;
  designation: string;
  defaultLocation?: string;
}

export default function CheckInOutCard({
  apiKey,
  slug,
  token,
  fullName,
  employeeId,
  designation,
  defaultLocation = 'Unknown',
}: CheckInOutCardProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInEpoch, setCheckInEpoch] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // API state
  const [attendanceId, setAttendanceId] = useState<string | null>(null);
  const [checkInTimeUtc, setCheckInTimeUtc] = useState<string | null>(null);
  const [workSummary, setWorkSummary] = useState<{
    totalWorkedHours: string;
    isEarlyExit: boolean;
    earlyExitMinutes: number;
    isOvertime: boolean;
    overtimeMinutes: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const [toast, setToast] = useState<{
    msg: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  /* ── Load persisted state from localStorage ── */
  useEffect(() => {
    const savedState = localStorage.getItem('attendance_state');
    if (savedState) {
      try {
        const { attendanceId, checkInEpoch, checkInTimeUtc } = JSON.parse(savedState);
        if (attendanceId && checkInEpoch) {
          setAttendanceId(attendanceId);
          setCheckInEpoch(checkInEpoch);
          setCheckInTimeUtc(checkInTimeUtc || null);
          setIsCheckedIn(true);
        }
      } catch (e) {
        localStorage.removeItem('attendance_state');
      }
    }
  }, []);

  /* ── Tick every second ── */
  useEffect(() => {
    setCurrentTime(new Date());
    const t = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      if (isCheckedIn && checkInEpoch) {
        setElapsed(Math.floor((now.getTime() - checkInEpoch) / 1000));
      }
    }, 1000);
    return () => clearInterval(t);
  }, [isCheckedIn, checkInEpoch]);

  /* ── Persist state to localStorage ── */
  useEffect(() => {
    if (isCheckedIn && attendanceId && checkInEpoch) {
      localStorage.setItem('attendance_state', JSON.stringify({
        attendanceId,
        checkInEpoch,
        checkInTimeUtc
      }));
    } else {
      localStorage.removeItem('attendance_state');
    }
  }, [isCheckedIn, attendanceId, checkInEpoch, checkInTimeUtc]);

  /* ── Derived display values ── */
  const timerH = Math.floor(elapsed / 3600);
  const timerM = Math.floor((elapsed % 3600) / 60);
  const timerS = elapsed % 60;
  const timerStr = `${pad(timerH)}:${pad(timerM)}:${pad(timerS)}`;
  const hoursStr = workSummary ? `${workSummary.totalWorkedHours}h` : `${timerH}h ${timerM}m`;
  const pct = Math.min((elapsed / (8 * 3600)) * 100, 100);

  const hour = currentTime ? currentTime.getHours() : 12;
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const GreetIcon = hour < 12 ? Sun : hour < 17 ? Zap : Moon;
  const firstName = fullName.split(' ')[0];

  /* ── Toast helper ── */
  const showToast = (msg: string, type: 'success' | 'info' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };



  /* ── Confirm check-in / check-out ── */
  const handleConfirm = async () => {
    // Validate API credentials before proceeding
    if (!apiKey && !slug) {
      showToast('Missing API credentials. Please contact support.', 'error');
      setShowModal(false);
      return;
    }

    if (!token) {
      showToast('Authentication token missing. Please login again.', 'error');
      setShowModal(false);
      return;
    }

    const now = new Date();
    setIsLoading(true);

    try {
      if (!isCheckedIn) {
        // ── CHECK IN ──────────────────────────────
        const payload: any = {
          attendance_date: toDateString(now),
          check_in_time: now.toISOString(),
          check_in_lat: locationData?.lat || 0,
          check_in_lng: locationData?.lng || 0,
          check_in_location_name: locationData?.address || defaultLocation,
          check_in_method: 'gps',
          check_in_device_info: getDeviceInfo(),
        };

        const response = await checkIn(payload, apiKey || '', token);

        if (!response || response?.data?.success === false) {
          const errorMsg = response?.data?.error?.[0]?.join(', ') || 'Check-in failed. Please try again.';
          throw new Error(errorMsg);
        }

        const recordId = response?.data?.data?.id;
        const checkInTime = response?.data?.data?.check_in_info?.time_utc;
        const message = response?.data?.message || `Checked in at ${fmtTime(now)}`;

        if (!recordId) {
          throw new Error('No attendance record ID received from server');
        }

        setAttendanceId(recordId);
        setCheckInTimeUtc(checkInTime || now.toISOString());
        setIsCheckedIn(true);
        setCheckInEpoch(now.getTime());
        setElapsed(0);
        showToast(message, 'success');
        setShowModal(false);

      } else {
        // ── CHECK OUT ─────────────────────────────
        if (!attendanceId) {
          showToast('Attendance record not found. Please try again.', 'error');
          setShowModal(false);
          return;
        }

        const payload: any = {
          check_out_time: now.toISOString(),
          check_out_lat: locationData?.lat || 0,
          check_out_lng: locationData?.lng || 0,
          check_out_location_name: locationData?.address || defaultLocation,
          check_out_method: 'gps',
        };

        const response = await checkOut(attendanceId, payload, apiKey, token);

        if (!response || response?.data?.success === false) {
          const errorMsg = response?.data?.error?.[0]?.join(', ') || 'Check-out failed. Please try again.';
          throw new Error(errorMsg);
        }

        const summary = response?.data?.data?.work_summary;
        let message = response?.data?.message || 'Checked out successfully!';
        
        // Store work summary
        if (summary) {
          const summaryData = {
            totalWorkedHours: summary.total_worked_hours || '0',
            isEarlyExit: summary.is_early_exit || false,
            earlyExitMinutes: summary.early_exit_minutes || 0,
            isOvertime: summary.is_overtime || false,
            overtimeMinutes: summary.overtime_minutes || 0,
          };
          setWorkSummary(summaryData);
          
          // Enhanced message with work summary
          if (summaryData.isEarlyExit) {
            const earlyHours = Math.floor(summaryData.earlyExitMinutes / 60);
            const earlyMins = summaryData.earlyExitMinutes % 60;
            message = `Checked out successfully! Total worked: ${summaryData.totalWorkedHours}h. Early exit by ${earlyHours}h ${earlyMins}m`;
          } else if (summaryData.isOvertime) {
            const otHours = Math.floor(summaryData.overtimeMinutes / 60);
            const otMins = summaryData.overtimeMinutes % 60;
            message = `Great work! Total: ${summaryData.totalWorkedHours}h. Overtime: ${otHours}h ${otMins}m`;
          } else {
            message = `Checked out successfully! Total worked: ${summaryData.totalWorkedHours}h`;
          }
        }

        setIsCheckedIn(false);
        setElapsed(0);
        setAttendanceId(null);
        setCheckInEpoch(null);
        setCheckInTimeUtc(null);
        showToast(message, 'info');
        
        // Show work summary for 8 seconds, then clear
        setTimeout(() => {
          setWorkSummary(null);
        }, 20000);
        
        setShowModal(false);
      }
    } catch (err: any) {
      console.error('Attendance API Error:', err);

      let msg = 'Something went wrong. Please try again.';

      if (err?.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err?.response?.data?.error) {
        msg = Array.isArray(err.response.data.error)
          ? err.response.data.error.join(', ')
          : err.response.data.error;
      } else if (err?.message) {
        msg = err.message;
      }

      if (msg.includes('API KEY') || msg.includes('SLUG')) {
        msg = 'Invalid or missing API credentials. Please contact administrator.';
      } else if (msg.includes('Internal Server Error') || msg.includes('500')) {
        msg = 'Server error. Please try again later or contact support.';
      }

      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
      setLocationData(null);
    }
  };

  /* ── Handle Check In ── */
  const handleCheckIn = async () => {
    setShowModal(true);
    setIsFetchingLocation(true);
    const loc = await fetchLocation();
    setLocationData(loc);
    setIsFetchingLocation(false);
  };

  /* ── Handle Check Out ── */
  const handleCheckOut = async () => {
    setShowModal(true);
    setIsFetchingLocation(true);
    const loc = await fetchLocation();
    setLocationData(loc);
    setIsFetchingLocation(false);
  };

  return (
    <>
      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-2 fade-in duration-300`}>
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold shadow-2xl border backdrop-blur-xl ${
            toast.type === 'success' ? 'bg-emerald-500/95 border-emerald-400/50 text-white'
            : toast.type === 'error' ? 'bg-rose-500/95 border-rose-400/50 text-white'
            : 'bg-blue-500/95 border-blue-400/50 text-white'}`}>
            {toast.type === 'error' ? <XCircle size={18} strokeWidth={2.5}/> : <CheckCircle2 size={18} strokeWidth={2.5}/>}
            <span className="max-w-xs">{toast.msg}</span>
          </div>
        </div>
      )}

      {/* ── Work Summary Card (After Checkout) ── */}
      {workSummary && (
        <div className="mb-6 animate-in slide-in-from-top-4 fade-in duration-500">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 shadow-2xl border border-indigo-700/50">
            {/* Animated gradient orbs */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl bg-blue-500/20"/>
              <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"/>
            </div>
            
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage:'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)'}}/>

            <div className="relative z-10 p-6 lg:p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={20} className="text-emerald-400" strokeWidth={2.5}/>
                    <span className="text-sm text-blue-200 font-semibold">Work Summary</span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-white">Session Complete</h2>
                </div>
                <button 
                  onClick={() => setWorkSummary(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                  <XCircle size={18} className="text-white/60"/>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Hours Worked */}
                <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent"/>
                  <div className="relative">
                    <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold mb-2">Total Worked</p>
                    <p className="text-4xl font-bold text-white mb-1">{workSummary.totalWorkedHours}<span className="text-xl text-blue-200">h</span></p>
                    <p className="text-xs text-blue-300">Hours today</p>
                  </div>
                </div>

                {/* Early Exit / Overtime */}
                {workSummary.isEarlyExit ? (
                  <div className="relative overflow-hidden rounded-2xl bg-amber-500/10 backdrop-blur-xl border border-amber-500/30 p-5">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.05] to-transparent"/>
                    <div className="relative">
                      <p className="text-xs text-amber-200 uppercase tracking-wider font-semibold mb-2">Early Exit</p>
                      <p className="text-4xl font-bold text-amber-300 mb-1">
                        {Math.floor(workSummary.earlyExitMinutes / 60)}<span className="text-xl">h</span> {workSummary.earlyExitMinutes % 60}<span className="text-xl">m</span>
                      </p>
                      <p className="text-xs text-amber-200">Before shift end</p>
                    </div>
                  </div>
                ) : workSummary.isOvertime ? (
                  <div className="relative overflow-hidden rounded-2xl bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/30 p-5">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.05] to-transparent"/>
                    <div className="relative">
                      <p className="text-xs text-emerald-200 uppercase tracking-wider font-semibold mb-2">Overtime</p>
                      <p className="text-4xl font-bold text-emerald-300 mb-1">
                        {Math.floor(workSummary.overtimeMinutes / 60)}<span className="text-xl">h</span> {workSummary.overtimeMinutes % 60}<span className="text-xl">m</span>
                      </p>
                      <p className="text-xs text-emerald-200">Extra hours</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative overflow-hidden rounded-2xl bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/30 p-5">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.05] to-transparent"/>
                    <div className="relative">
                      <p className="text-xs text-emerald-200 uppercase tracking-wider font-semibold mb-2">Status</p>
                      <p className="text-2xl font-bold text-emerald-300 mb-1">On Time</p>
                      <p className="text-xs text-emerald-200">Perfect shift</p>
                    </div>
                  </div>
                )}

                {/* Status Badge */}
                <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent"/>
                  <div className="relative">
                    <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold mb-2">Completion</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"/>
                      <p className="text-xl font-bold text-white">100%</p>
                    </div>
                    <p className="text-xs text-blue-300">Session ended</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-blue-200 text-center">
                  This summary will automatically disappear in a few seconds
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Premium Hero Card ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl border border-slate-700/50">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl transition-all duration-1000 ${
            isCheckedIn ? 'bg-emerald-500/20' : 'bg-violet-500/10'}`}/>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"/>
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage:'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)'}}/>

        <div className="relative z-10 p-6 lg:p-8">
          {/* ── Header Section ── */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <GreetIcon size={16} className="text-slate-400"/>
                <span className="text-sm text-slate-400 font-medium">{greeting}</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-1">
                {firstName}
              </h1>
              <p className="text-sm text-slate-400">{designation} • {employeeId}</p>
            </div>
            
            {/* Live Clock */}
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Current Time</p>
              <p className="font-mono text-3xl lg:text-4xl font-bold text-white tabular-nums tracking-tight">
                {currentTime?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {currentTime?.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* ── Timer Display (Center Highlight) ── */}
          <div className="relative mb-8">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-8">
              {/* Glassmorphism effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent"/>
              
              <div className="relative z-10 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Timer size={16} className={isCheckedIn ? 'text-emerald-400 animate-pulse' : 'text-slate-600'}/>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
                    {isCheckedIn ? 'Time Worked Today' : 'Ready to Start'}
                  </p>
                </div>
                
                {/* Giant Timer */}
                <p className={`font-mono text-6xl lg:text-7xl font-bold tabular-nums tracking-tighter mb-4 transition-colors duration-500 ${
                  isCheckedIn ? 'text-white' : 'text-slate-700'}`}>
                  {isCheckedIn ? timerStr : '00:00:00'}
                </p>

                {/* Progress Bar */}
                <div className="relative w-full max-w-md mx-auto h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      isCheckedIn ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-slate-700'}`} 
                    style={{width:`${pct}%`}}
                  />
                  {/* Shimmer effect */}
                  {isCheckedIn && (
                    <div className="absolute inset-0 overflow-hidden rounded-full">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"/>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-xs text-slate-500 max-w-md mx-auto">
                  <span>{isCheckedIn ? `${Math.round(pct)}% Complete` : 'Not Started'}</span>
                  <span>Target: 8h</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Status Badge ── */}
          <div className="flex justify-center mb-6">
            <div className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full border backdrop-blur-xl ${
              isCheckedIn 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-slate-800/50 border-slate-700/50 text-slate-400'}`}>
              <span className={`relative flex h-2.5 w-2.5`}>
                {isCheckedIn && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isCheckedIn ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
              </span>
              <span className="text-sm font-semibold">
                {isCheckedIn && checkInEpoch 
                  ? `Checked in at ${fmtTime(new Date(checkInEpoch))} • ${hoursStr} elapsed`
                  : 'Not checked in yet'}
              </span>
            </div>
          </div>

          {/* ── Action Buttons ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Check In Button */}
            <button 
              onClick={handleCheckIn}
              disabled={isCheckedIn || isLoading}
              className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${
                isCheckedIn 
                  ? 'bg-slate-800/50 border border-slate-700/50 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] border border-emerald-400/20'}`}>
              {/* Shine effect */}
              {!isCheckedIn && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"/>
                </div>
              )}
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${
                    isCheckedIn ? 'bg-slate-700/50' : 'bg-white/20'}`}>
                    <LogIn size={24} className="text-white" strokeWidth={2.5}/>
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-bold text-white">Check In</p>
                    <p className={`text-xs ${
                      isCheckedIn ? 'text-slate-500' : 'text-emerald-100'}`}>
                      {isCheckedIn ? 'Already checked in' : 'Start your day'}
                    </p>
                  </div>
                </div>
                {!isCheckedIn && (
                  <CheckCircle2 size={20} className="text-white/60" strokeWidth={2.5}/>
                )}
              </div>
            </button>

            {/* Check Out Button */}
            <button 
              onClick={handleCheckOut}
              disabled={!isCheckedIn || isLoading}
              className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${
                !isCheckedIn 
                  ? 'bg-slate-800/50 border border-slate-700/50 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-br from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:scale-[1.02] active:scale-[0.98] border border-rose-400/20'}`}>
              {/* Shine effect */}
              {isCheckedIn && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"/>
                </div>
              )}
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${
                    !isCheckedIn ? 'bg-slate-700/50' : 'bg-white/20'}`}>
                    <LogOut size={24} className="text-white" strokeWidth={2.5}/>
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-bold text-white">Check Out</p>
                    <p className={`text-xs ${
                      !isCheckedIn ? 'text-slate-500' : 'text-rose-100'}`}>
                      {!isCheckedIn ? 'Check in first' : `End shift • ${hoursStr}`}
                    </p>
                  </div>
                </div>
                {isCheckedIn && (
                  <XCircle size={20} className="text-white/60" strokeWidth={2.5}/>
                )}
              </div>
            </button>
          </div>

          {/* ── Footer Info ── */}
          <div className="mt-6 pt-6 border-t border-slate-700/50 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-slate-600"/>
              <span className="truncate max-w-xs">{defaultLocation}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wifi size={14} className="text-emerald-500"/>
              <span className="text-slate-400">Connected</span>
            </div>
            {isCheckedIn && (
              <div className="flex items-center gap-1.5 text-emerald-400">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"/>
                <span className="font-semibold">Active Session</span>
              </div>
            )}
            <div className="ml-auto flex items-center gap-1.5 text-amber-400">
              <AlertCircle size={14}/>
              <span>1 pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Premium Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[90] p-4 animate-in fade-in duration-200" 
             onClick={() => !isLoading && setShowModal(false)}>
          <div className="relative w-full max-w-md bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300" 
               onClick={e => e.stopPropagation()}>
            
            {/* Accent top border */}
            <div className={`h-1.5 w-full ${isCheckedIn ? 'bg-gradient-to-r from-rose-500 to-pink-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`}/>
            
            <div className="p-6 sm:p-8">
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                isCheckedIn ? 'bg-gradient-to-br from-rose-500 to-pink-500' : 'bg-gradient-to-br from-emerald-500 to-teal-500'}`}>
                {isCheckedIn 
                  ? <LogOut size={26} className="text-white" strokeWidth={2.5}/> 
                  : <LogIn size={26} className="text-white" strokeWidth={2.5}/>}
              </div>
              
              {/* Title & Description */}
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {isCheckedIn ? 'Check Out Confirmation' : 'Check In Confirmation'}
              </h3>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                {isCheckedIn
                  ? `You've worked ${timerH > 0 ? `${timerH}h ${timerM}m` : `${timerM}m`} since ${checkInEpoch ? fmtTime(new Date(checkInEpoch)) : ''}. Ready to end your shift?`
                  : `Starting your shift at ${currentTime ? fmtTime(currentTime) : ''}. Let's make it a great day!`}
              </p>

              {/* Location Info Card */}
              <div className="bg-slate-100 rounded-2xl p-4 mb-6 border border-slate-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    <MapPin size={16} className="text-slate-600"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Location</p>
                    {isFetchingLocation ? (
                      <div className="flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin text-slate-400"/>
                        <span className="text-sm text-slate-500">Detecting location...</span>
                      </div>
                    ) : locationData ? (
                      <>
                        <p className="text-sm text-slate-900 font-medium line-clamp-2 mb-1">{locationData.address}</p>
                        <p className="text-xs text-slate-500 font-mono">
                          {locationData.lat.toFixed(5)}, {locationData.lng.toFixed(5)}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-slate-500">Location unavailable - continuing without GPS data</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowModal(false)} 
                  disabled={isLoading}
                  className="flex-1 py-3.5 px-4 border-2 border-slate-200 hover:border-slate-300 rounded-xl text-slate-700 text-sm font-bold hover:bg-slate-50 disabled:opacity-50 transition-all active:scale-95">
                  Cancel
                </button>
                <button 
                  onClick={handleConfirm} 
                  disabled={isLoading}
                  className={`flex-1 py-3.5 px-4 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60 shadow-lg ${
                    isCheckedIn 
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-rose-500/30' 
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/30'}`}>
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" strokeWidth={2.5}/>
                      {isCheckedIn ? 'Checking out...' : 'Checking in...'}
                    </>
                  ) : (
                    <>
                      {isCheckedIn ? 'Confirm Check Out' : 'Confirm Check In'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}