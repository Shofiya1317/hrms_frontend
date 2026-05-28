import {
  get, post, put, deleteRequest,
} from '../axiosInstance';
import { Params } from '../utils';

export interface IEmployeePayload {
  email?: string;
  role?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: string;
  personal_phone?: string;
  personal_email?: string;
  blood_group?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  department_id?: string;
  designation_id?: string;
  employment_type_id?: string;
  grade_id?: string;
  shift_id?: string;
  work_location_id?: string;
  leave_policy_id?: string;
  reporting_manager_id?: string;
  work_email?: string;
  pan_number?: string;
  aadhaar_number?: string;
  uan_number?: string;
  esic_number?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_ifsc_code?: string;
  bank_branch?: string;
  emergency_contact_name?: string;
  emergency_contact_relationship?: string;
  emergency_contact_phone?: string;
  employment_status?: string;
  date_of_joining?: string;
}

export const createEmployee = (
  body: IEmployeePayload,
  tenantId: string,
  token?: string,
) => post(
  '/v1/employees/invite',
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getEmployees = (
  tenantId: string,
  params?: Params,
  token?: string,
) => get(
  '/v1/employees',
  params,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getInviteMasterData = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/employees/invite/master-data',
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getEmployeeById = (
  id: string,
  tenantId: string,
  token?: string,
) => get(
  `/v1/employees/${id}`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const updateEmployee = (
  id: string,
  body: Partial<IEmployeePayload>,
  tenantId: string,
  token?: string,
) => put(
  `/v1/employees/${id}`,
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const deleteEmployee = (
  id: string,
  tenantId: string,
  token?: string,
) => deleteRequest(
  `/v1/employees/${id}`,
  undefined,
  tenantId,
  undefined,
  { bearerToken: token, isFetchToken: !token },
);

