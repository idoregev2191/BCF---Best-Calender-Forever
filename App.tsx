import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import SignUp from './components/SignUp';
import CalendarView from './components/CalendarView';
import AssignmentsView from './components/AssignmentsView';
import Navbar from './components/Navbar';
import { UserState, MeetEvent, Assignment, UserProgress, AssignmentStatus, StandaloneReminder } from './types';
import { StorageService } from './services/storage';

const App: React.FC = () => {
  const [user, setUser] = useState<UserState | null>(null);
  const [view, setView] = useState<'calendar' | 'assignments'>('calendar');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // State for data
  const [schedule, setSchedule] = useState<MeetEvent[]>([]);
  const [generalAssignments, setGeneralAssignments] = useState<Assignment[]>([]);
  const [reminders, setReminders] = useState<StandaloneReminder[]>([]);
  const [taskStatus, setTaskStatus] = useState<UserProgress>({});

  // 1. Load User on Mount
  useEffect(() => {
    const existingUser = StorageService.getUser();
    if (existingUser) {
      handleDataLoad(existingUser);
    }
  }, []);

  const handleDataLoad = (userData: UserState) => {
    setUser(userData);
    const { schedule, generalAssignments } = StorageService.getEvents(userData.cohort, userData.group);
    setSchedule(schedule);
    setGeneralAssignments(generalAssignments);
    setReminders(StorageService.getReminders());
    setTaskStatus(StorageService.getTaskProgress());
  };

  const handleSignUp = (userData: UserState) => {
    StorageService.saveUser(userData);
    handleDataLoad(userData);
  };

  const handleTaskStatusChange = (id: string, newStatus: AssignmentStatus) => {
    const updatedStatus = StorageService.updateTaskStatus(id, newStatus);
    setTaskStatus(updatedStatus);
  };

  const handleAddEvent = (newEvent: MeetEvent) => {
    StorageService.addEvent(newEvent);
    // Refresh to ensure overrides work if using add
    handleRefreshData();
  };

  // Handle Event Update (Demo Override)
  const handleUpdateEvent = (updatedEvent: MeetEvent) => {
     StorageService.updateEvent(updatedEvent);
     handleRefreshData();
  };

  // Handle Event Deletion
  const handleDeleteEvent = (id: string) => {
    StorageService.deleteEvent(id);
    setSchedule(prev => prev.filter(e => e.eventId !== id));
  };

  const handleImportEvents = (events: MeetEvent[]) => {
      StorageService.importEvents(events);
      if (user) {
        const { schedule } = StorageService.getEvents(user.cohort, user.group);
        setSchedule(schedule);
      }
  };

  const handleAddReminder = (reminder: StandaloneReminder) => {
      StorageService.addReminder(reminder);
      setReminders(prev => [...prev, reminder]);
  };

  const handleToggleReminder = (id: string) => {
      const updated = StorageService.toggleReminder(id);
      setReminders(updated);
  };

  const handleRefreshData = () => {
      if (user) handleDataLoad(user);
  };

  if (!user) {
    return (
      <Layout>
        <SignUp onComplete={handleSignUp} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div key={view} className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out h-full flex flex-col">
        {view === 'calendar' ? (
          <CalendarView 
            user={user}
            schedule={schedule}
            reminders={reminders}
            onAddEvent={handleAddEvent}
            onImportEvents={handleImportEvents}
            onAddReminder={handleAddReminder}
            onToggleReminder={handleToggleReminder}
            onDeleteEvent={handleDeleteEvent}
            onRefreshData={handleRefreshData}
          />
        ) : (
          <AssignmentsView 
            user={user}
            schedule={schedule}
            generalAssignments={generalAssignments}
            taskStatus={taskStatus}
            onStatusChange={handleTaskStatusChange}
          />
        )}
      </div>
      <Navbar currentView={view} setView={setView} />
    </Layout>
  );
};

export default App;