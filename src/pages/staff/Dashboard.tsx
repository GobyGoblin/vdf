import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout';
import { Clock, Users, CheckCircle2, XCircle, FileText, ArrowRight, AlertCircle, Globe, Target, Mail, Phone } from 'lucide-react';
import { staffAPI } from '@/lib/api';

interface Stats {
  pendingReviews: number;
  approvedToday: number;
  totalCandidates: number;
  rejectedToday: number;
  inactiveCandidates: number;
  deactivatedCandidates: number;
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
  const [stats, setStats] = useState<Stats>({ 
    pendingReviews: 0, 
    approvedToday: 0, 
    totalCandidates: 0, 
    rejectedToday: 0,
    inactiveCandidates: 0,
    deactivatedCandidates: 0
  });
  const [recentPending, setRecentPending] = useState<PendingReview[]>([]);
  const [inactiveCandidates, setInactiveCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, reviewsData, inactiveData] = await Promise.all([
        staffAPI.getStats(),
        staffAPI.getPendingReviews(),
        staffAPI.getInactiveCandidates(),
      ]);
      setStats(statsData);
      setRecentPending(reviewsData.reviews.slice(0, 5));
      setInactiveCandidates(inactiveData.inactive.slice(0, 5));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Pending Reviews', value: stats.pendingReviews, icon: Clock, color: 'text-warning' },
    { label: 'Inactive (15d+)', value: stats.inactiveCandidates, icon: AlertCircle, color: 'text-orange-500' },
    { label: 'Deactivated (30d+)', value: stats.deactivatedCandidates, icon: XCircle, color: 'text-destructive' },
    { label: 'Total Candidates', value: stats.totalCandidates, icon: Users, color: 'text-gold' },
  ];

  return (
    <DashboardLayout role={window.location.pathname.startsWith('/admin') ? 'admin' : 'staff'}>
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
                to={window.location.pathname.startsWith('/admin') ? '/admin/staff-users' : '/staff/users'}
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
              <Link
                to="/staff/hiring"
                className="flex items-center justify-between p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Hiring Processes</p>
                    <p className="text-sm text-muted-foreground">Manage post-purchase relocation steps</p>
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

          {/* Inactive Candidates */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-premium p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-semibold text-foreground">Re-engagement Queue</h2>
              <span className="badge-warning text-[10px]">{stats.inactiveCandidates} Active Needs</span>
            </div>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : inactiveCandidates.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-2 opacity-20" />
                <p className="text-muted-foreground text-sm">All candidates are active!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {inactiveCandidates.map((cand) => (
                  <div
                    key={cand.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50"
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{cand.firstName} {cand.lastName}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                        Last Active: {new Date(cand.lastActiveAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                        <a 
                          href={`mailto:${cand.email}`}
                          className="p-2 rounded-lg bg-secondary hover:bg-gold/10 text-muted-foreground hover:text-gold transition-all"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                        <a 
                          href={`tel:${cand.candidateProfile?.phone || ''}`}
                          className="p-2 rounded-lg bg-secondary hover:bg-gold/10 text-muted-foreground hover:text-gold transition-all"
                          title="Call Candidate"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                    </div>
                  </div>
                ))}
                <Link to="/staff/users" className="block text-center text-xs text-gold font-bold hover:underline mt-2">
                  View all in directory
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffDashboard;
