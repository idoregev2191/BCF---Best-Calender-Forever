import React, { useState } from 'react';
import { UserState } from '../types';
import { Layers, ArrowRight, Zap } from 'lucide-react';

interface SignUpProps {
  onComplete: (user: UserState) => void;
}

const SignUp: React.FC<SignUpProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    cohort: '2025',
    group: 'GroupD',
    avatar: 'https://picsum.photos/200/200'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-white/60 backdrop-blur-2xl border border-white/80 p-10 rounded-[48px] shadow-2xl animate-in fade-in zoom-in-95 duration-700 relative z-10">
        
        {/* NEW LOGO BRANDING */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative w-24 h-24 mb-6 group">
             {/* Logo Icon */}
             <div className="absolute inset-0 bg-slate-900 rounded-[28px] rotate-3 group-hover:rotate-6 transition-transform duration-500"></div>
             <div className="absolute inset-0 bg-white border-2 border-slate-100 rounded-[28px] -rotate-3 group-hover:-rotate-6 transition-transform duration-500 flex items-center justify-center shadow-lg">
                <div className="w-12 h-12 flex flex-wrap gap-1 items-center justify-center">
                   <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
                   <div className="w-5 h-5 bg-amber-400 rounded-tr-xl rounded-bl-xl"></div>
                   <div className="w-5 h-5 bg-pink-500 rounded-tl-xl rounded-br-xl"></div>
                   <div className="w-5 h-5 bg-slate-900 rounded-full"></div>
                </div>
             </div>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-1">
            bcf<span className="text-blue-600">.</span>
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
            Plan Like a Pro
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <input
              required
              type="text"
              placeholder="Your Name"
              className="block w-full px-6 py-5 bg-white/80 border border-transparent focus:border-blue-500/50 rounded-3xl text-slate-900 text-lg font-bold placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all shadow-sm text-center"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <select
                className="block w-full py-4 px-4 bg-white/80 border border-transparent rounded-3xl text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all shadow-sm appearance-none text-center"
                value={formData.cohort}
                onChange={e => setFormData({ ...formData, cohort: e.target.value })}
              >
                <option value="2025">Y3 (2025)</option>
                <option value="2026">Y2 (2026)</option>
                <option value="2027">Y1 (2027)</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                 <Layers size={14} />
              </div>
            </div>

            <div className="relative">
              <select
                className="block w-full py-4 px-4 bg-white/80 border border-transparent rounded-3xl text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all shadow-sm appearance-none text-center"
                value={formData.group}
                onChange={e => setFormData({ ...formData, group: e.target.value })}
              >
                <option value="GroupA">Group A</option>
                <option value="GroupB">Group B</option>
                <option value="GroupC">Group C</option>
                <option value="GroupD">Group D</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                 <Zap size={14} />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="group w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-5 rounded-3xl shadow-2xl shadow-slate-900/20 hover:shadow-blue-600/30 transform active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 text-lg"
            >
              Let's Go
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default SignUp;