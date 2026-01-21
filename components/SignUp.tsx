import React, { useState } from 'react';
import { UserState } from '../types';
import { User, Layers, ArrowRight } from 'lucide-react';

interface SignUpProps {
  onComplete: (user: UserState) => void;
}

const SignUp: React.FC<SignUpProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState<UserState>({
    name: '',
    cohort: '2025',
    group: 'GroupA',
    avatar: 'https://picsum.photos/200/200'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] p-6">
      <div className="w-full max-w-sm">
        
        {/* Header Branding */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/50 backdrop-blur-xl rounded-[32px] shadow-2xl mb-6 border border-white/60 animate-in zoom-in-50 duration-700">
            <span className="text-4xl">📅</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">
            BCF
          </h1>
          <p className="text-xl font-bold text-blue-600 uppercase tracking-widest">
            Best Calendar Forever
          </p>
          <p className="text-slate-500 font-medium mt-4 text-sm leading-relaxed">
            The ultimate personalized scheduler <br/> for MEET students.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 animate-in slide-in-from-bottom-4 duration-500 delay-150">
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Student Name</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                required
                type="text"
                placeholder="Enter your name"
                className="block w-full pl-14 pr-4 py-4 bg-white/80 border border-white rounded-3xl text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-bold shadow-lg shadow-slate-200/20"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Cohort</label>
              <div className="relative">
                <select
                  className="block w-full py-4 px-6 bg-white/80 border border-white rounded-3xl text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all shadow-lg shadow-slate-200/20 appearance-none"
                  value={formData.cohort}
                  onChange={e => setFormData({ ...formData, cohort: e.target.value })}
                >
                  <option value="2025">2025 (Y3)</option>
                  <option value="2026">2026 (Y2)</option>
                  <option value="2027">2027 (Y1)</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-slate-400">
                   <Layers size={18} />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Group</label>
              <div className="relative">
                <select
                  className="block w-full py-4 px-6 bg-white/80 border border-white rounded-3xl text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all shadow-lg shadow-slate-200/20 appearance-none"
                  value={formData.group}
                  onChange={e => setFormData({ ...formData, group: e.target.value })}
                >
                  <option value="GroupA">Group A</option>
                  <option value="GroupB">Group B</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-slate-400">
                   <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-5 rounded-3xl shadow-xl shadow-slate-900/20 hover:shadow-blue-600/30 transform active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 text-lg"
            >
              Start Planning
              <ArrowRight size={22} strokeWidth={3} />
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default SignUp;