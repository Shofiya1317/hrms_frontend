'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getApprovalCounts, IApprovalCounts } from '@/lib/service/employee';
import { useSession } from 'next-auth/react';

interface ApprovalCountsContextType {
  counts: IApprovalCounts | null;
  refreshCounts: () => void;
}

const ApprovalCountsContext = createContext<ApprovalCountsContextType>({
  counts: null,
  refreshCounts: () => {},
});

export function ApprovalCountsProvider({ children }: { children: ReactNode }) {
  const [counts, setCounts] = useState<IApprovalCounts | null>(null);
  const { data: session } = useSession();

  const refreshCounts = () => {
    if (!session?.user) return;
    
    const token = (session.user as any)?.accessToken;
    const tenantId = (session.user as any)?.apiKey;
    
    if (tenantId) {
      getApprovalCounts(tenantId, token)
        .then((res: any) => {
          // Adjust based on the actual API response shape
          setCounts(res?.data?.data ?? res?.data ?? null);
        })
        .catch(console.error);
    }
  };

  useEffect(() => {
    refreshCounts();
  }, [session]);

  return (
    <ApprovalCountsContext.Provider value={{ counts, refreshCounts }}>
      {children}
    </ApprovalCountsContext.Provider>
  );
}

export function useApprovalCounts() {
  return useContext(ApprovalCountsContext);
}
