import { MeetEvent, Assignment, AssignmentStatus, UserState, UserProgress, StandaloneReminder } from '../types';
import { MEET_DATA } from '../constants';

const STORAGE_KEYS = {
  USER: 'bcf_user',
  CUSTOM_EVENTS: 'bcf_custom_events',
  REMINDERS: 'bcf_reminders',
  TASK_STATUS: 'bcf_task_status',
};

// --- Core Logic ---

export const StorageService = {
  // User Management
  getUser: (): UserState | null => {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  saveUser: (user: UserState) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // Event Management
  getEvents: (cohort: string, group: string): { schedule: MeetEvent[], generalAssignments: Assignment[] } => {
    // 1. Get Static Data from Constants (The "Backend" Data)
    let normalizedCohort = cohort;
    if (["Y3", "y3"].includes(cohort)) normalizedCohort = "2025";
    if (["Y2", "y2"].includes(cohort)) normalizedCohort = "2026";
    if (["Y1", "y1"].includes(cohort)) normalizedCohort = "2027";

    const cohortData = MEET_DATA.cohorts[normalizedCohort];
    const groupData = cohortData?.groups[group];

    const staticSchedule = groupData?.schedule || [];
    const staticAssignments = groupData?.generalAssignments || [];

    // 2. Get Custom User Events from LocalStorage
    const customEventsRaw = localStorage.getItem(STORAGE_KEYS.CUSTOM_EVENTS);
    const customEvents: MeetEvent[] = customEventsRaw ? JSON.parse(customEventsRaw) : [];

    // 3. Merge
    return {
      schedule: [...staticSchedule, ...customEvents],
      generalAssignments: staticAssignments
    };
  },

  addEvent: (event: MeetEvent) => {
    const customEventsRaw = localStorage.getItem(STORAGE_KEYS.CUSTOM_EVENTS);
    const customEvents: MeetEvent[] = customEventsRaw ? JSON.parse(customEventsRaw) : [];
    customEvents.push(event);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_EVENTS, JSON.stringify(customEvents));
  },

  // Reminder Management
  getReminders: (): StandaloneReminder[] => {
    const data = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    return data ? JSON.parse(data) : [];
  },

  addReminder: (reminder: StandaloneReminder) => {
    const reminders = StorageService.getReminders();
    reminders.push(reminder);
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  },

  toggleReminder: (id: string) => {
    const reminders = StorageService.getReminders();
    const updated = reminders.map(r => r.id === id ? { ...r, isCompleted: !r.isCompleted } : r);
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(updated));
    return updated;
  },

  // Task Status Management
  getTaskProgress: (): UserProgress => {
    const data = localStorage.getItem(STORAGE_KEYS.TASK_STATUS);
    return data ? JSON.parse(data) : {};
  },

  updateTaskStatus: (id: string, status: AssignmentStatus) => {
    const current = StorageService.getTaskProgress();
    const updated = { ...current, [id]: status };
    localStorage.setItem(STORAGE_KEYS.TASK_STATUS, JSON.stringify(updated));
    return updated;
  },
};