import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Calendar, Clock, Plus, Filter, Search, Sparkles, CheckCircle2, XCircle, Building2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { interviewAPI, authAPI } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import InterviewCard from '@/components/interviews/InterviewCard';
import InterviewScheduler from '@/components/interviews/InterviewScheduler';

const EmployerInterviews = () => {
    const [interviews, setInterviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
    const { toast } = useToast();
    const navigate = useNavigate();

    const loadInterviews = async () => {
        try {
            const { interviews: data } = await interviewAPI.getMyInterviews();
            setInterviews(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadInterviews(); }, []);

    const handleCancel = async (id: string) => {
        try {
            await interviewAPI.cancel(id);
            toast({ title: 'Interview cancelled' });
            loadInterviews();
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
    };

    const handleComplete = async (id: string) => {
        try {
            await interviewAPI.complete(id);
            toast({ title: 'Interview completed', description: 'The candidate has been moved to "Interviewed" in your pipeline.' });
            loadInterviews();
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
    };

    const handleJoinCall = (roomId: string) => {
        navigate(`/meeting/${roomId}`);
    };

    const filtered = filter === 'all' ? interviews : interviews.filter(i => i.status === filter);

    const counts = {
        all: interviews.length,
        pending: interviews.filter(i => i.status === 'pending').length,
        confirmed: interviews.filter(i => i.status === 'confirmed').length,
        completed: interviews.filter(i => i.status === 'completed').length,
        cancelled: interviews.filter(i => i.status === 'cancelled').length,
    };

    return (
        <DashboardLayout role="employer">
            <div className="space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-bold text-gold bg-gold/10 px-3 py-1 rounded-full border border-gold/20 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" /> Interviews 2.0
                            </span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-foreground">
                            Interview Schedule
                        </h1>
                        <p className="text-muted-foreground mt-1 text-lg">
                            Manage video interviews with your candidates
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 px-2 flex-wrap">
                    {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-sm font-semibold transition-all border",
                                filter === f
                                    ? "bg-foreground text-white border-foreground shadow-lg"
                                    : "bg-white text-muted-foreground border-border/50 hover:bg-secondary"
                            )}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                            <span className="ml-1.5 text-xs opacity-60">({counts[f]})</span>
                        </button>
                    ))}
                </div>

                {/* Interview List */}
                {loading ? (
                    <div className="flex items-center justify-center h-[300px]">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full"
                        />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
                            <Video className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-1">No interviews yet</h3>
                        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                            Schedule interviews with candidates from your pipeline to get started.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2">
                        <AnimatePresence>
                            {filtered.map(interview => (
                                <InterviewCard
                                    key={interview.id}
                                    interview={interview}
                                    currentUserRole="employer"
                                    onCancel={handleCancel}
                                    onComplete={handleComplete}
                                    onJoinCall={handleJoinCall}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default EmployerInterviews;
