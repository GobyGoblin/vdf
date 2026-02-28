import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout';
import { Save, ArrowLeft } from 'lucide-react';
import { insightsAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const InsightEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    excerpt: '',
    category: 'Immigration',
    readTime: '',
    featured: false,
    published: false,
    imageUrl: '',
    content: [''],
  });

  useEffect(() => {
    if (!isNew) {
      loadInsight();
    }
  }, [id]);

  const loadInsight = async () => {
    try {
      setLoading(true);
      const response = await insightsAPI.getAll({ published: undefined });
      const insight = response.insights.find((i: any) => i.id === id);
      
      if (insight) {
        setFormData({
          slug: insight.slug || '',
          title: insight.title || '',
          excerpt: insight.excerpt || '',
          category: insight.category || 'Immigration',
          readTime: insight.readTime || '',
          featured: insight.featured || false,
          published: insight.published || false,
          imageUrl: insight.imageUrl || '',
          content: Array.isArray(insight.content) ? insight.content : [insight.content || ''],
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load insight',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (isNew) {
        await insightsAPI.create(formData);
        toast({
          title: 'Success',
          description: 'Insight created successfully',
        });
      } else {
        await insightsAPI.update(id!, formData);
        toast({
          title: 'Success',
          description: 'Insight updated successfully',
        });
      }
      navigate('/admin/insights');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save insight',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const addContentParagraph = () => {
    setFormData({
      ...formData,
      content: [...formData.content, ''],
    });
  };

  const updateContentParagraph = (index: number, value: string) => {
    const newContent = [...formData.content];
    newContent[index] = value;
    setFormData({ ...formData, content: newContent });
  };

  const removeContentParagraph = (index: number) => {
    const newContent = formData.content.filter((_, i) => i !== index);
    setFormData({ ...formData, content: newContent.length > 0 ? newContent : [''] });
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="text-center py-20">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/insights')}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {isNew ? 'Create New Insight' : 'Edit Insight'}
            </h1>
            <p className="text-muted-foreground">Manage insight content</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card-premium p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Slug (URL-friendly) *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                placeholder="german-work-permits-2025"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              >
                <option value="Immigration">Immigration</option>
                <option value="HR Strategy">HR Strategy</option>
                <option value="Industry Trends">Industry Trends</option>
                <option value="Compliance">Compliance</option>
                <option value="Technology">Technology</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              placeholder="Article title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Excerpt *
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              required
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              placeholder="Short description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Read Time
              </label>
              <input
                type="text"
                value={formData.readTime}
                onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                placeholder="8 min read"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="rounded border-border"
              />
              <span className="text-sm text-foreground">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="rounded border-border"
              />
              <span className="text-sm text-foreground">Published</span>
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-foreground">
                Content (Paragraphs)
              </label>
              <button
                type="button"
                onClick={addContentParagraph}
                className="text-sm text-gold hover:underline"
              >
                + Add Paragraph
              </button>
            </div>
            <div className="space-y-3">
              {formData.content.map((paragraph, index) => (
                <div key={index} className="flex gap-2">
                  <textarea
                    value={paragraph}
                    onChange={(e) => updateContentParagraph(index, e.target.value)}
                    rows={4}
                    className="flex-1 px-4 py-2 rounded-lg border border-border bg-background"
                    placeholder={`Paragraph ${index + 1}`}
                  />
                  {formData.content.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContentParagraph(index)}
                      className="px-3 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-border">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 rounded-lg btn-gold disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : isNew ? 'Create Insight' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/insights')}
              className="px-6 py-2 rounded-lg border border-border hover:bg-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default InsightEdit;
