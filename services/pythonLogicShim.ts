import { MEET_DATA } from '../constants';
import { MeetEvent, Assignment } from '../types';

/**
 * NOTE TO USER:
 * You requested the backend to be Python only using specific code.
 * Since this is a React Web Application running in your browser, we cannot execute live Python code directly here.
 * 
 * However, we have ported your EXACT Python logic structure to TypeScript below to ensure the app works 
 * as intended with the logic you designed. In a real deployment, this file would be replaced by API calls 
 * to your Python Flask/Django server running the code you provided.
 */

// Mimicking your Python 'cohorts' dictionary
const cohortsMapping: { [key: string]: string[] } = {
  "2025": ["Y3", "y3", "2025"],
  "2026": ["Y2", "y2", "2026"],
  "2027": ["Y1", "y1", "2027"]
};

// Mimicking the logic of your `tasks(name, cohort, group)` function
export const getCohortId = (inputCohort: string): string => {
  if (cohortsMapping["2025"].includes(inputCohort)) return "2025";
  if (cohortsMapping["2026"].includes(inputCohort)) return "2026";
  if (cohortsMapping["2027"].includes(inputCohort)) return "2027";
  return inputCohort; // Default fallback
};

export const getEventsForUser = (cohort: string, group: string): { schedule: MeetEvent[], generalAssignments: Assignment[] } => {
  const normalizedCohort = getCohortId(cohort);
  
  // Python: cohort_data = meet_summer.get(cohort)
  const cohortData = MEET_DATA.cohorts[normalizedCohort];
  
  if (!cohortData) {
    console.warn(`Cohort '${normalizedCohort}' not found`);
    return { schedule: [], generalAssignments: [] };
  }

  // Python: group_data = cohort_data.get("groups", {}).get(group)
  const groupData = cohortData.groups[group];
  
  if (!groupData) {
    console.warn("No events found for this group.");
    return { schedule: [], generalAssignments: [] };
  }

  // Python: schedule = group_data.get("schedule", [])
  return {
    schedule: groupData.schedule || [],
    generalAssignments: groupData.generalAssignments || []
  };
};

// Helper to extract all assignments from schedule + general assignments
// This mimics the loop in your Python code: `for event in schedule: ... for assignment in assignments:`
export const getAllAssignments = (schedule: MeetEvent[], generalAssignments: Assignment[]) => {
  const allAssignments: { assignment: Assignment, sourceEvent?: string }[] = [];

  // Assignments from Schedule
  schedule.forEach(event => {
    if (event.assignments) {
      event.assignments.forEach(assignment => {
        allAssignments.push({ assignment, sourceEvent: event.title });
      });
    }
  });

  // General Assignments
  generalAssignments.forEach(assignment => {
    allAssignments.push({ assignment, sourceEvent: "General Task" });
  });

  return allAssignments;
};
