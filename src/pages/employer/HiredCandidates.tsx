import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout';
import { Loader2, CheckCircle2, ChevronRight, Search, Clock, FileText } from 'lucide-react';
import { quotesAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const EmployerHiredCandidates = () => {
    const [hiredQuotes, setHiredQuotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await quotesAPI.getMyRequests();
                // Filter only paid/hired quotes
                const hired = (data.requests || []).filter((q: any) => q.status === 'paid');
                setHiredQuotes(hired);
            } catch (error) {
                console.error('Failed to load hired candidates:', error);
                toast({
                    title: 'Error',
                    description: 'Could not load your hired candidates.',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [toast]);

    const filtered = hiredQuotes.filter(q =>
        q.candidate?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.candidate?.sector?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout role="employer">
            <div className="space-y-8 pb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-4xl font-display font-bold text-foreground">
                            Hired <span className="text-gold font-black">Candidates</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
                            Track the post-purchase onboarding and relocation progress for your confirmed hires.
                        </p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-gold transition-colors" />
                            <input
                                type="text"
                                placeholder="Search candidates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-6 py-3 rounded-xl bg-secondary border border-border/50 focus:border-gold/50 focus:ring-1 focus:ring-gold/50 outline-none transition-all w-72 text-sm font-medium"
                            />
                        </div>
                    </motion.div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin text-gold" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="card-premium p-12 text-center">
                        <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
                        <h3 className="text-xl font-bold font-display">No Hired Candidates Yet</h3>
                        <p className="text-muted-foreground mt-2">After you accept and pay for a quote, candidate onboarding tracking will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((quote, index) => {
                            const hp = quote.hiringProcess;

                            // Calculate progress percentage
                            const steps = hp?.steps || [];
                            const totalSteps = steps.length || 5;
                            const completedSteps = steps.filter((s: any) => s.status === 'done').length;
                            const progressPercent = hp ? Math.round((completedSteps / totalSteps) * 100) : 0;

                            return (
                                <motion.div
                                    key={quote.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="card-premium p-0 overflow-hidden hover:border-gold/30 hover:shadow-xl transition-all group group-hover:bg-secondary/20"
                                >
                                    <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
                                        {/* Profile Section */}
                                        <div className="flex items-center gap-5 md:w-1/4 shrink-0">
                                            <div className="w-16 h-16 rounded-full bg-navy/5 flex items-center justify-center text-2xl font-black text-gold border-2 border-gold/20 overflow-hidden shadow-inner">
                                                {quote.candidate?.avatarUrl ? (
                                                    <img src={quote.candidate.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    quote.candidate?.fullName?.charAt(0) || 'C'
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-xl text-foreground group-hover:text-gold transition-colors">
                                                    {quote.altCandidate?.fullName || quote.candidate?.fullName}
                                                </h3>
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    {quote.altCandidate?.sector || quote.candidate?.sector || 'Verified Professional'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status & Progress Section */}
                                        <div className="flex-1 w-full bg-secondary/50 rounded-2xl p-5 border border-border/50">
                                            <div className="flex items-center justify-between mb-3 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-navy uppercase tracking-widest text-[10px] px-2 py-1 bg-white rounded-md border shadow-sm">Current Status</span>
                                                    <span className="font-bold capitalize text-foreground flex items-center gap-2">
                                                        {hp ? hp.currentStep?.replace('_', ' ') : 'Pending Setup...'}
                                                        {hp?.currentStep === 'completed' && <CheckCircle2 className="w-4 h-4 text-success" />}
                                                    </span>
                                                </div>
                                                <span className="font-black text-gold text-lg">{progressPercent}%</span>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="h-3 w-full bg-white rounded-full overflow-hidden border shadow-inner">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progressPercent}%` }}
                                                    transition={{ duration: 1, delay: 0.2 }}
                                                    className="h-full bg-gold relative"
                                                >
                                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                                </motion.div>
                                            </div>

                                            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground font-medium">
                                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Started: {formatDistanceToNow(new Date(quote.updatedAt), { addSuffix: true })}</span>
                                                <span>{completedSteps} of {totalSteps} Steps Completed</span>
                                            </div>
                                        </div>

                                        {/* Action Section */}
                                        <div className="md:w-[200px] shrink-0 mt-4 md:mt-0 flex justify-end">
                                            <Link
                                                to={`/employer/quotes/${quote.id}/tracking`}
                                                className="btn-gold w-full md:w-auto shadow-lg shadow-gold/20 flex items-center justify-center gap-2 py-3 px-6 text-sm font-bold"
                                            >
                                                Open Board <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default EmployerHiredCandidates;
