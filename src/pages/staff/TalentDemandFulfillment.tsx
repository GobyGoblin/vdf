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
    Sparkles,
    Pencil,
    Check
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { talentDemandsAPI, talentPoolAPI } from '@/lib/api';
import { TalentDemand, ManualProfile } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatYears, formatCurrency, parseYears, parseCurrency } from '@/lib/formatters';
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
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        linkedIn: '',
        sector: '',
        skills: '',
        experience: '',
        location: '',
        yearsOfExperience: '',
        nationality: '',
        badgeType: 'none' as 'gold' | 'blue' | 'none'
    });
    const [candidateQuotes, setCandidateQuotes] = useState<Record<string, string>>({});
    const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
    const [finalizing, setFinalizing] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

            // Extract IDs and quote values of candidates who already have active/approved quotes for this demand
            const demandQuotes = requests.filter((r: any) => r.employerId === found.employerId && r.status === 'approved');
            const quotedIds = demandQuotes.map((r: any) => r.candidateId);
            const quotesMap: Record<string, string> = {};
            demandQuotes.forEach((r: any) => {
                quotesMap[r.candidateId] = Math.max(
                    ...r.options.map((o: any) => parseCurrency(o.costEstimate) || 0)
                ).toLocaleString('en-EU', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
            });
            
            setCandidateQuotes(quotesMap);
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

    const handleUpdateCandidateQuote = async (candidateId: string) => {
        if (!demand) return;
        try {
            const rawValue = candidateQuotes[candidateId];
            const parsedValue = parseCurrency(rawValue);
            const formattedValue = parsedValue ? formatCurrency(rawValue) : rawValue;
            
            await talentDemandsAPI.updateCandidateQuote(demand.id, candidateId, formattedValue);
            setCandidateQuotes(prev => ({ ...prev, [candidateId]: formattedValue }));
            setEditingQuoteId(null);
            toast({ title: 'Quote updated', description: 'The custom quote for this profile has been saved.' });
        } catch (error) {
            toast({ title: 'Error', description: 'Could not attach custom quote.', variant: 'destructive' });
        }
    };

    const handleManualSuggest = async () => {
        if (!demand) return;

        // Validate — all fields required except LinkedIn
        const errors: Record<string, string> = {};
        if (!manualForm.firstName.trim()) errors.firstName = 'First Name is required.';
        if (!manualForm.lastName.trim()) errors.lastName = 'Last Name is required.';
        if (!manualForm.email.trim()) errors.email = 'Email is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(manualForm.email)) errors.email = 'Enter a valid email address.';
        if (!manualForm.phone.trim()) errors.phone = 'Phone number is required.';
        else if (!/^[+\d\s()\-]{6,20}$/.test(manualForm.phone)) errors.phone = 'Enter a valid phone number.';
        if (!manualForm.sector.trim()) errors.sector = 'Professional Focus is required.';
        if (!manualForm.location.trim()) errors.location = 'Location is required.';
        if (!manualForm.yearsOfExperience.trim()) errors.yearsOfExperience = 'Experience Level is required.';
        if (!manualForm.skills.trim()) errors.skills = 'Technical Stack is required.';
        if (!manualForm.nationality.trim()) errors.nationality = 'Nationality is required.';
        if (!manualForm.badgeType || manualForm.badgeType === 'none') errors.badgeType = 'Assignment Tier is required.';
        if (!manualForm.experience.trim()) errors.experience = 'Vetting Synopsis is required.';
        if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
        setFormErrors({});

        setLinking(true);
        try {
            const profile = {
                ...manualForm,
                email: manualForm.email || undefined,
                phone: manualForm.phone || undefined,
                linkedIn: manualForm.linkedIn || undefined,
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

                // Reset form with all properties to satisfy TypeScript
                setManualForm({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    linkedIn: '',
                    sector: '',
                    skills: '',
                    experience: '',
                    location: '',
                    yearsOfExperience: '',
                    nationality: '',
                    badgeType: 'none'
                });
            }
        } catch (error: any) {
            const msg = error?.response?.data?.error || 'Failed to add manual profile.';
            // Try to surface field-level errors if backend hints at them
            if (msg.toLowerCase().includes('email')) setFormErrors(e => ({ ...e, email: msg }));
            else toast({ title: 'Error', description: msg, variant: 'destructive' });
        } finally {
            setLinking(false);
        }
    };

    const handleFinalize = async () => {
        if (!demand) return;
        if (demand.suggestedCandidateIds.length === 0) {
            toast({ title: 'Empty Manifest', description: 'Add at least one candidate before finalizing.', variant: 'destructive' });
            return;
        }
        if (!confirm('Finalize this talent bundle? The demand will be marked as Treated and sent to the employer.')) return;
        setFinalizing(true);
        try {
            await talentDemandsAPI.finalize(demand.id);
            setDemand({ ...demand, status: 'treated' });
            toast({ title: 'Bundle Finalized!', description: 'Demand marked as Treated. Employer can now view matched candidates.' });
        } catch (err: any) {
            toast({ title: 'Error', description: err.response?.data?.error || 'Failed to finalize.', variant: 'destructive' });
        } finally {
            setFinalizing(false);
        }
    };

    const handleRemoveCandidate = async (candidateId: string) => {
        if (!demand) return;
        try {
            await talentDemandsAPI.removeCandidate(demand.id, candidateId);
            setDemand({ ...demand, suggestedCandidateIds: demand.suggestedCandidateIds.filter(id => id !== candidateId) });
            toast({ title: 'Removed', description: 'Candidate removed from this manifest.' });
        } catch (err: any) {
            toast({ title: 'Error', description: err.response?.data?.error || 'Could not remove candidate.', variant: 'destructive' });
        }
    };

    const calculateTotalYield = () => {
        let total = 0;
        const linkedIds = demand?.suggestedCandidateIds || [];
        linkedIds.forEach(id => {
            const quoteVal = candidateQuotes[id];
            if (quoteVal) {
                total += Number(parseCurrency(quoteVal) || 0);
            } else {
                total += 12500; // default average
            }
        });
        return total;
    };

    const filteredCandidates = candidates.filter(c => {
        const fullText = `${c.firstName} ${c.lastName} ${c.sector} ${c.skills?.join(' ')}`.toLowerCase();
        return fullText.includes(searchQuery.toLowerCase());
    });

    if (loading) {
        return (
            <DashboardLayout role={window.location.pathname.startsWith('/admin') ? 'admin' : 'staff'}>
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
        <DashboardLayout role={window.location.pathname.startsWith('/admin') ? 'admin' : 'staff'}>
            <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
                {/* Unified Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <Link to={window.location.pathname.startsWith('/admin') ? '/admin/talent-demands' : '/staff/talent-demands'} className="inline-flex items-center gap-2 text-gold hover:text-gold/80 font-black uppercase tracking-[0.2em] text-[10px] transition-all">
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
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Total Manifest Yield</p>
                            <p className="text-2xl font-display font-bold text-success">
                                {formatCurrency(calculateTotalYield().toString())}
                            </p>
                        </div>
                        <div className="h-12 w-px bg-border/50 mx-2 hidden md:block" />
                        <button
                            onClick={handleFinalize}
                            disabled={finalizing || demand.status === 'treated'}
                            className={cn(
                                "px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all flex items-center gap-2",
                                demand.status === 'treated'
                                    ? "bg-success/10 text-success border border-success/20 cursor-default"
                                    : "bg-gold text-navy hover:scale-[1.02] active:scale-[0.98] shadow-gold/20"
                            )}
                        >
                            {finalizing ? (
                                <span className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                            ) : demand.status === 'treated' ? (
                                <CheckCircle2 className="w-4 h-4" />
                            ) : (
                                <Zap className="w-4 h-4 fill-current" />
                            )}
                            {demand.status === 'treated' ? 'Finalized' : finalizing ? 'Finalizing...' : 'Finalize Bundle'}
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

                                            return (
                                                <motion.div
                                                    layout
                                                    key={candidate.id}
                                                    className={cn(
                                                        "p-4 rounded-2xl border transition-all group",
                                                        isLinked ? "bg-success/5 border-success/20 opacity-70" :
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
                                        {/* Row 1: Name */}
                                        <div className="space-y-2">
                                            <label className={cn("text-[10px] font-black uppercase tracking-widest ml-1", formErrors.firstName ? 'text-destructive' : 'text-muted-foreground')}>
                                                First Name <span className="text-destructive">*</span>
                                            </label>
                                            <input
                                                value={manualForm.firstName}
                                                onChange={e => { setManualForm({ ...manualForm, firstName: e.target.value }); setFormErrors(fe => ({ ...fe, firstName: '' })); }}
                                                placeholder="e.g. Thomas"
                                                className={cn("w-full p-4 rounded-xl bg-secondary/30 border outline-none font-bold transition-colors", formErrors.firstName ? 'border-destructive focus:border-destructive' : 'border-border focus:border-gold/50')}
                                            />
                                            {formErrors.firstName && <p className="text-[10px] text-destructive font-bold ml-1">{formErrors.firstName}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className={cn("text-[10px] font-black uppercase tracking-widest ml-1", formErrors.lastName ? 'text-destructive' : 'text-muted-foreground')}>
                                                Last Name <span className="text-destructive">*</span>
                                            </label>
                                            <input
                                                value={manualForm.lastName}
                                                onChange={e => { setManualForm({ ...manualForm, lastName: e.target.value }); setFormErrors(fe => ({ ...fe, lastName: '' })); }}
                                                placeholder="e.g. Müller"
                                                className={cn("w-full p-4 rounded-xl bg-secondary/30 border outline-none font-bold transition-colors", formErrors.lastName ? 'border-destructive focus:border-destructive' : 'border-border focus:border-gold/50')}
                                            />
                                            {formErrors.lastName && <p className="text-[10px] text-destructive font-bold ml-1">{formErrors.lastName}</p>}
                                        </div>
                                        {/* Row 2: Email + Phone */}
                                        <div className="space-y-2">
                                            <label className={cn("text-[10px] font-black uppercase tracking-widest ml-1", formErrors.email ? 'text-destructive' : 'text-muted-foreground')}>
                                                Email Address <span className="text-destructive">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={manualForm.email}
                                                onChange={e => { setManualForm({ ...manualForm, email: e.target.value }); setFormErrors(fe => ({ ...fe, email: '' })); }}
                                                placeholder="e.g. thomas.muller@email.com"
                                                className={cn("w-full p-4 rounded-xl bg-secondary/30 border outline-none font-bold transition-colors", formErrors.email ? 'border-destructive focus:border-destructive' : 'border-border focus:border-gold/50')}
                                            />
                                            {formErrors.email && <p className="text-[10px] text-destructive font-bold ml-1">{formErrors.email}</p>}
                                        </div>
                                        {/* Row 2: Phone + LinkedIn */}
                                        <div className="space-y-2">
                                            <label className={cn("text-[10px] font-black uppercase tracking-widest ml-1", formErrors.phone ? 'text-destructive' : 'text-muted-foreground')}>
                                                Phone Number <span className="text-destructive">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                value={manualForm.phone}
                                                onChange={e => { setManualForm({ ...manualForm, phone: e.target.value }); setFormErrors(fe => ({ ...fe, phone: '' })); }}
                                                placeholder="e.g. +49 170 1234567"
                                                className={cn("w-full p-4 rounded-xl bg-secondary/30 border outline-none font-bold transition-colors", formErrors.phone ? 'border-destructive focus:border-destructive' : 'border-border focus:border-gold/50')}
                                            />
                                            {formErrors.phone && <p className="text-[10px] text-destructive font-bold ml-1">{formErrors.phone}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                                LinkedIn Profile URL <span className="text-[9px] opacity-50">(optional)</span>
                                            </label>
                                            <input
                                                type="url"
                                                value={manualForm.linkedIn}
                                                onChange={e => setManualForm({ ...manualForm, linkedIn: e.target.value })}
                                                placeholder="e.g. linkedin.com/in/thomas-muller"
                                                className="w-full p-4 rounded-xl bg-secondary/30 border border-border outline-none focus:border-gold/50 font-bold"
                                            />
                                        </div>
                                        {/* Row 3: LinkedIn + Professional Focus */}
                                        <div className="space-y-2">
                                            <label className={cn("text-[10px] font-black uppercase tracking-widest ml-1", formErrors.sector ? 'text-destructive' : 'text-muted-foreground')}>
                                                Professional Focus <span className="text-destructive">*</span>
                                            </label>
                                            <input
                                                value={manualForm.sector}
                                                onChange={e => { setManualForm({ ...manualForm, sector: e.target.value }); setFormErrors(fe => ({ ...fe, sector: '' })); }}
                                                placeholder="e.g. Cloud Security Architect"
                                                className={cn("w-full p-4 rounded-xl bg-secondary/30 border outline-none font-bold transition-colors", formErrors.sector ? 'border-destructive focus:border-destructive' : 'border-border focus:border-gold/50')}
                                            />
                                            {formErrors.sector && <p className="text-[10px] text-destructive font-bold ml-1">{formErrors.sector}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className={cn("text-[10px] font-black uppercase tracking-widest ml-1", formErrors.location ? 'text-destructive' : 'text-muted-foreground')}>
                                                Location / Availability <span className="text-destructive">*</span>
                                            </label>
                                            <input
                                                value={manualForm.location}
                                                onChange={e => { setManualForm({ ...manualForm, location: e.target.value }); setFormErrors(fe => ({ ...fe, location: '' })); }}
                                                placeholder="e.g. Berlin (Hybrid)"
                                                className={cn("w-full p-4 rounded-xl bg-secondary/30 border outline-none font-bold transition-colors", formErrors.location ? 'border-destructive focus:border-destructive' : 'border-border focus:border-gold/50')}
                                            />
                                            {formErrors.location && <p className="text-[10px] text-destructive font-bold ml-1">{formErrors.location}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className={cn("text-[10px] font-black uppercase tracking-widest ml-1", formErrors.yearsOfExperience ? 'text-destructive' : 'text-muted-foreground')}>
                                                Experience Level <span className="text-destructive">*</span> <span className="text-[9px] opacity-60">(years)</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="50"
                                                value={parseYears(manualForm.yearsOfExperience)}
                                                onChange={e => { setManualForm({ ...manualForm, yearsOfExperience: e.target.value ? formatYears(e.target.value) : '' }); setFormErrors(fe => ({ ...fe, yearsOfExperience: '' })); }}
                                                placeholder="e.g. 10"
                                                className={cn("w-full p-4 rounded-xl bg-secondary/30 border outline-none font-bold transition-colors", formErrors.yearsOfExperience ? 'border-destructive focus:border-destructive' : 'border-border focus:border-gold/50')}
                                            />
                                            {formErrors.yearsOfExperience
                                                ? <p className="text-[10px] text-destructive font-bold ml-1">{formErrors.yearsOfExperience}</p>
                                                : manualForm.yearsOfExperience && <p className="text-[10px] text-gold font-bold ml-1">{formatYears(manualForm.yearsOfExperience)}</p>
                                            }
                                        </div>
                                        <div className="space-y-2">
                                            <label className={cn("text-[10px] font-black uppercase tracking-widest ml-1", formErrors.nationality ? 'text-destructive' : 'text-muted-foreground')}>
                                                Nationality / Visa Status <span className="text-destructive">*</span>
                                            </label>
                                            <input
                                                value={manualForm.nationality}
                                                onChange={e => { setManualForm({ ...manualForm, nationality: e.target.value }); setFormErrors(fe => ({ ...fe, nationality: '' })); }}
                                                placeholder="e.g. Brazilian (Requires Blue Card)"
                                                className={cn("w-full p-4 rounded-xl bg-secondary/30 border outline-none font-bold transition-colors", formErrors.nationality ? 'border-destructive focus:border-destructive' : 'border-border focus:border-gold/50')}
                                            />
                                            {formErrors.nationality && <p className="text-[10px] text-destructive font-bold ml-1">{formErrors.nationality}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className={cn("text-[10px] font-black uppercase tracking-widest ml-1", formErrors.badgeType ? 'text-destructive' : 'text-muted-foreground')}>
                                                Assignment Tier <span className="text-destructive">*</span>
                                            </label>
                                            <select
                                                value={manualForm.badgeType}
                                                onChange={e => { setManualForm({ ...manualForm, badgeType: e.target.value as any }); setFormErrors(fe => ({ ...fe, badgeType: '' })); }}
                                                className={cn("w-full p-4 rounded-xl bg-secondary/30 border outline-none font-bold appearance-none transition-colors", formErrors.badgeType ? 'border-destructive focus:border-destructive' : 'border-border focus:border-gold/50')}
                                            >
                                                <option value="" disabled>Select Tier</option>
                                                <option value="none">Standard Placement</option>
                                                <option value="blue">Verified Blue Badge</option>
                                                <option value="gold">Premium Gold Tier</option>
                                            </select>
                                            {formErrors.badgeType && <p className="text-[10px] text-destructive font-bold ml-1">{formErrors.badgeType}</p>}
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className={cn("text-[10px] font-black uppercase tracking-widest ml-1", formErrors.skills ? 'text-destructive' : 'text-muted-foreground')}>
                                                Technical Stack (Comma Separated) <span className="text-destructive">*</span>
                                            </label>
                                            <input
                                                value={manualForm.skills}
                                                onChange={e => { setManualForm({ ...manualForm, skills: e.target.value }); setFormErrors(fe => ({ ...fe, skills: '' })); }}
                                                placeholder="e.g. Docker, Python, Go, Cybersecurity"
                                                className={cn("w-full p-4 rounded-xl bg-secondary/30 border outline-none font-bold transition-colors", formErrors.skills ? 'border-destructive focus:border-destructive' : 'border-border focus:border-gold/50')}
                                            />
                                            {formErrors.skills && <p className="text-[10px] text-destructive font-bold ml-1">{formErrors.skills}</p>}
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className={cn("text-[10px] font-black uppercase tracking-widest ml-1", formErrors.experience ? 'text-destructive' : 'text-muted-foreground')}>
                                                Vetting Synopsis <span className="text-destructive">*</span>
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={manualForm.experience}
                                                onChange={e => { setManualForm({ ...manualForm, experience: e.target.value }); setFormErrors(fe => ({ ...fe, experience: '' })); }}
                                                placeholder="Summarize why this external candidate is a match for the target persona..."
                                                className={cn("w-full p-4 rounded-xl bg-secondary/30 border outline-none resize-none font-bold transition-colors", formErrors.experience ? 'border-destructive focus:border-destructive' : 'border-border focus:border-gold/50')}
                                            />
                                            {formErrors.experience && <p className="text-[10px] text-destructive font-bold ml-1">{formErrors.experience}</p>}
                                        </div>
                                    </div>

                                    <button
                                        disabled={linking}
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
                                                <button
                                                    onClick={() => handleRemoveCandidate(id)}
                                                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                                                    title="Remove from manifest"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-border/50">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground w-16 shrink-0">Quote:</p>
                                                    {editingQuoteId === id ? (
                                                        <div className="flex flex-col flex-1">
                                                            <div className="flex items-center gap-1">
                                                                <input
                                                                    autoFocus
                                                                    type="number"
                                                                    min="0"
                                                                    value={parseCurrency(candidateQuotes[id] || '') || ''}
                                                                    onChange={e => setCandidateQuotes(prev => ({ ...prev, [id]: formatCurrency(e.target.value) }))}
                                                                    placeholder="12500"
                                                                    className="w-full min-w-[80px] px-2 py-1.5 rounded-lg bg-background border border-gold/40 text-success font-display font-bold text-sm outline-none placeholder:text-muted-foreground/50 text-right"
                                                                    onKeyDown={e => e.key === 'Enter' && handleUpdateCandidateQuote(id)}
                                                                />
                                                                <button onClick={() => handleUpdateCandidateQuote(id)} className="p-1.5 rounded bg-success/10 text-success hover:bg-success hover:text-white transition-all">
                                                                    <Check className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                            <span className="text-[9px] text-muted-foreground ml-1 mt-1 font-bold text-right mr-9">
                                                                Preview: {candidateQuotes[id] ? formatCurrency(candidateQuotes[id]) : '€0'}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex-1 flex items-center justify-end gap-2">
                                                            <p className="text-sm font-bold text-success truncate">
                                                                {candidateQuotes[id] ? candidateQuotes[id] : 'Generating...'}
                                                            </p>
                                                            <button 
                                                                onClick={() => setEditingQuoteId(id)}
                                                                className="p-1 rounded text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
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
                                            <button
                                                onClick={() => handleRemoveCandidate(p.id)}
                                                className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                                                title="Remove from manifest"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-border/50">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground w-16 shrink-0">Quote:</p>
                                                {editingQuoteId === p.id ? (
                                                    <div className="flex flex-col flex-1">
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                autoFocus
                                                                type="number"
                                                                min="0"
                                                                value={parseCurrency(candidateQuotes[p.id] || '') || ''}
                                                                onChange={e => setCandidateQuotes(prev => ({ ...prev, [p.id]: formatCurrency(e.target.value) }))}
                                                                placeholder="12500"
                                                                className="w-full min-w-[80px] px-2 py-1.5 rounded-lg bg-background border border-gold/40 text-success font-display font-bold text-sm outline-none placeholder:text-muted-foreground/50 text-right"
                                                                onKeyDown={e => e.key === 'Enter' && handleUpdateCandidateQuote(p.id)}
                                                            />
                                                            <button onClick={() => handleUpdateCandidateQuote(p.id)} className="p-1.5 rounded bg-success/10 text-success hover:bg-success hover:text-white transition-all">
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <span className="text-[9px] text-muted-foreground ml-1 mt-1 font-bold text-right mr-9">
                                                            Preview: {candidateQuotes[p.id] ? formatCurrency(candidateQuotes[p.id]) : '€0'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex-1 flex items-center justify-end gap-2">
                                                        <p className="text-sm font-bold text-success truncate">
                                                            {candidateQuotes[p.id] ? candidateQuotes[p.id] : 'Generating...'}
                                                        </p>
                                                        <button 
                                                            onClick={() => setEditingQuoteId(p.id)}
                                                            className="p-1 rounded text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
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
                                    <p className="text-xl font-display font-bold text-gold">{formatCurrency(calculateTotalYield().toString())}</p>
                                </div>
                                <p className="text-[9px] opacity-60 italic leading-relaxed">This estimate is the customized sum of the individual profile quotes above.</p>
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
