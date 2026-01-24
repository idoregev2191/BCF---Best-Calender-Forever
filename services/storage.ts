import { MeetEvent, Assignment, AssignmentStatus, UserState, UserProgress, StandaloneReminder, MicrofeedbackData } from '../types';
import { MEET_DATA } from '../constants';

const STORAGE_KEYS = {
  USER: 'bcf_user',
  CUSTOM_EVENTS: 'bcf_custom_events',
  REMINDERS: 'bcf_reminders',
  TASK_STATUS: 'bcf_task_status',
  MICROFEEDBACK: 'bcf_microfeedback',
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

    // 2. Get Custom User Events (and Overrides) from LocalStorage
    const customEventsRaw = localStorage.getItem(STORAGE_KEYS.CUSTOM_EVENTS);
    const customEvents: MeetEvent[] = customEventsRaw ? JSON.parse(customEventsRaw) : [];

    // 3. Merge Strategy: Custom Events overwrite Static Events if IDs match
    const eventMap = new Map<string, MeetEvent>();
    
    // First, populate with static
    staticSchedule.forEach(evt => eventMap.set(evt.eventId, evt));
    
    // Then, overlay custom events (this allows "editing" static events by saving a custom event with same ID)
    customEvents.forEach(evt => eventMap.set(evt.eventId, evt));

    return {
      schedule: Array.from(eventMap.values()),
      generalAssignments: staticAssignments
    };
  },

  addEvent: (event: MeetEvent) => {
    const customEventsRaw = localStorage.getItem(STORAGE_KEYS.CUSTOM_EVENTS);
    const customEvents: MeetEvent[] = customEventsRaw ? JSON.parse(customEventsRaw) : [];
    customEvents.push(event);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_EVENTS, JSON.stringify(customEvents));
  },

  // Updates an event. If it was static, it now becomes a "custom override".
  updateEvent: (updatedEvent: MeetEvent) => {
    const customEventsRaw = localStorage.getItem(STORAGE_KEYS.CUSTOM_EVENTS);
    let customEvents: MeetEvent[] = customEventsRaw ? JSON.parse(customEventsRaw) : [];
    
    // Remove existing entry for this ID if it exists in custom
    customEvents = customEvents.filter(e => e.eventId !== updatedEvent.eventId);
    // Add the updated version
    customEvents.push(updatedEvent);
    
    localStorage.setItem(STORAGE_KEYS.CUSTOM_EVENTS, JSON.stringify(customEvents));
  },

  deleteEvent: (eventId: string) => {
    const customEventsRaw = localStorage.getItem(STORAGE_KEYS.CUSTOM_EVENTS);
    let customEvents: MeetEvent[] = customEventsRaw ? JSON.parse(customEventsRaw) : [];
    customEvents = customEvents.filter(e => e.eventId !== eventId);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_EVENTS, JSON.stringify(customEvents));
  },

  // Bulk import to prevent crash
  importEvents: (events: MeetEvent[]) => {
    const customEventsRaw = localStorage.getItem(STORAGE_KEYS.CUSTOM_EVENTS);
    const customEvents: MeetEvent[] = customEventsRaw ? JSON.parse(customEventsRaw) : [];
    
    // Create a Set of existing IDs to prevent duplicates
    const existingIds = new Set(customEvents.map(e => e.eventId));
    const newUniqueEvents = events.filter(e => !existingIds.has(e.eventId));

    if (newUniqueEvents.length > 0) {
        const updated = [...customEvents, ...newUniqueEvents];
        localStorage.setItem(STORAGE_KEYS.CUSTOM_EVENTS, JSON.stringify(updated));
    }
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

  // Microfeedback Management
  saveMicrofeedback: (data: MicrofeedbackData) => {
    const allFeedbackRaw = localStorage.getItem(STORAGE_KEYS.MICROFEEDBACK);
    const allFeedback = allFeedbackRaw ? JSON.parse(allFeedbackRaw) : {};
    allFeedback[data.eventId] = data;
    localStorage.setItem(STORAGE_KEYS.MICROFEEDBACK, JSON.stringify(allFeedback));
  },

  getMicrofeedback: (eventId: string): MicrofeedbackData | null => {
    const allFeedbackRaw = localStorage.getItem(STORAGE_KEYS.MICROFEEDBACK);
    const allFeedback = allFeedbackRaw ? JSON.parse(allFeedbackRaw) : {};
    return allFeedback[eventId] || null;
  }
};