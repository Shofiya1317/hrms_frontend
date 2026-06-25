'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Clock, LogIn, LogOut, Calendar, CalendarDays, CalendarRange, X, RotateCcw } from 'lucide-react';
import { getAttendanceLogs, IAttendanceLogEntry, IAttendanceLogFilters } from '@/lib/service/attendance';

const BADGE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  green:  { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  red:    { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  yellow: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  orange: { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
  blue:   { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  purple: { bg: '#f5f3ff', color: '#7c3aed', border: '#e9d5ff' },
  gray:   { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
};

function fmtMinutes(mins: number): string {
  if (!mins) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}

const DEFAULT_VIEW = 'month';

const VIEW_OPTIONS = [
  { label: 'This Week',      value: 'week',       icon: '📅' },
  { label: 'Prev Week',      value: 'prev_week',  icon: '⬅️' },
  { label: 'This Month',     value: 'month',      icon: '🗓️' },
  // { label: 'Prev Month',     value: 'prev_month', icon: '📆' },
  { label: 'Custom Range',   value: 'custom',     icon: '✂️' },
  { label: 'Last N Days',    value: 'limit',      icon: '🔢' },
];

const ATTENDANCE_TYPES = new Set(['attendance', 'present', 'absent', 'half_day', 'late']);

function Badge({ badge, badge_color }: { badge?: string; badge_color?: string }) {
  const c = BADGE_COLORS[badge_color ?? 'gray'] ?? BADGE_COLORS.gray;
  return (
    <span style={{
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      {badge ?? '—'}
    </span>
  );
}

export default function MonthlyView({
  employeeId, apiKey, token,
}: {
  employeeId?: string; apiKey?: string; token?: string;
}) {
  const params = useParams();
  const subdomain = (apiKey ?? params?.subdomain) as string;

  const [view, setView] = useState<string>(DEFAULT_VIEW);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [limit, setLimit] = useState(10);
  const [logs, setLogs] = useState<IAttendanceLogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const isFiltered = view !== DEFAULT_VIEW;

  const fetchLogs = async (overrideView?: string) => {
    if (!employeeId || !subdomain) return;
    setLoading(true);
    const v = overrideView ?? view;
    const filterParams: IAttendanceLogFilters = { employee_id: employeeId };
    if (v === 'custom') {
      if (startDate) filterParams.start_date = startDate;
      if (endDate) filterParams.end_date = endDate;
    } else if (v === 'limit') {
      filterParams.limit = limit;
    } else {
      filterParams.view = v as IAttendanceLogFilters['view'];
    }
    try {
      const res = await getAttendanceLogs(subdomain, filterParams, token);
      const d = res?.data;
      const raw = Array.isArray(d) ? d : (Array.isArray(d?.data?.logs) ? d.data.logs : (Array.isArray(d?.data) ? d.data : (Array.isArray(d?.logs) ? d.logs : [])));
      setLogs(raw);
    } catch { setLogs([]); } finally { setLoading(false); }
  };

  const handleClear = () => {
    setView(DEFAULT_VIEW);
    setStartDate('');
    setEndDate('');
    setLimit(10);
    fetchLogs(DEFAULT_VIEW);
  };

  useEffect(() => { fetchLogs(); }, [employeeId, subdomain, view]);

  return (
    <div style={{ padding: '24px', fontFamily: 'inherit' }}>

      {/* ── Filter Pills ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {VIEW_OPTIONS.map((o) => {
            const active = view === o.value;
            return (
              <button
                key={o.value}
                onClick={() => setView(o.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: active ? 600 : 400,
                  cursor: 'pointer', transition: 'all 0.15s',
                  border: active ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
                  background: active ? '#eff6ff' : '#fff',
                  color: active ? '#2563eb' : '#475569',
                }}
              >
                <span style={{ fontSize: 14 }}>{o.icon}</span>
                {o.label}
              </button>
            );
          })}

          {isFiltered && (
            <button
              onClick={handleClear}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', border: '1.5px solid #fecaca',
                background: '#fef2f2', color: '#dc2626',
              }}
            >
              <RotateCcw size={13} />
              Clear
            </button>
          )}
        </div>

        {/* Custom range inputs */}
        {view === 'custom' && (
          <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px' }}>
              <CalendarDays size={14} style={{ color: '#64748b' }} />
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                style={{ border: 'none', background: 'transparent', fontSize: 13, outline: 'none', color: '#1e293b' }} />
            </div>
            <span style={{ color: '#94a3b8', fontSize: 13 }}>→</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px' }}>
              <CalendarRange size={14} style={{ color: '#64748b' }} />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                style={{ border: 'none', background: 'transparent', fontSize: 13, outline: 'none', color: '#1e293b' }} />
            </div>
            <button onClick={() => fetchLogs()}
              style={{ padding: '6px 16px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              Apply
            </button>
          </div>
        )}

        {/* Last N Days input */}
        {view === 'limit' && (
          <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px' }}>
              <span style={{ fontSize: 13, color: '#64748b' }}>Last</span>
              <input type="number" min={1} max={365} value={limit} onChange={(e) => setLimit(Number(e.target.value))}
                style={{ border: 'none', background: 'transparent', fontSize: 13, outline: 'none', width: 50, color: '#1e293b' }} />
              <span style={{ fontSize: 13, color: '#64748b' }}>days</span>
            </div>
            <button onClick={() => fetchLogs()}
              style={{ padding: '6px 16px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              Apply
            </button>
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <div style={{ borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['Date', 'Day', 'Status', 'Check In', 'Check Out', 'Working Hours', 'Late By'].map((h) => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No records found</td></tr>
            ) : logs.map((log, i) => {
              const isAttendance = ATTENDANCE_TYPES.has(log.type ?? '');
              const rowBg = i % 2 === 0 ? '#fff' : '#fafafa';

              if (!isAttendance) {
                // Week off / holiday — single badge row, no empty columns
                return (
                  <tr key={log.date} style={{ borderBottom: '1px solid #f1f5f9', background: rowBg }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500, color: '#1e293b', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={14} style={{ color: '#94a3b8' }} />
                        {log.display_date ?? log.date}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: 12 }}>
                      {log.day_full ?? '—'}
                    </td>
                    <td colSpan={5} style={{ padding: '12px 16px' }}>
                      <Badge badge={log.badge} badge_color={log.badge_color} />
                    </td>
                  </tr>
                );
              }

              // Attendance row — show full details
              return (
                <tr key={log.date} style={{ borderBottom: '1px solid #f1f5f9', background: rowBg }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500, color: '#1e293b', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={14} style={{ color: '#94a3b8' }} />
                      {log.display_date ?? log.date}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569', fontSize: 12 }}>
                    {log.day_full ?? '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <Badge badge={log.badge} badge_color={log.badge_color} />
                      {log.holiday_info?.holiday_name && (
                        <Badge badge={log.holiday_info.holiday_name} badge_color="purple" />
                      )}
                      {log.is_regularized && <Badge badge="Regularized" badge_color="blue" />}
                      {log.is_wfh && <Badge badge="WFH" badge_color="blue" />}
                      {log.is_on_duty && <Badge badge="On Duty" badge_color="yellow" />}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569', whiteSpace: 'nowrap' }}>
                    {log.check_in ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <LogIn size={13} style={{ color: '#16a34a' }} />{log.check_in}
                      </span>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569', whiteSpace: 'nowrap' }}>
                    {log.check_out ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <LogOut size={13} style={{ color: '#dc2626' }} />{log.check_out}
                      </span>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    {log.working_hours ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#2563eb', fontWeight: 500 }}>
                        <Clock size={13} />{log.working_hours}
                      </span>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {log.is_late ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>
                        ⏰ {fmtMinutes(log.late_by_minutes ?? 0)}
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>
                        ✓ On Time
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {logs.length > 0 && (
        <div style={{ marginTop: 12, fontSize: 12, color: '#94a3b8' }}>
          Showing {logs.length} record{logs.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
