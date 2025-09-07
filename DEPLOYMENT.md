# Deployment Guide - Beginner Todo App

This guide explains how to deploy the Todo App with personalized Google Sheets integration for multiple users.

## Prerequisites

- Google Cloud Platform account
- Basic knowledge of web hosting
- Domain name (optional, for custom domain)

## Step 1: Google Cloud Setup

### 1.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project"
3. Name it (e.g., "todo-app-production")
4. Note the Project ID

### 1.2 Enable Required APIs

In your project, enable:
- Google Sheets API
- Google Drive API

```bash
# Via gcloud CLI:
gcloud services enable sheets.googleapis.com
gcloud services enable drive.googleapis.com
```

### 1.3 Create OAuth 2.0 Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth client ID**
3. Configure consent screen:
   - User Type: External (for public access)
   - App name: "Beginner Todo App"
   - User support email: your email
   - Developer contact: your email
   - Scopes: Add these scopes:
     - `https://www.googleapis.com/auth/spreadsheets`
     - `https://www.googleapis.com/auth/drive.file`

4. Create OAuth client:
   - Application type: Web application
   - Name: "Todo App Web Client"
   - Authorized JavaScript origins:
     - For development: `http://localhost:8080`
     - For production: `https://yourdomain.com`
   - Authorized redirect URIs: (same as origins)

5. Copy the **Client ID**

### 1.4 Create API Key

1. Click **Create Credentials > API key**
2. Restrict the key:
   - Application restrictions: HTTP referrers
   - Website restrictions: Add your domains
   - API restrictions: Select Google Sheets API

## Step 2: Configure the Application

### 2.1 Update config.js

```javascript
const CONFIG = {
    GOOGLE_CLIENT_ID: 'YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com',
    GOOGLE_API_KEY: 'YOUR_ACTUAL_API_KEY',
    // ... rest of config
};
```

### 2.2 Environment Variables (Optional)

For better security, use environment variables:

```javascript
// In your hosting platform, set:
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_API_KEY=your_api_key

// Update config.js to read from env:
const CONFIG = {
    GOOGLE_CLIENT_ID: window.ENV?.GOOGLE_CLIENT_ID || 'fallback_id',
    GOOGLE_API_KEY: window.ENV?.GOOGLE_API_KEY || 'fallback_key',
};
```

## Step 3: Deployment Options

### Option A: GitHub Pages (Free, Static)

1. Create GitHub repository
2. Push your code
3. Enable GitHub Pages in Settings
4. Access at: `https://username.github.io/repo-name`

```bash
git init
git add .
git commit -m "Initial deployment"
git remote add origin https://github.com/username/todo-app.git
git push -u origin main
```

### Option B: Netlify (Free tier available)

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Deploy:

```bash
netlify deploy --prod --dir=.
```

3. Set environment variables in Netlify dashboard

### Option C: Vercel (Free tier available)

1. Install Vercel CLI: `npm install -g vercel`
2. Deploy:

```bash
vercel --prod
```

### Option D: Google Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Initialize and deploy:
```bash
firebase init hosting
firebase deploy
```

### Option E: Traditional Web Hosting

Upload files via FTP/SFTP to your web server's public directory.

## Step 4: User Authentication Flow

When deployed, users will:

1. **First Visit:**
   - Click "CONNECT GOOGLE ACCOUNT"
   - Sign in with Google
   - Authorize app permissions
   - App automatically creates personal Google Sheet

2. **Subsequent Visits:**
   - Auto-connects if still authenticated
   - Loads tasks from their personal sheet
   - All data stays in user's Google Drive

## Step 5: Security Considerations

### 5.1 Domain Restrictions

Always restrict your API key and OAuth client to specific domains:
- Never use unrestricted keys in production
- Add only your actual domain(s)

### 5.2 Content Security Policy

Add CSP headers to your hosting:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self' https://apis.google.com https://accounts.google.com; 
               script-src 'self' 'unsafe-inline' https://apis.google.com https://accounts.google.com; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;">
```

### 5.3 HTTPS Required

Google OAuth requires HTTPS in production. Most hosting platforms provide free SSL certificates.

## Step 6: Testing Deployment

### 6.1 Test Checklist

- [ ] Google Sign-In works
- [ ] New users get automatic sheet creation
- [ ] Tasks save to Google Sheets
- [ ] Tasks load from Google Sheets
- [ ] Local storage fallback works
- [ ] Rollover functionality works
- [ ] Mobile responsive design works

### 6.2 Debug Common Issues

**Issue: "Invalid Origin" error**
- Solution: Add your domain to OAuth client origins

**Issue: "API Key Invalid"**
- Solution: Check key restrictions match your domain

**Issue: "Quota Exceeded"**
- Solution: Enable billing or implement rate limiting

## Step 7: Monitoring

### 7.1 Google Cloud Console

Monitor API usage:
- APIs & Services > Dashboard
- View quotas and usage statistics

### 7.2 Error Tracking (Optional)

Add error tracking service:

```javascript
window.addEventListener('error', (event) => {
    // Send to logging service
    console.error('Global error:', event.error);
});
```

## Step 8: Scaling Considerations

### For Large User Base:

1. **Implement caching:**
   - Cache sheet data locally
   - Reduce API calls

2. **Batch operations:**
   - Group multiple updates
   - Use batch API endpoints

3. **Rate limiting:**
   - Implement client-side throttling
   - Show sync status to users

## Production Checklist

Before going live:

- [ ] Replace all placeholder credentials
- [ ] Test with multiple Google accounts
- [ ] Verify domain restrictions
- [ ] Test on various browsers
- [ ] Check mobile responsiveness
- [ ] Implement error handling
- [ ] Add privacy policy page
- [ ] Add terms of service
- [ ] Set up Google Analytics (optional)
- [ ] Create user documentation

## Support & Maintenance

### User Support Features:

1. **Help Section:** Add in-app help
2. **FAQs:** Common issues and solutions
3. **Feedback:** Contact form or email

### Regular Maintenance:

- Monitor API quotas
- Update dependencies
- Review error logs
- Gather user feedback

## Example Production config.js

```javascript
const CONFIG = {
    GOOGLE_CLIENT_ID: '123456789-abcdef.apps.googleusercontent.com',
    GOOGLE_API_KEY: 'AIzaSyA-RealKeyHere',
    DISCOVERY_DOCS: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    SCOPES: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
    APP_NAME: 'Beginner Todo App',
    SHEET_NAME: 'Todo App Data',
    
    // Production settings
    ENVIRONMENT: 'production',
    ERROR_REPORTING: true,
    ANALYTICS_ID: 'G-XXXXXXXXXX' // Google Analytics
};
```

## Quick Start Commands

```bash
# Clone repository
git clone https://github.com/yourusername/todo-app.git
cd todo-app

# Update configuration
nano config.js  # Add your credentials

# Test locally
python -m http.server 8080  # or use any local server

# Deploy to Netlify
netlify deploy --prod

# Or deploy to Vercel
vercel --prod
```

## Conclusion

This app is designed for easy deployment with minimal server requirements. Each user's data is stored in their own Google Sheets, ensuring privacy and eliminating the need for a central database. The authentication flow is handled entirely by Google OAuth, making it secure and maintenance-free.