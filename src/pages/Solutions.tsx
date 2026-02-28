import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  FileCheck, 
  Search, 
  Lock, 
  CheckCircle2,
  ArrowRight,
  Building2,
  User,
  Clock,
  Zap
} from 'lucide-react';
import { MarketingLayout } from '@/components/layout';

const solutions = [
  {
    icon: Shield,
    title: 'Profile Verification',
    description: 'Multi-step verification process ensuring every candidate meets quality standards before becoming visible.'
  },
  {
    icon: FileCheck,
    title: 'Document Authentication',
    description: 'Expert staff review and validate credentials, certificates, and work history documentation.'
  },
  {
    icon: Lock,
    title: 'Consent Management',
    description: 'Privacy-first approach where candidates control exactly who can access their information.'
  },
  {
    icon: Search,
    title: 'Talent Discovery',
    description: 'Advanced search and filtering to find the right candidates from our verified talent pool.'
  },
  {
    icon: Users,
    title: 'Applicant Management',
    description: 'Streamlined tools to manage job postings, applications, and candidate communications.'
  },
  {
    icon: Clock,
    title: 'Fast Processing',
    description: 'Average 24-hour verification turnaround keeps your hiring pipeline moving.'
  },
];

const process = [
  {
    step: '01',
    title: 'Create Account',
    description: 'Register as an employer or candidate and complete your profile.'
  },
  {
    step: '02',
    title: 'Verification',
    description: 'Submit required documents for our expert team to review and validate.'
  },
  {
    step: '03',
    title: 'Go Live',
    description: 'Once verified, access the talent pool or become visible to employers.'
  },
  {
    step: '04',
    title: 'Connect',
    description: 'Request consent, communicate, and build lasting professional relationships.'
  },
];

const Solutions = () => {
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
            <span className="badge-gold mb-4">Solutions</span>
            <h1 className="text-4xl lg:text-display font-display font-bold text-cream mb-6">
              Comprehensive Recruitment Solutions
            </h1>
            <p className="text-lg text-cream/70 mb-10">
              From verification to placement, our platform provides everything you need 
              for successful, compliant hiring in Germany.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/for-companies"
                className="flex items-center gap-2 px-6 py-3 rounded-lg btn-gold"
              >
                <Building2 className="w-5 h-5" />
                For Companies
              </Link>
              <Link
                to="/for-workers"
                className="flex items-center gap-2 px-6 py-3 rounded-lg btn-outline-light"
              >
                <User className="w-5 h-5" />
                For Workers
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-20 lg:py-32 bg-card">
        <div className="container-premium">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-display-sm font-display font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform combines powerful tools with rigorous verification to create 
              a trusted marketplace for German recruitment.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutions.map((solution, i) => (
              <motion.div
                key={solution.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="card-premium p-8"
              >
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                  <solution.icon className="w-7 h-7 text-gold" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-3">
                  {solution.title}
                </h3>
                <p className="text-muted-foreground">
                  {solution.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 lg:py-32 section-light">
        <div className="container-premium">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="badge-gold mb-4">How It Works</span>
            <h2 className="text-3xl lg:text-display-sm font-display font-bold text-foreground">
              Simple 4-Step Process
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
                className="relative"
              >
                <div className="text-6xl font-display font-bold text-accent/20 mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
                {i < process.length - 1 && (
                  <div className="hidden lg:block absolute top-8 right-0 w-1/2 h-px bg-border" />
                )}
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
              Ready to Get Started?
            </h2>
            <p className="text-lg text-cream/70 mb-8 max-w-2xl mx-auto">
              Join thousands of companies and professionals already using our platform.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl btn-gold text-base font-semibold"
            >
              Create Your Account <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default Solutions;
