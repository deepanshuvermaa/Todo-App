/**
 * LocalStorage Provider - For PWA and Web
 */

class LocalStorageProvider {
  constructor() {
    this.prefix = 'todo_';
  }

  async get(key) {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return null;
    }
  }

  async set(key, value) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);

      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError') {
        this.handleQuotaExceeded();
      }
      return false;
    }
  }

  async remove(key) {
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
      return false;
    }
  }

  async clear() {
    try {
      // Only clear items with our prefix
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      }
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  async getBatch(keys) {
    const results = {};
    for (const key of keys) {
      results[key] = await this.get(key);
    }
    return results;
  }

  async setBatch(items) {
    const results = {};
    for (const [key, value] of Object.entries(items)) {
      results[key] = await this.set(key, value);
    }
    return results;
  }

  handleQuotaExceeded() {
    // Clean up old data to make space
    console.warn('localStorage quota exceeded, cleaning up...');

    // Remove old completed tasks
    try {
      const tasks = JSON.parse(localStorage.getItem(this.prefix + 'tasks') || '[]');
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const filteredTasks = tasks.filter(task => {
        if (task.completed && task.completedDate) {
          return new Date(task.completedDate) > thirtyDaysAgo;
        }
        return true;
      });

      localStorage.setItem(this.prefix + 'tasks', JSON.stringify(filteredTasks));
      console.log(`Cleaned up ${tasks.length - filteredTasks.length} old tasks`);
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  // Check available space
  async getStorageInfo() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage,
        quota: estimate.quota,
        percentUsed: (estimate.usage / estimate.quota) * 100
      };
    }

    // Fallback for browsers that don't support storage.estimate
    const used = new Blob(Object.values(localStorage)).size;
    return {
      usage: used,
      quota: 5242880, // 5MB typical limit
      percentUsed: (used / 5242880) * 100
    };
  }
}

export default LocalStorageProvider;