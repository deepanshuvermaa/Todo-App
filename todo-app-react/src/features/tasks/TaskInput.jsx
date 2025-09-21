import React, { useState } from 'react';
import { motion } from 'framer-motion';
import VoiceButton from '@/shared/components/VoiceButton';

const TaskInput = ({ onAddTask }) => {
  const [taskText, setTaskText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!taskText.trim()) return;

    setIsAdding(true);
    await onAddTask(taskText.trim());
    setTaskText('');
    setIsAdding(false);
  };

  const handleVoiceResult = (transcript) => {
    setTaskText(transcript);
  };

  return (
    <form onSubmit={handleSubmit} className="task-input-form mt-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            placeholder="What needs to be done today?"
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isAdding}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <VoiceButton
              onResult={handleVoiceResult}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-blue-500"
              title="Voice Input"
            />
          </div>
        </div>
        <motion.button
          type="submit"
          disabled={!taskText.trim() || isAdding}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            taskText.trim() && !isAdding
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isAdding ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Adding...
            </span>
          ) : (
            'Add Task'
          )}
        </motion.button>
      </div>

      {/* Quick Add Shortcuts */}
      <div className="flex gap-2 mt-2">
        {['Meeting', 'Email', 'Review', 'Call', 'Research'].map((shortcut) => (
          <button
            key={shortcut}
            type="button"
            onClick={() => setTaskText(shortcut + ' ')}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            {shortcut}
          </button>
        ))}
      </div>
    </form>
  );
};

export default TaskInput;