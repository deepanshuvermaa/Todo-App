import React from 'react';
import { motion } from 'framer-motion';

const NoteCard = ({ note, viewMode, onEdit, onDelete }) => {
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `Today at ${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="ultra-card p-4 hover:shadow-md transition-all cursor-pointer"
        style={{ backgroundColor: note.color || '#ffffff' }}
        onClick={onEdit}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {note.isPinned && (
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              )}
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {note.title}
              </h3>
              {note.folder && (
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs rounded">
                  {note.folder}
                </span>
              )}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {truncateText(note.content, 150)}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {note.tags && note.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs rounded-full">
                    #{tag}
                  </span>
                ))}
                {note.tags && note.tags.length > 3 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">+{note.tags.length - 3}</span>
                )}
              </div>

              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(note.updatedAt)}
              </span>
            </div>
          </div>

          <div className="flex gap-1 ml-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid View
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="ultra-card p-4 hover:shadow-lg transition-all cursor-pointer h-64 flex flex-col"
      style={{ backgroundColor: note.color || '#ffffff' }}
      onClick={onEdit}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white flex-1 line-clamp-2">
          {note.title}
        </h3>
        {note.isPinned && (
          <svg className="w-4 h-4 text-yellow-500 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        )}
      </div>

      {/* Content Preview */}
      <p className="text-sm text-gray-600 dark:text-gray-300 flex-1 overflow-hidden line-clamp-4 mb-3">
        {note.content}
      </p>

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {note.tags.slice(0, 2).map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs rounded-full">
              #{tag}
            </span>
          ))}
          {note.tags.length > 2 && (
            <span className="px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400">
              +{note.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(note.updatedAt)}
        </span>

        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NoteCard;