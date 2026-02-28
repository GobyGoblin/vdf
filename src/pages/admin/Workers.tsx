import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout';
import { Search, User, CheckCircle2, XCircle, Eye, Mail, Shield } from 'lucide-react';
import { profilesAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const AdminWorkers = () => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all');

  useEffect(() => {
    loadWorkers();
  }, [filterVerified]);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const { adminAPI } = await import('@/lib/api');
      const response = await adminAPI.getWorkers();
      setWorkers(response.workers || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load workers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (workerId: string, verified: boolean) => {
    try {
      const { adminAPI } = await import('@/lib/api');
      await adminAPI.verifyWorker(workerId, verified);
      toast({
        title: 'Success',
        description: `Worker ${verified ? 'verified' : 'unverified'}`,
      });
      loadWorkers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update worker',
        variant: 'destructive',
      });
    }
  };

  const handleBadgeUpdate = async (workerId: string, badgeType: 'gold' | 'blue' | 'none') => {
    try {
      const { adminAPI } = await import('@/lib/api');
      await adminAPI.updateWorkerBadge(workerId, badgeType);
      toast({
        title: 'Success',
        description: `Badge updated to ${badgeType}`,
      });
      loadWorkers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update badge',
        variant: 'destructive',
      });
    }
  };

  const displayWorkers = workers;
  const filteredWorkers = displayWorkers.filter((worker: any) => {
    const matchesSearch =
      `${worker.firstName} ${worker.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVerified = filterVerified === 'all' ||
      (filterVerified === 'verified' && worker.isVerified) ||
      (filterVerified === 'unverified' && !worker.isVerified);
    return matchesSearch && matchesVerified;
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Workers Management</h1>
            <p className="text-muted-foreground">Manage candidate accounts and profiles</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card-premium p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search workers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background"
              />
            </div>
            <select
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value as any)}
              className="px-4 py-2 rounded-lg border border-border bg-background"
            >
              <option value="all">All Workers</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>

        {/* Workers List */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Loading workers...</p>
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No workers found</p>
          </div>
        ) : (
          <div className="card-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary">
                  <tr>
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Contact</th>
                    <th className="text-left p-4">Location</th>
                    <th className="text-left p-4">Profile Score</th>
                    <th className="text-left p-4">Badge</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Joined</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkers.map((worker: any) => (
                    <tr key={worker.id} className="border-t border-border hover:bg-secondary/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                            <User className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">
                              {worker.firstName} {worker.lastName}
                            </div>
                            {worker.candidateProfile?.skills && worker.candidateProfile.skills.length > 0 && (
                              <div className="text-sm text-muted-foreground">
                                {worker.candidateProfile.skills.slice(0, 2).join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {worker.email}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {worker.candidateProfile?.city || 'N/A'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {worker.candidateProfile?.profileScore || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <select
                          value={worker.badgeType || 'none'}
                          onChange={(e) => handleBadgeUpdate(worker.id, e.target.value as any)}
                          className="p-1 rounded border border-border bg-background text-sm"
                        >
                          <option value="none">None</option>
                          <option value="blue">Blue (Verified)</option>
                          <option value="gold">Gold (Luxury)</option>
                        </select>
                        {worker.verificationPaymentStatus === 'paid' && (
                          <span className="ml-2 text-xs text-green-500">Paid</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {worker.isVerified ? (
                            <span className="badge-success flex items-center gap-1">
                              <Shield className="w-3 h-3" /> Verified
                            </span>
                          ) : (
                            <span className="badge-warning">Unverified</span>
                          )}
                          <button
                            onClick={() => handleVerify(worker.id, !worker.isVerified)}
                            className="p-1 rounded hover:bg-secondary"
                            title={worker.isVerified ? 'Unverify' : 'Verify'}
                          >
                            {worker.isVerified ? (
                              <XCircle className="w-4 h-4 text-warning" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-success" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(worker.createdAt), { addSuffix: true })}
                      </td>
                      <td className="p-4">
                        <Link
                          to={`/admin/workers/${worker.id}`}
                          className="p-2 rounded-lg hover:bg-secondary transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminWorkers;
