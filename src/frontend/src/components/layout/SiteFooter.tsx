import { Heart, Phone, Mail } from 'lucide-react';
import { SiInstagram, SiWhatsapp } from 'react-icons/si';
import { Link } from '@tanstack/react-router';
import FooterSocialLinks from './FooterSocialLinks';

export default function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-lg mb-2 text-primary">GreenPlantz</h3>
            <p className="text-sm text-muted-foreground">
              Your trusted source for quality plants and garden supplies.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-2">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/catalog" className="text-muted-foreground hover:text-primary transition-colors">
                  Shop All Products
                </Link>
              </li>
              <li>
                <Link to="/my-orders" className="text-muted-foreground hover:text-primary transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/portal/nursery" className="text-muted-foreground hover:text-primary transition-colors">
                  Vendor or Nursery Registration / Sign In
                </Link>
              </li>
              <li>
                <Link to="/portal/team" className="text-muted-foreground hover:text-primary transition-colors">
                  GreenPlantz Team / Admin Login
                </Link>
              </li>
              <li>
                <Link to="/portal/customer" className="text-muted-foreground hover:text-primary transition-colors">
                  Customer Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-2">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a 
                  href="https://wa.me/916238029664" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <SiWhatsapp className="h-4 w-4" />
                  <span>WhatsApp: +91 6238029664</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://instagram.com/greenplantz_" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <SiInstagram className="h-4 w-4" />
                  <span>Instagram: @greenplantz_</span>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:caregreenplantz@gmail.com"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>caregreenplantz@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t">
          <FooterSocialLinks />
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-1">
              © 2026. Built with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> using{' '}
              <a 
                href="https://caffeine.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
