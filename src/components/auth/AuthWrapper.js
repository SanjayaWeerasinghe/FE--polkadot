// components/auth/AuthWrapper.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import EmailVerificationPage from './EmailVerificationPage';
import PublicKeyManagement from './PublicKeyManagement';

const AuthWrapper = ({ onBack, onAuthSuccess }) => {
  const { user, isAuthenticated, isVerified, publicKeys, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState('login');
  const [pendingEmail, setPendingEmail] = useState('');

  // Handle auth state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      if (!isVerified) {
        // User is registered but not verified
        setCurrentView('verification');
        setPendingEmail(user.email);
      } else {
        // User is authenticated and verified
        onAuthSuccess();
      }
    }
  }, [isAuthenticated, user, isVerified, onAuthSuccess]);

  const handleRegistrationSuccess = (email) => {
    setPendingEmail(email);
    setCurrentView('verification');
  };

  const handleVerificationSuccess = () => {
    onAuthSuccess();
  };

  const handleForgotPassword = () => {
    // For now, just show an alert. You can implement a full reset flow later.
    alert('Password reset functionality will be available soon. Please contact support if needed.');
  };

  // Show loading state during initialization
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated and verified, they shouldn't be here
  if (isAuthenticated && isVerified) {
    return null;
  }

  // Show appropriate view based on current state
  switch (currentView) {
    case 'register':
      return (
        <RegisterPage
          onBack={onBack}
          onSwitchToLogin={() => setCurrentView('login')}
          onRegistrationSuccess={handleRegistrationSuccess}
        />
      );

    case 'verification':
      return (
        <EmailVerificationPage
          email={pendingEmail}
          onBack={() => {
            if (isAuthenticated) {
              setCurrentView('login');
            } else {
              setCurrentView('register');
            }
          }}
          onVerificationSuccess={handleVerificationSuccess}
        />
      );

    case 'publicKeys':
      return (
        <PublicKeyManagement
          onBack={onAuthSuccess}
        />
      );

    case 'login':
    default:
      return (
        <LoginPage
          onBack={onBack}
          onSwitchToRegister={() => setCurrentView('register')}
          onForgotPassword={handleForgotPassword}
        />
      );
  }
};

export default AuthWrapper;