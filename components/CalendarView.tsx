import React, { useState, useEffect } from 'react';
import { UserState, MeetEvent, StandaloneReminder, GoogleCalendarInfo } from '../types';
import { Plus, ChevronLeft, ChevronRight, Clock, MapPin, Check, RefreshCw, LogOut, Video, Sparkles, Sun, Moon, Calendar as CalIcon, Settings, X, MoreHorizontal } from 'lucide-react';
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<MeetEvent | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAI, setShowAI] = useState(false);
  
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
  const handleToday = () => setCurrentDate(new Date());

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
      const events = await GoogleCalendarService.fetchEvents(selectedCals);
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
    ? currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })
    : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const START_HOUR = 7;
  const END_HOUR = 23; 
  const TOTAL_HOURS = END_HOUR - START_HOUR;
  const timeSlots = Array.from({ length: TOTAL_HOURS }, (_, i) => i + START_HOUR);

  const getMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };
  
  const calculateEventLayout = (events: MeetEvent[]) => {
    if (events.length === 0) return [];
    const sorted = [...events].sort((a, b) => {
        const diffStart = getMinutes(a.startTime) - getMinutes(b.startTime);
        if (diffStart !== 0) return diffStart;
        return getMinutes(b.endTime) - getMinutes(a.endTime);
    });

    const clusters: MeetEvent[][] = [];
    let currentCluster: MeetEvent[] = [];
    let clusterEnd = -1;

    sorted.forEach(ev => {
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

    const layoutEvents: any[] = [];
    clusters.forEach(cluster => {
        const columns: MeetEvent[][] = [];
        cluster.forEach(ev => {
            let placed = false;
            for (let i = 0; i < columns.length; i++) {
                const lastInCol = columns[i][columns[i].length - 1];
                if (getMinutes(ev.startTime) >= getMinutes(lastInCol.endTime)) {
                    columns[i].push(ev);
                    placed = true;
                    break;
                }
            }
            if (!placed) columns.push([ev]);
        });
        const numCols = columns.length;
        columns.forEach((col, colIndex) => {
            col.forEach(ev => {
                layoutEvents.push({
                    ...ev,
                    width: 100 / numCols,
                    left: (100 / numCols) * colIndex
                });
            });
        });
    });
    return layoutEvents;
  };

  const getPositionStyle = (startTime: string, endTime: string) => {
    const startTotal = getMinutes(startTime);
    const endTotal = getMinutes(endTime);
    const dayStart = START_HOUR * 60;
    const totalDayMinutes = TOTAL_HOURS * 60;
    const top = ((startTotal - dayStart) / totalDayMinutes) * 100;
    const height = Math.max(((endTotal - startTotal) / totalDayMinutes) * 100, 2.5); 
    return { top: `${top}%`, height: `${height}%` };
  };

  const getReminderTop = (time: string) => {
    const total = getMinutes(time);
    const dayStart = START_HOUR * 60;
    return ((total - dayStart) / (TOTAL_HOURS * 60)) * 100;
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
              {/* Date Nav Pills */}
              <div className="flex bg-white rounded-full p-1 shadow-sm border border-slate-200">
                <button onClick={handlePrev} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"><ChevronLeft size={20} /></button>
                <button onClick={handleToday} className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 rounded-full transition-colors">Today</button>
                <button onClick={handleNext} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"><ChevronRight size={20} /></button>
              </div>

              {/* View Toggle */}
              <div className="flex bg-white rounded-full p-1 shadow-sm border border-slate-200">
                <button onClick={() => setViewMode('day')} className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${viewMode === 'day' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Day</button>
                <button onClick={() => setViewMode('month')} className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${viewMode === 'month' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Month</button>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-3">
           {/* Google Sync */}
           <button 
             onClick={initGoogleSync}
             disabled={isSyncing}
             className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold border transition-all active:scale-95 ${
               googleConnected 
                ? 'bg-red-50 text-red-600 border-red-100' 
                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:text-blue-600 shadow-sm'
             }`}
           >
             {isSyncing ? <RefreshCw size={18} className="animate-spin" /> : <CalIcon size={18} />}
             <span className="text-sm font-bold">{googleConnected ? 'Unsync' : 'Sync G-Cal'}</span>
           </button>
           
           {/* Add Button */}
           <button 
            onClick={() => setShowAddModal(true)}
            className="h-12 w-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-blue-600 hover:shadow-blue-500/30 transition-all active:scale-95"
           >
             <Plus size={24} strokeWidth={3} />
           </button>
        </div>
      </div>

      {/* --- GLASS PANEL CONTENT --- */}
      <div className="flex-1 glass-panel rounded-[32px] overflow-hidden relative w-full">
        
        {/* DAY VIEW */}
        {viewMode === 'day' && (
          <div className="h-full overflow-y-auto custom-scrollbar relative flex bg-white/50">
            {/* Time Axis */}
            <div className="w-16 flex-shrink-0 border-r border-slate-100 bg-white/40 text-[11px] font-bold text-slate-400 py-4 text-center sticky left-0 z-20 backdrop-blur-md">
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
               {timeSlots.map(hour => (
                 <div key={hour} className="absolute w-full border-t border-slate-100" style={{ top: `${((hour - START_HOUR) / TOTAL_HOURS) * 100}%` }} />
               ))}
               
               {/* Events */}
               {layoutEvents.map(event => {
                  const style = getPositionStyle(event.startTime, event.endTime);
                  const isGoogle = !!event.googleEventId;
                  
                  // Vibrant but Clean Colors
                  let bgClass = "bg-white border-l-4 border-slate-300 text-slate-700 shadow-sm";
                  let hoverClass = "hover:shadow-md hover:border-slate-400";
                  
                  if (event.type === 'meal') { bgClass = "bg-orange-50 border-l-4 border-orange-400 text-orange-900"; hoverClass="hover:shadow-orange-500/10 hover:bg-orange-100"; }
                  if (event.type === 'break') { bgClass = "bg-slate-50 border-l-4 border-slate-300 text-slate-500 border-dashed"; hoverClass="hover:bg-slate-100"; }
                  if (event.type === 'workshop') { bgClass = "bg-pink-50 border-l-4 border-pink-400 text-pink-900"; hoverClass="hover:shadow-pink-500/10 hover:bg-pink-100"; }
                  if (event.type === 'personal') { bgClass = "bg-emerald-50 border-l-4 border-emerald-500 text-emerald-900"; hoverClass="hover:shadow-emerald-500/10 hover:bg-emerald-100"; }
                  if (event.type === 'lecture') { bgClass = "bg-blue-50 border-l-4 border-blue-500 text-blue-900"; hoverClass="hover:shadow-blue-500/10 hover:bg-blue-100"; }
                  if (event.type === 'lab') { bgClass = "bg-purple-50 border-l-4 border-purple-500 text-purple-900"; hoverClass="hover:shadow-purple-500/10 hover:bg-purple-100"; }

                  // Google Override
                  const customStyle = isGoogle && event.color ? { backgroundColor: event.color + '20', color: event.color, borderLeftColor: event.color } : {};

                  return (
                    <div
                      key={event.eventId}
                      onClick={() => setSelectedEvent(event)}
                      className={`absolute rounded-r-xl px-3 py-2 text-xs cursor-pointer transition-all overflow-hidden flex flex-col justify-between ${bgClass} ${hoverClass}`}
                      style={{ 
                        top: style.top, 
                        height: style.height,
                        left: `${event.left}%`,
                        width: `${event.width}%`,
                        zIndex: event.left > 0 ? 10 : 1,
                        ...customStyle
                      }}
                    >
                      <div className="flex-1 min-h-0">
                         <div className="font-extrabold text-sm truncate leading-tight mb-0.5 flex items-center gap-1.5">
                            {isGoogle && <div className="w-1.5 h-1.5 rounded-full bg-current"></div>}
                            <span className="truncate tracking-tight">{event.title}</span>
                         </div>
                         {event.type !== 'break' && (
                           <div className="flex flex-wrap items-center gap-x-3 gap-y-1 opacity-80 mt-1">
                              <span className="flex items-center gap-1 font-semibold truncate"><Clock size={10} /> {event.startTime} - {event.endTime}</span>
                              {event.platform && !event.platform.startsWith('http') && <span className="flex items-center gap-1 font-semibold truncate max-w-full"><MapPin size={10} /> {event.platform}</span>}
                           </div>
                         )}
                      </div>
                      {event.meetLink && (
                        <div className="mt-1 flex-shrink-0">
                           <a 
                             href={event.meetLink} 
                             target="_blank" 
                             rel="noreferrer"
                             onClick={(e) => e.stopPropagation()} 
                             className="inline-flex items-center gap-1 bg-white/80 text-blue-600 px-2 py-1.5 rounded-md shadow-sm font-bold hover:bg-blue-600 hover:text-white transition-all w-full justify-center"
                           >
                              <Video size={10} /> Join
                           </a>
                        </div>
                      )}
                    </div>
                  );
               })}

               {/* Reminders Bubble */}
               {daysReminders.map(reminder => (
                 <div 
                   key={reminder.id}
                   className="absolute left-[80%] z-40 w-56 -translate-y-1/2 group"
                   style={{ top: `${getReminderTop(reminder.time)}%` }}
                 >
                   <div 
                    onClick={() => onToggleReminder(reminder.id)}
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-xl shadow-md border cursor-pointer transition-all hover:scale-105 bg-white ${
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

               {/* Time Indicator */}
               {dateKey === new Date().toISOString().split('T')[0] && (
                  <div className="absolute w-full border-t-[2px] border-red-500 z-30 pointer-events-none" style={{ top: `${((new Date().getHours() * 60 + new Date().getMinutes() - (START_HOUR*60)) / (TOTAL_HOURS * 60)) * 100}%` }}>
                    <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
                  </div>
               )}
            </div>
          </div>
        )}

        {/* MONTH VIEW */}
        {viewMode === 'month' && (
          <div className="h-full p-6 overflow-y-auto bg-white/60">
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
                       className={`relative bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col gap-1 ${isToday ? 'ring-2 ring-blue-500 shadow-blue-100' : ''}`}
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

      {/* FLOATING AI BUTTON - Bottom Right */}
      <div className="fixed bottom-24 right-6 z-50">
        <button
          onClick={() => setShowAI(!showAI)}
          className={`relative group flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-500 ${showAI ? 'bg-white text-slate-900 rotate-90 scale-90' : 'bg-slate-900 text-white hover:scale-110'}`}
        >
           {!showAI && <span className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-20"></span>}
           {showAI ? <X size={24} /> : <Sparkles size={24} className="group-hover:animate-spin" />}
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

      {showAI && <AIModal schedule={schedule.filter(e => e.date === dateKey)} onClose={() => setShowAI(false)} />}
      
      <DeveloperTools onReset={onRefreshData} />
    </div>
  );
};

export default CalendarView;