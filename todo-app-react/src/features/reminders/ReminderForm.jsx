import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ReminderForm = ({ reminder, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    priority: 'medium',
    recurring: 'none',
    notes: '',
    category: 'personal',
    email: '',
    company: '',
    reminderBefore: 15, // minutes before to remind
    tags: []
  });

  const [tagInput, setTagInput] = useState('');

  const priorities = [
    { value: 'high', label: 'High', color: 'text-red-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'low', label: 'Low', color: 'text-green-600' }
  ];

  const recurringOptions = [
    { value: 'none', label: 'No Repeat' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const categories = [
    { value: 'personal', label: 'Personal', icon: '👤' },
    { value: 'work', label: 'Work', icon: '💼' },
    { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
    { value: 'medical', label: 'Medical', icon: '🏥' },
    { value: 'business', label: 'Business', icon: '🏢' },
    { value: 'other', label: 'Other', icon: '📞' }
  ];

  const reminderBeforeOptions = [
    { value: 0, label: 'At time of call' },
    { value: 5, label: '5 minutes before' },
    { value: 15, label: '15 minutes before' },
    { value: 30, label: '30 minutes before' },
    { value: 60, label: '1 hour before' },
    { value: 1440, label: '1 day before' }
  ];

  useEffect(() => {
    if (reminder) {
      setFormData({
        ...reminder,
        tags: reminder.tags || []
      });
    }
  }, [reminder]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a name for the reminder');
      return;
    }

    // Calculate actual reminder time based on reminderBefore
    let actualReminderTime = formData.time;
    if (formData.time && formData.reminderBefore > 0) {
      const [hours, minutes] = formData.time.split(':').map(Number);
      const reminderDate = new Date();
      reminderDate.setHours(hours, minutes);
      reminderDate.setMinutes(reminderDate.getMinutes() - formData.reminderBefore);
      actualReminderTime = reminderDate.toTimeString().slice(0, 5);
    }

    onSave({
      ...formData,
      actualReminderTime
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX for US numbers
    if (phoneNumber.length <= 10) {
      const match = phoneNumber.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
      if (match) {
        const formatted = !match[2] ? match[1] : 
          `(${match[1]}) ${match[3] ? match[2] + '-' + match[3] : match[2]}`;
        return formatted;
      }
    }
    
    return value;
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold mb-4">
        {reminder ? 'Edit Call Reminder' : 'New Call Reminder'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Name/Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input-field"
            placeholder="e.g., Call Mom, Client Meeting"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ 
              ...formData, 
              phone: formatPhoneNumber(e.target.value) 
            })}
            className="input-field"
            placeholder="(555) 123-4567"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="input-field"
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        {/* Time */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Time
          </label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="input-field"
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

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium mb-2">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="input-field"
          >
            {priorities.map(priority => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reminder Before */}
        <div>
          <label className="block text-sm font-medium mb-2">Remind Me</label>
          <select
            value={formData.reminderBefore}
            onChange={(e) => setFormData({ ...formData, reminderBefore: parseInt(e.target.value) })}
            className="input-field"
          >
            {reminderBeforeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Recurring */}
        <div>
          <label className="block text-sm font-medium mb-2">Repeat</label>
          <select
            value={formData.recurring}
            onChange={(e) => setFormData({ ...formData, recurring: e.target.value })}
            className="input-field"
          >
            {recurringOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Email <span className="text-xs text-gray-500">(optional)</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="input-field"
            placeholder="contact@example.com"
          />
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Company/Organization <span className="text-xs text-gray-500">(optional)</span>
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="input-field"
            placeholder="Company name"
          />
        </div>
      </div>

      {/* Tags */}
      <div className="mt-4">
        <label className="block text-sm font-medium mb-2">Tags</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            className="input-field flex-1"
            placeholder="Add a tag..."
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Add
          </button>
        </div>
        
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-sm flex items-center gap-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-red-500 hover:text-red-700 ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="mt-4">
        <label className="block text-sm font-medium mb-2">
          Notes <span className="text-xs text-gray-500">(optional)</span>
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="input-field"
          rows="3"
          placeholder="Additional notes or talking points..."
        />
      </div>

      {/* Priority Indicator */}
      {formData.priority === 'high' && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
          <p className="text-sm text-red-700 dark:text-red-300">
            ⚠️ This is marked as a high priority reminder
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="flex-1 btn-primary"
        >
          {reminder ? 'Update Reminder' : 'Create Reminder'}
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

export default ReminderForm;