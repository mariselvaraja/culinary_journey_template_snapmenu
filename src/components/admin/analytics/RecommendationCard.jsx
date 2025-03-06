import React, { useState } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Info, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function RecommendationCard({ title, message, priority, metric, details, viewAllLink }) {
  const [showDetails, setShowDetails] = useState(false);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-500 bg-red-50';
      case 'medium':
        return 'text-orange-500 bg-orange-50';
      case 'low':
        return 'text-green-500 bg-green-50';
      default:
        return 'text-blue-500 bg-blue-50';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return AlertTriangle;
      case 'medium':
        return TrendingUp;
      case 'low':
        return TrendingDown;
      default:
        return Info;
    }
  };

  const formatValue = (value) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  const renderDetails = () => {
    if (Array.isArray(details)) {
      // Handle array of items (e.g., top menu items)
      return details.map((item, index) => (
        <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">{item.name}</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Quantity Sold</span>
              <span className="text-sm font-medium">{item.quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Revenue</span>
              <span className="text-sm font-medium">${item.revenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Average Order Size</span>
              <span className="text-sm font-medium">{item.averageOrderSize.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Average Price</span>
              <span className="text-sm font-medium">${item.averagePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Order Count</span>
              <span className="text-sm font-medium">{item.orderCount}</span>
            </div>
          </div>
        </div>
      ));
    } else if (typeof details === 'object') {
      // Handle object of key-value pairs
      return Object.entries(details).map(([key, value]) => (
        <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-600">{key}</span>
          <span className="text-sm text-gray-900">{formatValue(value)}</span>
        </div>
      ));
    }
    return null;
  };

  const PriorityIcon = getPriorityIcon(priority);
  const priorityColor = getPriorityColor(priority);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-6 transition-all duration-200 hover:shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${priorityColor}`}>
            <PriorityIcon className="h-5 w-5" />
          </div>
          <h3 className="text-sm sm:text-base font-medium text-gray-900">{title}</h3>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${priorityColor}`}>
          {priority}
        </div>
      </div>

      {/* Message */}
      <div className="space-y-4">
        <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
        
        {/* Metric Display */}
        {metric && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">Impact Metric</span>
            <span className="text-sm font-medium text-gray-900">
              {typeof metric === 'number' ? metric.toLocaleString() : metric}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex justify-between items-center">
        {details && (
          <button
            onClick={() => setShowDetails(true)}
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            View Details
            <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            View All Records
            <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{title} Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              {renderDetails()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
