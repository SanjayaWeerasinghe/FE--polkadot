import React, { useEffect } from 'react';

const StatusMessage = ({ message, type, onClose, autoClose = true }) => {
  useEffect(() => {
    if (autoClose && type === 'success' && onClose) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [type, onClose, autoClose]);

  if (!message) return null;

  const getStatusStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          icon: '✅',
          iconBg: 'bg-green-100',
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: '❌',
          iconBg: 'bg-red-100',
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: '⚠️',
          iconBg: 'bg-yellow-100',
        };
      case 'info':
      default:
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: 'ℹ️',
          iconBg: 'bg-blue-100',
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className={`p-4 rounded-xl border font-medium mb-5 animate-slideInRight ${styles.container}`}>
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${styles.iconBg}`}>
          <span className="text-sm">{styles.icon}</span>
        </div>
        
        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-relaxed break-words">
            {message}
          </p>
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-black/5 rounded-full transition-colors"
            aria-label="Close message"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Progress bar for auto-close */}
      {autoClose && type === 'success' && (
        <div className="mt-3 h-1 bg-green-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-400 rounded-full animate-[shrink_5s_linear_forwards]"
            style={{
              animation: 'shrink 5s linear forwards',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default StatusMessage;