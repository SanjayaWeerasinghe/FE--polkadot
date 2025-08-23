// components/ErrorModal.js
import React from 'react';
import { AlertTriangle, XCircle, AlertCircle, X, Copy, RefreshCw, ExternalLink, Bug } from 'lucide-react';

const ErrorModal = ({ 
  isOpen, 
  onClose, 
  error,
  title,
  type = 'error', // error, warning, critical
  showRetry = false,
  onRetry,
  showDetails = true,
  showCopy = true
}) => {
  if (!isOpen || !error) return null;

  const getErrorConfig = (type) => {
    const configs = {
      error: {
        icon: XCircle,
        gradient: 'from-red-500 to-rose-500',
        bgGradient: 'from-red-50 to-rose-50',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        titleColor: 'text-red-800',
        buttonColor: 'from-red-600 to-rose-600',
        borderColor: 'border-red-200'
      },
      warning: {
        icon: AlertTriangle,
        gradient: 'from-amber-500 to-orange-500',
        bgGradient: 'from-amber-50 to-orange-50',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        titleColor: 'text-amber-800',
        buttonColor: 'from-amber-600 to-orange-600',
        borderColor: 'border-amber-200'
      },
      critical: {
        icon: AlertCircle,
        gradient: 'from-purple-500 to-pink-500',
        bgGradient: 'from-purple-50 to-pink-50',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        titleColor: 'text-purple-800',
        buttonColor: 'from-purple-600 to-pink-600',
        borderColor: 'border-purple-200'
      }
    };
    return configs[type] || configs.error;
  };

  const config = getErrorConfig(type);
  const Icon = config.icon;

  // Parse error message and extract useful info
  const parseError = (error) => {
    const errorStr = typeof error === 'string' ? error : error?.message || error?.toString() || 'Unknown error';
    
    // Common error patterns
    const patterns = {
      network: /network|connection|timeout|fetch/i,
      wallet: /wallet|extension|account|sign|polkadot/i,
      blockchain: /blockchain|transaction|block|hash|gas|fee/i,
      validation: /validation|invalid|required|format/i,
      permission: /permission|unauthorized|forbidden|denied/i
    };

    let category = 'General';
    let suggestion = 'Please try again or contact support if the issue persists.';

    if (patterns.network.test(errorStr)) {
      category = 'Network';
      suggestion = 'Check your internet connection and try again.';
    } else if (patterns.wallet.test(errorStr)) {
      category = 'Wallet';
      suggestion = 'Ensure your wallet extension is installed, unlocked, and connected.';
    } else if (patterns.blockchain.test(errorStr)) {
      category = 'Blockchain';
      suggestion = 'The blockchain network may be busy. Please wait a moment and try again.';
    } else if (patterns.validation.test(errorStr)) {
      category = 'Validation';
      suggestion = 'Please check your input and ensure all required fields are properly filled.';
    } else if (patterns.permission.test(errorStr)) {
      category = 'Permission';
      suggestion = 'You may not have the required permissions for this action.';
    }

    return {
      message: errorStr,
      category,
      suggestion
    };
  };

  const errorInfo = parseError(error);

  const copyErrorDetails = () => {
    const details = `
Error Report - Digital Notarized Contracts
==========================================
Time: ${new Date().toISOString()}
Category: ${errorInfo.category}
Message: ${errorInfo.message}
Type: ${type}
Title: ${title || 'Error'}
User Agent: ${navigator.userAgent}
URL: ${window.location.href}
==========================================
    `.trim();
    
    navigator.clipboard.writeText(details);
  };

  const getHelpMessage = (category) => {
    const helpMessages = {
      'Network': 'This appears to be a network connectivity issue. Please check your internet connection.',
      'Wallet': 'This is related to your wallet connection. Make sure your Polkadot.js extension is properly set up.',
      'Blockchain': 'This is a blockchain-related error. The network might be busy or experiencing delays.',
      'Validation': 'There was an issue with the data provided. Please review your input.',
      'Permission': 'You may not have the necessary permissions for this action.',
      'General': 'An unexpected error occurred. This may be temporary.'
    };
    return helpMessages[category] || helpMessages['General'];
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${config.gradient} p-6 relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 ${config.iconBg} rounded-2xl flex items-center justify-center`}>
              <Icon className={`w-8 h-8 ${config.iconColor}`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {title || `${type.charAt(0).toUpperCase() + type.slice(1)} Occurred`}
              </h2>
              <p className="text-white/90 mt-1">Something went wrong</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Category */}
          <div className={`bg-gradient-to-br ${config.bgGradient} rounded-2xl p-4 border ${config.borderColor}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Bug className={`w-5 h-5 ${config.iconColor}`} />
              <span className={`text-sm font-semibold ${config.titleColor} uppercase tracking-wide`}>
                {errorInfo.category} Error
              </span>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {getHelpMessage(errorInfo.category)}
            </p>
          </div>

          {/* Error Message */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Error Details</h3>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-gray-800 text-sm leading-relaxed font-mono break-words">
                {errorInfo.message}
              </p>
            </div>
          </div>

          {/* Suggestion */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <h3 className="text-base font-semibold text-blue-800 mb-2 flex items-center space-x-2">
              <ExternalLink className="w-4 h-4" />
              <span>Suggested Solution</span>
            </h3>
            <p className="text-blue-700 text-sm leading-relaxed">
              {errorInfo.suggestion}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {showRetry && onRetry && (
              <button
                onClick={onRetry}
                className={`flex-1 bg-gradient-to-r ${config.buttonColor} text-white py-3 px-4 rounded-2xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2`}
              >
                <RefreshCw className="w-5 h-5" />
                <span>Try Again</span>
              </button>
            )}
            
            {showCopy && (
              <button
                onClick={copyErrorDetails}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-2xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <Copy className="w-5 h-5" />
                <span>Copy Details</span>
              </button>
            )}
            
            <button
              onClick={onClose}
              className="flex-1 bg-gray-800 text-white py-3 px-4 rounded-2xl font-semibold hover:bg-gray-900 transition-colors"
            >
              Close
            </button>
          </div>

          {/* Additional Help */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              If this error persists, please copy the error details and contact support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for managing error modals
export const useErrorModal = () => {
  const [errorModal, setErrorModal] = React.useState({
    isOpen: false,
    error: null,
    title: null,
    type: 'error',
    showRetry: false,
    onRetry: null
  });

  const showError = (error, options = {}) => {
    setErrorModal({
      isOpen: true,
      error,
      title: options.title || null,
      type: options.type || 'error',
      showRetry: options.showRetry || false,
      onRetry: options.onRetry || null
    });
  };

  const hideError = () => {
    setErrorModal(prev => ({ ...prev, isOpen: false }));
  };

  const showNetworkError = (error, onRetry) => {
    showError(error, {
      title: 'Network Connection Error',
      type: 'warning',
      showRetry: true,
      onRetry
    });
  };

  const showWalletError = (error, onRetry) => {
    showError(error, {
      title: 'Wallet Connection Issue',
      type: 'error',
      showRetry: true,
      onRetry
    });
  };

  const showBlockchainError = (error, onRetry) => {
    showError(error, {
      title: 'Blockchain Transaction Error',
      type: 'critical',
      showRetry: true,
      onRetry
    });
  };

  return {
    errorModal,
    showError,
    hideError,
    showNetworkError,
    showWalletError,
    showBlockchainError
  };
};

export default ErrorModal;