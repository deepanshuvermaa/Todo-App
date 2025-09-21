import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AlarmForm = ({ onSave, onCancel, alarm = null }) => {
  const [formData, setFormData] = useState({
    time: alarm?.time || '',
    label: alarm?.label || '',
    message: alarm?.message || '',
    repeat: alarm?.repeat || 'once',
    customDays: alarm?.customDays || [],
    sound: alarm?.sound || 'default',
    enabled: alarm?.enabled ?? true
  });

  const repeatOptions = [
    { value: 'once', label: 'Once' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekdays', label: 'Weekdays' },
    { value: 'weekends', label: 'Weekends' },
    { value: 'custom', label: 'Custom' }
  ];

  const days = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' }
  ];

  const soundOptions = [
    { value: 'default', label: 'Default Beep' },
    { value: 'gentle', label: 'Gentle Wake' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'nature', label: 'Nature Sounds' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.time) {
      alert('Please set a time for the alarm');
      return;
    }

    if (formData.repeat === 'custom' && formData.customDays.length === 0) {
      alert('Please select at least one day for custom repeat');
      return;
    }

    onSave(formData);
  };

  const toggleCustomDay = (day) => {
    setFormData(prev => ({
      ...prev,
      customDays: prev.customDays.includes(day)
        ? prev.customDays.filter(d => d !== day)
        : [...prev.customDays, day]
    }));
  };

  const generateQuickTimes = () => {
    const now = new Date();
    const times = [];

    // Add current time + 1 minute
    const oneMin = new Date(now.getTime() + 60000);
    times.push({
      label: '1 minute',
      time: oneMin.toTimeString().slice(0, 5)
    });

    // Add current time + 5 minutes
    const fiveMin = new Date(now.getTime() + 300000);
    times.push({
      label: '5 minutes',
      time: fiveMin.toTimeString().slice(0, 5)
    });

    // Add common times
    ['07:00', '08:00', '12:00', '18:00', '22:00'].forEach(time => {
      times.push({
        label: time,
        time: time
      });
    });

    return times;
  };

  return (
    <motion.form
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="text-2xl">⏰</span>
        {alarm ? 'Edit Alarm' : 'Create New Alarm'}
      </h3>

      <div className="space-y-6">
        {/* Time Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="input-field text-lg font-mono"
            required
          />

          {/* Quick Time Buttons */}
          <div className="flex flex-wrap gap-2 mt-2">
            {generateQuickTimes().map((quickTime, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setFormData({ ...formData, time: quickTime.time })}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {quickTime.label}
              </button>
            ))}
          </div>
        </div>

        {/* Label */}
        <div>
          <label className="block text-sm font-medium mb-2">Label</label>
          <input
            type="text"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            className="input-field"
            placeholder="e.g., Wake up, Meeting, Take medicine"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium mb-2">Message</label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="input-field resize-none"
            rows="2"
            placeholder="Custom message to display when alarm rings..."
          />
        </div>

        {/* Repeat Options */}
        <div>
          <label className="block text-sm font-medium mb-2">Repeat</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {repeatOptions.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, repeat: option.value })}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  formData.repeat === option.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Days Selection */}
        {formData.repeat === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="overflow-hidden"
          >
            <label className="block text-sm font-medium mb-2">Select Days</label>
            <div className="flex gap-2">
              {days.map(day => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleCustomDay(day.value)}
                  className={`w-12 h-12 rounded-full text-sm font-medium transition-colors ${
                    formData.customDays.includes(day.value)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Sound Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Alarm Sound</label>
          <select
            value={formData.sound}
            onChange={(e) => setFormData({ ...formData, sound: e.target.value })}
            className="input-field"
          >
            {soundOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Preview</h4>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {formData.time && (
              <div>
                <strong>Time:</strong> {new Date(`2000-01-01T${formData.time}`).toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'})}
              </div>
            )}
            {formData.label && (
              <div><strong>Label:</strong> {formData.label}</div>
            )}
            {formData.message && (
              <div><strong>Message:</strong> {formData.message}</div>
            )}
            <div><strong>Repeat:</strong> {repeatOptions.find(r => r.value === formData.repeat)?.label}</div>
            {formData.repeat === 'custom' && formData.customDays.length > 0 && (
              <div>
                <strong>Days:</strong> {formData.customDays
                  .map(d => days.find(day => day.value === d)?.label)
                  .join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="flex-1 btn-primary"
        >
          {alarm ? 'Update Alarm' : 'Create Alarm'}
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

export default AlarmForm;