import React, { useState } from 'react';
import { useMenu } from '@/context/contexts/MenuContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { X } from 'lucide-react';

export function MenuUploadModal({ onClose }) {
  const { uploadMenu } = useMenu();
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/json') {
        setError('Please select a JSON file');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const menuData = JSON.parse(event.target.result);
          await uploadMenu(menuData);
          onClose();
        } catch (err) {
          setError('Invalid JSON file');
          setUploading(false);
        }
      };
      reader.readAsText(file);
    } catch (err) {
      setError('Error uploading menu');
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Upload Menu</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Menu File (JSON)
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className={`
                px-4 py-2 text-sm font-medium text-white rounded-lg
                ${
                  uploading || !file
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-orange-600 hover:bg-orange-700'
                }
              `}
            >
              {uploading ? (
                <div className="flex items-center">
                  <LoadingSpinner size="small" />
                  <span className="ml-2">Uploading...</span>
                </div>
              ) : (
                'Upload'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
