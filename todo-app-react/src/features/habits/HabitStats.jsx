import React from 'react';
import { motion } from 'framer-motion';

const HabitStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {/* Total Habits */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Habits</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.totalHabits}
            </p>
          </div>
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Completed Today */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Done Today</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.activeToday}
            </p>
          </div>
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Average Completion Rate */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg Rate</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.avgCompletionRate}%
            </p>
          </div>
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
        <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.avgCompletionRate}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full ${
              stats.avgCompletionRate >= 80 ? 'bg-green-500' :
              stats.avgCompletionRate >= 60 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
          />
        </div>
      </motion.div>

      {/* Total Streak Days */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Streak Days</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.totalStreakDays}
            </p>
          </div>
          <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
            <span className="text-xl">🔥</span>
          </div>
        </div>
      </motion.div>

      {/* Perfect Day Status */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`p-4 rounded-lg border ${
          stats.perfectToday
            ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
            <p className={`text-lg font-bold ${
              stats.perfectToday ? 'text-green-600' : 'text-gray-900 dark:text-gray-100'
            }`}>
              {stats.perfectToday ? 'Perfect!' :
               stats.totalHabits === 0 ? 'No habits' :
               `${stats.activeToday}/${stats.totalHabits}`}
            </p>
          </div>
          <div className={`p-2 rounded-lg ${
            stats.perfectToday ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            <span className="text-xl">
              {stats.perfectToday ? '🎉' : '📊'}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HabitStats;