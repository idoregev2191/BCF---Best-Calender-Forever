import React, { useState, useEffect, useRef } from 'react';
import { UserState, MeetEvent } from '../types';
import { Plus, Calendar as CalendarIcon, RefreshCw, Loader2, ShieldCheck, CheckCircle2, AlertTriangle, Copy, Info, Server, ExternalLink } from 'lucide-react';
import EventModal from './EventModal';
import AddEventModal from './AddEventModal';
import { GoogleCalendarService } from '../services/googleCalendar';

interface CalendarViewProps {
  user: UserState;
  schedule: MeetEvent[];
  onAddEvent: (event: MeetEvent) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ user, schedule, onAddEvent }) => {
  const [selectedEvent, setSelectedEvent] = useState<MeetEvent | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeDate, setActiveDate] = useState<string>('');
  const dateStripRef = useRef<HTMLDivElement>(null);

  // Google Sync States
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  
  // Current Origin Detection
  const [currentOrigin, setCurrentOrigin] = useState('');
  const [isBlockedDomain, setIsBlockedDomain] = useState(false);

  // Initialize Google Service silently on mount
  useEffect(() => {
    const origin = window.location.origin;
    setCurrentOrigin(origin);
    
    // Check if we are on a domain known to be blocked by Google OAuth (Preview environments)
    if (origin.includes('googleusercontent.com') || origin.includes('web.app') || origin.includes('stackblitz')) {
      setIsBlockedDomain(true);
    }

    GoogleCalendarService.initialize().catch(e => console.log("GAPI lazy load pending..."));
  }, []);

  const handleGoogleSyncStart = () => {
    setSyncError(null);
    setShowSyncModal(true);
  };

  const executeGoogleSync = async () => {
    setIsSyncing(true);
    setSyncError(null);
    
    try {
      // 1. Trigger Auth Popup
      const isAuthenticated = await GoogleCalendarService.authenticate();
      
      if (isAuthenticated) {
         // 2. Fetch Real Data
         const events = await GoogleCalendarService.fetchEvents();
         
         // 3. Add to Calendar
         let addedCount = 0;
         events.forEach(event => {
           onAddEvent(event);
           addedCount++;
         });
         
         if (addedCount === 0) {
            // Success but no events
            setTimeout(() => setShowSyncModal(false), 1500);
         } else {
            // Success with events
            setTimeout(() => setShowSyncModal(false), 1500);
         }
      } else {
        // User closed popup or auth failed silently
        setIsSyncing(false);
      }
    } catch (error: any) {
      console.error("Sync failed", error);
      let msg = "Connection failed.";
      
      // Smart Error Handling
      if (error?.result?.error?.code === 400 || error?.message?.includes("origin") || JSON.stringify(error).includes("origin")) {
        msg = "Security Error: Origin Mismatch";
      } else if (error?.message?.includes("popup")) {
        msg = "Popup blocked. Please allow popups for this site.";
      } else if (error?.result?.error?.message) {
        msg = error.result.error.message;
      }
      
      setSyncError(msg);
      setIsSyncing(false);
    }
  };

  // Group events by date
  const eventsByDate: {[date: string]: MeetEvent[]} = {};
  
  // Sort events chronologically
  const sortedEvents = [...schedule].sort((a, b) => {
    const timeA = new Date(`${a.date}T${a.startTime}`).getTime();
    const timeB = new Date(`${b.date}T${b.startTime}`).getTime();
    return timeA - timeB;
  });

  sortedEvents.forEach(event => {
    if (!eventsByDate[event.date]) {
      eventsByDate[event.date] = [];
    }
    eventsByDate[event.date].push(event);
  });

  const dates = Object.keys(eventsByDate).sort();

  // Set initial active date
  useEffect(() => {
    if (dates.length > 0 && !activeDate) {
      setActiveDate(dates[0]);
    }
  }, [dates, activeDate]);

  const handleDateClick = (dateStr: string) => {
    setActiveDate(dateStr);
    const element = document.getElementById(`date-header-${dateStr}`);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 180;
      window.scrollTo({top: y, behavior: 'smooth'});
    }
  };

  const getDayName = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
  const getDayNum = (dateStr: string) => new Date(dateStr).getDate();
  const getMonthName = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short' });

  // Get current greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="relative min-h-screen pb-32 flex flex-col md:flex-row md:h-screen md:overflow-hidden">
      
      {/* LEFT PANE (Mobile: Top Header / Desktop: Sidebar) */}
      <div className="bg-white/90 backdrop-blur-md sticky top-0 z-30 pt-12 pb-4 px-6 border-b border-slate-200/60 shadow-sm md:w-80 md:border-r md:border-b-0 md:h-full md:flex md:flex-col md:bg-white md:z-40">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{greeting}, {user.name.split(' ')[0]}</p>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5">Schedule</h1>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="md:hidden bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg shadow-blue-600/20 transition-transform active:scale-95"
          >
            <Plus size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Sync Button */}
        <button 
          onClick={handleGoogleSyncStart}
          className="w-full mb-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm group"
        >
          <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
          Sync Google Calendar
        </button>

        {/* Date Strip */}
        <div 
          ref={dateStripRef}
          className="flex md:flex-col gap-3 overflow-x-auto no-scrollbar snap-x pb-2 -mx-6 px-6 md:mx-0 md:px-0 md:flex-1 md:overflow-y-auto"
        >
          {dates.length > 0 ? dates.map((dateStr) => {
            const isActive = activeDate === dateStr;
            const hasAssignments = eventsByDate[dateStr].some(e => e.assignments && e.assignments.length > 0);
            return (
              <button
                key={dateStr}
                onClick={() => handleDateClick(dateStr)}
                className={`snap-start flex-shrink-0 flex md:flex-row md:justify-between md:px-4 md:py-3 flex-col items-center justify-center w-[62px] h-[74px] md:w-full md:h-auto rounded-2xl transition-all duration-200 border tap-active ${
                  isActive 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-105 md:scale-100' 
                    : 'bg-white md:bg-transparent text-slate-500 border-slate-200 md:border-transparent hover:bg-slate-50'
                }`}
              >
                 <div className="flex flex-col md:flex-row md:items-center md:gap-3 items-center">
                   <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${isActive ? 'text-slate-400' : 'text-slate-400'}`}>
                     {getDayName(dateStr)}
                   </span>
                   <span className="text-xl md:text-lg font-bold mt-0.5 md:mt-0">{getDayNum(dateStr)}</span>
                 </div>
                 {hasAssignments && (
                   <div className={`mt-1.5 md:mt-0 w-1.5 h-1.5 rounded-full ${isActive ? 'bg-red-500' : 'bg-red-500'}`}></div>
                 )}
              </button>
            )
          }) : (
             <div className="w-full text-center py-2 text-slate-400 text-sm font-medium">No upcoming days</div>
          )}
        </div>
        
        {/* Desktop Add Button */}
        <button 
          onClick={() => setShowAddModal(true)}
          className="hidden md:flex w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-4 font-bold shadow-lg shadow-blue-600/20 transition-transform active:scale-[0.98] items-center justify-center gap-2"
        >
          <Plus size={20} strokeWidth={2.5} />
          New Event
        </button>
      </div>

      {/* MAIN CONTENT (Events List) */}
      <div className="px-6 pt-6 flex-1 md:overflow-y-auto md:h-full md:bg-slate-50/50">
        {dates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-60 h-full">
             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <CalendarIcon size={32} className="text-slate-300" />
             </div>
             <p className="text-slate-500 font-medium">Your calendar is clear</p>
          </div>
        ) : (
          dates.map((date, dateIdx) => (
            <div key={date} id={`date-header-${date}`} className="mb-8 md:mb-12 scroll-mt-24">
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-6 md:mb-8 sticky top-0 md:static z-10 bg-slate-50/95 py-2 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none">
                 <div className="h-px bg-slate-200 flex-1"></div>
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                   {getDayName(date)}, {getMonthName(date)} {getDayNum(date)}
                 </span>
                 <div className="h-px bg-slate-200 flex-1"></div>
              </div>

              {/* Responsive Grid for Events */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-4">
                {eventsByDate[date].map((event, idx) => {
                  const isLecture = event.type === 'lecture';
                  const isLab = event.type === 'lab';
                  const isPersonal = event.type === 'personal';
                  const isWorkshop = event.type === 'workshop';
                  
                  // MEET Brand colors
                  const accentColor = isLecture ? 'bg-blue-600' : isLab ? 'bg-slate-800' : isPersonal ? 'bg-emerald-500' : isWorkshop ? 'bg-orange-500' : 'bg-slate-400';
                  
                  return (
                    <div 
                      key={event.eventId}
                      onClick={() => setSelectedEvent(event)}
                      className="group cursor-pointer relative flex flex-col h-full"
                    >
                      {/* Card */}
                      <div className={`flex-1 bg-white rounded-2xl p-5 shadow-sm border border-slate-100 transition-all duration-300 tap-active hover:shadow-lg hover:border-blue-100 hover:-translate-y-1 overflow-hidden flex flex-col`}>
                        {/* Color Bar */}
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${accentColor}`}></div>
                        
                        <div className="pl-3 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                             <div className="flex flex-wrap items-center gap-2">
                               <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded uppercase tracking-wide ${accentColor}`}>
                                 {event.type}
                               </span>
                             </div>
                             <span className="text-xs font-bold text-slate-400 tabular-nums bg-slate-50 px-1.5 py-0.5 rounded">
                               {event.startTime}
                             </span>
                          </div>
                          
                          <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors mb-2">
                            {event.title}
                          </h3>

                          {(event.platform || event.meetLink) && (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-3">
                               <div className={`w-1.5 h-1.5 rounded-full ${isLecture ? 'bg-blue-400' : 'bg-slate-300'}`}></div>
                               {event.platform || 'In Person'}
                            </div>
                          )}
                          
                          <div className="mt-auto flex items-center gap-2 pt-3 border-t border-slate-50">
                             {event.assignments && event.assignments.length > 0 ? (
                                 <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded flex items-center gap-1 w-max">
                                   {event.assignments.length} Tasks Due
                                 </span>
                               ) : (
                                 <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">No Homework</span>
                               )}
                             
                             {event.reminders && event.reminders.length > 0 && (
                               <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded flex items-center gap-1 w-max">
                                 {event.reminders.length} Reminders
                               </span>
                             )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}

      {showAddModal && (
        <AddEventModal onClose={() => setShowAddModal(false)} onAdd={onAddEvent} />
      )}

      {/* Sync Modal - APPLE STYLE GLASS */}
      {showSyncModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
           <div 
             className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300" 
             onClick={() => !isSyncing && setShowSyncModal(false)}
           ></div>
           
           <div className="relative bg-white/95 backdrop-blur-2xl rounded-[32px] p-8 max-w-sm w-full shadow-[0_20px_60px_-10px_rgba(0,0,0,0.3)] border border-white/40 animate-in zoom-in-95 duration-300 flex flex-col">
              
              {!isSyncing && !syncError && !isBlockedDomain ? (
                <>
                   <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
                     <ShieldCheck size={36} className="text-white" strokeWidth={2.5} />
                   </div>
                   
                   <h3 className="text-2xl font-bold text-center text-slate-900 mb-3 tracking-tight">Sync Calendar</h3>
                   <p className="text-slate-500 text-center text-sm font-medium leading-relaxed mb-6 px-2">
                     Merge your personal Google Calendar events directly into your BCF schedule.
                   </p>

                   <div className="bg-blue-50 rounded-xl p-3 mb-6 border border-blue-100">
                     <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                       <Info size={12}/> Configuration Info
                     </p>
                     <p className="text-xs text-slate-600 leading-snug mb-2">
                       Make sure this URL is in your Google Cloud Console "Authorized JavaScript origins":
                     </p>
                     <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-blue-100">
                        <code className="text-[10px] font-mono text-slate-600 break-all flex-1">{currentOrigin}</code>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(currentOrigin);
                            const btn = document.getElementById('copy-origin-btn');
                            if(btn) btn.classList.add('text-green-500');
                            setTimeout(() => btn && btn.classList.remove('text-green-500'), 1000);
                          }} 
                          id="copy-origin-btn"
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Copy size={14}/>
                        </button>
                     </div>
                   </div>

                   <div className="space-y-3 mt-auto">
                     <button 
                       onClick={executeGoogleSync}
                       className="w-full py-4 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] flex items-center justify-center gap-2"
                     >
                       <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" />
                       Continue with Google
                     </button>
                     <button 
                       onClick={() => setShowSyncModal(false)}
                       className="w-full py-4 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-colors"
                     >
                       Not Now
                     </button>
                   </div>
                </>
              ) : isBlockedDomain ? (
                // PREVIEW DOMAIN BLOCK SCREEN
                <>
                   <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-100">
                     <Server size={32} className="text-amber-500" />
                   </div>
                   
                   <h3 className="text-2xl font-bold text-center text-slate-900 mb-3 tracking-tight">Preview Environment</h3>
                   <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-6">
                      <p className="text-sm text-slate-700 leading-relaxed font-medium mb-2">
                        Google blocks API access from temporary preview domains (like the one you are using now).
                      </p>
                      <p className="text-xs text-slate-500">
                        To make this feature work, you need to host this app on a real domain (like Vercel or Netlify).
                      </p>
                   </div>
                   
                   <div className="space-y-3">
                     <a 
                       href="https://vercel.com/new" 
                       target="_blank" 
                       rel="noreferrer"
                       className="w-full py-4 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2"
                     >
                       Deploy on Vercel (Free) <ExternalLink size={16}/>
                     </a>
                     <button 
                       onClick={() => setShowSyncModal(false)}
                       className="w-full py-4 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-colors"
                     >
                       Close
                     </button>
                   </div>
                </>
              ) : isSyncing ? (
                <div className="text-center py-10">
                   <div className="relative w-16 h-16 mx-auto mb-6">
                      <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                   </div>
                   <h3 className="text-xl font-bold text-slate-900">Connecting...</h3>
                   <p className="text-sm text-slate-400 mt-2 font-medium">Please check the popup window</p>
                </div>
              ) : (
                <div className="text-center py-6">
                   <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                     <AlertTriangle size={32} className="text-red-500" />
                   </div>
                   <h3 className="text-lg font-bold text-slate-900 mb-2">Sync Failed</h3>
                   <p className="text-xs text-slate-500 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                     {syncError}
                   </p>
                   
                   {/* DYNAMIC ORIGIN HELPER IN ERROR STATE TOO */}
                   <div className="mb-6 bg-blue-50 p-3 rounded-xl border border-blue-100 text-left">
                     <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-1">Your App Origin:</p>
                     <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-blue-100">
                       <code className="text-[10px] font-mono text-slate-600 break-all flex-1">{currentOrigin}</code>
                       <button onClick={() => navigator.clipboard.writeText(currentOrigin)} className="text-blue-600 hover:text-blue-800"><Copy size={14}/></button>
                     </div>
                   </div>

                   <button 
                     onClick={() => { setSyncError(null); setIsSyncing(false); }}
                     className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl"
                   >
                     Try Again
                   </button>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;