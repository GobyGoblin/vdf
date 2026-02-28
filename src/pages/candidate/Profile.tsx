import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Phone,
  Briefcase,
  GraduationCap,
  Languages,
  Save,
  Plus,
  Loader2,
  Shield,
  Clock,
  RotateCcw,
  Globe,
  Calendar,
  BadgeEuro,
  XCircle
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { authAPI, profilesAPI } from '@/lib/api';
import { User as UserType } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { useCustomDialog } from '@/hooks/use-custom-dialog';
import { cn } from '@/lib/utils';

const CandidateProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { isOpen, options, showDialog, closeDialog } = useCustomDialog();
  const [searchParams] = useSearchParams();
  const missing = searchParams.get('missing')?.split(',') || [];
  const [profile, setProfile] = useState<Partial<UserType>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    headline: '',
    bio: '',
    experience: [],
    education: [],
    skills: [],
    languages: [],
    nationality: '',
    birthDate: '',
    yearsOfExperience: '',
    sector: '',
    salaryExpectation: ''
  });

  const [newExp, setNewExp] = useState({ title: '', company: '', startDate: '', endDate: '', description: '' });
  const [newEdu, setNewEdu] = useState({ degree: '', institution: '', date: '', description: '' });
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (!loading && missing.length > 0) {
      const scrollTimeout = setTimeout(() => {
        const firstMissing = missing[0];
        const element = document.getElementById(firstMissing);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
      return () => clearTimeout(scrollTimeout);
    }
  }, [loading, missing.length]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { user } = await authAPI.getMe();
      setProfile({
        ...user,
        experience: user.experience || [],
        education: user.education || [],
        skills: user.skills || [],
        languages: user.languages || []
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (profile.id) {
        await profilesAPI.updateCandidateProfile(profile.id, profile);
        showDialog({
          title: 'Success!',
          description: 'Your profile has been updated successfully.',
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      showDialog({
        title: 'Update Failed',
        description: 'There was an error updating your profile. Please try again.',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="candidate">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </DashboardLayout>
    );
  }

  const isPending = profile?.verificationStatus === 'pending';

  const handleRevoke = async () => {
    if (!profile.id) return;
    const confirmed = confirm('Revoke your verification request to edit your profile?');
    if (!confirmed) return;

    try {
      await profilesAPI.updateCandidateProfile(profile.id, { verificationStatus: 'unverified' } as any);
      toast({ title: 'Request Revoked', description: 'You can now edit and resubmit your profile.' });
      loadProfile();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to revoke request.', variant: 'destructive' });
    }
  };

  const formatDateString = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('de-DE', { month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <DashboardLayout role="candidate">
      <div className="space-y-8">
        {/* Pending Review Notice */}
        {isPending && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-gold/10 border border-gold/20 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gold animate-pulse" />
              <div className="text-sm">
                <p className="font-bold text-foreground">Profile is currently in review</p>
                <p className="text-muted-foreground">You cannot make changes while our team is verifying your profile.</p>
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

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-display font-bold text-foreground">My Profile</h1>
              {profile.isVerified ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-bold uppercase tracking-wider">
                  <Shield className="w-3.5 h-3.5" />
                  Verified
                </span>
              ) : isPending ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/10 text-warning text-xs font-bold uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  In Review
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  Unverified
                </span>
              )}
            </div>
            <p className="text-muted-foreground">Manage your professional CV information</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || isPending}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gold text-navy font-bold hover:shadow-lg hover:shadow-gold/20 transition-all disabled:opacity-50 disabled:grayscale shadow-md"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Essential Information */}
            <motion.div
              id="firstName"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "card-premium p-8 transition-all duration-500",
                (missing.includes('firstName') || missing.includes('lastName') || missing.includes('headline')) && "ring-2 ring-destructive animate-pulse-slow"
              )}
            >
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="w-24 h-24 rounded-3xl bg-secondary flex items-center justify-center flex-shrink-0 shadow-inner border border-border/50">
                  <User className="w-12 h-12 text-muted-foreground" />
                </div>
                <div className="flex-1 w-full space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">First Name <span className="text-destructive">*</span></label>
                      <input
                        type="text"
                        value={profile.firstName || ''}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        className="input-premium"
                        disabled={isPending}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Last Name <span className="text-destructive">*</span></label>
                      <input
                        type="text"
                        value={profile.lastName || ''}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        className="input-premium"
                        disabled={isPending}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Professional Headline <span className="text-destructive">*</span></label>
                    <input
                      type="text"
                      value={profile.headline || ''}
                      onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                      className="input-premium"
                      placeholder="e.g. Senior Frontend Developer | React Specialist"
                      disabled={isPending}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Profile Statistics/Summary */}
            <motion.div
              id="bio"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={cn(
                "card-premium p-8 transition-all duration-500",
                (missing.includes('bio') || missing.includes('nationality') || missing.includes('sector') || missing.includes('yearsOfExperience') || missing.includes('salaryExpectation')) && "ring-2 ring-destructive animate-pulse-slow"
              )}
            >
              <h2 className="text-lg font-display font-semibold text-foreground mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-gold" />
                Professional Summary & Details <span className="text-destructive">*</span>
              </h2>
              <div className="space-y-6">
                <div>
                  <textarea
                    rows={4}
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="input-premium resize-none"
                    placeholder="Briefly describe your professional background, key achievements, and what you're looking for..."
                    disabled={isPending}
                  />
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Globe className="w-3 h-3" /> Nationality *</label>
                    <input
                      type="text"
                      value={profile.nationality || ''}
                      onChange={(e) => setProfile({ ...profile, nationality: e.target.value })}
                      className="input-premium"
                      placeholder="e.g. German"
                      disabled={isPending}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Date of Birth *</label>
                    <input
                      type="date"
                      value={profile.birthDate || ''}
                      onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })}
                      className="input-premium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Briefcase className="w-3 h-3" /> Sector *</label>
                    <select
                      value={profile.sector || ''}
                      onChange={(e) => setProfile({ ...profile, sector: e.target.value })}
                      className="input-premium"
                      disabled={isPending}
                    >
                      <option value="">Select Sector</option>
                      <option value="IT">Information Technology</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Logistics">Logistics</option>
                      <option value="Construction">Construction</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Exp. Years *</label>
                    <input
                      type="text"
                      value={profile.yearsOfExperience || ''}
                      onChange={(e) => setProfile({ ...profile, yearsOfExperience: e.target.value })}
                      className="input-premium"
                      placeholder="e.g. 5"
                      disabled={isPending}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><BadgeEuro className="w-3 h-3" /> Salary Exp. *</label>
                    <input
                      type="text"
                      value={profile.salaryExpectation || ''}
                      onChange={(e) => setProfile({ ...profile, salaryExpectation: e.target.value })}
                      className="input-premium"
                      placeholder="e.g. 60,000"
                      disabled={isPending}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Experience Section */}
            <motion.div
              id="experience"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={cn(
                "card-premium p-8 transition-all duration-500",
                missing.includes('experience') && "ring-2 ring-destructive animate-pulse-slow"
              )}
            >
              <h2 className="text-lg font-display font-semibold text-foreground mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-gold" />
                Work Experience <span className="text-destructive">*</span>
              </h2>

              {!isPending && (
                <div className="space-y-4 mb-8 bg-secondary/30 p-4 rounded-2xl border border-dashed border-border">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      placeholder="Job Title"
                      value={newExp.title}
                      onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                      className="input-premium py-2 text-sm"
                    />
                    <input
                      placeholder="Company"
                      value={newExp.company}
                      onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                      className="input-premium py-2 text-sm"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase pl-1">From</label>
                      <input
                        type="date"
                        value={newExp.startDate}
                        onChange={(e) => setNewExp({ ...newExp, startDate: e.target.value })}
                        className="input-premium py-2 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase pl-1">To</label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={newExp.endDate}
                          onChange={(e) => setNewExp({ ...newExp, endDate: e.target.value })}
                          className="input-premium py-2 text-sm flex-1"
                        />
                        <button
                          onClick={() => {
                            if (newExp.title && newExp.company && newExp.startDate) {
                              const periodString = `${formatDateString(newExp.startDate)} - ${newExp.endDate ? formatDateString(newExp.endDate) : 'Present'}`;
                              setProfile(prev => ({
                                ...prev,
                                experience: [{ id: Date.now(), ...newExp, period: periodString }, ...(prev.experience || [])]
                              }));
                              setNewExp({ title: '', company: '', startDate: '', endDate: '', description: '' });
                            }
                          }}
                          className="w-10 h-10 rounded-xl bg-gold text-navy flex items-center justify-center hover:scale-105 transition-all shadow-md mt-auto"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <input
                    placeholder="Brief description of your role (optional)"
                    value={newExp.description}
                    onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                    className="input-premium py-2 text-sm w-full"
                  />
                </div>
              )}

              <div className="space-y-6">
                {profile.experience?.map((exp, index) => (
                  <div key={exp.id || index} className="group relative pl-6 border-l-2 border-border ml-2">
                    <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-gold border-2 border-background" />
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-black text-gold uppercase tracking-widest">{exp.period}</p>
                        <h4 className="font-bold text-foreground">{exp.title}</h4>
                        <p className="text-xs font-semibold text-muted-foreground">{exp.company}</p>
                        {exp.description && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{exp.description}</p>}
                      </div>
                      {!isPending && (
                        <button
                          onClick={() => setProfile(prev => ({ ...prev, experience: prev.experience?.filter((_, i) => i !== index) }))}
                          className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Education Section */}
            <motion.div
              id="education"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={cn(
                "card-premium p-8 transition-all duration-500",
                missing.includes('education') && "ring-2 ring-destructive animate-pulse-slow"
              )}
            >
              <h2 className="text-lg font-display font-semibold text-foreground mb-6 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-gold" />
                Education <span className="text-destructive">*</span>
              </h2>

              {!isPending && (
                <div className="space-y-4 mb-8 bg-secondary/30 p-4 rounded-2xl border border-dashed border-border">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      placeholder="Degree / Major"
                      value={newEdu.degree}
                      onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                      className="input-premium py-2 text-sm"
                    />
                    <input
                      placeholder="Institution"
                      value={newEdu.institution}
                      onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })}
                      className="input-premium py-2 text-sm"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase pl-1">Graduation Date</label>
                      <input
                        type="date"
                        value={newEdu.date}
                        onChange={(e) => setNewEdu({ ...newEdu, date: e.target.value })}
                        className="input-premium py-2 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase pl-1">Specialization (optional)</label>
                      <div className="flex gap-2">
                        <input
                          placeholder="e.g. Artificial Intelligence"
                          value={newEdu.description}
                          onChange={(e) => setNewEdu({ ...newEdu, description: e.target.value })}
                          className="input-premium py-2 text-sm flex-1"
                        />
                        <button
                          onClick={() => {
                            if (newEdu.degree && newEdu.institution && newEdu.date) {
                              setProfile(prev => ({
                                ...prev,
                                education: [{ id: Date.now(), ...newEdu, year: formatDateString(newEdu.date) }, ...(prev.education || [])]
                              }));
                              setNewEdu({ degree: '', institution: '', date: '', description: '' });
                            }
                          }}
                          className="w-10 h-10 rounded-xl bg-gold text-navy flex items-center justify-center hover:scale-105 transition-all shadow-md"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {profile.education?.map((edu, index) => (
                  <div key={edu.id || index} className="group relative pl-6 border-l-2 border-border ml-2">
                    <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-gold border-2 border-background" />
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-black text-gold uppercase tracking-widest">{edu.year}</p>
                        <h4 className="font-bold text-foreground">{edu.degree}</h4>
                        <p className="text-xs font-semibold text-muted-foreground">{edu.institution}</p>
                        {edu.description && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{edu.description}</p>}
                      </div>
                      {!isPending && (
                        <button
                          onClick={() => setProfile(prev => ({ ...prev, education: prev.education?.filter((_, i) => i !== index) }))}
                          className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="space-y-8">
            {/* Contact Info */}
            <motion.div
              id="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "card-premium p-6 transition-all duration-500",
                (missing.includes('phone') || missing.includes('location')) && "ring-2 ring-destructive animate-pulse-slow"
              )}
            >
              <h2 className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
                <Phone className="w-4 h-4" /> Contact
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Email</label>
                  <input type="email" value={profile.email || ''} readOnly className="input-premium opacity-60 bg-secondary/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="input-premium"
                    disabled={isPending}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Location *</label>
                  <input
                    type="text"
                    value={profile.location || ''}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="input-premium"
                    placeholder="e.g. Berlin, Germany"
                    disabled={isPending}
                  />
                </div>
              </div>
            </motion.div>

            {/* Skills */}
            <motion.div
              id="skills"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={cn(
                "card-premium p-6 transition-all duration-500",
                missing.includes('skills') && "ring-2 ring-destructive animate-pulse-slow"
              )}
            >
              <h2 className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                Skills *
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.skills?.map((skill, index) => (
                  <span key={index} className="px-3 py-1 rounded-lg bg-gold/10 text-gold text-xs font-bold border border-gold/20 flex items-center gap-2 group">
                    {skill}
                    <button
                      onClick={() => setProfile(prev => ({ ...prev, skills: prev.skills?.filter((_, i) => i !== index) }))}
                      className="hover:text-foreground opacity-50 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {!isPending && (
                <div className="flex gap-2">
                  <input
                    placeholder="Add skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newSkill) {
                        setProfile(prev => ({ ...prev, skills: [...(prev.skills || []), newSkill] }));
                        setNewSkill('');
                      }
                    }}
                    className="input-premium py-2 text-xs flex-1"
                  />
                  <button
                    onClick={() => {
                      if (newSkill) {
                        setProfile(prev => ({ ...prev, skills: [...(prev.skills || []), newSkill] }));
                        setNewSkill('');
                      }
                    }}
                    className="w-10 h-10 rounded-xl bg-gold text-navy flex items-center justify-center hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>

            {/* Languages */}
            <motion.div
              id="languages"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={cn(
                "card-premium p-6 transition-all duration-500",
                missing.includes('languages') && "ring-2 ring-destructive animate-pulse-slow"
              )}
            >
              <h2 className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                <Languages className="w-4 h-4" /> Languages *
              </h2>
              <div className="space-y-2 mb-4">
                {profile.languages?.map((lang, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 text-xs font-bold group">
                    {lang}
                    <button
                      onClick={() => setProfile(prev => ({ ...prev, languages: prev.languages?.filter((_, i) => i !== index) }))}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              {!isPending && (
                <div className="flex gap-2">
                  <input
                    placeholder="e.g. German B2"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newLanguage) {
                        setProfile(prev => ({ ...prev, languages: [...(prev.languages || []), newLanguage] }));
                        setNewLanguage('');
                      }
                    }}
                    className="input-premium py-2 text-xs flex-1"
                  />
                  <button
                    onClick={() => {
                      if (newLanguage) {
                        setProfile(prev => ({ ...prev, languages: [...(prev.languages || []), newLanguage] }));
                        setNewLanguage('');
                      }
                    }}
                    className="w-10 h-10 rounded-xl bg-gold text-navy flex items-center justify-center hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      <CustomDialog isOpen={isOpen} onClose={closeDialog} {...options} />
    </DashboardLayout>
  );
};

export default CandidateProfile;
