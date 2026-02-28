import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout';
import { Users, Building2, Shield, FileText, ArrowRight, BarChart3, FolderOpen, Clock } from 'lucide-react';
import { adminAPI } from '@/lib/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEmployers: 0,
    totalWorkers: 0,
    totalInsights: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const statsData = await adminAPI.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Employers', value: stats.totalEmployers, icon: Building2, color: 'text-gold', bg: 'bg-gold/10' },
    { label: 'Workers', value: stats.totalWorkers, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Published Insights', value: stats.totalInsights, icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  const quickActions = [
    { label: 'Create Insight', desc: 'Add new article or news', href: '/admin/insights/new', icon: FileText, color: 'text-gold' },
    { label: 'Manage Insights', desc: 'Edit or delete articles', href: '/admin/insights', icon: FileText, color: 'text-blue-500' },
    { label: 'Manage Employers', desc: 'Verify and manage companies', href: '/admin/employers', icon: Building2, color: 'text-purple-500' },
    { label: 'Manage Workers', desc: 'View candidate profiles', href: '/admin/workers', icon: Users, color: 'text-emerald-500' },
    { label: 'User Directory', desc: 'All platform users', href: '/admin/users', icon: Users, color: 'text-gold' },
    { label: 'Review Candidates', desc: 'Process verifications', href: '/staff/review-queue', icon: Shield, color: 'text-blue-500' },
    { label: 'Audit Log', desc: 'Track platform activity', href: '/admin/audit', icon: Clock, color: 'text-muted-foreground' },
    { label: 'Data Retention', desc: 'GDPR compliance', href: '/admin/retention', icon: FolderOpen, color: 'text-muted-foreground' },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="max-w-[1200px] mx-auto space-y-8 pb-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-widest border border-gold/20">
              Admin Panel
            </span>
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Platform Overview</h1>
          <p className="text-muted-foreground mt-1">Manage all content, users, and platform settings.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
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

        {/* Quick Actions */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
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
