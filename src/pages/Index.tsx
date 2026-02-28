import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import {
    ArrowRight,
    Shield,
    Users,
    CheckCircle2,
    Building2,
    User,
    FileCheck,
    Lock,
    Eye,
    Ban,
    AlertTriangle,
    Clock,
    Sparkles,
    Stethoscope,
    HardHat,
    Monitor,
    Truck,
    Wrench,
    Leaf,
    ChevronRight,
    Globe
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { MarketingLayout } from '@/components/layout';
import { BackgroundShapes, FloatingParticles } from '@/components/ui/background-effects';
import { WavyGermanFlag } from '@/components/ui/WavyGermanFlag';
import Globe3D from '@/components/Globe';
import { useState, useEffect } from 'react';
import { staffAPI, publicAPI } from '@/lib/api';


const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
};

const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.15
        }
    }
};

// We use activeStats from state inside the component now

const trustFeatures = [
    {
        icon: Shield,
        title: 'Verified Profiles',
        description: 'Every candidate undergoes thorough verification before becoming visible to employers.'
    },
    {
        icon: Lock,
        title: 'Consent-Based Privacy',
        description: 'Workers control who sees their details. Contact info requires explicit consent.'
    },
    {
        icon: FileCheck,
        title: 'Document Authentication',
        description: 'Certificates and qualifications are validated by our expert review team.'
    },
];

const riskMitigations = [
    {
        icon: Ban,
        title: 'No Fake Profiles',
        problem: 'Low-quality or fraudulent candidates',
        solution: 'Multi-step verification with document checks and staff review'
    },
    {
        icon: Eye,
        title: 'Privacy Protected',
        problem: 'Unwanted exposure of personal data',
        solution: 'Consent-based system—companies see summaries until permission granted'
    },
    {
        icon: AlertTriangle,
        title: 'Zero Spam',
        problem: 'Abuse and unsolicited contact',
        solution: 'Verified employers only; all communication is logged and auditable'
    },
    {
        icon: Shield,
        title: 'Fair Treatment',
        problem: 'Discrimination risk in hiring',
        solution: 'Anonymized initial views with focus on qualifications and experience'
    },
    {
        icon: FileCheck,
        title: 'Authentic Documents',
        problem: 'Forged certificates and credentials',
        solution: 'Expert staff validate all uploaded documents before approval'
    },
    {
        icon: Clock,
        title: 'Smooth Process',
        problem: 'Drop-offs and abandoned applications',
        solution: 'Guided workflow with status tracking and helpful reminders'
    },
];

const insights = [
    {
        slug: 'german-work-permits-2025',
        title: 'Navigating German Work Permits in 2025',
        excerpt: 'A comprehensive guide to the latest visa requirements and pathways for international talent.',
        category: 'Immigration',
        date: 'Jan 15, 2025',
        image: '/berlin_office_premium_1769811809678.png'
    },
    {
        slug: 'remote-hiring-best-practices',
        title: 'Best Practices for Remote Hiring in Germany',
        excerpt: 'How to build effective remote teams while maintaining compliance with German labor law.',
        category: 'HR Strategy',
        date: 'Jan 10, 2025',
        image: '/remote_hiring_modern_1769811886717.png'
    },
    {
        slug: 'talent-shortage-solutions',
        title: 'Addressing Germany\'s Tech Talent Shortage',
        excerpt: 'Innovative strategies for companies struggling to find qualified professionals.',
        category: 'Industry Trends',
        date: 'Jan 5, 2025',
        image: '/tech_talent_germany_1769811898780.png'
    },
];

const Index = () => {
    const ref = useRef(null);
    const [domains, setDomains] = useState<any[]>([]);
    const [publicStats, setPublicStats] = useState({ workers: '...', employers: '...', success: '...' });
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    useEffect(() => {
        const loadDomains = async () => {
            try {
                const { domains: domainData } = await staffAPI.getDomains();
                setDomains(domainData);
            } catch (error) {
                console.error('Failed to load domains:', error);
            }
        };
        const loadStats = async () => {
            try {
                const st = await publicAPI.getStats();
                setPublicStats({
                    workers: st.totalWorkers > 0 ? st.totalWorkers.toString() : '0',
                    employers: st.totalEmployers > 0 ? st.totalEmployers.toString() : '0',
                    success: st.placementSuccess ? `${st.placementSuccess}%` : '0%'
                });
            } catch (error) {
                console.error('Failed to load stats:', error);
            }
        };
        loadDomains();
        loadStats();
    }, []);

    const activeStats = [
        { value: publicStats.workers, label: 'Verified Professionals' },
        { value: publicStats.employers, label: 'Partner Companies' },
        { value: publicStats.success, label: 'Placement Success' },
    ];

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

    return (
        <MarketingLayout>
            {/* Premium Atmospheric Hero Section */}
            <section ref={ref} className="relative h-[calc(100vh-80px)] min-h-[700px] flex items-center justify-center overflow-hidden bg-[#020617] selection:bg-gold/30">
                {/* Advanced Background Effects */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(10,25,47,0.4),transparent)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,175,55,0.08),transparent)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(56,189,248,0.05),transparent)]" />

                    {/* Animated Grid Overlay */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
                    </div>

                    <BackgroundShapes variant="dark" density="high" />
                    <FloatingParticles count={50} variant="gold" />

                    {/* Dynamic Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#020617] opacity-80" />
                </div>

                {/* Hero Content - Text Left, Globe Right */}
                <div className="relative z-30 container-premium px-4 sm:px-6">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
                        {/* Left Side - Text Content */}
                        <motion.div
                            initial="initial"
                            animate="animate"
                            variants={stagger}
                            className="text-center lg:text-left order-2 lg:order-1 relative z-10"
                        >
                            <motion.div variants={fadeInUp} className="flex justify-center lg:justify-start mb-8">
                                <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-gold-light font-bold text-[10px] uppercase tracking-[0.3em] shadow-2xl">
                                    <Sparkles className="w-4 h-4 text-gold" />
                                    Germany's Premier Talent Hub
                                </span>
                            </motion.div>

                            <motion.h1
                                variants={fadeInUp}
                                className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-extrabold text-white leading-[1.02] tracking-tight mb-8"
                            >
                                <span className="block opacity-90 underline-offset-8 decoration-gold/30">Elevate Your</span>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-dark via-gold-light to-gold shadow-sm">
                                    Ambition
                                </span>
                            </motion.h1>

                            <motion.p
                                variants={fadeInUp}
                                className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto lg:mx-0 mb-12 leading-relaxed font-light"
                            >
                                Connect with the heart of European industry. We provide the most
                                <span className="text-gold-light/90 font-medium"> verified, secure, and prestigious </span>
                                path to a career in Germany.
                            </motion.p>

                            <motion.div
                                variants={fadeInUp}
                                className="flex flex-col sm:flex-row items-center lg:items-start gap-5"
                            >
                                <Link
                                    to="/for-companies"
                                    className="group relative px-10 py-5 rounded-2xl bg-gold text-navy text-lg font-bold shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:shadow-[0_0_50px_rgba(212,175,55,0.4)] hover:scale-105 transition-all duration-500 w-full sm:w-auto overflow-hidden text-center"
                                >
                                    <div className="relative z-10 flex items-center justify-center gap-3">
                                        <Building2 className="w-6 h-6" />
                                        Secure Elite Talent
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] transition-transform" />
                                </Link>
                                <Link
                                    to="/for-workers"
                                    className="group relative px-10 py-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white text-lg font-bold hover:bg-white/10 hover:border-gold/50 hover:scale-105 transition-all duration-500 w-full sm:w-auto shadow-xl text-center"
                                >
                                    <div className="flex items-center justify-center gap-3">
                                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                        Join the Network
                                    </div>
                                </Link>
                            </motion.div>

                            {/* Floating Stats Label */}
                            <motion.div
                                variants={fadeInUp}
                                className="mt-12 flex items-center justify-center lg:justify-start gap-8 border-t border-white/5 pt-8"
                            >
                                {activeStats.map((stat, i) => (
                                    <div key={i} className="text-left">
                                        <div className="text-2xl font-display font-bold text-white">{stat.value}</div>
                                        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{stat.label}</div>
                                    </div>
                                ))}
                            </motion.div>
                        </motion.div>

                        {/* Right Side - 3D Globe with Ambient Glow */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
                            className="relative order-1 lg:order-2 flex justify-center lg:justify-end"
                        >
                            <div
                                className="relative z-10 cursor-grab active:cursor-grabbing [--globe-height:400px] lg:[--globe-height:700px] lg:[--globe-margin-right:-150px]"
                                style={{
                                    width: '100%',
                                    maxWidth: '900px',
                                    height: 'var(--globe-height, 400px)',
                                    marginRight: 'var(--globe-margin-right, 0px)'
                                }}
                            >
                                <div className="block lg:hidden w-full h-full">
                                    <Globe3D height={400} autoRotate={true} showConnections={true} />
                                </div>
                                <div className="hidden lg:block w-full h-full">
                                    <Globe3D height={700} autoRotate={true} showConnections={true} />
                                </div>

                                {/* Atmospheric Backglow integrated */}
                                <div className="absolute inset-0 bg-gold/5 rounded-full blur-[120px] scale-110 -z-10" />
                                <div className="absolute inset-0 bg-sky-500/5 rounded-full blur-[100px] scale-90 translate-x-1/4 -translate-y-1/4 -z-10" />
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Refined Section Divider */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020617] to-transparent z-20" />
            </section >

            {/* Trusted Partners / Logo Wall */}
            < section className="py-12 bg-white relative z-30" >
                <div className="container-premium">
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {['BMW', 'Siemens', 'SAP', 'Adidas', 'Allianz', 'Bosch'].map((brand) => (
                            <div key={brand} className="text-2xl font-display font-bold text-navy/40 hover:text-navy transition-colors">
                                {brand}
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            <div className="relative w-full">
                {/* Continuous Left Line - Bold and Content Aligned */}
                <div className="absolute inset-0 pointer-events-none z-40 hidden md:block">
                    <div className="max-w-7xl mx-auto px-6 h-full relative">
                        <div className="absolute left-[-9rem] top-0 bottom-0 w-[4px] bg-gold shadow-[0_0_10px_rgba(255,215,0,0.4)]" />
                    </div>
                </div>


                {/* About Section */}
                <section className="py-20 lg:py-32 section-light relative overflow-hidden">
                    <BackgroundShapes variant="light" density="medium" />
                    <div className="container-premium">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            {/* Left Column: Content */}
                            <motion.div
                                initial={{ opacity: 0, x: -24 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <div className="inline-block">
                                    <span className="badge-gold mb-4">About Us</span>
                                </div>
                                <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-6">
                                    Redefining Recruitment for the German Market
                                </h2>
                                <p className="text-lg text-muted-foreground mb-8 text-justify">
                                    We bridge the gap between exceptional international talent
                                    and Germany's leading employers. We combine rigorous verification with
                                    privacy-first principles to create a trusted marketplace where quality
                                    and consent are paramount.
                                </p>

                                <div className="space-y-6">
                                    {trustFeatures.map((feature, i) => (
                                        <div key={feature.title} className="flex gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 mt-1">
                                                <feature.icon className="w-6 h-6 text-gold" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-foreground mb-1">{feature.title}</h3>
                                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                            </motion.div>

                            {/* Right Column: Media */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="relative"
                            >
                                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                                    <div className="absolute inset-0 bg-navy/20 mix-blend-multiply z-10" />
                                    <img
                                        src="/professional_team_collaboration_1769811837982.png"
                                        alt="Professional team collaborating in a modern office"
                                        className="w-full h-full object-cover min-h-[500px]"
                                    />

                                    {/* Floating Badge 1 */}
                                    <div className="absolute bottom-8 left-8 z-20 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-lg max-w-[200px]">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Shield className="w-5 h-5 text-gold" />
                                            <span className="text-white font-bold text-sm">ISO Certified</span>
                                        </div>
                                        <p className="text-xs text-white/80">
                                            Adhering to the highest standards of data privacy and security.
                                        </p>
                                    </div>

                                    {/* Floating Badge 2 */}
                                    <div className="absolute top-8 right-8 z-20 bg-gold p-4 rounded-xl shadow-lg">
                                        <div className="text-3xl font-bold text-navy mb-0 leading-none">5+</div>
                                        <div className="text-xs font-bold text-navy/80 uppercase tracking-wide">Years of Trust</div>
                                    </div>
                                </div>

                                {/* Decorative Elements behind */}
                                <div className="absolute -top-10 -right-10 w-64 h-64 bg-gold/10 rounded-full blur-3xl -z-10" />
                                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-navy/5 rounded-full blur-3xl -z-10" />
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Horizontal Line Intersection */}
                <div className="relative max-w-7xl mx-auto px-6 z-40 hidden md:block h-0">
                    <div className="absolute left-[-9rem] top-0 right-0 h-[4px] bg-gradient-to-r from-gold via-gold/50 to-transparent shadow-[0_0_10px_rgba(255,215,0,0.4)]" />
                </div>

                {/* Domains of Work (Restored) */}
                <section className="py-20 lg:py-32 relative overflow-hidden bg-gradient-to-b from-background to-secondary/30">
                    <BackgroundShapes variant="light" density="medium" />
                    <div className="container-premium relative z-10">
                        <motion.div
                            className="text-center mb-16"
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="badge-gold mb-4">Industries</span>
                            <h2 className="text-4xl lg:text-display-sm font-display font-bold text-foreground mb-6">
                                Domains of Work
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                                Discover opportunities across Germany's most in-demand sectors.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
                            {domains.map((domain, i) => {
                                const IconComponent = (LucideIcons as any)[domain.icon] || LucideIcons.Globe;
                                return (
                                    <motion.div
                                        key={domain.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        viewport={{ once: true }}
                                        className="group relative cursor-pointer"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                                        <div className="relative h-full bg-card/50 backdrop-blur-sm border border-border/50 group-hover:border-gold/50 rounded-2xl p-6 text-center transition-all duration-300 group-hover:-translate-y-1 shadow-sm group-hover:shadow-premium-lg">
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary to-background border border-white/20 mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                                                <IconComponent className="w-6 h-6 text-muted-foreground group-hover:text-gold transition-colors duration-300" />
                                            </div>
                                            <h3 className="font-display font-bold text-foreground mb-1 group-hover:text-gold transition-colors">{domain.title}</h3>
                                            <p className="text-xs font-medium text-muted-foreground/80">{domain.count}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Success Stories / Global Reach */}
                <section className="py-24 relative overflow-hidden bg-navy">
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/talent_network_abstract_1769811851584.png"
                            alt="Global Talent Network"
                            className="w-full h-full object-cover opacity-10"
                        />
                    </div>
                    <div className="container-premium relative z-10">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <span className="badge-gold mb-6">Success Stories</span>
                                <h2 className="text-4xl lg:text-5xl font-display font-bold text-white mb-8">
                                    Trusted by <span className="text-gold">Thousands</span> of Professionals
                                </h2>
                                <p className="text-xl text-white/70 mb-10 leading-relaxed">
                                    From software engineers in Berlin to healthcare specialists in Munich,
                                    we've helped over 5,000 professionals build their futures in Germany.
                                </p>
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <div className="text-4xl font-bold text-white mb-2">98%</div>
                                        <p className="text-white/50 text-sm">Satisfaction Rate</p>
                                    </div>
                                    <div>
                                        <div className="text-4xl font-bold text-white mb-2">24h</div>
                                        <p className="text-white/50 text-sm">Avg. Verification Time</p>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="grid grid-cols-2 gap-4"
                            >
                                <div className="space-y-4 pt-8">
                                    <div className="relative group overflow-hidden rounded-2xl">
                                        <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop" alt="Smiling professional" className="w-full h-[250px] object-cover shadow-2xl transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                            <p className="text-white text-xs font-bold">Elena, Software Engineer</p>
                                        </div>
                                    </div>
                                    <div className="relative group overflow-hidden rounded-2xl">
                                        <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop" alt="Successful candidate" className="w-full h-[180px] object-cover shadow-2xl transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                            <p className="text-white text-xs font-bold">Maria, Marketing Lead</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="relative group overflow-hidden rounded-2xl">
                                        <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop" alt="Confident professional" className="w-full h-[180px] object-cover shadow-2xl transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                            <p className="text-white text-xs font-bold">David, Product Manager</p>
                                        </div>
                                    </div>
                                    <div className="relative group overflow-hidden rounded-2xl">
                                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop" alt="Happy worker" className="w-full h-[250px] object-cover shadow-2xl transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                            <p className="text-white text-xs font-bold">Klaus, Logistics Expert</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Solutions Title */}
                <section className="py-16 md:py-24 relative overflow-hidden bg-background">
                    <div className="absolute inset-0 bg-navy/5 skew-y-3 scale-110" />
                    <div className="container-premium relative text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="inline-block"
                        >
                            <span className="badge-gold mb-6 mx-auto">Our Solutions</span>
                            <h2 className="text-4xl lg:text-6xl font-display font-bold text-foreground tracking-tight">
                                Tailored Pathways for <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-orange-500">Success</span>
                            </h2>
                        </motion.div>
                    </div>
                </section>

                {/* For Companies */}
                <section className="py-20 lg:py-32 bg-card relative overflow-hidden">
                    <BackgroundShapes variant="light" density="low" />
                    <div className="container-premium">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -24 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-3xl lg:text-display-sm font-display font-bold text-foreground mb-6">
                                    Access Pre-Verified Talent Pool
                                </h2>
                                <p className="text-lg text-muted-foreground mb-8">
                                    Stop sifting through unqualified applicants. Our rigorous verification
                                    process ensures every candidate in your pool is genuine, qualified,
                                    and ready to work in Germany.
                                </p>

                                <ul className="space-y-4 mb-8">
                                    {[
                                        'Browse verified candidates with validated credentials',
                                        'Request consent to view full profiles and documents',
                                        'Manage applicants in one platform',
                                        'Reduce hiring risk with our verification guarantee'
                                    ].map((item) => (
                                        <li key={item} className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                                            <span className="text-foreground">{item}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    to="/for-companies"
                                    className="inline-flex items-center gap-2 text-gold font-semibold hover:gap-3 transition-all"
                                >
                                    Learn More <ChevronRight className="w-4 h-4" />
                                </Link>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 24 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="relative"
                            >
                                {/* Dashboard Mockup */}
                                <div className="bg-navy rounded-2xl p-8 lg:p-12 shadow-2xl">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                                                <Building2 className="w-6 h-6 text-gold" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-cream">Company Dashboard</h4>
                                                <p className="text-sm text-cream/60">Manage your entire hiring process</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { label: 'Active Requests', value: '12' },
                                                { label: 'Total Applicants', value: '284' },
                                                { label: 'In Review', value: '45' },
                                                { label: 'Hired', value: '23' },
                                            ].map((stat) => (
                                                <div key={stat.label} className="bg-cream/5 rounded-lg p-4">
                                                    <div className="text-2xl font-bold text-gold">{stat.value}</div>
                                                    <div className="text-xs text-cream/60">{stat.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* For Workers */}
                <section className="py-20 lg:py-32 section-light relative overflow-hidden">
                    <BackgroundShapes variant="light" density="medium" />
                    <div className="container-premium">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -24 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="order-2 lg:order-1 relative"
                            >
                                {/* Worker Profile Mockup */}
                                <div className="bg-card rounded-2xl p-8 lg:p-12 shadow-card border border-border">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                                                <User className="w-6 h-6 text-gold" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-foreground">Candidate Profile</h4>
                                                <p className="text-sm text-muted-foreground">Your journey to Germany</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            {[
                                                { step: 'Create Profile', status: 'complete' },
                                                { step: 'Upload Documents', status: 'complete' },
                                                { step: 'Submit for Review', status: 'complete' },
                                                { step: 'Staff Verification', status: 'active' },
                                                { step: 'Open to Work', status: 'pending' },
                                            ].map((item, i) => (
                                                <div key={item.step} className="flex items-center gap-3">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.status === 'complete' ? 'bg-gold text-navy' :
                                                        item.status === 'active' ? 'bg-gold/20 border-2 border-gold' :
                                                            'bg-secondary'
                                                        }`}>
                                                        {item.status === 'complete' && <CheckCircle2 className="w-4 h-4" />}
                                                        {item.status === 'active' && <div className="w-2 h-2 bg-gold rounded-full" />}
                                                    </div>
                                                    <span className={item.status === 'pending' ? 'text-muted-foreground' : 'text-foreground'}>
                                                        {item.step}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 24 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="order-1 lg:order-2"
                            >
                                <h2 className="text-3xl lg:text-display-sm font-display font-bold text-foreground mb-6">
                                    Get Verified, Get Hired
                                </h2>
                                <p className="text-lg text-muted-foreground mb-8">
                                    Take control of your career in Germany. Create your verified profile,
                                    upload your credentials, and connect with employers who value quality
                                    and trust—all while you control who sees your information.
                                </p>

                                <ul className="space-y-4 mb-8">
                                    {[
                                        'Build a verified profile that stands out',
                                        'Upload and authenticate your credentials',
                                        'Control exactly who sees your personal details',
                                        'Receive direct inquiries from vetted employers'
                                    ].map((item) => (
                                        <li key={item} className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                                            <span className="text-foreground">{item}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    to="/for-workers"
                                    className="inline-flex items-center gap-2 text-gold font-semibold hover:gap-3 transition-all"
                                >
                                    Start Your Application <ChevronRight className="w-4 h-4" />
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Risk Mitigation */}
                <section className="py-20 lg:py-32 section-dark relative overflow-hidden">
                    <BackgroundShapes variant="dark" density="high" />
                    <FloatingParticles count={25} variant="dark" />
                    <div className="container-premium">
                        <motion.div
                            className="max-w-3xl mx-auto text-center mb-16"
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-gold/10 text-gold mb-4">
                                Our Promise
                            </span>
                            <h2 className="text-3xl lg:text-display-sm font-display font-bold text-cream mb-6">
                                How We Eliminate Hiring Risks
                            </h2>
                            <p className="text-lg text-cream/70">
                                We've designed every aspect of our platform to address the real challenges
                                in international recruitment.
                            </p>
                        </motion.div>

                        {/* Trust Banner */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="mb-12 rounded-3xl overflow-hidden shadow-2xl border border-gold/20"
                        >
                            <img
                                src="/german_industry_high_tech_1769811823885.png"
                                alt="Eliminating Hiring Risks - Advanced Technical Verification"
                                className="w-full h-auto object-cover max-h-[300px]"
                            />
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {riskMitigations.map((item, i) => (
                                <motion.div
                                    key={item.title}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    viewport={{ once: true }}
                                    className="bg-cream/5 rounded-xl p-6 border border-cream/10 hover:border-gold/30 transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center mb-4">
                                        <item.icon className="w-6 h-6 text-gold" />
                                    </div>
                                    <h3 className="text-lg font-display font-semibold text-cream mb-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-cream/50 mb-3">
                                        <span className="font-medium text-cream/70">Problem:</span> {item.problem}
                                    </p>
                                    <p className="text-sm text-cream/70">
                                        <span className="font-medium text-gold">Solution:</span> {item.solution}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Insights Preview */}
                <section className="py-20 lg:py-32 bg-card relative overflow-hidden">
                    <BackgroundShapes variant="gradient" density="low" />
                    <div className="container-premium">
                        <div className="flex items-end justify-between mb-12">
                            <motion.div
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <span className="badge-gold mb-4">Insights</span>
                                <h2 className="text-3xl lg:text-display-sm font-display font-bold text-foreground">
                                    News & Resources
                                </h2>
                            </motion.div>
                            <Link
                                to="/insights"
                                className="hidden sm:inline-flex items-center gap-2 text-gold font-semibold hover:gap-3 transition-all"
                            >
                                View All <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {insights.map((article, i) => (
                                <motion.article
                                    key={article.slug}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <Link to={`/insights/${article.slug}`} className="group block card-premium overflow-hidden">
                                        <div className="aspect-[16/10] overflow-hidden">
                                            <img
                                                src={article.image}
                                                alt={article.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="text-xs font-medium text-gold">{article.category}</span>
                                                <span className="text-xs text-muted-foreground">{article.date}</span>
                                            </div>
                                            <h3 className="text-lg font-display font-semibold text-foreground mb-2 group-hover:text-gold transition-colors">
                                                {article.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {article.excerpt}
                                            </p>
                                        </div>
                                    </Link>
                                </motion.article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-20 lg:py-32 bg-navy relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-gold rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold rounded-full blur-3xl" />
                    </div>

                    <div className="container-premium relative z-10">
                        <motion.div
                            className="max-w-3xl mx-auto text-center"
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl lg:text-display-sm font-display font-bold text-cream mb-6">
                                Ready to Transform Your Hiring?
                            </h2>
                            <p className="text-lg text-cream/70 mb-10">
                                Whether you're seeking top talent or your next career opportunity in Germany,
                                our platform connects verified professionals with trusted employers.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    to="/for-companies"
                                    className="group flex items-center gap-2 px-8 py-4 rounded-xl btn-gold text-base font-semibold"
                                >
                                    <Building2 className="w-5 h-5" />
                                    I'm Hiring
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    to="/for-workers"
                                    className="group flex items-center gap-2 px-8 py-4 rounded-xl btn-outline-light text-base font-semibold"
                                >
                                    <User className="w-5 h-5" />
                                    I'm Looking for Work
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </div>
        </MarketingLayout >
    );
};

export default Index;
