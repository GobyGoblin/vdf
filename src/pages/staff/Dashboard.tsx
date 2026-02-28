import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout';
import { Clock, Users, CheckCircle2, XCircle, FileText, ArrowRight, AlertCircle, Globe, Target } from 'lucide-react';
import { staffAPI } from '@/lib/api';

interface Stats {
  pendingReviews: number;
  approvedToday: number;
  totalCandidates: number;
  rejectedToday: number;
}

interface PendingReview {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const StaffDashboard = () => {
  const [stats, setStats] = useState<Stats>({ pendingReviews: 0, approvedToday: 0, totalCandidates: 0, rejectedToday: 0 });
  const [recentPending, setRecentPending] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, reviewsData] = await Promise.all([
        staffAPI.getStats(),
        staffAPI.getPendingReviews(),
      ]);
      setStats(statsData);
      setRecentPending(reviewsData.reviews.slice(0, 5));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Pending Reviews', value: stats.pendingReviews, icon: Clock, color: 'text-warning' },
    { label: 'Approved Today', value: stats.approvedToday, icon: CheckCircle2, color: 'text-success' },
    { label: 'Rejected Today', value: stats.rejectedToday, icon: XCircle, color: 'text-destructive' },
    { label: 'Total Candidates', value: stats.totalCandidates, icon: Users, color: 'text-gold' },
  ];

  return (
    <DashboardLayout role="staff">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Staff Dashboard</h1>
            <p className="text-muted-foreground">Review and verify candidate documents</p>
          </div>
          <Link to="/staff/review-queue" className="flex items-center gap-2 px-4 py-2 rounded-lg btn-gold">
            <FileText className="w-4 h-4" /> Review Queue
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card-premium p-6"
            >
              <stat.icon className={`w-8 h-8 ${stat.color} mb-3`} />
              <p className="text-2xl font-display font-bold text-foreground">
                {loading ? '...' : stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions & Recent Pending */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-premium p-6"
          >
            <h2 className="text-lg font-display font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/staff/review-queue"
                className="flex items-center justify-between p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Review Queue</p>
                    <p className="text-sm text-muted-foreground">{stats.pendingReviews} items awaiting verification</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </Link>
              <Link
                to="/staff/pipeline"
                className="flex items-center justify-between p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Global Pipeline</p>
                    <p className="text-sm text-muted-foreground">Monitor all placement activities</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </Link>
              <Link
                to="/staff/users"
                className="flex items-center justify-between p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">User Directory</p>
                    <p className="text-sm text-muted-foreground">Manage and provision project users</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </Link>
              <Link
                to="/staff/talent-demands"
                className="flex items-center justify-between p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Talent Demands</p>
                    <p className="text-sm text-muted-foreground">Fulfill custom profile requests</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </Link>
              <Link
                to="/staff/domains"
                className="flex items-center justify-between p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Homepage Sectors</p>
                    <p className="text-sm text-muted-foreground">Modify domains of work categories</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </Link>
            </div>
          </motion.div>

          {/* Recent Pending */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
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
                    to={`/staff/reviews/${item.user?.email?.split('@')[0] || 'unknown'}`}
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
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffDashboard;
