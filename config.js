// Configuration file for Google API credentials
// Replace these with your actual credentials from Google Cloud Console

const CONFIG = {
    // Google OAuth2 Configuration
    GOOGLE_CLIENT_ID: '995916217406-3o8864q7ikdgjsrqr95qhgg0k25kuub7.apps.googleusercontent.com',
    GOOGLE_API_KEY: 'AIzaSyDcNSfA1rOQxCZ9Drm7vYosb4ewPZyzBpo', // Replace this after you create the API key
    
    // Google Sheets API Configuration
    DISCOVERY_DOCS: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    SCOPES: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
    
    // App Configuration
    APP_NAME: 'Beginner Todo App',
    SHEET_NAME: 'Todo App Data',
    
    // Optional: Google Apps Script Web App URL (if using server-side functions)
    APPS_SCRIPT_URL: '' // Leave empty if not using Apps Script backend
};

// For production deployment, you can use environment variables
if (typeof process !== 'undefined' && process.env) {
    CONFIG.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || CONFIG.GOOGLE_CLIENT_ID;
    CONFIG.GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || CONFIG.GOOGLE_API_KEY;
}