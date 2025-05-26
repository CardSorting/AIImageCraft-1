/**
 * Cache middleware for high-performance image loading
 * Implements smart caching strategies for handling large traffic volumes
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  etag: string;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any): void {
    const etag = `"${Date.now()}-${Math.random().toString(36).substr(2, 9)}"`;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      etag
    });
  }

  get(key: string): CacheEntry | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if cache entry is expired
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.TTL) {
        this.cache.delete(key);
      }
    }
  }
}

export const imageCache = new MemoryCache();

// Cleanup every 10 minutes
setInterval(() => {
  imageCache.cleanup();
}, 10 * 60 * 1000);

export function cacheMiddleware(req: any, res: any, next: any) {
  const cacheKey = `${req.method}:${req.url}`;
  const cached = imageCache.get(cacheKey);

  if (cached) {
    // Check if client has the same version (ETag)
    const clientETag = req.headers['if-none-match'];
    if (clientETag === cached.etag) {
      return res.status(304).end();
    }

    // Set cache headers
    res.set({
      'Cache-Control': 'public, max-age=300, s-maxage=600',
      'ETag': cached.etag,
      'Last-Modified': new Date(cached.timestamp).toUTCString()
    });

    return res.json(cached.data);
  }

  // Store original res.json to intercept response
  const originalJson = res.json.bind(res);
  res.json = function(data: any) {
    // Cache successful responses
    if (res.statusCode === 200) {
      imageCache.set(cacheKey, data);
      const cached = imageCache.get(cacheKey);
      if (cached) {
        res.set({
          'Cache-Control': 'public, max-age=300, s-maxage=600',
          'ETag': cached.etag,
          'Last-Modified': new Date(cached.timestamp).toUTCString()
        });
      }
    }
    return originalJson(data);
  };

  next();
}