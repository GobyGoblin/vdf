import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  Users,
  Shield,
  FileCheck,
  Search,
  ArrowRight,
  Zap,
  Clock,
  Eye
} from 'lucide-react';
import { MarketingLayout } from '@/components/layout';

const benefits = [
  {
    icon: Shield,
    title: 'Pre-Verified Candidates',
    description: 'Every profile in our pool has been reviewed and validated by our expert team.'
  },
  {
    icon: FileCheck,
    title: 'Authenticated Documents',
    description: 'Credentials, certificates, and work history are verified before candidates go live.'
  },
  {
    icon: Eye,
    title: 'Consent-Based Access',
    description: 'View candidate summaries, then request consent to access full details.'
  },
  {
    icon: Search,
    title: 'Smart Talent Search',
    description: 'Advanced filters help you find the perfect match from our verified pool.'
  },
  {
    icon: Users,
    title: 'Applicant Management',
    description: 'Post jobs, manage applications, and track your hiring pipeline in one place.'
  },
  {
    icon: Clock,
    title: 'Fast Turnaround',
    description: 'Our 24-hour verification keeps fresh candidates flowing into your pool.'
  },
];

const process = [
  {
    step: '01',
    title: 'Register Your Company',
    description: 'Create an employer account and complete verification to access the platform.'
  },
  {
    step: '02',
    title: 'Browse Talent Pool',
    description: 'Search verified candidates by skills, experience, location, and availability.'
  },
  {
    step: '03',
    title: 'Request Consent',
    description: 'Interested in a candidate? Request access to their full profile and documents.'
  },
  {
    step: '04',
    title: 'Connect & Hire',
    description: 'Once consent is granted, access contact details and begin the hiring conversation.'
  },
];

const testimonials = [
  {
    quote: 'The quality of candidates from GBP is exceptional. Every profile we\'ve reviewed has been thoroughly verified.',
    author: 'Thomas Richter',
    role: 'HR Director, Munich Tech GmbH'
  },
  {
    quote: 'The consent-based system respects candidate privacy while giving us the access we need to make hiring decisions.',
    author: 'Sandra Meyer',
    role: 'Talent Acquisition Lead, Berlin Startup AG'
  },
];

const ForCompanies = () => {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative py-20 lg:py-32 section-dark overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/berlin_office_premium_1769811809678.png"
            alt="Premium Berlin Office"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/90 via-navy/80 to-navy" />
        </div>

        <div className="container-premium relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-8">
              <Building2 className="w-4 h-4 text-gold" />
              <span className="text-gold text-sm font-medium">For Employers</span>
            </div>
            <h1 className="text-4xl lg:text-display font-display font-bold text-cream mb-6">
              Access Germany's Premium Verified Talent Pool
            </h1>
            <p className="text-lg text-cream/70 mb-10">
              Stop sifting through unqualified applicants. Connect with pre-verified
              professionals ready to contribute to your German business.
            </p>
            <Link
              to="/register?role=employer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl btn-gold text-base font-semibold shadow-premium-lg hover:scale-105 transition-transform"
            >
              Start Hiring <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 lg:py-32 bg-card">
        <div className="container-premium">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="badge-gold mb-4">Benefits</span>
            <h2 className="text-3xl lg:text-display-sm font-display font-bold text-foreground mb-4">
              Why Choose Our Platform
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We've built the most trusted recruitment platform for accessing
              international talent in Germany.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="card-premium p-8"
              >
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                  <benefit.icon className="w-7 h-7 text-gold" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-3">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-32 section-light">
        <div className="container-premium">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="badge-gold mb-4">Process</span>
            <h2 className="text-3xl lg:text-display-sm font-display font-bold text-foreground">
              How It Works
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-5xl font-display font-bold text-gold/30 mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-display font-bold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-32 bg-card">
        <div className="container-premium">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="badge-gold mb-4">Testimonials</span>
            <h2 className="text-3xl lg:text-display-sm font-display font-bold text-foreground">
              Trusted by Leading Companies
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="card-premium p-8"
              >
                <p className="text-lg text-foreground mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-32 bg-navy">
        <div className="container-premium text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Zap className="w-12 h-12 text-gold mx-auto mb-6" />
            <h2 className="text-3xl lg:text-display-sm font-display font-bold text-cream mb-6">
              Ready to Find Your Next Hire?
            </h2>
            <p className="text-lg text-cream/70 mb-8 max-w-2xl mx-auto">
              Join over 850 German companies already using our verified talent platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register?role=employer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl btn-gold text-base font-semibold"
              >
                Create Employer Account <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl btn-outline-light text-base font-semibold"
              >
                Contact Sales
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default ForCompanies;
