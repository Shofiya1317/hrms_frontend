/* eslint-disable camelcase */

import { TaskStatus } from '@/lib/interface/ITask.interface';
import { get, post, put } from '../axiosInstance';
// import { Params } from '../utils';

export const getAdminStandards = (tenantId?: string, token?: string) => get('/v1/tasks/admin/standards', undefined, tenantId, {
  bearerToken: token,
  isFetchToken: !token,
});

export const createTask = (
  tasks: {
    due_date: string;
    product_id: string;
    vendor_id: string;
    admin_standard_id: string;
  }[],
  financialYear: string,
  tenantId: string,
  token?: string,
) => post(
  '/v1/tasks',
  { tasks, financial_year: financialYear },
  undefined,
  tenantId,
  {
    bearerToken: token,
    isFetchToken: !token,
  },
);

export const getAllTasks = (tenantId: string, token: string) => get('/v1/tasks', undefined, tenantId, {
  bearerToken: token,
  isFetchToken: !token,
});

export const getTaskById = (
  id: string,
  tenantId: string,
  token?: string,
  lang?: string,
) => {
  const url = lang ? `/v1/tasks/${id}?lang=${lang}` : `/v1/tasks/${id}`;
  return get(url, undefined, tenantId, {
    bearerToken: token,
    isFetchToken: !token,
  });
};

export const updateTaskAnswers = (
  id: string,
  answers: {
    question_id: string;
    option_id: string;
    answer_value: string;
    question_type: string;
    frequency_month: string;
    VUID: string;
  }[],
  tenantId: string,
  token?: string,
) => put(`/v1/tasks/${id}/answers`, { answers }, undefined, tenantId, {
  bearerToken: token,
  isFetchToken: !token,
});

type GetTasksParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  vendorId?: string;
  productId?: string;
  sortBy?: string;
  sortOrder?: string;
};

export const getTaskByUserId = (
  id: string,
  tenantId: string,
  params?: GetTasksParams,
  token?: string,
) => get(`/v1/tasks/user/${id}`, params, tenantId, {
  bearerToken: token,
  isFetchToken: !token,
});

export const getTaskDashboardStats = (tenantId: string, token?: string) => get('/v1/tasks/dashboard/stats', undefined, tenantId, {
  bearerToken: token,
  isFetchToken: !token,
});

export const updateTaskStatus = (
  id: string,
  status: TaskStatus,
  tenantId: string,
  token?: string,
) => put(
  `/v1/tasks/${id}/status`,
  { status }, // ✅ correct request body
  undefined,
  tenantId,
  {
    bearerToken: token,
    isFetchToken: !token,
  },
);

export const getTaskScores = (id: string, tenantId: string, token?: string) => get(`/v1/tasks/${id}/scores`, undefined, tenantId, {
  bearerToken: token,
  isFetchToken: !token,
});

export const uploadTaskFile = (file: FormData, tenantId?: string) => post('/v1/tasks/file_upload', file, undefined, tenantId, {
  contentType: 'multipart/form-data',
});

export const getSignedUrl = (tenantId: string, token?: string, url?: string) => get(
  `/v1/tasks/signed-url?url=${encodeURIComponent(url || '')}`,
  undefined,
  tenantId,
  {
    bearerToken: token,
    isFetchToken: !token,
  },
);

export const getTenantStandards = (tenantId: string, token?: string) => get('/v1/tenant-standards', undefined, tenantId, {
  bearerToken: token,
  isFetchToken: !token,
});

export const getStandardThemes = (tenantId: string, token?: string) => get('/v1/tenant-standards/tenant/themes', undefined, tenantId, {
  bearerToken: token,
  isFetchToken: !token,
});

export const getVendorAnalytics = (tenantId: string, token?: string) => get('/v1/tasks/analytics/vendors', undefined, tenantId, {
  bearerToken: token,
  isFetchToken: !token,
});

type VendorPortfolioFilters = {
  years?: string[];
  vendors?: string[];
  vendorCategories?: string[];
  tenantStandards?: string[];
};

export const getVendorPortfolio = (
  tenantId: string,
  token?: string,
  filters?: VendorPortfolioFilters,
) => get('/v1/tasks/vendors/portfolio/overview', filters, tenantId, {
  bearerToken: token,
  isFetchToken: !token,
});

export const getVendorPerformance = (
  tenantId: string,
  token?: string,
  filters?: VendorPortfolioFilters,
) => get('/v1/tasks/vendors/performance/category', filters, tenantId, {
  bearerToken: token,
  isFetchToken: !token,
});

type VendorRatings = {
  limit?: number;
  themeId?: string[];
  sortBy?: string;
};

export const getVendorRating = (
  tenantId: string,
  token?: string,
  filters?: VendorRatings,
) => get('/v1/tasks/vendors/top-performers', filters, tenantId, {
  bearerToken: token,
  isFetchToken: !token,
});

export const getMetricsDashboard = (
  tenantId: string,
  token?: string,
  themeId?: string,
) => get(
  '/v1/tasks/vendors/sustainability/metrics-dashboard',
  { themeId },
  tenantId,
  {
    bearerToken: token,
    isFetchToken: !token,
  },
);

export const getSKUPortfolio = (
  tenantId: string,
  token?: string,
  standard_id?: string,
  product_category_id?: string,
  financial_year?: string,
) => get(
  '/v1/tasks/analytics/sku/portfolio-overview',
  { standard_id, product_category_id, financial_year },
  tenantId,
  {
    bearerToken: token,
    isFetchToken: !token,
  },
);

export const getSKUPerformance = (
  tenantId: string,
  token?: string,
  standard_id?: string,
  product_category_id?: string,
  financial_year?: string,
) => get(
  '/v1/tasks/analytics/sku/category-performance',
  { standard_id, product_category_id, financial_year },
  tenantId,
  {
    bearerToken: token,
    isFetchToken: !token,
  },
);

export const getVendorContribution = (
  tenantId: string,
  token?: string,
  standard_id?: string,
  product_category_id?: string,
  financial_year?: string,
) => get(
  '/v1/tasks/analytics/sku/vendor-contribution',
  { standard_id, product_category_id, financial_year },
  tenantId,
  {
    bearerToken: token,
    isFetchToken: !token,
  },
);

export const getSKUTrendAnalysis = (
  tenantId: string,
  token?: string,
  standard_id?: string,
  product_category_id?: string,
  financial_year?: string,
) => get(
  '/v1/tasks/analytics/sku/trend-analysis',
  { standard_id, product_category_id, financial_year },
  tenantId,
  {
    bearerToken: token,
    isFetchToken: !token,
  },
);

type CockpitOverviewFilters = {
  rating?: string;
  vendorCategory?: string;
  financialYear?: string;
};

export const getCockpitOverview = (
  tenantId: string,
  token?: string,
  filters?: CockpitOverviewFilters,
) => get('/v1/tasks/dashboard/cockpit-overview', filters, tenantId, {
  bearerToken: token,
  isFetchToken: !token,
});

export const getVendorCockpit = (tenantId: string, token?: string) => get('/v1/tasks/vendor/dashboard', undefined, tenantId, {
  bearerToken: token,
  isFetchToken: !token,
});
