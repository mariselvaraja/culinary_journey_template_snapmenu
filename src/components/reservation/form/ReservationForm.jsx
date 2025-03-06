import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useReservation } from '@/context/contexts/ReservationContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Calendar, Clock, Users, Mail, Phone, User, MessageSquare } from 'lucide-react';
import { TimeSelector } from '@/components/reservation/common/TimeSelector';
import { GuestSelector } from '@/components/reservation/common/GuestSelector';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { formatPhoneNumber, validatePhoneNumber } from '@/utils/formatPhone';

const RequiredLabel = React.memo(({ children }) => (
  <span className="block text-sm font-medium text-gray-700 mb-1">
    {children} <span className="text-orange-500">*</span>
  </span>
));

export function ReservationForm({ defaultDate, defaultTime, defaultPartySize, onComplete }) {
  const { makeReservation, fetchTimeSlots, loading, error: contextError, config } = useReservation();
  const [formData, setFormData] = useState({
    date: defaultDate,
    time: defaultTime,
    partySize: Number(defaultPartySize),
    name: '',
    email: '',
    phone: '',
    specialRequests: ''
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // Fetch time slots with debounce
  const updateTimeSlots = useCallback(async () => {
    if (!formData.date) return;
    
    const now = Date.now();
    if (now - lastFetchTime < 1000) return; // Debounce 1 second
    
    try {
      const formattedDate = format(formData.date, 'yyyy-MM-dd');
      console.log('Fetching time slots:', formattedDate, formData.partySize);
      await fetchTimeSlots(formattedDate, formData.partySize);
      setLastFetchTime(now);
    } catch (err) {
      console.error('Error fetching time slots:', err);
      setError('Failed to fetch available time slots');
    }
  }, [formData.date, formData.partySize, fetchTimeSlots, lastFetchTime]);

  // Only fetch time slots when date or party size changes
  useEffect(() => {
    updateTimeSlots();
  }, [formData.date, formData.partySize, updateTimeSlots]);

  const isFormValid = useMemo(() => {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const isValidPhone = validatePhoneNumber(formData.phone);
    const isValidPartySize = Number(formData.partySize) > 0;
    const isValidName = formData.name.trim().length > 0;

    return (
      !!formData.date &&
      !!formData.time &&
      isValidName &&
      isValidEmail &&
      isValidPhone &&
      isValidPartySize
    );
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isFormValid) {
      setError('Please fill in all required fields correctly');
      return;
    }

    setSubmitting(true);

    try {
      const reservationData = {
        customer_name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone,
        reservation_date: format(formData.date, 'yyyy-MM-dd'),
        reservation_time: formData.time,
        party_size: Number(formData.partySize),
        special_requests: formData.specialRequests.trim() || ''
      };

      console.log('Submitting reservation with data:', reservationData);

      const result = await makeReservation(reservationData);
      if (!result) throw new Error('Failed to create reservation');

      console.log('Reservation created successfully:', result);
      onComplete(result);
    } catch (err) {
      console.error('Failed to create reservation:', err);
      setError(err.message || 'Failed to create reservation. Please try again.');
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTimeSelect = useCallback((time) => {
    setFormData(prev => ({ ...prev, time }));
  }, []);

  const handlePartySizeChange = useCallback((size) => {
    setFormData(prev => ({
      ...prev,
      partySize: size,
      time: '' // Clear time when party size changes
    }));
  }, []);

  const handlePhoneChange = useCallback((e) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setFormData(prev => ({ ...prev, phone: formattedPhone }));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {(error || contextError) && (
        <div className="text-red-600 text-sm p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="font-medium">Error</p>
          <p>{error || contextError}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Reservation Details
        </h3>
        <div className="grid gap-6">
          <div>
            <RequiredLabel>
              <Calendar className="h-5 w-5 inline-block mr-2 text-gray-400" />
              Select Date
            </RequiredLabel>
            <DatePicker
              selected={formData.date}
              onChange={date => setFormData(prev => ({ ...prev, date, time: '' }))}
              minDate={new Date()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              calendarClassName="reservation-calendar"
              required
            />
          </div>

          <div>
            <RequiredLabel>
              <Users className="h-5 w-5 inline-block mr-2 text-gray-400" />
              Number of Guests
            </RequiredLabel>
            <GuestSelector
              value={formData.partySize}
              onChange={handlePartySizeChange}
              min={config?.minPartySize || 1}
              max={config?.maxPartySize || 8}
            />
          </div>

          <div>
            <RequiredLabel>
              <Clock className="h-5 w-5 inline-block mr-2 text-gray-400" />
              Select Time
            </RequiredLabel>
            <TimeSelector
              selectedTime={formData.time}
              onTimeSelect={handleTimeSelect}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Contact Information
        </h3>
        <div className="grid gap-6">
          <div>
            <RequiredLabel>
              <User className="h-5 w-5 inline-block mr-2 text-gray-400" />
              Full Name
            </RequiredLabel>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <RequiredLabel>
              <Mail className="h-5 w-5 inline-block mr-2 text-gray-400" />
              Email
            </RequiredLabel>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              placeholder="Enter your email address"
            />
          </div>

          <div>
            <RequiredLabel>
              <Phone className="h-5 w-5 inline-block mr-2 text-gray-400" />
              Phone Number
            </RequiredLabel>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={handlePhoneChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              placeholder="XXX-XXX-XXXX"
              pattern="\d{3}-\d{3}-\d{4}"
            />
            <p className="mt-1 text-sm text-gray-500">Format: XXX-XXX-XXXX</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MessageSquare className="h-5 w-5 inline-block mr-2 text-gray-400" />
              Special Requests (Optional)
            </label>
            <textarea
              value={formData.specialRequests}
              onChange={e => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              placeholder="Any dietary restrictions or special occasions?"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || !isFormValid}
        className={`
          w-full px-6 py-3 text-white rounded-lg text-lg font-medium
          ${
            submitting || !isFormValid
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-orange-600 hover:bg-orange-700'
          }
          transition-colors shadow-sm
        `}
      >
        {submitting ? (
          <div className="flex justify-center items-center">
            <LoadingSpinner size="small" />
            <span className="ml-2">Processing...</span>
          </div>
        ) : (
          'Complete Reservation'
        )}
      </button>
    </form>
  );
}
