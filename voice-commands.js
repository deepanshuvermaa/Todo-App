// Voice Commands - Speech recognition and voice input functionality
class VoiceCommands {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.isSupported = false;
        this.commands = [];
        this.lastCommand = '';
        this.settings = {
            language: 'en-US',
            continuous: false,
            interimResults: true,
            maxAlternatives: 1
        };
        this.init();
    }

    init() {
        this.checkSupport();
        this.setupCommands();
        this.createVoiceUI();
        this.setupEventListeners();
    }

    checkSupport() {
        // Check for Web Speech API support
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.isSupported = true;
        } else if ('SpeechRecognition' in window) {
            this.recognition = new SpeechRecognition();
            this.isSupported = true;
        } else {
            this.isSupported = false;
            console.log('Speech recognition not supported in this browser');
            return;
        }

        // Configure recognition
        this.recognition.continuous = this.settings.continuous;
        this.recognition.interimResults = this.settings.interimResults;
        this.recognition.lang = this.settings.language;
        this.recognition.maxAlternatives = this.settings.maxAlternatives;

        // Setup recognition event handlers
        this.setupRecognitionHandlers();
    }

    setupRecognitionHandlers() {
        if (!this.recognition) return;

        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateVoiceUI();
            this.showVoiceIndicator('Listening...');
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateVoiceUI();
            this.hideVoiceIndicator();
        };

        this.recognition.onresult = (event) => {
            const results = event.results;
            const lastResult = results[results.length - 1];
            
            if (lastResult.isFinal) {
                const transcript = lastResult[0].transcript.trim();
                this.processCommand(transcript);
            } else {
                // Show interim results
                const interim = lastResult[0].transcript;
                this.showVoiceIndicator(`Listening: "${interim}"`);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
            this.updateVoiceUI();
            
            let message = 'Voice recognition error';
            switch (event.error) {
                case 'no-speech':
                    message = 'No speech detected. Try speaking louder.';
                    break;
                case 'audio-capture':
                    message = 'Microphone not available.';
                    break;
                case 'not-allowed':
                    message = 'Microphone permission denied.';
                    break;
                case 'network':
                    message = 'Network error. Check your connection.';
                    break;
            }
            this.showNotification(message, 'error');
        };
    }

    setupCommands() {
        this.commands = [
            // Task Management
            {
                patterns: [
                    /add task (.+)/i,
                    /create task (.+)/i,
                    /new task (.+)/i
                ],
                action: (match) => this.addTask(match[1]),
                description: 'Add a new task'
            },
            {
                patterns: [
                    /complete task (.+)/i,
                    /finish task (.+)/i,
                    /mark task (.+) (as )?complete/i
                ],
                action: (match) => this.completeTask(match[1]),
                description: 'Mark a task as complete'
            },
            {
                patterns: [
                    /delete task (.+)/i,
                    /remove task (.+)/i
                ],
                action: (match) => this.deleteTask(match[1]),
                description: 'Delete a task'
            },
            {
                patterns: [
                    /(show|list|display) (my )?tasks/i,
                    /what are my tasks/i
                ],
                action: () => this.showTasks(),
                description: 'List all tasks'
            },

            // Expense Management
            {
                patterns: [
                    /add expense (\d+) (rupees? |dollars? |₹|\$)?(.+)/i,
                    /spent (\d+) (rupees? |dollars? |₹|\$)?(.+)/i,
                    /expense (\d+) (rupees? |dollars? |₹|\$)?(.+)/i
                ],
                action: (match) => this.addExpense(match[1], match[3]),
                description: 'Add an expense'
            },
            {
                patterns: [
                    /(show|display) (my )?expenses/i,
                    /what did I spend/i,
                    /expense summary/i
                ],
                action: () => this.showExpenses(),
                description: 'Show expense summary'
            },

            // Meals
            {
                patterns: [
                    /log meal (.+)/i,
                    /add meal (.+)/i,
                    /ate (.+)/i
                ],
                action: (match) => this.logMeal(match[1]),
                description: 'Log a meal'
            },
            {
                patterns: [
                    /log water/i,
                    /drink water/i,
                    /had water/i,
                    /water intake/i
                ],
                action: () => this.logWater(),
                description: 'Log water intake'
            },

            // Navigation
            {
                patterns: [
                    /(go to|show|open) dashboard/i,
                    /show dashboard/i
                ],
                action: () => this.navigateTo('dashboard'),
                description: 'Go to dashboard'
            },
            {
                patterns: [
                    /(go to|show|open) tasks?/i,
                    /(go to|show|open) today/i
                ],
                action: () => this.navigateTo('today'),
                description: 'Go to tasks'
            },
            {
                patterns: [
                    /(go to|show|open) expenses?/i,
                    /(go to|show|open) budget/i
                ],
                action: () => this.navigateTo('expenses'),
                description: 'Go to expenses'
            },
            {
                patterns: [
                    /(go to|show|open) meals?/i,
                    /(go to|show|open) food/i
                ],
                action: () => this.navigateTo('meals'),
                description: 'Go to meals'
            },
            {
                patterns: [
                    /(go to|show|open) habits?/i
                ],
                action: () => this.navigateTo('habits'),
                description: 'Go to habits'
            },
            {
                patterns: [
                    /(go to|show|open) notes?/i
                ],
                action: () => this.navigateTo('notes'),
                description: 'Go to notes'
            },

            // Quick Actions
            {
                patterns: [
                    /(start|begin) pomodoro/i,
                    /focus (time|timer)/i
                ],
                action: () => this.startPomodoro(),
                description: 'Start pomodoro timer'
            },
            {
                patterns: [
                    /(set|create) reminder (.+)/i,
                    /remind me (.+)/i
                ],
                action: (match) => this.setReminder(match[2]),
                description: 'Set a reminder'
            },
            {
                patterns: [
                    /(what's |what is )(the |my )?time/i,
                    /(what's |what is )(today's |the )?date/i
                ],
                action: () => this.tellTime(),
                description: 'Tell current time and date'
            },

            // Help
            {
                patterns: [
                    /(help|what can you do|commands)/i,
                    /voice help/i
                ],
                action: () => this.showHelp(),
                description: 'Show available commands'
            },

            // Settings
            {
                patterns: [
                    /stop listening/i,
                    /(turn off|disable) voice/i
                ],
                action: () => this.stopListening(),
                description: 'Stop voice recognition'
            }
        ];
    }

    createVoiceUI() {
        if (!this.isSupported) return;

        // Voice button already exists in smart-dashboard.js, don't add duplicate

        // Add floating voice button
        if (!document.getElementById('floating-voice-btn')) {
            const floatingBtn = document.createElement('div');
            floatingBtn.id = 'floating-voice-btn';
            floatingBtn.className = 'floating-voice-btn';
            floatingBtn.innerHTML = `
                <button class="voice-fab" onclick="window.voiceCommands.toggleListening()">
                    <span class="voice-icon">🎤</span>
                </button>
                <div class="voice-indicator" id="voice-indicator" style="display: none;">
                    <div class="voice-animation">
                        <div class="voice-wave"></div>
                        <div class="voice-wave"></div>
                        <div class="voice-wave"></div>
                    </div>
                    <div class="voice-text" id="voice-text">Tap to speak</div>
                </div>
            `;
            document.body.appendChild(floatingBtn);
        }

        // Add voice commands help
        this.createVoiceHelp();
    }

    createVoiceHelp() {
        // Add voice commands section to settings or help
        const settingsView = document.getElementById('settings-view');
        if (settingsView && !document.getElementById('voice-commands-section')) {
            const voiceSection = document.createElement('div');
            voiceSection.id = 'voice-commands-section';
            voiceSection.className = 'settings-section';
            voiceSection.innerHTML = `
                <h2 class="section-title">VOICE COMMANDS</h2>
                <div class="settings-card">
                    <div class="voice-status">
                        <div class="status-indicator ${this.isSupported ? 'active' : 'inactive'}"></div>
                        <span>Voice Recognition: ${this.isSupported ? 'Supported' : 'Not Supported'}</span>
                    </div>
                    
                    ${this.isSupported ? `
                        <div class="voice-controls">
                            <button class="btn-primary" onclick="window.voiceCommands.toggleListening()">
                                ${this.isListening ? 'Stop Listening' : 'Start Voice Commands'}
                            </button>
                            <button class="btn-secondary" onclick="window.voiceCommands.showHelp()">
                                Show Commands
                            </button>
                        </div>
                        
                        <div class="voice-settings">
                            <div class="form-group">
                                <label for="voice-language">Language</label>
                                <select id="voice-language" class="form-input" onchange="window.voiceCommands.changeLanguage(this.value)">
                                    <option value="en-US">English (US)</option>
                                    <option value="en-GB">English (UK)</option>
                                    <option value="hi-IN">Hindi (India)</option>
                                    <option value="es-ES">Spanish</option>
                                    <option value="fr-FR">French</option>
                                    <option value="de-DE">German</option>
                                </select>
                            </div>
                        </div>
                    ` : `
                        <p>Voice commands are not supported in this browser. Please use Chrome, Edge, or Safari for voice features.</p>
                    `}
                    
                    <div class="voice-tips">
                        <h4>Voice Command Tips:</h4>
                        <ul>
                            <li>Speak clearly and at normal pace</li>
                            <li>Use natural language - say "add task buy groceries" instead of "task-add-buy-groceries"</li>
                            <li>Wait for the microphone to activate before speaking</li>
                            <li>You can say "help" to see all available commands</li>
                        </ul>
                    </div>
                </div>
            `;
            settingsView.appendChild(voiceSection);
        }
    }

    setupEventListeners() {
        // Keyboard shortcut for voice activation (Ctrl + Shift + V)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'V') {
                e.preventDefault();
                this.toggleListening();
            }
        });
    }

    toggleListening() {
        if (!this.isSupported) {
            this.showNotification('Voice recognition not supported in this browser', 'error');
            return;
        }

        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    startListening() {
        if (!this.recognition || this.isListening) return;

        try {
            this.recognition.start();
            this.showVoiceHelper();
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            this.showNotification('Could not start voice recognition', 'error');
        }
    }

    stopListening() {
        if (!this.recognition || !this.isListening) return;

        this.recognition.stop();
    }

    processCommand(transcript) {
        this.lastCommand = transcript;
        console.log('Voice command:', transcript);

        // Show what was heard
        this.showNotification(`🎤 Heard: "${transcript}"`, 'info');

        // Find matching command
        const matchedCommand = this.commands.find(cmd => {
            return cmd.patterns.some(pattern => pattern.test(transcript));
        });

        if (matchedCommand) {
            // Execute the command
            const pattern = matchedCommand.patterns.find(p => p.test(transcript));
            const match = transcript.match(pattern);
            
            try {
                matchedCommand.action(match);
                this.showNotification(`✅ Done: ${matchedCommand.description}`, 'success');
            } catch (error) {
                console.error('Command execution error:', error);
                this.showNotification(`❌ Could not execute: "${transcript}"`, 'error');
            }
        } else {
            // Suggest similar commands
            const suggestions = this.getSuggestions(transcript);
            if (suggestions.length > 0) {
                this.showNotification(`❓ Did you mean: ${suggestions.join(', ')}?`, 'warning');
            } else {
                this.showNotification(`❓ Try saying: "Add task", "Go to finance", "Show habits"`, 'warning');
            }
        }
    }

    // Command Actions
    addTask(taskText) {
        if (window.todoApp) {
            window.todoApp.addTaskProgrammatically(taskText);
        } else {
            this.showNotification('Task manager not available', 'error');
        }
    }

    completeTask(taskText) {
        if (window.todoApp) {
            const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
            const task = tasks.find(t => t.text.toLowerCase().includes(taskText.toLowerCase()) && !t.completed);
            if (task) {
                window.todoApp.toggleTask(task.id);
                this.showNotification(`Task completed: ${task.text}`, 'success');
            } else {
                this.showNotification(`Task not found: ${taskText}`, 'warning');
            }
        }
    }

    deleteTask(taskText) {
        if (window.todoApp) {
            const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
            const task = tasks.find(t => t.text.toLowerCase().includes(taskText.toLowerCase()));
            if (task) {
                window.todoApp.deleteTask(task.id);
                this.showNotification(`Task deleted: ${task.text}`, 'success');
            } else {
                this.showNotification(`Task not found: ${taskText}`, 'warning');
            }
        }
    }

    showTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const today = new Date().toDateString();
        const todayTasks = tasks.filter(t => new Date(t.date).toDateString() === today);
        
        if (todayTasks.length === 0) {
            this.showNotification('No tasks for today', 'info');
        } else {
            const completed = todayTasks.filter(t => t.completed).length;
            const pending = todayTasks.length - completed;
            this.showNotification(`You have ${pending} pending and ${completed} completed tasks today`, 'info');
        }
        this.navigateTo('today');
    }

    addExpense(amount, description) {
        if (window.expenseManager) {
            window.expenseManager.addExpenseProgrammatically(parseFloat(amount), description);
        } else {
            this.showNotification('Expense manager not available', 'error');
        }
    }

    showExpenses() {
        const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        const today = new Date().toISOString().split('T')[0];
        const todayExpenses = expenses.filter(e => e.date === today);
        const total = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
        
        this.showNotification(`Today's expenses: ₹${total.toFixed(2)}`, 'info');
        this.navigateTo('expenses');
    }

    logMeal(mealDescription) {
        if (window.mealTracker) {
            window.mealTracker.quickLogMeal(mealDescription);
        } else {
            this.showNotification('Meal tracker not available', 'error');
        }
    }

    logWater() {
        if (window.smartDashboard) {
            window.smartDashboard.quickLogWater();
        } else {
            const waterIntake = parseInt(localStorage.getItem('waterIntake') || '0');
            localStorage.setItem('waterIntake', waterIntake + 1);
            this.showNotification('Water intake logged! 💧', 'success');
        }
    }

    navigateTo(tab) {
        if (window.todoApp) {
            window.todoApp.switchToTab(tab);
        }
    }

    startPomodoro() {
        if (window.pomodoroTimer) {
            window.pomodoroTimer.start();
        } else {
            this.showNotification('Pomodoro timer coming soon!', 'info');
        }
    }

    setReminder(reminderText) {
        this.showNotification(`Reminder set: ${reminderText}`, 'info');
        // This could integrate with the call reminder system
    }

    tellTime() {
        const now = new Date();
        const time = now.toLocaleTimeString();
        const date = now.toLocaleDateString();
        this.showNotification(`Current time: ${time}, Date: ${date}`, 'info');
    }

    showHelp() {
        const commandList = this.commands.map(cmd => 
            `• ${cmd.description}`
        ).join('\n');

        const helpModal = document.createElement('div');
        helpModal.className = 'modal voice-help-modal';
        helpModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Voice Commands</h2>
                    <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <h3>Available Commands:</h3>
                    <div class="command-categories">
                        <div class="command-category">
                            <h4>📝 Tasks</h4>
                            <ul>
                                <li>"Add task buy groceries"</li>
                                <li>"Complete task buy groceries"</li>
                                <li>"Show my tasks"</li>
                            </ul>
                        </div>
                        <div class="command-category">
                            <h4>💰 Expenses</h4>
                            <ul>
                                <li>"Add expense 500 for lunch"</li>
                                <li>"Show my expenses"</li>
                            </ul>
                        </div>
                        <div class="command-category">
                            <h4>🍽️ Meals</h4>
                            <ul>
                                <li>"Log meal chicken curry"</li>
                                <li>"Log water" / "Drink water"</li>
                            </ul>
                        </div>
                        <div class="command-category">
                            <h4>🧭 Navigation</h4>
                            <ul>
                                <li>"Go to dashboard"</li>
                                <li>"Show tasks" / "Open expenses"</li>
                                <li>"Open habits" / "Show notes"</li>
                            </ul>
                        </div>
                        <div class="command-category">
                            <h4>⚡ Quick Actions</h4>
                            <ul>
                                <li>"Start pomodoro"</li>
                                <li>"What's the time?"</li>
                                <li>"Set reminder call mom"</li>
                            </ul>
                        </div>
                    </div>
                    <div class="voice-shortcuts">
                        <h4>Keyboard Shortcut:</h4>
                        <p>Press <kbd>Ctrl + Shift + V</kbd> to activate voice commands</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(helpModal);
    }

    changeLanguage(language) {
        this.settings.language = language;
        if (this.recognition) {
            this.recognition.lang = language;
        }
        localStorage.setItem('voiceLanguage', language);
    }

    updateVoiceUI() {
        // Update floating button
        const voiceBtn = document.querySelector('.voice-fab');
        const quickActionBtn = document.getElementById('voice-action-btn');
        
        if (voiceBtn) {
            voiceBtn.classList.toggle('listening', this.isListening);
        }
        
        if (quickActionBtn) {
            quickActionBtn.classList.toggle('listening', this.isListening);
        }
    }

    showVoiceHelper() {
        // Create a helper tooltip showing available commands
        const helper = document.createElement('div');
        helper.id = 'voice-helper';
        helper.className = 'voice-helper';
        helper.innerHTML = `
            <div class="voice-helper-content">
                <h3>🎤 Voice Commands Available</h3>
                <div class="voice-sections">
                    <div class="voice-section">
                        <h4>Tasks</h4>
                        <ul>
                            <li>"Add task [name]" - Add a new task</li>
                            <li>"Complete task [name]" - Mark task done</li>
                            <li>"Show tasks" - View today's tasks</li>
                        </ul>
                    </div>
                    <div class="voice-section">
                        <h4>Navigation</h4>
                        <ul>
                            <li>"Go to [page]" - Navigate (dashboard, finance, habits, etc.)</li>
                            <li>"Show [section]" - Open specific section</li>
                        </ul>
                    </div>
                    <div class="voice-section">
                        <h4>Finance</h4>
                        <ul>
                            <li>"Add expense [amount]" - Log expense</li>
                            <li>"Spent [amount] on [category]" - Detailed expense</li>
                        </ul>
                    </div>
                    <div class="voice-section">
                        <h4>Health</h4>
                        <ul>
                            <li>"Log water" - Track water intake</li>
                            <li>"Add meal [food]" - Log meal</li>
                            <li>"Log mood [1-10]" - Track mood</li>
                        </ul>
                    </div>
                </div>
                <p class="voice-tip">💡 Speak clearly and wait for the beep</p>
            </div>
        `;
        helper.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            padding: 20px;
            max-width: 400px;
            z-index: 10000;
            animation: slideInUp 0.3s ease;
        `;
        
        // Remove any existing helper
        const existing = document.getElementById('voice-helper');
        if (existing) existing.remove();
        
        document.body.appendChild(helper);
        
        // Auto-hide after 8 seconds
        setTimeout(() => {
            if (helper && helper.parentNode) {
                helper.style.animation = 'slideOutDown 0.3s ease';
                setTimeout(() => helper.remove(), 300);
            }
        }, 8000);
    }

    getSuggestions(transcript) {
        const suggestions = [];
        const lowerTranscript = transcript.toLowerCase();
        
        // Check for partial matches
        if (lowerTranscript.includes('task')) {
            suggestions.push('"Add task [name]"', '"Show tasks"');
        }
        if (lowerTranscript.includes('expense') || lowerTranscript.includes('money')) {
            suggestions.push('"Add expense 50"', '"Go to finance"');
        }
        if (lowerTranscript.includes('water') || lowerTranscript.includes('drink')) {
            suggestions.push('"Log water"');
        }
        if (lowerTranscript.includes('go') || lowerTranscript.includes('show')) {
            suggestions.push('"Go to dashboard"', '"Show habits"');
        }
        
        return suggestions.slice(0, 3); // Return max 3 suggestions
    }

    showVoiceIndicator(text) {
        const indicator = document.getElementById('voice-indicator');
        const textEl = document.getElementById('voice-text');
        
        if (indicator && textEl) {
            indicator.style.display = 'block';
            textEl.textContent = text;
        }
    }

    hideVoiceIndicator() {
        const indicator = document.getElementById('voice-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `voice-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196f3'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10001;
            max-width: 300px;
            word-wrap: break-word;
            animation: slideIn 0.3s;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 4000);
    }
}

// Initialize voice commands when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.voiceCommands = new VoiceCommands();
});