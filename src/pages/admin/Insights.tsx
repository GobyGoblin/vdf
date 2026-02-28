import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Filter } from 'lucide-react';
import { insightsAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const AdminInsights = () => {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPublished, setFilterPublished] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    loadInsights();
  }, [filterPublished]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterPublished === 'published') params.published = true;
      if (filterPublished === 'draft') params.published = false;
      
      const response = await insightsAPI.getAll(params);
      setInsights(response.insights);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load insights',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this insight?')) return;

    try {
      await insightsAPI.delete(id);
      toast({
        title: 'Success',
        description: 'Insight deleted successfully',
      });
      loadInsights();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete insight',
        variant: 'destructive',
      });
    }
  };

  const handleTogglePublished = async (insight: any) => {
    try {
      await insightsAPI.update(insight.id, {
        published: !insight.published,
      });
      toast({
        title: 'Success',
        description: `Insight ${!insight.published ? 'published' : 'unpublished'}`,
      });
      loadInsights();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update insight',
        variant: 'destructive',
      });
    }
  };

  const categories = ['All', 'Immigration', 'HR Strategy', 'Industry Trends', 'Compliance', 'Technology'];
  const filteredInsights = insights.filter(insight => {
    const matchesSearch = insight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         insight.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || insight.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">News & Insights Management</h1>
            <p className="text-muted-foreground">Manage articles, news, and insights content</p>
          </div>
          <Link
            to="/admin/insights/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg btn-gold"
          >
            <Plus className="w-4 h-4" /> Create New Insight
          </Link>
        </div>

        {/* Filters */}
        <div className="card-premium p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search insights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 rounded-lg border border-border bg-background"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={filterPublished}
              onChange={(e) => setFilterPublished(e.target.value as any)}
              className="px-4 py-2 rounded-lg border border-border bg-background"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Insights List */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Loading insights...</p>
          </div>
        ) : filteredInsights.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No insights found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInsights.map((insight) => (
              <div key={insight.id} className="card-premium p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-display font-semibold text-foreground">
                        {insight.title}
                      </h3>
                      {insight.featured && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gold/10 text-gold">
                          Featured
                        </span>
                      )}
                      {insight.published ? (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-success/10 text-success">
                          Published
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-warning/10 text-warning">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {insight.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Category: {insight.category}</span>
                      <span>•</span>
                      <span>Slug: {insight.slug}</span>
                      <span>•</span>
                      <span>
                        {insight.publishedAt
                          ? `Published ${formatDistanceToNow(new Date(insight.publishedAt), { addSuffix: true })}`
                          : `Created ${formatDistanceToNow(new Date(insight.createdAt), { addSuffix: true })}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePublished(insight)}
                      className="p-2 rounded-lg hover:bg-secondary transition-colors"
                      title={insight.published ? 'Unpublish' : 'Publish'}
                    >
                      {insight.published ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                    <Link
                      to={`/admin/insights/${insight.id}/edit`}
                      className="p-2 rounded-lg hover:bg-secondary transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </Link>
                    <button
                      onClick={() => handleDelete(insight.id)}
                      className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminInsights;
