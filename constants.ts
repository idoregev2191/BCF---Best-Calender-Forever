import { MeetData } from './types';

// Helper to generate dates relative to today for demo purposes
const today = new Date();
const formatDate = (offset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
};

export const MEET_DATA: MeetData = {
  "cohorts": {
    "2025": {
      "description": "Computer Science Cohort 2025",
      "groups": {
        "GroupA": {
          "groupMentor": "Alex Mentor",
          "schedule": [
            // --- DAY 0 (Today) ---
            {
              "eventId": "CS101-LEC-1",
              "title": "Intro to Python Logic",
              "type": "lecture",
              "date": formatDate(0),
              "startTime": "09:00",
              "endTime": "10:30",
              "platform": "Google Meet",
              "meetLink": "https://meet.google.com/abc-defg-hij",
              "reminders": ["Download VS Code", "Check Python version"],
              "assignments": [
                 {
                  "assignmentId": "A1",
                  "title": "Setup Environment",
                  "description": "Install Python 3.9+ and VS Code extensions.",
                  "dueDate": formatDate(1),
                  "submissionLink": "#"
                 }
              ]
            },
            {
              "eventId": "CS101-WS-1",
              "title": "Team Building Workshop",
              "type": "workshop",
              "date": formatDate(0),
              "startTime": "11:00",
              "endTime": "12:30",
              "platform": "Zoom",
              "notes": "Bring an interesting fact about yourself."
            },
            {
              "eventId": "LUNCH-1",
              "title": "Lunch Break",
              "type": "personal",
              "date": formatDate(0),
              "startTime": "12:30",
              "endTime": "13:30",
              "platform": "In Person",
              "notes": "Cafeteria menu: Pizza"
            },
            {
              "eventId": "CS101-LAB-1",
              "title": "Variables & Types Lab",
              "type": "lab",
              "date": formatDate(0),
              "startTime": "13:30",
              "endTime": "15:30",
              "platform": "Discord",
              "reminders": ["Submit initial commit"],
              "assignments": [
                {
                  "assignmentId": "LAB1",
                  "title": "Data Types Quiz",
                  "description": "Complete the moodle quiz on integers and strings.",
                  "dueDate": formatDate(0),
                  "submissionLink": "#"
                }
              ]
            },
            
            // --- DAY 1 ---
            {
              "eventId": "CS101-LEC-2",
              "title": "Control Flow: If/Else",
              "type": "lecture",
              "date": formatDate(1),
              "startTime": "09:00",
              "endTime": "10:30",
              "platform": "Google Meet",
              "reminders": ["Review yesterday's notes"]
            },
            {
              "eventId": "CS101-MENTOR",
              "title": "Mentor 1:1 Session",
              "type": "personal",
              "date": formatDate(1),
              "startTime": "14:00",
              "endTime": "14:30",
              "platform": "In Person",
              "notes": "Discuss project ideas with Alex"
            },
            {
              "eventId": "NETWORKING",
              "title": "Alumni Networking",
              "type": "workshop",
              "date": formatDate(1),
              "startTime": "16:00",
              "endTime": "18:00",
              "platform": "Zoom",
              "notes": "Prepare elevator pitch"
            },

            // --- DAY 2 ---
            {
              "eventId": "CS101-LEC-3",
              "title": "Loops & Iterations",
              "type": "lecture",
              "date": formatDate(2),
              "startTime": "09:00",
              "endTime": "10:30",
              "platform": "Google Meet",
              "assignments": [
                {
                  "assignmentId": "A2",
                  "title": "Fibonacci Generator",
                  "description": "Write a script to generate N Fibonacci numbers.",
                  "dueDate": formatDate(4),
                  "submissionLink": "#"
                }
              ]
            },
            {
              "eventId": "CS101-LAB-3",
              "title": "Looping Lab",
              "type": "lab",
              "date": formatDate(2),
              "startTime": "11:00",
              "endTime": "13:00",
              "platform": "Discord"
            },

            // --- DAY 3 ---
            {
              "eventId": "CS101-GUEST",
              "title": "Guest Speaker: AI Ethics",
              "type": "workshop",
              "date": formatDate(3),
              "startTime": "16:00",
              "endTime": "17:30",
              "platform": "Zoom",
              "reminders": ["Prepare 1 question"]
            },
             {
              "eventId": "CS101-PROJ",
              "title": "Group Project Kickoff",
              "type": "workshop",
              "date": formatDate(3),
              "startTime": "18:00",
              "endTime": "19:30",
              "platform": "In Person",
              "notes": "Room 204. Don't be late."
            },

             // --- DAY 4 ---
             {
              "eventId": "CS101-CODE-REV",
              "title": "Code Review Session",
              "type": "lab",
              "date": formatDate(4),
              "startTime": "10:00",
              "endTime": "12:00",
              "platform": "Discord",
              "reminders": ["Push final code"]
            }
          ],
          "generalAssignments": [
            {
              "assignmentId": "GA1",
              "title": "Weekly Reflection",
              "description": "Reflect on the Python learning curve.",
              "dueDate": formatDate(5)
            },
            {
              "assignmentId": "GA2",
              "title": "Update LinkedIn",
              "description": "Add MEET program to your education section.",
              "dueDate": formatDate(7)
            }
          ]
        },
        "GroupB": {
          "groupMentor": "Sarah Mentor",
          "schedule": [
             // --- DAY 0 ---
            {
              "eventId": "CS101-LEC-1-B",
              "title": "Intro to Programming",
              "type": "lecture",
              "date": formatDate(0),
              "startTime": "14:00",
              "endTime": "15:30",
              "platform": "Google Meet",
              "reminders": ["Join session", "Fill microfeedback"],
              "assignments": []
            },
            {
              "eventId": "CS101-LAB-1-B",
              "title": "First Lab Session",
              "type": "lab",
              "date": formatDate(0),
              "startTime": "16:00",
              "endTime": "18:00",
              "platform": "Discord"
            },
            // --- DAY 1 ---
             {
              "eventId": "CS101-WS-1-B",
              "title": "Team Dynamic Workshop",
              "type": "workshop",
              "date": formatDate(1),
              "startTime": "10:00",
              "endTime": "12:00",
              "platform": "In Person"
            }
          ],
          "generalAssignments": []
        }
      }
    },
    "2026": {
      "description": "CS 2026",
      "groups": {
        "GroupA": { "groupMentor": "C", "schedule": [], "generalAssignments": [] },
        "GroupB": { "groupMentor": "D", "schedule": [], "generalAssignments": [] }
      }
    },
    "2027": {
      "description": "CS 2027",
      "groups": {
        "GroupA": { "groupMentor": "E", "schedule": [], "generalAssignments": [] },
        "GroupB": { "groupMentor": "F", "schedule": [], "generalAssignments": [] }
      }
    }
  }
};