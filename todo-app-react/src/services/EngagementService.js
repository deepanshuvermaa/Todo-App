// User Engagement & Retention Service
// Gamification, achievements, streaks, and daily challenges

class EngagementService {
  constructor() {
    this.userStats = {
      dailyStreak: 0,
      totalPoints: 0,
      level: 1,
      achievements: [],
      lastVisit: null,
      totalTasksCompleted: 0,
      totalTimeUsed: 0,
      favoriteFeatures: {},
      dailyGoals: {},
      weeklyProgress: {}
    };

    this.achievements = this.defineAchievements();
    this.dailyChallenges = this.defineDailyChallenges();
    this.rewards = this.defineRewards();
    this.motivationalQuotes = this.defineMotivationalQuotes();

    this.init();
  }

  async init() {
    // Load user stats
    this.loadUserStats();

    // Check daily visit
    this.checkDailyVisit();

    // Initialize daily challenges
    this.initializeDailyChallenges();

    // Setup notifications
    this.setupDailyReminders();
  }

  defineAchievements() {
    return [
      // Onboarding Achievements
      {
        id: 'first_task',
        name: 'First Step',
        description: 'Complete your first task',
        icon: '🎯',
        points: 10,
        condition: (stats) => stats.totalTasksCompleted >= 1
      },
      {
        id: 'profile_complete',
        name: 'All Set Up',
        description: 'Complete your profile setup',
        icon: '✅',
        points: 20,
        condition: (stats) => stats.profileComplete
      },

      // Streak Achievements
      {
        id: 'streak_3',
        name: 'Getting Started',
        description: '3-day streak',
        icon: '🔥',
        points: 30,
        condition: (stats) => stats.dailyStreak >= 3
      },
      {
        id: 'streak_7',
        name: 'Week Warrior',
        description: '7-day streak',
        icon: '💪',
        points: 70,
        condition: (stats) => stats.dailyStreak >= 7
      },
      {
        id: 'streak_30',
        name: 'Habit Former',
        description: '30-day streak',
        icon: '🏆',
        points: 300,
        condition: (stats) => stats.dailyStreak >= 30
      },
      {
        id: 'streak_100',
        name: 'Centurion',
        description: '100-day streak',
        icon: '💎',
        points: 1000,
        condition: (stats) => stats.dailyStreak >= 100
      },

      // Task Achievements
      {
        id: 'tasks_10',
        name: 'Task Master',
        description: 'Complete 10 tasks',
        icon: '📝',
        points: 50,
        condition: (stats) => stats.totalTasksCompleted >= 10
      },
      {
        id: 'tasks_50',
        name: 'Productivity Pro',
        description: 'Complete 50 tasks',
        icon: '⚡',
        points: 200,
        condition: (stats) => stats.totalTasksCompleted >= 50
      },
      {
        id: 'tasks_100',
        name: 'Achievement Hunter',
        description: 'Complete 100 tasks',
        icon: '🎖️',
        points: 500,
        condition: (stats) => stats.totalTasksCompleted >= 100
      },

      // Feature Usage Achievements
      {
        id: 'voice_user',
        name: 'Voice Commander',
        description: 'Use voice commands 10 times',
        icon: '🎤',
        points: 40,
        condition: (stats) => (stats.favoriteFeatures.voice || 0) >= 10
      },
      {
        id: 'expense_tracker',
        name: 'Money Manager',
        description: 'Track 20 expenses',
        icon: '💰',
        points: 60,
        condition: (stats) => (stats.favoriteFeatures.expenses || 0) >= 20
      },
      {
        id: 'habit_builder',
        name: 'Habit Builder',
        description: 'Track 5 habits for a week',
        icon: '🎯',
        points: 80,
        condition: (stats) => (stats.favoriteFeatures.habits || 0) >= 35
      },
      {
        id: 'meal_logger',
        name: 'Nutrition Ninja',
        description: 'Log 30 meals',
        icon: '🥗',
        points: 70,
        condition: (stats) => (stats.favoriteFeatures.meals || 0) >= 30
      },

      // Special Achievements
      {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Complete 5 tasks before 9 AM',
        icon: '🌅',
        points: 50,
        condition: (stats) => (stats.earlyTasks || 0) >= 5
      },
      {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Complete 5 tasks after 9 PM',
        icon: '🦉',
        points: 50,
        condition: (stats) => (stats.lateTasks || 0) >= 5
      },
      {
        id: 'weekend_warrior',
        name: 'Weekend Warrior',
        description: 'Use the app every weekend for a month',
        icon: '🌟',
        points: 100,
        condition: (stats) => (stats.weekendUsage || 0) >= 8
      },
      {
        id: 'perfect_week',
        name: 'Perfect Week',
        description: 'Complete all daily goals for 7 days',
        icon: '⭐',
        points: 150,
        condition: (stats) => (stats.perfectWeeks || 0) >= 1
      }
    ];
  }

  defineDailyChallenges() {
    const challenges = {
      monday: [
        { id: 'monday_planning', task: 'Plan your week', points: 20, icon: '📅' },
        { id: 'monday_goals', task: 'Set 3 goals for the week', points: 15, icon: '🎯' }
      ],
      tuesday: [
        { id: 'tuesday_habits', task: 'Complete all habits', points: 20, icon: '✅' },
        { id: 'tuesday_expense', task: 'Log today\'s expenses', points: 10, icon: '💰' }
      ],
      wednesday: [
        { id: 'wednesday_meal', task: 'Log all meals with nutrition', points: 25, icon: '🍽️' },
        { id: 'wednesday_voice', task: 'Use voice command 3 times', points: 15, icon: '🎤' }
      ],
      thursday: [
        { id: 'thursday_journal', task: 'Write in your journal', points: 20, icon: '📖' },
        { id: 'thursday_review', task: 'Review and update tasks', points: 15, icon: '📝' }
      ],
      friday: [
        { id: 'friday_complete', task: 'Complete 5 tasks', points: 25, icon: '🏁' },
        { id: 'friday_organize', task: 'Organize notes', points: 15, icon: '📂' }
      ],
      saturday: [
        { id: 'saturday_bucket', task: 'Add to bucket list', points: 20, icon: '🪣' },
        { id: 'saturday_movie', task: 'Find a movie to watch', points: 10, icon: '🎬' }
      ],
      sunday: [
        { id: 'sunday_reflect', task: 'Weekly reflection', points: 25, icon: '🤔' },
        { id: 'sunday_prepare', task: 'Prepare for next week', points: 20, icon: '🚀' }
      ]
    };

    return challenges;
  }

  defineRewards() {
    return [
      { points: 50, reward: 'Unlock custom theme', type: 'theme', id: 'custom_theme_1' },
      { points: 100, reward: 'Premium badge', type: 'badge', id: 'premium_badge_1' },
      { points: 200, reward: 'Advanced voice commands', type: 'feature', id: 'voice_advanced' },
      { points: 300, reward: 'Export to PDF', type: 'feature', id: 'export_pdf' },
      { points: 500, reward: 'AI Assistant', type: 'feature', id: 'ai_assistant' },
      { points: 1000, reward: 'Lifetime Pro', type: 'upgrade', id: 'lifetime_pro' }
    ];
  }

  defineMotivationalQuotes() {
    return [
      { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
      { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
      { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
      { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
      { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
      { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
      { text: "A year from now, you'll wish you had started today.", author: "Karen Lamb" },
      { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
      { text: "Your limitation—it's only your imagination.", author: "Unknown" },
      { text: "Great things never come from comfort zones.", author: "Unknown" }
    ];
  }

  // Daily visit tracking
  checkDailyVisit() {
    const today = new Date().toDateString();
    const lastVisit = this.userStats.lastVisit;

    if (!lastVisit) {
      // First visit
      this.userStats.dailyStreak = 1;
      this.userStats.lastVisit = today;
      this.showWelcomeMessage();
    } else if (lastVisit !== today) {
      const lastVisitDate = new Date(lastVisit);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastVisitDate.toDateString() === yesterday.toDateString()) {
        // Consecutive day - increase streak
        this.userStats.dailyStreak++;
        this.showStreakMessage(this.userStats.dailyStreak);
      } else {
        // Streak broken
        if (this.userStats.dailyStreak > 2) {
          this.showStreakBrokenMessage(this.userStats.dailyStreak);
        }
        this.userStats.dailyStreak = 1;
      }

      this.userStats.lastVisit = today;
    }

    this.saveUserStats();
    this.checkAchievements();
  }

  // Initialize daily challenges
  initializeDailyChallenges() {
    const today = new Date();
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today.getDay()];
    const todaysChallenges = this.dailyChallenges[dayName];

    // Reset daily progress
    const todayStr = today.toDateString();
    if (!this.userStats.dailyGoals[todayStr]) {
      this.userStats.dailyGoals[todayStr] = {
        challenges: todaysChallenges,
        completed: [],
        points: 0
      };
    }

    return todaysChallenges;
  }

  // Complete a daily challenge
  completeDailyChallenge(challengeId) {
    const today = new Date().toDateString();
    const dailyGoal = this.userStats.dailyGoals[today];

    if (dailyGoal && !dailyGoal.completed.includes(challengeId)) {
      const challenge = dailyGoal.challenges.find(c => c.id === challengeId);
      if (challenge) {
        dailyGoal.completed.push(challengeId);
        dailyGoal.points += challenge.points;
        this.userStats.totalPoints += challenge.points;

        this.checkLevelUp();
        this.saveUserStats();

        return {
          success: true,
          points: challenge.points,
          totalPoints: this.userStats.totalPoints
        };
      }
    }

    return { success: false };
  }

  // Check for new achievements
  checkAchievements() {
    const newAchievements = [];

    this.achievements.forEach(achievement => {
      if (!this.userStats.achievements.includes(achievement.id)) {
        if (achievement.condition(this.userStats)) {
          this.userStats.achievements.push(achievement.id);
          this.userStats.totalPoints += achievement.points;
          newAchievements.push(achievement);
        }
      }
    });

    if (newAchievements.length > 0) {
      this.showAchievementNotification(newAchievements);
      this.checkLevelUp();
      this.saveUserStats();
    }

    return newAchievements;
  }

  // Level up system
  checkLevelUp() {
    const pointsPerLevel = 100;
    const newLevel = Math.floor(this.userStats.totalPoints / pointsPerLevel) + 1;

    if (newLevel > this.userStats.level) {
      const levelsGained = newLevel - this.userStats.level;
      this.userStats.level = newLevel;
      this.showLevelUpNotification(newLevel, levelsGained);

      // Unlock rewards
      this.checkRewards();
    }
  }

  // Check for unlocked rewards
  checkRewards() {
    const unlockedRewards = this.rewards.filter(
      reward => this.userStats.totalPoints >= reward.points
    );

    return unlockedRewards;
  }

  // Setup daily reminders
  setupDailyReminders() {
    // Morning motivation (9 AM)
    this.scheduleNotification(9, 0, {
      title: '🌅 Good Morning!',
      body: 'Ready to make today productive? Check your daily challenges!',
      tag: 'morning-motivation'
    });

    // Afternoon check-in (2 PM)
    this.scheduleNotification(14, 0, {
      title: '☀️ Afternoon Check-in',
      body: 'How\'s your day going? Don\'t forget to log your progress!',
      tag: 'afternoon-checkin'
    });

    // Evening reminder (7 PM)
    this.scheduleNotification(19, 0, {
      title: '🌙 Evening Reminder',
      body: 'End your day strong! Review your tasks and plan for tomorrow.',
      tag: 'evening-reminder'
    });

    // Streak reminder (9 PM)
    this.scheduleNotification(21, 0, {
      title: `🔥 Keep Your ${this.userStats.dailyStreak} Day Streak!`,
      body: 'Don\'t break your streak! Complete at least one task.',
      tag: 'streak-reminder'
    });
  }

  // Schedule notification at specific time
  scheduleNotification(hour, minute, notification) {
    const now = new Date();
    const scheduled = new Date();
    scheduled.setHours(hour, minute, 0, 0);

    if (scheduled <= now) {
      scheduled.setDate(scheduled.getDate() + 1);
    }

    const timeout = scheduled.getTime() - now.getTime();

    setTimeout(() => {
      this.showNotification(notification);
      // Reschedule for next day
      this.scheduleNotification(hour, minute, notification);
    }, timeout);
  }

  // Show notifications
  showNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.tag
      });
    }
  }

  // Show achievement notification
  showAchievementNotification(achievements) {
    achievements.forEach(achievement => {
      this.showNotification({
        title: `🏆 Achievement Unlocked!`,
        body: `${achievement.name}: ${achievement.description} (+${achievement.points} points)`,
        tag: `achievement-${achievement.id}`
      });
    });
  }

  // Show level up notification
  showLevelUpNotification(level, levelsGained) {
    this.showNotification({
      title: `🎉 Level ${level}!`,
      body: `Congratulations! You've reached level ${level}!`,
      tag: 'level-up'
    });
  }

  // Show streak messages
  showStreakMessage(streak) {
    const messages = {
      3: "🔥 3 days! You're building momentum!",
      7: "💪 One week strong! Keep it up!",
      14: "⚡ Two weeks! You're unstoppable!",
      30: "🏆 One month! You're a productivity champion!",
      100: "💎 100 days! You're a legend!"
    };

    if (messages[streak]) {
      this.showNotification({
        title: `🔥 ${streak} Day Streak!`,
        body: messages[streak],
        tag: 'streak-milestone'
      });
    }
  }

  // Show streak broken message
  showStreakBrokenMessage(lostStreak) {
    this.showNotification({
      title: '😔 Streak Broken',
      body: `You lost your ${lostStreak} day streak. Start a new one today!`,
      tag: 'streak-broken'
    });
  }

  // Show welcome message
  showWelcomeMessage() {
    const quote = this.getRandomQuote();
    this.showNotification({
      title: '👋 Welcome Back!',
      body: quote.text,
      tag: 'welcome'
    });
  }

  // Get random motivational quote
  getRandomQuote() {
    return this.motivationalQuotes[
      Math.floor(Math.random() * this.motivationalQuotes.length)
    ];
  }

  // Track feature usage
  trackFeatureUsage(feature) {
    if (!this.userStats.favoriteFeatures[feature]) {
      this.userStats.favoriteFeatures[feature] = 0;
    }
    this.userStats.favoriteFeatures[feature]++;

    // Check related achievements
    this.checkAchievements();
    this.saveUserStats();
  }

  // Get user progress summary
  getProgressSummary() {
    const today = new Date().toDateString();
    const dailyGoal = this.userStats.dailyGoals[today];

    return {
      streak: this.userStats.dailyStreak,
      level: this.userStats.level,
      points: this.userStats.totalPoints,
      nextLevelPoints: (this.userStats.level * 100),
      achievements: this.userStats.achievements.length,
      totalAchievements: this.achievements.length,
      dailyChallenges: dailyGoal ? {
        total: dailyGoal.challenges.length,
        completed: dailyGoal.completed.length,
        points: dailyGoal.points
      } : null,
      unlockedRewards: this.checkRewards()
    };
  }

  // Save user stats
  saveUserStats() {
    try {
      localStorage.setItem('userEngagementStats', JSON.stringify(this.userStats));
    } catch (error) {
      console.error('Error saving user stats:', error);
    }
  }

  // Load user stats
  loadUserStats() {
    try {
      const saved = localStorage.getItem('userEngagementStats');
      if (saved) {
        this.userStats = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  }
}

export default new EngagementService();