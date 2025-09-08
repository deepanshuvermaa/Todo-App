// Smart Widgets - Pomodoro Timer, Daily Journal, and Mini Apps
class SmartWidgets {
    constructor() {
        this.pomodoro = null;
        this.journalEntries = [];
        this.miniApps = {};
        this.init();
    }

    init() {
        this.loadJournalEntries();
        this.createPomodoroTimer();
        this.createDailyJournal();
        this.createMiniApps();
        this.setupEventListeners();
    }

    // ================================
    // POMODORO TIMER
    // ================================
    
    createPomodoroTimer() {
        this.pomodoro = {
            duration: 25 * 60, // 25 minutes in seconds
            shortBreak: 5 * 60, // 5 minutes
            longBreak: 15 * 60, // 15 minutes
            sessions: 0,
            isActive: false,
            isBreak: false,
            timer: null,
            timeLeft: 25 * 60,
            audio: null
        };

        // Create Pomodoro UI in dashboard
        this.createPomodoroUI();
        
        // Initialize audio
        this.createPomodoroAudio();
    }

    createPomodoroUI() {
        // Don't add button to quick actions since it's already in smart-dashboard.js
        // Just create the modal
        this.createPomodoroModal();
    }

    createPomodoroModal() {
        if (document.getElementById('pomodoro-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'pomodoro-modal';
        modal.className = 'modal pomodoro-modal';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="modal-content pomodoro-content">
                <div class="modal-header">
                    <h2>🍅 Pomodoro Timer</h2>
                    <button class="modal-close" onclick="window.smartWidgets.closePomodoroModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="pomodoro-timer">
                        <div class="timer-display" id="pomodoro-display">
                            <div class="timer-circle">
                                <svg class="progress-ring" width="200" height="200">
                                    <circle class="progress-ring-circle" stroke="#e0e0e0" stroke-width="8" fill="transparent" r="90" cx="100" cy="100"></circle>
                                    <circle id="pomodoro-progress-circle" class="progress-ring-circle progress" stroke="#4caf50" stroke-width="8" fill="transparent" r="90" cx="100" cy="100"></circle>
                                </svg>
                                <div class="timer-time" id="pomodoro-time">25:00</div>
                            </div>
                        </div>
                        
                        <div class="timer-status">
                            <div class="current-phase" id="pomodoro-phase">Focus Time</div>
                            <div class="session-count">Session <span id="pomodoro-sessions">0</span>/4</div>
                        </div>
                        
                        <div class="timer-controls">
                            <button class="timer-btn play-pause" id="pomodoro-play-pause" onclick="window.smartWidgets.togglePomodoro()">
                                <span id="play-pause-icon">▶️</span>
                                <span id="play-pause-text">Start</span>
                            </button>
                            <button class="timer-btn reset" onclick="window.smartWidgets.resetPomodoro()">
                                <span>🔄</span>
                                <span>Reset</span>
                            </button>
                            <button class="timer-btn skip" onclick="window.smartWidgets.skipPomodoro()">
                                <span>⏭️</span>
                                <span>Skip</span>
                            </button>
                        </div>
                        
                        <div class="timer-settings">
                            <div class="setting-group">
                                <label for="focus-duration">Focus Duration</label>
                                <select id="focus-duration" onchange="window.smartWidgets.updatePomodoroSettings()">
                                    <option value="15">15 minutes</option>
                                    <option value="25" selected>25 minutes</option>
                                    <option value="30">30 minutes</option>
                                    <option value="45">45 minutes</option>
                                    <option value="60">60 minutes</option>
                                </select>
                            </div>
                            <div class="setting-group">
                                <label for="break-duration">Short Break</label>
                                <select id="break-duration" onchange="window.smartWidgets.updatePomodoroSettings()">
                                    <option value="5" selected>5 minutes</option>
                                    <option value="10">10 minutes</option>
                                    <option value="15">15 minutes</option>
                                </select>
                            </div>
                        </div>

                        <div class="pomodoro-stats">
                            <h4>Today's Stats</h4>
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <span class="stat-value" id="today-sessions">0</span>
                                    <span class="stat-label">Sessions</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value" id="today-minutes">0</span>
                                    <span class="stat-label">Minutes</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value" id="today-tasks">0</span>
                                    <span class="stat-label">Tasks</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    createPomodoroAudio() {
        // Create notification sound
        this.pomodoro.audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi77OScTgwOUant1qllHQU7k9fy1HkuBSV5yO/eizYIHWq+8+OWT');
        this.pomodoro.audio.volume = 0.5;
    }

    openPomodoroModal() {
        const modal = document.getElementById('pomodoro-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.updatePomodoroDisplay();
            this.updatePomodoroStats();
        }
    }

    closePomodoroModal() {
        const modal = document.getElementById('pomodoro-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    togglePomodoro() {
        if (this.pomodoro.isActive) {
            this.pausePomodoro();
        } else {
            this.startPomodoro();
        }
    }

    startPomodoro() {
        this.pomodoro.isActive = true;
        this.pomodoro.timer = setInterval(() => {
            this.pomodoro.timeLeft--;
            this.updatePomodoroDisplay();
            
            if (this.pomodoro.timeLeft <= 0) {
                this.pomodoroComplete();
            }
        }, 1000);
        
        this.updatePlayPauseButton();
        
        // Show notification
        this.showNotification(
            this.pomodoro.isBreak ? 'Break started!' : 'Focus session started!',
            'info'
        );
    }

    pausePomodoro() {
        this.pomodoro.isActive = false;
        if (this.pomodoro.timer) {
            clearInterval(this.pomodoro.timer);
        }
        this.updatePlayPauseButton();
    }

    resetPomodoro() {
        this.pausePomodoro();
        this.pomodoro.isBreak = false;
        this.pomodoro.timeLeft = this.pomodoro.duration;
        this.updatePomodoroDisplay();
        this.updatePhaseDisplay();
    }

    skipPomodoro() {
        this.pomodoroComplete();
    }

    pomodoroComplete() {
        this.pausePomodoro();
        
        if (!this.pomodoro.isBreak) {
            // Focus session completed
            this.pomodoro.sessions++;
            this.updatePomodoroStats();
            
            // Play notification sound
            this.pomodoro.audio.play().catch(() => {});
            
            // Show notification
            this.showNotification('Focus session complete! Time for a break.', 'success');
            
            // Start break
            if (this.pomodoro.sessions % 4 === 0) {
                // Long break after 4 sessions
                this.pomodoro.timeLeft = this.pomodoro.longBreak;
                this.showNotification('Long break time! You\'ve earned it.', 'success');
            } else {
                // Short break
                this.pomodoro.timeLeft = this.pomodoro.shortBreak;
            }
            this.pomodoro.isBreak = true;
        } else {
            // Break completed
            this.showNotification('Break over! Ready for another focus session?', 'info');
            this.pomodoro.timeLeft = this.pomodoro.duration;
            this.pomodoro.isBreak = false;
        }
        
        this.updatePomodoroDisplay();
        this.updatePhaseDisplay();
    }

    updatePomodoroDisplay() {
        const timeDisplay = document.getElementById('pomodoro-time');
        const progressCircle = document.getElementById('pomodoro-progress-circle');
        
        if (timeDisplay) {
            const minutes = Math.floor(this.pomodoro.timeLeft / 60);
            const seconds = this.pomodoro.timeLeft % 60;
            timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (progressCircle) {
            const totalTime = this.pomodoro.isBreak ? 
                (this.pomodoro.sessions % 4 === 0 ? this.pomodoro.longBreak : this.pomodoro.shortBreak) : 
                this.pomodoro.duration;
            
            const progress = ((totalTime - this.pomodoro.timeLeft) / totalTime) * 100;
            const circumference = 2 * Math.PI * 90;
            const offset = circumference - (progress / 100) * circumference;
            progressCircle.style.strokeDasharray = circumference;
            progressCircle.style.strokeDashoffset = offset;
            progressCircle.style.stroke = this.pomodoro.isBreak ? '#ff9800' : '#4caf50';
        }
    }

    updatePhaseDisplay() {
        const phaseEl = document.getElementById('pomodoro-phase');
        const sessionsEl = document.getElementById('pomodoro-sessions');
        
        if (phaseEl) {
            if (this.pomodoro.isBreak) {
                phaseEl.textContent = this.pomodoro.sessions % 4 === 0 ? 'Long Break' : 'Short Break';
            } else {
                phaseEl.textContent = 'Focus Time';
            }
        }
        
        if (sessionsEl) {
            sessionsEl.textContent = this.pomodoro.sessions;
        }
    }

    updatePlayPauseButton() {
        const iconEl = document.getElementById('play-pause-icon');
        const textEl = document.getElementById('play-pause-text');
        
        if (iconEl && textEl) {
            if (this.pomodoro.isActive) {
                iconEl.textContent = '⏸️';
                textEl.textContent = 'Pause';
            } else {
                iconEl.textContent = '▶️';
                textEl.textContent = 'Start';
            }
        }
    }

    updatePomodoroSettings() {
        const focusDuration = document.getElementById('focus-duration').value;
        const breakDuration = document.getElementById('break-duration').value;
        
        this.pomodoro.duration = parseInt(focusDuration) * 60;
        this.pomodoro.shortBreak = parseInt(breakDuration) * 60;
        
        if (!this.pomodoro.isActive) {
            this.resetPomodoro();
        }
    }

    updatePomodoroStats() {
        const today = new Date().toDateString();
        let stats = JSON.parse(localStorage.getItem('pomodoroStats') || '{}');
        
        if (!stats[today]) {
            stats[today] = { sessions: 0, minutes: 0, tasks: 0 };
        }
        
        stats[today].sessions = this.pomodoro.sessions;
        stats[today].minutes += Math.round(this.pomodoro.duration / 60);
        
        localStorage.setItem('pomodoroStats', JSON.stringify(stats));
        
        // Update UI
        document.getElementById('today-sessions').textContent = stats[today].sessions;
        document.getElementById('today-minutes').textContent = stats[today].minutes;
        document.getElementById('today-tasks').textContent = stats[today].tasks;
    }

    // ================================
    // DAILY JOURNAL
    // ================================
    
    createDailyJournal() {
        // Don't add button to quick actions since journal is already accessible
        // Just create the modal
        this.createJournalModal();
    }

    createJournalModal() {
        if (document.getElementById('journal-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'journal-modal';
        modal.className = 'modal journal-modal';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="modal-content journal-content">
                <div class="modal-header">
                    <h2>📓 Daily Journal</h2>
                    <button class="modal-close" onclick="window.smartWidgets.closeJournalModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="journal-container">
                        <div class="journal-date">
                            <span id="journal-date">${new Date().toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}</span>
                        </div>
                        
                        <div class="journal-prompts">
                            <h3>Daily Reflection</h3>
                            
                            <div class="prompt-section">
                                <label for="grateful-for">What are you grateful for today?</label>
                                <textarea id="grateful-for" class="journal-input" rows="2" 
                                          placeholder="Three things I'm grateful for..."></textarea>
                            </div>
                            
                            <div class="prompt-section">
                                <label for="accomplished">What did you accomplish today?</label>
                                <textarea id="accomplished" class="journal-input" rows="2" 
                                          placeholder="My achievements and completed tasks..."></textarea>
                            </div>
                            
                            <div class="prompt-section">
                                <label for="challenges">What challenges did you face?</label>
                                <textarea id="challenges" class="journal-input" rows="2" 
                                          placeholder="Difficulties and how I handled them..."></textarea>
                            </div>
                            
                            <div class="prompt-section">
                                <label for="learned">What did you learn?</label>
                                <textarea id="learned" class="journal-input" rows="2" 
                                          placeholder="New insights and lessons..."></textarea>
                            </div>
                            
                            <div class="prompt-section">
                                <label for="tomorrow-goals">Tomorrow's priorities</label>
                                <textarea id="tomorrow-goals" class="journal-input" rows="2" 
                                          placeholder="What I want to focus on tomorrow..."></textarea>
                            </div>
                            
                            <div class="prompt-section">
                                <label for="mood-rating">How do you feel? (1-10)</label>
                                <div class="mood-slider">
                                    <input type="range" id="mood-rating" min="1" max="10" value="7" 
                                           class="mood-range" oninput="window.smartWidgets.updateMoodDisplay(this.value)">
                                    <div class="mood-display">
                                        <span id="mood-emoji">😊</span>
                                        <span id="mood-value">7</span>/10
                                    </div>
                                </div>
                            </div>
                            
                            <div class="prompt-section">
                                <label for="free-write">Free thoughts</label>
                                <textarea id="free-write" class="journal-input" rows="4" 
                                          placeholder="Anything else on your mind..."></textarea>
                            </div>
                        </div>
                        
                        <div class="journal-actions">
                            <button class="btn-primary" onclick="window.smartWidgets.saveJournalEntry()">
                                💾 Save Entry
                            </button>
                            <button class="btn-secondary" onclick="window.smartWidgets.showJournalHistory()">
                                📚 View History
                            </button>
                            <button class="btn-secondary" onclick="window.smartWidgets.clearJournalEntry()">
                                🗑️ Clear
                            </button>
                        </div>
                        
                        <div class="journal-stats">
                            <div class="stat-card">
                                <span class="stat-number" id="journal-streak">0</span>
                                <span class="stat-label">Day Streak</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-number" id="journal-total">0</span>
                                <span class="stat-label">Total Entries</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    loadJournalEntries() {
        this.journalEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    }

    saveJournalEntries() {
        localStorage.setItem('journalEntries', JSON.stringify(this.journalEntries));
    }

    openJournalModal() {
        const modal = document.getElementById('journal-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.loadTodaysEntry();
            this.updateJournalStats();
        }
    }

    closeJournalModal() {
        const modal = document.getElementById('journal-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    loadTodaysEntry() {
        const today = new Date().toDateString();
        const todaysEntry = this.journalEntries.find(entry => entry.date === today);
        
        if (todaysEntry) {
            document.getElementById('grateful-for').value = todaysEntry.gratefulFor || '';
            document.getElementById('accomplished').value = todaysEntry.accomplished || '';
            document.getElementById('challenges').value = todaysEntry.challenges || '';
            document.getElementById('learned').value = todaysEntry.learned || '';
            document.getElementById('tomorrow-goals').value = todaysEntry.tomorrowGoals || '';
            document.getElementById('mood-rating').value = todaysEntry.moodRating || 7;
            document.getElementById('free-write').value = todaysEntry.freeWrite || '';
            
            this.updateMoodDisplay(todaysEntry.moodRating || 7);
        }
    }

    saveJournalEntry() {
        const today = new Date().toDateString();
        
        const entry = {
            id: Date.now(),
            date: today,
            timestamp: new Date().toISOString(),
            gratefulFor: document.getElementById('grateful-for').value,
            accomplished: document.getElementById('accomplished').value,
            challenges: document.getElementById('challenges').value,
            learned: document.getElementById('learned').value,
            tomorrowGoals: document.getElementById('tomorrow-goals').value,
            moodRating: parseInt(document.getElementById('mood-rating').value),
            freeWrite: document.getElementById('free-write').value
        };
        
        // Remove existing entry for today if any
        this.journalEntries = this.journalEntries.filter(e => e.date !== today);
        
        // Add new entry
        this.journalEntries.push(entry);
        this.saveJournalEntries();
        
        // Update streak
        if (window.streakManager) {
            window.streakManager.updateStreak('journaling');
        }
        
        this.showNotification('Journal entry saved! 📝', 'success');
        this.updateJournalStats();
    }

    clearJournalEntry() {
        if (confirm('Clear all fields?')) {
            document.querySelectorAll('.journal-input').forEach(input => {
                input.value = '';
            });
            document.getElementById('mood-rating').value = 7;
            this.updateMoodDisplay(7);
        }
    }

    updateMoodDisplay(value) {
        const moodEmojis = ['😢', '😔', '😕', '😐', '🙂', '😊', '😄', '😁', '🤩', '🥳'];
        const emoji = moodEmojis[Math.max(0, Math.min(value - 1, 9))];
        
        document.getElementById('mood-emoji').textContent = emoji;
        document.getElementById('mood-value').textContent = value;
    }

    updateJournalStats() {
        const streak = this.calculateJournalStreak();
        const total = this.journalEntries.length;
        
        document.getElementById('journal-streak').textContent = streak;
        document.getElementById('journal-total').textContent = total;
    }

    calculateJournalStreak() {
        const today = new Date();
        let streak = 0;
        let currentDate = new Date(today);
        
        while (true) {
            const dateStr = currentDate.toDateString();
            const hasEntry = this.journalEntries.some(entry => entry.date === dateStr);
            
            if (hasEntry) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
            
            if (streak > 365) break; // Prevent infinite loop
        }
        
        return streak;
    }

    showJournalHistory() {
        // Create history modal
        const historyModal = document.createElement('div');
        historyModal.className = 'modal journal-history-modal';
        historyModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>📚 Journal History</h2>
                    <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="journal-entries">
                        ${this.journalEntries
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .slice(0, 10)
                            .map(entry => `
                                <div class="journal-history-entry">
                                    <div class="entry-date">${new Date(entry.date).toLocaleDateString()}</div>
                                    <div class="entry-mood">${this.getMoodEmoji(entry.moodRating)} ${entry.moodRating}/10</div>
                                    <div class="entry-preview">
                                        ${entry.accomplished ? `<p><strong>Accomplished:</strong> ${entry.accomplished.substring(0, 100)}...</p>` : ''}
                                        ${entry.gratefulFor ? `<p><strong>Grateful:</strong> ${entry.gratefulFor.substring(0, 100)}...</p>` : ''}
                                    </div>
                                </div>
                            `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(historyModal);
        historyModal.style.display = 'flex';
    }

    getMoodEmoji(rating) {
        const moodEmojis = ['😢', '😔', '😕', '😐', '🙂', '😊', '😄', '😁', '🤩', '🥳'];
        return moodEmojis[Math.max(0, Math.min(rating - 1, 9))];
    }

    // ================================
    // MINI APPS
    // ================================
    
    createMiniApps() {
        // BMI Calculator
        this.createBMICalculator();
        
        // Quick Calculator
        this.createQuickCalculator();
        
        // Password Generator
        this.createPasswordGenerator();
    }

    createBMICalculator() {
        // This would be integrated into the health section
        this.miniApps.bmi = {
            calculate: (height, weight) => {
                const heightM = height / 100;
                const bmi = weight / (heightM * heightM);
                let category = '';
                
                if (bmi < 18.5) category = 'Underweight';
                else if (bmi < 25) category = 'Normal';
                else if (bmi < 30) category = 'Overweight';
                else category = 'Obese';
                
                return { bmi: bmi.toFixed(1), category };
            }
        };
    }

    createQuickCalculator() {
        // Simple calculator for quick calculations
        this.miniApps.calculator = {
            display: '0',
            calculate: (expression) => {
                try {
                    return eval(expression).toString();
                } catch {
                    return 'Error';
                }
            }
        };
    }

    createPasswordGenerator() {
        this.miniApps.passwordGenerator = {
            generate: (length = 12, includeSymbols = true) => {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
                const allChars = includeSymbols ? chars + symbols : chars;
                
                let password = '';
                for (let i = 0; i < length; i++) {
                    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
                }
                
                return password;
            }
        };
    }

    // ================================
    // UTILITY METHODS
    // ================================
    
    setupEventListeners() {
        // Handle escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    closeAllModals() {
        const modals = ['pomodoro-modal', 'journal-modal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal && modal.style.display === 'flex') {
                modal.style.display = 'none';
            }
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `widget-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

// Initialize Smart Widgets when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.smartWidgets = new SmartWidgets();
    
    // Make pomodoro globally accessible for voice commands
    window.pomodoroTimer = {
        start: () => window.smartWidgets.startPomodoro(),
        pause: () => window.smartWidgets.pausePomodoro(),
        reset: () => window.smartWidgets.resetPomodoro()
    };
});