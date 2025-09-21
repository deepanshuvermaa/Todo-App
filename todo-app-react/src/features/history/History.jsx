import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useAppStore from '@/store/useAppStore';

const History = () => {
  const {
    tasks,
    expenses,
    notes,
    habits,
    meals,
    callReminders,
    bucketList,
    journalEntries,
    lastSyncTime
  } = useAppStore();

  const [historyData, setHistoryData] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');

  const filters = [
    { value: 'all', label: 'All Activities', icon: '📊' },
    { value: 'tasks', label: 'Tasks', icon: '✅' },
    { value: 'expenses', label: 'Expenses', icon: '💰' },
    { value: 'notes', label: 'Notes', icon: '📝' },
    { value: 'habits', label: 'Habits', icon: '🎯' },
    { value: 'meals', label: 'Meals', icon: '🍽️' },
    { value: 'reminders', label: 'Reminders', icon: '📞' },
    { value: 'bucket', label: 'Bucket List', icon: '🏆' },
    { value: 'journal', label: 'Journal', icon: '📖' }
  ];

  const timeframes = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  useEffect(() => {
    generateHistoryData();
  }, [tasks, expenses, notes, habits, meals, callReminders, bucketList, journalEntries]);

  const generateHistoryData = () => {
    const history = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Process tasks
    tasks.forEach(task => {
      if (task.createdAt) {
        history.push({
          id: `task-${task.id}`,
          type: 'tasks',
          action: 'created',
          title: `Created task: ${task.text}`,
          description: task.text,
          timestamp: task.createdAt,
          icon: '✅',
          data: task
        });
      }
      if (task.completed && task.completedAt) {
        history.push({
          id: `task-completed-${task.id}`,
          type: 'tasks',
          action: 'completed',
          title: `Completed task: ${task.text}`,
          description: task.text,
          timestamp: task.completedAt,
          icon: '✓',
          data: task
        });
      }
    });

    // Process expenses
    expenses.forEach(expense => {
      if (expense.createdAt) {
        history.push({
          id: `expense-${expense.id}`,
          type: 'expenses',
          action: 'added',
          title: `Added expense: ₹${expense.amount}`,
          description: `${expense.description} (${expense.category})`,
          timestamp: expense.createdAt,
          icon: '💰',
          data: expense
        });
      }
    });

    // Process notes
    notes.forEach(note => {
      if (note.createdAt) {
        history.push({
          id: `note-${note.id}`,
          type: 'notes',
          action: 'created',
          title: `Created note: ${note.title}`,
          description: note.title,
          timestamp: note.createdAt,
          icon: '📝',
          data: note
        });
      }
      if (note.updatedAt && note.updatedAt !== note.createdAt) {
        history.push({
          id: `note-updated-${note.id}`,
          type: 'notes',
          action: 'updated',
          title: `Updated note: ${note.title}`,
          description: note.title,
          timestamp: note.updatedAt,
          icon: '📝',
          data: note
        });
      }
    });

    // Process habits
    habits.forEach(habit => {
      if (habit.createdAt) {
        history.push({
          id: `habit-${habit.id}`,
          type: 'habits',
          action: 'created',
          title: `Created habit: ${habit.name}`,
          description: `${habit.name} - ${habit.frequency}`,
          timestamp: habit.createdAt,
          icon: '🎯',
          data: habit
        });
      }
    });

    // Process meals
    meals.forEach(meal => {
      if (meal.createdAt) {
        history.push({
          id: `meal-${meal.id}`,
          type: 'meals',
          action: 'logged',
          title: `Logged ${meal.type}: ${meal.name}`,
          description: `${meal.name} - ${meal.calories} cal`,
          timestamp: meal.createdAt,
          icon: '🍽️',
          data: meal
        });
      }
    });

    // Process reminders
    callReminders.forEach(reminder => {
      if (reminder.createdAt) {
        history.push({
          id: `reminder-${reminder.id}`,
          type: 'reminders',
          action: 'created',
          title: `Created reminder: ${reminder.name}`,
          description: `Call ${reminder.name} - ${reminder.phone}`,
          timestamp: reminder.createdAt,
          icon: '📞',
          data: reminder
        });
      }
      if (reminder.completed && reminder.completedAt) {
        history.push({
          id: `reminder-completed-${reminder.id}`,
          type: 'reminders',
          action: 'completed',
          title: `Completed call: ${reminder.name}`,
          description: `Called ${reminder.name}`,
          timestamp: reminder.completedAt,
          icon: '✓',
          data: reminder
        });
      }
    });

    // Process bucket list
    bucketList.forEach(item => {
      if (item.createdAt) {
        history.push({
          id: `bucket-${item.id}`,
          type: 'bucket',
          action: 'added',
          title: `Added goal: ${item.title}`,
          description: item.title,
          timestamp: item.createdAt,
          icon: '🏆',
          data: item
        });
      }
      if (item.status === 'completed' && item.completedAt) {
        history.push({
          id: `bucket-completed-${item.id}`,
          type: 'bucket',
          action: 'completed',
          title: `Achieved goal: ${item.title}`,
          description: item.title,
          timestamp: item.completedAt,
          icon: '🎉',
          data: item
        });
      }
    });

    // Process journal entries
    journalEntries.forEach(entry => {
      if (entry.updatedAt) {
        history.push({
          id: `journal-${entry.id}`,
          type: 'journal',
          action: 'wrote',
          title: `Journal entry for ${entry.date}`,
          description: entry.content?.substring(0, 100) + '...',
          timestamp: entry.updatedAt,
          icon: '📖',
          data: entry
        });
      }
    });

    // Sort by timestamp (newest first)
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setHistoryData(history);
  };

  const filterHistoryData = () => {
    let filtered = [...historyData];

    // Filter by type
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(item => item.type === selectedFilter);
    }

    // Filter by timeframe
    if (selectedTimeframe !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      filtered = filtered.filter(item => {
        const itemDate = new Date(item.timestamp);
        switch (selectedTimeframe) {
          case 'today':
            return itemDate >= today;
          case 'week':
            return itemDate >= thisWeek;
          case 'month':
            return itemDate >= thisMonth;
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const getActivityStats = () => {
    const stats = {
      total: historyData.length,
      today: 0,
      week: 0,
      month: 0
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    historyData.forEach(item => {
      const itemDate = new Date(item.timestamp);
      if (itemDate >= today) stats.today++;
      if (itemDate >= thisWeek) stats.week++;
      if (itemDate >= thisMonth) stats.month++;
    });

    return stats;
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(historyData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'activity-history.json';
    link.click();
  };

  const filteredData = filterHistoryData();
  const stats = getActivityStats();

  return (
    <div className="history max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📊 Activity History
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your productivity and see all your activities in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Stats Cards */}
        <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Activities</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{stats.today}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Today</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">{stats.week}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">This Week</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">{stats.month}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">This Month</div>
          </div>
        </div>

        {/* Filters */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Filter by Type</label>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                {filters.map(filter => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Timeframe</label>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                {timeframes.map(timeframe => (
                  <option key={timeframe.value} value={timeframe.value}>
                    {timeframe.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={exportHistory}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                📤 Export
              </button>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold">Activity Timeline</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredData.length} activities
                {lastSyncTime && (
                  <span className="ml-2">• Last sync: {new Date(lastSyncTime).toLocaleString()}</span>
                )}
              </p>
            </div>

            <div className="p-6">
              {filteredData.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-lg font-semibold mb-2">No activities found</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedFilter !== 'all' || selectedTimeframe !== 'all'
                      ? 'Try adjusting your filters to see more activities.'
                      : 'Start using the app to see your activity history here!'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredData.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <div className="text-2xl">{item.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                            {item.type}
                          </span>
                          <span>•</span>
                          <span>{new Date(item.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;