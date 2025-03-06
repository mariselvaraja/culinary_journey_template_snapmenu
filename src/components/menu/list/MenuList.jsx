import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { MenuHeader } from '../common';
import { MenuItemCard } from './MenuItemCard';
import { getCategoryDescription } from '../../../utils/menuHelpers';
import { useMenu } from '@/context/contexts/MenuContext';

export function MenuList() {
  const { categoryId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const subCategoryId = searchParams.get('subCategory');
  const { menuData } = useMenu();
  
  const category = menuData.categories.find(cat => cat.id === categoryId);
  const subCategory = category?.subCategories.find(sub => sub.id === subCategoryId);
  
  // Get items for the current category
  const categoryItems = menuData.menu[categoryId] || [];
  const filteredItems = subCategoryId 
    ? categoryItems.filter(item => item.subCategory === subCategoryId)
    : categoryItems;

  if (!category) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Category not found</h2>
      </div>
    );
  }

  const title = subCategory ? `${category.name} - ${subCategory.name}` : category.name;
  const description = getCategoryDescription(categoryId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <MenuHeader 
        title={title}
        description={description}
      />
      
      {/* Category navigation */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4">
          {category.subCategories.map((sub) => (
            <a
              key={sub.id}
              href={`/menu/${categoryId}?subCategory=${sub.id}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                sub.id === subCategoryId
                  ? 'bg-white text-black'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {sub.name}
            </a>
          ))}
        </div>
      </div>
      
      {/* Menu items grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredItems.map((item) => (
          <MenuItemCard 
            key={item.id}
            item={item}
            categoryId={categoryId}
          />
        ))}
      </div>

      {/* No items message */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No items found in this category</p>
        </div>
      )}
    </div>
  );
}
