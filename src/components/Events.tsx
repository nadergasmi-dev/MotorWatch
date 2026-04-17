import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Thermometer, Waves, Filter } from 'lucide-react';

type EventType = 'all' | 'temperature' | 'vibration';
type AlertLevel = 'WARN' | 'ALARM';

interface Event {
  id: string;
  type: 'temperature' | 'vibration';
  level: AlertLevel;
  value: number;
  timestamp: Date;
  message: string;
}

export default function Events() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<EventType>('all');

  // Mock events data
  const allEvents: Event[] = [
    {
      id: '1',
      type: 'temperature',
      level: 'ALARM',
      value: 87.2,
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      message: 'Critical temperature threshold exceeded'
    },
    {
      id: '2',
      type: 'vibration',
      level: 'WARN',
      value: 3.8,
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      message: 'Elevated vibration detected'
    },
    {
      id: '3',
      type: 'temperature',
      level: 'WARN',
      value: 76.5,
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      message: 'Temperature above warning threshold'
    },
    {
      id: '4',
      type: 'vibration',
      level: 'ALARM',
      value: 4.7,
      timestamp: new Date(Date.now() - 1000 * 60 * 180),
      message: 'Critical vibration level detected'
    },
    {
      id: '5',
      type: 'temperature',
      level: 'WARN',
      value: 77.1,
      timestamp: new Date(Date.now() - 1000 * 60 * 240),
      message: 'Temperature warning'
    },
    {
      id: '6',
      type: 'vibration',
      level: 'WARN',
      value: 3.6,
      timestamp: new Date(Date.now() - 1000 * 60 * 300),
      message: 'Vibration warning'
    }
  ];

  const filteredEvents = allEvents.filter(event => {
    if (filter === 'all') return true;
    return event.type === filter;
  });

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)} hours ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

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
          <h1 className="text-white font-bold text-lg">Events & Alerts</h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Filter Buttons */}
        <div className="bg-[#1a1a1a] rounded-xl p-2 border border-gray-800 flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              filter === 'all'
                ? 'bg-[#FFB84E] text-[#262525]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('temperature')}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center space-x-2 ${
              filter === 'temperature'
                ? 'bg-[#FFB84E] text-[#262525]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Thermometer className="w-4 h-4" />
            <span>Temp</span>
          </button>
          <button
            onClick={() => setFilter('vibration')}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center space-x-2 ${
              filter === 'vibration'
                ? 'bg-[#FFB84E] text-[#262525]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Waves className="w-4 h-4" />
            <span>Vibration</span>
          </button>
        </div>

        {/* Events List */}
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className={`bg-[#1a1a1a] rounded-xl p-4 border ${
                event.level === 'ALARM' ? 'border-red-500/50' : 'border-[#FFB84E]/50'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${
                  event.level === 'ALARM' ? 'bg-red-500/20' : 'bg-[#FFB84E]/20'
                }`}>
                  {event.type === 'temperature' ? (
                    <Thermometer className={`w-5 h-5 ${
                      event.level === 'ALARM' ? 'text-red-500' : 'text-[#FFB84E]'
                    }`} />
                  ) : (
                    <Waves className={`w-5 h-5 ${
                      event.level === 'ALARM' ? 'text-red-500' : 'text-[#FFB84E]'
                    }`} />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      event.level === 'ALARM'
                        ? 'bg-red-500/20 text-red-500'
                        : 'bg-[#FFB84E]/20 text-[#FFB84E]'
                    }`}>
                      {event.level}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                  <p className="text-white font-medium mb-1">{event.message}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-400">
                      Value: <span className="text-white font-medium">
                        {event.value}{event.type === 'temperature' ? '°C' : ''}
                      </span>
                    </span>
                    <span className="text-gray-400 capitalize">{event.type}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No events found</p>
          </div>
        )}
      </div>
    </div>
  );
}
