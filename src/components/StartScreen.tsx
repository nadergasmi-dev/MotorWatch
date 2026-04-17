import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import motorLogo from '../imports/MOTOR_(2)-1.png';

export default function StartScreen() {
  const navigate = useNavigate();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000); // Auto-redirect to login after 3 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#262525] flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-12">
        <img src={motorLogo} alt="Motor Watch" className="w-100 h-100 object-contain animate-pulse" />
      </div>

      {/* Welcome Text */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-3">
          Welcome to <span className="text-[#FFB84E]">MotorWatch</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Professional predictive maintenance for industrial motors
        </p>
      </div>

      {/* Activity Icon */}
      <div className="relative">
        <div className="absolute inset-0 bg-[#FFB84E] blur-3xl opacity-30 rounded-full"></div>
        <Activity className="w-24 h-24 text-[#FFB84E] relative z-10" strokeWidth={1.5} />
      </div>
      
      {/* Navigation Button */}
      <div className="absolute bottom-8">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-[#FFB84E] rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-[#FFB84E] rounded-full animate-pulse delay-100"></div>
          <div className="w-2 h-2 bg-[#FFB84E] rounded-full animate-pulse delay-200"></div>
        </div>
      </div>
    </div>
  );
}