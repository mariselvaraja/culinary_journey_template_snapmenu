import React, { useState } from 'react';
import { Search, Calendar, Clock, Users } from 'lucide-react';
import { LoadingSpinner } from '../LoadingSpinner';
import { supabase } from '../../lib/supabase';
import { to12Hour } from '../../utils/timeUtils';

export function ReservationLookup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [confirmationNumber, setConfirmationNumber] = useState('');

  const handleLookup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error: lookupError } = await supabase
        .from('reservations')
        .select(`
          *,
          table:tables(number, capacity)
        `)
        .eq('id', confirmationNumber)
        .single();

      if (lookupError) throw lookupError;
      if (!data) throw new Error('Reservation not found');

      setReservation(data);
    } catch (err) {
      setError('Reservation not found. Please check your confirmation number.');
      console.error('Lookup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error: cancelError } = await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', reservation.id);

      if (cancelError) throw cancelError;
      
      setReservation(prev => ({
        ...prev,
        status: 'cancelled'
      }));
    } catch (err) {
      setError('Failed to cancel reservation. Please try again.');
      console.error('Cancel error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-serif mb-6">Find Your Reservation</h1>

          {/* Lookup Form */}
          <form onSubmit={handleLookup} className="mb-8">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={confirmationNumber}
                  onChange={(e) => setConfirmationNumber(e.target.value)}
                  placeholder="Enter confirmation number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {loading ? <LoadingSpinner small /> : <Search className="h-5 w-5" />}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg">
              {error}
            </div>
          )}

          {/* Reservation Details */}
          {reservation && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Date</div>
                      <div className="font-medium">{formatDate(reservation.date)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Time</div>
                      <div className="font-medium">{to12Hour(reservation.time)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Party Size</div>
                      <div className="font-medium">
                        {reservation.party_size} {reservation.party_size === 1 ? 'Guest' : 'Guests'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Status</div>
                      <div className={`font-medium ${
                        reservation.status === 'confirmed' ? 'text-green-600' :
                        reservation.status === 'cancelled' ? 'text-red-600' :
                        reservation.status === 'pending' ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                      </div>
                    </div>
                    {reservation.status !== 'cancelled' && (
                      <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? <LoadingSpinner small /> : 'Cancel Reservation'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {reservation.special_requests && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Special Requests</h3>
                  <p className="text-gray-600">{reservation.special_requests}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
