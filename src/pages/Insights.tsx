import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { MarketingLayout } from '@/components/layout';
import { insightsAPI } from '@/lib/api';
import { format } from 'date-fns';

const categories = ['All', 'Immigration', 'HR Strategy', 'Industry Trends', 'Compliance', 'Technology'];

const Insights = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    loadInsights();
  }, [selectedCategory]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const params: any = { published: true };
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      const response = await insightsAPI.getAll(params);
      setArticles(response.insights || []);
    } catch (error) {
      console.error('Failed to load insights:', error);
      // Fallback to empty array
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const featuredArticle = articles.find(a => a.featured);
  const regularArticles = articles.filter(a => !a.featured);

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="py-20 lg:py-32 section-dark">
        <div className="container-premium">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="badge-gold mb-4">Insights</span>
            <h1 className="text-4xl lg:text-display font-display font-bold text-cream mb-6">
              News, Guides & Resources
            </h1>
            <p className="text-lg text-cream/70">
              Stay informed with the latest insights on German recruitment, immigration,
              and HR best practices.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-card border-b border-border">
        <div className="container-premium">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${category === selectedCategory
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {!loading && featuredArticle && (
        <section className="py-12 bg-card">
          <div className="container-premium">
            <Link to={`/insights/${featuredArticle.slug}`}>
              <motion.article
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid lg:grid-cols-2 gap-8 card-premium overflow-hidden"
              >
                <div className="aspect-[16/10] lg:aspect-auto overflow-hidden">
                  <img
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="badge-gold">{featuredArticle.category}</span>
                    <span className="text-sm text-muted-foreground">
                      {featuredArticle.publishedAt
                        ? format(new Date(featuredArticle.publishedAt), 'MMM d, yyyy')
                        : format(new Date(featuredArticle.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-display font-bold text-foreground mb-4 hover:text-gold transition-colors">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {featuredArticle.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-2 text-gold font-semibold">
                    Read Article <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </motion.article>
            </Link>
          </div>
        </section>
      )}

      {/* Articles Grid */}
      <section className="py-16 lg:py-24 section-light">
        <div className="container-premium">
          {loading ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Loading insights...</p>
            </div>
          ) : regularArticles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No insights found</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularArticles.map((article, i) => (
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
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-medium text-gold">{article.category}</span>
                        {article.readTime && (
                          <span className="text-xs text-muted-foreground">{article.readTime}</span>
                        )}
                      </div>
                      <h3 className="text-lg font-display font-semibold text-foreground mb-2 group-hover:text-gold transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {article.excerpt}
                      </p>
                      <div className="mt-4 text-xs text-muted-foreground">
                        {article.publishedAt
                          ? format(new Date(article.publishedAt), 'MMM d, yyyy')
                          : format(new Date(article.createdAt), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 lg:py-32 bg-navy">
        <div className="container-premium text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto"
          >
            <h2 className="text-2xl lg:text-3xl font-display font-bold text-cream mb-4">
              Stay Updated
            </h2>
            <p className="text-cream/70 mb-8">
              Subscribe to our newsletter for the latest insights and updates.
            </p>
            <form className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-cream/10 border border-cream/20 text-cream placeholder:text-cream/50 focus:outline-none focus:ring-2 focus:ring-gold"
              />
              <button type="submit" className="px-6 py-3 rounded-lg btn-gold font-semibold">
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default Insights;
