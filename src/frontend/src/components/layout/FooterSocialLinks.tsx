import { Mail } from 'lucide-react';
import { SiInstagram, SiWhatsapp } from 'react-icons/si';

export default function FooterSocialLinks() {
  const socialLinks = [
    {
      name: 'WhatsApp',
      href: 'https://wa.me/916238029664',
      icon: SiWhatsapp,
      label: 'Chat with us on WhatsApp',
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com/greenplantz_',
      icon: SiInstagram,
      label: 'Follow us on Instagram',
    },
    {
      name: 'Email',
      href: 'mailto:caregreenplantz@gmail.com',
      icon: Mail,
      label: 'Send us an email',
    },
  ];

  return (
    <div className="flex flex-col items-center gap-4">
      <h4 className="font-semibold text-sm text-foreground">Connect With Us</h4>
      <div className="flex flex-wrap items-center justify-center gap-4">
        {socialLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
          >
            <link.icon className="h-5 w-5" />
            <span className="text-sm font-medium">{link.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
