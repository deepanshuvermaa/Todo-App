import { GOOGLE_CONFIG } from '../config/google.js';

class GoogleSheetsService {
    constructor() {
        this.gapi = null;
        this.google = null;
        this.client = null;
        this.accessToken = null;
        this.isSignedIn = false;
        this.currentUser = null;
        this.sheetId = null;
        this.initializationPromise = null;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = this._initializeServices();
        return this.initializationPromise;
    }

    async _initializeServices() {
        return new Promise((resolve, reject) => {
            // Load Google API script if not already loaded
            if (typeof window.gapi === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://apis.google.com/js/api.js';
                script.async = true;
                script.defer = true;
                script.onload = () => {
                    console.log('✅ Google API script loaded');
                    this._loadGoogleIdentityServices(resolve, reject);
                };
                script.onerror = (error) => {
                    console.error('❌ Failed to load Google API script:', error);
                    this.isInitialized = false;
                    reject(new Error('Failed to load Google API - check internet connection'));
                };
                document.head.appendChild(script);
            } else {
                this._loadGoogleIdentityServices(resolve, reject);
            }
        });
    }

    _loadGoogleIdentityServices(resolve, reject) {
        // Load Google Identity Services if not already loaded
        if (typeof window.google === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => {
                console.log('✅ Google Identity Services script loaded');
                this._initializeGoogleAPI(resolve, reject);
            };
            script.onerror = (error) => {
                console.error('❌ Failed to load Google Identity Services:', error);
                this.isInitialized = false;
                reject(new Error('Failed to load Google Identity Services - check internet connection'));
            };
            document.head.appendChild(script);
        } else {
            this._initializeGoogleAPI(resolve, reject);
        }
    }

    _initializeGoogleAPI(resolve, reject) {
        this.gapi = window.gapi;
        this.google = window.google;

        // Initialize Google API client
        this.gapi.load('client', async () => {
            try {
                await this.gapi.client.init({
                    apiKey: GOOGLE_CONFIG.API_KEY,
                    discoveryDocs: GOOGLE_CONFIG.DISCOVERY_DOCS
                });

                console.log('Google API client initialized');

                // Initialize Google Identity Services client
                try {
                    this._initializeGISClient();
                } catch (gisError) {
                    console.warn('Google Identity Services initialization failed:', gisError);
                    // Continue without authentication - app can work offline
                }

                // Check for existing authentication
                try {
                    this._checkExistingAuth();
                } catch (authError) {
                    console.warn('Existing auth check failed:', authError);
                }

                this.isInitialized = true;
                resolve(true);
            } catch (error) {
                console.error('Failed to initialize Google API client:', error);
                // Don't reject - allow app to work offline
                console.warn('App will work in offline mode');
                this.isInitialized = false;
                resolve(false);
            }
        });
    }

    _initializeGISClient() {
        if (!this.google?.accounts?.oauth2) {
            throw new Error('Google Identity Services not available');
        }

        // M10 fix: Do NOT patch global console.warn/console.error — that silences all
        // debugging across the app and is impossible to restore under race conditions.
        // COOP warnings from Google Sign-In popup are cosmetic and can be ignored.
        this.client = this.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CONFIG.CLIENT_ID,
            scope: GOOGLE_CONFIG.SCOPES,
            callback: (response) => {
                this._handleAuthResponse(response);
            },
            error_callback: (error) => {
                console.error('OAuth error:', error);
                if (this.signInReject) {
                    this.signInReject(new Error(error.type || 'OAuth failed'));
                }
            }
        });

        console.log('✅ Google Identity Services client initialized');
    }

    async _checkExistingAuth() {
        const storedToken = localStorage.getItem('googleAccessToken');
        const tokenExpiry = localStorage.getItem('tokenExpiry');
        const userEmail = localStorage.getItem('userEmail');
        const sheetId = localStorage.getItem('sheetId');

        // Check if all required values exist
        if (!storedToken || storedToken === 'undefined' ||
            !tokenExpiry || tokenExpiry === 'undefined' ||
            !userEmail || userEmail === 'undefined') {
            console.log('No stored authentication found');
            this._clearAuthState();
            return;
        }

        // Check if token hasn't expired (with 5 minute buffer)
        const expiryTime = parseInt(tokenExpiry);
        if (isNaN(expiryTime) || Date.now() >= (expiryTime - 300000)) {
            console.log('Stored token expired');
            this._clearAuthState();
            return;
        }

        // Don't validate token on startup - just restore if not expired
        // Token will be validated when actually used
        try {
            this.accessToken = storedToken;
            this.isSignedIn = true;
            this.currentUser = { email: userEmail };
            this.sheetId = sheetId;

            this.gapi.client.setToken({
                access_token: this.accessToken
            });

            console.log('✅ Restored authentication session:', userEmail);
            this._notifyAuthStateChange();

        } catch (error) {
            console.warn('⚠️ Failed to restore session:', error.message);
            this._clearAuthState();
        }
    }

    _clearAuthState() {
        // Clear stored authentication
        localStorage.removeItem('googleAccessToken');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('sheetId');
        localStorage.removeItem('lifeDataSheetId');

        // Clear current state
        this.accessToken = null;
        this.isSignedIn = false;
        this.currentUser = null;
        this.sheetId = null;

        // Clear API token
        if (this.gapi?.client) {
            this.gapi.client.setToken(null);
        }
    }

    async signIn() {
        if (!this.isInitialized) {
            throw new Error('Google Sheets service not initialized. Please refresh the page and try again.');
        }

        if (!this.client) {
            throw new Error('Google client not initialized. Please refresh the page and try again.');
        }

        if (!this.gapi?.client) {
            throw new Error('Google API client not ready. Please refresh the page and try again.');
        }

        return new Promise((resolve, reject) => {
            this.signInResolve = resolve;
            this.signInReject = reject;
            this.client.requestAccessToken();
        });
    }

    async _handleAuthResponse(response) {
        if (response.error) {
            console.error('❌ Authentication error:', response.error);

            // Clear any partial auth state
            this.accessToken = null;
            this.isSignedIn = false;
            this.currentUser = null;

            if (this.signInReject) {
                this.signInReject(new Error(response.error));
            }
            return;
        }

        if (!response.access_token) {
            console.error('❌ No access token received');
            if (this.signInReject) {
                this.signInReject(new Error('No access token received'));
            }
            return;
        }

        this.accessToken = response.access_token;

        // Store token with expiry (default 1 hour)
        const expiryTime = Date.now() + (3600 * 1000);
        localStorage.setItem('googleAccessToken', this.accessToken);
        localStorage.setItem('tokenExpiry', expiryTime.toString());

        // Set the access token for API calls
        if (this.gapi?.client?.setToken) {
            this.gapi.client.setToken({
                access_token: this.accessToken
            });
        } else {
            console.error('❌ GAPI client not available');
            if (this.signInReject) {
                this.signInReject(new Error('Google API client not initialized'));
            }
            return;
        }

        try {
            // Validate token by getting user info
            const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            if (!userResponse.ok) {
                throw new Error(`Failed to get user info: ${userResponse.status} ${userResponse.statusText}`);
            }

            this.currentUser = await userResponse.json();
            localStorage.setItem('userEmail', this.currentUser.email);
            console.log('✅ User authenticated:', this.currentUser.email);

            // Only mark as signed in after successful token validation
            this.isSignedIn = true;

            // Setup or find existing sheet
            try {
                await this._setupSheet();
                console.log('✅ Sheet setup complete');
            } catch (sheetError) {
                console.error('❌ Error setting up sheet:', sheetError);

                // Revert authentication state if sheet setup fails
                this.isSignedIn = false;
                this.sheetId = null;

                // Clear stored state
                localStorage.removeItem('googleAccessToken');
                localStorage.removeItem('tokenExpiry');
                localStorage.removeItem('userEmail');

                throw new Error(`Sheet setup failed: ${sheetError.message || sheetError}`);
            }

            this._notifyAuthStateChange();

            if (this.signInResolve) {
                this.signInResolve(this.currentUser);
            }
        } catch (error) {
            console.error('❌ Error during authentication setup:', error);

            // Clear authentication state on any error
            this.accessToken = null;
            this.isSignedIn = false;
            this.currentUser = null;
            this.sheetId = null;

            if (this.gapi?.client) {
                this.gapi.client.setToken(null);
            }

            if (this.signInReject) {
                this.signInReject(error);
            }
        }
    }

    async _loadDriveAPIWithRetry(maxRetries = 3, delayMs = 1000) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Loading Drive API (attempt ${attempt}/${maxRetries})...`);
                await this.gapi.client.load('drive', 'v3');
                console.log('✅ Drive API loaded successfully');
                return;
            } catch (error) {
                console.error(`❌ Drive API load failed (attempt ${attempt}/${maxRetries}):`, error);

                if (attempt === maxRetries) {
                    throw new Error(`Failed to load Drive API after ${maxRetries} attempts: ${error.message}`);
                }

                // Exponential backoff
                const waitTime = delayMs * Math.pow(2, attempt - 1);
                console.log(`Retrying in ${waitTime}ms...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }

    async signOut() {
        // Clear stored authentication
        localStorage.removeItem('googleAccessToken');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('sheetId');
        localStorage.removeItem('lifeDataSheetId');

        // Clear current state
        this.accessToken = null;
        this.isSignedIn = false;
        this.currentUser = null;
        this.sheetId = null;

        // Clear API token
        if (this.gapi?.client) {
            this.gapi.client.setToken(null);
        }

        console.log('User signed out');
        this._notifyAuthStateChange();
    }

    async _setupSheet() {
        // Load Drive API with retry logic
        await this._loadDriveAPIWithRetry();

        // First check if we have a stored sheet ID for "LIFE Data"
        const storedSheetId = localStorage.getItem('lifeDataSheetId');

        if (storedSheetId) {
            // Verify the stored sheet still exists and is accessible
            try {
                const fileResponse = await this.gapi.client.drive.files.get({
                    fileId: storedSheetId,
                    fields: 'id, name, trashed'
                });

                if (fileResponse.result && !fileResponse.result.trashed &&
                    fileResponse.result.name === GOOGLE_CONFIG.SHEET_NAME) {
                    // Use the stored sheet
                    this.sheetId = storedSheetId;
                    localStorage.setItem('sheetId', this.sheetId); // Keep for backward compatibility
                    console.log('✅ Connected to existing LIFE Data sheet:', this.sheetId);

                    // Verify and fix sheet structure if needed
                    await this._ensureSheetStructure();
                    return;
                } else {
                    // Stored sheet is invalid, clear it
                    localStorage.removeItem('lifeDataSheetId');
                    localStorage.removeItem('sheetId');
                    console.log('⚠️ Stored sheet was invalid, searching for LIFE Data sheet...');
                }
            } catch (e) {
                // Stored sheet doesn't exist or not accessible
                localStorage.removeItem('lifeDataSheetId');
                localStorage.removeItem('sheetId');
                console.log('⚠️ Stored sheet not accessible, searching for LIFE Data sheet...');
            }
        }

        // Search for existing "LIFE Data" sheet in user's Drive
        console.log('🔍 Searching for existing LIFE Data sheet...');
        const searchResponse = await this.gapi.client.drive.files.list({
            q: `name='${GOOGLE_CONFIG.SHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
            fields: 'files(id, name)',
            orderBy: 'createdTime desc'
        });

        if (searchResponse.result.files && searchResponse.result.files.length > 0) {
            // Use the first (most recent) "LIFE Data" sheet found
            this.sheetId = searchResponse.result.files[0].id;
            localStorage.setItem('lifeDataSheetId', this.sheetId);
            localStorage.setItem('sheetId', this.sheetId);
            console.log('✅ Found existing LIFE Data sheet:', this.sheetId);

            // Verify and fix sheet structure if needed
            await this._ensureSheetStructure();
        } else {
            // No existing "LIFE Data" sheet found, create one
            console.log('📝 No LIFE Data sheet found, creating new sheet...');
            await this._createNewSheet();
        }

        console.log('✅ Sheet setup complete. Sheet ID:', this.sheetId);
    }

    async _createNewSheet() {
        try {
            const response = await this.gapi.client.sheets.spreadsheets.create({
                properties: {
                    title: GOOGLE_CONFIG.SHEET_NAME
                },
                sheets: [
                    { properties: { title: 'Tasks' } },
                    { properties: { title: 'Expenses' } },
                    { properties: { title: 'Notes' } },
                    { properties: { title: 'Habits' } },
                    { properties: { title: 'HabitHistory' } },
                    { properties: { title: 'Meals' } },
                    { properties: { title: 'Reminders' } },
                    { properties: { title: 'CompletedReminders' } },
                    { properties: { title: 'Journal' } },
                    { properties: { title: 'BucketList' } },
                    { properties: { title: 'VisionBoard' } },
                    { properties: { title: 'Quotes' } },
                    { properties: { title: 'Alarms' } },
                    { properties: { title: 'Movies' } }
                ]
            });

            this.sheetId = response.result.spreadsheetId;

            // Store both for compatibility and clarity
            localStorage.setItem('lifeDataSheetId', this.sheetId);
            localStorage.setItem('sheetId', this.sheetId);

            // Setup headers for each sheet
            await this._initializeSheetHeaders();

            console.log('✅ Created new LIFE Data sheet:', this.sheetId);
            const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${this.sheetId}`;
            console.log('📊 Sheet URL:', spreadsheetUrl);
            console.log('💾 This sheet will be used for all future syncs');
            console.log('📤 Your offline data will now be synced to this sheet');

        } catch (error) {
            console.error('❌ Error creating new sheet:', error);
            throw error;
        }
    }

    async _initializeSheetHeaders() {
        const headerUpdates = [
            {
                range: 'Tasks!A1:F1',
                values: [['ID', 'Text', 'Completed', 'Date', 'Priority', 'CreatedAt']]
            },
            {
                range: 'Expenses!A1:F1',
                values: [['ID', 'Description', 'Amount', 'Category', 'Date', 'CreatedAt']]
            },
            {
                range: 'Notes!A1:F1',
                values: [['ID', 'Title', 'Content', 'Folder', 'Tags', 'CreatedAt']]
            },
            {
                range: 'Habits!A1:F1',
                values: [['ID', 'Name', 'Description', 'Color', 'Streak', 'CreatedAt']]
            },
            {
                range: 'HabitHistory!A1:D1',
                values: [['HabitID', 'Date', 'Completed', 'CreatedAt']]
            },
            {
                range: 'Meals!A1:F1',
                values: [['ID', 'Name', 'Calories', 'Date', 'Type', 'CreatedAt']]
            },
            {
                range: 'Reminders!A1:F1',
                values: [['ID', 'Person', 'Phone', 'Date', 'Note', 'CreatedAt']]
            },
            {
                range: 'CompletedReminders!A1:G1',
                values: [['ID', 'Person', 'Phone', 'Date', 'Note', 'CompletedDate', 'CreatedAt']]
            },
            {
                range: 'Journal!A1:F1',
                values: [['ID', 'Date', 'Mood', 'Entry', 'Gratitude', 'CreatedAt']]
            },
            {
                range: 'BucketList!A1:F1',
                values: [['ID', 'Title', 'Description', 'Status', 'Category', 'CreatedAt']]
            },
            {
                range: 'VisionBoard!A1:I1',
                values: [['ID', 'Title', 'Description', 'Category', 'Tags', 'ImageData', 'Frame', 'IsPinned', 'CreatedAt']]
            },
            {
                range: 'Quotes!A1:D1',
                values: [['ID', 'Text', 'Author', 'CreatedAt']]
            },
            {
                range: 'Alarms!A1:H1',
                values: [['ID', 'Name', 'Time', 'Enabled', 'Repeat', 'Days', 'Sound', 'CreatedAt']]
            },
            {
                range: 'Movies!A1:H1',
                values: [['ID', 'Title', 'Year', 'Rating', 'Watched', 'Poster', 'Notes', 'AddedAt']]
            }
        ];

        for (const update of headerUpdates) {
            await this.gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: this.sheetId,
                range: update.range,
                valueInputOption: 'RAW',
                resource: {
                    values: update.values
                }
            });
        }
    }

    async _ensureSheetStructure() {
        try {
            const response = await this.gapi.client.sheets.spreadsheets.get({
                spreadsheetId: this.sheetId
            });

            const sheets = response.result.sheets.map(sheet => sheet.properties.title);
            const requiredSheets = [
                'Tasks',
                'Expenses',
                'Notes',
                'Habits',
                'HabitHistory',
                'Meals',
                'Reminders',
                'CompletedReminders',
                'Journal',
                'BucketList',
                'VisionBoard',
                'Quotes',
                'Alarms',
                'Movies'
            ];

            const missingSsheets = requiredSheets.filter(sheet => !sheets.includes(sheet));

            if (missingSsheets.length > 0) {
                // Create missing sheets
                const requests = missingSsheets.map(sheetName => ({
                    addSheet: {
                        properties: {
                            title: sheetName
                        }
                    }
                }));

                await this.gapi.client.sheets.spreadsheets.batchUpdate({
                    spreadsheetId: this.sheetId,
                    resource: {
                        requests: requests
                    }
                });

                // Initialize headers for new sheets
                await this._initializeSheetHeaders();
            }
        } catch (error) {
            console.error('Error ensuring sheet structure:', error);
        }
    }

    // Sync methods for different data types
    async syncDataToSheet(sheetName, data, headers) {
        if (!this.isSignedIn || !this.sheetId) {
            console.warn(`Cannot sync ${sheetName}: Not authenticated or no sheet ID`);
            throw new Error('Not authenticated with Google Sheets');
        }

        try {
            // Validate sheet access
            await this.gapi.client.sheets.spreadsheets.get({
                spreadsheetId: this.sheetId,
                ranges: [`${sheetName}!A1:A1`]
            });

            // Clear existing data
            await this.gapi.client.sheets.spreadsheets.values.clear({
                spreadsheetId: this.sheetId,
                range: `${sheetName}!A2:Z`
            });

            if (data.length === 0) {
                console.log(`✅ Cleared ${sheetName} (no data to sync)`);
                return true;
            }

            // Prepare data rows
            const rows = data.map(item => {
                return headers.map(header => {
                    const value = item[header.key];
                    if (typeof value === 'object' && value !== null) {
                        return JSON.stringify(value);
                    }
                    return value !== undefined && value !== null ? String(value) : '';
                });
            });

            // Update with new data
            await this.gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: this.sheetId,
                range: `${sheetName}!A2`,
                valueInputOption: 'RAW',
                resource: {
                    values: rows
                }
            });

            console.log(`✅ Synced ${data.length} items to ${sheetName}`);
            return true;
        } catch (error) {
            console.error(`❌ Error syncing to ${sheetName}:`, error);
            throw error;
        }
    }

    async loadDataFromSheet(sheetName, headers) {
        if (!this.isSignedIn || !this.sheetId) {
            console.warn('Not authenticated or no sheet ID');
            return [];
        }

        try {
            const response = await this.gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: this.sheetId,
                range: `${sheetName}!A2:Z`
            });

            const rows = response.result.values || [];

            const data = rows.map(row => {
                const item = {};
                headers.forEach((header, index) => {
                    let value = row[index] || '';

                    // Try to parse JSON for object fields
                    if (header.type === 'object' && value) {
                        try {
                            value = JSON.parse(value);
                        } catch (e) {
                            // Keep as string if parsing fails
                        }
                    }

                    item[header.key] = value;
                });
                return item;
            }).filter(item => item.id); // Filter out empty rows

            console.log(`✅ Loaded ${data.length} items from ${sheetName}`);
            return data;
        } catch (error) {
            console.error(`Error loading from ${sheetName}:`, error);
            return [];
        }
    }

    // Auth state change notification
    _notifyAuthStateChange() {
        const event = new CustomEvent('googleAuthStateChange', {
            detail: {
                isSignedIn: this.isSignedIn,
                user: this.currentUser,
                sheetId: this.sheetId
            }
        });
        window.dispatchEvent(event);
    }

    // Public getters
    getAuthState() {
        return {
            isSignedIn: this.isSignedIn,
            user: this.currentUser,
            sheetId: this.sheetId
        };
    }

    getSheetUrl() {
        if (!this.sheetId) return null;
        return `https://docs.google.com/spreadsheets/d/${this.sheetId}`;
    }
}

// Create and export singleton instance
const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;