import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Search,
    ArrowRight,
    MessageSquare,
    FileText,
    CheckCircle2,
    Clock,
    Target,
    Filter,
    Briefcase,
    Star,
    History,
    MoreHorizontal,
    ExternalLink,
    ChevronDown,
    Building2,
    Calendar,
    ArrowUpDown
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { staffAPI, talentPoolAPI, CandidateStatus } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const statuses: { value: CandidateStatus; label: string; icon: any; color: string; bgColor: string }[] = [
    { value: 'potential', label: 'Potential', icon: Target, color: 'text-blue-500', bgColor: 'bg-blue-50' },
    { value: 'shortlisted', label: 'Shortlisted', icon: Star, color: 'text-amber-500', bgColor: 'bg-amber-50' },
    { value: 'asked_quote', label: 'Quote Requested', icon: FileText, color: 'text-success', bgColor: 'bg-emerald-50' },
    { value: 'interviewed', label: 'Interviewed', icon: MessageSquare, color: 'text-purple-500', bgColor: 'bg-purple-50' },
    { value: 'hired', label: 'Hired', icon: CheckCircle2, color: 'text-gold', bgColor: 'bg-gold/10' },
];

const StaffCandidatePipeline = () => {
    const [relations, setRelations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<CandidateStatus | 'all'>('all');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'updatedAt', direction: 'desc' });
    const { toast } = useToast();

    const loadRelations = useCallback(async () => {
        try {
            setLoading(true);
            const { relations: data } = await staffAPI.getAllCandidateRelations();
            setRelations(data || []);
        } catch (error) {
            console.error('Failed to load relations:', error);
            toast({
                title: 'Error',
                description: 'Failed to load pipeline data.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadRelations();
    }, [loadRelations]);

    const handleUpdateStatus = async (candidateId: string, employerId: string, newStatus: CandidateStatus) => {
        try {
            // Optimistic Update
            setRelations(prev => prev.map(rel =>
                (rel.candidateId === candidateId && rel.employerId === employerId)
                    ? { ...rel, status: newStatus, updatedAt: new Date().toISOString() }
                    : rel
            ));

            await talentPoolAPI.updateCandidateStatus(candidateId, newStatus, employerId);

            toast({
                title: 'Status Updated',
                description: `Candidate status updated successfully.`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update candidate status.',
                variant: 'destructive',
            });
            loadRelations(); // Revert
        }
    };

    const handleSort = (key: string) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const filteredAndSortedRelations = relations
        .filter(rel => {
            const matchesSearch =
                rel.candidate?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                rel.employerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                rel.candidate?.sector?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === 'all' || rel.status === statusFilter;

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            const aValue = a[sortConfig.key] || '';
            const bValue = b[sortConfig.key] || '';
            if (sortConfig.direction === 'asc') {
                return aValue > bValue ? 1 : -1;
            }
            return aValue < bValue ? 1 : -1;
        });

    return (
        <DashboardLayout role={window.location.pathname.startsWith('/admin') ? 'admin' : 'staff'}>
            <div className="space-y-8 pb-12">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-2">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 rounded-full bg-gold/10 text-gold text-[10px] font-black uppercase tracking-widest border border-gold/20 flex items-center gap-2">
                                <Users className="w-3 h-3" /> Talent Operations
                            </span>
                        </div>
                        <h1 className="text-4xl font-display font-bold text-foreground">
                            Global <span className="text-gold font-black">Pipeline</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 text-lg max-w-2xl leading-relaxed">
                            Efficiently track and manage thousands of candidate-employer relationships across the platform.
                        </p>
                    </motion.div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative group w-full sm:w-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-gold transition-colors" />
                            <input
                                type="text"
                                placeholder="Search candidates, companies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-6 py-3 rounded-xl bg-secondary border border-border/50 focus:border-gold/50 focus:ring-1 focus:ring-gold/50 outline-none transition-all w-full sm:w-72 text-sm font-medium shadow-sm"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="bg-secondary border-border/50 rounded-xl px-4 py-3 text-sm font-bold text-navy outline-none focus:ring-1 focus:ring-gold transition-all w-full sm:w-auto shadow-sm"
                        >
                            <option value="all">All Statuses</option>
                            {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                    </div>
                </div>

                {/* Statistics Row */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {statuses.map((status) => {
                        const count = relations.filter(r => r.status === status.value).length;
                        return (
                            <div key={status.value} className="card-premium p-4 flex items-center gap-3 bg-white hover:bg-secondary/10 transition-colors">
                                <div className={cn("p-2 rounded-lg", status.bgColor, status.color)}>
                                    <status.icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{status.label}</p>
                                    <p className="text-xl font-black text-navy">{count}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* List View Table */}
                <div className="card-premium p-0 overflow-hidden shadow-xl border-none">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-navy border-b border-white/10">
                                    <th className="px-6 py-5">
                                        <button onClick={() => handleSort('candidateId')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-gold transition-colors">
                                            Candidate <ArrowUpDown className="w-3 h-3" />
                                        </button>
                                    </th>
                                    <th className="px-6 py-5">
                                        <button onClick={() => handleSort('employerId')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-gold transition-colors">
                                            Partner Company <ArrowUpDown className="w-3 h-3" />
                                        </button>
                                    </th>
                                    <th className="px-6 py-5">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Current Status</span>
                                    </th>
                                    <th className="px-6 py-5">
                                        <button onClick={() => handleSort('updatedAt')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-gold transition-colors">
                                            Last Activity <ArrowUpDown className="w-3 h-3" />
                                        </button>
                                    </th>
                                    <th className="px-6 py-5 text-right">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                                                <p className="font-bold text-muted-foreground uppercase tracking-widest text-xs">Loading Pipeline Intelligence...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredAndSortedRelations.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <History className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                                            <h3 className="text-xl font-bold font-display">No Entries Found</h3>
                                            <p className="text-muted-foreground mt-1">Adjust your filters or search query.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAndSortedRelations.map((rel, index) => {
                                        const statusObj = statuses.find(s => s.value === rel.status) || statuses[0];
                                        return (
                                            <motion.tr
                                                key={`${rel.employerId}-${rel.candidateId}`}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.02 }}
                                                className="group hover:bg-secondary/20 transition-colors"
                                            >
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center text-sm font-black text-gold border border-gold/10 overflow-hidden shrink-0">
                                                            {rel.candidate?.avatarUrl ? (
                                                                <img src={rel.candidate.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                rel.candidate?.fullName?.charAt(0) || 'C'
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-foreground text-sm group-hover:text-gold transition-colors">{rel.candidate?.fullName}</span>
                                                                {rel.candidate?.isHiddenByUnresponsiveness && (
                                                                    <span className="px-1.5 py-0.5 rounded-md bg-orange-500 text-white text-[8px] font-black uppercase tracking-widest">NOT AVAILABLE</span>
                                                                )}
                                                                <Link to={`${window.location.pathname.startsWith('/admin') ? '/admin' : '/staff'}/users/${rel.candidateId}`} className="p-1 rounded hover:bg-white text-muted-foreground/40 hover:text-gold transition-all">
                                                                    <ExternalLink className="w-3 h-3" />
                                                                </Link>
                                                            </div>
                                                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{rel.candidate?.sector || 'EXPERT'}</p>
                                                            {(() => {
                                                                const lastActive = rel.candidate?.lastActiveAt ? new Date(rel.candidate.lastActiveAt) : null;
                                                                const isInactiveNow = lastActive && (Date.now() - lastActive.getTime()) > 15 * 24 * 60 * 60 * 1000;
                                                                
                                                                if (isInactiveNow) {
                                                                    return (
                                                                        <div className="flex items-center gap-1 mt-1 text-[9px] font-black text-orange-500 uppercase tracking-tighter animate-pulse">
                                                                            <Clock className="w-2.5 h-2.5" />
                                                                            <span>Inactive {formatDistanceToNow(lastActive, { addSuffix: true })}</span>
                                                                        </div>
                                                                    );
                                                                }
                                                                return null;
                                                            })()}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="w-4 h-4 text-gold/60" />
                                                        <div>
                                                            <p className="text-sm font-bold text-navy truncate max-w-[200px]">{rel.employerName}</p>
                                                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Partner Account</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <select
                                                        value={rel.status}
                                                        onChange={(e) => handleUpdateStatus(rel.candidateId, rel.employerId, e.target.value as CandidateStatus)}
                                                        className={cn(
                                                            "text-[10px] font-black uppercase tracking-widest border-none rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-gold cursor-pointer transition-all",
                                                            statusObj.bgColor, statusObj.color
                                                        )}
                                                    >
                                                        {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                                    </select>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                                            <Calendar className="w-3.5 h-3.5 text-gold" />
                                                            {formatDistanceToNow(new Date(rel.updatedAt), { addSuffix: true })}
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Active interaction</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Link
                                                            to={`${window.location.pathname.startsWith('/admin') ? '/admin' : '/staff'}/users/${rel.candidateId}`}
                                                            className="p-2 rounded-lg bg-white border border-border/50 text-muted-foreground hover:text-gold hover:border-gold/30 hover:shadow-sm transition-all shadow-inner"
                                                            title="View Details"
                                                        >
                                                            <ArrowRight className="w-4 h-4" />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Placeholder */}
                    {!loading && filteredAndSortedRelations.length > 10 && (
                        <div className="p-6 bg-secondary/10 border-t border-border/50 flex items-center justify-between">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Showing {filteredAndSortedRelations.length} active relationships</p>
                            <div className="flex items-center gap-2">
                                <button className="px-4 py-2 rounded-lg bg-white border border-border/50 text-xs font-black uppercase tracking-widest opacity-50 cursor-not-allowed">Previous</button>
                                <button className="px-4 py-2 rounded-lg bg-gold text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-gold/20">Next</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StaffCandidatePipeline;
