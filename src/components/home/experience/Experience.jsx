import React from 'react';
import { Wine, UtensilsCrossed, Clock } from 'lucide-react';
import { ExperienceCard } from './ExperienceCard';
import { ExperienceImage } from './ExperienceImage';
import { useInView } from '../../../hooks/useInView';
import { useContent } from '@/context/contexts/ContentContext';

const iconComponents = {
  Wine: Wine,
  UtensilsCrossed: UtensilsCrossed,
  Clock: Clock
};

export function Experience() {
  const { ref, inView } = useInView({ threshold: 0.1 });
  const { content } = useContent();
  const { section, cards } = content.experience;

  return (
    <div id="experience" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          ref={ref}
          className={`text-center mb-16 transform transition-all duration-1000 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="relative inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-400 rounded-lg blur opacity-25"></div>
            <h2 className="relative text-4xl sm:text-5xl font-serif mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-400">
              {section.title}
            </h2>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            {section.subtitle}
          </p>
        </div>

        <div className="space-y-24">
          {cards.map((card, index) => {
            const IconComponent = iconComponents[card.icon];
            return (
              <div
                key={index}
                className={`grid md:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'md:grid-flow-dense' : ''
                }`}
              >
                {index % 2 === 0 ? (
                  <>
                    <ExperienceCard
                      icon={<IconComponent className="h-8 w-8" />}
                      title={card.title}
                      description={card.description}
                      index={index}
                    />
                    <ExperienceImage
                      image={card.image}
                      alt={card.title}
                      index={index}
                    />
                  </>
                ) : (
                  <>
                    <ExperienceImage
                      image={card.image}
                      alt={card.title}
                      index={index}
                    />
                    <ExperienceCard
                      icon={<IconComponent className="h-8 w-8" />}
                      title={card.title}
                      description={card.description}
                      index={index}
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
