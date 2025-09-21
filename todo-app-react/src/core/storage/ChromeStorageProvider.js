/**
 * Chrome Storage Provider - For Chrome Extension
 */

class ChromeStorageProvider {
  constructor() {
    this.storage = chrome.storage.local;
  }

  async get(key) {
    return new Promise((resolve) => {
      this.storage.get([key], (result) => {
        if (chrome.runtime.lastError) {
          console.error(`Error getting ${key}:`, chrome.runtime.lastError);
          resolve(null);
        } else {
          resolve(result[key] || null);
        }
      });
    });
  }

  async set(key, value) {
    return new Promise((resolve) => {
      this.storage.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          console.error(`Error setting ${key}:`, chrome.runtime.lastError);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  async remove(key) {
    return new Promise((resolve) => {
      this.storage.remove(key, () => {
        if (chrome.runtime.lastError) {
          console.error(`Error removing ${key}:`, chrome.runtime.lastError);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  async clear() {
    return new Promise((resolve) => {
      this.storage.clear(() => {
        if (chrome.runtime.lastError) {
          console.error('Error clearing storage:', chrome.runtime.lastError);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  async getBatch(keys) {
    return new Promise((resolve) => {
      this.storage.get(keys, (result) => {
        if (chrome.runtime.lastError) {
          console.error('Error getting batch:', chrome.runtime.lastError);
          resolve({});
        } else {
          resolve(result);
        }
      });
    });
  }

  async setBatch(items) {
    return new Promise((resolve) => {
      this.storage.set(items, () => {
        if (chrome.runtime.lastError) {
          console.error('Error setting batch:', chrome.runtime.lastError);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  // Get storage info (Chrome extension specific)
  async getStorageInfo() {
    return new Promise((resolve) => {
      this.storage.getBytesInUse(null, (bytesInUse) => {
        const quota = chrome.storage.local.QUOTA_BYTES || 5242880; // 5MB default

        resolve({
          usage: bytesInUse,
          quota: quota,
          percentUsed: (bytesInUse / quota) * 100
        });
      });
    });
  }

  // Listen for storage changes (useful for sync between tabs/windows)
  addListener(callback) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local') {
        const formattedChanges = {};
        for (const [key, change] of Object.entries(changes)) {
          formattedChanges[key] = {
            oldValue: change.oldValue,
            newValue: change.newValue
          };
        }
        callback(formattedChanges);
      }
    });
  }
}

export default ChromeStorageProvider;