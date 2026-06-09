import {
  get, post, patch, deleteRequest,
} from '../axiosInstance';

export type HolidayType = 'public' | 'optional' | 'restricted';

export interface IHolidayPayload {
  name: string;
  date: string;
  holiday_type: HolidayType;
  description?: string;
  is_active: boolean;
}

export interface IHoliday {
  id: string;
  name: string;
  date: string;
  holiday_type: HolidayType;
  description?: string;
  is_active: boolean;
  is_synced: boolean;
  base_record_id: string | null;
  created_by?: string;
  is_deleted?: boolean;
  deleted_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const getHolidaysByYear = (
  year: number,
  tenantId: string,
  token?: string,
) => get(
  `/v1/company-holidays/year/${year}`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getHolidayById = (
  id: string,
  tenantId: string,
  token?: string,
) => get(
  `/v1/company-holidays/${id}`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const createHoliday = (
  body: IHolidayPayload,
  tenantId: string,
  token?: string,
) => post(
  '/v1/company-holidays',
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const updateHoliday = (
  id: string,
  body: Partial<IHolidayPayload>,
  tenantId: string,
  token?: string,
) => patch(
  `/v1/company-holidays/${id}`,
  body,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const deleteHoliday = (
  id: string,
  tenantId: string,
  token?: string,
) => deleteRequest(
  `/v1/company-holidays/${id}`,
  undefined,
  tenantId,
  undefined,
  { bearerToken: token, isFetchToken: !token },
);

export const bulkImportHolidays = (
  body: { year: number; holiday_ids: string[] },
  tenantId: string,
  token?: string,
) => post(
  '/v1/company-holidays/import',
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);
