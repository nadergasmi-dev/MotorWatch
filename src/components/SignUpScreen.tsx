import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Activity, User, IdCard } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import motorLogo from '../imports/MOTOR_(2).png';

export default function SignUpScreen() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (userId.length < 3) {
      setError('User ID must be at least 3 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ name, userId, email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'An error occurred during signup');
        setLoading(false);
        return;
      }

      // Success - redirect to login
      alert('Account created successfully! Please sign in.');
      navigate('/login');
    } catch (err) {
      console.error('Signup error:', err);
      setError('An error occurred during signup');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#262525] flex flex-col px-6 py-8">
      <div className="flex items-center space-x-3 mb-8">
        <Activity className="w-8 h-8 text-[#FFB84E]" />
        <span className="text-white text-xl font-bold">
          Motor<span className="text-[#FFB84E]">Watch</span>
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-400">Sign up to start monitoring your equipment</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFB84E] transition-colors"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              User ID
            </label>
            <div className="relative">
              <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFB84E] transition-colors"
                placeholder="johndoe123"
                required
                minLength={3}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Use this ID to login (letters, numbers, underscore only)</p>
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFB84E] transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFB84E] transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFB84E] text-[#262525] font-semibold py-3.5 rounded-lg hover:bg-[#ffa31a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-[#FFB84E] font-medium hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}