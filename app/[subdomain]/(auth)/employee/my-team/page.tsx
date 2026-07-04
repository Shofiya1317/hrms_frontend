'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Loader2, Users, Calendar, ClipboardList, Gift, Home,
} from 'lucide-react';
import { getMyTeam, ITeamMember } from '@/lib/service/employee';
import TeamLeaveRequests from '@/components/EmployeePortal/EmployeeManager/TeamLeaveRequests';
import TeamAttendanceLogs from '@/components/EmployeePortal/EmployeeManager/TeamAttendanceLogs';
import TeamRegularization from '@/components/EmployeePortal/EmployeeManager/TeamRegularization';
import TeamCompOffRequests from '@/components/EmployeePortal/EmployeeManager/TeamCompOffRequests';
import TeamWFHRequests from '@/components/EmployeePortal/EmployeeManager/TeamWFHRequests';
import TeamMembersStrip from '@/components/EmployeePortal/EmployeeManager/TeamMembersStrip';
import TeamOnDutyRequests from '@/components/EmployeePortal/EmployeeManager/TeamOnDutyRequests';
import TeamLeaveOverview from '@/components/EmployeePortal/EmployeeManager/TeamLeaveOverview';

type Tab =
  | 'leave-requests'
  | 'attendance-logs'
  | 'regularization'
  | 'comp-off'
  | 'wfh-requests'
  | 'onduty-requests';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'leave-requests', label: 'Leave Requests', icon: Calendar },
  { id: 'attendance-logs', label: 'Attendance Logs', icon: ClipboardList },
  { id: 'regularization', label: 'Regularization', icon: Users },
  { id: 'comp-off', label: 'Comp Off', icon: Gift },
  { id: 'wfh-requests', label: 'WFH Requests', icon: Home },
  { id: 'onduty-requests', label: 'On-Duty Requests', icon: Home },
];

export default function MyTeamPage() {
  const params = useParams();
  const subdomain = params?.subdomain as string;

  const [activeTab, setActiveTab] = useState<Tab>('leave-requests');
  const [team, setTeam] = useState<ITeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (subdomain) fetchTeam();
  }, [subdomain]);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await getMyTeam(subdomain);
      // Response structure: { data: { children: [...] } }
      const teamData = res?.data?.data ?? res?.data;
      setTeam(teamData?.children ?? []);
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally { setLoading(false); }
  };

  const teamIds = team.map((t) => t.id);

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#0f1f2e]">My Team</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {loading
              ? 'Loading...'
              : `${team.length} team member${team.length !== 1 ? 's' : ''} reporting to you`}
          </p>
        </div>
        
        {/* Upcoming Team Leaves Widget */}
        <TeamLeaveOverview subdomain={subdomain} />
      </div>

      {/* Team members story strip */}
      <TeamMembersStrip team={team} loading={loading} />

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={22} className="animate-spin text-[#0f766e]" />
        </div>
      ) : team.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
          <Users size={32} className="text-gray-200 mb-3" />
          <p className="text-sm font-semibold text-gray-400">No team members</p>
          <p className="text-xs text-gray-400 mt-1">You don't have any direct reports yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-2 border-b border-gray-100 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-[#0f766e] text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === 'leave-requests' && <TeamLeaveRequests teamIds={teamIds} />}
            {activeTab === 'attendance-logs' && <TeamAttendanceLogs teamIds={teamIds} />}
            {activeTab === 'regularization' && <TeamRegularization teamIds={teamIds} />}
            {activeTab === 'comp-off' && <TeamCompOffRequests />}
            {activeTab === 'wfh-requests' && <TeamWFHRequests />}
            {activeTab === 'onduty-requests' && <TeamOnDutyRequests />}
          </div>
        </div>
      )}
    </div>
  );
}
