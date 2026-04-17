import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Thermometer, Radio, Bell, LogOut, Save, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsProps {
  onLogout: () => void;
}

export default function Settings({ onLogout }: SettingsProps) {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [tempWarn, setTempWarn] = useState('75');
  const [tempAlarm, setTempAlarm] = useState('85');
  const [refreshRate, setRefreshRate] = useState('60');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [silentMode, setSilentMode] = useState(false);

  const handleSave = () => {
    // Save settings logic here
    alert('Settings saved successfully!');
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  // Dynamic colors based on theme
  const bgColor = isDarkMode ? 'bg-[#262525]' : 'bg-white';
  const cardBg = isDarkMode ? 'bg-[#1a1a1a]' : 'bg-gray-50';
  const textColor = isDarkMode ? 'text-white' : 'text-[#262525]';
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDarkMode ? 'border-gray-800' : 'border-gray-200';
  const inputBg = isDarkMode ? 'bg-[#262525]' : 'bg-white';
  const inputBorder = isDarkMode ? 'border-gray-700' : 'border-gray-300';

  return (
    <div className={`min-h-screen ${bgColor}`}>
      {/* Header */}
      <div className={`${cardBg} px-6 py-4 border-b ${borderColor}`}>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className={`${textSecondary} hover:${textColor} transition-colors`}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className={`${textColor} font-bold text-lg`}>Settings</h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Dark Mode Toggle */}
        <div className={`${cardBg} rounded-2xl p-5 border ${borderColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isDarkMode ? (
                <Moon className="w-6 h-6 text-[#FFB84E]" />
              ) : (
                <Sun className="w-6 h-6 text-[#FFB84E]" />
              )}
              <div>
                <h3 className={`${textColor} font-semibold`}>Dark Mode</h3>
                <p className={`${textSecondary} text-sm`}>
                  {isDarkMode ? 'Dark theme enabled' : 'Light theme enabled'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                isDarkMode ? 'bg-[#FFB84E]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  isDarkMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Temperature Thresholds */}
        <div className={`${cardBg} rounded-2xl p-5 border ${borderColor}`}>
          <div className="flex items-center space-x-3 mb-5">
            <Thermometer className="w-6 h-6 text-[#FFB84E]" />
            <h3 className={`${textColor} font-semibold`}>Temperature Thresholds</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                Warning Threshold (°C)
              </label>
              <input
                type="number"
                value={tempWarn}
                onChange={(e) => setTempWarn(e.target.value)}
                className={`w-full ${inputBg} border ${inputBorder} rounded-lg py-3 px-4 ${textColor} focus:outline-none focus:border-[#FFB84E] transition-colors`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                Alarm Threshold (°C)
              </label>
              <input
                type="number"
                value={tempAlarm}
                onChange={(e) => setTempAlarm(e.target.value)}
                className={`w-full ${inputBg} border ${inputBorder} rounded-lg py-3 px-4 ${textColor} focus:outline-none focus:border-[#FFB84E] transition-colors`}
              />
            </div>
          </div>
        </div>

        {/* Refresh Rate */}
        <div className={`${cardBg} rounded-2xl p-5 border ${borderColor}`}>
          <div className="flex items-center space-x-3 mb-5">
            <Radio className="w-6 h-6 text-[#FFB84E]" />
            <h3 className={`${textColor} font-semibold`}>Refresh Rate</h3>
          </div>

          <div>
            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
              Frequency (Hz)
            </label>
            <input
              type="number"
              value={refreshRate}
              onChange={(e) => setRefreshRate(e.target.value)}
              className={`w-full ${inputBg} border ${inputBorder} rounded-lg py-3 px-4 ${textColor} focus:outline-none focus:border-[#FFB84E] transition-colors`}
            />
            <p className="text-gray-500 text-xs mt-2">
              Data polling frequency in Hertz
            </p>
          </div>
        </div>

        {/* Notifications */}
        <div className={`${cardBg} rounded-2xl p-5 border ${borderColor}`}>
          <div className="flex items-center space-x-3 mb-5">
            <Bell className="w-6 h-6 text-[#FFB84E]" />
            <h3 className={`${textColor} font-semibold`}>Notifications</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`${textColor} font-medium`}>Enable Notifications</p>
                <p className={`${textSecondary} text-sm`}>Receive alerts for events</p>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  notificationsEnabled ? 'bg-[#FFB84E]' : isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    notificationsEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {notificationsEnabled && (
              <div className={`flex items-center justify-between pt-2 border-t ${borderColor}`}>
                <div>
                  <p className={`${textColor} font-medium`}>Silent Mode</p>
                  <p className={`${textSecondary} text-sm`}>No sound or vibration</p>
                </div>
                <button
                  onClick={() => setSilentMode(!silentMode)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    silentMode ? 'bg-[#FFB84E]' : isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      silentMode ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full bg-[#FFB84E] text-[#262525] font-semibold py-4 rounded-xl hover:bg-[#ffa31a] transition-colors flex items-center justify-center space-x-2"
        >
          <Save className="w-5 h-5" />
          <span>Save Settings</span>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500/10 text-red-500 font-semibold py-4 rounded-xl border border-red-500/30 hover:bg-red-500/20 transition-colors flex items-center justify-center space-x-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Disconnect</span>
        </button>
      </div>
    </div>
  );
}