import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  User,
  CheckCircle2,
  Shield,
  FileCheck,
  Eye,
  ArrowRight,
  Briefcase,
  Lock,
  Clock,
  Award
} from 'lucide-react';
import { MarketingLayout } from '@/components/layout';

const benefits = [
  {
    icon: Shield,
    title: 'Get Verified',
    description: 'Stand out with a verified profile that proves your qualifications to employers.'
  },
  {
    icon: Eye,
    title: 'Control Your Privacy',
    description: 'You decide who can see your contact details and personal documents.'
  },
  {
    icon: Briefcase,
    title: 'Access German Jobs',
    description: 'Connect with verified German employers actively looking for international talent.'
  },
  {
    icon: Lock,
    title: 'Secure Documents',
    description: 'Upload credentials securely—they\'re only shared with your explicit consent.'
  },
  {
    icon: Clock,
    title: 'Fast Review',
    description: 'Our team reviews applications within 24 hours on average.'
  },
  {
    icon: Award,
    title: 'Trusted Platform',
    description: 'Join 5,000+ verified professionals already using our platform.'
  },
];

const process = [
  {
    step: '01',
    title: 'Create Your Profile',
    description: 'Sign up and build your professional profile with experience, skills, and qualifications.'
  },
  {
    step: '02',
    title: 'Upload Documents',
    description: 'Add your credentials, certificates, and work history for verification.'
  },
  {
    step: '03',
    title: 'Get Verified',
    description: 'Our expert team reviews your application and documents within 24 hours.'
  },
  {
    step: '04',
    title: 'Become Visible',
    description: 'Once approved, your profile becomes visible to verified German employers.'
  },
];

const faqs = [
  {
    question: 'How long does verification take?',
    answer: 'Most applications are reviewed within 24 hours. Complex cases may take up to 3 business days.'
  },
  {
    question: 'What documents do I need?',
    answer: 'At minimum, you\'ll need ID/passport and proof of qualifications. Additional documents may be required for specific roles.'
  },
  {
    question: 'Is my data safe?',
    answer: 'Yes, we use bank-level encryption and GDPR-compliant data handling. Your documents are only shared with your explicit consent.'
  },
  {
    question: 'Is it free for candidates?',
    answer: 'Yes, creating a profile and getting verified is completely free for job seekers.'
  },
];

const ForWorkers = () => {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative py-20 lg:py-32 section-dark overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/remote_hiring_modern_1769811886717.png"
            alt="Professional at work"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/95 via-navy/85 to-navy" />
        </div>

        <div className="container-premium relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-8">
              <User className="w-4 h-4 text-gold" />
              <span className="text-gold text-sm font-medium">For Professionals</span>
            </div>
            <h1 className="text-4xl lg:text-display font-display font-bold text-cream mb-6">
              Launch Your Career in Germany
            </h1>
            <p className="text-lg text-cream/70 mb-10">
              Create a verified profile, control your privacy, and connect with
              trusted German employers looking for talent like you.
            </p>
            <Link
              to="/register?role=candidate"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl btn-gold text-base font-semibold shadow-premium-lg hover:scale-105 transition-transform"
            >
              Create Free Profile <ArrowRight className="w-5 h-5" />
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
              Why Join Our Platform
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We've built the most trusted pathway for international professionals
              seeking opportunities in Germany.
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
              Your Path to Germany
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

      {/* FAQs */}
      <section className="py-20 lg:py-32 bg-card">
        <div className="container-premium">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="badge-gold mb-4">FAQ</span>
            <h2 className="text-3xl lg:text-display-sm font-display font-bold text-foreground">
              Common Questions
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, i) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="card-premium p-6"
              >
                <h3 className="font-display font-semibold text-foreground mb-2">
                  {faq.question}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {faq.answer}
                </p>
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
            <Award className="w-12 h-12 text-gold mx-auto mb-6" />
            <h2 className="text-3xl lg:text-display-sm font-display font-bold text-cream mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg text-cream/70 mb-8 max-w-2xl mx-auto">
              Join 5,000+ verified professionals already connected with German employers.
            </p>
            <Link
              to="/register?role=candidate"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl btn-gold text-base font-semibold"
            >
              Create Free Profile <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default ForWorkers;
