import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReservation } from '@/context/contexts/ReservationContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Search, X } from 'lucide-react';

export function ReservationLookup() {
  const navigate = useNavigate();
  const { lookupReservation, loading, error } = useReservation();
  const [email, setEmail] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const reservation = await lookupReservation(email, confirmationCode);
      if (reservation) {
        navigate(`/reservations/${reservation.id}`);
      }
    } catch (err) {
      console.error('Failed to lookup reservation:', err);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Find Your Reservation
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmation Code
              </label>
              <input
                type="text"
                required
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter your confirmation code"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <X className="h-5 w-5 mr-2" />
                  {error}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !confirmationCode}
              className={`
                w-full px-6 py-3 text-white rounded-lg flex items-center justify-center
                ${
                  loading || !email || !confirmationCode
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-orange-600 hover:bg-orange-700'
                }
                transition-colors
              `}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" />
                  <span className="ml-2">Searching...</span>
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Find Reservation
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          Can't find your confirmation code? Check your email inbox and spam folder.
        </p>
        <p className="mt-1">
          If you still need help, please contact our support team.
        </p>
      </div>
    </div>
  );
}
