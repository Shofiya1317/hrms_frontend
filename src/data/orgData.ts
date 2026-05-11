// Shared source of truth for the organisation hierarchy.
// Both the Admin Organogram and the Employee/Manager module read from this data.

export interface OrgNode {
  id: string;
  name: string;
  role: string;
  dept: string;
  avatar: string;
  level: number;
  reports?: OrgNode[];
}

export const INITIAL_ORG_DATA: OrgNode = {
  id: '1', name: 'Vikram Shah', role: 'CEO & Founder', dept: 'Executive', avatar: 'VS', level: 0,
  reports: [
    {
      id: '2', name: 'Priya Nair', role: 'HR Manager', dept: 'Human Resources', avatar: 'PN', level: 1,
      reports: [
        { id: '7', name: 'Kavya Menon', role: 'HR Executive', dept: 'Human Resources', avatar: 'KM', level: 2 },
      ],
    },
    {
      id: '3', name: 'Rahul Sharma', role: 'Engineering Lead', dept: 'Engineering', avatar: 'RS', level: 1,
      reports: [
        { id: '8', name: 'Ananya Krishnan', role: 'Software Engineer', dept: 'Engineering', avatar: 'AK', level: 2 },
        { id: '9', name: 'Vikram Patel', role: 'Junior Developer', dept: 'Engineering', avatar: 'VP', level: 2 },
        { id: '10', name: 'Arjun Das', role: 'Frontend Developer', dept: 'Engineering', avatar: 'AD', level: 2 },
        { id: '11', name: 'Sneha Reddy', role: 'QA Engineer', dept: 'Quality Assurance', avatar: 'SR', level: 2 },
      ],
    },
    {
      id: '4', name: 'Deepa Iyer', role: 'Operations Lead', dept: 'Operations', avatar: 'DI', level: 1,
      reports: [
        { id: '12', name: 'Arjun Mehta', role: 'Finance Executive', dept: 'Finance', avatar: 'AM', level: 2 },
        { id: '13', name: 'Rohit Gupta', role: 'Finance Analyst', dept: 'Finance', avatar: 'RG', level: 2 },
      ],
    },
  ],
};

// ─── Utility helpers ────────────────────────────────────────────────────────

/** Flatten the tree into a plain array of all nodes */
export function flattenTree(node: OrgNode): OrgNode[] {
  const result: OrgNode[] = [node];
  if (node.reports) {
    node.reports.forEach((child) => result.push(...flattenTree(child)));
  }
  return result;
}

/** Find the direct parent of a node */
export function findParent(tree: OrgNode, targetId: string): OrgNode | null {
  if (tree.reports) {
    for (const child of tree.reports) {
      if (child.id === targetId) return tree;
      const found = findParent(child, targetId);
      if (found) return found;
    }
  }
  return null;
}

/** Find a node by id */
export function findNode(tree: OrgNode, id: string): OrgNode | null {
  if (tree.id === id) return tree;
  if (tree.reports) {
    for (const child of tree.reports) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  return null;
}

/** Check if targetId is an ancestor of nodeId (circular-hierarchy guard) */
export function isAncestor(tree: OrgNode, nodeId: string, targetId: string): boolean {
  const node = findNode(tree, nodeId);
  if (!node) return false;
  if (node.id === targetId) return true;
  if (node.reports) {
    return node.reports.some((child) => isAncestor(tree, child.id, targetId));
  }
  return false;
}

/** Remove a node from the tree (returns new tree) */
export function removeNode(tree: OrgNode, nodeId: string): OrgNode {
  return {
    ...tree,
    reports: tree.reports
      ? tree.reports
          .filter((child) => child.id !== nodeId)
          .map((child) => removeNode(child, nodeId))
      : undefined,
  };
}

/** Add a node as a reportee of targetId */
export function addReportee(tree: OrgNode, targetId: string, newNode: OrgNode): OrgNode {
  if (tree.id === targetId) {
    return {
      ...tree,
      reports: [...(tree.reports || []), { ...newNode, level: tree.level + 1 }],
    };
  }
  return {
    ...tree,
    reports: tree.reports
      ? tree.reports.map((child) => addReportee(child, targetId, newNode))
      : undefined,
  };
}

/**
 * Build a manager → reportees map from the org tree.
 * Returns: { [managerId]: OrgNode[] }
 */
export function buildManagerMap(tree: OrgNode): Record<string, OrgNode[]> {
  const map: Record<string, OrgNode[]> = {};
  function walk(node: OrgNode) {
    if (node.reports && node.reports.length > 0) {
      map[node.id] = node.reports;
      node.reports.forEach(walk);
    }
  }
  walk(tree);
  return map;
}

export const DEPT_COLORS: Record<string, string> = {
  Executive: 'from-[#2D7A4F] to-[#1e5c3a]',
  'Human Resources': 'from-blue-500 to-blue-600',
  Engineering: 'from-purple-500 to-purple-600',
  'Quality Assurance': 'from-orange-500 to-orange-600',
  Operations: 'from-teal-500 to-teal-600',
  Finance: 'from-amber-500 to-amber-600',
  Sales: 'from-red-500 to-red-600',
};
