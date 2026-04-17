import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type TimeRange = '1h' | '12h' | '1d';

export default function History() {
  const navigate = useNavigate();
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1h');

  const generateData = (range: TimeRange) => {
    const points = range === '1h' ? 12 : range === '12h' ? 24 : 48;
    const now = new Date();
    const data = [];

    for (let i = points; i >= 0; i--) {
      let time = new Date(now);
      if (range === '1h') {
        time.setMinutes(now.getMinutes() - i * 5);
      } else if (range === '12h') {
        time.setMinutes(now.getMinutes() - i * 30);
      } else {
        time.setHours(now.getHours() - i);
      }

      const temp = 68 + Math.random() * 12 + Math.sin(i * 0.5) * 5;
      const vibration = 2.5 + Math.random() * 1.5 + Math.sin(i * 0.3) * 0.8;

      data.push({
        time: time.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        temperature: parseFloat(temp.toFixed(1)),
        vibration: parseFloat(vibration.toFixed(1)),
        id: `${range}-${i}` // Add unique ID
      });
    }

    return data;
  };

  const data = useMemo(() => generateData(selectedRange), [selectedRange]);

  return (
    <div className="min-h-screen bg-[#262525]">
      {/* Header */}
      <div className="bg-[#1a1a1a] px-6 py-4 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white font-bold text-lg">History</h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Time Range Selector */}
        <div className="flex space-x-3">
          {(['1h', '12h', '1d'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
                selectedRange === range
                  ? 'bg-[#FFB84E] text-[#262525]'
                  : 'bg-[#1a1a1a] text-gray-400 border border-gray-800 hover:border-[#FFB84E]'
              }`}
            >
              {range === '1h' ? '1 Hour' : range === '12h' ? '12 Hours' : '1 Day'}
            </button>
          ))}
        </div>

        {/* Temperature Chart */}
        <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-gray-800">
          <h3 className="text-white font-semibold mb-4">Temperature (°C)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="time" 
                stroke="#666" 
                tick={{ fill: '#999', fontSize: 12 }}
                interval={selectedRange === '1h' ? 2 : selectedRange === '12h' ? 4 : 8}
              />
              <YAxis 
                stroke="#666" 
                tick={{ fill: '#999', fontSize: 12 }}
                domain={[60, 90]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #FFB84E',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#FFB84E"
                strokeWidth={2}
                dot={false}
                name="Temp (°C)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Vibration Chart */}
        <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-gray-800">
          <h3 className="text-white font-semibold mb-4">Vibration Index</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="time" 
                stroke="#666" 
                tick={{ fill: '#999', fontSize: 12 }}
                interval={selectedRange === '1h' ? 2 : selectedRange === '12h' ? 4 : 8}
              />
              <YAxis 
                stroke="#666" 
                tick={{ fill: '#999', fontSize: 12 }}
                domain={[0, 6]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #FFB84E',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Line
                type="monotone"
                dataKey="vibration"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                name="Vibration"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
          <h4 className="text-gray-400 text-sm mb-3">Thresholds</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Temp WARN</span>
              <span className="text-[#FFB84E] font-medium">75°C</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Temp ALARM</span>
              <span className="text-red-500 font-medium">85°C</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Vibration WARN</span>
              <span className="text-[#FFB84E] font-medium">3.5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Vibration ALARM</span>
              <span className="text-red-500 font-medium">4.5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}