import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Phone, Mail, Clock } from 'lucide-react';
import { useCart } from '@/context/contexts/CartContext';
import { orderService } from '../../services/orderService';
import { useNavigate } from 'react-router-dom';

export const TakeoutForm = forwardRef(({ onSubmitStart, onSubmitComplete, onError }, ref) => {
  const navigate = useNavigate();
  const { state: cartState, dispatch: cartDispatch } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    pickupTime: '',
    saveInfo: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'phone') {
      // Format phone number as (XXX) XXX-XXXX
      const cleaned = value.replace(/\D/g, '');
      let formatted = cleaned;
      if (cleaned.length >= 3) {
        formatted = `(${cleaned.slice(0, 3)})${cleaned.length > 3 ? ' ' : ''}${cleaned.slice(3, 6)}${cleaned.length > 6 ? '-' : ''}${cleaned.slice(6, 10)}`;
      }
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.pickupTime) errors.pickupTime = 'Pickup time is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone validation (simple format)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }

    return errors;
  };

  useImperativeHandle(ref, () => ({
    submitForm: async () => {
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        onError('Please fill in all required fields correctly');
        return;
      }

      onSubmitStart();
      try {
        const orderData = {
          customerName: `${formData.firstName} ${formData.lastName}`,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          orderType: 'takeout',
          pickupTime: formData.pickupTime === 'asap' 
            ? new Date(Date.now() + 30 * 60000) // 30 minutes from now
            : new Date(Date.now() + parseInt(formData.pickupTime) * 60000),
          totalAmount: cartState.total,
          items: cartState.items.map(item => ({
            id: item.id,
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            price: parseFloat(item.price.replace('$', '')),
            customizations: item.customizations
          }))
        };

        const result = await orderService.createOrder(orderData);
        
        // Clear cart
        cartDispatch({ type: 'CLEAR_CART' });
        
        // Save user info if requested
        if (formData.saveInfo) {
          localStorage.setItem('userInfo', JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone
          }));
        }

        // Navigate to confirmation page
        navigate('/checkout/confirmation', { 
          state: { 
            orderId: result.order.id,
            pickupTime: orderData.pickupTime
          }
        });
      } catch (err) {
        console.error('Error creating order:', err);
        onError('There was an error processing your order. Please try again.');
      } finally {
        onSubmitComplete();
      }
    }
  }));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-serif mb-6">Pickup Information</h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Phone <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="(XXX) XXX-XXXX"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
            <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Preferred Pickup Time <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              name="pickupTime"
              value={formData.pickupTime}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none"
              required
            >
              <option value="">Select time</option>
              <option value="asap">As soon as possible</option>
              <option value="15">In 15 minutes</option>
              <option value="30">In 30 minutes</option>
              <option value="45">In 45 minutes</option>
              <option value="60">In 1 hour</option>
            </select>
            <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="saveInfo"
              checked={formData.saveInfo}
              onChange={handleInputChange}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="ml-2 text-sm text-gray-600">
              Save this information for next time
            </span>
          </label>
        </div>
      </form>
    </div>
  );
});
