import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { authAPI, staffAPI, profilesAPI, documentsAPI } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import {
  CheckCircle2,
  Clock,
  FileText,
  XCircle,
  RotateCcw,
  ArrowRight,
  Send,
  AlertCircle,
  Loader2,
  Search,
  Building2,
  MapPin,
  Briefcase,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout';

const CandidateReviewStatus = () => {
  const [user, setUser] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { user: userData } = await authAPI.getMe();
      setUser(userData);

      if (userData) {
        try {
          const responseData = await documentsAPI.getMyDocuments();
          // Normalize documents array from various potential API response formats
          const docs = responseData?.documents || (Array.isArray(responseData) ? responseData : []);
          setDocuments(docs);

          // Debugging log to help track the "empty archive" issue
          console.log(`Loaded ${docs.length} documents for user ${userData.id}`);
        } catch (docErr) {
          console.error('Error fetching docs:', docErr);
          // Fallback to reviews API if my-documents fails (some permissions might differ)
          try {
            const staffData = await staffAPI.getReviewsByCandidate(userData.id);
            if (staffData?.documents) setDocuments(staffData.documents);
          } catch (e) {
            setDocuments([]);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checklist = {
    profileComplete: !!(
      user?.firstName &&
      user?.lastName &&
      user?.headline &&
      user?.bio &&
      user?.phone &&
      user?.location &&
      user?.nationality &&
      user?.birthDate &&
      user?.yearsOfExperience &&
      user?.sector &&
      user?.salaryExpectation &&
      user?.experience?.length &&
      user?.education?.length &&
      (user?.skills?.length || 0) >= 3 &&
      user?.languages?.length
    ),
    idUploaded: documents.some(d => {
      const t = d.type?.toLowerCase() || '';
      return t.includes('passport') || t.includes('id') || t.includes('identity');
    }),
    educationUploaded: documents.some(d => {
      const t = d.type?.toLowerCase() || '';
      return t.includes('diploma') || t.includes('degree') || t.includes('education') || t.includes('certificate');
    }),
    cvUploaded: documents.some(d => {
      const t = d.type?.toLowerCase() || '';
      return t.includes('cv') || t.includes('resume');
    }),
    referencesUploaded: documents.some(d => {
      const t = d.type?.toLowerCase() || '';
      return t.includes('reference') || t.includes('recommendation');
    })
  };

  const status = user?.verificationStatus || 'unverified';
  const isVerified = status === 'verified';
  const isRejected = status === 'rejected';
  const isPending = status === 'pending';
  const isUnverified = status === 'unverified';

  const missingFields = [
    !user?.firstName && 'firstName',
    !user?.lastName && 'lastName',
    !user?.headline && 'headline',
    !user?.bio && 'bio',
    !user?.phone && 'phone',
    !user?.location && 'location',
    !user?.nationality && 'nationality',
    !user?.birthDate && 'birthDate',
    !user?.yearsOfExperience && 'yearsOfExperience',
    !user?.sector && 'sector',
    !user?.salaryExpectation && 'salaryExpectation',
    (!user?.experience?.length) && 'experience',
    (!user?.education?.length) && 'education',
    ((user?.skills?.length || 0) < 3) && 'skills',
    (!user?.languages?.length) && 'languages',
  ].filter(Boolean) as string[];

  const missingDocs = [
    !checklist.idUploaded && 'Passport/ID',
    !checklist.educationUploaded && 'Diploma/Degree',
    !checklist.cvUploaded && 'CV/Resume'
  ].filter(Boolean) as string[];

  const canSubmit = checklist.profileComplete && checklist.idUploaded && checklist.educationUploaded && checklist.cvUploaded;

  const handleSubmit = async () => {
    if (!canSubmit || !user?.id) return;
    setSubmitting(true);

    try {
      await profilesAPI.updateCandidateProfile(user.id, {
        verificationStatus: 'pending',
        isVerified: false
      } as any);

      toast({
        title: 'Application Submitted!',
        description: 'Your profile has been sent to our executive team for review.',
      });

      await loadData();
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelReview = async () => {
    const confirmed = confirm('Cancel verification request? This will reset your profile to unverified.');
    if (!confirmed) return;

    try {
      await profilesAPI.updateCandidateProfile(user.id, {
        verificationStatus: 'unverified'
      } as any);

      toast({
        title: "Request Cancelled",
        description: "Your profile is no longer in review.",
      });
      await loadData();
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Could not cancel request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const steps = [
    { id: 1, name: 'Dossier Completion', status: checklist.profileComplete ? 'complete' : 'current' },
    { id: 2, name: 'Document Archive', status: (checklist.idUploaded && checklist.educationUploaded && checklist.cvUploaded) ? 'complete' : (checklist.profileComplete ? 'current' : 'pending') },
    {
      id: 3,
      name: 'Executive Review',
      status: isPending || isVerified || isRejected ? 'complete' : (canSubmit ? 'current' : 'pending')
    },
    {
      id: 4,
      name: 'Verification Grant',
      status: isVerified ? 'complete' : isRejected ? 'error' : isPending ? 'current' : 'pending'
    },
    {
      id: 5,
      name: 'Direct Access',
      status: isVerified ? 'complete' : 'pending'
    },
  ];

  if (loading) {
    return (
      <DashboardLayout role="candidate">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="candidate">
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Verification Center</h1>
            <p className="text-muted-foreground mt-1 text-sm tracking-wide uppercase font-bold opacity-70">
              {isVerified ? 'Your Status: Globally Verified' : 'Manage your platform credentials'}
            </p>
          </div>
        </div>

        {/* Global Status Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "card-premium p-8 relative overflow-hidden transition-all duration-500",
            isVerified ? "border-success/30 bg-success/5 shadow-xl shadow-success/5" :
              isRejected ? "border-destructive/30 bg-destructive/5 shadow-xl shadow-destructive/5" :
                isPending ? "border-gold/30 bg-gold/5 shadow-2xl shadow-gold/10" :
                  "border-border bg-secondary/20"
          )}
        >
          {/* Decorative background icons */}
          <div className="absolute -right-8 -top-8 opacity-[0.03] rotate-12 pointer-events-none">
            {isVerified ? <ShieldCheck size={280} /> : isRejected ? <AlertCircle size={280} /> : <Clock size={280} />}
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
            <div className={cn(
              "w-20 h-20 rounded-[2.5rem] flex items-center justify-center shrink-0 shadow-inner border-2",
              isVerified ? "bg-success/20 border-success/40 text-success" :
                isRejected ? "bg-destructive/20 border-destructive/40 text-destructive shadow-destructive/20" :
                  isPending ? "bg-gold/20 border-gold/40 text-gold" :
                    "bg-secondary border-border text-muted-foreground"
            )}>
              {isVerified ? <ShieldCheck className="w-10 h-10" /> :
                isRejected ? <XCircle className="w-10 h-10" /> :
                  <Clock className="w-10 h-10 animate-pulse-slow" />}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                {isVerified ? 'Institutional Verification Active' :
                  isRejected ? 'Credential Revision Necessary' :
                    isPending ? 'Profile Under Executive Review' :
                      'Verification Not Yet Initiated'}
              </h2>
              <p className="text-muted-foreground leading-relaxed max-w-2xl mb-6">
                {isVerified ? 'Your professional identity has been verified. You are now being ranked in the Talent Pool and visible to premier German corporations.' :
                  isRejected ? 'The verification committee has flagged inconsistencies or missing data. Professional revision is required before re-evaluation.' :
                    isPending ? 'Your dossier is currently in the valuation stage. Our experts are cross-referencing your credentials with German market standards.' :
                      'To gain direct access to German employers, you must first complete your professional dossier and submit it for our vetting process.'}
              </p>

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                <span className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border",
                  isVerified ? "bg-success/10 border-success/30 text-success" :
                    isRejected ? "bg-destructive/10 border-destructive/30 text-destructive" :
                      isPending ? "bg-gold text-navy border-gold" :
                        "bg-secondary/50 text-muted-foreground border-border"
                )}>
                  Status: {status.toUpperCase()}
                </span>

                {user?.verificationPaymentStatus === 'paid' && (
                  <span className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border bg-success/10 border-success/30 text-success">
                    Payment Received
                  </span>
                )}

                {isRejected && (
                  <Link
                    to="/candidate/profile"
                    className="group flex items-center gap-2 text-sm font-bold text-destructive hover:underline decoration-2 underline-offset-4"
                  >
                    Edit Credentials
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}

                {isVerified && (
                  <Link
                    to="/candidate/profile"
                    className="group flex items-center gap-2 text-sm font-bold text-success hover:underline decoration-2 underline-offset-4"
                  >
                    Manage Public Profile
                    <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </Link>
                )}

                {isPending && (user?.verificationPaymentStatus === 'pending' || !user?.verificationPaymentStatus) && (
                  <Link
                    to="/candidate/pricing"
                    className="mt-4 md:mt-0 md:ml-auto px-6 py-3 rounded-xl bg-gold text-navy font-bold hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-gold/20 animate-pulse-slow"
                  >
                    Complete Verification
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Column: Flow & Action */}
          <div className="lg:col-span-3 space-y-8">
            {/* Step Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-premium p-10"
            >
              <h3 className="text-lg font-display font-bold text-foreground mb-10 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-gold" />
                Vetting Roadmap
              </h3>
              <div className="space-y-12">
                {steps.map((step, index, arr) => (
                  <div key={step.id} className="flex items-start gap-6 relative group">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg shrink-0",
                        step.status === 'complete' ? "bg-success text-primary-foreground" :
                          step.status === 'current' ? "bg-gold text-navy animate-pulse-slow ring-4 ring-gold/20" :
                            step.status === 'error' ? "bg-destructive text-destructive-foreground" :
                              "bg-secondary text-muted-foreground border border-border"
                      )}>
                        {step.status === 'complete' ? <CheckCircle2 className="w-6 h-6" /> :
                          step.status === 'error' ? <XCircle className="w-6 h-6" /> :
                            <span className="text-lg font-bold">{step.id}</span>}
                      </div>
                      {index < arr.length - 1 && (
                        <div className={cn(
                          "w-1 h-12 my-2 rounded-full transition-colors duration-500",
                          step.status === 'complete' ? "bg-success" : "bg-border/30"
                        )} />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className={cn(
                        "text-lg font-display font-bold",
                        step.status === 'pending' ? "text-muted-foreground" :
                          step.status === 'error' ? "text-destructive" :
                            "text-foreground"
                      )}>
                        {step.name}
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium mt-1">
                        {step.status === 'current' && step.id === 1 ? 'Technical profile audit missing entries.' :
                          step.status === 'current' && step.id === 2 ? 'Required: Passport, Degree, and CV.' :
                            step.status === 'current' && step.id === 3 ? 'Unlock vetting with complete dossier.' :
                              step.status === 'current' && step.id === 4 ? 'Awaiting Human-Led verification.' :
                                step.status === 'error' ? 'Audit failed. Check dossier for errors.' :
                                  step.status === 'complete' ? 'Milestone Achieved' :
                                    'Awaiting sequence completion.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Dossier Summary Preview */}
            {(isUnverified || isRejected) && checklist.profileComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-premium p-8 border-gold/30 bg-gold/5"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center text-gold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-foreground">Dossier Summary</h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-x-12 gap-y-6">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Headline & Identity</p>
                    <p className="text-foreground font-bold">{user?.headline || 'Not specified'}</p>
                    <p className="text-xs text-muted-foreground">{user?.firstName} {user?.lastName} • {user?.nationality}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Market Targeting</p>
                    <p className="text-foreground font-bold">{user?.sector || 'Not specified'}</p>
                    <p className="text-xs text-muted-foreground">{user?.yearsOfExperience}y Experience • {user?.salaryExpectation}€/yr</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Residential Axis</p>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-gold" />
                      <p className="text-foreground font-bold text-sm">{user?.location || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Direct Contact</p>
                    <p className="text-foreground font-bold text-sm">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">{user?.phone || 'No phone provided'}</p>
                  </div>
                  <div className="sm:col-span-2 pt-4 border-t border-gold/10">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-2">Verified Professional Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {user?.skills?.slice(0, 5).map((skill: string) => (
                        <span key={skill} className="px-2 py-1 rounded-md bg-navy text-white text-[9px] font-black uppercase tracking-tighter">
                          {skill}
                        </span>
                      ))}
                      {(user?.skills?.length || 0) > 5 && (
                        <span className="text-[10px] text-muted-foreground font-bold">+{user.skills.length - 5} more</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Submission Action (Internalized) */}
            {(isUnverified || isRejected) && (
              <div className="space-y-4">
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  className={cn(
                    "w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-gold/10",
                    canSubmit
                      ? "bg-gold text-navy hover:shadow-gold/20"
                      : "bg-secondary text-muted-foreground/30 cursor-not-allowed border border-border"
                  )}
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {submitting ? 'Transmitting Dossier...' : 'Finalize Submission'}
                </button>
                {!canSubmit && (
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest text-center">
                    <AlertCircle className="w-3 h-3 inline mr-2" />
                    Complete mandatory fields & documents to enable submission
                  </p>
                )}
              </div>
            )}

            {isPending && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-secondary/20 border border-border rounded-3xl p-8"
              >
                <div className="flex items-center gap-4 text-muted-foreground">
                  <RotateCcw className="w-5 h-5" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Withdraw from active review?</p>
                    <p className="text-xs">If you need to make urgent changes, you can cancel and re-submit later.</p>
                  </div>
                  <button
                    onClick={handleCancelReview}
                    className="px-4 py-2 rounded-xl bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-widest hover:bg-destructive/20 transition-all border border-destructive/10"
                  >
                    Cancel Request
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: Checklists & Documents */}
          <div className="lg:col-span-2 space-y-8">
            {/* Checklist Dossier */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-premium p-8"
            >
              <h3 className="text-lg font-display font-bold text-foreground mb-6">Credential Checklist</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl transition-all",
                    checklist.profileComplete ? "bg-success/5 border border-success/10" : "bg-warning/5 border border-warning/10"
                  )}>
                    {checklist.profileComplete ? <CheckCircle2 className="w-5 h-5 text-success" /> : <AlertCircle className="w-5 h-5 text-warning" />}
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">Professional Profile</p>
                      {!checklist.profileComplete && (
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-wider mt-1 leading-tight">
                          Required: {
                            [
                              !user?.bio && "Bio",
                              !user?.phone && "Phone",
                              !user?.nationality && "Nationality",
                              !user?.sector && "Sector",
                              (!user?.experience?.length) && "Work Exp",
                              (!user?.education?.length) && "Edu",
                              (user?.skills?.length || 0) < 3 && "3 Skills"
                            ].filter(Boolean).join(' • ')
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {[
                  { label: "Identity (Passport/ID/Government ID)", met: checklist.idUploaded },
                  { label: "Academic Credentials (Diploma/Degree)", met: checklist.educationUploaded },
                  { label: "Professional CV / Resume", met: checklist.cvUploaded },
                ].map((item, i) => (
                  <div key={i} className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl border transition-all",
                    item.met ? "bg-success/5 border-success/10 text-success" : "bg-destructive/5 border-destructive/20 text-destructive ring-1 ring-destructive/10"
                  )}>
                    {item.met ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    <div className="flex-1">
                      <p className="text-sm font-bold">{item.label}</p>
                      {!item.met && <p className="text-[8px] font-black uppercase tracking-tighter opacity-70">Missing from Dossier</p>}
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to={missingFields.includes('documents') ? "/candidate/documents" : `/candidate/profile?missing=${missingFields.join(',')}`}
                className="mt-6 w-full py-4 rounded-xl bg-secondary text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-gold hover:text-navy transition-all"
              >
                Access Dossier Editor <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Document Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card-premium p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-display font-bold text-foreground">Archive</h3>
                <span className="text-[10px] font-black text-muted-foreground uppercase">{documents.length} Files</span>
              </div>
              <div className="space-y-4">
                {documents.length > 0 ? documents.map((doc) => (
                  <div key={doc.id} className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                    <div className="flex items-start gap-4">
                      <FileText className="w-5 h-5 text-gold shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-sm text-foreground block truncate">{doc.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-1.5 py-0.5 rounded bg-gold/10 text-gold text-[7px] font-black uppercase tracking-widest">{doc.type}</span>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter",
                            doc.status === 'verified' ? "bg-success/10 text-success" :
                              doc.status === 'rejected' ? "bg-destructive/10 text-destructive" :
                                "bg-gold/10 text-gold"
                          )}>
                            {doc.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 opacity-30">
                    <FileText className="w-10 h-10 mx-auto mb-3" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Dossier Empty</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CandidateReviewStatus;
