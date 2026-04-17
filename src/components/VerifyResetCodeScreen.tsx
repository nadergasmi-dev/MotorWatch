import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Activity, ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import motorLogo from '../imports/MOTOR_(2).png';

export default function VerifyResetCodeScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!email) {
    return (
      <div className="min-h-screen bg-[#262525] flex flex-col items-center justify-center px-6">
        <p className="text-white mb-4">No email provided</p>
        <button
          onClick={() => navigate('/forgot-password')}
          className="bg-[#FFB84E] text-[#262525] px-6 py-2 rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (code.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/make-server-3f7a73b0/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, code, newPassword }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'An error occurred');
        setLoading(false);
        return;
      }

      // Success
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      console.error('Reset password error:', err);
      setError('An error occurred while resetting password');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#262525] flex flex-col px-6 py-8">
        <div className="flex items-center space-x-3 mb-12">
          <Activity className="w-8 h-8 text-[#FFB84E]" />
          <span className="text-white text-xl font-bold">
            Motor<span className="text-[#FFB84E]">Watch</span>
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full text-center">
          <div className="mb-8 flex justify-center">
            <div className="bg-green-500/10 p-4 rounded-full">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">Password Reset!</h2>
          <p className="text-gray-400 mb-8">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>

          <button
            onClick={() => navigate('/login')}
            className="w-full bg-[#FFB84E] text-[#262525] font-semibold py-3.5 rounded-lg hover:bg-[#ffa31a] transition-colors"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#262525] flex flex-col px-6 py-8">
      <div className="flex items-center space-x-3 mb-12">
        <button
          onClick={() => navigate('/forgot-password')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <Activity className="w-8 h-8 text-[#FFB84E]" />
        <span className="text-white text-xl font-bold">
          Motor<span className="text-[#FFB84E]">Watch</span>
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Verify Code</h2>
          <p className="text-gray-400">
            Enter the 6-digit code sent to <span className="text-[#FFB84E]">{email}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Verification Code
            </label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={(value) => setCode(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="w-12 h-14 text-xl bg-[#1a1a1a] border-gray-700 text-white" />
                  <InputOTPSlot index={1} className="w-12 h-14 text-xl bg-[#1a1a1a] border-gray-700 text-white" />
                  <InputOTPSlot index={2} className="w-12 h-14 text-xl bg-[#1a1a1a] border-gray-700 text-white" />
                  <InputOTPSlot index={3} className="w-12 h-14 text-xl bg-[#1a1a1a] border-gray-700 text-white" />
                  <InputOTPSlot index={4} className="w-12 h-14 text-xl bg-[#1a1a1a] border-gray-700 text-white" />
                  <InputOTPSlot index={5} className="w-12 h-14 text-xl bg-[#1a1a1a] border-gray-700 text-white" />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <p className="text-gray-500 text-xs text-center mt-2">Code expires in 10 minutes</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg py-3.5 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFB84E] transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg py-3.5 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFB84E] transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-[#FFB84E] text-[#262525] font-semibold py-3.5 rounded-lg hover:bg-[#ffa31a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/forgot-password')}
            className="text-gray-400 text-sm hover:text-[#FFB84E] transition-colors"
          >
            Didn't receive the code? Send again
          </button>
        </div>
      </div>
    </div>
  );
}