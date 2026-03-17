import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    Shield,
    Zap,
    Crown,
    ArrowRight,
    Calendar,
    DollarSign,
    Sparkles
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { quotesAPI, QuoteRequest } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const EmployerQuoteOptions = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [request, setRequest] = useState<QuoteRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [selecting, setSelecting] = useState(false);
    const [showMeetingPlanner, setShowMeetingPlanner] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (id) loadData(id);
    }, [id]);

    const loadData = async (requestId: string) => {
        try {
            setLoading(true);
            const data = await quotesAPI.getById(requestId);
            setRequest(data.request || data);
        } catch (error) {
            console.error('Failed to load quote details:', error);
            toast({
                title: 'Error',
                description: 'Failed to load quote details.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSelectOption = async (optionId: string) => {
        if (!id) return;
        try {
            setSelecting(true);
            await quotesAPI.selectOption(id, optionId);
            toast({
                title: 'Option Selected',
                description: 'You have successfully selected this offer option.',
            });
            navigate(`/employer/quotes/${id}/payment`);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to select option.',
                variant: 'destructive',
            });
        } finally {
            setSelecting(false);
        }
    };

    const selectedOption = request?.options?.find(o => o.selected);

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

    if (!request) return null;

    // Guard: if this quote is for an original unresponsive candidate with NO alt yet, block access
    // (If there IS an alt candidate, the options page is valid — it's for the alt placement)
    if (request.status === 'candidate_unresponsive' && !request.altCandidate && !request.altCandidateId) {
        return (
            <DashboardLayout role="employer">
                <div className="max-w-xl mx-auto mt-20 text-center space-y-6">
                    <div className="w-20 h-20 rounded-3xl bg-orange-100 flex items-center justify-center mx-auto">
                        <Clock className="w-10 h-10 text-orange-500" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-slate-900">Candidate Not Available</h2>
                    <p className="text-slate-500 leading-relaxed">
                        This candidate is currently unavailable. Our team is working on finding a qualified alternative for your placement request.
                    </p>
                    <Link to="/employer/quotes" className="inline-flex items-center gap-2 px-6 py-3 bg-navy text-white rounded-xl font-bold text-sm hover:bg-gold hover:text-navy transition-all">
                        <ArrowLeft className="w-4 h-4" /> Back to My Quotes
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="employer">
            <div className="max-w-[1200px] mx-auto space-y-10 pb-20">
                {/* Back Button */}
                <Link to="/employer/quotes" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-gold transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Quotes
                </Link>

                {/* Header Section - Modern Minimalist */}
                <div className="space-y-8">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1.5 rounded-xl bg-gold/10 text-gold text-[10px] font-black uppercase tracking-widest border border-gold/20 flex items-center gap-2">
                                <Shield className="w-3.5 h-3.5" /> Direct Placement
                            </span>
                            <span className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border border-slate-100">
                                Ref: {request.id}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 tracking-tight leading-[1.1]">
                            {request.status === 'candidate_unresponsive' ? 'Review New ' : 'Select Your '}
                            <span className="text-navy">Placement Option</span>
                        </h1>
                        <p className="text-lg text-slate-500 max-w-2xl leading-relaxed font-medium">
                            {request.status === 'candidate_unresponsive' ? (
                                <>
                                    The original candidate was <span className="text-orange-600 font-bold">recruited by another offer</span>. 
                                    Our team has expedited this alternative placement for 
                                    <span className="text-slate-900 font-bold ml-1">
                                         {request.altCandidate?.fullName}
                                     </span>.
                                </>
                            ) : (
                                <>
                                    Expertly curated placement tiers for 
                                    <span className="text-slate-900 font-bold ml-1">
                                        {request.candidate?.fullName}
                                    </span>.
                                </>
                            )} Compare our optimized support tiers below.
                        </p>
                    </div>
                </div>

                {/* Options Grid - Refined Minimalist */}
                <div className="grid lg:grid-cols-2 gap-8 items-stretch mt-4">
                    {request.options?.map((option, idx) => (
                        <motion.div
                            key={option.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={cn(
                                "relative flex flex-col p-8 md:p-10 rounded-[2rem] border transition-all duration-300",
                                option.selected
                                    ? "bg-white border-gold shadow-xl shadow-gold/5"
                                    : "bg-white border-slate-100 hover:border-gold/30 hover:shadow-lg group"
                            )}
                        >
                            {option.selected && (
                                <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 text-gold text-[9px] font-black uppercase tracking-widest border border-gold/20">
                                    <CheckCircle2 className="w-3 h-3" /> Selected
                                </div>
                            )}

                            <div className="flex-1 flex flex-col gap-8">
                                <div className="space-y-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                        idx === 0 ? "bg-slate-900 text-white" : "bg-gold text-navy"
                                    )}>
                                        {idx === 0 ? <Shield className="w-6 h-6" /> : <Crown className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">{option.name}</h2>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Tier {idx + 1} Package</p>
                                    </div>
                                </div>

                                <div className="space-y-6 flex-1">
                                    <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Estimated Base Yield</span>
                                        <p className="text-2xl font-bold text-slate-900 tracking-tight">{option.costEstimate}</p>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Services Included</h4>
                                        <div className="grid gap-2">
                                            {option.perks.map((perk, i) => (
                                                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-500 font-medium leading-tight">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                                    {perk}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-slate-50">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Calculation</h4>
                                        <div className="space-y-2">
                                            {option.items.map((item, i) => (
                                                <div key={i} className="flex justify-between items-center bg-slate-50/50 px-3 py-2 rounded-lg">
                                                    <span className="text-[11px] font-bold text-slate-600">{item.label}</span>
                                                    <span className="text-[11px] font-mono font-medium text-slate-400">€{item.amount.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    disabled={selecting}
                                    onClick={() => option.selected ? navigate(`/employer/quotes/${id}/payment`) : handleSelectOption(option.id)}
                                    className={cn(
                                        "w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all",
                                        option.selected
                                            ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                                            : "bg-navy text-white hover:bg-gold hover:text-navy hover:shadow-lg"
                                    )}
                                >
                                    {option.selected ? "Continue to Payment" : `Select ${option.name}`}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Meeting Planner Modal (Simple version) */}
                <AnimatePresence>
                    {showMeetingPlanner && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-navy/80 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="bg-white rounded-[3rem] p-12 max-w-xl w-full shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold/10 rounded-full blur-3xl" />

                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center justify-center w-20 h-20 rounded-[2rem] bg-gold/10 text-gold mb-6 mx-auto">
                                        <Calendar className="w-10 h-10" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h2 className="text-3xl font-display font-bold text-slate-900">Plan Interview</h2>
                                        <p className="text-sm text-slate-500 font-medium">
                                            Schedule a session with {request.status === 'candidate_unresponsive' ? request.altCandidate?.fullName : request.candidate?.fullName}.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 rounded-2xl bg-secondary border border-border/50 space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Selected Placement Package</p>
                                            <p className="font-bold text-foreground">{selectedOption?.name}</p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Available Time Slots</label>
                                                <select className="w-full bg-secondary border border-border/50 rounded-xl px-4 py-3 outline-none focus:border-gold transition-all text-sm font-bold">
                                                    <option>Monday, Oct 24 - 10:00 AM (Berlin)</option>
                                                    <option>Tuesday, Oct 25 - 02:30 PM (Berlin)</option>
                                                    <option>Thursday, Oct 27 - 09:15 AM (Berlin)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Meeting Format</label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button className="py-3 rounded-xl border-2 border-gold bg-gold/5 text-navy font-bold text-xs uppercase tracking-widest">Video Call</button>
                                                    <button className="py-3 rounded-xl border border-border text-muted-foreground font-bold text-xs uppercase tracking-widest">On-site (Berlin)</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <button
                                            onClick={() => {
                                                toast({ title: 'Meeting Requested', description: 'Your interest has been sent. Our staff will coordinate the final details.' });
                                                setShowMeetingPlanner(false);
                                            }}
                                            className="w-full py-5 rounded-2xl bg-gold text-navy font-black uppercase tracking-widest text-xs hover:shadow-2xl hover:shadow-gold/30 hover:-translate-y-1 transition-all"
                                        >
                                            Confirm Request
                                        </button>
                                        <button
                                            onClick={() => setShowMeetingPlanner(false)}
                                            className="w-full py-4 rounded-2xl border border-border text-muted-foreground font-black uppercase tracking-widest text-[10px] hover:bg-secondary transition-all"
                                        >
                                            Maybe Later
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Quote Context - Minimalist Footer */}
                <div className="p-8 md:p-12 rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="max-w-2xl space-y-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <Shield className="w-4 h-4 text-navy" /> Our Commitment
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 font-display">Transparency & Protection</h3>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">
                            Every placement secured through our platform includes full compliance handling, visa support, and a 6-month satisfaction guarantee. We ensure a seamless integration process for both employer and candidate.
                        </p>
                    </div>
                    <div className="shrink-0">
                        <Link to="/employer/candidates" className="px-8 py-4 rounded-xl border border-slate-200 text-slate-600 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all flex items-center gap-2">
                            Manage Pipeline
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default EmployerQuoteOptions;
