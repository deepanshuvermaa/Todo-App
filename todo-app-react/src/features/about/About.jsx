import React from 'react';
import { motion } from 'framer-motion';
import useAppStore from '@/store/useAppStore';

const About = () => {
  const {
    tasks,
    expenses,
    notes,
    habits,
    meals,
    callReminders,
    bucketList,
    journalEntries,
    isAuthenticated,
    userEmail
  } = useAppStore();

  const features = [
    {
      icon: '✓',
      title: 'Smart Task Management',
      description: 'Track daily tasks with automatic rollover for unfinished items. Never lose track of what needs to be done.'
    },
    {
      icon: '☁️',
      title: 'Cloud Sync',
      description: 'Real-time sync across all your devices. Your data updates instantly with Supabase backend.'
    },
    {
      icon: '💰',
      title: 'Expense Tracking',
      description: 'Comprehensive expense tracking with category-wise monthly budgets and budget alerts.'
    },
    {
      icon: '🍽️',
      title: 'Meal & Nutrition Logging',
      description: 'Track your daily meals and nutrition intake with detailed logging and calorie tracking.'
    },
    {
      icon: '🎯',
      title: 'Habit Formation',
      description: 'Build positive habits with streak tracking and visual progress indicators.'
    },
    {
      icon: '📝',
      title: 'Smart Notes',
      description: 'Rich text notes with folders, tags, and organize your thoughts in one place.'
    },
    {
      icon: '📖',
      title: 'Daily Journaling',
      description: 'Reflect on your day with structured journal entries and personal growth tracking.'
    },
    {
      icon: '📞',
      title: 'Call Reminders',
      description: 'Never forget to call important people with smart reminder system.'
    },
    {
      icon: '🏆',
      title: 'Bucket List Goals',
      description: 'Track your life goals and dreams with detailed progress monitoring.'
    },
    {
      icon: '📸',
      title: 'OCR Text Extraction',
      description: 'Extract text from images using advanced Tesseract.js OCR with multiple languages.'
    },
    {
      icon: '🔗',
      title: 'Link Management',
      description: 'Save and organize important links with automatic previews and categorization.'
    },
    {
      icon: '🎬',
      title: 'Movie Recommendations',
      description: 'Track movies, get smart recommendations, and manage your watchlist.'
    },
    {
      icon: '📱',
      title: 'Progressive Web App',
      description: 'Install on any device and use offline. Works seamlessly across desktop and mobile.'
    },
    {
      icon: '🌙',
      title: 'Dark Mode Support',
      description: 'Easy on the eyes with beautiful dark theme that adapts to your preferences.'
    },
    {
      icon: '⏰',
      title: 'Alarms & Reminders',
      description: 'Set alarms, schedule reminders, and never miss important moments.'
    },
    {
      icon: '🔒',
      title: 'Privacy First',
      description: 'Your data stays private. Secure authentication and encrypted cloud storage with Supabase.'
    }
  ];

  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.completed).length,
    totalExpenses: expenses.length,
    totalNotes: notes.length,
    totalHabits: habits.length,
    totalMeals: meals.length,
    totalReminders: callReminders.length,
    totalBucketItems: bucketList.length,
    totalJournalEntries: journalEntries.length
  };


  return (
    <div className="about max-w-6xl mx-auto">
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About LIFE
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            A comprehensive life management application designed for individuals who want to track
            every aspect of their daily life - from tasks and expenses to meals and personal goals.
          </p>
        </motion.div>
      </div>

      {/* User Stats */}
      {isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-600 rounded-lg p-6 mb-8 text-white"
        >
          <h2 className="text-2xl font-bold mb-4">Your Life in Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.totalTasks}</div>
              <div className="text-sm opacity-90">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.completedTasks}</div>
              <div className="text-sm opacity-90">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.totalExpenses}</div>
              <div className="text-sm opacity-90">Expenses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.totalNotes}</div>
              <div className="text-sm opacity-90">Notes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.totalHabits}</div>
              <div className="text-sm opacity-90">Habits</div>
            </div>
          </div>
          {userEmail && (
            <p className="text-center mt-4 opacity-90">
              Connected as: {userEmail}
            </p>
          )}
        </motion.div>
      )}

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Powerful Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>


      {/* App Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {/* Why This App */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Why LIFE?
          </h3>
          <div className="space-y-3 text-gray-600 dark:text-gray-400">
            <p>
              <strong>All-in-One Solution:</strong> Instead of using multiple apps, manage your entire
              life from one unified interface - tasks, notes, expenses, habits, and more.
            </p>
            <p>
              <strong>Privacy & Security:</strong> Your data is encrypted and stored securely with Supabase.
              Only you control your information with your personal account.
            </p>
            <p>
              <strong>Works Everywhere:</strong> Progressive Web App technology means it works
              seamlessly on any device, online or offline. Install like a native app.
            </p>
            <p>
              <strong>Real-Time Sync:</strong> All changes sync instantly across your devices so you're
              always up-to-date wherever you are.
            </p>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Getting Started
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
              <p className="text-gray-600 dark:text-gray-400">
                Sign up with your email and create a secure account
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
              <p className="text-gray-600 dark:text-gray-400">
                Start adding tasks, expenses, notes, and other life data
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
              <p className="text-gray-600 dark:text-gray-400">
                Install as app for offline access and native experience
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">4</span>
              <p className="text-gray-600 dark:text-gray-400">
                Access your data across all devices in real-time
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center mt-12 py-8 border-t border-gray-200 dark:border-gray-700"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          LIFE - Your Complete Life Management Solution
        </p>
        <div className="flex justify-center gap-4 text-sm">
          <span>Version 2.0.0</span>
          <span>•</span>
          <span>Built with ❤️ using React</span>
          <span>•</span>
          <span>Privacy Focused</span>
        </div>
      </motion.div>
    </div>
  );
};

export default About;