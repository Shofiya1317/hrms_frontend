'use client';

import { IRoleAccess } from '@/lib/interface/IRole.interface';
import { IUser } from '@/lib/interface/IUser.interface';
import { RoleService, UserService } from '@/lib/service';
import { useParams } from 'next/navigation';
import React, {
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

export interface UserContextProp {
  getCurrentUser: () => Promise<{ user: IUser } | null>;
  currentUser: IUser | undefined;
  currentRole: Record<string, string[]> | undefined;
  getCurrentRoleAccess: () => Promise<{ access: Record<string, string[]> } | null>;
  roleAccessDetails: IRoleAccess | undefined;
  getRoleAccess: () => Promise<{ roleAccess: IRoleAccess } | null>;
}

export interface UserProviderProps {
  children: ReactNode;
}

const UserContext = React.createContext<UserContextProp | null>(null);

function UserProvider({ children }: Readonly<UserProviderProps>) {
  const params = useParams();
  const subdomain = params?.subdomain as string;

  // No localStorage in initializers — prevents server/client hydration mismatch
  const [currentUser, setCurrentUser] = useState<IUser | undefined>(undefined);
  const [currentRole, setCurrentRole] = useState<Record<string, string[]> | undefined>(undefined);
  const [roleAccessDetails, setRoleAccessDetails] = useState<IRoleAccess | undefined>(undefined);

  // Prevents duplicate concurrent API calls
  const fetchingRef = useRef(false);

  const getCurrentRoleAccess = useCallback(async () => {
    const res = await RoleService.getCurrentAccess(subdomain);
    const { access, success } = res?.data as {
      access: Record<string, string[]>;
      success: boolean;
    };
    if (success) {
      setCurrentRole(access);
      return { access };
    }
    return null;
  }, [subdomain]);

  const getCurrentUser = useCallback(async () => {
    if (fetchingRef.current) return null;
    fetchingRef.current = true;
    try {
      const res = await UserService.getCurrentUser(subdomain);
      const { user, success } = res?.data as {
        user: IUser;
        success: boolean;
      };
      if (success) {
        setCurrentUser(user);
        await getCurrentRoleAccess();
        return { user };
      }
      return null;
    } finally {
      fetchingRef.current = false;
    }
  }, [subdomain, getCurrentRoleAccess]);

  const getRoleAccess = useCallback(async () => {
    const res = await RoleService.getRoleDetails(subdomain);
    const { role_access: roleAccess, success } = res?.data as {
      role_access: IRoleAccess;
      success: boolean;
    };
    if (success) {
      setRoleAccessDetails(roleAccess);
      return { roleAccess };
    }
    return null;
  }, [subdomain]);

  const value: UserContextProp = useMemo(
    () => ({
      getCurrentUser,
      currentUser,
      currentRole,
      getCurrentRoleAccess,
      roleAccessDetails,
      getRoleAccess,
    }),
    [getCurrentUser, currentUser, currentRole, getCurrentRoleAccess, roleAccessDetails, getRoleAccess],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

const useUser = () => React.useContext(UserContext);
export { UserProvider, useUser };
