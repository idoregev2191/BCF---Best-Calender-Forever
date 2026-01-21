import React from 'react';
import { Calendar, CheckSquare } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setView: (view: 'calendar' | 'assignments') => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
      <div className="bg-white/90 backdrop-blur-xl p-1.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 flex items-center gap-1">
        
        <button
          onClick={() => setView('calendar')}
          className={`relative px-6 py-3 rounded-full transition-all duration-300 flex items-center gap-2 tap-active ${
            currentView === 'calendar' 
              ? 'text-white' 
              : 'text-slate-400 hover:bg-slate-50'
          }`}
        >
          {currentView === 'calendar' && (
            <div className="absolute inset-0 bg-blue-600 rounded-full shadow-md animate-in zoom-in-90 duration-200"></div>
          )}
          <span className="relative z-10 flex items-center gap-2 font-semibold">
            <Calendar size={20} strokeWidth={2.5} />
            <span className={`${currentView === 'calendar' ? 'block' : 'hidden'} text-sm`}>Calendar</span>
          </span>
        </button>

        <button
          onClick={() => setView('assignments')}
          className={`relative px-6 py-3 rounded-full transition-all duration-300 flex items-center gap-2 tap-active ${
            currentView === 'assignments' 
              ? 'text-white' 
              : 'text-slate-400 hover:bg-slate-50'
          }`}
        >
          {currentView === 'assignments' && (
            <div className="absolute inset-0 bg-blue-600 rounded-full shadow-md animate-in zoom-in-90 duration-200"></div>
          )}
           <span className="relative z-10 flex items-center gap-2 font-semibold">
            <CheckSquare size={20} strokeWidth={2.5} />
            <span className={`${currentView === 'assignments' ? 'block' : 'hidden'} text-sm`}>Tasks</span>
          </span>
        </button>

      </div>
    </div>
  );
};

export default Navbar;