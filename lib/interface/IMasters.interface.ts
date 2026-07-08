export interface IDepartment {
  id: string;
  createdAt: string;
  updatedAt: string;
  is_deleted: boolean;
  deleted_at: string | null;
  is_global: boolean;
  tenant_id: string | null;
  source_id: string | null;
  name: string;
  description: string;
  code: string;
  source: string;
  editable: boolean;
  deletable: boolean;
}

export interface IIndustry {
  id: string;
  createdAt: string;
  updatedAt: string;
  is_deleted: boolean;
  deleted_at: string | null;
  name: string;
  sector: string;
  description: string;
}

export interface IShift {
  id: string;
  createdAt: string;
  updatedAt: string;
  is_deleted: boolean;
  deleted_at: string | null;
  is_global: boolean;
  tenant_id: string | null;
  source_id: string | null;
  name: string;
  description: string;
  start_time: string | null;
  end_time: string | null;
  shift_type: 'FIXED' | 'FLEXIBLE';
  flex_start_time: string | null;
  flex_end_time: string | null;
  required_work_hours: number | null;
  working_hours: number | null;
  code: string | null;
  source: string;
  editable: boolean;
  deletable: boolean;
  start_time_24hr: string | null;
  end_time_24hr: string | null;
}

export interface IMastersListResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    totalCount: number;
    currentCount: number;
    currentPage: number;
    limit: number;
  };
}

export interface IWorkSchedule {
  id: string;
  createdAt: string;
  updatedAt: string;
  is_deleted: boolean;
  deleted_at: string | null;
  name: string;
  description: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday_week_1: boolean;
  saturday_week_2: boolean;
  saturday_week_3: boolean;
  saturday_week_4: boolean;
  saturday_week_5: boolean;
  sunday: boolean;
}
