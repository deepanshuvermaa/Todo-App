// Habit Tracker Module - Track daily habits with chains and analytics
class HabitTracker {
    constructor() {
        this.habits = [];
        this.habitHistory = {};
        this.selectedDate = new Date();
        this.viewMode = 'today'; // 'today', 'week', 'month'
        this.categories = [
            { id: 'health', name: 'Health', icon: '💪', color: '#4caf50' },
            { id: 'productivity', name: 'Productivity', icon: '⚡', color: '#2196f3' },
            { id: 'learning', name: 'Learning', icon: '📚', color: '#9c27b0' },
            { id: 'mindfulness', name: 'Mindfulness', icon: '🧘', color: '#ff9800' },
            { id: 'social', name: 'Social', icon: '👥', color: '#e91e63' },
            { id: 'creativity', name: 'Creativity', icon: '🎨', color: '#795548' },
            { id: 'finance', name: 'Finance', icon: '💰', color: '#607d8b' }
        ];
        this.popularHabits = {
            health: [
                'Drink 8 glasses of water',
                'Exercise for 30 minutes',
                'Take 10,000 steps',
                'Sleep 8 hours',
                'Stretch for 10 minutes',
                'Meditate for 10 minutes',
                'Eat 5 servings of fruits/vegetables'
            ],
            productivity: [
                'Wake up at 6 AM',
                'Plan tomorrow before bed',
                'No phone for first hour',
                'Review daily goals',
                'Clean workspace',
                'Single-task (no multitasking)',
                'Take breaks every 2 hours'
            ],
            learning: [
                'Read for 30 minutes',
                'Practice a new language',
                'Watch educational video',
                'Write in journal',
                'Listen to podcast',
                'Practice coding',
                'Learn something new'
            ],
            mindfulness: [
                'Practice gratitude',
                'Do breathing exercises',
                'Spend time in nature',
                'Practice mindfulness',
                'No social media before noon',
                'Compliment someone',
                'Practice self-compassion'
            ],
            social: [
                'Call family member',
                'Text a friend',
                'Help someone',
                'Practice active listening',
                'Express appreciation',
                'Spend quality time with loved ones',
                'Make new connections'
            ],
            creativity: [
                'Draw or sketch',
                'Write creatively',
                'Play music',
                'Take photos',
                'Try new recipe',
                'Brainstorm ideas',
                'Work on hobby'
            ],
            finance: [
                'Track expenses',
                'Save money',
                'Review budget',
                'Avoid impulse purchases',
                'Research investments',
                'Plan financial goals',
                'Check account balances'
            ]
        };
        this.init();
    }

    init() {
        this.loadHabits();
        this.createHabitUI();
        this.updateUI();
        this.setupEventListeners();
    }

    createHabitUI() {
        // Add Habits tab to navigation
        const nav = document.querySelector('.nav-tabs');
        if (nav && !document.querySelector('[data-tab="habits"]')) {
            const habitsTab = document.createElement('button');
            habitsTab.className = 'nav-tab';
            habitsTab.setAttribute('data-tab', 'habits');
            habitsTab.textContent = 'HABITS';
            
            // Insert after TODAY tab
            const todayTab = nav.querySelector('[data-tab="today"]');
            todayTab.after(habitsTab);
        }

        // Create habits view
        const mainContent = document.querySelector('.main-content');
        let habitsView = document.getElementById('habits-view');
        
        if (!habitsView) {
            habitsView = document.createElement('div');
            habitsView.id = 'habits-view';
            habitsView.className = 'view';
            habitsView.innerHTML = `
                <div class="habits-container">
                    <!-- Header -->
                    <div class="habits-header">
                        <h2 class="section-title">HABIT TRACKER</h2>
                        <div class="habits-controls">
                            <div class="view-mode-selector">
                                <button class="view-mode-btn active" data-mode="today">Today</button>
                                <button class="view-mode-btn" data-mode="week">Week</button>
                                <button class="view-mode-btn" data-mode="month">Month</button>
                            </div>
                            <button class="btn-primary" onclick="window.habitTracker.openHabitModal()">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Add Habit
                            </button>
                        </div>
                    </div>

                    <!-- Date Navigator -->
                    <div class="date-navigator">
                        <button class="date-nav-btn" onclick="window.habitTracker.changeDate(-1)">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M15 18l-6-6 6-6"/>
                            </svg>
                        </button>
                        <div class="current-date" id="habits-current-date">
                            ${this.formatDate(this.selectedDate)}
                        </div>
                        <button class="date-nav-btn" onclick="window.habitTracker.changeDate(1)">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 18l6-6-6-6"/>
                            </svg>
                        </button>
                        <button class="btn-secondary today-btn" onclick="window.habitTracker.goToToday()">
                            Today
                        </button>
                    </div>

                    <!-- Habits Grid -->
                    <div class="habits-content">
                        <div class="habits-list" id="habits-list">
                            <!-- Habits will be populated here -->
                        </div>

                        <!-- Empty State -->
                        <div class="habits-empty" id="habits-empty" style="display: none;">
                            <div class="empty-state">
                                <div class="empty-icon">📈</div>
                                <h3>No habits yet</h3>
                                <p>Start building better habits today!</p>
                                <button class="btn-primary" onclick="window.habitTracker.openHabitModal()">
                                    Create Your First Habit
                                </button>
                            </div>
                        </div>

                        <!-- Analytics Panel -->
                        <div class="habits-analytics" id="habits-analytics">
                            <div class="analytics-card">
                                <h3>Today's Progress</h3>
                                <div class="progress-overview">
                                    <div class="progress-circle">
                                        <svg class="progress-ring" width="100" height="100">
                                            <circle class="progress-ring-circle" stroke="#e0e0e0" stroke-width="6" fill="transparent" r="42" cx="50" cy="50"></circle>
                                            <circle id="habits-progress-circle" class="progress-ring-circle progress" stroke="#4caf50" stroke-width="6" fill="transparent" r="42" cx="50" cy="50" style="stroke-dasharray: 263.89; stroke-dashoffset: 263.89;"></circle>
                                        </svg>
                                        <div class="progress-text">
                                            <span class="progress-percentage" id="habits-completion">0%</span>
                                            <span class="progress-label">Complete</span>
                                        </div>
                                    </div>
                                    <div class="progress-stats">
                                        <div class="stat">
                                            <span class="stat-value" id="completed-habits">0</span>
                                            <span class="stat-label">Completed</span>
                                        </div>
                                        <div class="stat">
                                            <span class="stat-value" id="total-habits">0</span>
                                            <span class="stat-label">Total</span>
                                        </div>
                                        <div class="stat">
                                            <span class="stat-value" id="current-streak">0</span>
                                            <span class="stat-label">Best Streak</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Category Breakdown -->
                            <div class="analytics-card">
                                <h3>By Category</h3>
                                <div class="category-stats" id="category-stats">
                                    <!-- Will be populated dynamically -->
                                </div>
                            </div>

                            <!-- Streak Leaders -->
                            <div class="analytics-card">
                                <h3>Streak Leaders</h3>
                                <div class="streak-leaders" id="streak-leaders">
                                    <!-- Will be populated dynamically -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Add/Edit Habit Modal -->
                <div id="habit-modal" class="modal" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2 id="habit-modal-title">Add New Habit</h2>
                            <button class="modal-close" onclick="window.habitTracker.closeHabitModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <form id="habit-form">
                                <div class="form-group">
                                    <label for="habit-name">Habit Name *</label>
                                    <input type="text" id="habit-name" class="form-input" required 
                                           placeholder="e.g., Drink 8 glasses of water">
                                </div>

                                <div class="form-group">
                                    <label for="habit-category">Category</label>
                                    <select id="habit-category" class="form-input">
                                        ${this.categories.map(cat => `
                                            <option value="${cat.id}">${cat.icon} ${cat.name}</option>
                                        `).join('')}
                                    </select>
                                </div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="habit-frequency">Frequency</label>
                                        <select id="habit-frequency" class="form-input">
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="weekdays">Weekdays Only</option>
                                            <option value="weekends">Weekends Only</option>
                                            <option value="custom">Custom Days</option>
                                        </select>
                                    </div>

                                    <div class="form-group">
                                        <label for="habit-target">Target</label>
                                        <div class="target-input-group">
                                            <input type="number" id="habit-target" class="form-input" min="1" value="1">
                                            <select id="habit-unit" class="form-input">
                                                <option value="times">times</option>
                                                <option value="minutes">minutes</option>
                                                <option value="hours">hours</option>
                                                <option value="pages">pages</option>
                                                <option value="glasses">glasses</option>
                                                <option value="steps">steps</option>
                                                <option value="km">km</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-group" id="custom-days-group" style="display: none;">
                                    <label>Select Days</label>
                                    <div class="days-selector">
                                        <label class="day-checkbox">
                                            <input type="checkbox" value="0"> Sun
                                        </label>
                                        <label class="day-checkbox">
                                            <input type="checkbox" value="1"> Mon
                                        </label>
                                        <label class="day-checkbox">
                                            <input type="checkbox" value="2"> Tue
                                        </label>
                                        <label class="day-checkbox">
                                            <input type="checkbox" value="3"> Wed
                                        </label>
                                        <label class="day-checkbox">
                                            <input type="checkbox" value="4"> Thu
                                        </label>
                                        <label class="day-checkbox">
                                            <input type="checkbox" value="5"> Fri
                                        </label>
                                        <label class="day-checkbox">
                                            <input type="checkbox" value="6"> Sat
                                        </label>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="habit-reminder">Reminder Time (Optional)</label>
                                    <input type="time" id="habit-reminder" class="form-input">
                                </div>

                                <div class="form-group">
                                    <label for="habit-description">Description/Notes</label>
                                    <textarea id="habit-description" class="form-input" rows="2" 
                                              placeholder="Why is this habit important to you?"></textarea>
                                </div>

                                <!-- Popular Habits Suggestions -->
                                <div class="form-group">
                                    <label>Or choose from popular habits:</label>
                                    <div class="popular-habits">
                                        <div class="habit-categories">
                                            ${this.categories.map(cat => `
                                                <div class="habit-category-suggestions" data-category="${cat.id}">
                                                    <h4>${cat.icon} ${cat.name}</h4>
                                                    <div class="suggestions-grid">
                                                        ${this.popularHabits[cat.id].map(habit => `
                                                            <button type="button" class="suggestion-btn" 
                                                                    onclick="window.habitTracker.selectSuggestion('${habit}', '${cat.id}')">
                                                                ${habit}
                                                            </button>
                                                        `).join('')}
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn-secondary" onclick="window.habitTracker.closeHabitModal()">Cancel</button>
                            <button type="button" class="btn-primary" onclick="window.habitTracker.saveHabit()">Save Habit</button>
                        </div>
                    </div>
                </div>
            `;

            mainContent.appendChild(habitsView);
        }
    }

    setupEventListeners() {
        // View mode buttons
        document.querySelectorAll('.view-mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setViewMode(e.target.dataset.mode);
            });
        });

        // Frequency change handler
        const frequencySelect = document.getElementById('habit-frequency');
        if (frequencySelect) {
            frequencySelect.addEventListener('change', (e) => {
                const customDaysGroup = document.getElementById('custom-days-group');
                if (customDaysGroup) {
                    customDaysGroup.style.display = e.target.value === 'custom' ? 'block' : 'none';
                }
            });
        }

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('habits-view').classList.contains('active')) {
                if (e.key === 'ArrowLeft') {
                    this.changeDate(-1);
                } else if (e.key === 'ArrowRight') {
                    this.changeDate(1);
                } else if (e.key === 't' && e.ctrlKey) {
                    e.preventDefault();
                    this.goToToday();
                }
            }
        });
    }

    loadHabits() {
        const stored = localStorage.getItem('habits');
        if (stored) {
            this.habits = JSON.parse(stored);
        }

        const storedHistory = localStorage.getItem('habitHistory');
        if (storedHistory) {
            this.habitHistory = JSON.parse(storedHistory);
        }
    }

    saveHabits() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
        localStorage.setItem('habitHistory', JSON.stringify(this.habitHistory));
        
        // Sync to Google Sheets if connected
        if (window.todoApp?.isAuthenticated && window.todoApp?.sheetId) {
            this.syncToSheets();
        }
    }

    openHabitModal(habitId = null) {
        const modal = document.getElementById('habit-modal');
        const title = document.getElementById('habit-modal-title');
        
        if (habitId) {
            const habit = this.habits.find(h => h.id === habitId);
            if (habit) {
                title.textContent = 'Edit Habit';
                this.fillHabitForm(habit);
            }
        } else {
            title.textContent = 'Add New Habit';
            this.clearHabitForm();
        }
        
        modal.style.display = 'flex';
    }

    closeHabitModal() {
        document.getElementById('habit-modal').style.display = 'none';
    }

    fillHabitForm(habit) {
        document.getElementById('habit-name').value = habit.name;
        document.getElementById('habit-category').value = habit.category;
        document.getElementById('habit-frequency').value = habit.frequency;
        document.getElementById('habit-target').value = habit.target;
        document.getElementById('habit-unit').value = habit.unit;
        document.getElementById('habit-reminder').value = habit.reminderTime || '';
        document.getElementById('habit-description').value = habit.description || '';
        
        if (habit.frequency === 'custom' && habit.customDays) {
            document.getElementById('custom-days-group').style.display = 'block';
            document.querySelectorAll('.day-checkbox input').forEach(checkbox => {
                checkbox.checked = habit.customDays.includes(parseInt(checkbox.value));
            });
        }
    }

    clearHabitForm() {
        document.getElementById('habit-form').reset();
        document.getElementById('custom-days-group').style.display = 'none';
        document.querySelectorAll('.day-checkbox input').forEach(checkbox => {
            checkbox.checked = false;
        });
    }

    selectSuggestion(habitName, category) {
        document.getElementById('habit-name').value = habitName;
        document.getElementById('habit-category').value = category;
        
        // Set smart defaults based on habit type
        const target = document.getElementById('habit-target');
        const unit = document.getElementById('habit-unit');
        
        if (habitName.includes('water') || habitName.includes('glasses')) {
            target.value = '8';
            unit.value = 'glasses';
        } else if (habitName.includes('30 minutes') || habitName.includes('Exercise')) {
            target.value = '30';
            unit.value = 'minutes';
        } else if (habitName.includes('10,000 steps')) {
            target.value = '10000';
            unit.value = 'steps';
        } else if (habitName.includes('8 hours')) {
            target.value = '8';
            unit.value = 'hours';
        } else {
            target.value = '1';
            unit.value = 'times';
        }
    }

    saveHabit() {
        const name = document.getElementById('habit-name').value.trim();
        if (!name) {
            alert('Please enter a habit name');
            return;
        }

        const category = document.getElementById('habit-category').value;
        const frequency = document.getElementById('habit-frequency').value;
        const target = parseInt(document.getElementById('habit-target').value);
        const unit = document.getElementById('habit-unit').value;
        const reminderTime = document.getElementById('habit-reminder').value;
        const description = document.getElementById('habit-description').value.trim();

        let customDays = null;
        if (frequency === 'custom') {
            customDays = Array.from(document.querySelectorAll('.day-checkbox input:checked'))
                .map(cb => parseInt(cb.value));
            if (customDays.length === 0) {
                alert('Please select at least one day');
                return;
            }
        }

        const habit = {
            id: Date.now(),
            name,
            category,
            frequency,
            target,
            unit,
            reminderTime,
            description,
            customDays,
            createdAt: new Date().toISOString(),
            active: true
        };

        this.habits.push(habit);
        this.saveHabits();
        this.updateUI();
        this.closeHabitModal();

        // Show success message
        this.showNotification(`Habit "${name}" added successfully!`, 'success');

        // Set up reminder if specified
        if (reminderTime) {
            this.scheduleReminder(habit);
        }
    }

    toggleHabit(habitId, date = null) {
        const dateStr = date ? date.toISOString().split('T')[0] : this.selectedDate.toISOString().split('T')[0];
        
        if (!this.habitHistory[dateStr]) {
            this.habitHistory[dateStr] = {};
        }

        const current = this.habitHistory[dateStr][habitId] || 0;
        const habit = this.habits.find(h => h.id === habitId);
        
        if (current >= habit.target) {
            this.habitHistory[dateStr][habitId] = 0; // Reset to 0
        } else {
            this.habitHistory[dateStr][habitId] = habit.target; // Complete
        }

        this.saveHabits();
        this.updateUI();

        // Update streak manager if habit is completed
        if (this.habitHistory[dateStr][habitId] >= habit.target && window.streakManager) {
            window.streakManager.updateStreak('habitCompletion');
        }

        // Show celebration for completion
        if (this.habitHistory[dateStr][habitId] >= habit.target) {
            this.celebrateHabitCompletion(habit);
        }
    }

    incrementHabit(habitId, date = null) {
        const dateStr = date ? date.toISOString().split('T')[0] : this.selectedDate.toISOString().split('T')[0];
        
        if (!this.habitHistory[dateStr]) {
            this.habitHistory[dateStr] = {};
        }

        const habit = this.habits.find(h => h.id === habitId);
        const current = this.habitHistory[dateStr][habitId] || 0;
        
        if (current < habit.target) {
            this.habitHistory[dateStr][habitId] = current + 1;
            this.saveHabits();
            this.updateUI();

            // Check if habit is now complete
            if (this.habitHistory[dateStr][habitId] >= habit.target) {
                this.celebrateHabitCompletion(habit);
                if (window.streakManager) {
                    window.streakManager.updateStreak('habitCompletion');
                }
            }
        }
    }

    decrementHabit(habitId, date = null) {
        const dateStr = date ? date.toISOString().split('T')[0] : this.selectedDate.toISOString().split('T')[0];
        
        if (!this.habitHistory[dateStr]) {
            this.habitHistory[dateStr] = {};
        }

        const current = this.habitHistory[dateStr][habitId] || 0;
        if (current > 0) {
            this.habitHistory[dateStr][habitId] = current - 1;
            this.saveHabits();
            this.updateUI();
        }
    }

    deleteHabit(habitId) {
        if (confirm('Are you sure you want to delete this habit?')) {
            this.habits = this.habits.filter(h => h.id !== habitId);
            
            // Remove from history
            Object.keys(this.habitHistory).forEach(date => {
                delete this.habitHistory[date][habitId];
            });
            
            this.saveHabits();
            this.updateUI();
            this.showNotification('Habit deleted', 'info');
        }
    }

    updateUI() {
        this.updateHabitsList();
        this.updateAnalytics();
        this.updateDateDisplay();
    }

    updateHabitsList() {
        const container = document.getElementById('habits-list');
        const empty = document.getElementById('habits-empty');
        
        if (!container) return;

        if (this.habits.length === 0) {
            container.innerHTML = '';
            if (empty) empty.style.display = 'block';
            return;
        }

        if (empty) empty.style.display = 'none';

        const dateStr = this.selectedDate.toISOString().split('T')[0];
        const todayHistory = this.habitHistory[dateStr] || {};

        // Group habits by category
        const habitsByCategory = {};
        this.habits.forEach(habit => {
            if (!habitsByCategory[habit.category]) {
                habitsByCategory[habit.category] = [];
            }
            habitsByCategory[habit.category].push(habit);
        });

        let html = '';
        Object.entries(habitsByCategory).forEach(([categoryId, habits]) => {
            const category = this.categories.find(c => c.id === categoryId);
            if (!category) return;

            html += `
                <div class="habit-category-group">
                    <div class="category-header" style="border-left: 4px solid ${category.color}">
                        <span class="category-icon">${category.icon}</span>
                        <span class="category-name">${category.name}</span>
                        <span class="category-count">${habits.length} habit${habits.length > 1 ? 's' : ''}</span>
                    </div>
                    <div class="category-habits">
                        ${habits.map(habit => this.renderHabitItem(habit, todayHistory[habit.id] || 0)).join('')}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    renderHabitItem(habit, currentProgress) {
        const isCompleted = currentProgress >= habit.target;
        const progressPercent = Math.min((currentProgress / habit.target) * 100, 100);
        const streak = this.calculateStreak(habit.id);
        
        return `
            <div class="habit-item ${isCompleted ? 'completed' : ''}" data-habit-id="${habit.id}">
                <div class="habit-header">
                    <div class="habit-info">
                        <h3 class="habit-name">${habit.name}</h3>
                        <div class="habit-meta">
                            <span class="habit-target">${habit.target} ${habit.unit}</span>
                            <span class="habit-frequency">${habit.frequency}</span>
                            ${streak > 0 ? `<span class="habit-streak">🔥 ${streak} day streak</span>` : ''}
                        </div>
                    </div>
                    <div class="habit-actions">
                        <button class="habit-action-btn" onclick="window.habitTracker.openHabitModal(${habit.id})" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="habit-action-btn delete" onclick="window.habitTracker.deleteHabit(${habit.id})" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="habit-progress">
                    <div class="progress-bar-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercent}%; background: ${this.categories.find(c => c.id === habit.category)?.color || '#4caf50'}"></div>
                        </div>
                        <span class="progress-text">${currentProgress}/${habit.target}</span>
                    </div>
                    
                    <div class="habit-controls">
                        ${habit.target > 1 ? `
                            <button class="habit-control-btn" onclick="window.habitTracker.decrementHabit(${habit.id})" ${currentProgress <= 0 ? 'disabled' : ''}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>
                            <button class="habit-control-btn" onclick="window.habitTracker.incrementHabit(${habit.id})" ${currentProgress >= habit.target ? 'disabled' : ''}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>
                        ` : `
                            <button class="habit-toggle-btn ${isCompleted ? 'completed' : ''}" onclick="window.habitTracker.toggleHabit(${habit.id})">
                                ${isCompleted ? 'Completed ✓' : 'Mark Complete'}
                            </button>
                        `}
                    </div>
                </div>

                <!-- Habit Chain Visualization -->
                <div class="habit-chain">
                    ${this.renderHabitChain(habit.id)}
                </div>
            </div>
        `;
    }

    renderHabitChain(habitId, days = 14) {
        const chain = [];
        const today = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const habit = this.habits.find(h => h.id === habitId);
            const progress = this.habitHistory[dateStr]?.[habitId] || 0;
            const isCompleted = progress >= habit.target;
            const isToday = i === 0;
            const dayOfWeek = date.getDay();
            
            let status = 'empty';
            if (isCompleted) {
                status = 'completed';
            } else if (date <= today && !isToday) {
                status = 'missed';
            } else if (isToday) {
                status = progress > 0 ? 'partial' : 'today';
            }

            chain.push(`
                <div class="chain-day ${status} ${isToday ? 'today' : ''}" 
                     title="${date.toLocaleDateString()} - ${isCompleted ? 'Completed' : progress > 0 ? 'Partial' : date <= today ? 'Missed' : 'Upcoming'}">
                    <span class="chain-day-number">${date.getDate()}</span>
                </div>
            `);
        }

        return chain.join('');
    }

    calculateStreak(habitId) {
        const today = new Date();
        let streak = 0;
        let currentDate = new Date(today);
        const habit = this.habits.find(h => h.id === habitId);
        
        // Count backwards from today
        while (true) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const progress = this.habitHistory[dateStr]?.[habitId] || 0;
            
            if (progress >= habit.target) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
            
            // Don't go back more than 365 days
            if (streak > 365) break;
        }
        
        return streak;
    }

    updateAnalytics() {
        const dateStr = this.selectedDate.toISOString().split('T')[0];
        const todayHistory = this.habitHistory[dateStr] || {};
        
        // Calculate completion stats
        let completedCount = 0;
        let totalCount = this.habits.length;
        
        this.habits.forEach(habit => {
            const progress = todayHistory[habit.id] || 0;
            if (progress >= habit.target) {
                completedCount++;
            }
        });
        
        const completionPercent = totalCount > 0 ? (completedCount / totalCount * 100) : 0;
        
        // Update UI
        document.getElementById('completed-habits').textContent = completedCount;
        document.getElementById('total-habits').textContent = totalCount;
        document.getElementById('habits-completion').textContent = `${Math.round(completionPercent)}%`;
        
        // Update progress circle
        const circle = document.getElementById('habits-progress-circle');
        if (circle) {
            const circumference = 2 * Math.PI * 42;
            const offset = circumference - (completionPercent / 100 * circumference);
            circle.style.strokeDashoffset = offset;
        }
        
        // Calculate best streak
        const streaks = this.habits.map(habit => this.calculateStreak(habit.id));
        const bestStreak = Math.max(...streaks, 0);
        document.getElementById('current-streak').textContent = bestStreak;
        
        // Update category stats
        this.updateCategoryStats(todayHistory);
        
        // Update streak leaders
        this.updateStreakLeaders();
    }

    updateCategoryStats(todayHistory) {
        const categoryStats = {};
        this.categories.forEach(cat => {
            categoryStats[cat.id] = { completed: 0, total: 0, category: cat };
        });
        
        this.habits.forEach(habit => {
            if (categoryStats[habit.category]) {
                categoryStats[habit.category].total++;
                const progress = todayHistory[habit.id] || 0;
                if (progress >= habit.target) {
                    categoryStats[habit.category].completed++;
                }
            }
        });
        
        const container = document.getElementById('category-stats');
        if (container) {
            container.innerHTML = Object.values(categoryStats)
                .filter(stat => stat.total > 0)
                .map(stat => {
                    const percent = (stat.completed / stat.total * 100);
                    return `
                        <div class="category-stat">
                            <div class="category-stat-header">
                                <span class="category-icon">${stat.category.icon}</span>
                                <span class="category-name">${stat.category.name}</span>
                                <span class="category-progress">${stat.completed}/${stat.total}</span>
                            </div>
                            <div class="category-progress-bar">
                                <div class="progress-fill" style="width: ${percent}%; background: ${stat.category.color}"></div>
                            </div>
                        </div>
                    `;
                }).join('');
        }
    }

    updateStreakLeaders() {
        const streakData = this.habits
            .map(habit => ({
                name: habit.name,
                streak: this.calculateStreak(habit.id),
                category: this.categories.find(c => c.id === habit.category)
            }))
            .sort((a, b) => b.streak - a.streak)
            .slice(0, 3);
        
        const container = document.getElementById('streak-leaders');
        if (container) {
            if (streakData.length === 0) {
                container.innerHTML = '<p>No streaks yet. Start completing habits!</p>';
            } else {
                container.innerHTML = streakData.map((item, index) => `
                    <div class="streak-leader">
                        <div class="leader-rank">${index + 1}</div>
                        <div class="leader-info">
                            <span class="leader-name">${item.name}</span>
                            <span class="leader-category">${item.category?.icon} ${item.category?.name}</span>
                        </div>
                        <div class="leader-streak">
                            ${item.streak > 0 ? `🔥 ${item.streak}` : '—'}
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    setViewMode(mode) {
        this.viewMode = mode;
        document.querySelectorAll('.view-mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        this.updateUI();
    }

    changeDate(delta) {
        this.selectedDate.setDate(this.selectedDate.getDate() + delta);
        this.updateUI();
    }

    goToToday() {
        this.selectedDate = new Date();
        this.updateUI();
    }

    updateDateDisplay() {
        const dateDisplay = document.getElementById('habits-current-date');
        if (dateDisplay) {
            dateDisplay.textContent = this.formatDate(this.selectedDate);
        }
    }

    formatDate(date) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
    }

    celebrateHabitCompletion(habit) {
        // Create celebration animation
        const celebration = document.createElement('div');
        celebration.className = 'habit-celebration';
        celebration.innerHTML = `
            <div class="celebration-content">
                <div class="celebration-icon">🎉</div>
                <div class="celebration-text">${habit.name} completed!</div>
            </div>
        `;
        celebration.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #4caf50, #45a049);
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(76, 175, 80, 0.3);
            z-index: 10000;
            animation: bounceIn 0.5s;
        `;
        
        document.body.appendChild(celebration);
        setTimeout(() => celebration.remove(), 2000);
        
        // Trigger confetti
        this.triggerConfetti();
    }

    triggerConfetti() {
        const colors = ['#4caf50', '#2196f3', '#ff9800', '#e91e63', '#9c27b0'];
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 8px;
                height: 8px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}%;
                top: -10px;
                border-radius: 50%;
                animation: confettiFall ${Math.random() * 2 + 2}s linear forwards;
                z-index: 9999;
            `;
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 4000);
        }
    }

    scheduleReminder(habit) {
        // This would integrate with browser notifications
        // For now, we'll store reminders and check them periodically
        const reminders = JSON.parse(localStorage.getItem('habitReminders') || '[]');
        reminders.push({
            habitId: habit.id,
            name: habit.name,
            time: habit.reminderTime,
            active: true
        });
        localStorage.setItem('habitReminders', JSON.stringify(reminders));
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `habit-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : '#2196f3'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideInUp 0.3s;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // Sync to Google Sheets
    async syncToSheets() {
        if (!window.todoApp || !window.todoApp.isAuthenticated || !window.todoApp.sheetId) return;
        
        try {
            await this.ensureHabitsSheet();
            
            // Prepare habits data
            const habitsData = [
                ['Habit Name', 'Category', 'Target', 'Unit', 'Frequency', 'Created Date', 'Active']
            ];
            
            this.habits.forEach(habit => {
                const category = this.categories.find(c => c.id === habit.category);
                habitsData.push([
                    habit.name,
                    category ? category.name : habit.category,
                    habit.target,
                    habit.unit,
                    habit.frequency,
                    new Date(habit.createdAt).toLocaleDateString(),
                    habit.active ? 'Yes' : 'No'
                ]);
            });
            
            // Update habits sheet
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: window.todoApp.sheetId,
                range: 'Habits!A1:G1000',
                valueInputOption: 'USER_ENTERED',
                resource: { values: habitsData }
            });
            
            console.log('Habits synced to Google Sheets');
        } catch (error) {
            console.error('Error syncing habits:', error);
        }
    }

    async ensureHabitsSheet() {
        if (!window.todoApp || !window.todoApp.sheetId) return;
        
        try {
            const response = await gapi.client.sheets.spreadsheets.get({
                spreadsheetId: window.todoApp.sheetId
            });
            
            const sheets = response.result.sheets;
            const habitsSheet = sheets.find(sheet => sheet.properties.title === 'Habits');
            
            if (!habitsSheet) {
                await gapi.client.sheets.spreadsheets.batchUpdate({
                    spreadsheetId: window.todoApp.sheetId,
                    resource: {
                        requests: [{
                            addSheet: {
                                properties: {
                                    title: 'Habits',
                                    gridProperties: {
                                        rowCount: 1000,
                                        columnCount: 10
                                    }
                                }
                            }
                        }]
                    }
                });
                console.log('Habits sheet created');
            }
        } catch (error) {
            console.error('Error ensuring habits sheet:', error);
        }
    }
}

// Initialize HabitTracker when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.habitTracker = new HabitTracker();
});