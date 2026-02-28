import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Trash2,
    Clock,
    CheckCircle2,
    AlertCircle,
    X,
    Briefcase,
    Target,
    ArrowRight,
    Users,
    Filter,
    Link as LinkIcon
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { talentDemandsAPI, talentPoolAPI } from '@/lib/api';
import { TalentDemand } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const StaffTalentDemands = () => {
    const navigate = useNavigate();
    const [demands, setDemands] = useState<TalentDemand[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const { demands: demandsData } = await talentDemandsAPI.getAll();
            setDemands(demandsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (error) {
            console.error('Failed to load demands:', error);
            toast({ title: 'Error', description: 'Failed to load talent requests.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout role="staff">
            <div className="max-w-7xl mx-auto space-y-8 pb-20">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">Global Talent Demands</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Manage and fulfill custom profile requests from institutional partners.</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full" />
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Demands List */}
                        <div className="lg:col-span-2 space-y-4">
                            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">Active Quotas</h2>
                            {demands.map((demand) => (
                                <motion.div
                                    key={demand.id}
                                    onClick={() => navigate(`/staff/talent-demands/${demand.id}`)}
                                    className={cn(
                                        "card-premium p-6 cursor-pointer transition-all border-2 border-gold/10 hover:border-gold hover:bg-gold/5 group"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded bg-navy text-white text-[9px] font-black uppercase tracking-widest">
                                                    {demand.sector}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-medium">
                                                    {formatDistanceToNow(new Date(demand.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-display font-bold text-foreground group-hover:text-gold transition-colors">{demand.title}</h3>
                                                <ArrowRight className="w-5 h-5 text-gold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{demand.description}</p>
                                        </div>
                                        <div className="text-right shrink-0 space-y-2">
                                            <div className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                demand.status === 'open' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                                    demand.status === 'treating' ? "bg-warning/10 text-warning border-warning/20" :
                                                        demand.status === 'treated' ? "bg-success/10 text-success border-success/20" :
                                                            "bg-muted/10 text-muted-foreground border-muted/20"
                                            )}>
                                                {demand.status}
                                            </div>
                                            <div className="px-3 py-1 rounded-full bg-gold/10 text-gold text-[10px] font-black uppercase tracking-widest border border-gold/20">
                                                {demand.suggestedCandidateIds.length + (demand.manualProfiles?.length || 0)} Linked
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="space-y-6">
                            <div className="card-premium p-8 bg-gold/5 border-gold/20">
                                <h2 className="text-sm font-black uppercase tracking-widest text-gold mb-4">Operations Center</h2>
                                <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                                    Select a demand from the left to enter the high-precision fulfillment center. There you can link pool candidates or inject external profiles.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                        <span>Global Capacity</span>
                                        <span>{demands.length} Units</span>
                                    </div>
                                    <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                                        <div className="h-full bg-gold w-2/3" />
                                    </div>
                                </div>
                            </div>

                            <div className="card-premium p-8 bg-navy text-white border-navy">
                                <Target className="w-8 h-8 text-gold mb-4" />
                                <h3 className="text-lg font-display font-bold mb-2">Precision Fulfillment</h3>
                                <p className="text-xs opacity-70 mb-4">Our automated quoting engine is linked to every suggestion. Manifests are updated in real-time.</p>
                                <button className="w-full py-3 rounded-xl bg-gold text-navy font-black uppercase tracking-widest text-[10px]">
                                    Download Global Outlook
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default StaffTalentDemands;
