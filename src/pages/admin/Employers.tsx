import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout';
import { Search, Building2, CheckCircle2, XCircle, Eye, Mail, Phone } from 'lucide-react';
import { profilesAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const AdminEmployers = () => {
  const [employers, setEmployers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all');

  useEffect(() => {
    loadEmployers();
  }, [filterVerified]);

  const loadEmployers = async () => {
    try {
      setLoading(true);
      const { adminAPI } = await import('@/lib/api');
      const response = await adminAPI.getEmployers();
      setEmployers(response.employers || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load employers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (employerId: string, verified: boolean) => {
    try {
      const { adminAPI } = await import('@/lib/api');
      await adminAPI.verifyEmployer(employerId, verified);
      toast({
        title: 'Success',
        description: `Employer ${verified ? 'verified' : 'unverified'}`,
      });
      loadEmployers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update employer',
        variant: 'destructive',
      });
    }
  };

  const displayEmployers = employers;
  const filteredEmployers = displayEmployers.filter((employer: any) => {
    const matchesSearch = employer.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employer.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVerified = filterVerified === 'all' ||
                           (filterVerified === 'verified' && employer.isVerified) ||
                           (filterVerified === 'unverified' && !employer.isVerified);
    return matchesSearch && matchesVerified;
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Employers Management</h1>
            <p className="text-muted-foreground">Manage employer accounts and company profiles</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card-premium p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search employers..."
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
              <option value="all">All Employers</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>

        {/* Employers List */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Loading employers...</p>
          </div>
        ) : filteredEmployers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No employers found</p>
          </div>
        ) : (
          <div className="card-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary">
                  <tr>
                    <th className="text-left p-4">Company</th>
                    <th className="text-left p-4">Contact</th>
                    <th className="text-left p-4">Location</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Joined</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployers.map((employer: any) => (
                    <tr key={employer.id} className="border-t border-border hover:bg-secondary/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-gold" />
                          <div>
                            <div className="font-medium text-foreground">
                              {employer.companyName || employer.employerProfile?.companyName || 'N/A'}
                            </div>
                            {employer.employerProfile?.industry && (
                              <div className="text-sm text-muted-foreground">
                                {employer.employerProfile.industry}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {employer.email}
                          </div>
                          {employer.employerProfile?.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {employer.employerProfile.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {employer.employerProfile?.city || 'N/A'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {employer.isVerified ? (
                            <span className="badge-success">Verified</span>
                          ) : (
                            <span className="badge-warning">Unverified</span>
                          )}
                          <button
                            onClick={() => handleVerify(employer.id, !employer.isVerified)}
                            className="p-1 rounded hover:bg-secondary"
                            title={employer.isVerified ? 'Unverify' : 'Verify'}
                          >
                            {employer.isVerified ? (
                              <XCircle className="w-4 h-4 text-warning" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-success" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(employer.createdAt), { addSuffix: true })}
                      </td>
                      <td className="p-4">
                        <Link
                          to={`/admin/employers/${employer.id}`}
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

export default AdminEmployers;
