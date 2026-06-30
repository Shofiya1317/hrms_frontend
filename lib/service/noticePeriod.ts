import { get, put, post, patch } from '../axiosInstance';

export interface INoticePeriodPolicyPayload {
  full_time?: { notice_days: number };
  probation?: { notice_days: number };
  intern?: { notice_days: number };
  part_time?: { notice_days: number };
  contract?: { notice_days: number };
}

// Admin: Notice Period Policy
export const getNoticePeriodPolicy = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/notice-periods/policy',
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const updateNoticePeriodPolicy = (
  body: INoticePeriodPolicyPayload,
  tenantId: string,
  token?: string,
) => put(
  '/v1/notice-periods/policy',
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

// Admin: Resignation Management
export interface IResignationDashboard {
  overview: {
    total_on_notice: number;
    expiring_this_week: number;
    expiring_this_month: number;
  };
  status_breakdown: {
    approved: number;
    pending: number;
    rejected: number;
  };
}

export interface IResignationFilters {
  status?: string;
  department_id?: string;
  reporting_manager_id?: string;
}

export const getResignationDashboard = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/notice-periods/dashboard', // Assumed dashboard endpoint since it wasn't in the spec, but we still need it for UI
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getNoticePeriods = (
  tenantId: string,
  filters?: IResignationFilters,
  token?: string,
) => get(
  '/v1/notice-periods',
  filters as Record<string, any>,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getNoticePeriodById = (
  tenantId: string,
  id: string,
  token?: string,
) => get(
  `/v1/notice-periods/${id}`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const approveResignation = (
  tenantId: string,
  id: string,
  body: { manager_remarks?: string },
  token?: string,
) => patch(
  `/v1/notice-periods/${id}/approve`,
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const rejectResignation = (
  tenantId: string,
  id: string,
  body: { manager_remarks?: string },
  token?: string,
) => patch(
  `/v1/notice-periods/${id}/reject`,
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const updateNoticePeriod = (
  tenantId: string,
  id: string,
  body: {
    expected_last_working_day?: string;
    manager_remarks?: string;
    hr_remarks?: string;
    buyout_days?: number;
    buyout_amount?: number;
    status?: string;
  },
  token?: string,
) => patch(
  `/v1/notice-periods/${id}/update`,
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const completeNoticePeriod = (
  tenantId: string,
  id: string,
  body: { actual_last_working_day: string; hr_remarks?: string },
  token?: string,
) => patch(
  `/v1/notice-periods/${id}/complete`,
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const withdrawResignation = (
  tenantId: string,
  id: string,
  token?: string,
) => patch(
  `/v1/notice-periods/${id}/withdraw`,
  {},
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

// Employee: Resignation Submission
export const submitResignation = (
  tenantId: string,
  body: { reason: string; requested_last_working_day?: string; employee_remarks?: string },
  token?: string,
) => post(
  '/v1/notice-periods/submit',
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getEmployeeResignationStatus = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/notice-periods/status', // Assumed endpoint for self status check
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);
