'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Activity, Loader2, LogIn, LogOut, RefreshCw, Users, Pause, Play, Clock,
} from 'lucide-react';
import { getAdminLiveToday } from '@/lib/service/attendance';

// Actual response shape from /admin-attendance/live-today
interface ILiveAttendanceEntry {
  id: string;
  employee_name: string;
  department: string;
  shift: string;
  check_in: string;   // pre-formatted, e.g. "10:15 AM" or "--"
  check_out: string;  // pre-formatted, e.g. "07:02 PM" or "--"
  worked: string;     // pre-formatted, e.g. "5h 30m" or "--"
  status: string;     // e.g. "⚪ Not Checked In", "🟢 Checked In", "🔴 Checked Out"
  late: 'Yes' | 'No' | string;
}

const AVATAR_COLORS = [
  'bg-[#0f766e]', 'bg-blue-500', 'bg-violet-500', 'bg-rose-500',
  'bg-amber-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500',
];

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}
function avatarColor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}
function timeAgo(iso: string | null) {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

// status arrives as "⚪ Not Checked In" — split the emoji from the label
// and map the label to a color scheme, since the API doesn't send one.
function parseStatus(raw: string) {
  const trimmed = (raw ?? '').trim();
  const firstSpace = trimmed.indexOf(' ');
  const emoji = firstSpace > -1 ? trimmed.slice(0, firstSpace) : '';
  const label = firstSpace > -1 ? trimmed.slice(firstSpace + 1) : trimmed;
  const lower = label.toLowerCase();

  let bg = 'bg-gray-100';
  let text = 'text-gray-500';
  if (lower.includes('not checked in')) {
    bg = 'bg-gray-100'; text = 'text-gray-500';
  } else if (lower.includes('checked in')) {
    bg = 'bg-cyan-50'; text = 'text-cyan-700';
  } else if (lower.includes('checked out')) {
    bg = 'bg-teal-50'; text = 'text-teal-700';
  } else if (lower.includes('absent')) {
    bg = 'bg-red-50'; text = 'text-red-600';
  } else if (lower.includes('leave')) {
    bg = 'bg-blue-50'; text = 'text-blue-600';
  }

  return { emoji, label: label || 'Unknown', bg, text };
}

const POLL_INTERVAL_MS = 8000;

export default function AdminLiveAttendance() {
  const params = useParams();
  const subdomain = params?.subdomain as string;

  const [entries, setEntries] = useState<ILiveAttendanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLive = async (silent = false) => {
    if (!subdomain) return;
    if (!silent) setLoading(true);
    try {
      const res = await getAdminLiveToday(subdomain);
      const data = Array.isArray(res?.data)
        ? res.data
        : (res?.data?.data ?? []);
      setEntries(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching live attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subdomain]);

  useEffect(() => {
    if (isPolling && subdomain) {
      intervalRef.current = setInterval(() => fetchLive(true), POLL_INTERVAL_MS);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPolling, subdomain]);

  const checkedIn = entries.filter((e) => {
    const { label } = parseStatus(e.status);
    return label.toLowerCase().includes('checked in') && !label.toLowerCase().includes('not');
  });
  const checkedOut = entries.filter((e) => parseStatus(e.status).label.toLowerCase().includes('checked out'));
  const notCheckedIn = entries.filter((e) => parseStatus(e.status).label.toLowerCase().includes('not checked in'));
  const lateCount = entries.filter((e) => e.late === 'Yes').length;

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#e8f5ee] flex items-center justify-center">
            <Activity size={16} className="text-[#0f766e]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#0f1f2e]">Today&apos;s Live Status</p>
            <p className="text-[11px] text-gray-400">
              {lastUpdated ? `Updated ${timeAgo(lastUpdated.toISOString())}` : 'Loading…'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPolling((p) => !p)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold rounded-xl transition-colors ${
              isPolling ? 'bg-[#e8f5ee] text-[#0f766e]' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {isPolling ? <Pause size={12} /> : <Play size={12} />}
            {isPolling ? 'Live' : 'Paused'}
          </button>
          <button
            onClick={() => fetchLive()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-[#e8f5ee] rounded-xl px-3 py-2 border border-gray-100">
          <div className="flex items-center gap-1.5 mb-1">
            <Users size={11} className="text-[#0f766e]" />
            <p className="text-[9px] font-bold text-gray-500 uppercase">Total</p>
          </div>
          <p className="text-lg font-bold text-[#0f766e]">{entries.length}</p>
        </div>
        <div className="bg-cyan-50 rounded-xl px-3 py-2 border border-gray-100">
          <div className="flex items-center gap-1.5 mb-1">
            <LogIn size={11} className="text-cyan-700" />
            <p className="text-[9px] font-bold text-gray-500 uppercase">Checked In</p>
          </div>
          <p className="text-lg font-bold text-cyan-700">{checkedIn.length}</p>
        </div>
        <div className="bg-teal-50 rounded-xl px-3 py-2 border border-gray-100">
          <div className="flex items-center gap-1.5 mb-1">
            <LogOut size={11} className="text-teal-700" />
            <p className="text-[9px] font-bold text-gray-500 uppercase">Checked Out</p>
          </div>
          <p className="text-lg font-bold text-teal-700">{checkedOut.length}</p>
        </div>
        <div className="bg-gray-100 rounded-xl px-3 py-2 border border-gray-100">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock size={11} className="text-gray-500" />
            <p className="text-[9px] font-bold text-gray-500 uppercase">Not In Yet</p>
          </div>
          <p className="text-lg font-bold text-gray-600">{notCheckedIn.length}</p>
        </div>
      </div>

      {/* list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={22} className="animate-spin text-[#0f766e]" />
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
          <Activity size={32} className="text-gray-200 mb-3" />
          <p className="text-sm font-semibold text-gray-400">No live activity yet today</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {entries.map((e) => {
            const { emoji, label, bg, text } = parseStatus(e.status);
            const isLate = e.late === 'Yes';
            return (
              <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                <div className={`w-9 h-9 rounded-xl ${avatarColor(e.employee_name)} text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0`}>
                  {initials(e.employee_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-[#0f1f2e] truncate">{e.employee_name}</p>
                    {isLate && (
                      <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">Late</span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {e.department}
                    {e.shift ? ` · ${e.shift}` : ''}
                  </p>
                </div>
                <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full ${bg} ${text}`}>
                  <span className="text-[11px] leading-none">{emoji}</span>
                  <span className="text-[10px] font-bold">{label}</span>
                </div>
                <div className="hidden md:flex items-center gap-3 text-xs">
                  <div className="text-center w-16">
                    <p className="text-[9px] text-gray-400 uppercase">In</p>
                    <p className="font-mono font-bold text-gray-700">{e.check_in || '--'}</p>
                  </div>
                  <span className="text-gray-300">→</span>
                  <div className="text-center w-16">
                    <p className="text-[9px] text-gray-400 uppercase">Out</p>
                    <p className="font-mono font-bold text-gray-700">{e.check_out || '--'}</p>
                  </div>
                </div>
                <div className="hidden lg:block text-right w-16">
                  <p className="text-[9px] text-gray-400 uppercase">Worked</p>
                  <p className="text-xs font-bold text-[#0f766e]">{e.worked || '--'}</p>
                </div>
                {/* mobile-only status badge, since the pill above is hidden below sm: */}
                <div className={`flex sm:hidden items-center gap-1 px-2 py-0.5 rounded-full ${bg} ${text}`}>
                  <span className="text-[10px] leading-none">{emoji}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}