import NodeCache from 'node-cache';

class CacheManager {
    constructor(ttlSeconds = 3600) {
        this.cache = new NodeCache({
            stdTTL: ttlSeconds,
            checkperiod: ttlSeconds * 0.2,
            useClones: false
        });
    }

    /**
     * Get a value from cache
     * @param {string} key - Cache key
     * @returns {any|undefined} Cached value or undefined if not found
     */
    get(key) {
        return this.cache.get(key);
    }

    /**
     * Set a value in cache
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} [ttl] - Time to live in seconds
     * @returns {boolean} True on success, false on failure
     */
    set(key, value, ttl = undefined) {
        return this.cache.set(key, value, ttl);
    }

    /**
     * Delete a value from cache
     * @param {string} key - Cache key
     * @returns {number} Number of deleted entries
     */
    delete(key) {
        return this.cache.del(key);
    }

    /**
     * Clear all cache entries
     */
    clear() {
        return this.cache.flushAll();
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getStats() {
        return this.cache.getStats();
    }
}

// Create a singleton instance
const templateCache = new CacheManager();

export default templateCache;