import React, { useState, useMemo } from 'react';
import useAppStore from '@/store/useAppStore';
import HabitCard from './HabitCard';
import HabitForm from './HabitForm';
import HabitStats from './HabitStats';
import HabitCalendar from './HabitCalendar';
import ConfirmDialog from '@/components/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';

const HabitTracker = () => {
  const { habits, habitHistory, addHabit, updateHabit, deleteHabit, toggleHabitDay } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid, list, calendar
  const [confirmState, setConfirmState] = useState(null);

  // Calculate streaks and statistics
  const habitsWithStats = useMemo(() => {
    return habits.map(habit => {
      const history = habitHistory[habit.id] || {};
      const dates = Object.keys(history).sort();

      // Calculate current streak
      let currentStreak = 0;
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      for (let i = 0; i <= 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];

        if (history[dateStr]) {
          currentStreak++;
        } else if (i > 0) {
          break;
        }
      }

      // Calculate best streak
      let bestStreak = 0;
      let tempStreak = 0;
      let lastDate = null;

      dates.forEach(date => {
        if (!lastDate || isConsecutive(lastDate, date)) {
          tempStreak++;
          bestStreak = Math.max(bestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
        lastDate = date;
      });

      // Calculate completion rate (last 30 days)
      const last30Days = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last30Days.push(date.toISOString().split('T')[0]);
      }

      const completedDays = last30Days.filter(date => history[date]).length;
      const completionRate = Math.round((completedDays / 30) * 100);

      // Check if completed today
      const completedToday = !!history[todayStr];

      return {
        ...habit,
        currentStreak,
        bestStreak,
        completionRate,
        completedToday,
        totalDays: dates.length
      };
    });
  }, [habits, habitHistory]);

  const isConsecutive = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  };

  const handleSaveHabit = async (habitData) => {
    if (editingHabit) {
      await updateHabit(editingHabit.id, habitData);
      setEditingHabit(null);
    } else {
      await addHabit(habitData);
    }
    setShowForm(false);
  };

  const handleDeleteHabit = (id) => {
    setConfirmState({
      message: 'Delete this habit?',
      detail: 'All tracking history for this habit will be permanently lost.',
      confirmLabel: 'Delete Habit',
      danger: true,
      onConfirm: () => deleteHabit(id),
    });
  };

  const handleToggleDay = async (habitId, date) => {
    await toggleHabitDay(habitId, date);
  };

  // Overall statistics
  const overallStats = useMemo(() => {
    const totalHabits = habits.length;
    const activeToday = habitsWithStats.filter(h => h.completedToday).length;
    const avgCompletionRate = habitsWithStats.reduce((sum, h) => sum + h.completionRate, 0) / (totalHabits || 1);
    const totalStreakDays = habitsWithStats.reduce((sum, h) => sum + h.currentStreak, 0);

    return {
      totalHabits,
      activeToday,
      avgCompletionRate: Math.round(avgCompletionRate),
      totalStreakDays,
      perfectToday: totalHabits > 0 && activeToday === totalHabits
    };
  }, [habitsWithStats]);

  return (
    <div className="habit-tracker">
      <ConfirmDialog state={confirmState} onClose={() => setConfirmState(null)} />
      {/* Header */}
      <div className="mb-6">
        {/* Centered Title */}
        <h2 className="text-xl md:text-2xl font-bold text-center mb-4">Habit Tracker</h2>

        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${viewMode === 'calendar' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              Calendar
            </button>
          </div>

          {/* Add Habit Button */}
          <button
            onClick={() => {
              setEditingHabit(null);
              setShowForm(true);
            }}
            className="btn-primary flex items-center gap-2 px-4 py-2"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm sm:text-base">Add Habit</span>
          </button>
        </div>

        {/* Overall Stats */}
        <HabitStats stats={overallStats} />
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <HabitForm
              habit={editingHabit}
              onSave={handleSaveHabit}
              onCancel={() => {
                setShowForm(false);
                setEditingHabit(null);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habits Display */}
      {viewMode === 'calendar' ? (
        <HabitCalendar
          habits={habitsWithStats}
          habitHistory={habitHistory}
          onToggleDay={handleToggleDay}
        />
      ) : (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-4'
        }>
          <AnimatePresence>
            {habitsWithStats.length > 0 ? (
              habitsWithStats.map((habit, index) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <HabitCard
                    habit={habit}
                    viewMode={viewMode}
                    onToggleToday={() => handleToggleDay(habit.id, new Date().toISOString().split('T')[0])}
                    onEdit={() => {
                      setEditingHabit(habit);
                      setShowForm(true);
                    }}
                    onDelete={() => handleDeleteHabit(habit.id)}
                    onClick={() => setSelectedHabit(habit)}
                  />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p className="text-lg">No habits yet</p>
                <p className="text-sm mt-2">Create your first habit to start tracking</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Motivational Quote */}
      {overallStats.perfectToday && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-green-100 dark:bg-green-900/20 rounded-lg text-center"
        >
          <p className="text-green-800 dark:text-green-200 font-medium">
            🎉 Perfect Day! All habits completed!
          </p>
          <p className="text-sm text-green-600 dark:text-green-300 mt-1">
            Keep up the amazing work!
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default HabitTracker;