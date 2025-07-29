import templateCache from '../cacheManager';

describe('CacheManager', () => {
  beforeEach(() => {
    templateCache.clear();
  });

  it('should set and get values correctly', () => {
    const key = 'test-key';
    const value = { data: 'test-data' };

    expect(templateCache.set(key, value)).toBe(true);
    expect(templateCache.get(key)).toEqual(value);
  });

  it('should return undefined for non-existent keys', () => {
    expect(templateCache.get('non-existent')).toBeUndefined();
  });

  it('should delete values correctly', () => {
    const key = 'test-key';
    const value = 'test-value';

    templateCache.set(key, value);
    expect(templateCache.delete(key)).toBe(1);
    expect(templateCache.get(key)).toBeUndefined();
  });

  it('should clear all values', () => {
    templateCache.set('key1', 'value1');
    templateCache.set('key2', 'value2');

    templateCache.clear();

    expect(templateCache.get('key1')).toBeUndefined();
    expect(templateCache.get('key2')).toBeUndefined();
  });

  it('should respect TTL', async () => {
    const key = 'ttl-test';
    const value = 'test-value';
    const ttl = 1; // 1 second

    templateCache.set(key, value, ttl);
    expect(templateCache.get(key)).toBe(value);

    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, 1100));

    expect(templateCache.get(key)).toBeUndefined();
  });

  it('should return cache statistics', () => {
    const stats = templateCache.getStats();

    expect(stats).toHaveProperty('hits');
    expect(stats).toHaveProperty('misses');
    expect(stats).toHaveProperty('keys');
    expect(stats).toHaveProperty('ksize');
    expect(stats).toHaveProperty('vsize');
  });
});
