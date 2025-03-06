import React from 'react';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import { useContent } from '@/context/contexts/ContentContext';

const iconComponents = {
  Instagram,
  Facebook,
  Twitter
};

export function FooterSocial() {
  const { content, loading } = useContent();

  if (loading || !content) {
    return (
      <div className="flex gap-4">
        <div className="w-6 h-6 bg-gray-700/50 rounded-full animate-pulse"></div>
        <div className="w-6 h-6 bg-gray-700/50 rounded-full animate-pulse"></div>
        <div className="w-6 h-6 bg-gray-700/50 rounded-full animate-pulse"></div>
      </div>
    );
  }

  const { links } = content.footer.social;
  return (
    <div className="flex gap-4">
      {links.map((link) => {
        const IconComponent = iconComponents[link.icon];
        return (
          <a
            key={link.platform}
            href={link.href}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label={link.ariaLabel}
          >
            <IconComponent className="h-6 w-6" />
          </a>
        );
      })}
    </div>
  );
}
