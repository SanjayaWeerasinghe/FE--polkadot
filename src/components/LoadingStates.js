// components/ModernLoadingStates.js
import React from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

// Inline Spinner Component
export const ModernSpinner = ({ 
  size = 'md', 
  color = 'blue',
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const colorClasses = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    red: 'border-red-500',
    yellow: 'border-yellow-500',
    purple: 'border-purple-500',
    gray: 'border-gray-500',
    white: 'border-white'
  };

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        border-2 ${colorClasses[color]} border-t-transparent 
        rounded-full animate-spin
        ${className}
      `}
    />
  );
};

// Loading Card Skeleton
export const LoadingCard = ({ count = 1 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, index) => (
        <div 
          key={index} 
          className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
          </div>
          
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          
          <div className="mt-4 flex space-x-3">
            <div className="h-8 bg-gray-200 rounded-lg flex-1"></div>
            <div className="h-8 bg-gray-200 rounded-lg w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Full Page Loading Screen
export const FullPageLoading = ({ 
  message = 'Loading...', 
  subMessage = '',
  showLogo = true 
}) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center z-50">
      <div className="text-center">
        {showLogo && (
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{message}</h2>
        {subMessage && (
          <p className="text-gray-600 mb-6">{subMessage}</p>
        )}
        
        <div className="flex items-center justify-center space-x-2">
          <ModernSpinner size="sm" color="blue" />
          <span className="text-sm text-gray-500">Please wait...</span>
        </div>
      </div>
    </div>
  );
};

// Loading Button State
export const LoadingButton = ({ 
  loading = false, 
  children, 
  loadingText = 'Loading...', 
  className = '',
  disabled = false,
  ...props 
}) => {
  return (
    <button
      disabled={loading || disabled}
      className={`
        relative overflow-hidden transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      <span className={`flex items-center justify-center space-x-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center space-x-2">
          <ModernSpinner size="sm" color="white" />
          <span>{loadingText}</span>
        </div>
      )}
    </button>
  );
};

// Progress Bar Component
export const ProgressBar = ({ 
  progress = 0, 
  showPercentage = true,
  color = 'blue',
  height = 'h-2',
  animated = false 
}) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="w-full">
      {showPercentage && (
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${height}`}>
        <div 
          className={`
            ${height} ${colorClasses[color]} rounded-full transition-all duration-500 ease-out
            ${animated ? 'animate-pulse' : ''}
          `}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

// Step Progress Indicator
export const StepProgress = ({ 
  steps, 
  currentStep = 0,
  completedColor = 'bg-green-500',
  activeColor = 'bg-blue-500',
  inactiveColor = 'bg-gray-300' 
}) => {
  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isLast = index === steps.length - 1;
        
        return (
          <div key={index} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="relative flex items-center justify-center">
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium
                  ${isCompleted ? completedColor : isActive ? activeColor : inactiveColor}
                  transition-all duration-300
                `}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              
              {/* Step Label */}
              <div className="absolute top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <span className={`text-xs font-medium ${
                  isCompleted || isActive ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
                {step.description && (
                  <p className="text-xs text-gray-400 mt-1">{step.description}</p>
                )}
              </div>
            </div>
            
            {/* Connector Line */}
            {!isLast && (
              <div className="flex-1 h-0.5 mx-2">
                <div 
                  className={`
                    h-full transition-all duration-300
                    ${isCompleted ? completedColor : inactiveColor}
                  `}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Loading Overlay for specific components
export const LoadingOverlay = ({ 
  loading = false, 
  message = 'Loading...', 
  children,
  blur = true 
}) => {
  return (
    <div className="relative">
      {children}
      
      {loading && (
        <div className={`
          absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl
          flex items-center justify-center z-10
          ${blur ? 'backdrop-blur-sm' : ''}
        `}>
          <div className="text-center">
            <ModernSpinner size="lg" color="blue" className="mx-auto mb-3" />
            <p className="text-gray-600 font-medium">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Shimmer Effect for Loading States
export const ShimmerEffect = ({ className = '', children }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

// Loading States for Different Data Types
export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action,
  actionText = 'Get Started' 
}) => {
  return (
    <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
      {Icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-md mx-auto mb-6">{description}</p>
      {action && (
        <button
          onClick={action}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default {
  ModernSpinner,
  LoadingCard,
  FullPageLoading,
  LoadingButton,
  ProgressBar,
  StepProgress,
  LoadingOverlay,
  ShimmerEffect,
  EmptyState
};