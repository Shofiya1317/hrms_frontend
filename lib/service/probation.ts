import { get, post } from '../axiosInstance';
import { Params } from '../utils';

export interface IProbationDashboard {
  overview: {
    total_on_probation: number;
    expiring_this_week: number;
    expiring_this_month: number;
  };
  status_breakdown: {
    confirmed: number;
    extended: number;
    under_review: number;
    failed: number;
    active: number;
  };
}

export interface IProbationEmployee {
  employee_id: string;
  employee_code: string;
  employee_name: string;
  email: string;
  probation_details: {
    probation_start_date: string;
    probation_end_date: string;
    probation_duration_months: number;
    days_remaining: number;
    status: 'active' | 'under_review' | 'extended' | 'confirmed' | 'failed' | 'terminated';
    extension_count: number;
    extension_reason: string | null;
  };
  employment_details: {
    employment_type: string;
    employment_status: string;
    date_of_joining: string;
    date_of_confirmation: string | null;
  };
  department: {
    id: string;
    name: string;
  };
  designation: {
    id: string;
    name: string;
  };
  reporting_manager: {
    id: string;
    name: string;
    employee_code: string;
  } | null;
}

export interface IProbationFilters {
  status?: 'active' | 'under_review' | 'extended' | 'confirmed' | 'failed';
  expiring_within_days?: number;
  department_id?: string;
  reporting_manager_id?: string;
}

export interface IProbationReviewPayload {
  performance_rating: number;
  work_quality_rating: number;
  productivity_rating: number;
  attendance_rating: number;
  discipline_rating: number;
  communication_rating: number;
  team_collaboration_rating: number;
  recommendation: 'confirm' | 'extend' | 'fail';
  extension_months?: number;
  extension_reason?: string;
  remarks: string;
}

export interface IConfirmProbationPayload {
  confirmation_date: string;
  confirmation_remarks: string;
}

export interface IExtendProbationPayload {
  extension_months: number;
  extension_reason: string;
}

export interface IFailProbationPayload {
  failure_remarks: string;
  exit_date?: string;
}

export const getProbationDashboard = (
  tenantId: string,
  token?: string,
) => get<IProbationDashboard>(
  '/v1/employees/probation/dashboard',
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getProbationEmployees = (
  tenantId: string,
  filters?: IProbationFilters,
  token?: string,
) => get<{ data: IProbationEmployee[]; total: number }>(
  '/v1/employees/probation/list',
  filters as Params,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getProbationEmployeeDetails = (
  employeeId: string,
  tenantId: string,
  token?: string,
) => get<IProbationEmployee>(
  `/v1/employees/probation/${employeeId}/details`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const submitProbationReview = (
  employeeId: string,
  payload: IProbationReviewPayload,
  tenantId: string,
  token?: string,
) => post(
  `/v1/employees/probation/${employeeId}/review`,
  payload,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const confirmProbation = (
  employeeId: string,
  payload: IConfirmProbationPayload,
  tenantId: string,
  token?: string,
) => post(
  `/v1/employees/probation/${employeeId}/confirm`,
  payload,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const extendProbation = (
  employeeId: string,
  payload: IExtendProbationPayload,
  tenantId: string,
  token?: string,
) => post(
  `/v1/employees/probation/${employeeId}/extend`,
  payload,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const failProbation = (
  employeeId: string,
  payload: IFailProbationPayload,
  tenantId: string,
  token?: string,
) => post(
  `/v1/employees/probation/${employeeId}/fail`,
  payload,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);
