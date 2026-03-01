import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout';
import {
    TrendingUp,
    Users,
    Briefcase,
    FileText,
    ArrowUp,
    Target,
    Calculator,
    ArrowDown,
    Activity,
    Calendar
} from 'lucide-react';
import { adminAPI } from '@/lib/api';

interface Stats {
    userGrowth: { name: string; value: number }[];
    demandGrowth: { name: string; value: number }[];
    quoteGrowth: { name: string; value: number }[];
    retentionRate: number;
    churnRate: number;
    activeUsers: number;
    totalUsers?: number;
    totalEmployers?: number;
    totalWorkers?: number;
    totalDemands?: number;
    totalQuotes?: number;
    totalInsights?: number;
}

const AdminRetention = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [generalStats, setGeneralStats] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const [retentionData, generalData] = await Promise.all([
                adminAPI.getRetentionStats(),
                adminAPI.getStats()
            ]);
            setStats(retentionData);
            setGeneralStats(generalData);
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !stats) {
        return (
            <DashboardLayout role="admin">
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
                </div>
            </DashboardLayout>
        );
    }

    const retentionData = {
        daily: { value: 87, change: 2.5, trend: 'up' as const },
        weekly: { value: stats.retentionRate, change: -1.2, trend: 'up' as const },
        monthly: { value: 100 - stats.churnRate, change: 5.8, trend: 'up' as const },
    };

    const userGrowth = stats.userGrowth;

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-display font-bold text-foreground">Retention Analytics</h1>
                    <p className="text-muted-foreground">
                        Monitor user engagement and platform growth (Real-time Mock Data)
                    </p>
                </div>

                {/* Retention Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    {Object.entries(retentionData).map(([period, data], i) => (
                        <motion.div
                            key={period}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="card-premium p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium text-muted-foreground capitalize">{period} Retention</span>
                                <div className={`flex items-center gap-1 text-sm ${data.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                                    {data.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                                    {Math.abs(data.change)}%
                                </div>
                            </div>
                            <div className="text-4xl font-display font-bold text-foreground mb-2">
                                {data.value}%
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${data.value}%` }}
                                    transition={{ delay: i * 0.1 + 0.3, duration: 0.8 }}
                                    className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full"
                                    style={{ width: `${data.value}%` }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                        { label: 'Total Users', value: generalStats.totalUsers, icon: Users, color: 'text-gold' },
                        { label: 'Candidates', value: generalStats.totalWorkers, icon: Users, color: 'text-success' },
                        { label: 'Employers', value: generalStats.totalEmployers, icon: Briefcase, color: 'text-info' },
                        { label: 'Talent Demands', value: generalStats.totalDemands, icon: Target, color: 'text-purple-500' },
                        { label: 'Quote Requests', value: generalStats.totalQuotes, icon: Calculator, color: 'text-warning' },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="card-premium p-4"
                        >
                            <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
                            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Growth Charts Row */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* User Growth */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="card-premium p-6"
                    >
                        <h2 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-gold" /> User Growth (Last 6 Months)
                        </h2>
                        <div className="flex items-end justify-between gap-2 h-40">
                            {(userGrowth || []).map((data, i) => {
                                const maxValue = Math.max(...(userGrowth || []).map((d: any) => d.value), 10);
                                const heightPercentage = (data.value / maxValue) * 100;
                                return (
                                    <div key={data.name} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-full relative h-full flex items-end">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${heightPercentage}%` }}
                                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                                className="w-full bg-gradient-to-t from-gold to-gold-light rounded-t-lg min-h-[4px]"
                                            />
                                        </div>
                                        <span className="text-xs text-muted-foreground">{data.name}</span>
                                        <span className="text-[10px] font-bold text-foreground">{data.value}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Quotes Growth */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="card-premium p-6"
                    >
                        <h2 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-success" /> Quote Requests Volume
                        </h2>
                        <div className="flex items-end justify-between gap-2 h-40">
                            {(stats.quoteGrowth || []).map((data, i) => {
                                const maxValue = Math.max(...(stats.quoteGrowth || []).map((d: any) => d.value), 10);
                                const heightPercentage = (data.value / maxValue) * 100;
                                return (
                                    <div key={data.name} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-full relative h-full flex items-end">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${heightPercentage}%` }}
                                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                                className="w-full bg-gradient-to-t from-success to-success/60 rounded-t-lg min-h-[4px]"
                                            />
                                        </div>
                                        <span className="text-xs text-muted-foreground">{data.name}</span>
                                        <span className="text-[10px] font-bold text-foreground">{data.value}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminRetention;
