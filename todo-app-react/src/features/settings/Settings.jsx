import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useAppStore from '@/store/useAppStore';

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

  const handleImportData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (window.confirm('This will replace all your current data. Are you sure you want to import?')) {
        const store = useAppStore.getState();

        // Import all data
        if (data.tasks) store.tasks = data.tasks;
        if (data.expenses) store.expenses = data.expenses;
        if (data.notes) store.notes = data.notes;
        if (data.habits) store.habits = data.habits;
        if (data.habitHistory) store.habitHistory = data.habitHistory;
        if (data.meals) store.meals = data.meals;
        if (data.callReminders) store.callReminders = data.callReminders;
        if (data.completedCallReminders) store.completedCallReminders = data.completedCallReminders;
        if (data.bucketList) store.bucketList = data.bucketList;
        if (data.journalEntries) store.journalEntries = data.journalEntries;
        if (data.quotes) store.quotes = data.quotes;

        alert('Data imported successfully!');
        window.location.reload(); // Refresh to reflect changes
      }
    } catch (error) {
      alert('Error importing data. Please check the file format.');
      console.error('Import error:', error);
    }
  };

  const clearAllData = () => {
    if (window.confirm('This will permanently delete ALL your data. This action cannot be undone. Are you sure?')) {
      if (window.confirm('Are you ABSOLUTELY sure? This will delete everything!')) {
        localStorage.clear();
        window.location.reload();
      }
    }
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your preferences and data
        </p>
      </div>

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