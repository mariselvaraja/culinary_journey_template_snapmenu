import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCart } from '@/context/contexts/CartContext';
import { MenuItemPropType } from '../../propTypes/menuTypes';

export function AddToCart({ item, variant = 'full', onAdd = () => {} }) {
  const [quantity, setQuantity] = useState(1);
  const { dispatch } = useCart();

  const handleAddToCart = (e) => {
    e?.preventDefault();
    dispatch({ type: 'ADD_ITEM', payload: { item, quantity } });
    setQuantity(1);
    onAdd();
  };

  if (variant === 'compact') {
    return (
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleAddToCart}
          className="bg-orange-600 text-white p-3 rounded-full hover:bg-orange-700 transition-colors shadow-lg"
          aria-label="Add to cart"
        >
          <ShoppingCart className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-3 bg-orange-50 p-1.5 rounded-full">
      <div className="flex items-center">
        <button
          onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
          className="p-2 hover:bg-orange-100 rounded-full transition-colors"
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-12 text-center font-medium">{quantity}</span>
        <button
          onClick={() => setQuantity(prev => prev + 1)}
          className="p-2 hover:bg-orange-100 rounded-full transition-colors"
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <button
        onClick={handleAddToCart}
        className="flex items-center gap-2 bg-orange-600 text-white px-6 py-2.5 rounded-full hover:bg-orange-700 transition-colors"
      >
        <ShoppingCart className="h-5 w-5" />
        <span className="font-medium">Add to Order</span>
      </button>
    </div>
  );
}

AddToCart.propTypes = {
  item: MenuItemPropType.isRequired,
  variant: PropTypes.oneOf(['compact', 'full']),
  onAdd: PropTypes.func
};
