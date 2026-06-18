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
  sandwich_include_public_holiday: boolean;
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
