import {
  get, post, put, deleteRequest,
} from '../axiosInstance';
import { Params } from '../utils';

export const getAllProducts = (
  params?: Params,
  tenantId?: string,
  token?: string,
) => get('/v1/products', params, tenantId, {
  bearerToken: token,
  isFetchToken: !token,
});

export const getProductById = (
  id: string,
  tenantId?: string,
  token?: string,
) => get(`/v1/products/${id}`, undefined, tenantId, {
  bearerToken: token,
  isFetchToken: !token,
});

export const createProduct = (
  product: {
    product_code: string;
    product_name: string;
    product_category: string;
    business_unit: string;
    site: string;
    description?: string;
    vendor_ids: string[];
    status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  },
  tenantId?: string,
  token?: string,
) => post('/v1/products', product, undefined, tenantId, {
  bearerToken: token,
  isFetchToken: !token,
});

export const updateProduct = (
  id: string,
  product: {
    product_code?: string;
    product_name?: string;
    product_category?: string;
    business_unit?: string;
    site?: string;
    description?: string;
    vendor_ids?: string[];
    status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  },
  tenantId?: string,
  token?: string,
) => put(`/v1/products/${id}`, product, undefined, tenantId, {
  bearerToken: token,
  isFetchToken: !token,
});

export const deleteProduct = (
  id: string,
  tenantId?: string,
  token?: string,
) => deleteRequest(`/v1/products/${id}`, undefined, tenantId, undefined, {
  bearerToken: token,
  isFetchToken: !token,
});

export const getBusinessUnits = (
  tenantId?: string,
  token?: string,
) => get('/v1/businessunit', undefined, tenantId, {
  bearerToken: token,
  isFetchToken: !token,
});

// Product category API

export const createProductCategory = (
  category: { name: string; description?: string },
  tenantId?: string,
) => post('/v1/productcategories', category, undefined, tenantId, {
  basicToken: undefined,
  bearerToken: undefined,
  isFetchToken: true,
});

export const getProductCategories = (
  tenantId?: string,
  token?: string,
) => get('/v1/productcategories', undefined, tenantId, {
  bearerToken: token,
  isFetchToken: !token,
});
