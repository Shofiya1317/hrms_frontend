'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { ModalProvider } from './Modal/Context';
import { UserProvider } from './Context/userProvider';

import { Session } from 'next-auth';

import { ApprovalCountsProvider } from '@/lib/context/ApprovalCountsContext';
import { TeamApprovalCountsProvider } from '@/lib/context/TeamApprovalCountsContext';

export default function Providers({ children, session }: { children: ReactNode, session?: Session | null }) {
  return (
    <SessionProvider session={session} refetchOnWindowFocus={false}>
      <ModalProvider>
        <UserProvider>
          <ApprovalCountsProvider>
            <TeamApprovalCountsProvider>
              {children}
            </TeamApprovalCountsProvider>
          </ApprovalCountsProvider>
        </UserProvider>
      </ModalProvider>
    </SessionProvider>
  );
}
