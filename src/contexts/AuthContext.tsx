'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'admin' | 'manager' | 'employee';

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  employeeId?: string;
  department?: string;
  avatarUrl?: string;
  isActive: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  session: UserProfile | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getUserProfile: () => Promise<UserProfile | null>;
}

const STATIC_USERS: (UserProfile & { password: string })[] = [
  {
    id: '1',
    email: 'admin@impactree.in',
    password: 'Admin@Workflo26',
    fullName: 'Arjun Mehta',
    role: 'admin',
    employeeId: 'EMP-001',
    department: 'Management',
    isActive: true,
  },
  {
    id: '2',
    email: 'manager@impactree.in',
    password: 'Mgr@Workflo26',
    fullName: 'Rahul Sharma',
    role: 'manager',
    employeeId: 'EMP-002',
    department: 'Operations',
    isActive: true,
  },
  {
    id: '3',
    email: 'employee@impactree.in',
    password: 'Emp@Workflo26',
    fullName: 'Ananya Krishnan',
    role: 'employee',
    employeeId: 'EMP-003',
    department: 'Engineering',
    isActive: true,
  },
];

const ROLE_DESTINATIONS: Record<UserRole, string> = {
  admin: '/admin',
  manager: '/employee/manager',
  employee: '/employee',
};

const SESSION_KEY = 'auth_user';

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) setProfile(JSON.parse(stored));
    } catch {}
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const match = STATIC_USERS.find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password
    );
    if (!match) throw new Error('Invalid email or password.');
    const { password: _, ...user } = match;
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    setProfile(user);
    router.push(ROLE_DESTINATIONS[user.role]);
  };

  const signOut = async () => {
    localStorage.removeItem(SESSION_KEY);
    setProfile(null);
    router.push('/sign-up-login-screen');
  };

  const getUserProfile = async () => profile;

  return (
    <AuthContext.Provider value={{ user: profile, session: profile, profile, loading, signIn, signOut, getUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
