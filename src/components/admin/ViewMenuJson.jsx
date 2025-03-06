import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../LoadingSpinner';
import { FileJson, RefreshCw, X, Download, Copy, Check } from 'lucide-react';
import { useAuth } from '@/context/contexts/AuthContext';
import { useMenu } from '@/context/contexts/MenuContext';
import { useNavigate } from 'react-router-dom';

export function ViewMenuJson() {
  const [copied, setCopied] = useState(false);
  const { session } = useAuth();
  const { menuData, searchState } = useMenu();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate('/login');
    }
  }, [session, navigate]);

  function handleDownload() {
    if (!menuData) return;

    const blob = new Blob([JSON.stringify(menuData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'menu.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleCopy() {
    if (!menuData) return;

    navigator.clipboard.writeText(JSON.stringify(menuData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!session) {
    return null;
  }

  if (searchState === 'LOADING') {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-8 bg-orange-500 rounded"></div>
          <h1 className="text-3xl font-serif text-orange-600">Menu JSON</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={!menuData}
            className={`flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 transition-colors ${
              menuData
                ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            <Download className="h-5 w-5" />
            Download
          </button>
          <button
            onClick={handleCopy}
            disabled={!menuData}
            className={`flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 transition-colors ${
              menuData
                ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            {copied ? (
              <>
                <Check className="h-5 w-5 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-5 w-5" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* JSON Viewer */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center space-x-2 p-6 border-b border-gray-200">
          <div className="w-1 h-8 bg-blue-500 rounded"></div>
          <h2 className="text-xl font-semibold text-blue-900">Menu Structure</h2>
        </div>
        
        <div className="p-6">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
              {menuData ? JSON.stringify(menuData, null, 2) : 'No menu data available'}
            </pre>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!menuData && searchState !== 'LOADING' && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <FileJson className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Menu Data</h3>
          <p className="text-gray-500">Upload a menu file to view its contents here.</p>
        </div>
      )}
    </div>
  );
}
