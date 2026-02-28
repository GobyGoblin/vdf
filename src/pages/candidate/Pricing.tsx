import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout';
import { Shield, CheckCircle2, Star, Zap, CreditCard } from 'lucide-react';
import { candidateAPI, Plan } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const CandidatePricing = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            console.log('Loading plans...');
            const result = await candidateAPI.getPlans();
            console.log('Plans loaded:', result);
            if (result && result.plans) {
                setPlans(result.plans);
            } else {
                console.error('No plans returned');
            }
        } catch (error) {
            console.error('Failed to load plans:', error);
            toast({
                title: 'Error',
                description: 'Failed to load subscription plans. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (planId: string) => {
        try {
            await candidateAPI.subscribeToPlan(planId);
            toast({
                title: 'Success',
                description: 'Plan subscription successful!',
            });
            navigate('/candidate/review-status');
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to subscribe',
                variant: 'destructive',
            });
        }
    };

    return (
        <DashboardLayout role="candidate">
            <div className="space-y-8 max-w-5xl mx-auto">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-display font-bold text-foreground">Verification Plans</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Choose a plan to verify your profile and increase your visibility to top employers.
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-20">Loading plans...</div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                        {plans.map((plan, i) => (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`relative flex flex-col h-full overflow-hidden rounded-3xl border p-8 transition-all duration-300 hover:shadow-xl ${plan.badgeType === 'gold'
                                    ? 'border-gold/40 bg-gradient-to-br from-gold/5 via-navy/5 to-gold/5 shadow-lg shadow-gold/5'
                                    : plan.badgeType === 'blue'
                                        ? 'border-info/30 bg-gradient-to-br from-info/5 via-background to-info/5 shadow-lg shadow-info/5'
                                        : 'border-border bg-card/50 hover:border-foreground/20'
                                    }`}
                            >
                                {plan.badgeType === 'gold' && (
                                    <div className="absolute top-0 right-0 px-4 py-1.5 bg-gold text-navy text-[10px] font-black uppercase tracking-widest rounded-bl-xl shadow-sm">
                                        Most Popular
                                    </div>
                                )}

                                {/* Header Section */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner shrink-0 ${plan.badgeType === 'gold' ? 'bg-gold text-navy' :
                                            plan.badgeType === 'blue' ? 'bg-info text-white' :
                                                'bg-muted text-muted-foreground'
                                            }`}>
                                            {plan.badgeType === 'gold' ? <Star className="w-6 h-6 fill-navy" /> :
                                                plan.badgeType === 'blue' ? <Shield className="w-6 h-6 fill-white/20" /> :
                                                    <Zap className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">{plan.name}</h3>
                                            <div className="flex items-baseline gap-1">
                                                <span className={`text-2xl font-black ${plan.badgeType === 'gold' ? 'text-navy dark:text-gold' :
                                                    plan.badgeType === 'blue' ? 'text-info-dark dark:text-info' :
                                                        'text-foreground'
                                                    }`}>{plan.price === 0 ? 'Free' : plan.price}</span>
                                                {plan.price > 0 && <span className="text-sm font-bold text-muted-foreground">{plan.currency} / year</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground text-sm leading-relaxed min-h-[40px]">{plan.description}</p>
                                </div>

                                <div className="w-full h-px bg-border/50 mb-6" />

                                {/* Features - flex-1 pushes button down */}
                                <ul className="space-y-3 mb-8 flex-1">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <div className={`p-0.5 rounded-full mt-0.5 ${plan.badgeType === 'gold' ? 'text-gold-dark' :
                                                plan.badgeType === 'blue' ? 'text-info' :
                                                    'text-muted-foreground'
                                                }`}>
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium opacity-90">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleSubscribe(plan.id)}
                                    className={`w-full py-3.5 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] mt-auto ${plan.badgeType === 'gold'
                                        ? 'bg-gold text-navy hover:brightness-110 shadow-gold/20'
                                        : plan.badgeType === 'blue'
                                            ? 'bg-info text-white hover:brightness-110 shadow-info/20'
                                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                        }`}
                                >
                                    {plan.price === 0 ? 'Get Started' : `Select ${plan.name}`}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CandidatePricing;
