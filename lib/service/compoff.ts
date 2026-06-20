import { get, post } from '../axiosInstance';
import { Params } from '../utils';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export enum CompOffStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export interface ICompOffBalance {
  employee_id: string;
  comp_off_balance: number;
  message: string;
}

export interface ICompOff {
  id: string;
  employee_id: string;
  worked_date: string;
  comp_off_date: string;
  worked_hours: number;
  reason: string;
  status: CompOffStatus;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  rejection_reason?: string;
  expires_on?: string;
  is_availed: boolean;
  created_at: string;
  updated_at: string;
  // employee info populated on team endpoint
  employee?: {
    id: string;
    name?: string;
    first_name?: string;
    last_name?: string;
    employee_code?: string;
    designation?: string;
  };
}

export interface IApplyCompOffPayload {
  worked_date: string;
  comp_off_date?: string;
  worked_hours: number;
  reason: string;
}

export interface IApproveRejectCompOffPayload {
  status: 'approved' | 'rejected';
  rejection_reason?: string;
}

export interface ITeamCompOffQueryParams extends Params {
  employee_id?: string;
  status?: CompOffStatus | string;
  from_worked_date?: string;
  to_worked_date?: string;
  from_comp_off_date?: string;
  to_comp_off_date?: string;
  is_availed?: boolean;
}

// ─────────────────────────────────────────────
// Employee API Functions
// ─────────────────────────────────────────────

/** Get comp-off balance for the authenticated employee */
export const getCompOffBalance = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/comp-off/balance',
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

/** Get available comp-offs for the authenticated employee */
export const getAvailableCompOffs = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/comp-off/available',
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

/** Get all comp-off requests (with optional filters) */
export const getCompOffs = (
  tenantId: string,
  params?: Params,
  token?: string,
) => get(
  '/v1/comp-off',
  params,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

/** Get comp-off by ID */
export const getCompOffById = (
  id: string,
  tenantId: string,
  token?: string,
) => get(
  `/v1/comp-off/${id}`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

/** Apply for comp-off */
export const applyCompOff = (
  payload: IApplyCompOffPayload,
  tenantId: string,
  token?: string,
) => post(
  '/v1/comp-off',
  payload,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

/** Approve or reject comp-off request (Manager) */
export const approveRejectCompOff = (
  id: string,
  payload: IApproveRejectCompOffPayload,
  tenantId: string,
  token?: string,
) => post(
  `/v1/comp-off/${id}/approve`,
  payload,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

// ─────────────────────────────────────────────
// Manager / Team API Functions
// ─────────────────────────────────────────────

/**
 * Get team comp-off requests (direct reports only — manager view)
 * GET /v1/comp-off/team
 */
export const getTeamCompOffs = (
  tenantId: string,
  params?: ITeamCompOffQueryParams,
  token?: string,
) => get(
  '/v1/comp-off/team',
  params,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);
