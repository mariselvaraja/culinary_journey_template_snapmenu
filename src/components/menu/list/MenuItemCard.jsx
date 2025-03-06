import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { AddToCart } from '../../cart/AddToCart';

export function MenuItemCard({ item, categoryId }) {
  return (
    <Link
      to={`/menu/${categoryId}/${item.id}`}
      className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
        />
        {(item.dietary?.isVegetarian || item.dietary?.isVegan) && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full flex items-center text-sm backdrop-blur-sm">
            <Leaf className="h-4 w-4 mr-1" />
            {item.dietary.isVegan ? 'Vegan' : 'Vegetarian'}
          </div>
        )}
        <AddToCart item={item} variant="compact" />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-serif group-hover:text-orange-600 transition-colors">
            {item.name}
          </h3>
          <span className="text-lg font-serif text-orange-600">
            ${item.price}
          </span>
        </div>
        <p className="text-gray-600 text-sm line-clamp-2">
          {item.description}
        </p>
        {/* Dietary tags */}
        <div className="mt-2 flex flex-wrap gap-2">
          {item.dietary?.isGlutenFree && (
            <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded">
              Gluten Free
            </span>
          )}
          {item.allergens?.length > 0 && (
            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded">
              Contains: {item.allergens.join(', ')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
