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
            border-t-transparent" style={{borderColor: 'var(--text-secondary)', borderTopColor: 'var(--text-primary)'}} 
            rounded-full animate-spin
          `}
        />
        
        {/* Inner pulse dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: 'var(--text-primary)'}} />
        </div>
      </div>

      {/* Loading Message */}
      {showMessage && message && (
        <div className="text-center">
          <p className={`font-medium ${getTextSize()}`} style={{color: 'var(--text-primary)'}}>
            {message}
          </p>
          <div className="flex justify-center mt-2 space-x-1">
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '0ms', backgroundColor: 'var(--text-secondary)' }} />
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '150ms', backgroundColor: 'var(--text-secondary)' }} />
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '300ms', backgroundColor: 'var(--text-secondary)' }} />
          </div>
        </div>
      )}
    </div>
  );
};

// Inline loader for buttons
export const InlineSpinner = ({ className = '' }) => (
  <div className={`inline-block w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${className}`} style={{borderColor: 'var(--text-secondary)', borderTopColor: 'var(--text-primary)'}} />
);

// Full page loader
export const FullPageLoader = ({ message = 'Loading application...' }) => (
  <div className="fixed inset-0 flex items-center justify-center z-50" style={{background: 'var(--bg-primary)'}}>
    <div className="text-center">
      <LoadingSpinner message={message} size="large" />
    </div>
  </div>
);

// Card loader
export const CardLoader = ({ message = 'Loading...', className = '' }) => (
  <div className={`backdrop-blur-sm rounded-2xl p-8 shadow-glass ${className}`} style={{backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)'}}>
    <LoadingSpinner message={message} size="medium" />
  </div>
);

export default LoadingSpinner;