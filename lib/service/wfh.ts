import {
  get, post, patch,
} from '../axiosInstance';
import { Params } from '../utils';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export enum WFHStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export interface IWFHEmployee {
  id: string;
  name: string;
  employee_code: string;
  work_email?: string;
}

export interface IWFHApprover {
  id: string;
  name: string;
}

export interface IWFH {
  id: string;
  date: string;
  reason: string;
  status: WFHStatus;
  applied_on: string;
  approved_at: string | null;
  rejection_reason: string | null;
  employee: IWFHEmployee;
  approver: IWFHApprover | null;
}

export interface IApplyWFHPayload {
  date: string;
  reason: string;
}

export interface IUpdateWFHPayload {
  date?: string;
  reason?: string;
}

export interface IApproveRejectWFHPayload {
  status: WFHStatus.APPROVED | WFHStatus.REJECTED;
  rejection_reason?: string;
}

export interface IMyWFHQueryParams extends Params {
  status?: WFHStatus | string;
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
}

export interface ITeamWFHQueryParams extends Params {
  status?: WFHStatus | string;
  from_date?: string;
  to_date?: string;
  approver?:string;
}

// ─────────────────────────────────────────────
// Employee API Functions
// ─────────────────────────────────────────────

/**
 * Apply for WFH
 * POST /v1/wfh
 */
export const applyWFH = (
  payload: IApplyWFHPayload,
  tenantId: string,
  token?: string,
) => post(
  '/v1/wfh',
  payload,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

/**
 * Get my WFH requests (with optional filters)
 * GET /v1/wfh/my-requests
 */
export const getMyWFHRequests = (
  tenantId: string,
  params?: IMyWFHQueryParams,
  token?: string,
) => get(
  '/v1/wfh/my-requests',
  params,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

/**
 * Get WFH request by ID
 * GET /v1/wfh/:id
 */
export const getWFHById = (
  id: string,
  tenantId: string,
  token?: string,
) => get(
  `/v1/wfh/${id}`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

/**
 * Update a pending WFH request
 * PATCH /v1/wfh/:id
 */
export const updateWFH = (
  id: string,
  payload: IUpdateWFHPayload,
  tenantId: string,
  token?: string,
) => patch(
  `/v1/wfh/${id}`,
  payload,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

/**
 * Cancel a WFH request
 * POST /v1/wfh/:id/cancel
 */
export const cancelWFH = (
  id: string,
  tenantId: string,
  token?: string,
) => post(
  `/v1/wfh/${id}/cancel`,
  {},
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

// ─────────────────────────────────────────────
// Manager API Functions
// ─────────────────────────────────────────────

/**
 * Get team WFH requests (direct reports — manager view)
 * GET /v1/wfh/team
 */
export const getTeamWFHRequests = (
  tenantId: string,
  params?: ITeamWFHQueryParams,
  token?: string,
) => get(
  '/v1/wfh/team',
  params,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

/**
 * Approve or reject a WFH request (Manager)
 * POST /v1/wfh/:id/approve
 */
export const approveRejectWFH = (
  id: string,
  payload: IApproveRejectWFHPayload,
  tenantId: string,
  token?: string,
) => post(
  `/v1/wfh/${id}/approve`,
  payload,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

/**
 * Get ALL WFH requests (Admin view)
 * GET /v1/wfh
 */
export const getAllWFHRequests = (
  tenantId: string,
  params?: IMyWFHQueryParams,
  token?: string,
) => get(
  '/v1/wfh',
  params,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);
