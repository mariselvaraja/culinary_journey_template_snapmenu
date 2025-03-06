import React from 'react';
import { ArrowRight } from 'lucide-react';

export function CallToAction() {
  return (
    <div className="py-24 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-5xl font-bold mb-8">Ready to get started?</h2>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          Join thousands of creators and businesses building their digital presence with our platform.
        </p>
        <button className="px-8 py-4 text-lg font-medium bg-white text-black rounded-full hover:bg-gray-100 flex items-center gap-2 mx-auto">
          Start Building Now
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}