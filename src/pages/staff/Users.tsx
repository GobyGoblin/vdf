import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout';
import {
    Users as UsersIcon,
    Search,
    Filter,
    Shield,
    ShieldOff,
    Building2,
    User,
    Mail,
    Calendar,
    Plus,
    X,
    CheckCircle2,
    Eye,
    FileText,
    Download,
    ExternalLink
} from 'lucide-react';
import { staffAPI, getFileUrl } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface UserData {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    companyName?: string;
    isVerified: boolean;
    createdAt: string;
    bio?: string;
    location?: string;
    skills?: string[];
}

const StaffUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [quickLookId, setQuickLookId] = useState<string | null>(null);
    const [quickLookData, setQuickLookData] = useState<{ user: UserData; documents: any[] } | null>(null);
    const [loadingQuickLook, setLoadingQuickLook] = useState(false);

    const [newUser, setNewUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: 'candidate',
        companyName: '',
        password: 'password123'
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await staffAPI.getUsers();
            setUsers(data.users);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickLook = async (e: React.MouseEvent, userId: string) => {
        e.stopPropagation();
        setQuickLookId(userId);
        setLoadingQuickLook(true);
        try {
            const data = await staffAPI.getUserById(userId);
            setQuickLookData(data as any);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to load user preview', variant: 'destructive' });
            setQuickLookId(null);
        } finally {
            setLoadingQuickLook(false);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await staffAPI.addUser(newUser);
            toast({ title: 'Success', description: 'User added successfully' });
            setIsAddModalOpen(false);
            setNewUser({
                firstName: '',
                lastName: '',
                email: '',
                role: 'candidate',
                companyName: '',
                password: 'password123'
            });
            loadUsers();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to add user', variant: 'destructive' });
        }
    };

    const filteredUsers = users.filter(user => {
        if (filter !== 'all' && user.role !== filter) return false;
        if (search) {
            const searchLower = search.toLowerCase();
            return (
                user.firstName.toLowerCase().includes(searchLower) ||
                user.lastName.toLowerCase().includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower) ||
                user.companyName?.toLowerCase().includes(searchLower)
            );
        }
        return true;
    });

    const roles = ['all', 'candidate', 'employer', 'staff', 'admin'];

    const getRoleBadge = (role: string) => {
        const styles: Record<string, string> = {
            admin: 'bg-red-500/10 text-red-500 border-red-500/20',
            staff: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
            employer: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            candidate: 'bg-green-500/10 text-green-500 border-green-500/20',
        };
        return (
            <span className={cn(
                "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                styles[role] || 'bg-secondary text-muted-foreground'
            )}>
                {role}
            </span>
        );
    };

    return (
        <DashboardLayout role="staff">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-display font-bold text-foreground">User Directory</h1>
                        <p className="text-muted-foreground">
                            Browse and manage platform users
                        </p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gold text-navy font-bold hover:shadow-lg hover:shadow-gold/20 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Provision User
                    </button>
                </div>

                {/* Filters */}
                <div className="card-premium p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by name, email or company..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50"
                            />
                        </div>

                        {/* Role Filter */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
                            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            {roles.map((role) => (
                                <button
                                    key={role}
                                    onClick={() => setFilter(role)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all border",
                                        filter === role
                                            ? 'bg-gold border-gold text-navy shadow-lg shadow-gold/20'
                                            : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                                    )}
                                >
                                    {role}
                                    {role !== 'all' && ` (${users.filter(u => u.role === role).length})`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="card-premium overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full"
                            />
                            Loading user database...
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-12 text-center">
                            <UsersIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-xl font-display font-bold text-foreground mb-2">No users found</h3>
                            <p className="text-muted-foreground">Adjust your search or filter to find who you're looking for.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-secondary/30 text-left">
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">User Profile</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Access Level</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Verification</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Member Since</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredUsers.map((user, i) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            onClick={() => navigate(`/staff/users/${user.id}`)}
                                            className="hover:bg-secondary/20 transition-colors group cursor-pointer"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary to-background border border-border flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                                                        {user.role === 'employer' ? (
                                                            <Building2 className="w-6 h-6 text-gold" />
                                                        ) : (
                                                            <User className="w-6 h-6 text-gold" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-display font-bold text-foreground leading-none mb-1">
                                                            {user.companyName || `${user.firstName} ${user.lastName}`}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Mail className="w-3 h-3" /> {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getRoleBadge(user.role)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.isVerified ? (
                                                    <div className="flex items-center gap-2 text-success">
                                                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                                        <span className="text-xs font-bold uppercase tracking-wider">Trusted</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                                                        <span className="text-xs font-bold uppercase tracking-wider">Unverified</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-foreground/80 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gold" />
                                                    {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={(e) => handleQuickLook(e, user.id)}
                                                    className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-gold hover:bg-gold/10 transition-all opacity-0 group-hover:opacity-100"
                                                    title="Quick Look"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Look Modal */}
            <AnimatePresence>
                {quickLookId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setQuickLookId(null)}
                            className="absolute inset-0 bg-navy/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-background border border-border rounded-3xl shadow-2xl overflow-hidden"
                        >
                            {loadingQuickLook ? (
                                <div className="p-24 flex flex-col items-center gap-4">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full"
                                    />
                                    <p className="text-muted-foreground font-medium animate-pulse">Generating preview...</p>
                                </div>
                            ) : quickLookData && (
                                <div className="flex flex-col h-full max-h-[80vh]">
                                    {/* Header */}
                                    <div className="p-6 border-b border-border bg-secondary/30 flex items-start justify-between">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                                                <User className="w-8 h-8 text-gold" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-display font-bold text-foreground">
                                                    {quickLookData.user.companyName || `${quickLookData.user.firstName} ${quickLookData.user.lastName}`}
                                                </h3>
                                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <Mail className="w-4 h-4" /> {quickLookData.user.email}
                                                </p>
                                                <div className="mt-2">
                                                    {getRoleBadge(quickLookData.user.role)}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setQuickLookId(null)}
                                            className="p-2 rounded-xl hover:bg-secondary transition-colors"
                                        >
                                            <X className="w-6 h-6 text-muted-foreground" />
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 overflow-y-auto space-y-6">
                                        {quickLookData.user.bio && (
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2">About / Bio</p>
                                                <p className="text-sm text-foreground/80 leading-relaxed italic border-l-2 border-gold/30 pl-4 bg-gold/5 py-2 rounded-r-lg">
                                                    {quickLookData.user.bio}
                                                </p>
                                            </div>
                                        )}

                                        {quickLookData.user.skills && quickLookData.user.skills.length > 0 && (
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2">Key Competencies</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {quickLookData.user.skills.map(skill => (
                                                        <span key={skill} className="px-2.5 py-1 rounded-lg bg-secondary border border-border text-[10px] font-bold text-foreground/70 uppercase">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Documents Section */}
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Shared Documents</p>
                                                <span className="text-[10px] font-bold text-gold">{quickLookData.documents.length} Files Found</span>
                                            </div>
                                            <div className="grid gap-3">
                                                {quickLookData.documents.length > 0 ? quickLookData.documents.map((doc: any) => (
                                                    <div key={doc.id} className="p-3 rounded-xl bg-secondary/50 border border-border flex items-center justify-between group/doc hover:border-gold/30 transition-all">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center border border-border">
                                                                <FileText className="w-5 h-5 text-gold" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-foreground leading-none mb-1">{doc.name}</p>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">{doc.type}</span>
                                                                    <div className={cn(
                                                                        "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border",
                                                                        doc.status === 'verified' ? "bg-success/10 text-success border-success/20" :
                                                                            doc.status === 'rejected' ? "bg-destructive/10 text-destructive border-destructive/20" :
                                                                                "bg-warning/10 text-warning border-warning/20"
                                                                    )}>
                                                                        {doc.status}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 translate-x-1 opacity-0 group-hover/doc:opacity-100 group-hover/doc:translate-x-0 transition-all">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); window.open(getFileUrl(doc.fileUrl), '_blank'); }}
                                                                className="p-1.5 rounded-lg hover:bg-gold/10 hover:text-gold transition-colors"
                                                            >
                                                                <ExternalLink className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div className="text-center py-8 rounded-xl bg-secondary/20 border border-dashed border-border">
                                                        <p className="text-xs text-muted-foreground italic">No document records found for this user.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="p-6 border-t border-border bg-background flex gap-3">
                                        <button
                                            onClick={() => navigate(`/staff/users/${quickLookData.user.id}`)}
                                            className="flex-1 py-3 rounded-xl bg-gold text-navy font-bold hover:shadow-lg hover:shadow-gold/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            View Full Management Profile
                                        </button>
                                        <button
                                            onClick={() => setQuickLookId(null)}
                                            className="px-6 py-3 rounded-xl bg-secondary border border-border font-bold hover:bg-secondary/80 transition-colors"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add User Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute inset-0 bg-navy/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-background border border-border p-8 rounded-3xl shadow-2xl"
                        >
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="absolute right-4 top-4 p-2 rounded-xl hover:bg-secondary transition-colors"
                            >
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>

                            <div className="mb-6">
                                <h2 className="text-2xl font-display font-bold text-foreground">Provision New User</h2>
                                <p className="text-muted-foreground">Manually add a candidate, employer, or staff member.</p>
                            </div>

                            <form onSubmit={handleAddUser} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">First Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={newUser.firstName}
                                            onChange={e => setNewUser({ ...newUser, firstName: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:ring-2 focus:ring-gold/30 outline-none"
                                            placeholder="John"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Last Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={newUser.lastName}
                                            onChange={e => setNewUser({ ...newUser, lastName: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:ring-2 focus:ring-gold/30 outline-none"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        value={newUser.email}
                                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:ring-2 focus:ring-gold/30 outline-none"
                                        placeholder="john.doe@example.com"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Role</label>
                                        <select
                                            value={newUser.role}
                                            onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border outline-none"
                                        >
                                            <option value="candidate">Candidate</option>
                                            <option value="employer">Employer</option>
                                            <option value="staff">Staff</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Initial Password</label>
                                        <input
                                            type="text"
                                            value={newUser.password}
                                            onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:ring-2 focus:ring-gold/30 outline-none"
                                        />
                                    </div>
                                </div>

                                {newUser.role === 'employer' && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Company Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={newUser.companyName}
                                            onChange={e => setNewUser({ ...newUser, companyName: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:ring-2 focus:ring-gold/30 outline-none"
                                            placeholder="TechCorp GmbH"
                                        />
                                    </div>
                                )}

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="flex-1 py-3 rounded-xl bg-secondary border border-border font-bold hover:bg-secondary/80 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-3 rounded-xl bg-gold text-navy font-bold hover:shadow-lg hover:shadow-gold/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                        Complete Entry
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default StaffUsers;
