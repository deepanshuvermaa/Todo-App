import React from 'react';
import { motion } from 'framer-motion';

const ExpenseStats = ({ stats }) => {
  const categoryColors = {
    'Food & Dining': 'bg-orange-500',
    'Transportation': 'bg-blue-500',
    'Shopping': 'bg-pink-500',
    'Entertainment': 'bg-purple-500',
    'Bills & Utilities': 'bg-yellow-500',
    'Healthcare': 'bg-red-500',
    'Education': 'bg-indigo-500',
    'Travel': 'bg-green-500',
    'Personal Care': 'bg-teal-500',
    'Other': 'bg-gray-500'
  };

  const topCategories = Object.entries(stats.byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Total Spent */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="ultra-card p-4"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              ₹{stats.total.toFixed(2)}
            </p>
          </div>
          <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Transaction Count */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="ultra-card p-4"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Transactions</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.count}
            </p>
          </div>
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Daily Average */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="ultra-card p-4"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Daily Avg</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              ₹{stats.dailyAverage.toFixed(2)}
            </p>
          </div>
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Largest Expense */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="ultra-card p-4"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Largest</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              ₹{stats.largestExpense.toFixed(2)}
            </p>
          </div>
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Category Breakdown */}
      {topCategories.length > 0 && (
        <div className="col-span-2 md:col-span-4 ultra-card p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Top Categories</h3>
          <div className="space-y-2">
            {topCategories.map(([category, amount]) => {
              const percentage = (amount / stats.total) * 100;
              return (
                <div key={category} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{category}</span>
                      <span className="text-gray-500">₹{amount.toFixed(2)}</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={`h-full ${categoryColors[category] || 'bg-gray-500'}`}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseStats;