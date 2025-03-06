import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useReservation } from '../../context/ReservationContext';
import { LoadingSpinner } from '../LoadingSpinner';
import { format } from 'date-fns';

export function ReservationDetails() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { makeReservation, loading, error, config } = useReservation();
  const [formData, setFormData] = useState({
    customer_name: '',
    email: '',
    phone: '',
    special_requests: '',
    date: searchParams.get('date'),
    time: searchParams.get('time'),
    party_size: searchParams.get('party_size')
  });

  if (!config) {
    return <LoadingSpinner />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const reservation = await makeReservation(formData);
      navigate(`/reserve/confirmation?id=${reservation.id}`);
    } catch (err) {
      console.error('Error making reservation:', err);
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
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <h1 className="text-3xl font-serif mb-2">Reservation Details</h1>
            <p className="text-gray-600 mb-6">Please provide your information to complete the reservation</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">Reservation Summary</h2>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p><span className="text-gray-600">Date:</span> {formatDate(formData.date)}</p>
                <p><span className="text-gray-600">Time:</span> {formatTime(formData.time)}</p>
                <p><span className="text-gray-600">Party Size:</span> {formData.party_size} {formData.party_size === '1' ? 'Guest' : 'Guests'}</p>
              </div>
            </div>

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
                  {loading ? 'Processing...' : 'Complete Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
