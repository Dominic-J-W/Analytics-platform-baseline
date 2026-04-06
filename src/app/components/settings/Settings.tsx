import { useState } from 'react';
import { useAuth, UserRole } from '../../context/AuthContext';
import { Settings as SettingsIcon, Shield, Eye, AlertCircle, User, Bell, Lock, Palette } from 'lucide-react';

export function Settings() {
  const { user, currentRole, setCurrentRole, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    weekly: true,
  });

  const roles: { value: UserRole; color: string; description: string }[] = [
    {
      value: 'Administrator',
      color: 'purple',
      description: 'Full system access with all permissions',
    },
    {
      value: 'Plant Manager',
      color: 'blue',
      description: 'Can view and analyze data, manage operations and production',
    },
    {
      value: 'Viewer',
      color: 'green',
      description: 'Read-only access to dashboard, reports, and data',
    },
  ];

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      green: 'bg-green-100 text-green-700 border-green-200',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl text-slate-900 mb-1">Settings</h2>
        <p className="text-slate-600">
          Manage your account preferences and view settings
        </p>
      </div>

      {/* User Profile */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg text-slate-900">Profile Information</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-700 mb-2">Username</label>
            <input
              type="text"
              value={user?.username || ''}
              disabled
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-2">
              Account Role
            </label>
            <div className="flex items-center gap-2">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getColorClass(
                  user?.role === 'Administrator'
                    ? 'purple'
                    : user?.role === 'Plant Manager'
                    ? 'blue'
                    : 'green'
                )}`}
              >
                <Shield className="w-4 h-4" />
                <span className="text-sm">{user?.role}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Preview (Admin Only) */}
      {isAdmin && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 shadow-sm p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg text-slate-900 mb-1">
                Role Preview Mode
              </h3>
              <p className="text-sm text-slate-600">
                As an administrator, you can preview how the platform appears to
                different user roles
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-700">
                Currently viewing as:{' '}
                <span className="font-medium">{currentRole}</span>
              </span>
            </div>
            <p className="text-xs text-slate-600">
              The navigation and features visible reflect the permissions of the
              selected role. Switch back to Administrator to access all features.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm text-slate-700 mb-2">
              Preview as Role
            </label>
            {roles.map((role) => (
              <label
                key={role.value}
                className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  currentRole === role.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="rolePreview"
                  value={role.value}
                  checked={currentRole === role.value}
                  onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                  className="mt-0.5 w-4 h-4 text-blue-600 border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs border ${getColorClass(
                        role.color
                      )}`}
                    >
                      <Shield className="w-3 h-3" />
                      {role.value}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{role.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg text-slate-900">Notifications</h3>
        </div>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
            <div>
              <div className="text-sm text-slate-900">Email Notifications</div>
              <div className="text-xs text-slate-500">
                Receive email updates about your analytics
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={(e) =>
                setNotifications({ ...notifications, email: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
            <div>
              <div className="text-sm text-slate-900">Push Notifications</div>
              <div className="text-xs text-slate-500">
                Get push notifications for important events
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications.push}
              onChange={(e) =>
                setNotifications({ ...notifications, push: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
            <div>
              <div className="text-sm text-slate-900">Weekly Summary</div>
              <div className="text-xs text-slate-500">
                Receive weekly analytics summary reports
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications.weekly}
              onChange={(e) =>
                setNotifications({ ...notifications, weekly: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg text-slate-900">Security</h3>
        </div>
        <div className="space-y-3">
          <button className="w-full px-4 py-3 text-left border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="text-sm text-slate-900">Change Password</div>
            <div className="text-xs text-slate-500">
              Update your password to keep your account secure
            </div>
          </button>
          <button className="w-full px-4 py-3 text-left border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="text-sm text-slate-900">
              Two-Factor Authentication
            </div>
            <div className="text-xs text-slate-500">
              Add an extra layer of security to your account
            </div>
          </button>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg text-slate-900">Appearance</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-slate-700 mb-2">Theme</label>
            <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Light Mode</option>
              <option>Dark Mode</option>
              <option>System Default</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-2">
              Date Format
            </label>
            <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>MM/DD/YYYY</option>
              <option>DD/MM/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}