import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout';
import {
  Users,
  User,
  Search,
  Filter,
  MapPin,
  Star,
  Shield,
  Eye,
  DollarSign,
  Briefcase,
  Globe,
  Award,
  ArrowRight,
  Sparkles,
  Zap,
  Globe2,
  CheckCircle2
} from 'lucide-react';
import { talentPoolAPI, authAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  location?: string;
  skills?: string[];
  bio?: string;
  isVerified: boolean;
  profileScore?: number;
  sector?: string;
  yearsOfExperience?: string;
  nationality?: string;
  badgeType?: 'gold' | 'blue' | 'none';
}

const EmployerTalentPool = () => {
  const [searchParams] = useSearchParams();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const idsParam = searchParams.get('ids');
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [locationFilter, setLocationFilter] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const { user: userData } = await authAPI.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, [verifiedOnly, locationFilter, sectorFilter, idsParam]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const { talentPoolAPI } = await import('@/lib/api');
      const data = await talentPoolAPI.getCandidates({
        verified: verifiedOnly || undefined,
        location: locationFilter || undefined,
      });

      let result = data.candidates;
      if (idsParam) {
        const targetIds = idsParam.split(',');
        result = result.filter(c => targetIds.includes(c.id));
      }

      setCandidates(result);
    } catch (error) {
      console.error('Failed to load candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestQuote = async (candidateId: string) => {
    try {
      const { talentPoolAPI } = await import('@/lib/api');
      await talentPoolAPI.requestQuote(candidateId);
      toast({
        title: 'Quote Requested',
        description: 'Our team will contact you with a cost estimate shortly.',
      });
    } catch (error: any) {
      toast({
        title: 'Request Failed',
        description: error.message || 'Could not request quote',
        variant: 'destructive',
      });
    }
  };

  const filteredCandidates = candidates.filter(c => {
    const searchLower = search.toLowerCase();
    const matchesSearch = !search || (
      c.firstName.toLowerCase().includes(searchLower) ||
      c.sector?.toLowerCase().includes(searchLower) ||
      c.skills?.some(s => s.toLowerCase().includes(searchLower))
    );
    const matchesSector = !sectorFilter || c.sector === sectorFilter;
    return matchesSearch && matchesSector;
  });

  const locations = ['Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Cologne'];
  const sectors = ['IT', 'Healthcare', 'Engineering', 'Logistics', 'Construction', 'Other'];

  return (
    <DashboardLayout role="employer">
      <div className="space-y-8">
        {loadingUser ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : !user || user.verificationStatus !== 'verified' ? (
          <div className="flex flex-col items-center justify-center py-20 card-premium border-gold/20 bg-gold/5">
            <div className="w-20 h-20 rounded-3xl bg-gold/20 flex items-center justify-center mb-6 shadow-xl shadow-gold/10 border border-gold/30">
              <Shield className="w-10 h-10 text-gold" />
            </div>
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">Verification Required</h2>
            <p className="text-muted-foreground text-center max-w-md mb-8 leading-relaxed">
              To protect candidate privacy and ensure data integrity, the Premium Talent Pool is only accessible to
              <span className="text-gold font-bold"> verified employers</span>.
            </p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <Link
                to="/employer/onboarding"
                className="w-full py-4 rounded-xl bg-gold text-navy font-black uppercase tracking-widest text-xs text-center hover:shadow-lg hover:shadow-gold/20 transition-all flex items-center justify-center gap-2"
              >
                Complete Company Onboarding <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-[10px] text-center text-muted-foreground uppercase font-black tracking-tighter">
                Verification usually takes 24-48 hours.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">Premium Talent Pool</h1>
                <p className="text-muted-foreground mt-1 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gold" />
                  Direct access to pre-verified international specialists
                </p>
              </div>
              <div className="bg-navy rounded-2xl px-6 py-3 flex items-center gap-6 shadow-xl shadow-navy/10 border border-white/5">
                <div className="text-center">
                  <p className="text-[10px] uppercase font-black text-white/50 tracking-widest">Available</p>
                  <p className="text-xl font-bold text-gold">{candidates.length}</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-[10px] uppercase font-black text-white/50 tracking-widest">Verified</p>
                  <p className="text-xl font-bold text-success">{candidates.filter(c => c.isVerified).length}</p>
                </div>
              </div>
            </div>

            {/* Filters & Search - Premium Design */}
            <div className="card-premium p-6 border-gold/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl -mr-16 -mt-16" />

              <div className="flex flex-col lg:flex-row gap-6 relative z-10">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by expertise, sector or technology..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all font-medium"
                  />
                </div>

                {/* Sector Filter */}
                <div className="flex items-center gap-3 bg-secondary/30 px-4 rounded-2xl border border-border">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <select
                    value={sectorFilter}
                    onChange={(e) => setSectorFilter(e.target.value)}
                    className="bg-transparent py-3 text-sm font-bold text-foreground focus:outline-none min-w-[140px]"
                  >
                    <option value="">All Sectors</option>
                    {sectors.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Location Switch */}
                <div className="flex items-center gap-4 bg-secondary/30 px-4 rounded-2xl border border-border">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  {locations.slice(0, 3).map(loc => (
                    <button
                      key={loc}
                      onClick={() => setLocationFilter(locationFilter === loc ? '' : loc)}
                      className={cn(
                        "text-[10px] h-8 px-3 rounded-xl font-black uppercase tracking-widest transition-all",
                        locationFilter === loc ? "bg-gold text-navy shadow-lg" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {loc}
                    </button>
                  ))}
                </div>

                {/* Verified Switch */}
                <button
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className={cn(
                    "flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm transition-all border-2",
                    verifiedOnly
                      ? "bg-success/10 border-success/30 text-success shadow-lg shadow-success/5"
                      : "bg-secondary/30 border-border text-muted-foreground hover:border-gold/30 hover:text-foreground"
                  )}
                >
                  <Shield className={cn("w-4 h-4", verifiedOnly && "fill-success/20")} />
                  Verified Only
                </button>
              </div>
            </div>

            {/* Candidates Grid */}
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="card-premium h-[300px] animate-pulse bg-secondary/20" />
                ))}
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="text-center py-20 card-premium border-dashed border-2">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-bold text-foreground mb-2">No Profiles Matched</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">Try expanding your search parameters or sector filters to see more international talent.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCandidates.map((candidate, i) => (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className={cn(
                      "group transition-all duration-500 relative rounded-[2rem] overflow-hidden flex flex-col h-[460px]",
                      candidate.badgeType === 'gold'
                        ? "bg-gradient-to-br from-gold/20 via-background to-gold/5 border border-gold/40 shadow-2xl shadow-gold/5"
                        : "bg-background border border-border/50 hover:border-gold/30 shadow-xl shadow-navy/5"
                    )}
                  >
                    {/* Premium Decorations for Gold */}
                    {candidate.badgeType === 'gold' && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
                    )}

                    {/* Header with Background Pattern */}
                    <div className={cn(
                      "h-24 relative overflow-hidden",
                      candidate.badgeType === 'gold' ? "bg-gold/5" : "bg-secondary/10"
                    )}>
                      <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <svg width="100%" height="100%"><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" /></pattern><rect width="100%" height="100%" fill="url(#grid)" /></svg>
                      </div>
                      <div className="absolute -top-4 -right-4 w-24 h-24 bg-gold/10 rounded-full blur-3xl" />

                      {/* Badge Indicator */}
                      <div className={cn(
                        "absolute top-4 right-4 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.1em] z-10 backdrop-blur-md border",
                        candidate.badgeType === 'gold' ? "bg-gold text-navy border-gold" :
                          candidate.badgeType === 'blue' ? "bg-blue-600 text-white border-blue-400" :
                            "bg-background/80 text-foreground border-border"
                      )}>
                        {candidate.badgeType === 'gold' ? (
                          <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Gold Tier Match</span>
                        ) : candidate.badgeType === 'blue' ? 'Verified Blue' : 'Institutional Match'}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="px-6 pb-8 -mt-10 flex flex-col flex-grow relative z-10">
                      {/* Avatar Area */}
                      <div className="flex items-end justify-between mb-4">
                        <div className={cn(
                          "w-20 h-20 rounded-[1.5rem] flex items-center justify-center border-4 border-background shadow-2xl transition-transform duration-500 group-hover:scale-105",
                          candidate.badgeType === 'gold' ? "bg-gold text-navy" :
                            candidate.badgeType === 'blue' ? "bg-blue-600 text-white" :
                              "bg-navy text-white"
                        )}>
                          {candidate.badgeType === 'gold' ? (
                            <Award className="w-10 h-10" />
                          ) : (
                            <User className="w-10 h-10" />
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter leading-none mb-1">Status</p>
                          <div className="flex items-center gap-1 text-success text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Vetted
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h3 className="text-2xl font-display font-bold text-foreground truncate flex items-baseline gap-2">
                          {candidate.firstName} <span className="text-gold font-mono tracking-tighter text-lg">{candidate.lastName}</span>
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black text-gold uppercase tracking-widest">{candidate.sector || 'Global Export'}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="p-3 rounded-2xl bg-secondary/30 border border-border/50">
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-2">Exp. Level</p>
                          <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Zap className="w-3 h-3 text-gold" /> {candidate.yearsOfExperience || '5+ Years'}
                          </p>
                        </div>
                        <div className="p-3 rounded-2xl bg-secondary/30 border border-border/50">
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-2">Location</p>
                          <p className="text-xs font-bold text-foreground flex items-center gap-1.5 truncate">
                            <Globe2 className="w-3 h-3 text-blue-500" /> {candidate.location?.split(' ')[0] || 'Remote'}
                          </p>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5 mb-6 content-start h-10 overflow-hidden">
                        {candidate.skills?.slice(0, 4).map((skill) => (
                          <span key={skill} className="px-2.5 py-1 rounded-lg bg-navy/5 text-navy text-[8px] font-black uppercase tracking-tighter border border-navy/10 group-hover:border-gold/30 transition-colors">
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Action */}
                      <div className="mt-auto">
                        <Link
                          to={`/employer/talent-pool/${candidate.id}`}
                          className={cn(
                            "w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 group/btn overflow-hidden relative",
                            candidate.badgeType === 'gold'
                              ? "bg-gold text-navy hover:shadow-gold/30"
                              : "bg-navy text-white hover:bg-gold hover:text-navy translate-y-0"
                          )}
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            Review Institutional Dossier
                            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                          </span>
                          {candidate.badgeType === 'gold' && (
                            <motion.div
                              className="absolute inset-0 bg-white/20"
                              initial={{ x: '-100%' }}
                              animate={{ x: '100%' }}
                              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            />
                          )}
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Bottom Info Banner */}
            <div className="p-8 rounded-[2.5rem] bg-gold/5 border border-gold/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-gold flex items-center justify-center shadow-lg shadow-gold/20">
                  <Shield className="w-8 h-8 text-navy" />
                </div>
                <div>
                  <h4 className="text-xl font-display font-bold text-foreground">Direct Global Sourcing</h4>
                  <p className="text-muted-foreground text-sm font-medium">Access full CV templates without personal data. Contact candidates directly through GBPC staff.</p>
                </div>
              </div>
              <button className="px-8 py-4 rounded-2xl bg-navy text-white font-black uppercase tracking-widest text-xs hover:brightness-110 transition-all flex items-center gap-3 shadow-2xl">
                Source with AI <Star className="w-4 h-4 fill-gold text-gold" />
              </button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EmployerTalentPool;
