import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Leaf, AlertTriangle } from 'lucide-react';
import { AddToCart } from '../../cart/AddToCart';
import { useMenu } from '@/context/contexts/MenuContext';

export function ProductDetail() {
  const { categoryId, itemId } = useParams();
  const navigate = useNavigate();
  const { menuData } = useMenu();
  
  const item = menuData.menu[categoryId]?.find(item => item.id === itemId);
  
  if (!item) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Item Not Found</h2>
          <p className="text-gray-600 mb-6">The item you're looking for doesn't exist.</p>
          <Link
            to={`/menu/${categoryId}`}
            className="inline-flex items-center text-orange-600 hover:text-orange-700"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  // Find paired items from the menu
  const pairedItems = item.pairings
    .map(pairingName => {
      for (const [catId, items] of Object.entries(menuData.menu)) {
        const found = items.find(menuItem => 
          menuItem.name.toLowerCase() === pairingName.toLowerCase()
        );
        if (found) return found;
      }
      return null;
    })
    .filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Menu
      </button>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="relative">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-[400px] object-cover rounded-lg shadow-lg"
          />
          {(item.dietary.isVegetarian || item.dietary.isVegan) && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full flex items-center">
              <Leaf className="h-4 w-4 mr-1" />
              {item.dietary.isVegan ? 'Vegan' : 'Vegetarian'}
            </div>
          )}
        </div>

        <div>
          <div className="mb-8">
            <h1 className="text-4xl font-serif mb-2">{item.name}</h1>
            <p className="text-2xl text-orange-600 font-serif mb-4">{item.price}</p>
            <p className="text-gray-600 mb-6">{item.description}</p>
            <AddToCart item={item} />
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-serif mb-2">Nutritional Information</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Calories</p>
                  <p className="text-lg font-semibold">{item.calories}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Protein</p>
                  <p className="text-lg font-semibold">{item.nutrients.protein}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Carbs</p>
                  <p className="text-lg font-semibold">{item.nutrients.carbs}</p>
                </div>
              </div>
            </div>

            {item.allergens.length > 0 && (
              <div>
                <h2 className="text-xl font-serif mb-2 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                  Allergens
                </h2>
                <div className="flex flex-wrap gap-2">
                  {item.allergens.map((allergen) => (
                    <span
                      key={allergen}
                      className="bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-sm"
                    >
                      {allergen}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {pairedItems.length > 0 && (
              <div>
                <h2 className="text-xl font-serif mb-6">Perfect Pairings</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pairedItems.map((pairedItem) => (
                    pairedItem && (
                      <div key={pairedItem.id} className="group relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-amber-500 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
                        <div className="relative flex items-center gap-4 bg-white p-4 rounded-lg border border-orange-100/50">
                          <Link
                            to={`/menu/${pairedItem.category}/${pairedItem.id}`}
                            className="flex items-center gap-4 flex-1"
                          >
                            <div className="w-20 h-20 rounded-lg overflow-hidden">
                              <img
                                src={pairedItem.image}
                                alt={pairedItem.name}
                                className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-serif group-hover:text-orange-600 transition-colors">
                                {pairedItem.name}
                              </h3>
                              <p className="text-sm text-gray-600">{pairedItem.price}</p>
                            </div>
                          </Link>
                          <AddToCart item={pairedItem} variant="compact" />
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
