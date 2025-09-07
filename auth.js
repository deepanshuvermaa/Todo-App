// Google Authentication Manager
class GoogleAuthManager {
    constructor() {
        this.isSignedIn = false;
        this.currentUser = null;
        this.authInstance = null;
        this.accessToken = null;
    }

    async initialize() {
        return new Promise((resolve, reject) => {
            // Check if gapi is loaded
            if (typeof gapi === 'undefined') {
                reject(new Error('Google API library not loaded'));
                return;
            }
            
            gapi.load('client:auth2', async () => {
                try {
                    await gapi.client.init({
                        apiKey: CONFIG.GOOGLE_API_KEY,
                        clientId: CONFIG.GOOGLE_CLIENT_ID,
                        discoveryDocs: CONFIG.DISCOVERY_DOCS,
                        scope: CONFIG.SCOPES
                    });

                    this.authInstance = gapi.auth2.getAuthInstance();
                    
                    // Listen for sign-in state changes
                    this.authInstance.isSignedIn.listen((isSignedIn) => {
                        this.handleAuthChange(isSignedIn);
                    });

                    // Handle initial sign-in state
                    this.handleAuthChange(this.authInstance.isSignedIn.get());
                    
                    resolve(true);
                } catch (error) {
                    console.error('Error initializing Google API:', error);
                    reject(error);
                }
            });
        });
    }

    handleAuthChange(isSignedIn) {
        this.isSignedIn = isSignedIn;
        
        if (isSignedIn) {
            const user = this.authInstance.currentUser.get();
            this.currentUser = user;
            this.accessToken = user.getAuthResponse().access_token;
            
            const profile = user.getBasicProfile();
            this.updateUIForSignedIn(profile);
            
            // Check if user has existing sheet or create new one
            this.checkUserSheet();
        } else {
            this.currentUser = null;
            this.accessToken = null;
            this.updateUIForSignedOut();
        }
    }

    async signIn() {
        try {
            await this.authInstance.signIn();
            return true;
        } catch (error) {
            console.error('Sign-in error:', error);
            return false;
        }
    }

    async signOut() {
        try {
            await this.authInstance.signOut();
            localStorage.removeItem('userSheetId');
            localStorage.removeItem('userSheetUrl');
            return true;
        } catch (error) {
            console.error('Sign-out error:', error);
            return false;
        }
    }

    updateUIForSignedIn(profile) {
        const authStatus = document.getElementById('auth-status');
        const signInBtn = document.getElementById('google-signin');
        const sheetConfig = document.getElementById('sheet-config');
        
        authStatus.innerHTML = `
            <div class="user-info">
                <span class="user-name">Signed in as: ${profile.getName()}</span>
                <button id="google-signout" class="btn-secondary">SIGN OUT</button>
            </div>
        `;
        authStatus.className = 'auth-status success';
        
        signInBtn.style.display = 'none';
        sheetConfig.style.display = 'block';
        
        // Add sign out event listener
        document.getElementById('google-signout').addEventListener('click', () => {
            this.signOut();
        });
    }

    updateUIForSignedOut() {
        const authStatus = document.getElementById('auth-status');
        const signInBtn = document.getElementById('google-signin');
        const sheetConfig = document.getElementById('sheet-config');
        
        authStatus.innerHTML = 'Not connected to Google Account';
        authStatus.className = 'auth-status';
        
        signInBtn.style.display = 'block';
        sheetConfig.style.display = 'none';
    }

    async checkUserSheet() {
        const storedSheetId = localStorage.getItem('userSheetId');
        
        if (storedSheetId) {
            // Verify the sheet still exists and is accessible
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
                // Sheet doesn't exist or isn't accessible, create new one
                await this.createUserSheet();
            }
        } else {
            // No stored sheet, create new one
            await this.createUserSheet();
        }
    }

    async createUserSheet() {
        try {
            // Create a new spreadsheet
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

            // Format the header row
            await gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: spreadsheetId,
                resource: {
                    requests: [
                        {
                            repeatCell: {
                                range: {
                                    sheetId: 0,
                                    startRowIndex: 0,
                                    endRowIndex: 1
                                },
                                cell: {
                                    userEnteredFormat: {
                                        backgroundColor: { red: 0.94, green: 0.94, blue: 0.94 },
                                        textFormat: { bold: true }
                                    }
                                },
                                fields: 'userEnteredFormat(backgroundColor,textFormat)'
                            }
                        },
                        {
                            updateDimensionProperties: {
                                range: {
                                    sheetId: 0,
                                    dimension: 'COLUMNS',
                                    startIndex: 0,
                                    endIndex: 1
                                },
                                properties: {
                                    pixelSize: 120
                                },
                                fields: 'pixelSize'
                            }
                        },
                        {
                            updateDimensionProperties: {
                                range: {
                                    sheetId: 0,
                                    dimension: 'COLUMNS',
                                    startIndex: 1,
                                    endIndex: 3
                                },
                                properties: {
                                    pixelSize: 400
                                },
                                fields: 'pixelSize'
                            }
                        }
                    ]
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
        const authStatus = document.getElementById('auth-status');
        const originalContent = authStatus.innerHTML;
        
        authStatus.innerHTML = `<div class="message ${type}">${message}</div>`;
        
        setTimeout(() => {
            authStatus.innerHTML = originalContent;
        }, 5000);
    }
}

// Initialize auth manager globally
window.googleAuth = new GoogleAuthManager();