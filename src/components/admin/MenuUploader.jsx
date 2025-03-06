import React, { useState } from 'react';
import { useMenu } from '@/context/contexts/MenuContext';
import { useAuth } from '@/context/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MenuVersionManager } from './MenuVersionManager';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  transformMenuData, 
  validateMenuStructure,
  validateTransformedMenu 
} from '@/utils/menuTransformer';
import { updateMenuAndEmbeddings } from '@/utils/menuUpdater';

export function MenuUploader({ onClose }) {
  const { saveNewVersion } = useMenu();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState({ 
    message: '', 
    isError: false,
    isProcessing: false,
    details: null,
    showPreview: false
  });
  const [preview, setPreview] = useState(null);
  const [transformedPreview, setTransformedPreview] = useState(null);

  if (!session) {
    navigate('/login');
    return null;
  }

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
      setStatus({ 
        message: 'Reading file...', 
        isError: false,
        isProcessing: true 
      });
      
      try {
        const content = await file.text();
        const jsonContent = JSON.parse(content);
        
        // Initial validation
        setStatus({ 
          message: 'Validating menu structure...', 
          isError: false,
          isProcessing: true 
        });
        validateMenuStructure(jsonContent);

        // Transform data
        setStatus({ 
          message: 'Transforming menu format...', 
          isError: false,
          isProcessing: true 
        });
        const transformed = transformMenuData(jsonContent);
        
        // Validate transformed data
        validateTransformedMenu(transformed);

        // Show previews
        setPreview(jsonContent);
        setTransformedPreview(transformed);
        setStatus({ 
          message: 'Menu validated successfully', 
          isError: false,
          isProcessing: false,
          showPreview: true
        });
      } catch (error) {
        setStatus({ 
          message: error.message || 'Invalid menu format', 
          isError: true,
          isProcessing: false,
          details: error.details
        });
        setPreview(null);
        setTransformedPreview(null);
      }
    } else {
      setStatus({ 
        message: 'Please select a valid JSON file', 
        isError: true,
        isProcessing: false 
      });
      setPreview(null);
      setTransformedPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!session) {
      navigate('/login');
      return;
    }

    if (!selectedFile || !preview || !transformedPreview) {
      setStatus({ 
        message: 'Please select a file first', 
        isError: true,
        isProcessing: false 
      });
      return;
    }

    try {
      setStatus({ 
        message: 'Saving new menu version...', 
        isError: false,
        isProcessing: true 
      });

      // Save both original and transformed versions
      saveNewVersion({
        original: preview,
        transformed: transformedPreview
      });

      // Update menu files and generate new embeddings
      setStatus({ 
        message: 'Updating menu files and generating embeddings...', 
        isError: false,
        isProcessing: true 
      });

      const result = await updateMenuAndEmbeddings(transformedPreview);

      setStatus({ 
        message: `Menu updated successfully! 
        
The menu has been updated and new embeddings have been generated. The changes include:

1. Menu data has been updated in both:
   - src/data/menu/menu.json
   - public/menu.json

2. New embeddings have been generated in:
   - src/data/embeddings.json
   - public/embeddings.json

3. The new menu version has been saved to localStorage

The changes will be reflected immediately in your browser. To see the changes in production:
1. Commit and push the updated files to your repository
2. Deploy your site

Note: You don't need to manually move any files - everything has been updated automatically.`, 
        isError: false,
        isProcessing: false,
        showPreview: true  // Keep showing the preview
      });
      
      setSelectedFile(null);
      
      // Clear success message after 10 seconds
      setTimeout(() => {
        setStatus({ 
          message: '', 
          isError: false,
          isProcessing: false 
        });
      }, 10000);
    } catch (error) {
      console.error('Upload error:', error);
      setStatus({ 
        message: error.message || 'Failed to save menu data', 
        isError: true,
        isProcessing: false,
        details: error.details
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Upload New Menu</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Menu JSON File
            </label>
            <input
              type="file"
              accept="application/json"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {status.message && (
            <div className={`p-4 rounded-md ${
              status.isError 
                ? 'bg-red-100 text-red-700' 
                : status.isProcessing
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'
            }`}>
              <div className="flex items-center">
                {status.isProcessing && (
                  <div className="mr-2">
                    <LoadingSpinner size="small" />
                  </div>
                )}
                <div>
                  <p className="font-medium whitespace-pre-line">{status.message}</p>
                  {status.details && (
                    <p className="text-sm mt-1">{status.details}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {preview && status.showPreview && (
            <>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Original Menu Data:
                </h3>
                <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-60">
                  <pre className="text-xs">
                    {JSON.stringify(preview, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Transformed Menu Preview:
                </h3>
                <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-60">
                  <pre className="text-xs">
                    {JSON.stringify(transformedPreview, null, 2)}
                  </pre>
                </div>
              </div>
            </>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || !preview || status.isProcessing}
            className={`w-full px-4 py-2 text-white rounded-md flex items-center justify-center ${
              selectedFile && preview && !status.isProcessing
                ? 'bg-orange-600 hover:bg-orange-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {status.isProcessing && <LoadingSpinner size="small" />}
            <span className="ml-2">Upload Menu</span>
          </button>

          <div className="mt-4 text-sm text-gray-600">
            <p className="font-medium mb-2">Instructions:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Upload a complete menu JSON file</li>
              <li>The system will validate and transform the menu data</li>
              <li>Review both original and transformed previews</li>
              <li>Click Upload to save and update embeddings</li>
              <li>Use version manager below to manage menu versions</li>
            </ol>
          </div>
        </div>
      </div>

      <MenuVersionManager />
    </div>
  );
}
