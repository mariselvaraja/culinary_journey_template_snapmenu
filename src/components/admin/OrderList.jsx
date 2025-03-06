import React, { useState, useEffect } from 'react';
import { orderService } from '@/services/orderService';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Package, RefreshCw, X, Clock, Calendar, Phone, Mail, Check, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { formatPrice } from '@/utils/formatPrice';
import { useAuth } from '@/context/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { session } = useAuth();
  const navigate = useNavigate();
  
  // Pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    searchTerm: ''
  });

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, [currentPage, filters, session, navigate]);

  async function loadOrders() {
    if (!session) return;

    setLoading(true);
    try {
      const { orders: data, total, totalPages: pages } = await orderService.getOrders({
        page: currentPage,
        limit: 20,
        ...filters
      });
      setOrders(data);
      setTotalOrders(total);
      setTotalPages(pages);
    } catch (err) {
      setError('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(orderId, status) {
    if (!session) return;

    setLoading(true);
    try {
      await orderService.updateOrderStatus(orderId, status);
      setSuccess(`Order ${status} successfully`);
      setTimeout(() => setSuccess(null), 3000);
      await loadOrders();
    } catch (err) {
      setError('Failed to update order status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  if (!session) {
    return null;
  }

  if (loading && orders.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-8 bg-orange-500 rounded"></div>
          <h1 className="text-3xl font-serif text-orange-600">Orders</h1>
        </div>
        <button
          onClick={loadOrders}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-5 w-5" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                placeholder="Search orders..."
                className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <X className="h-5 w-5 mr-2" />
            {error}
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-800 hover:text-red-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 p-4 rounded-lg flex items-center">
          <Check className="h-5 w-5 mr-2" />
          {success}
        </div>
      )}

      {/* Order List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-8 bg-blue-500 rounded"></div>
            <h2 className="text-xl font-semibold text-blue-900">Orders</h2>
          </div>
          <div className="text-sm text-gray-500">
            Showing {orders.length} of {totalOrders} orders
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {orders.map((order) => (
            <div key={order.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="space-y-4 flex-grow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Package className="h-5 w-5 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-900">
                        Order #{order.id.slice(0, 8)}
                      </h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        order.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                        'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-lg font-medium text-gray-900">
                      {formatPrice(order.total_amount)}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-5 w-5 mr-2" />
                        <span>
                          {new Date(order.pickup_time).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-5 w-5 mr-2" />
                        <span>
                          {new Date(order.pickup_time).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-5 w-5 mr-2" />
                        <span>{order.customer_email}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-5 w-5 mr-2" />
                        <span>{order.customer_phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Order Items:</h4>
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-gray-600">
                          <span>
                            {item.quantity}x {item.item_name}
                          </span>
                          <span>{formatPrice(item.total_price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="ml-6 flex flex-col space-y-2">
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                        className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Check className="h-5 w-5 mr-2" />
                        Confirm
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                        className="flex items-center px-4 py-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="h-5 w-5 mr-2" />
                        Cancel
                      </button>
                    </>
                  )}
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'completed')}
                      className="flex items-center px-4 py-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Check className="h-5 w-5 mr-2" />
                      Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{Math.min((currentPage - 1) * 20 + 1, totalOrders)}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * 20, totalOrders)}</span> of{' '}
                <span className="font-medium">{totalOrders}</span> orders
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {/* Page numbers */}
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      currentPage === i + 1
                        ? 'z-10 bg-orange-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {orders.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <Package className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Orders</h3>
          <p className="text-gray-500">No orders found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
