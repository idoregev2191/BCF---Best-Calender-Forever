import React from 'react';
import { UserState, AssignmentStatus, MeetEvent, Assignment, UserProgress } from '../types';
import { getAllAssignments } from '../services/pythonLogicShim';
import { Check, ArrowUpRight, AlertCircle } from 'lucide-react';

interface AssignmentsViewProps {
  user: UserState;
  schedule: MeetEvent[];
  generalAssignments: Assignment[];
  taskStatus: UserProgress;
  onStatusChange: (id: string, status: AssignmentStatus) => void;
}

const AssignmentsView: React.FC<AssignmentsViewProps> = ({ 
  user, 
  schedule, 
  generalAssignments, 
  taskStatus, 
  onStatusChange 
}) => {
  const allTasks = getAllAssignments(schedule, generalAssignments);
  
  // Sort tasks
  const sortedTasks = [...allTasks].sort((a, b) => {
    const statusOrder = { 'not done': 0, 'on progress': 1, 'done': 2 };
    const statusA = taskStatus[a.assignment.assignmentId] || 'not done';
    const statusB = taskStatus[b.assignment.assignmentId] || 'not done';
    
    if (statusOrder[statusA] !== statusOrder[statusB]) {
      return statusOrder[statusA] - statusOrder[statusB];
    }
    return new Date(a.assignment.dueDate).getTime() - new Date(b.assignment.dueDate).getTime();
  });

  const toggleNextStatus = (id: string, current: AssignmentStatus) => {
    if (current === 'not done') onStatusChange(id, 'on progress');
    else if (current === 'on progress') onStatusChange(id, 'done');
    else onStatusChange(id, 'not done');
  };

  const doneCount = allTasks.filter(t => taskStatus[t.assignment.assignmentId] === 'done').length;
  const progressPercentage = allTasks.length > 0 ? Math.round((doneCount / allTasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-32">
      {/* Dashboard Header */}
      <div className="bg-white sticky top-0 z-30 pt-12 pb-6 px-6 border-b border-slate-200/60 shadow-sm">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Assignments</h2>
        
        {/* Progress Card */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-900/10 relative overflow-hidden">
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600 rounded-full blur-[60px] opacity-40 -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-600 rounded-full blur-[50px] opacity-30 -ml-10 -mb-10"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-4">
              <div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Cohort Progress</span>
                <div className="text-3xl font-bold mt-1">{doneCount} <span className="text-lg text-slate-500 font-medium">/ {allTasks.length}</span></div>
              </div>
              <div className="text-right">
                 <span className="block text-3xl font-bold text-blue-400">{progressPercentage}%</span>
              </div>
            </div>
            
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-red-500 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pt-6 space-y-4">
        {allTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 mt-4">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-500">
              <Check size={30} strokeWidth={3} />
            </div>
            <p className="text-slate-900 font-bold">All Caught Up!</p>
            <p className="text-slate-500 text-sm mt-1">No pending assignments</p>
          </div>
        ) : (
          sortedTasks.map(({ assignment, sourceEvent }) => {
            const currentStatus = taskStatus[assignment.assignmentId] || 'not done';
            const isDone = currentStatus === 'done';
            const isProgress = currentStatus === 'on progress';
            
            return (
              <div 
                key={assignment.assignmentId} 
                className={`group bg-white rounded-2xl p-5 border transition-all duration-300 ${
                  isDone 
                    ? 'border-slate-100 opacity-60 hover:opacity-100' 
                    : 'border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200'
                }`}
              >
                <div className="flex gap-4 items-start">
                  
                  {/* Status Toggle */}
                  <button 
                    onClick={() => toggleNextStatus(assignment.assignmentId, currentStatus)}
                    className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 mt-1 ${
                      isDone 
                        ? 'bg-blue-600 border-blue-600 text-white scale-100' 
                        : isProgress 
                           ? 'border-blue-400 bg-blue-50' 
                           : 'border-slate-300 hover:border-blue-400'
                    }`}
                  >
                    {isDone && <Check size={14} strokeWidth={4} />}
                    {isProgress && <div className="w-2.5 h-2.5 rounded bg-blue-400"></div>}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[150px]">
                        {sourceEvent}
                      </span>
                      {isProgress && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">IN PROGRESS</span>}
                    </div>
                    
                    <h3 className={`text-base font-bold text-slate-900 mt-1 leading-snug transition-all ${isDone ? 'line-through text-slate-400' : ''}`}>
                      {assignment.title}
                    </h3>
                    
                    <p className={`text-sm text-slate-500 mt-1 line-clamp-2 ${isDone ? 'hidden' : 'block'}`}>
                      {assignment.description}
                    </p>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                      <div className={`flex items-center gap-1.5 text-xs font-bold ${isDone ? 'text-slate-400' : 'text-red-600'}`}>
                        <AlertCircle size={14} />
                        <span>Due {new Date(assignment.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                      
                      {assignment.submissionLink && !isDone && (
                        <a 
                          href={assignment.submissionLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                        >
                          Submit <ArrowUpRight size={14} />
                        </a>
                      )}
                    </div>
                  </div>
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