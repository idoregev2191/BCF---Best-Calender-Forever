import React, { useState } from 'react';
import { MeetEvent, Assignment } from '../types';
import { X, Clock, Video, CheckCircle2, MessageSquare, ArrowUpRight, MapPin } from 'lucide-react';

interface EventModalProps {
  event: MeetEvent;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  const [showMicrofeedback, setShowMicrofeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setShowMicrofeedback(false);
      setFeedbackSubmitted(false);
    }, 2500);
  };

  const isLecture = event.type === 'lecture';
  const typeColor = isLecture ? 'bg-blue-600' : 'bg-slate-800';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header Color Strip */}
        <div className={`h-3 w-full ${typeColor}`}></div>

        {/* Content */}
        <div className="p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-500 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>

          <div className="pr-10 mb-6">
            <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white mb-3 ${typeColor}`}>
              {event.type}
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">{event.title}</h2>
          </div>

          <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
            
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Clock size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Time</span>
                </div>
                <p className="text-slate-900 font-bold text-sm">{event.startTime} - {event.endTime}</p>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                 <div className="flex items-center gap-2 text-slate-400 mb-1">
                  {event.meetLink ? <Video size={16} /> : <MapPin size={16} />}
                  <span className="text-[10px] font-bold uppercase tracking-wider">Location</span>
                </div>
                 {event.meetLink ? (
                   <a href={event.meetLink} target="_blank" rel="noreferrer" className="text-blue-600 font-bold text-sm hover:underline truncate block">
                     Join Online
                   </a>
                 ) : (
                   <p className="text-slate-900 font-bold text-sm">In Person</p>
                 )}
              </div>
            </div>

            {/* Notes */}
            {event.notes && (
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                <h3 className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-2">Notes</h3>
                <p className="text-slate-800 text-sm">{event.notes}</p>
              </div>
            )}

            {/* Checklist */}
            {event.reminders && event.reminders.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">To Do</h3>
                <div className="space-y-2">
                  {event.reminders.map((reminder, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center mt-0.5"></div>
                      <span className="text-sm text-slate-700 font-medium">{reminder}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assignments */}
            {event.assignments && event.assignments.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Assignments</h3>
                <div className="space-y-3">
                  {event.assignments.map((assignment: Assignment) => (
                    <div key={assignment.assignmentId} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-slate-900 text-sm">{assignment.title}</h4>
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                          DUE {new Date(assignment.dueDate).toLocaleDateString(undefined, {month: 'numeric', day: 'numeric'})}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">{assignment.description}</p>
                      {assignment.submissionLink && (
                         <a href={assignment.submissionLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
                           Submit <ArrowUpRight size={12} />
                         </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Microfeedback */}
            <div className="pt-2">
               {!showMicrofeedback && !feedbackSubmitted && event.type !== 'personal' && (
                <button 
                  onClick={() => setShowMicrofeedback(true)}
                  className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <MessageSquare size={16} />
                  Session Feedback
                </button>
              )}

              {showMicrofeedback && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in fade-in zoom-in-95">
                  <h3 className="font-bold text-slate-900 mb-3 text-sm">How was the pace?</h3>
                  <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {['Too Slow', 'Perfect', 'Too Fast'].map((opt) => (
                        <label key={opt} className="cursor-pointer">
                          <input type="radio" name="pace" className="peer sr-only" required />
                          <div className="text-center text-[10px] font-bold py-2.5 rounded-lg bg-white border border-slate-200 text-slate-500 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 transition-all">
                            {opt}
                          </div>
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-2">
                       <button 
                        type="button" 
                        onClick={() => setShowMicrofeedback(false)}
                        className="flex-1 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="flex-[2] py-2 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {feedbackSubmitted && (
                 <div className="bg-green-50 text-green-700 p-3 rounded-xl text-center text-sm font-bold flex items-center justify-center gap-2 border border-green-100">
                   <CheckCircle2 size={18} />
                   Feedback sent
                 </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;