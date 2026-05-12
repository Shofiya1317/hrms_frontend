/* =========================
   Shared / Base
========================= */

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  is_deleted: boolean;
  deleted_at: string | null;
}

/* =========================
   Product
========================= */

export interface BusinessUnit extends BaseEntity {
  name: string;
}

export interface Site extends BaseEntity {
  name: string;
  location: string;
}

export interface Product extends BaseEntity {
  product_code: string;
  product_name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  business_unit: BusinessUnit;
  site: Site;
}

/* =========================
   Vendor
========================= */

export interface Vendor extends BaseEntity {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  vendor_type: string;
  sector: string; // IDs, not objects
  industry: string; // IDs, not objects
  due_date: string;
}

/* =========================
   Standard Question Option
========================= */

export interface StandardQuestionOption extends BaseEntity {
  text: string;
  value: string;
  weightage: string;
  admin_option_id: string;
}

/* =========================
   Standard Question
========================= */

export type IQuestionType =
  | 'TEXT'
  | 'MULTI_SELECT'
  | 'SINGLE_SELECT'
  | 'NUMBER'
  | 'DATE'
  | 'FILE'
  | 'URL'
  | 'MIXED_TYPE';

export interface DependentQuestionRule extends BaseEntity {
  parent_question: {
    id: string;
    title: string;
  };
  parent_option: {
    id: string;
    text: string;
    value: string;
    weightage: string;
    admin_option_id: string;
  };
  admin_rule_id: string;
}

export interface StandardQuestion extends BaseEntity {
  title: string;
  sequence: number;
  weightage: number;
  description: string;
  question_type: IQuestionType;
  placeholder: string;
  is_dependent: boolean | null;
  universal_question_id: string;
  is_latest_data: boolean;
  min_range: string;
  max_range: string;
  admin_question_id: string;
  master_question_id: string;
  is_added_sequence: boolean;
  standard_question_options: StandardQuestionOption[];
  mixed_questions: [];
  dependent_questions: DependentQuestionRule[];
}

/* =========================
   Standard Indicator
========================= */

export interface StandardIndicator extends BaseEntity {
  name: string;
  sequence: number;
  weightage: number;
  description: string;
  admin_indicator_id: string;
  master_indicator_id: string;
  standard_questions: StandardQuestion[];
}

/* =========================
   Standard Theme
========================= */

export interface StandardTheme extends BaseEntity {
  name: string;
  description: string;
  sequence: number;
  weightage: number;
  admin_theme_id: string;
  master_theme_id: string;
  standard_indicators: StandardIndicator[];
}

/* =========================
   Tenant Standard
========================= */

export interface TenantStandard extends BaseEntity {
  name: string;
  description: string;
  logo_url: string;
  is_weightage: boolean;
  is_active: boolean;
  admin_standard_id: string;
  last_synced_at: string;
  standard_themes: StandardTheme[];
}

/* =========================
   Question Answer
========================= */

export interface QuestionAnswer extends BaseEntity {
  answer_value: string | null;
  question_type: string;
  option_id: string | null;
  frequency_month: string;
  VUID: string;
  question_id: {
    id: string;
  };
}

/* =========================
   Task (MAIN)
========================= */

export interface ITask extends BaseEntity {
  financial_year: string;
  status: TaskStatus;
  due_date: string;
  admin_standard_id: string;

  product: Product;
  vendor: Vendor;
  tenant_standard: TenantStandard;
  question_answers: QuestionAnswer[];
  standardScore?: number;
progressPercentage: number;
}

/* =========================
   API Wrapper
========================= */

export interface TaskListResponse {
  tasks: ITask[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IVendorStats {
  total: number;
  active: number;
}

export interface IProductStats {
  total: number;
  active: number;
}

export interface ITaskStats {
  total: number;
  completed: number;
  in_progress: number;
  pending: number;
  overdue: number;
  completion_rate: number;
}

export interface IVendorDetail {
  vendor_id: string;
  vendor_name: string;
  total_tasks: number;
  completed: number;
  in_progress: number;
  pending: number;
  overdue: number;
  completion_rate: number;
}

export interface ITaskDashboardStats {
  vendors: IVendorStats;
  products: IProductStats;
  tasks: ITaskStats;
  vendor_details: IVendorDetail[];
}
export interface IThemeScore {
  theme_id: string;
  theme_name: string;
  score: number;
}

export interface IPerformanceSummary {
  overall_sustainability_score: number;
  theme_scores: IThemeScore[];
}

export interface IProgressTracking {
  overall_completion_rate: number;
  total: number;
  completed: number;
  in_progress: number;
  pending: number;
}

export interface ISustainabilityData {
  performance_summary: IPerformanceSummary;
  progress_tracking: IProgressTracking;
}
