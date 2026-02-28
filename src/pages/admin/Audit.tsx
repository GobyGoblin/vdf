import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout';
import {
    Activity,
    Search,
    Filter,
    User,
    FileText,
    CheckCircle2,
    XCircle,
    UserPlus,
    Trash2,
    Edit,
    Calendar
} from 'lucide-react';
import { adminAPI } from '@/lib/api';

interface AuditLog {
    id: string;
    userId: string;
    action: string;
    details: string;
    timestamp: string;
    user?: {
        firstName: string;
        lastName: string;
        role: string;
    };
}

const AdminAudit = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getAuditLogs();
            setLogs(data.logs);
        } catch (error) {
            console.error('Failed to load logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        if (filter !== 'all' && !log.action.toLowerCase().includes(filter)) return false;
        if (search) {
            const searchLower = search.toLowerCase();
            return (
                log.details.toLowerCase().includes(searchLower) ||
                log.action.toLowerCase().includes(searchLower) ||
                log.user?.firstName?.toLowerCase().includes(searchLower) ||
                log.user?.lastName?.toLowerCase().includes(searchLower)
            );
        }
        return true;
    });

    const actionTypes = ['all', 'verified', 'approved', 'rejected', 'created', 'deleted'];

    const getActionIcon = (action: string) => {
        if (action.includes('VERIFIED') || action.includes('APPROVED')) return <CheckCircle2 className="w-4 h-4 text-success" />;
        if (action.includes('REJECTED') || action.includes('UNVERIFIED')) return <XCircle className="w-4 h-4 text-destructive" />;
        if (action.includes('CREATED') || action.includes('REGISTERED')) return <UserPlus className="w-4 h-4 text-info" />;
        if (action.includes('DELETED')) return <Trash2 className="w-4 h-4 text-warning" />;
        if (action.includes('UPDATED')) return <Edit className="w-4 h-4 text-purple-500" />;
        if (action.includes('LOGIN')) return <User className="w-4 h-4 text-gold" />;
        if (action.includes('UPLOADED')) return <FileText className="w-4 h-4 text-blue-500" />;
        if (action.includes('APPLICATION')) return <Activity className="w-4 h-4 text-indigo-500" />;
        return <Activity className="w-4 h-4 text-muted-foreground" />;
    };

    const getActionBadge = (action: string) => {
        let style = 'bg-secondary text-muted-foreground';
        if (action.includes('VERIFIED') || action.includes('APPROVED')) style = 'bg-success/10 text-success';
        if (action.includes('REJECTED') || action.includes('UNVERIFIED')) style = 'bg-destructive/10 text-destructive';
        if (action.includes('CREATED') || action.includes('REGISTERED')) style = 'bg-info/10 text-info';
        if (action.includes('DELETED')) style = 'bg-warning/10 text-warning';
        if (action.includes('LOGIN')) style = 'bg-gold/10 text-gold';
        if (action.includes('UPLOADED')) style = 'bg-blue-500/10 text-blue-500';
        if (action.includes('APPLICATION')) style = 'bg-indigo-500/10 text-indigo-500';

        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${style}`}>
                {action.replace(/_/g, ' ')}
            </span>
        );
    };

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-display font-bold text-foreground">Audit Log</h1>
                    <p className="text-muted-foreground">
                        Track all actions performed on the platform ({logs.length} entries)
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
                                placeholder="Search logs..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50"
                            />
                        </div>

                        {/* Action Filter */}
                        <div className="flex items-center gap-2 overflow-x-auto">
                            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            {actionTypes.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilter(type)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === type
                                        ? 'bg-gold text-navy'
                                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Logs Timeline */}
                <div className="card-premium overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-muted-foreground">Loading audit logs...</div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="p-8 text-center">
                            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                            <h3 className="font-semibold text-foreground mb-1">No logs found</h3>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {filteredLogs.map((log, i) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.02 }}
                                    className="p-4 hover:bg-secondary/30 transition-colors"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                                            {getActionIcon(log.action)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                {getActionBadge(log.action)}
                                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-foreground">{log.details}</p>
                                            {log.user && (
                                                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    By {log.user.firstName} {log.user.lastName} ({log.user.role})
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminAudit;
