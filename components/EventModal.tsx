import React, { useState, useEffect } from 'react';
import { MeetEvent } from '../types';
import { X, Clock, MapPin, Video, AlignLeft, CheckSquare, Trash2, CalendarDays, FileText, CheckCircle2, Edit2, Save } from 'lucide-react';
import MicrofeedbackForm from './MicrofeedbackForm';
import { StorageService } from '../services/storage';

interface EventModalProps {
  event: MeetEvent;
  onClose: () => void;
  onDelete: (eventId: string) => void;
  onUpdate?: (event: MeetEvent) => void; // Optional for now
}

const EventModal: React.FC<EventModalProps> = ({ event, onClose, onDelete, onUpdate }) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [hasFeedback, setHasFeedback] = useState(false);
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(event);

  useEffect(() => {
    const feedback = StorageService.getMicrofeedback(event.eventId);
    if (feedback) setHasFeedback(true);
  }, [event.eventId]);

  const isGoogle = !!event.googleEventId;
  const isClassSession = ['lecture', 'workshop', 'lab'].includes(event.type);

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this event?")) {
      onDelete(event.eventId);
      onClose();
    }
  };

  const handleSaveEdit = () => {
      // Save changes (requires parent to handle or direct storage call)
      if (onUpdate) {
          onUpdate(editForm);
      } else {
          StorageService.updateEvent(editForm);
          // Force reload logic would be needed here in a real app, 
          // but relying on parent refresh or window reload for now
      }
      setIsEditing(false);
      onClose(); // Close to refresh view via parent
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" 
          onClick={onClose}
        />

        <div className="relative w-full max-w-lg bg-white/90 backdrop-blur-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/50 flex flex-col max-h-[80vh]">
          
          {/* Header */}
          <div className="px-8 py-6 relative overflow-hidden">
             <div className={`absolute inset-0 opacity-10 ${editForm.color ? '' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`} style={{ backgroundColor: editForm.color }}></div>
             <div className="relative z-10 flex justify-between items-start">
                <div className="flex-1 mr-4">
                  <span className="inline-block px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-slate-900/10 text-slate-700 mb-2 border border-slate-900/5">
                    {editForm.type}
                  </span>
                  {isEditing ? (
                      <input 
                        className="w-full text-3xl font-black text-slate-900 bg-white/50 border-b border-slate-900/20 focus:outline-none"
                        value={editForm.title}
                        onChange={e => setEditForm({...editForm, title: e.target.value})}
                      />
                  ) : (
                      <h2 className="text-3xl font-black text-slate-900 leading-tight">{editForm.title}</h2>
                  )}
                </div>
                <div className="flex gap-2">
                    {!isGoogle && !isEditing && (
                        <button onClick={() => setIsEditing(true)} className="bg-white/50 p-2 rounded-full hover:bg-white transition-colors">
                            <Edit2 size={20} />
                        </button>
                    )}
                    {isEditing && (
                        <button onClick={handleSaveEdit} className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors shadow-lg">
                            <Save size={20} />
                        </button>
                    )}
                    <button onClick={onClose} className="bg-white/50 p-2 rounded-full hover:bg-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
             </div>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/60 p-4 rounded-2xl border border-white shadow-sm flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                     <Clock size={12} /> Time
                  </div>
                  {isEditing ? (
                      <div className="flex gap-1">
                          <input type="time" className="w-full bg-transparent font-bold text-slate-800 border-b border-slate-300" value={editForm.startTime} onChange={e => setEditForm({...editForm, startTime: e.target.value})} />
                          <span className="font-bold">-</span>
                          <input type="time" className="w-full bg-transparent font-bold text-slate-800 border-b border-slate-300" value={editForm.endTime} onChange={e => setEditForm({...editForm, endTime: e.target.value})} />
                      </div>
                  ) : (
                      <div className="font-bold text-slate-800">{editForm.startTime} - {editForm.endTime}</div>
                  )}
               </div>
               <div className="bg-white/60 p-4 rounded-2xl border border-white shadow-sm flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                     {editForm.meetLink ? <Video size={12} /> : <MapPin size={12} />} Location
                  </div>
                  {isEditing ? (
                      <input className="w-full bg-transparent font-bold text-slate-800 border-b border-slate-300" value={editForm.platform || ''} onChange={e => setEditForm({...editForm, platform: e.target.value})} />
                  ) : (
                    <div className="font-bold text-slate-800 truncate">
                        {editForm.meetLink ? (
                        <a href={editForm.meetLink} target="_blank" className="text-blue-600 hover:underline">Join Call</a>
                        ) : (editForm.platform || "N/A")}
                    </div>
                  )}
               </div>
            </div>

            {/* Microfeedback CTA */}
            {isClassSession && !isEditing && (
               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center ${hasFeedback ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                        {hasFeedback ? <CheckCircle2 size={20} /> : <FileText size={20} />}
                     </div>
                     <div>
                        <h4 className="font-bold text-slate-900 text-sm">{hasFeedback ? 'Feedback Submitted' : 'Session Feedback'}</h4>
                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">{hasFeedback ? 'Thank you!' : 'Required for this session'}</p>
                     </div>
                  </div>
                  {!hasFeedback && (
                     <button 
                       onClick={() => setShowFeedback(true)}
                       className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors shadow-lg"
                     >
                       Fill Form
                     </button>
                  )}
               </div>
            )}

            {editForm.notes || isEditing ? (
               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold uppercase">
                     <AlignLeft size={12} /> Notes
                  </div>
                  {isEditing ? (
                      <textarea 
                        className="w-full bg-transparent font-medium text-slate-600 border-b border-slate-300 h-20"
                        value={editForm.notes || ''} 
                        onChange={e => setEditForm({...editForm, notes: e.target.value})}
                      />
                  ) : (
                      <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{editForm.notes}</p>
                  )}
               </div>
            ) : null}

            {isGoogle && (
               <div className="flex items-center gap-2 text-xs font-bold text-slate-400 justify-center">
                  <CalendarDays size={14} /> Synced from Google Calendar
               </div>
            )}
          </div>

          {/* Footer Actions */}
          {!isGoogle && !isEditing && (
             <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
               <button 
                 onClick={handleDelete}
                 className="flex items-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 px-4 py-3 rounded-xl font-bold text-sm transition-colors"
               >
                 <Trash2 size={16} /> Delete Event
               </button>
             </div>
          )}
        </div>
      </div>

      {showFeedback && (
        <MicrofeedbackForm 
           eventId={event.eventId} 
           onClose={() => setShowFeedback(false)} 
           onSubmit={(data) => {
              StorageService.saveMicrofeedback(data);
              setHasFeedback(true);
              setShowFeedback(false);
           }} 
        />
      )}
    </>
  );
};

export default EventModal;