import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authAPI, getCurrentUser } from '@/lib/api';
import {
  LayoutDashboard,
  User,
  FileText,
  Send,
  Clock,
  Briefcase,
  Shield,
  ShieldCheck,
  Building2,
  Users,
  FolderOpen,
  Plus,
  Search,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  CheckCircle2,
  Globe,
  CreditCard,
  BadgeEuro,
  Target,
  Calculator,
  Video
} from 'lucide-react';
// Use the logo from public folder
const logo = '/logo.png';
import { BackToTop } from '@/components/ui/BackToTop';

type UserRole = 'candidate' | 'employer' | 'staff' | 'admin';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: UserRole;
}

const navigationByRole: Record<UserRole, { name: string; href: string; icon: React.ElementType }[]> = {
  candidate: [
    { name: 'Dashboard', href: '/candidate/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', href: '/candidate/profile', icon: User },
    { name: 'Documents', href: '/candidate/documents', icon: FileText },
    { name: 'Verification', href: '/candidate/review-status', icon: ShieldCheck },
    { name: 'Verification Plans', href: '/candidate/pricing', icon: CreditCard },
    { name: 'Interviews', href: '/candidate/interviews', icon: Video },
  ],
  employer: [
    { name: 'Dashboard', href: '/employer/dashboard', icon: LayoutDashboard },
    { name: 'Candidate Pipeline', href: '/employer/candidates', icon: Users },
    { name: 'Company Onboarding', href: '/employer/onboarding', icon: Building2 },
    { name: 'Talent Pool', href: '/employer/talent-pool', icon: Search },
    { name: 'Talent Demands', href: '/employer/talent-demands', icon: Target },
    { name: 'My Quotes', href: '/employer/quotes', icon: BadgeEuro },
    { name: 'Interviews', href: '/employer/interviews', icon: Video },
  ],
  staff: [
    { name: 'Dashboard', href: '/staff/dashboard', icon: LayoutDashboard },
    { name: 'Global Pipeline', href: '/staff/pipeline', icon: Users },
    { name: 'Review Queue', href: '/staff/review-queue', icon: Clock },
    { name: 'Quote Requests', href: '/staff/quotes', icon: Calculator },
    { name: 'Talent Demands', href: '/staff/talent-demands', icon: Target },
    { name: 'User Directory', href: '/staff/users', icon: Users },
    { name: 'Domains', href: '/staff/domains', icon: FolderOpen },
  ],
  admin: [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'News & Insights', href: '/admin/insights', icon: FileText },
    { name: 'Employers', href: '/admin/employers', icon: Building2 },
    { name: 'Workers', href: '/admin/workers', icon: Users },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Audit Log', href: '/admin/audit', icon: FileText },
    { name: 'Data Retention', href: '/admin/retention', icon: FolderOpen },
  ],
};

const roleLabels: Record<UserRole, string> = {
  candidate: 'Candidate Portal',
  employer: 'Employer Portal',
  staff: 'Staff Portal',
  admin: 'Admin Panel',
};

const mockUsers: Record<UserRole, { name: string; email: string }> = {
  candidate: { name: 'Maria Schmidt', email: 'maria@example.com' },
  employer: { name: 'TechCorp GmbH', email: 'hr@techcorp.de' },
  staff: { name: 'Hans Weber', email: 'h.weber@gbp-portal.de' },
  admin: { name: 'System Admin', email: 'admin@gbp-portal.de' },
};

export const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(() => getCurrentUser());
  const [notifications, setNotifications] = useState<{ id: string, title: string, href: string }[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const navigation = navigationByRole[role];

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { user: userData } = await authAPI.getMe();
        setUser(userData);

        // Final safety check: if the user's actual role doesn't match the layout's role
        if (userData.role !== role && userData.role !== 'admin') {
          navigate(`/${userData.role}/dashboard`);
        }

        if (userData.role === 'staff' || userData.role === 'admin') {
          try {
            const { staffAPI } = await import('@/lib/api');
            const [reviewsRes, quotesRes] = await Promise.all([
              staffAPI.getPendingReviews().catch(() => ({ pending: [] })),
              staffAPI.getQuoteRequests().catch(() => ({ requests: [] }))
            ]);

            const newNotifs = [];
            const reviewItems = Array.isArray(reviewsRes) ? reviewsRes : (reviewsRes.pending || []);
            if (reviewItems.length > 0) {
              newNotifs.push({
                id: 'reviews',
                title: `${reviewItems.length} new profile review request(s)`,
                href: '/staff/review-queue'
              });
            }

            const quoteItems = Array.isArray(quotesRes) ? quotesRes : (quotesRes.requests || []);
            const pendingQuotes = quoteItems.filter((q: any) => q.status === 'pending');
            if (pendingQuotes.length > 0) {
              newNotifs.push({
                id: 'quotes',
                title: `${pendingQuotes.length} new pending quote request(s)`,
                href: '/staff/quotes'
              });
            }

            setNotifications(newNotifs);
          } catch (e) {
            console.error('Failed to load notifications', e);
          }
        }
      } catch (err) {
        console.error(err);
        // Keep showing user from login if /me failed (e.g. token issue)
        const fallback = getCurrentUser();
        if (fallback) setUser(fallback);
        else navigate('/login');
      }
    };
    loadUser();
  }, [role, navigate]);

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-sidebar border-r border-sidebar-border">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border hover:bg-sidebar-accent/50 transition-colors">
          <div className="bg-white rounded-full p-1.5 h-10 w-10 flex items-center justify-center overflow-hidden border border-white/20">
            <img src={logo} alt="Logo" className="h-full w-auto object-contain" />
          </div>
          <div>
            <span className="block text-xs text-sidebar-foreground/60">{roleLabels[role]}</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar-hide">
          {navigation.map((item) => {
            const employerRestricted = user?.role === 'employer' &&
              user?.verificationStatus !== 'verified' &&
              ['Candidate Pipeline', 'Talent Pool', 'Talent Demands', 'My Quotes', 'Interviews'].includes(item.name);
            const candidateRestricted = user?.role === 'candidate' &&
              user?.verificationStatus !== 'verified' &&
              ['Interviews'].includes(item.name);
            const isRestricted = employerRestricted || candidateRestricted;

            return (
              <div key={item.name} className="relative group">
                <Link
                  to={isRestricted ? '#' : item.href}
                  onClick={(e) => {
                    if (isRestricted) {
                      e.preventDefault();
                      // Could show a toast here
                    }
                  }}
                  className={`sidebar-nav-item ${isActive(item.href) ? 'active' : ''} ${isRestricted ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium truncate">{item.name}</span>
                  {isRestricted && <Shield className="w-3.5 h-3.5 ml-auto text-gold shrink-0 transition-transform group-hover:scale-110" />}
                </Link>
                {isRestricted && (
                  <div className="absolute left-full ml-2 top-0 bg-navy text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                    Verified account required
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
              <User className="w-5 h-5 text-sidebar-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user ? `${user.firstName} ${user.lastName}` : mockUsers[role].name}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user ? user.email : mockUsers[role].email}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              authAPI.logout();
              navigate('/');
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-foreground/50" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-sidebar">
            <div className="flex items-center justify-between px-6 py-5 border-b border-sidebar-border">
              <Link to="/" className="flex items-center gap-3">
                <div className="bg-white rounded-full p-1.5 h-10 w-10 flex items-center justify-center overflow-hidden border border-white/20">
                  <img src={logo} alt="Logo" className="h-full w-auto object-contain" />
                </div>
                <div>
                  <span className="block text-xs text-sidebar-foreground/60">{roleLabels[role]}</span>
                </div>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="text-sidebar-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="px-3 py-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`sidebar-nav-item ${isActive(item.href) ? 'active' : ''}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-foreground"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Logo in Header - Only on Mobile */}
              <Link to="/" className="lg:hidden flex items-center gap-2">
                <div className="bg-white rounded-full p-1 h-8 w-8 flex items-center justify-center overflow-hidden border border-white/20">
                  <img src={logo} alt="Logo" className="h-full w-auto object-contain" />
                </div>
              </Link>
            </div>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-gold rounded-full" />
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-card rounded-xl shadow-xl border border-border overflow-hidden z-50">
                    <div className="p-4 border-b border-border bg-secondary/50 flex justify-between items-center">
                      <h3 className="font-semibold text-foreground">Notifications</h3>
                      <button onClick={() => setShowNotifications(false)} className="text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No new notifications
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <Link
                            key={notif.id}
                            to={notif.href}
                            onClick={() => setShowNotifications(false)}
                            className="block p-4 border-b border-border hover:bg-secondary/50 transition-colors last:border-0"
                          >
                            <p className="text-sm font-medium text-foreground">{notif.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">Click to view details</p>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-border">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <User className="w-4 h-4 text-foreground" />
                </div>
                <span className="text-sm font-medium">
                  {user ? (user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email) : mockUsers[role].name}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Verification Banner */}
        {user && (user.role === 'candidate' || user.role === 'employer') && user.verificationStatus === 'pending' && (
          <div className="bg-warning/10 border-b border-warning/20 px-4 py-2 flex items-center justify-center gap-3">
            <Clock className="w-4 h-4 text-warning" />
            <p className="text-xs font-medium text-warning">
              Your account is currently under review. Some features may be restricted until verification is complete.
            </p>
          </div>
        )}


        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
      <BackToTop />
    </div>
  );
};
