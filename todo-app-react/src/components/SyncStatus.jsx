import React, { useState } from 'react';
import useAppStore from '@/store/useAppStore';

const SyncStatus = () => {
  const { isAuthenticated, userEmail, syncStatus, lastSyncTime, syncToCloud, signOut } = useAppStore();
  const [showMenu, setShowMenu] = useState(false);

  if (!isAuthenticated || !userEmail) return null;

  const statusIcons = {
    idle: '☁️',
    syncing: '⟳',
    success: '✓',
    failed: '⚠️',
    offline: '📵'
  };

  const statusColors = {
    idle: 'text-gray-500',
    syncing: 'text-blue-500 animate-spin',
    success: 'text-green-500',
    failed: 'text-red-500',
    offline: 'text-gray-400'
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        <span className={statusColors[syncStatus]}>{statusIcons[syncStatus]}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{userEmail}</span>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl z-50 border border-gray-200 dark:border-slate-700">
          <div className="p-4">
            <div className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Account</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-4">{userEmail}</div>

            <div className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Sync Status</div>
            <div className="flex items-center gap-2 mb-4">
              <span className={statusColors[syncStatus]}>{statusIcons[syncStatus]}</span>
              <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">{syncStatus}</span>
            </div>

            {lastSyncTime && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Last synced: {new Date(lastSyncTime).toLocaleTimeString()}
              </div>
            )}

            <button
              onClick={() => {
                syncToCloud();
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition mb-2"
            >
              Sync Now
            </button>

            <button
              onClick={() => {
                signOut();
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-xs font-medium rounded-lg transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncStatus;
