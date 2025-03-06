import React from 'react';
import { Link } from 'react-router-dom';

export function HeroBanner({ image, title, subtitle, isActive }) {
  return (
    <div 
      className={`absolute inset-0 transition-all duration-1000 ${
        isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
    >
      <div className="absolute inset-0">
        <img 
          src={image}
          alt={title}
          className={`w-full h-full object-cover transition-transform duration-[2s] ${
            isActive ? 'scale-110' : 'scale-100'
          }`}
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
      
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 flex items-center">
        <div className="max-w-2xl space-y-8">
          <h1 
            className={`text-4xl sm:text-5xl md:text-7xl font-serif text-white ${
              isActive ? 'animate-slide-up' : 'opacity-0'
            }`}
          >
            {title}
          </h1>
          <p 
            className={`text-lg sm:text-xl md:text-2xl text-white/80 font-light ${
              isActive ? 'animate-slide-up delay-200' : 'opacity-0'
            }`}
          >
            {subtitle}
          </p>
          <div 
            className={`flex flex-col sm:flex-row items-center gap-4 ${
              isActive ? 'animate-slide-up delay-300' : 'opacity-0'
            }`}
          >
            <Link 
              to="/reserve"
              className="w-full sm:w-auto px-8 py-3 text-sm font-light bg-white text-black hover:bg-white/90 transition-all duration-300 hover:scale-105"
            >
              RESERVE NOW
            </Link>
            <Link 
              to="/menu"
              className="w-full sm:w-auto px-8 py-3 text-sm font-light border border-white text-white hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              VIEW MENU
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
