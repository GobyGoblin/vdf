import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  TrendingUp,
  ArrowRight,
  Shield,
  Clock,
  XCircle,
  Search,
  BadgeEuro,
  BarChart3,
  CheckCircle2,
  RotateCcw,
  Target,
  Video,
  Eye
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { profilesAPI, authAPI, talentDemandsAPI, getCurrentUser } from '@/lib/api';
import { cn } from '@/lib/utils';
import { TalentDemand } from '@/lib/mockData';

const EmployerDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [demands, setDemands] = useState<TalentDemand[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [dashboardStats, setDashboardStats] = useState({
    activeDemands: '0',
    totalMatches: '0',
    pipelineCandidates: '0',
    consentRequests: '0',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [{ user: userData }, { demands: demandsData }, statsData] = await Promise.all([
          authAPI.getMe(),
          talentDemandsAPI.getMyDemands(),
          profilesAPI.getDashboardStats()
        ]);
        setUser(userData);
        setDemands(demandsData);
        const matchesCount = demandsData.reduce((acc, d) => acc + (d.suggestedCandidateIds?.length || 0), 0);
        setTotalMatches(matchesCount);

        setDashboardStats({
          activeDemands: demandsData.length.toString(),
          totalMatches: matchesCount.toString(),
          pipelineCandidates: statsData.pipelineCandidates?.toString() || '0',
          consentRequests: statsData.consentRequests?.toString() || '0',
        });
      } catch (error) {
        console.error('Failed to load data:', error);
        setUser(getCurrentUser());
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Talent Demands', value: dashboardStats.activeDemands, icon: Target, color: 'text-gold', bg: 'bg-gold/10' },
    { label: 'Suggested Matches', value: dashboardStats.totalMatches, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Pipeline Candidates', value: dashboardStats.pipelineCandidates, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Profile Views Sent', value: dashboardStats.consentRequests, icon: Eye, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  const isVerified = user?.isVerified === true || user?.verificationStatus === 'verified';
  const isPending = !isVerified && user?.verificationStatus === 'pending';
  const isRejected = !isVerified && user?.verificationStatus === 'rejected';

  if (loading) {
    return (
      <DashboardLayout role="employer">
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
    <DashboardLayout role="employer">
      <div className="max-w-[1600px] mx-auto space-y-8 pb-12">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-gold/10 text-gold text-[10px] font-black uppercase tracking-widest border border-gold/20">
                Employer Portal
              </span>
              {isVerified && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-[10px] font-black uppercase tracking-widest border border-success/20">
                  <Shield className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
              {user?.companyName || 'Company'} Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back. Manage your talent pipeline and recruitment demands.
            </p>
          </motion.div>
          {isVerified && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex gap-3"
            >
              <Link to="/employer/talent-demands" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-navy font-bold text-sm hover:shadow-xl hover:shadow-gold/20 hover:-translate-y-0.5 transition-all">
                <Target className="w-4 h-4" /> New Demand
              </Link>
            </motion.div>
          )}
        </div>

        {/* Verification Banner */}
        {!isVerified && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "relative overflow-hidden p-6 lg:p-8 rounded-2xl border-2 shadow-lg",
              isRejected ? "bg-destructive/5 border-destructive/20" :
                isPending ? "bg-gold/5 border-gold/20" :
                  "bg-gold/5 border-gold/20"
            )}
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start gap-5">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2",
                  isPending ? "bg-gold/20 border-gold/40 text-gold" :
                    isRejected ? "bg-destructive/20 border-destructive/40 text-destructive" :
                      "bg-gold/20 border-gold/40 text-gold"
                )}>
                  {isPending ? <Clock className="w-7 h-7 animate-pulse" /> :
                    isRejected ? <XCircle className="w-7 h-7" /> :
                      <Shield className="w-7 h-7" />}
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-foreground">
                    {isPending ? 'Verification Under Review' :
                      isRejected ? 'Revision Required' :
                        'Complete Your Company Verification'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                    {isPending
                      ? 'Our team is reviewing your company credentials. Full access will be granted upon approval.'
                      : isRejected
                        ? `Your application needs revision. ${user.rejectionReason || 'Please review your documents.'}`
                        : 'Complete onboarding to access the talent pool, pipeline management, and quote features.'}
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <Link
                  to="/employer/onboarding"
                  className={cn(
                    "px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:-translate-y-0.5 transition-all",
                    isRejected ? "bg-destructive text-white" :
                      isPending ? "bg-white/80 text-foreground border border-border" :
                        "bg-gold text-navy"
                  )}
                >
                  {isPending && <RotateCcw className="w-4 h-4" />}
                  {isPending ? 'Review Submission' : isRejected ? 'Revise & Resubmit' : 'Begin Verification'}
                  {!isPending && <ArrowRight className="w-4 h-4" />}
                </Link>
              </div>
            </div>

            {/* Progress Steps for unverified */}
            {!isPending && !isRejected && (
              <div className="mt-6 pt-6 border-t border-gold/10">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gold text-navy flex items-center justify-center font-bold text-[10px]">1</div>
                    <span>Company Details</span>
                  </div>
                  <div className="flex-1 h-px bg-border" />
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-secondary text-muted-foreground flex items-center justify-center font-bold text-[10px]">2</div>
                    <span>Legal Documents</span>
                  </div>
                  <div className="flex-1 h-px bg-border" />
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-secondary text-muted-foreground flex items-center justify-center font-bold text-[10px]">3</div>
                    <span>Approval</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
              <p className="text-2xl lg:text-3xl font-display font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left Column - Main Features */}
          <div className="lg:col-span-2 space-y-6">

            {/* Feature Cards Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Talent Pool */}
              <Link
                to={isVerified ? "/employer/talent-pool" : "#"}
                onClick={e => !isVerified && e.preventDefault()}
                className={cn(
                  "card-premium p-6 relative overflow-hidden group transition-all border-2",
                  isVerified ? "hover:border-gold/40 hover:shadow-lg hover:-translate-y-0.5" : "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold mb-4">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-display font-bold text-foreground">Talent Pool</h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Browse pre-verified candidates across all sectors.
                </p>
                <div className="flex items-center gap-2 mt-4 text-xs font-bold text-gold">
                  {isVerified ? 'Explore' : <><Shield className="w-3 h-3" /> Requires Verification</>}
                  {isVerified && <ArrowRight className="w-3.5 h-3.5" />}
                </div>
              </Link>

              {/* Quotes */}
              <Link
                to={isVerified ? "/employer/quotes" : "#"}
                onClick={e => !isVerified && e.preventDefault()}
                className={cn(
                  "card-premium p-6 relative overflow-hidden group transition-all border-2",
                  isVerified ? "hover:border-emerald-500/40 hover:shadow-lg hover:-translate-y-0.5" : "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4">
                  <BadgeEuro className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-display font-bold text-foreground">My Quotes</h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Review and manage placement cost estimates.
                </p>
                <div className="flex items-center gap-2 mt-4 text-xs font-bold text-emerald-500">
                  {isVerified ? 'View Quotes' : <><Shield className="w-3 h-3" /> Requires Verification</>}
                  {isVerified && <ArrowRight className="w-3.5 h-3.5" />}
                </div>
              </Link>

              {/* Pipeline */}
              <Link
                to={isVerified ? "/employer/candidates" : "#"}
                onClick={e => !isVerified && e.preventDefault()}
                className={cn(
                  "card-premium p-6 relative overflow-hidden group transition-all border-2",
                  isVerified ? "hover:border-purple-500/40 hover:shadow-lg hover:-translate-y-0.5" : "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-display font-bold text-foreground">Pipeline</h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Track candidates from shortlist to hiring.
                </p>
                <div className="flex items-center gap-2 mt-4 text-xs font-bold text-purple-500">
                  {isVerified ? 'Manage Pipeline' : <><Shield className="w-3 h-3" /> Requires Verification</>}
                  {isVerified && <ArrowRight className="w-3.5 h-3.5" />}
                </div>
              </Link>

              {/* Interviews */}
              <Link
                to={isVerified ? "/employer/interviews" : "#"}
                onClick={e => !isVerified && e.preventDefault()}
                className={cn(
                  "card-premium p-6 relative overflow-hidden group transition-all border-2",
                  isVerified ? "hover:border-blue-500/40 hover:shadow-lg hover:-translate-y-0.5" : "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-display font-bold text-foreground">Interviews</h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Schedule and manage video interviews.
                </p>
                <div className="flex items-center gap-2 mt-4 text-xs font-bold text-blue-500">
                  {isVerified ? 'View Schedule' : <><Shield className="w-3 h-3" /> Requires Verification</>}
                  {isVerified && <ArrowRight className="w-3.5 h-3.5" />}
                </div>
              </Link>
            </div>

            {/* Talent Demands Banner */}
            <Link
              to={isVerified ? "/employer/talent-demands" : "#"}
              onClick={e => !isVerified && e.preventDefault()}
              className={cn(
                "card-premium p-6 relative overflow-hidden group transition-all border-2",
                isVerified ? "hover:border-gold/40 hover:shadow-lg hover:-translate-y-0.5" : "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold shrink-0">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-display font-bold text-foreground">Talent Demands</h3>
                      {totalMatches > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-bold border border-success/20">
                          {totalMatches} match{totalMatches > 1 ? 'es' : ''}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {totalMatches > 0
                        ? `Our team has matched ${totalMatches} verified professionals to your demands.`
                        : "Define your staffing requirements and our experts will find verified talent for you."
                      }
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shrink-0 transition-all group-hover:scale-105",
                  totalMatches > 0 ? "bg-success text-white" : "bg-gold/10 text-gold"
                )}>
                  {totalMatches > 0 ? 'Review Matches' : (isVerified ? 'Submit Demand' : 'Locked')}
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">

            {/* Quick Links */}
            <div className="card-premium p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Quick Access</h3>
              <div className="space-y-2">
                <Link to="/employer/onboarding" className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-all group">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-gold" />
                    <span className="text-sm font-medium">Company Profile</span>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all text-muted-foreground" />
                </Link>
                {isVerified && (
                  <Link to="/employer/talent-pool" className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-all group">
                    <div className="flex items-center gap-3">
                      <Search className="w-4 h-4 text-gold" />
                      <span className="text-sm font-medium">Browse Talent</span>
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all text-muted-foreground" />
                  </Link>
                )}
              </div>
            </div>

            {/* Verification Progress */}
            <div className="card-premium p-5 bg-navy text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                <BarChart3 size={120} />
              </div>
              <div className="relative z-10">
                <h3 className="text-sm font-bold mb-4">Account Status</h3>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/60">Verification</span>
                      <span className="font-bold">{isVerified ? '100%' : isPending ? '85%' : '40%'}</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: isVerified ? '100%' : isPending ? '85%' : '40%' }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gold rounded-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/60">Demands Created</span>
                      <span className="font-bold">{demands.length}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/60">Matches Found</span>
                      <span className="font-bold text-gold">{totalMatches}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="p-5 rounded-xl bg-secondary/30 border border-dashed border-border flex items-start gap-3">
              <div className="p-2 rounded-lg bg-success/10 text-success shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Verified Talent Only</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  Every candidate in the talent pool has passed a multi-stage vetting process.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployerDashboard;
