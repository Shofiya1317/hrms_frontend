import { get, post } from '../axiosInstance';
import { Params } from '../utils';

export interface IInternDashboard {
  summary: {
    total_interns: number;
    active: number;
    expiring_this_week: number;
    expiring_this_month: number;
    converted: number;
    terminated: number;
  };
}

export interface IInternEmployee {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string | null;
  designation: string | null;
  manager_name: string | null;
  joining_date: string;
  internship_end_date: string | null;
  internship_duration_months: number | null;
  status: 'active' | 'extended' | 'converted' | 'terminated';
  profile_photo_url: string | null;
}

export interface IInternFilters {
  status?: 'active' | 'extended' | 'converted' | 'terminated';
  department_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IConvertInternPayload {
  conversion_date: string;
  remarks: string;
}

export interface IExtendInternPayload {
  extension_months: number;
  reason: string;
}

export interface ITerminateInternPayload {
  exit_date: string;
  reason: string;
}

export const getInternDashboard = (tenantId: string, token?: string) =>
  get<IInternDashboard>(
    '/v1/employees/intern/dashboard',
    undefined,
    tenantId,
    { bearerToken: token, isFetchToken: !token },
  );

export const getInternEmployees = (
  tenantId: string,
  filters?: IInternFilters,
  token?: string,
) =>
  get<{ data: IInternEmployee[]; meta: any }>(
    '/v1/employees/intern/list',
    filters as Params,
    tenantId,
    { bearerToken: token, isFetchToken: !token },
  );

export const convertIntern = (
  tenantId: string,
  employeeId: string,
  payload: IConvertInternPayload,
  token?: string,
) =>
  post<{ success: boolean; message: string; data: any }>(
    `/v1/employees/intern/${employeeId}/convert`,
    payload,
    undefined,
    tenantId,
    { bearerToken: token, isFetchToken: !token },
  );

export const extendInternship = (
  tenantId: string,
  employeeId: string,
  payload: IExtendInternPayload,
  token?: string,
) =>
  post<{ success: boolean; message: string; data: any }>(
    `/v1/employees/intern/${employeeId}/extend`,
    payload,
    undefined,
    tenantId,
    { bearerToken: token, isFetchToken: !token },
  );

export const terminateInternship = (
  tenantId: string,
  employeeId: string,
  payload: ITerminateInternPayload,
  token?: string,
) =>
  post<{ success: boolean; message: string; data: any }>(
    `/v1/employees/intern/${employeeId}/terminate`,
    payload,
    undefined,
    tenantId,
    { bearerToken: token, isFetchToken: !token },
  );
