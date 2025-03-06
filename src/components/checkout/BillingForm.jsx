import React, { useState } from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import { AddressFields } from './forms/AddressFields';

export function BillingForm() {
  const [sameAsDelivery, setSameAsDelivery] = useState(true);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-serif mb-6">Delivery & Billing Information</h2>

      <form className="space-y-6">
        {/* Delivery Address */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Delivery Address</h3>
          <AddressFields type="delivery" />
        </div>

        {/* Billing Address Toggle */}
        <div className="border-t border-gray-200 pt-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={sameAsDelivery}
              onChange={(e) => setSameAsDelivery(e.target.checked)}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="ml-2 text-sm text-gray-600">
              Billing address is same as delivery address
            </span>
          </label>
        </div>

        {/* Billing Address */}
        {!sameAsDelivery && (
          <div className="space-y-6 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900">Billing Address</h3>
            <AddressFields type="billing" />
          </div>
        )}

        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
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
}