import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ReminderCard = ({ reminder, onEdit, onDelete, onComplete, onSnooze }) => {
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'low':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      default:
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      personal: '👤',
      work: '💼',
      family: '👨‍👩‍👧‍👦',
      medical: '🏥',
      business: '🏢',
      other: '📞'
    };
    return icons[category] || '📞';
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateStr === tomorrow.toISOString().split('T')[0]) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const isOverdue = () => {
    if (reminder.completedDate) return false;
    
    const now = new Date();
    const reminderDate = new Date(`${reminder.date} ${reminder.time || '00:00'}`);
    return reminderDate < now;
  };

  const getTimeUntil = () => {
    const now = new Date();
    const reminderDate = new Date(`${reminder.date} ${reminder.time || '00:00'}`);
    const diff = reminderDate - now;

    if (diff < 0) return 'Overdue';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `in ${days} day${days !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `in ${hours}h ${minutes}m`;
    } else {
      return `in ${minutes} minutes`;
    }
  };

  const snoozeOptions = [
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '2 hours', value: 120 },
    { label: 'Tomorrow', value: 1440 }
  ];

  const overdue = isOverdue();

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`rounded-lg shadow-sm border-2 overflow-hidden ${
        reminder.completedDate
          ? 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 opacity-75'
          : overdue
          ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
          : getPriorityColor(reminder.priority)
      }`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-1">{getCategoryIcon(reminder.category)}</span>
            <div className="flex-1">
              <h3 className={`font-semibold text-gray-900 dark:text-gray-100 ${
                reminder.completedDate ? 'line-through' : ''
              }`}>
                {reminder.name}
              </h3>
              
              {reminder.company && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {reminder.company}
                </p>
              )}

              <div className="flex items-center gap-3 mt-1">
                {reminder.phone && (
                  <a
                    href={`tel:${reminder.phone.replace(/\D/g, '')}`}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {reminder.phone}
                  </a>
                )}

                {reminder.email && (
                  <a
                    href={`mailto:${reminder.email}`}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Priority Badge */}
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            reminder.priority === 'high' ? 'bg-red-200 text-red-800' :
            reminder.priority === 'low' ? 'bg-green-200 text-green-800' :
            'bg-yellow-200 text-yellow-800'
          }`}>
            {reminder.priority}
          </span>
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-4 mb-3 text-sm">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className={overdue ? 'text-red-600 font-medium' : 'text-gray-600 dark:text-gray-400'}>
              {formatDate(reminder.date)}
            </span>
          </div>

          {reminder.time && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={overdue ? 'text-red-600 font-medium' : 'text-gray-600 dark:text-gray-400'}>
                {formatTime(reminder.time)}
              </span>
            </div>
          )}

          {!reminder.completedDate && (
            <span className={`text-sm font-medium ${
              overdue ? 'text-red-600' : 'text-gray-500'
            }`}>
              {getTimeUntil()}
            </span>
          )}

          {reminder.recurring !== 'none' && (
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full">
              🔁 {reminder.recurring}
            </span>
          )}
        </div>

        {/* Tags */}
        {reminder.tags && reminder.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {reminder.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Notes */}
        {reminder.notes && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 p-3 bg-gray-50 dark:bg-gray-900 rounded">
            {reminder.notes}
          </p>
        )}

        {/* Completed Date */}
        {reminder.completedDate && (
          <p className="text-xs text-gray-500 mb-3">
            Completed on {new Date(reminder.completedDate).toLocaleDateString()}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {!reminder.completedDate && (
            <>
              <button
                onClick={onComplete}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Complete
              </button>

              {reminder.time && (
                <div className="relative">
                  <button
                    onClick={() => setShowSnoozeOptions(!showSnoozeOptions)}
                    className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
                  >
                    Snooze
                  </button>

                  {showSnoozeOptions && (
                    <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                      {snoozeOptions.map(option => (
                        <button
                          key={option.value}
                          onClick={() => {
                            onSnooze(option.value);
                            setShowSnoozeOptions(false);
                          }}
                          className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <button
            onClick={onEdit}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Edit
          </button>

          <button
            onClick={onDelete}
            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ReminderCard;