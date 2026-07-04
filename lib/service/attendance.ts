import {
  get, post, put, deleteRequest,
} from '../axiosInstance';
import { Params } from '../utils';

export interface ICheckInPayload {
  attendance_date: string;
  // shift_id?: string;
  check_in_time: string;
  check_in_lat?: number;
  check_in_lng?: number;
  check_in_location_name?: string;
  // check_in_method?: string;
  // check_in_within_geofence?: boolean;
  // check_in_distance_meters?: number;
  // check_in_device_info?: string;
  // check_in_photo_url?: string;
}

export interface ICheckOutPayload {
  check_out_time: string;
  check_out_lat?: number;
  check_out_lng?: number;
  check_out_location_name?: string;
  check_out_method?: string;
  check_out_within_geofence?: boolean;
  check_out_distance_meters?: number;
  check_out_photo_url?: string;
}

export interface IAttendancePayload {
  employee_id: string;
  date: string;
  check_in: string;
  check_out: string;
  status: string;
  remarks?: string;
}

export const createAttendance = (
  body: IAttendancePayload,
  tenantId: string,
  token?: string,
) => post(
  '/api/v1/attendance',
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export interface IAttendanceFilters {
  page?: number;
  limit?: number;
  from_date?: string;
  to_date?: string;
  employee_id?: string;
  attendance_status?: 'present' | 'absent' | 'half_day' | 'holiday' | 'weekend' | 'on_leave';
  day_type?: 'working_day' | 'week_off' | 'company_holiday' | 'public_holiday' | 'optional_holiday';
  is_late?: boolean;
  attendance_date?: string;
}

export const getAttendances = (
  tenantId: string,
  params?: IAttendanceFilters,
  token?: string,
) => get(
  '/v1/attendance',
  params as Params,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export interface IEmployeeAttendanceDashboard {
  today: {
    status: string;
    check_in: string | null;
    check_out: string | null;
    worked_minutes: number;
    is_late: boolean;
    late_by_minutes: number;
    timeline: Array<{
      type: 'check_in' | 'check_out' | 'break_start' | 'break_end';
      time: string;
      location?: string;
    }>;
  };

  week_summary: Array<{
    date: string;
    day: string;
    status: string;
    hours: string;
  }>;

  week_progress: number;

  week_stats: {
    present_days: number;
    working_days: number;
    total_hours: string;
  };

  upcoming_holidays?: Array<{
    date: string;
    name: string;
    type: string;
    badge: string;
  }>;
}

export const getEmployeeAttendanceDashboard = (
  employeeId: string,
  tenantId: string,
  token?: string,
) => get(
  '/v1/attendance/dashboard/employee-attendance',
  { employee_id: employeeId } as Params,
  tenantId,
  {
    bearerToken: token,
    isFetchToken: !token,
  },
);

export const getAttendanceById = (
  id: string,
  tenantId: string,
  token?: string,
) => get(
  `/v1/attendance/${id}`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const updateAttendance = (
  id: string,
  body: Partial<IAttendancePayload>,
  tenantId: string,
  token?: string,
) => put(
  `/v1/attendance/${id}`,
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const deleteAttendance = (
  id: string,
  tenantId: string,
  token?: string,
) => deleteRequest(
  `/v1/attendance/${id}`,
  undefined,
  tenantId,
  undefined,
  { bearerToken: token, isFetchToken: !token },
);

// export interface ICheckOutContext {
//   check_out_status?: 'normal' | 'early_checkout' | 'overtime';
//   badge?: string;
//   badge_color?: string;
//   title?: string;
//   subtitle?: string;
//   warning_message?: string;
//   worked_time?: string;
//   worked_minutes?: number;
//   shift_end?: string;
//   shift_end_24hr?: string;
//   overtime_minutes?: number;
//   early_exit_minutes?: number;
//   // internal — set by frontend to carry local timer snapshot through to completion screen
//   _workedSecs?: number;
// }

// export interface ICheckInContext {
//   state: 'not_checked_in' | 'checked_in' | 'checked_out' | 'completed';
//   employee_name?: string;
//   greeting?: string;
//   message?: string;
//   current_time?: string;
//   current_time_24hr?: string;
//   attendance_id?: string;
//   check_in_time?: string;
//   check_in_time_24hr?: string;
//   check_out_time?: string;
//   check_out_time_24hr?: string;
//   worked_time?: string;
//   worked_minutes?: number;
//   attendance_status?: string;
//   // status fields (from check-in response status object)
//   day_type?: string;
//   is_comp_off_eligible?: boolean;
//   comp_off_credited?: number;
//   status_message?: string;
//   // nested context objects
//   check_in_context?: {
//     check_in_status?: string;
//     badge?: string;
//     badge_color?: string;
//     title?: string;
//     subtitle?: string;
//     shift_start?: string;
//     shift_end?: string;
//     shift_start_24hr?: string;
//     shift_end_24hr?: string;
//     late_by_minutes?: number;
//     minutes_to_shift?: number;
//   };
//   check_out_context?: ICheckOutContext;
// }

// export const getCheckInContext = (
//   tenantId: string,
//   token?: string,
// ) => get(
//   '/v1/attendance/check-in/context',
//   undefined,
//   tenantId,
//   { bearerToken: token, isFetchToken: !token },
// );

// ─── Updated to match the new GET /v1/attendance/check-in/context response ───
// Replaces the old ICheckInContext / ICheckOutContext definitions.
// NOTE: `checkIn` and `checkOut` POST functions elsewhere in this file are
// untouched — only the context types + GET function changed.

export interface IShiftInfo {
  name?: string;
  start?: string;
  end?: string;
  start_24hr?: string;
  end_24hr?: string;
  grace_minutes?: number;
  late_after?: string;
  min_hours?: number;
  auto_checkout?: string;
}

export interface ICheckInDetail {
  time?: string;
  time_24hr?: string;
  is_early?: boolean;
  is_on_time?: boolean;
  is_within_grace?: boolean;
  is_late?: boolean;
  late_by_minutes?: number;
  late_by_label?: string;
}

/**
 * INFERRED SHAPE — the sample response had `check_out: null` (employee
 * hadn't checked out yet), so this is a best-guess based on the old
 * ICheckOutContext fields. Confirm against a real post-checkout response
 * and adjust if any field names differ.
 */
export interface ICheckOutDetail {
  time?: string;
  time_24hr?: string;
  status?: 'normal' | 'early_checkout' | 'overtime';
  badge?: string;
  title?: string;
  subtitle?: string;
  warning_message?: string;
  worked_minutes?: number;
  worked_label?: string;
  overtime_minutes?: number;
  early_exit_minutes?: number;
}

export interface IWorkSummary {
  worked_minutes: number;
  worked_label: string;
  remaining_minutes: number;
  remaining_label: string;
  required_minutes: number;
  required_label: string;
  hours_met: boolean;
}

export interface IContextMessage {
  title?: string;
  subtitle?: string;
  notice?: string | null;
}

export interface IWeeklyCardEntry {
  date: string;
  day: string;
  date_label: string;
  status: string;
  badge: string;
  badge_color: string;
  hours: string;
  check_in: string | null;
  is_today: boolean;
}

export interface IMonthlySummary {
  present: number;
  late: number;
  on_leave: number;
  absent: number;
  regularization_pending: number;
  overtime_minutes: number;
  overtime_label: string;
  avg_hours_label: string;
}

export type NextAction = 'CHECK_IN' | 'CHECK_OUT' | 'NONE';

export interface ICheckInContext {
  employee_name?: string;
  greeting?: string;
  current_time?: string;
  current_time_24hr?: string;
  // Observed: 'WORKING'. Likely others: 'NOT_CHECKED_IN', 'COMPLETED', 'ON_LEAVE', 'HOLIDAY'
  status?: string;
  status_label?: string;
  status_badge?: string;
  status_badge_color?: string;
  shift?: IShiftInfo;
  check_in?: ICheckInDetail | null;
  check_out?: ICheckOutDetail | null;
  work_summary?: IWorkSummary;
  next_action?: NextAction;
  can_regularize?: boolean;
  message?: IContextMessage;
  attendance_id?: string;
  weekly_card?: IWeeklyCardEntry[];
  monthly_summary?: IMonthlySummary;
}

export const getCheckInContext = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/attendance/check-in/context',
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const checkIn = (
  body: ICheckInPayload,
  tenantId: string,
  token?: string,
) => post(
  '/v1/attendance/check-in',
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const checkOut = (
  id: string,
  body: ICheckOutPayload,
  tenantId: string,
  token?: string,
) => put(
  `/v1/attendance/${id}/check-out`,
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export interface IRegularizeAttendancePayload {
  check_in_time: string;
  check_out_time?: string;
  regularization_request_id?: string;
  remarks?: string;
}

export const regularizeAttendance = (
  id: string,
  body: IRegularizeAttendancePayload,
  tenantId: string,
  token?: string,
) => put(
  `/v1/attendance/${id}/regularize`,
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export interface IAttendancePolicyPayload {
  name: string;
  grace_period_minutes: number;
  auto_checkout_hours: number;
  max_regularization_per_month: number;
  sandwich_policy_enabled: boolean;
  sandwich_include_weekoff: boolean;
  // sandwich_include_public_holiday: boolean;
  sandwich_include_company_holiday: boolean;
}

export const getAttendancePolicies = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/attendance-policies',
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getAttendancePolicyById = (
  id: string,
  tenantId: string,
  token?: string,
) => get(
  `/v1/attendance-policies/${id}`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const createAttendancePolicy = (
  body: IAttendancePolicyPayload,
  tenantId: string,
  token?: string,
) => post(
  '/v1/attendance-policies',
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const updateAttendancePolicy = (
  id: string,
  body: Partial<IAttendancePolicyPayload>,
  tenantId: string,
  token?: string,
) => put(
  `/v1/attendance-policies/${id}`,
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const deleteAttendancePolicy = (
  id: string,
  tenantId: string,
  token?: string,
) => deleteRequest(
  `/v1/attendance-policies/${id}`,
  undefined,
  tenantId,
  undefined,
  { bearerToken: token, isFetchToken: !token },
);

export interface IMonthlyReportFilters {
  year?: number;
  month?: number;
  from_date?: string;
  to_date?: string;
  employee_ids?: string;
  department_id?: string;
}

export const getMonthlyConsolidatedReport = (
  tenantId: string,
  params?: IMonthlyReportFilters,
  token?: string,
) => get(
  '/v1/attendance/dashboard/monthly-summary/consolidated',
  params as Params,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export interface IMonthlySummaryFilters {
  employee_id: string;
  year: number;
  month: number;
}

export interface IMonthlySummary {
  month: number;
  year: number;
  month_name: string;
  monthly_overview: {
    working_days: number;
    present_days: number;
    absent_days: number;
    late_arrivals: number;
    half_days: number;
    attendance_rate: string;
  };
  working_hours_summary: {
    expected_hours: string;
    worked_hours: string;
    shortfall: string;
    shortfall_type: 'deficit' | 'surplus';
    overtime: string;
  };
  attendance_status_breakdown: Array<{
    status: string;
    count: number;
  }>;
  late_arrival_summary: {
    total_late_arrivals: number;
    total_late_minutes: number;
    avg_late_minutes: number;
    max_late_minutes: number;
    late_days_details: Array<{
      date: string;
      late_by_minutes: number;
    }>;
  };
  early_exit_summary: {
    early_exits: number;
    total_early_exit_minutes: number;
    avg_early_exit_minutes: number;
    early_exit_details: Array<{
      date: string;
      early_by_minutes: number;
    }>;
  };
  leave_impact: {
    approved_leave: number;
    pending_leave: number;
    total_leave_days: number;
  };
  regularization_summary: {
    requested: number;
    approved: number;
    pending: number;
  };
  work_location_summary: {
    wfh_days: number;
    on_duty_days: number;
    office_days: number;
  };
}

export const getMonthlySummary = (
  tenantId: string,
  params: IMonthlySummaryFilters,
  token?: string,
) => get(
  '/v1/attendance/dashboard/monthly-summary',
  params as Params,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);



export interface IAttendanceLogEntry {
  date: string;
  display_date?: string;
  day_full?: string;
  is_working_day?: boolean;
  type: 'attendance' | 'holiday' | 'week_off' | 'leave' | 'absent';
  status?: string;
  badge?: string;
  badge_color?: string;
  check_in?: string;
  check_out?: string;
  working_hours?: string;
  is_late?: boolean;
  late_by_minutes?: number;
  attendance_id?: string;
  holiday_name?: string;
  holiday_type?: string;
  leave_type?: string;
}

export interface IAttendanceLogFilters {
  employee_id: string;
  view?: 'week' | 'prev_week' | 'month' | 'prev_month';
  start_date?: string;
  end_date?: string;
  limit?: number;
}

export const getAttendanceLogs = (
  tenantId: string,
  params: IAttendanceLogFilters,
  token?: string,
) => get(
  '/v1/attendance/logs',
  params as Params,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

// ─── Admin Attendance ───────────────────────────────────────────────────────

export const getAdminLiveToday = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/admin-attendance/live-today',
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export interface IAdminAttendanceRecordsFilters {
  status?: string;
  employee_id?: string;
  department_id?: string;
  start_date?: string;
  end_date?: string;
  date?: string;
}

export const getAdminAttendanceRecords = (
  tenantId: string,
  params?: IAdminAttendanceRecordsFilters,
  token?: string,
) => get(
  '/v1/admin-attendance/records',
  params as Params,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);
