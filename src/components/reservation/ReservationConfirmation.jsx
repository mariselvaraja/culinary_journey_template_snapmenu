import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Clock, Users, Check } from 'lucide-react';
import { useReservation } from '../../context/ReservationContext';
import { to12Hour } from '../../utils/timeUtils';
import { LoadingSpinner } from '../LoadingSpinner';

function formatTimeWithFallback(time) {
  try {
    console.log('Attempting to format time:', time);
    const formatted = to12Hour(time);
    console.log('Successfully formatted time:', formatted);
    return formatted;
  } catch (err) {
    console.error('Error formatting time:', err);
    return time; // fallback to original format
  }
}

export function ReservationConfirmation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getReservation } = useReservation();
  const [loading, setLoading] = useState(true);
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const reservationId = searchParams.get('id');
    if (!reservationId) {
      navigate('/reserve');
      return;
    }

    const loadReservation = async () => {
      try {
        setLoading(true);
        const data = await getReservation(reservationId);
        if (!data) {
          throw new Error('Reservation not found');
        }
        console.log('Loaded reservation:', data);
        setReservation(data);
      } catch (err) {
        console.error('Error loading reservation:', err);
        setError(err.message || 'Failed to load reservation');
      } finally {
        setLoading(false);
      }
    };

    loadReservation();
  }, [navigate, searchParams, getReservation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <h1 className="text-2xl font-serif text-red-600 mb-4">Error Loading Reservation</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/reserve')}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Make New Reservation
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return null;
  }

  const formatDate = (dateString) => {
    try {
      console.log('Attempting to format date:', dateString);
      const formatted = new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      console.log('Successfully formatted date:', formatted);
      return formatted;
    } catch (err) {
      console.error('Error formatting date:', err);
      return dateString; // fallback to original format
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-serif mb-2">Reservation Confirmed!</h1>
            <p className="text-gray-600">
              Thank you for your reservation. A confirmation email has been sent to {reservation.email}.
            </p>
          </div>

          {/* Reservation Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 max-w-md mx-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div className="text-left">
                  <div className="text-sm text-gray-500">Date</div>
                  <div className="font-medium">{formatDate(reservation.reservation_date)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div className="text-left">
                  <div className="text-sm text-gray-500">Time</div>
                  <div className="font-medium">{formatTimeWithFallback(reservation.reservation_time)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-gray-400" />
                <div className="text-left">
                  <div className="text-sm text-gray-500">Party Size</div>
                  <div className="font-medium">
                    {reservation.party_size} {reservation.party_size === 1 ? 'Guest' : 'Guests'}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">Confirmation Number</div>
              <div className="font-mono text-lg">{reservation.id.slice(0, 8).toUpperCase()}</div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="text-gray-600 space-y-2 mb-8">
            <p>Please arrive 5-10 minutes before your reservation time.</p>
            <p>Your table will be held for 15 minutes past the reservation time.</p>
            {reservation.special_requests && (
              <div className="mt-4">
                <div className="text-sm text-gray-500">Special Requests</div>
                <p className="mt-1 italic">{reservation.special_requests}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Return Home
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Print Confirmation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
