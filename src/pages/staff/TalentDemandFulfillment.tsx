import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Search,
    Plus,
    CheckCircle2,
    Link as LinkIcon,
    User,
    Target,
    Briefcase,
    Globe,
    AlertCircle,
    X,
    Trash2,
    Users,
    Zap,
    BadgeEuro,
    ChevronRight,
    SearchCode,
    Sparkles
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { talentDemandsAPI, talentPoolAPI } from '@/lib/api';
import { TalentDemand, ManualProfile } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const TalentDemandFulfillment = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [demand, setDemand] = useState<TalentDemand | null>(null);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [linking, setLinking] = useState(false);
    const [fulfillmentMode, setFulfillmentMode] = useState<'pool' | 'manual'>('pool');
    const [manualForm, setManualForm] = useState({
        fullName: '',
        sector: '',
        skills: '',
        experience: '',
        location: '',
        yearsOfExperience: '',
        nationality: '',
        badgeType: 'none' as 'gold' | 'blue' | 'none'
    });
    const [quotedCandidateIds, setQuotedCandidateIds] = useState<string[]>([]);

    useEffect(() => {
        if (id) {
            loadData(id);
        }
    }, [id]);

    const loadData = async (demandId: string) => {
        try {
            setLoading(true);
            const [{ demands }, { candidates: poolData }, { requests }] = await Promise.all([
                talentDemandsAPI.getAll(),
                talentPoolAPI.getCandidates({}),
                import('@/lib/api').then(m => m.staffAPI.getQuoteRequests())
            ]);

            const found = demands.find(d => d.id === demandId);
            if (!found) {
                toast({ title: 'Not Found', description: 'Talent demand does not exist.', variant: 'destructive' });
                navigate('/staff/talent-demands');
                return;
            }
            setDemand(found);
            setCandidates(poolData);

            // Extract IDs of candidates who already have active/approved quotes
            const quotedIds = requests.map((r: any) => r.candidateId);
            setQuotedCandidateIds(quotedIds);
        } catch (error) {
            console.error('Failed to load fulfillment center:', error);
            toast({ title: 'Error', description: 'Failed to load fulfillment data.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (status: TalentDemand['status']) => {
        if (!demand) return;
        try {
            await talentDemandsAPI.updateStatus(demand.id, status);
            setDemand({ ...demand, status });
            toast({ title: 'Status Updated', description: `Demand workflow set to ${status}.` });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
        }
    };

    const handleSuggestCandidate = async (candidateId: string) => {
        if (!demand) return;
        setLinking(true);
        try {
            await talentDemandsAPI.suggestCandidate(demand.id, candidateId);

            // Auto-transition
            let newStatus = demand.status;
            if (demand.status === 'open') {
                await talentDemandsAPI.updateStatus(demand.id, 'treating');
                newStatus = 'treating';
            }

            setDemand({
                ...demand,
                suggestedCandidateIds: [...demand.suggestedCandidateIds, candidateId],
                status: newStatus
            });
            setQuotedCandidateIds(prev => [...prev, candidateId]);

            toast({
                title: 'Fulfillment Linked',
                description: 'Pool candidate added to the manifest. Quote generated.',
            });
        } catch (error) {
            toast({ title: 'Connection Failed', description: 'Could not link this candidate.', variant: 'destructive' });
        } finally {
            setLinking(false);
        }
    };

    const handleManualSuggest = async () => {
        if (!demand || !manualForm.fullName) return;
        setLinking(true);
        try {
            const profile = {
                ...manualForm,
                skills: manualForm.skills.split(',').map(s => s.trim()).filter(Boolean)
            };
            const response = await (talentDemandsAPI as any).addManualProfile(demand.id, profile);

            if (response.success) {
                let newStatus = demand.status;
                if (demand.status === 'open') {
                    await talentDemandsAPI.updateStatus(demand.id, 'treating');
                    newStatus = 'treating';
                }

                setDemand({
                    ...demand,
                    suggestedCandidateIds: [...demand.suggestedCandidateIds, response.profile.id],
                    status: newStatus
                });

                // Add to local candidates list so it shows up as linkable/linked
                setCandidates(prev => [...prev, response.profile]);
                setFulfillmentMode('pool');

                toast({
                    title: 'Strategic Injection Successful',
                    description: 'Candidate added to global pool and linked to this demand manifest.',
                });

                // Reset form with all properties to satisfy TypeScript
                setManualForm({
                    fullName: '',
                    sector: '',
                    skills: '',
                    experience: '',
                    location: '',
                    yearsOfExperience: '',
                    nationality: '',
                    badgeType: 'none'
                });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to add manual profile.', variant: 'destructive' });
        } finally {
            setLinking(false);
        }
    };

    const filteredCandidates = candidates.filter(c => {
        const fullText = `${c.firstName} ${c.lastName} ${c.sector} ${c.skills?.join(' ')}`.toLowerCase();
        return fullText.includes(searchQuery.toLowerCase());
    });

    if (loading) {
        return (
            <DashboardLayout role="staff">
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full" />
                    <p className="text-muted-foreground font-display animate-pulse">Initializing Fulfillment Command Center...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!demand) return null;

    const linkedCount = demand.suggestedCandidateIds.length + (demand.manualProfiles?.length || 0);

    return (
        <DashboardLayout role="staff">
            <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
                {/* Unified Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <Link to="/staff/talent-demands" className="inline-flex items-center gap-2 text-gold hover:text-gold/80 font-black uppercase tracking-[0.2em] text-[10px] transition-all">
                            <ArrowLeft className="w-3 h-3" /> Back to Quotas
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 rounded-full bg-gold/10 text-gold text-[10px] font-black uppercase tracking-widest border border-gold/20">
                                    Fulfillment Center
                                </span>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                    demand.status === 'open' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                        demand.status === 'treating' ? "bg-warning/10 text-warning border-warning/20" :
                                            demand.status === 'treated' ? "bg-success/10 text-success border-success/20" :
                                                "bg-muted/10 text-muted-foreground border-muted/20"
                                )}>
                                    {demand.status}
                                </span>
                            </div>
                            <h1 className="text-4xl font-display font-bold text-foreground">Fulfilling: {demand.title}</h1>
                            <p className="text-muted-foreground mt-2 max-w-2xl text-lg">{demand.description}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Estimated Manifest Value</p>
                            <p className="text-2xl font-display font-bold text-success">€{(linkedCount * 12500).toLocaleString()}<span className="text-sm font-normal opacity-60 ml-1">avg.</span></p>
                        </div>
                        <div className="h-12 w-px bg-border/50 mx-2 hidden md:block" />
                        <button className="px-6 py-3 rounded-2xl bg-gold text-navy font-black uppercase tracking-widest text-xs shadow-xl shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
                            Finalize Bundle <Zap className="w-4 h-4 fill-current" />
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    {/* Left Sidebar: Control & Requirements */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="card-premium p-6 space-y-6">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                    <Target className="w-3 h-3" /> Demand DNA
                                </h3>
                                <div className="space-y-3">
                                    <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                                        <p className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.15em] mb-1">Industry Sector</p>
                                        <p className="font-bold text-foreground">{demand.sector}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                                        <p className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.15em] mb-1">Target Persona</p>
                                        <p className="font-bold text-foreground">{demand.title}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                                        <p className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.15em] mb-1">Requested Skills</p>
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {demand.requiredSkills.map(skill => (
                                                <span key={skill} className="px-2 py-0.5 rounded bg-navy text-white text-[9px] font-bold uppercase">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                    <Briefcase className="w-3 h-3" /> Management
                                </h3>
                                <div className="space-y-3">
                                    <label className="block text-[9px] text-muted-foreground uppercase font-black tracking-[0.15em] ml-1">Workflow Stage</label>
                                    <select
                                        value={demand.status}
                                        onChange={(e) => handleUpdateStatus(e.target.value as any)}
                                        className="w-full bg-secondary/50 border border-border p-3 rounded-xl font-bold text-sm outline-none focus:border-gold/50 cursor-pointer"
                                    >
                                        <option value="open">Open - Pending Fulfillment</option>
                                        <option value="treating">Treating - Curating Matches</option>
                                        <option value="treated">Treated - Manifest Shared</option>
                                        <option value="cancelled">Cancelled - Inactive</option>
                                    </select>
                                    <p className="text-[9px] text-success font-bold flex items-center gap-1.5 ml-1 pt-2">
                                        <CheckCircle2 className="w-3 h-3" /> Auto-quoting active for this demand
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card-premium p-6 border-gold/10 bg-gold/[0.02]">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold border border-gold/20">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Employer ID</p>
                                    <p className="font-bold text-foreground">{demand.employerId.toUpperCase()}</p>
                                </div>
                            </div>
                            <button className="w-full py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-[10px] font-black uppercase tracking-widest transition-all">
                                Open Employer Profile
                            </button>
                        </div>
                    </div>

                    {/* Center: Fulfillment Engine */}
                    <div className="lg:col-span-6 space-y-6">
                        <div className="card-premium p-8 bg-background relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-[0.03]">
                                <Sparkles className="w-32 h-32 text-gold" />
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                <h2 className="text-2xl font-display font-bold">Fulfillment Engine</h2>
                                <div className="flex gap-1 p-1 rounded-xl bg-secondary/50 border border-border w-fit">
                                    <button
                                        onClick={() => setFulfillmentMode('pool')}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                            fulfillmentMode === 'pool' ? "bg-navy text-white shadow-lg" : "text-muted-foreground hover:bg-secondary/80"
                                        )}
                                    >
                                        <SearchCode className="w-3 h-3" /> Pool Match
                                    </button>
                                    <button
                                        onClick={() => setFulfillmentMode('manual')}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                            fulfillmentMode === 'manual' ? "bg-navy text-white shadow-lg" : "text-muted-foreground hover:bg-secondary/80"
                                        )}
                                    >
                                        <Sparkles className="w-3 h-3" /> External Injection
                                    </button>
                                </div>
                            </div>

                            {fulfillmentMode === 'pool' ? (
                                <div className="space-y-6">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Search verified talent pool by name, skills, or role..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-secondary/30 border border-border outline-none text-base focus:border-gold/50 focus:bg-secondary/50 transition-all font-medium"
                                        />
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                        {filteredCandidates.map(candidate => {
                                            const isLinked = demand.suggestedCandidateIds.includes(candidate.id);
                                            const isAlreadyQuoted = quotedCandidateIds.includes(candidate.id) && !isLinked;

                                            return (
                                                <motion.div
                                                    layout
                                                    key={candidate.id}
                                                    className={cn(
                                                        "p-4 rounded-2xl border transition-all group",
                                                        isLinked ? "bg-success/5 border-success/20 opacity-70" :
                                                            isAlreadyQuoted ? "bg-secondary/20 border-border opacity-60" :
                                                                "bg-background border-border hover:border-gold/30 hover:shadow-lg"
                                                    )}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center text-sm font-bold shadow-inner">
                                                                {candidate.firstName.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-foreground">{candidate.firstName} {candidate.lastName}</p>
                                                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">{candidate.sector}</p>
                                                            </div>
                                                        </div>
                                                        {isAlreadyQuoted ? (
                                                            <div className="px-2 py-1 rounded bg-secondary text-muted-foreground text-[8px] font-black uppercase tracking-widest border border-border">
                                                                Quoted
                                                            </div>
                                                        ) : (
                                                            <button
                                                                disabled={isLinked || linking}
                                                                onClick={() => handleSuggestCandidate(candidate.id)}
                                                                className={cn(
                                                                    "p-2 rounded-xl transition-all",
                                                                    isLinked ? "text-success bg-success/10" : "text-gold bg-gold/10 hover:bg-gold hover:text-navy"
                                                                )}
                                                            >
                                                                {isLinked ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="mt-4 flex flex-wrap gap-1">
                                                        {candidate.skills?.slice(0, 3).map((s: string) => (
                                                            <span key={s} className="px-1.5 py-0.5 rounded bg-secondary text-muted-foreground text-[8px] font-bold uppercase">{s}</span>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="p-4 rounded-2xl bg-gold/5 border border-gold/20 flex gap-3">
                                        <Sparkles className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gold mb-1">External Injection Mode</p>
                                            <p className="text-xs text-muted-foreground">Use this to add candidates scouted from external platforms (LinkedIn, Headhunters) directly to this demand.</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Candidate Full Name</label>
                                            <input
                                                value={manualForm.fullName}
                                                onChange={e => setManualForm({ ...manualForm, fullName: e.target.value })}
                                                placeholder="e.g. Thomas Müller"
                                                className="w-full p-4 rounded-xl bg-secondary/30 border border-border outline-none focus:border-gold/50 font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Professional Focus</label>
                                            <input
                                                value={manualForm.sector}
                                                onChange={e => setManualForm({ ...manualForm, sector: e.target.value })}
                                                placeholder="e.g. Cloud Security Architect"
                                                className="w-full p-4 rounded-xl bg-secondary/30 border border-border outline-none focus:border-gold/50 font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Location / Availability</label>
                                            <input
                                                value={manualForm.location}
                                                onChange={e => setManualForm({ ...manualForm, location: e.target.value })}
                                                placeholder="e.g. Berlin (Hybrid)"
                                                className="w-full p-4 rounded-xl bg-secondary/30 border border-border outline-none focus:border-gold/50 font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Experience Level</label>
                                            <input
                                                value={manualForm.yearsOfExperience}
                                                onChange={e => setManualForm({ ...manualForm, yearsOfExperience: e.target.value })}
                                                placeholder="e.g. 10+ Years"
                                                className="w-full p-4 rounded-xl bg-secondary/30 border border-border outline-none focus:border-gold/50 font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nationality / Visa Status</label>
                                            <input
                                                value={manualForm.nationality}
                                                onChange={e => setManualForm({ ...manualForm, nationality: e.target.value })}
                                                placeholder="e.g. Brazilian (Requires Blue Card)"
                                                className="w-full p-4 rounded-xl bg-secondary/30 border border-border outline-none focus:border-gold/50 font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Assignment Tier</label>
                                            <select
                                                value={manualForm.badgeType}
                                                onChange={e => setManualForm({ ...manualForm, badgeType: e.target.value as any })}
                                                className="w-full p-4 rounded-xl bg-secondary/30 border border-border outline-none focus:border-gold/50 font-bold appearance-none"
                                            >
                                                <option value="none">Standard Placement</option>
                                                <option value="blue">Verified Blue Badge</option>
                                                <option value="gold">Premium Gold Tier</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Technical Stack (Comma Separated)</label>
                                            <input
                                                value={manualForm.skills}
                                                onChange={e => setManualForm({ ...manualForm, skills: e.target.value })}
                                                placeholder="e.g. Docker, Python, Go, Cybersecurity"
                                                className="w-full p-4 rounded-xl bg-secondary/30 border border-border outline-none focus:border-gold/50 font-bold"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Vetting Synopsis</label>
                                            <textarea
                                                rows={3}
                                                value={manualForm.experience}
                                                onChange={e => setManualForm({ ...manualForm, experience: e.target.value })}
                                                placeholder="Summarize why this external candidate is a match for the target persona..."
                                                className="w-full p-4 rounded-xl bg-secondary/30 border border-border outline-none focus:border-gold/50 resize-none font-bold"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        disabled={linking || !manualForm.fullName}
                                        onClick={handleManualSuggest}
                                        className="w-full py-5 rounded-2xl bg-gold text-navy font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-gold/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {linking ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full" /> : <Plus className="w-5 h-5" />}
                                        Inject into Manifest
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar: The Manifest */}
                    <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Proposed Manifest</h2>
                            <span className="text-[10px] font-black bg-success/10 text-success px-2 py-0.5 rounded-md border border-success/20">
                                {linkedCount} Candidates
                            </span>
                        </div>

                        <div className="space-y-4 max-h-[calc(100vh-350px)] overflow-y-auto pr-2 custom-scrollbar">
                            <AnimatePresence mode="popLayout">
                                {/* Pool Match Cards */}
                                {demand.suggestedCandidateIds.map(id => {
                                    const c = candidates.find(cand => cand.id === id);
                                    if (!c) return null;
                                    return (
                                        <motion.div
                                            key={id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="p-4 rounded-xl bg-secondary/20 border border-border group relative overflow-hidden"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center text-xs font-bold">
                                                    {c.firstName.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-foreground truncate">{c.firstName} {c.lastName}</p>
                                                    <p className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter">
                                                        {c.id.startsWith('ext-') ? 'Injected Match' : 'Pool Candidate'}
                                                    </p>
                                                </div>
                                                <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="mt-3 flex items-center justify-between">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[8px] font-bold text-success flex items-center gap-1">
                                                        <BadgeEuro className="w-3 h-3" /> Quote Active
                                                    </span>
                                                    <span className="text-[7px] font-black text-gold uppercase tracking-widest bg-gold/5 px-1 rounded">
                                                        Multi-tier Options Gen
                                                    </span>
                                                </div>
                                                <LinkIcon className="w-3 h-3 text-gold opacity-50" />
                                            </div>
                                        </motion.div>
                                    );
                                })}

                                {/* Manual Cards */}
                                {demand.manualProfiles?.map(p => (
                                    <motion.div
                                        key={p.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="p-4 rounded-xl bg-success/[0.03] border border-success/20 group relative overflow-hidden"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-success text-white flex items-center justify-center text-xs font-bold">
                                                {p.fullName.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-foreground truncate">{p.fullName}</p>
                                                <p className="text-[9px] text-success uppercase font-black tracking-tighter">External Injected</p>
                                            </div>
                                            <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-[8px] font-bold text-success flex items-center gap-1">
                                                <BadgeEuro className="w-3 h-3" /> Quote Active
                                            </span>
                                            <Globe className="w-3 h-3 text-success opacity-50" />
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {linkedCount === 0 && (
                                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 opacity-30 border-2 border-dashed border-border rounded-2xl">
                                    <Users className="w-8 h-8" />
                                    <p className="text-[10px] uppercase font-black tracking-widest leading-relaxed">No candidates linked<br />to this manifest yet</p>
                                </div>
                            )}
                        </div>

                        {linkedCount > 0 && (
                            <div className="p-6 rounded-2xl bg-navy text-white space-y-4 shadow-xl shadow-navy/20">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Total Yield</p>
                                    <p className="text-xl font-display font-bold text-gold">€{(linkedCount * 12500).toLocaleString()}</p>
                                </div>
                                <p className="text-[9px] opacity-60 italic leading-relaxed">This estimate includes standard placement fees, visa processing, and relocation support per candidate.</p>
                                <button className="w-full py-3 rounded-xl bg-gold text-navy font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all">
                                    Export Manifest
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TalentDemandFulfillment;
