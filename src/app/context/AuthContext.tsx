import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'Administrator' | 'Plant Manager' | 'Viewer';

// Aligned with DIVU_USERS table in ERD
export interface User {
  uid: string; // Primary key
  kc_sub: string; // Keycloak JWT sub UUID (unique)
  username: string; // Unique username
  email: string; // Unique email
  status: 'active' | 'locked' | 'disabled'; // User status
  role: UserRole; // Simplified role for UI (determined by DIVU_ADMIN membership)
  is_admin: boolean; // True if user exists in DIVU_ADMIN table
  is_super_admin: boolean; // True if DIVU_ADMIN.is_super_admin = true
  created_at: Date;
  updated_at: Date;
}

interface AuthContextType {
  user: User | null;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  isAdmin: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user - in a real app, this would come from Keycloak authentication
const mockUser: User = {
  uid: '1',
  kc_sub: '550e8400-e29b-41d4-a716-446655440000', // Mock Keycloak UUID
  username: 'admin_user',
  email: 'admin@example.com',
  status: 'active',
  role: 'Administrator',
  is_admin: true, // User exists in DIVU_ADMIN table
  is_super_admin: true, // DIVU_ADMIN.is_super_admin = true
  created_at: new Date('2026-01-01T00:00:00Z'),
  updated_at: new Date('2026-03-05T00:00:00Z'),
};

// Role permissions mapping
// Note: Roles are managed through DIVU_ADMIN table (admin/super_admin)
// and application-level permissions, not a separate DIVU_ROLES table
const rolePermissions: Record<UserRole, string[]> = {
  Administrator: [
    'dashboard_view',
    'dashboard_export',
    'operations_view',
    'operations_manage',
    'reports_view',
    'reports_generate',
    'products_view',
    'products_manage',
    'sensors_view',
    'sensors_manage',
    'downtime_view',
    'downtime_manage',
    'users_view',
    'users_manage',
    'audit_view',
  ],
  'Plant Manager': [
    'dashboard_view',
    'dashboard_export',
    'operations_view',
    'operations_manage',
    'reports_view',
    'reports_generate',
    'products_view',
    'products_manage',
    'sensors_view',
    'sensors_manage',
    'downtime_view',
    'downtime_manage',
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
  const [user] = useState<User | null>(mockUser);
  const [currentRole, setCurrentRole] = useState<UserRole>(mockUser.role);

  const isAdmin = user?.role === 'Administrator';

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return rolePermissions[currentRole]?.includes(permission) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentRole,
        setCurrentRole,
        isAdmin,
        hasPermission,
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