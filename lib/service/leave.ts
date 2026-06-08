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
  // code?: string;
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

// ── Leave Policies ────────────────────────────────────────────────

export interface LeavePolicyTypeConfig {
  leave_type_id: string;
  days_per_year: number;
  accrual_type: string;
  is_carry_forward: boolean;
  carry_forward_max_days: number;
  is_encashable: boolean;
  min_days_per_application: number;
  max_days_per_application: number;
}

export interface LeavePolicyPayload {
  name: string;
  leave_type_configs: LeavePolicyTypeConfig[];
}

// Shape returned by GET /v1/leave-policies
export interface LeavePolicyItem {
  policy_name: string;
  policy_code: string | null;
  policy_description: string | null;
  leave_types_count: number;
  is_synced: boolean;
  createdAt: string;
  leave_types: {
    leave_type_id: string;
    leave_type: { id: string; name: string; code: string; [key: string]: any };
    days_per_year: string;
    accrual_type: string;
    is_carry_forward: boolean;
    carry_forward_max_days: string;
    is_encashable: boolean;
    min_days_per_application: string;
    max_days_per_application: string;
  }[];
}

export const getLeavePolicies = (
  tenantId: string,
  params?: { page?: number; limit?: number },
  token?: string,
) => get(
  '/v1/leave-policies',
  params,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

// Search by policy name: GET /v1/leave-policies/:name
export const getLeavePolicyByName = (
  name: string,
  tenantId: string,
  token?: string,
) => get(
  `/v1/leave-policies/${encodeURIComponent(name)}`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const createLeavePolicy = (
  body: LeavePolicyPayload,
  tenantId: string,
  token?: string,
) => post(
  '/v1/leave-policies',
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

// Update by policy name: PUT /v1/leave-policies/:name
export const updateLeavePolicy = (
  name: string,
  body: Partial<LeavePolicyPayload>,
  tenantId: string,
  token?: string,
) => put(
  `/v1/leave-policies/${encodeURIComponent(name)}`,
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

// Delete by policy name: DELETE /v1/leave-policies/:name
export const deleteLeavePolicy = (
  name: string,
  tenantId: string,
  token?: string,
) => deleteRequest(
  `/v1/leave-policies/${encodeURIComponent(name)}`,
  undefined,
  tenantId,
  undefined,
  { bearerToken: token, isFetchToken: !token },
);
