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
    Calendar
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
    createdAt: string;
}

const AdminUsers = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

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
                u.id === userId ? { ...u, isVerified } : u
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
                    <h1 className="text-2xl font-display font-bold text-foreground">User Management</h1>
                    <p className="text-muted-foreground">
                        Manage all users on the platform ({users.length} total)
                    </p>
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
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminUsers;
