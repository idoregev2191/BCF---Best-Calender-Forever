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

  // 2. Fetch Events from SPECIFIC Calendars
  fetchEvents: async (calendarsToSync: GoogleCalendarInfo[]): Promise<MeetEvent[]> => {
    if (!gapiInited) return [];

    let allEvents: MeetEvent[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 10); // Past 10 days
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // Future 30 days

    const promises = calendarsToSync.map(async (cal) => {
        try {
            const response = await window.gapi.client.calendar.events.list({
                'calendarId': cal.id,
                'timeMin': startDate.toISOString(),
                'timeMax': endDate.toISOString(),
                'showDeleted': false,
                'singleEvents': true,
                'maxResults': 100,
                'orderBy': 'startTime',
            });

            const items = response.result.items || [];
            
            return items.map((ev: any) => {
                const start = ev.start.dateTime || ev.start.date;
                const end = ev.end.dateTime || ev.end.date;
                const dateObj = new Date(start);
                
                // Extract video link
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

                return {
                    eventId: ev.id,
                    googleEventId: ev.id,
                    calendarId: cal.id,
                    title: ev.summary || '(No Title)',
                    type: 'personal', // Google events default to personal
                    date: dateObj.toISOString().split('T')[0],
                    startTime: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                    endTime: new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                    platform: ev.location || 'Google Calendar',
                    meetLink: videoLink,
                    notes: description.replace(/<[^>]*>?/gm, ''),
                    color: cal.backgroundColor
                } as MeetEvent;
            });
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