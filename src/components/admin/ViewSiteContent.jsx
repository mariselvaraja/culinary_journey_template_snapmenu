import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../LoadingSpinner';
import { Layout, RefreshCw, X, Download, Copy, Check } from 'lucide-react';
import { useAuth } from '@/context/contexts/AuthContext';
import { useContent } from '@/context/contexts/ContentContext';
import { useNavigate } from 'react-router-dom';

export function ViewSiteContent() {
  const [copied, setCopied] = useState(false);
  const { session } = useAuth();
  const { content } = useContent();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate('/login');
    }
  }, [session, navigate]);

  function handleDownload() {
    if (!content) return;

    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'site-content.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleCopy() {
    if (!content) return;

    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-8 bg-orange-500 rounded"></div>
          <h1 className="text-3xl font-serif text-orange-600">Site Content</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={!content}
            className={`flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 transition-colors ${
              content
                ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            <Download className="h-5 w-5" />
            Download
          </button>
          <button
            onClick={handleCopy}
            disabled={!content}
            className={`flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 transition-colors ${
              content
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

      {/* Content Sections */}
      {content && Object.entries(content).map(([section, sectionContent]) => (
        <div key={section} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center space-x-2 p-6 border-b border-gray-200">
            <div className="w-1 h-8 bg-purple-500 rounded"></div>
            <h2 className="text-xl font-semibold text-purple-900">
              {section.charAt(0).toUpperCase() + section.slice(1).replace(/_/g, ' ')}
            </h2>
          </div>
          
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                {JSON.stringify(sectionContent, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      ))}

      {/* Empty State */}
      {!content && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <Layout className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Content Data</h3>
          <p className="text-gray-500">Upload a content file to view its contents here.</p>
        </div>
      )}
    </div>
  );
}
