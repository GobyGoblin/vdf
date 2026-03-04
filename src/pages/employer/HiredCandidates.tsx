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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map(quote => {
                            const hp = quote.hiringProcess;
                            return (
                                <motion.div key={quote.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card-premium flex flex-col h-full overflow-hidden hover:border-gold/30 hover:shadow-xl transition-all group">
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-navy/5 flex items-center justify-center text-xl font-black text-gold border border-gold/10 overflow-hidden shrink-0">
                                                    {quote.candidate?.avatarUrl ? (
                                                        <img src={quote.candidate.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        quote.candidate?.fullName?.charAt(0) || 'C'
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-foreground group-hover:text-gold transition-colors truncate w-40">{quote.candidate?.fullName}</h3>
                                                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{quote.candidate?.sector || 'Verified Pro'}</p>
                                                </div>
                                            </div>
                                            {hp?.currentStep === 'completed' && (
                                                <span className="px-2 py-1 rounded bg-success/10 text-success text-[10px] font-black uppercase tracking-widest border border-success/20">
                                                    Completed
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-auto space-y-4 pt-4 border-t border-border/50">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-4 h-4" /> Started</span>
                                                <span className="font-semibold">{formatDistanceToNow(new Date(quote.updatedAt), { addSuffix: true })}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm bg-secondary p-3 rounded-xl border border-border/50">
                                                <span className="text-muted-foreground flex items-center gap-1"><FileText className="w-4 h-4" /> Status</span>
                                                <span className="font-bold text-navy capitalize">
                                                    {hp ? hp.currentStep.replace('_', ' ') : 'Initializing...'}
                                                </span>
                                            </div>
                                            <Link
                                                to={`/employer/quotes/${quote.id}/tracking`}
                                                className="w-full btn-gold justify-between px-4 py-3 group-hover:shadow-lg group-hover:shadow-gold/20"
                                            >
                                                View Timeline <ChevronRight className="w-4 h-4" />
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
