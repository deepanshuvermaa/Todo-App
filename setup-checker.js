// Setup Checker - Validates configuration and provides helpful error messages
class SetupChecker {
    constructor() {
        this.errors = [];
        this.warnings = [];
    }

    async checkSetup() {
        this.errors = [];
        this.warnings = [];
        
        // Check if CONFIG exists
        if (typeof CONFIG === 'undefined') {
            this.errors.push('CONFIG is not defined. Please check config.js file.');
            return false;
        }

        // Check Client ID
        if (!CONFIG.GOOGLE_CLIENT_ID || 
            CONFIG.GOOGLE_CLIENT_ID === 'YOUR_CLIENT_ID.apps.googleusercontent.com' ||
            CONFIG.GOOGLE_CLIENT_ID.includes('YOUR')) {
            this.errors.push('Google Client ID is not configured. Please add your Client ID to config.js');
        } else if (!CONFIG.GOOGLE_CLIENT_ID.endsWith('.apps.googleusercontent.com')) {
            this.errors.push('Invalid Google Client ID format');
        }

        // Check API Key
        if (!CONFIG.GOOGLE_API_KEY || 
            CONFIG.GOOGLE_API_KEY === 'YOUR_API_KEY' ||
            CONFIG.GOOGLE_API_KEY === 'YOUR_API_KEY_HERE' ||
            CONFIG.GOOGLE_API_KEY.includes('YOUR')) {
            this.errors.push('Google API Key is not configured. Please add your API Key to config.js');
        } else if (!CONFIG.GOOGLE_API_KEY.startsWith('AIza')) {
            this.warnings.push('API Key format might be incorrect (should start with AIza)');
        }

        // Check if running on localhost or GitHub Pages
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            console.log('Running on localhost - make sure to use a local server');
        } else if (hostname === 'deepanshuvermaa.github.io') {
            console.log('Running on GitHub Pages');
        } else if (hostname === '') {
            this.errors.push('Running from file:// protocol. Please use a web server (http://localhost)');
        }

        // Check if Google libraries are loaded
        if (typeof gapi === 'undefined') {
            this.warnings.push('Google API library not loaded yet');
        }

        if (typeof google === 'undefined') {
            this.warnings.push('Google Identity Services not loaded yet');
        }

        // Display results
        this.displayResults();
        
        return this.errors.length === 0;
    }

    displayResults() {
        if (this.errors.length > 0) {
            console.error('❌ Setup Errors Found:');
            this.errors.forEach(error => console.error(`  - ${error}`));
            
            // Show user-friendly message
            this.showSetupError();
        }

        if (this.warnings.length > 0) {
            console.warn('⚠️ Setup Warnings:');
            this.warnings.forEach(warning => console.warn(`  - ${warning}`));
        }

        if (this.errors.length === 0 && this.warnings.length === 0) {
            console.log('✅ Setup looks good!');
        }
    }

    showSetupError() {
        const settingsView = document.getElementById('settings-view');
        if (!settingsView) return;

        const errorHtml = `
            <div class="setup-error-container" style="
                background: #FEE2E2;
                border: 2px solid #DC2626;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                color: #991B1B;
            ">
                <h3 style="margin-top: 0;">⚠️ Setup Required</h3>
                <p>To enable Google Sheets integration, you need to:</p>
                <ol style="margin: 10px 0;">
                    ${this.errors.map(error => `<li>${this.escapeHtml(error)}</li>`).join('')}
                </ol>
                <div style="margin-top: 15px;">
                    <strong>Quick Fix:</strong>
                    <ol style="margin: 10px 0;">
                        <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank">Google Cloud Console</a></li>
                        <li>Click "Show Key" next to your API key</li>
                        <li>Copy the API key</li>
                        <li>Update config.js with your API key</li>
                        <li>Push changes to GitHub</li>
                        <li>Wait 2-3 minutes and refresh</li>
                    </ol>
                </div>
                <button onclick="window.open('https://github.com/deepanshuvermaa/Todo-App/edit/main/config.js', '_blank')" 
                        style="background: #DC2626; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
                    Edit config.js on GitHub
                </button>
            </div>
        `;

        // Insert error message at the top of settings
        const settingsSection = settingsView.querySelector('.settings-section');
        if (settingsSection && !settingsView.querySelector('.setup-error-container')) {
            settingsSection.insertAdjacentHTML('beforebegin', errorHtml);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Run setup check when page loads
document.addEventListener('DOMContentLoaded', () => {
    const checker = new SetupChecker();
    setTimeout(() => checker.checkSetup(), 1000);
});

// Export for use in other files
window.setupChecker = new SetupChecker();