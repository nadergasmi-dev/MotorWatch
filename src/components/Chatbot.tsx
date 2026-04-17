import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotProps {
  currentTemp?: number;
  currentVibration?: number;
  failureProbability?: number;
  healthStatus?: string;
  machineType?: string;
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
console.log('KEY:', import.meta.env.VITE_GROQ_API_KEY);
const SYSTEM_PROMPT = `You are MotorWatch AI Assistant, an expert in industrial motor maintenance and predictive maintenance systems. 
You help technicians understand sensor data, alerts, and maintenance recommendations.
Be concise, technical, and helpful. Answer in the same language the user writes in (French or English).
When given sensor data, analyze it and provide actionable insights.`;

export default function Chatbot({ 
  currentTemp = 0, 
  currentVibration = 0, 
  failureProbability = 0,
  healthStatus = 'NORMAL',
  machineType = 'Unknown'
}: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I'm MotorWatch AI 🤖\n\nI can help you analyze your machine data and answer maintenance questions. How can I help you today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Add context about current sensor data to the message
    const contextualMessage = `[Current machine data: Machine=${machineType}, Temp=${currentTemp}°C, Vibration=${currentVibration}mm/s, Failure Probability=${failureProbability}%, Status=${healthStatus}]\n\nUser question: ${userMessage}`;

    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...newMessages.slice(0, -1).map(m => ({
              role: m.role,
              content: m.content
            })),
            { role: 'user', content: contextualMessage }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'API error');
      }

      const reply = data.choices[0].message.content;
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('Groq API error:', err);
      setMessages([...newMessages, {
        role: 'assistant',
        content: '⚠️ Error connecting to AI. Please check your GROQ API key in environment variables.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "Why is temperature high?",
    "What does vibration indicate?",
    "When to do maintenance?",
  ];

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#FFB84E] rounded-full flex items-center justify-center shadow-lg hover:bg-[#ffa31a] transition-all duration-200 z-50 hover:scale-110"
        >
          <MessageCircle className="w-6 h-6 text-[#262525]" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-[500px] bg-[#1a1a1a] rounded-2xl border border-gray-700 flex flex-col shadow-2xl z-50 overflow-hidden">
          
          {/* Header */}
          <div className="bg-[#0f0f0f] px-4 py-3 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#FFB84E] rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-[#262525]" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">MotorWatch AI</p>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-green-400 text-xs">Online</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start space-x-2 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                  msg.role === 'assistant' ? 'bg-[#FFB84E]' : 'bg-gray-600'
                }`}>
                  {msg.role === 'assistant' 
                    ? <Bot className="w-3 h-3 text-[#262525]" />
                    : <User className="w-3 h-3 text-white" />
                  }
                </div>

                {/* Bubble */}
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'assistant'
                    ? 'bg-[#262525] text-gray-200 border border-gray-700'
                    : 'bg-[#FFB84E] text-[#262525] font-medium'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 rounded-full bg-[#FFB84E] flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-3 h-3 text-[#262525]" />
                </div>
                <div className="bg-[#262525] border border-gray-700 px-3 py-2 rounded-xl">
                  <Loader className="w-4 h-4 text-[#FFB84E] animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(q); }}
                  className="text-xs bg-[#262525] text-[#FFB84E] border border-[#FFB84E]/30 px-2 py-1 rounded-full hover:bg-[#FFB84E]/10 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-700">
            <div className="flex items-center space-x-2 bg-[#262525] border border-gray-600 rounded-xl px-3 py-2 focus-within:border-[#FFB84E] transition-colors">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your machine..."
                className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 outline-none"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="w-7 h-7 bg-[#FFB84E] rounded-lg flex items-center justify-center disabled:opacity-40 hover:bg-[#ffa31a] transition-colors flex-shrink-0"
              >
                <Send className="w-3 h-3 text-[#262525]" />
              </button>
            </div>
            <p className="text-gray-600 text-xs text-center mt-1">Powered by Groq • Llama 3.3</p>
          </div>
        </div>
      )}
    </>
  );
}
