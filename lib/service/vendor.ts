import {
  get, post, put, deleteRequest,
} from '../axiosInstance';
import { IVendor } from '../interface/IVendor.interface';
import { Params } from '../utils';

interface CreateVendorPayload {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  vendor_category: string;
  products: string[];
  due_date: string;
  vendor_type: string;
  sector: string;
  industry: string;
  status: string;
}

export const createVendor = (
  vendor: CreateVendorPayload,
  tenantId?: string,
  apiKey?: string,
  token?: string,
) => post('/v1/vendors', vendor, undefined, tenantId, {
  basicToken: apiKey,
  bearerToken: token,
  isFetchToken: !apiKey && !token,
});

export const updateVendor = (
  id: string,
  vendor: Partial<IVendor>,
  tenantId?: string,
  token?: string,
) => put(`/v1/vendors/${id}`, vendor, undefined, tenantId, {
  bearerToken: token,
  isFetchToken: !token,
});

export const deleteVendor = (id: string, tenantId?: string, token?: string) => deleteRequest(`/v1/vendors/${id}`, undefined, tenantId, undefined, {
  bearerToken: token,
  isFetchToken: !token,
});

export const getSectors = (
  tenantId?: string,
  apiKey?: string,
  token?: string,
) => get('/v1/admin/sector', undefined, tenantId, {
  basicToken: apiKey,
  bearerToken: token,
  isFetchToken: !apiKey && !token,
});

// VendorcategoryAPI

export const getVendorCategories = (tenantId?: string, token?: string) => get('/v1/vendor-categories', undefined, tenantId, {
  bearerToken: token,
  isFetchToken: !token,
});

export const createVendorCategory = (
  category: { name: string; description?: string },
  tenantId?: string,
) => post('/v1/vendor-categories', category, undefined, tenantId, {
  basicToken: undefined,
  bearerToken: undefined,
  isFetchToken: true,
});

export const getVendorComparison = (
  vendorIds: string[],
  categoryId: string,
  rating: string,
  tenantId?: string,
  token?: string,
) => {
  const params = new URLSearchParams();
  vendorIds.forEach((id) => params.append('vendorIds', id));
  if (categoryId) params.append('categoryId', categoryId);
  if (rating) params.append('rating', rating);

  return get(
    `/v1/tasks/vendors/comparison?${params.toString()}`,
    undefined,
    tenantId,
    {
      bearerToken: token,
      isFetchToken: !token,
    },
  );
};

export interface GetVendorsParams extends Params {
  page?: number;
  limit?: number;
  vendor_name?: string;
  vendor_category?: string;
  rating?: string;
  status?: string;
}

export const getVendors = (params?: GetVendorsParams, tenantId?: string, token?: string) => get('/v1/vendors', params, tenantId, {
  bearerToken: token,
  isFetchToken: !token,
});

export const getVendorById = (tenantId: string, id: string, token?: string) => get(`/v1/vendors/${id}`, undefined, tenantId, {
  bearerToken: token,
  isFetchToken: !token,
});
