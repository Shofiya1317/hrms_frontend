'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { getAttendances } from '@/lib/service/attendance';
import HolidaysTab, { IAttendanceLog } from '@/components/AdminPortal/AdminAttendance/AttendanceLeave/HolidaysTab';

export default function MonthlyView({ employeeId }: { employeeId?: string }) {
  const params = useParams();
  const subdomain = params?.subdomain as string;

  const [year, setYear] = useState(new Date().getFullYear());
  const [logs, setLogs] = useState<IAttendanceLog[]>([]);

  useEffect(() => {
    if (!subdomain || !employeeId) return;
    getAttendances(subdomain, {
      from_date: `${year}-01-01`,
      to_date: `${year}-12-31`,
      employee_id: employeeId,
      limit: 500,
    })
      .then((res) => {
        const raw = Array.isArray(res?.data) ? res.data : (res?.data?.data ?? []);
        setLogs(raw);
      })
      .catch(() => setLogs([]));
  }, [subdomain, year, employeeId]);

  const attendanceByDate = useMemo(() => {
    const map: Record<string, IAttendanceLog> = {};
    logs.forEach((l) => { map[l.attendance_date] = l; });
    return map;
  }, [logs]);

  return (
    <HolidaysTab
      viewOnly
      attendanceByDate={attendanceByDate}
      onYearChange={setYear}
    />
  );
}
