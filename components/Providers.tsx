'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { ModalProvider } from './Modal/Context';
import { UserProvider } from './Context/userProvider';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ModalProvider>
        <UserProvider>
          {children}
        </UserProvider>
      </ModalProvider>
    </SessionProvider>
  );
}
