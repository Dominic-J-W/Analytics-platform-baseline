import { Outlet, Link, useLocation, useNavigate } from 'react-router';
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
  const { hasPermission } = useAuth();

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

  // Filter navigation items based on permissions
  const visibleNavigation = navigation.filter((item) =>
    hasPermission(item.permission)
  );

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
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/settings')}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              <Link
                to="/login"
                className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </Link>
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