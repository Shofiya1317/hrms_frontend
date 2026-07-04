import { get } from '../axiosInstance';

export interface ILeaveTypeBalance {
  leave_type_id: string;
  leave_type_name: string;
  total_leave: number;
  used_leave: number;
  remaining_leave: number;
}

export interface IEmployeeLeaveBalance {
  employee_id: string;
  employee_name: string;
  year: number;
  total_leave_used: number;
  leave_types: ILeaveTypeBalance[];
}

export const getEmployeeLeaveBalances = (
  tenantId: string,
  params?: { year?: number; employee_id?: string },
  token?: string,
) => get(
  '/v1/employee-leave-balances',
  params ? { ...params, ...(params.year !== undefined ? { year: parseInt(String(params.year), 10) } : {}) } : undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

export interface TeamMemberLeaveStatus {
  employee: {
    id: string;
    employee_code: string;
    name: string;
    avatar_url: string | null;
    designation: string | null;
  };
  leave_balances: {
    leave_type_id: string;
    leave_type_name: string;
    total_entitled: number;
    used: number;
    pending: number;
    available: number;
  }[];
  approved_upcoming_leaves: {
    id: string;
    leave_type_name: string;
    from_date: string;
    to_date: string;
    total_days: number;
    half_day: boolean;
  }[];
}

export interface TeamLeaveStatusResponse {
  success: boolean;
  data: TeamMemberLeaveStatus[];
}

export const getTeamLeaveStatus = (tenantId: string, token?: string) =>
  get('/v1/employees/team/leave-status', undefined, tenantId, {
    bearerToken: token,
    isFetchToken: !token,
  });
