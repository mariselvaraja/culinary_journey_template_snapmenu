import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useReservation } from '@/context/contexts/ReservationContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Calendar, Clock, Users, Mail, Phone, MessageSquare, X } from 'lucide-react';
import { format } from 'date-fns';
import { to12Hour } from '@/utils/timeUtils';

export function ReservationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getReservation, currentReservation, loading, error } = useReservation();

  useEffect(() => {
    if (id) {
      getReservation(id);
    }
  }, [id, getReservation]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center">
          <X className="h-5 w-5 mr-2" />
          {error}
        </div>
      </div>
    );
  }

  if (!currentReservation) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Reservation Not Found
        </h2>
        <p className="text-gray-600 mb-4">
          The reservation you're looking for could not be found.
        </p>
        <button
          onClick={() => navigate('/reservations/lookup')}
          className="text-orange-600 hover:text-orange-700"
        >
          Look Up Another Reservation
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Reservation Details
          </h2>

          <div className="space-y-6">
            {/* Date & Time */}
            <div className="flex items-start space-x-6">
              <div className="flex-1">
                <div className="flex items-center text-gray-700 mb-2">
                  <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="font-medium">Date</span>
                </div>
                <p className="text-gray-900">
                  {format(new Date(currentReservation.date), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
              <div className="flex-1">
                <div className="flex items-center text-gray-700 mb-2">
                  <Clock className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="font-medium">Time</span>
                </div>
                <p className="text-gray-900">
                  {to12Hour(currentReservation.time)}
                </p>
              </div>
            </div>

            {/* Party Size */}
            <div>
              <div className="flex items-center text-gray-700 mb-2">
                <Users className="h-5 w-5 mr-2 text-gray-400" />
                <span className="font-medium">Party Size</span>
              </div>
              <p className="text-gray-900">
                {currentReservation.partySize} {currentReservation.partySize === 1 ? 'Guest' : 'Guests'}
              </p>
            </div>

            {/* Contact Information */}
            <div className="flex items-start space-x-6">
              <div className="flex-1">
                <div className="flex items-center text-gray-700 mb-2">
                  <Mail className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="font-medium">Email</span>
                </div>
                <p className="text-gray-900">{currentReservation.email}</p>
              </div>
              <div className="flex-1">
                <div className="flex items-center text-gray-700 mb-2">
                  <Phone className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="font-medium">Phone</span>
                </div>
                <p className="text-gray-900">{currentReservation.phone}</p>
              </div>
            </div>

            {/* Special Requests */}
            {currentReservation.specialRequests && (
              <div>
                <div className="flex items-center text-gray-700 mb-2">
                  <MessageSquare className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="font-medium">Special Requests</span>
                </div>
                <p className="text-gray-900">{currentReservation.specialRequests}</p>
              </div>
            )}

            {/* Status */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentReservation.status === 'confirmed'
                    ? 'bg-green-100 text-green-800'
                    : currentReservation.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {currentReservation.status.charAt(0).toUpperCase() + currentReservation.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Need to modify or cancel your reservation?</p>
        <p className="mt-1">
          Please contact us at least 24 hours in advance.
        </p>
      </div>
    </div>
  );
}
