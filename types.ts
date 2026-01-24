export interface Assignment {
  assignmentId: string;
  title: string;
  description: string;
  dueDate: string;
  submissionLink?: string;
  relatedEventIds?: string[];
}

export interface MeetEvent {
  eventId: string;
  googleEventId?: string; 
  calendarId?: string; // To know which calendar it belongs to
  title: string;
  type: 'lecture' | 'lab' | 'personal' | 'workshop' | 'break' | 'meal';
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  platform?: string; 
  meetLink?: string;
  reminders?: string[]; 
  assignments?: Assignment[];
  notes?: string;
  color?: string; // For Google Calendar colors
}

export interface GoogleCalendarInfo {
  id: string;
  summary: string;
  backgroundColor?: string;
  selected: boolean;
}

export interface StandaloneReminder {
  id: string;
  text: string;
  date: string;
  time: string;
  isCompleted: boolean;
}

export interface GroupData {
  groupMentor: string;
  schedule: MeetEvent[];
  generalAssignments: Assignment[];
}

export interface CohortGroups {
  [key: string]: GroupData;
}

export interface CohortData {
  description: string;
  groups: CohortGroups;
}

export interface MeetData {
  cohorts: {
    [key: string]: CohortData;
  };
}

export interface UserState {
  name: string;
  cohort: string;
  group: string;
  avatar?: string;
}

export type AssignmentStatus = 'done' | 'not done' | 'on progress';

export interface UserProgress {
  [assignmentId: string]: AssignmentStatus;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface MicrofeedbackData {
  eventId: string;
  fullName?: string;
  nationality: 'Israeli' | 'Palestinian' | '';
  gender: 'Male' | 'Female' | 'Other' | '';
  enjoyability: number; // 1-5
  difficulty: number; // 1-5
  zone: 'Comfort' | 'Stretch' | 'Panic' | ''; 
  neededHelp: 'Yes' | 'No' | '';
  howGotHelp?: string;
  prideProject: 'Very Proud' | 'Proud' | 'Neutral' | 'Not Proud' | 'Not Proud at all' | '';
  prideCS: 'Very Proud' | 'Proud' | 'Neutral' | 'Not Proud' | 'Not Proud at all' | '';
  comments?: string;
  submittedAt: string;
}