import React from 'react';
import { useInView } from '../../../hooks/useInView';

export function ExperienceImage({ image, alt, index }) {
  const { ref, inView } = useInView({ threshold: 0.2 });

  return (
    <div 
      ref={ref}
      className={`relative transform transition-all duration-1000 delay-${index * 200} ${
        inView 
          ? 'opacity-100 translate-x-0' 
          : `opacity-0 ${index % 2 === 0 ? '-translate-x-20' : 'translate-x-20'}`
      }`}
    >
      <div className="absolute inset-0 bg-green-600/20 rounded-[2.5rem] transform translate-x-4 translate-y-4 animate-pulse-soft" />
      <img
        src={image}
        alt={alt}
        className="w-full h-[400px] object-cover rounded-[2.5rem] relative z-10 animate-float"
      />
    </div>
  );
}
