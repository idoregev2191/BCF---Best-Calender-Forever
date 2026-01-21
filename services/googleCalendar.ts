import { MeetEvent } from '../types';
import { GOOGLE_CONFIG } from '../config';

// Declare types for window globals provided by Google scripts
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

export const GoogleCalendarService = {
  
  /**
   * Initialize the Google API Client
   */
  initialize: async () => {
    return new Promise<void>((resolve, reject) => {
      // Load GAPI
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
            // Don't reject loudly, just log
          }
        });
      }

      // Load GIS (Identity Services)
      if (window.google) {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CONFIG.clientId,
          scope: GOOGLE_CONFIG.scope,
          callback: '', // defined at request time
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

  /**
   * Trigger the popup to ask user for permission
   */
  authenticate: async (): Promise<boolean> => {
    // Ensure initialized
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
        resolve(true);
      };

      if (window.gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } else {
        tokenClient.requestAccessToken({ prompt: '' });
      }
    });
  },

  /**
   * Fetch real events from the user's primary calendar
   */
  fetchEvents: async (): Promise<MeetEvent[]> => {
    if (!gapiInited) return [];

    try {
      const response = await window.gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': (new Date()).toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 20,
        'orderBy': 'startTime',
      });

      const events = response.result.items;
      if (!events || events.length === 0) {
        return [];
      }

      // Map Google Event format to our MeetEvent format
      return events.map((ev: any) => {
        const start = ev.start.dateTime || ev.start.date;
        const end = ev.end.dateTime || ev.end.date;
        
        // Parse date/time
        const dateObj = new Date(start);
        const dateStr = dateObj.toISOString().split('T')[0];
        const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        
        const endObj = new Date(end);
        const endTimeStr = endObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

        return {
          eventId: ev.id,
          title: ev.summary || 'No Title',
          type: 'personal', // Google events default to personal
          date: dateStr,
          startTime: timeStr === 'Invalid Date' ? '00:00' : timeStr,
          endTime: endTimeStr === 'Invalid Date' ? '23:59' : endTimeStr,
          platform: ev.location || 'Google Calendar',
          meetLink: ev.htmlLink,
          notes: ev.description || '', // Import Description to Notes
          reminders: []
        } as MeetEvent;
      });

    } catch (err) {
      console.error("Error fetching events", err);
      return [];
    }
  }
};