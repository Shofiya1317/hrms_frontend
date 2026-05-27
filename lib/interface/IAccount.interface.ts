import { IUser } from './IUser.interface';

export interface IBusinessUnitSite {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  location: string;
  site_url: string;
  site_type: string;
  is_delete: boolean;
}

export interface IBusinessUnit {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  is_delete: boolean;
  delete_at: string;
  sites: IBusinessUnitSite[];
}

export interface ISite {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  location: string;
  site_url: string;
  site_type: string;
  is_delete: boolean;
  business_unit: IBusinessUnit;
}

export interface IOnboardingStatus {
  current_step: number;
  onboarding_step: number;
  onboarding_completed: boolean;
  step1_company_details_completed: boolean;
  step2_master_data_completed: boolean;
  next_step: number;
  progress_percentage: number;
}

export interface IAccount {
  id: string;
  createdAt: string;
  updatedAt: string;
  is_deleted: boolean;
  deleted_at: string | null;

  // Identity
  name?: string;
  account_name: string;
  slug: string;
  email: string;
  company_name: string;
  company_code: string | null;
  api_key: string;

  // Contact & web
  website_url: string | null;
  website: string | null;
  official_email_id: string | null;
  phone_number: string | null;

  // Financial / legal
  tax_id: string | null;
  cin_number?: string | null;
  incorporated_year?: string | null;

  // Classification
  industry: string | null;
  industries: string[] | null;
  sectors: string[] | null;
  standards: string[] | null;
  company_size: string | null;

  // Location
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  address_line1: string | null;
  address_line2: string | null;
  pincode: string | null;

  // Settings
  timezone: string | null;
  date_format: string | null;
  financial_year_start: string | null;
  work_week_starts_on: string | null;
  currency: string | null;
  brand_color: string | null;

  // Branding
  logo_path: string | null;
  logo_url: string | null;

  // Default policy / schedule IDs
  holiday_calendar_id: string | null;
  default_shift_id: string | null;
  default_work_schedule_id: string | null;
  default_leave_policy_id: string | null;
  default_attendance_policy_id: string | null;
  leave_policy_id: string | null;
  attendance_policy_id: string | null;
  work_schedule_id: string | null;

  // Onboarding
  onboarding_completed: boolean;
  onboarding_step: number;
  current_onboarding_stage: number;
  onboarding_status: IOnboardingStatus | null;
  invitation_sent_at: string | null;
  invitation_token: string | null;

  // Organisation setup (arrays of IDs)
  work_location_ids: string[] | null;
  department_ids: string[] | null;
  shift_ids: string[] | null;
  work_schedule_ids: string[] | null;

  // Legacy / extra
  status?: string;
  reason?: string | null;
  blocked_on?: string | null;
  blocked_by?: string | null;
  suspend_by?: string | null;
  suspend_on?: string | null;
  suspend_reason?: string | null;
  createdBy?: IUser | null;
  business_unit?: IBusinessUnit[];
}