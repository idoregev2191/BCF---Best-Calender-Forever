// CLIENT-SIDE CONFIGURATION
export const GOOGLE_CONFIG = {
  apiKey: 'AIzaSyCBs1lIlC3S9Vn6wiD6WGAv60pZwnomRmY', 
  clientId: '804039290490-06geshflni0bp724bstnuf8ptl3eb8k4.apps.googleusercontent.com',
  
  discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
  // Changed scope to 'events' (RW) instead of 'events.readonly'
  scope: "https://www.googleapis.com/auth/calendar.events",
};