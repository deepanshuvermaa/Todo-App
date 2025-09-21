import React from 'react';
import { motion } from 'framer-motion';

const MealStats = ({ stats }) => {
  const getCalorieColor = (calories, goal) => {
    const percentage = (calories / goal) * 100;
    if (percentage < 80) return 'bg-yellow-500';
    if (percentage <= 120) return 'bg-green-500';
    return 'bg-red-500';
  };

  const getMacroPercentage = (value, goal) => {
    return Math.min(Math.round((value / goal) * 100), 100);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Calories */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 col-span-2 md:col-span-1"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Calories</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.totalCalories}
            </p>
            <p className="text-xs text-gray-500">of {stats.calorieGoal} goal</p>
          </div>
          <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
            <span className="text-xl">🔥</span>
          </div>
        </div>
        <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((stats.totalCalories / stats.calorieGoal) * 100, 100)}%` }}
            transition={{ duration: 0.5 }}
            className={getCalorieColor(stats.totalCalories, stats.calorieGoal)}
            style={{ height: '100%' }}
          />
        </div>
      </motion.div>

      {/* Protein */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Protein</p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.totalProtein}g
            </p>
            <p className="text-xs text-gray-500">{getMacroPercentage(stats.totalProtein, stats.proteinGoal)}%</p>
          </div>
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <span className="text-xl">💪</span>
          </div>
        </div>
      </motion.div>

      {/* Carbs */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Carbs</p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.totalCarbs}g
            </p>
            <p className="text-xs text-gray-500">{getMacroPercentage(stats.totalCarbs, stats.carbGoal)}%</p>
          </div>
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
            <span className="text-xl">🌾</span>
          </div>
        </div>
      </motion.div>

      {/* Fat */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Fat</p>
            <p className="text-2xl font-bold text-red-600">
              {stats.totalFat}g
            </p>
            <p className="text-xs text-gray-500">{getMacroPercentage(stats.totalFat, stats.fatGoal)}%</p>
          </div>
          <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
            <span className="text-xl">🥑</span>
          </div>
        </div>
      </motion.div>

      {/* Meal Count */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">Meals Today</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {stats.mealCount}
        </p>
        <div className="flex gap-2 mt-2 text-xs">
          <span>🍳 {stats.mealsByType.breakfast}</span>
          <span>🥗 {stats.mealsByType.lunch}</span>
          <span>🍽️ {stats.mealsByType.dinner}</span>
          <span>🍿 {stats.mealsByType.snack}</span>
        </div>
      </motion.div>

      {/* Fiber */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">Fiber</p>
        <p className="text-2xl font-bold text-green-600">
          {stats.totalFiber}g
        </p>
        <p className="text-xs text-gray-500">Daily intake</p>
      </motion.div>

      {/* Weekly Average */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 col-span-2"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Weekly Avg</p>
            <p className="text-2xl font-bold text-purple-600">
              {stats.weeklyAvgCalories} cal/day
            </p>
          </div>
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MealStats;