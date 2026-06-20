'use client';

import React, {
  useState, useRef, useCallback, useEffect, useMemo,
} from 'react';
import {
  Plus, ZoomIn, ZoomOut, Users, Building2, GripVertical, UserPlus, ChevronDown, ChevronRight,
} from 'lucide-react';
import {
  OrgNode,
  DEPT_COLORS,
  flattenTree,
  findParent,
  findNode,
  isAncestor,
  removeNode,
  addReportee,
} from '@/data/orgData';

interface OrgRow {
  id: string;
  name: string;
  role: string;
  dept: string;
  avatar: string;
  level: number;
  parent_id: string | null;
  sort_order: number;
  user_id: string | null;
}

interface EmployeeProfile {
  id: string;
  full_name: string;
  job_title: string | null;
  department: string | null;
  employee_id: string | null;
  avatar_url: string | null;
  org_node_id: string | null;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function buildTree(rows: OrgRow[], employeeMap: Record<string, EmployeeProfile>): OrgNode | null {
  if (!rows.length) return null;
  const map: Record<string, OrgNode & { _children: OrgNode[] }> = {};
  rows.forEach((r) => {
    // If this node has a linked employee, use their real data
    const emp = r.user_id ? employeeMap[r.user_id] : null;
    const name = emp ? emp.full_name : r.name;
    const role = emp ? (emp.job_title || r.role) : r.role;
    const dept = emp ? (emp.department || r.dept) : r.dept;
    const avatar = getInitials(name);
    map[r.id] = {
      id: r.id,
      name,
      role,
      dept,
      avatar,
      level: r.level,
      reports: [],
      _children: [],
    } as OrgNode & { _children: OrgNode[] };
  });
  let root: (OrgNode & { _children: OrgNode[] }) | null = null;
  rows.forEach((r) => {
    if (r.parent_id && map[r.parent_id]) {
      map[r.parent_id]._children.push(map[r.id]);
    } else if (!r.parent_id) {
      root = map[r.id];
    }
  });
  // attach sorted children
  Object.values(map).forEach((node) => {
    const sorted = node._children.sort((a, b) => {
      const ra = rows.find((x) => x.id === a.id);
      const rb = rows.find((x) => x.id === b.id);
      return (ra?.sort_order ?? 0) - (rb?.sort_order ?? 0);
    });
    node.reports = sorted.length ? sorted : undefined;
  });
  return root;
}

// ─── OrgCard ─────────────────────────────────────────────────────────────────

interface OrgCardProps {
  node: OrgNode;
  isRoot?: boolean;
  draggedId: string | null;
  dropTargetId: string | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (targetId: string) => void;
  onDragOver: (id: string) => void;
  employeeMap: Record<string, EmployeeProfile>;
  orgRows: OrgRow[];
}

function OrgCard({
  node, isRoot = false, draggedId, dropTargetId, onDragStart, onDragEnd, onDrop, onDragOver, employeeMap, orgRows,
}: OrgCardProps) {
  const [expanded, setExpanded] = useState(true);
  const hasReports = node.reports && node.reports.length > 0;
  const gradient = DEPT_COLORS[node.dept] || 'from-gray-500 to-gray-600';
  const isDragging = draggedId === node.id;
  const isDropTarget = dropTargetId === node.id && draggedId !== node.id;

  // Find linked employee for this node
  const orgRow = orgRows.find((r) => r.id === node.id);
  const linkedEmployee = orgRow?.user_id ? employeeMap[orgRow.user_id] : null;

  return (
    <div className="flex flex-col items-center">
      <div
        draggable={!isRoot}
        onDragStart={(e) => {
          if (isRoot) return;
          e.stopPropagation();
          onDragStart(node.id);
        }}
        onDragEnd={onDragEnd}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (draggedId && draggedId !== node.id) {
            onDragOver(node.id);
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDrop(node.id);
        }}
        className={`relative bg-white rounded-2xl border-2 shadow-md transition-all duration-200 group select-none
          ${isRoot ? 'border-[#2D7A4F] w-52' : 'border-gray-200 w-44'}
          ${!isRoot ? 'cursor-grab active:cursor-grabbing hover:border-[#2D7A4F]/40' : ''}
          ${isDragging ? 'opacity-40 scale-95' : ''}
          ${isDropTarget ? 'border-[#2D7A4F] shadow-lg shadow-[#2D7A4F]/20 scale-105 bg-[#e8f5ee]/30' : ''}
        `}
      >
        {!isRoot && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical size={12} className="text-gray-400" />
          </div>
        )}
        {isDropTarget && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#2D7A4F] text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap z-20">
            Drop here
          </div>
        )}
        <div className={`bg-gradient-to-br ${gradient} rounded-t-xl p-3 text-center`}>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mx-auto border border-white/30">
            <span className="text-white text-sm font-black">{node.avatar}</span>
          </div>
        </div>
        <div className="p-3 text-center">
          <p className={`font-bold text-[#0f1f2e] leading-tight ${isRoot ? 'text-sm' : 'text-xs'}`}>{node.name}</p>
          <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{node.role}</p>
          <span className="inline-block mt-1.5 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{node.dept}</span>
          {linkedEmployee && (
            <div className="mt-1.5">
              <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-[#e8f5ee] text-[#2D7A4F]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D7A4F]" />
                {linkedEmployee.employee_id || 'Linked'}
              </span>
            </div>
          )}
        </div>
        {hasReports && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 border-[#2D7A4F] flex items-center justify-center shadow-sm hover:bg-[#e8f5ee] transition-colors z-10"
          >
            {expanded ? <ChevronDown size={12} className="text-[#2D7A4F]" /> : <ChevronRight size={12} className="text-[#2D7A4F]" />}
          </button>
        )}
      </div>

      {hasReports && expanded && (
        <div className="mt-8 flex flex-col items-center">
          <div className="w-px h-6 bg-gray-300" />
          {node.reports!.length > 1 && (
            <div className="relative flex items-start">
              <div
                className="absolute top-0 h-px bg-gray-300"
                style={{
                  left: `calc(50% - ${(node.reports!.length - 1) * 100}px)`,
                  width: `${(node.reports!.length - 1) * 200}px`,
                }}
              />
            </div>
          )}
          <div className="flex items-start gap-8">
            {node.reports!.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="w-px h-6 bg-gray-300" />
                <OrgCard
                  node={child}
                  draggedId={draggedId}
                  dropTargetId={dropTargetId}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  employeeMap={employeeMap}
                  orgRows={orgRows}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const VIEWS = ['Org Builder', 'Department View', 'Role View', 'Versioning'];

export default function OrganogramPage() {
  const [activeView, setActiveView] = useState('Org Builder');
  const [zoom, setZoom] = useState(90);
  const [orgData, setOrgData] = useState<OrgNode | null>(null);
  const [rows, setRows] = useState<OrgRow[]>([]);
  const [employeeMap, setEmployeeMap] = useState<Record<string, EmployeeProfile>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const scrollStart = useRef({ left: 0, top: 0 });

  // ── Load static organogram data ──────────────────────────────────────────
  const fetchOrganogram = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const staticRows: OrgRow[] = [
        {
          id: 'n1', name: 'Arjun Mehta', role: 'Admin', dept: 'Management', avatar: 'AM', level: 0, parent_id: null, sort_order: 0, user_id: '1',
        },
        {
          id: 'n2', name: 'Rahul Sharma', role: 'Team Lead', dept: 'Operations', avatar: 'RS', level: 1, parent_id: 'n1', sort_order: 0, user_id: '2',
        },
        {
          id: 'n3', name: 'Ananya Krishnan', role: 'Engineer', dept: 'Engineering', avatar: 'AK', level: 2, parent_id: 'n2', sort_order: 0, user_id: '3',
        },
      ];
      const staticEmpMap: Record<string, EmployeeProfile> = {
        1: {
          id: '1', full_name: 'Arjun Mehta', job_title: 'Admin', department: 'Management', employee_id: 'EMP-001', avatar_url: null, org_node_id: 'n1',
        },
        2: {
          id: '2', full_name: 'Rahul Sharma', job_title: 'Team Lead', department: 'Operations', employee_id: 'EMP-002', avatar_url: null, org_node_id: 'n2',
        },
        3: {
          id: '3', full_name: 'Ananya Krishnan', job_title: 'Engineer', department: 'Engineering', employee_id: 'EMP-003', avatar_url: null, org_node_id: 'n3',
        },
      };
      setRows(staticRows);
      setEmployeeMap(staticEmpMap);
      setOrgData(buildTree(staticRows, staticEmpMap));
    } catch (err: any) {
      setError(err?.message || 'Failed to load organogram');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganogram();
  }, [fetchOrganogram]);

  // ── Persist parent change (local only — no backend) ───────────────────────
  const persistParentChange = useCallback(async (nodeId: string, newParentId: string) => {
    try {
      const updatedRows = rows.map((r) => (r.id === nodeId ? { ...r, parent_id: newParentId } : r));
      setRows(updatedRows);
    } catch (err: any) {
      showToast(`Save failed: ${err?.message || 'Unknown error'}`);
    }
  }, [rows]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleDragStart = useCallback((id: string) => {
    setDraggedId(id);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDropTargetId(null);
  }, []);

  const handleDragOver = useCallback((id: string) => {
    setDropTargetId(id);
  }, []);

  const handleDrop = useCallback(async (targetId: string) => {
    if (!draggedId || draggedId === targetId || !orgData) {
      setDraggedId(null);
      setDropTargetId(null);
      return;
    }

    if (isAncestor(orgData, draggedId, targetId)) {
      showToast('Cannot move a person under their own reportee');
      setDraggedId(null);
      setDropTargetId(null);
      return;
    }

    const currentParent = findParent(orgData, draggedId);
    if (currentParent && currentParent.id === targetId) {
      showToast('Already reports to this person');
      setDraggedId(null);
      setDropTargetId(null);
      return;
    }

    const draggedNode = findNode(orgData, draggedId);
    if (!draggedNode) return;

    // Optimistic UI update
    let newTree = removeNode(orgData, draggedId);
    newTree = addReportee(newTree, targetId, draggedNode);
    const targetNode = findNode(orgData, targetId);
    setOrgData(newTree);
    showToast(`${draggedNode.name} now reports to ${targetNode?.name}`);
    setDraggedId(null);
    setDropTargetId(null);

    // Persist to Supabase
    await persistParentChange(draggedId, targetId);
  }, [draggedId, orgData, persistParentChange]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 1 && !e.altKey) return;
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
    scrollStart.current = {
      left: containerRef.current?.scrollLeft || 0,
      top: containerRef.current?.scrollTop || 0,
    };
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning.current || !containerRef.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    containerRef.current.scrollLeft = scrollStart.current.left - dx;
    containerRef.current.scrollTop = scrollStart.current.top - dy;
  };

  const handleMouseUp = () => { isPanning.current = false; };

  const handleZoomIn = () => setZoom((z) => Math.min(150, z + 10));
  const handleZoomOut = () => setZoom((z) => Math.max(40, z - 10));
  const handleZoomReset = () => setZoom(90);

  // ── Derived stats for Department View ────────────────────────────────────
  const deptStats = useMemo(() => {
    const map: Record<string, { count: number; head: string; color: string }> = {};
    rows.forEach((r) => {
      const emp = r.user_id ? employeeMap[r.user_id] : null;
      const dept = emp?.department || r.dept;
      if (!map[dept]) {
        map[dept] = { count: 0, head: '', color: DEPT_COLORS[dept] || 'from-gray-500 to-gray-600' };
      }
      map[dept].count += 1;
      // The shallowest node in a dept is the head
      const existing = rows.find((x) => {
        const xEmp = x.user_id ? employeeMap[x.user_id] : null;
        return (xEmp?.department || x.dept) === dept && x.id === map[dept].head;
      });
      if (!existing || r.level < (existing?.level ?? 99)) {
        map[dept].head = r.id;
      }
    });
    return Object.entries(map).map(([name, info]) => {
      const headRow = rows.find((r) => r.id === info.head);
      const headEmp = headRow?.user_id ? employeeMap[headRow.user_id] : null;
      return {
        name,
        head: headEmp?.full_name || headRow?.name || '',
        count: info.count,
        color: info.color,
      };
    });
  }, [rows, employeeMap]);

  // Linked employees count for stats
  const linkedCount = rows.filter((r) => r.user_id).length;

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#0f1f2e] text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-fade-in">
          <UserPlus size={14} className="text-[#2D7A4F]" />
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0f1f2e]">Organogram</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Visual hierarchy ·
            {' '}
            {rows.length}
            {' '}
            positions ·
            {' '}
            {linkedCount}
            {' '}
            linked to employees
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeView === 'Org Builder' && (
            <>
              <button
                onClick={handleZoomOut}
                className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={14} className="text-gray-600" />
              </button>
              <button
                onClick={handleZoomReset}
                className="text-xs font-semibold text-gray-600 w-12 text-center bg-white border border-gray-200 rounded-xl py-1.5 hover:bg-gray-50 transition-colors"
                title="Reset Zoom"
              >
                {zoom}
                %
              </button>
              <button
                onClick={handleZoomIn}
                className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={14} className="text-gray-600" />
              </button>
            </>
          )}
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors">
            <Plus size={14} />
            {' '}
            Add Position
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit overflow-x-auto">
        {VIEWS.map((v) => (
          <button
            key={v}
            onClick={() => setActiveView(v)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeView === v ? 'bg-white text-[#0f1f2e] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Loading / Error states */}
      {loading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#2D7A4F] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading organogram…</p>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-3">
            <p className="text-sm font-semibold text-red-500">{error}</p>
            <button
              onClick={fetchOrganogram}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && activeView === 'Org Builder' && orgData && (
        <div className="flex gap-4">
          {/* People Panel */}
          <div className="w-52 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3 self-start sticky top-4">
            <div>
              <h3 className="text-xs font-bold text-[#0f1f2e] mb-0.5">People Panel</h3>
              <p className="text-[10px] text-gray-400">Drag onto a card to reassign</p>
            </div>
            <div className="space-y-2">
              {flattenTree(orgData).filter((n) => n.id !== rows.find((r) => !r.parent_id)?.id).map((person) => {
                const parent = findParent(orgData, person.id);
                const gradient = DEPT_COLORS[person.dept] || 'from-gray-500 to-gray-600';
                const orgRow = rows.find((r) => r.id === person.id);
                const linkedEmp = orgRow?.user_id ? employeeMap[orgRow.user_id] : null;
                return (
                  <div
                    key={person.id}
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      handleDragStart(person.id);
                    }}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-grab active:cursor-grabbing transition-all select-none
                      ${draggedId === person.id ? 'opacity-40 border-[#2D7A4F] bg-[#e8f5ee]/30' : 'border-gray-100 bg-gray-50 hover:border-[#2D7A4F]/30 hover:bg-white'}
                    `}
                  >
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white text-[9px] font-black">{person.avatar}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-[#0f1f2e] truncate">{person.name}</p>
                      <p className="text-[9px] text-gray-400 truncate">
                        {linkedEmp ? linkedEmp.employee_id || 'Linked' : parent ? `→ ${parent.name}` : 'Unassigned'}
                      </p>
                    </div>
                    <GripVertical size={10} className="text-gray-300 flex-shrink-0 ml-auto" />
                  </div>
                );
              })}
            </div>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-[9px] text-gray-400 text-center">
                💡 Tip: Drag from here or directly from the chart
              </p>
            </div>
          </div>

          {/* Org Chart Canvas */}
          <div className="flex-1 relative">
            {draggedId && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-[#2D7A4F] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 pointer-events-none">
                <UserPlus size={13} />
                Drop onto any card to reassign as reportee
              </div>
            )}
            <div
              ref={containerRef}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-auto p-8 min-h-[600px] cursor-default"
              style={{ maxHeight: '75vh' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onDragOver={(e) => e.preventDefault()}
            >
              <div
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.2s ease',
                  minWidth: 'max-content',
                  paddingBottom: `${(1 - zoom / 100) * 200}px`,
                }}
              >
                <OrgCard
                  node={orgData}
                  isRoot
                  draggedId={draggedId}
                  dropTargetId={dropTargetId}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  employeeMap={employeeMap}
                  orgRows={rows}
                />
              </div>
            </div>

            {/* Zoom controls overlay */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 bg-white rounded-xl border border-gray-200 shadow-md p-1.5">
              <button onClick={handleZoomIn} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors" title="Zoom In">
                <ZoomIn size={15} className="text-gray-600" />
              </button>
              <div className="w-8 h-px bg-gray-200" />
              <button onClick={handleZoomReset} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors text-[9px] font-bold text-gray-500" title="Reset Zoom">
                {zoom}
                %
              </button>
              <div className="w-8 h-px bg-gray-200" />
              <button onClick={handleZoomOut} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors" title="Zoom Out">
                <ZoomOut size={15} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && activeView === 'Department View' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deptStats.map((dept) => (
            <div key={dept.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className={`bg-gradient-to-r ${dept.color} p-4`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Building2 size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">{dept.name}</h3>
                    <p className="text-white/70 text-xs">
                      Head:
                      {dept.head}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-gray-400" />
                  <span className="text-sm font-semibold text-gray-700">
                    {dept.count}
                    {' '}
                    positions
                  </span>
                </div>
                <button className="text-xs font-semibold text-[#2D7A4F] hover:underline">View →</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && activeView === 'Role View' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-[#0f1f2e] mb-4">Role-Based Structure</h3>
          <div className="space-y-3">
            {[0, 1, 2].map((lvl) => {
              const levelRows = rows.filter((r) => r.level === lvl);
              if (!levelRows.length) return null;
              const levelLabel = lvl === 0 ? 'L1 — Executive' : lvl === 1 ? 'L2 — Leadership' : 'L3 — Team';
              return (
                <div key={lvl} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-28 flex-shrink-0">
                    <span className="text-xs font-bold text-[#2D7A4F]">{levelLabel.split(' — ')[0]}</span>
                    <p className="text-xs text-gray-500 mt-0.5">{levelLabel.split(' — ')[1]}</p>
                  </div>
                  <div className="flex-1 flex flex-wrap gap-2">
                    {levelRows.map((r) => {
                      const emp = r.user_id ? employeeMap[r.user_id] : null;
                      return (
                        <span key={r.id} className="text-xs font-medium px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
                          {emp?.full_name || r.name}
                          {emp && (
                          <span className="text-gray-400 ml-1">
                            ·
                            {emp.job_title || r.role}
                          </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                  <span className="text-xs font-bold text-gray-500 flex-shrink-0">
                    {levelRows.length}
                    {' '}
                    people
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && !error && activeView === 'Versioning' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0f1f2e]">Org Snapshots & History</h3>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors">
              <Plus size={14} />
              {' '}
              Save Snapshot
            </button>
          </div>
          <div className="space-y-3">
            {[
              {
                version: 'v3.0', date: 'Mar 2026', changes: 'Added Finance Executive role', active: true,
              },
              {
                version: 'v2.5', date: 'Jan 2026', changes: 'Kavya Menon promoted to HR Executive', active: false,
              },
              {
                version: 'v2.0', date: 'Sep 2025', changes: 'Operations team restructured', active: false,
              },
              {
                version: 'v1.0', date: 'Jan 2024', changes: 'Initial org structure created', active: false,
              },
            ].map((snap) => (
              <div key={snap.version} className={`flex items-center gap-4 p-4 rounded-xl border ${snap.active ? 'border-[#2D7A4F] bg-[#e8f5ee]/50' : 'border-gray-100 bg-gray-50'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${snap.active ? 'bg-[#2D7A4F] text-white' : 'bg-gray-200 text-gray-600'}`}>
                  <span className="text-xs font-black">{snap.version}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{snap.changes}</p>
                  <p className="text-xs text-gray-400">{snap.date}</p>
                </div>
                {snap.active && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#2D7A4F] text-white">Current</span>}
                {!snap.active && <button className="text-xs font-semibold text-[#2D7A4F] hover:underline">Restore</button>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
