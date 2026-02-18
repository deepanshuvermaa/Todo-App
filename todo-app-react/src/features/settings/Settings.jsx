import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useAppStore from '@/store/useAppStore';
import StorageAdapter from '@/core/storage/StorageAdapter';

const storage = new StorageAdapter();

const Settings = () => {
  const {
    darkMode,
    toggleDarkMode,
    isAuthenticated,
    userEmail,
    sheetUrl,
    signInToGoogle,
    signOutFromGoogle,
    syncStatus,
    syncToSheets,
    syncFromSheets,
    lastSyncTime
  } = useAppStore();

  const [exportData, setExportData] = useState(null);
  const [importFile, setImportFile] = useState(null);

  const handleExportData = () => {
    const store = useAppStore.getState();
    const dataToExport = {
      tasks: store.tasks,
      expenses: store.expenses,
      notes: store.notes,
      habits: store.habits,
      habitHistory: store.habitHistory,
      meals: store.meals,
      callReminders: store.callReminders,
      completedCallReminders: store.completedCallReminders,
      bucketList: store.bucketList,
      journalEntries: store.journalEntries,
      quotes: store.quotes,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-todo-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const [importError, setImportError] = useState(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingImportData, setPendingImportData] = useState(null);

  // Validate that imported JSON has correct shape
  const validateImportData = (data) => {
    const arrayKeys = ['tasks', 'expenses', 'notes', 'habits', 'meals', 'callReminders',
      'completedCallReminders', 'bucketList', 'journalEntries', 'quotes'];
    for (const key of arrayKeys) {
      if (data[key] !== undefined && !Array.isArray(data[key])) {
        return `Field "${key}" must be an array`;
      }
    }
    if (data.habitHistory !== undefined && (typeof data.habitHistory !== 'object' || Array.isArray(data.habitHistory))) {
      return 'Field "habitHistory" must be an object';
    }
    return null;
  };

  const handleImportData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImportError(null);
    setImportSuccess(false);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const validationError = validateImportData(data);
      if (validationError) {
        setImportError(`Invalid backup file: ${validationError}`);
        return;
      }

      setPendingImportData(data);
      setShowImportConfirm(true);
    } catch (error) {
      setImportError('Error reading file. Make sure it is a valid LIFE backup JSON.');
      console.error('Import error:', error);
    }
    // Reset input so the same file can be re-selected
    event.target.value = '';
  };

  const confirmImport = async () => {
    if (!pendingImportData) return;
    setShowImportConfirm(false);

    const data = pendingImportData;
    const updates = {};
    const storageWrites = [];

    const arrayKeys = ['tasks', 'expenses', 'notes', 'habits', 'meals', 'callReminders',
      'completedCallReminders', 'bucketList', 'journalEntries', 'quotes'];
    for (const key of arrayKeys) {
      if (data[key]) {
        updates[key] = data[key];
        storageWrites.push(storage.set(key, data[key]));
      }
    }
    if (data.habitHistory) {
      updates.habitHistory = data.habitHistory;
      storageWrites.push(storage.set('habitHistory', data.habitHistory));
    }

    // Use proper Zustand set() to trigger reactivity
    useAppStore.setState(updates);
    await Promise.all(storageWrites);

    setPendingImportData(null);
    setImportSuccess(true);
    setTimeout(() => setImportSuccess(false), 4000);
  };

  const clearAllData = () => {
    setShowClearConfirm(true);
  };

  const confirmClearAllData = async () => {
    setShowClearConfirm(false);
    // Only remove keys with the todo_ prefix — never wipe all of localStorage
    await storage.clear();
    window.location.reload();
  };

  const formatLastSync = (timestamp) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  const settingsSections = [
    {
      title: 'Appearance',
      items: [
        {
          title: 'Dark Mode',
          description: 'Toggle between light and dark themes',
          component: (
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                darkMode ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          )
        }
      ]
    },
    {
      title: 'Cloud Sync',
      items: [
        {
          title: 'Google Sheets Integration',
          description: isAuthenticated ? `Connected as ${userEmail}` : 'Sync your data with Google Sheets',
          component: (
            <div className="flex flex-col gap-2">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={syncToSheets}
                      disabled={syncStatus === 'syncing'}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                    >
                      {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
                    </button>
                    <button
                      onClick={syncFromSheets}
                      disabled={syncStatus === 'syncing'}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
                    >
                      Pull from Sheets
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Last sync: {formatLastSync(lastSyncTime)}
                  </p>
                  {sheetUrl && (
                    <a
                      href={sheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      View Spreadsheet
                    </a>
                  )}
                  <button
                    onClick={signOutFromGoogle}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={signInToGoogle}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  Connect Google Sheets
                </button>
              )}
            </div>
          )
        }
      ]
    },
    {
      title: 'Data Management',
      items: [
        {
          title: 'Export Data',
          description: 'Download a backup of all your data',
          component: (
            <button
              onClick={handleExportData}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              Export JSON
            </button>
          )
        },
        {
          title: 'Import Data',
          description: 'Restore data from a backup file',
          component: (
            <label className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 cursor-pointer">
              Choose File
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          )
        },
        {
          title: 'Clear All Data',
          description: 'Permanently delete all data (cannot be undone)',
          component: (
            <button
              onClick={clearAllData}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Clear All
            </button>
          )
        }
      ]
    },
    {
      title: 'About',
      items: [
        {
          title: 'Version',
          description: 'LIFE v2.0',
          component: (
            <span className="text-sm text-gray-500">
              React + PWA
            </span>
          )
        },
        {
          title: 'Features',
          description: 'Offline-first, Cloud sync, Voice input, Screenshots',
          component: null
        }
      ]
    }
  ];

  return (
    <div className="settings max-w-4xl mx-auto">
      {/* Inline confirm modals — no window.confirm() */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-red-600 mb-2">Delete ALL Data?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              This will permanently delete every task, note, expense, habit, and all other data. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={confirmClearAllData} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700">Yes, Delete Everything</button>
            </div>
          </div>
        </div>
      )}

      {showImportConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Replace Current Data?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              This will replace your current data with the contents of the backup file. Your existing data will be overwritten.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setShowImportConfirm(false); setPendingImportData(null); }} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={confirmImport} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">Import & Replace</button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your preferences and data
        </p>
      </div>

      {importError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {importError}
        </div>
      )}
      {importSuccess && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-sm">
          Data imported successfully! Your app has been updated with the backup data.
        </div>
      )}

      <div className="space-y-6">
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {section.title}
              </h2>

              <div className="space-y-4">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {item.description}
                      </p>
                    </div>

                    {item.component && (
                      <div className="ml-4">
                        {item.component}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* PWA Install Prompt */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800"
      >
        <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
          💡 Install as App
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Add LIFE to your home screen for a native app experience.
          Works offline and syncs when you're back online!
        </p>
      </motion.div>
    </div>
  );
};

export default Settings;