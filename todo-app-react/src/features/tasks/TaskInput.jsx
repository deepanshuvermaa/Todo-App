import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceButton from '@/shared/components/VoiceButton';
import NaturalLanguageParser from './NaturalLanguageParser';

const TaskInput = ({ onAddTask }) => {
  const [taskText, setTaskText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [parsedTask, setParsedTask] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const inputRef = useRef(null);

  // Parse input as user types
  useEffect(() => {
    if (taskText.trim()) {
      const parsed = NaturalLanguageParser.parse(taskText);
      setParsedTask(parsed);
      setShowSuggestions(parsed.suggestions.length > 0);
    } else {
      setParsedTask(null);
      setShowSuggestions(false);
    }
  }, [taskText]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!taskText.trim()) return;

    setIsAdding(true);

    // Use parsed task data if available
    const taskData = parsedTask ? {
      text: parsedTask.text,
      time: parsedTask.time,
      date: parsedTask.date,
      priority: parsedTask.priority,
      duration: parsedTask.duration,
      location: parsedTask.location,
      tags: parsedTask.tags,
      category: parsedTask.category
    } : taskText.trim();

    await onAddTask(taskData);
    setTaskText('');
    setParsedTask(null);
    setShowSuggestions(false);
    setIsAdding(false);
  };

  const handleVoiceResult = (transcript) => {
    setTaskText(transcript);
  };

  const handleQuickSuggestion = (suggestion) => {
    setTaskText(suggestion);
    setShowQuickAdd(false);
    inputRef.current?.focus();
  };

  const applySuggestion = (suggestion, option) => {
    let newText = taskText;
    switch (suggestion.type) {
      case 'time':
        newText += ` at ${option}`;
        break;
      case 'date':
        if (option === 'Today') newText += ' today';
        else if (option === 'Tomorrow') newText += ' tomorrow';
        else newText += ' this week';
        break;
      case 'priority':
        if (option === 'High Priority') newText += ' urgent';
        break;
    }
    setTaskText(newText);
    setShowSuggestions(false);
  };

  return (
    <div className="task-input-container">
      <form onSubmit={handleSubmit} className="task-input-form mt-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              placeholder="Try: 'Call John tomorrow at 2pm' or 'Buy groceries urgent'"
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

        {/* Natural Language Preview */}
        <AnimatePresence>
          {parsedTask && taskText.trim() && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Smart Parse Preview:</span>
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-full">
                  {Math.round(parsedTask.confidence * 100)}% confident
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Task:</span>
                  <p className="text-gray-800 dark:text-gray-200">{parsedTask.text}</p>
                </div>
                {parsedTask.date !== new Date().toISOString().split('T')[0] && (
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">Date:</span>
                    <p className="text-gray-800 dark:text-gray-200">{parsedTask.date}</p>
                  </div>
                )}
                {parsedTask.time && (
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">Time:</span>
                    <p className="text-gray-800 dark:text-gray-200">{parsedTask.time}</p>
                  </div>
                )}
                {parsedTask.priority !== 'medium' && (
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">Priority:</span>
                    <p className={`capitalize ${
                      parsedTask.priority === 'high' ? 'text-red-600 dark:text-red-400' :
                      parsedTask.priority === 'low' ? 'text-green-600 dark:text-green-400' :
                      'text-gray-800 dark:text-gray-200'
                    }`}>{parsedTask.priority}</p>
                  </div>
                )}
                {parsedTask.location && (
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">Location:</span>
                    <p className="text-gray-800 dark:text-gray-200">{parsedTask.location}</p>
                  </div>
                )}
                {parsedTask.tags.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">Tags:</span>
                    <p className="text-gray-800 dark:text-gray-200">{parsedTask.tags.map(tag => `#${tag}`).join(' ')}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Smart Suggestions */}
        <AnimatePresence>
          {showSuggestions && parsedTask?.suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
            >
              {parsedTask.suggestions.map((suggestion, idx) => (
                <div key={idx} className="mb-2 last:mb-0">
                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mr-2">
                    {suggestion.text}
                  </span>
                  <div className="flex gap-1 mt-1">
                    {suggestion.options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => applySuggestion(suggestion, option)}
                        className="px-2 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-800 dark:hover:bg-yellow-700 text-yellow-700 dark:text-yellow-200 rounded transition-colors"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Add Examples */}
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="px-3 py-1 text-xs bg-purple-100 hover:bg-purple-200 dark:bg-purple-800 dark:hover:bg-purple-700 text-purple-700 dark:text-purple-200 rounded-full transition-colors"
          >
            {showQuickAdd ? '✕' : '💡'} Examples
          </button>
          {['Meeting', 'Email', 'Review', 'Call', 'Research'].map((shortcut) => (
            <button
              key={shortcut}
              type="button"
              onClick={() => setTaskText(shortcut + ' ')}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full transition-colors"
            >
              {shortcut}
            </button>
          ))}
        </div>

        {/* Quick Suggestions Dropdown */}
        <AnimatePresence>
          {showQuickAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Try these examples:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                {NaturalLanguageParser.getQuickSuggestions().map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickSuggestion(suggestion)}
                    className="text-left px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    "{suggestion}"
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};

export default TaskInput;