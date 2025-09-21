import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ExpenseList = ({ expenses, onEdit, onDelete }) => {
  const getCategoryIcon = (category) => {
    const icons = {
      'Food & Dining': '🍔',
      'Transportation': '🚗',
      'Shopping': '🛍️',
      'Entertainment': '🎬',
      'Bills & Utilities': '💡',
      'Healthcare': '🏥',
      'Education': '📚',
      'Travel': '✈️',
      'Personal Care': '💅',
      'Other': '📦'
    };
    return icons[category] || '💰';
  };

  const getPaymentMethodColor = (method) => {
    const colors = {
      'cash': 'bg-green-100 text-green-800',
      'credit': 'bg-blue-100 text-blue-800',
      'debit': 'bg-purple-100 text-purple-800',
      'upi': 'bg-orange-100 text-orange-800',
      'net-banking': 'bg-indigo-100 text-indigo-800',
      'wallet': 'bg-pink-100 text-pink-800'
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  // Group expenses by date
  const groupedExpenses = expenses.reduce((groups, expense) => {
    const date = expense.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {});

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => b.localeCompare(a));

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-lg">No expenses found</p>
        <p className="text-sm mt-2">Add your first expense to start tracking</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {sortedDates.map(date => {
          const dayExpenses = groupedExpenses[date];
          const dayTotal = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

          return (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="ultra-card overflow-hidden"
            >
              {/* Date Header */}
              <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">
                    {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h3>
                  <p className="text-sm text-gray-500">{dayExpenses.length} expense{dayExpenses.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-lg font-bold text-ultra">₹{dayTotal.toFixed(2)}</p>
                </div>
              </div>

              {/* Expense Items */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {dayExpenses.map((expense, index) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {/* Category Icon */}
                        <div className="text-2xl mt-1">
                          {getCategoryIcon(expense.category)}
                        </div>

                        {/* Expense Details */}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {expense.description}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {expense.category}
                          </p>

                          {/* Tags and Payment Method */}
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(expense.paymentMethod)}`}>
                              {expense.paymentMethod}
                            </span>
                            {expense.tags && expense.tags.map(tag => (
                              <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded-full text-xs">
                                {tag}
                              </span>
                            ))}
                            {expense.isRecurring && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                Recurring
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Amount and Actions */}
                      <div className="flex items-start gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            ₹{expense.amount.toFixed(2)}
                          </p>
                        </div>

                        <div className="flex gap-1">
                          <button
                            onClick={() => onEdit(expense)}
                            className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => onDelete(expense.id)}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ExpenseList;