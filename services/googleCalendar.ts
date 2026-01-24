import { MeetEvent, GoogleCalendarInfo } from '../types';
import { GOOGLE_CONFIG } from '../config';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

let tokenClient: any;
let gapiInited = false;
let gisInited = false;
let resolveAuthPromise: ((value: boolean) => void) | null = null;

export const GoogleCalendarService = {
  
  initialize: async () => {
    return new Promise<void>((resolve, reject) => {
      if (window.gapi) {
        window.gapi.load('client', async () => {
          try {
            await window.gapi.client.init({
              apiKey: GOOGLE_CONFIG.apiKey,
              discoveryDocs: GOOGLE_CONFIG.discoveryDocs,
            });
            gapiInited = true;
            checkResolve();
          } catch (err) {
            console.error("GAPI Init Error", err);
          }
        });
      }

      if (window.google) {
        try {
          tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CONFIG.clientId,
            scope: GOOGLE_CONFIG.scope,
            callback: (resp: any) => {
               if (resp.error) {
                 if (resolveAuthPromise) resolveAuthPromise(false);
                 return;
               }
               if (resolveAuthPromise) resolveAuthPromise(true);
            },
          });
          gisInited = true;
          checkResolve();
        } catch (e) {
          console.error("GIS Init Error", e);
        }
      }

      function checkResolve() {
        if (gapiInited && gisInited) {
          resolve();
        }
      }
    });
  },

  authenticate: async (): Promise<boolean> => {
    if (!tokenClient) await GoogleCalendarService.initialize();
    
    // Check if we already have a token
    if (window.gapi.client.getToken() !== null) return true;

    return new Promise((resolve) => {
      resolveAuthPromise = resolve;
      tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  },

  signOut: () => {
    const token = window.gapi.client.getToken();
    if (token !== null) {
      window.google.accounts.oauth2.revoke(token.access_token, () => {
        window.gapi.client.setToken('');
      });
    }
  },

  // 1. Fetch List of User's Calendars
  fetchCalendars: async (): Promise<GoogleCalendarInfo[]> => {
    if (!gapiInited) return [];
    try {
        const response = await window.gapi.client.calendar.calendarList.list();
        const items = response.result.items || [];
        return items.map((item: any) => ({
            id: item.id,
            summary: item.summary,
            backgroundColor: item.backgroundColor,
            selected: item.primary // Default select primary
        }));
    } catch (e) {
        console.error("Error fetching calendar list", e);
        return [];
    }
  },

  // 2. Fetch Events with SMART FILTERING
  fetchEvents: async (calendarsToSync: GoogleCalendarInfo[], userGroup: string): Promise<MeetEvent[]> => {
    if (!gapiInited) return [];

    let allEvents: MeetEvent[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 10); // Past 10 days
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // Future 30 days

    // Normalize User Group for comparison (e.g., "GroupA" -> "A", "Group D" -> "D")
    const userGroupChar = userGroup.replace(/group/i, '').trim().toUpperCase(); 
    const allGroupChars = ['A', 'B', 'C', 'D'];
    const otherGroups = allGroupChars.filter(g => g !== userGroupChar);

    const promises = calendarsToSync.map(async (cal) => {
        try {
            const response = await window.gapi.client.calendar.events.list({
                'calendarId': cal.id,
                'timeMin': startDate.toISOString(),
                'timeMax': endDate.toISOString(),
                'showDeleted': false,
                'singleEvents': true,
                'maxResults': 150,
                'orderBy': 'startTime',
            });

            const items = response.result.items || [];
            const calNameLower = cal.summary.toLowerCase();
            
            // Heuristic: Is this likely a "MEET" or "School" calendar?
            // If so, we apply stricter filtering.
            const isMeetCalendar = calNameLower.includes('meet') || calNameLower.includes('class') || calNameLower.includes('cohort') || calNameLower.includes('202');

            return items.reduce((acc: MeetEvent[], ev: any) => {
                const title = ev.summary || '(No Title)';
                const titleUpper = title.toUpperCase();

                // --- SMART ALGORITHM ---
                // If it's a MEET calendar, filter out events that explicitly mention OTHER groups
                if (isMeetCalendar) {
                    // Check if title mentions "Group X" or just "X" in a specific context
                    const mentionsOtherGroup = otherGroups.some(g => {
                         // Matches "Group A", "Group-A", "GroupA"
                         return titleUpper.includes(`GROUP ${g}`) || 
                                titleUpper.includes(`GROUP-${g}`) || 
                                titleUpper.includes(`GROUP${g}`);
                    });

                    // If it mentions another group, and DOES NOT mention our group, skip it.
                    // (We allow it if it says "Group A & B" and we are B).
                    if (mentionsOtherGroup) {
                        const mentionsMyGroup = titleUpper.includes(`GROUP ${userGroupChar}`) || 
                                                titleUpper.includes(`GROUP-${userGroupChar}`) || 
                                                titleUpper.includes(`GROUP${userGroupChar}`);
                        
                        if (!mentionsMyGroup) return acc; // SKIP THIS EVENT
                    }
                }

                // --- DATA MAPPING ---
                const start = ev.start.dateTime || ev.start.date;
                const end = ev.end.dateTime || ev.end.date;
                const dateObj = new Date(start);
                
                // Extract video link (Meet, Zoom, Teams)
                let videoLink = undefined;
                if (ev.conferenceData?.entryPoints) {
                    const videoEntry = ev.conferenceData.entryPoints.find((e: any) => e.entryPointType === 'video');
                    if (videoEntry) videoLink = videoEntry.uri;
                }
                const description = ev.description || '';
                if (!videoLink && description) {
                    const match = description.match(/(https?:\/\/[^\s<"]+)/);
                    if (match && (match[0].includes('zoom') || match[0].includes('meet') || match[0].includes('teams'))) {
                        videoLink = match[0];
                    }
                }

                // Handle Location - If empty, set to undefined so UI hides it
                const location = ev.location ? ev.location : undefined;

                acc.push({
                    eventId: ev.id,
                    googleEventId: ev.id,
                    calendarId: cal.id,
                    title: title,
                    type: 'personal', // Google events default to personal, user can change logic if needed
                    date: dateObj.toISOString().split('T')[0],
                    startTime: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                    endTime: new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                    platform: location, // Undefined if empty
                    meetLink: videoLink,
                    notes: description.replace(/<[^>]*>?/gm, '').trim(),
                    color: cal.backgroundColor
                });
                return acc;
            }, []);

        } catch (e) {
            console.warn(`Error fetching events for ${cal.summary}`, e);
            return [];
        }
    });

    const results = await Promise.all(promises);
    results.forEach(calEvents => allEvents = [...allEvents, ...calEvents]);
    return allEvents;
  },

  createEvent: async (event: MeetEvent): Promise<string | null> => {
    if (!gapiInited) return null;
    const gEvent = {
      summary: event.title,
      location: event.platform,
      description: event.notes,
      start: { dateTime: new Date(`${event.date}T${event.startTime}:00`).toISOString() },
      end: { dateTime: new Date(`${event.date}T${event.endTime}:00`).toISOString() },
    };
    try {
      const res = await window.gapi.client.calendar.events.insert({ 'calendarId': 'primary', 'resource': gEvent });
      return res.result.id;
    } catch (e) {
      return null;
    }
  }
};