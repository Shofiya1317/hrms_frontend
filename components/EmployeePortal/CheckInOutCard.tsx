'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  LogIn, LogOut, Loader2,
  MapPin, AlertTriangle, Clock, Trophy,
} from 'lucide-react';
import { toast as toastify } from 'react-hot-toast';
import {
  checkIn, checkOut, getCheckInContext,
  ICheckInContext, ICheckOutContext,
} from '@/lib/service/attendance';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LocationData { lat: number; lng: number; address: string; accuracy?: number; }
interface CheckInOutCardProps {
  apiKey: string; slug?: string; token: string;
  defaultLocation?: string; onAttendanceUpdate?: () => void;
  // kept for backward compat, unused
  fullName?: string; employeeId?: string; designation?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pad(n: number) { return String(n).padStart(2, '0'); }
function fmtTime(d: Date) { return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); }
function toDateString(d: Date) { return d.toISOString().split('T')[0]; }

/** Parse "HH:MM" into today's Date */
function parseTime24(t: string): Date {
  const [h, m] = t.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function getDeviceInfo() {
  const ua = navigator.userAgent;
  const b = ua.includes('Firefox') ? 'Firefox' : ua.includes('Edg') ? 'Edge' : ua.includes('Chrome') ? 'Chrome' : 'Safari';
  const o = ua.includes('Windows') ? 'Windows' : ua.includes('Mac') ? 'macOS' : ua.includes('Android') ? 'Android' : ua.includes('iPhone') ? 'iOS' : 'Linux';
  return `${o}, ${b}`;
}

async function reverseGeocode(lat: number, lng: number) {
  try {
    const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
    const d = await r.json();
    return [d?.locality || d?.city, d?.principalSubdivision, d?.countryName].filter(Boolean).join(', ') || `${lat.toFixed(4)},${lng.toFixed(4)}`;
  } catch { return `${lat.toFixed(4)},${lng.toFixed(4)}`; }
}

/** Extract user-facing error message from API response */
function extractApiError(res: any, fallback: string): string | null {
  if (res?.data?.success === false) {
    const err = res.data.error;
    if (Array.isArray(err) && err.length > 0) return err[0];
    if (typeof err === 'string') return err;
    return fallback;
  }
  return null;
}

async function fetchLocation(): Promise<LocationData | null> {
  if (!navigator?.geolocation) return null;
  const gp = (o: PositionOptions) => new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, o));
  try {
    const p = await gp({ enableHighAccuracy: true, maximumAge: 0, timeout: 12000 })
      .catch(() => gp({ enableHighAccuracy: false, maximumAge: 0, timeout: 8000 }));
    const { latitude: lat, longitude: lng, accuracy } = p.coords;
    return { lat, lng, address: await reverseGeocode(lat, lng), accuracy: Math.round(accuracy) };
  } catch { return null; }
}

/** Compute badge + status dynamically based on current time vs shift end */
function computeBadge(shiftEnd24hr: string, graceMins = 5): {
  status: 'early_checkout' | 'shift_complete' | 'overtime';
  label: string;
  color: string;
  bg: string;
  border: string;
} {
  const now = new Date();
  const shiftEnd = parseTime24(shiftEnd24hr);
  const graceMs = graceMins * 60 * 1000;
  const diff = now.getTime() - shiftEnd.getTime();

  if (diff >= 15 * 60 * 1000) {
    return { status: 'overtime', label: '🟣 Overtime', color: '#7c3aed', bg: '#f5f3ff', border: '#e9d5ff' };
  }
  if (diff >= -graceMs) {
    return { status: 'shift_complete', label: '🟢 Shift Completed', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
  }
  return { status: 'early_checkout', label: '🟠 Early Checkout', color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
}

/** Format seconds → "Xh Ym" */
function fmtHM(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return h > 0 ? `${h}h ${pad(m)}m` : `${m}m`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CheckInOutCard({
  apiKey, slug, token, defaultLocation = 'Unknown', onAttendanceUpdate,
}: CheckInOutCardProps) {
  const tenantId = apiKey || slug || '';

  // API state
  const [context, setContext] = useState<ICheckInContext | null>(null);
  const [completedCtx, setCompletedCtx] = useState<ICheckOutContext | null>(null);
  const [loadingCtx, setLoadingCtx] = useState(true);

  // Local timer state (seconds since check-in)
  const [elapsed, setElapsed] = useState(0);
  const [now, setNow] = useState(new Date());

  // UI
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEarlyWarning, setShowEarlyWarning] = useState(false);
  const [pendingLoc, setPendingLoc] = useState<LocationData | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isFetchingLoc, setIsFetchingLoc] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null); // kept for backward compat

  const isCheckedIn = context?.state === 'checked_in';
  const isCompleted = context?.state === 'completed';
  const showCompletion = completedCtx !== null || isCompleted;

  // ── Tick every second ──
  useEffect(() => {
    const t = setInterval(() => {
      const n = new Date();
      setNow(n);
      if (isCheckedIn && context?.check_in_time_24hr) {
        const checkInAt = parseTime24(context.check_in_time_24hr);
        setElapsed(Math.floor((n.getTime() - checkInAt.getTime()) / 1000));
      }
    }, 1000);
    return () => clearInterval(t);
  }, [isCheckedIn, context?.check_in_time_24hr]);

  // ── Load context once on mount ──
  const loadContext = useCallback(async () => {
    if (!token) return;
    setLoadingCtx(true);
    try {
      const res = await getCheckInContext(tenantId, token);
      const ctx: ICheckInContext = res?.data?.data ?? {};
      setContext(ctx);
      if (ctx.state === 'checked_in' && ctx.check_in_time_24hr) {
        const checkInAt = parseTime24(ctx.check_in_time_24hr);
        setElapsed(Math.floor((Date.now() - checkInAt.getTime()) / 1000));
      }
    } catch { /* show default not-checked-in state */ }
    finally { setLoadingCtx(false); }
  }, [tenantId, token]);

  useEffect(() => { loadContext(); }, [loadContext]);

  // ── Re-fetch context on tab switch / window focus ──
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') loadContext(); };
    const onFocus = () => loadContext();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onFocus);
    };
  }, [loadContext]);

  // ── Toast ──
  const showToast = (msg: string, type: 'success' | 'error' | 'info') => {
    if (type === 'error') toastify.error(msg, { position: 'bottom-right' });
    else if (type === 'success') toastify.success(msg, { position: 'bottom-right' });
    else toastify(msg, { position: 'bottom-right' });
  };

  // UI — modal pre-fetch state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Button click: refresh context first, then open modal ──
  const openModal = async () => {
    setIsRefreshing(true);
    // Re-fetch context so modal shows latest state before confirming
    try {
      const res = await getCheckInContext(tenantId, token);
      const ctx: ICheckInContext = res?.data?.data ?? {};
      setContext(ctx);
      if (ctx.state === 'checked_in' && ctx.check_in_time_24hr) {
        const checkInAt = parseTime24(ctx.check_in_time_24hr);
        setElapsed(Math.floor((Date.now() - checkInAt.getTime()) / 1000));
      }
    } catch { /* use existing context */ }
    finally { setIsRefreshing(false); }

    setShowConfirmModal(true);
    setIsFetchingLoc(true);
    setLocationData(await fetchLocation());
    setIsFetchingLoc(false);
  };

  // ── Perform actual check-out API call ──
  const performCheckOut = async (loc: LocationData | null) => {
    if (!context?.attendance_id) { showToast('No active attendance record.', 'error'); return; }
    setIsLoading(true);
    const workedSecsAtCheckout = elapsed; // snapshot local timer before reset
    try {
      const n = new Date();
      const res = await checkOut(context.attendance_id, {
        check_out_time: n.toISOString(),
        check_out_lat: loc?.lat ?? 0,
        check_out_lng: loc?.lng ?? 0,
        check_out_location_name: loc?.address ?? defaultLocation,
        check_out_method: 'gps',
      }, tenantId, token);

      const coApiErr = extractApiError(res, 'Check-out failed.');
      if (coApiErr) { showToast(coApiErr, 'error'); return; }

      const outCtx: ICheckOutContext = res?.data?.data?.check_out_context ?? {};
      setCompletedCtx({ ...outCtx, _workedSecs: workedSecsAtCheckout });
      setContext((prev) => prev ? { ...prev, state: 'checked_out' } : prev);
      setElapsed(0);
      if (onAttendanceUpdate) onAttendanceUpdate();
    } catch {
      showToast('Check-out failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
      setShowConfirmModal(false);
      setShowEarlyWarning(false);
      setPendingLoc(null);
      setLocationData(null);
    }
  };

  // ── Confirm button in main modal ──
  const handleConfirm = async () => {
    if (!token) { showToast('Auth token missing.', 'error'); setShowConfirmModal(false); return; }

    if (!isCheckedIn) {
      // ── CHECK IN ──
      setIsLoading(true);
      try {
        const n = new Date();
        const res = await checkIn({
          attendance_date: toDateString(n),
          check_in_time: n.toISOString(),
          check_in_lat: locationData?.lat ?? 0,
          check_in_lng: locationData?.lng ?? 0,
          check_in_location_name: locationData?.address ?? defaultLocation,
          check_in_method: 'gps',
          check_in_device_info: getDeviceInfo(),
        }, tenantId, token);

        const apiErr = extractApiError(res, 'Check-in failed.');
        if (apiErr) { showToast(apiErr, 'error'); setIsLoading(false); setShowConfirmModal(false); setLocationData(null); return; }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
        const d = res?.data?.data;
        const ciCtx = d?.check_in_context ?? {};
        const status = d?.status ?? {};
        const shiftInfo = ciCtx?.shift_info ?? d?.shift_info ?? {};

        // Build a unified ICheckInContext from the check-in response
        setContext({
          state: 'checked_in',
          attendance_id: d?.id,
          greeting: context?.greeting,                       // keep greeting from loaded context
          check_in_time: ciCtx.checked_in_at,               // "12:53 PM"
          check_in_time_24hr: ciCtx.checked_in_at_24hr,     // "12:53"
          check_out_context: {
            shift_end: shiftInfo.shift_end,                  // "07:00 PM"
            shift_end_24hr: shiftInfo.shift_end_24hr,        // "19:00"
          },
          // status fields for comp-off banner
          day_type: status.day_type,
          is_comp_off_eligible: status.is_comp_off_eligible,
          comp_off_credited: status.comp_off_credited,
          status_message: status.message,
        });
        setElapsed(0);
        setCompletedCtx(null);
        // Use top-level message from API (e.g. comp-off holiday message)
        showToast(res?.data?.message ?? `Checked in at ${ciCtx.checked_in_at ?? fmtTime(n)}`, 'success');
        if (onAttendanceUpdate) onAttendanceUpdate();
      } catch {
        showToast('Check-in failed. Please try again.', 'error');
      } finally {
        setIsLoading(false);
        setShowConfirmModal(false);
        setLocationData(null);
      }
    } else {
      // ── CHECK OUT — use check_out_context.shift_end_24hr for early detection ──
      const coCtx = context?.check_out_context;
      const shiftEnd24 = coCtx?.shift_end_24hr;
      const isEarly = shiftEnd24
        ? new Date() < parseTime24(shiftEnd24)
        : false;

      if (isEarly) {
        // Show warning with the API-provided warning_message
        setPendingLoc(locationData);
        setShowConfirmModal(false);
        setShowEarlyWarning(true);
      } else {
        await performCheckOut(locationData);
      }
    }
  };

  // ── Derived values for working screen ──
  const timerStr = `${pad(Math.floor(elapsed / 3600))}:${pad(Math.floor((elapsed % 3600) / 60))}:${pad(elapsed % 60)}`;
  const workedStr = fmtHM(elapsed);

  const shiftEnd24 = context?.check_out_context?.shift_end_24hr;
  const shiftEndDisplay = context?.check_out_context?.shift_end; // "07:00 PM"

  // Remaining time (live)
  const remainingSecs = shiftEnd24
    ? Math.max(0, Math.floor((parseTime24(shiftEnd24).getTime() - now.getTime()) / 1000))
    : null;
  const remainingStr = remainingSecs !== null ? fmtHM(remainingSecs) : null;

  // Dynamic badge (recomputed every tick)
  const dynamicBadge = isCheckedIn && shiftEnd24 ? computeBadge(shiftEnd24) : null;

  // Progress bar: elapsed vs full shift duration
  const shiftDurSecs = shiftEnd24 && context?.check_in_time_24hr
    ? Math.floor((parseTime24(shiftEnd24).getTime() - parseTime24(context.check_in_time_24hr).getTime()) / 1000)
    : 8 * 3600;
  const pct = Math.min((elapsed / shiftDurSecs) * 100, 100);

  // ── Completion screen ──
  if (showCompletion) {
    // Data comes from either post-checkout completedCtx or loaded context (state=completed)
    const coCtx = completedCtx ?? context?.check_out_context;
    const workedSecs = completedCtx?._workedSecs
      ?? (context?.worked_minutes ? context.worked_minutes * 60 : 0);
    const workedDisplay = completedCtx
      ? fmtHM(workedSecs)
      : (context?.worked_time ?? fmtHM(workedSecs));
    const otMins = coCtx?.overtime_minutes ?? 0;
    const status = coCtx?.check_out_status ?? 'normal';
    const badge = coCtx?.badge;
    const title = coCtx?.title ?? 'Attendance Completed';
    const checkInDisplay = context?.check_in_time;
    const checkOutDisplay = context?.check_out_time;
    const attendanceStatus = context?.attendance_status;
    const greetingMsg = context?.greeting;
    const messageStr = context?.message;

    const statusStyle: Record<string, { ring: string; iconBg: string; iconColor: string; badgeBg: string }> = {
      early_checkout: { ring: 'rgba(245,158,11,0.12)', iconBg: 'bg-amber-50', iconColor: 'text-amber-500', badgeBg: 'bg-amber-50 text-amber-700 border-amber-100' },
      overtime:       { ring: 'rgba(124,58,237,0.12)', iconBg: 'bg-violet-50', iconColor: 'text-violet-500', badgeBg: 'bg-violet-50 text-violet-700 border-violet-100' },
      normal:         { ring: 'rgba(16,185,129,0.08)', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500', badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    };
    const style = statusStyle[status] ?? statusStyle.normal;

    const attendanceStatusStyle: Record<string, { color: string; bg: string; border: string }> = {
      present:  { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
      absent:   { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
      late:     { color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
      half_day: { color: '#7c3aed', bg: '#f5f3ff', border: '#e9d5ff' },
    };
    const aStyle = attendanceStatus ? (attendanceStatusStyle[attendanceStatus] ?? attendanceStatusStyle.present) : null;

    return (
      <div className="flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className={`h-1 w-full ${
          status === 'early_checkout' ? 'bg-amber-400'
            : status === 'overtime' ? 'bg-violet-500'
              : 'bg-emerald-500'
        }`}
        />
        <div className="px-4 pt-3 pb-3 flex flex-col gap-4">

          {/* Greeting */}
          {greetingMsg && (
            <p className="text-[11px] font-semibold text-slate-400 tracking-wide uppercase">
              {greetingMsg}
            </p>
          )}

          {/* Trophy + title */}
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl ${style.iconBg} flex items-center justify-center flex-shrink-0`}
              style={{ boxShadow: `0 0 0 6px ${style.ring}` }}
            >
              <Trophy size={22} className={style.iconColor} />
            </div>
            <div>
              <p className="text-base font-black text-slate-900">{title}</p>
              {messageStr && <p className="text-xs text-slate-500 mt-0.5">{messageStr}</p>}
            </div>
          </div>

          {/* In / Out times row */}
          {(checkInDisplay || checkOutDisplay) && (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-100 rounded-xl p-3 border border-slate-100">
                <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Check In</p>
                <p className="text-sm font-bold text-slate-800">{checkInDisplay ?? '—'}</p>
              </div>
              <div className="bg-slate-100 rounded-xl p-3 border border-slate-100">
                <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Check Out</p>
                <p className="text-sm font-bold text-slate-800">{checkOutDisplay ?? '—'}</p>
              </div>
            </div>
          )}

          {/* Worked time + overtime + attendance status */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5">
              <Clock size={12} className="text-slate-500" />
              <span className="text-xs font-bold text-slate-700">{workedDisplay} worked</span>
            </div>
            {otMins > 0 && (
              <span className="text-xs font-semibold text-violet-600 bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-xl">
                +{fmtHM(otMins * 60)} overtime
              </span>
            )}
            {aStyle && attendanceStatus && (
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-xl border capitalize"
                style={{ color: aStyle.color, background: aStyle.bg, borderColor: aStyle.border }}
              >
                {attendanceStatus.replace('_', ' ')}
              </span>
            )}
          </div>

          {/* Checkout badge */}
          {badge && (
            <span className={`self-start text-xs font-bold px-3 py-1 rounded-full border ${style.badgeBg}`}>
              {badge}
            </span>
          )}

          {/* Contact HR hint if absent */}
          {attendanceStatus === 'absent' && (
            <p className="text-[11px] text-slate-400 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
              Marked absent due to insufficient hours. Contact HR for regularization.
            </p>
          )}
        </div>
      </div>
    );
  }

return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

      <div className="px-4 pt-2 pb-4">
        {loadingCtx ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={22} className="animate-spin text-slate-300" />
          </div>
        ) : (
          <>
            {/* ── Top row: greeting + live timer ── */}
            <div className="flex items-start justify-between mb-3">
              <div>
                {context?.greeting && (
                  <p className="text-[12px] font-semibold text-slate-400 tracking-wide uppercase">
                    {context.greeting}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="relative flex h-2 w-2">
                    {isCheckedIn && <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" />}
                    <span className={`relative h-2 w-2 rounded-full ${isCheckedIn ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {isCheckedIn
                      ? `Checked In: ${context?.check_in_time ?? ''}`
                      : 'Not checked in'}
                  </span>
                </div>
              </div>
              <p className={`font-mono text-2xl font-black tabular-nums tracking-tight ${isCheckedIn ? 'text-slate-900' : 'text-slate-200'}`}>
                {timerStr}
              </p>
            </div>

            {/* ── Not checked in: check_in_context info ── */}
            {!isCheckedIn && context?.check_in_context && (() => {
              const ci = context.check_in_context;
              const badgeColorMap: Record<string, { color: string; bg: string; border: string }> = {
                red:    { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
                orange: { color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
                green:  { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
                blue:   { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
              };
              const bs = badgeColorMap[ci.badge_color ?? 'blue'] ?? badgeColorMap.blue;
              return (
                <div className="mb-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-3 border border-slate-100">
                    <div>
                      <p className="text-xs font-bold text-slate-700">{ci.title}</p>
                      {ci.subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{ci.subtitle}</p>}
                    </div>
                    {ci.badge && (
                      <span
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ml-2"
                        style={{ color: bs.color, background: bs.bg, borderColor: bs.border }}
                      >
                        {ci.badge}
                      </span>
                    )}
                  </div>
                  {(ci.shift_start || ci.shift_end) && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 rounded-xl px-3 py-3 border border-slate-100">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase">Shift Start</p>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">{ci.shift_start}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase">Shift End</p>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">{ci.shift_end}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ── Working info row (checked-in only) ── */}
            {isCheckedIn && (
              <div className="flex flex-col gap-2 mt-2 mb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-slate-500">
                    Working Time: <span className="font-bold text-slate-800">{workedStr}</span>
                  </span>
                  {shiftEndDisplay && remainingSecs !== null && remainingSecs > 0 && (
                    <span className="text-xs text-slate-500">
                      Shift ends at <span className="font-bold text-slate-700">{shiftEndDisplay}</span>
                      <span className="text-slate-400"> · {remainingStr} remaining</span>
                    </span>
                  )}
                  {dynamicBadge && (
                    <span
                      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border"
                      style={{ color: dynamicBadge.color, background: dynamicBadge.bg, borderColor: dynamicBadge.border }}
                    >
                      {dynamicBadge.label}
                    </span>
                  )}
                </div>
                {(() => {
                  const ciCtx = context?.check_in_context;
                  if (!ciCtx?.badge && !ciCtx?.subtitle) return null;
                  const badgeColorMap: Record<string, { color: string; bg: string; border: string }> = {
                    red:    { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
                    orange: { color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
                    green:  { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
                    blue:   { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
                  };
                  const bs = badgeColorMap[ciCtx.badge_color ?? 'blue'] ?? badgeColorMap.blue;
                  return (
                    <div className="flex items-center gap-2 flex-wrap">
                      {ciCtx.badge && (
                        <span
                          className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border"
                          style={{ color: bs.color, background: bs.bg, borderColor: bs.border }}
                        >
                          {ciCtx.badge}
                        </span>
                      )}
                      {ciCtx.subtitle && (
                        <span className="text-[11px] text-slate-500">{ciCtx.subtitle}</span>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ── Company holiday / comp-off banner ── */}
            {isCheckedIn && context?.day_type === 'company_holiday' && (
              <div className="flex items-start gap-2 bg-violet-50 border border-violet-100 rounded-xl px-3 py-2.5 mb-3">
                <span className="text-sm">🏖️</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-violet-700">Company Holiday</p>
                  {context.comp_off_credited && context.comp_off_credited > 0 ? (
                    <p className="text-[11px] text-violet-500 mt-0.5">
                      {context.status_message ?? `${context.comp_off_credited} comp-off will be credited after completing minimum work hours.`}
                    </p>
                  ) : context.status_message ? (
                    <p className="text-[11px] text-violet-500 mt-0.5">{context.status_message}</p>
                  ) : null}
                </div>
              </div>
            )}

            {/* ── Shift progress bar ── */}
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${pct}%`,
                  background: dynamicBadge?.status === 'overtime'
                    ? 'linear-gradient(90deg,#a78bfa,#8b5cf6)'
                    : dynamicBadge?.status === 'shift_complete'
                      ? 'linear-gradient(90deg,#34d399,#10b981)'
                      : isCheckedIn
                        ? 'linear-gradient(90deg,#0f766e,#14b8a6)'
                        : '#e2e8f0',
                  boxShadow: isCheckedIn ? '0 0 6px rgba(15,118,110,0.4)' : 'none',
                }}
              />
            </div>

            {/* ── Check In / Check Out button ── */}
            <button
              onClick={openModal}
              disabled={isLoading || isRefreshing}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.97] disabled:opacity-60 ${
                isCheckedIn
                  ? 'bg-rose-500 text-white shadow-[0_4px_14px_rgba(239,68,68,0.4)] hover:bg-rose-600'
                  : 'bg-[#0f766e] text-white shadow-[0_4px_14px_rgba(15,118,110,0.4)] hover:bg-[#0d6b64]'
              }`}
            >
              {isRefreshing
                ? <><Loader2 size={15} className="animate-spin" /> Checking status…</>
                : isCheckedIn
                  ? <><LogOut size={15} /> Check Out</>
                  : <><LogIn size={15} /> Check In</>}
            </button>
          </>
        )}
      </div>

      {/* ── Confirm Modal (Check In / Check Out) ── */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => !isLoading && setShowConfirmModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-t-3xl bg-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`h-1 w-full ${isCheckedIn ? 'bg-rose-500' : 'bg-[#0f766e]'}`} />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isCheckedIn ? 'bg-rose-50' : 'bg-teal-50'}`}>
                  {isCheckedIn ? <LogOut size={18} className="text-rose-500" /> : <LogIn size={18} className="text-[#0f766e]" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{isCheckedIn ? 'Check out' : 'Check in'}</p>
                  <p className="text-xs text-slate-400">
                    {isCheckedIn ? `${workedStr} worked` : fmtTime(now)}
                  </p>
                  {(() => {
                    const ci = context?.check_in_context;
                    if (!ci?.badge) return null;
                    const bm: Record<string, string> = {
                      red: 'text-red-600 bg-red-50 border-red-100',
                      orange: 'text-amber-600 bg-amber-50 border-amber-100',
                      green: 'text-emerald-600 bg-emerald-50 border-emerald-100',
                      blue: 'text-blue-600 bg-blue-50 border-blue-100',
                    };
                    return (
                      <span className={`mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${bm[ci.badge_color ?? 'blue'] ?? bm.blue}`}>
                        {ci.badge}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-2.5 bg-slate-50 rounded-2xl p-3.5 mb-5">
                <MapPin size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  {isFetchingLoc
                    ? <div className="flex items-center gap-1.5 text-xs text-slate-400"><Loader2 size={11} className="animate-spin" />Detecting location…</div>
                    : locationData
                      ? (
                        <>
                          <p className="text-xs font-semibold text-slate-800 leading-snug">{locationData.address}</p>
                          {locationData.accuracy && (
                            <p className={`text-[10px] mt-0.5 font-medium ${locationData.accuracy <= 50 ? 'text-emerald-600' : locationData.accuracy <= 200 ? 'text-amber-600' : 'text-red-500'}`}>
                              ±{locationData.accuracy}m accuracy
                            </p>
                          )}
                        </>
                      )
                      : <p className="text-xs text-slate-400">Location unavailable</p>}
                </div>
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isLoading}
                  className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading || isFetchingLoc}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-60 ${
                    isCheckedIn
                      ? 'bg-rose-500 shadow-[0_4px_14px_rgba(239,68,68,0.4)]'
                      : 'bg-[#0f766e] shadow-[0_4px_14px_rgba(15,118,110,0.4)]'
                  }`}
                >
                  {isLoading ? <Loader2 size={14} className="animate-spin" /> : isCheckedIn ? 'Confirm Check Out' : 'Confirm Check In'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Early Checkout Warning Modal ── */}
      {showEarlyWarning && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => !isLoading && setShowEarlyWarning(false)}
        >
          <div
            className="w-full max-w-sm rounded-t-3xl bg-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 w-full bg-amber-400" />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                  <AlertTriangle size={18} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Early Check-out</p>
                  <p className="text-xs text-slate-400">You're leaving before shift end</p>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3.5 mb-5">
                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                  {context?.check_out_context?.warning_message
                    ?? `Shift ends at ${shiftEndDisplay}. Checking out now will be marked as early checkout.`}
                </p>
              </div>
              <div className="flex gap-2.5">
                <button
                  onClick={() => { setShowEarlyWarning(false); setPendingLoc(null); }}
                  disabled={isLoading}
                  className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
                >
                  Stay
                </button>
                <button
                  onClick={() => performCheckOut(pendingLoc)}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white bg-amber-500 shadow-[0_4px_14px_rgba(245,158,11,0.4)] transition-all active:scale-95 disabled:opacity-60"
                >
                  {isLoading ? <Loader2 size={14} className="animate-spin" /> : 'Check Out Anyway'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
