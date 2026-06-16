import {
  get, post, patch, deleteRequest,
} from '../axiosInstance';
import { Params } from '../utils';

// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────

export enum OnDutyStatus {
  PENDING   = 'pending',
  APPROVED  = 'approved',
  REJECTED  = 'rejected',
  CANCELLED = 'cancelled',
}

export enum OnDutyType {
  FULL_DAY = 'full_day',
  PARTIAL  = 'partial',
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface IOnDutyEmployee {
  id: string;
  first_name: string;
  last_name: string;
  employee_code: string;
  work_email?: string;
}

export interface IOnDutyApprover {
  id: string;
  first_name: string;
  last_name: string;
}

export interface IOnDuty {
  id: string;
  employee_id: string;
  date: string;
  onduty_type: OnDutyType;
  from_time: string | null;
  to_time: string | null;
  total_hours: number | null;
  purpose: string;
  location: string;
  remarks?: string | null;
  attachment_url?: string | null;
  status: OnDutyStatus;
  applied_on: string;
  approved_by?: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  employee: IOnDutyEmployee;
  approver: IOnDutyApprover | null;
}

export interface IApplyOnDutyPayload {
  date: string;
  onduty_type: OnDutyType;
  from_time?: string | null;
  to_time?: string | null;
  purpose: string;
  location: string;
  remarks?: string;
  attachment_url?: string | null;
}

export interface IUpdateOnDutyPayload {
  date?: string;
  onduty_type?: OnDutyType;
  from_time?: string | null;
  to_time?: string | null;
  purpose?: string;
  location?: string;
  remarks?: string;
  attachment_url?: string | null;
}

export interface IApproveRejectOnDutyPayload {
  status: OnDutyStatus.APPROVED | OnDutyStatus.REJECTED;
  rejection_reason?: string;
}

export interface IOnDutyQueryParams extends Params {
  employee_id?: string;
  status?: OnDutyStatus | string;
  onduty_type?: OnDutyType | string;
  from_date?: string;
  to_date?: string;
}

// ─────────────────────────────────────────────
// Employee API Functions
// ─────────────────────────────────────────────

/**
 * Apply for on-duty
 * POST /v1/onduty
 */
export const applyOnDuty = (
  payload: IApplyOnDutyPayload,
  tenantId: string,
  token?: string,
) => post(
  '/v1/onduty',
  payload,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

/**
 * Get my on-duty applications (logged-in employee)
 * GET /v1/onduty/my-applications
 */
export const getMyOnDutyApplications = (
  tenantId: string,
  params?: IOnDutyQueryParams,
  token?: string,
) => get(
  '/v1/onduty/my-applications',
  params,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

/**
 * Get on-duty application by ID
 * GET /v1/onduty/:id
 */
export const getOnDutyById = (
  id: string,
  tenantId: string,
  token?: string,
) => get(
  `/v1/onduty/${id}`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

/**
 * Update a pending on-duty application
 * PATCH /v1/onduty/:id
 */
export const updateOnDuty = (
  id: string,
  payload: IUpdateOnDutyPayload,
  tenantId: string,
  token?: string,
) => patch(
  `/v1/onduty/${id}`,
  payload,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

/**
 * Cancel own on-duty application
 * POST /v1/onduty/:id/cancel
 */
export const cancelOnDuty = (
  id: string,
  tenantId: string,
  token?: string,
) => post(
  `/v1/onduty/${id}/cancel`,
  {},
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

// ─────────────────────────────────────────────
// Manager API Functions
// ─────────────────────────────────────────────

/**
 * Get team on-duty applications (direct reports — manager view)
 * GET /v1/onduty/team
 */
export const getTeamOnDutyApplications = (
  tenantId: string,
  params?: IOnDutyQueryParams,
  token?: string,
) => get(
  '/v1/onduty/team',
  params,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

/**
 * Approve or reject an on-duty application (Manager)
 * POST /v1/onduty/:id/approve
 */
export const approveRejectOnDuty = (
  id: string,
  payload: IApproveRejectOnDutyPayload,
  tenantId: string,
  token?: string,
) => post(
  `/v1/onduty/${id}/approve`,
  payload,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

// ─────────────────────────────────────────────
// Admin API Functions
// ─────────────────────────────────────────────

/**
 * Get all on-duty applications (Admin/HR view)
 * GET /v1/onduty
 */
export const getAllOnDutyApplications = (
  tenantId: string,
  params?: IOnDutyQueryParams,
  token?: string,
) => get(
  '/v1/onduty',
  params,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

/**
 * Delete an on-duty application (Admin only)
 * DELETE /v1/onduty/:id
 */
export const deleteOnDuty = (
  id: string,
  tenantId: string,
  token?: string,
) => deleteRequest(
  `/v1/onduty/${id}`,
  undefined,
  tenantId,
  undefined,
  { bearerToken: token, isFetchToken: !token },
);