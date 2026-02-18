import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TaskCard = ({ task, onToggle, onUpdate, onDelete }) => {
  // L1 fix: sync editText when task.text changes externally (e.g. voice command, sync)
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [showActions, setShowActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    // Keep editText in sync when not actively editing
    if (!isEditing) {
      setEditText(task.text);
    }
  }, [task.text, isEditing]);

  const handleEdit = () => {
    if (isEditing && editText.trim() && editText !== task.text) {
      onUpdate({ text: editText.trim() });
    }
    setIsEditing(!isEditing);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete();
  };

  // F4: overdue = date is past AND task not done
  const isOverdue = task.isOverdue && !task.completed;

  const recurrenceLabel = () => {
    if (!task.recurrence) return null;
    const r = task.recurrence;
    if (r === 'daily') return '↺ Daily';
    if (r === 'weekly') return '↺ Weekly';
    if (r === 'monthly') return '↺ Monthly';
    if (r === 'weekdays') return '↺ Weekdays';
    if (r === 'weekends') return '↺ Weekends';
    if (r && typeof r === 'object') return '↺ Custom';
    return null;
  };

  return (
    <motion.div
      className={`ultra-card hover-lift p-4 relative ${
        task.completed ? 'opacity-60' : ''
      } ${isOverdue ? 'border-l-4 border-red-400 bg-red-50/30 dark:bg-red-900/10' : ''}`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Inline delete confirm — no window.confirm() */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/95 dark:bg-gray-800/95 rounded-xl">
          <div className="text-center p-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
              Move this task to trash?
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Move to Trash
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
          className={`mt-1 w-5 h-5 rounded border-2 transition-colors flex-shrink-0 ${
            task.completed
              ? 'bg-green-500 border-green-500'
              : isOverdue
              ? 'border-red-400 hover:border-red-600'
              : 'border-gray-300 hover:border-blue-500'
          }`}
        >
          {task.completed && (
            <svg className="w-3 h-3 text-white mx-auto" viewBox="0 0 20 20">
              <path fill="currentColor" d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
            </svg>
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleEdit}
              onKeyDown={(e) => { // L1: use onKeyDown instead of deprecated onKeyPress
                if (e.key === 'Enter') handleEdit();
                if (e.key === 'Escape') { setIsEditing(false); setEditText(task.text); }
              }}
              className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              autoFocus
              aria-label="Edit task text"
            />
          ) : (
            <p className={`${task.completed ? 'line-through text-gray-400' : isOverdue ? 'text-red-700 dark:text-red-400 font-medium' : 'text-gray-800 dark:text-gray-200'}`}>
              {task.text}
            </p>
          )}

          {/* Task Meta Badges */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {/* F4: Overdue badge */}
            {isOverdue && (
              <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full font-semibold">
                Overdue
              </span>
            )}

            {/* F1: Recurring badge */}
            {recurrenceLabel() && (
              <span className="px-2 py-0.5 text-xs bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 rounded-full">
                {recurrenceLabel()}
              </span>
            )}

            {/* Priority */}
            {task.priority && task.priority !== 'medium' && (
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                task.priority === 'high'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              }`}>
                {task.priority === 'high' ? '🔥 High' : '🟢 Low'}
              </span>
            )}

            {/* Time */}
            {task.time && (
              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                🕐 {task.time}
              </span>
            )}

            {/* Location */}
            {task.location && (
              <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 rounded-full">
                📍 {task.location}
              </span>
            )}

            {/* Duration */}
            {task.duration && (
              <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 rounded-full">
                ⏱️ {task.duration}min
              </span>
            )}

            {/* Category */}
            {task.category && (
              <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-full">
                📁 {task.category}
              </span>
            )}

            {/* Tags */}
            {task.tags && task.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full">
                #{tag}
              </span>
            ))}
          </div>

          {/* Date / completion info */}
          <div className="flex gap-4 mt-1.5 text-xs text-gray-400">
            {task.date !== new Date().toISOString().split('T')[0] && (
              <span className={isOverdue ? 'text-red-500' : ''}>
                {isOverdue ? 'Was due: ' : 'Due: '}
                {new Date(task.date + 'T00:00:00').toLocaleDateString()}
              </span>
            )}
            {task.completed && task.completedDate && (
              <span>Done: {new Date(task.completedDate).toLocaleTimeString()}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showActions ? 1 : 0 }}
          className="flex gap-1 flex-shrink-0"
        >
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Edit task"
            aria-label="Edit task"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete task (moves to trash)"
            aria-label="Delete task"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
