import React, { useState } from 'react';
import { useCart } from '@/context/contexts/CartContext';
import { formatPrice } from '../../utils/formatPrice';

export function OrderSummary({ orderType, onPlaceOrder }) {
  const { state } = useCart();
  const [loading, setLoading] = useState(false);
  const subtotal = state.total;
  const tax = subtotal * 0.08; // 8% tax
  const deliveryFee = orderType === 'delivery' ? 5.00 : 0;
  const total = subtotal + tax + deliveryFee;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
      <h2 className="text-xl font-serif mb-6">Order Summary</h2>
      
      <div className="space-y-4 mb-6">
        {state.items.map((item) => (
          <div key={item.id} className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
              </div>
            </div>
            <p className="font-medium">
              {formatPrice(parseFloat(item.price.replace('$', '')) * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tax (8%)</span>
          <span>{formatPrice(tax)}</span>
        </div>
        {orderType === 'delivery' && (
          <div className="flex justify-between text-gray-600">
            <span>Delivery Fee</span>
            <span>{formatPrice(deliveryFee)}</span>
          </div>
        )}
        <div className="flex justify-between font-medium text-lg pt-3 border-t">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <button 
        onClick={onPlaceOrder}
        disabled={loading}
        className={`w-full py-3 rounded-lg mt-6 font-medium
          ${loading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-orange-600 hover:bg-orange-700 text-white transition-colors'
          }`}
      >
        {loading ? 'Processing...' : 'Place Order'}
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        By placing your order, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}
