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

function toTimeString(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function toDateString(d: Date) {
  return d.toISOString().split('T')[0];
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
  const [isLoading, setIsLoading] = useState(false);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const [toast, setToast] = useState<{
    msg: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

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

  /* ── Derived display values ── */
  const timerH = Math.floor(elapsed / 3600);
  const timerM = Math.floor((elapsed % 3600) / 60);
  const timerS = elapsed % 60;
  const timerStr = `${pad(timerH)}:${pad(timerM)}:${pad(timerS)}`;
  const hoursStr = `${timerH}h ${timerM}m`;
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

  /* ── Open modal + fetch location in background ── */
  const handleOpenModal = async () => {
    setShowModal(true);
    setIsFetchingLocation(true);
    const loc = await fetchLocation();
    setLocationData(loc);
    setIsFetchingLocation(false);
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
        const payload = {
          attendance_date: toDateString(now),
          check_in_time: toTimeString(now),
          check_in_method: 'web',
          ...(locationData && {
            check_in_lat: locationData.lat,
            check_in_lng: locationData.lng,
            check_in_location_name: locationData.address,
          }),
        };

        const response = await checkIn(payload, apiKey || '', token);

        if (!response || response.data.success === false) {
          const errorMsg = response?.data.error[0]?.join(', ') || 'Check-in failed. Please try again.';
          throw new Error(errorMsg);
        }

        const recordId = response?.data?.id;

        if (!recordId) {
          throw new Error('No attendance record ID received from server');
        }

        setAttendanceId(recordId);
        setIsCheckedIn(true);
        setCheckInEpoch(now.getTime());
        setElapsed(0);
        showToast(`Checked in at ${fmtTime(now)}`, 'success');
        setShowModal(false);

      } else {
        // ── CHECK OUT ─────────────────────────────
        if (!attendanceId) {
          showToast('Attendance record not found. Please try again.', 'error');
          setShowModal(false);
          return;
        }

        const payload = {
          check_out_time: toTimeString(now),
          check_out_method: 'web',
          ...(locationData && {
            check_out_lat: locationData.lat,
            check_out_lng: locationData.lng,
            check_out_location_name: locationData.address,
          }),
        };

        const response = await checkOut(attendanceId, payload, apiKey, token);

        if (!response || response.data.success === false) {
          const errorMsg = response?.data.error[0]?.join(', ') || 'Check-out failed. Please try again.';
          throw new Error(errorMsg);
        }

        setIsCheckedIn(false);
        setElapsed(0);
        setAttendanceId(null);
        setCheckInEpoch(null);
        showToast(`Checked out. Total: ${hoursStr}. Great work!`, 'info');
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

  return (
    <>
      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold shadow-lg border ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800'
          : toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700'
          : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
          {toast.type === 'error' ? <XCircle size={15}/> : <CheckCircle2 size={15}/>}
          {toast.msg}
        </div>
      )}

      {/* ── Hero Card ── */}
      <div className="relative mb-5 rounded-2xl overflow-hidden bg-slate-900">
        {/* grid texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)'}}/>
        {/* accent glow */}
        <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 transition-colors duration-700 pointer-events-none ${isCheckedIn ? 'bg-emerald-400' : 'bg-slate-600'}`}/>

        <div className="relative z-10 p-4 sm:p-5 lg:p-6">

          {/* ── MOBILE layout (< lg) ── */}
          <div className="lg:hidden">
            {/* Row 1: greeting + live clock */}
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <GreetIcon size={12} className="text-slate-400 flex-shrink-0"/>
                  <span className="text-xs text-slate-400 font-medium">{greeting}</span>
                </div>
                <h1 className="text-lg font-bold text-white leading-tight truncate pr-2">{firstName}</h1>
                <p className="text-xs text-slate-500 truncate">{employeeId}{designation ? ` · ${designation}` : ''}</p>
              </div>
              {/* Live clock — top right on mobile */}
              <div className="text-right flex-shrink-0">
                <p className="font-mono text-2xl font-bold tabular-nums text-white tracking-tight leading-none">
                  {currentTime?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {currentTime?.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>

            {/* Row 2: big timer centered */}
            <div className="text-center py-4 border-y border-slate-800 my-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Time worked today</p>
              <p className="font-mono text-4xl font-bold tabular-nums text-white tracking-tight">
                {isCheckedIn ? timerStr : '00:00:00'}
              </p>
              {/* Progress bar */}
              <div className="mt-3 mx-auto w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${isCheckedIn ? 'bg-emerald-500' : 'bg-slate-700'}`} style={{width:`${pct}%`}}/>
              </div>
              <p className="text-[10px] text-slate-600 mt-1.5">{isCheckedIn ? `${Math.round(pct)}% of 8h shift` : 'Ready to start'}</p>
            </div>

            {/* Row 3: status pill */}
            <div className="flex justify-center mb-3">
              <span className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border ${
                isCheckedIn ? 'bg-emerald-950 border-emerald-800 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isCheckedIn ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}/>
                {isCheckedIn && checkInEpoch ? `Checked in at ${fmtTime(new Date(checkInEpoch))}` : 'Not checked in yet'}
              </span>
            </div>

            {/* Row 4: full-width action button */}
            <button onClick={handleOpenModal} disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50 ${
                isCheckedIn
                  ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20'}`}>
              {isCheckedIn ? <><LogOut size={15}/> Check Out</> : <><LogIn size={15}/> Check In</>}
            </button>

            {/* Row 5: bottom meta */}
            <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
              <span className="flex items-center gap-1 min-w-0"><MapPin size={10} className="flex-shrink-0"/><span className="truncate max-w-[180px]">{locationData?.address ?? defaultLocation}</span></span>
              <span className="flex items-center gap-1 ml-auto flex-shrink-0 text-amber-500"><AlertCircle size={10}/> 1 pending</span>
            </div>
          </div>

          {/* ── DESKTOP layout (≥ lg) ── */}
          <div className="hidden lg:flex lg:items-center lg:gap-8">
            {/* Left: name block */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1.5">
                <GreetIcon size={13} className="text-slate-400"/>
                <span className="text-xs text-slate-400 font-medium">{greeting}</span>
              </div>
              <h1 className="text-2xl font-bold text-white truncate">
                {firstName} <span className="text-slate-400 font-normal">{fullName.slice(firstName.length)}</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">{employeeId}{designation ? ` · ${designation}` : ''}</p>
              <div className="mt-3">
                <span className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border ${
                  isCheckedIn ? 'bg-emerald-950 border-emerald-800 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isCheckedIn ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}/>
                  {isCheckedIn && checkInEpoch ? `In since ${fmtTime(new Date(checkInEpoch))}` : 'Not checked in'}
                </span>
              </div>
            </div>

            {/* Center: live clock */}
            <div className="text-center">
              <p className="font-mono text-4xl font-bold tabular-nums text-white tracking-tight">
                {currentTime?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentTime?.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
              </p>
            </div>

            {/* Right: timer + button */}
            <div className="flex flex-col items-end gap-3">
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Today</p>
                <p className="font-mono text-3xl font-bold tabular-nums text-white">{isCheckedIn ? timerStr : '00:00:00'}</p>
                <div className="mt-1.5 w-36 h-1 bg-slate-800 rounded-full overflow-hidden ml-auto">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{width:`${pct}%`}}/>
                </div>
              </div>
              <button onClick={handleOpenModal} disabled={isLoading}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50 ${
                  isCheckedIn
                    ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/20'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20'}`}>
                {isCheckedIn ? <><LogOut size={15}/> Check Out</> : <><LogIn size={15}/> Check In</>}
              </button>
            </div>
          </div>

          {/* Desktop bottom bar */}
          <div className="hidden lg:flex mt-4 pt-3.5 border-t border-slate-800 items-center flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
            <span className="flex items-center gap-1"><MapPin size={11}/><span className="truncate max-w-xs">{locationData?.address ?? defaultLocation}</span></span>
            <span className="flex items-center gap-1"><Wifi size={11}/> Secure</span>
            {isCheckedIn && <span className="flex items-center gap-1 text-emerald-500"><Timer size={11}/> {hoursStr} worked</span>}
            <span className="ml-auto flex items-center gap-1 text-amber-500"><AlertCircle size={11}/> 1 pending approval</span>
          </div>
        </div>
      </div>

      {/* ── Modal — slides up on mobile ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" onClick={() => !isLoading && setShowModal(false)}>
          <div className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl p-6 sm:p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* drag handle on mobile */}
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5 sm:hidden"/>

            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${isCheckedIn ? 'bg-rose-50' : 'bg-emerald-50'}`}>
              {isCheckedIn ? <LogOut size={18} className="text-rose-600"/> : <LogIn size={18} className="text-emerald-600"/>}
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">{isCheckedIn ? 'Check Out?' : 'Check In?'}</h3>
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">
              {isCheckedIn
                ? `You've been in since ${checkInEpoch ? fmtTime(new Date(checkInEpoch)) : ''} — ${hoursStr} worked. Ready to wrap up?`
                : `Checking in at ${currentTime ? fmtTime(currentTime) : ''}. Ready to start your day?`}
            </p>

            {/* Location block */}
            <div className="flex items-start gap-2 bg-slate-50 rounded-xl px-3 py-2.5 mb-5 border border-slate-100">
              <MapPin size={13} className="text-slate-400 mt-0.5 shrink-0"/>
              {isFetchingLocation ? (
                <span className="text-xs text-slate-400 flex items-center gap-1.5"><Loader2 size={11} className="animate-spin"/> Fetching location…</span>
              ) : locationData ? (
                <div className="min-w-0">
                  <p className="text-xs text-slate-700 font-medium line-clamp-2">{locationData.address}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{locationData.lat.toFixed(5)}, {locationData.lng.toFixed(5)}</p>
                </div>
              ) : (
                <span className="text-xs text-slate-400">Location unavailable — will proceed without it</span>
              )}
            </div>

            <div className="flex gap-2.5">
              <button onClick={() => setShowModal(false)} disabled={isLoading}
                className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleConfirm} disabled={isLoading}
                className={`flex-1 py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                  isCheckedIn ? 'bg-rose-500 hover:bg-rose-600 disabled:opacity-60' : 'bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60'}`}>
                {isLoading
                  ? <><Loader2 size={14} className="animate-spin"/>{isCheckedIn ? 'Checking out…' : 'Checking in…'}</>
                  : isCheckedIn ? 'Check Out' : 'Confirm Check In'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}