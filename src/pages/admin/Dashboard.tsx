import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout';
import {
  Users, Building2, Shield, FileText, ArrowRight, FolderOpen, Clock,
  CheckCircle2, XCircle, Target, Globe, Calculator, AlertCircle
} from 'lucide-react';
import { adminAPI, staffAPI } from '@/lib/api';

interface PendingReview {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  user?: { firstName: string; lastName: string; email: string };
}

const AdminDashboard = () => {
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalEmployers: 0,
    totalWorkers: 0,
    totalInsights: 0,
  });
  const [staffStats, setStaffStats] = useState({
    pendingReviews: 0,
    approvedToday: 0,
    rejectedToday: 0,
    totalCandidates: 0,
  });
  const [recentPending, setRecentPending] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [adminData, staffData, reviewsData] = await Promise.all([
        adminAPI.getStats().catch(() => ({ totalUsers: 0, totalEmployers: 0, totalWorkers: 0, totalInsights: 0 })),
        staffAPI.getStats().catch(() => ({ pendingReviews: 0, approvedToday: 0, rejectedToday: 0, totalCandidates: 0 })),
        staffAPI.getPendingReviews().catch(() => ({ reviews: [] })),
      ]);
      setAdminStats(adminData);
      setStaffStats(staffData);
      setRecentPending((reviewsData.reviews || []).slice(0, 5));
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const adminStatCards = [
    { label: 'Total Users', value: adminStats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Employers', value: adminStats.totalEmployers, icon: Building2, color: 'text-gold', bg: 'bg-gold/10' },
    { label: 'Workers', value: adminStats.totalWorkers, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Published Insights', value: adminStats.totalInsights, icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  const staffStatCards = [
    { label: 'Pending Reviews', value: staffStats.pendingReviews, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Approved Today', value: staffStats.approvedToday, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Rejected Today', value: staffStats.rejectedToday, icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
    { label: 'Total Candidates', value: staffStats.totalCandidates, icon: Users, color: 'text-gold', bg: 'bg-gold/10' },
  ];

  const contentActions = [
    { label: 'Create Insight', desc: 'Add new article or news', href: '/admin/insights/new', icon: FileText, color: 'text-gold' },
    { label: 'Manage Insights', desc: 'Edit or delete articles', href: '/admin/insights', icon: FileText, color: 'text-blue-500' },
    { label: 'Manage Employers', desc: 'Verify and manage companies', href: '/admin/employers', icon: Building2, color: 'text-purple-500' },
    { label: 'Manage Workers', desc: 'View candidate profiles', href: '/admin/workers', icon: Users, color: 'text-emerald-500' },
    { label: 'User Directory', desc: 'All platform users', href: '/admin/users', icon: Users, color: 'text-gold' },
    { label: 'Audit Log', desc: 'Track platform activity', href: '/admin/audit', icon: Clock, color: 'text-muted-foreground' },
    { label: 'Data Retention', desc: 'GDPR compliance', href: '/admin/retention', icon: FolderOpen, color: 'text-muted-foreground' },
  ];

  const staffActions = [
    { label: 'Review Queue', desc: `${staffStats.pendingReviews} items awaiting verification`, href: '/admin/review-queue', icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Global Pipeline', desc: 'Monitor all placement activities', href: '/admin/pipeline', icon: Target, color: 'text-gold', bg: 'bg-gold/10' },
    { label: 'Staff User Directory', desc: 'Manage and provision users', href: '/admin/users', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Talent Demands', desc: 'Fulfill custom profile requests', href: '/admin/talent-demands', icon: Target, color: 'text-gold', bg: 'bg-gold/10' },
    { label: 'Homepage Sectors', desc: 'Modify domains of work categories', href: '/admin/domains', icon: Globe, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Hiring Processes', desc: 'Manage post-purchase relocation steps', href: '/admin/hiring', icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Quote Requests', desc: 'Review employer quote submissions', href: '/admin/quotes', icon: Calculator, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="max-w-[1200px] mx-auto space-y-10 pb-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-widest border border-gold/20">
              Admin Panel
            </span>
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Platform Overview</h1>
          <p className="text-muted-foreground mt-1">Full control over all platform content, users, verifications, and operations.</p>
        </motion.div>

        {/* Platform Stats */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Platform Statistics</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {adminStatCards.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="card-premium p-5 group hover:border-gold/20 transition-all"
              >
                <div className={`p-2.5 rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-display font-bold text-foreground">{loading ? '...' : stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Verification Stats */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Verification Overview</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {staffStatCards.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 + i * 0.08 }}
                className="card-premium p-5 group hover:border-gold/20 transition-all"
              >
                <div className={`p-2.5 rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-display font-bold text-foreground">{loading ? '...' : stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Recent Pending */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Staff Operations */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card-premium p-6"
          >
            <h2 className="text-lg font-display font-semibold text-foreground mb-4">Staff Operations</h2>
            <div className="space-y-3">
              {staffActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.href}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${action.bg} flex items-center justify-center`}>
                      <action.icon className={`w-5 h-5 ${action.color}`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{action.label}</p>
                      <p className="text-sm text-muted-foreground">{action.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recent Pending Documents */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card-premium p-6"
          >
            <h2 className="text-lg font-display font-semibold text-foreground mb-4">Recent Pending Documents</h2>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : recentPending.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-2" />
                <p className="text-muted-foreground">All documents reviewed!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPending.map((item) => (
                  <Link
                    key={item.id}
                    to={`/admin/reviews/${item.user?.email?.split('@')[0] || 'unknown'}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-warning" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.user?.firstName} {item.user?.lastName} · {item.type}
                      </p>
                    </div>
                    <span className="badge-gold text-xs">{item.type}</span>
                  </Link>
                ))}
                <Link
                  to="/admin/review-queue"
                  className="flex items-center justify-center gap-2 mt-2 py-2 text-sm text-gold hover:text-gold/80 transition-colors font-medium"
                >
                  View all pending <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        {/* Content & System Actions */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Content & System</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {contentActions.map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.05 }}
              >
                <Link
                  to={action.href}
                  className="card-premium p-5 hover:border-gold/20 transition-all group block h-full"
                >
                  <div className="flex items-center justify-between mb-3">
                    <action.icon className={`w-6 h-6 ${action.color}`} />
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="font-bold text-foreground text-sm">{action.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
