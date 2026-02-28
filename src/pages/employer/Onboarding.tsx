import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout';
import {
  Building2,
  MapPin,
  Globe,
  Users,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Upload,
  Info,
  Clock,
  ShieldCheck,
  Edit3,
  XCircle,
  Loader2,
  RotateCcw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { authAPI, profilesAPI } from '@/lib/api';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { useCustomDialog } from '@/hooks/use-custom-dialog';
import { cn } from '@/lib/utils';

const steps = [
  { id: 1, title: 'Company Basics', icon: Building2 },
  { id: 2, title: 'Location & Contact', icon: MapPin },
  { id: 3, title: 'Details & Story', icon: Info },
  { id: 4, title: 'Verification', icon: CheckCircle2 },
];

const EmployerOnboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { isOpen, options, showDialog, closeDialog } = useCustomDialog();
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    website: '',
    companySize: '1-10',
    description: '',
    vision: '',
    foundedYear: '',
    address: '',
    city: '',
    phone: '',
    contactEmail: '',
    societyType: '',
    registerNumber: '',
    isTrainingCompany: false
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { user } = await authAPI.getMe();
        if (user) {
          setUserProfile(user);
          setFormData({
            companyName: user.companyName || '',
            industry: user.industry || '',
            website: user.website || '',
            companySize: user.companySize || '1-10',
            description: user.description || '',
            vision: user.vision || '',
            foundedYear: user.foundedYear || '',
            address: user.address || '',
            city: user.city || '',
            phone: user.phone || '',
            contactEmail: user.contactEmail || user.email || '',
            societyType: user.societyType || '',
            registerNumber: user.registerNumber || '',
            isTrainingCompany: user.isTrainingCompany || false
          });
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1: // Company Basics
        return !!(formData.companyName && formData.industry && formData.companySize && formData.foundedYear && formData.societyType && formData.registerNumber);
      case 2: // Location & Contact
        return !!(formData.address && formData.city && formData.phone && formData.contactEmail);
      case 3: // Details & Story
        return !!(formData.description && formData.vision);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { user } = await authAPI.getMe();
      if (user && user.id) {
        await profilesAPI.updateEmployerProfile(user.id, {
          ...formData,
          verificationStatus: 'pending'
        });
      }

      showDialog({
        title: 'Application Received!',
        description: 'Thank you for choosing German Talent Connect. Your company profile has been submitted for review. Our team will verify your details within 48 hours.',
        type: 'success',
        confirmLabel: 'Go to Dashboard',
        onConfirm: () => navigate('/employer/dashboard')
      });

      // Update local status to reflect submission
      setUserProfile((prev: any) => ({ ...prev, verificationStatus: 'pending' }));
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update company profile.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderSummary = () => {
    const isPending = userProfile?.verificationStatus === 'pending';
    const isVerified = userProfile?.verificationStatus === 'verified';
    const isRejected = userProfile?.verificationStatus === 'rejected';

    return (
      <div className="space-y-8">
        {/* Status Header */}
        <div className={cn(
          "p-6 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-6",
          isVerified ? "bg-success/5 border-success/20" :
            isRejected ? "bg-destructive/5 border-destructive/20" :
              "bg-warning/5 border-warning/20"
        )}>
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shrink-0",
              isVerified ? "bg-success text-white" :
                isRejected ? "bg-destructive text-white" :
                  "bg-warning text-white"
            )}>
              {isVerified ? <ShieldCheck className="w-8 h-8" /> :
                isRejected ? <XCircle className="w-8 h-8" /> :
                  <Clock className="w-8 h-8" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {isVerified ? 'Profile Verified' :
                  isRejected ? 'Application Rejected' :
                    'Review in Progress'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isVerified
                  ? 'Your company profile is active and verified. You have full access to the platform.'
                  : isRejected
                    ? `Your application was rejected. Reason: ${userProfile?.rejectionReason || 'Please review your details.'}`
                    : 'Our team is currently reviewing your registration details. Expected time: 24-48 hours.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isRejected && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 rounded-xl bg-destructive text-white font-bold hover:shadow-lg hover:shadow-destructive/20 transition-all text-sm flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" /> Edit & Resubmit
              </button>
            )}
            {isVerified && (
              <div className="hidden sm:block">
                <span className="px-4 py-1.5 rounded-full bg-success/20 text-success text-xs font-bold uppercase tracking-wider">
                  Official Partner
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="card-premium p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <Building2 className="w-5 h-5 text-gold" />
                  Company Details
                </h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Company</p>
                  <p className="text-foreground font-semibold">{formData.companyName}</p>
                  <p className="text-xs text-muted-foreground">{formData.societyType} • {formData.registerNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Industry</p>
                  <p className="text-foreground font-semibold">{formData.industry || 'Not specified'}</p>
                  {formData.isTrainingCompany && (
                    <span className="text-xs text-gold font-medium mt-1 block">✓ Training Company</span>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Company Size</p>
                  <p className="text-foreground font-semibold">{formData.companySize}</p>
                  <p className="text-xs text-muted-foreground">Est. {formData.foundedYear}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Website</p>
                  {formData.website ? (
                    <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline font-semibold flex items-center gap-1 group">
                      {formData.website.replace(/^https?:\/\//, '')}
                      <Globe className="w-3 h-3 transition-transform group-hover:rotate-12" />
                    </a>
                  ) : (
                    <p className="text-muted-foreground text-sm italic">Not provided</p>
                  )}
                </div>
              </div>
            </div>

            <div className="card-premium p-8">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-foreground">
                <Info className="w-5 h-5 text-gold" />
                About & Vision
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2">Description</p>
                  <p className="text-foreground leading-relaxed italic border-l-2 border-gold/30 pl-4 py-1">
                    {formData.description || 'No description provided'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2">Vision & Mission</p>
                  <p className="text-foreground leading-relaxed">
                    {formData.vision || 'No vision statement provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <div className="card-premium p-8">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-foreground">
                <MapPin className="w-5 h-5 text-gold" />
                Contact Info
              </h3>
              <div className="space-y-6">
                <div className="p-3 rounded-xl bg-secondary/50 space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Headquarters</p>
                  <p className="text-foreground text-sm">{formData.address}</p>
                  <p className="text-foreground text-sm">{formData.city}</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/50 space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">HR Contact</p>
                  <p className="text-foreground font-semibold text-sm">{formData.contactEmail}</p>
                  <p className="text-foreground text-sm">{formData.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="text-sm font-medium text-foreground">
      {children} <span className="text-red-500">*</span>
    </label>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid gap-6">
              <div className="space-y-2">
                <RequiredLabel>Company Legal Name</RequiredLabel>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={e => updateFormData({ companyName: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-gold/50 outline-none"
                    placeholder="e.g. TechCorp GmbH"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <RequiredLabel>Industry</RequiredLabel>
                  <select
                    value={formData.industry}
                    onChange={e => updateFormData({ industry: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background outline-none"
                  >
                    <option value="">Select Industry</option>
                    <option value="IT">Information Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <RequiredLabel>Company Size</RequiredLabel>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <select
                      value={formData.companySize}
                      onChange={e => updateFormData({ companySize: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background outline-none"
                    >
                      <option value="1-10">1-10 Employees</option>
                      <option value="11-50">11-50 Employees</option>
                      <option value="51-200">51-200 Employees</option>
                      <option value="201-500">201-500 Employees</option>
                      <option value="500+">500+ Employees</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Company Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="url"
                    value={formData.website}
                    onChange={e => updateFormData({ website: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background outline-none"
                    placeholder="https://www.example.com"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <RequiredLabel>Founded Year</RequiredLabel>
                  <input
                    type="number"
                    value={formData.foundedYear}
                    onChange={e => updateFormData({ foundedYear: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background outline-none"
                    placeholder="e.g. 2010"
                  />
                </div>
                <div className="space-y-2">
                  <RequiredLabel>Type of Society</RequiredLabel>
                  <select
                    value={formData.societyType}
                    onChange={e => updateFormData({ societyType: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background outline-none"
                  >
                    <option value="">Select Type</option>
                    <option value="GmbH">GmbH</option>
                    <option value="AG">AG</option>
                    <option value="UG">UG (haftungsbeschränkt)</option>
                    <option value="GbR">GbR</option>
                    <option value="KG">KG</option>
                    <option value="OHG">OHG</option>
                    <option value="e.V.">e.V.</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <RequiredLabel>Register Number</RequiredLabel>
                  <input
                    type="text"
                    value={formData.registerNumber}
                    onChange={e => updateFormData({ registerNumber: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background outline-none"
                    placeholder="e.g. HRB 12345"
                  />
                </div>
                <div className="flex items-center h-full pt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isTrainingCompany}
                      onChange={e => updateFormData({ isTrainingCompany: e.target.checked })}
                      className="w-5 h-5 rounded border-border bg-background text-gold focus:ring-gold"
                    />
                    <span className="text-sm font-medium text-foreground">Ausbildungsbetrieb (Training Company)</span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid gap-6">
              <div className="space-y-2">
                <RequiredLabel>Headquarters Address</RequiredLabel>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => updateFormData({ address: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background outline-none"
                    placeholder="Street and Number"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <RequiredLabel>City</RequiredLabel>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => updateFormData({ city: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background outline-none"
                    placeholder="e.g. Berlin"
                  />
                </div>
                <div className="space-y-2">
                  <RequiredLabel>Business Phone</RequiredLabel>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => updateFormData({ phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background outline-none"
                    placeholder="+49 30 12345678"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <RequiredLabel>HR Contact Email</RequiredLabel>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={e => updateFormData({ contactEmail: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background outline-none"
                  placeholder="hr@company.com"
                />
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <RequiredLabel>About the Company</RequiredLabel>
                <textarea
                  value={formData.description}
                  onChange={e => updateFormData({ description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background outline-none resize-none"
                  placeholder="Tell us about your company and what makes it unique..."
                />
              </div>
              <div className="space-y-2">
                <RequiredLabel>Vision & Mission</RequiredLabel>
                <textarea
                  value={formData.vision}
                  onChange={e => updateFormData({ vision: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background outline-none resize-none"
                  placeholder="What are your long-term goals and values?"
                />
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-8"
          >
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Almost There!</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Once you submit, our team will verify your company details. This typically takes 24-48 hours. After verification, you can post unlimited job listings.
              </p>
            </div>

            <div className="card-premium p-8 text-left max-w-2xl mx-auto border-gold/30 bg-gold/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center text-gold">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground">Registration Summary</h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-12 gap-y-6">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Company Identity</p>
                  <p className="text-foreground font-bold">{formData.companyName}</p>
                  <p className="text-xs text-muted-foreground">{formData.societyType} • {formData.registerNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Industry & Size</p>
                  <p className="text-foreground font-bold">{formData.industry}</p>
                  <p className="text-xs text-muted-foreground">{formData.companySize} Employees • Est. {formData.foundedYear}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Headquarters</p>
                  <p className="text-foreground font-bold">{formData.city}</p>
                  <p className="text-xs text-muted-foreground">{formData.address}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Primary Contact</p>
                  <p className="text-foreground font-bold">{formData.contactEmail}</p>
                  <p className="text-xs text-muted-foreground">{formData.phone}</p>
                </div>
                <div className="sm:col-span-2 pt-4 border-t border-gold/10">
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-2">Company Website</p>
                  <p className="text-gold font-mono text-sm">{formData.website || 'No website provided'}</p>
                </div>
              </div>

              {formData.isTrainingCompany && (
                <div className="mt-6 p-3 rounded-xl bg-success/10 border border-success/20 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-xs font-bold text-success uppercase tracking-wider">Certified Training Company (Ausbildungsbetrieb)</span>
                </div>
              )}
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  const isPending = userProfile?.verificationStatus === 'pending';
  const isRejected = userProfile?.verificationStatus === 'rejected';
  const isFormVisible = (userProfile?.verificationStatus === 'unverified' || !userProfile?.verificationStatus || isEditing || isRejected) && !isPending;

  const handleRevoke = async () => {
    if (!userProfile?.id) return;
    const confirmed = confirm('Revoke your company verification request to edit your company details?');
    if (!confirmed) return;

    try {
      const { user: updatedUser } = await profilesAPI.updateEmployerProfile(userProfile.id, {
        verificationStatus: 'unverified'
      } as any);

      toast({
        title: 'Request Revoked',
        description: 'You can now edit and resubmit your company profile.'
      });

      setUserProfile(updatedUser);
      setIsEditing(true);
      setCurrentStep(1);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to revoke request.',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="employer">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="employer">
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Pending Review Notice */}
        {isPending && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-xl bg-gold/10 border border-gold/20 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gold animate-pulse" />
              <div className="text-sm">
                <p className="font-bold text-foreground">Company is currently in review</p>
                <p className="text-muted-foreground">You cannot make changes while our team is verifying your company.</p>
              </div>
            </div>
            <button
              onClick={handleRevoke}
              className="px-4 py-2 rounded-lg bg-gold text-navy text-xs font-bold hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Revoke to Edit
            </button>
          </motion.div>
        )}

        <header>
          <h1 className="text-4xl font-display font-bold text-foreground mb-4">
            {isFormVisible ? 'Company Onboarding' : 'Company Profile'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {isFormVisible
              ? 'Complete your profile to start hiring top German talent.'
              : 'View and manage your verified company information.'}
          </p>
        </header>

        {!isFormVisible ? (
          renderSummary()
        ) : (
          <div className="space-y-12">
            {/* Step Progress */}
            <div className="hidden md:block">
              <div className="flex justify-between relative max-w-4xl mx-auto">
                {steps.map((step, idx) => {
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;

                  return (
                    <div key={step.id} className="flex flex-col items-center flex-1 relative z-10">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg",
                        isActive ? "bg-gold text-navy scale-110 shadow-gold/20" :
                          isCompleted ? "bg-success text-white" : "bg-secondary text-muted-foreground opacity-50"
                      )}>
                        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <step.icon className="w-6 h-6" />}
                      </div>
                      <span className={cn(
                        "text-[10px] mt-2 font-bold uppercase tracking-wider transition-colors",
                        isActive ? "text-gold" : "text-muted-foreground"
                      )}>
                        {step.title}
                      </span>

                      {idx < steps.length - 1 && (
                        <div className="absolute top-6 left-1/2 w-full h-[2px] -z-10 bg-secondary" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Content Area */}
            <div className="card-premium p-8 lg:p-12 min-h-[500px] flex flex-col justify-between">
              <div className="mb-8">
                <h1 className="text-2xl font-display font-bold text-foreground mb-2">
                  {steps.find(s => s.id === currentStep)?.title}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {currentStep === 1 && "Start by providing your basic company identity."}
                  {currentStep === 2 && "Help talent understand your company's mission and history."}
                  {currentStep === 3 && "Tell us where you're located and how to reach you."}
                  {currentStep === 4 && "Review your information and submit for verification."}
                </p>
              </div>

              <AnimatePresence mode="wait">
                <div className="flex-1">
                  {renderStep()}
                </div>
              </AnimatePresence>

              <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 1 || submitting}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all",
                    currentStep === 1 ? "opacity-0 pointer-events-none" : "text-muted-foreground hover:bg-secondary"
                  )}
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                {currentStep === steps.length ? (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl btn-gold font-bold shadow-lg shadow-gold/20 hover:shadow-gold/40 transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                          <Clock className="w-4 h-4" />
                        </motion.div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Complete Onboarding <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={!isStepValid(currentStep)}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl btn-gold font-bold shadow-lg shadow-gold/20 hover:shadow-gold/40 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                  >
                    Next Step <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <CustomDialog isOpen={isOpen} onClose={closeDialog} {...options} />
    </DashboardLayout>
  );
};

export default EmployerOnboarding;
