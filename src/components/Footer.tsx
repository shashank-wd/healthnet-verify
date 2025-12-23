import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook, Instagram, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Providers', path: '/providers' },
    { name: 'Validate', path: '/validate' },
    { name: 'Reports', path: '/reports' },
  ];

  const supportLinks = [
    { name: 'Help Center', path: '#' },
    { name: 'Documentation', path: '#' },
    { name: 'API Reference', path: '#' },
    { name: 'Contact Support', path: '#' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', path: '#' },
    { name: 'Terms of Service', path: '#' },
    { name: 'Cookie Policy', path: '#' },
    { name: 'HIPAA Compliance', path: '#' },
  ];

  const socialLinks = [
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
  ];

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-healthcare flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">PV</span>
              </div>
              <span className="text-xl font-bold text-foreground">ProviderValidate</span>
            </div>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
              Streamline your healthcare provider data validation with real-time registry checks and comprehensive compliance tools.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a href="mailto:support@providervalidate.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                support@providervalidate.com
              </a>
              <a href="tel:+1-800-555-0123" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Phone className="h-4 w-4" />
                +1 (800) 555-0123
              </a>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                123 Healthcare Ave, Suite 500, San Francisco, CA 94102
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} ProviderValidate. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground mr-2">Connect with us:</span>
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}