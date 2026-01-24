import React from 'react';
import { Calendar, CheckSquare } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setView: (view: 'calendar' | 'assignments') => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[50]">
      <div className="bg-white/95 backdrop-blur-xl p-1.5 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-white/50 flex items-center gap-1 ring-1 ring-slate-900/5">
        
        <button
          onClick={() => setView('calendar')}
          className={`relative px-6 py-3 rounded-full transition-all duration-300 flex items-center gap-2 tap-active ${
            currentView === 'calendar' 
              ? 'text-white' 
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
          }`}
        >
          {currentView === 'calendar' && (
            <div className="absolute inset-0 bg-slate-900 rounded-full shadow-lg animate-in zoom-in-95 duration-200"></div>
          )}
          <span className="relative z-10 flex items-center gap-2 font-bold text-xs tracking-wide">
            <Calendar size={18} strokeWidth={2.5} />
            <span className={currentView === 'calendar' ? 'block' : 'hidden'}>Calendar</span>
          </span>
        </button>

        <button
          onClick={() => setView('assignments')}
          className={`relative px-6 py-3 rounded-full transition-all duration-300 flex items-center gap-2 tap-active ${
            currentView === 'assignments' 
              ? 'text-white' 
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
          }`}
        >
          {currentView === 'assignments' && (
            <div className="absolute inset-0 bg-slate-900 rounded-full shadow-lg animate-in zoom-in-95 duration-200"></div>
          )}
           <span className="relative z-10 flex items-center gap-2 font-bold text-xs tracking-wide">
            <CheckSquare size={18} strokeWidth={2.5} />
            <span className={currentView === 'assignments' ? 'block' : 'hidden'}>Tasks</span>
          </span>
        </button>

      </div>
    </div>
  );
};

export default Navbar;