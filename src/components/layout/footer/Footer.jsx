import React from 'react';
import { Utensils } from 'lucide-react';
import { useContent } from '@/context/contexts/ContentContext';
import { FooterNewsletter } from './FooterNewsletter';
import { FooterLinks } from './FooterLinks';
import { FooterSocial } from './FooterSocial';

export function Footer() {
  const { content, loading } = useContent();

  if (loading || !content) {
    return (
      <footer className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex items-center space-x-2">
            <Utensils className="h-6 w-6" />
            <span className="text-2xl font-serif">Loading...</span>
          </div>
        </div>
      </footer>
    );
  }

  const { brand } = content;
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Brand and Newsletter */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <Utensils className="h-6 w-6" />
              <span className="text-2xl font-serif">{brand.name}</span>
            </div>
            <FooterNewsletter />
          </div>

          {/* Links */}
          <FooterLinks />
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <FooterSocial />
          <p className="text-gray-400 text-sm">
            {content.footer.copyright.text}
          </p>
        </div>
      </div>
    </footer>
  );
}
