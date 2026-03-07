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
import { staffAPI } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const STEPS_CONFIG = [
    { id: 'contract', label: 'Contract Signing', icon: FileText, desc: 'Finalizing employment agreements and terms.' },
    { id: 'visa_application', label: 'Visa Application', icon: Briefcase, desc: 'Applying for the appropriate German work visa.' },
    { id: 'work_permit', label: 'Work Permit Auth', icon: BadgeCheck, desc: 'Federal Employment Agency (BA) approval.' },
    { id: 'relocation', label: 'Relocation & Travel', icon: Plane, desc: 'Flight booking and temporary housing setup.' },
    { id: 'onboarding', label: 'Local Onboarding', icon: Home, desc: 'Registration, bank account, and tax ID setup.' }
];

const StaffHiringTracker = () => {
    const { id } = useParams<{ id: string }>();
    const [request, setRequest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updatingStep, setUpdatingStep] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (id) {
            loadData(id);
        }
    }, [id]);

    const loadData = async (requestId: string) => {
        try {
            setLoading(true);
            const data = await staffAPI.getHiringProcesses();
            const process = data.processes?.find((p: any) => p.id === requestId);
            setRequest(process);
        } catch (error) {
            console.error('Failed to load tracking data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStep = async (stepId: string, field: 'status' | 'notes', value: string) => {
        if (!request) return;
        setUpdatingStep(stepId);
        try {
            let updatedSteps = [...(request.steps || [])];
            let stepIndex = updatedSteps.findIndex((s: any) => s.name === stepId);

            if (stepIndex === -1) {
                updatedSteps.push({ name: stepId, status: 'pending', notes: '', updatedAt: new Date().toISOString() });
                stepIndex = updatedSteps.length - 1;
            }

            updatedSteps[stepIndex] = {
                ...updatedSteps[stepIndex],
                [field]: value,
                updatedAt: new Date().toISOString()
            };

            // Calculate currentStep
            let newCurrentStep = request.currentStep;
            if (field === 'status') {
                if (value === 'in_progress' || value === 'done') {
                    newCurrentStep = stepId;
                }
            }

            await staffAPI.updateHiringStep(request.id, newCurrentStep, updatedSteps);

            setRequest({
                ...request,
                steps: updatedSteps,
                currentStep: newCurrentStep,
                updatedAt: new Date().toISOString()
            });

            toast({
                title: 'Updated',
                description: 'Hiring process step updated successfully.',
            });
        } catch (error) {
            console.error('Update step error:', error);
            toast({
                title: 'Error',
                description: 'Failed to update step.',
                variant: 'destructive',
            });
        } finally {
            setUpdatingStep(null);
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="staff">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    if (!request) {
        return (
            <DashboardLayout role="staff">
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold mb-4">Tracking Not Available</h2>
                    <p className="text-muted-foreground mb-8">
                        The hiring tracking for this candidate has not started yet or the request is invalid.
                    </p>
                    <Link to="/staff/hiring" className="text-gold font-bold hover:underline">
                        Return to Hiring Processes
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    const { steps: processSteps, candidate, employer, currentStep } = request;

    return (
        <DashboardLayout role="staff">
            <div className="max-w-4xl mx-auto space-y-8 pb-12">
                <Link to="/staff/hiring" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-gold transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Hiring Processes
                </Link>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground">Manage Hiring Process</h1>
                        <p className="text-muted-foreground mt-2">
                            Tracking for <span className="text-gold font-black">{candidate?.fullName || 'Candidate'}</span>
                            <span className="mx-2">at</span>
                            <span className="font-bold text-foreground">{employer?.employerProfile?.companyName || 'Employer'}</span>
                        </p>
                    </div>
                    {request.updatedAt && (
                        <div className="text-sm text-muted-foreground flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-lg">
                            <Clock className="w-4 h-4" /> Last Updated: {formatDistanceToNow(new Date(request.updatedAt), { addSuffix: true })}
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
                            const inProgress = stepData.status === 'in_progress' || currentStep === stepConfig.id;
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
                                        "bg-white rounded-2xl p-6 shadow-sm border transition-all hover:border-gold/30 hover:shadow-gold/5",
                                        inProgress ? "border-gold/30 shadow-gold/5 bg-gold/[0.02]" : "border-border",
                                        isPending && "opacity-70"
                                    )}>
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-foreground font-display flex items-center gap-3">
                                                    {stepConfig.label}
                                                    {isDone && <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success font-black uppercase tracking-widest border border-success/20">Completed</span>}
                                                    {inProgress && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold font-black uppercase tracking-widest border border-gold/20">Active Stage</span>}
                                                </h3>
                                                <p className="text-muted-foreground mt-1 text-sm">{stepConfig.desc}</p>
                                            </div>
                                            <div className="shrink-0 min-w-[150px]">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Status</label>
                                                <select
                                                    value={stepData.status}
                                                    onChange={(e) => handleUpdateStep(stepConfig.id, 'status', e.target.value)}
                                                    disabled={updatingStep === stepConfig.id}
                                                    className="w-full text-xs font-bold bg-secondary border-none rounded-lg p-2 focus:ring-1 focus:ring-gold cursor-pointer"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="in_progress">In Progress</option>
                                                    <option value="done">Done</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Update Notes & Internal Comments</label>
                                            <textarea
                                                placeholder="Provide updates or internal notes for this step..."
                                                className="w-full text-sm bg-secondary/50 border-none rounded-xl p-4 focus:ring-1 focus:ring-gold min-h-[100px] resize-none"
                                                defaultValue={stepData.notes || ''}
                                                onBlur={(e) => {
                                                    if (e.target.value !== (stepData.notes || '')) {
                                                        handleUpdateStep(stepConfig.id, 'notes', e.target.value);
                                                    }
                                                }}
                                                disabled={updatingStep === stepConfig.id}
                                            />
                                        </div>

                                        {stepData.updatedAt && (
                                            <div className="mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 flex items-center gap-2">
                                                <Clock className="w-3 h-3" /> Updated {formatDistanceToNow(new Date(stepData.updatedAt), { addSuffix: true })}
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

export default StaffHiringTracker;
