import React from 'react';
import { useInView } from '../../../hooks/useInView';
import { TestimonialCard } from './TestimonialCard';

const testimonials = [
  {
    text: "An extraordinary culinary journey that delights all senses. The attention to detail and service is impeccable.",
    author: "James Mitchell",
    title: "Food Critic"
  },
  {
    text: "The tasting menu was a masterpiece of flavors. Each dish tells its own unique story.",
    author: "Sarah Chen",
    title: "Restaurant Connoisseur"
  },
  {
    text: "A dining experience that transcends the ordinary. The wine pairing was absolutely perfect.",
    author: "Michael Roberts",
    title: "Wine Enthusiast"
  }
];

export function Testimonials() {
  const { ref, inView } = useInView({ threshold: 0.1 });

  return (
    <div className="py-16 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          ref={ref}
          className={`text-center mb-16 transform transition-all duration-1000 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="relative inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-amber-400 rounded-lg blur opacity-25"></div>
            <h2 className="relative text-4xl sm:text-5xl font-serif mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-amber-400">
              Epicurean Experiences
            </h2>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Cherished moments from our distinguished guests
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              {...testimonial}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
