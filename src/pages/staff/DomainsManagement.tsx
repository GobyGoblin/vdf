import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout';
import {
    Plus,
    X,
    CheckCircle2,
    Trash2,
    Edit3,
    Search,
    Globe,
    LayoutGrid,
    Type,
    Tag,
    AlertCircle
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { staffAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Domain {
    id: string;
    icon: string;
    title: string;
    count: string;
}

const StaffDomainsManagement = () => {
    const [domains, setDomains] = useState<Domain[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
    const [formData, setFormData] = useState({
        icon: 'Globe',
        title: '',
        count: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await staffAPI.getDomains();
            setDomains(data.domains);
        } catch (error) {
            console.error('Failed to load domains:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setEditingDomain(null);
        setFormData({ icon: 'Globe', title: '', count: '' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (domain: Domain) => {
        setEditingDomain(domain);
        setFormData({ icon: domain.icon, title: domain.title, count: domain.count });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingDomain) {
                await staffAPI.updateDomain(editingDomain.id, formData);
                toast({ title: 'Success', description: 'Industry updated' });
            } else {
                await staffAPI.addDomain(formData);
                toast({ title: 'Success', description: 'New industry added to homepage' });
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            toast({ title: 'Error', description: 'Operation failed', variant: 'destructive' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to remove this industry from the homepage?')) return;
        try {
            await staffAPI.deleteDomain(id);
            toast({ title: 'Deleted', description: 'Industry removed' });
            loadData();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
        }
    };

    const lucideIcons = Object.keys(LucideIcons).filter(key => typeof (LucideIcons as any)[key] === 'function' && key.length > 2);

    return (
        <DashboardLayout role="staff">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-display font-bold text-foreground">Homepage Industries</h1>
                        <p className="text-muted-foreground">
                            Manage the "Domains of Work" section on the landing page
                        </p>
                    </div>
                    <button
                        onClick={handleOpenAdd}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gold text-navy font-bold hover:shadow-lg hover:shadow-gold/20 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Sector
                    </button>
                </div>

                {/* Info Card */}
                <div className="bg-gold/10 border border-gold/20 p-4 rounded-2xl flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-foreground mb-1">Live Updates</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Changes made here will immediately reflect in the "Domains of Work" section on the Index page.
                            Use clear titles and descriptive counts (e.g., "500+ Jobs") to attract talent and employers.
                        </p>
                    </div>
                </div>

                {/* Domains Grid */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {domains.map((domain, i) => {
                            const IconComp = (LucideIcons as any)[domain.icon] || LucideIcons.Globe;
                            return (
                                <motion.div
                                    key={domain.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="card-premium p-6 group relative"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-secondary/50 border border-border flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                                            <IconComp className="w-7 h-7 text-gold" />
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleOpenEdit(domain)}
                                                className="p-2 rounded-lg bg-secondary hover:bg-gold/20 text-muted-foreground hover:text-gold transition-colors"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(domain.id)}
                                                className="p-2 rounded-lg bg-secondary hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-display font-bold text-foreground mb-1">{domain.title}</h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Tag className="w-4 h-4" />
                                        {domain.count}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                        <Type className="w-3 h-3" /> Icon: {domain.icon}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-navy/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-background border border-border p-8 rounded-3xl shadow-2xl"
                        >
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute right-4 top-4 p-2 rounded-xl hover:bg-secondary transition-colors"
                            >
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>

                            <div className="mb-6">
                                <h2 className="text-2xl font-display font-bold text-foreground">
                                    {editingDomain ? 'Edit Industry Sector' : 'Add New Industry Sector'}
                                </h2>
                                <p className="text-muted-foreground">Define how this sector appears on the homepage.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Sector Title</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:ring-2 focus:ring-gold/30 outline-none font-bold"
                                        placeholder="e.g. Artificial Intelligence"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Job Count / Tagline</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.count}
                                        onChange={e => setFormData({ ...formData, count: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:ring-2 focus:ring-gold/30 outline-none"
                                        placeholder="e.g. 500+ Jobs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Lucide Icon Name</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            required
                                            type="text"
                                            list="lucide-icons"
                                            value={formData.icon}
                                            onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:ring-2 focus:ring-gold/30 outline-none font-mono text-sm"
                                            placeholder="Search icons (e.g. Monitor)"
                                        />
                                        <datalist id="lucide-icons">
                                            {lucideIcons.map(icon => <option key={icon} value={icon} />)}
                                        </datalist>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-secondary/30 border border-border border-dashed">
                                        <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Preview:</span>
                                        {(() => {
                                            const PreviewIcon = (LucideIcons as any)[formData.icon] || LucideIcons.HelpCircle;
                                            return <PreviewIcon className="w-5 h-5 text-gold" />;
                                        })()}
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-3 rounded-xl bg-secondary border border-border font-bold hover:bg-secondary/80 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-3 rounded-xl bg-gold text-navy font-bold hover:shadow-lg hover:shadow-gold/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                        Save Changes
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

export default StaffDomainsManagement;
