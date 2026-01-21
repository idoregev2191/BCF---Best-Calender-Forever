import React, { useState } from 'react';
import { X, Check, Plus, Trash2 } from 'lucide-react';
import { MeetEvent } from '../types';

interface AddEventModalProps {
  onClose: () => void;
  onAdd: (event: MeetEvent) => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    notes: '',
    platform: 'Personal'
  });

  // Reminder State
  const [currentReminder, setCurrentReminder] = useState('');
  const [reminders, setReminders] = useState<string[]>([]);

  const addReminder = () => {
    if (currentReminder.trim()) {
      setReminders([...reminders, currentReminder.trim()]);
      setCurrentReminder('');
    }
  };

  const removeReminder = (index: number) => {
    setReminders(reminders.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEvent: MeetEvent = {
      eventId: `USER-${Date.now()}`,
      title: formData.title || 'Untitled Event',
      type: 'personal',
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      notes: formData.notes,
      platform: formData.platform,
      reminders: reminders.length > 0 ? reminders : undefined
    };

    onAdd(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      <div className="relative w-full md:max-w-2xl bg-white md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
          <h2 className="text-xl font-extrabold text-slate-900">Add New Event</h2>
          <button onClick={onClose} className="p-2 bg-slate-200 rounded-full hover:bg-slate-300 transition-colors">
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1 tracking-wider">Event Title</label>
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g. Mentor Meeting"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1 tracking-wider">Date</label>
                  <input
                    type="date"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1 tracking-wider">Location</label>
                   <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={formData.platform}
                      onChange={e => setFormData({...formData, platform: e.target.value})}
                   >
                     <option value="Personal">Personal</option>
                     <option value="Google Meet">Google Meet</option>
                     <option value="Zoom">Zoom</option>
                     <option value="In Person">In Person</option>
                   </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1 tracking-wider">Time Duration</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="time"
                    required
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-center"
                    value={formData.startTime}
                    onChange={e => setFormData({...formData, startTime: e.target.value})}
                  />
                  <span className="text-slate-400 font-bold">-</span>
                  <input
                    type="time"
                    required
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-center"
                    value={formData.endTime}
                    onChange={e => setFormData({...formData, endTime: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Reminders Section */}
              <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
                <label className="block text-xs font-bold text-blue-500 uppercase mb-2 ml-1 tracking-wider">Reminders</label>
                
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Add a task..."
                    className="flex-1 bg-white border border-blue-100 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={currentReminder}
                    onChange={e => setCurrentReminder(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addReminder())}
                  />
                  <button 
                    type="button" 
                    onClick={addReminder}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                  {reminders.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-2">No reminders yet</p>
                  ) : (
                    reminders.map((r, i) => (
                      <div key={i} className="flex justify-between items-center bg-white p-2 rounded-lg border border-blue-100 shadow-sm animate-in zoom-in duration-200">
                        <span className="text-xs font-semibold text-slate-700 truncate">{r}</span>
                        <button type="button" onClick={() => removeReminder(i)} className="text-red-400 hover:text-red-600 p-1">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                 <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1 tracking-wider">Notes</label>
                 <textarea
                   placeholder="Details about this event..."
                   rows={4}
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none font-medium"
                   value={formData.notes}
                   onChange={e => setFormData({...formData, notes: e.target.value})}
                 />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/10 transition-all flex items-center justify-center gap-2 text-lg active:scale-[0.98] duration-200"
            >
              <Check size={22} strokeWidth={3} />
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;