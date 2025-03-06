import React from 'react';
import { X } from 'lucide-react';
import { useCart } from '@/context/contexts/CartContext';
import { formatPrice } from '@/utils/formatPrice';
import { CartItem } from './CartItem';
import { CartFooter } from './CartFooter';
import { EmptyCart } from './EmptyCart';

export function CartDrawer({ isOpen, onClose }) {
  const { state } = useCart();

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside 
        className={`
          fixed top-0 right-0 h-screen w-full sm:w-[400px] bg-white shadow-xl z-[70]
          transform transition-transform duration-300 ease-in-out border-l-2 border-orange-200
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <header className="px-6 py-4 border-b border-orange-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif">Your Order</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-orange-50 rounded-full transition-colors"
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="flex flex-col h-[calc(100vh-8rem)] overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {state.items.length === 0 ? (
              <EmptyCart />
            ) : (
              <div className="divide-y divide-orange-100">
                {state.items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          {state.items.length > 0 && (
            <CartFooter total={state.total} onClose={onClose} />
          )}
        </div>
      </aside>
    </>
  );
}
