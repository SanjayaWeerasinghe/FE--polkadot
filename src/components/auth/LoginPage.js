// components/auth/LoginPage.js
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = ({ onBack, onSwitchToRegister, onForgotPassword }) => {
  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear global error
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const response = await login(formData.email, formData.password);
      
      if (response.success) {
        // Success is handled by the AuthContext
        console.log('Login successful');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)'}}>
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center space-x-2 hover:opacity-80 transition-colors"
          style={{color: 'var(--text-secondary)'}}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        {/* Login Form */}
        <div className="glass-card-dark rounded-2xl shadow-xl p-8" style={{border: '1px solid var(--border-primary)'}}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>Welcome Back</h1>
            <p style={{color: 'var(--text-secondary)'}}>Sign in to your Digital Contracts account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{color: 'var(--text-primary)'}}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{color: 'var(--text-secondary)'}} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    formErrors.email ? 'border-red-400' : ''
                  }`}
                  style={{color: 'var(--text-primary)', backgroundColor: 'var(--bg-hover)', borderColor: formErrors.email ? 'var(--error)' : 'var(--border-subtle)', '::placeholder': {color: 'var(--text-secondary)'}}}
                  placeholder="Enter your email address"
                  disabled={isLoading}
                />
              </div>
              {formErrors.email && (
                <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{color: 'var(--text-primary)'}}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{color: 'var(--text-secondary)'}} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    formErrors.password ? 'border-red-400' : ''
                  }`}
                  style={{color: 'var(--text-primary)', backgroundColor: 'var(--bg-hover)', borderColor: formErrors.email ? 'var(--error)' : 'var(--border-subtle)', '::placeholder': {color: 'var(--text-secondary)'}}}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-80"
                  style={{color: 'var(--text-secondary)'}}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-red-400 text-sm mt-1">{formErrors.password}</p>
              )}
            </div>

            {/* Global Error */}
            {error && (
              <div className="bg-red-500/10 rounded-xl p-4" style={{border: '1px solid var(--border-primary)'}}>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Forgot Password Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm font-medium transition-colors hover:opacity-80"
                style={{color: 'var(--border-primary)'}}
                disabled={isLoading}
              >
                Forgot your password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2" style={{background: 'linear-gradient(to right, var(--accent-dark), var(--accent-primary))', color: 'var(--text-primary)', border: '1px solid var(--border-primary)'}}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{borderColor: 'var(--text-primary)', borderTopColor: 'transparent'}}></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="text-center mt-8 pt-6 border-t" style={{borderColor: 'var(--border-primary)'}}>
            <p style={{color: 'var(--text-secondary)'}}>
              Don't have an account?{' '}
              <button
                onClick={onSwitchToRegister}
                className="font-semibold transition-colors hover:opacity-80"
                style={{color: 'var(--border-primary)'}}
                disabled={isLoading}
              >
                Create account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;