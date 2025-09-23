// Cache management utilities

class CacheManager {
  constructor(maxSize = 50, ttl = 3600000) { // 1 hour default TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.accessOrder = [];
  }

  set(key, value, customTTL = null) {
    const ttl = customTTL || this.ttl;
    const expiresAt = Date.now() + ttl;

    // Remove oldest item if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.accessOrder.shift();
      this.cache.delete(oldestKey);
    }

    // Update cache and access order
    this.cache.set(key, { value, expiresAt });
    this.updateAccessOrder(key);

    return value;
  }

  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() > item.expiresAt) {
      this.delete(key);
      return null;
    }

    // Update access order (LRU)
    this.updateAccessOrder(key);
    return item.value;
  }

  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      const index = this.accessOrder.indexOf(key);
      if (index > -1) {
        this.accessOrder.splice(index, 1);
      }
    }
    return deleted;
  }

  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }

  has(key) {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expiresAt) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  size() {
    return this.cache.size;
  }

  updateAccessOrder(key) {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  // Get cache statistics
  getStats() {
    let validItems = 0;
    let expiredItems = 0;
    const now = Date.now();

    this.cache.forEach((item) => {
      if (now > item.expiresAt) {
        expiredItems++;
      } else {
        validItems++;
      }
    });

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      validItems,
      expiredItems,
      hitRate: this.hitRate || 0
    };
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

// Export cache utilities
export const cache = {
  set: (key, value, ttl) => cacheManager.set(key, value, ttl),
  get: (key) => cacheManager.get(key),
  delete: (key) => cacheManager.delete(key),
  clear: () => cacheManager.clear(),
  has: (key) => cacheManager.has(key),
  size: () => cacheManager.size(),
  stats: () => cacheManager.getStats()
};

// Session storage cache for temporary data
export const sessionCache = {
  set: (key, value) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('SessionStorage not available:', e);
    }
  },
  
  get: (key) => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.warn('Error reading from sessionStorage:', e);
      return null;
    }
  },
  
  delete: (key) => {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      console.warn('Error deleting from sessionStorage:', e);
    }
  },
  
  clear: () => {
    try {
      sessionStorage.clear();
    } catch (e) {
      console.warn('Error clearing sessionStorage:', e);
    }
  }
};

export default cache;