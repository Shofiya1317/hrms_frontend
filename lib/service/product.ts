import {
  get, post, put, deleteRequest,
} from '../axiosInstance';
import { Params } from '../utils';

export interface IProduct {
  id?: string;
  product_code: string;
  product_name: string;
  product_category?: IProductCategory | string;
  business_unit?: IBusinessUnit | string;
  site?: ISite | string;
  description: string;
  vendor_ids?: IVendor[];
  product_vendors?: Array<{
    id: string;
    vendor: IVendor;
    product: IProduct;
  }>;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
  is_deleted?: boolean;
  deleted_at?: string | null;
}

export interface IVendor {
  id?: string;
  company_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  vendor_type?: string;
  sector?: string;
  industry?: string;
  due_date?: string;
  vendor_category?: {
    id: string;
    name: string;
    description?: string;
  };
  product_vendors?: {
    id: string;
    product: {
      id: string;
      product_code: string;
      product_name: string;
      status: string;
    };
  }[];
  status?: 'ACTIVE' | 'INACTIVE';
  rating?: 'A' | 'B' | 'C' | 'D';
  invitation_status?: 'INVITED' | 'PENDING' | 'COMPLETED';
  sku_count?: number;
  last_updated?: string;
  createdAt?: string;
  updatedAt?: string;
  is_deleted?: boolean;
  deleted_at?: string | null;
}

export interface IProductCategory {
  id: string;
  name: string;
}

export interface IBusinessUnit {
  id: string;
  name: string;
  sites?: {
    id: string;
    name: string;
    location: string;
  }[];
}

export interface ISite {
  id: string;
  name: string;
  location: string;
}

export const getAllProducts = (
  params?: Params,
  tenantId?: string,
  apiKey?: string,
  token?: string,
) => get('/v1/products', params, tenantId, {
  basicToken: apiKey,
  bearerToken: token,
  isFetchToken: !apiKey && !token,
});

export const getProductById = (
  id: string,
  tenantId?: string,
  token?: string,
) => get(`/v1/product/${id}`, undefined, tenantId, {
  bearerToken: token,
  isFetchToken: !token,
});

export const createProduct = (
  product: IProduct,
  tenantId?: string,
  apiKey?: string,
  token?: string,
) => post('/v1/products', product, undefined, tenantId, {
  basicToken: apiKey,
  bearerToken: token,
  isFetchToken: !apiKey && !token,
});

export const updateProduct = (
  id: string,
  product: Partial<IProduct>,
  tenantId?: string,
  token?: string,
) => put(`/v1/product/${id}`, product, undefined, tenantId, {
  bearerToken: token,
  isFetchToken: !token,
});

export const deleteProduct = (
  id: string,
  tenantId?: string,
  token?: string,
) => deleteRequest(`/v1/product/${id}`, undefined, tenantId, undefined, {
  bearerToken: token,
  isFetchToken: !token,
});

export const getVendors = (
  tenantId?: string,
  apiKey?: string,
  token?: string,
) => get('/v1/vendors', undefined, tenantId, {
  basicToken: apiKey,
  bearerToken: token,
  isFetchToken: !apiKey && !token,
});

export const createVendor = (
  vendor: IVendor,
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
) => put(`/v1/vendor/${id}`, vendor, undefined, tenantId, {
  bearerToken: token,
  isFetchToken: !token,
});

export const deleteVendor = (
  id: string,
  tenantId?: string,
  token?: string,
) => deleteRequest(`/v1/vendor/${id}`, undefined, tenantId, undefined, {
  bearerToken: token,
  isFetchToken: !token,
});

export const getProductCategories = (
  tenantId?: string,
  apiKey?: string,
  token?: string,
) => get('/v1/productcategories', undefined, tenantId, {
  basicToken: apiKey,
  bearerToken: token,
  isFetchToken: !apiKey && !token,
});

export const getBusinessUnits = (
  tenantId?: string,
  apiKey?: string,
  token?: string,
) => get('/v1/businessunit', undefined, tenantId, {
  basicToken: apiKey,
  bearerToken: token,
  isFetchToken: !apiKey && !token,
});

export const getSectors = (
  tenantId?: string,
  apiKey?: string,
  token?: string,
) => get('/v1/sector', undefined, tenantId, {
  basicToken: apiKey,
  bearerToken: token,
  isFetchToken: !apiKey && !token,
});

export const getVendorCategories = (
  tenantId?: string,
  apiKey?: string,
  token?: string,
) => get('/v1/vendor-categories', undefined, tenantId, {
  basicToken: apiKey,
  bearerToken: token,
  isFetchToken: !apiKey && !token,
});
