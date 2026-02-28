import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { MarketingLayout } from '@/components/layout';

const Contact = () => {
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
            <span className="badge-gold mb-4">Contact</span>
            <h1 className="text-4xl lg:text-display font-display font-bold text-cream mb-6">
              Get in Touch
            </h1>
            <p className="text-lg text-cream/70">
              Have questions about our platform? We're here to help. Reach out to our
              team and we'll respond within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 lg:py-32 bg-card">
        <div className="container-premium">
          <div className="grid lg:grid-cols-[1fr_400px] gap-16">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-display font-bold text-foreground mb-6">
                Send us a message
              </h2>
              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  console.log('Form submitted:', Object.fromEntries(formData));
                  alert('Thank you for your message! Our team will get back to you within 24 hours.');
                  e.currentTarget.reset();
                }}
              >
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="input-premium"
                      placeholder="Your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="input-premium"
                      placeholder="Your last name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="input-premium"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Company (optional)
                  </label>
                  <input
                    type="text"
                    className="input-premium"
                    placeholder="Your company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Subject
                  </label>
                  <select className="input-premium">
                    <option value="">Select a subject</option>
                    <option value="employer">Employer Inquiry</option>
                    <option value="candidate">Candidate Question</option>
                    <option value="partnership">Partnership</option>
                    <option value="support">Technical Support</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    className="input-premium resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 rounded-lg btn-gold font-semibold"
                >
                  Send Message
                </button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="card-premium p-8 mb-8">
                <h3 className="text-xl font-display font-bold text-foreground mb-6">
                  Contact Information
                </h3>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Address</p>
                      <p className="text-sm text-muted-foreground">
                        Friedrichstraße 123<br />
                        10117 Berlin, Germany
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <a href="mailto:info@gbp-portal.de" className="text-sm text-gold hover:underline">
                        info@gbp-portal.de
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Phone</p>
                      <a href="tel:+4930123456789" className="text-sm text-gold hover:underline">
                        +49 30 123 456 789
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Office Hours</p>
                      <p className="text-sm text-muted-foreground">
                        Monday - Friday<br />
                        9:00 AM - 6:00 PM CET
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-navy rounded-xl p-8 text-center">
                <h3 className="text-lg font-display font-bold text-cream mb-2">
                  Enterprise Inquiries
                </h3>
                <p className="text-sm text-cream/70 mb-4">
                  Looking for custom solutions for your organization?
                </p>
                <a href="mailto:enterprise@gbp-portal.de" className="text-gold font-semibold hover:underline">
                  enterprise@gbp-portal.de
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default Contact;
