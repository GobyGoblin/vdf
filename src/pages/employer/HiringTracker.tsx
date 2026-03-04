import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    Loader2,
    FileText,
    Plane,
    Home,
    BadgeCheck,
    Briefcase
} from 'lucide-react';
import { quotesAPI } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const STEPS_CONFIG = [
    { id: 'contract', label: 'Contract Signing', icon: FileText, desc: 'Finalizing employment agreements and terms.' },
    { id: 'visa_application', label: 'Visa Application', icon: Briefcase, desc: 'Applying for the appropriate German work visa.' },
    { id: 'work_permit', label: 'Work Permit Auth', icon: BadgeCheck, desc: 'Federal Employment Agency (BA) approval.' },
    { id: 'relocation', label: 'Relocation & Travel', icon: Plane, desc: 'Flight booking and temporary housing setup.' },
    { id: 'onboarding', label: 'Local Onboarding', icon: Home, desc: 'Registration, bank account, and tax ID setup.' }
];

const HiringTracker = () => {
    const { id } = useParams<{ id: string }>();
    const [request, setRequest] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadData(id);
        }
    }, [id]);

    const loadData = async (requestId: string) => {
        try {
            setLoading(true);
            const data = await quotesAPI.getById(requestId);
            setRequest(data.request || data);
        } catch (error) {
            console.error('Failed to load tracking data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="employer">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    if (!request || !request.hiringProcess) {
        return (
            <DashboardLayout role="employer">
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold mb-4">Tracking Not Available</h2>
                    <p className="text-muted-foreground mb-8">
                        The hiring tracking for this candidate has not started yet or the request is invalid.
                    </p>
                    <Link to="/employer/quotes" className="text-gold font-bold hover:underline">
                        Return to Quotes
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    const { hiringProcess, candidate } = request;
    const processSteps = hiringProcess.steps || [];

    return (
        <DashboardLayout role="employer">
            <div className="max-w-4xl mx-auto space-y-8 pb-12">
                <Link to="/employer/quotes" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-gold transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to My Quotes
                </Link>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground">Hiring Tracker</h1>
                        <p className="text-muted-foreground mt-2">
                            Tracking progress for <span className="text-gold font-black">{candidate?.fullName || 'Candidate'}</span>
                        </p>
                    </div>
                    {hiringProcess.updatedAt && (
                        <div className="text-sm text-muted-foreground flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-lg">
                            <Clock className="w-4 h-4" /> Last Updated: {formatDistanceToNow(new Date(hiringProcess.updatedAt), { addSuffix: true })}
                        </div>
                    )}
                </div>

                <div className="card-premium p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

                    <div className="space-y-12 relative z-10 pl-4 md:pl-12 border-l-2 border-secondary ml-4 md:ml-8 my-8 pb-8">
                        {STEPS_CONFIG.map((stepConfig, index) => {
                            const stepData = processSteps.find((s: any) => s.name === stepConfig.id) || { status: 'pending', notes: '' };
                            const Icon = stepConfig.icon;

                            const isDone = stepData.status === 'done';
                            const inProgress = stepData.status === 'in_progress' || hiringProcess.currentStep === stepConfig.id;
                            const isPending = stepData.status === 'pending' && !inProgress;

                            return (
                                <div key={stepConfig.id} className="relative">
                                    {/* Step Icon / Status Badge */}
                                    <div className={cn(
                                        "absolute -left-[54px] md:-left-[70px] w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center border-4 border-white shadow-xl bg-white",
                                    )}>
                                        {isDone ? (
                                            <div className="w-full h-full rounded-full bg-success/20 text-success flex items-center justify-center">
                                                <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" />
                                            </div>
                                        ) : inProgress ? (
                                            <div className="w-full h-full rounded-full bg-warning/20 text-warning flex items-center justify-center">
                                                <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin" />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full rounded-full bg-secondary text-muted-foreground/30 flex items-center justify-center">
                                                <Icon className="w-6 h-6 md:w-8 md:h-8" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className={cn(
                                        "bg-white rounded-2xl p-6 shadow-sm border transition-all",
                                        inProgress ? "border-warning/30 shadow-warning/5 bg-warning/5" : "border-border",
                                        isPending && "opacity-50"
                                    )}>
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-foreground font-display flex items-center gap-3">
                                                    {stepConfig.label}
                                                    {isDone && <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success font-black uppercase tracking-widest border border-success/20">Completed</span>}
                                                    {inProgress && <span className="text-[10px] px-2 py-0.5 rounded-full bg-warning/10 text-warning font-black uppercase tracking-widest border border-warning/20">In Progress</span>}
                                                </h3>
                                                <p className="text-muted-foreground mt-1 text-sm">{stepConfig.desc}</p>
                                            </div>
                                        </div>

                                        {stepData.notes && (
                                            <div className="mt-4 p-4 bg-navy/5 rounded-xl text-sm border border-navy/5">
                                                <span className="font-bold block mb-1 text-navy text-xs uppercase tracking-widest">Update Notes:</span>
                                                <p className="text-muted-foreground whitespace-pre-wrap">{stepData.notes}</p>
                                            </div>
                                        )}
                                        {stepData.updatedAt && (
                                            <div className="mt-4 text-xs font-black uppercase tracking-widest text-muted-foreground/50">
                                                Updated {formatDistanceToNow(new Date(stepData.updatedAt), { addSuffix: true })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default HiringTracker;
