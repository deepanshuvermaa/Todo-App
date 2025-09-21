import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const HabitForm = ({ habit, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'health',
    frequency: 'daily',
    targetDays: 7,
    reminder: '',
    icon: '',
    color: '#3B82F6'
  });

  const categories = [
    { value: 'health', label: 'Health & Fitness', icon: '💪' },
    { value: 'productivity', label: 'Productivity', icon: '📈' },
    { value: 'learning', label: 'Learning', icon: '📚' },
    { value: 'mindfulness', label: 'Mindfulness', icon: '🧘' },
    { value: 'social', label: 'Social', icon: '👥' },
    { value: 'creativity', label: 'Creativity', icon: '🎨' },
    { value: 'finance', label: 'Finance', icon: '💰' },
    { value: 'other', label: 'Other', icon: '⭐' }
  ];

  const frequencies = [
    { value: 'daily', label: 'Every day' },
    { value: 'weekly', label: 'X days per week' },
    { value: 'custom', label: 'Custom' }
  ];

  const habitIcons = ['🏃', '💪', '📚', '✍️', '🧘', '💧', '🥗', '😴', '🎯', '💊', '🚫', '📱'];
  const habitColors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#6B7280'];

  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name || '',
        description: habit.description || '',
        category: habit.category || 'health',
        frequency: habit.frequency || 'daily',
        targetDays: habit.targetDays || 7,
        reminder: habit.reminder || '',
        icon: habit.icon || '',
        color: habit.color || '#3B82F6'
      });
    }
  }, [habit]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Please enter a habit name');
      return;
    }

    onSave({
      ...formData,
      targetDays: formData.frequency === 'daily' ? 7 : parseInt(formData.targetDays)
    });
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold mb-4">
        {habit ? 'Edit Habit' : 'Create New Habit'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Habit Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input-field"
            placeholder="e.g., Morning Meditation"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="input-field"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            Description <span className="text-xs text-gray-500">(optional)</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input-field"
            placeholder="Why is this habit important to you?"
            rows="2"
          />
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-sm font-medium mb-2">Frequency</label>
          <select
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            className="input-field"
          >
            {frequencies.map(freq => (
              <option key={freq.value} value={freq.value}>{freq.label}</option>
            ))}
          </select>
        </div>

        {/* Target Days */}
        {formData.frequency !== 'daily' && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Target Days per Week
            </label>
            <input
              type="number"
              min="1"
              max="7"
              value={formData.targetDays}
              onChange={(e) => setFormData({ ...formData, targetDays: parseInt(e.target.value) || 1 })}
              className="input-field"
            />
          </div>
        )}

        {/* Reminder Time */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Reminder Time <span className="text-xs text-gray-500">(optional)</span>
          </label>
          <input
            type="time"
            value={formData.reminder}
            onChange={(e) => setFormData({ ...formData, reminder: e.target.value })}
            className="input-field"
          />
        </div>
      </div>

      {/* Icon Selection */}
      <div className="mt-4">
        <label className="block text-sm font-medium mb-2">Choose an Icon</label>
        <div className="flex flex-wrap gap-2">
          {habitIcons.map(icon => (
            <button
              key={icon}
              type="button"
              onClick={() => setFormData({ ...formData, icon })}
              className={`text-2xl p-2 rounded-lg border-2 transition-colors ${
                formData.icon === icon
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div className="mt-4">
        <label className="block text-sm font-medium mb-2">Choose a Color</label>
        <div className="flex gap-2">
          {habitColors.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => setFormData({ ...formData, color })}
              className={`w-8 h-8 rounded-full border-2 ${
                formData.color === color ? 'border-gray-600' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="flex-1 btn-primary"
        >
          {habit ? 'Update Habit' : 'Create Habit'}
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

export default HabitForm;