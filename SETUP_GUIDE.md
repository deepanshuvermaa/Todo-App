# Quick Setup Guide - Todo App with Google Sheets

## What You Need to Do - Step by Step

### Step 1: Open Google Cloud Console
1. Go to: https://console.cloud.google.com/
2. Sign in with your Google account
3. Click "Select a project" → "NEW PROJECT"
4. Name it: "Todo App" 
5. Click "Create"

### Step 2: Enable Google Sheets API
1. In your project, go to the hamburger menu (☰) → "APIs & Services" → "Library"
2. Search for "Google Sheets API"
3. Click on it and press "ENABLE"
4. Also search for "Google Drive API" and enable it too

### Step 3: Create API Key
1. Go to "APIs & Services" → "Credentials"
2. Click "+ CREATE CREDENTIALS" → "API key"
3. Copy the API key that appears (looks like: AIzaSyB...)
4. Click "RESTRICT KEY"
5. Under "Application restrictions":
   - For testing: Select "None"
   - For production: Select "HTTP referrers" and add your domain
6. Under "API restrictions":
   - Select "Restrict key"
   - Choose "Google Sheets API" from the list
7. Click "Save"

### Step 4: Create OAuth Client ID
1. Still in "Credentials", click "+ CREATE CREDENTIALS" → "OAuth client ID"
2. If prompted, configure consent screen first:
   - User Type: External
   - App name: "Todo App"
   - User support email: your email
   - Developer contact: your email
   - Click "Save and Continue"
   - In Scopes: Click "Add or Remove Scopes"
   - Search and add these:
     - `https://www.googleapis.com/auth/spreadsheets`
     - `https://www.googleapis.com/auth/drive.file`
   - Click "Update" → "Save and Continue"
   - Add test users: Add your email
   - Click "Save and Continue"

3. Now create the OAuth client:
   - Application type: "Web application"
   - Name: "Todo App Client"
   - Authorized JavaScript origins - ADD THESE:
     - `http://localhost`
     - `http://localhost:8080`
     - `http://127.0.0.1:8080`
     - `file://` (for local file testing)
   - Click "Create"
   - Copy the Client ID (looks like: 123456789-abc...apps.googleusercontent.com)

### Step 5: Update Your Config File

Open `config.js` and replace the placeholders:

```javascript
const CONFIG = {
    // Replace these with your actual values from steps above
    GOOGLE_CLIENT_ID: 'YOUR-CLIENT-ID-HERE.apps.googleusercontent.com',
    GOOGLE_API_KEY: 'YOUR-API-KEY-HERE',
    
    // Don't change these
    DISCOVERY_DOCS: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    SCOPES: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
    APP_NAME: 'Beginner Todo App',
    SHEET_NAME: 'Todo App Data',
    APPS_SCRIPT_URL: ''
};
```

### Step 6: Test Locally

#### Option A: Using Python (Easiest)
```bash
# Open terminal/command prompt in the project folder
python -m http.server 8080

# Or for Python 2:
python -m SimpleHTTPServer 8080
```
Then open: http://localhost:8080

#### Option B: Using Node.js
```bash
# Install http-server globally
npm install -g http-server

# Run in project folder
http-server -p 8080
```
Then open: http://localhost:8080

#### Option C: Using Live Server (VS Code)
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Step 7: First Time Use

1. Open the app in your browser
2. The app should work locally now (you can add tasks)
3. To enable Google Sheets sync:
   - Go to "Settings" tab
   - Click "CONNECT GOOGLE ACCOUNT"
   - Sign in with Google
   - Allow permissions
   - The app will automatically create a Google Sheet for you

## Troubleshooting

### "Google API not configured" message
- This is normal if you haven't added credentials yet
- The app will work locally with browser storage
- Follow steps 1-5 to enable Google sync

### "Invalid Origin" error when signing in
- Make sure you added all the origins in Step 4
- If testing locally, use http://localhost:8080 not file://

### "API Key Invalid" error
- Check that you copied the key correctly
- Make sure the API key restrictions allow Google Sheets API

### Tasks not appearing
- Check browser console (F12) for errors
- Make sure JavaScript is enabled
- Try refreshing the page

### Google Sign-in not working
- Wait a few minutes after creating credentials (Google needs time to propagate)
- Make sure you're using a web server (not opening file directly)
- Check that both API key and Client ID are correct

## What Happens with User Data?

1. **For You (Developer):**
   - When you sign in, a Google Sheet is created in YOUR Google Drive
   - Your tasks are saved there
   - You can see it at: https://drive.google.com

2. **For Your Users:**
   - Each user who signs in gets their OWN Google Sheet
   - Their data is stored in THEIR Google Drive
   - They own their data completely
   - You don't have access to their sheets

## Testing Without Google Setup

If you just want to test the app without Google integration:

1. Open `index.html` directly in a browser
2. The app will work with local storage only
3. Tasks will be saved in your browser
4. No cloud sync, but all other features work

## For Production Deployment

When ready to deploy for real users:

1. Update Authorized JavaScript origins with your domain:
   - `https://yourdomain.com`
   - `https://www.yourdomain.com`

2. Update API Key restrictions:
   - Change from "None" to "HTTP referrers"
   - Add your domain

3. Deploy to any static host:
   - GitHub Pages (free)
   - Netlify (free)
   - Vercel (free)
   - Your own web server

## Need Help?

Common issues and solutions:

1. **Clear browser cache** if things aren't updating
2. **Use incognito mode** to test fresh sign-in
3. **Check browser console** (F12) for specific errors
4. **Wait 5-10 minutes** after creating credentials

The app is designed to work even without Google integration, so you can always use it locally while setting up the cloud features.