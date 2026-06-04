import {
  get, post, put, deleteRequest,
} from '../axiosInstance';

// ── Departments ───────────────────────────────────────────────────

export const createDepartment = (
  body: { name: string; [key: string]: unknown },
  tenantId: string,
  token?: string,
) => post(
  '/v1/departments',
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getDepartments = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/departments',
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getDepartmentById = (
  id: string,
  tenantId: string,
  token?: string,
) => get(
  `/v1/departments/${id}`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const updateDepartment = (
  id: string,
  body: { name: string; [key: string]: unknown },
  tenantId: string,
  token?: string,
) => put(
  `/v1/departments/${id}`,
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const deleteDepartment = (
  id: string,
  tenantId: string,
  token?: string,
) => deleteRequest(
  `/v1/departments/${id}`,
  undefined,
  tenantId,
  undefined,
  { bearerToken: token, isFetchToken: !token },
);

// ── Industries ────────────────────────────────────────────────────

export const createIndustry = (
  body: { name: string; [key: string]: unknown },
  tenantId: string,
  token?: string,
) => post(
  '/v1/industries',
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getIndustries = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/industries',
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getIndustryById = (
  id: string,
  tenantId: string,
  token?: string,
) => get(
  `/v1/industries/${id}`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const updateIndustry = (
  id: string,
  body: { name: string; [key: string]: unknown },
  tenantId: string,
  token?: string,
) => put(
  `/v1/industries/${id}`,
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const deleteIndustry = (
  id: string,
  tenantId: string,
  token?: string,
) => deleteRequest(
  `/v1/industries/${id}`,
  undefined,
  tenantId,
  undefined,
  { bearerToken: token, isFetchToken: !token },
);

// ── Work Schedules ───────────────────────────────────────────────

export const createWorkSchedule = (
  body: { name: string; [key: string]: unknown },
  tenantId: string,
  token?: string,
) => post(
  '/v1/work-schedules',
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getWorkSchedules = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/work-schedules',
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getWorkScheduleById = (
  id: string,
  tenantId: string,
  token?: string,
) => get(
  `/v1/work-schedules/${id}`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const updateWorkSchedule = (
  id: string,
  body: { name: string; [key: string]: unknown },
  tenantId: string,
  token?: string,
) => put(
  `/v1/work-schedules/${id}`,
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const deleteWorkSchedule = (
  id: string,
  tenantId: string,
  token?: string,
) => deleteRequest(
  `/v1/work-schedules/${id}`,
  undefined,
  tenantId,
  undefined,
  { bearerToken: token, isFetchToken: !token },
);

// ── Shifts ────────────────────────────────────────────────────────

export const createShift = (
  body: { name: string; [key: string]: unknown },
  tenantId: string,
  token?: string,
) => post(
  '/v1/shifts',
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getShifts = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/shifts',
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getShiftById = (
  id: string,
  tenantId: string,
  token?: string,
) => get(
  `/v1/shifts/${id}`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const updateShift = (
  id: string,
  body: { name: string; [key: string]: unknown },
  tenantId: string,
  token?: string,
) => put(
  `/v1/shifts/${id}`,
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const deleteShift = (
  id: string,
  tenantId: string,
  token?: string,
) => deleteRequest(
  `/v1/shifts/${id}`,
  undefined,
  tenantId,
  undefined,
  { bearerToken: token, isFetchToken: !token },
);
// ── Employment type ────────────────────────────────────────────────────────

export const createEmploymentType = (
  body: { name: string; [key: string]: unknown },
  tenantId: string,
  token?: string,
) => post(
  '/v1/employment-types',
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getEmploymentTypes = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/employment-types',
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getEmploymentTypeById = (
  id: string,
  tenantId: string,
  token?: string,
) => get(
  `/v1/employment-types/${id}`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const updateEmploymentType = (
  id: string,
  body: { name: string; [key: string]: unknown },
  tenantId: string,
  token?: string,
) => put(
  `/v1/employment-types/${id}`,
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const deleteEmploymentType = (
  id: string,
  tenantId: string,
  token?: string,
) => deleteRequest(
  `/v1/employment-types/${id}`,
  undefined,
  tenantId,
  undefined,
  { bearerToken: token, isFetchToken: !token },
);
