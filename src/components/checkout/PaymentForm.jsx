import React from 'react';
import { CreditCard, Lock } from 'lucide-react';

export function PaymentForm() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-serif">Payment Method</h2>
        <div className="flex items-center text-gray-600">
          <Lock className="h-4 w-4 mr-2" />
          <span className="text-sm">Secure Payment</span>
        </div>
      </div>

      <form className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Card Number
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Expiry Date
            </label>
            <input
              type="text"
              placeholder="MM/YY"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              CVC
            </label>
            <input
              type="text"
              placeholder="123"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Name on Card
          </label>
          <input
            type="text"
            placeholder="John Doe"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </form>
    </div>
  );
}