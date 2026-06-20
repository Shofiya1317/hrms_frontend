'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, XCircle, Calendar, RotateCcw, Gift, ChevronDown, ChevronUp, AlertCircle, Inbox, Users, UserCog,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DEPT_COLORS } from '@/data/orgData';

type RequestType = 'leave' | 'compoff' | 'regularization';
type RequestStatus = 'pending' | 'approved' | 'rejected';

interface ApprovalRequest {
  id: string;
  type: RequestType;
  employeeName: string;
  employeeId: string;
  avatar: string;
  department: string;
  submittedOn: string;
  status: RequestStatus;
  details: Record<string, string>;
  managerNote?: string;
}

interface HierarchyProfile {
  id: string;
  full_name: string;
  email: string;
  job_title: string | null;
  department: string | null;
  avatar_url: string | null;
  employee_id: string | null;
  org_node_id: string | null;
  is_active?: boolean;
}

const TYPE_CONFIG: Record<RequestType, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  leave: {
    label: 'Leave', color: '#3b82f6', bg: '#eff6ff', icon: Calendar,
  },
  compoff: {
    label: 'Comp Off', color: '#8b5cf6', bg: '#f5f3ff', icon: Gift,
  },
  regularization: {
    label: 'Regularize', color: '#f59e0b', bg: '#fffbeb', icon: RotateCcw,
  },
};

const STATUS_CONFIG: Record<RequestStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: '#f59e0b', bg: '#fffbeb' },
  approved: { label: 'Approved', color: '#2D7A4F', bg: '#e8f5ee' },
  rejected: { label: 'Rejected', color: '#ef4444', bg: '#fef2f2' },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ManagerApprovalPage() {
  const { profile } = useAuth();
  const [manager, setManager] = useState<HierarchyProfile | null>(null);
  const [reportees, setReportees] = useState<HierarchyProfile[]>([]);
  const [hierarchyLoading, setHierarchyLoading] = useState(true);
  const [hierarchyError, setHierarchyError] = useState<string | null>(null);

  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<RequestType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'all'>('pending');
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [actionToast, setActionToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const fetchHierarchy = useCallback(async () => {
    if (!profile) return;
    setHierarchyLoading(true);
    setHierarchyError(null);
    try {
      // Static mock data — no backend
      const fetchedReportees: HierarchyProfile[] = [
        {
          id: '2', full_name: 'Rahul Sharma', email: 'manager@impactree.in', job_title: 'Team Lead', department: 'Operations', avatar_url: null, employee_id: 'EMP-002', org_node_id: null,
        },
        {
          id: '3', full_name: 'Ananya Krishnan', email: 'employee@impactree.in', job_title: 'Engineer', department: 'Engineering', avatar_url: null, employee_id: 'EMP-003', org_node_id: null,
        },
      ];
      setManager(null);
      setReportees(fetchedReportees);

      const seedRequests: ApprovalRequest[] = [];
      fetchedReportees.forEach((emp, idx) => {
        const avatar = getInitials(emp.full_name);
        seedRequests.push({
          id: `REQ-L-${emp.id}`,
          type: 'leave',
          employeeName: emp.full_name,
          employeeId: emp.employee_id || emp.id.slice(0, 8),
          avatar,
          department: emp.department || 'General',
          submittedOn: '2026-03-20',
          status: 'pending',
          details: {
            'Leave Type': 'Casual Leave',
            From: 'Mar 25, 2026',
            To: 'Mar 25, 2026',
            Days: '1 day',
            Reason: 'Personal work',
          },
        });
        if (idx % 3 === 1) {
          seedRequests.push({
            id: `REQ-R-${emp.id}`,
            type: 'regularization',
            employeeName: emp.full_name,
            employeeId: emp.employee_id || emp.id.slice(0, 8),
            avatar,
            department: emp.department || 'General',
            submittedOn: '2026-03-21',
            status: 'pending',
            details: {
              Date: 'Mar 21, 2026',
              Type: 'Missed Check-in',
              'Corrected In': '09:00 AM',
              'Corrected Out': '06:30 PM',
              Reason: 'Biometric device malfunction at entry gate',
            },
          });
        }
        if (idx % 3 === 2) {
          seedRequests.push({
            id: `REQ-C-${emp.id}`,
            type: 'compoff',
            employeeName: emp.full_name,
            employeeId: emp.employee_id || emp.id.slice(0, 8),
            avatar,
            department: emp.department || 'General',
            submittedOn: '2026-03-19',
            status: 'pending',
            details: {
              'Work Date': 'Mar 15, 2026 (Holiday)',
              'Hours Worked': '8h 30m',
              Credit: '1 day',
              Reason: 'Worked on Holi for production deployment',
            },
          });
        }
      });
      setRequests(seedRequests);
    } catch (err: any) {
      setHierarchyError(err?.message || 'Failed to load data');
    } finally {
      setHierarchyLoading(false);
    }
  }, [profile]);

  useEffect(() => { fetchHierarchy(); }, [fetchHierarchy]);

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  const filtered = requests.filter((r) => {
    const typeMatch = filterType === 'all' || r.type === filterType;
    const statusMatch = filterStatus === 'all' || r.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const handleAction = (id: string, action: 'approved' | 'rejected') => {
    const note = noteInputs[id] || '';
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: action, managerNote: note || undefined } : r)));
    setExpandedId(null);
    setActionToast({
      msg: action === 'approved' ? 'Request approved. Employee notified.' : 'Request rejected. Employee notified.',
      type: action === 'approved' ? 'success' : 'error',
    });
    setTimeout(() => setActionToast(null), 4000);
  };

  const currentUserName = profile?.fullName || 'You';
  const currentUserRole = profile?.role === 'manager' ? 'Manager' : profile?.role === 'admin' ? 'Admin' : 'Employee';

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
      {actionToast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-slide-up ${
          actionToast.type === 'success' ? 'bg-[#e8f5ee] border-[#bbddc9] text-[#2D7A4F]' : 'bg-red-50 border-red-200 text-red-700'
        }`}
        >
          {actionToast.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {actionToast.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Approval Inbox</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {currentUserName}
            {' '}
            ·
            {currentUserRole}
            {' '}
            · Review and action team requests
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            <AlertCircle size={14} className="text-amber-600" />
            <span className="text-sm font-bold text-amber-700">
              {pendingCount}
              {' '}
              pending
            </span>
          </div>
        )}
      </div>

      {/* Hierarchy loading */}
      {hierarchyLoading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#2D7A4F] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Loading your team hierarchy…</span>
        </div>
      )}

      {!hierarchyLoading && hierarchyError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">
          {hierarchyError}
          <button onClick={fetchHierarchy} className="ml-3 font-semibold underline">Retry</button>
        </div>
      )}

      {/* Manager card */}
      {!hierarchyLoading && !hierarchyError && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Your Manager */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <UserCog size={14} className="text-[#2D7A4F]" />
              <span className="text-xs font-bold text-gray-700">Your Manager</span>
            </div>
            {manager ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2D7A4F] to-[#1e5c3a] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-black">{getInitials(manager.full_name)}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{manager.full_name}</p>
                  <p className="text-xs text-gray-500">
                    {manager.job_title || 'Manager'}
                    {' '}
                    ·
                    {' '}
                    {manager.department || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-400">{manager.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No manager assigned — you may be at the top of the hierarchy.</p>
            )}
          </div>

          {/* Your Team */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users size={14} className="text-[#2D7A4F]" />
              <span className="text-xs font-bold text-gray-700">
                Your Team (
                {reportees.length}
                )
              </span>
              <span className="text-[10px] text-gray-400 ml-1">— from Organogram</span>
            </div>
            {reportees.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {reportees.map((emp) => {
                  const gradient = DEPT_COLORS[emp.department || ''] || 'from-[#2D7A4F] to-[#1e5c3a]';
                  return (
                    <div key={emp.id} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5">
                      <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-[9px] font-black">{getInitials(emp.full_name)}</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800 leading-none">{emp.full_name}</p>
                        <p className="text-[10px] text-gray-400 leading-none mt-0.5">{emp.job_title || emp.department || 'Employee'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No direct reportees found in the organogram.</p>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {(['leave', 'regularization', 'compoff'] as RequestType[]).map((type) => {
          const cfg = TYPE_CONFIG[type];
          const count = requests.filter((r) => r.type === type && r.status === 'pending').length;
          return (
            <button
              key={type}
              onClick={() => setFilterType(filterType === type ? 'all' : type)}
              className={`bg-white rounded-2xl border p-4 text-left transition-all hover:shadow-md ${
                filterType === type ? 'border-current shadow-sm' : 'border-gray-200'
              }`}
              style={filterType === type ? { borderColor: cfg.color } : {}}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: cfg.bg }}>
                  <cfg.icon size={13} style={{ color: cfg.color }} />
                </div>
                <span className="text-xs font-semibold text-gray-600">{cfg.label}</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: cfg.color }}>{count}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Pending</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === s ? 'bg-[#2D7A4F] text-white shadow' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1">
          {(['all', 'leave', 'regularization', 'compoff'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === t ? 'bg-[#2D7A4F] text-white shadow' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'all' ? 'All Types' : TYPE_CONFIG[t].label}
            </button>
          ))}
        </div>
      </div>

      {/* Request List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Inbox size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-500">No requests found</p>
          <p className="text-xs text-gray-400 mt-1">
            {reportees.length === 0 ? 'No reportees assigned in the organogram yet.' : 'Try changing the filters above'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => {
            const tc = TYPE_CONFIG[req.type];
            const sc = STATUS_CONFIG[req.status];
            const isExpanded = expandedId === req.id;

            return (
              <div key={req.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : req.id)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2D7A4F] to-[#1e5c3a] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{req.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-gray-800">{req.employeeName}</p>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: tc.bg, color: tc.color }}
                      >
                        {tc.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {req.employeeId}
                      {' '}
                      ·
                      {req.department}
                      {' '}
                      · Submitted
                      {formatDate(req.submittedOn)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: sc.bg, color: sc.color }}
                    >
                      {sc.label}
                    </span>
                    {isExpanded ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 space-y-4 animate-fade-in">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.entries(req.details).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 rounded-xl p-3">
                          <p className="text-[10px] text-gray-400 font-medium mb-0.5">{key}</p>
                          <p className="text-xs font-bold text-gray-800">{value}</p>
                        </div>
                      ))}
                    </div>
                    {req.status !== 'pending' && req.managerNote && (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Your note:</p>
                        <p className="text-xs text-gray-700">{req.managerNote}</p>
                      </div>
                    )}
                    {req.status === 'pending' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Note to employee (optional)
                          </label>
                          <textarea
                            value={noteInputs[req.id] || ''}
                            onChange={(e) => setNoteInputs({ ...noteInputs, [req.id]: e.target.value })}
                            rows={2}
                            placeholder="Add a note or reason for your decision..."
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#2D7A4F]/25 focus:border-[#2D7A4F] transition-all resize-none"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleAction(req.id, 'rejected')}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition-colors"
                          >
                            <XCircle size={15} />
                            Reject
                          </button>
                          <button
                            onClick={() => handleAction(req.id, 'approved')}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#2D7A4F] text-white text-sm font-bold hover:bg-[#1e5c3a] transition-colors"
                          >
                            <CheckCircle2 size={15} />
                            Approve
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
