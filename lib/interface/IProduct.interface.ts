import { IVendor } from './IVendor.interface';

export interface IProduct {
  id?: string;
  product_code: string;
  product_name: string;
  product_category?: IProductCategory | string;
  business_unit?: IBusinessUnit | string;
  site?: ISite | string;
  description: string;
  vendor_ids?: IVendor[];
  product_vendors?: unknown[];
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
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

export interface SKUPortfolioResponse {
  summary: {
    total_skus: number;
    categories_count: number;
    active_vendors_count: number;
    avg_sustainability_score: number;
    theme_scores: Record<string, number>;
  };
  performance_distribution: {
    label: string;
    value: number;
    percentage: number;
  }[];
  portfolio_risk_signals: {
    high_risk: number;
    medium_risk: number;
    low_risk: number;
  };
  category_breakdown: {
    category_id: string;
    category_name: string;
    sku_count: number;
    avg_score: number;
    themes: Record<string, number>;
  }[];
}
export interface SKUPerformanceResponse {
  summary: {
    category_name: string;
    total_skus: number;
    avg_score: number;
    trend: string; // e.g., "N/A" or real trend
    category_rank: string; // e.g., "N/A" or rank
  };

  sustainability_metrics: Array<{
    theme_name: string;
    score: number;
  }>;

  score_evolution: Array<{
    financial_year: string;
    avg_score: number;
    [theme: string]: string | number; // dynamic theme keys
  }>;

  cross_category_comparison: Array<{
    category_id: string;
    category_name: string;
    sku_count: number;
    avg_score: number;
    themes: Array<{
      theme_name: string;
      score: number;
    }>;
  }>;
}

export interface VendorListItem {
  rank: number;
  vendor_id: string;
  vendor_name: string;
  sku_count: number;
  avg_score: number;
  portfolio_percentage: number;
}
