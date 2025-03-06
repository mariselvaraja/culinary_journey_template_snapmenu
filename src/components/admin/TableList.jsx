import React, { useState, useEffect } from 'react';
import { getTables, toggleTableStatus as updateTableStatus } from '../../services/tableService';
import { LoadingSpinner } from '../LoadingSpinner';
import { Square, Users, RefreshCw, Check, X, Coffee } from 'lucide-react';

export function TableList() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTables();
  }, []);

  async function loadTables() {
    setLoading(true);
    try {
      const data = await getTables();
      setTables(data);
    } catch (err) {
      setError('Failed to load tables');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(tableId, isOccupied) {
    setLoading(true);
    try {
      await updateTableStatus(tableId, isOccupied);
      await loadTables();
    } catch (err) {
      setError('Failed to update table status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading && tables.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-8 bg-orange-500 rounded"></div>
          <h1 className="text-3xl font-serif text-orange-600">Table Management</h1>
        </div>
        <button
          onClick={loadTables}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-5 w-5" />
          Refresh
        </button>
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

      {/* Table Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center space-x-2 p-6 border-b border-gray-200">
          <div className="w-1 h-8 bg-blue-500 rounded"></div>
          <h2 className="text-xl font-semibold text-blue-900">Floor Plan</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tables.map((table) => (
              <div
                key={table.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Square className="h-5 w-5 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-900">
                        Table {table.number}
                      </h3>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                        table.is_occupied
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-green-100 text-green-800 border border-green-200'
                      }`}
                    >
                      {table.is_occupied ? 'Occupied' : 'Available'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Users className="h-5 w-5 text-gray-400 mr-2" />
                      <span>Seats {table.capacity}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Coffee className="h-5 w-5 text-gray-400 mr-2" />
                      <span>{table.section}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => handleStatusUpdate(table.id, !table.is_occupied)}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        table.is_occupied
                          ? 'text-green-600 hover:text-green-900 hover:bg-green-50'
                          : 'text-red-600 hover:text-red-900 hover:bg-red-50'
                      }`}
                    >
                      {table.is_occupied ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Mark Available
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-1" />
                          Mark Occupied
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {tables.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <Square className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Tables Found</h3>
            <p className="text-gray-500">No tables have been configured yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
