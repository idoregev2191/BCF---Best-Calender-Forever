import React, { useState } from 'react';
import { MeetEvent } from '../types';
import { X, Clock, MapPin, Video, AlignLeft, CheckSquare, MessageSquare, ArrowUpRight, CheckCircle2, Circle } from 'lucide-react';

interface EventModalProps {
  event: MeetEvent;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [checkedReminders, setCheckedReminders] = useState<string[]>([]);
  
  // Specific Feedback State
  const [fbForm, setFbForm] = useState({
      nationality: '',
      gender: '',
      enjoyment: 0,
      difficulty: 0,
      zone: '',
      help: '',
      prideProject: '',
      prideCS: '',
      comments: ''
  });

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

  const isBreak = event.type === 'break';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-3xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[85vh] flex flex-col border border-white">
        
        {/* Header */}
        <div className={`px-8 py-6 flex justify-between items-start bg-gradient-to-r from-slate-50 to-white border-b border-slate-100`}>
          <div>
             <span className="inline-block px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest bg-slate-900 text-white mb-2">
               {event.type}
             </span>
             <h2 className="text-2xl font-black text-slate-900 leading-tight">{event.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
          
          {/* Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
              <Clock size={18} className="text-slate-400" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Time</p>
                <p className="text-sm font-bold text-slate-800">{event.startTime} - {event.endTime}</p>
              </div>
            </div>
            {!isBreak && (event.meetLink || event.platform) && (
              <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
                {event.meetLink ? <Video size={18} className="text-slate-400" /> : <MapPin size={18} className="text-slate-400" />}
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Location</p>
                   {event.meetLink ? (
                    <a href={event.meetLink} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 underline truncate block max-w-[150px]">Link</a>
                  ) : (
                     <p className="text-sm font-bold text-slate-800">{event.platform}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {event.notes && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlignLeft size={16} className="text-slate-400" />
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Details</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-medium bg-white p-4 rounded-2xl border border-slate-100 whitespace-pre-wrap">
                {event.notes}
              </p>
            </div>
          )}

          {/* Detailed Microfeedback Form */}
          {!isBreak && event.type !== 'personal' && (
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
               <div className="flex items-center gap-2 mb-6">
                 <MessageSquare size={16} className="text-slate-600" />
                 <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Microfeedback</h3>
               </div>
               
               {!feedbackSent ? (
                 <form onSubmit={handleFeedback} className="space-y-6">
                   
                   {/* Nationality */}
                   <div>
                     <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Nationality *</label>
                     <div className="flex gap-4">
                       {['Israeli', 'Palestinian'].map(opt => (
                         <label key={opt} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                           <input type="radio" name="nationality" value={opt} onChange={e => setFbForm({...fbForm, nationality: e.target.value})} className="accent-blue-600" /> {opt}
                         </label>
                       ))}
                     </div>
                   </div>

                   {/* Gender */}
                   <div>
                     <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Gender *</label>
                     <div className="flex gap-4 flex-wrap">
                       {['Male', 'Female', 'Other'].map(opt => (
                         <label key={opt} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                           <input type="radio" name="gender" value={opt} onChange={e => setFbForm({...fbForm, gender: e.target.value})} className="accent-blue-600" /> {opt}
                         </label>
                       ))}
                     </div>
                   </div>

                   {/* Enjoyment */}
                   <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">How enjoyable was today's session? *</label>
                      <div className="flex justify-between bg-white p-2 rounded-xl border border-slate-200">
                         {[1,2,3,4,5].map(n => (
                           <button key={n} type="button" onClick={() => setFbForm({...fbForm, enjoyment: n})} className={`w-8 h-8 rounded-lg font-bold text-sm transition-all ${fbForm.enjoyment === n ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-400'}`}>{n}</button>
                         ))}
                      </div>
                   </div>

                   {/* Difficulty */}
                   <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">How difficult was today's session? *</label>
                      <div className="flex justify-between bg-white p-2 rounded-xl border border-slate-200">
                         {[1,2,3,4,5].map(n => (
                           <button key={n} type="button" onClick={() => setFbForm({...fbForm, difficulty: n})} className={`w-8 h-8 rounded-lg font-bold text-sm transition-all ${fbForm.difficulty === n ? 'bg-red-500 text-white' : 'hover:bg-slate-100 text-slate-400'}`}>{n}</button>
                         ))}
                      </div>
                   </div>

                   {/* Zone */}
                   <div>
                     <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Which zone are you in? *</label>
                     <select className="w-full p-2 rounded-xl border border-slate-200 text-sm font-medium bg-white" onChange={e => setFbForm({...fbForm, zone: e.target.value})}>
                       <option value="">Select Zone</option>
                       <option value="Comfort">Comfort Zone</option>
                       <option value="Learning">Learning Zone</option>
                       <option value="Panic">Panic Zone</option>
                     </select>
                   </div>

                   {/* Pride */}
                   <div>
                     <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">How proud are you in your Group Project? *</label>
                     <select className="w-full p-2 rounded-xl border border-slate-200 text-sm font-medium bg-white" onChange={e => setFbForm({...fbForm, prideProject: e.target.value})}>
                        <option value="">Select</option>
                        <option>Very Proud</option>
                        <option>Proud</option>
                        <option>Neutral</option>
                        <option>Not Proud</option>
                        <option>Not Proud at all</option>
                     </select>
                   </div>

                   {/* Comments */}
                   <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Other comments / Suggestions? *</label>
                      <textarea 
                        className="w-full p-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                        rows={3}
                        onChange={e => setFbForm({...fbForm, comments: e.target.value})}
                      ></textarea>
                   </div>

                   <button type="submit" className="w-full py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-slate-900/20">
                     Submit Feedback
                   </button>
                 </form>
               ) : (
                 <div className="text-center py-6 bg-green-50 rounded-xl border border-green-100">
                   <CheckCircle2 size={32} className="text-green-600 mx-auto mb-2" />
                   <p className="text-green-800 font-bold text-sm">Thanks! Your feedback helps us improve.</p>
                 </div>
               )}
            </div>
          )}

          {/* Assignments */}
          {event.assignments && event.assignments.length > 0 && (
            <div>
               <div className="flex items-center gap-2 mb-4">
                <CheckSquare size={16} className="text-red-600" />
                <h3 className="text-xs font-black text-red-600 uppercase tracking-widest">Homework</h3>
              </div>
              <div className="space-y-4">
                {event.assignments.map(assign => (
                  <div key={assign.assignmentId} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-900 text-sm">{assign.title}</h4>
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">Due {assign.dueDate}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">{assign.description}</p>
                    {assign.submissionLink && (
                      <a href={assign.submissionLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-slate-50 text-slate-900 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors border border-slate-200">
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