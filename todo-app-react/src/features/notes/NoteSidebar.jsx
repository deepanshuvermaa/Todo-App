import React from 'react';
import { motion } from 'framer-motion';

const NoteSidebar = ({
  folders,
  tags,
  selectedFolder,
  selectedTag,
  onFolderSelect,
  onTagSelect,
  notesCount,
  onCreateNote
}) => {
  return (
    <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
      {/* Create Note Button */}
      <button
        onClick={onCreateNote}
        className="w-full mb-6 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 font-medium"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Note
      </button>

      {/* Notes Count */}
      <div className="mb-6 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {notesCount}
        </div>
        <div className="text-sm text-gray-500">
          Total Notes
        </div>
      </div>

      {/* Folders Section */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Folders</h3>
        <div className="space-y-1">
          <button
            onClick={() => onFolderSelect('all')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
              selectedFolder === 'all'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              All Notes
            </div>
          </button>

          {folders.map(folder => (
            <button
              key={folder}
              onClick={() => onFolderSelect(folder)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedFolder === folder
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                {folder}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tags Section */}
      {tags.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <motion.button
                key={tag}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTagSelect(selectedTag === tag ? null : tag)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedTag === tag
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                #{tag}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Shared Notes
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Archive
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Trash
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteSidebar;