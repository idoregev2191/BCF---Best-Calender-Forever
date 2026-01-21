import React, { useState, useEffect, useRef } from 'react';
import { UserState, MeetEvent, StandaloneReminder } from '../types';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Check, MoreHorizontal, RefreshCw } from 'lucide-react';
import EventModal from './EventModal';
import AddEventModal from './AddEventModal';
import { GoogleCalendarService } from '../services/googleCalendar';

interface CalendarViewProps {
  user: UserState;
  schedule: MeetEvent[];
  reminders: StandaloneReminder[];
  onAddEvent: (event: MeetEvent) => void;
  onAddReminder: (reminder: StandaloneReminder) => void;
  onToggleReminder: (id: string) => void;
}

type ViewMode = 'day' | 'month';

const CalendarView: React.FC<CalendarViewProps> = ({ 
  user, 
  schedule, 
  reminders,
  onAddEvent, 
  onAddReminder,
  onToggleReminder
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [currentDate, setCurrentDate] = useState(new Date()); // Start at Today
  const [selectedEvent, setSelectedEvent] = useState<MeetEvent | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Initialize Google Service silently
  useEffect(() => {
    GoogleCalendarService.initialize().catch(() => {});
  }, []);

  // --- Navigation Logic ---
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') newDate.setDate(currentDate.getDate() - 1);
    else newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') newDate.setDate(currentDate.getDate() + 1);
    else newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => setCurrentDate(new Date());

  const handleGoogleSync = async () => {
    setIsSyncing(true);
    try {
      const auth = await GoogleCalendarService.authenticate();
      if(auth) {
        const events = await GoogleCalendarService.fetchEvents();
        events.forEach(onAddEvent);
      }
    } catch(e) { console.error(e); }
    setTimeout(() => setIsSyncing(false), 1000);
  };

  const formattedTitle = viewMode === 'day' 
    ? currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // --- Day View Helpers ---
  const START_HOUR = 7;
  const END_HOUR = 24;
  const TOTAL_HOURS = END_HOUR - START_HOUR;
  const timeSlots = Array.from({ length: TOTAL_HOURS }, (_, i) => i + START_HOUR);
  
  // Calculate overlaps for visual offset
  const calculateEventLayout = (events: MeetEvent[]) => {
    const layoutEvents = events.map(e => ({...e, width: 100, left: 0}));
    
    // Simple overlap detection (Naive)
    for (let i = 0; i < layoutEvents.length; i++) {
        for (let j = i + 1; j < layoutEvents.length; j++) {
            const e1 = layoutEvents[i];
            const e2 = layoutEvents[j];
            
            // Check if times overlap
            if ((e1.startTime < e2.endTime) && (e1.endTime > e2.startTime)) {
                // Overlap found
                e1.width = 50;
                e2.width = 45;
                e2.left = 52;
            }
        }
    }
    return layoutEvents;
  };

  const getPositionStyle = (startTime: string, endTime: string) => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const startTotal = (startH * 60) + startM;
    const endTotal = (endH * 60) + endM;
    const dayStart = START_HOUR * 60;
    const totalDayMinutes = TOTAL_HOURS * 60;

    const top = ((startTotal - dayStart) / totalDayMinutes) * 100;
    const height = ((endTotal - startTotal) / totalDayMinutes) * 100;

    return { top: `${top}%`, height: `${height}%` };
  };

  const getReminderTop = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const total = (h * 60) + m;
    const dayStart = START_HOUR * 60;
    return ((total - dayStart) / (TOTAL_HOURS * 60)) * 100;
  };

  // Filter events for current day
  const dateKey = currentDate.toISOString().split('T')[0];
  const daysEvents = schedule.filter(e => e.date === dateKey);
  const layoutEvents = calculateEventLayout(daysEvents);
  const daysReminders = reminders.filter(r => r.date === dateKey);

  // --- Month View Helpers ---
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const { days: daysInMonth, firstDay: startDayOffset } = getDaysInMonth(currentDate);
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: startDayOffset }, (_, i) => i);

  return (
    <div className="flex flex-col h-full overflow-hidden pb-20 max-w-[1200px] mx-auto w-full">
      
      {/* Top Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-2 mb-6 gap-4">
        <div>
           <div className="flex items-center gap-3 mb-1">
             <h1 className="text-4xl font-black text-slate-900 tracking-tight">{formattedTitle}</h1>
             <div className="flex bg-white/60 backdrop-blur rounded-xl p-1 shadow-sm border border-white/60">
               <button onClick={() => setViewMode('day')} className={`px-4 py-1.5 text-xs font-extrabold rounded-lg transition-all ${viewMode === 'day' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:bg-white/40'}`}>DAY</button>
               <button onClick={() => setViewMode('month')} className={`px-4 py-1.5 text-xs font-extrabold rounded-lg transition-all ${viewMode === 'month' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:bg-white/40'}`}>MONTH</button>
             </div>
           </div>
           <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
             {viewMode === 'day' ? currentDate.toLocaleDateString('en-US', { weekday: 'long' }) : 'Monthly Overview'}
             {dateKey === new Date().toISOString().split('T')[0] && <span className="text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Today</span>}
           </p>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={handleGoogleSync}
             className={`flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all ${isSyncing ? 'animate-pulse' : ''}`}
           >
             <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
             <span className="hidden sm:inline">Sync Google</span>
           </button>

           <div className="flex bg-white rounded-full shadow-lg border border-slate-200/60 p-1">
             <button onClick={handlePrev} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-600"><ChevronLeft size={22} /></button>
             <button onClick={handleToday} className="px-5 py-2 text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 rounded-full transition-colors border-x border-slate-100">Today</button>
             <button onClick={handleNext} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-600"><ChevronRight size={22} /></button>
           </div>
           
           <button 
            onClick={() => setShowAddModal(true)}
            className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform hover:bg-blue-600"
           >
             <Plus size={24} />
           </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 glass-card rounded-[32px] overflow-hidden relative border border-white/60 shadow-2xl shadow-blue-900/10 backdrop-blur-3xl">
        
        {/* DAY VIEW */}
        {viewMode === 'day' && (
          <div className="h-full overflow-y-auto custom-scrollbar relative flex bg-white/40">
            {/* Time Axis */}
            <div className="w-20 flex-shrink-0 border-r border-slate-200/40 bg-white/50 text-xs font-bold text-slate-400 py-4 text-center sticky left-0 z-20 backdrop-blur-xl">
              <div className="h-[1500px] relative"> {/* Taller height for better spacing */}
                 {timeSlots.map(hour => (
                   <div key={hour} className="absolute w-full -translate-y-3" style={{ top: `${((hour - START_HOUR) / TOTAL_HOURS) * 100}%` }}>
                     {hour}:00
                   </div>
                 ))}
              </div>
            </div>

            {/* Grid & Events */}
            <div className="flex-1 relative h-[1500px] min-w-[340px]">
               {/* Grid Lines */}
               {timeSlots.map(hour => (
                 <div key={hour} className="absolute w-full border-t border-slate-300/30" style={{ top: `${((hour - START_HOUR) / TOTAL_HOURS) * 100}%` }} />
               ))}
               
               {/* Events */}
               {layoutEvents.map(event => {
                  const style = getPositionStyle(event.startTime, event.endTime);
                  const isMeal = event.type === 'meal';
                  const isBreak = event.type === 'break';
                  const isWorkshop = event.type === 'workshop';
                  const isPersonal = event.type === 'personal';
                  
                  let bgClass = "bg-white text-slate-800 border-l-[6px] border-blue-500 shadow-lg shadow-blue-900/5";
                  if (isMeal) bgClass = "bg-orange-50/90 text-orange-900 border-l-[6px] border-orange-400 shadow-md";
                  if (isBreak) bgClass = "bg-slate-100/80 text-slate-500 border-l-[6px] border-slate-300 border-dashed";
                  if (isWorkshop) bgClass = "bg-purple-50/90 text-purple-900 border-l-[6px] border-purple-500 shadow-lg shadow-purple-900/5";
                  if (isPersonal) bgClass = "bg-emerald-50/90 text-emerald-900 border-l-[6px] border-emerald-500 shadow-lg shadow-emerald-900/5";

                  return (
                    <div
                      key={event.eventId}
                      onClick={() => setSelectedEvent(event)}
                      className={`absolute rounded-xl px-4 py-2 text-xs cursor-pointer hover:scale-[1.02] hover:z-50 transition-all border-y border-r border-slate-200/40 overflow-hidden group flex flex-col justify-center ${bgClass}`}
                      style={{ 
                        top: style.top, 
                        height: style.height,
                        left: `${event.left}%`,
                        width: `${event.width}%`,
                        zIndex: event.left > 0 ? 10 : 1
                      }}
                    >
                      <div className="font-extrabold text-sm truncate leading-tight mb-0.5">{event.title}</div>
                      {!isBreak && (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 opacity-80 mt-1">
                           <span className="flex items-center gap-1 font-semibold"><Clock size={12} strokeWidth={3} /> {event.startTime} - {event.endTime}</span>
                           {event.platform && <span className="flex items-center gap-1 font-semibold bg-white/50 px-1.5 rounded-md"><MapPin size={12} strokeWidth={3} /> {event.platform}</span>}
                        </div>
                      )}
                      {event.assignments && event.assignments.length > 0 && (
                        <div className="absolute top-2 right-2">
                           <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                        </div>
                      )}
                    </div>
                  );
               })}

               {/* Independent Reminders on Timeline */}
               {daysReminders.map(reminder => (
                 <div 
                   key={reminder.id}
                   className="absolute left-[60%] z-40 w-56 -translate-y-1/2 group"
                   style={{ top: `${getReminderTop(reminder.time)}%` }}
                 >
                   <div 
                    onClick={() => onToggleReminder(reminder.id)}
                    className={`relative flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-xl border cursor-pointer transition-all hover:scale-105 ${
                      reminder.isCompleted 
                        ? 'bg-slate-100/90 text-slate-400 border-slate-200' 
                        : 'bg-white text-slate-900 border-red-100 hover:border-red-300'
                    }`}
                   >
                     {/* Red Dot indicator on left */}
                     {!reminder.isCompleted && <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full shadow-md border-2 border-white"></div>}

                     <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors ${reminder.isCompleted ? 'bg-slate-300 border-transparent' : 'bg-red-50 border-red-200'}`}>
                        {reminder.isCompleted && <Check size={14} className="text-white" strokeWidth={4}/>}
                     </div>
                     <div className="flex flex-col">
                       <span className={`text-sm font-bold leading-none ${reminder.isCompleted ? 'line-through' : ''}`}>{reminder.text}</span>
                       <span className="text-[10px] font-bold text-slate-400 mt-1">{reminder.time}</span>
                     </div>
                   </div>
                   {/* Line indicator */}
                   <div className="w-[200px] h-[2px] bg-red-300/30 absolute top-1/2 right-full -mr-2 pointer-events-none group-hover:bg-red-400/50 transition-colors"></div>
                 </div>
               ))}

               {/* Current Time Indicator */}
               {dateKey === new Date().toISOString().split('T')[0] && (
                  <div className="absolute w-full border-t-[2px] border-red-500 z-30 pointer-events-none shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ top: `${((new Date().getHours() * 60 + new Date().getMinutes() - (START_HOUR*60)) / (TOTAL_HOURS * 60)) * 100}%` }}>
                    <div className="absolute -left-1.5 -top-2 w-4 h-4 bg-red-500 rounded-full shadow border-2 border-white"></div>
                  </div>
               )}
            </div>
          </div>
        )}

        {/* MONTH VIEW */}
        {viewMode === 'month' && (
          <div className="h-full p-6 overflow-y-auto bg-white/40">
             <div className="grid grid-cols-7 mb-4 text-center">
               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                 <div key={d} className="text-xs font-black text-slate-400 uppercase tracking-widest">{d}</div>
               ))}
             </div>
             <div className="grid grid-cols-7 grid-rows-5 gap-3 h-full min-h-[600px]">
                {emptyDays.map(d => <div key={`empty-${d}`} className="bg-slate-50/20 rounded-2xl"></div>)}
                {monthDays.map(day => {
                   const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
                   const dayEvents = schedule.filter(e => e.date === dateStr);
                   const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                   
                   return (
                     <div 
                       key={day} 
                       className={`relative bg-white/70 p-3 rounded-2xl border border-white/60 shadow-sm hover:shadow-lg hover:scale-[1.03] transition-all cursor-pointer flex flex-col gap-1 ${isToday ? 'ring-2 ring-blue-500 shadow-blue-200' : ''}`}
                       onClick={() => {
                         setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
                         setViewMode('day');
                       }}
                     >
                        <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-blue-600 text-white shadow-md' : 'text-slate-700'}`}>{day}</span>
                        
                        <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                          {dayEvents.slice(0, 2).map(e => (
                             <div key={e.eventId} className="text-[10px] font-bold px-2 py-1 rounded-md bg-blue-50 text-blue-900 truncate border border-blue-100">
                               {e.title}
                             </div>
                          ))}
                          {dayEvents.length > 2 && (
                             <div className="text-[10px] font-bold text-slate-400 pl-1 mt-0.5">+{dayEvents.length - 2} more</div>
                          )}
                        </div>
                     </div>
                   );
                })}
             </div>
          </div>
        )}

      </div>

      {/* Modals */}
      {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
      {showAddModal && (
        <AddEventModal 
          onClose={() => setShowAddModal(false)} 
          onAdd={(e) => { onAddEvent(e); setShowAddModal(false); }} 
          onAddReminder={(r) => { onAddReminder(r); setShowAddModal(false); }}
        />
      )}
    </div>
  );
};

export default CalendarView;