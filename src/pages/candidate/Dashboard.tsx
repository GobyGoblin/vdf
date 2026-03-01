import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  Eye,
  Shield,
  ShieldCheck,
  XCircle,
  CreditCard,
  Video,
  User,
  Star
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { authAPI, profilesAPI, getCurrentUser } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const CandidateDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    profileViews: '0',
    profileScore: '0',
    consentRequests: '0',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [{ user: userData }, statsData] = await Promise.all([
          authAPI.getMe(),
          profilesAPI.getDashboardStats()
        ]);
        setUser(userData);
        setDashboardStats({
          profileViews: statsData.profileViews?.toString() || '0',
          profileScore: statsData.profileScore?.toString() || '0',
          consentRequests: statsData.consentRequests?.toString() || '0',
        });
      } catch (err) {
        console.error(err);
        setUser(getCurrentUser());
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const isVerified = user?.isVerified === true || user?.verificationStatus === 'verified';
  const isPending = !isVerified && user?.verificationStatus === 'pending';
  const isRejected = !isVerified && user?.verificationStatus === 'rejected';
  const isUnverified = !isVerified && !isPending && !isRejected;

  const stats = [
    { label: 'Profile Views', value: dashboardStats.profileViews, icon: Eye, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Profile Score', value: dashboardStats.profileScore + '%', icon: Star, color: 'text-gold', bg: 'bg-gold/10' },
    { label: 'Consent Requests', value: dashboardStats.consentRequests, icon: Shield, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  if (loading) {
    return (
      <DashboardLayout role="candidate">
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full"
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="candidate">
      <div className="max-w-[1200px] mx-auto space-y-8 pb-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-widest border border-gold/20">
              Candidate Portal
            </span>
            {isVerified && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase tracking-widest border border-success/20">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Welcome back, {user?.firstName || 'Candidate'}!
          </h1>
          <p className="text-muted-foreground mt-1">Here's an overview of your profile and verification status.</p>
        </motion.div>

        {/* Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "border-2 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4",
            isVerified ? 'bg-success/5 border-success/20' :
              isRejected ? 'bg-destructive/5 border-destructive/20' :
                isPending ? 'bg-gold/5 border-gold/20' :
                  'bg-secondary/50 border-border'
          )}
        >
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
            isVerified ? 'bg-success/20 text-success' :
              isRejected ? 'bg-destructive/20 text-destructive' :
                isPending ? 'bg-gold/20 text-gold' :
                  'bg-secondary text-muted-foreground'
          )}>
            {isVerified ? <CheckCircle2 className="w-6 h-6" /> :
              isRejected ? <XCircle className="w-6 h-6" /> :
                isPending ? <Clock className="w-6 h-6 animate-pulse" /> :
                  <Shield className="w-6 h-6" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground">
              {isVerified ? 'Profile Verified & Active' :
                isRejected ? 'Verification Rejected' :
                  isPending ? 'Verification in Progress' :
                    'Complete Your Verification'}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isVerified
                ? 'Your profile is visible to verified employers in the talent pool.'
                : isRejected
                  ? `${user?.rejectionReason || 'Please review and re-upload your documents.'}`
                  : isPending
                    ? 'Our team is reviewing your documents. This usually takes 24-48h.'
                    : 'Upload your documents and complete your profile to get verified.'}
            </p>
          </div>
          <Link
            to={isRejected ? "/candidate/documents" : isVerified ? "/candidate/profile" : "/candidate/review-status"}
            className={cn(
              "shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5",
              isRejected ? "bg-destructive text-white" :
                isVerified ? "bg-success/10 text-success border border-success/20" :
                  "bg-gold text-navy"
            )}
          >
            {isVerified ? 'View Profile' : isRejected ? 'Fix Documents' : isPending ? 'Check Status' : 'Get Started'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card-premium p-5 group hover:border-gold/20 transition-all"
            >
              <div className={cn("p-2.5 rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left - Quick Actions */}
          <div className="lg:col-span-2 space-y-6">

            {/* Actions Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Profile */}
              <Link to="/candidate/profile" className="card-premium p-5 group hover:border-gold/30 transition-all flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-gold/10 flex items-center justify-center text-gold shrink-0 group-hover:scale-110 transition-transform">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground">My Profile</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Update your personal information and skills</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all mt-1" />
              </Link>

              {/* Documents */}
              <Link to="/candidate/documents" className="card-premium p-5 group hover:border-gold/30 transition-all flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground">Documents</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Upload credentials, diplomas and certificates</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all mt-1" />
              </Link>

              {/* Verification */}
              <Link to="/candidate/review-status" className="card-premium p-5 group hover:border-gold/30 transition-all flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground">Verification Status</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Track your document review progress</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all mt-1" />
              </Link>

              {/* Pricing */}
              <Link to="/candidate/pricing" className="card-premium p-5 group hover:border-gold/30 transition-all flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground">Verification Plans</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Choose a plan to unlock premium features</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all mt-1" />
              </Link>
            </div>

            {/* Interviews */}
            <Link
              to={isVerified ? "/candidate/interviews" : "#"}
              onClick={e => !isVerified && e.preventDefault()}
              className={cn(
                "card-premium p-5 flex items-center gap-4 transition-all border-2",
                isVerified ? "hover:border-blue-500/30 hover:shadow-lg hover:-translate-y-0.5 group" : "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                <Video className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground">Interviews</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isVerified ? 'View your scheduled interviews and join video calls' : 'Complete verification to access interviews'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-500">
                {isVerified ? <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" /> : <Shield className="w-4 h-4 text-muted-foreground" />}
              </div>
            </Link>
          </div>

          {/* Right - Status Panel */}
          <div className="space-y-6">

            {/* Profile Completion */}
            <div className="card-premium p-5 bg-navy text-white overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="text-sm font-bold mb-4">Profile Completion</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/60">Score</span>
                      <span className="font-bold text-gold">{dashboardStats.profileScore}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${dashboardStats.profileScore}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gold rounded-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/60">Verification</span>
                      <span className={cn("font-bold",
                        isVerified ? "text-success" :
                          isPending ? "text-gold" :
                            isRejected ? "text-destructive" : "text-white/40"
                      )}>
                        {isVerified ? 'Approved' : isPending ? 'Pending' : isRejected ? 'Rejected' : 'Not Started'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Profile Views</span>
                      <span className="font-bold">{dashboardStats.profileViews}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="card-premium p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">How It Works</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                    user?.profileComplete ? "bg-success/20 text-success" : "bg-gold/20 text-gold"
                  )}>
                    {user?.profileComplete ? <CheckCircle2 className="w-3.5 h-3.5" /> : '1'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Complete Profile</p>
                    <p className="text-[11px] text-muted-foreground">Fill in your details, skills & experience</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                    isVerified || isPending ? "bg-success/20 text-success" : "bg-secondary text-muted-foreground"
                  )}>
                    {isVerified || isPending ? <CheckCircle2 className="w-3.5 h-3.5" /> : '2'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Upload Documents</p>
                    <p className="text-[11px] text-muted-foreground">CV, diplomas, and certificates</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                    isVerified ? "bg-success/20 text-success" : "bg-secondary text-muted-foreground"
                  )}>
                    {isVerified ? <CheckCircle2 className="w-3.5 h-3.5" /> : '3'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Get Verified</p>
                    <p className="text-[11px] text-muted-foreground">Our team reviews your credentials</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                    isVerified ? "bg-gold/20 text-gold" : "bg-secondary text-muted-foreground"
                  )}>
                    {isVerified ? <Star className="w-3.5 h-3.5" /> : '4'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Connect with Employers</p>
                    <p className="text-[11px] text-muted-foreground">Get matched and interviewed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CandidateDashboard;
