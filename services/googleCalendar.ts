import { MeetEvent } from '../types';
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

// We store the pending promise resolver here so the callback can access it
let resolveAuthPromise: ((value: boolean) => void) | null = null;

export const GoogleCalendarService = {
  
  initialize: async () => {
    return new Promise<void>((resolve, reject) => {
      // 1. Load GAPI (for making API requests)
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
            console.error("Error initializing GAPI client", err);
          }
        });
      }

      // 2. Load GIS (for Authentication)
      if (window.google) {
        try {
          // Initialize Token Client properly with the callback defined UPFRONT
          tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CONFIG.clientId,
            scope: GOOGLE_CONFIG.scope,
            callback: (resp: any) => {
               if (resp.error) {
                 console.error("Auth Error:", resp);
                 if (resolveAuthPromise) resolveAuthPromise(false);
                 return;
               }
               // Success
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
    // Ensure initialized
    if (!tokenClient) {
        try {
            await GoogleCalendarService.initialize();
        } catch(e) { 
            console.error(e);
            return false; 
        }
    }

    return new Promise((resolve) => {
      if (!tokenClient) {
        alert("Google API failed to load. Check your ad blocker.");
        resolve(false);
        return;
      }

      // Store the resolve function so the global callback can call it
      resolveAuthPromise = resolve;

      // Trigger the popup
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

  fetchEvents: async (): Promise<MeetEvent[]> => {
    if (!gapiInited) return [];

    try {
      let calendars = [];

      // 1. Try to Fetch List of Calendars
      try {
        const calendarListResponse = await window.gapi.client.calendar.calendarList.list();
        // Limit to first 10 calendars to avoid memory crash if user has too many subscribed calendars
        calendars = (calendarListResponse.result.items || []).slice(0, 10); 
      } catch (listErr) {
        console.warn("Could not list calendars, defaulting to Primary.", listErr);
        calendars = [{ id: 'primary', summary: 'Primary', primary: true }];
      }

      if (calendars.length === 0) {
         calendars = [{ id: 'primary', summary: 'Primary', primary: true }];
      }

      let allEvents: MeetEvent[] = [];
      
      // CRITICAL MEMORY FIX:
      // Reduced window to 1 month back -> 3 months forward. 
      // This prevents fetching thousands of events and crashing the browser tab.
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3);

      // 2. Iterate and fetch events for each calendar
      const promises = calendars.map(async (cal: any) => {
        try {
            const response = await window.gapi.client.calendar.events.list({
                'calendarId': cal.id,
                'timeMin': startDate.toISOString(),
                'timeMax': endDate.toISOString(),
                'showDeleted': false,
                'singleEvents': true,
                'maxResults': 250, // Reduced from 2000 to 250 to prevent OOM
                'orderBy': 'startTime',
            });

            const items = response.result.items || [];
            
            return items.map((ev: any) => {
                const start = ev.start.dateTime || ev.start.date;
                const end = ev.end.dateTime || ev.end.date;
                
                const dateObj = new Date(start);
                const dateStr = dateObj.toISOString().split('T')[0];
                const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                
                let endTimeStr = '23:59';
                if (end) {
                    const endObj = new Date(end);
                    endTimeStr = endObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                }

                const isPrimary = cal.primary;

                return {
                    eventId: ev.id,
                    googleEventId: ev.id,
                    title: ev.summary || '(No Title)',
                    type: 'personal',
                    date: dateStr,
                    startTime: timeStr === 'Invalid Date' ? '00:00' : timeStr,
                    endTime: endTimeStr === 'Invalid Date' ? '23:59' : endTimeStr,
                    platform: isPrimary ? (ev.location || 'Google Calendar') : `${cal.summary}`, 
                    meetLink: ev.htmlLink,
                    notes: ev.description || '',
                    reminders: []
                } as MeetEvent;
            });
        } catch (calErr) {
            console.warn(`Could not fetch events for calendar ${cal.summary}`, calErr);
            return [];
        }
      });

      const results = await Promise.all(promises);
      results.forEach(calEvents => {
          allEvents = [...allEvents, ...calEvents];
      });

      console.log(`Fetched ${allEvents.length} events from Google.`);
      return allEvents;

    } catch (err) {
      console.error("Error fetching events", err);
      return [];
    }
  },

  createEvent: async (event: MeetEvent): Promise<string | null> => {
    if (!gapiInited) return null;
    
    const startDateTime = new Date(`${event.date}T${event.startTime}:00`);
    const endDateTime = new Date(`${event.date}T${event.endTime}:00`);

    const gEvent = {
      summary: event.title,
      location: event.platform,
      description: event.notes,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    try {
      const request = window.gapi.client.calendar.events.insert({
        'calendarId': 'primary', 
        'resource': gEvent,
      });
      const response = await request.execute();
      return response.id;
    } catch (e) {
      console.error("Error creating Google event", e);
      return null;
    }
  }
};