// Make sure window.google and window.gapi exist (scripts included in index.html)
declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';

export const initGoogleApi = (_clientId: string) => {
  return new Promise<void>((resolve, reject) => {
    try {
      if (!window.google || !window.gapi) {
        throw new Error('Google scripts not loaded');
      }

      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            // Initialize without API key for just hitting endpoint with token
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest']
          });
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

export const requestGmailAccess = (clientId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (response: any) => {
        if (response.error !== undefined) {
          reject(response);
        }
        resolve(response.access_token);
      },
      error_callback: Object
    });
    
    // Check if we need to prompt for consent
    if (window.gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
      tokenClient.requestAccessToken({prompt: ''});
    }
  });
};

export const fetchUserProfile = async (token: string) => {
  const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) {
    const errText = await response.text();
    console.error('Profile fetch failed:', response.status, errText);
    throw new Error(`Failed to fetch user profile: ${response.statusText}`);
  }
  return await response.json();
};
