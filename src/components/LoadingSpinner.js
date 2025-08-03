import React from 'react';

const LoadingSpinner = ({ 
  message = 'Loading...', 
  size = 'medium',
  className = '',
  showMessage = true 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-6 h-6 border-2';
      case 'large':
        return 'w-16 h-16 border-4';
      case 'medium':
      default:
        return 'w-10 h-10 border-3';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-xl';
      case 'medium':
      default:
        return 'text-base';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      {/* Spinner */}
      <div className="relative">
        {/* Outer ring */}
        <div 
          className={`
            ${getSizeClasses()} 
            border-white/30 border-t-white 
            rounded-full animate-spin
          `}
        />
        
        {/* Inner pulse dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        </div>
      </div>

      {/* Loading Message */}
      {showMessage && message && (
        <div className="text-center">
          <p className={`text-white font-medium ${getTextSize()}`}>
            {message}
          </p>
          <div className="flex justify-center mt-2 space-x-1">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
    </div>
  );
};

// Inline loader for buttons
export const InlineSpinner = ({ className = '' }) => (
  <div className={`inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin ${className}`} />
);

// Full page loader
export const FullPageLoader = ({ message = 'Loading application...' }) => (
  <div className="fixed inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-blue-700 flex items-center justify-center z-50">
    <div className="text-center">
      <LoadingSpinner message={message} size="large" />
    </div>
  </div>
);

// Card loader
export const CardLoader = ({ message = 'Loading...', className = '' }) => (
  <div className={`bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-glass border border-white/20 ${className}`}>
    <LoadingSpinner message={message} size="medium" className="text-gray-600" />
  </div>
);

export default LoadingSpinner;