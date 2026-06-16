// 'use client';

// import { useEffect, useState, useRef } from 'react';
// import { useParams } from 'next/navigation';
// import { Loader2, Users, Mail, Building2, Briefcase, ChevronDown, ChevronRight } from 'lucide-react';
// import { getOrganizationTree, IOrganogramNode } from '@/lib/service/organogram';

// const AVATAR_COLORS = [
//   'from-amber-300 to-amber-500',
//   'from-rose-300 to-rose-500',
//   'from-blue-300 to-blue-500',
//   'from-cyan-300 to-cyan-500',
//   'from-emerald-300 to-emerald-500',
//   'from-violet-300 to-violet-500',
//   'from-pink-300 to-pink-500',
//   'from-indigo-300 to-indigo-500',
// ];

// function getAvatarColor(name: string) {
//   let hash = 0;
//   for (let i = 0; i < name.length; i++) {
//     hash = ((hash << 5) - hash) + name.charCodeAt(i);
//     hash = hash & hash;
//   }
//   return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
// }

// function getInitials(name: string) {
//   return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
// }

// interface OrgNodeCardProps {
//   node: IOrganogramNode;
//   depth?: number;
//   expanded?: boolean;
//   onToggle?: () => void;
// }

// function OrgNodeCard({ node, depth = 0, expanded = true, onToggle }: OrgNodeCardProps) {
//   const avatarColor = getAvatarColor(node.employee_name);
//   const hasChildren = node.children && node.children.length > 0;

//   return (
//     <div className="flex flex-col items-start">
//       {/* Employee Card */}
//       <div className="relative group flex items-center gap-3 w-full">
//         {/* Expand/Collapse toggle */}
//         {hasChildren && (
//           <button
//             onClick={onToggle}
//             className="flex-shrink-0 p-1 hover:bg-slate-100 rounded-md transition-colors"
//           >
//             {expanded ? (
//               <ChevronDown size={18} className="text-slate-600" />
//             ) : (
//               <ChevronRight size={18} className="text-slate-600" />
//             )}
//           </button>
//         )}
//         {!hasChildren && <div className="w-7" />}

//         {/* Card content */}
//         <div className="relative group flex-1 rounded-2xl overflow-hidden"
//           style={{
//             background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.8))',
//             boxShadow: '0 10px 30px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,0.5) inset',
//           }}>
//           {/* Glow effect on hover */}
//           <div
//             className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl pointer-events-none"
//             style={{
//               background: `linear-gradient(135deg, rgba(255,200,124,0.15), rgba(255,150,200,0.15))`,
//             }}
//           />

//           <div className="relative p-4 flex items-start gap-3">
//             {/* Avatar */}
//             <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatarColor} text-white font-bold text-sm flex items-center justify-center shadow-md flex-shrink-0`}>
//               {getInitials(node.employee_name)}
//             </div>

//             {/* Content */}
//             <div className="flex-1 min-w-0">
//               <h4 className="text-sm font-bold text-slate-800 truncate">{node.employee_name}</h4>
//               <p className="text-xs text-slate-500 truncate">{node.employee_code}</p>
//               {node.designation && (
//                 <p className="text-xs text-slate-600 font-medium mt-1 truncate">{node.designation}</p>
//               )}
//               {node.department && (
//                 <p className="text-[11px] text-slate-500 truncate">{node.department}</p>
//               )}
              
//               {/* Team stats */}
//               {(node.direct_reports_count ?? 0) > 0 && (
//                 <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-600 font-semibold">
//                   <Users size={12} />
//                   {node.direct_reports_count} direct reports
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Children tree */}
//       {hasChildren && expanded && (
//         <div className="ml-7 mt-1 relative">
//           {/* Vertical line connector */}
//           <div className="absolute -left-3.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-300 via-slate-200 to-transparent" />
          
//           <div className="space-y-1">
//             {node.children.map((child, idx) => (
//               <div key={child.id} className="relative">
//                 {/* Horizontal branch connector */}
//                 <div className="absolute -left-3.5 top-7 w-3.5 h-0.5 bg-slate-300" />
//                 <OrgNodeCard 
//                   node={child} 
//                   depth={depth + 1} 
//                   expanded={true}
//                   onToggle={() => {}}
//                 />
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default function AdminOrganogram() {
//   const params = useParams();
//   const subdomain = params?.subdomain as string;

//   const [tree, setTree] = useState<IOrganogramNode[] | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

//   useEffect(() => {
//     if (!subdomain) return;
//     fetchOrgTree();
//   }, [subdomain]);

//   const fetchOrgTree = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await getOrganizationTree(subdomain);
//       const data = res?.data?.data ?? res?.data ?? [];
//       setTree(Array.isArray(data) ? data : [data]);
//     } catch (err: any) {
//       setError(err?.response?.data?.message || 'Failed to load organization tree');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleNode = (nodeId: string) => {
//     const newExpanded = new Set(expandedNodes);
//     if (newExpanded.has(nodeId)) {
//       newExpanded.delete(nodeId);
//     } else {
//       newExpanded.add(nodeId);
//     }
//     setExpandedNodes(newExpanded);
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="flex flex-col items-center gap-3">
//           <Loader2 size={32} className="animate-spin text-slate-400" />
//           <p className="text-sm text-slate-500">Loading organization structure...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <p className="text-lg font-semibold text-red-600 mb-2">Error</p>
//           <p className="text-sm text-slate-500">{error}</p>
//           <button
//             onClick={fetchOrgTree}
//             className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!tree || tree.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <Users size={32} className="mx-auto text-slate-300 mb-2" />
//           <p className="text-sm text-slate-500">No organization data available</p>
//         </div>
//       </div>
//     );
//   }

//   const countEmployees = (node: IOrganogramNode): number => {
//     return 1 + (node.children?.reduce((sum, child) => sum + countEmployees(child), 0) ?? 0);
//   };

//   const getMaxDepth = (node: IOrganogramNode): number => {
//     return 1 + (node.children?.length ? Math.max(...node.children.map(getMaxDepth)) : 0);
//   };

//   const uniqueDepts = new Set<string>();
//   const collectDepts = (node: IOrganogramNode) => {
//     if (node.department) uniqueDepts.add(node.department);
//     node.children?.forEach(collectDepts);
//   };
//   tree.forEach(collectDepts);

//   return (
//     <div className="space-y-6 p-3 sm:p-4 lg:p-6">
//       {/* Organogram Canvas */}
//       <div className="bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50 rounded-3xl p-8 border border-slate-200/80 overflow-x-auto">
//         <div className="inline-block min-w-full">
//           <div className="space-y-1">
//             {tree.map((rootNode) => (
//               <div key={rootNode.id}>
//                 <OrgNodeCard 
//                   node={rootNode}
//                   depth={0}
//                   expanded={!expandedNodes.has(rootNode.id)}
//                   onToggle={() => toggleNode(rootNode.id)}
//                 />
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Stats footer */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         {[
//           {
//             label: 'Total Employees',
//             value: tree.reduce((sum, node) => sum + countEmployees(node), 0),
//             color: 'from-blue-400 to-blue-600',
//             icon: Users,
//           },
//           {
//             label: 'Reporting Levels',
//             value: Math.max(...tree.map(getMaxDepth)),
//             color: 'from-amber-400 to-amber-600',
//             icon: Building2,
//           },
//           {
//             label: 'Departments',
//             value: uniqueDepts.size,
//             color: 'from-rose-400 to-rose-600',
//             icon: Briefcase,
//           },
//         ].map((stat, idx) => {
//           const Icon = stat.icon;
//           return (
//             <div key={idx} className="relative group">
//               <div
//                 className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
//                 style={{
//                   background: `linear-gradient(135deg, rgba(255,200,124,0.2), rgba(255,150,200,0.2))`,
//                 }}
//               />
//               <div className="relative bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100"
//                 style={{
//                   background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
//                   boxShadow: '0 10px 40px rgba(0,0,0,0.05), 0 0 0 1px rgba(255,255,255,0.5) inset',
//                 }}>
//                 <div className="flex items-center gap-3">
//                   <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
//                     <Icon size={18} />
//                   </div>
//                   <div>
//                     <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
//                     <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }











'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Tree, TreeNode } from 'react-organizational-chart';
import { ChevronDown, ChevronRight, Users, Building2, Briefcase } from 'lucide-react';

import {
  getOrganizationTree,
  IOrganogramNode,
} from '@/lib/service/organogram';

const getInitials = (name: string) =>
  name
    ?.split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

const getDepartmentColor = (department?: string) => {
  switch (department?.toLowerCase()) {
    case 'hr':
      return 'bg-purple-100 text-purple-700';
    case 'engineering':
      return 'bg-blue-100 text-blue-700';
    case 'sales':
      return 'bg-emerald-100 text-emerald-700';
    case 'finance':
      return 'bg-orange-100 text-orange-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

export default function OrganogramPage() {
  const params = useParams();
  const subdomain = params?.subdomain as string;

  const [tree, setTree] = useState<IOrganogramNode[]>([]);
  const [loading, setLoading] = useState(true);

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (subdomain) {
      fetchTree();
    }
  }, [subdomain]);

  const fetchTree = async () => {
    try {
      setLoading(true);

      const res = await getOrganizationTree(subdomain);

      const orgTree =
        res?.data?.data ||
        [];

      setTree(orgTree);

      const expanded = new Set<string>();

      const expandRootNodes = (nodes: IOrganogramNode[]) => {
        nodes.forEach(node => {
          expanded.add(node.id);
        });
      };

      expandRootNodes(orgTree);

      setExpandedNodes(expanded);
    } catch (error) {
      console.error('Failed to load organization tree', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const EmployeeCard = ({ node }: { node: IOrganogramNode }) => {
    const hasChildren = node.children?.length > 0;
    const expanded = expandedNodes.has(node.id);

    return (
      <div
        className="
          relative
          min-w-[260px]
          max-w-[260px]
          cursor-pointer
          rounded-[28px]
          bg-white/80
          backdrop-blur-xl
          border border-white/50
          p-4
          transition-all
          hover:scale-[1.03]
          shadow-[10px_10px_20px_rgba(0,0,0,0.08),-10px_-10px_20px_rgba(255,255,255,0.9)]
        "
        onClick={() => hasChildren && toggleNode(node.id)}
      >
        <div className="flex items-center gap-3">
          <div
            className="
              w-14 h-14
              rounded-2xl
              bg-gradient-to-br
              from-teal-500
              to-cyan-500
              text-white
              flex
              items-center
              justify-center
              font-bold
              text-sm
            "
          >
            {getInitials(node.employee_name)}
          </div>

          <div className="flex-1 text-left">
            <h3 className="font-bold text-slate-800 text-sm">
              {node.employee_name}
            </h3>

            <p className="text-xs text-slate-500">
              {node.employee_code}
            </p>
          </div>

          {hasChildren && (
            <div>
              {expanded ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
            </div>
          )}
        </div>

        <div className="mt-3 text-left">
          <p className="text-xs font-medium text-slate-700">
            {node.designation}
          </p>

          <div className="mt-2">
            <span
              className={`
                inline-flex
                items-center
                px-2
                py-1
                rounded-full
                text-[10px]
                font-semibold
                ${getDepartmentColor(node.department)}
              `}
            >
              <Building2 size={10} className="mr-1" />
              {node.department || 'Department'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="bg-slate-50 rounded-xl p-2">
            <div className="flex items-center gap-1 text-slate-500">
              <Users size={12} />
              <span className="text-[10px]">Reports</span>
            </div>

            <p className="font-bold text-sm text-slate-800">
              {node.direct_reports_count || 0}
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-2">
            <div className="flex items-center gap-1 text-slate-500">
              <Briefcase size={12} />
              <span className="text-[10px]">Team</span>
            </div>

            <p className="font-bold text-sm text-slate-800">
              {node.total_team_size || 0}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderNode = (node: IOrganogramNode): React.ReactNode => {
    const expanded = expandedNodes.has(node.id);

    return (
      <TreeNode
        key={node.id}
        label={<EmployeeCard node={node} />}
      >
        {expanded &&
          node.children?.map(child =>
            renderNode(child),
          )}
      </TreeNode>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-sm text-slate-500">
          Loading organization structure...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Organization Chart
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Click any manager card to expand or collapse their reporting hierarchy
        </p>
      </div>

      <div className="overflow-x-auto pb-10">
        <div className="min-w-max px-10">
          <Tree
            lineWidth="2px"
            lineColor="#cbd5e1"
            lineBorderRadius="12px"
            label={<></>}
          >
            {tree.map(node => renderNode(node))}
          </Tree>
        </div>
      </div>
    </div>
  );
}