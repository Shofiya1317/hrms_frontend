import {
  get, post, patch, deleteRequest,
  put,
} from '../axiosInstance';

export type HolidayType = 'public' | 'optional' | 'restricted';
// export type DayType = 'holiday' | 'working';

export type DayType = 'holiday' | 'working';

export interface IHolidayPayload {
  name: string;
  date: string;
  holiday_type: HolidayType;
  day_type: DayType;
  description?: string;
  is_active: boolean;
}

export interface IHoliday {
  id: string;
  name: string;
  date: string;
  holiday_type: HolidayType;
  day_type: DayType;
  description?: string;
  is_active: boolean;
  is_synced: boolean;
  base_record_id: string | null;
  created_by?: string;
  is_deleted?: boolean;
  deleted_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Calendar API interfaces
export interface ICalendarDay {
  date: string;
  day_name: string;
  status: 'working' | 'holiday' | 'weekend' | 'working_override' | 'holiday_override';
  is_working: boolean;
  is_override: boolean;
  override_name: string | null;
  holiday_name: string | null;
  reason: string;
  source: 'work_schedule' | 'override';
}

export interface IMonthlyCalendar {
  month: number;
  month_name: string;
  year: number;
  total_working_days: number;
  total_holidays: number;
  days: ICalendarDay[];
}

export interface IWorkSchedule {
  name: string;
  description: string;
  schedule: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday_week_1: boolean;
    saturday_week_2: boolean;
    saturday_week_3: boolean;
    saturday_week_4: boolean;
    saturday_week_5: boolean;
    sunday: boolean;
  };
  working_days: string[];
  non_working_days: string[];
}

export const getHolidaysByYear = (
  year: number,
  tenantId: string,
  token?: string,
) => get(
  `/v1/company-holidays/year/${year}`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getHolidayById = (
  id: string,
  tenantId: string,
  token?: string,
) => get(
  `/v1/company-holidays/${id}`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const createHoliday = (
  body: IHolidayPayload,
  tenantId: string,
  token?: string,
) => post(
  '/v1/company-holidays',
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const updateHoliday = (
  id: string,
  body: Partial<IHolidayPayload>,
  tenantId: string,
  token?: string,
) => patch(
  `/v1/company-holidays/${id}`,
  body,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const deleteHoliday = (
  id: string,
  tenantId: string,
  token?: string,
) => deleteRequest(
  `/v1/company-holidays/${id}`,
  undefined,
  tenantId,
  undefined,
  { bearerToken: token, isFetchToken: !token },
);

export const bulkImportHolidays = (
  body: { year: number; holiday_ids: string[] },
  tenantId: string,
  token?: string,
) => post(
  '/v1/company-holidays/import',
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

// Calendar API functions
export const getWorkSchedule = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/company-holidays/calendar/work-schedule',
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getYearlyCalendar = (
  year: number,
  tenantId: string,
  token?: string,
) => get(
  `/v1/company-holidays/calendar/year/${year}`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getMonthlyCalendar = (
  year: number,
  month: number,
  tenantId: string,
  token?: string,
) => get(
  `/v1/company-holidays/calendar/month/${year}/${month}`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getCalendarDateRange = (
  startDate: string,
  endDate: string,
  tenantId: string,
  token?: string,
) => get(
  `/v1/company-holidays/calendar/range?start_date=${startDate}&end_date=${endDate}`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);
// Work Location Schedule interfaces
export interface IWorkLocationSchedule {
  schedule: {
    monday: 'office' | 'wfh';
    tuesday: 'office' | 'wfh';
    wednesday: 'office' | 'wfh';
    thursday: 'office' | 'wfh';
    friday: 'office' | 'wfh';
    saturday: 'office' | 'wfh';
    sunday: 'office' | 'wfh';
  };
  formatted_schedule: string[];
}

export const getWorkLocationSchedule = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/company-holidays/calendar/work-location-schedule',
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const updateWorkSchedule = (
  body: {
    name: string;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday_week_1: boolean;
    saturday_week_2: boolean;
    saturday_week_3: boolean;
    saturday_week_4: boolean;
    saturday_week_5: boolean;
    sunday: boolean;
    description: string;
  },
  tenantId: string,
  token?: string,
) => put(
  '/v1/company-holidays/calendar/work-schedule',
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const updateWorkLocationSchedule = (
  body: {
    monday: 'office' | 'wfh';
    tuesday: 'office' | 'wfh';
    wednesday: 'office' | 'wfh';
    thursday: 'office' | 'wfh';
    friday: 'office' | 'wfh';
    saturday: 'office' | 'wfh';
  },
  tenantId: string,
  token?: string,
) => put(
  '/v1/company-holidays/calendar/work-location-schedule',
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);



