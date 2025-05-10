import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const EmailVerification = ({ onVerificationComplete }) => {
  const [step, setStep] = useState('register'); // 'register', 'verify'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.registerUser(email);
      setStep('verify');
      setSuccess('OTP sent to your email. Please check your inbox and enter the code below.');
    } catch (err) {
      console.error('Error registering:', err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.verifyOTP(email, otp);
      
      // Store token in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setSuccess('Email verified successfully!');
      
      // Call the onVerificationComplete callback if provided
      if (onVerificationComplete) {
        onVerificationComplete(response.user);
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await api.resendOTP(email);
      setSuccess('New OTP sent to your email. Please check your inbox.');
    } catch (err) {
      console.error('Error resending OTP:', err);
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        {step === 'register' ? 'Register Your Email' : 'Verify Your Email'}
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      {step === 'register' ? (
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify}>
          <div className="mb-4">
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter 6-digit code"
              maxLength={6}
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors mb-2"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
          
          <div className="flex justify-between items-center mt-4">
            <button
              type="button"
              onClick={handleResendOTP}
              className="text-sm text-blue-600 hover:text-blue-800"
              disabled={loading}
            >
              Resend Code
            </button>
            
            <button
              type="button"
              onClick={() => setStep('register')}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Change Email
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EmailVerification; 