import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReservation } from '@/context/contexts/ReservationContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Calendar, Clock, Users, Check } from 'lucide-react';
import { GuestSelector } from '@/components/reservation/common/GuestSelector';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export function WaitlistForm() {
  const navigate = useNavigate();
  const { joinWaitlist, loading, error } = useReservation();
  const [formData, setFormData] = useState({
    date: new Date(),
    time: '',
    partySize: 2,
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await joinWaitlist(formData);
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to join waitlist:', err);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <Check className="h-16 w-16 text-green-500 mx-auto" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Added to Waitlist!
        </h2>
        <p className="text-gray-600 mb-4">
          We'll notify you if a table becomes available.
        </p>
        <button
          onClick={() => navigate('/')}
          className="text-orange-600 hover:text-orange-700"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="h-5 w-5 inline-block mr-2 text-gray-400" />
          Preferred Date
        </label>
        <DatePicker
          selected={formData.date}
          onChange={date => setFormData(prev => ({ ...prev, date }))}
          minDate={new Date()}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      {/* Time Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Clock className="h-5 w-5 inline-block mr-2 text-gray-400" />
          Preferred Time
        </label>
        <input
          type="time"
          value={formData.time}
          onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      {/* Party Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Users className="h-5 w-5 inline-block mr-2 text-gray-400" />
          Number of Guests
        </label>
        <GuestSelector
          value={formData.partySize}
          onChange={size => setFormData(prev => ({ ...prev, partySize: size }))}
        />
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !formData.time}
        className={`
          w-full px-6 py-3 text-white rounded-lg
          ${loading || !formData.time
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-orange-600 hover:bg-orange-700'}
          transition-colors
        `}
      >
        {loading ? (
          <div className="flex justify-center items-center">
            <LoadingSpinner size="small" />
            <span className="ml-2">Processing...</span>
          </div>
        ) : (
          'Join Waitlist'
        )}
      </button>
    </form>
  );
}
