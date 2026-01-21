import React, { useState } from 'react';
import { MeetEvent } from '../types';
import { X, Clock, MapPin, Video, AlignLeft, CheckSquare, MessageSquare, ArrowUpRight, Star, CheckCircle2, Circle } from 'lucide-react';

interface EventModalProps {
  event: MeetEvent;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [checkedReminders, setCheckedReminders] = useState<string[]>([]);

  const handleFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSent(true);
  };

  const toggleReminder = (rem: string) => {
    if (checkedReminders.includes(rem)) {
      setCheckedReminders(prev => prev.filter(r => r !== rem));
    } else {
      setCheckedReminders(prev => [...prev, rem]);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[85vh] flex flex-col border border-white">
        
        {/* Header with Hero Color */}
        <div className={`px-8 py-8 flex justify-between items-start bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50`}>
          <div>
             <span className="inline-block px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest bg-slate-900 text-white mb-3 shadow-md">
               {event.type}
             </span>
             <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">{event.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="bg-white/50 p-3 rounded-full hover:bg-white transition-colors shadow-sm text-slate-500 hover:text-slate-900"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-white px-5 py-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                <Clock size={20} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time</p>
                <p className="text-base font-bold text-slate-800">{event.startTime} - {event.endTime}</p>
              </div>
            </div>
            {(event.meetLink || event.platform) && (
              <div className="flex items-center gap-3 bg-white px-5 py-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                   {event.meetLink ? <Video size={20} strokeWidth={2.5} /> : <MapPin size={20} strokeWidth={2.5} />}
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</p>
                   {event.meetLink ? (
                    <a href={event.meetLink} target="_blank" rel="noreferrer" className="text-base font-bold text-blue-600 underline">Join Session</a>
                  ) : (
                     <p className="text-base font-bold text-slate-800">{event.platform}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Reminders / Checklist Section (Improved) */}
          {event.reminders && event.reminders.length > 0 && (
             <div className="bg-yellow-50/60 p-6 rounded-3xl border border-yellow-100">
                <h3 className="text-xs font-black text-yellow-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <CheckSquare size={16} /> Action Items
                </h3>
                <ul className="space-y-3">
                  {event.reminders.map((rem, i) => {
                    const isChecked = checkedReminders.includes(rem);
                    return (
                      <li 
                        key={i} 
                        className={`flex items-center gap-3 bg-white/60 p-3 rounded-xl cursor-pointer transition-all hover:bg-white ${isChecked ? 'opacity-50' : ''}`}
                        onClick={() => toggleReminder(rem)}
                      >
                        {isChecked ? (
                          <CheckCircle2 size={24} className="text-yellow-500 fill-yellow-100" />
                        ) : (
                          <Circle size={24} className="text-yellow-400" />
                        )}
                        <span className={`text-sm font-bold text-slate-700 ${isChecked ? 'line-through' : ''}`}>{rem}</span>
                      </li>
                    );
                  })}
                </ul>
             </div>
          )}

          {/* Microfeedback */}
          {event.type !== 'personal' && (
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
               <div className="flex items-center gap-2 mb-4">
                 <div className="p-1.5 bg-slate-200 rounded-lg">
                    <MessageSquare size={16} className="text-slate-600" />
                 </div>
                 <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Feedback</h3>
               </div>
               
               {!feedbackSent ? (
                 <form onSubmit={handleFeedback}>
                   <p className="text-sm font-bold text-slate-800 mb-4">How was this session?</p>
                   <div className="flex gap-2 mb-5 justify-between sm:justify-start">
                     {[1, 2, 3, 4, 5].map((s) => (
                       <button key={s} type="button" className="w-10 h-10 rounded-xl bg-white border-2 border-slate-200 text-slate-300 hover:border-yellow-400 hover:text-yellow-400 transition-all flex items-center justify-center shadow-sm">
                         <Star size={20} fill="currentColor" strokeWidth={3} />
                       </button>
                     ))}
                   </div>
                   <button type="submit" className="w-full py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-slate-900/20">
                     Submit Feedback
                   </button>
                 </form>
               ) : (
                 <div className="text-center py-4 bg-green-50 rounded-xl border border-green-100">
                   <p className="text-green-700 font-bold text-sm">Thank you for your feedback!</p>
                 </div>
               )}
            </div>
          )}

          {/* Description */}
          {event.notes && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlignLeft size={16} className="text-slate-400" />
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">About</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-medium bg-white p-5 rounded-2xl border border-slate-100 shadow-sm whitespace-pre-wrap">
                {event.notes}
              </p>
            </div>
          )}

          {/* Assignments */}
          {event.assignments && event.assignments.length > 0 && (
            <div>
               <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-red-100 rounded-lg">
                   <CheckSquare size={16} className="text-red-600" />
                </div>
                <h3 className="text-xs font-black text-red-600 uppercase tracking-widest">Homework</h3>
              </div>
              <div className="space-y-4">
                {event.assignments.map(assign => (
                  <div key={assign.assignmentId} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-900 text-sm">{assign.title}</h4>
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100">Due {assign.dueDate}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">{assign.description}</p>
                    {assign.submissionLink && (
                      <a href={assign.submissionLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 w-full justify-center bg-slate-50 text-slate-900 py-3 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors border border-slate-200">
                        Open Classroom <ArrowUpRight size={14} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default EventModal;