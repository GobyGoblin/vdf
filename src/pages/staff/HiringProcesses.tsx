import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout';
import {
    Clock,
    Search,
    CheckCircle2,
    Loader2,
    FileText,
    Plane,
    Home,
    BadgeCheck,
    Briefcase
} from 'lucide-react';
import { staffAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const STEPS_CONFIG = [
    { id: 'contract', label: 'Contract Signing', icon: FileText },
    { id: 'visa_application', label: 'Visa Application', icon: Briefcase },
    { id: 'work_permit', label: 'Work Permit', icon: BadgeCheck },
    { id: 'relocation', label: 'Relocation', icon: Plane },
    { id: 'onboarding', label: 'Onboarding', icon: Home }
];

const StaffHiringProcesses = () => {
    const [processes, setProcesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [updatingStep, setUpdatingStep] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        loadProcesses();
    }, []);

    const loadProcesses = async () => {
        try {
            setLoading(true);
            const data = await staffAPI.getHiringProcesses();
            setProcesses(data.processes || []);
        } catch (error) {
            console.error('Failed to load hiring processes:', error);
            toast({
                title: 'Error',
                description: 'Failed to load hiring processes.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStep = async (processId: string, stepId: string, field: 'status' | 'notes', value: string) => {
        setUpdatingStep(`${processId}-${stepId}`);
        try {
            const process = processes.find(p => p.id === processId);
            if (!process) return;

            let updatedSteps = [...process.steps];
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
            let newCurrentStep = process.currentStep;
            if (field === 'status' && value === 'in_progress') {
                newCurrentStep = stepId;
            }

            await staffAPI.updateHiringStep(processId, newCurrentStep, updatedSteps);

            setProcesses(processes.map(p =>
                p.id === processId
                    ? { ...p, steps: updatedSteps, currentStep: newCurrentStep, updatedAt: new Date().toISOString() }
                    : p
            ));

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

    const filteredProcesses = processes.filter(p =>
        p.candidate?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.employer?.employerProfile?.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout role="staff">
            <div className="space-y-8 pb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-4xl font-display font-bold text-foreground">
                            Hiring <span className="text-gold font-black">Processes</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
                            Manage active post-purchase relocation and onboarding steps for candidates.
                        </p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-gold transition-colors" />
                            <input
                                type="text"
                                placeholder="Search candidates or companies..."
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
                ) : filteredProcesses.length === 0 ? (
                    <div className="card-premium p-12 text-center">
                        <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
                        <h3 className="text-xl font-bold font-display">No Active Processes</h3>
                        <p className="text-muted-foreground mt-2">There are currently no active post-purchase hiring processes to manage.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredProcesses.map(process => (
                            <motion.div key={process.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-6">
                                <div className="flex flex-col md:flex-row justify-between mb-6 pb-6 border-b border-border/50">
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground font-display flex items-center gap-2">
                                            {process.candidate?.fullName}
                                            <span className="text-xs px-2 py-1 rounded bg-secondary text-muted-foreground font-medium uppercase tracking-widest">
                                                For: {process.employer?.employerProfile?.companyName || 'Company'}
                                            </span>
                                        </h2>
                                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                            <Clock className="w-4 h-4" /> Started {formatDistanceToNow(new Date(process.startedAt), { addSuffix: true })}
                                        </div>
                                    </div>
                                    {process.currentStep === 'completed' && (
                                        <div className="px-3 py-1 rounded-full bg-success/10 text-success text-xs font-black uppercase tracking-widest border border-success/20 h-fit self-start">
                                            Completed
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    {STEPS_CONFIG.map((stepConfig) => {
                                        const stepData = process.steps?.find((s: any) => s.name === stepConfig.id) || { status: 'pending', notes: '' };
                                        const isDone = stepData.status === 'done';
                                        const inProgress = stepData.status === 'in_progress' || process.currentStep === stepConfig.id;

                                        return (
                                            <div key={stepConfig.id} className={cn("p-4 rounded-xl border transition-colors", inProgress ? "bg-navy/5 border-navy/20" : "bg-white border-border/50")}>
                                                <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
                                                    <div className="flex items-center gap-4 w-64 shrink-0">
                                                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center",
                                                            isDone ? "bg-success/20 text-success" : inProgress ? "bg-warning/20 text-warning" : "bg-secondary text-muted-foreground"
                                                        )}>
                                                            {isDone ? <CheckCircle2 className="w-5 h-5" /> : inProgress ? <Loader2 className="w-5 h-5 animate-spin" /> : <stepConfig.icon className="w-5 h-5" />}
                                                        </div>
                                                        <span className="font-bold text-foreground text-sm uppercase tracking-widest">{stepConfig.label}</span>
                                                    </div>

                                                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                                                        <div className="lg:col-span-1">
                                                            <select
                                                                value={stepData.status}
                                                                onChange={(e) => handleUpdateStep(process.id, stepConfig.id, 'status', e.target.value)}
                                                                disabled={updatingStep === `${process.id}-${stepConfig.id}`}
                                                                className="w-full text-sm font-medium bg-secondary border-none rounded-lg p-2 focus:ring-1 focus:ring-gold"
                                                            >
                                                                <option value="pending">Pending</option>
                                                                <option value="in_progress">In Progress</option>
                                                                <option value="done">Done</option>
                                                            </select>
                                                        </div>
                                                        <div className="lg:col-span-3">
                                                            <input
                                                                type="text"
                                                                placeholder="Add notes..."
                                                                value={stepData.notes || ''}
                                                                onChange={(e) => {
                                                                    // Update local state smoothly, full request on blur?
                                                                    // For simplicity, handle it on blur or let user type with a small debounce. 
                                                                    // Better to use an onBlur to avoid too many requests
                                                                }}
                                                                onBlur={(e) => handleUpdateStep(process.id, stepConfig.id, 'notes', e.target.value)}
                                                                defaultValue={stepData.notes || ''}
                                                                disabled={updatingStep === `${process.id}-${stepConfig.id}`}
                                                                className="w-full text-sm placeholder:text-muted-foreground/50 border-none bg-secondary/50 rounded-lg p-2 focus:ring-1 focus:ring-gold"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default StaffHiringProcesses;
