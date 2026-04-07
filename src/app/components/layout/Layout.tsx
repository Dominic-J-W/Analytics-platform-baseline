import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router';
import {
  LayoutDashboard,
  Settings,
  LogOut,
  ClipboardCheck,
  FileText,
  Package,
  Radio,
  AlertTriangle,
  Users,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from 'figma:asset/c0c1cb850a09b9ffbeac19d94d900bb6733e7d4e.png';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, hasPermission, currentRole, logout } = useAuth();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const navigation = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, permission: 'dashboard_view' },
    { name: 'Operations', path: '/operations', icon: ClipboardCheck, permission: 'operations_view' },
    { name: 'Reports', path: '/reports', icon: FileText, permission: 'reports_view' },
    { name: 'Products', path: '/products', icon: Package, permission: 'products_view' },
    { name: 'Sensors', path: '/sensors', icon: Radio, permission: 'sensors_view' },
    { name: 'Downtime', path: '/downtime', icon: AlertTriangle, permission: 'downtime_view' },
    { name: 'Users', path: '/users', icon: Users, permission: 'users_view' },
    { name: 'Audit', path: '/audit', icon: Shield, permission: 'audit_view' },
  ];

  const visibleNavigation = navigation.filter((item) =>
    hasPermission(item.permission)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Administrator': return 'bg-purple-100 text-purple-700';
      case 'Plant Manager': return 'bg-blue-100 text-blue-700';
      case 'Viewer': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Divu Logo" className="w-10 h-10 object-contain" />
              <h1 className="text-xl text-foreground">Divu Analytics</h1>
            </div>
            <div className="flex items-center gap-3">
              {/* User Info */}
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs text-primary">{user?.username?.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-foreground">{user?.username}</span>
                  <span className={`px-1.5 py-0.5 text-xs rounded ${getRoleBadgeColor(currentRole)}`}>
                    {currentRole}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate('/settings')}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {visibleNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
