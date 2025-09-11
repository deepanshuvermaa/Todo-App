// GOOGLE SHEETS INTEGRATION - Sync all features

class SheetsIntegration {
    constructor() {
        this.sheetId = localStorage.getItem('connectedSheetId');
        this.isConnected = !!this.sheetId;
        this.syncQueue = [];
        this.isSyncing = false;
        
        if (this.isConnected) {
            this.init();
        }
    }

    init() {
        // Setup sync for all features
        this.setupFeatureSync();
        
        // Auto-sync every 30 seconds
        setInterval(() => this.syncAll(), 30000);
        
        // Sync on page unload
        window.addEventListener('beforeunload', () => {
            this.syncAll();
        });
    }

    setupFeatureSync() {
        // Listen for changes in all data stores
        const features = [
            'tasks',
            'expenses', 
            'meals',
            'callReminders',
            'notes',
            'bucketList',
            'habits',
            'journalEntries',
            'linkEmbeddings',
            'smartScreenshots',
            'voiceRecordings'
        ];

        features.forEach(feature => {
            // Override localStorage setItem for these keys
            const originalSetItem = localStorage.setItem;
            localStorage.setItem = (key, value) => {
                originalSetItem.call(localStorage, key, value);
                
                if (features.includes(key)) {
                    this.queueSync(key, value);
                }
            };
        });
    }

    queueSync(feature, data) {
        this.syncQueue.push({ feature, data, timestamp: new Date().toISOString() });
        
        // Debounce sync
        clearTimeout(this.syncTimeout);
        this.syncTimeout = setTimeout(() => {
            this.processQueue();
        }, 2000);
    }

    async processQueue() {
        if (this.isSyncing || this.syncQueue.length === 0) return;
        
        this.isSyncing = true;
        this.updateSyncStatus('syncing');

        try {
            while (this.syncQueue.length > 0) {
                const item = this.syncQueue.shift();
                await this.syncFeature(item.feature, item.data);
            }
            
            this.updateSyncStatus('connected');
        } catch (error) {
            console.error('Sync error:', error);
            this.updateSyncStatus('error');
        } finally {
            this.isSyncing = false;
        }
    }

    async syncFeature(feature, data) {
        if (!this.sheetId) return;

        const sheetMap = {
            'tasks': 'Tasks',
            'expenses': 'Expenses',
            'meals': 'Meals',
            'callReminders': 'Reminders',
            'notes': 'Notes',
            'bucketList': 'Goals',
            'habits': 'Habits',
            'journalEntries': 'Journal',
            'linkEmbeddings': 'Links',
            'smartScreenshots': 'Screenshots',
            'voiceRecordings': 'VoiceNotes'
        };

        const sheetName = sheetMap[feature];
        if (!sheetName) return;

        try {
            // Ensure sheet exists
            await this.ensureSheetExists(sheetName);
            
            // Parse data
            const items = JSON.parse(data || '[]');
            
            // Format data for sheets
            const rows = this.formatDataForSheets(feature, items);
            
            // Update sheet
            await this.updateSheet(sheetName, rows);
            
        } catch (error) {
            console.error(`Failed to sync ${feature}:`, error);
            throw error;
        }
    }

    formatDataForSheets(feature, items) {
        switch(feature) {
            case 'tasks':
                return [
                    ['ID', 'Task', 'Completed', 'Date', 'Time'],
                    ...items.map(task => [
                        task.id,
                        task.text,
                        task.completed ? 'Yes' : 'No',
                        task.date || new Date().toLocaleDateString(),
                        task.time || new Date().toLocaleTimeString()
                    ])
                ];

            case 'expenses':
                return [
                    ['ID', 'Amount', 'Category', 'Description', 'Date', 'Time'],
                    ...items.map(expense => [
                        expense.id,
                        expense.amount,
                        expense.category,
                        expense.description,
                        expense.date,
                        expense.time
                    ])
                ];

            case 'meals':
                return [
                    ['ID', 'Type', 'Items', 'Calories', 'Protein', 'Carbs', 'Fat', 'Date'],
                    ...items.map(meal => [
                        meal.id,
                        meal.type,
                        meal.items?.join(', ') || '',
                        meal.nutrition?.calories || 0,
                        meal.nutrition?.protein || 0,
                        meal.nutrition?.carbs || 0,
                        meal.nutrition?.fat || 0,
                        meal.date
                    ])
                ];

            case 'callReminders':
                return [
                    ['ID', 'Name', 'Phone', 'Time', 'Recurring', 'Completed', 'Notes'],
                    ...items.map(reminder => [
                        reminder.id,
                        reminder.name,
                        reminder.phone,
                        reminder.time,
                        reminder.recurring || 'No',
                        reminder.completed ? 'Yes' : 'No',
                        reminder.notes || ''
                    ])
                ];

            case 'notes':
                return [
                    ['ID', 'Title', 'Content', 'Category', 'Pinned', 'Created', 'Updated'],
                    ...items.map(note => [
                        note.id,
                        note.title,
                        note.content,
                        note.category || 'General',
                        note.pinned ? 'Yes' : 'No',
                        note.createdAt,
                        note.updatedAt
                    ])
                ];

            case 'bucketList':
                return [
                    ['ID', 'Goal', 'Category', 'Timeframe', 'Progress', 'Completed', 'Notes'],
                    ...items.map(goal => [
                        goal.id,
                        goal.text,
                        goal.category,
                        goal.timeframe,
                        goal.progress || 0,
                        goal.completed ? 'Yes' : 'No',
                        goal.notes || ''
                    ])
                ];

            case 'habits':
                return [
                    ['ID', 'Habit', 'Frequency', 'Streak', 'Best Streak', 'Last Done', 'Active'],
                    ...items.map(habit => [
                        habit.id,
                        habit.name,
                        habit.frequency || 'Daily',
                        habit.currentStreak || 0,
                        habit.bestStreak || 0,
                        habit.lastCompleted || '',
                        habit.active ? 'Yes' : 'No'
                    ])
                ];

            case 'journalEntries':
                return [
                    ['ID', 'Date', 'Mood', 'Highlights', 'Gratitude', 'Challenges', 'Tomorrow', 'Thoughts'],
                    ...items.map(entry => [
                        entry.id,
                        entry.date,
                        entry.mood || '',
                        entry.highlights || '',
                        entry.gratitude || '',
                        entry.challenges || '',
                        entry.tomorrow || '',
                        entry.freeThoughts || ''
                    ])
                ];

            case 'linkEmbeddings':
                return [
                    ['ID', 'URL', 'Title', 'Type', 'Platform', 'Description', 'Created'],
                    ...items.map(link => [
                        link.id,
                        link.url,
                        link.title || '',
                        link.type || 'link',
                        link.platform || 'Web',
                        link.description || '',
                        link.createdAt
                    ])
                ];

            case 'smartScreenshots':
                return [
                    ['ID', 'Name', 'Extracted Text', 'Size', 'Timestamp'],
                    ...items.map(screenshot => [
                        screenshot.id,
                        screenshot.name,
                        screenshot.extractedText || 'No text extracted',
                        `${(screenshot.size / 1024).toFixed(2)} KB`,
                        screenshot.timestamp
                    ])
                ];

            case 'voiceRecordings':
                return [
                    ['ID', 'Title', 'Duration', 'Tags', 'Notes', 'Timestamp'],
                    ...items.map(recording => [
                        recording.id,
                        recording.title,
                        `${recording.duration} seconds`,
                        recording.tags?.join(', ') || '',
                        recording.notes || '',
                        recording.timestamp
                    ])
                ];

            default:
                return [];
        }
    }

    async ensureSheetExists(sheetName) {
        if (!window.gapi?.client?.sheets) return;

        try {
            // Get spreadsheet metadata
            const response = await gapi.client.sheets.spreadsheets.get({
                spreadsheetId: this.sheetId
            });

            const sheets = response.result.sheets || [];
            const sheetExists = sheets.some(sheet => 
                sheet.properties.title === sheetName
            );

            if (!sheetExists) {
                // Create new sheet
                await gapi.client.sheets.spreadsheets.batchUpdate({
                    spreadsheetId: this.sheetId,
                    resource: {
                        requests: [{
                            addSheet: {
                                properties: {
                                    title: sheetName,
                                    gridProperties: {
                                        rowCount: 1000,
                                        columnCount: 20
                                    }
                                }
                            }
                        }]
                    }
                });
            }
        } catch (error) {
            console.error('Failed to ensure sheet exists:', error);
        }
    }

    async updateSheet(sheetName, rows) {
        if (!window.gapi?.client?.sheets || !rows.length) return;

        try {
            // Clear existing data
            await gapi.client.sheets.spreadsheets.values.clear({
                spreadsheetId: this.sheetId,
                range: `${sheetName}!A:Z`
            });

            // Write new data
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: this.sheetId,
                range: `${sheetName}!A1`,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: rows
                }
            });

            console.log(`Successfully synced ${sheetName}`);
        } catch (error) {
            console.error(`Failed to update ${sheetName}:`, error);
            throw error;
        }
    }

    async syncAll() {
        if (!this.isConnected) return;

        const features = [
            'tasks',
            'expenses',
            'meals',
            'callReminders',
            'notes',
            'bucketList', 
            'habits',
            'journalEntries',
            'linkEmbeddings',
            'smartScreenshots',
            'voiceRecordings'
        ];

        for (const feature of features) {
            const data = localStorage.getItem(feature);
            if (data) {
                await this.syncFeature(feature, data);
            }
        }
    }

    updateSyncStatus(status) {
        const statusElement = document.getElementById('sync-status-indicator');
        const desktopStatus = document.getElementById('desktop-sync-status');
        
        const messages = {
            'connected': '☁️ Connected',
            'syncing': '🔄 Syncing...',
            'error': '⚠️ Sync Error',
            'disconnected': '🔌 Disconnected'
        };

        const message = messages[status] || '☁️ Checking...';
        
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `sync-status sync-${status}`;
        }
        
        if (desktopStatus) {
            desktopStatus.textContent = message;
            desktopStatus.className = `desktop-sync-status sync-${status}`;
        }
    }

    // Method to manually trigger sync
    manualSync() {
        this.syncAll().then(() => {
            if (window.errorHandler) {
                window.errorHandler.showSuccess('All data synced successfully!');
            }
        }).catch(error => {
            if (window.errorHandler) {
                window.errorHandler.showError({
                    title: 'Sync Failed',
                    message: 'Could not sync data to Google Sheets',
                    icon: '⚠️',
                    actions: ['retry', 'dismiss']
                });
            }
        });
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.sheetsIntegration = new SheetsIntegration();
});

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SheetsIntegration;
}