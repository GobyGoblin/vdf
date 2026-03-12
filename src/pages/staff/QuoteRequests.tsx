import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import {
    FileText,
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    Clock,
    DollarSign,
    User,
    Building2,
    Calendar,
    Phone,
    Mail,
    AlertCircle
} from 'lucide-react';
import { staffAPI, QuoteRequest } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const QuoteRequests = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'awaiting_candidate' | 'candidate_unresponsive'>('all');
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
    const [costEstimate, setCostEstimate] = useState('');

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const response = await staffAPI.getQuoteRequests();
            setRequests(response.requests);
        } catch (error) {
            console.error('Failed to load quote requests:', error);
            toast({
                title: 'Error',
                description: 'Failed to load quote requests',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (requestId: string, status: 'approved' | 'rejected' | 'candidate_unresponsive', finalCost?: string, altCandidateId?: string) => {
        if (status === 'approved' && !finalCost) {
            toast({
                title: 'Error',
                description: 'Please provide a cost estimate',
                variant: 'destructive',
            });
            return;
        }

        try {
            await staffAPI.resolveQuoteRequest(requestId, status, finalCost || '', altCandidateId);
            toast({
                title: 'Success',
                description: `Request ${status}`,
            });
            setSelectedRequest(null);
            setCostEstimate('');
            loadRequests();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update request',
                variant: 'destructive',
            });
        }
    };

    const filteredRequests = requests.filter(req => {
        if (statusFilter === 'all') return true;
        return req.status === statusFilter;
    });

    return (
        <DashboardLayout role={window.location.pathname.startsWith('/admin') ? 'admin' : 'staff'}>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-display font-bold text-foreground">Quote Requests</h1>
                    <p className="text-muted-foreground">Manage "Cost of Offer" requests from employers</p>
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

                {/* Requests List */}
                <div className="card-premium overflow-hidden">
                    <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Filter by Status:</span>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="bg-background border border-border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="all">All Requests</option>
                                <option value="pending">Pending</option>
                                <option value="awaiting_candidate">Awaiting Candidate</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="candidate_unresponsive">Candidate Unresponsive</option>
                            </select>
                        </div>
                    </div>

                    <div className="divide-y divide-border">
                        {filteredRequests.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                No quote requests found
                            </div>
                        ) : (
                            filteredRequests.map((req) => (
                                <div key={req.id} className="p-6 hover:bg-secondary/20 transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className={cn(
                                                "p-3 rounded-xl",
                                                req.status === 'pending' ? "bg-warning/10 text-warning" :
                                                    req.status === 'approved' ? "bg-success/10 text-success" :
                                                        "bg-destructive/10 text-destructive"
                                            )}>
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-foreground">
                                                        Request #{req.id.slice(-6)}
                                                    </span>
                                                    <span className={cn(
                                                        "text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider",
                                                        req.status === 'pending' ? "bg-warning/10 text-warning" :
                                                            req.status === 'approved' ? "bg-success/10 text-success" :
                                                                "bg-destructive/10 text-destructive"
                                                    )}>
                                                        {req.status}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-muted-foreground mt-2">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="w-4 h-4" />
                                                        Employer: <span className="text-foreground">{req.employer?.companyName || 'Unknown Company'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4" />
                                                        Candidate: <span className="text-foreground">{req.candidate?.firstName} {req.candidate?.lastName}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="w-3.5 h-3.5" />
                                                            {req.candidate?.email}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="w-3.5 h-3.5" />
                                                            {req.candidate?.candidateProfile?.phone || 'No phone'}
                                                        </div>
                                                    </div>
                                                    {req.candidate?.isDeactivated && (
                                                        <div className="flex items-center gap-2 text-destructive font-bold">
                                                            <AlertCircle className="w-4 h-4" />
                                                            Candidate Deactivated (&gt;30 days inactive)
                                                        </div>
                                                    )}
                                                    {req.status === 'awaiting_candidate' && req.reactivationDeadline && (
                                                        <div className="flex items-center gap-2 text-warning font-bold">
                                                            <Clock className="w-4 h-4" />
                                                            SLA Deadline: {formatDistanceToNow(new Date(req.reactivationDeadline), { addSuffix: true })}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        Requested: {formatDistanceToNow(new Date(req.requestedAt), { addSuffix: true })}
                                                    </div>
                                                    {req.costEstimate && (
                                                        <div className="flex items-center gap-2">
                                                            <DollarSign className="w-4 h-4" />
                                                            Estimate: <span className="text-foreground font-medium">{req.costEstimate}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {['pending', 'awaiting_candidate'].includes(req.status) && (
                                            <button
                                                onClick={() => setSelectedRequest(selectedRequest?.id === req.id ? null : req)}
                                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium shrink-0"
                                            >
                                                {selectedRequest?.id === req.id ? 'Cancel' : 'Review Request'}
                                            </button>
                                        )}
                                    </div>

                                    {/* Review Action Panel */}
                                    {selectedRequest?.id === req.id && (
                                        <RequestActionPanel
                                            request={req}
                                            onResolve={handleResolve}
                                            onCancel={() => setSelectedRequest(null)}
                                            initialCost={req.candidate?.suggestedPlacementCost || ''}
                                        />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

// Extracted component to handle internal state properly
const RequestActionPanel = ({ request, onResolve, onCancel, initialCost }: { request: any, onResolve: any, onCancel: any, initialCost: string }) => {
    const [costEstimate, setCostEstimate] = useState(initialCost);
    const [altCandidate, setAltCandidate] = useState('');

    const isAwaiting = request.status === 'awaiting_candidate';

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 pt-6 border-t border-border"
        >
            <h4 className="font-bold mb-4">Process Request {isAwaiting ? '(SLA Escalation)' : ''}</h4>
            <div className="space-y-4">
                {isAwaiting ? (
                    <div>
                        <label className="block text-sm font-medium mb-1">Suggest Alternative Candidate (Optional)</label>
                        <input
                            type="text"
                            placeholder="Alternative Candidate ID"
                            value={altCandidate}
                            onChange={(e) => setAltCandidate(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            If the original candidate is unresponsive, you can suggest an alternative here.
                        </p>
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium mb-1">Cost Estimate</label>
                        <input
                            type="text"
                            placeholder="e.g. €5,000 - €7,000"
                            value={costEstimate}
                            onChange={(e) => setCostEstimate(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {initialCost ? 'Pre-filled from verification suggestion.' : 'Provide a cost range or fixed price for this placement'}
                        </p>
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onResolve(request.id, isAwaiting ? 'candidate_unresponsive' : 'rejected', undefined, altCandidate)}
                        className="px-4 py-2 border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition-colors text-sm font-medium"
                    >
                        {isAwaiting ? (altCandidate ? 'Suggest Alternative' : 'Mark Unresponsive') : 'Reject Request'}
                    </button>
                    {!isAwaiting && (
                        <button
                            onClick={() => onResolve(request.id, 'approved', costEstimate)}
                            className="px-4 py-2 bg-success text-white rounded-lg hover:brightness-110 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Approve & Send Quote
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default QuoteRequests;
