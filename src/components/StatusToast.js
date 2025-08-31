// components/ModernStatusToast.js
import React, { useState, useEffect } from 'react';
import { 
  X, CheckCircle, AlertCircle, Info, AlertTriangle, 
  Loader2, Sparkles, Zap, Clock, Shield, 
  TrendingUp, Star, Heart, Coffee
} from 'lucide-react';

const ModernStatusToast = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose,
  position = 'top-right',
  showIcon = true,
  showProgress = true,
  dismissible = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      setIsExiting(false);
      
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  const getToastConfig = (type) => {
    const configs = {
      success: {
        icon: CheckCircle,
        bgColor: 'glass-card-dark',
        borderColor: 'var(--border-primary)',
        iconColor: 'var(--success)',
        textColor: 'var(--text-primary)',
        progressColor: 'var(--success)',
        shadowColor: 'shadow-green-200/60 shadow-lg',
        accentIcon: Sparkles,
        pulseColor: 'bg-green-400/20'
      },
      error: {
        icon: AlertCircle,
        bgColor: 'glass-card-dark',
        borderColor: 'var(--border-primary)',
        iconColor: 'var(--error)',
        textColor: 'var(--text-primary)',
        progressColor: 'var(--error)',
        shadowColor: 'shadow-red-200/60 shadow-lg',
        accentIcon: Zap,
        pulseColor: 'bg-red-400/20'
      },
      warning: {
        icon: AlertTriangle,
        bgColor: 'glass-card-dark',
        borderColor: 'var(--border-primary)',
        iconColor: 'var(--warning)',
        textColor: 'var(--text-primary)',
        progressColor: 'var(--warning)',
        shadowColor: 'shadow-amber-200/60 shadow-lg',
        accentIcon: Shield,
        pulseColor: 'bg-amber-400/20'
      },
      info: {
        icon: Info,
        bgColor: 'glass-card-dark',
        borderColor: 'var(--border-primary)',
        iconColor: 'var(--success)',
        textColor: 'var(--text-primary)',
        progressColor: 'var(--success)',
        shadowColor: 'shadow-blue-200/60 shadow-lg',
        accentIcon: TrendingUp,
        pulseColor: 'bg-blue-400/20'
      },
      loading: {
        icon: Loader2,
        bgColor: 'glass-card-dark',
        borderColor: 'var(--border-primary)',
        iconColor: 'var(--success)',
        textColor: 'var(--text-primary)',
        progressColor: 'var(--success)',
        shadowColor: 'shadow-violet-200/60 shadow-lg',
        accentIcon: Clock,
        pulseColor: 'bg-violet-400/20',
        animated: true
      },
      celebration: {
        icon: Star,
        bgColor: 'bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50',
        borderColor: 'border-pink-300/60',
        iconColor: 'text-pink-600',
        textColor: 'text-pink-800',
        progressColor: 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500',
        shadowColor: 'shadow-pink-200/60 shadow-lg',
        accentIcon: Heart,
        pulseColor: 'bg-pink-400/20',
        sparkles: true
      },
      blockchain: {
        icon: Shield,
        bgColor: 'bg-gradient-to-br from-cyan-50 via-teal-50 to-green-50',
        borderColor: 'border-cyan-300/60',
        iconColor: 'text-cyan-600',
        textColor: 'text-cyan-800',
        progressColor: 'bg-gradient-to-r from-cyan-500 via-teal-500 to-green-500',
        shadowColor: 'shadow-cyan-200/60 shadow-lg',
        accentIcon: Coffee,
        pulseColor: 'bg-cyan-400/20'
      }
    };
    return configs[type] || configs.info;
  };

  const getPositionClasses = (position) => {
    const positions = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };
    return positions[position] || positions['top-right'];
  };

  if (!isVisible || !message) return null;

  const config = getToastConfig(type);
  const Icon = config.icon;
  const AccentIcon = config.accentIcon;
  const positionClasses = getPositionClasses(position);

  return (
    <div 
      className={`fixed z-50 ${positionClasses} transition-all duration-500 ease-out ${
        isExiting 
          ? 'opacity-0 transform translate-y-4 scale-90' 
          : 'opacity-100 transform translate-y-0 scale-100'
      }`}
    >
      <div className={`
        ${config.bgColor} ${config.borderColor} ${config.shadowColor}
        border rounded-2xl backdrop-blur-xl
        min-w-96 max-w-lg px-5 py-4 relative overflow-hidden
        transform transition-all duration-500 ease-out
        hover:scale-105 hover:shadow-2xl
        ${config.animated ? 'animate-pulse-subtle' : ''}
      `}>
        
        {/* Floating particles for celebration */}
        {config.sparkles && (
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <div className="absolute top-2 right-4 w-1 h-1 bg-pink-400 rounded-full animate-twinkle-1"></div>
            <div className="absolute top-6 right-8 w-1.5 h-1.5 bg-rose-400 rounded-full animate-twinkle-2"></div>
            <div className="absolute top-4 right-12 w-1 h-1 bg-purple-400 rounded-full animate-twinkle-3"></div>
            <div className="absolute top-8 right-6 w-0.5 h-0.5 bg-pink-300 rounded-full animate-twinkle-1"></div>
          </div>
        )}
        
        {/* Pulse effect background */}
        <div className={`absolute inset-0 ${config.pulseColor} rounded-3xl opacity-0 ${
          config.animated ? 'animate-pulse-slow' : ''
        }`}></div>
        
        <div className="relative z-10 flex items-center space-x-4">
          {/* Main Icon with enhanced design */}
          {showIcon && (
            <div className="relative">
              <div className={`
                flex-shrink-0 w-9 h-9 ${config.iconColor} 
                bg-white/70 backdrop-blur-sm rounded-xl 
                flex items-center justify-center
                shadow-lg border border-white/40
                ${config.animated ? 'animate-bounce-subtle' : 'hover:scale-110 transition-transform duration-300'}
              `}>
                <Icon className={`w-4.5 h-4.5 ${config.animated ? 'animate-spin' : ''}`} />
              </div>
              
              {/* Accent icon */}
              {AccentIcon && (
                <div className={`
                  absolute -top-0.5 -right-0.5 w-3.5 h-3.5 ${config.iconColor} 
                  bg-white/90 rounded-full flex items-center justify-center
                  shadow-sm border border-white/60
                  ${config.sparkles ? 'animate-bounce' : ''}
                `}>
                  <AccentIcon className="w-2 h-2" />
                </div>
              )}
            </div>
          )}
          
          {/* Message with enhanced typography */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${config.textColor} leading-snug`}>
              {message}
            </p>
          </div>
          
          {/* Enhanced Close Button */}
          {dismissible && (
            <button
              onClick={handleClose}
              className={`
                flex-shrink-0 ${config.iconColor} 
                hover:opacity-80 transition-all duration-300 
                p-1.5 hover:bg-white/30 rounded-lg
                hover:scale-110 active:scale-95
                backdrop-blur-sm
              `}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        
        {/* Enhanced Progress Bar */}
        {showProgress && (
          <div className="relative mt-3 h-1.5 bg-white/40 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className={`
                h-full ${config.progressColor} rounded-full 
                transition-all ease-linear shadow-sm
                relative overflow-hidden
              `}
              style={{
                animation: `shrink ${duration}ms linear forwards`
              }}
            >
              {/* Shimmer effect on progress bar */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes twinkle-1 {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes twinkle-2 {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.4); }
        }
        
        @keyframes twinkle-3 {
          0%, 100% { opacity: 0.2; transform: scale(0.9); }
          50% { opacity: 0.9; transform: scale(1.3); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.1; }
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-2px) scale(1.05); }
        }
        
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .animate-twinkle-1 {
          animation: twinkle-1 2s ease-in-out infinite;
          animation-delay: 0s;
        }
        
        .animate-twinkle-2 {
          animation: twinkle-2 2.5s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        
        .animate-twinkle-3 {
          animation: twinkle-3 2.2s ease-in-out infinite;
          animation-delay: 1s;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Toast Manager Hook
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, duration + 300); // Add extra time for exit animation
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (message, duration) => showToast(message, 'success', duration);
  const error = (message, duration) => showToast(message, 'error', duration);
  const warning = (message, duration) => showToast(message, 'warning', duration);
  const info = (message, duration) => showToast(message, 'info', duration);
  const loading = (message, duration = 8000) => showToast(message, 'loading', duration);
  const celebration = (message, duration = 6000) => showToast(message, 'celebration', duration);
  const blockchain = (message, duration) => showToast(message, 'blockchain', duration);

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
    loading,
    celebration,
    blockchain
  };
};

// Toast Container Component
export const ToastContainer = ({ toasts, onRemove, position = 'top-right' }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            animationDelay: `${index * 100}ms`
          }}
          className="pointer-events-auto"
        >
          <ModernStatusToast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            position={position}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default ModernStatusToast;