import React, { useState } from 'react';
import { X, Check, Plus, Trash2, Calendar, Bell } from 'lucide-react';
import { MeetEvent, StandaloneReminder } from '../types';

interface AddEventModalProps {
  onClose: () => void;
  onAdd: (event: MeetEvent) => void;
  onAddReminder: (reminder: StandaloneReminder) => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ onClose, onAdd, onAddReminder }) => {
  const [activeTab, setActiveTab] = useState<'event' | 'reminder'>('event');

  // Event Form State
  const [eventForm, setEventForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    notes: '',
    platform: 'Personal'
  });

  // Reminder Form State
  const [reminderForm, setReminderForm] = useState({
    text: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00'
  });

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      eventId: `USER-${Date.now()}`,
      title: eventForm.title || 'Untitled Event',
      type: 'personal',
      date: eventForm.date,
      startTime: eventForm.startTime,
      endTime: eventForm.endTime,
      notes: eventForm.notes,
      platform: eventForm.platform,
    });
  };

  const handleReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddReminder({
      id: `REM-${Date.now()}`,
      text: reminderForm.text,
      date: reminderForm.date,
      time: reminderForm.time,
      isCompleted: false
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      <div className="relative w-full md:max-w-lg bg-white md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col">
        
        {/* Tab Switcher */}
        <div className="px-6 pt-6 pb-2 bg-white">
          <div className="flex p-1 bg-slate-100 rounded-xl">
             <button 
               onClick={() => setActiveTab('event')}
               className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'event' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
             >
               <Calendar size={16} /> Event
             </button>
             <button 
               onClick={() => setActiveTab('reminder')}
               className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'reminder' ? 'bg-white shadow-sm text-red-500' : 'text-slate-400'}`}
             >
               <Bell size={16} /> Reminder
             </button>
          </div>
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
            <X size={18} className="text-slate-600" />
          </button>
        </div>

        {activeTab === 'event' ? (
           <form onSubmit={handleEventSubmit} className="p-6 space-y-5">
             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Title</label>
                <input
                  autoFocus
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="e.g. Study Group"
                  value={eventForm.title}
                  onChange={e => setEventForm({...eventForm, title: e.target.value})}
                />
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Date</label>
                   <input
                     type="date"
                     required
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                     value={eventForm.date}
                     onChange={e => setEventForm({...eventForm, date: e.target.value})}
                   />
                </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Location</label>
                   <select 
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                     value={eventForm.platform}
                     onChange={e => setEventForm({...eventForm, platform: e.target.value})}
                   >
                     <option>Personal</option>
                     <option>Turtle Room</option>
                     <option>Unicorn Room</option>
                     <option>Target Room</option>
                   </select>
                </div>
             </div>

             <div className="flex gap-4">
                <div className="flex-1">
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Start</label>
                   <input
                     type="time"
                     required
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-center"
                     value={eventForm.startTime}
                     onChange={e => setEventForm({...eventForm, startTime: e.target.value})}
                   />
                </div>
                <div className="flex-1">
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">End</label>
                   <input
                     type="time"
                     required
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-center"
                     value={eventForm.endTime}
                     onChange={e => setEventForm({...eventForm, endTime: e.target.value})}
                   />
                </div>
             </div>

             <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all mt-4">
               Add Event
             </button>
           </form>
        ) : (
           <form onSubmit={handleReminderSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Reminder</label>
                <input
                  autoFocus
                  required
                  className="w-full bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 placeholder:text-red-300"
                  placeholder="e.g. Take meds"
                  value={reminderForm.text}
                  onChange={e => setReminderForm({...reminderForm, text: e.target.value})}
                />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Date</label>
                   <input
                     type="date"
                     required
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20"
                     value={reminderForm.date}
                     onChange={e => setReminderForm({...reminderForm, date: e.target.value})}
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Time</label>
                   <input
                     type="time"
                     required
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 text-center"
                     value={reminderForm.time}
                     onChange={e => setReminderForm({...reminderForm, time: e.target.value})}
                   />
                </div>
             </div>

             <button type="submit" className="w-full bg-red-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all mt-4">
               Set Reminder
             </button>
           </form>
        )}
      </div>
    </div>
  );
};

export default AddEventModal;