import React from 'react';
import { UtensilsCrossed, Bike } from 'lucide-react';

export function OrderTypeSelector({ selectedType, onSelect }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-xl font-serif mb-6">How would you like to receive your order?</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onSelect('delivery')}
          className={`p-6 rounded-lg border-2 transition-all ${
            selectedType === 'delivery'
              ? 'border-orange-600 bg-orange-50'
              : 'border-gray-200 hover:border-orange-200'
          }`}
        >
          <div className="flex flex-col items-center">
            <Bike className={`h-8 w-8 mb-3 ${
              selectedType === 'delivery' ? 'text-orange-600' : 'text-gray-400'
            }`} />
            <span className={`font-medium ${
              selectedType === 'delivery' ? 'text-orange-600' : 'text-gray-600'
            }`}>
              Delivery
            </span>
            <span className="text-sm text-gray-500 mt-2">
              Delivered to your address
            </span>
          </div>
        </button>

        <button
          onClick={() => onSelect('takeout')}
          className={`p-6 rounded-lg border-2 transition-all ${
            selectedType === 'takeout'
              ? 'border-orange-600 bg-orange-50'
              : 'border-gray-200 hover:border-orange-200'
          }`}
        >
          <div className="flex flex-col items-center">
            <UtensilsCrossed className={`h-8 w-8 mb-3 ${
              selectedType === 'takeout' ? 'text-orange-600' : 'text-gray-400'
            }`} />
            <span className={`font-medium ${
              selectedType === 'takeout' ? 'text-orange-600' : 'text-gray-600'
            }`}>
              Takeout
            </span>
            <span className="text-sm text-gray-500 mt-2">
              Pick up at restaurant
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}