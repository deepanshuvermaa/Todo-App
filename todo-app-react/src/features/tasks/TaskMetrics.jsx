import React from 'react';
import { motion } from 'framer-motion';

const TaskMetrics = ({ metrics }) => {
  const getProgressColor = (rate) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-yellow-500';
    if (rate >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="task-metrics grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="metric-card bg-white p-4 rounded-lg border border-gray-200"
      >
        <div className="text-2xl font-bold text-gray-800">{metrics.total}</div>
        <div className="text-sm text-gray-500">Total Tasks</div>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        className="metric-card bg-white p-4 rounded-lg border border-gray-200"
      >
        <div className="text-2xl font-bold text-green-600">{metrics.completed}</div>
        <div className="text-sm text-gray-500">Completed</div>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        className="metric-card bg-white p-4 rounded-lg border border-gray-200"
      >
        <div className="text-2xl font-bold text-yellow-600">{metrics.pending}</div>
        <div className="text-sm text-gray-500">Pending</div>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        className="metric-card bg-white p-4 rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-blue-600">
            {metrics.completionRate}%
          </div>
        </div>
        <div className="text-sm text-gray-500">Completion Rate</div>
        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${metrics.completionRate}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-full ${getProgressColor(metrics.completionRate)}`}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default TaskMetrics;