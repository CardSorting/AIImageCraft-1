import { performance } from 'perf_hooks';
import { db } from './database';

interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: number;
  rows?: number;
  cached?: boolean;
}

interface PerformanceStats {
  totalQueries: number;
  averageQueryTime: number;
  slowQueries: QueryMetrics[];
  cacheHitRate: number;
  connectionsActive: number;
}

class PerformanceMonitor {
  private metrics: QueryMetrics[] = [];
  private slowQueryThreshold = 1000; // 1 second
  private maxMetricsHistory = 1000;
  private cacheHits = 0;
  private cacheMisses = 0;

  logQuery(query: string, duration: number, rows?: number, cached = false): void {
    const metric: QueryMetrics = {
      query: this.sanitizeQuery(query),
      duration,
      timestamp: Date.now(),
      rows,
      cached
    };

    this.metrics.push(metric);
    
    if (cached) {
      this.cacheHits++;
    } else {
      this.cacheMisses++;
    }

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }

    // Log slow queries
    if (duration > this.slowQueryThreshold) {
      console.warn(`[SLOW QUERY] ${duration.toFixed(2)}ms: ${this.sanitizeQuery(query)}`);
    }
  }

  private sanitizeQuery(query: string): string {
    // Remove sensitive data and normalize for logging
    return query
      .replace(/\$\d+/g, '?') // Replace parameter placeholders
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 200); // Limit length
  }

  getStats(): PerformanceStats {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(m => now - m.timestamp < 300000); // Last 5 minutes
    
    const slowQueries = recentMetrics
      .filter(m => m.duration > this.slowQueryThreshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    const totalCacheRequests = this.cacheHits + this.cacheMisses;
    const cacheHitRate = totalCacheRequests > 0 ? (this.cacheHits / totalCacheRequests) * 100 : 0;

    return {
      totalQueries: recentMetrics.length,
      averageQueryTime: recentMetrics.length > 0 
        ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length 
        : 0,
      slowQueries,
      cacheHitRate,
      connectionsActive: 0 // Would need to implement connection tracking
    };
  }

  async checkDatabaseHealth(): Promise<{healthy: boolean, latency: number, error?: string}> {
    const start = performance.now();
    try {
      await db.execute('SELECT 1');
      const latency = performance.now() - start;
      return { healthy: true, latency };
    } catch (error: any) {
      const latency = performance.now() - start;
      return { healthy: false, latency, error: error.message };
    }
  }

  reset(): void {
    this.metrics = [];
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Enhanced query wrapper for performance monitoring
export function withPerformanceMonitoring<T>(
  queryFn: () => Promise<T>,
  queryDescription: string
): Promise<T> {
  const start = performance.now();
  
  return queryFn().then(result => {
    const duration = performance.now() - start;
    const rows = Array.isArray(result) ? result.length : result ? 1 : 0;
    performanceMonitor.logQuery(queryDescription, duration, rows);
    return result;
  }).catch(error => {
    const duration = performance.now() - start;
    performanceMonitor.logQuery(`ERROR: ${queryDescription}`, duration);
    throw error;
  });
}

// Periodic health check and reporting
setInterval(async () => {
  const stats = performanceMonitor.getStats();
  const health = await performanceMonitor.checkDatabaseHealth();
  
  if (!health.healthy) {
    console.error('[DB HEALTH] Database connection unhealthy:', health.error);
  }
  
  if (stats.averageQueryTime > 500) {
    console.warn(`[DB PERFORMANCE] Average query time: ${stats.averageQueryTime.toFixed(2)}ms`);
  }
  
  if (stats.cacheHitRate < 70 && stats.totalQueries > 10) {
    console.warn(`[CACHE PERFORMANCE] Low cache hit rate: ${stats.cacheHitRate.toFixed(1)}%`);
  }
}, 60000); // Check every minute