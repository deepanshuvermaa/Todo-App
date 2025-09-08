// Call Reminder Manager - Handles call reminders with notifications
class CallReminderManager {
    constructor() {
        this.reminders = [];
        this.completedReminders = [];
        this.notificationPermission = 'default';
        this.checkInterval = null;
        this.audioAlert = null;
        this.init();
    }

    init() {
        this.loadReminders();
        this.setupEventListeners();
        this.checkNotificationPermission();
        this.startReminderCheck();
        this.renderReminders();
        this.setupAudioAlert();
    }

    setupAudioAlert() {
        // Create audio context for notification sound
        if (typeof AudioContext !== 'undefined') {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create a simple beep sound
            this.playNotificationSound = () => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
            };
        }
    }

    setupEventListeners() {
        // Add reminder button
        const addBtn = document.getElementById('add-reminder-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addReminder());
        }

        // Enable notifications button
        const enableBtn = document.getElementById('enable-notifications-btn');
        if (enableBtn) {
            enableBtn.addEventListener('click', () => this.requestNotificationPermission());
        }

        // Set default date to today
        const dateInput = document.getElementById('reminder-date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
            dateInput.value = today;
        }

        // Set default time to next hour
        const timeInput = document.getElementById('reminder-time');
        if (timeInput) {
            const now = new Date();
            now.setHours(now.getHours() + 1, 0, 0, 0);
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            timeInput.value = `${hours}:${minutes}`;
        }
    }

    checkNotificationPermission() {
        if ('Notification' in window) {
            this.notificationPermission = Notification.permission;
            this.updateNotificationButton();
        }
    }

    updateNotificationButton() {
        const enableBtn = document.getElementById('enable-notifications-btn');
        if (enableBtn) {
            if (this.notificationPermission === 'default') {
                enableBtn.style.display = 'inline-block';
                enableBtn.textContent = 'Enable Notifications';
            } else if (this.notificationPermission === 'denied') {
                enableBtn.style.display = 'inline-block';
                enableBtn.textContent = 'Notifications Blocked';
                enableBtn.disabled = true;
            } else {
                enableBtn.style.display = 'none';
            }
        }
    }

    async requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            this.notificationPermission = permission;
            this.updateNotificationButton();
            
            if (permission === 'granted') {
                this.showMessage('Notifications enabled! You will receive reminders for your calls.', 'success');
            }
        }
    }

    addReminder() {
        const name = document.getElementById('contact-name').value.trim();
        const number = document.getElementById('contact-number').value.trim();
        const date = document.getElementById('reminder-date').value;
        const time = document.getElementById('reminder-time').value;
        const note = document.getElementById('reminder-note').value.trim();
        const type = document.getElementById('reminder-type').value;
        const alertBefore = parseInt(document.getElementById('alert-before').value);

        // Validation
        if (!name || !number || !date || !time) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }

        // Create reminder object
        const reminder = {
            id: Date.now(),
            name: name,
            number: number,
            dateTime: new Date(`${date}T${time}`),
            note: note,
            type: type,
            alertBefore: alertBefore,
            status: 'active',
            createdAt: new Date().toISOString(),
            lastAlerted: null,
            snoozedUntil: null
        };

        // Check if reminder is in the past
        if (reminder.dateTime < new Date()) {
            this.showMessage('Reminder time cannot be in the past', 'error');
            return;
        }

        // Add to reminders array
        this.reminders.push(reminder);
        this.saveReminders();
        this.renderReminders();
        this.clearForm();
        this.showMessage('Call reminder added successfully!', 'success');

        // Request notification permission if not granted
        if (this.notificationPermission === 'default') {
            this.requestNotificationPermission();
        }
    }

    clearForm() {
        document.getElementById('contact-name').value = '';
        document.getElementById('contact-number').value = '';
        document.getElementById('reminder-note').value = '';
        
        // Reset date and time to defaults
        const dateInput = document.getElementById('reminder-date');
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        
        const timeInput = document.getElementById('reminder-time');
        const now = new Date();
        now.setHours(now.getHours() + 1, 0, 0, 0);
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        timeInput.value = `${hours}:${minutes}`;
    }

    startReminderCheck() {
        // Check reminders every 30 seconds
        this.checkInterval = setInterval(() => {
            this.checkReminders();
        }, 30000);
        
        // Also check immediately
        this.checkReminders();
    }

    checkReminders() {
        const now = new Date();
        
        this.reminders.forEach(reminder => {
            if (reminder.status !== 'active') return;
            
            // Skip if snoozed
            if (reminder.snoozedUntil && new Date(reminder.snoozedUntil) > now) return;
            
            // Calculate alert time
            const alertTime = new Date(reminder.dateTime);
            alertTime.setMinutes(alertTime.getMinutes() - reminder.alertBefore);
            
            // Check if it's time to alert
            if (alertTime <= now && reminder.dateTime > now) {
                // Check if we haven't alerted in the last 5 minutes
                if (!reminder.lastAlerted || 
                    (now - new Date(reminder.lastAlerted)) > 5 * 60 * 1000) {
                    this.showReminder(reminder);
                    reminder.lastAlerted = now.toISOString();
                    this.saveReminders();
                }
            }
            
            // Check if reminder has passed
            if (reminder.dateTime < now && reminder.type === 'once') {
                reminder.status = 'expired';
                this.saveReminders();
                this.renderReminders();
            }
            
            // Handle recurring reminders
            if (reminder.dateTime < now && reminder.type !== 'once') {
                this.updateRecurringReminder(reminder);
            }
        });
    }

    updateRecurringReminder(reminder) {
        const newDate = new Date(reminder.dateTime);
        
        switch(reminder.type) {
            case 'daily':
                newDate.setDate(newDate.getDate() + 1);
                break;
            case 'weekly':
                newDate.setDate(newDate.getDate() + 7);
                break;
            case 'monthly':
                newDate.setMonth(newDate.getMonth() + 1);
                break;
        }
        
        reminder.dateTime = newDate;
        reminder.lastAlerted = null;
        reminder.snoozedUntil = null;
        this.saveReminders();
        this.renderReminders();
    }

    showReminder(reminder) {
        // Play sound if available
        if (this.playNotificationSound) {
            try {
                this.playNotificationSound();
            } catch (e) {
                console.log('Could not play notification sound');
            }
        }
        
        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(`Call Reminder: ${reminder.name}`, {
                body: `Phone: ${reminder.number}\n${reminder.note || 'No notes'}`,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23007BFF"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg>',
                requireInteraction: true,
                actions: [
                    { action: 'call', title: 'Call Now' },
                    { action: 'snooze', title: 'Snooze 10 min' }
                ]
            });
            
            notification.onclick = () => {
                window.focus();
                this.handleCallAction(reminder);
                notification.close();
            };
        }
        
        // Also show in-app notification
        this.showInAppReminder(reminder);
    }

    showInAppReminder(reminder) {
        const modal = document.createElement('div');
        modal.className = 'reminder-modal';
        modal.innerHTML = `
            <div class="reminder-modal-content">
                <h3>📞 Call Reminder</h3>
                <p class="reminder-contact">${reminder.name}</p>
                <p class="reminder-number">${reminder.number}</p>
                ${reminder.note ? `<p class="reminder-note">${reminder.note}</p>` : ''}
                <div class="reminder-actions">
                    <button class="btn-primary" onclick="window.callReminderManager.handleCallAction(${reminder.id})">
                        Call Now
                    </button>
                    <button class="btn-secondary" onclick="window.callReminderManager.snoozeReminder(${reminder.id})">
                        Snooze 10 min
                    </button>
                    <button class="btn-secondary" onclick="window.callReminderManager.dismissReminder(${reminder.id})">
                        Dismiss
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-dismiss after 30 seconds
        setTimeout(() => {
            if (document.body.contains(modal)) {
                modal.remove();
            }
        }, 30000);
    }

    handleCallAction(reminderId) {
        const reminder = typeof reminderId === 'object' ? reminderId : 
                        this.reminders.find(r => r.id === reminderId);
        
        if (reminder) {
            // Mark as completed
            reminder.status = 'completed';
            reminder.completedAt = new Date().toISOString();
            
            // Move to completed list
            this.completedReminders.push(reminder);
            this.reminders = this.reminders.filter(r => r.id !== reminder.id);
            
            this.saveReminders();
            this.renderReminders();
            
            // Try to initiate call on mobile
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                window.location.href = `tel:${reminder.number}`;
            } else {
                // Copy number to clipboard for desktop
                navigator.clipboard.writeText(reminder.number).then(() => {
                    this.showMessage(`Number ${reminder.number} copied to clipboard!`, 'success');
                });
            }
        }
        
        // Remove modal if exists
        const modal = document.querySelector('.reminder-modal');
        if (modal) modal.remove();
    }

    snoozeReminder(reminderId) {
        const reminder = this.reminders.find(r => r.id === reminderId);
        if (reminder) {
            const snoozeTime = new Date();
            snoozeTime.setMinutes(snoozeTime.getMinutes() + 10);
            reminder.snoozedUntil = snoozeTime.toISOString();
            this.saveReminders();
            this.showMessage('Reminder snoozed for 10 minutes', 'info');
        }
        
        // Remove modal
        const modal = document.querySelector('.reminder-modal');
        if (modal) modal.remove();
    }

    dismissReminder(reminderId) {
        const reminder = this.reminders.find(r => r.id === reminderId);
        if (reminder) {
            reminder.status = 'dismissed';
            this.saveReminders();
            this.renderReminders();
        }
        
        // Remove modal
        const modal = document.querySelector('.reminder-modal');
        if (modal) modal.remove();
    }

    deleteReminder(reminderId) {
        if (confirm('Are you sure you want to delete this reminder?')) {
            this.reminders = this.reminders.filter(r => r.id !== reminderId);
            this.saveReminders();
            this.renderReminders();
            this.showMessage('Reminder deleted', 'success');
        }
    }

    renderReminders() {
        this.renderActiveReminders();
        this.renderCompletedReminders();
    }

    renderActiveReminders() {
        const container = document.getElementById('active-reminders-list');
        if (!container) return;
        
        const activeReminders = this.reminders
            .filter(r => r.status === 'active')
            .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
        
        if (activeReminders.length === 0) {
            container.innerHTML = '<div class="no-reminders">No upcoming call reminders</div>';
            return;
        }
        
        container.innerHTML = activeReminders.map(reminder => {
            const dateTime = new Date(reminder.dateTime);
            const dateStr = dateTime.toLocaleDateString();
            const timeStr = dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const isToday = dateTime.toDateString() === new Date().toDateString();
            const isTomorrow = dateTime.toDateString() === new Date(Date.now() + 86400000).toDateString();
            
            let dayLabel = dateStr;
            if (isToday) dayLabel = 'Today';
            if (isTomorrow) dayLabel = 'Tomorrow';
            
            return `
                <div class="reminder-card ${isToday ? 'today' : ''}">
                    <div class="reminder-info">
                        <div class="reminder-header">
                            <span class="reminder-name">${reminder.name}</span>
                            <span class="reminder-time">${dayLabel}, ${timeStr}</span>
                        </div>
                        <div class="reminder-details">
                            <span class="reminder-phone">📱 ${reminder.number}</span>
                            ${reminder.note ? `<span class="reminder-note-text">📝 ${reminder.note}</span>` : ''}
                            ${reminder.type !== 'once' ? `<span class="reminder-repeat">🔄 ${reminder.type}</span>` : ''}
                        </div>
                    </div>
                    <div class="reminder-actions">
                        <button class="action-btn call-btn" onclick="window.callReminderManager.handleCallAction(${reminder.id})" title="Call Now">
                            📞
                        </button>
                        <button class="action-btn delete-btn" onclick="window.callReminderManager.deleteReminder(${reminder.id})" title="Delete">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderCompletedReminders() {
        const container = document.getElementById('completed-reminders-list');
        if (!container) return;
        
        const completed = this.completedReminders
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
            .slice(0, 10); // Show last 10
        
        if (completed.length === 0) {
            container.innerHTML = '<div class="no-reminders">No completed calls yet</div>';
            return;
        }
        
        container.innerHTML = completed.map(reminder => {
            const completedDate = new Date(reminder.completedAt);
            const dateStr = completedDate.toLocaleDateString();
            const timeStr = completedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            return `
                <div class="reminder-card completed">
                    <div class="reminder-info">
                        <div class="reminder-header">
                            <span class="reminder-name">${reminder.name}</span>
                            <span class="reminder-time">Called: ${dateStr}, ${timeStr}</span>
                        </div>
                        <div class="reminder-details">
                            <span class="reminder-phone">📱 ${reminder.number}</span>
                        </div>
                    </div>
                    <div class="reminder-status">
                        ✅ Completed
                    </div>
                </div>
            `;
        }).join('');
    }

    async saveReminders() {
        localStorage.setItem('callReminders', JSON.stringify(this.reminders));
        localStorage.setItem('completedCallReminders', JSON.stringify(this.completedReminders));
        
        // Sync to Google Sheets if connected
        if (window.todoApp && window.todoApp.isGoogleConnected && window.todoApp.sheetId) {
            try {
                await this.syncToGoogleSheets();
            } catch (error) {
                console.error('Failed to sync reminders to Google Sheets:', error);
            }
        }
    }
    
    async syncToGoogleSheets() {
        if (!window.gapi || !window.gapi.client || !window.gapi.client.sheets) {
            console.warn('Google Sheets API not available');
            return;
        }
        
        try {
            // Check if CallReminders sheet exists
            const response = await gapi.client.sheets.spreadsheets.get({
                spreadsheetId: window.todoApp.sheetId
            });
            
            const sheets = response.result.sheets || [];
            const reminderSheet = sheets.find(s => s.properties.title === 'CallReminders');
            
            if (!reminderSheet) {
                // Create CallReminders sheet
                await gapi.client.sheets.spreadsheets.batchUpdate({
                    spreadsheetId: window.todoApp.sheetId,
                    resource: {
                        requests: [{
                            addSheet: {
                                properties: {
                                    title: 'CallReminders',
                                    gridProperties: {
                                        rowCount: 1000,
                                        columnCount: 10
                                    }
                                }
                            }
                        }]
                    }
                });
                
                // Add headers
                await gapi.client.sheets.spreadsheets.values.update({
                    spreadsheetId: window.todoApp.sheetId,
                    range: 'CallReminders!A1:J1',
                    valueInputOption: 'USER_ENTERED',
                    resource: {
                        values: [[
                            'ID', 'Name', 'Phone Number', 'Date Time', 'Note', 
                            'Type', 'Alert Before', 'Status', 'Created At', 'Completed At'
                        ]]
                    }
                });
            }
            
            // Prepare data for sheets
            const allReminders = [...this.reminders, ...this.completedReminders];
            const values = allReminders.map(reminder => [
                reminder.id,
                reminder.name,
                reminder.number,
                reminder.dateTime instanceof Date ? reminder.dateTime.toISOString() : reminder.dateTime,
                reminder.note || '',
                reminder.type,
                reminder.alertBefore,
                reminder.status,
                reminder.createdAt,
                reminder.completedAt || ''
            ]);
            
            // Clear existing data and update with new data
            if (values.length > 0) {
                await gapi.client.sheets.spreadsheets.values.clear({
                    spreadsheetId: window.todoApp.sheetId,
                    range: 'CallReminders!A2:J1000'
                });
                
                await gapi.client.sheets.spreadsheets.values.update({
                    spreadsheetId: window.todoApp.sheetId,
                    range: `CallReminders!A2:J${values.length + 1}`,
                    valueInputOption: 'USER_ENTERED',
                    resource: { values }
                });
            }
        } catch (error) {
            console.error('Error syncing reminders to Google Sheets:', error);
            throw error;
        }
    }

    loadReminders() {
        const stored = localStorage.getItem('callReminders');
        const completedStored = localStorage.getItem('completedCallReminders');
        
        if (stored) {
            try {
                this.reminders = JSON.parse(stored).map(r => ({
                    ...r,
                    dateTime: new Date(r.dateTime)
                }));
            } catch (e) {
                console.error('Error loading reminders:', e);
                this.reminders = [];
            }
        }
        
        if (completedStored) {
            try {
                this.completedReminders = JSON.parse(completedStored);
            } catch (e) {
                console.error('Error loading completed reminders:', e);
                this.completedReminders = [];
            }
        }
    }

    showMessage(message, type = 'info') {
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => messageEl.remove(), 300);
        }, 3000);
    }

    destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('reminders-view')) {
        window.callReminderManager = new CallReminderManager();
    }
});