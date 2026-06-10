import {
  get, post, patch, deleteRequest,
} from '../axiosInstance';
import { Params } from '../utils';

export enum LeaveStatus {
  PENDING   = 'pending',
  APPROVED  = 'approved',
  REJECTED  = 'rejected',
  CANCELLED = 'cancelled',
}

export enum HalfDaySession {
  MORNING   = 'morning',
  AFTERNOON = 'afternoon',
}

export interface ILeaveApplicationPayload { 
  leave_type_id: string;
  from_date: string;
  to_date: string;
  half_day: boolean;
  half_day_session?: HalfDaySession;
  reason: string;
  attachment_url?: string;
}

export interface ILeaveApplicationUpdatePayload {
  from_date?: string;
  to_date?: string;
  half_day?: boolean;
  half_day_session?: HalfDaySession;
  reason?: string;
}

export interface ILeaveApprovalPayload {
  status: LeaveStatus;
  rejection_reason?: string;
}

export interface ILeaveApplicationFilters {
  employee_id?: string;
  status?: LeaveStatus | 'cancelled';
  leave_type_id?: string;
  from_date?: string;
  to_date?: string;
}

export interface ILeaveApplication {
  id: string;
  employee_id?: string;
  employee_name?: string;
  employee?: {
    id?: string;
    name?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    employee_code?: string;
    department?: string;
    designation?: string;
    avatar_url?: string;
  };
  leave_type_id?: string;
  leave_type_name?: string;
  leave_type?: {
    id: string;
    name: string;
    code?: string;
    is_paid?: boolean;
  };
  from_date: string;
  to_date: string;
  half_day: boolean;
  half_day_session?: HalfDaySession;
  reason: string;
  status: LeaveStatus;
  rejection_reason?: string;
  total_days?: number | string;
  applied_on?: string;
  approved_by?: string;
  approved_at?: string;
  attachment_url?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const applyLeave = (
  body: ILeaveApplicationPayload,
  tenantId: string,
  token?: string,
) => post(
  '/v1/leave-applications',
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getLeaveApplications = (
  tenantId: string,
  filters?: ILeaveApplicationFilters,
  token?: string,
) => get(
  '/v1/leave-applications',
  filters as Params,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getLeaveApplicationById = (
  id: string,
  tenantId: string,
  token?: string,
) => get(
  `/v1/leave-applications/${id}`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const updateLeaveApplication = (
  id: string,
  body: ILeaveApplicationUpdatePayload,
  tenantId: string,
  token?: string,
) => patch(
  `/v1/leave-applications/${id}`,
  body,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const approveRejectLeave = (
  id: string,
  body: ILeaveApprovalPayload,
  tenantId: string,
  token?: string,
) => post(
  `/v1/leave-applications/${id}/approve`,
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const cancelLeave = (
  id: string,
  tenantId: string,
  token?: string,
) => post(
  `/v1/leave-applications/${id}/cancel`,
  {},
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const deleteLeaveApplication = (
  id: string,
  tenantId: string,
  token?: string,
) => deleteRequest(
  `/v1/leave-applications/${id}`,
  undefined,
  tenantId,
  undefined,
  { bearerToken: token, isFetchToken: !token },
);

export const getTeamLeaves = (
  tenantId: string,
  filters?: Omit<ILeaveApplicationFilters, 'employee_id'>,
  token?: string,
) => get(
  '/v1/leave-applications/team/leaves',
  filters as Params,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getTeamMembers = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/leave-applications/team/members',
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);
