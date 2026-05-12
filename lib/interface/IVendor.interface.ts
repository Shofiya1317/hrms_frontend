export interface IVendor {
  id: string;
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

export interface QuestionnaireStatus {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
}

export interface PerformanceDistributionItem {
  name: string;
  value: number;
  percentage: number;
}

export interface CategoryPerformanceItem {
  category: string;
  vendorCount: number;
  avgScore: number;
}

export interface VendorPortfolioOverviewResponse {
  totalVendors: number;
  activeQuestionnaires: number;
  questionnaireStatus: QuestionnaireStatus;
  averageCompliance: number;
  performanceDistribution: PerformanceDistributionItem[];
  categoryPerformance: CategoryPerformanceItem[];
}

export interface VendorRatingsResponse {
  topPerformingVendors: {
    rank: number;
    vendorId: string;
    vendorName: string;
    overallScore: number;
    rating: string;
    trend: number;
    themeScores: {
      themeName: string;
      score: number;
    }[];
  }[];

  categoryLeaders: {
    indicatorName: string;
    vendorId: string;
    vendorName: string;
    score: number;
  }[];

  ratingDistribution: {
    rating: string;
    vendorCount: number;
  }[];
}

export interface MetricsDashboardResponse {
  themes: {
    themeId: string;
    themeName: string;
    description: string | null;
    score: number;
    trend: number;
  }[];

  detailedThemeData: {
    themeId: string;
    themeName: string;
    description: string;
    overallScore: number;

    performanceDistribution: {
      label: string;
      value: number;
      percentage: number;
    }[];

    indicators: {
      indicatorId: string;
      indicatorName: string;
      currentScore: number;
      targetScore: number;
    }[];
  };
}

export interface PerformanceCategoryResponse {
  standardName: string;
  categories: {
    categoryName: string;
    avgScore: number;
    responseRate: number;
    trend: number;
    topPerformers: number;
    needsImprovement: number;
  }[];
  performanceTrends: {
    categoryName: string;
    data: {
      year: string;
      score: number;
    }[];
  }[];
}
