import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout';
import {
    ChevronLeft,
    Printer,
    Download,
    Building2,
    Calendar,
    FileText,
    Verified,
    Clock,
    DollarSign,
    ShieldCheck,
    Briefcase
} from 'lucide-react';
import { talentPoolAPI, quotesAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const QuoteReceipt = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [request, setRequest] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadQuote();
        }
    }, [id]);

    const loadQuote = async () => {
        try {
            setLoading(true);
            const response = await quotesAPI.getById(id!);
            setRequest(response.request || response);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to load receipt',
                variant: 'destructive',
            });
            navigate('/employer/quotes');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="employer">
                <div className="animate-pulse space-y-8">
                    <div className="h-8 bg-secondary/50 rounded w-1/4" />
                    <div className="h-[600px] bg-secondary/30 rounded-[2rem]" />
                </div>
            </DashboardLayout>
        );
    }

    if (!request) return null;

    return (
        <DashboardLayout role="employer">
            <div className="max-w-4xl mx-auto space-y-6 pb-12">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <Link
                        to={`/employer/quotes/${id}`}
                        className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Offer Options
                    </Link>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-foreground hover:bg-border transition-all text-xs font-black uppercase tracking-widest border border-border/50"
                        >
                            <Printer className="w-4 h-4" />
                            Print Receipt
                        </button>
                        <button
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy text-white hover:brightness-110 transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-navy/20"
                        >
                            <Download className="w-4 h-4" />
                            Download PDF
                        </button>
                    </div>
                </div>

                {/* Main Receipt Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative"
                >
                    {/* Artistic Paper Stack Effect */}
                    <div className="absolute inset-0 bg-white/50 rounded-[2.5rem] translate-y-4 scale-[0.98] blur-sm border border-border/20" />
                    <div className="absolute inset-0 bg-white/80 rounded-[2.5rem] translate-y-2 scale-[0.99] border border-border/30" />

                    <div className="relative bg-white border border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[800px] flex flex-col">
                        {/* Receipt Header / Logo */}
                        <div className="bg-navy p-12 text-white relative overflow-hidden">
                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gold opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px]" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 opacity-10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[40px]" />

                            <div className="relative flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 bg-gold rounded-xl flex items-center justify-center shadow-lg shadow-gold/20">
                                            <Building2 className="w-6 h-6 text-navy" />
                                        </div>
                                        <span className="text-xl font-display font-black tracking-tighter uppercase italic">
                                            GBPC <span className="text-gold">Connect</span>
                                        </span>
                                    </div>
                                    <h1 className="text-4xl font-display font-black mb-2">Cost of Offer Receipt</h1>
                                    <p className="text-white/60 font-medium tracking-wide uppercase text-[10px]">Official Placement Expenditure Breakdown</p>
                                </div>
                                <div className="text-right">
                                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl inline-block">
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Receipt Number</p>
                                        <p className="font-mono text-xl font-black text-gold">#{request.id.split('-')[1]?.toUpperCase() ?? request.id.toUpperCase()}</p>
                                    </div>
                                    <div className="mt-4 flex items-center justify-end gap-2 text-[10px] font-black uppercase tracking-widest text-success">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        Verified & Secure
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-grow p-12">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-8 mb-12">
                                <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                                        <Briefcase className="w-6 h-6 text-gold" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Candidate</p>
                                        <p className="text-lg font-bold text-foreground">
                                            {request.candidate?.firstName} {request.candidate?.lastName}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                                        <Calendar className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Issue Date</p>
                                        <p className="text-lg font-bold text-foreground">
                                            {format(new Date(request.resolvedAt || request.requestedAt), 'MMMM dd, yyyy')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Charges Table */}
                            <div className="space-y-8">
                                <div>
                                    <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Line Item Breakdown</h2>
                                        {request.options?.find((o: any) => o.selected) && (
                                            <span className="px-3 py-1 rounded bg-gold/10 text-gold text-[10px] font-black uppercase tracking-widest border border-gold/20">
                                                Package: {request.options.find((o: any) => o.selected).name}
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-6">
                                        {(() => {
                                            const selectedOption = request.options?.find((o: any) => o.selected);
                                            const items = selectedOption ? selectedOption.items : request.items;

                                            if (items && items.length > 0) {
                                                return items.map((item: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between items-start group">
                                                        <div className="max-w-[70%]">
                                                            <h4 className="font-bold text-lg text-foreground group-hover:text-navy transition-colors">{item.label}</h4>
                                                            <p className="text-sm text-muted-foreground font-medium mt-1 uppercase tracking-wide leading-relaxed">{item.description}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-mono text-xl font-black text-navy">€{item.amount.toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                ));
                                            }
                                            return (
                                                <div className="flex flex-col items-center justify-center py-12 text-center bg-secondary/20 rounded-2xl border border-dashed border-border">
                                                    <Clock className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                                                    <p className="font-bold text-muted-foreground">Charge breakdown currently pending</p>
                                                    <p className="text-xs text-muted-foreground/60 max-w-xs mt-2 font-medium uppercase tracking-widest">A detailed receipt will be available once the quote is fully approved by our staff.</p>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Total Section */}
                                <div className="mt-12 pt-12 border-t-2 border-dashed border-border">
                                    <div className="flex justify-between items-center bg-navy text-white p-10 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                                        {/* Background Shimmer */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Final Settlement Estimate</h3>
                                                <Verified className="w-4 h-4 text-gold" />
                                            </div>
                                            <p className="text-xs font-medium text-white/50 max-w-xs leading-relaxed uppercase tracking-wider italic">
                                                This total includes all placement dependencies, legal filing fees, and logistical support through GBPC.
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-baseline justify-end gap-1">
                                                <span className="text-sm font-black text-gold/60 uppercase tracking-widest mr-2">Total Amount</span>
                                                <span className="text-5xl font-display font-black text-gold drop-shadow-lg">
                                                    {request.options?.find((o: any) => o.selected)?.costEstimate || request.costEstimate}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Receipt Footer */}
                        <div className="p-12 bg-secondary/10 border-t border-border/50 text-center">
                            <div className="flex items-center justify-center gap-2 mb-4 text-muted-foreground/40">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Guaranteed Secured Placement Receipt</span>
                            </div>
                            <p className="text-[10px] font-medium leading-relaxed uppercase tracking-[0.1em] text-muted-foreground max-w-2xl mx-auto">
                                This document serves as an official placement estimate generated by German Talent Connect. The figures provided remain valid for a period of <span className="text-foreground font-black">14 business days</span> from the issue date. For any questions regarding this breakdown, please reference your Receipt ID when contacting your account manager.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Print Warning */}
                <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-8">
                        © 2024 GBPC Talent Solutions GmbH • Berlin, Germany
                    </p>

                    {/* Payment & Hire CTA */}
                    {request.candidate && request.options?.find((o: any) => o.selected) && (
                        <div className="flex flex-col items-center gap-4">
                            <button
                                onClick={async () => {
                                    try {
                                        await talentPoolAPI.updateCandidateStatus(request.candidateId, 'hired');
                                        toast({ title: 'Payment Successful', description: `${request.candidate.firstName} has been officially hired!` });
                                        navigate('/employer/candidates');
                                    } catch (err: any) {
                                        toast({ title: 'Error', description: 'Payment processing failed.', variant: 'destructive' });
                                    }
                                }}
                                className="px-12 py-5 rounded-[2rem] bg-gold text-navy font-black uppercase tracking-widest text-sm hover:shadow-2xl hover:shadow-gold/30 hover:-translate-y-1 transition-all flex items-center gap-3"
                            >
                                <DollarSign className="w-5 h-5" /> Complete Payment & Hire Candidate
                            </button>
                            <p className="text-xs text-muted-foreground max-w-sm uppercase tracking-widest font-bold">
                                Completing this secures the candidate and begins the official onboarding process.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default QuoteReceipt;
