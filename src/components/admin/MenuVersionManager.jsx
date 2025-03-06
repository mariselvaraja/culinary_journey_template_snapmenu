import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../LoadingSpinner';
import { History, RefreshCw, X, RotateCcw, Check, Clock } from 'lucide-react';
import { useAuth } from '@/context/contexts/AuthContext';
import { useMenu } from '@/context/contexts/MenuContext';
import { useNavigate } from 'react-router-dom';

export function MenuVersionManager() {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { session } = useAuth();
  const { getVersions, revertToVersion } = useMenu();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }
    loadVersions();
  }, [session, navigate]);

  async function loadVersions() {
    if (!session) return;

    setLoading(true);
    try {
      const data = await getVersions();
      setVersions(data);
    } catch (err) {
      setError('Failed to load menu versions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRevert(versionId) {
    if (!session) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      await revertToVersion(versionId);
      setSuccess('Menu reverted successfully');
      setTimeout(() => setSuccess(null), 3000);
      await loadVersions();
    } catch (err) {
      setError('Failed to revert menu version');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (!session) {
    return null;
  }

  if (loading && versions.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-8 bg-orange-500 rounded"></div>
          <h1 className="text-3xl font-serif text-orange-600">Menu Version History</h1>
        </div>
        <button
          onClick={loadVersions}
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

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 p-4 rounded-lg flex items-center">
          <Check className="h-5 w-5 mr-2" />
          {success}
        </div>
      )}

      {/* Version List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center space-x-2 p-6 border-b border-gray-200">
          <div className="w-1 h-8 bg-blue-500 rounded"></div>
          <h2 className="text-xl font-semibold text-blue-900">Version Timeline</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {versions.map((version) => (
            <div key={version.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <History className="h-5 w-5 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">
                      Version {version.version_number}
                    </h3>
                    {version.is_current && (
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(version.created_at).toLocaleString()}
                  </div>
                  <p className="text-gray-600 mt-2">{version.change_description}</p>
                </div>
                {!version.is_current && (
                  <button
                    onClick={() => handleRevert(version.id)}
                    className="flex items-center px-4 py-2 text-orange-600 hover:text-orange-900 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Revert to this version
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {versions.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <History className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Version History</h3>
          <p className="text-gray-500">No menu versions have been saved yet.</p>
        </div>
      )}
    </div>
  );
}
