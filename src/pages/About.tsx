import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Target,
  Users,
  Globe,
  Award,
  CheckCircle2,
  ArrowRight,
  Building2
} from 'lucide-react';
import { MarketingLayout } from '@/components/layout';

const values = [
  {
    icon: Target,
    title: 'Quality First',
    description: 'We prioritize verified, high-quality candidates over volume, ensuring every profile meets German industry standards.'
  },
  {
    icon: Users,
    title: 'Privacy by Design',
    description: 'Consent-based data sharing puts candidates in control while enabling meaningful connections with employers.'
  },
  {
    icon: Globe,
    title: 'Global Reach, Local Focus',
    description: 'We connect international talent with German employers, bridging cultures and creating opportunities.'
  },
  {
    icon: Award,
    title: 'Trust & Transparency',
    description: 'Every interaction on our platform is designed to build trust through verification and accountability.'
  },
];

const team = [
  { name: 'Dr. Klaus Müller', role: 'CEO & Founder', bio: '20+ years in HR technology', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
  { name: 'Sarah Schmidt', role: 'Head of Operations', bio: 'Former McKinsey consultant', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' },
  { name: 'Michael Weber', role: 'CTO', bio: 'Ex-SAP engineering lead', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' },
  { name: 'Anna Bauer', role: 'Head of Compliance', bio: 'Immigration law expert', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop' },
];

const About = () => {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative py-20 lg:py-32 section-dark overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/professional_team_collaboration_1769811837982.png"
            alt="Diverse professional team"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/95 via-navy/85 to-navy" />
        </div>

        <div className="container-premium relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="badge-gold mb-4">About Us</span>
            <h1 className="text-4xl lg:text-display font-display font-bold text-cream mb-6">
              Building Germany's Most Trusted Talent Platform
            </h1>
            <p className="text-lg text-cream/70">
              We believe recruitment should be built on trust, transparency, and respect
              for privacy. That's why we created a platform where quality matters more
              than quantity, and consent is never an afterthought.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 lg:py-32 bg-card">
        <div className="container-premium">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-display-sm font-display font-bold text-foreground mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Germany faces a significant skills shortage, yet international talent
                often struggles to navigate the complex hiring landscape. We exist to
                bridge this gap.
              </p>
              <p className="text-muted-foreground mb-6">
                By combining rigorous verification with privacy-first principles, we
                create a marketplace where employers can trust every candidate, and
                candidates can control their own data.
              </p>
              <ul className="space-y-3">
                {[
                  'Connect verified international talent with German employers',
                  'Reduce hiring friction while maintaining quality',
                  'Protect candidate privacy through consent-based sharing',
                  'Build long-term trust between all parties'
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-2xl p-12"
            >
              {/* Card Background Image */}
              <div className="absolute inset-0 z-0">
                <img
                  src="/german_industry_high_tech_1769811823885.png"
                  alt="High-tech German industry"
                  className="w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-navy/80" />
              </div>

              <div className="relative z-10 text-center">
                <div className="text-6xl font-display font-bold text-gold mb-4">2019</div>
                <p className="text-cream/70 mb-8">Founded in Berlin</p>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-3xl font-bold text-cream">5,000+</div>
                    <p className="text-sm text-cream/60">Verified Professionals</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-cream">850+</div>
                    <p className="text-sm text-cream/60">Partner Companies</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 lg:py-32 section-light">
        <div className="container-premium">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="badge-gold mb-4">Our Values</span>
            <h2 className="text-3xl lg:text-display-sm font-display font-bold text-foreground">
              What Drives Us
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-3">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 lg:py-32 bg-card">
        <div className="container-premium">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="badge-gold mb-4">Leadership</span>
            <h2 className="text-3xl lg:text-display-sm font-display font-bold text-foreground">
              Meet Our Team
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="card-premium p-6 text-center group"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-transparent group-hover:border-gold transition-all duration-300 shadow-lg">
                  <img src={(member as any).image} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <h3 className="font-display font-semibold text-foreground group-hover:text-gold transition-colors">{member.name}</h3>
                <p className="text-sm text-gold mb-2">{member.role}</p>
                <p className="text-xs text-muted-foreground">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Office Section */}
      <section className="py-24 bg-navy relative overflow-hidden">
        <div className="container-premium">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium mb-6">
                <Building2 className="w-4 h-4" />
                <span>Global Presence</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-display font-bold text-white mb-8">
                Our Berlin <span className="text-gold">Headquarters</span>
              </h2>
              <p className="text-xl text-white/70 mb-10 leading-relaxed">
                Based in the heart of Europe's most vibrant tech hub, our team works across
                continents to bridge the gap between talent and opportunity. Our flagship office
                in Berlin serves as the central hub for our verification and operations teams.
              </p>
              <div className="flex items-center gap-4 text-white/90 bg-white/5 p-6 rounded-2xl border border-white/10">
                <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <p className="font-bold text-white">Friedrichstraße 123</p>
                  <p className="text-sm text-white/60">10117 Berlin, Germany</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 bg-gold/10 mix-blend-overlay z-10" />
              <img
                src="/berlin_office_premium_1769811809678.png"
                alt="Berlin Headquarters"
                className="w-full h-auto object-cover min-h-[400px]"
              />
            </motion.div>
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
            <h2 className="text-3xl lg:text-display-sm font-display font-bold text-cream mb-6">
              Join Our Growing Network
            </h2>
            <p className="text-lg text-cream/70 mb-8 max-w-2xl mx-auto">
              Whether you're an employer looking for verified talent or a professional
              seeking opportunities in Germany, we're here to help.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl btn-gold text-base font-semibold"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default About;
