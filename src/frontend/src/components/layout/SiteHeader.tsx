import { Link, useNavigate } from '@tanstack/react-router';
import { ShoppingCart, Menu, X, Leaf } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import LoginButton from '../auth/LoginButton';
import CartBadge from '../store/CartBadge';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/auth/useCallerUserProfile';
import { useGetCallerRole } from '../../hooks/auth/useCallerRole';

interface NavLink {
  label: string;
  path: string;
}

export default function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: role } = useGetCallerRole();
  const { resolvedTheme } = useTheme();
  const isAuthenticated = !!identity;

  const navLinks: NavLink[] = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/catalog' },
  ];

  if (isAuthenticated) {
    navLinks.push({ label: 'My Orders', path: '/my-orders' });
  }

  const portalLinks: NavLink[] = [];
  if (role?.isPlatformAdmin) {
    portalLinks.push({ label: 'Team Portal', path: '/portal/team' });
  }
  if (role?.gardenCenterMemberships && role.gardenCenterMemberships.length > 0) {
    portalLinks.push({ label: 'Nursery Portal', path: '/portal/nursery' });
  }
  if (role?.isCustomer) {
    portalLinks.push({ label: 'Customer Portal', path: '/portal/customer' });
  }

  const adminLinks: NavLink[] = [];
  if (role?.isPlatformAdmin) {
    adminLinks.push({ label: 'Admin Products', path: '/admin' });
    adminLinks.push({ label: 'Admin Nurseries', path: '/admin/nurseries' });
    adminLinks.push({ label: 'Platform Admins', path: '/admin/platform-admins' });
  }
  if (role?.gardenCenterMemberships && role.gardenCenterMemberships.length > 0) {
    adminLinks.push({ label: 'Nursery Dashboard', path: '/nursery/dashboard' });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-custom flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img 
            src="/assets/generated/greenplantz-header-logo-user-upload.dim_auto_x112.cb_20260209_02.png"
            alt="GreenPlantz" 
            className="h-10 w-auto max-h-14 object-contain sm:h-12 md:h-14"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-sm font-medium transition-colors hover:text-primary"
              activeProps={{ className: 'text-primary' }}
            >
              {link.label}
            </Link>
          ))}
          {portalLinks.length > 0 && (
            <>
              <Separator orientation="vertical" className="h-4" />
              {portalLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm font-medium transition-colors hover:text-primary"
                  activeProps={{ className: 'text-primary' }}
                >
                  {link.label}
                </Link>
              ))}
            </>
          )}
          {adminLinks.length > 0 && (
            <>
              <Separator orientation="vertical" className="h-4" />
              {adminLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm font-medium transition-colors hover:text-primary"
                  activeProps={{ className: 'text-primary' }}
                >
                  {link.label}
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {isAuthenticated && userProfile && (
            <span className="hidden sm:inline text-sm text-muted-foreground">
              {userProfile.name}
            </span>
          )}
          <LoginButton />
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate({ to: '/cart' })}
          >
            <ShoppingCart className="h-5 w-5" />
            <CartBadge />
          </Button>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-lg font-medium transition-colors hover:text-primary"
                    activeProps={{ className: 'text-primary' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                {portalLinks.length > 0 && (
                  <>
                    <Separator className="my-2" />
                    {portalLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className="text-lg font-medium transition-colors hover:text-primary"
                        activeProps={{ className: 'text-primary' }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </>
                )}
                {adminLinks.length > 0 && (
                  <>
                    <Separator className="my-2" />
                    {adminLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className="text-lg font-medium transition-colors hover:text-primary"
                        activeProps={{ className: 'text-primary' }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
