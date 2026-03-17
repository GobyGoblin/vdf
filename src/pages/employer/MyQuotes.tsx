import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import {
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    Search,
    Building2,
    Calendar,
    DollarSign,
    User,
    ArrowRight,
    Shield
} from 'lucide-react';
import { talentPoolAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const EmployerQuotes = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'awaiting_candidate' | 'candidate_unresponsive'>('all');
    const [user, setUser] = useState<any>(null);
    const [loadingUser, setLoadingUser] = useState(true);

    useEffect(() => {
        loadUser();
        loadRequests();
    }, []);

    const loadUser = async () => {
        try {
            const { authAPI } = await import('@/lib/api');
            const { user: userData } = await authAPI.getMe();
            setUser(userData);
        } catch (error) {
            console.error('Failed to load user:', error);
        } finally {
            setLoadingUser(false);
        }
    };

    const loadRequests = async () => {
        try {
            setLoading(true);
            const response = await talentPoolAPI.getMyQuoteRequests();
            setRequests(response.requests || []);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to load your quote requests',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredRequests = requests.filter(req => {
        if (filter === 'all') return true;
        if (filter === 'pending') return ['pending', 'awaiting_candidate'].includes(req.status);
        return req.status === filter;
    });

    const handleCancelRequest = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this quote request?')) return;
        try {
            const { quotesAPI } = await import('@/lib/api');
            await quotesAPI.cancel(id);
            toast({
                title: 'Request Cancelled',
                description: 'Your quote request has been cancelled.',
            });
            loadRequests();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.error || error.message || 'Failed to cancel request',
                variant: 'destructive',
            });
        }
    };

    return (
        <DashboardLayout role="employer">
            <div className="space-y-8">
                {loadingUser ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
                    </div>
                ) : !user || (!user.isVerified && user.verificationStatus !== 'verified') ? (
                    <div className="flex flex-col items-center justify-center py-20 card-premium border-gold/20 bg-gold/5">
                        <div className="w-20 h-20 rounded-3xl bg-gold/20 flex items-center justify-center mb-6 shadow-xl shadow-gold/10 border border-gold/30">
                            <Shield className="w-10 h-10 text-gold" />
                        </div>
                        <h2 className="text-3xl font-display font-bold text-foreground mb-4">Verification Required</h2>
                        <p className="text-muted-foreground text-center max-w-md mb-8 leading-relaxed">
                            To view quote requests and pricing estimates, your company must first be
                            <span className="text-gold font-bold"> verified</span> by our administrative staff.
                        </p>
                        <div className="flex flex-col gap-3 w-full max-w-xs">
                            <Link
                                to="/employer/onboarding"
                                className="w-full py-4 rounded-xl bg-gold text-navy font-black uppercase tracking-widest text-xs text-center hover:shadow-lg hover:shadow-gold/20 transition-all flex items-center justify-center gap-2"
                            >
                                Complete Company Onboarding
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        <div>
                            <h1 className="text-2xl font-display font-bold text-foreground">My Quote Requests</h1>
                            <p className="text-muted-foreground">Track your "Cost of Offer" requests and estimates</p>
                        </div>

                        {/* Stats Summary */}
                        <div className="flex flex-wrap gap-4">
                            {[
                                { label: 'Pending Requests', count: requests.filter(r => ['pending', 'awaiting_candidate'].includes(r.status)).length, color: 'text-amber-600', bg: 'bg-amber-50' },
                                { label: 'Approved Offers', count: requests.filter(r => r.status === 'approved').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                { label: 'Rejected', count: requests.filter(r => r.status === 'rejected').length, color: 'text-rose-600', bg: 'bg-rose-50' },
                                { label: 'Not Available', count: requests.filter(r => r.status === 'candidate_unresponsive').length, color: 'text-orange-600', bg: 'bg-orange-50' }
                            ].map((stat, i) => (
                                <div key={i} className={cn("px-6 py-4 rounded-2xl border border-border/50 bg-white flex items-center gap-4 min-w-[200px] shadow-sm")}>
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg", stat.bg, stat.color)}>
                                        {stat.count}
                                    </div>
                                    <span className="text-sm font-medium text-slate-500">{stat.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* List - Minimalist approach */}
                        <div className="space-y-4">
                            {/* Filter Bar */}
                            <div className="flex items-center justify-between pb-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Recent Requests</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-slate-500">Filter:</span>
                                    <select
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value as any)}
                                        className="bg-white border border-border rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-gold/30 hover:bg-slate-50 transition-colors"
                                    >
                                        <option value="all">All</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="candidate_unresponsive">Not Available</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {loading ? (
                                    [1, 2, 3].map(i => (
                                        <div key={i} className="bg-white border border-border/50 rounded-2xl p-8 animate-pulse flex justify-between">
                                            <div className="space-y-3 w-1/3">
                                                <div className="h-6 bg-slate-100 rounded w-full" />
                                                <div className="h-4 bg-slate-100 rounded w-2/3" />
                                            </div>
                                            <div className="h-10 bg-slate-100 rounded w-32" />
                                        </div>
                                    ))
                                ) : filteredRequests.length === 0 ? (
                                    <div className="bg-white border border-border/50 rounded-2xl p-20 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <FileText className="w-8 h-8 text-slate-200" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">No Requests Found</h3>
                                        <p className="text-slate-500 mb-8">You haven't requested any quotes yet or no requests match the current filter.</p>
                                        <Link to="/employer/talent-pool" className="px-6 py-3 bg-navy text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-navy/90 transition-colors inline-block">
                                            Request Your First Quote
                                        </Link>
                                    </div>
                                ) : (
                                    filteredRequests.map((req) => (
                                        <div key={req.id} className="bg-white border border-border/50 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                                                <div className="flex-1 space-y-6">
                                                    <div className="flex items-start gap-4">
                                                        <div className={cn(
                                                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all",
                                                            req.status === 'candidate_unresponsive' || (req.altCandidate && req.status !== 'rejected') ? "bg-orange-50 border-orange-100 text-orange-500" :
                                                            ['pending', 'awaiting_candidate'].includes(req.status) ? "bg-blue-50 border-blue-100 text-blue-500" :
                                                            req.status === 'approved' || req.status === 'paid' ? "bg-emerald-50 border-emerald-100 text-emerald-500" :
                                                            "bg-slate-50 border-slate-100 text-slate-400"
                                                        )}>
                                                            <User className="w-6 h-6" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-3">
                                                                <h3 className="text-xl font-bold font-display text-slate-900 leading-none">
                                                                    {req.candidate?.fullName}
                                                                </h3>
                                                                <span className={cn(
                                                                    "text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border",
                                                                    req.status === 'candidate_unresponsive' || (req.altCandidate && req.status !== 'paid') ? "bg-orange-500 text-white border-transparent shadow-[0_0_10px_rgba(249,115,22,0.2)]" :
                                                                    ['pending', 'awaiting_candidate'].includes(req.status) ? "bg-blue-50 text-blue-600 border-blue-200" :
                                                                    (req.status === 'approved' || req.status === 'paid') && !req.altCandidate ? "bg-emerald-500 text-white border-transparent shadow-[0_0_10px_rgba(16,185,129,0.2)]" :
                                                                    req.status === 'paid' ? "bg-emerald-500 text-white border-transparent shadow-[0_0_10px_rgba(16,185,129,0.2)]" :
                                                                    "bg-slate-50 text-slate-500 border-slate-200"
                                                                )}>
                                                                    {req.status === 'candidate_unresponsive' || (req.altCandidate && req.status !== 'paid') ? "NOT AVAILABLE" :
                                                                     ['pending', 'awaiting_candidate'].includes(req.status) ? "PENDING" : 
                                                                     req.status === 'approved' ? "APPROVED" : 
                                                                     req.status === 'paid' ? "PAID" :
                                                                     req.status.toUpperCase().replace('_', ' ')}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium tracking-tight">
                                                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> requested {formatDistanceToNow(new Date(req.requestedAt), { addSuffix: true })}</span>
                                                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                                <span>ID: {req.id}</span>
                                                                {req.status === 'approved' && !req.altCandidate && req.costEstimate && (
                                                                    <>
                                                                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                                        <span className="text-emerald-600 font-bold">Estimated: {req.costEstimate}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Recommendation Box - minimalist layout */}
                                                    {req.altCandidate && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row items-center gap-8"
                                                        >
                                                            <div className="flex-1 space-y-2 text-center md:text-left">
                                                                <div className="flex items-center justify-center md:justify-start gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                                    <Shield className="w-3.5 h-3.5 text-orange-500" /> Expert Recommendation
                                                                </div>
                                                                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                                                    The originally requested expert was <span className="text-orange-600 font-bold">recruited by another offer</span>. 
                                                                    We've hand-picked a highly qualified alternative with similar credentials and a quote ready for your review.
                                                                </p>
                                                            </div>

                                                            <div className="w-px h-12 bg-slate-200 hidden md:block" />

                                                            <div className="flex items-center gap-6 min-w-fit">
                                                                <div className="space-y-1">
                                                                    <p className="text-sm font-bold text-slate-900 mb-1">{req.altCandidate.fullName}</p>
                                                                    <div className="flex gap-2">
                                                                        <Link 
                                                                            to={`/employer/talent-pool/${req.altCandidate.id}`}
                                                                            className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-navy transition-colors"
                                                                        >
                                                                            View Profile
                                                                        </Link>
                                                                        <span className="text-slate-200">|</span>
                                                                        <Link 
                                                                            to={`/employer/quotes/${req.id}`}
                                                                            className={cn(
                                                                                "text-[10px] font-bold uppercase tracking-widest transition-colors",
                                                                                req.status === 'approved' ? "text-emerald-500 hover:text-emerald-600" : "text-gold hover:text-orange-500"
                                                                            )}
                                                                        >
                                                                            {req.status === 'approved' ? "Review Selection" : "Review Quote"}
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                                <Link 
                                                                    to={`/employer/quotes/${req.id}`}
                                                                    className={cn(
                                                                        "w-12 h-12 rounded-full text-white flex items-center justify-center transition-all shadow-lg group/btn",
                                                                        req.status === 'approved' ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10" : "bg-navy hover:bg-gold shadow-navy/10"
                                                                    )}
                                                                >
                                                                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" />
                                                                </Link>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </div>

                                                {/* Action Panel */}
                                                <div className="flex items-center gap-3 lg:pt-1">
                                                    <Link
                                                        to={`/employer/talent-pool/${req.candidateId}`}
                                                        className="px-5 py-2.5 bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-widest border border-slate-100 rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2"
                                                    >
                                                        Original Candidate
                                                    </Link>
                                                    
                                                    {['pending'].includes(req.status) && (
                                                        <button
                                                            onClick={() => handleCancelRequest(req.id)}
                                                            className="px-5 py-2.5 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest border border-red-100 rounded-xl hover:bg-red-100 hover:text-red-700 transition-all flex items-center gap-2"
                                                        >
                                                            <XCircle className="w-3.5 h-3.5" /> Cancel Request
                                                        </button>
                                                    )}

                                                    {req.status === 'approved' && !req.altCandidate && (
                                                        <Link
                                                            to={`/employer/quotes/${req.id}`}
                                                            className="px-5 py-2.5 bg-navy text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-gold transition-all shadow-md shadow-navy/10 flex items-center gap-2"
                                                        >
                                                            {req.selectedOptionId ? "Payment Details" : "Review Details"}
                                                            <ArrowRight className="w-3.5 h-3.5" />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default EmployerQuotes;
