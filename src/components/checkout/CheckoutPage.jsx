import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/context/contexts/CartContext';
import { OrderSummary } from './OrderSummary';
import { PaymentForm } from './PaymentForm';
import { BillingForm } from './BillingForm';
import { TakeoutForm } from './TakeoutForm';
import { OrderTypeSelector } from './OrderTypeSelector';

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useCart();
  const [orderType, setOrderType] = useState('takeout');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const takeoutFormRef = useRef();

  useEffect(() => {
    // Scroll to checkout title when coming from cart
    if (location.state?.fromCart) {
      const element = document.getElementById('checkout-title');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location]);

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-serif mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add some items to your cart to proceed with checkout</p>
            <button 
              onClick={() => navigate('/menu')}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Return to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 id="checkout-title" className="text-4xl font-serif mb-4">Checkout</h1>
          <p className="text-gray-600">Complete your order</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div id="order-type-selector">
              <OrderTypeSelector 
                selectedType={orderType}
                onSelect={setOrderType}
              />
            </div>
            {orderType === 'delivery' ? (
              <BillingForm />
            ) : (
              <TakeoutForm 
                ref={takeoutFormRef}
                onSubmitStart={() => setLoading(true)}
                onSubmitComplete={() => setLoading(false)}
                onError={(err) => setError(err)}
              />
            )}
          </div>
          <div className="lg:col-span-1">
            <OrderSummary 
              orderType={orderType}
              loading={loading}
              onPlaceOrder={() => {
                if (orderType === 'takeout' && takeoutFormRef.current) {
                  takeoutFormRef.current.submitForm();
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
