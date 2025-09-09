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

            // Enhanced Navigation
            {
                patterns: [
                    /(go to|show|open|navigate to) dashboard/i,
                    /show dashboard/i,
                    /home/i,
                    /main screen/i
                ],
                action: () => this.navigateTo('dashboard'),
                description: 'Go to dashboard'
            },
            {
                patterns: [
                    /(go to|show|open|navigate to) tasks?/i,
                    /(go to|show|open|navigate to) today/i,
                    /task (view|screen|page)/i
                ],
                action: () => this.navigateTo('today'),
                description: 'Go to tasks'
            },
            {
                patterns: [
                    /(go to|show|open|navigate to) expenses?/i,
                    /(go to|show|open|navigate to) budget/i,
                    /(go to|show|open|navigate to) finance/i,
                    /expense (view|screen|page)/i,
                    /money/i
                ],
                action: () => this.navigateTo('expenses'),
                description: 'Go to expenses'
            },
            {
                patterns: [
                    /(go to|show|open|navigate to) meals?/i,
                    /(go to|show|open|navigate to) food/i,
                    /(go to|show|open|navigate to) nutrition/i,
                    /meal (view|screen|page)/i,
                    /(go to|show|open|navigate to) diet/i
                ],
                action: () => this.navigateTo('meals'),
                description: 'Go to meals'
            },
            {
                patterns: [
                    /(go to|show|open|navigate to) habits?/i,
                    /habit (view|screen|page)/i,
                    /(go to|show|open|navigate to) streaks?/i
                ],
                action: () => this.navigateTo('habits'),
                description: 'Go to habits'
            },
            {
                patterns: [
                    /(go to|show|open|navigate to) notes?/i,
                    /note (view|screen|page)/i,
                    /(go to|show|open|navigate to) notebook/i,
                    /writing/i
                ],
                action: () => this.navigateTo('notes'),
                description: 'Go to notes'
            },
            {
                patterns: [
                    /(go to|show|open|navigate to) settings?/i,
                    /setting (view|screen|page)/i,
                    /preferences/i,
                    /configuration/i
                ],
                action: () => this.navigateTo('settings'),
                description: 'Go to settings'
            },
            {
                patterns: [
                    /(go to|show|open|navigate to) history/i,
                    /past (tasks|data)/i,
                    /previous/i
                ],
                action: () => this.navigateTo('history'),
                description: 'Go to history'
            },

            // Enhanced Quick Actions
            {
                patterns: [
                    /(start|begin) pomodoro/i,
                    /focus (time|timer)/i,
                    /study (time|mode)/i
                ],
                action: () => this.startPomodoro(),
                description: 'Start pomodoro timer'
            },
            {
                patterns: [
                    /(set|create) reminder (.+)/i,
                    /remind me (.+)/i,
                    /reminder (.+)/i
                ],
                action: (match) => this.setReminder(match[2] || match[1]),
                description: 'Set a reminder'
            },
            {
                patterns: [
                    /(what's |what is )(the |my )?time/i,
                    /(what's |what is )(today's |the )?date/i,
                    /current time/i,
                    /tell me the time/i
                ],
                action: () => this.tellTime(),
                description: 'Tell current time and date'
            },
            {
                patterns: [
                    /how many tasks (do i have|left|remaining)/i,
                    /(show|tell me) task (summary|count)/i,
                    /task status/i
                ],
                action: () => this.showTaskSummary(),
                description: 'Show task summary'
            },
            {
                patterns: [
                    /(show|tell me) (my )?expense (summary|total)/i,
                    /how much (did i spend|have i spent)/i,
                    /expense report/i
                ],
                action: () => this.showExpenseSummary(),
                description: 'Show expense summary'
            },
            {
                patterns: [
                    /(show|create|open) new note/i,
                    /new note/i,
                    /(start|begin) writing/i
                ],
                action: () => this.createNewNote(),
                description: 'Create a new note'
            },
            {
                patterns: [
                    /(search|find) notes? (.+)/i,
                    /find note (.+)/i
                ],
                action: (match) => this.searchNotes(match[2] || match[1]),
                description: 'Search notes'
            },
            {
                patterns: [
                    /(clear|delete) all (completed|done) tasks/i,
                    /clean up tasks/i
                ],
                action: () => this.clearCompletedTasks(),
                description: 'Clear completed tasks'
            },
            {
                patterns: [
                    /(show|display) (today's |todays )?progress/i,
                    /how am i doing/i,
                    /(my )?daily summary/i
                ],
                action: () => this.showDailySummary(),
                description: 'Show daily progress summary'
            },
            {
                patterns: [
                    /(sync|backup|save) data/i,
                    /sync to (cloud|sheets)/i
                ],
                action: () => this.forceSyncAllData(),
                description: 'Sync all data to cloud'
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

        // Remove any existing floating button first
        const existingBtn = document.getElementById('floating-voice-btn');
        if (existingBtn) {
            existingBtn.remove();
        }

        // Add persistent floating voice button
        const floatingBtn = document.createElement('div');
        floatingBtn.id = 'floating-voice-btn';
        floatingBtn.className = 'floating-voice-btn';
        floatingBtn.innerHTML = `
            <button class="voice-fab" id="voice-fab-btn" aria-label="Voice Commands">
                <span class="voice-icon" id="voice-icon">🎤</span>
                <span class="voice-pulse"></span>
            </button>
            <div class="voice-tooltip">Click to speak</div>
            <div class="voice-listening-indicator" id="voice-listening-indicator" style="display: none;">
                <div class="voice-wave-container">
                    <div class="voice-wave"></div>
                    <div class="voice-wave"></div>
                    <div class="voice-wave"></div>
                </div>
                <div class="voice-text" id="voice-text">Listening...</div>
            </div>
        `;
        
        // Add styles for the floating button
        floatingBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
        `;
        
        document.body.appendChild(floatingBtn);
        
        // Add click handler
        const fabBtn = document.getElementById('voice-fab-btn');
        fabBtn.addEventListener('click', () => this.toggleListening());

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

        // Enhanced smart parsing with prefixes
        const lowerTranscript = transcript.toLowerCase().trim();
        
        // Check for direct prefixes first
        if (lowerTranscript.startsWith('task:') || lowerTranscript.startsWith('task ')) {
            const taskText = transcript.substring(5).trim();
            if (taskText) {
                this.addTask(taskText);
                this.speakFeedback(`Task added: ${taskText}`);
                return;
            }
        }
        
        if (lowerTranscript.startsWith('expense:') || lowerTranscript.startsWith('expense ')) {
            const expenseText = transcript.substring(8).trim();
            this.parseAndAddExpense(expenseText);
            return;
        }
        
        if (lowerTranscript.startsWith('meal:') || lowerTranscript.startsWith('meal ')) {
            const mealText = transcript.substring(5).trim();
            this.parseAndAddMeal(mealText);
            return;
        }
        
        if (lowerTranscript.startsWith('note:') || lowerTranscript.startsWith('note ')) {
            const noteText = transcript.substring(5).trim();
            this.addNote(noteText);
            return;
        }
        
        if (lowerTranscript.startsWith('water:') || lowerTranscript.includes('glass') && lowerTranscript.includes('water')) {
            this.parseAndLogWater(lowerTranscript);
            return;
        }

        // Try to match existing command patterns
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
            // Smart context detection if no prefix
            this.smartParse(transcript);
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
            window.todoApp.switchTab(tab);
            this.showNotification(`Navigated to ${tab.charAt(0).toUpperCase() + tab.slice(1)}`, 'success');
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
        // Remove any existing modal
        const existingModal = document.querySelector('.voice-help-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const helpModal = document.createElement('div');
        helpModal.className = 'modal voice-help-modal';
        helpModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        helpModal.innerHTML = `
            <div class="modal-content" style="
                background: white;
                border-radius: 12px;
                padding: 20px;
                max-width: 700px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            ">
                <div class="modal-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #f0f0f0;
                    padding-bottom: 15px;
                ">
                    <h2 style="margin: 0; color: #333;">🎤 Voice Commands</h2>
                    <button class="modal-close" onclick="this.closest('.voice-help-modal').remove()" style="
                        background: none;
                        border: none;
                        font-size: 28px;
                        cursor: pointer;
                        color: #666;
                    ">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 15px;
                        border-radius: 8px;
                        margin-bottom: 20px;
                    ">
                        <h4 style="margin: 0 0 10px 0;">🚀 NEW! Smart Prefixes</h4>
                        <p style="margin: 5px 0; opacity: 0.95;">Start your command with these prefixes for direct actions:</p>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px;">
                            <div><strong>task:</strong> "task: buy groceries"</div>
                            <div><strong>expense:</strong> "expense: lunch 150"</div>
                            <div><strong>meal:</strong> "meal: 2 chapati for lunch"</div>
                            <div><strong>note:</strong> "note: call mom tomorrow"</div>
                            <div><strong>water:</strong> "water: 2 glasses"</div>
                        </div>
                    </div>
                    
                    <h3 style="margin: 15px 0 10px 0; color: #333;">Available Commands:</h3>
                    <div class="command-categories" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 15px;
                    ">
                        <div class="command-category" style="
                            background: #f9f9f9;
                            padding: 15px;
                            border-radius: 8px;
                            border-left: 4px solid #007bff;
                        ">
                            <h4 style="margin: 0 0 10px 0; color: #333;">📝 Tasks</h4>
                            <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; list-style: none;">
                                <li>✓ "Add task buy groceries"</li>
                                <li>✓ "task: complete homework"</li>
                                <li>✓ "Remind me to call John"</li>
                                <li>✓ "Show my tasks"</li>
                            </ul>
                        </div>
                        
                        <div class="command-category" style="
                            background: #f9f9f9;
                            padding: 15px;
                            border-radius: 8px;
                            border-left: 4px solid #28a745;
                        ">
                            <h4 style="margin: 0 0 10px 0; color: #333;">💰 Expenses</h4>
                            <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; list-style: none;">
                                <li>✓ "expense: grocery 500"</li>
                                <li>✓ "Spent 150 on lunch"</li>
                                <li>✓ "Bought coffee for 50"</li>
                                <li>✓ "Show my expenses"</li>
                            </ul>
                        </div>
                        
                        <div class="command-category" style="
                            background: #f9f9f9;
                            padding: 15px;
                            border-radius: 8px;
                            border-left: 4px solid #ffc107;
                        ">
                            <h4 style="margin: 0 0 10px 0; color: #333;">🍽️ Meals</h4>
                            <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; list-style: none;">
                                <li>✓ "meal: 2 eggs for breakfast"</li>
                                <li>✓ "Ate chicken curry"</li>
                                <li>✓ "water: 3 glasses"</li>
                                <li>✓ "Had 2 chapati and dal"</li>
                            </ul>
                        </div>
                        
                        <div class="command-category" style="
                            background: #f9f9f9;
                            padding: 15px;
                            border-radius: 8px;
                            border-left: 4px solid #dc3545;
                        ">
                            <h4 style="margin: 0 0 10px 0; color: #333;">📝 Notes</h4>
                            <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; list-style: none;">
                                <li>✓ "note: meeting at 3pm"</li>
                                <li>✓ "note: buy milk tomorrow"</li>
                                <li>✓ "Remember to pay bills"</li>
                            </ul>
                        </div>
                        
                        <div class="command-category" style="
                            background: #f9f9f9;
                            padding: 15px;
                            border-radius: 8px;
                            border-left: 4px solid #6c757d;
                        ">
                            <h4 style="margin: 0 0 10px 0; color: #333;">🧭 Navigation</h4>
                            <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; list-style: none;">
                                <li>✓ "Go to dashboard"</li>
                                <li>✓ "Show expenses"</li>
                                <li>✓ "Open habits"</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div style="
                        background: #f0f8ff;
                        padding: 15px;
                        border-radius: 8px;
                        margin-top: 20px;
                    ">
                        <h4 style="margin: 0 0 10px 0; color: #007bff;">⌨️ Keyboard Shortcut</h4>
                        <p style="margin: 0; color: #555;">Press <kbd style="
                            background: #fff;
                            border: 1px solid #ccc;
                            border-radius: 3px;
                            padding: 2px 6px;
                            font-family: monospace;
                        ">Ctrl + Shift + V</kbd> to activate voice commands</p>
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
        const voiceBtn = document.getElementById('voice-fab-btn');
        const voiceIcon = document.getElementById('voice-icon');
        const listeningIndicator = document.getElementById('voice-listening-indicator');
        const tooltip = document.querySelector('.voice-tooltip');
        
        if (voiceBtn && voiceIcon) {
            if (this.isListening) {
                voiceBtn.classList.add('listening');
                voiceIcon.textContent = '🔴';
                if (listeningIndicator) {
                    listeningIndicator.style.display = 'block';
                }
                if (tooltip) {
                    tooltip.style.display = 'none';
                }
            } else {
                voiceBtn.classList.remove('listening');
                voiceIcon.textContent = '🎤';
                if (listeningIndicator) {
                    listeningIndicator.style.display = 'none';
                }
                if (tooltip) {
                    tooltip.style.display = 'block';
                }
            }
        }
        
        // Also update any quick action buttons
        const quickActionBtn = document.getElementById('voice-action-btn');
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
        const indicator = document.getElementById('voice-listening-indicator');
        const textEl = document.getElementById('voice-text');
        
        if (indicator && textEl) {
            indicator.style.display = 'block';
            textEl.textContent = text;
        }
    }

    hideVoiceIndicator() {
        const indicator = document.getElementById('voice-listening-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `voice-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">${message}</div>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196f3'};
            color: white;
            padding: 15px 40px 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10001;
            max-width: 300px;
            word-wrap: break-word;
            animation: slideIn 0.3s;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: space-between;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 6000);
    }
    
    // New smart parsing methods
    smartParse(transcript) {
        const lower = transcript.toLowerCase();
        
        // Detect expense patterns
        const expensePatterns = [
            /spent (\d+) (?:rupees?|rs?\.?|₹)?\s*(?:on|for)?\s*(.+)/i,
            /(\d+) (?:rupees?|rs?\.?|₹)?\s*(?:on|for)\s*(.+)/i,
            /bought (.+) for (\d+)/i
        ];
        
        for (const pattern of expensePatterns) {
            const match = transcript.match(pattern);
            if (match) {
                const amount = match[1] || match[2];
                const description = match[2] || match[1];
                this.parseAndAddExpense(`${description} ${amount}`);
                return;
            }
        }
        
        // Detect meal patterns
        const mealKeywords = ['ate', 'had', 'breakfast', 'lunch', 'dinner', 'snack', 'food'];
        if (mealKeywords.some(keyword => lower.includes(keyword))) {
            this.parseAndAddMeal(transcript);
            return;
        }
        
        // Detect action words for tasks
        const taskKeywords = ['remind', 'need to', 'have to', 'must', 'should', 'will', 'going to'];
        if (taskKeywords.some(keyword => lower.includes(keyword))) {
            const taskText = transcript.replace(/remind me to |i need to |i have to |i must |i should |i will |i'm going to /gi, '');
            this.addTask(taskText);
            this.speakFeedback(`Task added: ${taskText}`);
            return;
        }
        
        // Default to adding as a task
        this.addTask(transcript);
        this.speakFeedback(`Task added: ${transcript}`);
    }
    
    parseAndAddExpense(text) {
        // Parse amount and description from text
        const amountMatch = text.match(/(\d+(?:\.\d+)?)/); 
        const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
        
        // Remove amount from description
        let description = text.replace(/(\d+(?:\.\d+)?)/g, '').trim();
        description = description.replace(/^(on|for)\s+/i, '');
        
        // Detect category from description
        let category = 'other';
        const categoryKeywords = {
            'food': ['food', 'lunch', 'dinner', 'breakfast', 'snack', 'restaurant', 'cafe'],
            'transport': ['taxi', 'uber', 'ola', 'bus', 'metro', 'fuel', 'petrol', 'diesel'],
            'shopping': ['shopping', 'clothes', 'shoes', 'amazon', 'flipkart'],
            'entertainment': ['movie', 'netflix', 'spotify', 'game'],
            'health': ['medicine', 'doctor', 'hospital', 'pharmacy', 'gym']
        };
        
        for (const [cat, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some(keyword => description.toLowerCase().includes(keyword))) {
                category = cat;
                break;
            }
        }
        
        if (amount > 0 && window.expenseManager) {
            // Add the expense directly
            const expense = {
                id: Date.now(),
                amount: amount,
                category: category,
                description: description || 'Voice expense',
                date: new Date().toISOString().split('T')[0],
                timestamp: Date.now()
            };
            
            window.expenseManager.expenses.push(expense);
            window.expenseManager.saveExpenses();
            window.expenseManager.renderExpenses();
            window.expenseManager.updateAnalytics();
            
            this.showNotification(`💰 Expense added: ₹${amount} for ${description || category}`, 'success');
            this.speakFeedback(`Added expense of ${amount} rupees for ${description || category}`);
        } else {
            this.showNotification('Could not parse expense amount', 'error');
        }
    }
    
    parseAndAddMeal(text) {
        if (!window.mealTracker) return;
        
        // Detect meal type
        let mealType = 'snack';
        if (text.toLowerCase().includes('breakfast')) mealType = 'breakfast';
        else if (text.toLowerCase().includes('lunch')) mealType = 'lunch';
        else if (text.toLowerCase().includes('dinner')) mealType = 'dinner';
        
        // Clean up the food item text
        let foodItem = text.replace(/for (breakfast|lunch|dinner|snack)/gi, '').trim();
        foodItem = foodItem.replace(/^(ate|had|consumed)\s+/gi, '');
        
        if (foodItem) {
            // Try to detect quantity
            const quantityMatch = foodItem.match(/(\d+)\s*(pieces?|plates?|bowls?|cups?|glasses?)?/i);
            const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
            
            // Clean food item
            foodItem = foodItem.replace(/(\d+)\s*(pieces?|plates?|bowls?|cups?|glasses?)?/gi, '').trim();
            
            // Create meal object
            const meal = {
                id: `meal_${Date.now()}`,
                mealType: mealType,
                foodItem: foodItem,
                quantity: quantity,
                unit: 'serving',
                calories: 200, // Default estimate
                date: new Date().toISOString().split('T')[0],
                nutrition: {
                    calories: 200,
                    protein: 10,
                    carbs: 20,
                    fats: 5,
                    fiber: 2
                }
            };
            
            window.mealTracker.meals.push(meal);
            window.mealTracker.saveMeals();
            window.mealTracker.displayMeal(meal);
            window.mealTracker.updateNutritionSummary();
            
            this.showNotification(`🍽️ Meal logged: ${foodItem} for ${mealType}`, 'success');
            this.speakFeedback(`Logged ${foodItem} for ${mealType}`);
        }
    }
    
    parseAndLogWater(text) {
        if (!window.mealTracker) return;
        
        // Extract number of glasses
        const numberMatch = text.match(/(\d+)\s*(glasses?|glass)/i);
        const glasses = numberMatch ? parseInt(numberMatch[1]) : 1;
        
        // Add water intake (250ml per glass)
        window.mealTracker.waterIntake += glasses;
        window.mealTracker.updateWaterIntake();
        
        this.showNotification(`💧 Logged ${glasses} glass${glasses > 1 ? 'es' : ''} of water`, 'success');
        this.speakFeedback(`Logged ${glasses} glass${glasses > 1 ? 'es' : ''} of water`);
    }
    
    addNote(text) {
        // Store note in localStorage
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        const note = {
            id: `note_${Date.now()}`,
            content: text,
            date: new Date().toISOString(),
            category: 'voice'
        };
        notes.push(note);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        this.showNotification(`📝 Note saved: "${text}"`, 'success');
        this.speakFeedback(`Note saved: ${text}`);
    }
    
    speakFeedback(message) {
        // Use text-to-speech for feedback
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 0.8;
            speechSynthesis.speak(utterance);
        }
    }
    
    // New enhanced voice command methods
    showTaskSummary() {
        if (!window.todoApp) return;
        
        const tasks = window.todoApp.tasks || [];
        const todayTasks = tasks.filter(task => 
            task.date === new Date().toISOString().split('T')[0]
        );
        const completed = todayTasks.filter(t => t.completed).length;
        const total = todayTasks.length;
        const pending = total - completed;
        
        const message = `You have ${total} tasks today. ${completed} completed, ${pending} remaining.`;
        this.showNotification(message, 'info');
        this.speakFeedback(message);
    }
    
    showExpenseSummary() {
        if (!window.expenseManager) return;
        
        const today = new Date().toISOString().split('T')[0];
        const todayExpenses = window.expenseManager.expenses.filter(e => e.date === today);
        const total = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
        
        const message = `Today's expenses: ₹${total.toFixed(2)} across ${todayExpenses.length} transactions.`;
        this.showNotification(message, 'info');
        this.speakFeedback(message);
    }
    
    createNewNote() {
        this.navigateTo('notes');
        setTimeout(() => {
            const newNoteBtn = document.getElementById('new-note-btn');
            if (newNoteBtn) {
                newNoteBtn.click();
                this.showNotification('Created new note', 'success');
                this.speakFeedback('New note created. Start writing.');
            }
        }, 500);
    }
    
    searchNotes(query) {
        this.navigateTo('notes');
        setTimeout(() => {
            const searchInput = document.getElementById('notes-search-input');
            if (searchInput) {
                searchInput.value = query;
                searchInput.dispatchEvent(new Event('input'));
                this.showNotification(`Searching for: "${query}"`, 'info');
                this.speakFeedback(`Searching notes for ${query}`);
            }
        }, 500);
    }
    
    clearCompletedTasks() {
        if (!window.todoApp) return;
        
        const initialCount = window.todoApp.tasks.length;
        window.todoApp.tasks = window.todoApp.tasks.filter(task => !task.completed);
        window.todoApp.saveTasks();
        window.todoApp.renderTasks();
        
        const removedCount = initialCount - window.todoApp.tasks.length;
        if (removedCount > 0) {
            const message = `Cleared ${removedCount} completed tasks.`;
            this.showNotification(message, 'success');
            this.speakFeedback(message);
        } else {
            this.showNotification('No completed tasks to clear.', 'info');
            this.speakFeedback('No completed tasks found');
        }
    }
    
    showDailySummary() {
        if (!window.todoApp) return;
        
        // Calculate daily progress
        const tasks = window.todoApp.tasks || [];
        const todayTasks = tasks.filter(task => 
            task.date === new Date().toISOString().split('T')[0]
        );
        const completed = todayTasks.filter(t => t.completed).length;
        const total = todayTasks.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        // Get expense info
        let expenseInfo = '';
        if (window.expenseManager) {
            const today = new Date().toISOString().split('T')[0];
            const todayExpenses = window.expenseManager.expenses.filter(e => e.date === today);
            const totalSpent = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
            expenseInfo = ` Spent ₹${totalSpent.toFixed(2)} today.`;
        }
        
        const message = `Daily Progress: ${percentage}% complete. ${completed} of ${total} tasks done.${expenseInfo}`;
        this.showNotification(message, 'info');
        this.speakFeedback(message);
    }
    
    forceSyncAllData() {
        if (window.todoApp && window.todoApp.forceSyncAllData) {
            window.todoApp.forceSyncAllData();
            this.speakFeedback('Syncing all data to cloud');
        } else {
            this.showNotification('Sync not available - check settings', 'warning');
        }
    }
}

// Initialize voice commands when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.voiceCommands = new VoiceCommands();
});