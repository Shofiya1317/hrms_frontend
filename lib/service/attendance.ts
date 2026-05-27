import {
  get, post, put, deleteRequest,
} from '../axiosInstance';
import { Params } from '../utils';

export interface IAttendancePayload {
  employee_id: string;
  date: string;
  check_in: string;
  check_out: string;
  status: string;
  remarks?: string;
}

export const createAttendance = (
  body: IAttendancePayload,
  tenantId: string,
  token?: string,
) => post(
  '/v1/attendance',
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getAttendances = (
  tenantId: string,
  params?: Params,
  token?: string,
) => get(
  '/v1/attendance',
  params,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getAttendanceById = (
  id: string,
  tenantId: string,
  token?: string,
) => get(
  `/v1/attendance/${id}`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const updateAttendance = (
  id: string,
  body: Partial<IAttendancePayload>,
  tenantId: string,
  token?: string,
) => put(
  `/v1/attendance/${id}`,
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const deleteAttendance = (
  id: string,
  tenantId: string,
  token?: string,
) => deleteRequest(
  `/v1/attendance/${id}`,
  undefined,
  tenantId,
  undefined,
  { bearerToken: token, isFetchToken: !token },
);
