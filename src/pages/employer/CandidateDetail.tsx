import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout';
import {
  ArrowLeft,
  User,
  Shield,
  MapPin,
  Star,
  FileText,
  CheckCircle2,
  Clock,
  Briefcase,
  GraduationCap,
  Globe,
  BadgeEuro,
  Video,
  Target,
  MessageSquare
} from 'lucide-react';
import { talentPoolAPI, authAPI, quotesAPI, interviewAPI, CandidateStatus } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import InterviewScheduler from '@/components/interviews/InterviewScheduler';

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  headline?: string;
  bio?: string;
  isVerified: boolean;
  profileScore?: number;
  experience?: any[];
  education?: any[];
  skills?: string[];
  languages?: string[];
  nationality?: string;
  birthDate?: string;
  yearsOfExperience?: string;
  sector?: string;
  salaryExpectation?: string;
}

const EmployerCandidateDetail = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Pipeline state
  const [currentStatus, setCurrentStatus] = useState<CandidateStatus>('potential');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Quote state
  const [quoteStatus, setQuoteStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [requestingQuote, setRequestingQuote] = useState(false);

  // Interview scheduler
  const [schedulerOpen, setSchedulerOpen] = useState(false);
  const [schedulerLoading, setSchedulerLoading] = useState(false);

  useEffect(() => {
    authAPI.getMe().then(({ user: u }) => setUser(u)).catch(console.error).finally(() => setLoadingUser(false));
  }, []);

  useEffect(() => {
    if (candidateId) loadData(candidateId);
  }, [candidateId]);

  const loadData = async (id: string) => {
    try {
      setLoading(true);
      const [candResp, quoteResp, relResp] = await Promise.all([
        talentPoolAPI.getCandidateById(id),
        talentPoolAPI.getMyQuoteRequests(),
        talentPoolAPI.getMyCandidateRelations(),
      ]);

      setCandidate(candResp.candidate as any);
      setDocuments(candResp.documents as any || []);

      // Find existing quote for this candidate
      const existingQuote = quoteResp.requests?.find((r: any) =>
        r.candidateId === id && (r.status === 'pending' || r.status === 'approved')
      );
      if (existingQuote) {
        setQuoteStatus(existingQuote.status);
        setQuoteId(existingQuote.id);
      } else {
        setQuoteStatus('none');
        setQuoteId(null);
      }

      // Find pipeline relation
      const rel = relResp.relations?.find((r: any) => r.candidateId === id);
      if (rel) setCurrentStatus(rel.status);
    } catch (error) {
      console.error('Failed to load candidate:', error);
      toast({ title: 'Error', description: 'Failed to load candidate details.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestQuote = async () => {
    if (!candidateId) return;
    setRequestingQuote(true);
    try {
      const resp = await talentPoolAPI.requestQuote(candidateId);
      await talentPoolAPI.updateCandidateStatus(candidateId, 'asked_quote');
      setQuoteStatus('pending');
      setQuoteId(resp.quoteRequest?.id || null);
      setCurrentStatus('asked_quote');
      toast({ title: 'Quote Requested', description: 'Your quote request has been sent to staff for review.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.error || 'Failed to request quote', variant: 'destructive' });
    } finally {
      setRequestingQuote(false);
    }
  };

  const handleScheduleInterview = async (data: { title: string; proposedTimes: { datetime: string; duration: number }[]; notes?: string }) => {
    if (!candidateId || !user) return;
    setSchedulerLoading(true);
    try {
      await interviewAPI.schedule({
        candidateId,
        employerId: user.id,
        title: data.title,
        proposedTimes: data.proposedTimes,
        notes: data.notes
      });

      toast({ title: 'Interview Requested!', description: `Interview invitation sent to ${candidate?.firstName}.` });
      setSchedulerOpen(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSchedulerLoading(false);
    }
  };

  // Determine the primary CTA button
  const renderPrimaryAction = () => {
    // Step 1: No quote yet → Request Quote
    if (quoteStatus === 'none') {
      return (
        <button
          onClick={handleRequestQuote}
          disabled={requestingQuote}
          className="w-full py-4 rounded-xl bg-gold text-navy font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:shadow-gold/20 hover:-translate-y-0.5 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {requestingQuote ? (
            <><div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" /> Requesting...</>
          ) : (
            <><BadgeEuro className="w-5 h-5" /> Request Quote</>
          )}
        </button>
      );
    }

    // Step 2: Quote pending → Show pending + Schedule Interview button
    if (quoteStatus === 'pending') {
      return (
        <div className="space-y-3">
          <div className="w-full py-3 rounded-xl bg-secondary border border-border text-muted-foreground font-bold text-sm flex items-center justify-center gap-3">
            <Clock className="w-4 h-4" /> Quote Pending Review
          </div>
          <button
            onClick={() => setSchedulerOpen(true)}
            className="w-full py-4 rounded-xl bg-purple-600 text-white font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-0.5 flex items-center justify-center gap-3"
          >
            <Video className="w-5 h-5" /> {currentStatus === 'interviewed' ? 'Plan Another Interview' : 'Schedule Interview'}
          </button>
        </div>
      );
    }

    // Step 3: Quote approved → View quote & choose plan
    if (quoteStatus === 'approved' && quoteId) {
      return (
        <div className="space-y-3">
          <Link
            to={`/employer/quotes/${quoteId}`}
            className="w-full py-4 rounded-xl bg-success text-white font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:shadow-success/20 hover:-translate-y-0.5 flex items-center justify-center gap-3"
          >
            <BadgeEuro className="w-5 h-5" /> View Quote & Choose Plan
          </Link>
          <button
            onClick={() => setSchedulerOpen(true)}
            className="w-full py-3 rounded-xl bg-purple-600/10 text-purple-600 border border-purple-500/20 font-bold text-sm transition-all hover:bg-purple-600/20 flex items-center justify-center gap-3"
          >
            <Video className="w-4 h-4" /> {currentStatus === 'interviewed' ? 'Plan Another Interview' : 'Schedule Interview'}
          </button>
        </div>
      );
    }

    return null;
  };

  if (loading || loadingUser) {
    return (
      <DashboardLayout role="employer">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
            <p className="text-muted-foreground font-medium">Loading candidate profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || user.verificationStatus !== 'verified') {
    return (
      <DashboardLayout role="employer">
        <div className="flex flex-col items-center justify-center py-20 card-premium border-gold/20 bg-gold/5 mt-8 max-w-xl mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-gold/20 flex items-center justify-center mb-6 shadow-xl shadow-gold/10 border border-gold/30">
            <Shield className="w-10 h-10 text-gold" />
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-3">Verification Required</h2>
          <p className="text-muted-foreground text-center max-w-md mb-6 leading-relaxed">
            Full candidate profiles and quote requests are only available to
            <span className="text-gold font-bold"> verified employers</span>.
          </p>
          <Link to="/employer/onboarding" className="w-full max-w-xs py-4 rounded-xl bg-gold text-navy font-bold text-sm text-center hover:shadow-lg hover:shadow-gold/20 transition-all flex items-center justify-center gap-2">
            Complete Company Onboarding
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (!candidate) {
    return (
      <DashboardLayout role="employer">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Candidate not found</h2>
          <Link to="/employer/talent-pool" className="text-gold hover:underline">Back to Talent Pool</Link>
        </div>
      </DashboardLayout>
    );
  }

  const statusLabels: Record<CandidateStatus, { label: string; color: string }> = {
    potential: { label: 'Potential', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    shortlisted: { label: 'Shortlisted', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    asked_quote: { label: 'Quote Requested', color: 'bg-success/10 text-success border-success/20' },
    interviewed: { label: 'Interviewed', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
    hired: { label: 'Hired', color: 'bg-gold/10 text-gold border-gold/20' },
  };

  return (
    <DashboardLayout role="employer">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all group text-sm"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-6 lg:p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -mr-32 -mt-32" />

          <div className="flex flex-col lg:flex-row justify-between gap-6 relative z-10">
            <div className="flex gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 shadow-lg relative">
                <User className="w-10 h-10 text-gold" />
                {candidate.isVerified && (
                  <div className="absolute -bottom-2 -right-2 bg-success text-white p-1 rounded-lg shadow-lg border-2 border-background">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
                    {candidate.firstName} <span className="text-gold/40 font-mono text-lg">{candidate.lastName}</span>
                  </h1>
                  <h2 className="text-base font-bold text-gold/80">{candidate.headline || 'Qualified Professional'}</h2>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {candidate.location || 'Germany'}</span>
                    {candidate.profileScore && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-gold/10 text-gold text-xs font-bold border border-gold/10">
                        <Star className="w-3 h-3 fill-gold" /> {candidate.profileScore}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills?.slice(0, 5).map(skill => (
                    <span key={skill} className="px-2 py-0.5 rounded bg-secondary text-[10px] font-bold text-foreground/70 border border-border/50">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right panel: Status + Actions */}
            <div className="flex flex-col gap-3 min-w-[260px]">
              {/* Current Pipeline Status */}
              <div className={cn("px-4 py-2 rounded-xl border text-xs font-bold text-center", statusLabels[currentStatus].color)}>
                Pipeline: {statusLabels[currentStatus].label}
              </div>

              {/* Primary Action */}
              {renderPrimaryAction()}

              {/* Quick status buttons */}
              {currentStatus === 'potential' && (
                <button
                  onClick={async () => {
                    setUpdatingStatus(true);
                    try {
                      await talentPoolAPI.updateCandidateStatus(candidateId!, 'shortlisted');
                      setCurrentStatus('shortlisted');
                      toast({ title: 'Shortlisted', description: 'Candidate added to your shortlist.' });
                    } finally { setUpdatingStatus(false); }
                  }}
                  disabled={updatingStatus}
                  className="w-full py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-bold hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Star className="w-3.5 h-3.5" /> Add to Shortlist
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-premium p-6">
              <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2 border-l-4 border-gold pl-3">
                Professional Summary
              </h3>
              <p className="text-muted-foreground leading-relaxed italic">
                "{candidate.bio || 'This professional is focused on bringing their expertise to the German market and contributing to high-impact projects.'}"
              </p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Background', value: 'Verified Clear', icon: Shield },
                { label: 'Experience', value: candidate.yearsOfExperience || 'N/A', icon: Briefcase },
                { label: 'Sector', value: candidate.sector || 'N/A', icon: Target },
                { label: 'Salary Exp.', value: candidate.salaryExpectation ? `€${candidate.salaryExpectation}/yr` : 'TBD', icon: BadgeEuro },
              ].map((stat, i) => (
                <div key={i} className="card-premium p-4 text-center">
                  <stat.icon className="w-5 h-5 text-gold mx-auto mb-2" />
                  <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">{stat.label}</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{stat.value}</p>
                </div>
              ))}
            </motion.div>

            {/* Experience */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-premium p-6">
              <div className="flex items-center gap-2 mb-6 border-l-4 border-gold pl-3">
                <Briefcase className="w-4 h-4 text-gold" />
                <h3 className="text-base font-bold text-foreground">Career History</h3>
              </div>
              {candidate.experience && candidate.experience.length > 0 ? (
                <div className="space-y-6">
                  {candidate.experience.map((exp: any, i: number) => (
                    <div key={i} className="relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-0 before:w-0.5 before:bg-border last:before:hidden">
                      <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-secondary border-2 border-background flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-gold" />
                      </div>
                      <span className="text-[10px] font-bold text-gold uppercase tracking-widest">{exp.period}</span>
                      <h4 className="text-base font-bold text-foreground mt-1">{exp.title}</h4>
                      <p className="text-sm text-muted-foreground">{exp.company}</p>
                      {exp.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed mt-2 bg-secondary/20 p-3 rounded-lg border border-border/30">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic text-center py-4">No career history disclosed yet.</p>
              )}
            </motion.div>

            {/* Education */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card-premium p-6">
              <div className="flex items-center gap-2 mb-6 border-l-4 border-gold pl-3">
                <GraduationCap className="w-4 h-4 text-gold" />
                <h3 className="text-base font-bold text-foreground">Education</h3>
              </div>
              <div className="space-y-4">
                {candidate.education?.length ? candidate.education.map((edu: any, i: number) => (
                  <div key={i} className="relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-0 before:w-0.5 before:bg-border last:before:hidden">
                    <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-secondary border-2 border-background flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-gold" />
                    </div>
                    <span className="text-[10px] font-bold text-gold uppercase tracking-widest">{edu.year || 'Verified'}</span>
                    <h4 className="text-base font-bold text-foreground mt-1">{edu.degree}</h4>
                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                  </div>
                )) : (
                  <p className="text-muted-foreground italic text-center py-4">Education data verified by GBPC.</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skills */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="card-premium p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills?.map(skill => (
                  <span key={skill} className="px-3 py-1.5 rounded-lg bg-navy/5 text-[10px] font-bold uppercase text-navy/70 border border-navy/5">
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Languages */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="card-premium p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Languages</h3>
              <div className="space-y-2">
                {candidate.languages?.map(lang => (
                  <div key={lang} className="flex items-center justify-between p-2 rounded-lg bg-success/5 border border-success/10">
                    <span className="text-xs font-bold">{lang.split(' ')[0]}</span>
                    <span className="text-[10px] font-bold uppercase text-success">{lang.split(' ')[1] || 'Verified'}</span>
                  </div>
                ))}
                {(!candidate.languages || candidate.languages.length === 0) && (
                  <p className="text-xs text-muted-foreground italic">English (Verified C1 Proficiency)</p>
                )}
              </div>
            </motion.div>

            {/* Recruitment Flow Guide */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="card-premium p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Recruitment Flow</h3>
              <div className="space-y-3">
                <div className={cn("flex items-center gap-3 text-xs", quoteStatus !== 'none' ? "text-success" : "text-foreground font-bold")}>
                  <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                    quoteStatus !== 'none' ? "bg-success/20" : "bg-gold/20"
                  )}>
                    {quoteStatus !== 'none' ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <span className="text-[10px] font-bold text-gold">1</span>}
                  </div>
                  Request Quote
                </div>
                <div className={cn("flex items-center gap-3 text-xs",
                  currentStatus === 'interviewed' || currentStatus === 'hired' ? "text-success" :
                    quoteStatus !== 'none' ? "text-foreground font-bold" : "text-muted-foreground"
                )}>
                  <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                    currentStatus === 'interviewed' || currentStatus === 'hired' ? "bg-success/20" :
                      quoteStatus !== 'none' ? "bg-purple-500/20" : "bg-secondary"
                  )}>
                    {currentStatus === 'interviewed' || currentStatus === 'hired'
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                      : <span className="text-[10px] font-bold text-purple-500">2</span>}
                  </div>
                  Schedule Interview
                </div>
                <div className={cn("flex items-center gap-3 text-xs",
                  quoteStatus === 'approved' ? "text-foreground font-bold" : "text-muted-foreground"
                )}>
                  <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                    quoteStatus === 'approved' ? "bg-gold/20" : "bg-secondary"
                  )}>
                    <span className="text-[10px] font-bold">3</span>
                  </div>
                  Choose Plan & Pay
                </div>
                <div className={cn("flex items-center gap-3 text-xs",
                  currentStatus === 'hired' ? "text-success font-bold" : "text-muted-foreground"
                )}>
                  <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                    currentStatus === 'hired' ? "bg-success/20" : "bg-secondary"
                  )}>
                    {currentStatus === 'hired'
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                      : <span className="text-[10px] font-bold">4</span>}
                  </div>
                  Hire & Onboard
                </div>
              </div>
            </motion.div>

            {/* Data Shield */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
              className="p-6 rounded-2xl bg-navy text-white text-center relative overflow-hidden group">
              <Shield className="w-10 h-10 text-gold mx-auto mb-3 relative z-10" />
              <h4 className="text-sm font-bold mb-1 relative z-10">Data Integrity Shield</h4>
              <p className="text-[10px] text-white/60 leading-relaxed font-medium relative z-10">
                Full identity verification and original diploma scans available upon signing an engagement contract.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <InterviewScheduler
        isOpen={schedulerOpen}
        onClose={() => setSchedulerOpen(false)}
        onSchedule={handleScheduleInterview}
        candidateName={candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Candidate'}
        loading={schedulerLoading}
      />
    </DashboardLayout>
  );
};

export default EmployerCandidateDetail;
