import React from 'react';
import { motion } from 'framer-motion';

const JournalStats = ({ stats }) => {
  const getMoodEmoji = (mood) => {
    const moods = {
      amazing: '😄',
      good: '😊',
      okay: '😐',
      bad: '😟',
      terrible: '😢'
    };
    return moods[mood] || '😐';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {/* Total Entries */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Entries</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.totalEntries}
            </p>
          </div>
          <span className="text-2xl">📖</span>
        </div>
      </motion.div>

      {/* Current Streak */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Streak</p>
            <p className="text-2xl font-bold text-orange-600">
              {stats.currentStreak}
            </p>
          </div>
          <span className="text-2xl">🔥</span>
        </div>
      </motion.div>

      {/* Average Words */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg Words</p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.avgWords}
            </p>
          </div>
          <span className="text-2xl">📝</span>
        </div>
      </motion.div>

      {/* Dominant Mood */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Mood</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
              {stats.dominantMood}
            </p>
          </div>
          <span className="text-2xl">{getMoodEmoji(stats.dominantMood)}</span>
        </div>
      </motion.div>

      {/* Gratitude Items */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Gratitude</p>
            <p className="text-2xl font-bold text-purple-600">
              {stats.gratitudeItems}
            </p>
          </div>
          <span className="text-2xl">🙏</span>
        </div>
      </motion.div>

      {/* Completion Rate */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">This Month</p>
            <p className="text-2xl font-bold text-green-600">
              {Math.round((stats.totalEntries / 30) * 100)}%
            </p>
          </div>
          <span className="text-2xl">🏆</span>
        </div>
      </motion.div>
    </div>
  );
};

export default JournalStats;