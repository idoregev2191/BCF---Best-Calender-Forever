import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MeetEvent, ChatMessage } from '../types';
import { Sparkles, Send, X, Bot, User as UserIcon } from 'lucide-react';

interface AIModalProps {
  schedule: MeetEvent[];
  onClose: () => void;
}

const AIModal: React.FC<AIModalProps> = ({ schedule, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hey! I'm your scheduling assistant. What's on your mind?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = process.env.API_KEY || ''; 
      
      const ai = new GoogleGenAI({ apiKey });
      
      const today = new Date().toISOString().split('T')[0];
      const context = `
        Current Date: ${today}.
        User's Schedule (JSON): ${JSON.stringify(schedule.map(e => ({ title: e.title, time: `${e.startTime}-${e.endTime}`, date: e.date, type: e.type, location: e.platform })))}.
        
        You are a smart, concise, and helpful AI assistant for a student at 'MEET'.
        IMPORTANT FORMATTING RULES:
        1. Use **bold** for times, locations, and key event names.
        2. Keep responses short (under 50 words unless asked for a summary).
        3. Be casual but professional.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: [
            { role: 'user', parts: [{ text: context }] },
            ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
            { role: 'user', parts: [{ text: userMsg.text }] }
        ]
      });

      const text = response.text || "I couldn't think of a response. Try again!";
      setMessages(prev => [...prev, { role: 'model', text }]);

    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting right now." }]);
    }
    setIsLoading(false);
  };

  // Helper to render bold text from markdown style **text**
  const renderMessageText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-black text-slate-800">{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="fixed bottom-32 right-6 z-[60] w-full max-w-xs sm:max-w-sm animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="bg-white/95 backdrop-blur-2xl border border-white/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] rounded-[32px] overflow-hidden flex flex-col h-[450px]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white/50">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                <Sparkles size={14} />
             </div>
             <div>
                <h3 className="font-bold text-slate-900 text-sm leading-none">AI Assistant</h3>
                <p className="text-[10px] font-medium text-slate-500 mt-0.5">Powered by Gemini</p>
             </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"><X size={16} /></button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/50" ref={scrollRef}>
           {messages.map((m, i) => (
             <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
               <div className={`p-3 rounded-2xl text-xs font-medium max-w-[85%] leading-relaxed ${m.role === 'user' ? 'bg-slate-900 text-white rounded-tr-sm' : 'bg-white shadow-sm border border-slate-100 text-slate-700 rounded-tl-sm'}`}>
                 {renderMessageText(m.text)}
               </div>
             </div>
           ))}
           {isLoading && (
              <div className="flex gap-1.5 items-center text-slate-400 ml-4">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
              </div>
           )}
        </div>

        {/* Input */}
        <div className="p-3 bg-white border-t border-slate-100">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative">
            <input 
              className="w-full bg-slate-50 rounded-full pl-5 pr-12 py-3.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all border border-slate-200"
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button type="submit" className="absolute right-2 top-1.5 p-2 bg-slate-900 text-white rounded-full hover:bg-indigo-600 transition-colors shadow-lg">
              <Send size={12} strokeWidth={2.5} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default AIModal;