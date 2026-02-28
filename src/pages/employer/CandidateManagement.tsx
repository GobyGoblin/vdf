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
    MoreVertical,
    Briefcase,
    Star,
    GripVertical,
    Link as LinkIcon,
    DollarSign,
    Sparkles,
    Video,
    Lock
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { talentPoolAPI, interviewAPI, authAPI, quotesAPI, CandidateStatus } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import InterviewScheduler from '@/components/interviews/InterviewScheduler';

const statuses: { value: CandidateStatus; label: string; icon: any; color: string; description: string }[] = [
    { value: 'potential', label: 'Potential', icon: Target, color: 'text-blue-500', description: 'Exploring initial interest' },
    { value: 'shortlisted', label: 'Shortlisted', icon: Star, color: 'text-amber-500', description: 'Tagged for further review' },
    { value: 'asked_quote', label: 'Quote Requested', icon: FileText, color: 'text-success', description: 'Financial offer pending' },
    { value: 'interviewed', label: 'Interviewed', icon: MessageSquare, color: 'text-purple-500', description: 'Screening process active' },
    { value: 'hired', label: 'Hired', icon: CheckCircle2, color: 'text-gold', description: 'Onboarding completed' },
];

const EmployerCandidateManagement = () => {
    const [relations, setRelations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [schedulerOpen, setSchedulerOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
    const [schedulerLoading, setSchedulerLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [lockedCandidateIds, setLockedCandidateIds] = useState<Set<string>>(new Set());
    const { toast } = useToast();

    const loadRelations = useCallback(async () => {
        try {
            setLoading(true);
            const [{ relations: data }, quotesResp] = await Promise.all([
                talentPoolAPI.getMyCandidateRelations(),
                quotesAPI.getMyRequests(),
            ]);
            setRelations(data);

            // Build a set of candidateIds that have a pending quote → locked in asked_quote
            const pendingIds = new Set<string>();
            (quotesResp.requests || []).forEach((q: any) => {
                if (q.status === 'pending') pendingIds.add(q.candidateId);
            });
            setLockedCandidateIds(pendingIds);
        } catch (error) {
            console.error('Failed to load relations:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRelations();
        authAPI.getMe().then(({ user }) => setCurrentUser(user)).catch(console.error);
    }, [loadRelations]);

    const handleScheduleInterview = async (data: { title: string; proposedTimes: { datetime: string; duration: number }[]; notes?: string }) => {
        if (!selectedCandidate || !currentUser) return;
        setSchedulerLoading(true);
        try {
            await interviewAPI.schedule({
                candidateId: selectedCandidate.candidateId,
                employerId: currentUser.id,
                title: data.title,
                proposedTimes: data.proposedTimes,
                notes: data.notes
            });
            toast({ title: 'Interview scheduled!', description: `Invitation sent to ${selectedCandidate.candidate?.fullName}.` });
            setSchedulerOpen(false);
            setSelectedCandidate(null);
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        } finally {
            setSchedulerLoading(false);
        }
    };

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const newStatus = destination.droppableId as CandidateStatus;
        const [_, candidateId] = draggableId.split('::');

        // Block: candidate with pending quote cannot leave asked_quote
        if (lockedCandidateIds.has(candidateId) && source.droppableId === 'asked_quote') {
            toast({
                title: 'Locked',
                description: 'This candidate has a pending quote. The status cannot change until the quote is resolved.',
                variant: 'destructive',
            });
            return;
        }

        // Block: candidate cannot be dragged backwards out of interviewed or hired
        if (source.droppableId === 'interviewed' || source.droppableId === 'hired') {
            toast({
                title: 'Locked',
                description: 'Candidates in the interview stage or beyond must progress via the quote/payment flow.',
                variant: 'destructive',
            });
            return;
        }

        // Optimistic Update
        const updatedRelations = relations.map(rel => {
            if (rel.candidateId === candidateId) {
                return { ...rel, status: newStatus, updatedAt: new Date().toISOString() };
            }
            return rel;
        });
        setRelations(updatedRelations);

        try {
            await talentPoolAPI.updateCandidateStatus(candidateId, newStatus);

            // Auto-create quote request when dragged to "Quote Requested"
            if (newStatus === 'asked_quote') {
                try {
                    await talentPoolAPI.requestQuote(candidateId);
                    toast({
                        title: 'Quote Requested',
                        description: `Candidate moved to Quote Requested. A quote request has been sent to staff.`,
                    });
                } catch (quoteErr: any) {
                    // Quote may already exist, still show success for status change
                    toast({
                        title: 'Status Updated',
                        description: quoteErr.response?.data?.error?.includes('already')
                            ? 'Candidate already has a pending quote request.'
                            : `Candidate moved to ${statuses.find(s => s.value === newStatus)?.label}.`,
                    });
                }
            } else {
                toast({
                    title: 'Status Updated',
                    description: `Candidate moved to ${statuses.find(s => s.value === newStatus)?.label}.`,
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update candidate status.',
                variant: 'destructive',
            });
            loadRelations(); // Revert on failure
        }
    };

    const getCandidatesInStatus = (status: CandidateStatus) => {
        return relations.filter(rel =>
            rel.status === status &&
            (rel.candidate?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                rel.candidate?.sector?.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    };

    return (
        <DashboardLayout role="employer">
            <div className="space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 rounded-full bg-gold/10 text-gold text-[10px] font-black uppercase tracking-widest border border-gold/20 flex items-center gap-2">
                                <Sparkles className="w-3 h-3" /> Institutional Recruitment pipeline 2.0
                            </span>
                        </div>
                        <h1 className="text-4xl font-display font-bold text-foreground">
                            Candidate <span className="text-gold font-black">Pipeline</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 text-lg max-w-2xl leading-relaxed">
                            Integrated Kanban management for Germany's top talent acquisition flow. Monitor and manage your candidates as they move through the recruitment stages.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-4"
                    >
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-gold transition-colors" />
                            <input
                                type="text"
                                placeholder="Search candidates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-6 py-3 rounded-xl bg-secondary border border-border/50 focus:border-gold/50 focus:ring-1 focus:ring-gold/50 outline-none transition-all w-64 text-sm font-medium"
                            />
                        </div>
                        <Link to="/employer/talent-pool" className="flex items-center gap-3 px-6 py-3 rounded-xl bg-navy text-white font-black uppercase tracking-widest text-[10px] hover:shadow-xl hover:shadow-navy/20 transition-all border border-navy/20">
                            <Users className="w-4 h-4 text-gold" /> Find More Talent
                        </Link>
                    </motion.div>
                </div>

                {/* Kanban Board */}
                {loading && relations.length === 0 ? (
                    <div className="flex items-center justify-center h-[400px]">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full"
                        />
                    </div>
                ) : (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 pb-12 pt-4 items-stretch">
                            {statuses.map((status) => {
                                const candidates = getCandidatesInStatus(status.value);
                                return (
                                    <div key={status.value} className="flex flex-col group min-w-0">
                                        <div className="mb-4 flex items-center justify-between px-2">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("p-1.5 rounded-lg bg-white shadow-sm border border-border/50", status.color)}>
                                                    <status.icon className="w-4 h-4" />
                                                </div>
                                                <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-1.5 truncate">
                                                    {status.label}
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/50">
                                                        {candidates.length}
                                                    </span>
                                                </h3>
                                            </div>
                                        </div>

                                        <Droppable droppableId={status.value}>
                                            {(provided, snapshot) => (
                                                <div
                                                    {...provided.droppableProps}
                                                    ref={provided.innerRef}
                                                    className={cn(
                                                        "flex-1 rounded-[2rem] p-3 transition-all duration-300 border-2 min-h-[500px]",
                                                        snapshot.isDraggingOver
                                                            ? "bg-gold/[0.05] border-gold/20 shadow-inner"
                                                            : "bg-secondary/20 border-transparent"
                                                    )}
                                                >
                                                    <div className="space-y-4">
                                                        <AnimatePresence mode="popLayout">
                                                            {candidates.map((rel, index) => (
                                                                <Draggable
                                                                    key={rel.id}
                                                                    draggableId={`cand::${rel.candidateId}`}
                                                                    index={index}
                                                                    isDragDisabled={
                                                                        (lockedCandidateIds.has(rel.candidateId) && rel.status === 'asked_quote') ||
                                                                        rel.status === 'interviewed' ||
                                                                        rel.status === 'hired'
                                                                    }
                                                                >
                                                                    {(provided, snapshot) => {
                                                                        const isLocked = (lockedCandidateIds.has(rel.candidateId) && rel.status === 'asked_quote') ||
                                                                            rel.status === 'interviewed' ||
                                                                            rel.status === 'hired';
                                                                        return (
                                                                            <div
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                {...provided.dragHandleProps}
                                                                                className={cn(
                                                                                    "group relative bg-white rounded-2xl p-5 border shadow-sm transition-all select-none",
                                                                                    isLocked
                                                                                        ? "border-gold/30 bg-gold/[0.02] cursor-not-allowed"
                                                                                        : snapshot.isDragging
                                                                                            ? "shadow-2xl ring-2 ring-gold border-gold z-50 rotate-2 scale-105"
                                                                                            : "border-border/50 hover:border-gold/30 hover:shadow-md h-full"
                                                                                )}
                                                                            >
                                                                                <div className="space-y-4">
                                                                                    <div className="flex items-start justify-between">
                                                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                                            <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center text-sm font-black text-gold border border-gold/10 overflow-hidden shrink-0">
                                                                                                {rel.candidate?.fullName.charAt(0)}
                                                                                            </div>
                                                                                            <div className="min-w-0 flex-1">
                                                                                                <h4 className="font-bold text-sm text-foreground group-hover:text-gold transition-colors truncate">
                                                                                                    {rel.candidate?.fullName}
                                                                                                </h4>
                                                                                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter truncate">
                                                                                                    {rel.candidate?.sector || 'Verified Pro'}
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>
                                                                                        {isLocked
                                                                                            ? <Lock className="w-4 h-4 text-gold/50 shrink-0" />
                                                                                            : <GripVertical className="w-4 h-4 text-muted-foreground/20 group-hover:text-gold/40 transition-colors shrink-0" />
                                                                                        }
                                                                                    </div>

                                                                                    <div className="flex flex-wrap gap-1.5">
                                                                                        {rel.candidate?.skills?.slice(0, 2).map((skill: string) => (
                                                                                            <span key={skill} className="px-2 py-0.5 rounded bg-secondary text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                                                                                                {skill}
                                                                                            </span>
                                                                                        ))}
                                                                                    </div>

                                                                                    <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                                                                                        <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground">
                                                                                            <Clock className="w-3 h-3" />
                                                                                            {new Date(rel.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                                                        </div>
                                                                                        <div className="flex gap-2">
                                                                                            <Link
                                                                                                to={`/employer/talent-pool/${rel.candidateId}`}
                                                                                                className="p-1.5 rounded-lg bg-gold/5 text-gold hover:bg-gold hover:text-navy transition-all border border-gold/10"
                                                                                            >
                                                                                                <ArrowRight className="w-3 h-3" />
                                                                                            </Link>
                                                                                        </div>
                                                                                    </div>

                                                                                    {rel.status === 'asked_quote' && (
                                                                                        <Link
                                                                                            to={`/employer/talent-pool/${rel.candidateId}`}
                                                                                            onClick={(e) => e.stopPropagation()}
                                                                                            className="mt-2 p-2 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-between hover:bg-gold/20 transition-all"
                                                                                        >
                                                                                            <span className="text-[8px] font-black uppercase tracking-widest text-gold">Quote Pending · View Profile</span>
                                                                                            <Sparkles className="w-3 h-3 text-gold" />
                                                                                        </Link>
                                                                                    )}

                                                                                    {(rel.status === 'interviewed' || rel.status === 'shortlisted' || rel.status === 'asked_quote') && (
                                                                                        <button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                setSelectedCandidate(rel);
                                                                                                setSchedulerOpen(true);
                                                                                            }}
                                                                                            className="mt-2 w-full flex items-center justify-center gap-1.5 p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 hover:bg-purple-500/20 transition-all"
                                                                                        >
                                                                                            <Video className="w-3 h-3" />
                                                                                            <span className="text-[8px] font-black uppercase tracking-widest">Schedule Interview</span>
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    }}
                                                                </Draggable>
                                                            ))}
                                                        </AnimatePresence>
                                                        {provided.placeholder}
                                                    </div>
                                                </div>
                                            )}
                                        </Droppable>
                                    </div>
                                );
                            })}
                        </div>
                    </DragDropContext>
                )}
            </div>

            <InterviewScheduler
                isOpen={schedulerOpen}
                onClose={() => { setSchedulerOpen(false); setSelectedCandidate(null); }}
                onSchedule={handleScheduleInterview}
                candidateName={selectedCandidate?.candidate?.fullName || 'Candidate'}
                loading={schedulerLoading}
            />
        </DashboardLayout>
    );
};

export default EmployerCandidateManagement;
