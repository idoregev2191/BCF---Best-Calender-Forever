import React, { useState, useEffect } from 'react';
import { UserState, MeetEvent, StandaloneReminder, GoogleCalendarInfo } from '../types';
import { Plus, ChevronLeft, ChevronRight, Clock, MapPin, Check, RefreshCw, Video, Sparkles } from 'lucide-react';
import EventModal from './EventModal';
import AddEventModal from './AddEventModal';
import DeveloperTools from './DeveloperTools';
import AIModal from './AIModal';
import CalendarSelector from './CalendarSelector';
import { GoogleCalendarService } from '../services/googleCalendar';
import { StorageService } from '../services/storage';

interface CalendarViewProps {
  user: UserState;
  schedule: MeetEvent[];
  reminders: StandaloneReminder[];
  onAddEvent: (event: MeetEvent) => void;
  onImportEvents: (events: MeetEvent[]) => void;
  onAddReminder: (reminder: StandaloneReminder) => void;
  onToggleReminder: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onRefreshData: () => void; 
}

type ViewMode = 'day' | 'month';

// Helper for consistent pastel colors from strings (for Google events)
const stringToPastel = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 95%)`; // Very light background
};

const stringToBorder = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 50%)`; // Solid border color
};

const CalendarView: React.FC<CalendarViewProps> = ({ 
  user, 
  schedule, 
  reminders,
  onAddEvent, 
  onImportEvents,
  onAddReminder,
  onToggleReminder,
  onDeleteEvent,
  onRefreshData
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  
  // DEMO DATE INITIALIZATION: 2026-01-27
  const [currentDate, setCurrentDate] = useState(new Date("2026-01-27T10:00:00"));

  const [selectedEvent, setSelectedEvent] = useState<MeetEvent | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAI, setShowAI] = useState(false);
  
  // Current Time Line
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Google Sync States
  const [isSyncing, setIsSyncing] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [availableCalendars, setAvailableCalendars] = useState<GoogleCalendarInfo[]>([]);
  const [showCalSelector, setShowCalSelector] = useState(false);

  useEffect(() => {
    GoogleCalendarService.initialize().catch(() => {});
  }, []);

  // --- NAVIGATION ---
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
  const handleToday = () => setCurrentDate(new Date("2026-01-27")); // Reset to Demo Date

  // --- GOOGLE SYNC LOGIC ---
  const initGoogleSync = async () => {
    if (googleConnected) {
      if(confirm("Disconnect Google Calendar?")) {
          GoogleCalendarService.signOut();
          setGoogleConnected(false);
          window.location.reload();
      }
      return;
    }
    setIsSyncing(true);
    const auth = await GoogleCalendarService.authenticate();
    if(auth) {
        const calendars = await GoogleCalendarService.fetchCalendars();
        if (calendars.length > 0) {
            setAvailableCalendars(calendars);
            setShowCalSelector(true);
        } else {
            alert("No calendars found.");
        }
    } else {
        alert("Authentication failed.");
    }
    setIsSyncing(false);
  };

  const finalizeSync = async () => {
      setShowCalSelector(false);
      setIsSyncing(true);
      const selectedCals = availableCalendars.filter(c => c.selected);
      const events = await GoogleCalendarService.fetchEvents(selectedCals, user.group);
      onImportEvents(events);
      setGoogleConnected(true);
      setTimeout(() => onRefreshData(), 100);
      setIsSyncing(false);
  };

  const toggleCalendarSelection = (id: string) => {
      setAvailableCalendars(prev => prev.map(c => c.id === id ? {...c, selected: !c.selected} : c));
  };

  // --- LAYOUT HELPERS ---
  const formattedTitle = viewMode === 'day' 
    ? currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
    : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const START_HOUR = 7;
  const END_HOUR = 23; 
  const TOTAL_HOURS = END_HOUR - START_HOUR;
  const timeSlots = Array.from({ length: TOTAL_HOURS }, (_, i) => i + START_HOUR);

  const getMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };
  
  // Robust Layout Algorithm for Side-by-Side Events
  const calculateEventLayout = (events: MeetEvent[]) => {
    if (events.length === 0) return [];
    
    const sorted = [...events].sort((a, b) => {
        const startA = getMinutes(a.startTime);
        const startB = getMinutes(b.startTime);
        if (startA !== startB) return startA - startB;
        return (getMinutes(b.endTime) - getMinutes(b.startTime)) - (getMinutes(a.endTime) - getMinutes(a.startTime));
    });

    const layoutEvents: any[] = [];
    const columns: MeetEvent[][] = [];

    sorted.forEach(ev => {
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        const lastInCol = col[col.length - 1];
        if (getMinutes(ev.startTime) >= getMinutes(lastInCol.endTime)) {
          col.push(ev);
          placed = true;
          layoutEvents.push({ ...ev, colIndex: i });
          break;
        }
      }
      if (!placed) {
        columns.push([ev]);
        layoutEvents.push({ ...ev, colIndex: columns.length - 1 });
      }
    });

    const clusters: any[][] = [];
    let currentCluster: any[] = [];
    let clusterEnd = -1;

    const resortForCluster = [...layoutEvents].sort((a,b) => getMinutes(a.startTime) - getMinutes(b.startTime));

    resortForCluster.forEach(ev => {
       const start = getMinutes(ev.startTime);
       const end = getMinutes(ev.endTime);
       
       if (currentCluster.length === 0) {
         currentCluster.push(ev);
         clusterEnd = end;
       } else {
         if (start < clusterEnd) {
           currentCluster.push(ev);
           clusterEnd = Math.max(clusterEnd, end);
         } else {
           clusters.push(currentCluster);
           currentCluster = [ev];
           clusterEnd = end;
         }
       }
    });
    if (currentCluster.length > 0) clusters.push(currentCluster);

    const finalEvents: any[] = [];
    clusters.forEach(cluster => {
       const maxColInCluster = Math.max(...cluster.map(e => e.colIndex));
       const count = maxColInCluster + 1;
       
       cluster.forEach(ev => {
         finalEvents.push({
           ...ev,
           width: 100 / count,
           left: (100 / count) * ev.colIndex,
           isCrowded: count > 2
         });
       });
    });

    return finalEvents;
  };

  const getPositionStyle = (startTime: string, endTime: string) => {
    const startTotal = getMinutes(startTime);
    const endTotal = getMinutes(endTime);
    const dayStart = START_HOUR * 60;
    const totalDayMinutes = TOTAL_HOURS * 60;
    const top = ((startTotal - dayStart) / totalDayMinutes) * 100;
    
    // Ensure 15 min events are visible
    const rawHeight = ((endTotal - startTotal) / totalDayMinutes) * 100;
    const height = Math.max(rawHeight, 2.5); 
    
    return { top: `${top}%`, height: `${height}%` };
  };

  const getReminderTop = (time: string) => {
    const total = getMinutes(time);
    const dayStart = START_HOUR * 60;
    return ((total - dayStart) / (TOTAL_HOURS * 60)) * 100;
  };

  const getCurrentTimeTop = () => {
      const nowMins = now.getHours() * 60 + now.getMinutes();
      const startMins = START_HOUR * 60;
      const totalMins = TOTAL_HOURS * 60;
      return ((nowMins - startMins) / totalMins) * 100;
  };

  const dateKey = currentDate.toISOString().split('T')[0];
  const daysEvents = schedule.filter(e => e.date === dateKey);
  const layoutEvents = calculateEventLayout(daysEvents);
  const daysReminders = reminders.filter(r => r.date === dateKey);

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
  
  const getGreeting = () => {
      const h = new Date().getHours();
      if (h < 12) return { text: "Good Morning", icon: "☀️" };
      if (h < 18) return { text: "Good Afternoon", icon: "🌤️" };
      return { text: "Good Evening", icon: "🌙" };
  };
  const greeting = getGreeting();

  return (
    <div className="flex flex-col h-full overflow-hidden pb-24 w-full">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between px-4 mb-6 gap-6">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <span className="text-xl">{greeting.icon}</span>
             <span className="text-lg font-bold text-slate-500">{greeting.text}, {user.name.split(' ')[0]}</span>
           </div>
           
           <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">
             {formattedTitle}
           </h1>

           <div className="flex items-center gap-3">
              <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-200">
                <button onClick={handlePrev} className="p-2 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors"><ChevronLeft size={20} /></button>
                <button onClick={handleToday} className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">Today (2026)</button>
                <button onClick={handleNext} className="p-2 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors"><ChevronRight size={20} /></button>
              </div>

              <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-200">
                <button onClick={() => setViewMode('day')} className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${viewMode === 'day' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Day</button>
                <button onClick={() => setViewMode('month')} className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${viewMode === 'month' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Month</button>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={initGoogleSync}
             disabled={isSyncing}
             className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold border transition-all active:scale-95 shadow-sm hover:shadow-lg hover:-translate-y-0.5 ${
               googleConnected 
                ? 'bg-white text-slate-700 border-white' 
                : 'bg-white text-slate-700 border-white'
             }`}
           >
             {isSyncing ? (
                 <RefreshCw size={18} className="animate-spin text-slate-400" />
             ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.769 -21.864 51.959 -21.864 51.129 C -21.864 50.299 -21.734 49.489 -21.484 48.729 L -21.484 45.639 L -25.464 45.639 C -26.274 47.249 -26.734 49.069 -26.734 51.129 C -26.734 53.189 -26.274 55.009 -25.464 56.619 L -21.484 53.529 Z" />
                    <path fill="#EA4335" d="M -14.754 43.749 C -12.984 43.749 -11.404 44.369 -10.154 45.579 L -6.724 42.149 C -8.804 40.209 -11.514 39 -14.754 39 C -19.444 39 -23.494 41.709 -25.464 45.639 L -21.484 48.729 C -20.534 45.879 -17.884 43.749 -14.754 43.749 Z" />
                    </g>
                </svg>
             )}
             <span className="text-sm font-bold text-slate-700">{googleConnected ? 'Sync Active' : 'Google Sync'}</span>
           </button>
           
           <button 
            onClick={() => setShowAddModal(true)}
            className="h-12 w-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-blue-600 hover:shadow-blue-500/30 transition-all active:scale-95"
           >
             <Plus size={24} strokeWidth={3} />
           </button>
        </div>
      </div>

      {/* --- CONTENT PANEL --- */}
      <div className="flex-1 glass-panel rounded-[32px] overflow-hidden relative w-full border border-white/60 shadow-xl">
        
        {/* DAY VIEW */}
        {viewMode === 'day' && (
          <div className="h-full overflow-y-auto custom-scrollbar relative flex bg-white/40">
            {/* Time Axis */}
            <div className="w-16 flex-shrink-0 border-r border-slate-200/50 bg-white/60 text-[10px] font-bold text-slate-400 py-4 text-center sticky left-0 z-30 backdrop-blur-md">
              <div className="h-[1500px] relative"> 
                 {timeSlots.map(hour => (
                   <div key={hour} className="absolute w-full -translate-y-3" style={{ top: `${((hour - START_HOUR) / TOTAL_HOURS) * 100}%` }}>
                     {hour}:00
                   </div>
                 ))}
              </div>
            </div>

            {/* Grid & Events */}
            <div className="flex-1 relative h-[1500px] min-w-full">
               {/* Grid Lines */}
               {timeSlots.map(hour => (
                 <div key={hour} className="absolute w-full border-t border-slate-200/50" style={{ top: `${((hour - START_HOUR) / TOTAL_HOURS) * 100}%` }} />
               ))}

               {/* Current Time Indicator */}
               <div 
                 className="absolute w-full border-t-2 border-red-500 z-50 pointer-events-none transition-all duration-1000"
                 style={{ top: `${getCurrentTimeTop()}%` }}
               >
                 <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-red-500 rounded-full shadow-md"></div>
               </div>
               
               {/* Events */}
               {layoutEvents.map(event => {
                  const style = getPositionStyle(event.startTime, event.endTime);
                  const isGoogle = !!event.googleEventId;
                  
                  // Default Style: Clean White Card with Left Border Accent
                  let bgColor = "bg-white";
                  let accentColor = "#64748b"; // slate-500
                  let textColor = "#334155"; // slate-700
                  let iconColor = "#94a3b8"; // slate-400

                  // Custom Logic for Meet Types
                  if (event.type === 'meal') {
                      bgColor = "bg-orange-50";
                      accentColor = "#f97316";
                      textColor = "#9a3412";
                      iconColor = "#fdba74";
                  } 
                  if (event.type === 'break') {
                      bgColor = "bg-slate-50";
                      accentColor = "#cbd5e1";
                  }
                  if (event.type === 'workshop') {
                      bgColor = "bg-pink-50";
                      accentColor = "#ec4899";
                      textColor = "#9d174d";
                      iconColor = "#fbcfe8";
                  }
                  if (event.type === 'personal') {
                      bgColor = "bg-emerald-50";
                      accentColor = "#10b981";
                      textColor = "#065f46";
                      iconColor = "#6ee7b7";
                  }
                  if (event.type === 'lecture') {
                      bgColor = "bg-blue-50";
                      accentColor = "#3b82f6";
                      textColor = "#1e40af";
                      iconColor = "#93c5fd";
                  }
                  if (event.type === 'lab') {
                      bgColor = "bg-purple-50";
                      accentColor = "#a855f7";
                      textColor = "#6b21a8";
                      iconColor = "#d8b4fe";
                  }

                  // GOOGLE OVERRIDE - Dynamic Colors
                  if (isGoogle) {
                      bgColor = "bg-white";
                      // Use a subtle pastel background logic or just white with colored border
                      // Let's use the stringToBorder for accent
                      accentColor = stringToBorder(event.title);
                  }

                  return (
                    <div
                      key={event.eventId}
                      onClick={() => setSelectedEvent(event)}
                      className={`
                        absolute rounded-lg px-3 py-2 cursor-pointer transition-all duration-200 overflow-hidden flex flex-col justify-between 
                        ${bgColor}
                        border-l-4 border-t border-r border-b border-white shadow-sm
                        hover:z-40 hover:shadow-xl hover:scale-[1.01]
                      `}
                      style={{ 
                        top: style.top, 
                        height: style.height,
                        left: `calc(${event.left}% + 0.5%)`, 
                        width: `calc(${event.width}% - 1%)`,
                        zIndex: event.left > 0 ? 20 : 10,
                        borderLeftColor: accentColor
                      }}
                    >
                      <div className="flex-1 min-h-0">
                         <div className={`font-bold text-xs leading-tight mb-1 flex items-start gap-1.5 ${event.isCrowded ? 'break-words' : 'truncate'}`} style={{ color: textColor }}>
                            <span className="tracking-tight text-[13px]">{event.title}</span>
                         </div>
                         {event.type !== 'break' && (
                           <div className="flex flex-col gap-0.5 opacity-90" style={{ color: textColor }}>
                              <span className="flex items-center gap-1 font-semibold text-[10px] truncate"><Clock size={10} color={iconColor} strokeWidth={3} /> {event.startTime} - {event.endTime}</span>
                              {event.platform && !event.platform.startsWith('http') && <span className="flex items-center gap-1 font-semibold text-[10px] truncate max-w-full"><MapPin size={10} color={iconColor} strokeWidth={3} /> {event.platform}</span>}
                           </div>
                         )}
                      </div>
                    </div>
                  );
               })}

               {/* Reminders Bubble */}
               {daysReminders.map(reminder => (
                 <div 
                   key={reminder.id}
                   className="absolute left-[85%] z-40 w-56 -translate-y-1/2 group"
                   style={{ top: `${getReminderTop(reminder.time)}%` }}
                 >
                   <div 
                    onClick={() => onToggleReminder(reminder.id)}
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg border cursor-pointer transition-all hover:scale-105 bg-white ${
                      reminder.isCompleted 
                        ? 'opacity-60 border-slate-200' 
                        : 'border-red-100 hover:border-red-300'
                    }`}
                   >
                     <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors flex-shrink-0 ${reminder.isCompleted ? 'bg-slate-200 border-transparent' : 'bg-red-50 border-red-200'}`}>
                        {reminder.isCompleted && <Check size={12} className="text-slate-500" strokeWidth={3}/>}
                     </div>
                     <span className={`text-xs font-bold text-slate-800 ${reminder.isCompleted ? 'line-through text-slate-400' : ''}`}>{reminder.text}</span>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* MONTH VIEW */}
        {viewMode === 'month' && (
          <div className="h-full p-6 overflow-y-auto bg-white/40 backdrop-blur-xl">
             <div className="grid grid-cols-7 mb-4 text-center">
               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                 <div key={d} className="text-xs font-bold text-slate-400 uppercase tracking-widest">{d}</div>
               ))}
             </div>
             <div className="grid grid-cols-7 auto-rows-fr gap-3 h-full min-h-[600px]">
                {emptyDays.map(d => <div key={`empty-${d}`}></div>)}
                {monthDays.map(day => {
                   const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
                   const dayEvents = schedule.filter(e => e.date === dateStr);
                   const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                   
                   return (
                     <div 
                       key={day} 
                       className={`relative bg-white/70 backdrop-blur-md p-3 rounded-2xl border border-white shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col gap-1 ${isToday ? 'ring-2 ring-blue-500 shadow-blue-100' : ''}`}
                       onClick={() => {
                         setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
                         setViewMode('day');
                       }}
                     >
                        <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>{day}</span>
                        <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                          {dayEvents.slice(0, 3).map(e => (
                             <div key={e.eventId} className="w-full h-1.5 rounded-full bg-blue-100">
                                <div className={`h-full rounded-full ${e.googleEventId ? 'bg-sky-400' : (e.type === 'lecture' ? 'bg-blue-500' : 'bg-emerald-400')}`}></div>
                             </div>
                          ))}
                        </div>
                     </div>
                   );
                })}
             </div>
          </div>
        )}
      </div>

      {/* MINIMALIST AI BUTTON */}
      <div className="fixed bottom-24 right-6 z-50">
        <button
          onClick={() => setShowAI(!showAI)}
          className={`flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 ${
              showAI ? 'bg-white text-slate-900 rotate-45' : 'bg-slate-900 text-white hover:scale-110 hover:shadow-indigo-500/30'
          }`}
        >
           {showAI ? <Plus size={24} /> : <Sparkles size={20} />}
        </button>
      </div>

      {/* MODALS */}
      {selectedEvent && (
        <EventModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
          onDelete={(id) => { onDeleteEvent(id); setSelectedEvent(null); }}
          onUpdate={(event) => { 
             StorageService.updateEvent(event); 
             onRefreshData();
             setSelectedEvent(null);
          }}
        />
      )}
      
      {showAddModal && (
        <AddEventModal 
          onClose={() => setShowAddModal(false)} 
          onAdd={async (e) => { 
              onAddEvent(e); 
              if(googleConnected) await GoogleCalendarService.createEvent(e);
              setShowAddModal(false); 
          }} 
          onAddReminder={(r) => { onAddReminder(r); setShowAddModal(false); }}
        />
      )}

      {showCalSelector && (
          <CalendarSelector 
            calendars={availableCalendars} 
            onToggle={toggleCalendarSelection} 
            onConfirm={finalizeSync} 
            onCancel={() => setShowCalSelector(false)} 
          />
      )}

      {/* Pass FULL schedule to AI */}
      {showAI && <AIModal schedule={schedule} onClose={() => setShowAI(false)} />}
      
      <DeveloperTools onReset={onRefreshData} />
    </div>
  );
};

export default CalendarView;