import {
  get, post, put, deleteRequest,
} from '../axiosInstance';
import { Params } from '../utils';

export interface InviteEmployeeDto {
  email: string;
  role: 'EMPLOYEE' | 'HR_ADMIN';
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: string;
  personal_phone?: string;
  department_id: string;
  designation_id?: string;
  employment_type_id: string;
  reporting_manager_id?: string | '';
  shift_id?: string;
  date_of_joining: string;
}

export const createEmployee = (
  body: InviteEmployeeDto,
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
  body: Partial<InviteEmployeeDto>,
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

