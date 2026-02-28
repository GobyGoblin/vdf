import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout';
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Mail,
  MapPin,
  Calendar,
  Download,
  Shield,
  Eye
} from 'lucide-react';
import { staffAPI, getFileUrl } from '@/lib/api';
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
  createdAt: string;
  profileScore?: number;
}

interface Document {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
}

const StaffReviewDetail = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestedCost, setSuggestedCost] = useState('');

  useEffect(() => {
    if (candidateId) {
      loadData(candidateId);
    }
  }, [candidateId]);

  const loadData = async (id: string) => {
    try {
      setLoading(true);
      const data = await staffAPI.getReviewsByCandidate(id);
      setCandidate(data.candidate);
      setDocuments(data.documents);
    } catch (error) {
      console.error('Failed to load candidate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (docId: string) => {
    try {
      await staffAPI.approveDocument(docId);
      setDocuments(docs => docs.map(d =>
        d.id === docId ? { ...d, status: 'verified' as const, verifiedAt: new Date().toISOString() } : d
      ));
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleReject = async (docId: string) => {
    const reason = window.prompt('Reason for document rejection (required):');
    if (reason === null) return;
    if (!reason.trim()) {
      alert('A reason is required to reject a document.');
      return;
    }

    try {
      await staffAPI.rejectDocument(docId, reason);
      setDocuments(docs => docs.map(d =>
        d.id === docId ? { ...d, status: 'rejected' as const } : d
      ));

      if (window.confirm('A document has been rejected. Do you want to reject the entire candidate profile as well?')) {
        await staffAPI.verifyCandidate(candidate!.id, false, `Rejection based on document: ${reason}`);
        setCandidate(prev => prev ? { ...prev, isVerified: false, verificationStatus: 'rejected' as any } : null);
        alert('Candidate profile has been rejected.');
      }
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Verified</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'passport': return 'border-red-500/30 bg-red-500/5';
      case 'cv': return 'border-blue-500/30 bg-blue-500/5';
      case 'certificate': return 'border-green-500/30 bg-green-500/5';
      case 'diploma': return 'border-purple-500/30 bg-purple-500/5';
      case 'reference': return 'border-orange-500/30 bg-orange-500/5';
      default: return 'border-gray-500/30 bg-gray-500/5';
    }
  };

  const handlePreview = (doc: Document) => {
    if (doc.fileUrl) {
      window.open(getFileUrl(doc.fileUrl), '_blank');
    } else {
      alert('Preview not available for this document.');
    }
  };

  const handleDownload = (doc: Document) => {
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
          <div className="text-muted-foreground">Loading candidate details...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!candidate) {
    return (
      <DashboardLayout role="staff">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-foreground mb-2">Candidate not found</h2>
          <Link to="/staff/review-queue" className="text-gold hover:underline">
            Back to Review Queue
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const pendingCount = documents.filter(d => d.status === 'pending').length;
  const verifiedCount = documents.filter(d => d.status === 'verified').length;
  const rejectedDocs = documents.filter(d => d.status === 'rejected');
  const hasRejectedDocs = rejectedDocs.length > 0;
  const canVerify = pendingCount === 0 && !hasRejectedDocs;

  return (
    <DashboardLayout role="staff">
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/staff/review-queue')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Review Queue
        </button>

        {/* Candidate Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center">
                <User className="w-8 h-8 text-gold" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-display font-bold text-foreground">
                    {candidate.firstName} {candidate.lastName}
                  </h1>
                  {candidate.isVerified && (
                    <span title="Verified Candidate">
                      <Shield className="w-5 h-5 text-success" />
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {candidate.email}
                  </span>
                  {candidate.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {candidate.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(candidate.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success">{verifiedCount}</p>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
              {hasRejectedDocs && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-destructive">{rejectedDocs.length}</p>
                  <p className="text-xs text-muted-foreground">Rejected</p>
                </div>
              )}
              {!candidate.isVerified ? (
                <div className="flex flex-col gap-4">
                  {/* Cost Estimation Input */}
                  <div className="w-full">
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">
                      Suggested Placement Cost
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">€</span>
                      <input
                        type="text"
                        value={suggestedCost}
                        onChange={(e) => setSuggestedCost(e.target.value)}
                        placeholder="e.g. 5,000 - 7,000"
                        className="w-full pl-7 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Estimate the cost for employers to hire this candidate.</p>
                  </div>

                  <div className="relative group w-full">
                    <button
                      onClick={async () => {
                        if (!canVerify) return;
                        if (window.confirm('Verify this candidate?')) {
                          await staffAPI.verifyCandidate(candidate.id, true, undefined, suggestedCost);
                          setCandidate(prev => prev ? { ...prev, isVerified: true, verificationStatus: 'verified' } : null);
                        }
                      }}
                      disabled={!canVerify}
                      className={cn(
                        "px-4 py-2.5 rounded-lg font-bold transition-all text-sm flex items-center gap-2 w-full justify-center",
                        !canVerify
                          ? "bg-secondary text-muted-foreground cursor-not-allowed opacity-50"
                          : "bg-success text-white hover:bg-success/90 shadow-lg shadow-success/20"
                      )}
                    >
                      <CheckCircle2 className="w-4 h-4" /> Verify Candidate
                    </button>
                    {!canVerify && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-navy text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl border border-white/10">
                        {hasRejectedDocs
                          ? "Cannot verify with rejected documents"
                          : `Verify all documents first (${pendingCount} pending)`}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={async () => {
                      const reason = window.prompt('Reason for rejecting this candidate:');
                      if (reason === null) return;
                      if (!reason.trim()) {
                        alert('Reason is required.');
                        return;
                      }
                      await staffAPI.verifyCandidate(candidate.id, false, reason);
                      setCandidate(prev => prev ? { ...prev, isVerified: false, verificationStatus: 'rejected' } : null);
                    }}
                    className="w-full px-4 py-2 rounded-lg bg-destructive/10 text-destructive font-bold hover:bg-destructive/20 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Reject Candidate
                  </button>
                </div>
              ) : (
                <button
                  onClick={async () => {
                    if (window.confirm('Revoke verification for this candidate?')) {
                      await staffAPI.verifyCandidate(candidate.id, false);
                      setCandidate(prev => prev ? { ...prev, isVerified: false, verificationStatus: 'unverified' } : null);
                    }
                  }}
                  className="w-full px-4 py-2 rounded-lg bg-secondary text-muted-foreground hover:bg-secondary/80 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" /> Revoke Verification
                </button>
              )}
            </div>
          </div>


          {/* Skills */}
          {
            candidate.skills && candidate.skills.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 rounded-full bg-secondary text-sm text-muted-foreground">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )
          }

          {/* Bio */}
          {
            candidate.bio && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-2">About</p>
                <p className="text-muted-foreground">{candidate.bio}</p>
              </div>
            )
          }
        </motion.div >

        {/* Documents */}
        < div >
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">Documents ({documents.length})</h2>
          <div className="grid gap-4">
            {documents.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`card-premium p-4 border-l-4 ${getTypeColor(doc.type)}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                      <FileText className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{doc.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground capitalize">{doc.type}</span>
                        <span className="text-xs text-muted-foreground">
                          Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                        </span>
                        {getStatusBadge(doc.status)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePreview(doc)}
                      className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    {doc.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(doc.id)}
                          className="px-4 py-2 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors font-medium flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(doc.id)}
                          className="px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors font-medium flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div >
      </div >
    </DashboardLayout >
  );
};

export default StaffReviewDetail;
