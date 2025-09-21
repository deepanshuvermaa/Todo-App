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
                script.onload = () => {
                    this._loadGoogleIdentityServices(resolve, reject);
                };
                script.onerror = () => reject(new Error('Failed to load Google API'));
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
            script.onload = () => {
                this._initializeGoogleAPI(resolve, reject);
            };
            script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
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

                resolve(true);
            } catch (error) {
                console.error('Failed to initialize Google API client:', error);
                // Don't reject - allow app to work offline
                console.warn('App will work in offline mode');
                resolve(false);
            }
        });
    }

    _initializeGISClient() {
        if (!this.google?.accounts?.oauth2) {
            throw new Error('Google Identity Services not available');
        }

        this.client = this.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CONFIG.CLIENT_ID,
            scope: GOOGLE_CONFIG.SCOPES,
            callback: (response) => {
                this._handleAuthResponse(response);
            }
        });

        console.log('Google Identity Services client initialized');
    }

    _checkExistingAuth() {
        const storedToken = localStorage.getItem('googleAccessToken');
        const tokenExpiry = localStorage.getItem('tokenExpiry');
        const userEmail = localStorage.getItem('userEmail');
        const sheetId = localStorage.getItem('sheetId');

        if (storedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
            this.accessToken = storedToken;
            this.isSignedIn = true;
            this.currentUser = { email: userEmail };
            this.sheetId = sheetId;

            // Set the access token for API calls
            this.gapi.client.setToken({
                access_token: this.accessToken
            });

            console.log('Restored existing Google authentication');
            this._notifyAuthStateChange();
        }
    }

    async signIn() {
        if (!this.client) {
            throw new Error('Google client not initialized');
        }

        return new Promise((resolve, reject) => {
            this.signInResolve = resolve;
            this.signInReject = reject;
            this.client.requestAccessToken();
        });
    }

    async _handleAuthResponse(response) {
        if (response.error) {
            console.error('Authentication error:', response.error);
            if (this.signInReject) {
                this.signInReject(new Error(response.error));
            }
            return;
        }

        this.accessToken = response.access_token;
        this.isSignedIn = true;

        // Store token with expiry (default 1 hour)
        const expiryTime = Date.now() + (3600 * 1000);
        localStorage.setItem('googleAccessToken', this.accessToken);
        localStorage.setItem('tokenExpiry', expiryTime.toString());

        // Set the access token for API calls
        if (this.gapi?.client?.setToken) {
            this.gapi.client.setToken({
                access_token: this.accessToken
            });
        }

        try {
            // Get user info
            const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            if (userResponse.ok) {
                this.currentUser = await userResponse.json();
                localStorage.setItem('userEmail', this.currentUser.email);
                console.log('User authenticated:', this.currentUser.email);
            } else {
                console.warn('Failed to get user info, but continuing with authentication');
            }

            // Setup or find existing sheet
            try {
                await this._setupSheet();
            } catch (sheetError) {
                console.error('Error setting up sheet:', sheetError);
                // Continue anyway - data will be stored locally
                console.warn('Google Sheets sync disabled - data will be stored locally only');
            }

            this._notifyAuthStateChange();

            if (this.signInResolve) {
                this.signInResolve(this.currentUser);
            }
        } catch (error) {
            console.error('Error during authentication setup:', error);
            // Still mark as signed in if we have an access token
            if (this.accessToken) {
                this._notifyAuthStateChange();
                if (this.signInResolve) {
                    this.signInResolve({ email: 'unknown@gmail.com' });
                }
            } else if (this.signInReject) {
                this.signInReject(error);
            }
        }
    }

    async signOut() {
        // Clear stored authentication
        localStorage.removeItem('googleAccessToken');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('sheetId');

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
        try {
            // First try to find existing sheet
            await this.gapi.client.load('drive', 'v3');
            const searchResponse = await this.gapi.client.drive.files.list({
                q: `name='${GOOGLE_CONFIG.SHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
                fields: 'files(id, name)'
            });

            if (searchResponse.result.files && searchResponse.result.files.length > 0) {
                // Use existing sheet
                this.sheetId = searchResponse.result.files[0].id;
                localStorage.setItem('sheetId', this.sheetId);
                console.log('Found existing sheet:', this.sheetId);

                // Verify sheet structure
                await this._ensureSheetStructure();
            } else {
                // Create new sheet
                await this._createNewSheet();
            }
        } catch (error) {
            console.error('Error setting up sheet:', error);
            throw error;
        }
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
                    { properties: { title: 'Meals' } },
                    { properties: { title: 'Reminders' } },
                    { properties: { title: 'Journal' } },
                    { properties: { title: 'BucketList' } },
                    { properties: { title: 'Quotes' } }
                ]
            });

            this.sheetId = response.result.spreadsheetId;
            localStorage.setItem('sheetId', this.sheetId);

            // Setup headers for each sheet
            await this._initializeSheetHeaders();

            console.log('Created new sheet:', this.sheetId);
            const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${this.sheetId}`;
            console.log('Sheet URL:', spreadsheetUrl);

        } catch (error) {
            console.error('Error creating new sheet:', error);
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
                range: 'Meals!A1:F1',
                values: [['ID', 'Name', 'Calories', 'Date', 'Type', 'CreatedAt']]
            },
            {
                range: 'Reminders!A1:F1',
                values: [['ID', 'Person', 'Phone', 'Date', 'Note', 'CreatedAt']]
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
                range: 'Quotes!A1:D1',
                values: [['ID', 'Text', 'Author', 'CreatedAt']]
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
            const requiredSheets = ['Tasks', 'Expenses', 'Notes', 'Habits', 'Meals', 'Reminders', 'Journal', 'BucketList', 'Quotes'];

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
            console.warn('Not authenticated or no sheet ID');
            return false;
        }

        try {
            // Clear existing data
            await this.gapi.client.sheets.spreadsheets.values.clear({
                spreadsheetId: this.sheetId,
                range: `${sheetName}!A2:Z`
            });

            if (data.length === 0) {
                return true;
            }

            // Prepare data rows
            const rows = data.map(item => {
                return headers.map(header => {
                    const value = item[header.key];
                    if (typeof value === 'object') {
                        return JSON.stringify(value);
                    }
                    return value || '';
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
            console.error(`Error syncing to ${sheetName}:`, error);
            return false;
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