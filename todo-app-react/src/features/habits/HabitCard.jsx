import React from 'react';
import { motion } from 'framer-motion';

const HabitCard = ({ habit, viewMode, onToggleToday, onEdit, onDelete, onClick }) => {
  const getFrequencyText = (frequency) => {
    switch (frequency) {
      case 'daily':
        return 'Every day';
      case 'weekly':
        return `${habit.targetDays || 7} days/week`;
      case 'custom':
        return `${habit.targetDays} days/week`;
      default:
        return frequency;
    }
  };

  const getStreakColor = (streak) => {
    if (streak === 0) return 'text-gray-500';
    if (streak < 7) return 'text-yellow-500';
    if (streak < 30) return 'text-blue-500';
    if (streak < 100) return 'text-purple-500';
    return 'text-red-500';
  };

  const getCompletionColor = (rate) => {
    if (rate >= 90) return 'bg-green-500';
    if (rate >= 70) return 'bg-blue-500';
    if (rate >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      health: '💪',
      productivity: '📈',
      learning: '📚',
      mindfulness: '🧘',
      social: '👥',
      creativity: '🎨',
      finance: '💰',
      other: '⭐'
    };
    return icons[habit.category] || '📌';
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Checkbox */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleToday();
              }}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                habit.completedToday
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-300 hover:border-green-500'
              }`}
            >
              {habit.completedToday && (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            {/* Icon & Name */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">{habit.icon || getCategoryIcon(habit.category)}</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{habit.name}</h3>
                <p className="text-sm text-gray-500">{getFrequencyText(habit.frequency)}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 ml-auto">
              <div className="text-center">
                <p className={`text-xl font-bold ${getStreakColor(habit.currentStreak)}`}>
                  {habit.currentStreak}
                </p>
                <p className="text-xs text-gray-500">streak</p>
              </div>

              <div className="text-center">
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {habit.completionRate}%
                </p>
                <p className="text-xs text-gray-500">rate</p>
              </div>

              <div className="text-center">
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {habit.totalDays}
                </p>
                <p className="text-xs text-gray-500">total</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-1 ml-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${habit.completionRate}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full ${getCompletionColor(habit.completionRate)}`}
          />
        </div>
      </motion.div>
    );
  }

  // Grid View
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border ${
        habit.completedToday ? 'border-green-500' : 'border-gray-200 dark:border-gray-700'
      } p-5 cursor-pointer`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{habit.icon || getCategoryIcon(habit.category)}</span>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{habit.name}</h3>
            <p className="text-sm text-gray-500">{getFrequencyText(habit.frequency)}</p>
          </div>
        </div>

        {/* Completion Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleToday();
          }}
          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
            habit.completedToday
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300 hover:border-green-500'
          }`}
        >
          {habit.completedToday && (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      </div>

      {/* Current Streak */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">Current Streak</span>
          <span className={`text-lg font-bold ${getStreakColor(habit.currentStreak)}`}>
            {habit.currentStreak} {habit.currentStreak === 1 ? 'day' : 'days'}
          </span>
        </div>

        {/* Streak Fire Icons */}
        {habit.currentStreak > 0 && (
          <div className="flex gap-1">
            {[...Array(Math.min(habit.currentStreak, 7))].map((_, i) => (
              <span key={i} className="text-lg">🔥</span>
            ))}
            {habit.currentStreak > 7 && (
              <span className="text-sm text-gray-500">+{habit.currentStreak - 7}</span>
            )}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {habit.bestStreak}
          </p>
          <p className="text-xs text-gray-500">Best</p>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {habit.completionRate}%
          </p>
          <p className="text-xs text-gray-500">Rate</p>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {habit.totalDays}
          </p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Completion Rate</span>
          <span>{habit.completionRate}%</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${habit.completionRate}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full ${getCompletionColor(habit.completionRate)}`}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-1 mt-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

export default HabitCard;