import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="inline-block"
        >
          <svg className="w-16 h-16 text-blue-500" fill="none" viewBox="0 0 24 24">
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
        </motion.div>
        <h2 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">
          Loading your tasks...
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Preparing your offline-first experience
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;