import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReservation } from '@/context';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { format } from 'date-fns';

export function ReservationForm({ date, time, partySize, onClose }) {
  const navigate = useNavigate();
  const { makeReservation, loading, error, config, clearError } = useReservation();
  const [formData, setFormData] = useState({
    customer_name: '',
    email: '',
    phone: '',
    special_requests: '',
    date,
    time,
    party_size: partySize
  });

  if (!config) {
    return (
      <div className="p-6">
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    try {
      const reservation = await makeReservation(formData);
      if (reservation?.id) {
        navigate(`/reserve/confirmation?id=${reservation.id}`);
      }
    } catch (err) {
      console.error('Error making reservation:', err);
      // Error is already set in context
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateStr) => {
    return format(new Date(dateStr), 'EEEE, MMMM d, yyyy');
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-serif mb-2">Complete Your Reservation</h2>
          <div className="text-gray-600">
            <p>{formatDate(date)}</p>
            <p>{formatTime(time)} • {partySize} {partySize === 1 ? 'Guest' : 'Guests'}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="customer_name"
            required
            value={formData.customer_name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email {config.requireEmail && <span className="text-red-500">*</span>}
          </label>
          <input
            type="email"
            name="email"
            required={config.requireEmail}
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number {config.requirePhone && <span className="text-red-500">*</span>}
          </label>
          <input
            type="tel"
            name="phone"
            required={config.requirePhone}
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Requests
            <span className="text-gray-500 text-xs ml-2">
              (Max {config.maxSpecialRequestLength} characters)
            </span>
          </label>
          <textarea
            name="special_requests"
            value={formData.special_requests}
            onChange={handleChange}
            maxLength={config.maxSpecialRequestLength}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div className="text-sm text-gray-500 space-y-2">
          <p>• Reservations are held for {config.reservationHoldTime} minutes past the scheduled time</p>
          <p>• For parties larger than {config.maxPartySize}, please call us directly</p>
          <p>• For same-day reservations, please call us at (555) 123-4567</p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 rounded-lg text-white font-medium transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner className="h-5 w-5" />
                <span>Processing...</span>
              </div>
            ) : (
              'Complete Reservation'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
