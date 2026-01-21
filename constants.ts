import { MeetData, MeetEvent } from './types';

// Helper to get dynamic date string
const getDate = (offsetDays: number = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const TODAY = getDate(0);
const TOMORROW = getDate(1);
const YESTERDAY = getDate(-1);

// Using the specific Topic/Lab data provided in the prompt
const generateSchedule = (dateStr: string, variant: number): MeetEvent[] => {
  const commonEvents: MeetEvent[] = [
    {
      eventId: `BREAKFAST-${dateStr}`,
      title: "Breakfast",
      type: "meal",
      date: dateStr,
      startTime: "08:00",
      endTime: "09:00",
      platform: "Dining Hall",
      notes: "Morning fuel"
    },
    {
      eventId: `LUNCH-${dateStr}`,
      title: "Lunch",
      type: "meal",
      date: dateStr,
      startTime: "13:00",
      endTime: "14:00",
      platform: "Dining Hall"
    }
  ];

  if (variant === 1) { // Module 1 Style
    return [
      ...commonEvents,
      {
        eventId: `LEC-1-${dateStr}`,
        title: "Intro to YL + AI Protocol",
        type: "lecture",
        date: dateStr,
        startTime: "09:00",
        endTime: "10:30",
        platform: "Turtle Room",
        assignments: [
          { assignmentId: `LAB-1-${dateStr}`, title: "Intro Lab", description: "Complete the intro exercises", dueDate: dateStr, submissionLink: "https://meet.google.com" }
        ],
        notes: "Slides available on Classroom"
      },
      {
        eventId: `BREAK-1-${dateStr}`,
        title: "Break",
        type: "break",
        date: dateStr,
        startTime: "10:30",
        endTime: "10:45",
        platform: "Lounge"
      },
      {
        eventId: `LAB-1-${dateStr}`,
        title: "Data Types Deep Dive",
        type: "lab",
        date: dateStr,
        startTime: "10:45",
        endTime: "12:30",
        platform: "Turtle Room",
        assignments: [
             { assignmentId: `ZIP-${dateStr}`, title: "Zip Files Task", description: "Learn how to zip files correctly", dueDate: TOMORROW }
        ]
      },
      {
        eventId: `CODE-ALONG-${dateStr}`,
        title: "Code Along: Loops",
        type: "workshop",
        date: dateStr,
        startTime: "14:00",
        endTime: "15:30",
        platform: "Unicorn Room",
        reminders: ["Open IDE", "Download starter code"]
      }
    ];
  } else { // Module 2 Style
     return [
      ...commonEvents,
       {
        eventId: `LEC-2-${dateStr}`,
        title: "Dictionaries & Structures",
        type: "lecture",
        date: dateStr,
        startTime: "09:00",
        endTime: "10:30",
        platform: "Magic Room",
        assignments: [
           { assignmentId: `DICT-${dateStr}`, title: "Dictionary Lab", description: "Map data structures", dueDate: dateStr }
        ]
      },
      {
        eventId: `BREAK-2-${dateStr}`,
        title: "Break",
        type: "break",
        date: dateStr,
        startTime: "10:30",
        endTime: "10:45",
        platform: "Lounge"
      },
      {
        eventId: `PROJ-${dateStr}`,
        title: "Group Project: Planning",
        type: "lab",
        date: dateStr,
        startTime: "10:45",
        endTime: "12:30",
        platform: "Breakout Rooms",
        notes: "Work on the planning doc"
      },
       {
        eventId: `UI-CRASH-${dateStr}`,
        title: "UI Crash Course",
        type: "workshop",
        date: dateStr,
        startTime: "14:00",
        endTime: "15:30",
        platform: "Main Hall",
        reminders: ["Bring Figma login"]
      }
     ];
  }
};

export const MEET_DATA: MeetData = {
  "cohorts": {
    "2025": {
      "description": "Computer Science Cohort 2025",
      "groups": {
        "GroupA": {
          "groupMentor": "Mentor Name A",
          "schedule": [
             ...generateSchedule(TODAY, 1),
             ...generateSchedule(TOMORROW, 2),
             ...generateSchedule(YESTERDAY, 1),
          ],
          "generalAssignments": [
            {
              "assignmentId": "GA1",
              "title": "Weekly Reflection",
              "description": "Reflect on what you learned this week",
              "dueDate": TOMORROW
            }
          ]
        },
        "GroupB": {
          "groupMentor": "Mentor Name B",
          "schedule": [],
          "generalAssignments": []
        }
      }
    },
    "2026": { "description": "CS Cohort 2026", "groups": { "GroupA": { "groupMentor": "", "schedule": [], "generalAssignments": [] }, "GroupB": { "groupMentor": "", "schedule": [], "generalAssignments": [] } } },
    "2027": { "description": "CS Cohort 2027", "groups": { "GroupA": { "groupMentor": "", "schedule": [], "generalAssignments": [] }, "GroupB": { "groupMentor": "", "schedule": [], "generalAssignments": [] } } }
  }
};