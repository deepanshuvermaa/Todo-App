// Modern Google Authentication using Google Identity Services
class ModernGoogleAuth {
    constructor() {
        this.client = null;
        this.accessToken = null;
        this.isSignedIn = false;
        this.currentUser = null;
    }

    async initialize() {
        return new Promise((resolve, reject) => {
            // Check setup first
            if (window.setupChecker && !window.setupChecker.checkSetup()) {
                reject(new Error('Setup validation failed. Check config.js'));
                return;
            }

            // Load the Google API client library
            if (typeof gapi === 'undefined') {
                reject(new Error('Google API library not loaded'));
                return;
            }

            // Check for valid API key
            if (!CONFIG.GOOGLE_API_KEY || CONFIG.GOOGLE_API_KEY.includes('YOUR')) {
                reject(new Error('Invalid API Key. Please update config.js with your actual API key.'));
                return;
            }

            // Initialize the API client with API key only
            gapi.load('client', async () => {
                try {
                    await gapi.client.init({
                        apiKey: CONFIG.GOOGLE_API_KEY,
                        discoveryDocs: CONFIG.DISCOVERY_DOCS
                    });
                    
                    console.log('Google API client initialized');
                    
                    // Check if Google Identity Services is loaded
                    if (typeof google === 'undefined' || !google.accounts) {
                        throw new Error('Google Identity Services not loaded');
                    }
                    
                    // Initialize the Google Identity Services client
                    this.initializeGISClient();
                    resolve(true);
                } catch (error) {
                    console.error('Failed to initialize Google API client:', error);
                    
                    // Provide helpful error messages
                    if (error.message && error.message.includes('API key not valid')) {
                        this.showMessage('Invalid API Key. Please check your Google Cloud Console settings.', 'error');
                    } else if (error.message && error.message.includes('Not Found')) {
                        this.showMessage('Google Sheets API might not be enabled. Please check Google Cloud Console.', 'error');
                    }
                    
                    reject(error);
                }
            });
        });
    }

    initializeGISClient() {
        // Initialize the Google Identity Services client for OAuth
        this.client = google.accounts.oauth2.initTokenClient({
            client_id: CONFIG.GOOGLE_CLIENT_ID,
            scope: CONFIG.SCOPES,
            callback: (response) => {
                this.handleAuthResponse(response);
            }
        });
        
        console.log('Google Identity Services client initialized');
    }

    async signIn() {
        return new Promise((resolve) => {
            // Store resolve function to call after authentication
            this.authResolve = resolve;
            
            // Request access token
            this.client.requestAccessToken();
        });
    }

    handleAuthResponse(response) {
        if (response.error) {
            console.error('Authentication error:', response);
            this.updateUIForSignedOut();
            if (this.authResolve) {
                this.authResolve(false);
                this.authResolve = null;
            }
            return;
        }

        // Store the access token
        this.accessToken = response.access_token;
        this.isSignedIn = true;
        
        // Set the access token for API calls
        gapi.client.setToken({
            access_token: this.accessToken
        });

        // Get user info
        this.getUserInfo();
        
        // Update UI
        this.updateUIForSignedIn();
        
        if (this.authResolve) {
            this.authResolve(true);
            this.authResolve = null;
        }
    }

    async getUserInfo() {
        try {
            // Use the access token to get user info
            const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            
            if (response.ok) {
                const userInfo = await response.json();
                this.currentUser = userInfo;
                this.updateUserDisplay(userInfo);
            }
        } catch (error) {
            console.error('Failed to get user info:', error);
        }
    }

    updateUserDisplay(userInfo) {
        const authStatus = document.getElementById('auth-status');
        if (authStatus && userInfo) {
            authStatus.innerHTML = `
                <div class="user-info">
                    <span class="user-name">Signed in as: ${userInfo.email}</span>
                    <button id="google-signout" class="btn-secondary">SIGN OUT</button>
                </div>
            `;
            authStatus.className = 'auth-status success';
            
            // Add sign out event listener
            document.getElementById('google-signout').addEventListener('click', () => {
                this.signOut();
            });
        }
    }

    updateUIForSignedIn() {
        const authStatus = document.getElementById('auth-status');
        const signInBtn = document.getElementById('google-signin');
        const sheetConfig = document.getElementById('sheet-config');
        
        if (authStatus) {
            authStatus.className = 'auth-status success';
        }
        
        if (signInBtn) {
            signInBtn.style.display = 'none';
        }
        
        if (sheetConfig) {
            sheetConfig.style.display = 'block';
        }
        
        // Check for existing sheet
        this.checkUserSheet();
    }

    updateUIForSignedOut() {
        const authStatus = document.getElementById('auth-status');
        const signInBtn = document.getElementById('google-signin');
        const sheetConfig = document.getElementById('sheet-config');
        
        if (authStatus) {
            authStatus.innerHTML = 'Not connected to Google Account';
            authStatus.className = 'auth-status';
        }
        
        if (signInBtn) {
            signInBtn.style.display = 'block';
        }
        
        if (sheetConfig) {
            sheetConfig.style.display = 'none';
        }
    }

    async signOut() {
        // Revoke the access token
        if (this.accessToken) {
            google.accounts.oauth2.revoke(this.accessToken, () => {
                console.log('Access token revoked');
            });
        }
        
        this.accessToken = null;
        this.isSignedIn = false;
        this.currentUser = null;
        
        // Clear stored sheet info
        localStorage.removeItem('userSheetId');
        localStorage.removeItem('userSheetUrl');
        
        // Update UI
        this.updateUIForSignedOut();
        
        // Clear gapi token
        gapi.client.setToken(null);
    }

    async checkUserSheet() {
        const storedSheetId = localStorage.getItem('userSheetId');
        
        if (storedSheetId) {
            try {
                const response = await gapi.client.sheets.spreadsheets.get({
                    spreadsheetId: storedSheetId
                });
                
                if (response.result) {
                    document.getElementById('sheet-id').value = storedSheetId;
                    window.todoApp.sheetId = storedSheetId;
                    window.todoApp.isAuthenticated = true;
                    this.showMessage('Connected to existing sheet', 'success');
                }
            } catch (error) {
                console.error('Sheet verification error:', error);
                await this.createUserSheet();
            }
        } else {
            await this.createUserSheet();
        }
    }

    async createUserSheet() {
        try {
            const response = await gapi.client.sheets.spreadsheets.create({
                properties: {
                    title: `${CONFIG.SHEET_NAME} - ${new Date().toISOString().split('T')[0]}`
                },
                sheets: [{
                    properties: {
                        title: 'Sheet1',
                        gridProperties: {
                            rowCount: 1000,
                            columnCount: 3
                        }
                    }
                }]
            });

            const spreadsheetId = response.result.spreadsheetId;
            const spreadsheetUrl = response.result.spreadsheetUrl;

            // Set up the header row
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: spreadsheetId,
                range: 'Sheet1!A1:C1',
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [['Date', 'Tasks To Do Today', 'Tasks Not Done Today']]
                }
            });

            // Store sheet information
            localStorage.setItem('userSheetId', spreadsheetId);
            localStorage.setItem('userSheetUrl', spreadsheetUrl);
            
            document.getElementById('sheet-id').value = spreadsheetId;
            window.todoApp.sheetId = spreadsheetId;
            window.todoApp.isAuthenticated = true;

            this.showMessage(`New sheet created! <a href="${spreadsheetUrl}" target="_blank">Open in Google Sheets</a>`, 'success');
            
            return spreadsheetId;
        } catch (error) {
            console.error('Error creating sheet:', error);
            this.showMessage('Failed to create Google Sheet', 'error');
            return null;
        }
    }

    showMessage(message, type) {
        if (window.todoApp && window.todoApp.showMessage) {
            window.todoApp.showMessage(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }
}

// Initialize the modern auth manager globally
window.modernGoogleAuth = new ModernGoogleAuth();