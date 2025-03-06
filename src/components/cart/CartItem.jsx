import React from 'react';
import PropTypes from 'prop-types';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/context/contexts/CartContext';
import { formatPrice } from '@/utils/formatPrice';
import { CartItemPropType } from '@/propTypes/menuTypes';

export function CartItem({ item }) {
  const { dispatch } = useCart();
  const itemTotal = parseFloat(item.price.replace('$', '')) * item.quantity;

  const handleUpdateQuantity = (newQuantity) => {
    if (newQuantity === 0) {
      dispatch({ type: 'REMOVE_ITEM', payload: { id: item.id } });
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: newQuantity } });
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-orange-50/50 transition-colors">
      <img
        src={item.image}
        alt={item.name}
        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-serif text-lg truncate pr-4">{item.name}</h3>
          <p className="text-orange-600 font-medium text-lg whitespace-nowrap">
            {formatPrice(itemTotal)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-orange-200 rounded-full">
            <button
              onClick={() => handleUpdateQuantity(item.quantity - 1)}
              className="p-1.5 hover:bg-orange-50 rounded-full transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-medium">{item.quantity}</span>
            <button
              onClick={() => handleUpdateQuantity(item.quantity + 1)}
              className="p-1.5 hover:bg-orange-50 rounded-full transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: { id: item.id } })}
            className="ml-auto p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

CartItem.propTypes = {
  item: CartItemPropType.isRequired
};
