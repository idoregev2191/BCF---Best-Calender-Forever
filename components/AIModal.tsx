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
    { role: 'model', text: "Hey! I'm here to help with your schedule. Ask me anything!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const generateAIResponse = async (apiKey: string, userMsg: ChatMessage) => {
    // Initializing with the provided key string as requested for fallback logic
    const ai = new GoogleGenAI({ apiKey });
    const today = new Date().toISOString().split('T')[0];
    
    // Simplify the schedule for the AI to save tokens but give full context
    const simpleSchedule = schedule.map(e => `${e.date} (${e.startTime}-${e.endTime}): ${e.title} at ${e.platform || 'Location TBD'}`).join('\n');

    const context = `
      You are a super helpful, friendly, and cool AI assistant for a student at a summer program called MEET. 
      Current Date: ${today}.
      
      Here is the student's FULL schedule:
      ${simpleSchedule}
      
      Your Goal: Help them manage their time, find out when their next break is, or what class they have next week.
      Tone: Friendly, casual, nice, but very helpful. Not robotic.
      
      Formatting:
      - Use **bold** for key info like times or room names.
      - Keep it relatively short.
    `;

    return await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: [
          { role: 'user', parts: [{ text: context }] },
          ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: userMsg.text }] }
      ]
    });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Primary and Fallback Keys provided by user
    const primaryKey = 'AIzaSyD_uhbrnWWM70MzLJ_0BATtNS9Vt1XybVg';
    const fallbackKey = 'AIzaSyBStQ21-WRhkO85637FvqHEeGmNwJJih1s';

    try {
      try {
        // Attempt 1: Primary Key
        const response = await generateAIResponse(primaryKey, userMsg);
        const text = response.text || "I couldn't think of a response. Try again!";
        setMessages(prev => [...prev, { role: 'model', text }]);
      } catch (primaryError) {
        console.warn("Primary API key failed, trying fallback...", primaryError);
        // Attempt 2: Fallback Key
        const response = await generateAIResponse(fallbackKey, userMsg);
        const text = response.text || "I couldn't think of a response. Try again!";
        setMessages(prev => [...prev, { role: 'model', text }]);
      }
    } catch (e: any) {
      console.error("AI Error (Final):", e);
      let errorMessage = "I'm having trouble connecting right now.";

      // Improved Error Handling
      if (e.toString().includes('403') || e.toString().includes('KEY_INVALID')) {
          errorMessage = "It looks like both API keys are currently unavailable.";
      } else if (e.toString().includes('429') || e.toString().includes('RESOURCE_EXHAUSTED')) {
          errorMessage = "I'm a bit overwhelmed right now (Rate Limit). Please try again in a moment.";
      } else if (e.toString().includes('500') || e.toString().includes('503')) {
          errorMessage = "My brain is having a temporary glitch (Server Error). Please try again later.";
      }

      setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
    }
    setIsLoading(false);
  };

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
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-white shadow-lg">
                <Sparkles size={14} />
             </div>
             <div>
                <h3 className="font-bold text-slate-900 text-sm leading-none">Schedule Pal</h3>
                <p className="text-[10px] font-medium text-slate-500 mt-0.5">Always here to help</p>
             </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"><X size={16} /></button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/30" ref={scrollRef}>
           {messages.map((m, i) => (
             <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
               <div className={`p-3 rounded-2xl text-xs font-medium max-w-[85%] leading-relaxed ${m.role === 'user' ? 'bg-slate-900 text-white rounded-tr-sm shadow-md' : 'bg-white shadow-sm border border-slate-100 text-slate-700 rounded-tl-sm'}`}>
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