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
