import React, { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error info:', errorInfo);
    this.setState({ errorInfo });

    // Log additional context if available
    if (error.response) {
      console.error('Error response:', error.response);
    }
    if (error.request) {
      console.error('Error request:', error.request);
    }
    if (error.config) {
      console.error('Error config:', error.config);
    }
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-sm p-6 max-w-lg w-full">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-600 mb-4">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <div className="mt-4 p-4 bg-gray-50 rounded text-left overflow-auto">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
