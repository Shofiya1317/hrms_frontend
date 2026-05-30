import {
  get, post, put, deleteRequest,
} from '../axiosInstance';
import { Params } from '../utils';

export interface ICheckInPayload {
  attendance_date: string;
  shift_id?: string;
  check_in_time: string;
  check_in_lat?: number;
  check_in_lng?: number;
  check_in_location_name?: string;
  check_in_method?: string;
  check_in_within_geofence?: boolean;
  check_in_distance_meters?: number;
  check_in_device_info?: string;
  check_in_photo_url?: string;
}

export interface ICheckOutPayload {
  check_out_time: string;
  check_out_lat?: number;
  check_out_lng?: number;
  check_out_location_name?: string;
  check_out_method?: string;
  check_out_within_geofence?: boolean;
  check_out_distance_meters?: number;
  check_out_photo_url?: string;
}

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

export const checkIn = (
  body: ICheckInPayload,
  tenantId: string,
  token?: string,
) => post(
  '/v1/attendance/check-in',
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const checkOut = (
  id: string,
  body: ICheckOutPayload,
  tenantId: string,
  token?: string,
) => put(
  `/v1/attendance/${id}/check-out`,
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);
