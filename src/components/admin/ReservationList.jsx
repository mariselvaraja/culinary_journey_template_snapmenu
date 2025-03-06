import React, { useState, useEffect } from 'react';
import { format, parseISO, isToday, isTomorrow, compareAsc } from 'date-fns';
import { getReservations, updateReservationStatus } from '@/services/reservationService';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Check, X, Clock, Calendar, Users, Phone, Mail, MessageSquare, Table } from 'lucide-react';
import { useAuth } from '@/context/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatPhoneNumber } from '@/utils/formatPhone';

export function ReservationList() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    date: 'all',
    partySize: 'all'
  });
  const { session, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }

    // Check if user is admin
    if (!isAdmin) {
      console.log('User is not admin, redirecting...');
      navigate('/');
      return;
    }

    loadReservations();
  }, [session, isAdmin, navigate]);

  async function loadReservations() {
    if (!session || !isAdmin) return;

    try {
      setLoading(true);
      setError(null);
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      const data = await getReservations(
        format(today, 'yyyy-MM-dd'),
        format(thirtyDaysFromNow, 'yyyy-MM-dd')
      );
      console.log('Loaded reservations:', data);
      setReservations(data || []);
    } catch (err) {
      console.error('Error loading reservations:', err);
      setError(err.message || 'Failed to load reservations. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleStatusUpdate = async (id, newStatus) => {
    if (!session || !isAdmin) return;

    try {
      setUpdateLoading(id);
      setError(null);
      await updateReservationStatus(id, newStatus);
      await loadReservations();
    } catch (err) {
      console.error('Error updating reservation status:', err);
      setError(err.message || 'Failed to update reservation status. Please try again.');
    } finally {
      setUpdateLoading(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    if (isToday(parseISO(dateStr))) return 'Today';
    if (isTomorrow(parseISO(dateStr))) return 'Tomorrow';
    return format(parseISO(dateStr), 'EEEE, MMMM d, yyyy');
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'completed':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const filterReservations = (reservations) => {
    return reservations.filter(reservation => {
      if (filters.status !== 'all' && reservation.status !== filters.status) {
        return false;
      }
      if (filters.date === 'today' && !isToday(parseISO(reservation.reservation_date))) {
        return false;
      }
      if (filters.date === 'tomorrow' && !isTomorrow(parseISO(reservation.reservation_date))) {
        return false;
      }
      if (filters.partySize !== 'all' && reservation.party_size !== parseInt(filters.partySize)) {
        return false;
      }
      return true;
    });
  };

  const groupReservationsByDate = (reservations) => {
    const grouped = {};
    filterReservations(reservations).forEach(reservation => {
      const date = reservation.reservation_date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(reservation);
    });
    return grouped;
  };

  const sortDates = (dates) => {
    return dates.sort((a, b) => {
      const dateA = parseISO(a);
      const dateB = parseISO(b);
      
      // If one date is today, it comes first
      if (isToday(dateA)) return -1;
      if (isToday(dateB)) return 1;
      
      // If one date is tomorrow, it comes second
      if (isTomorrow(dateA)) return -1;
      if (isTomorrow(dateB)) return 1;
      
      // Otherwise sort by date ascending
      return compareAsc(dateA, dateB);
    });
  };

  if (!session || !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg m-6">
        <div className="flex items-center">
          <X className="h-5 w-5 mr-2" />
          {error}
        </div>
      </div>
    );
  }

  const groupedReservations = groupReservationsByDate(reservations);
  const dates = sortDates(Object.keys(groupedReservations));

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <select
              value={filters.date}
              onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Party Size
            </label>
            <select
              value={filters.partySize}
              onChange={(e) => setFilters(prev => ({ ...prev, partySize: e.target.value }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Sizes</option>
              {[2, 4, 6, 8, 10].map(size => (
                <option key={size} value={size}>{size} People</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Reservations</h1>
        <button
          onClick={loadReservations}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {dates.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 text-gray-600 p-4 rounded-lg">
          No reservations found.
        </div>
      ) : (
        <div className="space-y-6">
          {dates.map(date => (
            <div key={date} className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                {formatDate(date)}
              </h3>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Time</span>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>Customer & Party Size</span>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center space-x-1">
                            <Table className="h-4 w-4" />
                            <span>Table</span>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-4 w-4" />
                            <Phone className="h-4 w-4" />
                            <span>Contact</span>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>Special Requests</span>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {groupedReservations[date].map((reservation) => (
                        <tr key={reservation.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatTime(reservation.reservation_time)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {reservation.customer_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {Number(reservation.party_size)} {Number(reservation.party_size) === 1 ? 'Guest' : 'Guests'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {reservation.table ? (
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  Table {reservation.table.number}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {reservation.table.section} Section
                                </div>
                                <div className="text-sm text-gray-500">
                                  Capacity: {reservation.table.capacity}
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">
                                No table assigned
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(reservation.status)}`}>
                              {reservation.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{reservation.customer_email}</div>
                            <div className="text-sm text-gray-500">
                              {reservation.customer_phone ? formatPhoneNumber(reservation.customer_phone) : 'No phone'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs">
                              {reservation.special_requests || 'None'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {reservation.status === 'pending' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleStatusUpdate(reservation.id, 'confirmed')}
                                  disabled={updateLoading === reservation.id}
                                  className="text-green-600 hover:text-green-900"
                                  title="Confirm Reservation"
                                >
                                  <Check className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(reservation.id, 'cancelled')}
                                  disabled={updateLoading === reservation.id}
                                  className="text-red-600 hover:text-red-900"
                                  title="Cancel Reservation"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </div>
                            )}
                            {reservation.status === 'confirmed' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleStatusUpdate(reservation.id, 'completed')}
                                  disabled={updateLoading === reservation.id}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Mark as Completed"
                                >
                                  <Check className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(reservation.id, 'cancelled')}
                                  disabled={updateLoading === reservation.id}
                                  className="text-red-600 hover:text-red-900"
                                  title="Cancel Reservation"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </div>
                            )}
                            {updateLoading === reservation.id && (
                              <div className="flex justify-center">
                                <LoadingSpinner className="h-5 w-5" />
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
