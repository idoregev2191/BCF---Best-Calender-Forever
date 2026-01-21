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
let accessToken: string | null = null;

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
            maybeResolve();
          } catch (err) {
            console.error("Error initializing GAPI client", err);
          }
        });
      }

      if (window.google) {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CONFIG.clientId,
          scope: GOOGLE_CONFIG.scope,
          callback: '', 
        });
        gisInited = true;
        maybeResolve();
      }

      function maybeResolve() {
        if (gapiInited && gisInited) {
          resolve();
        }
      }
    });
  },

  authenticate: async (): Promise<boolean> => {
    if (!tokenClient) {
        try {
            await GoogleCalendarService.initialize();
        } catch(e) { 
            return false; 
        }
    }

    return new Promise((resolve) => {
      if (!tokenClient) return resolve(false);

      tokenClient.callback = async (resp: any) => {
        if (resp.error) {
          console.error(resp);
          resolve(false);
        }
        accessToken = resp.access_token;
        resolve(true);
      };

      if (window.gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } else {
        tokenClient.requestAccessToken({ prompt: '' });
      }
    });
  },

  signOut: () => {
    const token = window.gapi.client.getToken();
    if (token !== null) {
      window.google.accounts.oauth2.revoke(token.access_token, () => {
        window.gapi.client.setToken('');
        accessToken = null;
      });
    }
  },

  fetchEvents: async (): Promise<MeetEvent[]> => {
    if (!gapiInited) return [];

    try {
      // We fetch from primary. Fetching 'all' calendars involves iterating calendarList
      // which often includes holidays/contacts/birthdays that clutter the view.
      // Primary is best for a "My Planner" app.
      const response = await window.gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': (new Date()).toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 50,
        'orderBy': 'startTime',
      });

      const events = response.result.items;
      if (!events || events.length === 0) {
        return [];
      }

      return events.map((ev: any) => {
        const start = ev.start.dateTime || ev.start.date;
        const end = ev.end.dateTime || ev.end.date;
        const dateObj = new Date(start);
        const dateStr = dateObj.toISOString().split('T')[0];
        const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const endObj = new Date(end);
        const endTimeStr = endObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

        return {
          eventId: ev.id,
          googleEventId: ev.id,
          title: ev.summary || '(No Title)',
          type: 'personal',
          date: dateStr,
          startTime: timeStr === 'Invalid Date' ? '00:00' : timeStr,
          endTime: endTimeStr === 'Invalid Date' ? '23:59' : endTimeStr,
          platform: ev.location || 'Google Calendar',
          meetLink: ev.htmlLink, // Use the REAL Google Link
          notes: ev.description || '', // Real description
          reminders: []
        } as MeetEvent;
      });

    } catch (err) {
      console.error("Error fetching events", err);
      return [];
    }
  },

  createEvent: async (event: MeetEvent): Promise<string | null> => {
    if (!gapiInited) return null;
    
    // Convert HH:MM to DateTime
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