import React, { useState } from 'react';
import { useMenu } from '@/context/contexts/MenuContext';
import { MenuUploadModal } from './MenuUploadModal';
import { MenuVersionManager } from './MenuVersionManager';
import { ViewMenuJson } from './ViewMenuJson';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Upload, Eye, History } from 'lucide-react';

export function MenuManager() {
  const { loading } = useMenu();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showVersionManager, setShowVersionManager] = useState(false);
  const [showViewJson, setShowViewJson] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Upload Menu */}
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-orange-500 transition-colors group"
        >
          <div className="p-3 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
            <Upload className="h-6 w-6 text-orange-600" />
          </div>
          <div className="ml-4 text-left">
            <h3 className="text-lg font-medium text-gray-900">Upload Menu</h3>
            <p className="text-sm text-gray-500">Upload a new menu JSON file</p>
          </div>
        </button>

        {/* View Current Menu */}
        <button
          onClick={() => setShowViewJson(true)}
          className="flex items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-orange-500 transition-colors group"
        >
          <div className="p-3 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
            <Eye className="h-6 w-6 text-orange-600" />
          </div>
          <div className="ml-4 text-left">
            <h3 className="text-lg font-medium text-gray-900">View Menu</h3>
            <p className="text-sm text-gray-500">View current menu JSON</p>
          </div>
        </button>

        {/* Version History */}
        <button
          onClick={() => setShowVersionManager(true)}
          className="flex items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-orange-500 transition-colors group"
        >
          <div className="p-3 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
            <History className="h-6 w-6 text-orange-600" />
          </div>
          <div className="ml-4 text-left">
            <h3 className="text-lg font-medium text-gray-900">Version History</h3>
            <p className="text-sm text-gray-500">View and restore previous versions</p>
          </div>
        </button>
      </div>

      {/* Modals */}
      {showUploadModal && (
        <MenuUploadModal onClose={() => setShowUploadModal(false)} />
      )}

      {showVersionManager && (
        <MenuVersionManager onClose={() => setShowVersionManager(false)} />
      )}

      {showViewJson && (
        <ViewMenuJson onClose={() => setShowViewJson(false)} />
      )}
    </div>
  );
}
