'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { getTeamApprovalCounts, IApprovalCounts } from '@/lib/service/employee';
import { useSession } from 'next-auth/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/components/Context/userProvider';

interface TeamApprovalCountsContextType {
  teamCounts: IApprovalCounts | null;
  refreshTeamCounts: () => void;
}

const TeamApprovalCountsContext = createContext<TeamApprovalCountsContextType>({
  teamCounts: null,
  refreshTeamCounts: () => {},
});

export function TeamApprovalCountsProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { currentUser } = useUser();

  const token = (session?.user as any)?.accessToken;
  const tenantId = (session?.user as any)?.apiKey;

  const { data } = useQuery({
    queryKey: ['teamApprovalCounts', tenantId, token],
    queryFn: async () => {
      if (!tenantId) return null;
      const res = await getTeamApprovalCounts(tenantId, token);
      return res?.data?.data ?? res?.data ?? null;
    },
    enabled: !!tenantId && !!currentUser,
  });

  const refreshTeamCounts = () => {
    queryClient.invalidateQueries({ queryKey: ['teamApprovalCounts'] });
  };

  const teamCounts = data ?? null;

  return (
    <TeamApprovalCountsContext.Provider value={{ teamCounts, refreshTeamCounts }}>
      {children}
    </TeamApprovalCountsContext.Provider>
  );
}

export function useTeamApprovalCounts() {
  return useContext(TeamApprovalCountsContext);
}
