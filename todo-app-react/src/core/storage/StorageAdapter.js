/**
 * Storage Adapter - Unified storage interface using IndexedDB
 * Async, offline-first storage with 50MB+ capacity
 */

import { IndexedDBProvider } from './IndexedDBProvider';

class StorageAdapter {
  constructor() {
    this.provider = new IndexedDBProvider();
    this.cache = new Map();
    this.listeners = new Map();
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

}

export default StorageAdapter;