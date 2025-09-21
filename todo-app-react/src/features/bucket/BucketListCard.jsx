import React, { useState } from 'react';
import { motion } from 'framer-motion';

const BucketListCard = ({ item, onEdit, onDelete, onUpdateProgress }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getCategoryIcon = (category) => {
    const icons = {
      travel: '✈️',
      adventure: '🎢',
      career: '💼',
      education: '🎓',
      fitness: '💪',
      creative: '🎨',
      financial: '💰',
      personal: '✨',
      other: '🎯'
    };
    return icons[category] || '🎯';
  };

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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return { text: 'Completed', class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
      case 'in-progress':
        return { text: 'In Progress', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' };
      default:
        return { text: 'Not Started', class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
    }
  };

  const getDaysUntilDeadline = () => {
    if (!item.deadline) return null;
    const days = Math.ceil((new Date(item.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
  };

  const completedSteps = item.steps?.filter(step => step.completed).length || 0;
  const totalSteps = item.steps?.length || 0;
  const statusBadge = getStatusBadge(item.status);
  const daysUntil = getDaysUntilDeadline();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 overflow-hidden ${
        getPriorityColor(item.priority)
      } ${item.status === 'completed' ? 'opacity-75' : ''}`}
    >
      {/* Image Header */}
      {item.imageUrl && (
        <div className="h-48 overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <span className="text-2xl mt-1">{getCategoryIcon(item.category)}</span>
            <div className="flex-1">
              <h3 className={`font-semibold text-gray-900 dark:text-gray-100 ${
                item.status === 'completed' ? 'line-through' : ''
              }`}>
                {item.title}
              </h3>
              
              {/* Status Badge */}
              <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${statusBadge.class}`}>
                {statusBadge.text}
              </span>
            </div>
          </div>

          {/* Priority Indicator */}
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            item.priority === 'high' ? 'bg-red-200 text-red-800' :
            item.priority === 'low' ? 'bg-green-200 text-green-800' :
            'bg-yellow-200 text-yellow-800'
          }`}>
            {item.priority}
          </span>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Quick Info */}
        <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
          {item.location && (
            <div className="flex items-center gap-1">
              <span>📍</span>
              <span>{item.location}</span>
            </div>
          )}

          {item.estimatedCost && (
            <div className="flex items-center gap-1">
              <span>💵</span>
              <span>{item.estimatedCost}</span>
            </div>
          )}

          {daysUntil && (
            <div className={`flex items-center gap-1 ${
              daysUntil === 'Overdue' ? 'text-red-600 font-medium' : ''
            }`}>
              <span>📅</span>
              <span>{daysUntil}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">Progress</span>
            <span className="text-xs font-medium">{item.progress || 0}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${item.progress || 0}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full ${
                item.progress >= 80 ? 'bg-green-500' :
                item.progress >= 50 ? 'bg-blue-500' :
                item.progress >= 20 ? 'bg-yellow-500' :
                'bg-gray-400'
              }`}
            />
          </div>
        </div>

        {/* Steps Progress */}
        {totalSteps > 0 && (
          <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-900 rounded">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Steps</span>
              <span className="text-xs font-medium">
                {completedSteps} / {totalSteps} completed
              </span>
            </div>
          </div>
        )}

        {/* Motivation (shown on hover/click) */}
        {item.motivation && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-blue-600 hover:text-blue-700 mb-3"
          >
            {showDetails ? 'Hide' : 'Show'} motivation →
          </button>
        )}

        {showDetails && item.motivation && (
          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-gray-700 dark:text-gray-300">
            <p className="font-medium mb-1">Why this matters:</p>
            <p>{item.motivation}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {item.status !== 'completed' && (
            <div className="flex-1">
              <label className="text-xs text-gray-500 block mb-1">Update Progress</label>
              <input
                type="range"
                min="0"
                max="100"
                value={item.progress || 0}
                onChange={(e) => onUpdateProgress(parseInt(e.target.value))}
                className="w-full h-8"
              />
            </div>
          )}

          <div className="flex gap-1">
            <button
              onClick={onEdit}
              className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
              title="Edit"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded"
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
  );
};

export default BucketListCard;