/**
 * Storage Adapter - Unified storage interface for PWA and Chrome Extension
 * Automatically detects environment and uses appropriate storage mechanism
 */

import LocalStorageProvider from './LocalStorageProvider';
import ChromeStorageProvider from './ChromeStorageProvider';

class StorageAdapter {
  constructor() {
    this.provider = this.detectProvider();
    this.cache = new Map();
    this.listeners = new Map();
  }

  detectProvider() {
    // Check if running as Chrome extension
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      console.log('Storage: Using Chrome Extension storage');
      return new ChromeStorageProvider();
    }

    // Default to localStorage for PWA/web
    console.log('Storage: Using localStorage');
    return new LocalStorageProvider();
  }

  async get(key) {
    // Check cache first
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const value = await this.provider.get(key);
    this.cache.set(key, value);
    return value;
  }

  async set(key, value) {
    // Update cache
    this.cache.set(key, value);

    // Save to provider
    await this.provider.set(key, value);

    // Notify listeners
    this.notifyListeners(key, value);

    // Trigger service worker sync if available (PWA)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SYNC_DATA',
        key,
        value
      });
    }
  }

  async remove(key) {
    this.cache.delete(key);
    await this.provider.remove(key);
    this.notifyListeners(key, null);
  }

  async clear() {
    this.cache.clear();
    await this.provider.clear();
  }

  // Subscribe to changes
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(key);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  notifyListeners(key, value) {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach(callback => callback(value));
    }
  }

  // Batch operations for performance
  async getBatch(keys) {
    const results = {};
    const uncachedKeys = [];

    // Check cache first
    for (const key of keys) {
      if (this.cache.has(key)) {
        results[key] = this.cache.get(key);
      } else {
        uncachedKeys.push(key);
      }
    }

    // Fetch uncached items
    if (uncachedKeys.length > 0) {
      const batchResults = await this.provider.getBatch(uncachedKeys);
      Object.assign(results, batchResults);

      // Update cache
      for (const [key, value] of Object.entries(batchResults)) {
        this.cache.set(key, value);
      }
    }

    return results;
  }

  async setBatch(items) {
    // Update cache
    for (const [key, value] of Object.entries(items)) {
      this.cache.set(key, value);
      this.notifyListeners(key, value);
    }

    // Save to provider
    await this.provider.setBatch(items);
  }

  // Migration helper
  async migrate(oldData) {
    console.log('Starting data migration...');

    const migrationMap = {
      'tasks': 'tasks',
      'expenses': 'expenses',
      'notes': 'notes',
      'habits': 'habits',
      'habitHistory': 'habitHistory',
      'meals': 'meals',
      'callReminders': 'callReminders',
      'completedCallReminders': 'completedCallReminders',
      'bucketList': 'bucketList',
      'journalEntries': 'journalEntries',
      'userSheetId': 'userSheetId',
      'googleAccessToken': 'googleAccessToken',
      'tokenExpiry': 'tokenExpiry',
      'userEmail': 'userEmail',
      'darkMode': 'darkMode',
      'expenseBudget': 'expenseBudget',
      'dismissedBudgetAlerts': 'dismissedBudgetAlerts',
      'habitReminders': 'habitReminders',
      'journalDraft': 'journalDraft',
      'userSheetUrl': 'userSheetUrl',
      'voiceNotes': 'voiceNotes',
      'smartWidgetSettings': 'smartWidgetSettings',
      'aiInsightsSettings': 'aiInsightsSettings',
      'streakData': 'streakData',
      'quotes': 'quotes',
      'pendingChanges': 'pendingChanges'
    };

    const migrated = {};

    for (const [oldKey, newKey] of Object.entries(migrationMap)) {
      if (oldData[oldKey]) {
        try {
          const data = typeof oldData[oldKey] === 'string'
            ? JSON.parse(oldData[oldKey])
            : oldData[oldKey];

          await this.set(newKey, data);
          migrated[newKey] = true;
          console.log(`Migrated ${oldKey} → ${newKey}`);
        } catch (error) {
          console.error(`Failed to migrate ${oldKey}:`, error);
        }
      }
    }

    // Store migration timestamp
    await this.set('migrationCompleted', {
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      migratedKeys: Object.keys(migrated)
    });

    console.log('Migration completed successfully');
    return migrated;
  }

  // Check if migration is needed
  async needsMigration() {
    const migrationInfo = await this.get('migrationCompleted');

    // Check if localStorage has old data
    if (typeof localStorage !== 'undefined') {
      const hasOldData = localStorage.getItem('tasks') !== null;
      return hasOldData && !migrationInfo;
    }

    return false;
  }
}

export default StorageAdapter;