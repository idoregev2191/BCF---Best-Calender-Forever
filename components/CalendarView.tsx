import React, { useState, useEffect } from 'react';
import { UserState, MeetEvent, StandaloneReminder } from '../types';
import { Plus, ChevronLeft, ChevronRight, Clock, MapPin, Check, RefreshCw, LogOut, Calendar as CalendarIcon } from 'lucide-react';
import EventModal from './EventModal';
import AddEventModal from './AddEventModal';
import DeveloperTools from './DeveloperTools';
import { GoogleCalendarService } from '../services/googleCalendar';

interface CalendarViewProps {
  user: UserState;
  schedule: MeetEvent[];
  reminders: StandaloneReminder[];
  onAddEvent: (event: MeetEvent) => void;
  onImportEvents: (events: MeetEvent[]) => void; // New Prop for Bulk Import
  onAddReminder: (reminder: StandaloneReminder) => void;
  onToggleReminder: (id: string) => void;
  // Trigger a reload of data from parent
  onRefreshData: () => void; 
}

type ViewMode = 'day' | 'month';

const CalendarView: React.FC<CalendarViewProps> = ({ 
  user, 
  schedule, 
  reminders,
  onAddEvent, 
  onImportEvents,
  onAddReminder,
  onToggleReminder,
  onRefreshData
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<MeetEvent | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);

  useEffect(() => {
    GoogleCalendarService.initialize().then(() => {
        // We could check token presence here but GAPI doesn't expose it easily without a call
    }).catch(() => {});
  }, []);

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

  const handleGoogleAuth = async () => {
    if (googleConnected) {
      GoogleCalendarService.signOut();
      setGoogleConnected(false);
      window.location.reload(); 
      return;
    }

    setIsSyncing(true);
    try {
      const auth = await GoogleCalendarService.authenticate();
      if(auth) {
        setGoogleConnected(true);
        const events = await GoogleCalendarService.fetchEvents();
        // Use Bulk Import to prevent Crash
        onImportEvents(events); 
        // Force refresh to show new events
        setTimeout(() => onRefreshData(), 100); 
      } else {
        alert("Sync failed. Check browser console for 'redirect_uri_mismatch' or popup blocker.");
      }
    } catch(e) { 
        console.error(e);
        alert("An unexpected error occurred during sync.");
    }
    setIsSyncing(false);
  };

  const formattedTitle = viewMode === 'day' 
    ? currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // --- Day View Helpers ---
  const START_HOUR = 7;
  const END_HOUR = 23; 
  const TOTAL_HOURS = END_HOUR - START_HOUR;
  const timeSlots = Array.from({ length: TOTAL_HOURS }, (_, i) => i + START_HOUR);
  
  // Robust Overlap Calculation
  const calculateEventLayout = (events: MeetEvent[]) => {
    // Sort by start time
    const sorted = [...events].sort((a, b) => {
        if (a.startTime !== b.startTime) return a.startTime.localeCompare(b.startTime);
        return a.endTime.localeCompare(b.endTime);
    });

    const columns: MeetEvent[][] = [];
    
    sorted.forEach(event => {
        let placed = false;
        for (let i = 0; i < columns.length; i++) {
            const lastInCol = columns[i][columns[i].length - 1];
            // If current event starts after the last one in this column ends
            if (event.startTime >= lastInCol.endTime) {
                columns[i].push(event);
                placed = true;
                break;
            }
        }
        if (!placed) {
            columns.push([event]);
        }
    });

    // Now flatten and assign widths
    const layoutEvents: any[] = [];
    const colCount = columns.length;
    columns.forEach((col, colIndex) => {
        col.forEach(event => {
            layoutEvents.push({
                ...event,
                width: 100 / colCount,
                left: (100 / colCount) * colIndex
            });
        });
    });

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
    <div className="flex flex-col h-full overflow-hidden pb-20 w-full">
      
      {/* Top Navigation Bar - Enhanced Apple-like Design */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between px-2 mb-6 gap-6">
        <div>
           {/* BCF Branding + Title */}
           <div className="flex items-center gap-4 mb-3 animate-in fade-in slide-in-from-left-4 duration-500">
             <div className="w-12 h-12 bg-white/80 backdrop-blur text-slate-900 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-blue-900/10 border border-white">
               <span className="transform hover:scale-110 transition-transform cursor-default">📅</span>
             </div>
             <div>
               <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">BCF</h1>
               <div className="flex items-center gap-2 text-slate-500">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-200/50 px-2 py-0.5 rounded-md">v1.3</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="text-xs font-medium">Synced Calendar</span>
               </div>
             </div>
             <div className="h-10 w-[1px] bg-slate-200 mx-2"></div>
             <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-700 tracking-tight">{formattedTitle}</h2>
           </div>
           
           <div className="flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
              <div className="flex bg-slate-100/50 backdrop-blur rounded-xl p-1 shadow-inner border border-white/40">
                <button onClick={() => setViewMode('day')} className={`px-5 py-2 text-xs font-extrabold rounded-lg transition-all duration-300 ${viewMode === 'day' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>DAY</button>
                <button onClick={() => setViewMode('month')} className={`px-5 py-2 text-xs font-extrabold rounded-lg transition-all duration-300 ${viewMode === 'month' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>MONTH</button>
              </div>
              
              {dateKey === new Date().toISOString().split('T')[0] && (
                 <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50/80 backdrop-blur border border-blue-100 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wide shadow-sm">
                   <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                   Today
                 </span>
              )}
           </div>
        </div>

        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
           <button 
             onClick={handleGoogleAuth}
             disabled={isSyncing}
             className={`flex items-center gap-2 px-5 py-3 rounded-full shadow-lg shadow-slate-200/50 font-bold border active:scale-95 transition-all ${
               googleConnected 
                ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' 
                : 'bg-white text-slate-700 border-white hover:bg-slate-50 hover:text-blue-600'
             }`}
           >
             {isSyncing ? (
                <RefreshCw size={18} className="animate-spin text-blue-600" />
             ) : (
                googleConnected ? <LogOut size={18} /> : <span className="text-xl">G</span>
             )}
             <span className="hidden sm:inline text-sm">{googleConnected ? 'Disconnect' : 'Sync Google'}</span>
           </button>

           <div className="flex bg-white/80 backdrop-blur rounded-full shadow-lg border border-white p-1">
             <button onClick={handlePrev} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-600 active:scale-90"><ChevronLeft size={22} /></button>
             <button onClick={handleToday} className="px-6 py-2 text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 rounded-full transition-colors border-x border-slate-100">Today</button>
             <button onClick={handleNext} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-600 active:scale-90"><ChevronRight size={22} /></button>
           </div>
           
           <button 
            onClick={() => setShowAddModal(true)}
            className="w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform hover:bg-blue-600 active:scale-90"
           >
             <Plus size={28} />
           </button>
        </div>
      </div>

      {/* Main Content Area - Full Width */}
      <div className="flex-1 glass-card rounded-[32px] overflow-hidden relative border border-white/60 shadow-2xl shadow-blue-900/10 backdrop-blur-3xl w-full">
        
        {/* DAY VIEW */}
        {viewMode === 'day' && (
          <div className="h-full overflow-y-auto custom-scrollbar relative flex bg-white/40">
            {/* Time Axis */}
            <div className="w-20 flex-shrink-0 border-r border-slate-200/40 bg-white/50 text-xs font-bold text-slate-400 py-4 text-center sticky left-0 z-20 backdrop-blur-xl">
              <div className="h-[1500px] relative"> 
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
                  const isGoogle = !!event.googleEventId;
                  
                  let bgClass = "bg-white text-slate-800 border-l-[6px] border-blue-500 shadow-lg shadow-blue-900/5";
                  if (isMeal) bgClass = "bg-orange-50/90 text-orange-900 border-l-[6px] border-orange-400 shadow-md";
                  if (isBreak) bgClass = "bg-slate-100/80 text-slate-500 border-l-[6px] border-slate-300 border-dashed";
                  if (isWorkshop) bgClass = "bg-purple-50/90 text-purple-900 border-l-[6px] border-purple-500 shadow-lg shadow-purple-900/5";
                  if (isPersonal) bgClass = "bg-emerald-50/90 text-emerald-900 border-l-[6px] border-emerald-500 shadow-lg shadow-emerald-900/5";
                  // Google events override styling slightly
                  if (isGoogle) bgClass = "bg-blue-50/90 text-blue-900 border-l-[6px] border-blue-600 shadow-md";

                  return (
                    <div
                      key={event.eventId}
                      onClick={() => setSelectedEvent(event)}
                      className={`absolute rounded-xl px-4 py-2 text-xs cursor-pointer hover:scale-[1.02] hover:z-50 transition-all border-y border-r border-slate-200/40 overflow-hidden group flex flex-col justify-start ${bgClass}`}
                      style={{ 
                        top: style.top, 
                        height: style.height,
                        left: `${event.left}%`,
                        width: `${event.width}%`,
                        zIndex: event.left > 0 ? 10 : 1,
                        minHeight: '40px' // Prevent unreadability
                      }}
                    >
                      <div className="font-extrabold text-sm truncate leading-tight mb-0.5 flex items-center gap-1">
                          {isGoogle && <span className="text-[8px] bg-blue-200 px-1 rounded text-blue-800">G</span>}
                          {event.title}
                      </div>
                      {!isBreak && (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 opacity-80 mt-1">
                           <span className="flex items-center gap-1 font-semibold"><Clock size={12} strokeWidth={3} /> {event.startTime} - {event.endTime}</span>
                           {event.platform && <span className="flex items-center gap-1 font-semibold bg-white/50 px-1.5 rounded-md"><MapPin size={12} strokeWidth={3} /> {event.platform}</span>}
                        </div>
                      )}
                    </div>
                  );
               })}

               {/* Independent Reminders on Timeline */}
               {daysReminders.map(reminder => (
                 <div 
                   key={reminder.id}
                   className="absolute left-[65%] z-40 w-56 -translate-y-1/2 group"
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
                     {!reminder.isCompleted && <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full shadow-md border-2 border-white"></div>}

                     <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors ${reminder.isCompleted ? 'bg-slate-300 border-transparent' : 'bg-red-50 border-red-200'}`}>
                        {reminder.isCompleted && <Check size={14} className="text-white" strokeWidth={4}/>}
                     </div>
                     <div className="flex flex-col">
                       <span className={`text-sm font-bold leading-none ${reminder.isCompleted ? 'line-through' : ''}`}>{reminder.text}</span>
                       <span className="text-[10px] font-bold text-slate-400 mt-1">{reminder.time}</span>
                     </div>
                   </div>
                   <div className="w-[100vw] h-[2px] bg-red-300/30 absolute top-1/2 right-full -mr-2 pointer-events-none group-hover:bg-red-400/50 transition-colors"></div>
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
          onAdd={async (e) => { 
              // Add to Local
              onAddEvent(e); 
              // Try add to Google
              if(googleConnected) {
                 await GoogleCalendarService.createEvent(e);
              }
              setShowAddModal(false); 
          }} 
          onAddReminder={(r) => { onAddReminder(r); setShowAddModal(false); }}
        />
      )}
      
      {/* Dev Tools */}
      <DeveloperTools onReset={onRefreshData} />
    </div>
  );
};

export default CalendarView;