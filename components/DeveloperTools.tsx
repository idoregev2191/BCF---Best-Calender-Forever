import React, { useState } from 'react';
import { Trash2, RefreshCw, X, Database } from 'lucide-react';
import { StorageService } from '../services/storage';

interface DeveloperToolsProps {
  onReset: () => void;
}

const DeveloperTools: React.FC<DeveloperToolsProps> = ({ onReset }) => {
  const [isOpen, setIsOpen] = useState(false);

  const clearAllData = () => {
    if(confirm("Are you sure? This deletes all local events, reminders, and user settings.")) {
        localStorage.clear();
        window.location.reload();
    }
  };

  const clearEvents = () => {
      localStorage.removeItem('bcf_custom_events');
      localStorage.removeItem('bcf_reminders');
      onReset();
      alert("Custom events cleared.");
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-10 h-10 bg-slate-800 text-slate-400 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-700 transition-all font-mono text-xs"
        >
          DEV
        </button>
      ) : (
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl w-64 animate-in slide-in-from-bottom-5">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-xs uppercase tracking-widest flex items-center gap-2">
               <Database size={14}/> Dev Tools
             </h3>
             <button onClick={() => setIsOpen(false)}><X size={16} /></button>
          </div>
          
          <div className="space-y-2">
             <button onClick={clearEvents} className="w-full flex items-center gap-3 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold transition-colors">
               <RefreshCw size={14} /> Clear Custom Events
             </button>
             <button onClick={clearAllData} className="w-full flex items-center gap-3 p-2 rounded-lg bg-red-900/50 hover:bg-red-900 text-red-200 text-xs font-bold transition-colors">
               <Trash2 size={14} /> Factory Reset App
             </button>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-700 text-[10px] text-slate-500 text-center">
            Build: v1.2.0 (Glass)
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperTools;