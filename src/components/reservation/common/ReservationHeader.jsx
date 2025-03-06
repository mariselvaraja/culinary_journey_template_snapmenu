import React from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { useContent } from '@/context/contexts/ContentContext';

export function ReservationHeader() {
  const { content } = useContent();
  const { header } = content.reservation;
  return (
    <div className="text-center mb-16">
      <div className="inline-flex items-center justify-center mb-4">
        <div className="w-12 h-0.5 bg-orange-600"></div>
        <span className="mx-4 text-orange-600">
          <UtensilsCrossed className="h-6 w-6" />
        </span>
        <div className="w-12 h-0.5 bg-orange-600"></div>
      </div>
      <h1 className="text-5xl sm:text-6xl font-light mb-6 bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
        {header.title}
      </h1>
      <p className="text-gray-600 max-w-2xl mx-auto text-lg font-light">
        {header.description}
      </p>
    </div>
  );
}
