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
            loadData(id);
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

    const handlePaymentRedirect = () => {
        if (!id) return;
        navigate(`/employer/quotes/${id}/payment`);
    };

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

    return (
        <DashboardLayout role="employer">
            <div className="max-w-[1200px] mx-auto space-y-10 pb-20">
                {/* Back Button */}
                <Link to="/employer/quotes" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-gold transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Quotes
                </Link>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-4">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1.5 rounded-full bg-gold/10 text-gold text-[10px] font-black uppercase tracking-widest border border-gold/20 flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5" /> Exclusive Placement Offer
                            </span>
                            <span className="px-3 py-1.5 rounded-full bg-secondary text-muted-foreground text-[10px] font-black uppercase tracking-widest border border-border/50">
                                Request ID: {request.id}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-[1.1]">
                            Select Your <span className="text-gold relative inline-block">Offer Option
                                <div className="absolute -bottom-2 left-0 w-full h-2 bg-gold/20 -z-10 -rotate-1" />
                            </span>
                        </h1>
                        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed">
                            Our experts have prepared premium placement tiers tailored for <span className="text-foreground font-bold border-b-2 border-gold/30">{request.candidate?.fullName}</span>. Compare the perks and costs to find the optimal fit for your organization.
                        </p>
                    </div>

                    {selectedOption && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <button
                                onClick={() => setShowMeetingPlanner(true)}
                                className="flex items-center gap-4 px-10 py-5 rounded-[2rem] bg-navy text-white font-black uppercase tracking-widest text-xs hover:shadow-2xl hover:shadow-navy/20 hover:-translate-y-1 transition-all"
                            >
                                <Calendar className="w-5 h-5 text-gold" /> Plan Interview Meeting
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Options Grid */}
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mt-8">
                    {request.options?.map((option, idx) => (
                        <motion.div
                            key={option.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.15, type: 'spring', bounce: 0.4 }}
                            className={cn(
                                "relative flex flex-col p-8 md:p-10 rounded-[2.5rem] border-2 transition-all duration-500",
                                option.selected
                                    ? "bg-white border-gold shadow-2xl shadow-gold/20 scale-[1.02]"
                                    : "bg-secondary/20 border-border opacity-90 hover:opacity-100 hover:border-gold/30 hover:bg-white hover:shadow-xl group"
                            )}
                        >
                            {option.selected && (
                                <div className="absolute -top-4 -right-4 md:top-8 md:right-8 flex items-center gap-2 px-4 py-2 rounded-full bg-gold text-navy text-[10px] font-black uppercase tracking-widest shadow-lg z-10">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Current Selection
                                </div>
                            )}

                            <div className="flex-1 space-y-8 flex flex-col">
                                <div className="space-y-5">
                                    <div className={cn(
                                        "w-16 h-16 rounded-[1.25rem] flex items-center justify-center border-2 transition-transform duration-500 group-hover:scale-110",
                                        idx === 0 ? "bg-navy text-white" : "bg-gold text-navy border-none"
                                    )}>
                                        {idx === 0 ? <Shield className="w-8 h-8" /> : <Crown className="w-8 h-8" />}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">{option.name}</h2>
                                        <p className="text-muted-foreground text-xs uppercase tracking-widest font-black inline-block border-b-2 border-border pb-1">Placement Tier {idx + 1}</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-navy text-white p-8 rounded-[2rem] shadow-xl">
                                        <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Total Estimated Yield</p>
                                        <p className="text-3xl font-display font-bold text-gold">{option.costEstimate}</p>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">Included Perks</h4>
                                        <div className="grid grid-cols-1 gap-3">
                                            {option.perks.map((perk, i) => (
                                                <div key={i} className="flex items-center gap-3 text-sm text-foreground">
                                                    <div className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                    </div>
                                                    {perk}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">Charge Breakdown</h4>
                                        <div className="space-y-3">
                                            {option.items.map((item, i) => (
                                                <div key={i} className="flex justify-between items-center group">
                                                    <div className="text-xs font-bold text-foreground">{item.label}</div>
                                                    <div className="text-xs font-mono text-muted-foreground">€{item.amount.toLocaleString()}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex-1 flex flex-col justify-end">
                                    {option.selected ? (
                                        <button
                                            onClick={handlePaymentRedirect}
                                            className="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all bg-success text-white hover:shadow-2xl hover:shadow-success/40 hover:-translate-y-1 block text-center"
                                        >
                                            Secure Checkout
                                        </button>
                                    ) : (
                                        <button
                                            disabled={selecting}
                                            onClick={() => handleSelectOption(option.id)}
                                            className={cn(
                                                "w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all",
                                                "bg-navy text-white hover:bg-gold hover:text-navy hover:shadow-2xl hover:shadow-gold/30 hover:-translate-y-1 block text-center"
                                            )}
                                        >
                                            Select {option.name}
                                        </button>
                                    )}
                                </div>
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
                                        <h2 className="text-3xl font-display font-bold text-foreground">Plan Interview Meeting</h2>
                                        <p className="text-muted-foreground">Schedule a direct session with {request.candidate?.fullName}.</p>
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

                {/* Quote Context / Bottom Actions */}
                <div className="p-12 rounded-[3.5rem] bg-navy text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
                        <Shield size={200} />
                    </div>
                    <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h3 className="text-3xl font-display font-bold">The German Talent <span className="text-gold">Commitment</span></h3>
                            <p className="text-white/60 leading-relaxed">
                                Every placement secured through our platform includes full compliance handling, visa support, and a 6-month satisfaction guarantee. If the candidate doesn't integrate successfully, we will source a replacement at no additional cost.
                            </p>
                            {selectedOption && (
                                <Link
                                    to={`/employer/quotes/${request.id}/receipt`}
                                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gold hover:underline"
                                >
                                    View Final Breakdown Receipt <ArrowRight className="w-4 h-4" />
                                </Link>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <Link to="/employer/candidates" className="px-10 py-5 rounded-2xl bg-white/10 border border-white/20 text-white font-black uppercase tracking-widest text-xs hover:bg-white/20 transition-all">
                                Manage All Candidates
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default EmployerQuoteOptions;
