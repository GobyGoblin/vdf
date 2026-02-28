import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Trash2,
    Clock,
    CheckCircle2,
    AlertCircle,
    X,
    Briefcase,
    Target,
    BadgeEuro,
    MapPin,
    Languages,
    Filter,
    ArrowRight,
    Users,
    Eye
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { talentDemandsAPI, authAPI } from '@/lib/api';
import { TalentDemand } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const TalentDemands = () => {
    const [demands, setDemands] = useState<TalentDemand[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [quoteRequests, setQuoteRequests] = useState<any[]>([]);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        sector: '',
        description: '',
        experienceLevel: 'mid' as TalentDemand['experienceLevel'],
        salaryRange: '',
        locationPreference: '',
        requiredSkills: [] as string[],
        languageRequirements: [] as string[],
        urgency: 'medium' as TalentDemand['urgency'],
        employmentType: 'full-time' as TalentDemand['employmentType'],
        remotePreference: 'hybrid' as TalentDemand['remotePreference'],
        duration: '',
        visaSupport: false,
    });

    const [newSkill, setNewSkill] = useState('');
    const [newLanguage, setNewLanguage] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [{ user: userData }, { demands: demandsData }, { requests }] = await Promise.all([
                authAPI.getMe(),
                talentDemandsAPI.getMyDemands(),
                import('@/lib/api').then(m => m.talentPoolAPI.getMyQuoteRequests())
            ]);

            setUser(userData);
            setDemands(demandsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            setQuoteRequests(requests);
        } catch (error) {
            console.error('Failed to load demands:', error);
            toast({ title: 'Error', description: 'Failed to load talent requests.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddSkill = () => {
        if (newSkill.trim() && !formData.requiredSkills.includes(newSkill.trim())) {
            setFormData({ ...formData, requiredSkills: [...formData.requiredSkills, newSkill.trim()] });
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skill: string) => {
        setFormData({ ...formData, requiredSkills: formData.requiredSkills.filter(s => s !== skill) });
    };

    const handleAddLanguage = () => {
        if (newLanguage.trim() && !formData.languageRequirements.includes(newLanguage.trim())) {
            setFormData({ ...formData, languageRequirements: [...formData.languageRequirements, newLanguage.trim()] });
            setNewLanguage('');
        }
    };

    const handleRemoveLanguage = (lang: string) => {
        setFormData({ ...formData, languageRequirements: formData.languageRequirements.filter(l => l !== lang) });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.sector || !formData.description) {
            toast({ title: 'Required Fields', description: 'Please fill in all mandatory fields.', variant: 'destructive' });
            return;
        }

        setSubmitting(true);
        try {
            await talentDemandsAPI.create(formData);
            toast({ title: 'Request Submitted', description: 'Our recruitment team will start searching for matching profiles.' });
            setShowForm(false);
            setFormData({
                title: '',
                sector: '',
                description: '',
                experienceLevel: 'mid',
                salaryRange: '',
                locationPreference: '',
                requiredSkills: [],
                languageRequirements: [],
                urgency: 'medium',
                employmentType: 'full-time',
                remotePreference: 'hybrid',
                duration: '',
                visaSupport: false,
            });
            loadData();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to submit request.', variant: 'destructive' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this talent request?')) return;
        try {
            await talentDemandsAPI.delete(id);
            toast({ title: 'Deleted', description: 'Talent request has been removed.' });
            loadData();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete request.', variant: 'destructive' });
        }
    };

    const handleViewMatches = async (demand: TalentDemand) => {
        if (demand.suggestedCandidateIds && demand.suggestedCandidateIds.length > 0) {
            const idsList = demand.suggestedCandidateIds.join(',');
            navigate(`/employer/talent-pool?ids=${idsList}`);
            toast({
                title: 'Reviewing Matched Profiles',
                description: `Viewing ${demand.suggestedCandidateIds.length} expert(s) curated for "${demand.title}"`,
            });
        } else {
            // Fallback to searching talent pool if no staff-provided profiles yet
            const query = encodeURIComponent(demand.title);
            navigate(`/employer/talent-pool?q=${query}`);
            toast({ title: 'Searching Matches', description: `Finding candidates for "${demand.title}"...` });
        }
    };

    const isVerified = user?.verificationStatus === 'verified';

    return (
        <DashboardLayout role="employer">
            <div className="max-w-6xl mx-auto space-y-8 pb-20">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground">Custom Talent Requests</h1>
                        <p className="text-muted-foreground mt-1 text-lg">Demand specific profiles tailored to your institutional needs.</p>
                    </div>
                    <button
                        onClick={() => isVerified ? setShowForm(true) : toast({ title: 'Verified Status Required', description: 'Please complete your company verification to submit talent demands.' })}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl",
                            isVerified ? "bg-gold text-navy hover:shadow-gold/20" : "bg-secondary text-muted-foreground opacity-50 cursor-not-allowed"
                        )}
                    >
                        <Plus className="w-4 h-4" /> New Talent Demand
                    </button>
                </div>

                {/* Info Banner if unverified */}
                {!isVerified && !loading && (
                    <div className="p-6 rounded-3xl bg-gold/5 border border-gold/20 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold shrink-0">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-foreground">Verification Required</p>
                            <p className="text-sm text-muted-foreground mt-1">To maintain the highest standards of professional matching, custom talent demands are exclusive to verified institutional partners.</p>
                        </div>
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full" />
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {demands.length === 0 ? (
                            <div className="text-center py-24 bg-secondary/20 rounded-[2.5rem] border-2 border-dashed border-border">
                                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                                <h3 className="text-xl font-display font-bold text-foreground">No active demands</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto mt-2">Submit a custom talent request to start a targeted search for specific professional profiles.</p>
                            </div>
                        ) : (
                            demands.map((demand, i) => (
                                <motion.div
                                    key={demand.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="card-premium p-8 group hover:border-gold/30 transition-all border-gold/10"
                                >
                                    <div className="flex flex-col lg:flex-row justify-between gap-8">
                                        <div className="space-y-4 flex-1">
                                            <div className="flex items-center gap-3">
                                                <span className="px-2 py-0.5 rounded-md bg-gold/10 text-gold text-[10px] font-black uppercase tracking-widest border border-gold/20">
                                                    {demand.sector}
                                                </span>
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border",
                                                    demand.status === 'open' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                                        demand.status === 'treating' ? "bg-warning/10 text-warning border-warning/20" :
                                                            demand.status === 'treated' ? "bg-success/10 text-success border-success/20" :
                                                                "bg-muted/10 text-muted-foreground border-muted/20"
                                                )}>
                                                    {demand.status}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-display font-bold text-foreground group-hover:text-gold transition-colors">{demand.title}</h3>
                                                <p className="text-muted-foreground mt-2 line-clamp-2">{demand.description}</p>
                                            </div>

                                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 pt-4 border-t border-border/50">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Experience</p>
                                                    <p className="text-sm font-bold capitalize">{demand.experienceLevel}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Urgency</p>
                                                    <p className={cn(
                                                        "text-sm font-bold capitalize",
                                                        demand.urgency === 'critical' ? "text-destructive" : demand.urgency === 'high' ? "text-gold" : "text-foreground"
                                                    )}>{demand.urgency}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Model / Type</p>
                                                    <p className="text-sm font-bold capitalize">{demand.remotePreference} / {demand.employmentType}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Visa Support</p>
                                                    <p className="text-sm font-bold">{demand.visaSupport ? 'Yes' : 'No'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Matched Profiles</p>
                                                    <p className={cn(
                                                        "text-sm font-bold",
                                                        (demand.suggestedCandidateIds.length + (demand.manualProfiles?.length || 0)) > 0 ? "text-success" : "text-muted-foreground"
                                                    )}>
                                                        {demand.suggestedCandidateIds.length + (demand.manualProfiles?.length || 0)} Provided
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Relative Age</p>
                                                    <p className="text-sm font-bold text-muted-foreground">{formatDistanceToNow(new Date(demand.createdAt), { addSuffix: true })}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-1.5 pt-2">
                                                {demand.requiredSkills.map(skill => (
                                                    <span key={skill} className="px-2 py-0.5 rounded-lg bg-navy/10 text-navy text-[8px] font-bold uppercase">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                            {(demand.suggestedCandidateIds.length > 0 || (demand.manualProfiles?.length || 0) > 0) && (
                                                <div className="mt-8 p-8 rounded-[2.5rem] bg-gold/5 border border-gold/20 space-y-6 shadow-xl shadow-gold/5">
                                                    <div className="flex items-center justify-between border-b border-gold/10 pb-4">
                                                        <div>
                                                            <h4 className="text-sm font-display font-bold text-gold flex items-center gap-2">
                                                                <Users className="w-4 h-4" /> Vetted Candidates Found
                                                            </h4>
                                                            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">Staff curated matches for this custom demand</p>
                                                        </div>
                                                        <Link
                                                            to="/employer/quotes"
                                                            className="px-3 py-1.5 rounded-xl bg-success/10 text-success text-[10px] font-black uppercase tracking-widest border border-success/20 flex items-center gap-2 hover:bg-success hover:text-white transition-all"
                                                        >
                                                            <BadgeEuro className="w-4 h-4" /> View Placement Quote
                                                        </Link>
                                                    </div>
                                                    <div className="flex flex-wrap gap-4">
                                                        {/* DB Profiles */}
                                                        {demand.suggestedCandidateIds.slice(0, 3).map(id => (
                                                            <div key={id} className="flex items-center gap-3 p-2 rounded-xl bg-background border border-border group/profile">
                                                                <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold">
                                                                    {id.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="hidden sm:block">
                                                                    <p className="text-[10px] font-bold text-foreground leading-none">Vetted Expert</p>
                                                                    <p className="text-[8px] text-muted-foreground mt-0.5">ID: {id.slice(-4)}</p>
                                                                </div>
                                                                <Link
                                                                    to={`/employer/talent-pool/${id}`}
                                                                    className="p-1.5 rounded-lg bg-gold/10 text-gold group-hover/profile:bg-gold group-hover/profile:text-navy transition-all"
                                                                >
                                                                    <ArrowRight className="w-3 h-3" />
                                                                </Link>
                                                            </div>
                                                        ))}
                                                        {/* Manual Profiles */}
                                                        {demand.manualProfiles?.slice(0, 3 - demand.suggestedCandidateIds.length).map(p => (
                                                            <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl bg-success/5 border border-success/20 group/profile">
                                                                <div className="w-8 h-8 rounded-full bg-success/10 text-success flex items-center justify-center text-xs font-bold border border-success/20">
                                                                    {p.fullName.charAt(0)}
                                                                </div>
                                                                <div className="hidden sm:block">
                                                                    <p className="text-[10px] font-bold text-foreground leading-none">External Match</p>
                                                                    <p className="text-[8px] text-muted-foreground mt-0.5">{p.fullName.split(' ')[0]}</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleViewMatches(demand)}
                                                                    className="p-1.5 rounded-lg bg-success/10 text-success hover:bg-success hover:text-white transition-all"
                                                                >
                                                                    <ArrowRight className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        {(demand.suggestedCandidateIds.length + (demand.manualProfiles?.length || 0)) > 3 && (
                                                            <button
                                                                onClick={() => handleViewMatches(demand)}
                                                                className="flex items-center justify-center px-4 rounded-xl bg-secondary/50 border border-dashed border-border text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:bg-gold/10 hover:border-gold/30 hover:text-gold transition-all"
                                                            >
                                                                + {(demand.suggestedCandidateIds.length + (demand.manualProfiles?.length || 0)) - 3} More
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-row lg:flex-col justify-end gap-3 shrink-0">
                                            <button
                                                onClick={() => handleDelete(demand.id)}
                                                className="p-3 rounded-xl bg-destructive/5 text-destructive hover:bg-destructive hover:text-white transition-all border border-destructive/20"
                                                title="Cancel Request"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleViewMatches(demand)}
                                                className="p-3 rounded-xl bg-gold/10 text-gold hover:bg-gold hover:text-navy transition-all border border-gold/20"
                                                title="View Matches"
                                            >
                                                <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}

                {/* Modal Form */}
                <AnimatePresence>
                    {showForm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => !submitting && setShowForm(false)}
                                className="absolute inset-0 bg-navy/80 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-3xl bg-background rounded-[2.5rem] p-8 lg:p-12 shadow-2xl overflow-y-auto max-h-[90vh] border border-border"
                            >
                                <button
                                    onClick={() => setShowForm(false)}
                                    disabled={submitting}
                                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-secondary transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="mb-10 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center text-gold mx-auto mb-4 border border-gold/20">
                                        <Target className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-3xl font-display font-bold text-foreground">Custom Talent Demand</h2>
                                    <p className="text-muted-foreground mt-2">Define the ideal profile and our team will provide verified candidates.</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest pl-1">Professional Title / Objective *</label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.title}
                                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                    placeholder="e.g. Senior SAP S/4HANA Consultant"
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-gold outline-none transition-all font-semibold"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest pl-1">Target Sector *</label>
                                            <select
                                                required
                                                value={formData.sector}
                                                onChange={e => setFormData({ ...formData, sector: e.target.value })}
                                                className="w-full px-4 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-gold outline-none transition-all font-semibold appearance-none"
                                            >
                                                <option value="">Select Sector</option>
                                                <option value="IT & Engineering">IT & Engineering</option>
                                                <option value="Healthcare">Healthcare</option>
                                                <option value="Logistics">Logistics</option>
                                                <option value="Green Energy">Green Energy</option>
                                                <option value="Manufacturing">Manufacturing</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest pl-1">Detailed Description & Context *</label>
                                        <textarea
                                            required
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Describe the specific mission, team environment, and why this role is critical..."
                                            rows={4}
                                            className="w-full px-4 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-gold outline-none transition-all font-semibold resize-none"
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest pl-1">Experience Level</label>
                                            <select
                                                value={formData.experienceLevel}
                                                onChange={e => setFormData({ ...formData, experienceLevel: e.target.value as any })}
                                                className="w-full px-4 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-gold outline-none transition-all font-semibold"
                                            >
                                                <option value="junior">Junior (1-3y)</option>
                                                <option value="mid">Mid-Level (3-7y)</option>
                                                <option value="senior">Senior (7-15y)</option>
                                                <option value="lead">Management / Lead (15y+)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest pl-1">Salary Indication (Annual)</label>
                                            <div className="relative">
                                                <BadgeEuro className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    value={formData.salaryRange}
                                                    onChange={e => setFormData({ ...formData, salaryRange: e.target.value })}
                                                    placeholder="e.g. \u20ac80,000 - \u20ac110,000"
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-gold outline-none transition-all font-semibold"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest pl-1">Location / Relocation</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    value={formData.locationPreference}
                                                    onChange={e => setFormData({ ...formData, locationPreference: e.target.value })}
                                                    placeholder="e.g. Frankfurt / Hybrid"
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-gold outline-none transition-all font-semibold"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest pl-1">Mission Urgency</label>
                                            <select
                                                value={formData.urgency}
                                                onChange={e => setFormData({ ...formData, urgency: e.target.value as any })}
                                                className="w-full px-4 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-gold outline-none transition-all font-semibold"
                                            >
                                                <option value="low">Low (Next Quarter)</option>
                                                <option value="medium">Medium (Next Month)</option>
                                                <option value="high">High (ASAP)</option>
                                                <option value="critical">Critical (Immediate Start)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest pl-1">Employment Context</label>
                                            <select
                                                value={formData.employmentType}
                                                onChange={e => setFormData({ ...formData, employmentType: e.target.value as any })}
                                                className="w-full px-4 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-gold outline-none transition-all font-semibold"
                                            >
                                                <option value="full-time">Full-Time (Unlimited)</option>
                                                <option value="part-time">Part-Time</option>
                                                <option value="contract">Project Based (B2B)</option>
                                                <option value="freelance">Freelance</option>
                                            </select>
                                        </div>
                                        {(formData.employmentType === 'contract' || formData.employmentType === 'freelance') ? (
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest pl-1">Project Duration</label>
                                                <input
                                                    type="text"
                                                    value={formData.duration}
                                                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                                    placeholder="e.g. 6-12 Months"
                                                    className="w-full px-4 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-gold outline-none transition-all font-semibold"
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest pl-1">Working Model</label>
                                                <select
                                                    value={formData.remotePreference}
                                                    onChange={e => setFormData({ ...formData, remotePreference: e.target.value as any })}
                                                    className="w-full px-4 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-gold outline-none transition-all font-semibold"
                                                >
                                                    <option value="onsite">100% On-Site</option>
                                                    <option value="hybrid">Hybrid (Remote Option)</option>
                                                    <option value="remote">100% Remote</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    {formData.employmentType !== 'full-time' && (
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest pl-1">Working Model</label>
                                                <select
                                                    value={formData.remotePreference}
                                                    onChange={e => setFormData({ ...formData, remotePreference: e.target.value as any })}
                                                    className="w-full px-4 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-gold outline-none transition-all font-semibold"
                                                >
                                                    <option value="onsite">100% On-Site</option>
                                                    <option value="hybrid">Hybrid (Remote Option)</option>
                                                    <option value="remote">100% Remote</option>
                                                </select>
                                            </div>
                                            <div className="flex items-center gap-4 pt-8">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, visaSupport: !formData.visaSupport })}
                                                    className={cn(
                                                        "w-12 h-6 rounded-full transition-all relative",
                                                        formData.visaSupport ? "bg-gold shadow-[0_0_10px_rgba(255,215,0,0.5)]" : "bg-secondary"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                                                        formData.visaSupport ? "right-1" : "left-1"
                                                    )} />
                                                </button>
                                                <span className="text-sm font-bold text-foreground">Visa & Relocation Support Provided</span>
                                            </div>
                                        </div>
                                    )}

                                    {formData.employmentType === 'full-time' && (
                                        <div className="flex items-center gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, visaSupport: !formData.visaSupport })}
                                                className={cn(
                                                    "w-12 h-6 rounded-full transition-all relative",
                                                    formData.visaSupport ? "bg-gold shadow-[0_0_10px_rgba(255,215,0,0.5)]" : "bg-secondary"
                                                )}
                                            >
                                                <div className={cn(
                                                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                                                    formData.visaSupport ? "right-1" : "left-1"
                                                )} />
                                            </button>
                                            <span className="text-sm font-bold text-foreground">Visa & Relocation Support Provided</span>
                                        </div>
                                    )}

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest pl-1">Critical Technical Skills</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newSkill}
                                                    onChange={e => setNewSkill(e.target.value)}
                                                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                                    placeholder="Add skill..."
                                                    className="flex-1 px-4 py-3 rounded-xl bg-secondary/50 border border-border outline-none transition-all"
                                                />
                                                <button type="button" onClick={handleAddSkill} className="px-4 bg-navy text-white rounded-xl hover:bg-navy/80"><Plus className="w-4 h-4" /></button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.requiredSkills.map(skill => (
                                                    <span key={skill} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy text-white text-[10px] font-black uppercase tracking-widest">
                                                        {skill}
                                                        <button type="button" onClick={() => handleRemoveSkill(skill)}><X className="w-3 h-3" /></button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest pl-1">Linguistic Requirements</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newLanguage}
                                                    onChange={e => setNewLanguage(e.target.value)}
                                                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddLanguage())}
                                                    placeholder="e.g. German (B2)"
                                                    className="flex-1 px-4 py-3 rounded-xl bg-secondary/50 border border-border outline-none transition-all"
                                                />
                                                <button type="button" onClick={handleAddLanguage} className="px-4 bg-navy text-white rounded-xl hover:bg-navy/80"><Plus className="w-4 h-4" /></button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.languageRequirements.map(lang => (
                                                    <span key={lang} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gold/10 text-gold border border-gold/20 text-[10px] font-black uppercase tracking-widest">
                                                        {lang}
                                                        <button type="button" onClick={() => handleRemoveLanguage(lang)}><X className="w-3 h-3" /></button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-6">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full py-5 rounded-[1.5rem] bg-gold text-navy font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-gold/30 hover:shadow-gold/50 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {submitting ? (
                                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full" />
                                            ) : (
                                                <>Submit Institutional Demand <CheckCircle2 className="w-5 h-5" /></>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div >
        </DashboardLayout >
    );
};

export default TalentDemands;
