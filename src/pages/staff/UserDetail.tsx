import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout';
import {
    ArrowLeft,
    Mail,
    Phone,
    Building2,
    User,
    Shield,
    Calendar,
    MapPin,
    Globe,
    Info,
    Briefcase,
    GraduationCap,
    Clock,
    XCircle,
    CheckCircle2,
    ExternalLink,
    Eye,
    FileText,
    Download
} from 'lucide-react';
import { staffAPI, getFileUrl } from '@/lib/api';
import { cn } from '@/lib/utils';

const StaffUserDetail = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            loadUser(userId);
        }
    }, [userId]);

    const loadUser = async (id: string) => {
        try {
            setLoading(true);
            const result = await staffAPI.getUserById(id);
            setData(result);
        } catch (error) {
            console.error('Failed to load user:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (docId: string) => {
        try {
            await staffAPI.approveDocument(docId);
            setData((prev: any) => ({
                ...prev,
                documents: prev.documents.map((d: any) =>
                    d.id === docId ? { ...d, status: 'verified', verifiedAt: new Date().toISOString() } : d
                )
            }));
        } catch (error) {
            console.error('Failed to approve:', error);
        }
    };

    const handleReject = async (docId: string) => {
        const reason = window.prompt('Reason for rejection:');
        if (!reason) return;
        try {
            await staffAPI.rejectDocument(docId, reason);
            setData((prev: any) => ({
                ...prev,
                documents: prev.documents.map((d: any) =>
                    d.id === docId ? { ...d, status: 'rejected' } : d
                )
            }));
        } catch (error) {
            console.error('Failed to reject:', error);
        }
    };

    const handleVerifyCandidate = async (isVerified: boolean) => {
        const pendingDocs = data.documents.filter((d: any) => d.status === 'pending');
        if (isVerified && pendingDocs.length > 0) {
            alert(`Cannot verify profile. There are ${pendingDocs.length} pending documents.`);
            return;
        }

        let reason = '';
        if (!isVerified) {
            const r = window.prompt('Reason for rejection:');
            if (r === null) return;
            reason = r;
        }

        try {
            await staffAPI.verifyCandidate(data.user.id, isVerified, reason);
            setData((prev: any) => ({
                ...prev,
                user: {
                    ...prev.user,
                    isVerified,
                    verificationStatus: isVerified ? 'verified' : 'rejected',
                    rejectionReason: !isVerified ? reason : undefined
                }
            }));
        } catch (error) {
            console.error('Failed to update verification status:', error);
        }
    };

    const handlePreview = (doc: any) => {
        if (doc.fileUrl) {
            window.open(getFileUrl(doc.fileUrl), '_blank');
        } else {
            alert('Preview not available for this document.');
        }
    };

    const handleDownload = (doc: any) => {
        if (doc.fileUrl) {
            const url = getFileUrl(doc.fileUrl);
            const link = document.createElement('a');
            link.href = url;
            link.download = doc.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert(`Downloading ${doc.name}... (File URL not found)`);
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="staff">
                <div className="flex items-center justify-center h-64">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full"
                    />
                </div>
            </DashboardLayout>
        );
    }

    if (!data?.user) {
        return (
            <DashboardLayout role="staff">
                <div className="text-center py-12">
                    <h2 className="text-xl font-bold mb-4">User not found</h2>
                    <button onClick={() => navigate('/staff/users')} className="text-gold hover:underline">
                        Back to User Directory
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    const { user, documents } = data;
    const isCandidate = user.role === 'candidate';
    const isEmployer = user.role === 'employer';

    return (
        <DashboardLayout role="staff">
            <div className="max-w-5xl mx-auto space-y-6">
                <button
                    onClick={() => navigate('/staff/users')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to User Directory
                </button>

                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-premium p-8"
                >
                    <div className="flex flex-col md:flex-row justify-between gap-8">
                        <div className="flex gap-6">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-secondary to-background border border-border flex items-center justify-center shrink-0 shadow-lg">
                                {isEmployer ? <Building2 className="w-12 h-12 text-gold" /> : <User className="w-12 h-12 text-gold" />}
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h1 className="text-3xl font-display font-bold text-foreground">
                                            {isEmployer ? user.companyName : `${user.firstName} ${user.lastName}`}
                                        </h1>
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                                            user.role === 'admin' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                user.role === 'staff' ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                                                    user.role === 'employer' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                                        "bg-green-500/10 text-green-500 border-green-500/20"
                                        )}>
                                            {user.role}
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground flex items-center gap-2">
                                        <Mail className="w-4 h-4" /> {user.email}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/50 border border-border">
                                        <Calendar className="w-4 h-4 text-gold" />
                                        <span className="text-xs font-medium">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-xl border",
                                        user.isVerified ? "bg-success/5 border-success/20 text-success" : "bg-warning/5 border-warning/20 text-warning"
                                    )}>
                                        {user.isVerified ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                        <span className="text-xs font-bold uppercase tracking-wider">
                                            {user.verificationStatus || 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Actions */}
                        <div className="flex flex-col gap-3 min-w-[200px]">
                            <a
                                href={`mailto:${user.email}`}
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gold text-navy font-bold hover:shadow-lg hover:shadow-gold/20 transition-all shadow-md"
                            >
                                <Mail className="w-5 h-5" /> Send Email
                            </a>
                            {user.phone && (
                                <a
                                    href={`tel:${user.phone}`}
                                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 border border-border text-foreground font-bold hover:bg-white/10 transition-all"
                                >
                                    <Phone className="w-5 h-5" /> Call User
                                </a>
                            )}
                        </div>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile Details */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="card-premium p-8"
                        >
                            <h3 className="text-lg font-display font-bold text-foreground mb-6 flex items-center gap-2">
                                <Info className="w-5 h-5 text-gold" />
                                {isEmployer ? 'Company Details' : 'Professional Summary'}
                            </h3>

                            {isCandidate ? (
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2">Headline</p>
                                        <p className="text-xl font-semibold text-foreground">{user.headline || 'No headline provided'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2">Bio</p>
                                        <p className="text-muted-foreground leading-relaxed italic border-l-2 border-gold/30 pl-4">
                                            {user.bio || 'No bio provided'}
                                        </p>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Location</p>
                                            <p className="text-foreground font-medium flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-gold" /> {user.location || 'Not specified'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Skills</p>
                                            <div className="flex flex-wrap gap-2">
                                                {user.skills?.map((skill: string) => (
                                                    <span key={skill} className="px-2 py-0.5 rounded-lg bg-secondary text-[10px] font-bold text-foreground/70">
                                                        {skill}
                                                    </span>
                                                )) || 'No skills listed'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : isEmployer ? (
                                <div className="space-y-6">
                                    <div className="grid sm:grid-cols-2 gap-8">
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Industry</p>
                                            <p className="text-foreground font-semibold">{user.industry || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Website</p>
                                            {user.website ? (
                                                <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline flex items-center gap-1 font-semibold">
                                                    {user.website.replace(/^https?:\/\//, '')} <ExternalLink className="w-3 h-3" />
                                                </a>
                                            ) : (
                                                <p className="text-muted-foreground">Not provided</p>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Company Size</p>
                                            <p className="text-foreground font-semibold">{user.companySize || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Headquarters</p>
                                            <p className="text-foreground font-semibold flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-gold" /> {user.city || 'Not specified'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-border">
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2">Company Vision</p>
                                        <p className="text-muted-foreground leading-relaxed italic">
                                            {user.vision || 'No vision statement provided'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground italic">Standard internal account profile.</p>
                            )}
                        </motion.div>

                        {/* Experience/Documents */}
                        {isCandidate && user.experience && user.experience.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="card-premium p-8"
                            >
                                <h3 className="text-lg font-display font-bold text-foreground mb-6 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-gold" />
                                    Work Experience
                                </h3>
                                <div className="space-y-8">
                                    {user.experience.map((exp: any, i: number) => (
                                        <div key={exp.id || i} className="relative pl-8 before:absolute before:left-3 before:top-2 before:bottom-0 before:w-0.5 before:bg-border last:before:hidden">
                                            <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-gold" />
                                            </div>
                                            <div className="mb-1">
                                                <span className="text-xs font-bold text-gold uppercase tracking-wider">{exp.period}</span>
                                                <h4 className="text-lg font-bold text-foreground">{exp.title}</h4>
                                                <p className="text-sm font-semibold text-muted-foreground">{exp.company}</p>
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed">{exp.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Documents */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="card-premium p-8"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-gold" />
                                    Account Documents
                                </h3>
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{documents?.length || 0} Files</span>
                            </div>
                            <div className="space-y-4">
                                {documents && documents.length > 0 ? documents.map((doc: any) => (
                                    <div key={doc.id} className="p-5 rounded-2xl bg-secondary/30 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-secondary/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                                                <FileText className="w-6 h-6 text-gold" />
                                            </div>
                                            <div>
                                                <p className="font-display font-bold text-foreground mb-0.5">{doc.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{doc.type}</span>
                                                    <span className="w-1 h-1 rounded-full bg-border" />
                                                    <div className={cn(
                                                        "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                                        doc.status === 'verified' ? "bg-success/10 text-success border-success/20" :
                                                            doc.status === 'rejected' ? "bg-destructive/10 text-destructive border-destructive/20" :
                                                                "bg-warning/10 text-warning border-warning/20"
                                                    )}>
                                                        {doc.status}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handlePreview(doc)}
                                                className="p-2.5 rounded-xl bg-background border border-border text-muted-foreground hover:text-foreground hover:border-gold transition-all"
                                                title="Preview"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDownload(doc)}
                                                className="p-2.5 rounded-xl bg-background border border-border text-muted-foreground hover:text-foreground hover:border-gold transition-all"
                                                title="Download"
                                            >
                                                <Download className="w-5 h-5" />
                                            </button>

                                            {doc.status === 'pending' && (
                                                <div className="flex items-center gap-2 ml-2">
                                                    <button
                                                        onClick={() => handleApprove(doc.id)}
                                                        className="px-4 py-2.5 rounded-xl bg-success text-white font-bold text-xs hover:bg-success/90 transition-all shadow-sm"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(doc.id)}
                                                        className="px-4 py-2.5 rounded-xl bg-destructive text-white font-bold text-xs hover:bg-destructive/90 transition-all shadow-sm"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-2xl">
                                        No documents found for this user.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status Guard */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="card-premium p-6"
                        >
                            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-gold" /> Profile Verification
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-background/50 border border-border">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Status</p>
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "w-2.5 h-2.5 rounded-full",
                                            user.isVerified ? "bg-success" : "bg-warning"
                                        )} />
                                        <span className="font-bold text-foreground tracking-tight">
                                            {user.verificationStatus?.toUpperCase() || 'UNVERIFIED'}
                                        </span>
                                    </div>
                                </div>

                                {isCandidate && !user.isVerified && (
                                    <div className="relative group/verify">
                                        <button
                                            onClick={() => handleVerifyCandidate(true)}
                                            disabled={documents.some((d: any) => d.status === 'pending')}
                                            className={cn(
                                                "w-full py-3 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2",
                                                documents.some((d: any) => d.status === 'pending')
                                                    ? "bg-secondary text-muted-foreground cursor-not-allowed opacity-50"
                                                    : "bg-success text-white hover:bg-success/90 shadow-success/20"
                                            )}
                                        >
                                            <CheckCircle2 className="w-5 h-5" /> Verify Profile
                                        </button>
                                        {documents.some((d: any) => d.status === 'pending') && (
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-navy text-white text-[10px] font-medium rounded-xl opacity-0 group-hover/verify:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-2xl border border-white/10">
                                                All documents must be verified first
                                            </div>
                                        )}
                                    </div>
                                )}

                                {user.isVerified ? (
                                    <button
                                        onClick={() => handleVerifyCandidate(false)}
                                        className="w-full py-3 rounded-xl bg-secondary text-muted-foreground font-bold hover:bg-secondary/80 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Shield className="w-5 h-5" /> Revoke Verification
                                    </button>
                                ) : !isCandidate || documents.every((d: any) => d.status !== 'pending') ? (
                                    <button
                                        onClick={() => handleVerifyCandidate(false)}
                                        className="w-full py-3 rounded-xl bg-destructive/10 text-destructive font-bold hover:bg-destructive/20 transition-all flex items-center justify-center gap-2 border border-destructive/20"
                                    >
                                        <XCircle className="w-5 h-5" /> Reject Profile
                                    </button>
                                ) : null}

                                {user.rejectionReason && (
                                    <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                                        <p className="text-[10px] text-destructive uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
                                            <XCircle className="w-3 h-3" /> Rejection History
                                        </p>
                                        <p className="text-sm text-foreground/80 leading-snug">{user.rejectionReason}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Contact Info Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="card-premium p-6"
                        >
                            <h3 className="font-bold text-foreground mb-4">Direct Connectivity</h3>
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-secondary/50 group cursor-pointer hover:bg-secondary transition-colors"
                                    onClick={() => window.location.href = `mailto:${user.email}`}>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Official Email</p>
                                    <p className="text-sm font-semibold text-foreground break-all group-hover:text-gold transition-colors">{user.email}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-secondary/50 group cursor-pointer hover:bg-secondary transition-colors"
                                    onClick={() => user.phone && (window.location.href = `tel:${user.phone}`)}>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Point of Contact</p>
                                    <p className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors">{user.phone || 'Not registered'}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-secondary/50">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Office Address</p>
                                    <p className="text-sm font-semibold text-foreground">{user.address || 'Not specified'}</p>
                                    <p className="text-sm text-muted-foreground">{user.city || user.location || ''}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StaffUserDetail;
