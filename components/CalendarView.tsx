import React, { useState, useEffect } from 'react';
import { UserState, MeetEvent, StandaloneReminder, GoogleCalendarInfo } from '../types';
import { Plus, ChevronLeft, ChevronRight, Clock, MapPin, Check, RefreshCw, Sparkles, CalendarDays, MoreHorizontal } from 'lucide-react';
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

// --- VISUAL STYLE ALGORITHM ---
const getMeetEventStyle = (event: MeetEvent, isGoogle: boolean) => {
    // 1. Google Override - PREMIUM LOOK
    if (isGoogle) {
        // Generate a stable color based on the title
        let hash = 0;
        for (let i = 0; i < event.title.length; i++) hash = event.title.charCodeAt(i) + ((hash << 5) - hash);
        const h = Math.abs(hash) % 360;
        
        return {
            bg: "bg-white", 
            border: `border-l-4`, // We will apply the color via style prop to border-color
            borderColor: `hsl(${h}, 70%, 50%)`,
            text: "text-slate-800",
            subText: "text-slate-500",
            accent: `hsl(${h}, 70%, 60%)`,
            icon: "text-slate-400",
            shadow: "shadow-sm border-y border-r border-slate-200",
            isGoogle: true
        };
    }

    const titleUpper = event.title.toUpperCase();
    const typeUpper = event.type.toUpperCase();

    // CS / Tech -> Deep Blue
    if (titleUpper.includes("CS") || titleUpper.includes("PYTHON") || titleUpper.includes("JAVA") || titleUpper.includes("CODE")) {
        return {
            bg: "bg-[#E0F2FE]", // Sky 100
            border: "border border-[#7DD3FC]", // Sky 300
            text: "text-[#0C4A6E]", // Sky 900
            subText: "text-[#0369A1]",
            accent: "bg-[#0284C7]",
            icon: "text-[#0284C7]",
            shadow: "shadow-sm"
        };
    }

    // ENT / Business -> Warm Yellow
    if (titleUpper.includes("ENT") || titleUpper.includes("BUSINESS") || titleUpper.includes("PITCH") || titleUpper.includes("VALUE")) {
        return {
            bg: "bg-[#FEF3C7]", // Amber 100
            border: "border border-[#FCD34D]", // Amber 300
            text: "text-[#78350F]", // Amber 900
            subText: "text-[#92400E]",
            accent: "bg-[#D97706]",
            icon: "text-[#D97706]",
            shadow: "shadow-sm"
        };
    }

    // DU / Design -> Vivid Pink
    if (titleUpper.includes("DU") || titleUpper.includes("DESIGN") || titleUpper.includes("UX") || titleUpper.includes("WIREFRAM")) {
        return {
            bg: "bg-[#FCE7F3]", // Pink 100
            border: "border border-[#F9A8D4]", // Pink 300
            text: "text-[#831843]", // Pink 900
            subText: "text-[#9D174D]",
            accent: "bg-[#DB2777]",
            icon: "text-[#DB2777]",
            shadow: "shadow-sm"
        };
    }

    // MEALS -> Fresh Orange
    if (typeUpper === 'MEAL' || titleUpper.includes("LUNCH") || titleUpper.includes("DINNER") || titleUpper.includes("BREAKFAST")) {
        return {
            bg: "bg-[#FFEDD5]", // Orange 100
            border: "border border-[#FDBA74]", // Orange 300
            text: "text-[#7C2D12]", // Orange 900
            subText: "text-[#9A3412]",
            accent: "bg-[#EA580C]",
            icon: "text-[#EA580C]",
            shadow: "shadow-sm"
        };
    }

    // BREAKS -> Minimal Slate/Gray
    if (typeUpper === 'BREAK' || titleUpper.includes("MOVING")) {
        return {
            bg: "bg-[#F1F5F9]", // Slate 100
            border: "border border-slate-300 border-dashed", 
            text: "text-[#475569]", // Slate 600
            subText: "text-[#64748B]",
            accent: "bg-[#94A3B8]",
            icon: "text-[#64748B]",
            shadow: "shadow-none",
            isBreak: true
        };
    }

    // PERSONAL / SOCIAL -> Purple
    if (typeUpper === 'PERSONAL' || titleUpper.includes("SOCIAL") || titleUpper.includes("FUN") || titleUpper.includes("CLOSING") || titleUpper.includes("OPENING") || titleUpper.includes("WELCOME")) {
        return {
            bg: "bg-[#F3E8FF]", // Purple 100
            border: "border border-[#D8B4FE]", // Purple 300
            text: "text-[#581C87]", // Purple 900
            subText: "text-[#7E22CE]",
            accent: "bg-[#9333EA]",
            icon: "text-[#9333EA]",
            shadow: "shadow-sm"
        };
    }

    // Default
    return {
        bg: "bg-white",
        border: "border border-slate-200",
        text: "text-slate-900",
        subText: "text-slate-500",
        accent: "bg-slate-400",
        icon: "text-slate-400",
        shadow: "shadow-sm"
    };
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
  
  // Use Jan 27, 2026 for demo purposes as requested, but easily swappable
  const [currentDate, setCurrentDate] = useState(new Date("2026-01-27T10:00:00"));

  const [selectedEvent, setSelectedEvent] = useState<MeetEvent | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAI, setShowAI] = useState(false);
  
  // Current Time Line
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000); 
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
  const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNum = currentDate.toLocaleDateString('en-US', { day: 'numeric' });
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // GRID SETTINGS
  const START_HOUR = 8;
  const END_HOUR = 20; // 8 PM
  const TOTAL_HOURS = END_HOUR - START_HOUR;
  const timeSlots = Array.from({ length: TOTAL_HOURS }, (_, i) => i + START_HOUR);

  const getMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };
  
  // Layout Algorithm
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
    const rawHeight = ((endTotal - startTotal) / totalDayMinutes) * 100;
    const height = Math.max(rawHeight, 3); // Minimum visible height
    
    return { top: `${top}%`, height: `${height}%` };
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
  const isToday = dateKey === new Date().toISOString().split('T')[0];

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
    <div className="flex flex-col h-full w-full bg-[#F8FAFC]">
      
      {/* --- 1. DEDICATED HEADER --- */}
      <div className="flex-none bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-[0_2px_10px_rgba(0,0,0,0.03)] z-50">
         
         {/* Branding & Date */}
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 flex flex-wrap gap-0.5 items-center justify-center bg-slate-900 rounded-lg p-1">
                   <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                   <div className="w-2.5 h-2.5 bg-amber-400 rounded-tr-md rounded-bl-md"></div>
                   <div className="w-2.5 h-2.5 bg-pink-500 rounded-tl-md rounded-br-md"></div>
                   <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
               </div>
               <span className="font-black text-2xl text-slate-900 tracking-tight">bcf<span className="text-blue-500">.</span></span>
            </div>

            <div className="h-8 w-px bg-slate-200"></div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                    <button onClick={handlePrev} className="p-2 hover:bg-white rounded-md text-slate-500 hover:text-slate-900 shadow-sm transition-all"><ChevronLeft size={16} strokeWidth={3} /></button>
                    <button onClick={handleNext} className="p-2 hover:bg-white rounded-md text-slate-500 hover:text-slate-900 shadow-sm transition-all"><ChevronRight size={16} strokeWidth={3} /></button>
                </div>
                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900">{dayName}</span>
                        <span className="text-xl font-medium text-slate-400">{dayNum}, {monthYear}</span>
                    </div>
                </div>
                <button onClick={handleToday} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-blue-100 transition-colors">
                    {isToday ? 'Today' : 'Reset'}
                </button>
            </div>
         </div>

         {/* Actions */}
         <div className="flex gap-3">
            <button 
                onClick={initGoogleSync} 
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm active:scale-95"
            >
               {isSyncing ? (
                 <RefreshCw size={18} className="animate-spin text-blue-500"/> 
               ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                    <g transform="matrix(1, 0, 0, 1, 0, 0)">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </g>
                </svg>
               )}
               <span className="font-bold text-sm text-slate-700">Sync</span>
            </button>
            <button 
                onClick={() => setShowAddModal(true)} 
                className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 active:scale-95"
            >
               <Plus size={18} strokeWidth={3} />
               <span className="font-bold text-sm">Add Event</span>
            </button>
         </div>
      </div>

      {/* --- 2. MAIN SCROLLABLE AREA --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#F8FAFC]">
        
        {viewMode === 'day' && (
          <div className="w-full relative flex min-h-[1000px]"> 
            
            {/* Sidebar Time Axis */}
            <div className="w-20 flex-shrink-0 bg-white border-r border-slate-200 pt-4 z-20">
               {timeSlots.map(hour => (
                   <div key={hour} className="relative h-[8.33%] text-right pr-4"> 
                     <span className="text-xs font-bold text-slate-400 -top-2 relative">{hour}:00</span>
                   </div>
               ))}
            </div>

            {/* Event Grid */}
            <div className="flex-1 relative bg-white">
               {/* Horizontal Lines */}
               {timeSlots.map(hour => (
                 <div key={hour} className="absolute w-full border-t border-slate-100" style={{ top: `${((hour - START_HOUR) / TOTAL_HOURS) * 100}%` }} />
               ))}

               {/* Current Time Indicator */}
               {isToday && ( 
                   <div 
                     className="absolute w-full flex items-center z-30 pointer-events-none transition-all duration-1000"
                     style={{ top: `${getCurrentTimeTop()}%` }}
                   >
                     <div className="w-full border-t-2 border-red-500"></div>
                     <div className="absolute -left-1 w-2 h-2 bg-red-500 rounded-full shadow-sm"></div>
                   </div>
               )}

               {/* Events */}
               {layoutEvents.map(event => {
                  const style = getPositionStyle(event.startTime, event.endTime);
                  const isGoogle = !!event.googleEventId;
                  const theme = getMeetEventStyle(event, isGoogle);
                  
                  return (
                    <div
                      key={event.eventId}
                      onClick={() => setSelectedEvent(event)}
                      className={`
                        absolute rounded-[8px] px-3 py-2 cursor-pointer transition-all duration-200 overflow-hidden flex flex-col justify-start gap-0.5
                        ${theme.bg} ${theme.border} ${theme.shadow}
                        group hover:z-50 hover:shadow-xl hover:scale-[1.01] hover:-translate-y-0.5
                      `}
                      style={{ 
                        top: style.top, 
                        height: style.height,
                        left: `calc(${event.left}% + 4px)`, 
                        width: `calc(${event.width}% - 8px)`,
                        zIndex: event.left > 0 ? 20 : 10,
                        borderColor: isGoogle ? theme.borderColor : undefined // Apply specific google color
                      }}
                    >
                      <div className="flex flex-col h-full">
                         <div className="flex justify-between items-start">
                            <h4 className={`font-bold text-sm leading-tight ${theme.text} line-clamp-2`}>
                                {event.title}
                            </h4>
                            {isGoogle && (
                                <span className="text-[10px] font-bold text-slate-300 bg-slate-100 px-1 rounded ml-1 flex-shrink-0">G</span>
                            )}
                         </div>

                         {!theme.isBreak && (
                             <div className={`mt-auto flex flex-col ${theme.subText}`}>
                                <div className="flex items-center gap-1 text-[10px] font-bold uppercase">
                                   <Clock size={10} strokeWidth={2.5} className={theme.icon} /> 
                                   {event.startTime} - {event.endTime}
                                </div>
                                {event.platform && (
                                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase truncate">
                                       <MapPin size={10} strokeWidth={2.5} className={theme.icon} />
                                       <span className="truncate">{event.platform}</span>
                                    </div>
                                )}
                             </div>
                         )}
                      </div>
                    </div>
                  );
               })}
            </div>
          </div>
        )}

        {/* MONTH VIEW */}
        {viewMode === 'month' && (
          <div className="p-8">
             <div className="grid grid-cols-7 mb-4 text-center">
               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                 <div key={d} className="text-xs font-black text-slate-300 uppercase tracking-widest">{d}</div>
               ))}
             </div>
             <div className="grid grid-cols-7 auto-rows-fr gap-4 h-full min-h-[600px]">
                {emptyDays.map(d => <div key={`empty-${d}`}></div>)}
                {monthDays.map(day => {
                   const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
                   const dayEvents = schedule.filter(e => e.date === dateStr);
                   const isTodayDay = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                   
                   return (
                     <div 
                       key={day} 
                       className={`relative bg-white p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 min-h-[120px] hover:shadow-lg ${isTodayDay ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-100 hover:border-blue-200'}`}
                       onClick={() => {
                         setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
                         setViewMode('day');
                       }}
                     >
                        <span className={`text-sm font-black w-8 h-8 flex items-center justify-center rounded-full ${isTodayDay ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>{day}</span>
                        <div className="flex flex-col gap-1.5 mt-2">
                          {dayEvents.slice(0, 4).map(e => {
                             const theme = getMeetEventStyle(e, !!e.googleEventId);
                             return (
                                 <div key={e.eventId} className={`w-full h-1.5 rounded-full ${theme.bg.replace('bg-', 'bg-')}`} style={{ backgroundColor: theme.accent ? '' : theme.borderColor }}></div>
                             );
                          })}
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
          className={`flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 ${
              showAI ? 'bg-white text-slate-900 rotate-45 border border-slate-200' : 'bg-slate-900 text-white hover:scale-110 hover:shadow-indigo-500/30'
          }`}
        >
           {showAI ? <Plus size={28} /> : <Sparkles size={24} />}
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