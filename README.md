# Beginner Todo App

A minimalist task management application with Google Sheets integration for data persistence and automatic task rollover functionality.

## Features

- **Task Management**: Add, complete, and delete daily tasks
- **Automatic Rollover**: Unfinished tasks automatically move to the next day
- **Google Sheets Integration**: Sync tasks with Google Sheets for backup
- **Daily Metrics**: Track completion and procrastination percentages
- **History View**: Review past days' tasks and performance
- **Minimalist Design**: Clean, elegant interface with focus on functionality

## Setup Instructions

### Local Development

1. Clone or download the project files
2. Open `index.html` in a modern web browser
3. The app will work locally with browser storage

### Google Sheets Integration Setup

To enable Google Sheets sync and automatic rollover:

#### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google Sheets API
4. Create OAuth 2.0 credentials (Web application type)
5. Add authorized JavaScript origins (your domain or localhost)
6. Note your Client ID and API Key

#### Step 2: Update Configuration

Edit `app.js` and replace:
```javascript
apiKey: 'YOUR_API_KEY'
clientId: 'YOUR_CLIENT_ID'
```

#### Step 3: Deploy Google Apps Script

1. Go to [Google Apps Script](https://script.google.com/)
2. Create a new project
3. Copy contents of `Code.gs` to the script editor
4. Deploy as Web App:
   - Execute as: You
   - Who has access: Anyone
5. Note the Web App URL

#### Step 4: Set Up Daily Trigger

In Google Apps Script:
1. Go to Triggers (clock icon)
2. Add Trigger:
   - Function: `runDailyRollover`
   - Event source: Time-driven
   - Type: Day timer
   - Time: Midnight to 1am

## Usage

### Adding Tasks
- Type task description in the input field
- Press Enter or click ADD button
- Tasks appear in the pending list

### Managing Tasks
- Check the checkbox to mark tasks as complete
- Click × button to delete tasks
- Completed tasks show with strikethrough

### Viewing Metrics
- Completion percentage shows done vs total tasks
- Procrastination percentage shows pending tasks
- Daily stats update in real-time

### History
- Switch to History tab
- Select a date to view past tasks
- See completion metrics for any day

### Google Sheets Structure

The app creates a sheet with three columns:
- **Date**: Task date (YYYY-MM-DD)
- **Tasks To Do Today**: Newline-separated task list
- **Tasks Not Done Today**: Pending tasks from rollover

Task format: `1- Task description` or `1- Task description - done`

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Data Privacy

- Tasks stored locally in browser storage
- Google Sheets data stored in your personal Google account
- No central database or third-party storage

## Troubleshooting

### Tasks not syncing to Google Sheets
1. Check Google authentication status in Settings
2. Verify Sheet ID is correct
3. Ensure API quotas not exceeded

### Rollover not working
1. Verify trigger is set up in Google Apps Script
2. Check timezone settings match your location
3. Review Apps Script execution logs

## Development

### File Structure
```
├── index.html          # Main HTML structure
├── styles.css          # Minimalist CSS styling
├── app.js             # Frontend JavaScript logic
├── Code.gs            # Google Apps Script backend
└── README.md          # Documentation
```

### Technologies Used
- Vanilla JavaScript (ES6+)
- CSS3 with CSS Grid and Flexbox
- Google Sheets API v4
- Google Apps Script

## License

Free to use for personal and commercial purposes.