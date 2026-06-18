'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  Plus, Pencil, Trash2, X, Loader2, CalendarDays,
  AlertCircle, ChevronLeft, ChevronRight, Download,
  Briefcase, Shield, Award, Sun, Building, Repeat,
  Home, MapPin, Settings, Eye, EyeOff
} from 'lucide-react';
import {
  getHolidaysByYear, createHoliday, updateHoliday, deleteHoliday, bulkImportHolidays,
  IHoliday, IHolidayPayload, HolidayType, DayType,
  getMonthlyCalendar, getWorkSchedule, ICalendarDay, IMonthlyCalendar, IWorkSchedule,
  getWorkLocationSchedule, IWorkLocationSchedule
} from '@/lib/service/companyHoliday';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const MONTH_FULL  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_SHORT  = ['S','M','T','W','T','F','S'];
const HOLIDAY_TYPES: HolidayType[] = ['public', 'optional', 'restricted'];

// Work location meta for display
const LOCATION_META = {
  office: { icon: Building, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Office' },
  wfh: { icon: Home, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'WFH' },
};

// Function to get work location for a specific day
const getWorkLocation = (dayName: string, locationSchedule: IWorkLocationSchedule | null): 'office' | 'wfh' | null => {
  if (!locationSchedule || !locationSchedule.schedule) return null;
  const location = locationSchedule.schedule[dayName.toLowerCase() as keyof typeof locationSchedule.schedule];
  return location === 'office' ? 'office' : location === 'wfh' ? 'wfh' : null;
};

const TYPE_META: Record<HolidayType, {
  label: string; bg: string; text: string; dot: string; border: string; ringColor: string;
}> = {
  public:     { label: 'Public',     bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500',   border: 'border-blue-200',   ringColor: 'ring-blue-400'   },
  optional:   { label: 'Optional',   bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-500',  border: 'border-amber-200',  ringColor: 'ring-amber-400'  },
  restricted: { label: 'Restricted', bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500', border: 'border-purple-200', ringColor: 'ring-purple-400' },
};

// Meta for a "working day override" entry (day_type === 'working')
const WORK_OVERRIDE_META = {
  label: 'Working Day',
  bg: 'bg-orange-100',
  text: 'text-orange-700',
  dot: 'bg-orange-500',
  border: 'border-orange-200',
  ringColor: 'ring-orange-400',
};

// Returns the right meta block for any holiday/override entry
function getEntryMeta(h: IHoliday) {
  if (h.day_type === 'working') return WORK_OVERRIDE_META;
  return TYPE_META[h.holiday_type];
}

// Day visual config
type DayKind = 'working' | 'weekend' | 'working_saturday' | 'non_working_saturday' | 'holiday' | 'working_override';
const DAY_KIND_META: Record<DayKind, { bg: string; text: string; border: string; dot: string; label: string }> = {
  working:             { bg: 'bg-white',        text: 'text-slate-700', border: 'border-slate-100', dot: 'bg-slate-300',   label: 'Working day'            },
  weekend:             { bg: 'bg-slate-50',      text: 'text-slate-400', border: 'border-slate-100', dot: 'bg-slate-200',   label: 'Weekend'                },
  working_saturday:    { bg: 'bg-emerald-50',    text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400', label: 'Working Saturday'  },
  non_working_saturday:{ bg: 'bg-slate-50',      text: 'text-slate-400', border: 'border-slate-100', dot: 'bg-slate-200',   label: 'Off Saturday'           },
  holiday:             { bg: 'bg-red-50',        text: 'text-red-600',   border: 'border-red-200',   dot: 'bg-red-400',     label: 'Holiday'                },
  working_override:    { bg: 'bg-orange-50',     text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-400', label: 'Working Day (Override)' },
};

const defaultForm = (): IHolidayPayload => ({
  name: '', date: '', holiday_type: 'public', day_type: 'holiday', description: '', is_active: true,
});
const isoToInput  = (iso: string) => iso?.split('T')[0] ?? '';

// ─────────────────────────────────────────────
// Key helper: which nth Saturday is this date?
// Returns 1–5 (or 0 if not a Saturday)
// ─────────────────────────────────────────────
function getNthSaturdayOfMonth(date: Date): number {
  if (date.getDay() !== 6) return 0;
  // Find the date of the 1st Saturday in the same month
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const daysUntilFirstSat = (6 - firstOfMonth.getDay() + 7) % 7;
  const firstSatDate = 1 + daysUntilFirstSat;
  return Math.floor((date.getDate() - firstSatDate) / 7) + 1;
}

// ─────────────────────────────────────────────
// Determine BASE day kind from work schedule only
// (ignores holiday entries / overrides entirely)
// ─────────────────────────────────────────────
function getDayKind(date: Date, workSchedule: IWorkSchedule | null): DayKind {
  const dow = date.getDay(); // 0=Sun … 6=Sat

  if (dow === 0) {
    // Sunday — working only if explicitly set
    return workSchedule?.schedule?.sunday ? 'working' : 'weekend';
  }

  if (dow === 6) {
    // Saturday — check which week
    const nth    = getNthSaturdayOfMonth(date);          // 1–5
    const key    = `saturday_week_${nth}` as keyof typeof workSchedule.schedule;
    const isWork = workSchedule ? !!workSchedule.schedule[key] : false;
    return isWork ? 'working_saturday' : 'non_working_saturday';
  }

  // Mon–Fri
  const dayNames = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const key = dayNames[dow] as keyof typeof workSchedule.schedule;
  const isWork = workSchedule ? !!workSchedule.schedule[key] : true; // default working
  return isWork ? 'working' : 'weekend';
}

// ─────────────────────────────────────────────
// Determine EFFECTIVE day kind, factoring in any
// holiday/override entries for that date
// ─────────────────────────────────────────────
function getEffectiveDayKind(
  date: Date,
  entriesForDate: IHoliday[],
  calendarDay: ICalendarDay | undefined,
  workSchedule: IWorkSchedule | null,
): DayKind {
  const activeEntry = entriesForDate.find(h => h.is_active !== false) ?? entriesForDate[0];

  if (activeEntry) {
    return activeEntry.day_type === 'working' ? 'working_override' : 'holiday';
  }
  if (calendarDay?.status === 'holiday') return 'holiday';
  return getDayKind(date, workSchedule);
}

// ─────────────────────────────────────────────
// Work Location Schedule Card
function WorkLocationCard({ wls }: { wls: IWorkLocationSchedule }) {
  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', ];
  const dayLabels = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', };

  // Add null check for schedule
  if (!wls || !wls.schedule) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
          <MapPin size={14} className="text-purple-700" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-800">Work Location Schedule</p>
          <p className="text-[10px] text-slate-400">Office vs Work from Home</p>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-2">
        {dayOrder.map(day => {
          const location = wls.schedule[day as keyof typeof wls.schedule];
          const meta = LOCATION_META[location as keyof typeof LOCATION_META] || LOCATION_META.office;
          const IconComponent = meta.icon;
          
          return (
            <div key={day} className={`text-center py-2 rounded-lg ${meta.bg} ${meta.border} border`}>
              <div className="flex flex-col items-center gap-1">
                <IconComponent size={12} className={meta.color} />
                <span className="text-[9px] font-semibold text-slate-600">
                  {dayLabels[day as keyof typeof dayLabels]}
                </span>
                <span className={`text-[8px] font-bold ${meta.color}`}>
                  {meta.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Building size={10} className="text-blue-600" />
          <span className="text-[10px] font-medium text-slate-600">
            {Object.values(wls.schedule).filter(loc => loc === 'office').length} Office days
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Home size={10} className="text-green-600" />
          <span className="text-[10px] font-medium text-slate-600">
            {Object.values(wls.schedule).filter(loc => loc === 'wfh').length} WFH days
          </span>
        </div>
      </div>
    </div>
  );
}

// Work schedule info card
// ─────────────────────────────────────────────
function WorkScheduleCard({ ws }: { ws: IWorkSchedule }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
          <Building size={14} className="text-teal-700" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-800">{ws.name}</p>
          {ws.description && <p className="text-[10px] text-slate-400">{ws.description}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Working days</p>
          <div className="flex flex-wrap gap-1">
            {ws.working_days.map(d => (
              <span key={d} className="text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full">{d}</span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Off days</p>
          <div className="flex flex-wrap gap-1">
            {ws.non_working_days.map(d => (
              <span key={d} className="text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded-full">{d}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Saturday week breakdown */}
      <div className="mt-3 pt-3 border-t border-slate-50">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Saturday schedule</p>
        <div className="grid grid-cols-5 gap-1">
          {[1,2,3,4,5].map(n => {
            const key = `saturday_week_${n}` as keyof typeof ws.schedule;
            const isWork = !!ws.schedule[key];
            return (
              <div key={n} className={`text-center py-1.5 rounded-lg text-[9px] font-bold ${isWork ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                <div>{n}{n===1?'st':n===2?'nd':n===3?'rd':'th'}</div>
                <div>{isWork ? 'ON' : 'OFF'}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Day cell
// ─────────────────────────────────────────────
function DayCell({
  day, iso, holidays, calendarDay, isToday,
  onDayClick, onEdit, onConfirmDelete, deletingId, colIndex, workSchedule, workLocationSchedule,
  viewOnly, attendance,
}: {
  day: number; iso: string; holidays: IHoliday[]; calendarDay?: ICalendarDay; isToday: boolean;
  onDayClick: (iso: string) => void;
  onEdit: (h: IHoliday) => void;
  onConfirmDelete: (id: string, name: string) => void;
  deletingId: string | null;
  colIndex: number;
  workSchedule: IWorkSchedule | null;
  workLocationSchedule?: IWorkLocationSchedule | null;
  viewOnly?: boolean;
  attendance?: IAttendanceLog;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dateObj = new Date(iso + 'T00:00:00'); // local midnight, avoid UTC shift
  const h = holidays[0];
  const entryMeta = h ? getEntryMeta(h) : null;

  // Determine effective background kind (factors in day_type overrides)
  const dayKind: DayKind = getEffectiveDayKind(dateObj, holidays, calendarDay, workSchedule);

  const kindMeta = DAY_KIND_META[dayKind];
  const isOverride = calendarDay?.is_override ?? false;
  const flipLeft = colIndex >= 5;

  const keep  = () => { if (closeTimer.current) clearTimeout(closeTimer.current); };
  const leave = () => { closeTimer.current = setTimeout(() => setOpen(false), 150); };

  // Nth saturday info for tooltip
  const satNth = dateObj.getDay() === 6 ? getNthSaturdayOfMonth(dateObj) : 0;
  
  // Get work location for this day
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[dateObj.getDay()];
  const workLocation = workLocationSchedule ? getWorkLocation(dayName, workLocationSchedule) : null;
  const locationMeta = workLocation ? LOCATION_META[workLocation] : null;

  return (
    <div className="relative" onMouseEnter={() => { keep(); setOpen(true); }} onMouseLeave={leave}>
      {/* Day box */}
      <div className={`w-full aspect-square flex flex-col items-center justify-center rounded-lg text-[10px] font-semibold border cursor-default select-none transition-all relative
        ${kindMeta.bg} ${kindMeta.text} ${kindMeta.border}
        ${open ? (entryMeta ? `ring-2 ${entryMeta.ringColor}` : 'ring-2 ring-teal-300') : ''}
        ${isToday ? 'ring-2 ring-[#0f766e] ring-offset-1 font-bold' : ''}`}>
        <span>{day}</span>

        {/* Status dot */}
        <div className={`w-1 h-1 rounded-full mt-0.5 ${kindMeta.dot}`} />
        
        {/* Work location indicator */}
        {workLocation && locationMeta && (
          <div className="absolute bottom-0.5 right-0.5">
            <locationMeta.icon size={8} className={`${locationMeta.color} opacity-70`} />
          </div>
        )}

        {/* Multiple entries count */}
        {holidays.length > 1 && (
          <span className="absolute top-0.5 right-0.5 w-[9px] h-[9px] rounded-full bg-white/90 text-[6px] font-bold text-gray-600 flex items-center justify-center shadow-sm">
            {holidays.length}
          </span>
        )}

        {/* Override indicator dot (from API calendar override, separate from day_type) */}
        {isOverride && <span className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full bg-orange-400" />}
      </div>

      {/* Hover card */}
      {open && (
        <div onMouseEnter={keep} onMouseLeave={leave}
          className={`absolute top-full z-50 w-56 mt-1 ${flipLeft ? 'right-0' : 'left-0'}`}>
          <div className={`bg-white rounded-2xl shadow-2xl border ${entryMeta ? entryMeta.border : 'border-slate-200'} p-3 space-y-2.5`}>

            {/* Day kind info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${kindMeta.dot}`} />
                <span className="text-[11px] font-bold text-slate-700">{kindMeta.label}</span>
              </div>
              <div className="flex items-center gap-1">
                {satNth > 0 && (
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${dayKind === 'working_saturday' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {satNth}{satNth===1?'st':satNth===2?'nd':satNth===3?'rd':'th'} Sat
                  </span>
                )}
                {workLocation && locationMeta && (
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${locationMeta.bg} ${locationMeta.color} flex items-center gap-1`}>
                    <locationMeta.icon size={8} />
                    {locationMeta.label}
                  </span>
                )}
                {isOverride && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-600">Override</span>
                )}
              </div>
            </div>

            {/* Calendar day extra info */}
            {calendarDay?.reason && (
              <p className="text-[10px] text-slate-400 border-t border-slate-50 pt-2">{calendarDay.reason}</p>
            )}
            {(calendarDay?.holiday_name || calendarDay?.override_name) && (
              <p className="text-[10px] font-semibold text-slate-600">{calendarDay.holiday_name || calendarDay.override_name}</p>
            )}

            {/* Entry rows (holidays + working-day overrides) */}
            {holidays.map((hh, idx) => {
              const m = getEntryMeta(hh);
              const isWorking = hh.day_type === 'working';
              return (
                <div key={hh.id} className={`${idx > 0 ? 'pt-2 border-t border-slate-100' : 'border-t border-slate-100 pt-2'}`}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${m.dot}`} />
                    <p className={`text-[11px] font-bold ${m.text} truncate`}>{hh.name}</p>
                    <span className={`ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${m.bg} ${m.text} flex-shrink-0`}>
                      {isWorking ? 'Working Day' : TYPE_META[hh.holiday_type].label}
                    </span>
                  </div>
                  {hh.description && <p className="text-[9px] text-slate-400 mb-2">{hh.description}</p>}
                  {!viewOnly && (
                    <div className="flex gap-1.5">
                      <button onClick={() => { setOpen(false); onEdit(hh); }}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors">
                        <Pencil size={9} /> Edit
                      </button>
                      <button onClick={() => { setOpen(false); onConfirmDelete(hh.id, hh.name); }}
                        disabled={deletingId === hh.id}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50">
                        {deletingId === hh.id ? <Loader2 size={9} className="animate-spin" /> : <><Trash2 size={9} /> Del</>}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {viewOnly && attendance && (() => {
              const status = attendance.is_regularized ? 'regularized' : attendance.is_late ? 'late' : attendance.attendance_status;
              const am = ATTENDANCE_META[status] ?? ATTENDANCE_META['absent'];
              return (
                <div className="border-t border-slate-100 pt-2 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${am.dot}`} />
                    <span className={`text-[10px] font-bold ${am.text}`}>{am.label}</span>
                    {attendance.is_late && <span className="ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700">Late {attendance.late_by_minutes}m</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[9px] text-slate-500">
                    <span>In: <span className="font-semibold text-slate-700">{fmtTime(attendance.check_in_time)}</span></span>
                    <span>Out: <span className="font-semibold text-slate-700">{fmtTime(attendance.check_out_time)}</span></span>
                  </div>
                  {attendance.total_worked_hours && <p className="text-[9px] text-slate-400">{attendance.total_worked_hours} hrs worked</p>}
                </div>
              );
            })()}
            {!viewOnly && !h && (
              <button onClick={() => { setOpen(false); onDayClick(iso); }}
                className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors border-t border-slate-100 pt-2.5 mt-0.5">
                <Plus size={9} /> Add Entry
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Mini month grid
// ─────────────────────────────────────────────
function MiniMonth({
  year, monthIdx, byDate, calendarData, filterType,
  onDayClick, onEdit, onConfirmDelete, deletingId, workSchedule, workLocationSchedule,
  viewOnly, attendanceByDate,
}: {
  year: number; monthIdx: number; byDate: Record<string, IHoliday[]>;
  calendarData?: IMonthlyCalendar;
  filterType: HolidayType | 'all';
  onDayClick: (iso: string) => void;
  onEdit: (h: IHoliday) => void;
  onConfirmDelete: (id: string, name: string) => void;
  deletingId: string | null;
  workSchedule: IWorkSchedule | null;
  workLocationSchedule?: IWorkLocationSchedule | null;
  viewOnly?: boolean;
  attendanceByDate?: Record<string, IAttendanceLog>;
}) {
  const today      = new Date();
  const firstDow   = new Date(year, monthIdx, 1).getDay();
  const totalDays  = new Date(year, monthIdx + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDow).fill(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const calendarByDate = useMemo(() => {
    if (!calendarData) return {} as Record<string, ICalendarDay>;
    return Object.fromEntries(calendarData.days.map(d => [d.date, d]));
  }, [calendarData]);

  // Month summary counts
  const summary = useMemo(() => {
    let holidaysCount = 0, workOverridesCount = 0, workingDays = 0, offDays = 0, workSats = 0, offSats = 0;
    for (let d = 1; d <= totalDays; d++) {
      const iso     = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hs      = byDate[iso] ?? [];
      const calDay  = calendarByDate[iso];
      const dateObj = new Date(iso + 'T00:00:00');

      // Holiday-type filter, but always keep working-day overrides regardless of filter
      const filteredEntries = filterType === 'all'
        ? hs
        : hs.filter(h => h.holiday_type === filterType || h.day_type === 'working');

      const kind = getEffectiveDayKind(dateObj, filteredEntries, calDay, workSchedule);

      if (filteredEntries.some(h => h.day_type !== 'working')) holidaysCount++;
      if (filteredEntries.some(h => h.day_type === 'working')) workOverridesCount++;

      if (kind === 'working' || kind === 'working_override') workingDays++;
      if (kind === 'working_saturday') { workingDays++; workSats++; }
      if (kind === 'non_working_saturday') offSats++;
      if (kind === 'weekend') offDays++;
    }
    return { holidays: holidaysCount, workOverrides: workOverridesCount, workingDays, offDays, workSats, offSats };
  }, [byDate, calendarByDate, year, monthIdx, totalDays, filterType, workSchedule]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible">
      {/* Month header */}
      <div className="px-3 py-2.5 bg-gradient-to-r from-slate-50 to-white rounded-t-2xl border-b border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-[#0f1f2e] uppercase tracking-wider">{MONTH_FULL[monthIdx]}</span>
          <div className="flex items-center gap-1">
            {viewOnly && attendanceByDate ? (() => {
              let p = 0, a = 0, l = 0;
              for (let d = 1; d <= totalDays; d++) {
                const iso = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const att = attendanceByDate[iso];
                if (!att) continue;
                const s = att.is_regularized ? 'regularized' : att.is_late ? 'late' : att.attendance_status;
                if (s === 'on_leave') l++; else if (s === 'absent') a++; else p++;
              }
              return (<>
                {p > 0 && <span className="text-[9px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-100">{p}P</span>}
                {l > 0 && <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100">{l}L</span>}
                {a > 0 && <span className="text-[9px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-100">{a}A</span>}
              </>);
            })() : (<>
              {summary.holidays > 0 && (
                <span className="text-[9px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-full border border-teal-100">
                  {summary.holidays} holiday{summary.holidays > 1 ? 's' : ''}
                </span>
              )}
              {summary.workOverrides > 0 && (
                <span className="text-[9px] font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded-full border border-orange-100">
                  {summary.workOverrides} override{summary.workOverrides > 1 ? 's' : ''}
                </span>
              )}
            </>)}
          </div>
        </div>
        {/* Working/off summary */}
        <div className="flex items-center gap-2 text-[9px] text-gray-400">
          <span title="Working days" className="flex items-center gap-0.5"><Briefcase size={8} className="text-emerald-500" /> {summary.workingDays}W</span>
          <span title="Off days" className="flex items-center gap-0.5"><Sun size={8} className="text-slate-400" /> {summary.offDays}O</span>
          {summary.workSats > 0 && (
            <span title="Working Saturdays" className="flex items-center gap-0.5 text-emerald-600 font-semibold">
              {summary.workSats}S↑
            </span>
          )}
          {summary.offSats > 0 && (
            <span title="Off Saturdays" className="flex items-center gap-0.5 text-slate-400 font-semibold">
              {summary.offSats}S↓
            </span>
          )}
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 px-2 pt-2">
        {DAYS_SHORT.map((d, i) => (
          <div key={i} className="text-center text-[8px] font-bold text-gray-300 pb-1">{d}</div>
        ))}
      </div>

      {/* Day cells — overflow-visible so hover cards bleed out */}
      <div className="grid grid-cols-7 gap-0.5 px-2 pb-2.5 overflow-visible">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const iso = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const allH      = byDate[iso] ?? [];
          // Keep working-day overrides visible regardless of holiday-type filter
          const filtered  = filterType === 'all'
            ? allH
            : allH.filter(h => h.holiday_type === filterType || h.day_type === 'working');
          const calDay    = calendarByDate[iso];
          const isToday   = today.getFullYear() === year && today.getMonth() === monthIdx && today.getDate() === day;

          return (
            <DayCell
              key={i}
              day={day}
              iso={iso}
              holidays={filtered}
              calendarDay={calDay}
              isToday={isToday}
              onDayClick={onDayClick}
              onEdit={onEdit}
              onConfirmDelete={onConfirmDelete}
              deletingId={deletingId}
              colIndex={i % 7}
              workSchedule={workSchedule}
              workLocationSchedule={workLocationSchedule}
              viewOnly={viewOnly}
              attendance={attendanceByDate?.[iso]}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
export interface IAttendanceLog {
  id: string;
  attendance_date: string;
  attendance_status: string;
  check_in_time: string | null;
  check_out_time: string | null;
  total_worked_hours: string | null;
  is_late: boolean;
  late_by_minutes: number;
  is_regularized: boolean;
  remarks: string | null;
  shift_name?: string | null;
}

const ATTENDANCE_META: Record<string, { label: string; dot: string; text: string; bg: string; ring: string }> = {
  present:     { label: 'Present',     dot: 'bg-green-500',   text: 'text-green-700',   bg: 'bg-green-50',   ring: 'ring-green-400'   },
  late:        { label: 'Late',        dot: 'bg-amber-500',   text: 'text-amber-700',   bg: 'bg-amber-50',   ring: 'ring-amber-400'   },
  on_leave:    { label: 'Leave',       dot: 'bg-blue-500',    text: 'text-blue-700',    bg: 'bg-blue-50',    ring: 'ring-blue-400'    },
  absent:      { label: 'Absent',      dot: 'bg-red-500',     text: 'text-red-700',     bg: 'bg-red-50',     ring: 'ring-red-400'     },
  regularized: { label: 'Regularized', dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', ring: 'ring-emerald-400' },
};

function fmtTime(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function HolidaysTab({
  viewOnly = false,
  attendanceByDate,
  onYearChange,
}: {
  viewOnly?: boolean;
  attendanceByDate?: Record<string, IAttendanceLog>;
  onYearChange?: (year: number) => void;
} = {}) {
  const params    = useParams();
  const subdomain = params?.subdomain as string;

  const currentYear = new Date().getFullYear();
  const [year,        setYear]        = useState(currentYear);
  const [filterType,  setFilterType]  = useState<HolidayType | 'all'>('all');
  const [holidays,    setHolidays]    = useState<IHoliday[]>([]);
  const [calendarData, setCalendarData] = useState<IMonthlyCalendar[]>([]);
  const [workSchedule, setWorkSchedule] = useState<IWorkSchedule | null>(null);
  const [workLocationSchedule, setWorkLocationSchedule] = useState<IWorkLocationSchedule | null>(null);
  const [showLocationSchedule, setShowLocationSchedule] = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [deletingId,  setDeletingId]  = useState<string | null>(null);

  const [showModal,   setShowModal]   = useState(false);
  const [editingId,   setEditingId]   = useState<string | null>(null);
  const [form,        setFormState]   = useState<IHolidayPayload>(defaultForm());
  const [saving,      setSaving]      = useState(false);
  const [modalError,  setModalError]  = useState<string | null>(null);

  const [showImport,  setShowImport]  = useState(false);
  const [importIds,   setImportIds]   = useState('');
  const [importing,   setImporting]   = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const [confirmDeleteId,   setConfirmDeleteId]   = useState<string | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState('');

  useEffect(() => {
    if (subdomain) {
      setLoading(true);
      Promise.all([
        fetchHolidays(),
        fetchCalendarData(),
        fetchWorkSchedule(),
        fetchWorkLocationSchedule(),
      ]).finally(() => setLoading(false));
    }
  }, [subdomain, year]);

  const fetchWorkLocationSchedule = async () => {
    try {
      const res = await getWorkLocationSchedule(subdomain);
      console.log('Work location schedule response:', res);
      // The response structure is { success: true, data: { schedule: {...}, formatted_schedule: [...] } }
      // But our axios wrapper returns { data: responseData }
      const locationData = res?.data?.data || res?.data;
      console.log('Extracted location data:', locationData);
      setWorkLocationSchedule(locationData || null);
    } catch (error) {
      console.error('Error fetching work location schedule:', error);
      setWorkLocationSchedule(null);
    }
  };

  const fetchHolidays = async () => {
    try {
      const res  = await getHolidaysByYear(year, subdomain);
      const raw: IHoliday[] = Array.isArray(res?.data) ? res.data : (res?.data?.data ?? []);
      setHolidays(raw.filter(h => !h.is_deleted));
    } catch { /* silent */ }
  };

  const fetchCalendarData = async () => {
    try {
      const results = await Promise.all(
        Array.from({ length: 12 }, (_, i) => getMonthlyCalendar(year, i + 1, subdomain))
      );
      setCalendarData(results.map(r => r?.data).filter(Boolean) as IMonthlyCalendar[]);
    } catch { /* silent */ }
  };

  const fetchWorkSchedule = async () => {
    try {
      const res = await getWorkSchedule(subdomain);
      setWorkSchedule(res?.data || null);
    } catch { /* silent */ }
  };

  const byDate = useMemo(() => {
    const map: Record<string, IHoliday[]> = {};
    holidays.forEach(h => {
      const key = isoToInput(h.date);
      if (!map[key]) map[key] = [];
      map[key].push(h);
    });
    return map;
  }, [holidays]);

  // Year-level stats — factors in holiday entries AND working-day overrides
  const stats = useMemo(() => {
    let workingDays = 0, offDays = 0, workSats = 0, offSats = 0;
    const start = new Date(year, 0, 1);
    const end   = new Date(year, 11, 31);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const entries = byDate[iso] ?? [];
      const kind = getEffectiveDayKind(new Date(d), entries, undefined, workSchedule);

      if (kind === 'working' || kind === 'working_override') workingDays++;
      if (kind === 'working_saturday') { workingDays++; workSats++; }
      if (kind === 'non_working_saturday') offSats++;
      if (kind === 'weekend') offDays++;
    }

    const trueHolidays = holidays.filter(h => h.day_type !== 'working');
    const workOverrides = holidays.filter(h => h.day_type === 'working');

    return {
      total:      trueHolidays.length,
      public:     trueHolidays.filter(h => h.holiday_type === 'public').length,
      optional:   trueHolidays.filter(h => h.holiday_type === 'optional').length,
      restricted: trueHolidays.filter(h => h.holiday_type === 'restricted').length,
      workOverrides: workOverrides.length,
      workingDays,
      offDays,
      workSats,
      offSats,
    };
  }, [holidays, byDate, workSchedule, year]);

  const setField = (k: keyof IHolidayPayload, v: any) => setFormState(prev => ({ ...prev, [k]: v }));

  const openCreate = (date?: string) => {
    // Smart default: clicking a normally-off day suggests a "working day" override,
    // clicking a normally-working day suggests a "holiday".
    let defaultDayType: DayType = 'holiday';
    if (date) {
      const dateObj  = new Date(date + 'T00:00:00');
      const baseKind = getDayKind(dateObj, workSchedule);
      if (baseKind === 'weekend' || baseKind === 'non_working_saturday') {
        defaultDayType = 'working';
      }
    }
    setFormState({ ...defaultForm(), date: date ?? '', day_type: defaultDayType });
    setEditingId(null); setModalError(null); setShowModal(true);
  };

  const openEdit = (h: IHoliday) => {
    setFormState({
      name: h.name,
      date: isoToInput(h.date),
      holiday_type: h.holiday_type,
      day_type: h.day_type ?? 'holiday',
      description: h.description ?? '',
      is_active: h.is_active,
    });
    setEditingId(h.id); setModalError(null); setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setModalError('Name is required.'); return; }
    if (!form.date)        { setModalError('Date is required.'); return; }
    if (!form.day_type)    { setModalError('Day type is required.'); return; }
    if (!form.holiday_type) { setModalError('Holiday type is required.'); return; }
    
    // Create clean payload
    const payload: IHolidayPayload = {
      name: form.name.trim(),
      date: form.date,
      holiday_type: form.holiday_type,
      day_type: form.day_type,
      description: form.description?.trim() || '',
      is_active: form.is_active
    };
    
    console.log('Clean payload being sent:', payload);
    
    setSaving(true); setModalError(null);
    try {
      editingId ? await updateHoliday(editingId, payload, subdomain) : await createHoliday(payload, subdomain);
      setShowModal(false); fetchHolidays();
    } catch (e: any) {
      console.error('Save error:', e);
      console.error('Response data:', e?.response?.data);
      setModalError(e?.response?.data?.message || e?.response?.data?.error || 'Something went wrong.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteHoliday(id, subdomain);
      setHolidays(prev => prev.filter(h => h.id !== id));
    } catch { /* silent */ }
    finally { setDeletingId(null); setConfirmDeleteId(null); }
  };

  const handleBulkImport = async () => {
    const ids = importIds.split(',').map(s => s.trim()).filter(Boolean);
    if (!ids.length) { setImportError('Enter at least one holiday ID.'); return; }
    setImporting(true); setImportError(null);
    try {
      await bulkImportHolidays({ year, holiday_ids: ids }, subdomain);
      setShowImport(false); setImportIds(''); fetchHolidays();
    } catch (e: any) {
      setImportError(e?.response?.data?.message || 'Import failed.');
    } finally { setImporting(false); }
  };

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#0f1f2e]">Holiday & Work Calendar</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {stats.total} holidays · {stats.workOverrides} work overrides · {stats.workingDays} working days · {stats.workSats} working Sats
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Location Schedule Toggle */}
          {workLocationSchedule && (
            <div className="flex items-center gap-1 bg-purple-50 rounded-xl px-2 py-1">
              <button 
                onClick={() => setShowLocationSchedule(!showLocationSchedule)}
                className="flex items-center gap-1 p-1 rounded-lg hover:bg-purple-100 transition-colors text-purple-700"
                title={showLocationSchedule ? 'Hide work location schedule' : 'Show work location schedule'}
              >
                {showLocationSchedule ? <EyeOff size={12} /> : <Eye size={12} />}
                <MapPin size={12} />
              </button>
              <span className="text-[10px] font-medium text-purple-700">
                {showLocationSchedule ? 'Hide' : 'Show'} Locations
              </span>
            </div>
          )}
          {/* Year nav */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl px-2 py-1">
            <button onClick={() => { setYear(y => { const n = y - 1; onYearChange?.(n); return n; }); }} className="p-1 rounded-lg hover:bg-white transition-colors text-gray-500"><ChevronLeft size={13} /></button>
            <span className="text-xs font-bold text-[#0f1f2e] px-1 min-w-[36px] text-center">{year}</span>
            <button onClick={() => { setYear(y => { const n = y + 1; onYearChange?.(n); return n; }); }} className="p-1 rounded-lg hover:bg-white transition-colors text-gray-500"><ChevronRight size={13} /></button>
          </div>
          {/* Type filter */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {(['all', ...HOLIDAY_TYPES] as const).map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg transition-colors capitalize ${
                  filterType === t ? 'bg-white text-[#0f766e] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {t === 'all' ? 'All' : TYPE_META[t].label}
              </button>
            ))}
          </div>
          {!viewOnly && (<>
            <button onClick={() => { setImportIds(''); setImportError(null); setShowImport(true); }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0f766e] bg-[#e8f5ee] hover:bg-[#d4eddf] rounded-xl transition-colors">
              <Download size={13} /> Import
            </button>
            <button onClick={() => openCreate()}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#0f766e] hover:bg-[#0d6460] rounded-xl transition-colors">
              <Plus size={13} /> Add Entry
            </button>
          </>)}
        </div>
      </div>

      {/* ── Work Schedule Cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {workSchedule && <WorkScheduleCard ws={workSchedule} />}
        {workLocationSchedule && showLocationSchedule && (
          <WorkLocationCard wls={workLocationSchedule} />
        )}
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-9 gap-2">
        {([
          { label: 'Total Holidays',    value: stats.total,         color: 'text-teal-700',    bg: 'bg-teal-50',    icon: CalendarDays },
          { label: 'Public',            value: stats.public,        color: 'text-blue-700',    bg: 'bg-blue-50',    icon: Award        },
          { label: 'Optional',          value: stats.optional,      color: 'text-amber-700',   bg: 'bg-amber-50',   icon: Plus         },
          { label: 'Restricted',        value: stats.restricted,    color: 'text-purple-700',  bg: 'bg-purple-50',  icon: Shield       },
          { label: 'Work Overrides',    value: stats.workOverrides, color: 'text-orange-700',  bg: 'bg-orange-50',  icon: Repeat       },
          { label: 'Working Days',      value: stats.workingDays,   color: 'text-emerald-700', bg: 'bg-emerald-50', icon: Briefcase    },
          { label: 'Off Days',          value: stats.offDays,       color: 'text-slate-600',   bg: 'bg-slate-50',   icon: Sun          },
          { label: 'Working Saturdays', value: stats.workSats,      color: 'text-emerald-700', bg: 'bg-emerald-50', icon: Briefcase    },
          { label: 'Off Saturdays',     value: stats.offSats,       color: 'text-slate-500',   bg: 'bg-slate-50',   icon: Sun          },
        ] as const).map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 px-3 py-2.5 shadow-sm flex items-center gap-2">
              <div className={`w-7 h-7 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={13} className={s.color} />
              </div>
              <div className="min-w-0">
                <p className={`text-base font-bold leading-none ${s.color}`}>{s.value}</p>
                <p className="text-[9px] text-gray-400 mt-0.5 font-medium truncate">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center gap-3 px-1 flex-wrap">
        {HOLIDAY_TYPES.map(t => {
          const m = TYPE_META[t];
          return (
            <div key={t} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-sm ${m.bg} border ${m.border}`} />
              <span className="text-[10px] text-gray-500 font-medium">{m.label}</span>
            </div>
          );
        })}
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-orange-100 border border-orange-200" />
          <span className="text-[10px] text-gray-500 font-medium">Working Day (Override)</span>
        </div>
        {([
          { label: 'Working Sat',  dot: 'bg-emerald-400' },
          { label: 'Off Sat',      dot: 'bg-slate-200'   },
          { label: 'Today',        dot: 'bg-teal-600 ring-2 ring-teal-600' },
        ] as const).map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-sm ${l.dot}`} />
            <span className="text-[10px] text-gray-500 font-medium">{l.label}</span>
          </div>
        ))}
        <span className="text-[10px] text-gray-400 ml-auto hidden sm:block">{viewOnly ? 'Hover a day to see attendance details' : 'Hover a day to add / edit / delete entries'}</span>
      </div>

      {/* ── Year Grid ── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={22} className="animate-spin text-[#0f766e]" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }, (_, i) => (
            <MiniMonth
              key={i}
              year={year}
              monthIdx={i}
              byDate={byDate}
              calendarData={calendarData[i]}
              filterType={filterType}
              onDayClick={openCreate}
              onEdit={openEdit}
              onConfirmDelete={(id, name) => { setConfirmDeleteId(id); setConfirmDeleteName(name); }}
              deletingId={deletingId}
              workSchedule={workSchedule}
              workLocationSchedule={showLocationSchedule ? workLocationSchedule : null}
              viewOnly={viewOnly}
              attendanceByDate={attendanceByDate}
            />
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {!viewOnly && showModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
                  <CalendarDays size={15} className="text-teal-700" />
                </div>
                <h2 className="text-sm font-bold text-[#0f1f2e]">{editingId ? 'Edit Calendar Entry' : 'Add Calendar Entry'}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="overflow-y-auto p-5 space-y-4">

              {/* Entry type: Holiday vs Working Day Override */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Entry Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setField('day_type', 'holiday')}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-bold border transition-all ${
                      form.day_type === 'holiday'
                        ? 'bg-red-50 text-red-600 border-red-300'
                        : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300'
                    }`}>
                    <Sun size={16} />
                    Holiday (Day Off)
                  </button>
                  <button type="button" onClick={() => setField('day_type', 'working')}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-bold border transition-all ${
                      form.day_type === 'working'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300'
                    }`}>
                    <Briefcase size={16} />
                    Working Day (Override)
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5">
                  {form.day_type === 'working'
                    ? 'Use this to turn a normally off day (e.g. an off Saturday or Sunday) into a working day — like a compensatory working day.'
                    : 'Use this to mark a normally working day as a non-working holiday.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  {form.day_type === 'working' ? 'Title' : 'Holiday Name'} <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.name} onChange={e => setField('name', e.target.value)}
                  placeholder={form.day_type === 'working' ? 'e.g. Compensatory Working Day' : 'e.g. Independence Day'}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
              </div>

              <div className={form.day_type === 'working' ? '' : 'grid grid-cols-2 gap-3'}>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date <span className="text-red-500">*</span></label>
                  <input type="date" value={form.date} onChange={e => setField('date', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
                </div>

                {/* Holiday type — only relevant when this is an actual holiday */}
                {form.day_type !== 'working' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Type</label>
                    <div className="flex flex-col gap-1.5">
                      {HOLIDAY_TYPES.map(t => {
                        const m = TYPE_META[t];
                        return (
                          <button key={t} type="button" onClick={() => setField('holiday_type', t)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                              form.holiday_type === t ? `${m.bg} ${m.text} ${m.border}` : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                            <span className={`w-2 h-2 rounded-full ${form.holiday_type === t ? m.dot : 'bg-gray-300'}`} />
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setField('description', e.target.value)} rows={2}
                  placeholder={form.day_type === 'working' ? 'e.g. Compensating for Diwali holiday on 2nd Saturday' : 'Optional description…'}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none" />
              </div>

              <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="text-xs font-semibold text-gray-700">Active</p>
                  <p className="text-[10px] text-gray-400">
                    {form.day_type === 'working'
                      ? "Inactive overrides won't apply — the day reverts to its normal schedule"
                      : "Inactive holidays won't show to employees"}
                  </p>
                </div>
                <button type="button" onClick={() => setField('is_active', !form.is_active)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${form.is_active ? 'bg-teal-600' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              {modalError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-600 font-medium">{modalError}</p>
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="button" onClick={handleSave} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0f766e] rounded-xl hover:bg-[#0d6460] transition-colors disabled:opacity-60">
                  {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : editingId ? 'Update Entry' : 'Add Entry'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {!viewOnly && confirmDeleteId && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                <Trash2 size={20} className="text-red-500" />
              </div>
              <h3 className="text-sm font-bold text-[#0f1f2e] mb-1">Delete Entry</h3>
              <p className="text-xs text-gray-400 mb-1">Are you sure you want to delete</p>
              <p className="text-sm font-semibold text-[#0f1f2e] mb-5">"{confirmDeleteName}"?</p>
              <div className="flex gap-3 w-full">
                <button type="button" onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="button" onClick={() => handleDelete(confirmDeleteId)} disabled={deletingId === confirmDeleteId}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-60">
                  {deletingId === confirmDeleteId ? <><Loader2 size={14} className="animate-spin" /> Deleting…</> : <><Trash2 size={14} /> Delete</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Import ── */}
      {!viewOnly && showImport && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
                  <Download size={15} className="text-teal-700" />
                </div>
                <h2 className="text-sm font-bold text-[#0f1f2e]">Bulk Import Holidays</h2>
              </div>
              <button onClick={() => setShowImport(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Holiday IDs <span className="text-red-500">*</span></label>
                <textarea value={importIds} onChange={e => setImportIds(e.target.value)} rows={3}
                  placeholder="Paste comma-separated holiday IDs…"
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none" />
                <p className="text-[10px] text-gray-400 mt-1">Importing into year <span className="font-semibold text-teal-700">{year}</span></p>
              </div>
              {importError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-600 font-medium">{importError}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowImport(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="button" onClick={handleBulkImport} disabled={importing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0f766e] rounded-xl hover:bg-[#0d6460] transition-colors disabled:opacity-60">
                  {importing ? <><Loader2 size={14} className="animate-spin" /> Importing…</> : 'Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}