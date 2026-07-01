'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  ChevronDown, ChevronLeft, ChevronRight, Search, CheckCircle2,
  XCircle, Clock, AlertTriangle, Loader2, Calendar, User, X, ExternalLink,
  LogIn, LogOut,
} from 'lucide-react';
import {
  getAdminAttendanceRecords,
  getAttendanceLogs,
} from '@/lib/service/attendance';
import { getLeaveApplications, LeaveStatus } from '@/lib/service/leaveApplication';

// ── Types (matched to actual /admin-attendance/records response) ──────────────
interface IAttendanceRecord {
  date: string;         // pre-formatted, e.g. "Jul 1, 2026"
  date_raw: string;     // ISO, e.g. "2026-07-01"
  employee_id: string;
  employee_name: string;
  department: string;
  check_in: string;     // pre-formatted, e.g. "12:24 PM" or "--"
  check_out: string;    // pre-formatted, e.g. "--"
  worked: string;       // pre-formatted, e.g. "0h 0m"
  status: string;       // free text: "Working", "Present", "Absent", "On Leave", etc.
  remarks?: string | null;
}

// This is what /v1/attendance/logs returns per entry — the sample response had
// an empty `logs` array, so this is inferred to match the records shape above.
// Update field names here once you see a populated response.
interface IEmployeeLogEntry {
  date: string;
  date_raw: string;
  check_in: string;
  check_out: string;
  worked: string;
  status: string;
  remarks?: string | null;
}

// ── status → color/icon mapping (status is free text, not an enum) ────────────
function getStatusMeta(rawStatus: string) {
  const status = (rawStatus ?? '').trim();
  const lower = status.toLowerCase();

  if (lower.includes('not checked in')) {
    return { label: status || 'Not Checked In', bg: 'bg-gray-100', text: 'text-gray-500', icon: Clock };
  }
  if (lower.includes('working')) {
    return { label: status, bg: 'bg-cyan-50', text: 'text-cyan-700', icon: Clock };
  }
  if (lower.includes('checked out') || lower.includes('completed') || lower === 'present') {
    return { label: status, bg: 'bg-teal-50', text: 'text-teal-700', icon: CheckCircle2 };
  }
  if (lower.includes('absent')) {
    return { label: status, bg: 'bg-red-50', text: 'text-red-600', icon: XCircle };
  }
  if (lower.includes('leave')) {
    return { label: status, bg: 'bg-blue-50', text: 'text-blue-600', icon: Calendar };
  }
  if (lower.includes('late')) {
    return { label: status, bg: 'bg-amber-50', text: 'text-amber-600', icon: AlertTriangle };
  }
  if (lower.includes('holiday')) {
    return { label: status, bg: 'bg-purple-50', text: 'text-purple-600', icon: Calendar };
  }
  return { label: status || 'Unknown', bg: 'bg-gray-100', text: 'text-gray-500', icon: Clock };
}

const AVATAR_COLORS = [
  'bg-[#0f766e]', 'bg-blue-500', 'bg-violet-500', 'bg-rose-500',
  'bg-amber-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500',
];

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2)
    .toUpperCase();
}
function avatarColor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}
function fmtDateFromRaw(dateRaw: string, fallback?: string) {
  if (!dateRaw) return fallback ?? '—';
  const d = new Date(dateRaw);
  if (Number.isNaN(d.getTime())) return fallback ?? dateRaw;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Employee Detail Modal (month view via /v1/attendance/logs) ────────────────
function EmployeeDetailModal({
  employeeId, employeeName, subdomain, onClose,
}: {
  employeeId: string; employeeName: string; subdomain: string; onClose: () => void;
}) {
  const [view, setView] = useState<'week' | 'prev_week' | 'month' | 'prev_month'>('month');
  const [logs, setLogs] = useState<IEmployeeLogEntry[]>([]);
  const [totalDays, setTotalDays] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await getAttendanceLogs(subdomain, { employee_id: employeeId, view, limit: 100 });
        const payload = res?.data?.data ?? res?.data ?? {};
        const entries: IEmployeeLogEntry[] = Array.isArray(payload?.logs) ? payload.logs : [];
        if (!cancelled) {
          setLogs(entries);
          setTotalDays(payload?.total_days ?? entries.length);
        }
      } catch (error) {
        console.error('Error fetching employee attendance history:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchDetail();
    return () => { cancelled = true; };
  }, [subdomain, employeeId, view]);

  const summary = useMemo(() => {
    const counts = { present: 0, absent: 0, onLeave: 0, working: 0 };
    logs.forEach((l) => {
      const lower = (l.status ?? '').toLowerCase();
      if (lower.includes('absent')) counts.absent += 1;
      else if (lower.includes('leave')) counts.onLeave += 1;
      else if (lower.includes('working')) counts.working += 1;
      else if (lower.includes('present') || lower.includes('checked out') || lower.includes('completed')) counts.present += 1;
    });
    return counts;
  }, [logs]);

  const VIEW_OPTIONS: { id: typeof view; label: string }[] = [
    { id: 'week', label: 'This Week' },
    { id: 'prev_week', label: 'Last Week' },
    { id: 'month', label: 'This Month' },
    { id: 'prev_month', label: 'Last Month' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${avatarColor(employeeName)} text-white text-[12px] font-bold flex items-center justify-center`}>
              {initials(employeeName)}
            </div>
            <div>
              <p className="text-sm font-bold text-[#0f1f2e]">{employeeName}</p>
              <p className="text-[11px] text-gray-400">
                Attendance History{totalDays ? ` · ${totalDays} days` : ''}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* view switcher */}
        <div className="flex items-center gap-1 px-5 py-3 border-b border-gray-100 overflow-x-auto">
          {VIEW_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setView(opt.id)}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg whitespace-nowrap transition-colors ${
                view === opt.id ? 'bg-[#0f766e] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* summary strip */}
        <div className="grid grid-cols-4 gap-2 px-5 py-3 border-b border-gray-100">
          <div className="text-center">
            <p className="text-sm font-bold text-teal-600">{summary.present}</p>
            <p className="text-[9px] text-gray-400 uppercase font-semibold">Present</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-red-500">{summary.absent}</p>
            <p className="text-[9px] text-gray-400 uppercase font-semibold">Absent</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-blue-600">{summary.onLeave}</p>
            <p className="text-[9px] text-gray-400 uppercase font-semibold">On Leave</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-cyan-600">{summary.working}</p>
            <p className="text-[9px] text-gray-400 uppercase font-semibold">Working</p>
          </div>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={20} className="animate-spin text-[#0f766e]" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Calendar size={28} className="text-gray-200 mb-2" />
              <p className="text-xs font-semibold text-gray-400">No records for this period</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {logs.map((log, idx) => {
                const meta = getStatusMeta(log.status);
                const Icon = meta.icon;
                return (
                  <div key={`${log.date_raw}-${idx}`} className="flex items-center gap-3 px-5 py-2.5">
                    <div className="w-20 text-[11px] font-semibold text-gray-500">
                      {fmtDateFromRaw(log.date_raw, log.date)}
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${meta.bg} ${meta.text}`}>
                      <Icon size={10} />
                      <span className="text-[9px] font-bold">{meta.label}</span>
                    </div>
                    <div className="flex-1" />
                    <div className="text-[10px] font-mono text-gray-500">
                      {log.check_in || '--'} → {log.check_out || '--'}
                    </div>
                    <div className="w-16 text-right text-[10px] font-bold text-gray-600">
                      {log.worked || '--'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Row ─────────────────────────────────────────────────────────────────────
function AttendanceRow({
  log, isOpen, onToggle, onViewDetail,
}: {
  log: IAttendanceRecord; isOpen: boolean; onToggle: () => void; onViewDetail: () => void;
}) {
  const meta = getStatusMeta(log.status);
  const Icon = meta.icon;

  return (
    <div className="border-b border-gray-50 last:border-0">
      {/* collapsed row */}
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
        <button onClick={onToggle} className={`p-1 rounded-lg transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown size={14} className="text-gray-400" />
        </button>

        {/* avatar — click to open employee detail */}
        <button
          onClick={onViewDetail}
          title="View employee history"
          className={`w-9 h-9 rounded-xl ${avatarColor(log.employee_name)} text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity`}
        >
          {initials(log.employee_name)}
        </button>

        {/* name + department */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggle}>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={(e) => { e.stopPropagation(); onViewDetail(); }}
              className="text-sm font-bold text-[#0f1f2e] truncate hover:text-[#0f766e] hover:underline flex items-center gap-1"
            >
              {log.employee_name}
              <ExternalLink size={10} className="text-gray-300" />
            </button>
            {log.department && (
              <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{log.department}</span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {fmtDateFromRaw(log.date_raw, log.date)}
          </p>
        </div>

        {/* status badge */}
        <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full ${meta.bg} ${meta.text}`}>
          <Icon size={12} />
          <span className="text-[10px] font-bold">{meta.label}</span>
        </div>

        {/* times */}
        <div className="hidden md:flex items-center gap-3 text-xs" onClick={onToggle}>
          <div className="text-center w-16">
            <p className="text-[9px] text-gray-400 uppercase">In</p>
            <p className="font-mono font-bold text-gray-700">{log.check_in || '--'}</p>
          </div>
          <span className="text-gray-300">→</span>
          <div className="text-center w-16">
            <p className="text-[9px] text-gray-400 uppercase">Out</p>
            <p className="font-mono font-bold text-gray-700">{log.check_out || '--'}</p>
          </div>
        </div>

        {/* worked */}
        <div className="hidden lg:block text-right w-16" onClick={onToggle}>
          <p className="text-[9px] text-gray-400 uppercase">Worked</p>
          <p className="text-xs font-bold text-[#0f766e]">{log.worked || '--'}</p>
        </div>
      </div>

      {/* expanded details */}
      {isOpen && (
        <div className="bg-gradient-to-br from-gray-50/50 to-white px-4 py-4 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-gray-100 p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center">
                  <LogIn size={12} className="text-teal-600" />
                </div>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Check In</p>
              </div>
              <p className="text-lg font-bold text-[#0f1f2e] font-mono">{log.check_in || '--'}</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center">
                  <LogOut size={12} className="text-rose-600" />
                </div>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Check Out</p>
              </div>
              <p className="text-lg font-bold text-[#0f1f2e] font-mono">{log.check_out || '--'}</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Clock size={12} className="text-blue-600" />
                </div>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Worked</p>
              </div>
              <p className="text-lg font-bold text-[#0f1f2e]">{log.worked || '--'}</p>
            </div>
          </div>

          <div className="mt-3 bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={14} className={meta.text} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Status</p>
              <p className={`text-sm font-bold ${meta.text}`}>{meta.label}</p>
            </div>
          </div>

          {log.remarks && (
            <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-amber-700 uppercase mb-0.5">Remarks</p>
                  <p className="text-xs text-amber-800">{log.remarks}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AttendanceLogs() {
  const params = useParams();
  const subdomain = params?.subdomain as string;

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<string | null>(today.toISOString().split('T')[0]);
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [showCalendar, setShowCalendar] = useState(false);
  const [logs, setLogs] = useState<IAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'present' | 'absent' | 'on_leave'>('ALL');
  const [detailEmployee, setDetailEmployee] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (subdomain) {
      fetchLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subdomain, selectedDate, statusFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // on_leave is served from the leave-applications API, not records
      if (statusFilter === 'on_leave' && selectedDate) {
        const leaveRes = await getLeaveApplications(subdomain, {
          status: LeaveStatus.APPROVED,
          from_date: selectedDate,
          to_date: selectedDate,
        });

        const leaveApps = Array.isArray(leaveRes?.data)
          ? leaveRes.data
          : (leaveRes?.data?.data ?? []);

        const leaveLogs: IAttendanceRecord[] = leaveApps.map((leave: any) => ({
          date: fmtDateFromRaw(selectedDate),
          date_raw: selectedDate,
          employee_id: leave.employee_id,
          employee_name: leave.employee_name,
          department: leave.department ?? '',
          check_in: '--',
          check_out: '--',
          worked: '--',
          status: 'On Leave',
          remarks: leave.reason,
        }));

        setLogs(leaveLogs);
        setLoading(false);
        return;
      }

      const recordParams: Record<string, any> = {
        ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
        ...(selectedDate ? { date: selectedDate } : {}),
      };

      const res = await getAdminAttendanceRecords(subdomain, recordParams);
      const attendanceLogs = Array.isArray(res?.data)
        ? res.data
        : (res?.data?.data ?? []);

      setLogs(attendanceLogs);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(
    () => logs.filter((l) => l.employee_name?.toLowerCase().includes(search.toLowerCase())
      || l.department?.toLowerCase().includes(search.toLowerCase())),
    [logs, search],
  );

  const stats = useMemo(() => {
    let present = 0; let absent = 0; let working = 0; let onLeave = 0;
    logs.forEach((l) => {
      const lower = (l.status ?? '').toLowerCase();
      if (lower.includes('absent')) absent += 1;
      else if (lower.includes('leave')) onLeave += 1;
      else if (lower.includes('working')) working += 1;
      else if (lower.includes('present') || lower.includes('checked out') || lower.includes('completed')) present += 1;
    });
    return {
      total: logs.length, present, absent, working, onLeave,
    };
  }, [logs]);

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const handleShowAll = () => {
    setSelectedDate(null);
    setShowCalendar(false);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setShowCalendar(false);
  };

  const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const prevMonth = () => (calMonth === 0 ? (setCalYear(calYear - 1), setCalMonth(11)) : setCalMonth(calMonth - 1));
  const nextMonth = () => (calMonth === 11 ? (setCalYear(calYear + 1), setCalMonth(0)) : setCalMonth(calMonth + 1));

  const firstDow = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDow).fill(null)];
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-gray-400">
          {selectedDate ? `Attendance for ${fmtDateFromRaw(selectedDate)}` : 'All attendance records'}
          {' '}·{' '}{stats.total} employees ·{' '}{stats.present} present ·{' '}{stats.absent} absent
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleToday}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-[#0f766e] bg-[#e8f5ee] rounded-xl hover:bg-teal-100 transition-colors"
          >
            <Calendar size={12} />
            Today
          </button>
          <button
            onClick={handleShowAll}
            className={`px-3 py-1.5 text-[12px] font-bold rounded-xl transition-colors ${
              !selectedDate ? 'bg-[#0f766e] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Show All
          </button>
          <div className="relative">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center gap-1.5 bg-gray-100 rounded-xl px-3 py-1.5 text-xs font-bold text-[#0f1f2e] hover:bg-gray-200 transition-colors"
            >
              <Calendar size={13} />
              {selectedDate ? fmtDateFromRaw(selectedDate) : 'Select Date'}
            </button>
            {showCalendar && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowCalendar(false)} />
                <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl border border-gray-200 shadow-xl p-2 w-80">
                  <div className="flex items-center justify-between mb-2">
                    <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                      <ChevronLeft size={16} />
                    </button>
                    <div className="text-center">
                      <p className="text-sm font-bold text-[#0f1f2e]">{MONTH_FULL[calMonth]}</p>
                      <p className="text-[10px] text-gray-400">{calYear}</p>
                    </div>
                    <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {DAYS.map((d) => <div key={d} className="text-center text-[9px] font-bold text-gray-400 py-1">{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {cells.map((day, i) => {
                      if (!day) return <div key={i} />;
                      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const isSelected = selectedDate === dateStr;
                      const isToday = new Date().toDateString() === new Date(dateStr).toDateString();
                      return (
                        <button
                          key={i}
                          onClick={() => handleDateClick(dateStr)}
                          className={`aspect-square rounded-lg text-xs font-semibold transition-colors ${
                            isSelected ? 'bg-[#0f766e] text-white'
                              : isToday ? 'bg-teal-50 text-[#0f766e] border border-teal-200'
                                : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee"
              className="pl-6 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all w-40"
            />
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {(['ALL', 'present', 'absent', 'on_leave'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2 py-1 text-[12px] font-bold rounded-lg transition-colors capitalize ${statusFilter === s ? 'bg-white text-[#0f766e] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {s === 'ALL' ? 'All' : s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { label: 'Present', value: stats.present, color: 'text-teal-600', bg: 'bg-teal-50', dot: 'bg-teal-500' },
          { label: 'Working', value: stats.working, color: 'text-cyan-600', bg: 'bg-cyan-50', dot: 'bg-cyan-500' },
          { label: 'Absent', value: stats.absent, color: 'text-red-500', bg: 'bg-red-50', dot: 'bg-red-400' },
          { label: 'On Leave', value: stats.onLeave, color: 'text-blue-600', bg: 'bg-blue-50', dot: 'bg-blue-500' },
          { label: 'Total', value: stats.total, color: 'text-[#0f766e]', bg: 'bg-[#e8f5ee]', dot: 'bg-[#0f766e]' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl px-3 py-2 border border-gray-100`}>
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              <p className="text-[9px] font-bold text-gray-500 uppercase">{s.label}</p>
            </div>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={22} className="animate-spin text-[#0f766e]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
          <User size={32} className="text-gray-200 mb-3" />
          <p className="text-sm font-semibold text-gray-400">No attendance records</p>
          {search && <p className="text-xs text-gray-400 mt-1">Try a different search</p>}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-auto">
          {filtered.map((log, idx) => {
            const rowId = `${log.employee_id}-${log.date_raw}-${idx}`;
            return (
              <AttendanceRow
                key={rowId}
                log={log}
                isOpen={expandedId === rowId}
                onToggle={() => setExpandedId(expandedId === rowId ? null : rowId)}
                onViewDetail={() => setDetailEmployee({ id: log.employee_id, name: log.employee_name })}
              />
            );
          })}
        </div>
      )}

      {/* ── Employee Detail Modal ── */}
      {detailEmployee && (
        <EmployeeDetailModal
          employeeId={detailEmployee.id}
          employeeName={detailEmployee.name}
          subdomain={subdomain}
          onClose={() => setDetailEmployee(null)}
        />
      )}
    </div>
  );
}