import { get } from '../axiosInstance';

// ─── Admin Stats ────────────────────────────────────────────────────────────

export interface IAdminStats {
  total_employees: number;
  present_today: number;
  absent_today: number;
  on_leave: number;
  late_check_ins: number;
  work_from_home: number;
  not_checked_in_yet: number;
  attendance_percentage: number;
  as_of: string;
}

export const getAdminStats = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/attendance/dashboard/admin-stats',
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

// ─── Weekly Chart ────────────────────────────────────────────────────────────

export interface IWeeklyChartDay {
  date: string;
  day: string;
  display_date: string;
  present_count: number;
  absent_count: number;
  not_marked: number;
  attendance_percentage: number;
  variance_vs_prev_day: number | null;
  variance_direction: 'up' | 'down' | null;
}

export interface IWeeklyChartBestWorstDay {
  day: string;
  date: string;
  percentage: number;
}

export interface IAdminWeeklyChart {
  total_employees: number;
  period: string;
  avg_attendance_percentage: number;
  best_day: IWeeklyChartBestWorstDay;
  worst_day: IWeeklyChartBestWorstDay;
  chart: IWeeklyChartDay[];
}

export const getAdminWeeklyChart = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/attendance/dashboard/admin-weekly-chart',
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

// ─── Department Stats ────────────────────────────────────────────────────────

export type DepartmentStatsMode = 'today' | 'monthly';

export interface IDepartmentStatParams {
  mode?: DepartmentStatsMode;
  year?: number;
  month?: number;
}

export interface IDepartmentStat {
  department_id: string;
  department_name: string;
  total_employees: number;
  present: number;
  absent: number;
  not_marked: number;
  attendance_percentage: number;
}

export interface IDepartmentStatsBestWorst {
  name: string;
  percentage: number;
}

export interface IDepartmentStatsResponse {
  mode: DepartmentStatsMode;
  period: string;
  best_department: IDepartmentStatsBestWorst;
  worst_department: IDepartmentStatsBestWorst;
  departments: IDepartmentStat[];
}

export const getDepartmentStats = (
  tenantId: string,
  params?: IDepartmentStatParams,
  token?: string,
) => get(
  '/v1/attendance/dashboard/department-stats',
  params,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);