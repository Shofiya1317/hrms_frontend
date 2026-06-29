'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  LogIn, LogOut, Loader2, MapPin, AlertTriangle, Clock,
  Trophy, Coffee, Umbrella, Calendar, RefreshCw, CheckCircle2,
  Timer, Zap, Moon, Sun, Sunset,
} from 'lucide-react';
import { toast as toastify } from 'react-hot-toast';
import {
  checkIn, checkOut, getCheckInContext,
  ICheckInContext, IWeeklyCardEntry,
} from '@/lib/service/attendance';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LocationData {
  lat: number;
  lng: number;
  address: string;
  accuracy?: number;
}

interface CheckInOutCardProps {
  apiKey: string;
  slug?: string;
  token: string;
  defaultLocation?: string;
  onAttendanceUpdate?: () => void;
  reportingManager?: { id: string; name: string; role: string; status: string } | null;
  fullName?: string;
  employeeId?: string;
  designation?: string;
}

// ─── DashboardStatus enum (mirrors backend) ───────────────────────────────────
type DashboardStatus =
  | 'UPCOMING_SHIFT'
  | 'READY_TO_CHECK_IN'
  | 'WORKING'
  | 'CHECK_OUT_PENDING'
  | 'PRESENT'
  | 'EARLY_EXIT'
  | 'OVERTIME'
  | 'AUTO_CHECKOUT'
  | 'ABSENT'
  | 'ON_LEAVE'
  | 'HOLIDAY'
  | 'WEEK_OFF'
  | 'REGULARIZATION_PENDING'
  | 'REGULARIZATION_APPROVED';

// ─── Status config map ────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  DashboardStatus,
  {
    accent: string;
    bg: string;
    border: string;
    textColor: string;
    icon: React.ElementType;
    canCheckIn: boolean;
    canCheckOut: boolean;
  }
> = {
  UPCOMING_SHIFT:           { accent: '#64748b', bg: '#f8fafc', border: '#e2e8f0', textColor: '#475569', icon: Clock,        canCheckIn: false, canCheckOut: false },
  READY_TO_CHECK_IN:        { accent: '#0f766e', bg: '#f0fdfa', border: '#99f6e4', textColor: '#0f766e', icon: LogIn,        canCheckIn: true,  canCheckOut: false },
  WORKING:                  { accent: '#0f766e', bg: '#f0fdfa', border: '#99f6e4', textColor: '#0f766e', icon: Timer,        canCheckIn: false, canCheckOut: true  },
  CHECK_OUT_PENDING:        { accent: '#d97706', bg: '#fffbeb', border: '#fde68a', textColor: '#b45309', icon: AlertTriangle, canCheckIn: false, canCheckOut: true  },
  PRESENT:                  { accent: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', textColor: '#15803d', icon: CheckCircle2, canCheckIn: false, canCheckOut: false },
  EARLY_EXIT:               { accent: '#d97706', bg: '#fffbeb', border: '#fde68a', textColor: '#b45309', icon: LogOut,       canCheckIn: false, canCheckOut: false },
  OVERTIME:                 { accent: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff', textColor: '#6d28d9', icon: Zap,          canCheckIn: false, canCheckOut: false },
  AUTO_CHECKOUT:            { accent: '#64748b', bg: '#f8fafc', border: '#e2e8f0', textColor: '#475569', icon: RefreshCw,    canCheckIn: false, canCheckOut: false },
  ABSENT:                   { accent: '#dc2626', bg: '#fef2f2', border: '#fecaca', textColor: '#b91c1c', icon: AlertTriangle, canCheckIn: false, canCheckOut: false },
  ON_LEAVE:                 { accent: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', textColor: '#1d4ed8', icon: Umbrella,     canCheckIn: false, canCheckOut: false },
  HOLIDAY:                  { accent: '#9333ea', bg: '#faf5ff', border: '#e9d5ff', textColor: '#7e22ce', icon: Calendar,     canCheckIn: false, canCheckOut: false },
  WEEK_OFF:                 { accent: '#0891b2', bg: '#ecfeff', border: '#a5f3fc', textColor: '#0e7490', icon: Coffee,       canCheckIn: false, canCheckOut: false },
  REGULARIZATION_PENDING:   { accent: '#d97706', bg: '#fffbeb', border: '#fde68a', textColor: '#b45309', icon: RefreshCw,    canCheckIn: false, canCheckOut: false },
  REGULARIZATION_APPROVED:  { accent: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', textColor: '#15803d', icon: CheckCircle2, canCheckIn: false, canCheckOut: false },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pad(n: number) { return String(n).padStart(2, '0'); }
function fmtTime(d: Date) { return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); }
function toDateString(d: Date) { return d.toISOString().split('T')[0]; }
function fmtHM(secs: number) {
  const h = Math.floor(Math.abs(secs) / 3600);
  const m = Math.floor((Math.abs(secs) % 3600) / 60);
  return h > 0 ? `${h}h ${pad(m)}m` : `${m}m`;
}

function parseTime24(t: string): Date {
  const [h, m] = t.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}


async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
    const d = await r.json();
    return [d?.locality || d?.city, d?.principalSubdivision, d?.countryName].filter(Boolean).join(', ') || `${lat.toFixed(4)},${lng.toFixed(4)}`;
  } catch { return `${lat.toFixed(4)},${lng.toFixed(4)}`; }
}

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
  const gp = (o: PositionOptions) =>
    new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, o));
  try {
    const p = await gp({ enableHighAccuracy: true, maximumAge: 0, timeout: 12000 })
      .catch(() => gp({ enableHighAccuracy: false, maximumAge: 0, timeout: 8000 }));
    const { latitude: lat, longitude: lng, accuracy } = p.coords;
    return { lat, lng, address: await reverseGeocode(lat, lng), accuracy: Math.round(accuracy) };
  } catch { return null; }
}

// Weekly status → display config
const weekDayStatusStyle: Record<string, { dot: string; text: string; bg: string }> = {
  present:      { dot: '#16a34a', text: '#16a34a', bg: '#f0fdf4' },
  working:      { dot: '#0f766e', text: '#0f766e', bg: '#f0fdfa' },
  late:         { dot: '#d97706', text: '#d97706', bg: '#fffbeb' },
  half_day:     { dot: '#7c3aed', text: '#7c3aed', bg: '#faf5ff' },
  absent:       { dot: '#dc2626', text: '#dc2626', bg: '#fef2f2' },
  on_leave:     { dot: '#2563eb', text: '#2563eb', bg: '#eff6ff' },
  holiday:      { dot: '#9333ea', text: '#9333ea', bg: '#faf5ff' },
  week_off:     { dot: '#0891b2', text: '#0891b2', bg: '#ecfeff' },
  early_exit:   { dot: '#d97706', text: '#d97706', bg: '#fffbeb' },
  overtime:     { dot: '#7c3aed', text: '#7c3aed', bg: '#faf5ff' },
  auto_checkout:{ dot: '#64748b', text: '#64748b', bg: '#f8fafc' },
  upcoming:     { dot: '#cbd5e1', text: '#94a3b8', bg: '#f8fafc' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function LiveTimer({ elapsed }: { elapsed: number }) {
  return (
    <span className="font-mono text-2xl font-black tabular-nums tracking-tight text-slate-900">
      {pad(Math.floor(elapsed / 3600))}:{pad(Math.floor((elapsed % 3600) / 60))}:{pad(elapsed % 60)}
    </span>
  );
}

function ShiftProgressBar({
  pct,
  status,
}: {
  pct: number;
  status: DashboardStatus;
}) {
  const gradient =
    status === 'OVERTIME' ? 'linear-gradient(90deg,#a78bfa,#8b5cf6)' :
    status === 'CHECK_OUT_PENDING' ? 'linear-gradient(90deg,#fbbf24,#f59e0b)' :
    status === 'WORKING' ? 'linear-gradient(90deg,#0f766e,#14b8a6)' :
    '#e2e8f0';

  const glow =
    status === 'OVERTIME' ? '0 0 8px rgba(139,92,246,0.5)' :
    status === 'CHECK_OUT_PENDING' ? '0 0 8px rgba(245,158,11,0.4)' :
    status === 'WORKING' ? '0 0 6px rgba(15,118,110,0.4)' : 'none';

  return (
    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000"
        style={{ width: `${pct}%`, background: gradient, boxShadow: glow }}
      />
    </div>
  );
}

function WeekStrip({ entries }: { entries: IWeeklyCardEntry[] }) {
  return (
    <div className="flex gap-1 mt-3">
      {entries.map((day) => {
        const style = weekDayStatusStyle[day.status] ?? weekDayStatusStyle.upcoming;
        const isToday = day.is_today;
        return (
          <div
            key={day.date}
            className="flex-1 flex flex-col items-center gap-1"
            title={day.badge}
          >
            <span className={`text-[9px] font-semibold uppercase ${isToday ? 'text-slate-700' : 'text-slate-400'}`}>
              {day.day}
            </span>
            <div
              className={`w-full h-1 rounded-full transition-all`}
              style={{ background: style.dot, opacity: day.status === 'upcoming' ? 0.3 : 1 }}
            />
            {isToday && (
              <span className="w-1 h-1 rounded-full bg-slate-900" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function MonthlySummaryRow({ summary }: { summary: NonNullable<ICheckInContext['monthly_summary']> }) {
  const items = [
    { label: 'Present', value: summary.present, color: '#16a34a' },
    { label: 'Late',    value: summary.late,    color: '#d97706' },
    { label: 'Leave',   value: summary.on_leave,color: '#2563eb' },
    { label: 'Absent',  value: summary.absent,  color: '#dc2626' },
  ];
  return (
    <div className="grid grid-cols-4 gap-1 mt-3">
      {items.map(({ label, value, color }) => (
        <div key={label} className="flex flex-col items-center bg-slate-50 rounded-xl py-2 border border-slate-100">
          <span className="text-sm font-black" style={{ color }}>{value}</span>
          <span className="text-[9px] font-semibold text-slate-400 uppercase mt-0.5">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Special day screens (non-interactive) ────────────────────────────────────
function SpecialDayScreen({ ctx, status }: { ctx: ICheckInContext; status: DashboardStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;

  const illustrations: Record<string, string> = {
    HOLIDAY:  '🎉',
    WEEK_OFF: '☕',
    ON_LEAVE: '🏖',
  };
  const emoji = illustrations[status] ?? '';

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="h-1 w-full" style={{ background: cfg.accent }} />
      <div className="px-4 pt-4 pb-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
          >
            {emoji || <Icon size={22} style={{ color: cfg.accent }} />}
          </div>
          <div>
            <p className="text-base font-black text-slate-900">
              {ctx.message?.title ?? ctx.status_label}
            </p>
            {ctx.message?.subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{ctx.message.subtitle}</p>
            )}
          </div>
        </div>

        {ctx.shift && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock size={11} />
            <span>Shift: <span className="font-semibold text-slate-600">{ctx.shift.start} – {ctx.shift.end}</span></span>
          </div>
        )}

        {ctx.weekly_card && <WeekStrip entries={ctx.weekly_card} />}
        {ctx.monthly_summary && <MonthlySummaryRow summary={ctx.monthly_summary} />}
      </div>
    </div>
  );
}

// ─── Completion screen ─────────────────────────────────────────────────────────
function CompletionScreen({ ctx, status }: { ctx: ICheckInContext; status: DashboardStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  const co = ctx.check_out;
  const ws = ctx.work_summary;

  const workedDisplay = ws?.worked_label ?? co?.worked_label ?? '—';
  const otMins = co?.overtime_minutes ?? 0;
  const earlyMins = co?.early_exit_minutes ?? 0;

  const todayCard = ctx.weekly_card?.find((d) => d.is_today);

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="h-1 w-full" style={{ background: cfg.accent }} />
      <div className="px-4 pt-3 pb-4 flex flex-col gap-3">

        {ctx.greeting && (
          <p className="text-[11px] font-semibold text-slate-400 tracking-wide uppercase">
            {ctx.greeting}
          </p>
        )}

        {/* Status icon + title */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              boxShadow: `0 0 0 6px ${cfg.bg}`,
            }}
          >
            <Icon size={22} style={{ color: cfg.accent }} />
          </div>
          <div>
            <p className="text-base font-black text-slate-900">
              {ctx.message?.title ?? 'Attendance Completed'}
            </p>
            {ctx.message?.subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{ctx.message.subtitle}</p>
            )}
          </div>
        </div>

        {/* In / Out times */}
        {(ctx.check_in?.time || co?.time) && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Check In</p>
              <p className="text-sm font-bold text-slate-800">{ctx.check_in?.time ?? '—'}</p>
              {ctx.check_in?.is_late && (
                <p className="text-[10px] text-amber-600 mt-0.5">Late by {ctx.check_in.late_by_label}</p>
              )}
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Check Out</p>
              <p className="text-sm font-bold text-slate-800">{co?.time ?? '—'}</p>
            </div>
          </div>
        )}

        {/* Worked + badges */}
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
          {earlyMins > 0 && (
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-xl">
              −{fmtHM(earlyMins * 60)} early
            </span>
          )}
          {todayCard && (() => {
            const s = weekDayStatusStyle[todayCard.status] ?? weekDayStatusStyle.present;
            return (
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-xl border capitalize"
                style={{ color: s.text, background: s.bg, borderColor: s.dot + '33' }}
              >
                {todayCard.status.replace(/_/g, ' ')}
              </span>
            );
          })()}
        </div>

        {/* Notice */}
        {ctx.message?.notice && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
            <span className="text-sm flex-shrink-0">🔔</span>
            <p className="text-[11px] text-amber-700">{ctx.message.notice}</p>
          </div>
        )}

        {/* Can regularize hint */}
        {ctx.can_regularize && status === 'ABSENT' && (
          <div className="flex items-start gap-2 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
            <AlertTriangle size={13} className="text-rose-400 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-rose-600">
              Marked absent. Contact HR or request regularization if this is incorrect.
            </p>
          </div>
        )}

        {ctx.weekly_card && <WeekStrip entries={ctx.weekly_card} />}
        {ctx.monthly_summary && <MonthlySummaryRow summary={ctx.monthly_summary} />}
      </div>
    </div>
  );
}

// ─── Location widget ──────────────────────────────────────────────────────────
function LocationWidget({ data, loading }: { data: LocationData | null; loading: boolean }) {
  return (
    <div className="flex items-start gap-2.5 bg-slate-50 rounded-2xl p-3.5">
      <MapPin size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        {loading
          ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Loader2 size={11} className="animate-spin" />
              Detecting location…
            </div>
          )
          : data
            ? (
              <>
                <p className="text-xs font-semibold text-slate-800 leading-snug">{data.address}</p>
                {data.accuracy && (
                  <p className={`text-[10px] mt-0.5 font-medium ${
                    data.accuracy <= 50 ? 'text-emerald-600' :
                    data.accuracy <= 200 ? 'text-amber-600' : 'text-red-500'
                  }`}>
                    ±{data.accuracy}m accuracy
                  </p>
                )}
              </>
            )
            : <p className="text-xs text-slate-400">Location unavailable — check-in may still work</p>}
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function CheckInOutCard({
  apiKey, slug, token, defaultLocation = 'Unknown',
  onAttendanceUpdate, reportingManager,
}: CheckInOutCardProps) {
  const tenantId = apiKey || slug || '';

  const [context, setContext] = useState<ICheckInContext | null>(null);
  const [loadingCtx, setLoadingCtx] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [now, setNow] = useState(new Date());

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEarlyWarning, setShowEarlyWarning] = useState(false);
  const [pendingLoc, setPendingLoc] = useState<LocationData | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isFetchingLoc, setIsFetchingLoc] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Derived status
  const status = (context?.status as DashboardStatus) ?? 'UPCOMING_SHIFT';
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.UPCOMING_SHIFT;

  const isCheckedIn = status === 'WORKING' || status === 'CHECK_OUT_PENDING';
  const isCompleted = ['PRESENT', 'EARLY_EXIT', 'OVERTIME', 'AUTO_CHECKOUT', 'ABSENT'].includes(status);
  const isSpecialDay = ['ON_LEAVE', 'HOLIDAY', 'WEEK_OFF'].includes(status);
  const isRegularization = ['REGULARIZATION_PENDING', 'REGULARIZATION_APPROVED'].includes(status);

  // ── Tick ──
  useEffect(() => {
    const t = setInterval(() => {
      const n = new Date();
      setNow(n);
      if (isCheckedIn && context?.check_in?.time_24hr) {
        const checkInAt = parseTime24(context.check_in.time_24hr);
        setElapsed(Math.floor((n.getTime() - checkInAt.getTime()) / 1000));
      }
    }, 1000);
    return () => clearInterval(t);
  }, [isCheckedIn, context?.check_in?.time_24hr]);

  // ── Load context ──
  const loadContext = useCallback(async () => {
    if (!token) return;
    setLoadingCtx(true);
    try {
      const res = await getCheckInContext(tenantId, token);
      const ctx: ICheckInContext = res?.data?.data ?? {};
      setContext(ctx);
      if (ctx.next_action === 'CHECK_OUT' && ctx.check_in?.time_24hr) {
        const checkInAt = parseTime24(ctx.check_in.time_24hr);
        setElapsed(Math.floor((Date.now() - checkInAt.getTime()) / 1000));
      }
    } catch { /* keep existing or show empty */ }
    finally { setLoadingCtx(false); }
  }, [tenantId, token]);

  useEffect(() => { loadContext(); }, [loadContext]);

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

  const showToast = (msg: string, type: 'success' | 'error' | 'info') => {
    if (type === 'error') toastify.error(msg, { position: 'bottom-right' });
    else if (type === 'success') toastify.success(msg, { position: 'bottom-right' });
    else toastify(msg, { position: 'bottom-right' });
  };

  const openModal = async () => {
    setIsRefreshing(true);
    try {
      const res = await getCheckInContext(tenantId, token);
      const ctx: ICheckInContext = res?.data?.data ?? {};
      setContext(ctx);
      if (ctx.next_action === 'CHECK_OUT' && ctx.check_in?.time_24hr) {
        const checkInAt = parseTime24(ctx.check_in.time_24hr);
        setElapsed(Math.floor((Date.now() - checkInAt.getTime()) / 1000));
      }
    } catch { /* use existing context */ }
    finally { setIsRefreshing(false); }

    setShowConfirmModal(true);
    setIsFetchingLoc(true);
    setLocationData(await fetchLocation());
    setIsFetchingLoc(false);
  };

  const performCheckOut = async (loc: LocationData | null) => {
    if (!context?.attendance_id) { showToast('No active attendance record.', 'error'); return; }
    setIsLoading(true);
    try {
      const n = new Date();
      const res = await checkOut(context.attendance_id, {
        check_out_time: n.toISOString(),
        check_out_lat: loc?.lat ?? 0,
        check_out_lng: loc?.lng ?? 0,
        check_out_location_name: loc?.address ?? defaultLocation,
        check_out_method: 'gps',
      }, tenantId, token);

      const err = extractApiError(res, 'Check-out failed.');
      if (err) { showToast(err, 'error'); return; }

      await loadContext();
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

  const handleConfirm = async () => {
    if (!token) { showToast('Auth token missing.', 'error'); setShowConfirmModal(false); return; }

    if (!isCheckedIn) {
      // CHECK IN
      setIsLoading(true);
      try {
        const n = new Date();
        const res = await checkIn({
          attendance_date: toDateString(n),
          check_in_time: n.toISOString(),
          check_in_lat: locationData?.lat ?? 0,
          check_in_lng: locationData?.lng ?? 0,
          check_in_location_name: locationData?.address ?? defaultLocation,
        }, tenantId, token);

        const apiErr = extractApiError(res, 'Check-in failed.');
        if (apiErr) {
          showToast(apiErr, 'error');
          setIsLoading(false);
          setShowConfirmModal(false);
          setLocationData(null);
          return;
        }

        showToast(res?.data?.message ?? `Checked in at ${fmtTime(n)}`, 'success');
        await loadContext();
        setElapsed(0);
        if (onAttendanceUpdate) onAttendanceUpdate();
      } catch {
        showToast('Check-in failed. Please try again.', 'error');
      } finally {
        setIsLoading(false);
        setShowConfirmModal(false);
        setLocationData(null);
      }
    } else {
      // CHECK OUT — guard early exit
      const shiftEnd24 = context?.shift?.end_24hr;
      const isEarly = shiftEnd24 ? new Date() < parseTime24(shiftEnd24) : false;

      if (isEarly) {
        setPendingLoc(locationData);
        setShowConfirmModal(false);
        setShowEarlyWarning(true);
      } else {
        await performCheckOut(locationData);
      }
    }
  };

  // Shift progress
  const shiftEnd24 = context?.shift?.end_24hr;
  const shiftEndDisplay = context?.shift?.end;
  const checkIn24 = context?.check_in?.time_24hr;
  const shiftDurSecs = shiftEnd24 && checkIn24
    ? Math.floor((parseTime24(shiftEnd24).getTime() - parseTime24(checkIn24).getTime()) / 1000)
    : 8 * 3600;
  const pct = Math.min((elapsed / shiftDurSecs) * 100, 100);

  const remainingSecs = shiftEnd24
    ? Math.max(0, Math.floor((parseTime24(shiftEnd24).getTime() - now.getTime()) / 1000))
    : null;
  const remainingStr = remainingSecs !== null && remainingSecs > 0 ? fmtHM(remainingSecs) : null;
  const workedStr = fmtHM(elapsed);

  // ── Special day (no check-in action) ──
  if (!loadingCtx && (isSpecialDay || isRegularization)) {
    return <SpecialDayScreen ctx={context!} status={status} />;
  }

  // ── Completed (has checkout OR absent) ──
  if (!loadingCtx && isCompleted && context) {
    return <CompletionScreen ctx={context} status={status} />;
  }

  // ── Button visibility ──
  const showButton =
    status === 'READY_TO_CHECK_IN' ||
    status === 'WORKING' ||
    status === 'CHECK_OUT_PENDING';

  // Button label
  const buttonLabel = isCheckedIn ? 'Check Out' : 'Check In';
  const buttonIcon = isCheckedIn ? <LogOut size={15} /> : <LogIn size={15} />;
  const buttonBg = isCheckedIn
    ? 'bg-rose-500 shadow-[0_4px_14px_rgba(239,68,68,0.4)] hover:bg-rose-600'
    : 'bg-[#0f766e] shadow-[0_4px_14px_rgba(15,118,110,0.4)] hover:bg-[#0d6b64]';

  // CHECK_OUT_PENDING extra warning
  const isPendingCheckout = status === 'CHECK_OUT_PENDING';

  return (
    <>
      <div className="flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Status accent bar */}
        <div className="h-1 w-full" style={{ background: cfg.accent }} />

        <div className="px-4 pt-3 pb-4">
          {loadingCtx ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={22} className="animate-spin text-slate-300" />
            </div>
          ) : (
            <>
              {/* ── Top row: greeting + timer / reporting-to ── */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  {context?.greeting && (
                    <p className="text-[11px] font-semibold text-slate-400 tracking-wide uppercase">
                      {context.greeting}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="relative flex h-2 w-2">
                      {isCheckedIn && (
                        <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      )}
                      <span
                        className="relative h-2 w-2 rounded-full"
                        style={{ background: isCheckedIn ? '#10b981' : '#cbd5e1' }}
                      />
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {isCheckedIn
                        ? `Checked in · ${context?.check_in?.time ?? ''}`
                        : context?.status_label ?? 'Not checked in'}
                    </span>
                  </div>
                </div>

                {reportingManager ? (
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Reporting To</p>
                    <div className="flex items-center justify-end gap-2 mt-0.5">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: reportingManager.status === 'ACTIVE' ? '#22c55e' : '#94a3b8' }}
                      />
                      <p className="text-sm font-bold text-slate-800 truncate">{reportingManager.name}</p>
                    </div>
                  </div>
                ) : isCheckedIn ? (
                  <LiveTimer elapsed={elapsed} />
                ) : (
                  <span className="font-mono text-2xl font-black tabular-nums tracking-tight text-slate-200">
                    --:--:--
                  </span>
                )}
              </div>

              {/* ── CHECK_OUT_PENDING alert ── */}
              {isPendingCheckout && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-3">
                  <AlertTriangle size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-700">Shift ended — please check out</p>
                    {context?.message?.notice && (
                      <p className="text-[11px] text-amber-600 mt-0.5">{context.message.notice}</p>
                    )}
                  </div>
                </div>
              )}

              {/* ── Working info (checked-in and not pending) ── */}
              {isCheckedIn && !isPendingCheckout && (
                <div className="flex flex-col gap-1.5 mb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs text-slate-500">
                      Working: <span className="font-bold text-slate-800">{workedStr}</span>
                    </span>
                    {shiftEndDisplay && remainingStr && (
                      <span className="text-xs text-slate-500">
                        Ends <span className="font-bold text-slate-700">{shiftEndDisplay}</span>
                        <span className="text-slate-400"> · {remainingStr} left</span>
                      </span>
                    )}
                  </div>
                  {/* Status badge + subtitle */}
                  {(context?.status_badge || context?.message?.subtitle) && (
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      {context?.status_badge && (
                        <span
                          className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border"
                          style={{ color: cfg.textColor, background: cfg.bg, borderColor: cfg.border }}
                        >
                          {context.status_badge}
                        </span>
                      )}
                      {context?.message?.subtitle && (
                        <span className="text-[11px] text-slate-500">{context.message.subtitle}</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── Pre-shift: message + shift cards ── */}
              {!isCheckedIn && context?.message && (
                <div className="flex flex-col gap-2 mb-3">
                  <div className="flex items-center justify-between rounded-xl px-3 py-3 border"
                    style={{ background: cfg.bg, borderColor: cfg.border }}
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-700">{context.message.title}</p>
                      {context.message.subtitle && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{context.message.subtitle}</p>
                      )}
                    </div>
                    {context.status_badge && (
                      <span
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ml-2"
                        style={{ color: cfg.textColor, background: cfg.bg, borderColor: cfg.border }}
                      >
                        {context.status_badge}
                      </span>
                    )}
                  </div>

                  {(context.shift?.start || context.shift?.end) && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase">Shift Start</p>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">{context.shift.start}</p>
                        {context.shift.grace_minutes && (
                          <p className="text-[10px] text-slate-400 mt-0.5">Grace: {context.shift.grace_minutes}m</p>
                        )}
                      </div>
                      <div className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase">Shift End</p>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">{context.shift.end}</p>
                        {context.shift.min_hours && (
                          <p className="text-[10px] text-slate-400 mt-0.5">Min: {context.shift.min_hours}h</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Regularization nudge */}
                  {context.can_regularize && (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                      <RefreshCw size={11} className="text-amber-500 flex-shrink-0" />
                      <p className="text-[11px] text-amber-700">Regularization available for previous absences</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Notice (comp-off, WFH, etc.) ── */}
              {isCheckedIn && context?.message?.notice && (
                <div className="flex items-start gap-2 bg-violet-50 border border-violet-100 rounded-xl px-3 py-2.5 mb-3">
                  <span className="text-sm flex-shrink-0">🔔</span>
                  <p className="text-[11px] text-violet-600">{context.message.notice}</p>
                </div>
              )}

              {/* ── Progress bar ── */}
              <div className="mb-3">
                <ShiftProgressBar pct={pct} status={status} />
              </div>

              {/* ── Action button ── */}
              {showButton && (
                <button
                  onClick={openModal}
                  disabled={isLoading || isRefreshing}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.97] disabled:opacity-60 text-white ${buttonBg}`}
                >
                  {isRefreshing
                    ? <><Loader2 size={15} className="animate-spin" /> Checking status…</>
                    : <>{buttonIcon} {buttonLabel}</>}
                </button>
              )}

              {/* ── Upcoming shift: no button, just info ── */}
              {status === 'UPCOMING_SHIFT' && !showButton && (
                <div className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-slate-400 bg-slate-50 border border-slate-100">
                  <Clock size={14} />
                  {context?.message?.title ?? 'Shift upcoming'}
                </div>
              )}

              {/* ── Weekly strip ── */}
              {context?.weekly_card && <WeekStrip entries={context.weekly_card} />}

              {/* ── Monthly summary ── */}
              {context?.monthly_summary && <MonthlySummaryRow summary={context.monthly_summary} />}
            </>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          CHECK IN / CHECK OUT CONFIRM MODAL
      ══════════════════════════════════════════════ */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 backdrop-blur-sm"
          onClick={() => !isLoading && setShowConfirmModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-t-3xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 w-full" style={{ background: isCheckedIn ? '#ef4444' : '#0f766e' }} />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: isCheckedIn ? '#fef2f2' : '#f0fdfa' }}
                >
                  {isCheckedIn
                    ? <LogOut size={18} className="text-rose-500" />
                    : <LogIn size={18} style={{ color: '#0f766e' }} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {isCheckedIn ? 'Confirm check out' : 'Confirm check in'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {isCheckedIn
                      ? `You've worked ${workedStr} so far`
                      : fmtTime(now)}
                  </p>
                  {context?.status_badge && (
                    <span
                      className="mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border"
                      style={{ color: cfg.textColor, background: cfg.bg, borderColor: cfg.border }}
                    >
                      {context.status_badge}
                    </span>
                  )}
                </div>
              </div>

              <LocationWidget data={locationData} loading={isFetchingLoc} />

              <div className="flex gap-2.5 mt-5">
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
                  {isLoading
                    ? <Loader2 size={14} className="animate-spin" />
                    : isCheckedIn ? 'Check Out' : 'Check In'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          EARLY CHECKOUT WARNING MODAL
      ══════════════════════════════════════════════ */}
      {showEarlyWarning && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 backdrop-blur-sm"
          onClick={() => !isLoading && setShowEarlyWarning(false)}
        >
          <div
            className="w-full max-w-sm rounded-t-3xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 w-full bg-amber-400" />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                  <AlertTriangle size={18} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Early check-out</p>
                  <p className="text-xs text-slate-400">You're leaving before your shift ends</p>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3.5 mb-5">
                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                  {`Shift ends at ${shiftEndDisplay ?? '—'}. Checking out now will be recorded as an early exit.`}
                </p>
                {remainingStr && (
                  <p className="text-[11px] text-amber-600 mt-1">{remainingStr} remaining in your shift.</p>
                )}
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
    </>
  );
}