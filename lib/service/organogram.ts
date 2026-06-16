import { get } from '../axiosInstance';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface IOrganogramEmployee {
  id: string;
  employee_code: string;
  employee_name: string;
  work_email?: string;
  department?: string;
  designation?: string;
  direct_reports_count?: number;
  total_team_size?: number;
}

export interface IOrganogramNode extends IOrganogramEmployee {
  children: IOrganogramNode[];
}

export interface IOrganizationTree {
  success: boolean;
  data: IOrganogramNode[];
}

// ─────────────────────────────────────────────
// API Functions
// ─────────────────────────────────────────────

/**
 * Get the complete organization tree structure
 * GET /v1/employees/organization-tree
 */
export const getOrganizationTree = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/employees/organization-tree',
  undefined,
  tenantId,
  { bearerToken: token, isFetchToken: !token },
);

/**
 * Get organization tree (alias for getOrganizationTree)
 * GET /v1/employees/organization-tree
 */
export const getOrgTree = (
  tenantId: string,
  token?: string,
) => getOrganizationTree(tenantId, token);
