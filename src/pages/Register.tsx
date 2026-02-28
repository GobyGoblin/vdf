import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Building2, User } from 'lucide-react';
// Use the logo from public folder
const logo = '/logo.png';
import { authAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const Register = () => {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');
  const [accountType, setAccountType] = useState<'candidate' | 'employer'>(
    (roleParam === 'employer' || roleParam === 'candidate') ? (roleParam as 'candidate' | 'employer') : 'candidate'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please enter both email and password',
        variant: 'destructive',
      });
      return;
    }

    if (accountType === 'candidate' && (!firstName || !lastName)) {
      toast({
        title: 'Error',
        description: 'Please enter your first and last name',
        variant: 'destructive',
      });
      return;
    }

    if (accountType === 'employer' && !companyName) {
      toast({
        title: 'Error',
        description: 'Please enter your company name',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const data: any = {
        email,
        password,
        role: accountType,
      };

      if (accountType === 'candidate') {
        data.firstName = firstName;
        data.lastName = lastName;
      } else {
        data.companyName = companyName;
      }

      const result = await authAPI.register(data);

      if (result && result.user) {
        toast({
          title: 'Success',
          description: 'Account created successfully',
        });

        navigate(accountType === 'candidate' ? '/candidate/dashboard' : '/employer/onboarding');
      }
    } catch (error: any) {
      console.error('Register error:', error);
      toast({
        title: 'Registration Failed',
        description: error.message || 'Failed to create account. Please make sure the backend server is running.',
        variant: 'destructive',
      });
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
            {accountType === 'employer' ? 'Company Registration' : 'Candidate Registration'}
          </h1>
          <p className="text-cream/60 mb-8">
            {accountType === 'employer'
              ? 'Create a company profile to start hiring'
              : 'Join our platform and start your journey'}
          </p>

          {/* Account Type Selector - Only show if no role param */}
          {!roleParam && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                type="button"
                onClick={() => setAccountType('candidate')}
                className={`p-4 rounded-xl border-2 transition-all ${accountType === 'candidate'
                  ? 'border-gold bg-gold/10'
                  : 'border-cream/20 hover:border-cream/40'
                  }`}
              >
                <User className={`w-8 h-8 mx-auto mb-2 ${accountType === 'candidate' ? 'text-gold' : 'text-cream/60'}`} />
                <p className={`font-medium ${accountType === 'candidate' ? 'text-gold' : 'text-cream/60'}`}>
                  I'm a Professional
                </p>
                <p className="text-xs text-cream/40 mt-1">Looking for work in Germany</p>
              </button>
              <button
                type="button"
                onClick={() => setAccountType('employer')}
                className={`p-4 rounded-xl border-2 transition-all ${accountType === 'employer'
                  ? 'border-gold bg-gold/10'
                  : 'border-cream/20 hover:border-cream/40'
                  }`}
              >
                <Building2 className={`w-8 h-8 mx-auto mb-2 ${accountType === 'employer' ? 'text-gold' : 'text-cream/60'}`} />
                <p className={`font-medium ${accountType === 'employer' ? 'text-gold' : 'text-cream/60'}`}>
                  I'm an Employer
                </p>
                <p className="text-xs text-cream/40 mt-1">Hiring talent for my company</p>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {accountType === 'employer' && (
              <div>
                <label className="block text-sm font-medium text-cream/80 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-cream/10 border border-cream/20 text-cream placeholder:text-cream/40 focus:outline-none focus:ring-2 focus:ring-gold"
                  placeholder="Your company name"
                />
              </div>
            )}

            {accountType === 'candidate' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cream/80 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-cream/10 border border-cream/20 text-cream placeholder:text-cream/40 focus:outline-none focus:ring-2 focus:ring-gold"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream/80 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-cream/10 border border-cream/20 text-cream placeholder:text-cream/40 focus:outline-none focus:ring-2 focus:ring-gold"
                    placeholder="Last name"
                  />
                </div>
              </div>
            )}

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
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-cream/40 hover:text-cream"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-cream/40 mt-2">
                Minimum 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-cream/20 bg-cream/10 mt-0.5" />
                <span className="text-sm text-cream/60">
                  I agree to the{' '}
                  <Link to="/agb" className="text-gold hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/datenschutz" className="text-gold hover:underline">Privacy Policy</Link>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg btn-gold font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-8 text-center text-cream/60">
            Already have an account?{' '}
            <Link to="/login" className="text-gold hover:underline font-medium">
              Sign in
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
            backgroundImage: `url(${accountType === 'employer'
              ? '/berlin_office_premium_1769811809678.png'
              : '/professional_team_collaboration_1769811837982.png'})`,
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
          <div className="text-6xl font-display font-bold text-gold mb-4">850+</div>
          <p className="text-xl text-cream/90 mb-2">Partner Companies</p>
          <p className="text-cream/70">Hiring verified talent</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
