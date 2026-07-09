'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { getApprovalCounts, IApprovalCounts } from '@/lib/service/employee';
import { useSession } from 'next-auth/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/components/Context/userProvider';

interface ApprovalCountsContextType {
  counts: IApprovalCounts | null;
  refreshCounts: () => void;
}

const ApprovalCountsContext = createContext<ApprovalCountsContextType>({
  counts: null,
  refreshCounts: () => {},
});

export function ApprovalCountsProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { currentUser } = useUser();

  const token = (session?.user as any)?.accessToken;
  const tenantId = (session?.user as any)?.apiKey;

  const isAdmin = currentUser?.role?.toLowerCase() !== 'employee';

  const { data } = useQuery({
    queryKey: ['approvalCounts', tenantId, token],
    queryFn: async () => {
      if (!tenantId) return null;
      const res = await getApprovalCounts(tenantId, token);
      return res?.data?.data ?? res?.data ?? null;
    },
    enabled: !!tenantId && !!currentUser && isAdmin,
  });

  const refreshCounts = () => {
    queryClient.invalidateQueries({ queryKey: ['approvalCounts'] });
  };

  const counts = data ?? null;

  return (
    <ApprovalCountsContext.Provider value={{ counts, refreshCounts }}>
      {children}
    </ApprovalCountsContext.Provider>
  );
}

export function useApprovalCounts() {
  return useContext(ApprovalCountsContext);
}
