import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
// Use the logo from public folder
const logo = '/logo.png';
import { authAPI, getApiBaseUrl } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { checkApiHealth } from '@/lib/api-health';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'candidate' | 'employer' | 'staff' | 'admin'>('candidate');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if API is available
    checkApiHealth().then(setApiConnected);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please enter both email and password',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const result = await authAPI.login(email, password, role);

      if (result && result.user) {
        toast({
          title: 'Success',
          description: 'Logged in successfully',
        });

        // Pass user in state so ProtectedRoute/DashboardLayout don't need to call /me immediately
        const userRole = result.user.role || role;
        const path = userRole === 'candidate' ? '/candidate/dashboard'
          : userRole === 'employer' ? '/employer/dashboard'
            : userRole === 'staff' ? '/staff/dashboard'
              : userRole === 'admin' ? '/admin/dashboard'
                : '/';
        navigate(path, { state: { user: result.user } });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const serverMessage = error.response?.data?.error;
      const errorMessage =
        serverMessage ||
        error.message ||
        'Failed to login. Please check your credentials and make sure the backend server is running.';

      if (error.response?.status === 401) {
        const hint = typeof window !== 'undefined' && getApiBaseUrl().includes('localhost')
          ? ' Use admin@example.com / admin123. If this is a deployed site, set VITE_API_URL to your backend URL and rebuild.'
          : ' Use admin@example.com / admin123 (Admin role).';
        setErrorMsg((serverMessage || 'Invalid email or password.') + hint);
      } else if (errorMessage.includes('registered as')) {
        setErrorMsg(errorMessage);
      } else {
        setErrorMsg(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-3 mb-10">
            <img src={logo} alt="Logo" className="h-10 w-auto" />
          </Link>

          <h1 className="text-3xl font-display font-bold text-cream mb-2">
            Welcome back
          </h1>
          <p className="text-cream/60 mb-8">
            Sign in to your account to continue
          </p>

          {apiConnected === false && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div className="flex-1">
                <p className="text-sm text-red-400 font-medium">Backend server not connected</p>
                <p className="text-xs text-red-400/70 mt-1">
                  Please make sure the backend server is running on http://localhost:3001
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Demo role selector */}
            <div>
              <label className="block text-sm font-medium text-cream/80 mb-2">
                Demo Role (for testing)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'candidate', label: 'Candidate' },
                  { value: 'employer', label: 'Employer' },
                  { value: 'staff', label: 'Staff' },
                  { value: 'admin', label: 'Admin' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRole(option.value as typeof role)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${role === option.value
                      ? 'bg-gold text-navy'
                      : 'bg-cream/10 text-cream/70 hover:bg-cream/20'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {/* Demo credentials hint - must match server default/seed */}
              <div className="mt-3 p-3 rounded-lg bg-gold/10 border border-gold/20">
                <p className="text-xs text-gold font-medium mb-1">Demo credentials:</p>
                <p className="text-xs text-cream/60">
                  {role === 'admin' && 'admin@example.com / admin123'}
                  {role === 'staff' && 'staff@example.com / password123 (run seed first)'}
                  {role === 'employer' && 'employer1@example.com / password123 (run seed first)'}
                  {role === 'candidate' && 'Register below or run server seed for demo users'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-cream/80 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-cream/10 border border-cream/20 text-cream placeholder:text-cream/40 focus:outline-none focus:ring-2 focus:ring-gold"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cream/80 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-cream/10 border border-cream/20 text-cream placeholder:text-cream/40 focus:outline-none focus:ring-2 focus:ring-gold pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-cream/40 hover:text-cream"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-cream/20 bg-cream/10" />
                <span className="text-sm text-cream/60">Remember me</span>
              </label>
              <a href="#" className="text-sm text-gold hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg btn-gold font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </button>
            {errorMsg && (
              <p className="text-red-400 text-sm font-medium text-center mt-3 bg-red-400/10 p-2 rounded border border-red-400/20">
                {errorMsg}
              </p>
            )}
          </form>

          <p className="mt-8 text-center text-cream/60">
            Don't have an account?{' '}
            <Link to="/register" className="text-gold hover:underline font-medium">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side - Decorative with dynamic background */}
      <div className="hidden lg:flex lg:flex-1 relative bg-navy-light items-center justify-center p-16 overflow-hidden">
        {/* Background Image Overlay */}
        <div
          className="absolute inset-0 z-0 opacity-40"
          style={{
            backgroundImage: 'url(/berlin_office_premium_1769811809678.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-navy/60 z-10" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center relative z-20"
        >
          <div className="text-6xl font-display font-bold text-gold mb-4">5,000+</div>
          <p className="text-xl text-cream/90 mb-2">Verified Professionals</p>
          <p className="text-cream/70">Connected with German employers</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
