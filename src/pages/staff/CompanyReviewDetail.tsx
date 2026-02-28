import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout';
import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    XCircle,
    Clock,
    Mail,
    MapPin,
    Calendar,
    Globe,
    Users,
    Info,
    Shield,
    Phone
} from 'lucide-react';
import { staffAPI, adminAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const CompanyReviewDetail = () => {
    const { companyId } = useParams<{ companyId: string }>();
    const navigate = useNavigate();
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (companyId) {
            loadData(companyId);
        }
    }, [companyId]);

    const loadData = async (id: string) => {
        try {
            setLoading(true);
            // We don't have a direct getCompanyById in staffAPI yet, let's use getPendingCompanies and filter or add one
            // For now, let's assume we can get it.
            const { companies } = await staffAPI.getPendingCompanies();
            const found = companies.find((c: any) => c.id === id);
            if (found) {
                setCompany(found);
            } else {
                // Try getting all employers if not in pending
                const { employers } = await adminAPI.getEmployers();
                const foundAny = employers.find((e: any) => e.id === id);
                setCompany(foundAny || null);
            }
        } catch (error) {
            console.error('Failed to load company:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!window.confirm('Verify this company?')) return;
        setSubmitting(true);
        try {
            await staffAPI.verifyEmployer(company.id, true);
            toast({ title: 'Success', description: 'Company verified successfully' });
            navigate('/staff/review-queue');
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to verify company', variant: 'destructive' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        const reason = window.prompt('Please provide a reason for rejection:');
        if (reason === null) return;
        if (!reason.trim()) {
            toast({ title: 'Error', description: 'Rejection reason is required', variant: 'destructive' });
            return;
        }

        setSubmitting(true);
        try {
            await staffAPI.verifyEmployer(company.id, false, reason);
            toast({ title: 'Success', description: 'Company rejected' });
            navigate('/staff/review-queue');
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to reject company', variant: 'destructive' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="staff">
                <div className="flex items-center justify-center h-64">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
                </div>
            </DashboardLayout>
        );
    }

    if (!company) {
        return (
            <DashboardLayout role="staff">
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-foreground mb-2">Company not found</h2>
                    <Link to="/staff/review-queue" className="text-gold hover:underline">
                        Back to Review Queue
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="staff">
            <div className="space-y-6">
                <button
                    onClick={() => navigate('/staff/review-queue')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Review Queue
                </button>

                <div className="flex flex-col lg:flex-row justify-between gap-6">
                    <div className="flex-1 space-y-6">
                        {/* Header Info */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-8">
                            <div className="flex items-start justify-between">
                                <div className="flex gap-6">
                                    <div className="w-20 h-20 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
                                        <Building2 className="w-10 h-10" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-display font-bold text-foreground mb-2">{company.companyName}</h1>
                                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> {company.website || 'No website'}</span>
                                            <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {company.contactEmail || company.email}</span>
                                            <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {company.phone || 'No phone'}</span>
                                        </div>
                                    </div>
                                </div>
                                {company.verificationStatus === 'rejected' ? (
                                    <div className="px-4 py-2 rounded-full bg-destructive/10 text-destructive text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                        <XCircle className="w-4 h-4" /> Rejected
                                    </div>
                                ) : company.verificationStatus === 'verified' ? (
                                    <div className="px-4 py-2 rounded-full bg-success/10 text-success text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Verified
                                    </div>
                                ) : (
                                    <div className="px-4 py-2 rounded-full bg-warning/10 text-warning text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> Pending Review
                                    </div>
                                )}
                            </div>

                            {/* Rejection Reason Alert */}
                            {company.verificationStatus === 'rejected' && company.rejectionReason && (
                                <div className="mt-6 p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-destructive">
                                    <div className="flex items-center gap-2 mb-2 font-bold">
                                        <XCircle className="w-4 h-4" /> Rejection Reason
                                    </div>
                                    <p className="text-sm opacity-90">{company.rejectionReason}</p>
                                </div>
                            )}
                        </motion.div>

                        {/* Company Story */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-premium p-8">
                            <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-foreground">
                                <Info className="w-5 h-5 text-gold" />
                                Company Overview
                            </h3>
                            <div className="space-y-8">
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2">About Us</p>
                                    <p className="text-foreground leading-relaxed italic border-l-2 border-gold/30 pl-4 py-1">
                                        {company.description || 'No description provided'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2">Vision & Mission</p>
                                    <p className="text-foreground leading-relaxed">
                                        {company.vision || 'No vision statement provided'}
                                    </p>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-8 pt-4 border-t border-border">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Industry</p>
                                        <p className="text-foreground font-semibold">{company.industry || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Company Size</p>
                                        <p className="text-foreground font-semibold">{company.companySize || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Founded Year</p>
                                        <p className="text-foreground font-semibold">{company.foundedYear || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Type of Society</p>
                                        <p className="text-foreground font-semibold">{company.societyType || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Register Number</p>
                                        <p className="text-foreground font-semibold font-mono">{company.registerNumber || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Training Company</p>
                                        <div className="flex items-center gap-2">
                                            {company.isTrainingCompany ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold/10 text-gold text-xs font-bold">
                                                    <CheckCircle2 className="w-3 h-3" /> Yes
                                                </span>
                                            ) : (
                                                <span className="text-foreground font-semibold">No</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Location & Contact Details */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-premium p-8">
                            <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-foreground">
                                <MapPin className="w-5 h-5 text-gold" />
                                Physical Address
                            </h3>
                            <div className="bg-secondary/30 p-4 rounded-xl">
                                <p className="text-foreground font-medium">{company.address || 'Street not provided'}</p>
                                <p className="text-foreground">{company.city || 'City not provided'}</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Action Sidebar */}
                    <div className="lg:w-80 space-y-6">
                        <div className="card-premium p-6 sticky top-24">
                            <h3 className="font-bold text-foreground mb-4">Verification Actions</h3>
                            <div className="space-y-4">
                                <button
                                    onClick={handleVerify}
                                    disabled={submitting}
                                    className="w-full py-3 rounded-xl bg-success text-white font-bold hover:shadow-lg hover:shadow-success/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <CheckCircle2 className="w-5 h-5" /> Approve Registration
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={submitting}
                                    className="w-full py-3 rounded-xl bg-destructive/10 text-destructive font-bold hover:bg-destructive/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <XCircle className="w-5 h-5" /> Reject Registration
                                </button>
                            </div>
                            <div className="mt-6 pt-6 border-t border-border text-center">
                                <p className="text-xs text-muted-foreground mb-1">Registered On</p>
                                <p className="text-sm font-semibold text-foreground">
                                    {new Date(company.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CompanyReviewDetail;
