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
    GripVertical,
    Link as LinkIcon,
    Sparkles,
    Building2,
    History
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { staffAPI, talentPoolAPI, CandidateStatus } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const statuses: { value: CandidateStatus; label: string; icon: any; color: string; description: string }[] = [
    { value: 'potential', label: 'Potential', icon: Target, color: 'text-blue-500', description: 'Exploring initial interest' },
    { value: 'shortlisted', label: 'Shortlisted', icon: Star, color: 'text-amber-500', description: 'Tagged for further review' },
    { value: 'asked_quote', label: 'Quote Requested', icon: FileText, color: 'text-success', description: 'Financial offer pending' },
    { value: 'interviewed', label: 'Interviewed', icon: MessageSquare, color: 'text-purple-500', description: 'Screening process active' },
    { value: 'hired', label: 'Hired', icon: CheckCircle2, color: 'text-gold', description: 'Onboarding completed' },
];

const StaffCandidatePipeline = () => {
    const [relations, setRelations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { toast } = useToast();

    const loadRelations = useCallback(async () => {
        try {
            setLoading(true);
            const { relations: data } = await staffAPI.getAllCandidateRelations();
            setRelations(data);
        } catch (error) {
            console.error('Failed to load relations:', error);
            toast({
                title: 'Error',
                description: 'Failed to load global pipeline data.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadRelations();
    }, [loadRelations]);

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const newStatus = destination.droppableId as CandidateStatus;
        // Use '::' as separator to avoid issues with IDs containing '-'
        const [_, employerId, candidateId] = draggableId.split('::');

        // Find the relation to update
        const relation = relations.find(r => r.candidateId === candidateId && r.employerId === employerId);
        if (!relation) return;

        // Optimistic Update
        const updatedRelations = relations.map(rel => {
            if (rel.candidateId === candidateId && rel.employerId === employerId) {
                return { ...rel, status: newStatus, updatedAt: new Date().toISOString() };
            }
            return rel;
        });
        setRelations(updatedRelations);

        try {
            await talentPoolAPI.updateCandidateStatus(candidateId, newStatus, employerId);

            toast({
                title: 'Status Updated',
                description: `${relation.candidate?.fullName}'s status updated to ${statuses.find(s => s.value === newStatus)?.label}.`,
            });
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
                rel.candidate?.sector?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                rel.employerName?.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    };

    return (
        <DashboardLayout role="staff">
            <div className="space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 rounded-full bg-gold/10 text-gold text-[10px] font-black uppercase tracking-widest border border-gold/20 flex items-center gap-2">
                                <Sparkles className="w-3 h-3" /> Staff Operational View
                            </span>
                        </div>
                        <h1 className="text-4xl font-display font-bold text-foreground">
                            Global <span className="text-gold font-black">Pipeline</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 text-lg max-w-2xl leading-relaxed">
                            Monitor recruitment activity across all employer partners. Oversee candidate progression and provide institutional support for placement finalization.
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
                                placeholder="Search all partners..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-6 py-3 rounded-xl bg-secondary border border-border/50 focus:border-gold/50 focus:ring-1 focus:ring-gold/50 outline-none transition-all w-64 text-sm font-medium"
                            />
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-muted-foreground bg-secondary/50 px-4 py-3 rounded-xl border border-border/50 shrink-0">
                            <History className="w-4 h-4 text-gold" /> {relations.length} Active
                        </div>
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
                                                                    key={`${rel.employerId}-${rel.candidateId}`}
                                                                    draggableId={`rel::${rel.employerId}::${rel.candidateId}`}
                                                                    index={index}
                                                                >
                                                                    {(provided, snapshot) => (
                                                                        <div
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            className={cn(
                                                                                "group relative bg-white rounded-2xl p-5 border shadow-sm transition-all select-none",
                                                                                snapshot.isDragging
                                                                                    ? "shadow-2xl ring-2 ring-gold border-gold z-50 scale-105"
                                                                                    : "border-border/50 hover:border-gold/30 hover:shadow-md h-full"
                                                                            )}
                                                                        >
                                                                            <div className="space-y-4">
                                                                                <div className="flex items-start justify-between">
                                                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                                        <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center text-sm font-black text-gold border border-gold/10 overflow-hidden shrink-0">
                                                                                            {rel.candidate?.avatarUrl ? (
                                                                                                <img src={rel.candidate.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                                                            ) : (
                                                                                                rel.candidate?.fullName.charAt(0)
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="min-w-0 flex-1">
                                                                                            <h4 className="font-bold text-sm text-foreground group-hover:text-gold transition-colors truncate">
                                                                                                {rel.candidate?.fullName}
                                                                                            </h4>
                                                                                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter truncate">
                                                                                                {rel.candidate?.sector || 'EXPERT'}
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <GripVertical className="w-4 h-4 text-muted-foreground/20 group-hover:text-gold/40 transition-colors shrink-0" />
                                                                                </div>

                                                                                <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/40">
                                                                                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1">Partner</p>
                                                                                    <p className="text-xs font-bold text-navy truncate">
                                                                                        {rel.employerName}
                                                                                    </p>
                                                                                </div>

                                                                                <div className="pt-4 border-t border-border/50 flex items-center justify-between gap-2 overflow-hidden">
                                                                                    <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground">
                                                                                        <Clock className="w-3 h-3" />
                                                                                        {new Date(rel.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                                                    </div>
                                                                                    {rel.status === 'asked_quote' && (
                                                                                        <div className="px-2 py-0.5 rounded bg-success text-white text-[8px] font-black uppercase shrink-0">
                                                                                            READY
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
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
        </DashboardLayout>
    );
};

export default StaffCandidatePipeline;
