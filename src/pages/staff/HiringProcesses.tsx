import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout';
import {
    Clock,
    Search,
    CheckCircle2,
    Loader2,
    ChevronRight,
    Building2,
    User
} from 'lucide-react';
import { staffAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
// The `cn` utility is no longer used in the updated component, so it can be removed.
// import { cn } from '@/lib/utils';

// STEPS_CONFIG is no longer used for rendering the list items, as the new layout is different.
// const STEPS_CONFIG = [
//     { id: 'contract', label: 'Contract Signing', icon: FileText },
//     { id: 'visa_application', label: 'Visa Application', icon: Briefcase },
//     { id: 'work_permit', label: 'Work Permit', icon: BadgeCheck },
//     { id: 'relocation', label: 'Relocation', icon: Plane },
//     { id: 'onboarding', label: 'Onboarding', icon: Home }
// ];

const StaffHiringProcesses = () => {
    const [processes, setProcesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    // The `updatingStep` state is no longer needed with the new layout.
    // const [updatingStep, setUpdatingStep] = useState<string | null>(null);
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

    // The `handleUpdateStep` function is no longer needed with the new layout.
    // const handleUpdateStep = async (processId: string, stepId: string, field: 'status' | 'notes', value: string) => {
    //     setUpdatingStep(`${processId}-${stepId}`);
    //     try {
    //         const process = processes.find(p => p.id === processId);
    //         if (!process) return;

    //         let updatedSteps = [...process.steps];
    //         let stepIndex = updatedSteps.findIndex((s: any) => s.name === stepId);

    //         if (stepIndex === -1) {
    //             updatedSteps.push({ name: stepId, status: 'pending', notes: '', updatedAt: new Date().toISOString() });
    //             stepIndex = updatedSteps.length - 1;
    //         }

    //         updatedSteps[stepIndex] = {
    //             ...updatedSteps[stepIndex],
    //             [field]: value,
    //             updatedAt: new Date().toISOString()
    //         };

    //         // Calculate currentStep
    //         let newCurrentStep = process.currentStep;
    //         if (field === 'status' && value === 'in_progress') {
    //             newCurrentStep = stepId;
    //         }

    //         await staffAPI.updateHiringStep(processId, newCurrentStep, updatedSteps);

    //         setProcesses(processes.map(p =>
    //             p.id === processId
    //                 ? { ...p, steps: updatedSteps, currentStep: newCurrentStep, updatedAt: new Date().toISOString() }
    //                 : p
    //         ));

    //         toast({
    //             title: 'Updated',
    //             description: 'Hiring process step updated successfully.',
    //         });
    //     } catch (error) {
    //         console.error('Update step error:', error);
    //         toast({
    //             title: 'Error',
    //             description: 'Failed to update step.',
    //             variant: 'destructive',
    //         });
    //     } finally {
    //         setUpdatingStep(null);
    //     }
    // };

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
                            Oversee and manage post-purchase onboarding for all active placements.
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
                    <div className="space-y-4">
                        {filteredProcesses.map((process, index) => {
                            const steps = process.steps || [];
                            const totalSteps = 5; // Configured steps
                            const completedSteps = steps.filter((s: any) => s.status === 'done').length;
                            const progressPercent = Math.round((completedSteps / totalSteps) * 100);

                            return (
                                <motion.div
                                    key={process.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="card-premium p-0 overflow-hidden hover:border-gold/30 hover:shadow-xl transition-all group group-hover:bg-secondary/20"
                                >
                                    <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
                                        {/* Profile Section */}
                                        <div className="flex items-center gap-5 md:w-1/4 shrink-0">
                                            <div className="w-16 h-16 rounded-full bg-navy/5 flex items-center justify-center text-2xl font-black text-gold border-2 border-gold/20 overflow-hidden shadow-inner">
                                                {process.candidate?.avatarUrl ? (
                                                    <img src={process.candidate.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    process.candidate?.fullName?.charAt(0) || 'C'
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-xl text-foreground group-hover:text-gold transition-colors">{process.candidate?.fullName}</h3>
                                                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-muted-foreground">
                                                    <Building2 className="w-3 h-3 text-gold" />
                                                    {process.employer?.employerProfile?.companyName || 'Private Employer'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status & Progress Section */}
                                        <div className="flex-1 w-full bg-secondary/50 rounded-2xl p-5 border border-border/50">
                                            <div className="flex items-center justify-between mb-3 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-navy uppercase tracking-widest text-[10px] px-2 py-1 bg-white rounded-md border shadow-sm">Current State</span>
                                                    <span className="font-bold capitalize text-foreground flex items-center gap-2">
                                                        {process.currentStep?.replace('_', ' ')}
                                                        {process.currentStep === 'completed' && <CheckCircle2 className="w-4 h-4 text-success" />}
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
                                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Started: {formatDistanceToNow(new Date(process.startedAt), { addSuffix: true })}</span>
                                                <span>{completedSteps} of {totalSteps} Milestone Steps</span>
                                            </div>
                                        </div>

                                        {/* Action Section */}
                                        <div className="md:w-[200px] shrink-0 mt-4 md:mt-0 flex justify-end">
                                            <Link
                                                to={`/staff/hiring/${process.id}`}
                                                className="btn-gold w-full md:w-auto shadow-lg shadow-gold/20 flex items-center justify-center gap-2 py-3 px-6 text-sm font-bold"
                                            >
                                                Manage Process <ChevronRight className="w-4 h-4" />
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

export default StaffHiringProcesses;
