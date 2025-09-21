import React, { useState, useEffect } from 'react';
import useAppStore from '@/store/useAppStore';
import TaskCard from './TaskCard';
import TaskInput from './TaskInput';
import TaskMetrics from './TaskMetrics';
import { motion, AnimatePresence } from 'framer-motion';

const TaskManager = () => {
  const {
    tasks,
    currentDate,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    getMetrics
  } = useAppStore();

  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get today's tasks
  const todayStr = currentDate.toISOString().split('T')[0];
  const todayTasks = tasks.filter(task => task.date === todayStr);

  // Apply filters
  const filteredTasks = todayTasks.filter(task => {
    // Search filter
    if (searchQuery && !task.text.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Status filter
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  // Sort tasks: pending first, then completed
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  const metrics = getMetrics();

  return (
    <div className="task-manager">
      {/* Header Section */}
      <div className="task-header mb-6">
        {/* Centered Title */}
        <h2 className="text-xl md:text-2xl font-bold text-center mb-2">Today's Tasks</h2>

        {/* Date Display */}
        <div className="text-center mb-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>

        {/* Metrics Dashboard */}
        <TaskMetrics metrics={metrics} />

        {/* Add Task Input */}
        <TaskInput onAddTask={addTask} />

        {/* Filters */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            All ({todayTasks.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'pending'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Pending ({metrics.pending})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'completed'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Completed ({metrics.completed})
          </button>
        </div>

        {/* Search */}
        <div className="mt-3">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Task List */}
      <div className="task-list space-y-3">
        <AnimatePresence mode="popLayout">
          {sortedTasks.length > 0 ? (
            sortedTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
              >
                <TaskCard
                  task={task}
                  onToggle={() => toggleTask(task.id)}
                  onUpdate={(updates) => updateTask(task.id, updates)}
                  onDelete={() => deleteTask(task.id)}
                />
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-400"
            >
              {searchQuery
                ? 'No tasks found matching your search'
                : filter === 'completed'
                ? 'No completed tasks yet'
                : filter === 'pending'
                ? 'All tasks completed! 🎉'
                : 'No tasks for today. Add one to get started!'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TaskManager;