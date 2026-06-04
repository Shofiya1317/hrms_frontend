import { get, post, put, patch, deleteRequest } from '../axiosInstance';

export const getLeaveTypes = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/leave-types',
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getLeaveTypeById = (
  id: string,
  tenantId: string,
  token?: string,
) => get(
  `/v1/leave-types/${id}`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export interface LeaveTypePayload {
  name: string;
  code: string;
  description?: string;
  is_paid: boolean;
  is_encashable: boolean;
  requires_document: boolean;
  applicable_gender?: 'male' | 'female' | 'all';
  is_system_type: boolean;
  max_consecutive_days?: number;
  notice_days_required?: number;
}

export const createLeaveType = (
  body: LeaveTypePayload,
  tenantId: string,
  token?: string,
) => post(
  '/v1/leave-types',
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const updateLeaveType = (
  id: string,
  body: Partial<LeaveTypePayload>,
  tenantId: string,
  token?: string,
) => patch(
  `/v1/leave-types/${id}`,
  body,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const deleteLeaveType = (
  id: string,
  tenantId: string,
  token?: string,
) => deleteRequest(
  `/v1/leave-types/${id}`,
  undefined,
  tenantId,
  undefined,
  { bearerToken: token, isFetchToken: !token },
);

// ── Company Holidays ──────────────────────────────────────────────

export interface CompanyHolidayPayload {
  name: string;
  date: string;
  applicable_to: string;
  department_id?: string;
  work_location_id?: string;
  description?: string;
}

export const getCompanyHolidays = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/company-holidays',
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getCompanyHolidayById = (
  id: string,
  tenantId: string,
  token?: string,
) => get(
  `/v1/company-holidays/${id}`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const createCompanyHoliday = (
  body: CompanyHolidayPayload,
  tenantId: string,
  token?: string,
) => post(
  '/v1/company-holidays',
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const updateCompanyHoliday = (
  id: string,
  body: CompanyHolidayPayload,
  tenantId: string,
  token?: string,
) => put(
  `/v1/company-holidays/${id}`,
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const deleteCompanyHoliday = (
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
