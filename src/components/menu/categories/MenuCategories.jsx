import React from 'react';
import { Link } from 'react-router-dom';
import { useMenu } from '@/context/contexts/MenuContext';
import { getCategoryImage, getCategoryDescription } from '../../../utils/menuHelpers';

export function MenuCategories() {
  const { menuData } = useMenu();
  
  console.log('MenuCategories rendered with menuData:', menuData);

  // Early return if menuData is not loaded
  if (!menuData?.categories) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-white">Loading menu categories...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-serif mb-6 text-white">Our Menu</h1>
        <div className="relative inline-block">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-orange-400 rounded-lg blur opacity-25"></div>
          <div className="relative bg-gray-900 px-8 py-6 rounded-lg border border-gray-800">
            <p className="text-xl font-serif text-gray-300 italic max-w-3xl mx-auto leading-relaxed">
              Explore our carefully curated selection of dishes, where traditional techniques meet contemporary innovation
            </p>
            <div className="absolute left-1/2 -bottom-3 w-24 h-1 bg-orange-500 transform -translate-x-1/2"></div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {menuData.categories.map((category) => (
          <Link
            key={category.id}
            to={`/menu/${category.id}`}
            className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="aspect-[16/9] overflow-hidden">
              <img
                src={getCategoryImage(category.id, menuData)}
                alt={category.name}
                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h2 className="text-2xl font-serif mb-2 group-hover:text-orange-400 transition-colors">
                {category.name}
              </h2>
              <p className="text-white/80 text-sm mb-4">
                {getCategoryDescription(category.id)}
              </p>
              <div className="flex flex-wrap gap-2">
                {category.subCategories.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `/menu/${category.id}?subCategory=${sub.id}`;
                    }}
                    className="text-sm px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors cursor-pointer"
                  >
                    {sub.name}
                  </div>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
