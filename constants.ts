import { MeetData, MeetEvent } from './types';

// Helper to get dynamic date string (YYYY-MM-DD)
const getDate = (offsetDays: number = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const TODAY = getDate(0);
const TOMORROW = getDate(1);
const YESTERDAY = getDate(-1);

const generateSchedule = (dateStr: string): MeetEvent[] => [
    {
      eventId: `BREAKFAST-${dateStr}`,
      title: "Breakfast",
      type: "meal",
      date: dateStr,
      startTime: "08:00",
      endTime: "09:00",
      platform: "Dining Hall",
      notes: "Start the day with energy!"
    },
    {
      eventId: `CS-SESSION-1-${dateStr}`,
      title: "CS: Python Deep Dive",
      type: "lecture",
      date: dateStr,
      startTime: "09:00",
      endTime: "10:30",
      platform: "Turtle Room",
      assignments: [
        {
          assignmentId: `A1-${dateStr}`,
          title: "Variables Practice",
          description: "Solve basic problems using variables",
          dueDate: TOMORROW,
          submissionLink: "#"
        }
      ]
    },
    {
      eventId: `BREAK-1-${dateStr}`,
      title: "Break",
      type: "break",
      date: dateStr,
      startTime: "10:30",
      endTime: "10:45",
      platform: "Lounge",
      notes: "Grab some water"
    },
     {
      eventId: `ENTREP-SESSION-1-${dateStr}`,
      title: "Entrep: Market Research",
      type: "workshop",
      date: dateStr,
      startTime: "10:45",
      endTime: "12:15",
      platform: "Magic Room",
      reminders: ["Bring notebook", "Fill microfeedback"]
    },
    {
      eventId: `BREAK-2-${dateStr}`,
      title: "Break",
      type: "break",
      date: dateStr,
      startTime: "12:15",
      endTime: "12:45",
      platform: "Lounge"
    },
    {
      eventId: `DU-SESSION-${dateStr}`,
      title: "Deeper Understanding",
      type: "workshop",
      date: dateStr,
      startTime: "12:45",
      endTime: "14:15",
      platform: "Unicorn Room",
      reminders: ["Read the article beforehand"]
    },
    {
      eventId: `LUNCH-1-${dateStr}`,
      title: "Lunch",
      type: "meal",
      date: dateStr,
      startTime: "14:15",
      endTime: "15:15",
      platform: "Dining Hall"
    },
     {
      eventId: `CS-SESSION-2-${dateStr}`,
      title: "CS: Loops & Logic",
      type: "lab",
      date: dateStr,
      startTime: "15:15",
      endTime: "16:45",
      platform: "Turtle Room"
    },
    {
      eventId: `LAB-LOUNGE-${dateStr}`,
      title: "Lab Lounge",
      type: "lab",
      date: dateStr,
      startTime: "17:15",
      endTime: "18:00",
      platform: "Target Room"
    },
     {
      eventId: `DINNER-${dateStr}`,
      title: "Dinner",
      type: "meal",
      date: dateStr,
      startTime: "18:00",
      endTime: "19:00",
      platform: "Dining Hall"
    },
    {
      eventId: `COMP-${dateStr}`,
      title: "Social Activity",
      type: "workshop",
      date: dateStr,
      startTime: "20:00",
      endTime: "21:15",
      platform: "Seminar Room"
    },
    {
      eventId: `FREE-TIME-${dateStr}`,
      title: "Free Time",
      type: "personal",
      date: dateStr,
      startTime: "21:15",
      endTime: "22:50",
      notes: "Chill time"
    },
     {
      eventId: `CURFEW-${dateStr}`,
      title: "Curfew",
      type: "personal",
      date: dateStr,
      startTime: "22:50",
      endTime: "23:00",
      notes: "Fill water bottle! Go to room.",
      reminders: ["Fill water", "Check in"]
    }
];

export const MEET_DATA: MeetData = {
  "cohorts": {
    "2025": {
      "description": "Computer Science Cohort 2025",
      "groups": {
        "GroupA": {
          "groupMentor": "Mentor Name A",
          "schedule": [
             ...generateSchedule(TODAY),
             ...generateSchedule(TOMORROW),
             ...generateSchedule(YESTERDAY),
             // A few distinct ones for Yesterday to show overdue status
             {
               eventId: "OLD-EVENT-1",
               title: "Missed Lecture",
               type: "lecture",
               date: YESTERDAY,
               startTime: "16:00",
               endTime: "18:00",
               platform: "Zoom",
               assignments: [{ assignmentId: "OVERDUE-1", title: "Past Homework", description: "This is late", dueDate: YESTERDAY }]
             }
          ],
          "generalAssignments": [
            {
              "assignmentId": "GA1",
              "title": "Weekly Reflection",
              "description": "Reflect on what you learned this week",
              "dueDate": TOMORROW
            },
            {
              "assignmentId": "GA2",
              "title": "Project Proposal",
              "description": "Submit your idea for the final project",
              "dueDate": getDate(3)
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