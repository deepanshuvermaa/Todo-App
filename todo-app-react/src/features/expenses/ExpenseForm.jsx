import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import VoiceButton from '@/shared/components/VoiceButton';

const ExpenseForm = ({ expense, categories, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: categories[0],
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    isRecurring: false,
    tags: ''
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        amount: expense.amount.toString(),
        category: expense.category,
        description: expense.description,
        date: expense.date,
        paymentMethod: expense.paymentMethod || 'cash',
        isRecurring: expense.isRecurring || false,
        tags: expense.tags ? expense.tags.join(', ') : ''
      });
    }
  }, [expense]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.amount || !formData.description) {
      alert('Please fill in amount and description');
      return;
    }

    const expenseData = {
      ...formData,
      amount: parseFloat(formData.amount),
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    };

    onSubmit(expenseData);

    // Reset form if adding new
    if (!expense) {
      setFormData({
        amount: '',
        category: categories[0],
        description: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        isRecurring: false,
        tags: ''
      });
    }
  };

  const paymentMethods = ['cash', 'credit', 'debit', 'upi', 'net-banking', 'wallet'];

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold mb-4">
        {expense ? 'Edit Expense' : 'Add New Expense'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Amount <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 z-10 pointer-events-none">
              ₹
            </span>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="input-field"
            required
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full pr-12 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              placeholder="What did you spend on?"
              required
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <VoiceButton
                onResult={(transcript) => setFormData({ ...formData, description: transcript })}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-blue-500"
                title="Voice Input for Description"
              />
            </div>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium mb-2">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="input-field"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium mb-2">Payment Method</label>
          <select
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            className="input-field"
          >
            {paymentMethods.map(method => (
              <option key={method} value={method}>
                {method.charAt(0).toUpperCase() + method.slice(1).replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            Tags <span className="text-xs text-gray-500">(comma separated)</span>
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="input-field"
            placeholder="grocery, weekly, essential"
          />
        </div>

        {/* Recurring */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium">This is a recurring expense</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="flex-1 btn-primary"
        >
          {expense ? 'Update Expense' : 'Add Expense'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 btn-secondary"
        >
          Cancel
        </button>
      </div>
    </motion.form>
  );
};

export default ExpenseForm;