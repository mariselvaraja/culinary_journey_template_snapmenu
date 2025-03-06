import React, { memo } from 'react';
import { Minus, Plus, Users } from 'lucide-react';

export const GuestSelector = memo(function GuestSelector({ value, onChange, min = 1, max = 8 }) {
  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-4 p-2 bg-white border border-gray-300 rounded-lg">
        <button
          type="button"
          onClick={handleDecrease}
          disabled={value <= min}
          className={`
            p-2 rounded-lg transition-all duration-200
            ${
              value <= min
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50'
            }
          `}
          aria-label="Decrease number of guests"
        >
          <Minus className="h-5 w-5" />
        </button>

        <div className="flex-1 text-center flex items-center justify-center space-x-2">
          <Users className="h-5 w-5 text-gray-400" />
          <div>
            <span className="text-lg font-medium text-gray-900">{value}</span>
            <span className="ml-1 text-gray-500">
              {value === 1 ? 'Guest' : 'Guests'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleIncrease}
          disabled={value >= max}
          className={`
            p-2 rounded-lg transition-all duration-200
            ${
              value >= max
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50'
            }
          `}
          aria-label="Increase number of guests"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {value >= max && (
        <p className="mt-2 text-sm text-gray-500">
          For parties larger than {max}, please call us directly.
        </p>
      )}
    </div>
  );
});
