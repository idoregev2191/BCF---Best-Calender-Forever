import { MeetData, MeetEvent } from './types';

// Helper to get dynamic date string
const getDate = (offsetDays: number = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

// --- GROUP D DATA (Morning Shift / Screenshots) ---
const generateGroupDDay1 = (dateStr: string): MeetEvent[] => [
  { eventId: `BF-${dateStr}`, title: "Breakfast", type: "meal", date: dateStr, startTime: "08:00", endTime: "09:00", platform: "Dining Hall", color: "#F59E0B" },
  { eventId: `CS1-${dateStr}`, title: "Group D - CS", type: "lecture", date: dateStr, startTime: "09:00", endTime: "10:30", platform: "Error Room", color: "#FBBF24" },
  { eventId: `ENT1-${dateStr}`, title: "Group D - ENT", type: "workshop", date: dateStr, startTime: "10:45", endTime: "12:15", platform: "Error Room", color: "#FBBF24" },
  { eventId: `BREAK-${dateStr}`, title: "Break", type: "break", date: dateStr, startTime: "12:15", endTime: "12:45", platform: "Lounge" },
  { eventId: `CS2-${dateStr}`, title: "Group D - CS", type: "lecture", date: dateStr, startTime: "12:45", endTime: "14:15", platform: "Error Room", color: "#FBBF24" },
  { eventId: `LUNCH-${dateStr}`, title: "Lunch", type: "meal", date: dateStr, startTime: "14:15", endTime: "15:15", platform: "Dining Hall", color: "#F59E0B" },
  { eventId: `DU1-${dateStr}`, title: "Group D - DU", type: "workshop", date: dateStr, startTime: "15:15", endTime: "16:45", platform: "Error Room", color: "#FBBF24" },
  { eventId: `LAB-${dateStr}`, title: "Lab Lounge C+D", type: "lab", date: dateStr, startTime: "17:00", endTime: "18:00", platform: "Magic & Turtle", color: "#F59E0B", notes: "Attendance Mandatory" }
];

const generateGroupDDay2 = (dateStr: string): MeetEvent[] => [
  { eventId: `ENT2-${dateStr}`, title: "Group D - ENT", type: "workshop", date: dateStr, startTime: "09:00", endTime: "10:30", platform: "Magic Room", color: "#FBBF24" },
  { eventId: `DU2-${dateStr}`, title: "Group D - DU", type: "workshop", date: dateStr, startTime: "10:45", endTime: "12:15", platform: "Unicorn Room", color: "#FBBF24" },
  { eventId: `CS3-${dateStr}`, title: "Group D - CS", type: "lecture", date: dateStr, startTime: "12:45", endTime: "14:15", platform: "Error Room", color: "#FBBF24" },
  { eventId: `CS4-${dateStr}`, title: "Group D - CS", type: "lecture", date: dateStr, startTime: "14:45", endTime: "16:15", platform: "Unicorn Room", color: "#FBBF24" },
  { eventId: `LAB2-${dateStr}`, title: "Lab Lounge", type: "lab", date: dateStr, startTime: "17:15", endTime: "18:15", platform: "Seminar Room", notes: "Groups C+D", color: "#F59E0B" },
  { eventId: `DINNER-${dateStr}`, title: "Dinner", type: "meal", date: dateStr, startTime: "18:15", endTime: "19:15", platform: "Dining Hall", color: "#F59E0B" },
  { eventId: `MVP-${dateStr}`, title: "Y3 MVP Launch", type: "personal", date: dateStr, startTime: "19:15", endTime: "20:30", platform: "Auditorium", color: "#F59E0B" },
  { eventId: `FREE-${dateStr}`, title: "Free Time", type: "personal", date: dateStr, startTime: "20:30", endTime: "22:00", color: "#FBBF24" }
];

// --- GROUP B DATA (Late Shift / Different Structure) ---
const generateGroupBDay1 = (dateStr: string): MeetEvent[] => [
  { eventId: `BF-B-${dateStr}`, title: "Late Breakfast", type: "meal", date: dateStr, startTime: "09:30", endTime: "10:30", platform: "Dining Hall", color: "#60A5FA" },
  { eventId: `CS1-B-${dateStr}`, title: "Group B - CS", type: "lecture", date: dateStr, startTime: "10:45", endTime: "12:15", platform: "Target Room", color: "#3B82F6" },
  { eventId: `LUNCH-B-${dateStr}`, title: "Lunch", type: "meal", date: dateStr, startTime: "12:30", endTime: "13:30", platform: "Dining Hall", color: "#60A5FA" },
  { eventId: `ENT-B-${dateStr}`, title: "Group B - ENT", type: "workshop", date: dateStr, startTime: "13:45", endTime: "15:15", platform: "Seminar Room", color: "#3B82F6" },
  { eventId: `LAB-B-${dateStr}`, title: "Lab A+B", type: "lab", date: dateStr, startTime: "15:30", endTime: "17:00", platform: "Computer Lab", color: "#60A5FA" },
  { eventId: `DU-B-${dateStr}`, title: "Group B - DU", type: "workshop", date: dateStr, startTime: "17:15", endTime: "18:45", platform: "Target Room", color: "#3B82F6" }
];

const generateSchedule = (group: string): MeetEvent[] => {
  const events: MeetEvent[] = [];
  for (let i = -5; i < 5; i++) {
    const d = getDate(i);
    if (group === 'GroupD') {
        if (Math.abs(i) % 2 === 0) events.push(...generateGroupDDay1(d));
        else events.push(...generateGroupDDay2(d));
    } else if (group === 'GroupB') {
        events.push(...generateGroupBDay1(d));
    } else {
        // Fallback for A and C
        events.push({ eventId: `GEN-${d}`, title: `${group} Session`, type: 'lecture', date: d, startTime: '10:00', endTime: '12:00', platform: 'Main Hall', color: '#94A3B8' });
    }
  }
  return events;
};

export const MEET_DATA: MeetData = {
  "cohorts": {
    "2025": { 
      "description": "Y3 Cohort",
      "groups": {
        "GroupD": { 
            "groupMentor": "Noa", 
            "schedule": generateSchedule('GroupD'), 
            "generalAssignments": [{ assignmentId: "A1", title: "Submit CS Problem Set", description: "Recursion & Trees", dueDate: getDate(2) }] 
        },
        "GroupB": { 
            "groupMentor": "Yoni", 
            "schedule": generateSchedule('GroupB'), 
            "generalAssignments": [{ assignmentId: "A2", title: "ENT Market Research", description: "Interviews", dueDate: getDate(3) }] 
        },
        "GroupA": { "groupMentor": "Tamar", "schedule": generateSchedule('GroupA'), "generalAssignments": [] },
        "GroupC": { "groupMentor": "David", "schedule": generateSchedule('GroupC'), "generalAssignments": [] }
      }
    },
    "2026": { "description": "Y2 Cohort", "groups": {} },
    "2027": { "description": "Y1 Cohort", "groups": {} }
  }
};