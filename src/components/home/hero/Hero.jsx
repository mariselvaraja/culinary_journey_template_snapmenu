import React, { useState, useEffect } from 'react';
import { HeroBanner } from './HeroBanner';
import { useContent } from '@/context/contexts/ContentContext';

export function Hero() {
  const { content } = useContent();
  const { banners, autoPlayInterval } = content.hero;
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[85vh] overflow-hidden">
      {banners.map((banner, index) => (
        <HeroBanner
          key={index}
          image={banner.image}
          title={banner.title}
          subtitle={banner.subtitle}
          isActive={currentBanner === index}
        />
      ))}
      
      {/* Banner Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentBanner(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentBanner === index 
                ? 'bg-white w-6' 
                : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
