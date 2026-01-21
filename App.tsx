import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import SignUp from './components/SignUp';
import CalendarView from './components/CalendarView';
import AssignmentsView from './components/AssignmentsView';
import Navbar from './components/Navbar';
import { UserState, MeetEvent, Assignment, UserProgress, AssignmentStatus } from './types';
import { StorageService } from './services/storage';

const App: React.FC = () => {
  const [user, setUser] = useState<UserState | null>(null);
  const [view, setView] = useState<'calendar' | 'assignments'>('calendar');
  
  // State for data
  const [schedule, setSchedule] = useState<MeetEvent[]>([]);
  const [generalAssignments, setGeneralAssignments] = useState<Assignment[]>([]);
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
    // Refresh local state by appending to existing
    setSchedule(prev => [...prev, newEvent]);
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
      <div className="pb-24 h-full">
        {view === 'calendar' ? (
          <CalendarView 
            user={user} 
            schedule={schedule} 
            onAddEvent={handleAddEvent}
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