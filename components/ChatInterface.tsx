import React, { useState, useEffect, useRef } from 'react';
import { AnalysisReport, UserProfile } from '../types';
import { createPersonaChat, generateSpeech, playPcmAudio } from '../services/geminiService';
import { Chat } from "@google/genai";

interface Props {
  analysis: AnalysisReport;
  user: UserProfile;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const ChatInterface: React.FC<Props> = ({ analysis, user, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx({ sampleRate: 24000 });
    setAudioContext(ctx);

    const session = createPersonaChat(analysis, user.name);
    setChatSession(session);
    // Initial greeting
    const initialMsg = `سلام ${user.name}. من "خودِ مجازی" تو هستم. با توجه به شناختی که ازت پیدا کردم، آماده‌ام باهات صحبت کنم. چی تو ذهنت میگذره؟`;
    setMessages([{ role: 'model', text: initialMsg }]);

    // Play initial greeting audio if desired (optional)
    // playAudioForText(initialMsg, ctx); 

    return () => {
        ctx.close();
    };
  }, [analysis, user.name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await chatSession.sendMessage({ message: userMsg });
      const modelText = response.text || "متوجه نشدم، لطفا دوباره بگو.";
      
      setMessages(prev => [...prev, { role: 'model', text: modelText }]);
      
      // Auto-read response for immersive experience
      if (audioContext) {
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }
        const audioBase64 = await generateSpeech(modelText);
        if (audioBase64) {
            await playPcmAudio(audioBase64, audioContext);
        }
      }

    } catch (error) {
      console.error("Chat Error", error);
      setMessages(prev => [...prev, { role: 'model', text: "ارتباط با سرور قطع شد." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 flex flex-col h-[80vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800 rounded-t-2xl">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-gray-900 font-bold">
                 🤖
             </div>
             <div>
                 <h3 className="font-bold text-white">خودِ مجازی {user.name}</h3>
                 <span className="text-xs text-green-400">آنلاین</span>
             </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2">
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl ${
                        msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-gray-700 text-gray-200 rounded-bl-none'
                    }`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-end">
                    <div className="bg-gray-700 p-3 rounded-2xl rounded-bl-none animate-pulse">
                        ...
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-700 bg-gray-800 rounded-b-2xl">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="پیام خود را بنویسید..."
                    className="flex-1 bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-accent focus:outline-none"
                />
                <button 
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="bg-accent hover:bg-blue-400 text-gray-900 font-bold px-6 py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                    ارسال
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};