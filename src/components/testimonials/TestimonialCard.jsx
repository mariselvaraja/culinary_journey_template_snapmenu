import React from 'react';
import { Quote } from 'lucide-react';
import { useInView } from '../../hooks/useInView';

export function TestimonialCard({ text, author, title, index }) {
  const { ref, inView } = useInView({ threshold: 0.2 });

  return (
    <div 
      ref={ref}
      className={`transform transition-all duration-1000 delay-${index * 200} ${
        inView 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-20'
      }`}
    >
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 h-full">
        <Quote className="h-8 w-8 text-orange-600 mb-4 animate-float" />
        <p className="text-gray-700 mb-6 italic">"{text}"</p>
        <div>
          <p className="font-serif text-lg">{author}</p>
          <p className="text-gray-500 text-sm">{title}</p>
        </div>
      </div>
    </div>
  );
}