import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useAppStore from '@/store/useAppStore';
import ConfirmDialog from '@/components/ConfirmDialog';

const MigrationPrompt = ({ onComplete }) => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [confirmState, setConfirmState] = useState(null);
  const { migrateFromLegacy } = useAppStore();

  const handleMigrate = async () => {
    setIsMigrating(true);
    setProgress(0);

    try {
      // Simulate progress steps
      setStatus('Reading existing data...');
      setProgress(20);
      await new Promise(resolve => setTimeout(resolve, 500));

      setStatus('Converting task format...');
      setProgress(40);
      await new Promise(resolve => setTimeout(resolve, 500));

      setStatus('Migrating expenses and notes...');
      setProgress(60);
      await new Promise(resolve => setTimeout(resolve, 500));

      setStatus('Importing habits and meals...');
      setProgress(80);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Perform actual migration
      await migrateFromLegacy();

      setStatus('Migration complete!');
      setProgress(100);

      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (error) {
      console.error('Migration failed:', error);
      setStatus('Migration failed. Please try again.');
      setIsMigrating(false);
    }
  };

  const handleSkip = () => {
    setConfirmState({
      message: 'Skip data migration?',
      detail: 'You can migrate your data later from Settings. Your existing data will remain untouched.',
      confirmLabel: 'Skip Migration',
      danger: false,
      onConfirm: () => onComplete(),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <ConfirmDialog state={confirmState} onClose={() => setConfirmState(null)} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Welcome to LIFE!
          </h2>

          <p className="text-gray-600 dark:text-gray-400">
            We detected existing data from your previous todo app. Would you like to migrate it to the new version?
          </p>
        </div>

        {!isMigrating ? (
          <>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                What will be migrated:
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                <li>✓ All tasks and completion history</li>
                <li>✓ Expenses and budgets</li>
                <li>✓ Notes and journals</li>
                <li>✓ Habits and streaks</li>
                <li>✓ Meal tracking data</li>
                <li>✓ Call reminders</li>
                <li>✓ Google Sheets configuration</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleMigrate}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Migrate My Data
              </button>

              <button
                onClick={handleSkip}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Skip for Now
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>{status}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-blue-500"
                />
              </div>
            </div>

            {progress === 100 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <svg className="w-12 h-12 text-green-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-600 dark:text-green-400 font-medium">
                  All data successfully migrated!
                </p>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default MigrationPrompt;