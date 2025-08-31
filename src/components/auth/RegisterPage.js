// components/auth/RegisterPage.js
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, User, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const RegisterPage = ({ onBack, onSwitchToLogin, onRegistrationSuccess }) => {
  const { register, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
      const response = await register(formData.email, formData.password);
      
      if (response.success) {
        onRegistrationSuccess(formData.email);
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)'}}>
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center space-x-2 hover:opacity-80 transition-colors"
          style={{color: '#e9f5f9cc'}}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        {/* Registration Form */}
        <div className="glass-card-dark rounded-2xl shadow-xl p-8" style={{border: '1px solid #ffcf98'}}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#1ba098]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-[#1ba098]" />
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{color: 'var(--text-primary)', backgroundColor: 'var(--bg-hover)', borderColor: 'var(--border-subtle)'}}>Create Account</h1>
            <p style={{color: '#e9f5f9cc'}}>Join Digital Contracts and manage your agreements securely</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{color: 'var(--text-primary)', backgroundColor: 'var(--bg-hover)', borderColor: 'var(--border-subtle)'}}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{color: '#e9f5f9cc'}} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all  ${
                    formErrors.email ? 'border-red-400' : ''
                  }`}
                  style={{color: 'var(--text-primary)', backgroundColor: 'var(--bg-hover)', borderColor: 'var(--border-subtle)'}}
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
              <label className="block text-sm font-semibold mb-2" style={{color: 'var(--text-primary)', backgroundColor: 'var(--bg-hover)', borderColor: 'var(--border-subtle)'}}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{color: '#e9f5f9cc'}} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all  ${
                    formErrors.password ? 'border-red-400' : ''
                  }`}
                  style={{color: 'var(--text-primary)', backgroundColor: 'var(--bg-hover)', borderColor: 'var(--border-subtle)'}}
                  placeholder="Create a strong password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-80"
                  style={{color: '#e9f5f9cc'}}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-red-400 text-sm mt-1">{formErrors.password}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">Must be at least 6 characters long</p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{color: 'var(--text-primary)', backgroundColor: 'var(--bg-hover)', borderColor: 'var(--border-subtle)'}}>
                Confirm Password
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{color: '#e9f5f9cc'}} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    formErrors.confirmPassword ? 'border-red-400 ' : ''
                  }`}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-80"
                  style={{color: '#e9f5f9cc'}}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">{formErrors.confirmPassword}</p>
              )}
            </div>

            {/* Global Error */}
            {error && (
              <div className=" rounded-xl p-4" style={{border: '1px solid #ffcf98'}}>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Terms Notice */}
            <div className="bg-[#1ba098]/10 rounded-xl p-4" style={{border: '1px solid #ffcf98'}}>
              <p className="text-sm" style={{color: '#ffcf98'}}>
                By creating an account, you agree to our Terms of Service and Privacy Policy. 
                Your email will be used for verification and important account notifications.
              </p>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2" style={{background: 'linear-gradient(to right, var(--accent-dark), var(--accent-primary))', color: 'var(--text-primary)'}}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{borderColor: 'var(--text-primary)', borderTopColor: 'transparent'}}></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-8 pt-6 border-t" style={{borderColor: '#ffcf98'}}>
            <p style={{color: '#e9f5f9cc'}}>
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="font-semibold transition-colors hover:opacity-80"
                style={{color: '#ffcf98'}}
                disabled={isLoading}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;