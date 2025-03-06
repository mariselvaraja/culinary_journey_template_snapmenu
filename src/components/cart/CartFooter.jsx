import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '@/utils/formatPrice';

export function CartFooter({ total, onClose }) {
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout', { state: { fromCart: true } });
  };

  return (
    <div className="border-t border-orange-200 bg-white px-6 py-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-lg font-serif">Total</span>
        <span className="text-xl font-serif text-orange-600">
          {formatPrice(total)}
        </span>
      </div>
      <button 
        onClick={handleCheckout}
        className="w-full bg-orange-600 text-white py-3 rounded-full hover:bg-orange-700 transition-colors font-medium text-center"
      >
        Proceed to Checkout
      </button>
    </div>
  );
}
