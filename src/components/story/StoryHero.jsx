import React from 'react';
import { useContent } from '@/context/contexts/ContentContext';

export function StoryHero() {
  const { content } = useContent();
  const { hero } = content.story;

  return (
    <div className="relative h-[70vh] flex items-center">
      <div className="absolute inset-0">
        <img
          src={hero.image}
          alt="Vintage restaurant interior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <h1 className="text-5xl sm:text-7xl font-serif mb-6">{hero.title}</h1>
        <p className="text-xl sm:text-2xl max-w-3xl mx-auto font-light leading-relaxed">
          {hero.description}
        </p>
      </div>
    </div>
  );
}
