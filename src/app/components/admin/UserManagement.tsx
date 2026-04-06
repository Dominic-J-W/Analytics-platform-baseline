import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Shield,
  Plus,
  Edit2,
  Trash2,
  Search,
  Mail,
  Lock,
  Unlock,
  Crown,
  AlertCircle,
} from 'lucide-react';

// Aligned with DIVU_USERS table in ERD
interface User {
  uid: string; // Primary key
  kc_sub: string; // Keycloak JWT sub UUID (unique, NOT NULL)
  username: string; // Unique username (NOT NULL)
  email: string; // Unique email (NOT NULL)
  status: 'active' | 'locked' | 'disabled'; // User status
  created_at: Date; // Timestamp (DEFAULT SYSTIMESTAMP)
  updated_at: Date; // Timestamp (DEFAULT SYSTIMESTAMP)
}

// Aligned with DIVU_ADMIN table in ERD
interface AdminEntry {
  admin_id: string; // Primary key
  uid: string; // Foreign key to DIVU_USERS (unique, NOT NULL)
  is_super_admin: boolean; // Super admin flag (DEFAULT 'N', CHECK IN ('Y','N'))
}

export function UserManagement() {
  const { hasPermission, user: currentUser } = useAuth();
  const canManageUsers = hasPermission('users_manage');
  const isSuperAdmin = currentUser?.is_super_admin;

  const [activeTab, setActiveTab] = useState<'users' | 'admins'>('users');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock users data - aligned with DIVU_USERS
  const [users, setUsers] = useState<User[]>([
    {
      uid: '1',
      kc_sub: '550e8400-e29b-41d4-a716-446655440000',
      username: 'admin_user',
      email: 'admin@divuanalytics.com',
      status: 'active',
      created_at: new Date('2026-01-01T00:00:00'),
      updated_at: new Date('2026-03-05T00:00:00'),
    },
    {
      uid: '2',
      kc_sub: '550e8400-e29b-41d4-a716-446655440001',
      username: 'plant_manager_1',
      email: 'manager1@divuanalytics.com',
      status: 'active',
      created_at: new Date('2026-01-15T08:00:00'),
      updated_at: new Date('2026-02-20T14:30:00'),
    },
    {
      uid: '3',
      kc_sub: '550e8400-e29b-41d4-a716-446655440002',
      username: 'viewer_1',
      email: 'viewer1@divuanalytics.com',
      status: 'active',
      created_at: new Date('2026-02-01T10:00:00'),
      updated_at: new Date('2026-02-01T10:00:00'),
    },
    {
      uid: '4',
      kc_sub: '550e8400-e29b-41d4-a716-446655440003',
      username: 'locked_user',
      email: 'locked@divuanalytics.com',
      status: 'locked',
      created_at: new Date('2026-01-20T12:00:00'),
      updated_at: new Date('2026-03-10T09:15:00'),
    },
  ]);

  // Mock admin entries - aligned with DIVU_ADMIN
  const [admins, setAdmins] = useState<AdminEntry[]>([
    {
      admin_id: '1',
      uid: '1',
      is_super_admin: true,
    },
  ]);

  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({ username: '', email: '', kc_sub: '', status: 'active' as User['status'] });

  const openUserForm = (u?: User) => {
    if (u) {
      setEditingUser(u);
      setUserForm({ username: u.username, email: u.email, kc_sub: u.kc_sub, status: u.status });
    } else {
      setEditingUser(null);
      setUserForm({ username: '', email: '', kc_sub: crypto.randomUUID?.() || Date.now().toString(), status: 'active' });
    }
    setShowUserForm(true);
  };

  const handleSaveUser = () => {
    if (!userForm.username || !userForm.email) return;
    if (editingUser) {
      setUsers(users.map(u => u.uid === editingUser.uid ? { ...u, username: userForm.username, email: userForm.email, kc_sub: userForm.kc_sub, status: userForm.status, updated_at: new Date() } : u));
    } else {
      const newUser: User = {
        uid: Date.now().toString(),
        kc_sub: userForm.kc_sub,
        username: userForm.username,
        email: userForm.email,
        status: userForm.status,
        created_at: new Date(),
        updated_at: new Date(),
      };
      setUsers([...users, newUser]);
    }
    setShowUserForm(false);
    setEditingUser(null);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'locked':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'disabled':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: User['status']) => {
    switch (status) {
      case 'active':
        return <Unlock className="w-4 h-4" />;
      case 'locked':
        return <Lock className="w-4 h-4" />;
      case 'disabled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const isUserAdmin = (uid: string) => {
    return admins.some((admin) => admin.uid === uid);
  };

  const isUserSuperAdmin = (uid: string) => {
    return admins.some((admin) => admin.uid === uid && admin.is_super_admin);
  };

  const handleToggleAdminStatus = (uid: string) => {
    if (!isSuperAdmin) {
      alert('Only super administrators can grant or revoke admin privileges');
      return;
    }

    const existingAdmin = admins.find((admin) => admin.uid === uid);
    
    if (existingAdmin) {
      if (confirm('Remove admin privileges from this user?')) {
        setAdmins(admins.filter((admin) => admin.uid !== uid));
      }
    } else {
      const newAdmin: AdminEntry = {
        admin_id: Date.now().toString(),
        uid: uid,
        is_super_admin: false,
      };
      setAdmins([...admins, newAdmin]);
    }
  };

  const handleToggleSuperAdmin = (uid: string) => {
    if (!isSuperAdmin) {
      alert('Only super administrators can grant super admin privileges');
      return;
    }

    setAdmins(
      admins.map((admin) =>
        admin.uid === uid
          ? { ...admin, is_super_admin: !admin.is_super_admin }
          : admin
      )
    );
  };

  const handleToggleUserStatus = (uid: string, currentStatus: User['status']) => {
    const newStatus = currentStatus === 'active' ? 'locked' : 'active';
    setUsers(
      users.map((u) =>
        u.uid === uid
          ? { ...u, status: newStatus, updated_at: new Date() }
          : u
      )
    );
  };

  const handleDeleteUser = (uid: string) => {
    if (uid === currentUser?.uid) {
      alert('You cannot delete your own account');
      return;
    }

    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      // Remove from admin table if exists
      setAdmins(admins.filter((admin) => admin.uid !== uid));
      // Remove from users table
      setUsers(users.filter((u) => u.uid !== uid));
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.kc_sub.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const adminUsers = users.filter((user) => isUserAdmin(user.uid));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl text-foreground mb-1">User Management</h2>
        <p className="text-muted-foreground">
          Manage user accounts and administrator privileges
        </p>
      </div>

      {/* Admin Warning */}
      {!isSuperAdmin && canManageUsers && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800">
              You have limited user management permissions. Only super administrators can grant or revoke admin privileges.
            </p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users by name, email, or Keycloak UUID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card rounded-lg border border-border shadow-sm">
        <div className="border-b border-border">
          <div className="flex">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'users'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="w-4 h-4" />
              All Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'admins'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Shield className="w-4 h-4" />
              Administrators ({adminUsers.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* All Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                </p>
                {canManageUsers && (
                  <button
                    onClick={() => openUserForm()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add User
                  </button>
                )}
              </div>

              {showUserForm && (
                <div className="bg-accent rounded-lg border border-border p-4 space-y-4">
                  <h3 className="text-sm text-foreground font-medium">
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-foreground mb-2">Username</label>
                      <input
                        type="text"
                        placeholder="e.g., john_doe"
                        value={userForm.username}
                        onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                        className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-foreground mb-2">Email</label>
                      <input
                        type="email"
                        placeholder="e.g., john@example.com"
                        value={userForm.email}
                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                        className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm text-foreground mb-2">
                        Keycloak Sub UUID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 550e8400-e29b-41d4-a716-446655440000"
                        value={userForm.kc_sub}
                        onChange={(e) => setUserForm({ ...userForm, kc_sub: e.target.value })}
                        className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-foreground mb-2">Status</label>
                      <select
                        value={userForm.status}
                        onChange={(e) => setUserForm({ ...userForm, status: e.target.value as User['status'] })}
                        className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      >
                        <option value="active">Active</option>
                        <option value="locked">Locked</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setShowUserForm(false)}
                      className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveUser}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      {editingUser ? 'Update User' : 'Create User'}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <div
                    key={user.uid}
                    className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="text-foreground font-medium">{user.username}</h4>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                          {isUserAdmin(user.uid) && (
                            <div className="flex items-center gap-1">
                              <Shield className="w-4 h-4 text-purple-600" />
                              {isUserSuperAdmin(user.uid) && (
                                <Crown className="w-4 h-4 text-amber-600" />
                              )}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                          <div>
                            <span className="text-muted-foreground">Keycloak Sub:</span>{' '}
                            <span className="text-foreground font-mono text-xs">{user.kc_sub}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Status:</span>{' '}
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border ${getStatusColor(
                                user.status
                              )}`}
                            >
                              {getStatusIcon(user.status)}
                              {user.status}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Created:</span>{' '}
                            <span className="text-foreground">{formatDateTime(user.created_at)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Updated:</span>{' '}
                            <span className="text-foreground">{formatDateTime(user.updated_at)}</span>
                          </div>
                        </div>
                      </div>

                      {canManageUsers && user.uid !== currentUser?.uid && (
                        <div className="flex flex-col gap-1">
                          {isSuperAdmin && (
                            <>
                              <button
                                onClick={() => handleToggleAdminStatus(user.uid)}
                                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                                  isUserAdmin(user.uid)
                                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                {isUserAdmin(user.uid) ? 'Revoke Admin' : 'Make Admin'}
                              </button>
                              {isUserAdmin(user.uid) && (
                                <button
                                  onClick={() => handleToggleSuperAdmin(user.uid)}
                                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                                    isUserSuperAdmin(user.uid)
                                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                  }`}
                                >
                                  {isUserSuperAdmin(user.uid) ? 'Remove Super' : 'Make Super'}
                                </button>
                              )}
                            </>
                          )}
                          <button
                            onClick={() => handleToggleUserStatus(user.uid, user.status)}
                            className="px-3 py-1 text-xs bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                          >
                            {user.status === 'active' ? 'Lock' : 'Unlock'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.uid)}
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Administrators Tab */}
          {activeTab === 'admins' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {adminUsers.length} administrator{adminUsers.length !== 1 ? 's' : ''}
              </p>

              <div className="space-y-3">
                {adminUsers.map((user) => {
                  const adminEntry = admins.find((a) => a.uid === user.uid);
                  return (
                    <div
                      key={user.uid}
                      className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Shield className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-foreground font-medium">{user.username}</h4>
                                {adminEntry?.is_super_admin && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-amber-100 text-amber-700 border border-amber-200 rounded">
                                    <Crown className="w-3 h-3" />
                                    Super Admin
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                            <div>
                              <span className="text-muted-foreground">Admin ID:</span>{' '}
                              <span className="text-foreground font-mono">{adminEntry?.admin_id}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">User ID:</span>{' '}
                              <span className="text-foreground font-mono">{user.uid}</span>
                            </div>
                          </div>
                        </div>

                        {isSuperAdmin && user.uid !== currentUser?.uid && (
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleToggleSuperAdmin(user.uid)}
                              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                                adminEntry?.is_super_admin
                                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                              }`}
                            >
                              {adminEntry?.is_super_admin ? 'Remove Super' : 'Make Super'}
                            </button>
                            <button
                              onClick={() => handleToggleAdminStatus(user.uid)}
                              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              Revoke Admin
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}