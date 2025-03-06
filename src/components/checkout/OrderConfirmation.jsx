import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Clock, Calendar, Phone, Mail } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { formatPrice } from '@/utils/formatPrice';

export function OrderConfirmation() {
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!location.state?.orderId) {
        setError('Order information not found');
        setLoading(false);
        return;
      }

      try {
        const orderData = await orderService.getOrder(location.state.orderId);
        if (!orderData?.items) {
          throw new Error('Order items not found');
        }
        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Could not load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [location.state]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-neutral-200 rounded w-1/3 mx-auto"></div>
              <div className="h-4 bg-neutral-200 rounded w-1/2 mx-auto"></div>
              <div className="h-32 bg-neutral-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-serif mb-4">Oops!</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link 
              to="/menu"
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Return to Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const pickupTime = new Date(location.state.pickupTime);
  const formattedPickupTime = pickupTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
  const formattedPickupDate = pickupTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-neutral-50 pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-3xl font-serif mb-2">Order Confirmed!</h1>
            <p className="text-gray-600">
              Thank you for your order. We'll have it ready for pickup soon.
            </p>
          </div>

          {/* Order Details */}
          <div className="border-t border-b border-gray-200 py-6 mb-6">
            <h2 className="text-xl font-serif mb-4">Order Details</h2>
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-2" />
                <span>{formattedPickupDate}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 mr-2" />
                <span>{formattedPickupTime}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Mail className="h-5 w-5 mr-2" />
                <span>{order.customer_email}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="h-5 w-5 mr-2" />
                <span>{order.customer_phone}</span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h2 className="text-xl font-serif mb-4">Order Summary</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <span className="font-medium">{item.quantity}x</span>{' '}
                    <span>{item.item_name}</span>
                  </div>
                  <span className="text-gray-600">
                    {formatPrice(item.total_price)}
                  </span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-4 flex justify-between font-medium">
                <span>Total</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="text-center space-y-4">
            <Link
              to="/menu"
              className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Order Something Else
            </Link>
            <div>
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
