'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  ZoomIn, ZoomOut, Maximize2, Users, Building2, Briefcase,
  ChevronDown, ChevronRight, Loader2,
} from 'lucide-react';
import { getOrganizationTree, IOrganogramNode } from '@/lib/service/organogram';

// ─── helpers ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';
}

const AVATAR_COLORS = [
  ['#6366f1', '#8b5cf6'], ['#0ea5e9', '#06b6d4'], ['#10b981', '#14b8a6'],
  ['#f59e0b', '#f97316'], ['#ec4899', '#f43f5e'], ['#8b5cf6', '#a855f7'],
];
function avatarGrad(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

// ─── layout constants ─────────────────────────────────────────────────────────

const CARD_W = 220;
const CARD_H = 148;
const H_GAP  = 48;
const V_GAP  = 80;

// ─── layout engine ────────────────────────────────────────────────────────────

interface LayoutNode {
  node: IOrganogramNode;
  x: number;
  y: number;
  width: number; // subtree width
}

function layoutTree(
  node: IOrganogramNode,
  expandedIds: Set<string>,
  depth = 0,
): LayoutNode & { children: (LayoutNode & { children: any[] })[] } {
  const isExpanded = expandedIds.has(node.id);
  const visibleChildren = isExpanded ? (node.children ?? []) : [];

  if (visibleChildren.length === 0) {
    return { node, x: 0, y: depth * (CARD_H + V_GAP), width: CARD_W, children: [] };
  }

  const laidOutChildren = visibleChildren.map(c => layoutTree(c, expandedIds, depth + 1));

  // compute total width
  const totalChildrenWidth = laidOutChildren.reduce((s, c) => s + c.width, 0)
    + H_GAP * (laidOutChildren.length - 1);

  // offset children so they're centered under parent
  let cursor = 0;
  for (const child of laidOutChildren) {
    child.x += cursor;
    cursor += child.width + H_GAP;
  }

  const subtreeWidth = Math.max(CARD_W, totalChildrenWidth);

  // center parent over children
  const childrenSpan = laidOutChildren[laidOutChildren.length - 1].x + CARD_W / 2
    - (laidOutChildren[0].x + CARD_W / 2);
  const parentX = laidOutChildren[0].x + (totalChildrenWidth > CARD_W
    ? childrenSpan / 2 - (CARD_W / 2 - laidOutChildren[0].x - CARD_W / 2 + laidOutChildren[0].x)
    : 0);

  // actually: parent centered = first_child_center + half span - CARD_W/2
  const firstChildCenter = laidOutChildren[0].x + CARD_W / 2;
  const lastChildCenter  = laidOutChildren[laidOutChildren.length - 1].x + CARD_W / 2;
  const cx = (firstChildCenter + lastChildCenter) / 2 - CARD_W / 2;

  return {
    node,
    x: cx,
    y: depth * (CARD_H + V_GAP),
    width: subtreeWidth,
    children: laidOutChildren,
  };
}

// ─── flatten layout into renderable arrays ────────────────────────────────────

interface FlatNode { node: IOrganogramNode; x: number; y: number }
interface FlatEdge { x1: number; y1: number; x2: number; y2: number }

function flatten(
  layout: ReturnType<typeof layoutTree>,
  offsetX = 0,
  nodes: FlatNode[] = [],
  edges: FlatEdge[] = [],
): { nodes: FlatNode[]; edges: FlatEdge[] } {
  const absX = offsetX + layout.x;
  nodes.push({ node: layout.node, x: absX, y: layout.y });

  for (const child of layout.children) {
    const childAbsX = offsetX + child.x;
    // edge from bottom-center of parent to top-center of child
    edges.push({
      x1: absX + CARD_W / 2,
      y1: layout.y + CARD_H,
      x2: childAbsX + CARD_W / 2,
      y2: child.y,
    });
    flatten(child, offsetX, nodes, edges);
  }

  return { nodes, edges };
}

// ─── Employee Card ─────────────────────────────────────────────────────────────

function EmployeeCard({
  node,
  x, y,
  expanded,
  onToggle,
  scale,
}: {
  node: IOrganogramNode;
  x: number; y: number;
  expanded: boolean;
  onToggle: () => void;
  scale: number;
}) {
  const hasChildren = (node.children?.length ?? 0) > 0;
  const [from, to] = avatarGrad(node.employee_name);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: CARD_W,
        cursor: hasChildren ? 'pointer' : 'default',
      }}
      onClick={hasChildren ? onToggle : undefined}
    >
      <div
        style={{
          width: '100%',
          background: 'white',
          borderRadius: 16,
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          transition: 'box-shadow 0.15s, border-color 0.15s',
          userSelect: 'none',
          boxSizing: 'border-box',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.13)';
          (e.currentTarget as HTMLDivElement).style.borderColor = '#94a3b8';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.07)';
          (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0';
        }}
      >
        {/* top row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* avatar */}
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: `linear-gradient(135deg, ${from}, ${to})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: 13,
          }}>
            {initials(node.employee_name)}
          </div>
          {/* name + code */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {node.employee_name}
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{node.employee_code}</div>
          </div>
          {hasChildren && (
            <div style={{ color: '#94a3b8', flexShrink: 0 }}>
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
          )}
        </div>

        {/* designation + dept */}
        <div>
          {node.designation && (
            <div style={{ fontSize: 10, color: '#475569', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {node.designation}
            </div>
          )}
          {node.department && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              marginTop: 4, padding: '2px 8px', borderRadius: 99,
              background: '#f1f5f9', color: '#64748b', fontSize: 9, fontWeight: 600,
            }}>
              <Building2 size={9} />
              {node.department}
            </div>
          )}
        </div>

        {/* stats */}
        <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
          <div style={{ flex: 1, background: '#f8fafc', borderRadius: 8, padding: '5px 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#94a3b8', marginBottom: 2 }}>
              <Users size={9} />
              <span style={{ fontSize: 9, lineHeight: 1 }}>Reports</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', lineHeight: 1 }}>{node.direct_reports_count ?? 0}</div>
          </div>
          <div style={{ flex: 1, background: '#f8fafc', borderRadius: 8, padding: '5px 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#94a3b8', marginBottom: 2 }}>
              <Briefcase size={9} />
              <span style={{ fontSize: 9, lineHeight: 1 }}>Team</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', lineHeight: 1 }}>{node.total_team_size ?? 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function Organogram() {
  const params = useParams();
  const subdomain = params?.subdomain as string;

  const [tree, setTree]         = useState<IOrganogramNode[]>([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // canvas transform
  const [scale, setScale]       = useState(1);
  const [offset, setOffset]     = useState({ x: 0, y: 0 });

  const canvasRef   = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPanning   = useRef(false);
  const panStart    = useRef({ x: 0, y: 0 });
  const lastOffset  = useRef({ x: 0, y: 0 });

  // ── fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!subdomain) return;
    (async () => {
      setLoading(true);
      try {
        const res = await getOrganizationTree(subdomain);
        const data: IOrganogramNode[] = res?.data?.data ?? res?.data ?? [];
        const roots = Array.isArray(data) ? data : [data];
        setTree(roots);
        // expand root nodes by default
        setExpanded(new Set(roots.map(n => n.id)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [subdomain]);

  // ── build layout ──────────────────────────────────────────────────────────
  const { nodes: flatNodes, edges: flatEdges, totalW, totalH } = (() => {
    if (tree.length === 0) return { nodes: [], edges: [], totalW: 0, totalH: 0 };

    const layouts = tree.map(r => layoutTree(r, expanded));
    const allNodes: FlatNode[] = [];
    const allEdges: FlatEdge[] = [];

    let cursorX = 0;
    for (const layout of layouts) {
      flatten(layout, cursorX, allNodes, allEdges);
      cursorX += layout.width + H_GAP * 2;
    }

    const maxX = allNodes.reduce((m, n) => Math.max(m, n.x + CARD_W), 0);
    const maxY = allNodes.reduce((m, n) => Math.max(m, n.y + CARD_H), 0);
    return { nodes: allNodes, edges: allEdges, totalW: maxX, totalH: maxY };
  })();

  // ── fit to screen ─────────────────────────────────────────────────────────
  const fitToScreen = useCallback(() => {
    if (!containerRef.current || totalW === 0) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const padding = 80;
    const scaleX = (width - padding * 2) / totalW;
    const scaleY = (height - padding * 2) / totalH;
    const newScale = Math.min(scaleX, scaleY, 1.2);
    setScale(newScale);
    setOffset({
      x: (width - totalW * newScale) / 2,
      y: (height - totalH * newScale) / 2,
    });
  }, [totalW, totalH]);

  useEffect(() => {
    if (!loading && totalW > 0) fitToScreen();
  }, [loading, fitToScreen]);

  // ── pan handlers ──────────────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-card]')) return;
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
    lastOffset.current = offset;
    e.preventDefault();
  };

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning.current) return;
    setOffset({
      x: lastOffset.current.x + (e.clientX - panStart.current.x),
      y: lastOffset.current.y + (e.clientY - panStart.current.y),
    });
  }, []);

  const onMouseUp = useCallback(() => { isPanning.current = false; }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  // ── zoom on wheel ─────────────────────────────────────────────────────────
  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.91;
    setScale(s => Math.min(3, Math.max(0.15, s * factor)));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  const zoom = (factor: number) => setScale(s => Math.min(3, Math.max(0.15, s * factor)));

  const toggleNode = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── counts for footer ────────────────────────────────────────────────────
  const countAll = (node: IOrganogramNode): number =>
    1 + (node.children?.reduce((s, c) => s + countAll(c), 0) ?? 0);
  const getDepth = (node: IOrganogramNode): number =>
    1 + (node.children?.length ? Math.max(...node.children.map(getDepth)) : 0);
  const depts = new Set<string>();
  const collectDepts = (n: IOrganogramNode) => { if (n.department) depts.add(n.department); n.children?.forEach(collectDepts); };
  tree.forEach(collectDepts);
  const totalEmp   = tree.reduce((s, n) => s + countAll(n), 0);
  const maxDepth   = tree.length ? Math.max(...tree.map(getDepth)) : 0;

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <Loader2 size={28} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-white shrink-0">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Organization Chart</h1>
          <p className="text-xs text-slate-400">Scroll to zoom · Drag to pan · Click a card to expand</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="bg-slate-100 px-2.5 py-1 rounded-full font-medium">{totalEmp} employees</span>
          <span className="bg-slate-100 px-2.5 py-1 rounded-full font-medium">{depts.size} departments</span>
          <span className="bg-slate-100 px-2.5 py-1 rounded-full font-medium">{maxDepth} levels</span>
        </div>
      </div>

      {/* canvas area */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        style={{
          background: 'radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0) 0 0 / 28px 28px',
          backgroundColor: '#f8fafc',
          cursor: isPanning.current ? 'grabbing' : 'grab',
        }}
        onMouseDown={onMouseDown}
      >
        {/* zoom controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1">
          <button
            onClick={() => zoom(1.2)}
            className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors"
          >
            <ZoomIn size={16} className="text-slate-600" />
          </button>
          <button
            onClick={() => zoom(1 / 1.2)}
            className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors"
          >
            <ZoomOut size={16} className="text-slate-600" />
          </button>
          <button
            onClick={fitToScreen}
            className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors"
          >
            <Maximize2 size={15} className="text-slate-600" />
          </button>
          {/* zoom level badge */}
          <div className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-[9px] font-bold text-slate-500">{Math.round(scale * 100)}%</span>
          </div>
        </div>

        {/* transformed canvas */}
        <div
          ref={canvasRef}
          style={{
            position: 'absolute',
            left: offset.x,
            top: offset.y,
            transform: `scale(${scale})`,
            transformOrigin: '0 0',
            width: totalW + 80,
            height: totalH + 80,
          }}
        >
          {/* SVG edges */}
          <svg
            style={{ position: 'absolute', top: 0, left: 0, width: totalW + 80, height: totalH + 80, overflow: 'visible', pointerEvents: 'none' }}
          >
            {flatEdges.map((e, i) => {
              const midY = (e.y1 + e.y2) / 2;
              return (
                <path
                  key={i}
                  d={`M ${e.x1} ${e.y1} C ${e.x1} ${midY}, ${e.x2} ${midY}, ${e.x2} ${e.y2}`}
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          {/* Cards */}
          {flatNodes.map(({ node, x, y }) => (
            <div key={node.id} data-card="1">
              <EmployeeCard
                node={node}
                x={x}
                y={y}
                expanded={expanded.has(node.id)}
                onToggle={() => toggleNode(node.id)}
                scale={scale}
              />
            </div>
          ))}
        </div>

        {/* empty state */}
        {tree.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Users size={40} strokeWidth={1} />
            <p className="text-sm font-medium">No organization data</p>
          </div>
        )}
      </div>
    </div>
  );
}
