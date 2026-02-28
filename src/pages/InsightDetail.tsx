import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, Share2, Linkedin, Twitter } from 'lucide-react';
import { MarketingLayout } from '@/components/layout';
import { insightsAPI } from '@/lib/api';
import { format } from 'date-fns';

const InsightDetail = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadArticle();
    }
  }, [slug]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const response = await insightsAPI.getBySlug(slug!);
      setArticle(response.insight);
    } catch (error) {
      console.error('Failed to load article:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MarketingLayout>
        <div className="py-32 text-center">
          <p className="text-muted-foreground">Loading article...</p>
        </div>
      </MarketingLayout>
    );
  }

  if (!article) {
    return (
      <MarketingLayout>
        <div className="py-32 text-center">
          <h1 className="text-2xl font-bold mb-4">Article not found</h1>
          <Link to="/insights" className="text-gold">Back to Insights</Link>
        </div>
      </MarketingLayout>
    );
  }

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="py-20 lg:py-32 section-dark">
        <div className="container-premium">
          <Link 
            to="/insights"
            className="inline-flex items-center gap-2 text-cream/70 hover:text-cream mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Insights
          </Link>
          
          <motion.div 
            className="max-w-3xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="badge-gold mb-4">{article.category}</span>
            <h1 className="text-3xl lg:text-display-sm font-display font-bold text-cream mb-6">
              {article.title}
            </h1>
            <div className="flex items-center gap-6 text-cream/60">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {article.publishedAt 
                  ? format(new Date(article.publishedAt), 'MMMM d, yyyy')
                  : format(new Date(article.createdAt), 'MMMM d, yyyy')}
              </span>
              {article.readTime && (
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {article.readTime}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-24 bg-card">
        <div className="container-premium">
          <div className="grid lg:grid-cols-[1fr_280px] gap-12">
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="prose prose-lg max-w-none"
            >
              {article.imageUrl && (
                <div className="aspect-[16/9] bg-secondary rounded-xl mb-8 overflow-hidden">
                  <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
                </div>
              )}
              {Array.isArray(article.content) && article.content.length > 0 ? (
                article.content.map((paragraph: string, i: number) => (
                  <p key={i} className="text-foreground leading-relaxed mb-6">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="text-foreground leading-relaxed">Content coming soon...</p>
              )}
            </motion.article>

            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-8">
                <div className="card-premium p-6">
                  <h3 className="font-display font-semibold mb-4">Share this article</h3>
                  <div className="flex gap-3">
                    <button className="p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                      <Linkedin className="w-5 h-5" />
                    </button>
                    <button className="p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                      <Twitter className="w-5 h-5" />
                    </button>
                    <button className="p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="card-premium p-6">
                  <h3 className="font-display font-semibold mb-4">Related Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 text-sm rounded-full bg-secondary">{article.category}</span>
                    <span className="px-3 py-1 text-sm rounded-full bg-secondary">Germany</span>
                    <span className="px-3 py-1 text-sm rounded-full bg-secondary">Hiring</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default InsightDetail;
