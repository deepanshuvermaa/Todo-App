# Google OAuth Setup for GitHub Pages

## The COOP Error Issue

The "Cross-Origin-Opener-Policy would block window.opener" error occurs because:
1. GitHub Pages doesn't allow custom HTTP headers
2. Google's OAuth popup needs `window.opener` to communicate back
3. Without proper COOP headers, browsers block this communication

## Solution: Configure Google Cloud Console

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/apis/credentials
2. Select your project (or create one)

### Step 2: Configure OAuth 2.0 Client ID

**Current Client ID:** `995916217406-3o8864q7ikdgjsrqr95qhgg0k25kuub7.apps.googleusercontent.com`

1. Click on your OAuth 2.0 Client ID
2. Under **"Authorized JavaScript origins"**, add:
   ```
   https://deepanshuvermaa.github.io
   ```

3. Under **"Authorized redirect URIs"**, add:
   ```
   https://deepanshuvermaa.github.io/Todo-App
   https://deepanshuvermaa.github.io/Todo-App/
   ```

4. Click **"SAVE"**

### Step 3: Enable Required APIs

Make sure these APIs are enabled:
1. Google Sheets API
2. Google Drive API

Go to: https://console.cloud.google.com/apis/library

### Step 4: Test the Configuration

After saving:
1. Wait 5-10 minutes for changes to propagate
2. Clear your browser cache
3. Try signing in again

## Alternative: Use API Key Only (No OAuth)

If OAuth continues to fail, you can create a public Google Sheet and use API key only:

1. Create a Google Sheet
2. Share it publicly (Anyone with link can edit)
3. Use the sheet ID in your app
4. Only API key needed (no OAuth)

**Current API Key:** `AIzaSyDcNSfA1rOQxCZ9Drm7vYosb4ewPZyzBpo`

## Debugging

To check if OAuth is working:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try signing in
4. Look for actual errors (not COOP warnings)

The COOP warnings are normal, but if you get:
- `redirect_uri_mismatch` → Fix redirect URIs
- `invalid_client` → Check client ID
- `access_denied` → User cancelled or permissions issue
