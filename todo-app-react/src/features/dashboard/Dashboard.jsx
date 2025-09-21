import React, { useState, useEffect, useMemo } from 'react';
import useAppStore from '@/store/useAppStore';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  TaskIcon,
  AddIcon,
  MoneyIcon,
  NoteIcon,
  MealIcon,
  JournalIcon,
  HabitIcon,
  CaloriesIcon,
  ReminderIcon,
  DreamIcon,
  CheckIcon,
  GreetingIcon
} from '@/components/icons/Icons';

// Daily quotes - moved outside component to prevent recreation
const defaultQuotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    tasks,
    expenses,
    notes,
    habits,
    habitHistory,
    meals,
    callReminders,
    bucketList,
    journalEntries,
    quotes,
    setCurrentView
  } = useAppStore();

  const [currentQuote, setCurrentQuote] = useState(null);
  const [greeting, setGreeting] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    // Set initial quote
    const quotesToUse = quotes.length > 0 ? quotes : defaultQuotes;
    setCurrentQuote(quotesToUse[0]);
  }, [quotes]);

  // Auto-refresh quotes every 4 seconds
  useEffect(() => {
    const quotesToUse = quotes.length > 0 ? quotes : defaultQuotes;
    if (quotesToUse.length === 0) return;

    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % quotesToUse.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [quotes.length]);

  // Update current quote when index changes
  useEffect(() => {
    const quotesToUse = quotes.length > 0 ? quotes : defaultQuotes;
    if (quotesToUse.length > 0) {
      setCurrentQuote(quotesToUse[quoteIndex]);
    }
  }, [quoteIndex, quotes.length]);

  const nextQuote = () => {
    const quotesToUse = quotes.length > 0 ? quotes : defaultQuotes;
    setQuoteIndex(prev => (prev + 1) % quotesToUse.length);
  };

  const previousQuote = () => {
    const quotesToUse = quotes.length > 0 ? quotes : defaultQuotes;
    setQuoteIndex(prev => (prev - 1 + quotesToUse.length) % quotesToUse.length);
  };

  // Helper function to calculate journal streak
  const calculateJournalStreak = () => {
    if (journalEntries.length === 0) return 0;

    const sortedEntries = journalEntries
      .map(e => e.date)
      .sort((a, b) => new Date(b) - new Date(a));

    let streak = 1;
    const today = new Date();
    const latestEntry = new Date(sortedEntries[0]);
    const daysDiff = Math.floor((today - latestEntry) / (1000 * 60 * 60 * 24));

    if (daysDiff > 1) return 0;

    for (let i = 1; i < sortedEntries.length; i++) {
      const currentDate = new Date(sortedEntries[i - 1]);
      const prevDate = new Date(sortedEntries[i]);
      const diff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));

      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  // Calculate all metrics
  const metrics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.date === today);
    const completedTasks = todayTasks.filter(t => t.completed).length;
    const pendingTasks = todayTasks.filter(t => !t.completed).length;

    // Expense metrics
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthlyExpenses = expenses.filter(e => {
      const date = new Date(e.date);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });
    const monthlyTotal = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Habit metrics
    const activeHabits = habits.length;
    const habitsCompletedToday = habits.filter(h => {
      return habitHistory[h.id] && habitHistory[h.id][today];
    }).length;

    // Meal metrics
    const todayMeals = meals.filter(m => m.date === today);
    const todayCalories = todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);

    // Reminder metrics
    const upcomingReminders = callReminders.filter(r => {
      const reminderDate = new Date(r.date);
      const now = new Date();
      const daysDiff = Math.ceil((reminderDate - now) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0 && daysDiff <= 7;
    }).length;

    // Bucket list metrics
    const bucketInProgress = bucketList.filter(b => b.status === 'in-progress').length;
    const bucketCompleted = bucketList.filter(b => b.status === 'completed').length;

    // Journal metrics
    const hasJournalToday = journalEntries.some(j => j.date === today);
    const journalStreak = calculateJournalStreak();

    return {
      todayTasks: todayTasks.length,
      completedTasks,
      pendingTasks,
      taskCompletionRate: todayTasks.length > 0 ? Math.round((completedTasks / todayTasks.length) * 100) : 0,
      monthlyExpenses: monthlyTotal,
      notesCount: notes.length,
      activeHabits,
      habitsCompletedToday,
      habitCompletionRate: activeHabits > 0 ? Math.round((habitsCompletedToday / activeHabits) * 100) : 0,
      todayCalories,
      upcomingReminders,
      bucketInProgress,
      bucketCompleted,
      hasJournalToday,
      journalStreak
    };
  }, [tasks, expenses, notes, habits, habitHistory, meals, callReminders, bucketList, journalEntries]);

  const quickActions = [
    { id: 'tasks', label: 'Add Task', icon: AddIcon, color: 'bg-blue-500', path: '/tasks' },
    { id: 'expenses', label: 'Log Expense', icon: MoneyIcon, color: 'bg-green-500', path: '/expenses' },
    { id: 'notes', label: 'New Note', icon: NoteIcon, color: 'bg-purple-500', path: '/notes' },
    { id: 'meals', label: 'Log Meal', icon: MealIcon, color: 'bg-orange-500', path: '/meals' },
    { id: 'alarms', label: 'Set Alarm', icon: '⏰', color: 'bg-red-500', path: '/alarms', isEmoji: true },
    { id: 'reminders', label: 'Add Reminder', icon: '🔔', color: 'bg-yellow-500', path: '/reminders', isEmoji: true },
    { id: 'journal', label: 'Write Journal', icon: JournalIcon, color: 'bg-pink-500', path: '/journal' },
    { id: 'habits', label: 'Track Habits', icon: HabitIcon, color: 'bg-indigo-500', path: '/habits' }
  ];

  const handleQuickAction = (action) => {
    setCurrentView(action.id);
    navigate(action.path);
  };

  return (
    <div className="dashboard">
      {/* Header with Greeting and Quote */}
      <div className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-white p-6 glass-card"
          style={{ backgroundColor: 'rgb(48, 61, 89)' }}
        >
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold">{greeting}!</h1>
            <GreetingIcon className="w-8 h-8 text-white" />
          </div>
          <p className="text-base sm:text-lg mb-4">Here's your overview for today</p>
          
          {currentQuote && (
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={previousQuote}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  title="Previous quote"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex-1 text-center px-2">
                  <p className="text-sm sm:text-lg italic">"{currentQuote.text}"</p>
                </div>
                <button
                  onClick={nextQuote}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  title="Next quote"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-right">— {currentQuote.author}</p>
              <div className="flex justify-center mt-2">
                {(quotes.length > 0 ? quotes : defaultQuotes).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setQuoteIndex(index)}
                    className={`w-2 mx-1 rounded-full transition-colors ${
                      index === quoteIndex ? 'bg-white' : 'bg-white/40'
                    }`}
                    style={{ minHeight: '8px', height: '8px' }}
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => handleQuickAction(action)}
              className={`${action.color} text-white p-4 rounded-lg flex flex-col items-center justify-center hover:shadow-lg transition-all duration-300 hover:scale-105`}
            >
              {action.isEmoji ? (
                <span className="text-2xl sm:text-3xl mb-2">{action.icon}</span>
              ) : (
                <action.icon className="w-8 h-8 mb-2 text-white" />
              )}
              <span className="text-xs font-medium">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {/* Tasks */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="ultra-card hover-lift p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <CheckIcon className="w-6 h-6 text-green-500" />
            <span className="text-sm text-gray-500">Tasks</span>
          </div>
          <p className="text-2xl font-bold">{metrics.completedTasks}/{metrics.todayTasks}</p>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${metrics.taskCompletionRate}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{metrics.taskCompletionRate}% complete</p>
        </motion.div>

        {/* Habits */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="ultra-card hover-lift p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <HabitIcon className="w-6 h-6 text-blue-500" />
            <span className="text-sm text-gray-500">Habits</span>
          </div>
          <p className="text-2xl font-bold">{metrics.habitsCompletedToday}/{metrics.activeHabits}</p>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all"
              style={{ width: `${metrics.habitCompletionRate}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{metrics.habitCompletionRate}% done today</p>
        </motion.div>

        {/* Expenses */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="ultra-card hover-lift p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <MoneyIcon className="w-6 h-6 text-green-600" />
            <span className="text-sm text-gray-500">Month Spend</span>
          </div>
          <p className="text-2xl font-bold">${metrics.monthlyExpenses.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">This month</p>
        </motion.div>

        {/* Calories */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="ultra-card hover-lift p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <CaloriesIcon className="w-6 h-6 text-orange-500" />
            <span className="text-sm text-gray-500">Calories</span>
          </div>
          <p className="text-2xl font-bold">{metrics.todayCalories}</p>
          <p className="text-xs text-gray-500 mt-1">Today</p>
        </motion.div>

        {/* Journal */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="ultra-card hover-lift p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <JournalIcon className="w-6 h-6 text-purple-500" />
            <span className="text-sm text-gray-500">Journal</span>
          </div>
          <p className="text-2xl font-bold">{metrics.journalStreak} days</p>
          <p className="text-xs text-gray-500 mt-1">
            {metrics.hasJournalToday ? (
              <span className="flex items-center gap-1 text-green-600">
                <CheckIcon className="w-3 h-3" /> Written today
              </span>
            ) : (
              <span className="text-orange-500">Write today</span>
            )}
          </p>
        </motion.div>

        {/* Reminders */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="ultra-card hover-lift p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <ReminderIcon className="w-6 h-6 text-red-500" />
            <span className="text-sm text-gray-500">Reminders</span>
          </div>
          <p className="text-2xl font-bold">{metrics.upcomingReminders}</p>
          <p className="text-xs text-gray-500 mt-1">Next 7 days</p>
        </motion.div>

        {/* Notes */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="ultra-card hover-lift p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <NoteIcon className="w-6 h-6 text-purple-600" />
            <span className="text-sm text-gray-500">Notes</span>
          </div>
          <p className="text-2xl font-bold">{metrics.notesCount}</p>
          <p className="text-xs text-gray-500 mt-1">Total notes</p>
        </motion.div>

        {/* Bucket List */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="ultra-card hover-lift p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <DreamIcon className="w-6 h-6 text-yellow-500" />
            <span className="text-sm text-gray-500">Dreams</span>
          </div>
          <p className="text-2xl font-bold">{metrics.bucketCompleted}/{bucketList.length}</p>
          <p className="text-xs text-gray-500 mt-1">{metrics.bucketInProgress} in progress</p>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="ultra-card p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {tasks.slice(0, 5).map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
            >
              <input
                type="checkbox"
                checked={task.completed}
                className="w-5 h-5"
                readOnly
              />
              <span className={task.completed ? 'line-through text-gray-500' : ''}>
                {task.text}
              </span>
              <span className="ml-auto text-xs text-gray-500">{task.date}</span>
            </motion.div>
          ))}
          
          {tasks.length === 0 && (
            <p className="text-center text-gray-500 py-4">No recent tasks</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;