// CLIENT-SIDE CONFIGURATION
// All keys are now configured.
// If you get an "Origin mismatch" error, copy the URL displayed in the error message
// and add it to "Authorized JavaScript origins" in the Google Cloud Console.

export const GOOGLE_CONFIG = {
  apiKey: 'AIzaSyCBs1lIlC3S9Vn6wiD6WGAv60pZwnomRmY', 
  clientId: '804039290490-06geshflni0bp724bstnuf8ptl3eb8k4.apps.googleusercontent.com',
  
  discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
  scope: "https://www.googleapis.com/auth/calendar.events.readonly",
};