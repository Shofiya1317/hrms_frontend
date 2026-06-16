'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  ChevronDown, ChevronLeft, ChevronRight, Search, CheckCircle2,
  XCircle, Clock, AlertTriangle, Loader2, Calendar, TrendingUp,
  MapPin, Tag, User,
} from 'lucide-react';
import { getAttendances } from '@/lib/service/attendance';
import { getLeaveApplications } from '@/lib/service/leaveApplication';
import { LeaveStatus } from '@/lib/service/leaveApplication';

// ── Types ─────────────────────────────────────────────────────────────────────
type AttendanceStatus = 'present' | 'absent' | 'on_leave' | 'weekend' | 'holiday' | 'checked_in' | 'checked_out';
type DayType = 'working_day' | 'weekend' | 'public_holiday' | 'company_holiday';

interface IAttendanceLog {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  attendance_date: string;
  day_type: DayType;
  attendance_status: AttendanceStatus;
  check_in_time: string | null;
  check_out_time: string | null;
  total_worked_minutes: number;
  total_worked_hours: string;
  shift_name: string;
  shift_timings: string;
  is_regularized: boolean;
  remarks: string | null;
  is_late: boolean;
  late_by_minutes: number;
  is_early_exit: boolean;
  early_exit_minutes: number;
  is_overtime: boolean;
  overtime_minutes: number;
  leave_info: any;
  holiday_info: any;
}

// ── constants ─────────────────────────────────────────────────────────────────
const STATUS_META: Record<AttendanceStatus, { label: string; bg: string; text: string; dot: string; icon: any }> = {
  present:     { label: 'Present',    bg: 'bg-teal-50',   text: 'text-teal-700',   dot: 'bg-teal-500',   icon: CheckCircle2 },
  absent:      { label: 'Absent',     bg: 'bg-red-50',    text: 'text-red-600',    dot: 'bg-red-400',    icon: XCircle },
  on_leave:    { label: 'On Leave',   bg: 'bg-blue-50',   text: 'text-blue-600',   dot: 'bg-blue-500',   icon: Calendar },
  weekend:     { label: 'Weekend',    bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-500', icon: Calendar },
  holiday:     { label: 'Holiday',    bg: 'bg-amber-50',  text: 'text-amber-600',  dot: 'bg-amber-400',  icon: Calendar },
  checked_in:  { label: 'Checked In', bg: 'bg-cyan-50',   text: 'text-cyan-700',   dot: 'bg-cyan-500',   icon: Clock },
  checked_out: { label: 'Completed',  bg: 'bg-teal-50',   text: 'text-teal-700',   dot: 'bg-teal-500',   icon: CheckCircle2 },
};

const AVATAR_COLORS = [
  'bg-[#0f766e]','bg-blue-500','bg-violet-500','bg-rose-500',
  'bg-amber-500','bg-cyan-500','bg-pink-500','bg-indigo-500',
];

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}
function avatarColor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}
function fmtTime(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtHours(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

// ── Tortoise SVG icon for late ────────────────────────────────────────────────
function TortoiseIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <ellipse cx="12" cy="15" rx="8" ry="5" fill="currentColor" opacity="0.2"/>
      <ellipse cx="12" cy="10" rx="6" ry="4.5" fill="currentColor"/>
      <circle cx="10" cy="9" r="0.8" fill="white"/>
      <circle cx="14" cy="9" r="0.8" fill="white"/>
      <path d="M 8 14 Q 9 12, 10 14" stroke="currentColor" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
      <path d="M 14 14 Q 15 12, 16 14" stroke="currentColor" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
      <circle cx="6" cy="13" r="1.2" fill="currentColor"/>
      <circle cx="18" cy="13" r="1.2" fill="currentColor"/>
    </svg>
  );
}

// ── Accordion Row ─────────────────────────────────────────────────────────────
function AttendanceRow({ log, isOpen, onToggle }: { log: IAttendanceLog; isOpen: boolean; onToggle: () => void }) {
  const meta = STATUS_META[log.attendance_status] ?? STATUS_META.present;
  const Icon = meta.icon;

  return (
    <div className="border-b border-gray-50 last:border-0">
      {/* collapsed row */}
      <div
        onClick={onToggle}
        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <button className={`p-1 rounded-lg transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown size={14} className="text-gray-400" />
        </button>

        {/* avatar */}
        <div className={`w-9 h-9 rounded-xl ${avatarColor(log.employee_name)} text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0`}>
          {initials(log.employee_name)}
        </div>

        {/* name + code */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-[#0f1f2e] truncate">{log.employee_name}</p>
            <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{log.employee_code}</span>
            {log.is_late && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
                <TortoiseIcon size={12} className="text-amber-600" />
                Late
              </div>
            )}
            {log.is_regularized && (
              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-200">Regularized</span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">{fmtDate(log.attendance_date)} · {log.shift_name}</p>
        </div>

        {/* status badge */}
        <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full ${meta.bg} ${meta.text} border ${meta.bg.replace('bg-', 'border-')}`}>
          <Icon size={12} />
          <span className="text-[10px] font-bold">{meta.label}</span>
        </div>

        {/* times */}
        <div className="hidden md:flex items-center gap-3 text-xs">
          <div className="text-center">
            <p className="text-[9px] text-gray-400 uppercase">In</p>
            <p className="font-mono font-bold text-gray-700">{fmtTime(log.check_in_time)}</p>
          </div>
          <span className="text-gray-300">→</span>
          <div className="text-center">
            <p className="text-[9px] text-gray-400 uppercase">Out</p>
            <p className="font-mono font-bold text-gray-700">{fmtTime(log.check_out_time)}</p>
          </div>
        </div>

        {/* hours */}
        <div className="hidden lg:block text-right">
          {/* <p className="text-xs font-bold text-[#0f766e]">{log.total_worked_hours}h</p> */}
          <p className="text-xs font-bold text-[#0f766e]">{fmtHours(log.total_worked_minutes)}</p>
        </div>
      </div>

      {/* expanded details */}
      {isOpen && (
        <div className="bg-gradient-to-br from-gray-50/50 to-white px-4 py-4 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {/* check in */}
            <div className="bg-white rounded-xl border border-gray-100 p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center">
                  <TrendingUp size={12} className="text-teal-600" />
                </div>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Check In</p>
              </div>
              <p className="text-lg font-bold text-[#0f1f2e] font-mono">{fmtTime(log.check_in_time)}</p>
              {log.is_late && (
                <div className="flex items-center gap-1 mt-2">
                  <TortoiseIcon size={14} className="text-amber-600" />
                  <p className="text-[10px] font-bold text-amber-600">
                    Late by {fmtHours(log.late_by_minutes)}
                  </p>
                </div>
              )}
            </div>

            {/* check out */}
            <div className="bg-white rounded-xl border border-gray-100 p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center">
                  <TrendingUp size={12} className="text-rose-600 rotate-180" />
                </div>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Check Out</p>
              </div>
              <p className="text-lg font-bold text-[#0f1f2e] font-mono">{fmtTime(log.check_out_time)}</p>
              {log.is_early_exit && (
                <p className="text-[10px] font-bold text-orange-600 mt-2">
                  Early by {fmtHours(log.early_exit_minutes)}
                </p>
              )}
            </div>

            {/* worked */}
            <div className="bg-white rounded-xl border border-gray-100 p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Clock size={12} className="text-blue-600" />
                </div>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Worked</p>
              </div>
              <p className="text-lg font-bold text-[#0f1f2e]">{log.total_worked_hours}h</p>
              <p className="text-[10px] text-gray-400 mt-1">{fmtHours(log.total_worked_minutes)}</p>
            </div>

            {/* overtime */}
            <div className="bg-white rounded-xl border border-gray-100 p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 rounded-lg ${log.is_overtime ? 'bg-purple-50' : 'bg-gray-50'} flex items-center justify-center`}>
                  <TrendingUp size={12} className={log.is_overtime ? 'text-purple-600' : 'text-gray-400'} />
                </div>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Overtime</p>
              </div>
              <p className={`text-lg font-bold ${log.is_overtime ? 'text-purple-600' : 'text-gray-400'}`}>
                {log.is_overtime ? fmtHours(log.overtime_minutes) : '—'}
              </p>
            </div>
          </div>

          {/* shift + status info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <Clock size={14} className="text-indigo-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 uppercase font-semibold">Shift</p>
                <p className="text-sm font-bold text-[#0f1f2e] truncate">{log.shift_name}</p>
                <p className="text-[10px] text-gray-500 font-mono">{log.shift_timings}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={14} className={meta.text} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 uppercase font-semibold">Status</p>
                <p className={`text-sm font-bold ${meta.text}`}>{meta.label}</p>
                <p className="text-[10px] text-gray-500 capitalize">{log.day_type.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          {/* remarks */}
          {log.remarks && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
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
  const [logs, setLogs] = useState<IAttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | 'ALL'>('ALL');

  useEffect(() => { 
    if (subdomain) {
      fetchLogs(); 
    }
  }, [subdomain, selectedDate, statusFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: any = {
        limit: 100,
        ...(statusFilter !== 'ALL' ? { attendance_status: statusFilter } : {}),
      };
      
      if (selectedDate) {
        params.from_date = selectedDate;
        params.to_date = selectedDate;
      }
      
      // Add cache buster to prevent 304
      params._t = Date.now();
      
      const res = await getAttendances(subdomain, params);

const attendanceLogs = Array.isArray(res?.data)
  ? res.data
  : (res?.data?.data ?? []);
  if (statusFilter === 'on_leave' && selectedDate) {
  const leaveRes = await getLeaveApplications(
    subdomain,
    {
      status: LeaveStatus.APPROVED,
      from_date: selectedDate,
      to_date: selectedDate,
    }
  );

  const leaveApps = Array.isArray(leaveRes?.data)
    ? leaveRes.data
    : (leaveRes?.data?.data ?? []);

  const leaveLogs = leaveApps.map((leave: any) => ({
    id: `leave-${leave.id}`,
    employee_id: leave.employee_id,
    employee_name: leave.employee_name,
    employee_code: leave.employee_code,

    attendance_date: selectedDate,

    attendance_status: 'on_leave',

    check_in_time: null,
    check_out_time: null,

    total_worked_minutes: 0,
    total_worked_hours: '0',

    shift_name: '-',
    shift_timings: '-',

    is_regularized: false,

    remarks: leave.reason,

    is_late: false,
    late_by_minutes: 0,

    is_early_exit: false,
    early_exit_minutes: 0,

    is_overtime: false,
    overtime_minutes: 0,

    day_type: 'working_day',

    leave_info: leave,
    holiday_info: null,
  }));

  setLogs(leaveLogs);
  return;
}
      setLogs(attendanceLogs);
    } catch (error) {
      console.error('Error fetching attendance logs:', error);
    }
    finally { setLoading(false); }
  };

  const filtered = useMemo(() =>
    logs.filter(l =>
      l.employee_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.employee_code?.toLowerCase().includes(search.toLowerCase())
    ), [logs, search]);

  const stats = useMemo(() => ({
    total:       logs.length,
    present:     logs.filter(l => l.attendance_status === 'present').length,
    absent:      logs.filter(l => l.attendance_status === 'absent').length,
    late:        logs.filter(l => l.is_late).length,
    earlyExit:   logs.filter(l => l.is_early_exit).length,
    overtime:    logs.filter(l => l.is_overtime).length,
  }), [logs]);

  const changeDate = (offset: number) => {
    const d = selectedDate ? new Date(selectedDate) : new Date();
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

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

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const MONTH_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  const prevMonth = () => calMonth === 0 ? (setCalYear(calYear - 1), setCalMonth(11)) : setCalMonth(calMonth - 1);
  const nextMonth = () => calMonth === 11 ? (setCalYear(calYear + 1), setCalMonth(0)) : setCalMonth(calMonth + 1);

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
          {selectedDate ? `Attendance for ${fmtDate(selectedDate)}` : 'All attendance records'} · {stats.total} employees · {stats.present} present · {stats.absent} absent
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {/* today button */}
          <button onClick={handleToday}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-[#0f766e] bg-[#e8f5ee] rounded-xl hover:bg-teal-100 transition-colors">
            <Calendar size={12} />
            Today
          </button>
          {/* show all button */}
          <button onClick={handleShowAll}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-xl transition-colors ${
              !selectedDate ? 'bg-[#0f766e] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            Show All
          </button>
          {/* calendar picker */}
          <div className="relative">
            <button onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center gap-1.5 bg-gray-100 rounded-xl px-3 py-1.5 text-xs font-bold text-[#0f1f2e] hover:bg-gray-200 transition-colors">
              <Calendar size={13} />
              {selectedDate ? fmtDate(selectedDate) : 'Select Date'}
            </button>
            {showCalendar && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowCalendar(false)} />
                <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl border border-gray-200 shadow-xl p-4 w-80">
                  <div className="flex items-center justify-between mb-4">
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
                    {DAYS.map(d => <div key={d} className="text-center text-[9px] font-bold text-gray-400 py-1">{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {cells.map((day, i) => {
                      if (!day) return <div key={i} />;
                      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const isSelected = selectedDate === dateStr;
                      const isToday = new Date().toDateString() === new Date(dateStr).toDateString();
                      return (
                        <button key={i} onClick={() => handleDateClick(dateStr)}
                          className={`aspect-square rounded-lg text-xs font-semibold transition-colors ${
                            isSelected ? 'bg-[#0f766e] text-white' :
                            isToday ? 'bg-teal-50 text-[#0f766e] border border-teal-200' :
                            'text-gray-700 hover:bg-gray-100'
                          }`}>
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
          {/* search */}
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search employee..."
              className="pl-7 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all w-40"
            />
          </div>
          {/* status filter */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {(['ALL', 'present', 'absent', 'on_leave'] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-2 py-1 text-[9px] font-bold rounded-lg transition-colors capitalize ${statusFilter === s ? 'bg-white text-[#0f766e] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {s === 'ALL' ? 'All' : STATUS_META[s]?.label ?? s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[
          { label: 'Present',   value: stats.present,   color: 'text-teal-600',   bg: 'bg-teal-50',   dot: 'bg-teal-500' },
          { label: 'Absent',    value: stats.absent,    color: 'text-red-500',    bg: 'bg-red-50',    dot: 'bg-red-400' },
          { label: 'Late',      value: stats.late,      color: 'text-amber-600',  bg: 'bg-amber-50',  dot: 'bg-amber-400' },
          { label: 'Early Exit',value: stats.earlyExit, color: 'text-orange-600', bg: 'bg-orange-50', dot: 'bg-orange-400' },
          { label: 'Overtime',  value: stats.overtime,  color: 'text-purple-600', bg: 'bg-purple-50', dot: 'bg-purple-500' },
          { label: 'Total',     value: stats.total,     color: 'text-[#0f766e]',  bg: 'bg-[#e8f5ee]', dot: 'bg-[#0f766e]' },
        ].map(s => (
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {filtered.map(log => (
            <AttendanceRow
              key={log.id}
              log={log}
              isOpen={expandedId === log.id}
              onToggle={() => setExpandedId(expandedId === log.id ? null : log.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
