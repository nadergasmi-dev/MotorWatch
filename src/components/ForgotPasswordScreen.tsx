import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Activity, ArrowLeft } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import motorLogo from '../imports/MOTOR_(2).png';

export default function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/make-server-3f7a73b0/forgot-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email }),
        }
      );

      const text = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        console.error('Non-JSON response:', text);
        setError(`Server error (${response.status}): ${text.slice(0, 120)}`);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setError(data.error || `Error ${response.status}`);
        setLoading(false);
        return;
      }

      // Success - navigate to verify code screen with email
      navigate('/verify-reset-code', { state: { email } });
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('An error occurred while sending code');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#262525] flex flex-col px-6 py-8">
      <div className="flex items-center space-x-3 mb-12">
        <button
          onClick={() => navigate('/login')}
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
          <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-gray-400">
            Enter your email address and we'll send you a 6-digit verification code
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSendCode} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFB84E] transition-colors"
                placeholder="your.email@company.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFB84E] text-[#262525] font-semibold py-3.5 rounded-lg hover:bg-[#ffa31a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-gray-400 text-sm hover:text-[#FFB84E] transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}