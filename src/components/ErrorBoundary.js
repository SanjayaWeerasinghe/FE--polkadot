import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You could also log the error to an error reporting service here
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-500 via-purple-600 to-red-700 flex items-center justify-center p-5">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-white/20">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">💥</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                The application encountered an unexpected error. Don't worry, your data is safe.
              </p>
            </div>

            {/* Error Details (for development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <h3 className="font-semibold text-red-800 mb-2">Error Details:</h3>
                <pre className="text-xs text-red-700 overflow-auto max-h-40 whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                🔄 Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="px-6 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
              >
                🔃 Reload Page
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h4 className="font-semibold text-blue-800 mb-2">What can you do?</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Try refreshing the page</li>
                <li>• Check your internet connection</li>
                <li>• Make sure your Substrate node is running</li>
                <li>• Ensure your Polkadot.js extension is up to date</li>
                <li>• Contact support if the problem persists</li>
              </ul>
            </div>

            {/* Additional Info */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>
                Error ID: {Date.now().toString(36)}
                <br />
                Time: {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;