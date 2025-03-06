import React from 'react';
import { X } from 'lucide-react';

export function MetricDetailsModal({ isOpen, onClose, title, data }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 w-full max-w-lg">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="flex items-start justify-between">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="mt-6 space-y-4">
              {data && Object.entries(data).map(([key, value]) => (
                <div 
                  key={key}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100"
                >
                  <span className="text-sm text-gray-500 mb-1 sm:mb-0">{key}</span>
                  <span className="text-sm font-medium text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
