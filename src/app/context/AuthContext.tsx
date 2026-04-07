import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type UserRole = 'Administrator' | 'Plant Manager' | 'Viewer';

// Aligned with DIVU_USERS table in ERD
export interface User {
  uid: string;
  kc_sub: string;
  username: string;
  email: string;
  status: 'active' | 'locked' | 'disabled';
  role: UserRole;
  is_admin: boolean;
  is_super_admin: boolean;
  created_at: Date;
  updated_at: Date;
}

// Demo credential entry
export interface DemoCredential {
  username: string;
  password: string;
  role: UserRole;
  description: string;
}

// Hard-coded demo credentials for each role
export const DEMO_CREDENTIALS: DemoCredential[] = [
  { username: 'admin', password: 'admin123', role: 'Administrator', description: 'Full system access — manage users, view audit logs, all CRUD operations' },
  { username: 'manager', password: 'manager123', role: 'Plant Manager', description: 'Operational access — manage production, sensors, downtime, and reports' },
  { username: 'viewer', password: 'viewer123', role: 'Viewer', description: 'Read-only access — view dashboards, reports, and data only' },
];

// Demo user profiles mapped to credentials
const DEMO_USERS: Record<string, User> = {
  admin: {
    uid: '1',
    kc_sub: '550e8400-e29b-41d4-a716-446655440000',
    username: 'admin',
    email: 'admin@divuanalytics.com',
    status: 'active',
    role: 'Administrator',
    is_admin: true,
    is_super_admin: true,
    created_at: new Date('2026-01-01T00:00:00Z'),
    updated_at: new Date('2026-03-05T00:00:00Z'),
  },
  manager: {
    uid: '2',
    kc_sub: '550e8400-e29b-41d4-a716-446655440001',
    username: 'manager',
    email: 'manager@divuanalytics.com',
    status: 'active',
    role: 'Plant Manager',
    is_admin: false,
    is_super_admin: false,
    created_at: new Date('2026-01-15T08:00:00Z'),
    updated_at: new Date('2026-02-20T14:30:00Z'),
  },
  viewer: {
    uid: '3',
    kc_sub: '550e8400-e29b-41d4-a716-446655440002',
    username: 'viewer',
    email: 'viewer@divuanalytics.com',
    status: 'active',
    role: 'Viewer',
    is_admin: false,
    is_super_admin: false,
    created_at: new Date('2026-02-01T10:00:00Z'),
    updated_at: new Date('2026-02-01T10:00:00Z'),
  },
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  isAdmin: boolean;
  hasPermission: (permission: string) => boolean;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role permissions mapping
const rolePermissions: Record<UserRole, string[]> = {
  Administrator: [
    'dashboard_view', 'dashboard_export',
    'operations_view', 'operations_manage',
    'reports_view', 'reports_generate',
    'products_view', 'products_manage',
    'sensors_view', 'sensors_manage',
    'downtime_view', 'downtime_manage',
    'users_view', 'users_manage',
    'audit_view',
  ],
  'Plant Manager': [
    'dashboard_view', 'dashboard_export',
    'operations_view', 'operations_manage',
    'reports_view', 'reports_generate',
    'products_view', 'products_manage',
    'sensors_view', 'sensors_manage',
    'downtime_view', 'downtime_manage',
  ],
  Viewer: [
    'dashboard_view',
    'operations_view',
    'reports_view',
    'products_view',
    'sensors_view',
    'downtime_view',
  ],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('Viewer');

  const isAuthenticated = user !== null;
  const isAdmin = user?.role === 'Administrator';

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    return rolePermissions[currentRole]?.includes(permission) || false;
  }, [user, currentRole]);

  const login = useCallback((username: string, password: string): { success: boolean; error?: string } => {
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      return { success: false, error: 'Please enter both username and password.' };
    }

    // Find matching credential
    const credential = DEMO_CREDENTIALS.find(
      (c) => c.username.toLowerCase() === trimmedUsername && c.password === trimmedPassword
    );

    if (!credential) {
      // Check if username exists but password is wrong
      const usernameExists = DEMO_CREDENTIALS.some(
        (c) => c.username.toLowerCase() === trimmedUsername
      );
      if (usernameExists) {
        return { success: false, error: 'Incorrect password. Please check your credentials and try again.' };
      }
      return { success: false, error: 'Invalid username or password. Use one of the demo accounts shown below.' };
    }

    // Look up the user profile
    const matchedUser = DEMO_USERS[credential.username];
    if (!matchedUser) {
      return { success: false, error: 'User profile not found.' };
    }

    // Check account status
    if (matchedUser.status === 'locked') {
      return { success: false, error: 'This account has been locked. Please contact an administrator.' };
    }
    if (matchedUser.status === 'disabled') {
      return { success: false, error: 'This account has been disabled.' };
    }

    setUser(matchedUser);
    setCurrentRole(matchedUser.role);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setCurrentRole('Viewer');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        currentRole,
        setCurrentRole,
        isAdmin,
        hasPermission,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
