// Google API Configuration for React App
export const GOOGLE_CONFIG = {
    // Google OAuth2 Configuration
    CLIENT_ID: '995916217406-3o8864q7ikdgjsrqr95qhgg0k25kuub7.apps.googleusercontent.com',
    API_KEY: 'AIzaSyDcNSfA1rOQxCZ9Drm7vYosb4ewPZyzBpo',

    // Google Sheets API Configuration
    DISCOVERY_DOCS: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    SCOPES: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',

    // App Configuration
    APP_NAME: 'LIFE',
    SHEET_NAME: 'LIFE Data',
};

// Environment variable support
if (import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    GOOGLE_CONFIG.CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
}

if (import.meta.env.VITE_GOOGLE_API_KEY) {
    GOOGLE_CONFIG.API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
}