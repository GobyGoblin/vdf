import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Linkedin, Twitter } from 'lucide-react';
// Use the logo from public folder
const logo = '/logo.png';

const footerLinks = {
  solutions: [
    { name: 'For Companies', href: '/for-companies' },
    { name: 'For Workers', href: '/for-workers' },
    { name: 'Talent Pool', href: '/solutions' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Insights', href: '/insights' },
    { name: 'Contact', href: '/contact' },
  ],
  legal: [
    { name: 'Impressum', href: '/impressum' },
    { name: 'Datenschutz', href: '/datenschutz' },
    { name: 'AGB', href: '/agb' },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-navy text-cream relative">
      <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-gold via-yellow-200 to-gold shadow-[0_0_15px_rgba(255,215,0,0.3)]" />
      {/* Main Footer */}
      <div className="container-premium py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="bg-white rounded-full p-1.5 h-10 w-10 flex items-center justify-center overflow-hidden border border-white/20">
                <img src={logo} alt="German Business Portal" className="h-full w-auto object-contain" />
              </div>
            </Link>
            <p className="text-cream/70 text-sm leading-relaxed mb-6">
              Connecting verified talent with trusted German employers through a secure,
              consent-based recruitment platform.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-lg bg-cream/10 hover:bg-cream/20 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-cream/10 hover:bg-cream/20 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-gold mb-4">
              Solutions
            </h4>
            <ul className="space-y-3">
              {footerLinks.solutions.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-cream/70 hover:text-cream text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-gold mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-cream/70 hover:text-cream text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-gold mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-cream/70">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Friedrichstraße 123<br />10117 Berlin, Germany</span>
              </li>
              <li>
                <a href="mailto:info@gbp-portal.de" className="flex items-center gap-3 text-sm text-cream/70 hover:text-cream transition-colors">
                  <Mail className="w-4 h-4" />
                  info@gbp-portal.de
                </a>
              </li>
              <li>
                <a href="tel:+4930123456789" className="flex items-center gap-3 text-sm text-cream/70 hover:text-cream transition-colors">
                  <Phone className="w-4 h-4" />
                  +49 30 123 456 789
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-cream/10">
        <div className="container-premium py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-cream/50 text-sm">
            © {new Date().getFullYear()} VP In Deutschland. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-cream/50 hover:text-cream text-sm transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
