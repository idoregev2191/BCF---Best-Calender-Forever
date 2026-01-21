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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(37,99,235,0.3)] mb-6 border border-slate-100">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-red-600 rounded-xl"></div>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Welcome to <span className="text-blue-600">MEET</span>
          </h1>
          <p className="text-slate-500 font-medium mt-3">
            Plan, Track, Succeed.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 animate-in slide-in-from-bottom-4 duration-500">
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                required
                type="text"
                placeholder="Student Name"
                className="block w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold shadow-sm"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Cohort</label>
              <div className="relative">
                <select
                  className="block w-full py-4 px-4 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm appearance-none"
                  value={formData.cohort}
                  onChange={e => setFormData({ ...formData, cohort: e.target.value })}
                >
                  <option value="2025">2025 (Y3)</option>
                  <option value="2026">2026 (Y2)</option>
                  <option value="2027">2027 (Y1)</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                   <Layers size={16} />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Group</label>
              <div className="relative">
                <select
                  className="block w-full py-4 px-4 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm appearance-none"
                  value={formData.group}
                  onChange={e => setFormData({ ...formData, group: e.target.value })}
                >
                  <option value="GroupA">Group A</option>
                  <option value="GroupB">Group B</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                   <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-slate-900/10 hover:shadow-blue-600/20 transform active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
            >
              Get Started
              <ArrowRight size={20} strokeWidth={2.5} />
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default SignUp;