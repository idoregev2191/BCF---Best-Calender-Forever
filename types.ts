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
  title: string;
  type: 'lecture' | 'lab' | 'personal' | 'workshop' | 'break' | 'meal';
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  platform?: string; // Room name or Online platform
  meetLink?: string;
  reminders?: string[]; // Checklist items inside the event
  assignments?: Assignment[];
  notes?: string;
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