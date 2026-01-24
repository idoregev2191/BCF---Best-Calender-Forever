import React from 'react';
import { GoogleCalendarInfo } from '../types';
import { X, Check } from 'lucide-react';

interface CalendarSelectorProps {
  calendars: GoogleCalendarInfo[];
  onToggle: (id: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const CalendarSelector: React.FC<CalendarSelectorProps> = ({ calendars, onToggle, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-slate-900">Sync Calendars</h3>
          <button onClick={onCancel} className="p-2 bg-slate-100 rounded-full"><X size={16}/></button>
        </div>
        
        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar mb-6">
          {calendars.map(cal => (
            <div 
              key={cal.id}
              onClick={() => onToggle(cal.id)}
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${cal.selected ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-blue-100'}`}
            >
              <div className="flex items-center gap-3">
                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cal.backgroundColor || '#3b82f6' }}></div>
                 <span className="font-bold text-sm text-slate-700 truncate max-w-[180px]">{cal.summary}</span>
              </div>
              {cal.selected && <div className="bg-blue-500 text-white p-1 rounded-full"><Check size={12} strokeWidth={4} /></div>}
            </div>
          ))}
        </div>

        <button 
          onClick={onConfirm}
          className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-colors"
        >
          Confirm Sync
        </button>
      </div>
    </div>
  );
};

export default CalendarSelector;