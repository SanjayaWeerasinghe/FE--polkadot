// contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import publicKeyService from '../services/publicKeyService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [publicKeys, setPublicKeys] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Check if user has valid token
      const hasValidToken = await authService.ensureValidToken();
      
      if (hasValidToken) {
        // Get fresh user data
        const profileResponse = await authService.getProfile();
        
        if (profileResponse.success) {
          const userData = profileResponse.data.user;
          setUser(userData);
          setIsAuthenticated(true);
          
          // Load public keys
          if (userData.isVerified) {
            await loadPublicKeys();
          }
        }
      } else {
        // Clear any stale data
        setUser(null);
        setPublicKeys([]);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setUser(null);
      setPublicKeys([]);
      setIsAuthenticated(false);
      authService.clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const loadPublicKeys = async () => {
    try {
      const keys = await publicKeyService.getPublicKeys();
      setPublicKeys(keys);
    } catch (error) {
      console.error('Failed to load public keys:', error);
      setPublicKeys([]);
    }
  };

  // Register user
  const register = async (email, password) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await authService.register(email, password);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Verify email
  const verifyEmail = async (email, otp) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await authService.verifyEmail(email, otp);
      
      if (response.success && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        // Load public keys if user is verified
        if (response.data.user.isVerified) {
          await loadPublicKeys();
        }
      }
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification OTP
  const resendVerificationOTP = async (email) => {
    try {
      setError(null);
      const response = await authService.resendVerificationOTP(email);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await authService.login(email, password);
      
      if (response.success && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        // Load public keys if user is verified
        if (response.data.user.isVerified) {
          await loadPublicKeys();
        }
      }
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Request password reset
  const requestPasswordReset = async (email) => {
    try {
      setError(null);
      const response = await authService.requestPasswordReset(email);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email, otp, newPassword) => {
    try {
      setError(null);
      const response = await authService.resetPassword(email, otp, newPassword);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    authService.logout();
    setUser(null);
    setPublicKeys([]);
    setIsAuthenticated(false);
    setError(null);
  };

  // Add public key
  const addPublicKey = async (publicKey) => {
    try {
      setError(null);
      const response = await publicKeyService.addPublicKey(publicKey);
      
      if (response.success) {
        setPublicKeys(response.data.publicKeys);
        
        // Update user in context
        if (user) {
          setUser({
            ...user,
            publicKeys: response.data.publicKeys
          });
        }
      }
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Remove public key
  const removePublicKey = async (publicKey) => {
    try {
      setError(null);
      const response = await publicKeyService.removePublicKey(publicKey);
      
      if (response.success) {
        setPublicKeys(response.data.publicKeys);
        
        // Update user in context
        if (user) {
          setUser({
            ...user,
            publicKeys: response.data.publicKeys
          });
        }
      }
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Validate if user owns a public key
  const validatePublicKey = async (publicKey) => {
    try {
      const response = await publicKeyService.validatePublicKey(publicKey);
      return response;
    } catch (error) {
      console.error('Public key validation failed:', error);
      return { isValid: false };
    }
  };

  // Check if current user can use a specific public key
  const canUsePublicKey = (publicKey) => {
    return publicKeys.includes(publicKey);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await authService.getProfile();
      if (response.success) {
        setUser(response.data.user);
        if (response.data.user.isVerified) {
          await loadPublicKeys();
        }
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const value = {
    // State
    user,
    publicKeys,
    isAuthenticated,
    isLoading,
    error,
    
    // Computed properties
    isVerified: user?.isVerified || false,
    
    // Auth methods
    register,
    verifyEmail,
    resendVerificationOTP,
    login,
    logout,
    requestPasswordReset,
    resetPassword,
    
    // Public key methods
    addPublicKey,
    removePublicKey,
    validatePublicKey,
    canUsePublicKey,
    loadPublicKeys,
    
    // Utility methods
    clearError,
    refreshUser,
    initializeAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;