/**
 * Storage & Cache Manager for QuantoGastei
 * Provides multi-layer local caching, timestamp tracking, and export/import capabilities
 */

const CACHE_PREFIX = 'finan_';
const CACHE_METADATA_KEY = 'finan_cache_meta_v1';

export interface CacheMetadata {
  lastSavedAt: string;
  version: number;
  keys: string[];
  sizeKb: number;
}

/**
 * Saves data into persistent cache with timestamp tracking
 */
export const saveToCache = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);

    // Update cache metadata
    const meta: CacheMetadata = {
      lastSavedAt: new Date().toISOString(),
      version: 1,
      keys: Object.keys(localStorage).filter((k) => k.startsWith(CACHE_PREFIX)),
      sizeKb: Math.round((new Blob([serialized]).size / 1024) * 10) / 10,
    };
    localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(meta));
  } catch (error) {
    console.warn('Cache write warning:', error);
  }
};

/**
 * Loads data from cache with fallback
 */
export const loadFromCache = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Cache read warning for ${key}:`, error);
    return fallback;
  }
};

/**
 * Returns cache metadata and status
 */
export const getCacheStatus = (): {
  isAvailable: boolean;
  lastSavedFormatted: string;
  totalKeys: number;
  totalSizeKb: number;
} => {
  if (typeof window === 'undefined') {
    return { isAvailable: false, lastSavedFormatted: 'Indisponível', totalKeys: 0, totalSizeKb: 0 };
  }

  try {
    let totalBytes = 0;
    let finanKeys = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(CACHE_PREFIX)) {
        finanKeys++;
        const val = localStorage.getItem(k) || '';
        totalBytes += k.length + val.length;
      }
    }

    const metaItem = localStorage.getItem(CACHE_METADATA_KEY);
    let lastSavedFormatted = 'Agora mesmo';

    if (metaItem) {
      try {
        const meta: CacheMetadata = JSON.parse(metaItem);
        const date = new Date(meta.lastSavedAt);
        lastSavedFormatted = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      } catch {
        // fallback
      }
    }

    return {
      isAvailable: true,
      lastSavedFormatted,
      totalKeys: finanKeys,
      totalSizeKb: Math.round((totalBytes / 1024) * 10) / 10,
    };
  } catch {
    return { isAvailable: false, lastSavedFormatted: 'Erro', totalKeys: 0, totalSizeKb: 0 };
  }
};

/**
 * Clears all cached application data
 */
export const clearAppCache = (): void => {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.error('Error clearing app cache:', err);
  }
};
