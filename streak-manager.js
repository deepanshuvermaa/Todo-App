// Streak Manager - Gamification and Achievement System
class StreakManager {
    constructor() {
        this.streaks = {
            login: 0,
            taskCompletion: 0,
            expenseTracking: 0,
            mealLogging: 0,
            noteWriting: 0,
            waterIntake: 0
        };
        this.achievements = [];
        this.points = 0;
        this.level = 1;
        this.lastActivityDates = {};
        this.dailyGoals = {
            tasks: 5,
            water: 8,
            meals: 3,
            expenses: 1
        };
        this.init();
    }

    init() {
        this.loadStreaks();
        this.checkLoginStreak();
        this.setupAchievements();
        this.updateUI();
        this.checkMilestones();
    }

    loadStreaks() {
        const savedStreaks = localStorage.getItem('userStreaks');
        if (savedStreaks) {
            const data = JSON.parse(savedStreaks);
            this.streaks = data.streaks || this.streaks;
            this.achievements = data.achievements || [];
            this.points = data.points || 0;
            this.level = data.level || 1;
            this.lastActivityDates = data.lastActivityDates || {};
        }
    }

    saveStreaks() {
        const data = {
            streaks: this.streaks,
            achievements: this.achievements,
            points: this.points,
            level: this.level,
            lastActivityDates: this.lastActivityDates,
            lastSaved: new Date().toISOString()
        };
        localStorage.setItem('userStreaks', JSON.stringify(data));
        
        // Sync to Google Sheets if connected
        if (window.todoApp?.isAuthenticated && window.todoApp?.sheetId) {
            this.syncToSheets();
        }
    }

    checkLoginStreak() {
        const today = new Date().toDateString();
        const lastLogin = this.lastActivityDates.login;
        
        if (!lastLogin) {
            // First time login
            this.streaks.login = 1;
            this.lastActivityDates.login = today;
            this.addPoints(10, 'First Login');
        } else if (lastLogin === today) {
            // Already logged in today
            return;
        } else {
            const lastDate = new Date(lastLogin);
            const currentDate = new Date(today);
            const daysDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 1) {
                // Consecutive day
                this.streaks.login++;
                this.addPoints(10 + this.streaks.login, 'Daily Login Streak');
                
                // Check for milestone achievements
                this.checkLoginMilestones();
            } else if (daysDiff > 1) {
                // Streak broken
                if (this.streaks.login > 2) {
                    this.showStreakBroken('login', this.streaks.login);
                }
                this.streaks.login = 1;
                this.addPoints(10, 'Login');
            }
            
            this.lastActivityDates.login = today;
        }
        
        this.saveStreaks();
    }

    updateStreak(type, increment = true) {
        const today = new Date().toDateString();
        const lastActivity = this.lastActivityDates[type];
        
        if (!lastActivity || lastActivity !== today) {
            if (increment) {
                const lastDate = lastActivity ? new Date(lastActivity) : null;
                const currentDate = new Date(today);
                
                if (lastDate) {
                    const daysDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
                    
                    if (daysDiff === 1) {
                        this.streaks[type]++;
                    } else if (daysDiff > 1) {
                        if (this.streaks[type] > 2) {
                            this.showStreakBroken(type, this.streaks[type]);
                        }
                        this.streaks[type] = 1;
                    }
                } else {
                    this.streaks[type] = 1;
                }
                
                this.lastActivityDates[type] = today;
                this.checkStreakAchievements(type);
            }
        }
        
        this.saveStreaks();
        this.updateUI();
    }

    addPoints(points, reason) {
        this.points += points;
        this.checkLevelUp();
        
        // Show points animation
        this.showPointsAnimation(points, reason);
    }

    checkLevelUp() {
        const pointsNeeded = this.level * 100;
        if (this.points >= pointsNeeded) {
            this.level++;
            this.points -= pointsNeeded;
            this.unlockAchievement('level_up', `Level ${this.level} Reached!`, '🎯');
            this.showLevelUpAnimation();
        }
    }

    setupAchievements() {
        this.achievementDefinitions = [
            // Login Achievements
            { id: 'first_login', name: 'Welcome Aboard', icon: '🎉', points: 50, condition: () => true },
            { id: 'week_warrior', name: '7-Day Warrior', icon: '🔥', points: 100, condition: () => this.streaks.login >= 7 },
            { id: 'fortnight_fighter', name: 'Fortnight Fighter', icon: '⚔️', points: 200, condition: () => this.streaks.login >= 14 },
            { id: 'monthly_master', name: 'Monthly Master', icon: '👑', points: 500, condition: () => this.streaks.login >= 30 },
            { id: 'century_streak', name: 'Century Club', icon: '💯', points: 1000, condition: () => this.streaks.login >= 100 },
            
            // Task Achievements
            { id: 'task_starter', name: 'Task Starter', icon: '✅', points: 25, condition: () => this.getCompletedTasksCount() >= 10 },
            { id: 'task_master', name: 'Task Master', icon: '🏆', points: 100, condition: () => this.getCompletedTasksCount() >= 100 },
            { id: 'productivity_pro', name: 'Productivity Pro', icon: '⚡', points: 200, condition: () => this.getCompletedTasksCount() >= 500 },
            
            // Budget Achievements
            { id: 'budget_beginner', name: 'Budget Beginner', icon: '💰', points: 50, condition: () => this.getExpenseCount() >= 10 },
            { id: 'expense_expert', name: 'Expense Expert', icon: '📊', points: 150, condition: () => this.getExpenseCount() >= 100 },
            { id: 'savings_star', name: 'Savings Star', icon: '⭐', points: 300, condition: () => this.checkSavingsGoal() },
            
            // Health Achievements
            { id: 'hydration_hero', name: 'Hydration Hero', icon: '💧', points: 75, condition: () => this.streaks.waterIntake >= 7 },
            { id: 'meal_tracker', name: 'Meal Tracker', icon: '🍽️', points: 75, condition: () => this.streaks.mealLogging >= 7 },
            { id: 'health_champion', name: 'Health Champion', icon: '💪', points: 250, condition: () => this.checkHealthGoals() },
            
            // Special Achievements
            { id: 'early_bird', name: 'Early Bird', icon: '🌅', points: 100, condition: () => this.checkEarlyBird() },
            { id: 'night_owl', name: 'Night Owl', icon: '🦉', points: 100, condition: () => this.checkNightOwl() },
            { id: 'weekend_warrior', name: 'Weekend Warrior', icon: '🎊', points: 150, condition: () => this.checkWeekendActivity() },
            { id: 'perfectionist', name: 'Perfectionist', icon: '💎', points: 500, condition: () => this.checkPerfectDay() }
        ];
    }

    unlockAchievement(id, name, icon) {
        if (!this.achievements.find(a => a.id === id)) {
            const achievement = {
                id,
                name,
                icon,
                unlockedAt: new Date().toISOString()
            };
            
            this.achievements.push(achievement);
            this.showAchievementUnlocked(achievement);
            
            // Find points for this achievement
            const definition = this.achievementDefinitions.find(a => a.id === id);
            if (definition) {
                this.addPoints(definition.points, `Achievement: ${name}`);
            }
            
            this.saveStreaks();
        }
    }

    checkStreakAchievements(type) {
        const streak = this.streaks[type];
        
        // Check for streak milestones
        const milestones = [3, 7, 14, 30, 50, 100, 365];
        for (const milestone of milestones) {
            if (streak === milestone) {
                const typeName = type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1');
                this.unlockAchievement(
                    `${type}_streak_${milestone}`,
                    `${milestone}-Day ${typeName} Streak`,
                    this.getStreakIcon(milestone)
                );
            }
        }
    }

    getStreakIcon(days) {
        if (days >= 365) return '🌟';
        if (days >= 100) return '💯';
        if (days >= 50) return '🔥';
        if (days >= 30) return '🏆';
        if (days >= 14) return '⭐';
        if (days >= 7) return '🎯';
        return '✨';
    }

    checkLoginMilestones() {
        this.achievementDefinitions
            .filter(a => a.id.includes('warrior') || a.id.includes('fighter') || a.id.includes('master'))
            .forEach(achievement => {
                if (achievement.condition() && !this.achievements.find(a => a.id === achievement.id)) {
                    this.unlockAchievement(achievement.id, achievement.name, achievement.icon);
                }
            });
    }

    showAchievementUnlocked(achievement) {
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-details">
                    <div class="achievement-title">Achievement Unlocked!</div>
                    <div class="achievement-name">${achievement.name}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Play sound if available
        this.playAchievementSound();
        
        // Trigger confetti
        this.triggerConfetti();
        
        setTimeout(() => popup.remove(), 4000);
    }

    showPointsAnimation(points, reason) {
        const animation = document.createElement('div');
        animation.className = 'points-animation';
        animation.innerHTML = `+${points} points<br><small>${reason}</small>`;
        animation.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 15px 25px;
            border-radius: 50px;
            font-weight: bold;
            z-index: 10000;
            animation: floatUp 2s ease-out forwards;
        `;
        
        document.body.appendChild(animation);
        setTimeout(() => animation.remove(), 2000);
    }

    showLevelUpAnimation() {
        const levelUp = document.createElement('div');
        levelUp.className = 'level-up-animation';
        levelUp.innerHTML = `
            <div class="level-up-content">
                <div class="level-up-icon">🎉</div>
                <div class="level-up-text">LEVEL UP!</div>
                <div class="level-up-number">Level ${this.level}</div>
            </div>
        `;
        levelUp.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.5s;
        `;
        
        document.body.appendChild(levelUp);
        this.triggerConfetti();
        setTimeout(() => levelUp.remove(), 3000);
    }

    showStreakBroken(type, previousStreak) {
        const notification = document.createElement('div');
        notification.className = 'streak-broken-notification';
        notification.innerHTML = `
            <div class="streak-broken-content">
                <div class="streak-broken-icon">💔</div>
                <div class="streak-broken-text">
                    ${type.charAt(0).toUpperCase() + type.slice(1)} streak of ${previousStreak} days broken!
                    <br><small>Start again today!</small>
                </div>
            </div>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4757;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(255,71,87,0.3);
            z-index: 10000;
            animation: slideIn 0.5s;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    triggerConfetti() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        const confettiCount = 100;
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-particle';
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}%;
                top: -10px;
                opacity: ${Math.random() * 0.5 + 0.5};
                transform: rotate(${Math.random() * 360}deg);
                animation: confettiFall ${Math.random() * 2 + 3}s linear forwards;
                z-index: 10000;
            `;
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 5000);
        }
    }

    playAchievementSound() {
        // Create audio element for achievement sound
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi77OScTgwOUant1qllHQU7k9fy1HkuBSV5yO/eizYIHWq+8+OWT');
        audio.volume = 0.3;
        audio.play().catch(() => {}); // Ignore errors if audio can't play
    }

    updateUI() {
        // Update streak display in header
        this.updateStreakDisplay();
        
        // Update achievement gallery
        this.updateAchievementGallery();
        
        // Update progress bars
        this.updateProgressBars();
    }

    updateStreakDisplay() {
        let streakContainer = document.getElementById('streak-container');
        if (!streakContainer) {
            const header = document.querySelector('.header-top');
            if (header) {
                streakContainer = document.createElement('div');
                streakContainer.id = 'streak-container';
                streakContainer.className = 'streak-container';
                header.appendChild(streakContainer);
            }
        }
        
        if (streakContainer) {
            streakContainer.innerHTML = `
                <div class="streak-badge" title="Login Streak">
                    🔥 ${this.streaks.login} days
                </div>
                <div class="level-badge" title="Level ${this.level}">
                    ⭐ Lvl ${this.level}
                </div>
                <div class="points-badge" title="${this.points} points">
                    💎 ${this.points}
                </div>
            `;
        }
    }

    updateAchievementGallery() {
        // This will be called when we open the achievements modal
        const gallery = document.getElementById('achievement-gallery');
        if (gallery) {
            gallery.innerHTML = this.achievements.map(a => `
                <div class="achievement-card">
                    <div class="achievement-icon">${a.icon}</div>
                    <div class="achievement-name">${a.name}</div>
                    <div class="achievement-date">${new Date(a.unlockedAt).toLocaleDateString()}</div>
                </div>
            `).join('');
        }
    }

    updateProgressBars() {
        // Update level progress bar
        const levelProgress = document.getElementById('level-progress');
        if (levelProgress) {
            const pointsNeeded = this.level * 100;
            const percentage = (this.points / pointsNeeded) * 100;
            levelProgress.style.width = `${percentage}%`;
        }
    }

    // Helper methods for achievements
    getCompletedTasksCount() {
        return parseInt(localStorage.getItem('totalCompletedTasks') || '0');
    }

    getExpenseCount() {
        const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        return expenses.length;
    }

    checkSavingsGoal() {
        // Check if user stayed under budget for a month
        if (window.expenseManager) {
            const budget = window.expenseManager.budget.monthly;
            const spent = window.expenseManager.getMonthlyTotal();
            return budget > 0 && spent < budget * 0.8; // Saved 20%
        }
        return false;
    }

    checkHealthGoals() {
        // Check if user logged meals and water for 30 days straight
        return this.streaks.mealLogging >= 30 && this.streaks.waterIntake >= 30;
    }

    checkEarlyBird() {
        // Check if user logs in before 7 AM
        const hour = new Date().getHours();
        return hour < 7;
    }

    checkNightOwl() {
        // Check if user logs in after 11 PM
        const hour = new Date().getHours();
        return hour >= 23;
    }

    checkWeekendActivity() {
        // Check if user maintains streak on weekends
        const day = new Date().getDay();
        return (day === 0 || day === 6) && this.streaks.login >= 4;
    }

    checkPerfectDay() {
        // Check if user completed all daily goals
        const today = new Date().toDateString();
        const completedTasks = parseInt(localStorage.getItem(`tasks_${today}`) || '0');
        const loggedMeals = parseInt(localStorage.getItem(`meals_${today}`) || '0');
        const waterIntake = parseInt(localStorage.getItem(`water_${today}`) || '0');
        
        return completedTasks >= this.dailyGoals.tasks && 
               loggedMeals >= this.dailyGoals.meals && 
               waterIntake >= this.dailyGoals.water;
    }

    // Sync to Google Sheets
    async syncToSheets() {
        if (!window.todoApp || !window.todoApp.isAuthenticated || !window.todoApp.sheetId) return;
        
        try {
            // Ensure Gamification sheet exists
            await this.ensureGamificationSheet();
            
            // Prepare data for sheet
            const data = [
                ['Metric', 'Value', 'Last Updated'],
                ['Login Streak', this.streaks.login, new Date().toISOString()],
                ['Task Streak', this.streaks.taskCompletion, new Date().toISOString()],
                ['Expense Streak', this.streaks.expenseTracking, new Date().toISOString()],
                ['Meal Streak', this.streaks.mealLogging, new Date().toISOString()],
                ['Points', this.points, new Date().toISOString()],
                ['Level', this.level, new Date().toISOString()],
                ['Total Achievements', this.achievements.length, new Date().toISOString()]
            ];
            
            // Update sheet
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: window.todoApp.sheetId,
                range: 'Gamification!A1:C8',
                valueInputOption: 'USER_ENTERED',
                resource: { values: data }
            });
            
            console.log('Streaks synced to Google Sheets');
        } catch (error) {
            console.error('Error syncing streaks:', error);
        }
    }

    async ensureGamificationSheet() {
        if (!window.todoApp || !window.todoApp.sheetId) return;
        
        try {
            const response = await gapi.client.sheets.spreadsheets.get({
                spreadsheetId: window.todoApp.sheetId
            });
            
            const sheets = response.result.sheets;
            const gamificationSheet = sheets.find(sheet => sheet.properties.title === 'Gamification');
            
            if (!gamificationSheet) {
                await gapi.client.sheets.spreadsheets.batchUpdate({
                    spreadsheetId: window.todoApp.sheetId,
                    resource: {
                        requests: [{
                            addSheet: {
                                properties: {
                                    title: 'Gamification',
                                    gridProperties: {
                                        rowCount: 100,
                                        columnCount: 10
                                    }
                                }
                            }
                        }]
                    }
                });
                console.log('Gamification sheet created');
            }
        } catch (error) {
            console.error('Error ensuring gamification sheet:', error);
        }
    }
}

// Initialize StreakManager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.streakManager = new StreakManager();
});