'use client';

import React, { useState, useEffect } from 'react';
import {
  LogIn, LogOut, CheckCircle2, Loader2, XCircle, MapPin, AlertCircle,
} from 'lucide-react';
import { checkIn, checkOut, getAttendances } from '@/lib/service/attendance';

interface LocationData { lat: number; lng: number; address: string; accuracy?: number; }
interface CheckInOutCardProps {
  apiKey: string; slug?: string; token: string;
  fullName: string; employeeId: string; designation: string; defaultLocation?: string;
  onAttendanceUpdate?: () => void;
}

function pad(n: number) { return String(n).padStart(2, '0'); }
function fmtTime(d: Date) { return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); }
function toDateString(d: Date) { return d.toISOString().split('T')[0]; }
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
async function fetchLocation(): Promise<LocationData | null> {
  if (!navigator?.geolocation) return null;
  const gp = (o: PositionOptions) => new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, o));
  try {
    const p = await gp({ enableHighAccuracy: true, maximumAge: 0, timeout: 12000 }).catch(() => gp({ enableHighAccuracy: false, maximumAge: 0, timeout: 8000 }));
    const { latitude: lat, longitude: lng, accuracy } = p.coords;
    return {
      lat, lng, address: await reverseGeocode(lat, lng), accuracy: Math.round(accuracy),
    };
  } catch { return null; }
}

const STATUS: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  present: {
    label: 'Present', color: '#16a34a', bg: '#f0fdf4', dot: '#22c55e',
  },
  absent: {
    label: 'Absent', color: '#dc2626', bg: '#fef2f2', dot: '#ef4444',
  },
  late: {
    label: 'Late', color: '#d97706', bg: '#fffbeb', dot: '#f59e0b',
  },
  half_day: {
    label: 'Half Day', color: '#7c3aed', bg: '#f5f3ff', dot: '#8b5cf6',
  },
  week_off: {
    label: 'Week Off', color: '#64748b', bg: '#f8fafc', dot: '#94a3b8',
  },
  holiday: {
    label: 'Holiday', color: '#0891b2', bg: '#ecfeff', dot: '#06b6d4',
  },
  on_leave: {
    label: 'On Leave', color: '#2563eb', bg: '#eff6ff', dot: '#3b82f6',
  },
};

export default function CheckInOutCard({
  apiKey, slug, token, fullName, employeeId, designation, defaultLocation = 'Unknown', onAttendanceUpdate,
}: CheckInOutCardProps) {
  const [now, setNow] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInEpoch, setCheckInEpoch] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [attendanceId, setAttendanceId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isFetchingLoc, setIsFetchingLoc] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const pct = Math.min((elapsed / (8 * 3600)) * 100, 100);
  const timerStr = `${pad(Math.floor(elapsed / 3600))}:${pad(Math.floor((elapsed % 3600) / 60))}:${pad(elapsed % 60)}`;

  useEffect(() => {
    const t = setInterval(() => {
      const n = new Date(); setNow(n);
      if (isCheckedIn && checkInEpoch) setElapsed(Math.floor((n.getTime() - checkInEpoch) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [isCheckedIn, checkInEpoch]);

  useEffect(() => {
    const s = localStorage.getItem('att_state');
    if (s) { try { const { aId, epoch } = JSON.parse(s); if (aId && epoch) { setAttendanceId(aId); setCheckInEpoch(epoch); setIsCheckedIn(true); } } catch { localStorage.removeItem('att_state'); } }
  }, []);

  useEffect(() => {
    if (isCheckedIn && attendanceId && checkInEpoch) localStorage.setItem('att_state', JSON.stringify({ aId: attendanceId, epoch: checkInEpoch }));
    else localStorage.removeItem('att_state');
  }, [isCheckedIn, attendanceId, checkInEpoch]);

  const fetchRecentAttendance = async () => {
    if (!employeeId) return;
    setLoadingRecent(true);
    getAttendances(apiKey || slug || '', { employee_id: employeeId, limit: 7 }, token)
      .then((r) => setRecent(Array.isArray(r?.data?.data) ? r.data.data : []))
      .catch(() => {})
      .finally(() => setLoadingRecent(false));
  };

  useEffect(() => {
    fetchRecentAttendance();
  }, [employeeId]);

  const showToast = (msg: string, type: 'success' | 'error' | 'info') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500);
  };

  const openModal = async () => {
    setShowModal(true); setIsFetchingLoc(true);
    setLocationData(await fetchLocation()); setIsFetchingLoc(false);
  };

  const handleConfirm = async () => {
    if (!token) { showToast('Auth token missing.', 'error'); setShowModal(false); return; }
    const n = new Date(); setIsLoading(true);
    try {
      if (!isCheckedIn) {
        const res = await checkIn({
          attendance_date: toDateString(n), check_in_time: n.toISOString(), check_in_lat: locationData?.lat || 0, check_in_lng: locationData?.lng || 0, check_in_location_name: locationData?.address || defaultLocation, check_in_method: 'gps', check_in_device_info: getDeviceInfo(),
        }, apiKey || '', token);
        if (!res?.data?.data?.id) throw new Error('Check-in failed.');
        setAttendanceId(res.data.data.id); setIsCheckedIn(true); setCheckInEpoch(n.getTime()); setElapsed(0);
        showToast(`Checked in at ${fmtTime(n)}`, 'success');
        // Refresh dashboard and recent attendance
        if (onAttendanceUpdate) onAttendanceUpdate();
        fetchRecentAttendance();
      } else {
        if (!attendanceId) throw new Error('No record found.');
        const res = await checkOut(attendanceId, {
          check_out_time: n.toISOString(), check_out_lat: locationData?.lat || 0, check_out_lng: locationData?.lng || 0, check_out_location_name: locationData?.address || defaultLocation, check_out_method: 'gps',
        }, apiKey, token);
        const s = res?.data?.data?.work_summary;
        showToast(s ? `Done · ${s.total_worked_hours}h worked` : 'Checked out.', 'info');
        setIsCheckedIn(false); setElapsed(0); setAttendanceId(null); setCheckInEpoch(null);
        // Refresh dashboard and recent attendance
        if (onAttendanceUpdate) onAttendanceUpdate();
        fetchRecentAttendance();
      }
    } catch (e: any) { showToast(e?.message || 'Something went wrong.', 'error'); } finally { setIsLoading(false); setShowModal(false); setLocationData(null); }
  };

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold shadow-lg border ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-sky-50 border-sky-200 text-sky-700'}`}>
            {toast.type === 'error' ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
            {toast.msg}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TOP SECTION  ·  ~25% height  ·  Check-in strip
      ══════════════════════════════════════════ */}
      <div className="flex-shrink-0 px-4 pt-5 pb-4 border-b border-slate-100">

        {/* Date + status line */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 tracking-wide uppercase">
              {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="relative flex h-2 w-2">
                {isCheckedIn && <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" />}
                <span className={`relative h-2 w-2 rounded-full ${isCheckedIn ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              </span>
              <span className="text-sm font-bold text-slate-800">
                {isCheckedIn && checkInEpoch ? `In since ${fmtTime(new Date(checkInEpoch))}` : 'Not checked in'}
              </span>
            </div>
          </div>
          {/* Live timer */}
          <p className={`font-mono text-2xl font-black tabular-nums tracking-tight ${isCheckedIn ? 'text-slate-900' : 'text-slate-200'}`}>
            {timerStr}
          </p>
        </div>

        {/* Slim progress bar */}
        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${pct}%`,
              background: isCheckedIn ? 'linear-gradient(90deg,#34d399,#10b981)' : '#e2e8f0',
              boxShadow: isCheckedIn ? '0 0 6px rgba(52,211,153,0.5)' : 'none',
            }}
          />
        </div>

        {/* Check-in / Check-out button */}
        <button
          onClick={openModal}
          disabled={isLoading}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.97] ${isCheckedIn ? 'bg-rose-500 text-white shadow-[0_4px_14px_rgba(239,68,68,0.4)] hover:bg-rose-600' : 'bg-emerald-500 text-white shadow-[0_4px_14px_rgba(16,185,129,0.4)] hover:bg-emerald-600'}`}
        >
          {isCheckedIn ? (
            <>
              <LogOut size={15} />
              Check Out
            </>
          ) : (
            <>
              <LogIn size={15} />
              Check In
            </>
          )}
        </button>
      </div>

      {/* ══════════════════════════════════════════
          BOTTOM SECTION  ·  ~75% height  ·  Last 7 days
      ══════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-h-0 px-4 pt-4 pb-4">

        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <p className="text-sm font-bold text-slate-800">Recent Attendance</p>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">Last 7 days</span>
        </div>

        {loadingRecent ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={22} className="animate-spin text-slate-300" />
          </div>
        ) : recent.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <AlertCircle size={28} className="text-slate-200" />
            <p className="text-sm text-slate-400">No attendance records yet</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-2 overflow-hidden">
            {recent.map((item, idx) => {
              const s = STATUS[item.attendance_status] || STATUS.present;
              const inTime = item.check_in_time ? new Date(item.check_in_time) : null;
              const outTime = item.check_out_time ? new Date(item.check_out_time) : null;
              const workedH = Math.floor((item.total_worked_minutes || 0) / 60);
              const workedM = (item.total_worked_minutes || 0) % 60;
              const isToday = idx === 0;

              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 px-4 rounded-2xl transition-all ${isToday ? 'py-3.5 shadow-sm border' : 'py-2.5 border'}`}
                  style={{
                    backgroundColor: isToday ? s.bg : '#fafafa',
                    borderColor: isToday ? `${s.color}30` : '#f1f5f9',
                  }}
                >
                  {/* Day + Date */}
                  <div className="flex-shrink-0 w-10 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      {new Date(item.attendance_date).toLocaleDateString('en-IN', { weekday: 'short' })}
                    </p>
                    <p className={`text-xl font-black leading-tight ${isToday ? 'text-slate-800' : 'text-slate-500'}`}>
                      {new Date(item.attendance_date).getDate()}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="w-px self-stretch bg-slate-200 flex-shrink-0" />

                  {/* In → Out */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold tabular-nums text-slate-700">
                        {inTime ? fmtTime(inTime) : '--:--'}
                      </span>
                      <span className="text-slate-300 text-xs">─</span>
                      <span className={`text-sm font-bold tabular-nums ${outTime ? 'text-slate-700' : 'text-slate-300'}`}>
                        {outTime ? fmtTime(outTime) : '--:--'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {/* Status badge */}
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}25` }}
                      >
                        {s.label}
                      </span>
                      {item.is_late && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                          Late
                        </span>
                      )}
                      {item.is_regularized && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                          Regularized
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Hours worked */}
                  <div className="flex-shrink-0 text-right">
                    <p className={`text-lg font-black tabular-nums leading-none ${isToday ? '' : 'text-slate-600'}`} style={isToday ? { color: s.color } : {}}>
                      {workedH}
                      <span className="text-xs font-semibold">h</span>
                      {workedM > 0 && (
                      <>
                        {workedM}
                        <span className="text-xs font-semibold">m</span>
                      </>
                      )}
                    </p>
                    {isToday && <p className="text-[9px] text-slate-400 mt-0.5">today</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Confirm Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => !isLoading && setShowModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-t-3xl bg-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Accent */}
            <div className={`h-1 w-full ${isCheckedIn ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            <div className="p-6">
              {/* Title */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isCheckedIn ? 'bg-rose-50' : 'bg-emerald-50'}`}>
                  {isCheckedIn
                    ? <LogOut size={18} className="text-rose-500" />
                    : <LogIn size={18} className="text-emerald-500" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{isCheckedIn ? 'Check out' : 'Check in'}</p>
                  <p className="text-xs text-slate-400">
                    {isCheckedIn && checkInEpoch
                      ? `${Math.floor(elapsed / 3600)}h ${Math.floor((elapsed % 3600) / 60)}m worked`
                      : fmtTime(now)}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-2.5 bg-slate-50 rounded-2xl p-3.5 mb-5">
                <MapPin size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  {isFetchingLoc
                    ? (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Loader2 size={11} className="animate-spin" />
                        Detecting location…
                      </div>
                    )
                    : locationData
                      ? (
                        <>
                          <p className="text-xs font-semibold text-slate-800 leading-snug">{locationData.address}</p>
                          {locationData.accuracy && (
                            <p className={`text-[10px] mt-0.5 font-medium ${locationData.accuracy <= 50 ? 'text-emerald-600' : locationData.accuracy <= 200 ? 'text-amber-600' : 'text-red-500'}`}>
                              ±
                              {' '}
                              {locationData.accuracy}
                              m accuracy
                            </p>
                          )}
                        </>
                      )
                      : <p className="text-xs text-slate-400">Location unavailable</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2.5">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isLoading}
                  className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white transition-all active:scale-95 ${isCheckedIn ? 'bg-rose-500 shadow-[0_4px_14px_rgba(239,68,68,0.4)]' : 'bg-emerald-500 shadow-[0_4px_14px_rgba(16,185,129,0.4)]'}`}
                >
                  {isLoading ? <Loader2 size={14} className="animate-spin" /> : isCheckedIn ? 'Confirm check out' : 'Confirm check in'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
