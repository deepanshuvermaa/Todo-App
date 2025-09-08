// Smart Dashboard - Intelligent Home Screen with Morning Brief and Analytics
class SmartDashboard {
    constructor() {
        this.weatherData = null;
        this.userPreferences = {
            showWeather: true,
            showQuote: true,
            showInsights: true,
            showUpcoming: true,
            dashboardLayout: 'default'
        };
        this.insights = [];
        this.init();
    }

    init() {
        this.loadPreferences();
        this.createDashboardUI();
        this.loadDashboardData();
        this.setupRefreshInterval();
    }

    loadPreferences() {
        const saved = localStorage.getItem('dashboardPreferences');
        if (saved) {
            this.userPreferences = { ...this.userPreferences, ...JSON.parse(saved) };
        }
    }

    savePreferences() {
        localStorage.setItem('dashboardPreferences', JSON.stringify(this.userPreferences));
    }

    createDashboardUI() {
        // Check if dashboard already exists
        let dashboard = document.getElementById('smart-dashboard');
        if (dashboard) return;

        // Create dashboard container
        dashboard = document.createElement('div');
        dashboard.id = 'smart-dashboard';
        dashboard.className = 'smart-dashboard';
        dashboard.innerHTML = `
            <div class="dashboard-header">
                <h2 class="dashboard-title">
                    <span id="dashboard-greeting">Good Morning!</span>
                    <small id="dashboard-date">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</small>
                </h2>
                <button class="dashboard-customize-btn" onclick="window.smartDashboard.openCustomizeModal()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 1.54l4.24 4.24M12 1l4.24 4.24M1.54 12l4.24-4.24M21 12h-6m-6 0H3"></path>
                    </svg>
                </button>
            </div>

            <div class="dashboard-grid">
                <!-- Quick Actions Widget (First position for mobile) -->
                <div class="dashboard-widget actions-widget">
                    <div class="widget-header">
                        <span class="widget-icon">⚡</span>
                        <span class="widget-title">Quick Actions</span>
                    </div>
                    <div class="widget-content">
                        <div class="quick-actions-grid">
                            <button class="quick-action-btn" onclick="window.smartDashboard.quickAddTask()">
                                <span class="action-icon">➕</span>
                                <span class="action-label">Add Task</span>
                            </button>
                            <button class="quick-action-btn" onclick="window.smartDashboard.quickAddExpense()">
                                <span class="action-icon">💵</span>
                                <span class="action-label">Add Expense</span>
                            </button>
                            <button class="quick-action-btn" onclick="window.smartDashboard.quickLogWater()">
                                <span class="action-icon">💧</span>
                                <span class="action-label">Log Water</span>
                            </button>
                            <button class="quick-action-btn" onclick="window.smartDashboard.quickAddNote()">
                                <span class="action-icon">📝</span>
                                <span class="action-label">Quick Note</span>
                            </button>
                            <button class="quick-action-btn" onclick="window.smartDashboard.startPomodoro()">
                                <span class="action-icon">🍅</span>
                                <span class="action-label">Pomodoro</span>
                            </button>
                            <button class="quick-action-btn" onclick="window.smartDashboard.dailyReview()">
                                <span class="action-icon">📊</span>
                                <span class="action-label">Daily Review</span>
                            </button>
                            <button class="quick-action-btn" onclick="window.smartDashboard.startVoiceCommand()">
                                <span class="action-icon">🎤</span>
                                <span class="action-label">Voice</span>
                            </button>
                            <button class="quick-action-btn" onclick="window.smartDashboard.openJournal()">
                                <span class="action-icon">📓</span>
                                <span class="action-label">Journal</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Top Priority Tasks Widget (Second position for mobile) -->
                <div class="dashboard-widget priority-widget">
                    <div class="widget-header">
                        <span class="widget-icon">🎯</span>
                        <span class="widget-title">Top Priorities</span>
                    </div>
                    <div class="widget-content">
                        <ul id="priority-tasks-list" class="priority-list">
                            <li class="no-priorities">No tasks for today</li>
                        </ul>
                        <button class="widget-action-btn" onclick="window.todoApp.switchToTab('today')">
                            View All Tasks →
                        </button>
                    </div>
                </div>

                <!-- Today's Overview Widget (Third position for mobile) -->
                <div class="dashboard-widget stats-widget">
                    <div class="widget-header">
                        <span class="widget-icon">📊</span>
                        <span class="widget-title">Today's Overview</span>
                    </div>
                    <div class="widget-content">
                        <div class="quick-stats-grid">
                            <div class="quick-stat">
                                <div class="stat-value" id="dash-tasks-pending">0</div>
                                <div class="stat-label">Tasks Pending</div>
                            </div>
                            <div class="quick-stat">
                                <div class="stat-value" id="dash-tasks-completed">0</div>
                                <div class="stat-label">Completed</div>
                            </div>
                            <div class="quick-stat">
                                <div class="stat-value" id="dash-expense-today">₹0</div>
                                <div class="stat-label">Spent Today</div>
                            </div>
                            <div class="quick-stat">
                                <div class="stat-value" id="dash-calories">0</div>
                                <div class="stat-label">Calories</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Smart Insights Widget -->
                <div class="dashboard-widget insights-widget">
                    <div class="widget-header">
                        <span class="widget-icon">💡</span>
                        <span class="widget-title">Smart Insights</span>
                    </div>
                    <div class="widget-content">
                        <div id="insights-carousel" class="insights-carousel">
                            <div class="insight-card active">
                                <div class="insight-icon">📈</div>
                                <div class="insight-text">Loading insights...</div>
                            </div>
                        </div>
                        <div class="carousel-dots" id="insight-dots"></div>
                    </div>
                </div>

                <!-- Upcoming Events Widget -->
                <div class="dashboard-widget upcoming-widget">
                    <div class="widget-header">
                        <span class="widget-icon">📅</span>
                        <span class="widget-title">Upcoming</span>
                    </div>
                    <div class="widget-content">
                        <div id="upcoming-events" class="upcoming-list">
                            <div class="upcoming-item">
                                <span class="upcoming-time">No upcoming events</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Health Tracker Widget -->
                <div class="dashboard-widget health-widget">
                    <div class="widget-header">
                        <span class="widget-icon">💪</span>
                        <span class="widget-title">Health Tracker</span>
                    </div>
                    <div class="widget-content">
                        <div class="health-stats">
                            <div class="health-stat">
                                <span class="health-label">Water</span>
                                <div class="health-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill water" id="dash-water-progress" style="width: 0%"></div>
                                    </div>
                                    <span class="health-value" id="dash-water-count">0/8 glasses</span>
                                </div>
                            </div>
                            <div class="health-stat">
                                <span class="health-label">Steps</span>
                                <div class="health-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill steps" id="dash-steps-progress" style="width: 0%"></div>
                                    </div>
                                    <span class="health-value" id="dash-steps-count">0/10,000</span>
                                </div>
                            </div>
                            <div class="health-stat">
                                <span class="health-label">Meals</span>
                                <div class="health-progress">
                                    <div class="meal-indicators">
                                        <span class="meal-indicator" id="breakfast-ind">🌅</span>
                                        <span class="meal-indicator" id="lunch-ind">☀️</span>
                                        <span class="meal-indicator" id="snack-ind">🍿</span>
                                        <span class="meal-indicator" id="dinner-ind">🌙</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Week Heatmap Widget -->
                <div class="dashboard-widget heatmap-widget">
                    <div class="widget-header">
                        <span class="widget-icon">📈</span>
                        <span class="widget-title">This Week's Activity</span>
                    </div>
                    <div class="widget-content">
                        <div id="week-heatmap" class="week-heatmap">
                            <!-- Will be populated dynamically -->
                        </div>
                        <div class="heatmap-legend">
                            <span>Less</span>
                            <div class="legend-colors">
                                <div class="legend-color" style="background: #ebedf0"></div>
                                <div class="legend-color" style="background: #c6e48b"></div>
                                <div class="legend-color" style="background: #7bc96f"></div>
                                <div class="legend-color" style="background: #239a3b"></div>
                                <div class="legend-color" style="background: #196127"></div>
                            </div>
                            <span>More</span>
                        </div>
                    </div>
                </div>

                <!-- Budget Status Widget -->
                <div class="dashboard-widget budget-widget">
                    <div class="widget-header">
                        <span class="widget-icon">💰</span>
                        <span class="widget-title">Budget Status</span>
                    </div>
                    <div class="widget-content">
                        <div class="budget-overview">
                            <div class="budget-circle">
                                <svg class="progress-ring" width="120" height="120">
                                    <circle class="progress-ring-circle" stroke="#e0e0e0" stroke-width="8" fill="transparent" r="52" cx="60" cy="60"></circle>
                                    <circle id="budget-progress-circle" class="progress-ring-circle progress" stroke="#4caf50" stroke-width="8" fill="transparent" r="52" cx="60" cy="60" style="stroke-dasharray: 326.73; stroke-dashoffset: 326.73;"></circle>
                                </svg>
                                <div class="budget-percentage" id="dash-budget-percent">0%</div>
                            </div>
                            <div class="budget-details">
                                <div class="budget-detail">
                                    <span class="budget-label">Spent</span>
                                    <span class="budget-value" id="dash-budget-spent">₹0</span>
                                </div>
                                <div class="budget-detail">
                                    <span class="budget-label">Budget</span>
                                    <span class="budget-value" id="dash-budget-total">₹0</span>
                                </div>
                                <div class="budget-detail">
                                    <span class="budget-label">Remaining</span>
                                    <span class="budget-value" id="dash-budget-remaining">₹0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Mood Tracker Widget -->
                <div class="dashboard-widget mood-widget">
                    <div class="widget-header">
                        <span class="widget-icon">😊</span>
                        <span class="widget-title">How are you feeling?</span>
                    </div>
                    <div class="widget-content">
                        <div class="mood-selector">
                            <button class="mood-btn" data-mood="amazing" title="Amazing">😄</button>
                            <button class="mood-btn" data-mood="good" title="Good">😊</button>
                            <button class="mood-btn" data-mood="okay" title="Okay">😐</button>
                            <button class="mood-btn" data-mood="bad" title="Not Great">😔</button>
                            <button class="mood-btn" data-mood="terrible" title="Terrible">😢</button>
                        </div>
                        <div class="mood-history" id="mood-history">
                            <!-- Last 7 days mood history -->
                        </div>
                    </div>
                </div>

            </div>
        `;

        // Insert dashboard into the dashboard-view container
        const dashboardView = document.getElementById('dashboard-view');
        if (dashboardView) {
            dashboardView.appendChild(dashboard);
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Mood buttons
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.logMood(e.target.dataset.mood);
            });
        });

        // Update greeting based on time
        this.updateGreeting();
        setInterval(() => this.updateGreeting(), 60000); // Update every minute
    }

    updateGreeting() {
        const hour = new Date().getHours();
        const greetingElement = document.getElementById('dashboard-greeting');
        if (!greetingElement) return;

        let greeting = 'Hello';
        let icon = '👋';

        if (hour < 5) {
            greeting = 'Late Night';
            icon = '🌙';
        } else if (hour < 12) {
            greeting = 'Good Morning';
            icon = '🌅';
        } else if (hour < 17) {
            greeting = 'Good Afternoon';
            icon = '☀️';
        } else if (hour < 21) {
            greeting = 'Good Evening';
            icon = '🌆';
        } else {
            greeting = 'Good Night';
            icon = '🌙';
        }

        // Get user's name if available
        const userName = localStorage.getItem('userName') || '';
        greetingElement.textContent = `${icon} ${greeting}${userName ? ', ' + userName : '!'}`;
    }

    async loadDashboardData() {
        // Load task stats
        this.loadTaskStats();

        // Load expense stats
        this.loadExpenseStats();

        // Load health stats
        this.loadHealthStats();

        // Load insights
        this.generateInsights();

        // Load upcoming events
        this.loadUpcomingEvents();

        // Load week heatmap
        this.loadWeekHeatmap();

        // Load mood history
        this.loadMoodHistory();

        // Load priority tasks
        this.loadPriorityTasks();

        // Load budget status
        this.loadBudgetStatus();
    }


    loadTaskStats() {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const today = new Date().toDateString();
        const todayTasks = tasks.filter(t => new Date(t.date).toDateString() === today);
        
        const pending = todayTasks.filter(t => !t.completed).length;
        const completed = todayTasks.filter(t => t.completed).length;
        
        document.getElementById('dash-tasks-pending').textContent = pending;
        document.getElementById('dash-tasks-completed').textContent = completed;
    }

    loadExpenseStats() {
        const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        const today = new Date().toISOString().split('T')[0];
        const todayExpenses = expenses.filter(e => e.date === today);
        
        const total = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
        document.getElementById('dash-expense-today').textContent = `₹${total.toFixed(0)}`;
    }

    loadHealthStats() {
        // Water intake
        const waterIntake = parseInt(localStorage.getItem('waterIntake') || '0');
        const waterGoal = 8;
        const waterPercent = (waterIntake / waterGoal) * 100;
        
        document.getElementById('dash-water-count').textContent = `${waterIntake}/${waterGoal} glasses`;
        document.getElementById('dash-water-progress').style.width = `${Math.min(waterPercent, 100)}%`;
        
        // Steps (simulated or from integration)
        const steps = parseInt(localStorage.getItem('dailySteps') || '0');
        const stepsGoal = 10000;
        const stepsPercent = (steps / stepsGoal) * 100;
        
        document.getElementById('dash-steps-count').textContent = `${steps.toLocaleString()}/${stepsGoal.toLocaleString()}`;
        document.getElementById('dash-steps-progress').style.width = `${Math.min(stepsPercent, 100)}%`;
        
        // Meals
        const meals = JSON.parse(localStorage.getItem('meals') || '[]');
        const today = new Date().toISOString().split('T')[0];
        const todayMeals = meals.filter(m => m.date === today);
        
        const calories = todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
        document.getElementById('dash-calories').textContent = Math.round(calories);
        
        // Update meal indicators
        const mealTypes = ['breakfast', 'lunch', 'snack', 'dinner'];
        mealTypes.forEach(type => {
            const hasMeal = todayMeals.some(m => m.mealType === type);
            const indicator = document.getElementById(`${type}-ind`);
            if (indicator) {
                indicator.classList.toggle('completed', hasMeal);
            }
        });
    }

    generateInsights() {
        const insights = [];
        
        // Task insights
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const todayTasks = tasks.filter(t => new Date(t.date).toDateString() === new Date().toDateString());
        const completionRate = todayTasks.length > 0 ? 
            (todayTasks.filter(t => t.completed).length / todayTasks.length * 100).toFixed(0) : 0;
        
        if (completionRate > 80) {
            insights.push({
                icon: '🎯',
                text: `Great job! ${completionRate}% task completion rate today!`,
                type: 'success'
            });
        } else if (todayTasks.filter(t => !t.completed).length > 5) {
            insights.push({
                icon: '📋',
                text: `You have ${todayTasks.filter(t => !t.completed).length} pending tasks. Consider prioritizing!`,
                type: 'warning'
            });
        }
        
        // Expense insights
        const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        const todayExpenses = expenses.filter(e => e.date === new Date().toISOString().split('T')[0]);
        const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
        
        // Calculate average daily spending
        const last7Days = expenses.filter(e => {
            const expDate = new Date(e.date);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return expDate >= weekAgo;
        });
        
        const avgDaily = last7Days.length > 0 ? 
            last7Days.reduce((sum, e) => sum + e.amount, 0) / 7 : 0;
        
        if (todayTotal > avgDaily * 1.5) {
            insights.push({
                icon: '💰',
                text: `Today's spending is 50% higher than your weekly average!`,
                type: 'warning'
            });
        }
        
        // Health insights
        const waterIntake = parseInt(localStorage.getItem('waterIntake') || '0');
        if (waterIntake < 4 && new Date().getHours() > 14) {
            insights.push({
                icon: '💧',
                text: `Remember to stay hydrated! Only ${waterIntake} glasses of water today.`,
                type: 'info'
            });
        }
        
        // Streak insights
        if (window.streakManager && window.streakManager.streaks.login > 0) {
            insights.push({
                icon: '🔥',
                text: `${window.streakManager.streaks.login} day login streak! Keep it going!`,
                type: 'success'
            });
        }
        
        // Time-based insights
        const hour = new Date().getHours();
        if (hour === 9 && todayTasks.length === 0) {
            insights.push({
                icon: '📝',
                text: 'Start your day by adding today\'s tasks!',
                type: 'info'
            });
        }
        
        // Display insights
        this.displayInsights(insights.length > 0 ? insights : [{
            icon: '💡',
            text: 'Complete more activities to get personalized insights!',
            type: 'default'
        }]);
    }

    displayInsights(insights) {
        const carousel = document.getElementById('insights-carousel');
        const dotsContainer = document.getElementById('insight-dots');
        
        if (!carousel || !dotsContainer) return;
        
        carousel.innerHTML = insights.map((insight, index) => `
            <div class="insight-card ${index === 0 ? 'active' : ''}" data-index="${index}">
                <div class="insight-icon">${insight.icon}</div>
                <div class="insight-text">${insight.text}</div>
            </div>
        `).join('');
        
        dotsContainer.innerHTML = insights.map((_, index) => `
            <span class="carousel-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>
        `).join('');
        
        // Auto-rotate insights
        if (insights.length > 1) {
            let currentIndex = 0;
            setInterval(() => {
                currentIndex = (currentIndex + 1) % insights.length;
                this.showInsight(currentIndex);
            }, 5000);
        }
    }

    showInsight(index) {
        document.querySelectorAll('.insight-card').forEach((card, i) => {
            card.classList.toggle('active', i === index);
        });
        document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    loadUpcomingEvents() {
        const events = [];
        
        // Get call reminders
        const reminders = JSON.parse(localStorage.getItem('callReminders') || '[]');
        const now = new Date();
        const upcoming = reminders
            .filter(r => new Date(r.dateTime) > now)
            .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
            .slice(0, 3);
        
        upcoming.forEach(reminder => {
            const time = new Date(reminder.dateTime);
            events.push({
                time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                title: `Call ${reminder.contactName}`,
                icon: '📞'
            });
        });
        
        // Get bucket list goals with deadlines
        const goals = JSON.parse(localStorage.getItem('bucketListGoals') || '[]');
        const upcomingGoals = goals
            .filter(g => g.deadline && new Date(g.deadline) > now)
            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
            .slice(0, 3 - events.length);
        
        upcomingGoals.forEach(goal => {
            const deadline = new Date(goal.deadline);
            const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
            events.push({
                time: `${daysLeft} days`,
                title: goal.title,
                icon: '🎯'
            });
        });
        
        const upcomingContainer = document.getElementById('upcoming-events');
        if (upcomingContainer) {
            if (events.length > 0) {
                upcomingContainer.innerHTML = events.map(event => `
                    <div class="upcoming-item">
                        <span class="upcoming-icon">${event.icon}</span>
                        <span class="upcoming-title">${event.title}</span>
                        <span class="upcoming-time">${event.time}</span>
                    </div>
                `).join('');
            } else {
                upcomingContainer.innerHTML = '<div class="upcoming-item">No upcoming events</div>';
            }
        }
    }

    loadWeekHeatmap() {
        const heatmapContainer = document.getElementById('week-heatmap');
        if (!heatmapContainer) return;
        
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const weekData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            // Calculate activity score for the day
            const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
            const dayTasks = tasks.filter(t => t.date === dateStr && t.completed);
            
            const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
            const dayExpenses = expenses.filter(e => e.date === dateStr);
            
            const meals = JSON.parse(localStorage.getItem('meals') || '[]');
            const dayMeals = meals.filter(m => m.date === dateStr);
            
            const activityScore = dayTasks.length * 10 + dayExpenses.length * 5 + dayMeals.length * 3;
            
            weekData.push({
                day: days[date.getDay()],
                date: date.getDate(),
                score: activityScore,
                isToday: i === 0
            });
        }
        
        const maxScore = Math.max(...weekData.map(d => d.score), 1);
        
        heatmapContainer.innerHTML = weekData.map(day => {
            const intensity = day.score / maxScore;
            let colorClass = 'heat-0';
            if (intensity > 0.8) colorClass = 'heat-4';
            else if (intensity > 0.6) colorClass = 'heat-3';
            else if (intensity > 0.4) colorClass = 'heat-2';
            else if (intensity > 0.2) colorClass = 'heat-1';
            
            return `
                <div class="heatmap-day ${day.isToday ? 'today' : ''}">
                    <div class="heatmap-cell ${colorClass}" title="${day.score} activities">
                        <span class="day-label">${day.day}</span>
                        <span class="day-date">${day.date}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    loadMoodHistory() {
        const moodHistory = JSON.parse(localStorage.getItem('moodHistory') || '[]');
        const container = document.getElementById('mood-history');
        if (!container) return;
        
        const last7Days = [];
        const moodEmojis = {
            amazing: '😄',
            good: '😊',
            okay: '😐',
            bad: '😔',
            terrible: '😢'
        };
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const mood = moodHistory.find(m => m.date === dateStr);
            last7Days.push(mood ? moodEmojis[mood.mood] : '—');
        }
        
        container.innerHTML = `
            <div class="mood-week">
                ${last7Days.map((mood, i) => `
                    <div class="mood-day">
                        <span class="mood-emoji">${mood}</span>
                        <span class="mood-day-label">${i === 6 ? 'Today' : `${6-i}d`}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    loadPriorityTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const today = new Date().toDateString();
        const todayTasks = tasks
            .filter(t => new Date(t.date).toDateString() === today && !t.completed)
            .slice(0, 3);
        
        const listContainer = document.getElementById('priority-tasks-list');
        if (!listContainer) return;
        
        if (todayTasks.length > 0) {
            listContainer.innerHTML = todayTasks.map(task => `
                <li class="priority-task-item">
                    <input type="checkbox" class="task-checkbox" data-id="${task.id}" 
                           onchange="window.smartDashboard.completeTask(${task.id})">
                    <span class="task-text">${task.text}</span>
                </li>
            `).join('');
        } else {
            listContainer.innerHTML = '<li class="no-priorities">No tasks for today</li>';
        }
    }

    loadBudgetStatus() {
        const budget = JSON.parse(localStorage.getItem('expenseBudget') || '{"monthly": 0}');
        const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthExpenses = expenses.filter(e => {
            const expDate = new Date(e.date);
            return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
        });
        
        const spent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
        const budgetAmount = budget.monthly || 0;
        const remaining = Math.max(budgetAmount - spent, 0);
        const percentage = budgetAmount > 0 ? Math.min((spent / budgetAmount) * 100, 100) : 0;
        
        document.getElementById('dash-budget-percent').textContent = `${percentage.toFixed(0)}%`;
        document.getElementById('dash-budget-spent').textContent = `₹${spent.toFixed(0)}`;
        document.getElementById('dash-budget-total').textContent = `₹${budgetAmount.toFixed(0)}`;
        document.getElementById('dash-budget-remaining').textContent = `₹${remaining.toFixed(0)}`;
        
        // Update progress circle
        const circle = document.getElementById('budget-progress-circle');
        if (circle) {
            const circumference = 2 * Math.PI * 52;
            const offset = circumference - (percentage / 100 * circumference);
            circle.style.strokeDashoffset = offset;
            
            // Change color based on percentage
            if (percentage >= 90) {
                circle.style.stroke = '#f44336';
            } else if (percentage >= 75) {
                circle.style.stroke = '#ff9800';
            } else {
                circle.style.stroke = '#4caf50';
            }
        }
    }

    logMood(mood) {
        const moodHistory = JSON.parse(localStorage.getItem('moodHistory') || '[]');
        const today = new Date().toISOString().split('T')[0];
        
        // Remove today's mood if already logged
        const filtered = moodHistory.filter(m => m.date !== today);
        
        // Add new mood
        filtered.push({
            date: today,
            mood: mood,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('moodHistory', JSON.stringify(filtered));
        
        // Update UI
        this.loadMoodHistory();
        
        // Show confirmation
        this.showNotification(`Mood logged: ${mood}`, 'success');
        
        // Update streak if applicable
        if (window.streakManager) {
            window.streakManager.updateStreak('moodTracking');
        }
    }

    // Quick action methods
    quickAddTask() {
        // Switch to today tab and focus on task input
        if (window.todoApp) {
            window.todoApp.switchTab('today');
            const taskInput = document.getElementById('task-input');
            if (taskInput) {
                taskInput.focus();
                taskInput.placeholder = 'Type your task here...';
            }
        }
    }

    quickAddExpense() {
        // Switch to finance tab
        if (window.todoApp) {
            window.todoApp.switchTab('finance');
            const expenseAmount = document.getElementById('expense-amount');
            if (expenseAmount) {
                expenseAmount.focus();
            }
        }
    }

    quickLogWater() {
        const waterIntake = parseInt(localStorage.getItem('waterIntake') || '0');
        localStorage.setItem('waterIntake', waterIntake + 1);
        this.loadHealthStats();
        this.showNotification('Water intake logged! 💧', 'success');
        
        if (window.streakManager) {
            window.streakManager.updateStreak('waterIntake');
        }
    }

    quickAddNote() {
        // Switch to notes tab
        if (window.todoApp) {
            window.todoApp.switchTab('notes');
            const noteInput = document.getElementById('note-input');
            if (noteInput) {
                noteInput.focus();
            }
        }
    }

    startPomodoro() {
        // Open Pomodoro modal from smart widgets
        if (window.smartWidgets) {
            window.smartWidgets.openPomodoroModal();
        } else {
            this.showNotification('Pomodoro timer not available', 'error');
        }
    }

    dailyReview() {
        // Switch to history tab to review today's activities
        if (window.todoApp) {
            window.todoApp.switchTab('history');
        }
    }

    startVoiceCommand() {
        // Activate voice commands
        if (window.voiceCommands && window.voiceCommands.isSupported) {
            window.voiceCommands.toggleListening();
        } else {
            this.showNotification('Voice commands not available in your browser', 'error');
        }
    }

    openJournal() {
        // Open journal modal
        if (window.smartWidgets) {
            window.smartWidgets.openJournalModal();
        } else {
            this.showNotification('Journal not available', 'error');
        }
    }

    completeTask(taskId) {
        if (window.todoApp) {
            window.todoApp.toggleTask(taskId);
            this.loadDashboardData();
        }
    }


    openCustomizeModal() {
        // Create customize modal
        alert('Dashboard customization coming soon!');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `dashboard-notification ${type}`;
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

    setupRefreshInterval() {
        // Refresh dashboard data every 5 minutes
        setInterval(() => {
            this.loadDashboardData();
        }, 5 * 60 * 1000);
    }
}

// Initialize SmartDashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.smartDashboard = new SmartDashboard();
});