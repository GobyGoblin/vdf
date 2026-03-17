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
    AlertCircle,
    Users
} from 'lucide-react';
import { staffAPI, QuoteRequest, talentPoolAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const QuoteRequests = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'awaiting_candidate' | 'candidate_unresponsive'>('all');
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const response = await staffAPI.getQuoteRequests();
            setRequests(response.requests || []);
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
        try {
            await staffAPI.resolveQuoteRequest(requestId, status, finalCost || '', altCandidateId);
            toast({
                title: 'Success',
                description: `Request ${status.replace('_', ' ')} updated successfully.`,
            });
            setSelectedRequest(null);
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

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'pending': return {
                card: "bg-blue-50/40 border-blue-100/50 hover:bg-blue-50",
                badge: "bg-blue-100 text-blue-700 border-blue-200",
                icon: "bg-white text-blue-500",
                contact: "text-blue-600 hover:bg-blue-100/50"
            };
            case 'approved': return {
                card: "bg-emerald-50/40 border-emerald-100/50 hover:bg-emerald-50",
                badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
                icon: "bg-white text-emerald-500",
                contact: "text-emerald-600 hover:bg-emerald-100/50"
            };
            case 'rejected': return {
                card: "bg-slate-50/40 border-slate-200/50 hover:bg-slate-50",
                badge: "bg-slate-100 text-slate-600 border-slate-200",
                icon: "bg-white text-slate-400",
                contact: "text-slate-500 hover:bg-slate-200/50"
            };
            case 'awaiting_candidate': return {
                card: "bg-amber-50/40 border-amber-200/50 hover:bg-amber-50",
                badge: "bg-amber-100 text-amber-700 border-amber-200",
                icon: "bg-white text-amber-500",
                contact: "text-amber-600 hover:bg-amber-100"
            };
            case 'candidate_unresponsive': return {
                card: "bg-orange-50/40 border-orange-200/50 hover:bg-orange-50",
                badge: "bg-orange-100 text-orange-700 border-orange-200",
                icon: "bg-white text-orange-500",
                contact: "text-orange-600 hover:bg-orange-100"
            };
            default: return {
                card: "bg-slate-50/40 border-slate-200/50 hover:bg-slate-50",
                badge: "bg-slate-100 text-slate-500 border-slate-200",
                icon: "bg-white text-slate-400",
                contact: "text-slate-500 hover:bg-slate-100"
            };
        }
    };

    return (
        <DashboardLayout role={window.location.pathname.startsWith('/admin') ? 'admin' : 'staff'}>
            <div className="space-y-10 pb-20">
                {/* Minimalist Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                             <FileText className="w-3.5 h-3.5" /> Operations Center
                        </div>
                        <h1 className="text-4xl font-display font-bold text-slate-900">Quote Requests</h1>
                        <p className="text-slate-500 text-lg">Managing international placement pipelines.</p>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 px-3">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Filter</span>
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-900 focus:ring-1 focus:ring-gold/30 outline-none"
                        >
                            <option value="all">Global Pipeline</option>
                            <option value="pending">Pending Review</option>
                            <option value="awaiting_candidate">Awaiting Activation</option>
                            <option value="approved">Approved Quotes</option>
                            <option value="candidate_unresponsive">Alternative Required</option>
                        </select>
                    </div>
                </div>

                {/* Stats Grid - Ultra Minimalist */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Volume', value: requests.length, icon: FileText, color: 'text-slate-900', bg: 'bg-slate-50' },
                        { label: 'Pending Action', value: requests.filter(r => r.status === 'pending').length, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Approved', value: requests.filter(r => r.status === 'approved').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Action Required', value: requests.filter(r => r.status === 'candidate_unresponsive').length, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", stat.bg, stat.color)}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                                <p className="text-2xl font-display font-bold text-slate-900">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Request List */}
                <div className="space-y-6">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-40 bg-white rounded-[2rem] animate-pulse border border-slate-100" />
                        ))
                    ) : filteredRequests.length === 0 ? (
                        <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
                            <h3 className="text-xl font-bold text-slate-400 font-display">No requests in this queue</h3>
                        </div>
                    ) : (
                        filteredRequests.map((req) => {
                            const effectiveStatus = req.altCandidate ? 'candidate_unresponsive' : req.status;
                            const styles = getStatusStyles(effectiveStatus);
                            return (
                                <div key={req.id} className={cn(
                                    "border rounded-[2.5rem] p-8 transition-all",
                                    styles.card,
                                    selectedRequest?.id === req.id ? "ring-1 ring-gold/20 shadow-2xl" : "shadow-sm"
                                )}>
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                                        <div className="flex-1 flex flex-col md:flex-row md:items-center gap-10">
                                            {/* Candidate Cell */}
                                            <div className="flex items-center gap-5">
                                                <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center border shrink-0 shadow-sm", styles.icon)}>
                                                    <User className="w-8 h-8" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="text-xl font-bold font-display text-slate-900">
                                                            {req.candidate?.firstName} {req.candidate?.lastName}
                                                        </h3>
                                                        <span className={cn(
                                                            "text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border",
                                                            styles.badge
                                                        )}>
                                                            {effectiveStatus === 'candidate_unresponsive' ? 'NOT AVAILABLE' : req.status.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                                            <Mail className="w-3.5 h-3.5" /> {req.candidate?.email}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                                            <Phone className="w-3.5 h-3.5" /> {req.candidate?.candidateProfile?.phone || 'No phone'}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <a href={`mailto:${req.candidate?.email}`} className={cn("px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-current transition-all", styles.contact)}>
                                                                Email Candidate
                                                            </a>
                                                            <a href={`tel:${req.candidate?.candidateProfile?.phone || ''}`} className={cn("px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-current transition-all", styles.contact)}>
                                                                Direct Call
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="hidden md:block w-px h-16 bg-slate-200/50" />

                                            {/* Employer Cell */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                                    <Building2 className="w-3.5 h-3.5" /> Partner Entity
                                                </div>
                                                <p className="font-bold text-slate-800">{req.employer?.companyName || 'Private Employer'}</p>
                                                <p className="text-xs text-slate-400 font-medium">#{req.id.slice(-6)} • {formatDistanceToNow(new Date(req.requestedAt), { addSuffix: true })}</p>
                                            </div>
                                        </div>

                                        {/* Alternative / Replacement Section - High Visibility */}
                                        {req.altCandidate && (
                                            <div className="flex flex-col gap-2 bg-gold/5 p-4 rounded-[1.5rem] border border-gold/10 min-w-[240px]">
                                                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gold bg-gold/10 w-fit px-2 py-0.5 rounded-full">
                                                    <Users className="w-3 h-3" /> Replacement Active
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-white border border-gold/10 flex items-center justify-center shadow-sm">
                                                        <User className="w-5 h-5 text-gold" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-navy truncate max-w-[140px]">
                                                            {req.altCandidate.firstName} {req.altCandidate.lastName}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                                            ID: #{req.altCandidate.id?.slice(-4)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Zone */}
                                        <div className="flex items-center gap-4 lg:ml-6">
                                            {['pending', 'awaiting_candidate'].includes(req.status) ? (
                                                <button
                                                    onClick={() => setSelectedRequest(selectedRequest?.id === req.id ? null : req)}
                                                    className={cn(
                                                        "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg",
                                                        selectedRequest?.id === req.id 
                                                            ? "bg-slate-200 text-slate-600 hover:bg-slate-300 shadow-slate-200/20" 
                                                            : "bg-navy text-white hover:bg-gold hover:text-navy shadow-navy/10 hover:shadow-gold/20"
                                                    )}
                                                >
                                                    {selectedRequest?.id === req.id ? 'Cancel' : 'Process Request'}
                                                </button>
                                            ) : (
                                                <div className="flex flex-col items-end">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Quote Finalized</p>
                                                    <div className="text-xl font-display font-bold text-slate-900">{req.costEstimate || '—'}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Slide-down Resolution Panel */}
                                    {selectedRequest?.id === req.id && (
                                        <div className="mt-8 pt-8 border-t border-slate-200/50 animate-in slide-in-from-top-4 duration-300">
                                            <RequestActionPanel
                                                request={req}
                                                onResolve={handleResolve}
                                                onCancel={() => setSelectedRequest(null)}
                                                initialCost={req.candidate?.suggestedPlacementCost || ''}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )
                }
                </div>
            </div>
        </DashboardLayout>
    );
};

// Extracted component to handle internal state properly
const RequestActionPanel = ({ request, onResolve, onCancel, initialCost }: { request: any, onResolve: any, onCancel: any, initialCost: string }) => {
    const [costEstimate, setCostEstimate] = useState(initialCost);
    const [altCandidateSearch, setAltCandidateSearch] = useState('');
    const [suggestedCandidates, setSuggestedCandidates] = useState<any[]>([]);
    const [selectedAlt, setSelectedAlt] = useState<any | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [manualAltMode, setManualAltMode] = useState(false);

    const isAwaiting = request.status === 'awaiting_candidate';
    const showAltUI = isAwaiting || manualAltMode || selectedAlt;

    const handleSearch = async () => {
        if (!altCandidateSearch.trim()) return;
        setIsSearching(true);
        try {
            const response = await talentPoolAPI.getCandidates();
            const filtered = response.candidates.filter((c: any) => 
                (c.firstName + ' ' + (c.lastName || '')).toLowerCase().includes(altCandidateSearch.toLowerCase()) ||
                c.email.toLowerCase().includes(altCandidateSearch.toLowerCase())
            );
            setSuggestedCandidates(filtered);
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-10 pt-10 border-t border-slate-100"
        >
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h4 className="text-xl font-display font-bold text-slate-900">
                        {isAwaiting ? 'Response Required' : 'Process Request'}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium">Finalize the quote or suggest an alternative candidate.</p>
                </div>
                {!isAwaiting && !selectedAlt && (
                    <button 
                        onClick={() => setManualAltMode(!manualAltMode)}
                        className={cn(
                            "group flex items-center gap-2 px-5 py-2.5 rounded-full border text-[10px] font-black uppercase tracking-[0.1em] transition-all",
                            manualAltMode 
                                ? "bg-orange-50 text-orange-600 border-orange-200" 
                                : "bg-white text-slate-400 border-slate-200 hover:border-orange-300 hover:text-orange-500"
                        )}
                    >
                        <AlertCircle className={cn("w-3.5 h-3.5 transition-transform", manualAltMode && "rotate-180")} />
                        {manualAltMode ? "Standard Mode" : "Candidate Unresponsive?"}
                    </button>
                )}
            </div>

            <div className="space-y-8 max-w-2xl">
                {showAltUI ? (
                    <div className="space-y-6">
                        <div className="bg-orange-50/50 p-5 rounded-3xl border border-orange-100 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
                                <Users className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="pt-1">
                                <p className="text-sm text-orange-900 font-bold mb-1">
                                    {isAwaiting ? 'Automated SLA Escalation' : 'Manual Alternative pairing'}
                                </p>
                                <p className="text-xs text-orange-800/70 leading-relaxed font-medium">
                                    The original candidate is currently unavailable. Please select a replacement profile below to maintain the hiring speed for this employer.
                                </p>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Pair New Specialist</label>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email or sector..."
                                        value={altCandidateSearch}
                                        onChange={(e) => setAltCandidateSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-[1.25rem] focus:ring-2 focus:ring-gold/20 focus:border-gold focus:bg-white outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <button 
                                    onClick={handleSearch}
                                    disabled={isSearching}
                                    className="px-8 py-4 bg-navy text-white rounded-[1.25rem] hover:bg-gold hover:text-navy disabled:opacity-50 transition-all text-xs font-bold uppercase tracking-widest shadow-lg shadow-navy/10"
                                >
                                    {isSearching ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Search'}
                                </button>
                            </div>
                        </div>

                        {suggestedCandidates.length > 0 && !selectedAlt && (
                            <div className="max-h-64 overflow-y-auto bg-slate-50 border border-slate-100 rounded-[2rem] p-2 divide-y divide-slate-100/50">
                                {suggestedCandidates.map(cand => (
                                    <button
                                        key={cand.id}
                                        onClick={() => setSelectedAlt(cand)}
                                        className="w-full text-left p-4 hover:bg-white hover:shadow-md transition-all rounded-2xl flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center">
                                                <User className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{cand.firstName} {cand.lastName}</p>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{cand.sector || 'Unspecified Sector'}</p>
                                            </div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-gold/10 px-3 py-1.5 rounded-lg">
                                            <span className="text-[9px] font-black text-gold uppercase tracking-tighter">Select Profile</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {selectedAlt && (
                            <div className="p-6 rounded-[2rem] bg-gold/5 border border-gold/20 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                                        <User className="w-6 h-6 text-gold" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="text-base font-bold text-navy uppercase tracking-tight">{selectedAlt.firstName} {selectedAlt.lastName}</p>
                                            <span className="text-[10px] text-gold font-black uppercase">#{selectedAlt.id?.slice(-4)}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Active Replacement</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedAlt(null)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-destructive hover:border-destructive/20 hover:shadow-lg transition-all"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                ) : null}

                {( !showAltUI || (showAltUI && selectedAlt) ) && (
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            {selectedAlt ? 'Replacement Quote Value' : 'Strategic Placement Cost'}
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="e.g. €10,000 - €12,000"
                                value={costEstimate}
                                onChange={(e) => setCostEstimate(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-[1.25rem] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-bold"
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium ml-1">
                            {selectedAlt 
                                ? 'The partner entity will receive a revised quote for the replacement.' 
                                : 'Define the placement fee structure based on the verification reports.'}
                        </p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t border-slate-50">
                    <button
                        onClick={onCancel}
                        className="px-8 py-3.5 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-[10px] font-black uppercase tracking-widest text-slate-500"
                    >
                        Back to List
                    </button>
                    {!selectedAlt && (
                        <button
                            onClick={() => onResolve(request.id, 'rejected', '')}
                            className="px-8 py-3.5 border border-destructive/20 text-destructive rounded-2xl hover:bg-destructive/5 transition-all text-[10px] font-black uppercase tracking-widest"
                        >
                            Reject & Archive
                        </button>
                    )}
                    {(selectedAlt || isAwaiting) && (
                        <button
                            disabled={!selectedAlt}
                            onClick={() => onResolve(request.id, 'candidate_unresponsive', costEstimate, selectedAlt?.id)}
                            className={cn(
                                "px-8 py-3.5 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2",
                                selectedAlt 
                                    ? "bg-orange-500 text-white hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-500/20" 
                                    : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                            )}
                        >
                            <AlertCircle className="w-4 h-4" />
                            {selectedAlt ? 'Execute Replacement Pair' : 'Select Replacement First'}
                        </button>
                    )}
                    {!selectedAlt && !isAwaiting && (
                        <button
                            onClick={() => onResolve(request.id, 'approved', costEstimate)}
                            className="px-8 py-3.5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/20 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Approve & Publish Quote
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default QuoteRequests;
