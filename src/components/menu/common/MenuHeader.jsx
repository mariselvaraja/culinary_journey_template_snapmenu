import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useMenu } from '@/context/contexts/MenuContext';

export function MenuHeader({ title, description }) {
  const navigate = useNavigate();
  const { menuData } = useMenu();

  return (
    <div className="mb-12">
      {/* Category navigation */}
      <div className="flex flex-wrap gap-4 mb-8">
        {menuData.categories.map((category) => (
          <Link
            key={category.id}
            to={`/menu/${category.id}`}
            className="px-4 py-2 rounded-full text-sm font-medium transition-colors bg-gray-800 text-gray-300 hover:bg-gray-700"
          >
            {category.name}
          </Link>
        ))}
      </div>

      {/* Back button and title */}
      <div>
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>
        <h1 className="text-4xl font-serif mb-4 text-white">{title}</h1>
        {description && (
          <p className="text-gray-400 max-w-2xl">{description}</p>
        )}
      </div>
    </div>
  );
}
