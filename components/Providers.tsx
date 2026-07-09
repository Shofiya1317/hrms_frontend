'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode, useState } from 'react';
import { ModalProvider } from './Modal/Context';
import { UserProvider } from './Context/userProvider';

import { Session } from 'next-auth';

import { ApprovalCountsProvider } from '@/lib/context/ApprovalCountsContext';
import { TeamApprovalCountsProvider } from '@/lib/context/TeamApprovalCountsContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationProvider } from '@/lib/context/NotificationContext';

export default function Providers({ children, session }: { children: ReactNode, session?: Session | null }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session} refetchOnWindowFocus={false}>
        <ModalProvider>
          <UserProvider>
            <NotificationProvider>
              <ApprovalCountsProvider>
                <TeamApprovalCountsProvider>
                  {children}
                </TeamApprovalCountsProvider>
              </ApprovalCountsProvider>
            </NotificationProvider>
          </UserProvider>
        </ModalProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
