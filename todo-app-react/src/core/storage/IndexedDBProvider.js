import Dexie from 'dexie';

// IndexedDB database for offline-first storage
const db = new Dexie('LifeAppDB');
db.version(2).stores({
  kv: 'key'
});

// Cleanup hook to handle schema changes
db.on('versionchange', () => {
  console.log('IndexedDB schema changed, clearing old data');
  db.delete().catch(() => {});
});

// Table structure: { key (primary), value }
export class IndexedDBProvider {
  async get(key) {
    try {
      const item = await db.kv.get(key);
      return item ? item.value : null;
    } catch (error) {
      console.error(`IndexedDB get error for ${key}:`, error);
      return null;
    }
  }

  async set(key, value) {
    try {
      await db.kv.put({ key, value });
    } catch (error) {
      console.error(`IndexedDB set error for ${key}:`, error);
      throw error;
    }
  }

  async remove(key) {
    try {
      await db.kv.delete(key);
    } catch (error) {
      console.error(`IndexedDB remove error for ${key}:`, error);
    }
  }

  async clear() {
    try {
      await db.kv.clear();
    } catch (error) {
      console.error('IndexedDB clear error:', error);
      throw error;
    }
  }

  async getBatch(keys) {
    try {
      const items = await db.kv.bulkGet(keys);
      const result = {};
      items.forEach((item) => {
        if (item) {
          result[item.key] = item.value;
        }
      });
      return result;
    } catch (error) {
      console.error('IndexedDB getBatch error:', error);
      return {};
    }
  }

  async setBatch(entries) {
    try {
      const items = Object.entries(entries).map(([key, value]) => ({
        key,
        value
      }));
      await db.kv.bulkPut(items);
    } catch (error) {
      console.error('IndexedDB setBatch error:', error);
      throw error;
    }
  }

  async getAll() {
    try {
      const items = await db.kv.toArray();
      const result = {};
      items.forEach((item) => {
        result[item.key] = item.value;
      });
      return result;
    } catch (error) {
      console.error('IndexedDB getAll error:', error);
      return {};
    }
  }

  subscribe(callback) {
    // IndexedDB doesn't have built-in cross-tab sync
    // Use storage event listener for tab communication if needed
    window.addEventListener('storage', (event) => {
      if (event.key && event.newValue) {
        try {
          callback(event.key, JSON.parse(event.newValue));
        } catch {
          // Ignore parse errors
        }
      }
    });

    return () => {
      window.removeEventListener('storage', callback);
    };
  }
}

export const indexedDBProvider = new IndexedDBProvider();
