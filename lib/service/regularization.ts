import {
  get, post, put, deleteRequest,
} from '../axiosInstance';
import { Params } from '../utils';

export enum RegularizationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface IRegularizationFilters {
  page?: number;
  limit?: number;
  employee_id?: string;
  status?: RegularizationStatus;
  from_date?: string;
  to_date?: string;
}

export interface IRegularization {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  attendance_log_id: string;
  attendance_date: string;
  original_check_in: string | null;
  original_check_out: string | null;
  requested_check_in: string | null;
  requested_check_out: string | null;
  status: RegularizationStatus;
  remarks: string;
  reviewed_by: string | null;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  employee?: {
    id: string;
    name?: string;
    first_name?: string;
    last_name?: string;
    employee_code?: string;
  };
  attendanceLog?: any;
  reviewer?: any;
}

export interface ICreateRegularizationPayload {
  attendance_log_id: string;
  remarks?: string;
  requested_check_in?: string;
  requested_check_out?: string;
}

export interface IUpdateRegularizationPayload {
  remarks?: string;
  requested_check_in?: string;
  requested_check_out?: string;
}

export interface IReviewRegularizationPayload {
  status: 'approved' | 'rejected';
  rejection_reason?: string;
}

export const getRegularizations = (
  tenantId: string,
  params?: IRegularizationFilters,
  token?: string,
) => get(
  '/v1/attendance-regularizations',
  params as Params,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getRegularizationById = (
  id: string,
  tenantId: string,
  token?: string,
) => get(
  `/v1/attendance-regularizations/${id}`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const createRegularization = (
  body: ICreateRegularizationPayload,
  tenantId: string,
  token?: string,
) => post(
  '/v1/attendance-regularizations',
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const updateRegularization = (
  id: string,
  body: IUpdateRegularizationPayload,
  tenantId: string,
  token?: string,
) => put(
  `/v1/attendance-regularizations/${id}`,
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const reviewRegularization = (
  id: string,
  body: IReviewRegularizationPayload,
  tenantId: string,
  token?: string,
) => put(
  `/v1/attendance-regularizations/${id}/review`,
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const deleteRegularization = (
  id: string,
  tenantId: string,
  token?: string,
) => deleteRequest(
  `/v1/attendance-regularizations/${id}`,
  undefined,
  tenantId,
  undefined,
  { bearerToken: token, isFetchToken: !token },
);


export interface ITeamRegularizationFilters {
  status?: RegularizationStatus;
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
}

export interface ITeamRegularizationMeta {
  totalCount: number;
  currentCount: number;
  currentPage: number;
  limit: number;
}

export interface ITeamRegularizationResponse {
  success: boolean;
  data: IRegularization[];
  meta: ITeamRegularizationMeta;
}

export const getTeamRegularizations = (
  tenantId: string,
  params?: ITeamRegularizationFilters,
  token?: string,
) => get(
  '/v1/attendance-regularizations/team/requests',
  params as Params,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);