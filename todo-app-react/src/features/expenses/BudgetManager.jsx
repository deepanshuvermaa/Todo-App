import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '@/store/useAppStore';

const BudgetManager = ({ expenses }) => {
  const { budget, setBudget, budgetAlerts } = useAppStore();
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [budgetData, setBudgetData] = useState({
    monthly: budget?.monthly || 0,
    categories: budget?.categories || {}
  });

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyExpenses = expenses.filter(exp => exp.date.startsWith(currentMonth));
  const totalSpent = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remaining = budgetData.monthly - totalSpent;
  const percentageUsed = budgetData.monthly > 0 ? (totalSpent / budgetData.monthly) * 100 : 0;

  const getBudgetStatus = () => {
    if (percentageUsed >= 100) return { color: 'red', status: 'Exceeded', icon: '⚠️' };
    if (percentageUsed >= 90) return { color: 'orange', status: 'Warning', icon: '⚡' };
    if (percentageUsed >= 75) return { color: 'yellow', status: 'Caution', icon: '👀' };
    return { color: 'green', status: 'On Track', icon: '✅' };
  };

  const status = getBudgetStatus();

  const handleSaveBudget = () => {
    setBudget(budgetData);
    setShowBudgetForm(false);
  };

  // Calculate category spending
  const categorySpending = monthlyExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  return (
    <div className="budget-manager mb-6">
      {/* Budget Overview */}
      <div className="ultra-card p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">Monthly Budget</h3>
          <button
            onClick={() => setShowBudgetForm(!showBudgetForm)}
            className="text-blue-500 hover:text-blue-600 text-sm ultra-smooth"
          >
            {budgetData.monthly > 0 ? 'Edit Budget' : 'Set Budget'}
          </button>
        </div>

        {budgetData.monthly > 0 ? (
          <>
            {/* Budget Progress */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Spent: ₹{totalSpent.toFixed(2)}</span>
                <span>Budget: ₹{budgetData.monthly.toFixed(2)}</span>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(percentageUsed, 100)}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full ${
                    status.color === 'red' ? 'bg-red-500' :
                    status.color === 'orange' ? 'bg-orange-500' :
                    status.color === 'yellow' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium flex items-center gap-1 ${
                  status.color === 'red' ? 'text-red-600' :
                  status.color === 'orange' ? 'text-orange-600' :
                  status.color === 'yellow' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {status.icon} {status.status}
                </span>
                <span className="text-sm text-gray-500">
                  {percentageUsed.toFixed(1)}% used
                </span>
              </div>
            </div>

            {/* Remaining Budget */}
            <div className={`p-3 rounded-lg ${
              remaining < 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'
            }`}>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {remaining >= 0 ? 'Remaining Budget' : 'Over Budget'}
              </p>
              <p className={`text-xl font-bold ${
                remaining < 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                ₹{Math.abs(remaining).toFixed(2)}
              </p>
              {remaining > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Daily budget: ₹{(remaining / new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()).toFixed(2)}
                </p>
              )}
            </div>

            {/* Budget Alerts */}
            {percentageUsed >= 90 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
              >
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Budget Alert!
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  You've used {percentageUsed.toFixed(0)}% of your monthly budget. Consider reducing spending.
                </p>
              </motion.div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No budget set</p>
            <p className="text-xs mt-1">Set a monthly budget to track spending</p>
          </div>
        )}

        {/* Budget Form */}
        <AnimatePresence>
          {showBudgetForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Monthly Budget
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={budgetData.monthly}
                      onChange={(e) => setBudgetData({
                        ...budgetData,
                        monthly: parseFloat(e.target.value) || 0
                      })}
                      className="input-field"
                      placeholder="Enter monthly budget"
                      min="0"
                      step="100"
                    />
                    <button
                      onClick={handleSaveBudget}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Save
                    </button>
                  </div>
                </div>

                {/* Quick Budget Suggestions */}
                <div className="flex gap-2">
                  <span className="text-xs text-gray-500">Quick set:</span>
                  {[1000, 2000, 3000, 5000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setBudgetData({ ...budgetData, monthly: amount })}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Budgets (if set) */}
        {Object.keys(budgetData.categories || {}).length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium mb-2">Category Budgets</h4>
            <div className="space-y-2">
              {Object.entries(budgetData.categories).map(([category, budget]) => {
                const spent = categorySpending[category] || 0;
                const categoryPercentage = budget > 0 ? (spent / budget) * 100 : 0;

                return (
                  <div key={category} className="text-xs">
                    <div className="flex justify-between mb-1">
                      <span>{category}</span>
                      <span>₹{spent.toFixed(0)} / ₹{budget}</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          categoryPercentage > 100 ? 'bg-red-500' :
                          categoryPercentage > 80 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(categoryPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetManager;