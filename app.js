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
        document.getElementById('load-history-btn').addEventListener('click', () => this.loadHistory());

        // Settings
        document.getElementById('google-signin').addEventListener('click', () => this.handleGoogleSignIn());
        document.getElementById('save-sheet-btn').addEventListener('click', () => this.saveSheetConfig());
    }

    switchTab(tabName) {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        document.querySelectorAll('.view').forEach(view => {
            view.classList.toggle('active', view.id === `${tabName}-view`);
        });
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
            
            if (this.isAuthenticated && this.sheetId) {
                this.syncToSheets();
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

    async syncToSheets() {
        if (!this.isAuthenticated || !this.sheetId) return;

        try {
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
                range: 'Sheet1!A:A'
            });

            const dates = response.result.values || [];
            const rowIndex = dates.findIndex(row => row[0] === todayStr);

            if (rowIndex > -1) {
                // Update existing row
                await gapi.client.sheets.spreadsheets.values.update({
                    spreadsheetId: this.sheetId,
                    range: `Sheet1!A${rowIndex + 1}:C${rowIndex + 1}`,
                    valueInputOption: 'USER_ENTERED',
                    resource: {
                        values: [[todayStr, todoTasks, '']]
                    }
                });
            } else {
                // Append new row
                await gapi.client.sheets.spreadsheets.values.append({
                    spreadsheetId: this.sheetId,
                    range: 'Sheet1!A:C',
                    valueInputOption: 'USER_ENTERED',
                    insertDataOption: 'INSERT_ROWS',
                    resource: {
                        values: [[todayStr, todoTasks, '']]
                    }
                });
            }

            this.lastSyncTime = new Date();
            console.log('Synced to Google Sheets');
        } catch (error) {
            console.error('Sync error:', error);
            this.showMessage('Failed to sync with Google Sheets', 'error');
        }
    }

    async syncFromSheets() {
        if (!this.isAuthenticated || !this.sheetId) return;

        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: this.sheetId,
                range: 'Sheet1!A:C'
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
                                completed: completed,
                                date: date
                            });
                        }
                    });
                }
            });

            // Merge with existing local tasks (avoid duplicates)
            const localTasksMap = new Map(this.tasks.map(t => [`${t.date}-${t.text}`, t]));
            importedTasks.forEach(task => {
                const key = `${task.date}-${task.text}`;
                if (!localTasksMap.has(key)) {
                    this.tasks.push(task);
                }
            });

            this.saveTasks();
            this.renderTasks();
            this.updateMetrics();
            this.showMessage('Tasks synced from Google Sheets', 'success');
        } catch (error) {
            console.error('Sync from sheets error:', error);
            this.showMessage('Failed to load tasks from Google Sheets', 'error');
        }
    }

    startAutoRollover() {
        // Check for rollover on app start
        this.checkAndPerformRollover();
        
        // Set up interval to check every hour
        setInterval(() => {
            this.checkAndPerformRollover();
        }, 3600000); // Check every hour
    }

    checkAndPerformRollover() {
        const now = new Date();
        const lastRollover = localStorage.getItem('lastRolloverDate');
        const todayStr = now.toISOString().split('T')[0];
        
        if (lastRollover !== todayStr) {
            // It's a new day, perform rollover
            this.performRollover();
            localStorage.setItem('lastRolloverDate', todayStr);
        }
    }

    async performRollover() {
        const yesterday = new Date(this.currentDate);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const yesterdayTasks = this.tasks.filter(task => 
            task.date === yesterdayStr && !task.completed
        );

        if (yesterdayTasks.length > 0) {
            const todayStr = this.currentDate.toISOString().split('T')[0];
            
            yesterdayTasks.forEach(task => {
                const newTask = {
                    ...task,
                    id: Date.now() + Math.random(),
                    date: todayStr,
                    rolledOver: true
                };
                this.tasks.push(newTask);
            });

            this.saveTasks();
            this.renderTasks();
            this.updateMetrics();
            
            if (this.isAuthenticated && this.sheetId) {
                this.syncToSheets();
            }
        }
    }

    showMessage(message, type) {
        console.log(`[${type}] ${message}`);
        
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.className = `message ${type}`;
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1000; max-width: 300px;';
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