import {
  get, post, put, deleteRequest, patch,
} from '../axiosInstance';
import { Params } from '../utils';

export interface InviteEmployeeDto {
  email: string;
  role: 'EMPLOYEE' | 'HR_ADMIN';
  employee_code?: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: string;
  personal_phone?: string;
  department_id: string;
  designation_id?: string;
  employment_type: string;
  reporting_manager_id?: string | '';
  shift_id?: string;
  date_of_joining: string;
  leave_policy_name?: string;
  attendance_policy_id?: string;
}

export interface UpdateEmployeeDto {
  employee_code?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  date_of_birth?: string;
  gender?: string;
  personal_email?: string;
  personal_phone?: string;
  blood_group?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  department_id?: string;
  designation_id?: string;
  reporting_manager_id?: string | '';
  shift_id?: string;
  work_location_id?: string;
  grade_id?: string;
  employment_type?: string;
  employment_status?: string;
  work_email?: string;
  work_phone?: string;
  date_of_joining?: string;
  probation_end_date?: string;
  role?: 'EMPLOYEE' | 'HR_ADMIN';
  leave_policy_name?: string;
  attendance_policy_id?: string;
  pan_number?: string;
  aadhaar_number?: string;
  uan_number?: string;
  esic_number?: string;
  pf_applicable?: boolean;
  esic_applicable?: boolean;
  bank_name?: string;
  bank_account_number?: string;
  bank_ifsc_code?: string;
  bank_branch?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  notes?: string;
  date_of_exit?: string;
  exit_reason?: string;
  home_latitude?: number | null;
  home_longitude?: number | null;
}

export const createEmployee = (
  body: InviteEmployeeDto,
  tenantId: string,
  token?: string,
) => post(
  '/v1/employees/invite',
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getEmployees = (
  tenantId: string,
  params?: Params,
  token?: string,
) => get(
  '/v1/employees',
  params,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getInviteMasterData = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/employees/invite/master-data',
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getEmployeeById = (
  id: string,
  tenantId: string,
  includeMasterData: boolean = false,
  token?: string,
) => get(
  `/v1/employees/${id}${includeMasterData ? '?include_master_data=true' : ''}`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const updateEmployee = (
  id: string,
  body: UpdateEmployeeDto,
  tenantId: string,
  token?: string,
) => put(
  `/v1/employees/${id}`,
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const deleteEmployee = (
  id: string,
  tenantId: string,
  token?: string,
) => deleteRequest(
  `/v1/employees/${id}`,
  undefined,
  tenantId,
  undefined,
  { bearerToken: token, isFetchToken: !token },
);

export interface ITeamMember {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  work_email: string;
  personal_phone: string | null;
  employment_status: 'ACTIVE' | 'INACTIVE' | 'TERMINATED';
  date_of_joining: string;
  user_status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
}

export interface IMyTeamResponse {
  total_team_members: number;
  team_members: ITeamMember[];
}

export interface UpdateEmployeeSelfDto {
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  personal_email?: string;
  personal_phone?: string;
  blood_group?: string;
  current_address?: string;
  permanent_address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  profile_photo_url?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  home_latitude?: number | null;
  home_longitude?: number | null;
}

export const getEmployeeMe = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/employees/me',
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const updateEmployeeSelf = (
  body: UpdateEmployeeSelfDto,
  tenantId: string,
  token?: string,
) => patch(
  '/v1/employees/me',
  body,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getEmployeeSelf = (
  body: UpdateEmployeeSelfDto,
  tenantId: string,
  token?: string,
) => patch(
  '/v1/employees/me',
  body,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

// GET /api/v1/employees/me

export const getMyTeam = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/employees/team/my-team',
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export interface ITeamLeaveApplication {
  id: string;
  employee: {
    id: string;
    name: string;
    employee_code: string;
  };
  leave_type: {
    id: string;
    name: string;
    code: string;
  };
  from_date: string;
  to_date: string;
  total_days: string;
  half_day: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reason: string;
  applied_on: string;
  approved_at: string | null;
  approver: any;
  rejection_reason: string | null;
}

export interface ITeamLeaveParams {
  employee_id?: string;
  status?: string;
  from_date?: string;
  to_date?: string;
  leave_type_id?: string;
}

export const getTeamLeaves = (
  tenantId: string,
  params?: ITeamLeaveParams,
  token?: string,
) => get(
  '/v1/leave-applications/team/leaves',
  params,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export interface ITeamLeaveApprovalPayload {
  status: 'approved' | 'rejected';
  rejection_reason?: string;
}

export const approveRejectTeamLeave = (
  leaveId: string,
  body: ITeamLeaveApprovalPayload,
  tenantId: string,
  token?: string,
) => patch(
  `/v1/leave-applications/team/leaves/${leaveId}`,
  body,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export interface IProbationMilestone {
  day: number;
  label: string;
  completed: boolean;
  status: 'completed' | 'pending' | 'upcoming';
}

export interface IProbationOutcome {
  result: 'confirmed' | 'extended' | 'failed' | 'terminated';
  label: string;
  effective_date: string;
  remarks?: string;
}

export interface IProbationStatus {
  is_on_probation: boolean;
  probation_status: 'active' | 'under_review' | 'extended' | 'confirmed' | 'failed' | 'terminated';
  status_card: {
    current_status: string;
    start_date: string;
    end_date: string;
    days_remaining: number;
    duration_months: number;
  };
  progress: {
    percent: number;
    elapsed_days: number;
    total_days: number;
    label: string;
  };
  reporting_manager?: {
    id: string;
    name: string;
    designation: string;
  };
  milestones: IProbationMilestone[];
  outcome?: IProbationOutcome | null;
}

export const getProbationStatus = (
  tenantId: string,
  token?: string,
) => get<IProbationStatus>(
  '/v1/employees/me/probation-status',
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);
