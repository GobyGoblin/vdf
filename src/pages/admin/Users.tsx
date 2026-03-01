import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout';
import {
    Users,
    Search,
    Filter,
    Shield,
    ShieldOff,
    Building2,
    User,
    Mail,
    Calendar,
    Plus,
    Trash2,
    Edit
} from 'lucide-react';
import { adminAPI } from '@/lib/api';

interface UserData {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    companyName?: string;
    isVerified: boolean;
    verificationStatus?: string;
    createdAt: string;
}

const AdminUsers = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [search, setSearch] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'candidate',
        companyName: ''
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await adminAPI.deleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('Failed to delete user');
        }
    };

    const handleEditClick = (user: UserData) => {
        setIsEditMode(true);
        setEditingUserId(user.id);
        setFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            password: '', // Leave empty for edit unless they want to change it (not supported yet, so we ignore)
            role: user.role,
            companyName: user.companyName || ''
        });
        setIsModalOpen(true);
    };

    const handleAddClick = () => {
        setIsEditMode(false);
        setEditingUserId(null);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            role: 'staff',
            companyName: ''
        });
        setIsModalOpen(true);
    };

    const handleModalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditMode && editingUserId) {
                const updatedUser = await adminAPI.updateUser(editingUserId, formData);
                setUsers(users.map(u => u.id === editingUserId ? updatedUser.user : u));
            } else {
                const newUser = await adminAPI.createUser(formData);
                setUsers([newUser.user, ...users]);
            }
            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Failed to save user:', error);
            alert(error.response?.data?.error || 'Failed to save user');
        }
    };

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getUsers();
            setUsers(data.users);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (userId: string, role: string, isVerified: boolean) => {
        try {
            if (role === 'employer') {
                await adminAPI.verifyEmployer(userId, isVerified);
            } else {
                await adminAPI.verifyWorker(userId, isVerified);
            }
            setUsers(users => users.map(u =>
                u.id === userId ? {
                    ...u,
                    isVerified,
                    verificationStatus: isVerified ? 'verified' : (u.verificationStatus === 'verified' ? 'unverified' : u.verificationStatus)
                } : u
            ));
        } catch (error) {
            console.error('Failed to update verification:', error);
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
            admin: 'bg-red-500/10 text-red-500',
            staff: 'bg-purple-500/10 text-purple-500',
            employer: 'bg-blue-500/10 text-blue-500',
            candidate: 'bg-green-500/10 text-green-500',
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[role] || 'bg-secondary text-muted-foreground'}`}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
            </span>
        );
    };

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <div className="flex justify-between items-center outline-none">
                        <div>
                            <h1 className="text-2xl font-display font-bold text-foreground">User Management</h1>
                            <p className="text-muted-foreground">
                                Manage all users on the platform ({users.length} total)
                            </p>
                        </div>
                        <button
                            onClick={handleAddClick}
                            className="flex items-center gap-2 px-4 py-2 bg-gold text-navy rounded-lg font-medium hover:bg-gold/90 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Add User
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="card-premium p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50"
                            />
                        </div>

                        {/* Role Filter */}
                        <div className="flex items-center gap-2 overflow-x-auto">
                            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            {roles.map((role) => (
                                <button
                                    key={role}
                                    onClick={() => setFilter(role)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === role
                                        ? 'bg-gold text-navy'
                                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                    {role !== 'all' && ` (${users.filter(u => u.role === role).length})`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="card-premium overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-muted-foreground">Loading users...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-8 text-center">
                            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                            <h3 className="font-semibold text-foreground mb-1">No users found</h3>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-secondary/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Joined
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredUsers.map((user, i) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="hover:bg-secondary/30 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                                                        {user.role === 'employer' ? (
                                                            <Building2 className="w-5 h-5 text-gold" />
                                                        ) : (
                                                            <User className="w-5 h-5 text-gold" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">
                                                            {user.companyName || `${user.firstName} ${user.lastName}`}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getRoleBadge(user.role)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.isVerified ? (
                                                    <span className="flex items-center gap-1 text-success text-sm">
                                                        <Shield className="w-4 h-4" /> Verified
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-muted-foreground text-sm">
                                                        <ShieldOff className="w-4 h-4" /> Unverified
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {(user.role === 'employer' || user.role === 'candidate') && (
                                                        user.isVerified ? (
                                                            <button
                                                                onClick={() => handleVerify(user.id, user.role, false)}
                                                                className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-sm font-medium"
                                                            >
                                                                Unverify
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleVerify(user.id, user.role, true)}
                                                                className="px-3 py-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors text-sm font-medium"
                                                            >
                                                                Verify
                                                            </button>
                                                        )
                                                    )}
                                                    <button
                                                        onClick={() => handleEditClick(user)}
                                                        className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                                                        title="Edit User"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div></td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-card w-full max-w-lg rounded-xl shadow-xl border border-border p-6"
                    >
                        <h2 className="text-xl font-bold mb-4">{isEditMode ? 'Edit User' : 'Add New User'}</h2>
                        <form onSubmit={handleModalSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">First Name</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-secondary border border-border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-secondary border border-border"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    disabled={isEditMode}
                                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border disabled:opacity-50"
                                    required
                                />
                            </div>

                            {!isEditMode && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Password</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-secondary border border-border"
                                        required
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    disabled={isEditMode}
                                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border disabled:opacity-50"
                                >
                                    <option value="candidate">Candidate</option>
                                    <option value="employer">Employer</option>
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            {formData.role === 'employer' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Company Name</label>
                                    <input
                                        type="text"
                                        value={formData.companyName}
                                        onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-secondary border border-border"
                                        required={formData.role === 'employer'}
                                    />
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-lg font-medium hover:bg-secondary transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-gold text-navy rounded-lg font-medium hover:bg-gold/90 transition-colors"
                                >
                                    {isEditMode ? 'Save Changes' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminUsers;
