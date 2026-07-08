'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getTeamApprovalCounts, IApprovalCounts } from '@/lib/service/employee';
import { useSession } from 'next-auth/react';

interface TeamApprovalCountsContextType {
  teamCounts: IApprovalCounts | null;
  refreshTeamCounts: () => void;
}

const TeamApprovalCountsContext = createContext<TeamApprovalCountsContextType>({
  teamCounts: null,
  refreshTeamCounts: () => {},
});

export function TeamApprovalCountsProvider({ children }: { children: ReactNode }) {
  const [teamCounts, setTeamCounts] = useState<IApprovalCounts | null>(null);
  const { data: session } = useSession();

  const refreshTeamCounts = () => {
    if (!session?.user) return;
    
    const token = (session.user as any)?.accessToken;
    const tenantId = (session.user as any)?.apiKey;
    
    if (tenantId) {
      getTeamApprovalCounts(tenantId, token)
        .then((res: any) => {
          setTeamCounts(res?.data?.data ?? res?.data ?? null);
        })
        .catch(console.error);
    }
  };

  useEffect(() => {
    refreshTeamCounts();
  }, [session]);

  return (
    <TeamApprovalCountsContext.Provider value={{ teamCounts, refreshTeamCounts }}>
      {children}
    </TeamApprovalCountsContext.Provider>
  );
}

export function useTeamApprovalCounts() {
  return useContext(TeamApprovalCountsContext);
}
