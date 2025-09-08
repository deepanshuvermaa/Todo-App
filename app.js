class TodoApp {
    constructor() {
        this.tasks = [];
        this.currentDate = new Date();
        this.sheetId = localStorage.getItem('userSheetId') || '';
        this.isAuthenticated = false;
        this.gapiLoaded = false;
        this.lastSyncTime = null;
        this.init();
    }

    async init() {
        this.initDarkMode(); // Initialize dark mode
        this.setupEventListeners();
        this.updateDateDisplay();
        this.loadLocalTasks();
        this.renderTasks(); // Add this to show tasks immediately
        this.updateMetrics();
        
        // Check network status
        this.setupNetworkHandlers();
        
        // Initialize Google API only if config is set and valid
        if (typeof CONFIG !== 'undefined' && 
            CONFIG.GOOGLE_CLIENT_ID && 
            !CONFIG.GOOGLE_CLIENT_ID.includes('YOUR') &&
            CONFIG.GOOGLE_API_KEY &&
            !CONFIG.GOOGLE_API_KEY.includes('YOUR')) {
            await this.initGoogleAPI();
        } else {
            console.log('Google API not configured. Running in local mode.');
            if (CONFIG && CONFIG.GOOGLE_API_KEY && CONFIG.GOOGLE_API_KEY.includes('YOUR')) {
                this.showMessage('Running in local mode. Add your Google API key to enable cloud sync.', 'info');
            }
        }
        
        this.startAutoRollover();
        
        // Trigger initial rollover check after a brief delay to ensure everything is loaded
        setTimeout(() => {
            this.checkAndPerformRollover();
        }, 2000);
        
        // Initialize collapsible sections
        this.initializeCollapsibleSections();
    }

    setupNetworkHandlers() {
        // Handle online/offline events
        window.addEventListener('online', () => {
            this.showMessage('Connection restored', 'success');
            if (this.isAuthenticated && this.sheetId) {
                this.syncToSheets();
            }
        });

        window.addEventListener('offline', () => {
            this.showMessage('No internet connection. Working offline.', 'warning');
        });

        // Check initial network status
        if (!navigator.onLine) {
            this.showMessage('No internet connection. Your tasks will sync when you\'re back online.', 'info');
        }
    }

    initDarkMode() {
        // Check for saved dark mode preference or default to light mode
        const darkMode = localStorage.getItem('darkMode');
        
        if (darkMode === 'enabled') {
            document.body.classList.add('dark-mode');
        }
        
        // Add dark mode toggle listener
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
        }
    }

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        
        // Save preference
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
        } else {
            localStorage.setItem('darkMode', 'disabled');
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Task management
        document.getElementById('add-task-btn').addEventListener('click', () => this.addTask());
        document.getElementById('task-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // History
        const loadHistoryBtn = document.getElementById('load-history-btn');
        if (loadHistoryBtn) {
            loadHistoryBtn.addEventListener('click', () => this.loadHistory());
        }

        // Settings - Note: google-signin is handled by google-auth.js
        const saveSheetBtn = document.getElementById('save-sheet-btn');
        if (saveSheetBtn) {
            saveSheetBtn.addEventListener('click', () => this.saveSheetConfig());
        }
    }

    switchTab(tabName) {
        // Update nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Update views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.toggle('active', view.id === `${tabName}-view`);
        });
        
        // Handle special cases for new tabs
        if (tabName === 'dashboard') {
            // Initialize dashboard when switching to it
            if (window.smartDashboard) {
                window.smartDashboard.loadDashboardData();
            }
        } else if (tabName === 'habits') {
            // Update habits view when switching to it
            if (window.habitTracker) {
                window.habitTracker.updateUI();
            }
        }
        
        // Close mobile menu if open
        const navTabs = document.querySelector('.nav-tabs');
        const hamburger = document.querySelector('.hamburger-menu');
        if (navTabs && navTabs.classList.contains('mobile-open')) {
            navTabs.classList.remove('mobile-open');
            if (hamburger) {
                hamburger.classList.remove('active');
            }
        }
    }
    
    // Alias for voice commands
    switchToTab(tabName) {
        this.switchTab(tabName);
    }
    
    toggleMobileMenu() {
        const navTabs = document.querySelector('.nav-tabs');
        const hamburger = document.querySelector('.hamburger-menu');
        let overlay = document.querySelector('.mobile-menu-overlay');
        
        if (navTabs) {
            navTabs.classList.toggle('mobile-open');
            
            // Add/remove overlay
            if (navTabs.classList.contains('mobile-open')) {
                // Create overlay if it doesn't exist
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.className = 'mobile-menu-overlay';
                    overlay.onclick = () => this.toggleMobileMenu();
                    document.body.appendChild(overlay);
                }
                // Add active class with slight delay for animation
                setTimeout(() => {
                    overlay.classList.add('active');
                }, 10);
            } else {
                // Remove overlay
                if (overlay) {
                    overlay.classList.remove('active');
                    setTimeout(() => {
                        overlay.remove();
                    }, 300);
                }
            }
        }
        
        if (hamburger) {
            hamburger.classList.toggle('active');
        }
    }

    // Voice command support
    addTaskProgrammatically(taskText) {
        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            date: this.currentDate.toDateString(),
            createdAt: new Date().toISOString()
        };
        
        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.updateMetrics();
        
        // Update streak
        if (window.streakManager) {
            window.streakManager.updateStreak('taskCompletion');
        }
        
        // Sync to sheets if connected
        if (this.isAuthenticated && this.sheetId) {
            this.syncToSheets();
        }
    }

    updateDateDisplay() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateStr = this.currentDate.toLocaleDateString('en-US', options);
        document.getElementById('current-date').textContent = dateStr;
    }

    addTask() {
        const input = document.getElementById('task-input');
        const taskText = input.value.trim();
        
        if (!taskText) {
            this.showMessage('Please enter a task description', 'error');
            return;
        }

        if (taskText.length > 500) {
            this.showMessage('Task description is too long (max 500 characters)', 'error');
            return;
        }

        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            date: this.currentDate.toISOString().split('T')[0]
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.updateMetrics();
        input.value = '';

        if (this.isAuthenticated && this.sheetId) {
            this.syncToSheets();
        }
    }

    renderTasks() {
        const pendingList = document.getElementById('pending-tasks');
        const completedList = document.getElementById('completed-tasks');
        
        pendingList.innerHTML = '';
        completedList.innerHTML = '';

        const todayTasks = this.tasks.filter(task => 
            task.date === this.currentDate.toISOString().split('T')[0]
        );

        todayTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            if (task.completed) {
                completedList.appendChild(taskElement);
            } else {
                pendingList.appendChild(taskElement);
            }
        });
    }

    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input type="checkbox" 
                   class="task-checkbox" 
                   ${task.completed ? 'checked' : ''} 
                   data-id="${task.id}">
            <span class="task-text">${this.escapeHtml(task.text)}</span>
            <button class="task-delete" data-id="${task.id}">×</button>
        `;

        li.querySelector('.task-checkbox').addEventListener('change', (e) => {
            this.toggleTask(task.id, e.target.checked);
        });

        li.querySelector('.task-delete').addEventListener('click', () => {
            this.deleteTask(task.id);
        });

        return li;
    }

    toggleTask(taskId, completed) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = completed;
            this.saveTasks();
            this.renderTasks();
            this.updateMetrics();
            
            // Show immediate feedback
            this.showMessage(completed ? '✅ Task marked as completed!' : '↩️ Task reopened!', 'success');
            
            // Sync to sheets with error handling
            if (this.isAuthenticated && this.sheetId) {
                this.syncToSheetsWithRetry();
            } else {
                this.showMessage('⚠️ Not synced to Google Sheets - check connection in Settings', 'warning');
            }
        }
    }
    
    async syncToSheetsWithRetry(retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                // Show sync status
                this.updateSyncStatus('syncing');
                await this.syncToSheets();
                this.updateSyncStatus('success');
                return; // Success, exit
            } catch (error) {
                console.error(`Sync attempt ${i + 1} failed:`, error);
                
                if (i === retries - 1) {
                    // Final attempt failed
                    this.updateSyncStatus('failed');
                    this.showMessage('❌ Failed to sync with Google Sheets. Check connection and try manual sync.', 'error');
                    
                    // Store failed sync for later retry
                    this.storePendingSync();
                } else {
                    // Wait before retry
                    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                }
            }
        }
    }
    
    updateSyncStatus(status) {
        // Update UI sync indicator
        const syncIndicator = document.getElementById('sync-status-indicator');
        if (syncIndicator) {
            switch(status) {
                case 'syncing':
                    syncIndicator.innerHTML = '🔄 Syncing...';
                    syncIndicator.className = 'sync-status syncing';
                    break;
                case 'success':
                    syncIndicator.innerHTML = '✅ Synced';
                    syncIndicator.className = 'sync-status success';
                    setTimeout(() => {
                        syncIndicator.innerHTML = '☁️ Connected';
                    }, 2000);
                    break;
                case 'failed':
                    syncIndicator.innerHTML = '❌ Sync Failed';
                    syncIndicator.className = 'sync-status failed';
                    break;
            }
        }
    }
    
    storePendingSync() {
        // Store current state for later sync
        const pendingData = {
            tasks: this.tasks,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('pendingSync', JSON.stringify(pendingData));
    }
    
    async attemptPendingSync() {
        const pendingData = localStorage.getItem('pendingSync');
        if (pendingData && this.isAuthenticated && this.sheetId) {
            try {
                await this.syncToSheetsWithRetry();
                localStorage.removeItem('pendingSync');
                this.showMessage('✅ Pending changes synced successfully!', 'success');
            } catch (error) {
                console.error('Failed to sync pending changes:', error);
            }
        }
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveTasks();
        this.renderTasks();
        this.updateMetrics();
        
        if (this.isAuthenticated && this.sheetId) {
            this.syncToSheets();
        }
    }

    updateMetrics() {
        const todayTasks = this.tasks.filter(task => 
            task.date === this.currentDate.toISOString().split('T')[0]
        );

        const totalTasks = todayTasks.length;
        const completedTasks = todayTasks.filter(t => t.completed).length;
        const pendingTasks = totalTasks - completedTasks;

        const completionPercentage = totalTasks > 0 ? 
            Math.round((completedTasks / totalTasks) * 100) : 0;
        const procrastinationPercentage = totalTasks > 0 ? 
            Math.round((pendingTasks / totalTasks) * 100) : 0;

        document.getElementById('completion-percentage').textContent = `${completionPercentage}%`;
        document.getElementById('procrastination-percentage').textContent = `${procrastinationPercentage}%`;
        document.getElementById('completion-bar').style.width = `${completionPercentage}%`;
        document.getElementById('procrastination-bar').style.width = `${procrastinationPercentage}%`;
        
        document.getElementById('total-tasks').textContent = totalTasks;
        document.getElementById('completed-count').textContent = completedTasks;
        document.getElementById('pending-count').textContent = pendingTasks;
    }

    loadLocalTasks() {
        const stored = localStorage.getItem('tasks');
        if (stored) {
            try {
                this.tasks = JSON.parse(stored);
                this.renderTasks();
            } catch (e) {
                console.error('Error loading tasks:', e);
                this.tasks = [];
            }
        }
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadHistory() {
        const datePicker = document.getElementById('history-date');
        const selectedDate = datePicker.value;
        
        if (!selectedDate) {
            this.showMessage('Please select a date', 'error');
            return;
        }

        const historyTasks = this.tasks.filter(task => task.date === selectedDate);
        this.renderHistory(selectedDate, historyTasks);
    }

    renderHistory(date, tasks) {
        const container = document.getElementById('history-content');
        
        if (tasks.length === 0) {
            container.innerHTML = '<p>No tasks found for this date</p>';
            return;
        }

        const completed = tasks.filter(t => t.completed).length;
        const total = tasks.length;
        const completionPercentage = Math.round((completed / total) * 100);

        container.innerHTML = `
            <div class="history-day">
                <div class="history-date">${new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}</div>
                <div class="history-metrics">
                    <div class="history-metric">Total: <span>${total}</span></div>
                    <div class="history-metric">Completed: <span>${completed}</span></div>
                    <div class="history-metric">Completion: <span>${completionPercentage}%</span></div>
                </div>
                <div class="tasks-container">
                    <h3 class="tasks-subtitle">Completed Tasks</h3>
                    <ul class="task-list">
                        ${tasks.filter(t => t.completed).map(t => 
                            `<li class="task-item completed">
                                <span class="task-text">${this.escapeHtml(t.text)}</span>
                            </li>`
                        ).join('') || '<li>No completed tasks</li>'}
                    </ul>
                    <h3 class="tasks-subtitle">Pending Tasks</h3>
                    <ul class="task-list">
                        ${tasks.filter(t => !t.completed).map(t => 
                            `<li class="task-item">
                                <span class="task-text">${this.escapeHtml(t.text)}</span>
                            </li>`
                        ).join('') || '<li>No pending tasks</li>'}
                    </ul>
                </div>
            </div>
        `;
    }

    // Google Sheets Integration
    async initGoogleAPI() {
        // Wait for both gapi and google (GIS) to load
        let retries = 0;
        while ((typeof gapi === 'undefined' || typeof google === 'undefined') && retries < 10) {
            await new Promise(resolve => setTimeout(resolve, 500));
            retries++;
        }
        
        if (typeof gapi !== 'undefined' && typeof google !== 'undefined') {
            try {
                // Use the modern authentication
                await window.modernGoogleAuth.initialize();
                this.gapiLoaded = true;
                console.log('Google API initialized successfully');
            } catch (error) {
                console.error('Failed to initialize Google API:', error);
                // Check if API key is configured
                if (CONFIG.GOOGLE_API_KEY === 'YOUR_API_KEY') {
                    this.showMessage('Please add your Google API key to config.js', 'error');
                } else {
                    this.showMessage('Google API is loading. Please wait a moment and try again.', 'info');
                }
            }
        } else {
            console.log('Google libraries not available yet');
        }
    }

    async handleGoogleSignIn() {
        // Check if Google API is configured
        if (typeof CONFIG === 'undefined' || CONFIG.GOOGLE_CLIENT_ID === 'YOUR_CLIENT_ID.apps.googleusercontent.com') {
            this.showMessage('Please configure Google Client ID in config.js', 'error');
            return;
        }
        
        if (CONFIG.GOOGLE_API_KEY === 'YOUR_API_KEY') {
            this.showMessage('Please add your Google API Key to config.js', 'error');
            return;
        }
        
        if (!this.gapiLoaded) {
            this.showMessage('Initializing Google services. Please wait...', 'info');
            // Try to initialize again
            await this.initGoogleAPI();
            
            // Try sign in again if successful
            if (this.gapiLoaded) {
                await this.handleGoogleSignIn();
            }
            return;
        }
        
        if (!window.modernGoogleAuth) {
            this.showMessage('Authentication system not ready. Please refresh the page.', 'error');
            return;
        }

        try {
            const success = await window.modernGoogleAuth.signIn();
            if (success) {
                this.isAuthenticated = true;
                this.syncFromSheets(); // Load existing tasks from sheets
            }
        } catch (error) {
            console.error('Sign-in error:', error);
            this.showMessage('Failed to sign in. Please try again.', 'error');
        }
    }

    saveSheetConfig() {
        const sheetId = document.getElementById('sheet-id').value.trim();
        
        if (!sheetId) {
            this.showMessage('Sheet ID was automatically generated', 'info');
            return;
        }

        if (sheetId !== this.sheetId) {
            this.sheetId = sheetId;
            localStorage.setItem('userSheetId', sheetId);
            this.showMessage('Sheet configuration updated', 'success');
            
            if (this.isAuthenticated) {
                this.syncFromSheets();
            }
        }
    }
    
    async copySheetId() {
        const sheetId = document.getElementById('sheet-id').value;
        if (!sheetId) {
            this.showMessage('No Sheet ID to copy!', 'error');
            return;
        }
        
        try {
            // Try modern clipboard API first
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(sheetId);
                this.showMessage('Sheet ID copied to clipboard!', 'success');
            } else {
                // Fallback for older browsers or non-secure contexts
                const input = document.createElement('input');
                input.value = sheetId;
                input.style.position = 'fixed';
                input.style.left = '-999999px';
                input.style.top = '-999999px';
                document.body.appendChild(input);
                input.focus();
                input.select();
                
                try {
                    const successful = document.execCommand('copy');
                    if (successful) {
                        this.showMessage('Sheet ID copied to clipboard!', 'success');
                    } else {
                        this.showMessage('Failed to copy Sheet ID', 'error');
                    }
                } catch (err) {
                    console.error('Fallback copy failed:', err);
                    this.showMessage('Failed to copy Sheet ID', 'error');
                }
                
                document.body.removeChild(input);
            }
        } catch (err) {
            console.error('Copy failed:', err);
            this.showMessage('Failed to copy. Please try selecting and copying manually.', 'error');
        }
    }
    
    clearLocalSheet() {
        if (confirm('This will disconnect you from the current sheet. You will need to reconnect or create a new sheet. Continue?')) {
            // Clear all sheet-related localStorage
            const userEmail = localStorage.getItem('userEmail');
            const userSheetKey = userEmail ? `sheet_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}` : 'userSheetId';
            
            localStorage.removeItem(userSheetKey);
            localStorage.removeItem('userSheetId');
            localStorage.removeItem('userSheetUrl');
            
            // Clear UI
            document.getElementById('sheet-id').value = '';
            document.getElementById('manual-sheet-id').value = '';
            
            // Hide view sheet button
            const viewSheetBtn = document.getElementById('view-sheet-btn');
            if (viewSheetBtn) {
                viewSheetBtn.style.display = 'none';
            }
            
            // Reset app state
            this.sheetId = null;
            
            this.showMessage('Local sheet data cleared. Please reconnect or create a new sheet.', 'info');
        }
    }
    
    async connectToExistingSheet() {
        const manualSheetId = document.getElementById('manual-sheet-id').value.trim();
        
        if (!manualSheetId) {
            this.showMessage('Please enter a Sheet ID', 'error');
            return;
        }
        
        if (!this.isAuthenticated || !window.modernGoogleAuth || !window.modernGoogleAuth.isSignedIn) {
            this.showMessage('Please sign in with Google first', 'error');
            return;
        }
        
        try {
            // Verify the sheet exists and is accessible
            const response = await gapi.client.sheets.spreadsheets.get({
                spreadsheetId: manualSheetId
            });
            
            if (response.result) {
                // Successfully accessed the sheet
                this.sheetId = manualSheetId;
                
                // Store with user-specific key
                const userEmail = localStorage.getItem('userEmail');
                const userSheetKey = userEmail ? `sheet_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}` : 'userSheetId';
                
                localStorage.setItem(userSheetKey, manualSheetId);
                localStorage.setItem('userSheetId', manualSheetId);
                
                const sheetUrl = `https://docs.google.com/spreadsheets/d/${manualSheetId}`;
                localStorage.setItem('userSheetUrl', sheetUrl);
                
                // Update UI
                document.getElementById('sheet-id').value = manualSheetId;
                
                // Show View Sheet button
                const viewSheetBtn = document.getElementById('view-sheet-btn');
                if (viewSheetBtn) {
                    viewSheetBtn.style.display = 'inline-flex';
                    viewSheetBtn.onclick = () => window.open(sheetUrl, '_blank');
                }
                
                // Clear the manual input
                document.getElementById('manual-sheet-id').value = '';
                
                this.showMessage('Successfully connected to existing sheet!', 'success');
                
                // Sync data from the connected sheet
                await this.syncFromSheets();
            }
        } catch (error) {
            console.error('Failed to connect to sheet:', error);
            this.showMessage('Could not access this Sheet ID. Make sure it exists and you have permission.', 'error');
        }
    }

    async syncToSheets() {
        if (!this.isAuthenticated || !this.sheetId) return;

        try {
            console.log('🔄 Starting comprehensive sync to Google Sheets...');
            
            // Ensure all required sheets exist
            await this.ensureRequiredSheets();
            
            // Sync all data types
            await this.syncTasksToSheet();
            await this.syncExpensesToSheet();
            await this.syncMealsToSheet();
            await this.syncNotesToSheet();
            
            this.lastSyncTime = new Date();
            console.log('✅ Complete sync to Google Sheets successful');
        } catch (error) {
            console.error('❌ Comprehensive sync error:', error);
            this.showMessage('Failed to sync all data with Google Sheets', 'error');
            throw error;
        }
    }

    async ensureRequiredSheets() {
        try {
            // Get current sheets
            const response = await gapi.client.sheets.spreadsheets.get({
                spreadsheetId: this.sheetId
            });

            const existingSheets = response.result.sheets.map(sheet => sheet.properties.title);
            const requiredSheets = ['Tasks', 'Expenses', 'Meals', 'Notes'];

            // Create missing sheets
            const sheetsToCreate = requiredSheets.filter(sheet => !existingSheets.includes(sheet));
            
            if (sheetsToCreate.length > 0) {
                console.log('Creating missing sheets:', sheetsToCreate);
                
                const requests = sheetsToCreate.map(sheetName => ({
                    addSheet: {
                        properties: {
                            title: sheetName
                        }
                    }
                }));

                await gapi.client.sheets.spreadsheets.batchUpdate({
                    spreadsheetId: this.sheetId,
                    resource: { requests }
                });
                
                // Add headers for each new sheet
                for (const sheetName of sheetsToCreate) {
                    await this.addSheetHeaders(sheetName);
                }
            }
        } catch (error) {
            console.error('Error ensuring sheets exist:', error);
            throw error;
        }
    }

    async addSheetHeaders(sheetName) {
        const headers = {
            'Tasks': ['Date', 'Tasks To Do Today', 'Tasks Not Done Today'],
            'Expenses': ['Date', 'Category', 'Amount', 'Description', 'Total Day'],
            'Meals': ['Date', 'Meal Type', 'Food Item', 'Calories', 'Total Calories'],
            'Notes': ['Date', 'Title', 'Content', 'Tags']
        };

        if (headers[sheetName]) {
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: this.sheetId,
                range: `${sheetName}!A1:${String.fromCharCode(65 + headers[sheetName].length - 1)}1`,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [headers[sheetName]]
                }
            });
        }
    }

    async syncTasksToSheet() {
        const todayStr = this.currentDate.toISOString().split('T')[0];
        const todayTasks = this.tasks.filter(task => task.date === todayStr);

        const todoTasks = todayTasks.map((task, index) => {
            const prefix = index + 1 + '- ';
            const suffix = task.completed ? ' - done' : '';
            return prefix + task.text + suffix;
        }).join('\n');

        // Check if row exists for today
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: this.sheetId,
            range: 'Tasks!A:A'
        });

        const dates = response.result.values || [];
        const rowIndex = dates.findIndex(row => row && row[0] === todayStr);

        if (rowIndex > -1) {
            // Update existing row - Column C stays empty for current day
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: this.sheetId,
                range: `Tasks!A${rowIndex + 1}:B${rowIndex + 1}`,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [[todayStr, todoTasks || 'No tasks']]
                }
            });
        } else {
            // Append new row - Column C empty for current day
            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: this.sheetId,
                range: 'Tasks!A:C',
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'INSERT_ROWS',
                resource: {
                    values: [[todayStr, todoTasks || 'No tasks', '']]
                }
            });
        }
    }

    async syncExpensesToSheet() {
        const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        
        if (expenses.length === 0) return;

        // Group expenses by date for daily totals
        const expensesByDate = {};
        expenses.forEach(expense => {
            if (!expensesByDate[expense.date]) {
                expensesByDate[expense.date] = [];
            }
            expensesByDate[expense.date].push(expense);
        });

        // Prepare data for sync
        const expenseRows = [];
        Object.keys(expensesByDate).forEach(date => {
            const dayExpenses = expensesByDate[date];
            const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
            
            dayExpenses.forEach((expense, index) => {
                expenseRows.push([
                    date,
                    expense.category,
                    expense.amount,
                    expense.description || '',
                    index === 0 ? dayTotal : '' // Show total only on first row of each day
                ]);
            });
        });

        // Clear existing data and add new
        await gapi.client.sheets.spreadsheets.values.clear({
            spreadsheetId: this.sheetId,
            range: 'Expenses!A2:E'
        });

        if (expenseRows.length > 0) {
            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: this.sheetId,
                range: 'Expenses!A2:E',
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'INSERT_ROWS',
                resource: {
                    values: expenseRows
                }
            });
        }
    }

    async syncMealsToSheet() {
        const meals = JSON.parse(localStorage.getItem('meals') || '[]');
        
        if (meals.length === 0) return;

        // Group meals by date for daily totals
        const mealsByDate = {};
        meals.forEach(meal => {
            if (!mealsByDate[meal.date]) {
                mealsByDate[meal.date] = [];
            }
            mealsByDate[meal.date].push(meal);
        });

        // Prepare data for sync
        const mealRows = [];
        Object.keys(mealsByDate).forEach(date => {
            const dayMeals = mealsByDate[date];
            const dayTotalCalories = dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
            
            dayMeals.forEach((meal, index) => {
                mealRows.push([
                    date,
                    meal.mealType,
                    meal.food,
                    meal.calories || 0,
                    index === 0 ? dayTotalCalories : '' // Show total only on first row of each day
                ]);
            });
        });

        // Clear existing data and add new
        await gapi.client.sheets.spreadsheets.values.clear({
            spreadsheetId: this.sheetId,
            range: 'Meals!A2:E'
        });

        if (mealRows.length > 0) {
            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: this.sheetId,
                range: 'Meals!A2:E',
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'INSERT_ROWS',
                resource: {
                    values: mealRows
                }
            });
        }
    }

    async syncNotesToSheet() {
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        
        if (notes.length === 0) return;

        const noteRows = notes.map(note => [
            note.date,
            note.title,
            note.content,
            note.tags ? note.tags.join(', ') : ''
        ]);

        // Clear existing data and add new
        await gapi.client.sheets.spreadsheets.values.clear({
            spreadsheetId: this.sheetId,
            range: 'Notes!A2:D'
        });

        await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: this.sheetId,
            range: 'Notes!A2:D',
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: noteRows
            }
        });
    }

    async syncFromSheets() {
        if (!this.isAuthenticated || !this.sheetId) return;

        try {
            console.log('🔄 Starting comprehensive sync from Google Sheets...');
            
            // Sync all data types from sheets
            await this.syncTasksFromSheet();
            await this.syncExpensesFromSheet();
            await this.syncMealsFromSheet();
            await this.syncNotesFromSheet();

            console.log('✅ Complete sync from Google Sheets successful');
            this.showMessage('✅ All data synced from Google Sheets successfully!', 'success');

        } catch (error) {
            console.error('❌ Sync from sheets error:', error);
            this.showMessage('Failed to sync from Google Sheets', 'error');
        }
    }

    async syncTasksFromSheet() {
        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: this.sheetId,
                range: 'Tasks!A:C'
            });

            const rows = response.result.values || [];
            const importedTasks = [];

            rows.forEach((row, index) => {
                if (index === 0) return; // Skip header row
                
                const date = row[0];
                const tasksString = row[1] || '';
                
                if (date && tasksString) {
                    const taskLines = tasksString.split('\n').filter(line => line.trim());
                    
                    taskLines.forEach(line => {
                        const match = line.match(/^\d+- (.+)$/);
                        if (match) {
                            const text = match[1];
                            const completed = text.endsWith(' - done');
                            const cleanText = completed ? text.slice(0, -7) : text;

                            importedTasks.push({
                                id: Date.now() + Math.random(),
                                text: cleanText,
                                completed,
                                date,
                                priority: 'medium'
                            });
                        }
                    });
                }
            });

            // Replace local tasks with imported ones
            this.tasks = importedTasks;
            this.saveTasks();
            this.renderTasks();
            this.updateMetrics();

            console.log(`✅ Imported ${importedTasks.length} tasks from Google Sheets`);
        } catch (error) {
            console.error('❌ Failed to sync tasks from sheets:', error);
        }
    }

    async syncExpensesFromSheet() {
        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: this.sheetId,
                range: 'Expenses!A:E'
            });

            const rows = response.result.values || [];
            const importedExpenses = [];

            rows.forEach((row, index) => {
                if (index === 0) return; // Skip header row
                
                const [date, category, amount, description] = row;
                
                if (date && category && amount) {
                    importedExpenses.push({
                        id: Date.now() + Math.random(),
                        date,
                        category,
                        amount: parseFloat(amount),
                        description: description || ''
                    });
                }
            });

            // Replace local expenses with imported ones
            localStorage.setItem('expenses', JSON.stringify(importedExpenses));
            
            // Refresh expense UI if expense manager exists
            if (window.expenseManager) {
                window.expenseManager.loadExpenses();
                window.expenseManager.updateAnalytics();
            }

            console.log(`✅ Imported ${importedExpenses.length} expenses from Google Sheets`);
        } catch (error) {
            console.error('❌ Failed to sync expenses from sheets:', error);
        }
    }

    async syncMealsFromSheet() {
        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: this.sheetId,
                range: 'Meals!A:E'
            });

            const rows = response.result.values || [];
            const importedMeals = [];

            rows.forEach((row, index) => {
                if (index === 0) return; // Skip header row
                
                const [date, mealType, food, calories] = row;
                
                if (date && mealType && food) {
                    importedMeals.push({
                        id: Date.now() + Math.random(),
                        date,
                        mealType,
                        food,
                        calories: parseFloat(calories) || 0
                    });
                }
            });

            // Replace local meals with imported ones
            localStorage.setItem('meals', JSON.stringify(importedMeals));
            
            // Refresh meals UI if meal manager exists
            if (window.mealTracker) {
                window.mealTracker.loadMeals();
                window.mealTracker.updateNutritionSummary();
            }

            console.log(`✅ Imported ${importedMeals.length} meals from Google Sheets`);
        } catch (error) {
            console.error('❌ Failed to sync meals from sheets:', error);
        }
    }

    async syncNotesFromSheet() {
        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: this.sheetId,
                range: 'Notes!A:D'
            });

            const rows = response.result.values || [];
            const importedNotes = [];

            rows.forEach((row, index) => {
                if (index === 0) return; // Skip header row
                
                const [date, title, content, tags] = row;
                
                if (date && title) {
                    importedNotes.push({
                        id: Date.now() + Math.random(),
                        date,
                        title,
                        content: content || '',
                        tags: tags ? tags.split(', ').filter(tag => tag.trim()) : []
                    });
                }
            });

            // Replace local notes with imported ones
            localStorage.setItem('notes', JSON.stringify(importedNotes));

            console.log(`✅ Imported ${importedNotes.length} notes from Google Sheets`);
        } catch (error) {
            console.error('❌ Failed to sync notes from sheets:', error);
        }
    }

    startAutoRollover() {
        // Check for rollover on app start
        this.checkAndPerformRollover();
        
        // Set up interval to check every minute (for midnight detection)
        setInterval(() => {
            this.checkAndPerformRollover();
        }, 60000); // Check every minute
    }

    async checkAndPerformRollover() {
        const now = new Date();
        const lastProcessedDate = localStorage.getItem('lastProcessedDate');
        const todayStr = now.toISOString().split('T')[0];
        
        // If it's a new day or first time running
        if (!lastProcessedDate || lastProcessedDate !== todayStr) {
            console.log(`Date changed from ${lastProcessedDate} to ${todayStr}. Performing rollover...`);
            await this.performRollover(lastProcessedDate, todayStr);
            localStorage.setItem('lastProcessedDate', todayStr);
            this.currentDate = now; // Update current date
            this.updateDateDisplay();
        }
    }

    async performRollover(previousDateStr, newDateStr) {
        if (!previousDateStr) {
            // First time running, no rollover needed
            console.log('First time running, no rollover needed');
            return;
        }

        console.log(`Performing rollover from ${previousDateStr} to ${newDateStr}`);

        // Get all tasks from the previous date
        const previousTasks = this.tasks.filter(task => task.date === previousDateStr);
        const incompleteTasks = previousTasks.filter(task => !task.completed);
        const completedTasks = previousTasks.filter(task => task.completed);

        console.log(`Found ${completedTasks.length} completed and ${incompleteTasks.length} incomplete tasks for ${previousDateStr}`);

        // First, update the previous day's row in Google Sheets if authenticated
        if (this.isAuthenticated && this.sheetId) {
            await this.updatePreviousDayInSheets(previousDateStr, completedTasks, incompleteTasks);
        } else {
            console.log('Not authenticated or no sheet ID, skipping sheet update');
        }

        // Roll over incomplete tasks to today
        if (incompleteTasks.length > 0) {
            console.log(`Rolling over ${incompleteTasks.length} incomplete tasks to ${newDateStr}`);
            
            // Create new tasks for today
            incompleteTasks.forEach(task => {
                // Check if task already exists for today (prevent duplicates)
                const existingTask = this.tasks.find(t => 
                    t.date === newDateStr && 
                    t.text === task.text
                );
                
                if (!existingTask) {
                    const newTask = {
                        ...task,
                        id: Date.now() + Math.random(),
                        date: newDateStr,
                        completed: false,
                        rolledOver: true
                    };
                    this.tasks.push(newTask);
                    console.log(`Rolled over task: ${task.text}`);
                }
            });

            this.saveTasks();
            this.renderTasks();
            this.updateMetrics();
            
            // Sync new day's tasks to sheets
            if (this.isAuthenticated && this.sheetId) {
                console.log('Syncing rolled over tasks to sheets...');
                await this.syncToSheets();
            }
        } else {
            console.log('No incomplete tasks to roll over');
            // Still create today's row if authenticated
            if (this.isAuthenticated && this.sheetId) {
                await this.syncToSheets();
            }
        }
    }

    async updatePreviousDayInSheets(dateStr, completedTasks, incompleteTasks) {
        if (!this.isAuthenticated || !this.sheetId) {
            console.log('Cannot update sheets - not authenticated or no sheet ID');
            return;
        }

        try {
            console.log(`Updating previous day ${dateStr} in sheets...`);
            
            // Format completed tasks for column B
            const completedTasksStr = completedTasks.map((task, index) => {
                return `${index + 1}- ${task.text} - done`;
            }).join('\n');

            // Format incomplete tasks for column C (these are "not done today")
            const incompleteTasksStr = incompleteTasks.map((task, index) => {
                return `${index + 1}- ${task.text}`;
            }).join('\n');

            // Find the row for the previous date
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: this.sheetId,
                range: 'Sheet1!A:C'
            });

            const rows = response.result.values || [];
            const rowIndex = rows.findIndex(row => row && row[0] === dateStr);

            if (rowIndex > -1) {
                // Update the existing row with completed tasks in B and incomplete in C
                const updateValues = [
                    dateStr, 
                    completedTasksStr || 'No tasks completed', 
                    incompleteTasksStr || ''
                ];
                
                await gapi.client.sheets.spreadsheets.values.update({
                    spreadsheetId: this.sheetId,
                    range: `Sheet1!A${rowIndex + 1}:C${rowIndex + 1}`,
                    valueInputOption: 'USER_ENTERED',
                    resource: {
                        values: [updateValues]
                    }
                });
                
                console.log(`✅ Updated ${dateStr} row: ${completedTasks.length} completed, ${incompleteTasks.length} moved to 'not done' column`);
            } else {
                console.log(`⚠️  Row for ${dateStr} not found in sheets`);
                // Create the row if it doesn't exist
                const newValues = [
                    dateStr, 
                    completedTasksStr || 'No tasks completed', 
                    incompleteTasksStr || ''
                ];
                
                await gapi.client.sheets.spreadsheets.values.append({
                    spreadsheetId: this.sheetId,
                    range: 'Sheet1!A:C',
                    valueInputOption: 'USER_ENTERED',
                    insertDataOption: 'INSERT_ROWS',
                    resource: {
                        values: [newValues]
                    }
                });
                
                console.log(`✅ Created new row for ${dateStr}`);
            }
        } catch (error) {
            console.error('❌ Error updating previous day in sheets:', error);
            this.showMessage(`Failed to update ${dateStr} in Google Sheets`, 'error');
        }
    }

    async manualRollover() {
        console.log('🔄 Manual rollover triggered');
        
        try {
            // Get yesterday's date
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            // Get today's date
            const todayStr = new Date().toISOString().split('T')[0];
            
            console.log(`Manual rollover: ${yesterdayStr} → ${todayStr}`);
            
            // Force rollover from yesterday to today
            await this.performRollover(yesterdayStr, todayStr);
            
            // Update the last processed date
            localStorage.setItem('lastProcessedDate', todayStr);
            
            this.showMessage('✅ Task rollover completed! Check your Google Sheet.', 'success');
        } catch (error) {
            console.error('❌ Manual rollover failed:', error);
            this.showMessage('❌ Task rollover failed. Check console for details.', 'error');
        }
    }


    initializeCollapsibleSections() {
        // Make toggle function globally available
        window.toggleSection = (sectionId) => this.toggleSection(sectionId);
        
        // Load saved preferences
        this.loadSectionPreferences();
        
        // Update summaries for collapsed sections
        this.updateCollapsedSummaries();
    }
    
    toggleSection(sectionId) {
        const section = document.getElementById(sectionId);
        const toggle = document.getElementById(sectionId.replace('-', '-toggle').replace('expenses-breakdown', 'breakdown-toggle').replace('monthly-overview', 'monthly-toggle'));
        
        if (section) {
            section.classList.toggle('collapsed');
            const isCollapsed = section.classList.contains('collapsed');
            
            // Update toggle button
            if (toggle) {
                toggle.textContent = isCollapsed ? '▼' : '▲';
            }
            
            // Save preference
            this.saveSectionPreference(sectionId, isCollapsed);
            
            // Update summary if collapsed
            if (isCollapsed) {
                this.updateSectionSummary(sectionId);
            }
        }
    }
    
    saveSectionPreference(sectionId, isCollapsed) {
        const preferences = JSON.parse(localStorage.getItem('sectionPreferences') || '{}');
        preferences[sectionId] = isCollapsed;
        localStorage.setItem('sectionPreferences', JSON.stringify(preferences));
    }
    
    loadSectionPreferences() {
        const preferences = JSON.parse(localStorage.getItem('sectionPreferences') || '{}');
        
        // Default: sections are collapsed
        const defaultCollapsed = {
            'expenses-breakdown': true,
            'monthly-overview': true,
            'meal-breakfast': true,
            'meal-lunch': true,
            'meal-snack': true,
            'meal-dinner': true
        };
        
        Object.keys(defaultCollapsed).forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const shouldCollapse = preferences[sectionId] !== undefined ? preferences[sectionId] : defaultCollapsed[sectionId];
                if (shouldCollapse) {
                    section.classList.add('collapsed');
                    const toggle = document.getElementById(sectionId.replace('-', '-toggle').replace('expenses-breakdown', 'breakdown-toggle').replace('monthly-overview', 'monthly-toggle'));
                    if (toggle) {
                        toggle.textContent = '▼';
                    }
                } else {
                    section.classList.remove('collapsed');
                }
            }
        });
    }
    
    updateCollapsedSummaries() {
        // Update expense breakdown summary
        const breakdownSummary = document.getElementById('breakdown-summary');
        if (breakdownSummary) {
            const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
            const today = new Date().toISOString().split('T')[0];
            const todayExpenses = expenses.filter(e => e.date === today);
            const total = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
            const count = todayExpenses.length;
            
            if (count > 0) {
                breakdownSummary.textContent = `₹${total.toFixed(0)} in ${count} transactions`;
            } else {
                breakdownSummary.textContent = 'No expenses today';
            }
        }
        
        // Update monthly summary
        const monthlySummary = document.getElementById('monthly-summary');
        if (monthlySummary) {
            const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            
            const monthExpenses = expenses.filter(e => {
                const expDate = new Date(e.date);
                return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
            });
            
            const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
            monthlySummary.textContent = `₹${total.toFixed(0)} this month`;
        }
        
        // Update meal summaries
        const meals = JSON.parse(localStorage.getItem('meals') || '[]');
        const today = new Date().toISOString().split('T')[0];
        const todayMeals = meals.filter(m => m.date === today);
        
        const mealTypes = ['breakfast', 'lunch', 'snack', 'dinner'];
        mealTypes.forEach(type => {
            const summary = document.getElementById(`${type}-summary`);
            if (summary) {
                const typeMeals = todayMeals.filter(m => m.mealType === type);
                const calories = typeMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
                
                if (typeMeals.length > 0) {
                    summary.textContent = `${typeMeals.length} items, ${Math.round(calories)} cal`;
                } else {
                    summary.textContent = 'No meals';
                }
            }
        });
    }
    
    updateSectionSummary(sectionId) {
        // Update specific section summary when collapsed
        this.updateCollapsedSummaries();
    }
    
    async reAuthenticate() {
        try {
            console.log('🔄 Re-authenticating with Google...');
            this.showMessage('🔄 Logging out and re-authenticating...', 'info');
            
            // Sign out first
            if (this.isAuthenticated) {
                await gapi.auth2.getAuthInstance().signOut();
            }
            
            // Clear authentication state
            this.isAuthenticated = false;
            localStorage.removeItem('googleAccessToken');
            
            // Update UI to show signed out state
            this.updateAuthUI();
            
            // Wait a moment then re-authenticate
            setTimeout(() => {
                this.authenticateGoogleSheets();
                this.showMessage('Please complete Google login again...', 'info');
            }, 1000);
            
        } catch (error) {
            console.error('❌ Re-authentication error:', error);
            this.showMessage('Re-authentication failed. Try refreshing the page.', 'error');
        }
    }
    
    async forceSyncAllData() {
        try {
            console.log('🔄 Force syncing all data to Google Sheets...');
            this.showMessage('🔄 Force syncing all data...', 'info');
            
            if (!this.isAuthenticated || !this.sheetId) {
                this.showMessage('❌ Not authenticated or no sheet connected. Please login first.', 'error');
                return;
            }
            
            // Force sync with retry
            await this.syncToSheetsWithRetry();
            this.showMessage('✅ Force sync completed successfully!', 'success');
            
        } catch (error) {
            console.error('❌ Force sync error:', error);
            this.showMessage('❌ Force sync failed. Check console and try re-login.', 'error');
        }
    }

    showMessage(message, type) {
        console.log(`[${type}] ${message}`);
        
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.className = `message ${type}`;
        notification.style.cssText = `
            position: fixed; 
            top: 80px; 
            right: 20px; 
            z-index: 1000; 
            max-width: 350px; 
            padding: 15px; 
            border-radius: 8px; 
            color: white; 
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#007bff'};
        `;
        notification.innerHTML = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
});