export interface Assignment {
  assignmentId: string;
  title: string;
  description: string;
  dueDate: string;
  submissionLink?: string;
}

export interface MeetEvent {
  eventId: string;
  title: string;
  type: 'lecture' | 'lab' | 'personal' | 'workshop';
  date: string;
  startTime: string;
  endTime: string;
  platform?: string;
  meetLink?: string;
  reminders?: string[];
  assignments?: Assignment[];
  notes?: string;
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
  userPersonalEventsTemplate?: MeetEvent;
}

export interface UserState {
  name: string;
  cohort: string;
  group: string;
  avatar?: string;
}

// Assignment Status tracking
export type AssignmentStatus = 'done' | 'not done' | 'on progress';

export interface UserProgress {
  [assignmentId: string]: AssignmentStatus;
}