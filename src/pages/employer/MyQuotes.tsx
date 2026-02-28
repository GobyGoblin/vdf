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

const EmployerQuotes = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
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

    const filteredRequests = requests.filter(req =>
        filter === 'all' ? true : req.status === filter
    );

    return (
        <DashboardLayout role="employer">
            <div className="space-y-8">
                {loadingUser ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
                    </div>
                ) : !user || user.verificationStatus !== 'verified' ? (
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

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="card-premium p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Pending</p>
                                        <p className="text-2xl font-bold">{requests.filter(r => r.status === 'pending').length}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="card-premium p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-success/10 text-success">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Approved</p>
                                        <p className="text-2xl font-bold">{requests.filter(r => r.status === 'approved').length}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="card-premium p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-destructive/10 text-destructive">
                                        <XCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Rejected</p>
                                        <p className="text-2xl font-bold">{requests.filter(r => r.status === 'rejected').length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* List */}
                        <div className="card-premium overflow-hidden">
                            <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Filter by Status:</span>
                                    <select
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value as any)}
                                        className="bg-background border border-border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="all">All Requests</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>

                            <div className="divide-y divide-border">
                                {loading ? (
                                    [1, 2, 3].map(i => (
                                        <div key={i} className="p-6 animate-pulse space-y-4">
                                            <div className="h-6 bg-secondary/50 rounded w-1/4" />
                                            <div className="h-4 bg-secondary/50 rounded w-1/2" />
                                        </div>
                                    ))
                                ) : filteredRequests.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                                        <p className="text-muted-foreground font-medium">No quote requests found</p>
                                        <Link to="/employer/talent-pool" className="text-gold hover:underline text-sm mt-2 inline-block">
                                            Browse talent pool to request quotes
                                        </Link>
                                    </div>
                                ) : (
                                    filteredRequests.map((req) => (
                                        <div key={req.id} className="p-6 hover:bg-secondary/5 transition-colors group border-b border-border/50 last:border-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex gap-4">
                                                    <div className={cn(
                                                        "p-3 rounded-xl shrink-0 h-fit",
                                                        req.status === 'pending' ? "bg-warning/10 text-warning" :
                                                            req.status === 'approved' ? "bg-success/10 text-success" :
                                                                "bg-destructive/10 text-destructive"
                                                    )}>
                                                        <FileText className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h3 className="font-bold text-foreground text-lg">
                                                                {req.candidate?.firstName} {req.candidate?.lastName}
                                                            </h3>
                                                            <span className={cn(
                                                                "text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border h-fit",
                                                                req.status === 'pending' ? "bg-warning/10 text-warning border-warning/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]" :
                                                                    req.status === 'approved' ? "bg-success/10 text-success border-success/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]" :
                                                                        "bg-destructive/10 text-destructive border-destructive/20"
                                                            )}>
                                                                {req.status}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-muted-foreground font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="w-4 h-4 text-gold/60" />
                                                                Requested: {formatDistanceToNow(new Date(req.requestedAt), { addSuffix: true })}
                                                            </div>
                                                            {req.status === 'approved' && req.costEstimate && (
                                                                <div className="flex items-center gap-2 text-success font-black tracking-tight">
                                                                    <DollarSign className="w-4 h-4" />
                                                                    Total: {req.costEstimate}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <Link
                                                        to={`/employer/talent-pool/${req.candidateId}`}
                                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-foreground hover:bg-border transition-all text-xs font-black uppercase tracking-widest"
                                                    >
                                                        Profile
                                                        <ArrowRight className="w-3.5 h-3.5" />
                                                    </Link>
                                                    {req.status === 'approved' && (
                                                        <Link
                                                            to={`/employer/quotes/${req.id}`}
                                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gold/30 text-gold hover:bg-gold/5 shadow-sm transition-all text-xs font-black uppercase tracking-widest"
                                                        >
                                                            Review Options
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
