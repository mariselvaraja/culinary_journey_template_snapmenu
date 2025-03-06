import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Check, Calendar, Clock, Users, Phone, Mail, MessageSquare, Table } from 'lucide-react';
import { to12Hour } from '@/utils/timeUtils';

export function ReservationConfirmation({ reservation }) {
  console.log('Rendering confirmation for reservation:', reservation);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Success Message */}
      <div className="text-center mb-8">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Reservation Confirmed!
        </h2>
        <p className="text-gray-600">
          Thank you for your reservation. We've sent a confirmation email to {reservation.email}.
        </p>
      </div>

      {/* Reservation Details Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Reservation Details
        </h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
            <div>
              <p className="font-medium text-gray-900">
                {format(new Date(reservation.reservation_date), 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-sm text-gray-500">Date</p>
            </div>
          </div>

          <div className="flex items-start">
            <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
            <div>
              <p className="font-medium text-gray-900">
                {to12Hour(reservation.reservation_time)}
              </p>
              <p className="text-sm text-gray-500">Time</p>
            </div>
          </div>

          <div className="flex items-start">
            <Users className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
            <div>
              <p className="font-medium text-gray-900">
                {reservation.party_size} {reservation.party_size === 1 ? 'Guest' : 'Guests'}
              </p>
              <p className="text-sm text-gray-500">Party Size</p>
            </div>
          </div>

          {reservation.table && (
            <div className="flex items-start">
              <Table className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="font-medium text-gray-900">
                  Table {reservation.table.number}
                </p>
                <p className="text-sm text-gray-500">
                  {reservation.table.section} Section
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start">
            <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
            <div>
              <p className="font-medium text-gray-900">{reservation.email}</p>
              <p className="text-sm text-gray-500">Email</p>
            </div>
          </div>

          <div className="flex items-start">
            <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
            <div>
              <p className="font-medium text-gray-900">{reservation.phone}</p>
              <p className="text-sm text-gray-500">Phone</p>
            </div>
          </div>

          {reservation.special_requests && (
            <div className="flex items-start">
              <MessageSquare className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="font-medium text-gray-900">{reservation.special_requests}</p>
                <p className="text-sm text-gray-500">Special Requests</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Restaurant Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Restaurant Information
        </h3>
        <div className="space-y-2">
          <p className="text-gray-600">123 Culinary Avenue</p>
          <p className="text-gray-600">Gastronomy District</p>
          <p className="text-gray-600">New York, NY 10001</p>
          <p className="text-gray-600 mt-4">(212) 555-0123</p>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-4">
          Important Notes
        </h3>
        <div className="space-y-2 text-yellow-700">
          <p>• Please arrive 5-10 minutes before your reservation time.</p>
          <p>• We hold reservations for up to 15 minutes past the scheduled time.</p>
          <p>• For any changes or cancellations, please call us at least 2 hours in advance.</p>
          {reservation.table?.section === 'Window' && (
            <p>• Your table is in our window section with a view of the city.</p>
          )}
          {reservation.table?.section === 'Private' && (
            <p>• Your table is in our private dining section for a more intimate experience.</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/"
          className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          Return to Home
        </Link>
        <Link
          to="/menu"
          className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          View Menu
        </Link>
      </div>
    </div>
  );
}
