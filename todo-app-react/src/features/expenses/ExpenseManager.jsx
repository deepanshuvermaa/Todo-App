import React, { useState, useEffect, useMemo } from 'react';
import useAppStore from '@/store/useAppStore';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import ExpenseStats from './ExpenseStats';
import BudgetManager from './BudgetManager';
import ConfirmDialog from '@/components/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';

const ExpenseManager = () => {
  const { expenses, addExpense, updateExpense, deleteExpense } = useAppStore();
  const [filter, setFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [confirmState, setConfirmState] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Filter expenses based on criteria
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      // Month filter
      if (selectedMonth !== 'all' && !expense.date.startsWith(selectedMonth)) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && expense.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchQuery && !expense.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [expenses, selectedMonth, selectedCategory, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const monthExpenses = filteredExpenses;
    const total = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    const byCategory = monthExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    // Use actual days in the selected month for accurate averages
    let daysInPeriod = 30;
    let weeksInPeriod = 4;
    if (selectedMonth && selectedMonth !== 'all') {
      const [year, month] = selectedMonth.split('-').map(Number);
      daysInPeriod = new Date(year, month, 0).getDate(); // last day of month = days in month
      weeksInPeriod = daysInPeriod / 7;
    }
    const dailyAverage = daysInPeriod > 0 ? total / daysInPeriod : 0;
    const weeklyAverage = weeksInPeriod > 0 ? total / weeksInPeriod : 0;

    return {
      total,
      count: monthExpenses.length,
      byCategory,
      dailyAverage,
      weeklyAverage,
      largestExpense: monthExpenses.reduce((max, exp) => exp.amount > max ? exp.amount : max, 0)
    };
  }, [filteredExpenses]);

  const handleAddExpense = async (expenseData) => {
    await addExpense(expenseData);
    setShowAddForm(false);
  };

  const handleEditExpense = async (id, updates) => {
    await updateExpense(id, updates);
    setEditingExpense(null);
  };

  const handleDeleteExpense = (id) => {
    setConfirmState({
      message: 'Delete this expense?',
      confirmLabel: 'Delete',
      danger: true,
      onConfirm: () => deleteExpense(id),
    });
  };

  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Personal Care',
    'Other'
  ];

  return (
    <div className="expense-manager">
      <ConfirmDialog state={confirmState} onClose={() => setConfirmState(null)} />
      {/* Header */}
      <div className="mb-6">
        {/* Centered Title */}
        <h2 className="text-xl md:text-2xl font-bold text-center mb-4">Expense Tracker</h2>

        {/* Controls Row */}
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-ultra flex items-center gap-2 px-4 py-2"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm sm:text-base">Add Expense</span>
          </button>
        </div>

        {/* Stats Overview */}
        <ExpenseStats stats={stats} />

        {/* Budget Manager */}
        <BudgetManager expenses={filteredExpenses} />

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Month Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value || 'all')}
              className="input-field"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {(showAddForm || editingExpense) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <ExpenseForm
              expense={editingExpense}
              categories={categories}
              onSubmit={editingExpense
                ? (data) => handleEditExpense(editingExpense.id, data)
                : handleAddExpense
              }
              onCancel={() => {
                setShowAddForm(false);
                setEditingExpense(null);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expense List */}
      <ExpenseList
        expenses={filteredExpenses}
        onEdit={setEditingExpense}
        onDelete={handleDeleteExpense}
      />

      {/* Summary */}
      <div className="mt-6 p-4 ultra-card">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Total Expenses:</span>
            <p className="text-xl font-bold text-ultra">₹{stats.total.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-gray-500">Count:</span>
            <p className="text-xl font-bold">{stats.count}</p>
          </div>
          <div>
            <span className="text-gray-500">Daily Average:</span>
            <p className="text-xl font-bold text-ultra">₹{stats.dailyAverage.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-gray-500">Largest:</span>
            <p className="text-xl font-bold text-ultra">₹{stats.largestExpense.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseManager;