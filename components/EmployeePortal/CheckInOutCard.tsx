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

  const hour = currentTime ? currentTime.getHours() : 12;
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const GreetIcon = hour < 12 ? Sun : hour < 17 ? Zap : Moon;

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

        // Pass either apiKey or slug based on what's available
        const response = await checkIn(
          payload, 
          apiKey || '', 
          token,
          
        );
        
        // Check if response indicates success
        if (!response || response.data.success === false) {
          // Handle failed response
          const errorMsg = response?.data.error[0]?.join(', ') || 'Check-in failed. Please try again.';
          throw new Error(errorMsg);
        }
        
        // Only update state if API call was successful
        const recordId = response?.data?.id;
        
        if (!recordId) {
          throw new Error('No attendance record ID received from server');
        }

        setAttendanceId(recordId);
        setIsCheckedIn(true);
        setCheckInEpoch(now.getTime());
        setElapsed(0);
        showToast(`Checked in at ${fmtTime(now)}`, 'success');
        setShowModal(false); // Close modal on success

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
        
        // Check if response indicates success
        if (!response || response.data.success === false) {
          const errorMsg = response?.data.error[0]?.join(', ') || 'Check-out failed. Please try again.';
          throw new Error(errorMsg);
        }

        setIsCheckedIn(false);
        setElapsed(0);
        setAttendanceId(null);
        setCheckInEpoch(null);
        showToast(`Checked out. Total: ${hoursStr}. Great work!`, 'info');
        setShowModal(false); // Close modal on success
      }
    } catch (err: any) {
      console.error('Attendance API Error:', err);
      
      // Handle specific error cases
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
      
      // Check for specific error types
      if (msg.includes('API KEY') || msg.includes('SLUG')) {
        msg = 'Invalid or missing API credentials. Please contact administrator.';
      } else if (msg.includes('Internal Server Error') || msg.includes('500')) {
        msg = 'Server error. Please try again later or contact support.';
      }
      
      showToast(msg, 'error');
      // DO NOT update state on error - stay in current state
      
    } finally {
      setIsLoading(false);
      setLocationData(null);
      // Only close modal on success, keep open on error so user can retry
      // Modal will be closed in success cases above
    }
  };

  return (
    <>
      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold border shadow-md animate-fade-in ${
            toast.type === 'success'
              ? 'bg-[#e8f5ee] border-[#bbddc9] text-[#1a5c38]'
              : toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-[#eff6ff] border-[#bfdbfe] text-[#1e3a8a]'
          }`}
        >
          {toast.type === 'error' ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
          {toast.msg}
        </div>
      )}

      {/* ── Hero dark card ── */}
      <div className="w-full bg-gradient-to-br from-[#0f1f2e] via-[#1a3347] to-[#0f2d1e] rounded-2xl p-4 relative overflow-hidden mb-6">
        {/* Ambient glow blobs */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#2D7A4F] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#4a9e6e] rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        </div>

        <div className="relative z-10">
          {/* Row 1: Name + Clock */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <GreetIcon size={14} className="text-[#4a9e6e]" />
                <span className="text-[#4a9e6e] text-sm font-medium">
                  {greeting}
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                {fullName}
              </h1>
              <p className="text-white/60 text-xs mt-0.5">
                {employeeId} · {designation}
              </p>
            </div>

            <div className="text-right shrink-0">
              <p className="text-white text-2xl lg:text-3xl font-bold tabular-nums font-mono">
                {currentTime?.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p className="text-white/40 text-xs">
                {currentTime?.toLocaleDateString('en-IN', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Row 2: Timer + Action Button */}
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex-1">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">
                Today's work
              </p>
              <p className="font-mono text-white text-4xl lg:text-5xl font-semibold tracking-tight tabular-nums">
                {isCheckedIn ? timerStr : '00:00:00'}
              </p>
              <p className="text-white/30 text-xs mt-1">
                {isCheckedIn && checkInEpoch
                  ? `Since ${fmtTime(new Date(checkInEpoch))}`
                  : 'Ready to start'}
              </p>
            </div>

            <div className="shrink-0">
              {isCheckedIn ? (
                <button
                  onClick={handleOpenModal}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-red-500/20"
                >
                  <LogOut size={16} />
                  Check Out
                </button>
              ) : (
                <button
                  onClick={handleOpenModal}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-[#2D7A4F] hover:bg-[#23663f] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-[#2D7A4F]/30"
                >
                  <LogIn size={16} />
                  Check In
                </button>
              )}
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10 mt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  isCheckedIn
                    ? 'bg-[#2D7A4F]/30 text-[#4a9e6e] border border-[#2D7A4F]/40'
                    : 'bg-white/10 text-white/90 border border-white/20'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${isCheckedIn ? 'bg-[#4a9e6e] animate-pulse' : 'bg-white/50'}`}
                />
                {isCheckedIn && checkInEpoch
                  ? `Checked in at ${fmtTime(new Date(checkInEpoch))}`
                  : 'Not checked in'}
              </div>

              {isCheckedIn && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-white/80 border border-white/10">
                  <Timer size={12} />
                  {hoursStr} worked today
                </div>
              )}

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/20">
                <AlertCircle size={12} />1 pending approval
              </div>
            </div>

            {/* Live location display */}
            <div className="flex items-center gap-2 text-xs text-white/40">
              <span className="flex items-center gap-1 max-w-[180px] truncate">
                <MapPin size={12} className="shrink-0" />
                <span className="truncate">
                  {locationData ? locationData.address : defaultLocation}
                </span>
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="flex items-center gap-1">
                <Wifi size={12} /> Secure
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Confirm Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => !isLoading && setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal icon */}
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                isCheckedIn ? 'bg-red-50' : 'bg-[#e8f5ee]'
              }`}
            >
              {isCheckedIn ? (
                <LogOut size={22} className="text-red-600" />
              ) : (
                <LogIn size={22} className="text-[#2D7A4F]" />
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {isCheckedIn ? 'Check Out?' : 'Check In?'}
            </h3>
            <p className="text-gray-500 mb-4 leading-relaxed text-sm">
              {isCheckedIn
                ? `You checked in at ${checkInEpoch ? fmtTime(new Date(checkInEpoch)) : ''}. Total worked: ${hoursStr}. Ready to check out?`
                : `Checking in at ${currentTime ? fmtTime(currentTime) : ''}. Ready to start your workday?`}
            </p>

            {/* Location preview */}
            <div className="flex items-start gap-2 bg-gray-50 rounded-xl px-3 py-2.5 mb-6">
              <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
              {isFetchingLocation ? (
                <span className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Loader2 size={12} className="animate-spin" />
                  Fetching your location…
                </span>
              ) : locationData ? (
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 font-medium leading-snug line-clamp-2">
                    {locationData.address}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {locationData.lat.toFixed(5)}, {locationData.lng.toFixed(5)}
                  </p>
                </div>
              ) : (
                <span className="text-xs text-gray-400">
                  Location unavailable — will proceed without it
                </span>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={`flex-1 px-4 py-3 rounded-xl text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                  isCheckedIn
                    ? 'bg-red-600 hover:bg-red-700 disabled:opacity-60'
                    : 'bg-[#2D7A4F] hover:bg-[#23663f] disabled:opacity-60'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    {isCheckedIn ? 'Checking out…' : 'Checking in…'}
                  </>
                ) : isCheckedIn ? (
                  'Check Out'
                ) : (
                  'Check In'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}