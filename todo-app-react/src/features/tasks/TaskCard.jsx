import React, { useState } from 'react';
import { motion } from 'framer-motion';

const TaskCard = ({ task, onToggle, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [showActions, setShowActions] = useState(false);

  const handleEdit = () => {
    if (isEditing && editText !== task.text) {
      onUpdate({ text: editText });
    }
    setIsEditing(!isEditing);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete();
    }
  };

  return (
    <motion.div
      className={`ultra-card hover-lift p-4 ${
        task.completed
          ? 'opacity-60'
          : ''
      }`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className={`mt-1 w-5 h-5 rounded border-2 transition-colors ${
            task.completed
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300 hover:border-blue-500'
          }`}
        >
          {task.completed && (
            <svg className="w-3 h-3 text-white mx-auto" viewBox="0 0 20 20">
              <path
                fill="currentColor"
                d="M0 11l2-2 5 5L18 3l2 2L7 18z"
              />
            </svg>
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleEdit}
              onKeyPress={(e) => e.key === 'Enter' && handleEdit()}
              className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            <p
              className={`${
                task.completed ? 'line-through text-gray-400' : 'text-gray-800'
              }`}
            >
              {task.text}
            </p>
          )}

          {/* Task Meta */}
          <div className="flex gap-4 mt-2 text-xs text-gray-400">
            <span>Created: {new Date(task.createdAt).toLocaleTimeString()}</span>
            {task.completed && task.completedDate && (
              <span>
                Completed: {new Date(task.completedDate).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showActions ? 1 : 0 }}
          className="flex gap-2"
        >
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 text-blue-500 hover:bg-blue-50 rounded"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-red-500 hover:bg-red-50 rounded"
            title="Delete"
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