'use client';

import React, { useState, useEffect } from 'react';
import {
  Sun,
  Zap,
  Moon,
  LogIn,
  LogOut,
  CheckCircle2,
  Loader2,
  XCircle,
  MapPin,
  Wifi,
  AlertCircle,
  Clock,
  CalendarDays,
  TrendingUp,
} from 'lucide-react';
import { checkIn, checkOut } from '@/lib/service/attendance';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface LocationData {
  lat: number;
  lng: number;
  address: string;
  accuracy?: number;
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

function getDeviceInfo(): string {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  return `${os}, ${browser}`;
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    const data = await res.json();
    const parts = [
      data?.locality || data?.city,
      data?.principalSubdivision,
      data?.countryName,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

async function fetchLocation(): Promise<LocationData | null> {
  if (!navigator?.geolocation) return null;

  const getPosition = (opts: PositionOptions): Promise<GeolocationPosition> =>
    new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, opts));

  let position: GeolocationPosition | null = null;

  // First attempt: high accuracy GPS, no cache, 15s
  try {
    position = await getPosition({ enableHighAccuracy: true, maximumAge: 0, timeout: 15000 });
  } catch {
    // Second attempt: network/WiFi based, also no cache
    try {
      position = await getPosition({ enableHighAccuracy: false, maximumAge: 0, timeout: 10000 });
    } catch {
      return null;
    }
  }

  const { latitude: lat, longitude: lng, accuracy } = position.coords;
  const address = await reverseGeocode(lat, lng);
  return { lat, lng, address, accuracy: Math.round(accuracy) };
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
  icon: React.ElementType;
  accent?: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</span>
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${accent ?? 'bg-gray-50'}`}>
          <Icon size={14} className="text-gray-500" />
        </span>
      </div>
      <p className="text-xl font-semibold tabular-nums text-gray-900">{value}</p>
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
    </div>
  );
}

function StatusBadge({ type }: { type: 'on-time' | 'overtime' | 'early-exit' | 'absent' | 'active' }) {
  const map = {
    'on-time':   { label: 'On time',    cls: 'bg-emerald-50 text-emerald-700' },
    overtime:    { label: 'Overtime',   cls: 'bg-blue-50 text-blue-700' },
    'early-exit':{ label: 'Early exit', cls: 'bg-amber-50 text-amber-700' },
    absent:      { label: 'Absent',     cls: 'bg-red-50 text-red-600' },
    active:      { label: '● Active',   cls: 'bg-emerald-50 text-emerald-700' },
  };
  const { label, cls } = map[type];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────
// Props
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

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
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
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' | 'error' } | null>(null);

  /* ── Load persisted state ── */
  useEffect(() => {
    const saved = localStorage.getItem('attendance_state');
    if (saved) {
      try {
        const { attendanceId, checkInEpoch, checkInTimeUtc } = JSON.parse(saved);
        if (attendanceId && checkInEpoch) {
          setAttendanceId(attendanceId);
          setCheckInEpoch(checkInEpoch);
          setCheckInTimeUtc(checkInTimeUtc || null);
          setIsCheckedIn(true);
        }
      } catch {
        localStorage.removeItem('attendance_state');
      }
    }
  }, []);

  /* ── Tick ── */
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

  /* ── Persist ── */
  useEffect(() => {
    if (isCheckedIn && attendanceId && checkInEpoch) {
      localStorage.setItem('attendance_state', JSON.stringify({ attendanceId, checkInEpoch, checkInTimeUtc }));
    } else {
      localStorage.removeItem('attendance_state');
    }
  }, [isCheckedIn, attendanceId, checkInEpoch, checkInTimeUtc]);

  /* ── Derived ── */
  const timerH = Math.floor(elapsed / 3600);
  const timerM = Math.floor((elapsed % 3600) / 60);
  const timerS = elapsed % 60;
  const timerStr = `${pad(timerH)}:${pad(timerM)}:${pad(timerS)}`;
  const pct = Math.min((elapsed / (8 * 3600)) * 100, 100);
  const firstName = fullName.split(' ')[0];
  const hour = currentTime ? currentTime.getHours() : 12;
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const GreetIcon = hour < 12 ? Sun : hour < 17 ? Zap : Moon;

  /* ── Toast ── */
  const showToast = (msg: string, type: 'success' | 'info' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  /* ── Confirm ── */
  const handleConfirm = async () => {
    if (!apiKey && !slug) { showToast('Missing API credentials. Please contact support.', 'error'); setShowModal(false); return; }
    if (!token) { showToast('Authentication token missing. Please login again.', 'error'); setShowModal(false); return; }

    const now = new Date();
    setIsLoading(true);

    try {
      if (!isCheckedIn) {
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
          throw new Error(response?.data?.error?.[0]?.join(', ') || 'Check-in failed. Please try again.');
        }
        const recordId = response?.data?.data?.id;
        const checkInTime = response?.data?.data?.check_in_info?.time_utc;
        if (!recordId) throw new Error('No attendance record ID received from server');
        setAttendanceId(recordId);
        setCheckInTimeUtc(checkInTime || now.toISOString());
        setIsCheckedIn(true);
        setCheckInEpoch(now.getTime());
        setElapsed(0);
        showToast(response?.data?.message || `Checked in at ${fmtTime(now)}`, 'success');
        setShowModal(false);
      } else {
        if (!attendanceId) { showToast('Attendance record not found. Please try again.', 'error'); setShowModal(false); return; }
        const payload: any = {
          check_out_time: now.toISOString(),
          check_out_lat: locationData?.lat || 0,
          check_out_lng: locationData?.lng || 0,
          check_out_location_name: locationData?.address || defaultLocation,
          check_out_method: 'gps',
        };
        const response = await checkOut(attendanceId, payload, apiKey, token);
        if (!response || response?.data?.success === false) {
          throw new Error(response?.data?.error?.[0]?.join(', ') || 'Check-out failed. Please try again.');
        }
        const summary = response?.data?.data?.work_summary;
        let message = response?.data?.message || 'Checked out successfully!';
        if (summary) {
          const s = {
            totalWorkedHours: summary.total_worked_hours || '0',
            isEarlyExit: summary.is_early_exit || false,
            earlyExitMinutes: summary.early_exit_minutes || 0,
            isOvertime: summary.is_overtime || false,
            overtimeMinutes: summary.overtime_minutes || 0,
          };
          setWorkSummary(s);
          if (s.isEarlyExit) {
            const eh = Math.floor(s.earlyExitMinutes / 60), em = s.earlyExitMinutes % 60;
            message = `Checked out. Total: ${s.totalWorkedHours}h. Early exit by ${eh}h ${em}m`;
          } else if (s.isOvertime) {
            const oh = Math.floor(s.overtimeMinutes / 60), om = s.overtimeMinutes % 60;
            message = `Great work! Total: ${s.totalWorkedHours}h. Overtime: ${oh}h ${om}m`;
          } else {
            message = `Checked out. Total worked: ${s.totalWorkedHours}h`;
          }
          setTimeout(() => setWorkSummary(null), 20000);
        }
        setIsCheckedIn(false);
        setElapsed(0);
        setAttendanceId(null);
        setCheckInEpoch(null);
        setCheckInTimeUtc(null);
        showToast(message, 'info');
        setShowModal(false);
      }
    } catch (err: any) {
      let msg = 'Something went wrong. Please try again.';
      if (err?.response?.data?.message) msg = err.response.data.message;
      else if (err?.response?.data?.error) msg = Array.isArray(err.response.data.error) ? err.response.data.error.join(', ') : err.response.data.error;
      else if (err?.message) msg = err.message;
      if (msg.includes('API KEY') || msg.includes('SLUG')) msg = 'Invalid or missing API credentials.';
      else if (msg.includes('500')) msg = 'Server error. Please try again later.';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
      setLocationData(null);
    }
  };

  const handleCheckIn = async () => {
    setShowModal(true);
    setIsFetchingLocation(true);
    setLocationData(await fetchLocation());
    setIsFetchingLocation(false);
  };

  const handleCheckOut = async () => {
    setShowModal(true);
    setIsFetchingLocation(true);
    setLocationData(await fetchLocation());
    setIsFetchingLocation(false);
  };

  return (
    <>
      {/* ── Toast ── */}
      {toast && (
        <div className="fixed top-4 left-1/2 z-[100] -translate-x-1/2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-lg border ${
            toast.type === 'success' ? 'bg-white border-emerald-200 text-emerald-700'
            : toast.type === 'error' ? 'bg-white border-red-200 text-red-600'
            : 'bg-white border-blue-200 text-blue-700'}`}>
            {toast.type === 'error'
              ? <XCircle size={15} />
              : <CheckCircle2 size={15} />}
            <span className="max-w-xs">{toast.msg}</span>
          </div>
        </div>
      )}

      <div className="space-y-3 font-sans">
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-0.5">
              <GreetIcon size={12} />
              <span>{greeting}, {firstName}</span>
            </div>
            <h1 className="text-base font-semibold text-gray-900">Attendance</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg border border-gray-100 bg-white px-3 py-1.5 font-mono text-sm font-medium text-gray-700 tabular-nums">
              {currentTime?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-600">
              {firstName.charAt(0)}{fullName.split(' ')[1]?.charAt(0) ?? ''}
            </div>
          </div>
        </div>

        {/* ── Work summary (post checkout) ── */}
        {workSummary && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span className="text-sm font-medium text-emerald-800">Session complete</span>
              </div>
              <button onClick={() => setWorkSummary(null)} className="text-emerald-400 hover:text-emerald-600">
                <XCircle size={15} />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              <div className="rounded-lg bg-white px-3 py-2 border border-emerald-100">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider">Total worked</p>
                <p className="text-lg font-semibold text-gray-900">{workSummary.totalWorkedHours}h</p>
              </div>
              {workSummary.isEarlyExit && (
                <div className="rounded-lg bg-white px-3 py-2 border border-amber-100">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider">Early exit</p>
                  <p className="text-lg font-semibold text-amber-700">
                    {Math.floor(workSummary.earlyExitMinutes / 60)}h {workSummary.earlyExitMinutes % 60}m
                  </p>
                </div>
              )}
              {workSummary.isOvertime && (
                <div className="rounded-lg bg-white px-3 py-2 border border-blue-100">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider">Overtime</p>
                  <p className="text-lg font-semibold text-blue-700">
                    {Math.floor(workSummary.overtimeMinutes / 60)}h {workSummary.overtimeMinutes % 60}m
                  </p>
                </div>
              )}
              {!workSummary.isEarlyExit && !workSummary.isOvertime && (
                <div className="rounded-lg bg-white px-3 py-2 border border-emerald-100">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider">Status</p>
                  <p className="text-lg font-semibold text-emerald-700">On time</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Main check-in card ── */}
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          {/* Status row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className={`relative flex h-2.5 w-2.5`}>
                {isCheckedIn && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                )}
                <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isCheckedIn ? 'bg-emerald-500' : 'bg-gray-300'}`} />
              </span>
              <span className="text-sm font-medium text-gray-700">
                {isCheckedIn && checkInEpoch
                  ? `Checked in at ${fmtTime(new Date(checkInEpoch))}`
                  : 'Not checked in'}
              </span>
            </div>
            <span className="text-[11px] text-gray-400">
              {currentTime?.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
          </div>

          {/* Timer */}
          <div className="mb-4 text-center">
            <p className={`font-mono text-5xl font-semibold tabular-nums tracking-tight transition-colors ${
              isCheckedIn ? 'text-gray-900' : 'text-gray-200'}`}>
              {isCheckedIn ? timerStr : '00:00:00'}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {isCheckedIn ? `${timerH}h ${timerM}m elapsed` : 'Ready to start'}
            </p>
          </div>

          {/* Progress */}
          <div className="mb-5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-gray-400">
              <span>{Math.round(pct)}% complete</span>
              <span>8h target</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleCheckIn}
              disabled={isCheckedIn || isLoading}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                isCheckedIn
                  ? 'cursor-not-allowed bg-gray-50 text-gray-300 border border-gray-100'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-[0.98] shadow-sm shadow-emerald-200'}`}
            >
              <LogIn size={15} strokeWidth={2} />
              Check in
            </button>
            <button
              onClick={handleCheckOut}
              disabled={!isCheckedIn || isLoading}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                !isCheckedIn
                  ? 'cursor-not-allowed bg-gray-50 text-gray-300 border border-gray-100'
                  : 'bg-red-500 text-white hover:bg-red-600 active:scale-[0.98] shadow-sm shadow-red-200'}`}
            >
              <LogOut size={15} strokeWidth={2} />
              Check out
            </button>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard
            label="Today"
            value={isCheckedIn ? `${timerH}h ${timerM}m` : '0h 0m'}
            sub={isCheckedIn ? <span className="text-emerald-600 font-medium">● Active</span> : 'Not started'}
            icon={Clock}
            accent="bg-emerald-50"
          />
          <StatCard
            label="This week"
            value="18h 42m"
            sub="On track"
            icon={TrendingUp}
            accent="bg-blue-50"
          />
          <StatCard
            label="Present"
            value="11"
            sub="This month"
            icon={CalendarDays}
            accent="bg-indigo-50"
          />
        </div>

        {/* ── Recent log ── */}
        <div className="rounded-xl border border-gray-100 bg-white px-5 py-4">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-gray-400">Recent attendance</p>
          <div className="divide-y divide-gray-50">
            {[
              { date: 'Fri, 12 Jun', time: '9:04 AM – 6:11 PM', hours: '9h 07m', status: 'overtime' as const },
              { date: 'Thu, 11 Jun', time: '9:22 AM – 6:00 PM', hours: '8h 38m', status: 'on-time' as const },
              { date: 'Wed, 10 Jun', time: '9:45 AM – 5:10 PM', hours: '7h 25m', status: 'early-exit' as const },
              { date: 'Tue, 9 Jun',  time: '9:01 AM – 6:02 PM', hours: '9h 01m', status: 'on-time' as const },
            ].map((row) => (
              <div key={row.date} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium text-gray-700">{row.date}</p>
                  <p className="text-xs text-gray-400">{row.time}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold tabular-nums text-gray-800">{row.hours}</span>
                  <StatusBadge type={row.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex flex-wrap items-center gap-3 px-1 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            <span className="truncate max-w-[180px]">{defaultLocation}</span>
          </span>
          <span className="flex items-center gap-1 text-emerald-500">
            <Wifi size={12} />
            Connected
          </span>
          {isCheckedIn && (
            <span className="flex items-center gap-1 text-emerald-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Active session
            </span>
          )}
          <span className="ml-auto flex items-center gap-1 text-amber-500">
            <AlertCircle size={12} />
            1 pending
          </span>
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => !isLoading && setShowModal(false)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent line */}
            <div className={`h-1 w-full ${isCheckedIn ? 'bg-red-500' : 'bg-emerald-500'}`} />

            <div className="p-6">
              {/* Icon + title */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  isCheckedIn ? 'bg-red-50' : 'bg-emerald-50'}`}>
                  {isCheckedIn
                    ? <LogOut size={20} className="text-red-500" />
                    : <LogIn size={20} className="text-emerald-500" />}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {isCheckedIn ? 'Check out' : 'Check in'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {isCheckedIn
                      ? `${timerH}h ${timerM}m worked since ${checkInEpoch ? fmtTime(new Date(checkInEpoch)) : ''}`
                      : `Starting at ${currentTime ? fmtTime(currentTime) : ''}`}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="mb-5 rounded-xl border border-gray-100 bg-gray-50 p-3">
                <div className="flex items-start gap-2.5">
                  <MapPin size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />
                  <div className="min-w-0 flex-1">
                    <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wider text-gray-400">Location</p>
                    {isFetchingLocation ? (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Loader2 size={12} className="animate-spin" />
                        Detecting…
                      </div>
                    ) : locationData ? (
                      <>
                        <p className="text-sm text-gray-800 font-medium line-clamp-2">{locationData.address}</p>
                        <p className="mt-0.5 font-mono text-[11px] text-gray-400">
                          {locationData.lat.toFixed(5)}, {locationData.lng.toFixed(5)}
                        </p>
                        {locationData.accuracy !== undefined && (
                          <p className={`mt-1 text-[11px] font-medium ${
                            locationData.accuracy <= 50 ? 'text-emerald-600'
                            : locationData.accuracy <= 200 ? 'text-amber-600'
                            : 'text-red-500'}`}>
                            {locationData.accuracy <= 50
                              ? `± ${locationData.accuracy}m — high accuracy`
                              : locationData.accuracy <= 200
                              ? `± ${locationData.accuracy}m — moderate accuracy`
                              : `± ${locationData.accuracy}m — low accuracy (GPS not locked)`}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-gray-400">Location unavailable — continuing without GPS</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2.5">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isLoading}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-white disabled:opacity-60 transition-all active:scale-[0.98] ${
                    isCheckedIn
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-emerald-500 hover:bg-emerald-600'}`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      {isCheckedIn ? 'Checking out…' : 'Checking in…'}
                    </>
                  ) : (
                    isCheckedIn ? 'Confirm check out' : 'Confirm check in'
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
