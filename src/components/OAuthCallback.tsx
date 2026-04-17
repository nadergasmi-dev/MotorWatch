import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '../utils/supabase/client';
import motorLogo from '../imports/MOTOR_(2)-1.png';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const supabase = createClient();
        
        // Get the hash params from URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken) {
          // Set session with the tokens from URL
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (sessionError) {
            console.error('Session error:', sessionError);
            setError(sessionError.message);
            setIsProcessing(false);
            return;
          }

          if (data.session) {
            // Clear the hash from URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Navigate to machine setup
            navigate('/machine-setup', { replace: true });
          }
        } else {
          // No token in URL, check if already authenticated
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            navigate('/machine-setup', { replace: true });
          } else {
            navigate('/login', { replace: true });
          }
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('An error occurred during authentication');
        setIsProcessing(false);
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#262525] flex flex-col items-center justify-center px-6">
        <img src={motorLogo} alt="MotorWatch" className="w-32 h-32 object-contain mb-8 animate-pulse" />
        <div className="max-w-md w-full bg-red-500/10 border border-red-500/50 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">Authentication Error</h2>
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-[#FFB84E] text-[#262525] font-semibold py-2 px-6 rounded-lg hover:bg-[#ffa31a] transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#262525] flex flex-col items-center justify-center px-6">
      <img src={motorLogo} alt="MotorWatch" className="w-32 h-32 object-contain mb-8 animate-pulse" />
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#FFB84E] border-t-transparent mb-4"></div>
        <h2 className="text-xl font-bold text-white mb-2">Authenticating...</h2>
        <p className="text-gray-400">Please wait while we sign you in</p>
      </div>
    </div>
  );
}
