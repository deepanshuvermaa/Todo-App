// Google API Configuration for React App
// Set VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_API_KEY in your .env file
// Never hard-code credentials here — they will be exposed in the browser bundle

if (!import.meta.env.VITE_GOOGLE_CLIENT_ID || !import.meta.env.VITE_GOOGLE_API_KEY) {
    console.warn(
        '[LIFE] Google API credentials not configured. ' +
        'Copy .env.example to .env and fill in VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_API_KEY ' +
        'to enable Google Sheets sync.'
    );
}

export const GOOGLE_CONFIG = {
    // Read exclusively from environment variables — no hardcoded fallbacks
    CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    API_KEY: import.meta.env.VITE_GOOGLE_API_KEY || '',

    // Google Sheets API Configuration
    DISCOVERY_DOCS: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    SCOPES: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',

    // App Configuration
    APP_NAME: 'LIFE',
    SHEET_NAME: 'LIFE Data',
};