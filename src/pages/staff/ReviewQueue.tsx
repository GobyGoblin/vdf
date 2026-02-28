import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout';
import {
  FileText,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  User,
  Calendar,
  ArrowRight,
  Shield,
  Building2
} from 'lucide-react';
import { staffAPI, adminAPI, profilesAPI } from '@/lib/api';

interface Document {
  id: string;
  name: string;
  type: string;
  status: string;
  uploadedAt: string;
  userId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface QueuedCandidate {
  userId: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  docCount: number;
  docTypes: string[];
  oldestUpload: string;
}

const StaffReviewQueue = () => {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<QueuedCandidate[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'candidates' | 'companies'>('candidates');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const [reviewsData, companiesData] = await Promise.all([
        staffAPI.getPendingReviews(),
        staffAPI.getPendingCompanies()
      ]);

      const docs = reviewsData.reviews as Document[];
      setCompanies(companiesData.companies);

      // Group by user
      const uniqueIds = Array.from(new Set(docs.map(d => d.userId)));
      const grouped = uniqueIds.map(userId => {
        const userDocs = docs.filter(d => d.userId === userId);
        const user = userDocs[0].user;
        const sortedDocs = [...userDocs].sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());

        return {
          userId,
          user,
          docCount: userDocs.length,
          docTypes: Array.from(new Set(userDocs.map(d => d.type))),
          oldestUpload: sortedDocs[0].uploadedAt
        };
      });

      setCandidates(grouped);
    } catch (error) {
      console.error('Failed to load queue:', error);
    } finally {
      setLoading(false);
    }
  };



  const filteredCandidates = candidates.filter(c => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      c.user?.firstName.toLowerCase().includes(searchLower) ||
      c.user?.lastName.toLowerCase().includes(searchLower) ||
      c.user?.email.toLowerCase().includes(searchLower)
    );
  });

  const filteredCompanies = companies.filter(c => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      c.companyName?.toLowerCase().includes(searchLower) ||
      c.email.toLowerCase().includes(searchLower)
    );
  });

  return (
    <DashboardLayout role="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Review Queue</h1>
            <p className="text-muted-foreground">
              {activeTab === 'candidates'
                ? `${filteredCandidates.length} candidate${filteredCandidates.length !== 1 ? 's' : ''} with pending documents`
                : `${filteredCompanies.length} compan${filteredCompanies.length !== 1 ? 'ies' : 'y'} pending verification`
              }
            </p>
          </div>
        </div>

        {/* Tabs and Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex bg-secondary p-1 rounded-xl w-full md:w-auto">
            <button
              onClick={() => setActiveTab('candidates')}
              className={`flex-1 md:w-32 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'candidates' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Candidates
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`flex-1 md:w-32 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'companies' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Companies
            </button>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>
        </div>

        {/* List Content */}
        <div className="card-premium overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading queue...</div>
          ) : activeTab === 'candidates' ? (
            filteredCandidates.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">All caught up!</h3>
                <p className="text-muted-foreground">No pending candidate reviews.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Candidate</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Docs</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Types</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Oldest Upload</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredCandidates.map((candidate, i) => (
                      <motion.tr key={candidate.userId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="hover:bg-secondary/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold">{candidate.user?.firstName?.[0]}</div>
                            <div>
                              <p className="font-medium text-foreground">{candidate.user?.firstName} {candidate.user?.lastName}</p>
                              <p className="text-xs text-muted-foreground">{candidate.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 line-height-1">
                          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning">{candidate.docCount} Pending</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {candidate.docTypes.map(type => (
                              <span key={type} className="px-2 py-0.5 rounded text-xs bg-secondary text-muted-foreground capitalize border border-border">{type}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(candidate.oldestUpload).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link to={`/staff/reviews/${candidate.userId}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold text-navy font-semibold hover:bg-gold-light transition-colors text-sm">Review <ArrowRight className="w-4 h-4" /></Link>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            filteredCompanies.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Company queue clear!</h3>
                <p className="text-muted-foreground">No companies waiting for verification.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Registration Date</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredCompanies.map((company, i) => (
                      <motion.tr key={company.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold"><Building2 className="w-5 h-5" /></div>
                            <div>
                              <p className="font-medium text-foreground">{company.companyName}</p>
                              <p className="text-xs text-muted-foreground">{company.industry || 'Industry not specified'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-foreground">{company.contactEmail || company.email}</p>
                          <p className="text-xs text-muted-foreground">{company.phone || 'No phone'}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(company.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/staff/companies/${company.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold text-navy font-semibold hover:bg-gold-light transition-colors text-sm"
                          >
                            Review <ArrowRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffReviewQueue;
