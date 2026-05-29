import {
  get, post, put, patch, deleteRequest,
} from '../axiosInstance';

export interface LeaveTypeConfigDto {
  leave_type_id: string;
  days_per_year?: number | null;
  accrual_type?: string | null;
  accrual_amount?: number | null;
  is_carry_forward?: boolean;
  carry_forward_max_days?: number | null;
  carry_forward_expiry?: string | null;
  is_encashable?: boolean;
  max_encash_days?: number | null;
  min_days_per_application?: number | null;
  max_days_per_application?: number | null;
  max_applications_per_year?: number | null;
  sandwich_applicable?: boolean;
  sandwich_count_as?: string | null;
}

export interface CreateLeavePolicyDto {
  name: string;
  leave_type_ids?: string[];
  leave_type_configs?: LeaveTypeConfigDto[];
}

export interface UpdateLeavePolicyDto extends Partial<CreateLeavePolicyDto> {}

export interface LeaveTypeDto {
  code: string;
  name: string;
  description?: string;
  is_paid?: boolean;
  is_encashable?: boolean;
  requires_document?: boolean;
  applicable_gender?: string | null;
  is_system_type?: boolean;
  max_consecutive_days?: number | null;
  notice_days_required?: number | null;
  max_days_per_year?: number | null;
  is_active?: boolean;
}

export interface CreateLeaveTypeDto extends LeaveTypeDto {}

export interface UpdateLeaveTypeDto extends LeaveTypeDto {}

export const getLeavePolicies = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/masters/leave-policies',
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getLeavePolicyById = (
  id: string,
  tenantId: string,
  token?: string,
) => get(
  `/v1/masters/leave-policies/${id}`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const createLeavePolicy = (
  body: CreateLeavePolicyDto,
  tenantId: string,
  token?: string,
) => post(
  '/v1/masters/leave-policies',
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const updateLeavePolicy = (
  id: string,
  body: UpdateLeavePolicyDto,
  tenantId: string,
  token?: string,
) => put(
  `/v1/masters/leave-policies/${id}`,
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const deleteLeavePolicy = (
  id: string,
  tenantId: string,
  token?: string,
) => deleteRequest(
  `/v1/masters/leave-policies/${id}`,
  undefined,
  tenantId,
  undefined,
  { bearerToken: token, isFetchToken: !token },
);

export const getLeavePolicyWithTypes = (
  id: string,
  tenantId: string,
  token?: string,
) => get(
  `/v1/masters/leave-policies/with-types`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getAssignedLeavePolicyWithTypes = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/masters/leave-policies/with-types',
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getLeaveTypes = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/masters/leave-types',
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const getLeaveTypeById = (
  id: string,
  tenantId: string,
  token?: string,
) => get(
  `/v1/masters/leave-types`,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const createLeaveType = (
  body: CreateLeaveTypeDto,
  tenantId: string,
  token?: string,
) => post(
  '/v1/masters/leave-types',
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const updateLeaveType = (
  id: string,
  body: UpdateLeaveTypeDto,
  tenantId: string,
  token?: string,
) => put(
  `/v1/masters/leave-types/${id}`,
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const deleteLeaveType = (
  id: string,
  tenantId: string,
  token?: string,
) => deleteRequest(
  `/v1/masters/leave-types/${id}`,
  undefined,
  tenantId,
  undefined,
  { bearerToken: token, isFetchToken: !token },
);

export const copyLeaveType = (
  id: string,
  tenantId: string,
  token?: string,
) => post(
  `/v1/masters/leave-types/${id}/copy`,
  {},
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const createLeavePolicyWithTypes = (
  body: CreateLeavePolicyDto,
  tenantId: string,
  token?: string,
) => post(
  '/v1/masters/leave-policies/with-types',
  body,
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const updateLeavePolicyWithTypes = (
  id: string,
  body: UpdateLeavePolicyDto,
  tenantId: string,
  token?: string,
) => patch(
  `/v1/masters/leave-policies/with-types/${id}`,
  body,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export const updateAssignedLeavePolicyWithTypes = (
  body: UpdateLeavePolicyDto,
  tenantId: string,
  token?: string,
) => patch(
  '/v1/masters/leave-policies/with-types',
  body,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);
