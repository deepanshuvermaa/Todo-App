import React, { useState, useEffect } from 'react';
import useAppStore from '@/store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

const SyncStatus = () => {
  const {
    syncStatus,
    isAuthenticated,
    userEmail,
    sheetUrl,
    lastSyncTime,
    signInToGoogle,
    signOutFromGoogle,
    syncToSheets,
    syncFromSheets
  } = useAppStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return (
          <motion.svg
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </motion.svg>
        );
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'offline':
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        );
    }
  };

  const getStatusText = () => {
    if (!isAuthenticated) return 'Not connected';

    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...';
      case 'success':
        const lastSync = lastSyncTime ? new Date(lastSyncTime) : null;
        if (lastSync) {
          const now = new Date();
          const diffMinutes = Math.floor((now - lastSync) / (1000 * 60));
          if (diffMinutes < 1) return 'Just synced';
          if (diffMinutes < 60) return `Synced ${diffMinutes}m ago`;
          const diffHours = Math.floor(diffMinutes / 60);
          return `Synced ${diffHours}h ago`;
        }
        return 'Synced';
      case 'failed':
        return 'Sync failed';
      case 'offline':
        return 'Offline';
      case 'pending':
        return 'Pending sync';
      default:
        return 'Ready to sync';
    }
  };

  const handleSignIn = async () => {
    try {
      setIsSyncing(true);
      await signInToGoogle();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Sign-in failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutFromGoogle();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Sign-out failed:', error);
    }
  };

  const handleSyncToSheets = async () => {
    try {
      setIsSyncing(true);
      await syncToSheets();
    } catch (error) {
      console.error('Sync to sheets failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncFromSheets = async () => {
    try {
      setIsSyncing(true);
      await syncFromSheets();
    } catch (error) {
      console.error('Sync from sheets failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.sync-status-menu')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <div className="relative sync-status-menu">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title={getStatusText()}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={syncStatus}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            {getStatusIcon()}
          </motion.div>
        </AnimatePresence>
        <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
          {getStatusText()}
        </span>
      </button>

      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
        >
          <div className="p-4">
            <div className="mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Google Sheets Sync
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isAuthenticated
                  ? `Connected as ${userEmail}`
                  : 'Sign in to sync your data with Google Sheets'
                }
              </p>
            </div>

            {isAuthenticated ? (
              <div className="space-y-2">
                {sheetUrl && (
                  <a
                    href={sheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Google Sheet
                  </a>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleSyncToSheets}
                    disabled={isSyncing || syncStatus === 'syncing'}
                    className="flex-1 btn-primary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Push to Sheets
                  </button>
                  <button
                    onClick={handleSyncFromSheets}
                    disabled={isSyncing || syncStatus === 'syncing'}
                    className="flex-1 btn-secondary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Pull from Sheets
                  </button>
                </div>

                <button
                  onClick={handleSignOut}
                  className="w-full text-sm text-red-600 dark:text-red-400 hover:underline py-1"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={isSyncing}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSyncing ? 'Connecting...' : 'Connect Google Sheets'}
              </button>
            )}

            {lastSyncTime && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Last sync: {new Date(lastSyncTime).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SyncStatus;