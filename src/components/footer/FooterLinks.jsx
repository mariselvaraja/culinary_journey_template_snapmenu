import React from 'react';
import { useContent } from '../../context/ContentContext';

export function FooterLinks() {
  const { content, loading } = useContent();

  if (loading || !content) {
    return (
      <div className="grid grid-cols-2 gap-8 lg:gap-16">
        <div>
          <h3 className="text-lg font-serif mb-4 text-white/50">Loading...</h3>
        </div>
      </div>
    );
  }

  const { linkGroups } = content.footer;
  return (
    <div className="grid grid-cols-2 gap-8 lg:gap-16">
      {linkGroups.map((group, index) => (
        <div key={group.title}>
          <h3 className="text-lg font-serif mb-4 text-white">{group.title}</h3>
          <ul className="space-y-2">
            {group.links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
