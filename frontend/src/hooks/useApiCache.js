import { useState, useCallback, useRef } from 'react';

// Custom hook để cache API results
export function useApiCache() {
  const cacheRef = useRef(new Map());
  const [cacheSize, setCacheSize] = useState(0);

  const getCacheKey = useCallback((query, k) => {
    return `${query.toLowerCase().trim()}_${k}`;
  }, []);

  const get = useCallback((query, k) => {
    const key = getCacheKey(query, k);
    return cacheRef.current.get(key);
  }, [getCacheKey]);

  const set = useCallback((query, k, data) => {
    const key = getCacheKey(query, k);
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now()
    });
    setCacheSize(cacheRef.current.size);
  }, [getCacheKey]);

  const clear = useCallback(() => {
    cacheRef.current.clear();
    setCacheSize(0);
  }, []);

  const clearExpired = useCallback((maxAge = 5 * 60 * 1000) => { // 5 minutes default
    const now = Date.now();
    const entries = Array.from(cacheRef.current.entries());

    entries.forEach(([key, value]) => {
      if (now - value.timestamp > maxAge) {
        cacheRef.current.delete(key);
      }
    });

    setCacheSize(cacheRef.current.size);
  }, []);

  return { get, set, clear, clearExpired, cacheSize };
}
