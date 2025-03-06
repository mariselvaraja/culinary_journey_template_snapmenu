import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/contexts/CartContext';
import { CartDrawer } from './CartDrawer';

export function CartSummary() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { state } = useCart();
  const itemCount = state.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <button 
        onClick={() => setIsDrawerOpen(true)}
        className="relative p-2 text-orange-600 hover:text-orange-700 transition-colors"
        aria-label="Open cart"
      >
        <ShoppingCart className="h-6 w-6" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {itemCount}
          </span>
        )}
      </button>

      <CartDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </>
  );
}
