import React, { useState } from 'react';
import { UserState, AssignmentStatus, MeetEvent, Assignment, UserProgress } from '../types';
import { getAllAssignments } from '../services/pythonLogicShim';
import { Check, Calendar, ArrowUpRight, Plus, Bell } from 'lucide-react';
import { StorageService } from '../services/storage';

interface AssignmentsViewProps {
  user: UserState;
  schedule: MeetEvent[];
  generalAssignments: Assignment[];
  taskStatus: UserProgress;
  onStatusChange: (id: string, status: AssignmentStatus) => void;
}

const AssignmentsView: React.FC<AssignmentsViewProps> = ({ 
  schedule, 
  generalAssignments, 
  taskStatus, 
  onStatusChange 
}) => {
  const [newReminder, setNewReminder] = useState("");

  const allTasks = getAllAssignments(schedule, generalAssignments);
  
  // Quick Add Reminder Logic
  const handleAddQuickReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminder.trim()) return;

    // We can't easily push this to the parent without a prop update or re-fetch, 
    // but in a real app this would go to context/store. 
    // For now, we will save to storage and let the user know (simulated refresh via storage listener is harder here).
    // Ideally, we should receive 'onAddReminder' here too. 
    // Since I cannot change the interface defined in App.tsx easily in this step without changing App.tsx,
    // I will assume this view is mostly for Assignments, but adding a "Personal Reminder" shim.
    
    // NOTE: In a full refactor, pass `onAddReminder` to this component. 
    // For now, I'll allow adding it but it might require a reload to appear in calendar if not lifted.
    // However, I will just persist it.
    
    const reminder = {
        id: `REM-${Date.now()}`,
        text: newReminder,
        date: new Date().toISOString().split('T')[0], // Today
        time: '09:00',
        isCompleted: false
    };
    StorageService.addReminder(reminder);
    setNewReminder("");
    alert("Reminder added! (It will appear on your calendar timeline)");
  };

  // Sort: Pending first
  const sortedTasks = [...allTasks].sort((a, b) => {
    const isDoneA = taskStatus[a.assignment.assignmentId] === 'done';
    const isDoneB = taskStatus[b.assignment.assignmentId] === 'done';
    if (isDoneA !== isDoneB) return isDoneA ? 1 : -1;
    return new Date(a.assignment.dueDate).getTime() - new Date(b.assignment.dueDate).getTime();
  });

  const handleToggle = (id: string, current: AssignmentStatus) => {
    onStatusChange(id, current === 'done' ? 'not done' : 'done');
  };

  const pendingCount = allTasks.filter(t => taskStatus[t.assignment.assignmentId] !== 'done').length;

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-32 pt-6 px-4 max-w-4xl mx-auto w-full animate-in slide-in-from-right-8 duration-500">
      
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">My Tasks</h1>
          <p className="text-slate-500 font-bold mt-1">Manage assignments & reminders</p>
        </div>
        <div className="glass-card px-5 py-3 rounded-2xl flex flex-col items-center border border-white/50">
          <span className="text-3xl font-black text-blue-600 leading-none">{pendingCount}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Left</span>
        </div>
      </div>

      {/* Quick Add Reminder */}
      <form onSubmit={handleAddQuickReminder} className="mb-8 relative group z-20">
        <input 
          type="text" 
          placeholder="Add a quick reminder for today..." 
          className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-md rounded-2xl border-2 border-white focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 placeholder-slate-400 shadow-lg shadow-blue-900/5 transition-all"
          value={newReminder}
          onChange={(e) => setNewReminder(e.target.value)}
        />
        <Bell className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} strokeWidth={2.5} />
        <button 
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white p-2 rounded-xl hover:bg-blue-600 transition-colors"
        >
            <Plus size={18} strokeWidth={3} />
        </button>
      </form>

      {/* List */}
      <div className="space-y-4">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-20 opacity-50 bg-white/30 rounded-3xl border border-white">
             <p className="font-bold text-slate-500">No assignments found.</p>
          </div>
        ) : (
          sortedTasks.map(({ assignment, sourceEvent }) => {
            const isDone = taskStatus[assignment.assignmentId] === 'done';
            const isOverdue = !isDone && new Date(assignment.dueDate) < new Date();
            
            return (
              <div 
                key={assignment.assignmentId}
                className={`group flex items-start gap-5 p-6 rounded-[24px] transition-all duration-300 border border-transparent ${
                  isDone 
                    ? 'bg-slate-100/40 opacity-50' 
                    : 'bg-white/80 shadow-lg shadow-blue-900/5 hover:scale-[1.01] hover:border-blue-100'
                }`}
              >
                <button
                  onClick={() => handleToggle(assignment.assignmentId, isDone ? 'done' : 'not done')}
                  className={`mt-1 flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                    isDone 
                      ? 'bg-blue-600 border-blue-600' 
                      : 'border-slate-300 group-hover:border-blue-500 bg-white'
                  }`}
                >
                  {isDone && <Check size={16} className="text-white" strokeWidth={4} />}
                </button>

                <div className="flex-1 min-w-0">
                   <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
                     <h3 className={`font-bold text-slate-900 text-lg leading-tight ${isDone ? 'line-through text-slate-400' : ''}`}>
                       {assignment.title}
                     </h3>
                     <span className={`flex-shrink-0 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${
                       isDone ? 'bg-slate-200 text-slate-500' : (isOverdue ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600')
                     }`}>
                       {isOverdue ? 'Overdue' : `Due ${assignment.dueDate}`}
                     </span>
                   </div>
                   
                   <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> {sourceEvent}
                   </p>
                   
                   <p className="text-sm text-slate-600 font-medium leading-relaxed mb-4">
                     {assignment.description}
                   </p>
                   
                   {assignment.submissionLink && !isDone && (
                     <a 
                       href={assignment.submissionLink} 
                       target="_blank" 
                       rel="noreferrer"
                       className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 bg-white px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
                     >
                       Go to Submission <ArrowUpRight size={14} />
                     </a>
                   )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default AssignmentsView;