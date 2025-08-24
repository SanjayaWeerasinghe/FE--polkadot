// components/auth/EmailVerificationPage.js
import React, { useState, useEffect } from 'react';
import { Mail, ArrowRight, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const EmailVerificationPage = ({ email, onBack, onVerificationSuccess }) => {
  const { verifyEmail, resendVerificationOTP, isLoading, error, clearError } = useAuth();
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setOtp(value);
      setOtpError('');
      if (error) {
        clearError();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      setOtpError('Please enter the verification code');
      return;
    }
    
    if (otp.length !== 6) {
      setOtpError('Verification code must be 6 digits');
      return;
    }
    
    try {
      const response = await verifyEmail(email, otp);
      
      if (response.success) {
        onVerificationSuccess();
      }
    } catch (error) {
      console.error('Email verification failed:', error);
    }
  };

  const handleResendOTP = async () => {
    try {
      setResendLoading(true);
      const response = await resendVerificationOTP(email);
      
      if (response.success) {
        setResendTimer(60);
        setCanResend(false);
        setOtp('');
        setOtpError('');
      }
    } catch (error) {
      console.error('Resend OTP failed:', error);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Verification Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
            <p className="text-gray-600 mb-4">
              We've sent a 6-digit verification code to
            </p>
            <p className="text-blue-600 font-semibold">{email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={handleOtpChange}
                className={`w-full px-4 py-3 text-center text-2xl font-mono border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all tracking-widest ${
                  otpError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="000000"
                maxLength={6}
                disabled={isLoading}
                autoFocus
              />
              {otpError && (
                <p className="text-red-500 text-sm mt-1">{otpError}</p>
              )}
              <p className="text-gray-500 text-sm mt-2">
                Enter the 6-digit code from your email
              </p>
            </div>

            {/* Global Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Resend Section */}
            <div className="text-center">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendLoading}
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  {resendLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Resending...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Resend code</span>
                    </>
                  )}
                </button>
              ) : (
                <p className="text-gray-500 text-sm">
                  Resend code in {resendTimer}s
                </p>
              )}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Verify Email</span>
                </>
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Check your email</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Check your spam/junk folder</li>
                <li>• The code expires in 10 minutes</li>
                <li>• Make sure you're checking the correct email</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;