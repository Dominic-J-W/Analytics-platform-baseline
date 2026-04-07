import { useState } from 'react';
import { useNavigate } from 'react-router';
import { User, Lock, Eye, EyeOff, AlertCircle, Shield, ChevronRight } from 'lucide-react';
import { useAuth, DEMO_CREDENTIALS, type DemoCredential } from '../../context/AuthContext';
import logo from 'figma:asset/c0c1cb850a09b9ffbeac19d94d900bb6733e7d4e.png';

export function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect
  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate brief network delay
    setTimeout(() => {
      const result = login(username, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Login failed.');
      }
      setLoading(false);
    }, 400);
  };

  const fillCredentials = (cred: DemoCredential) => {
    setUsername(cred.username);
    setPassword(cred.password);
    setError('');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Administrator': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Plant Manager': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Viewer': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4 shadow-lg border border-slate-200">
            <img src={logo} alt="Divu Logo" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-3xl text-slate-900 mb-2">Divu Analytics</h1>
          <p className="text-slate-600">Sign in to access your dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg p-3.5 mb-5">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm text-slate-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your username"
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-slate-500">Demo Accounts</span>
            </div>
          </div>

          {/* Demo Credential Cards */}
          <div className="space-y-2.5">
            {DEMO_CREDENTIALS.map((cred) => (
              <button
                key={cred.username}
                type="button"
                onClick={() => fillCredentials(cred)}
                className={`w-full text-left p-3.5 rounded-lg border-2 transition-all hover:shadow-md group ${
                  username === cred.username && password === cred.password
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-slate-200 hover:border-blue-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border ${getRoleBadgeColor(cred.role)}`}>
                        <Shield className="w-3 h-3" />
                        {cred.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm mt-1.5">
                      <span className="text-slate-900">
                        <span className="text-slate-500">User:</span> <span className="font-mono">{cred.username}</span>
                      </span>
                      <span className="text-slate-900">
                        <span className="text-slate-500">Pass:</span> <span className="font-mono">{cred.password}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{cred.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 flex-shrink-0 ml-2 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center mt-6 text-xs text-slate-500">
          Divu Analytics v1.0 — Click any demo account above to auto-fill credentials
        </p>
      </div>
    </div>
  );
}
