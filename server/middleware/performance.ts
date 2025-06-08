import { Request, Response, NextFunction } from 'express';
import compression from 'compression';
import { performance } from 'perf_hooks';

interface RequestTiming {
  start: number;
  route?: string;
  method: string;
  userAgent?: string;
}

// Request timing middleware for performance monitoring
export function requestTimingMiddleware(req: Request, res: Response, next: NextFunction) {
  const timing: RequestTiming = {
    start: performance.now(),
    route: req.route?.path || req.path,
    method: req.method,
    userAgent: req.get('User-Agent')
  };

  // Store timing info on request
  (req as any).timing = timing;

  // Capture response time
  res.on('finish', () => {
    const duration = performance.now() - timing.start;
    
    // Log slow requests (>1000ms)
    if (duration > 1000) {
      console.warn(`[SLOW REQUEST] ${timing.method} ${timing.route} - ${duration.toFixed(2)}ms`);
    }
    
    // Add performance headers
    res.set('X-Response-Time', `${duration.toFixed(2)}ms`);
  });

  next();
}

// Smart compression middleware
export function smartCompressionMiddleware() {
  return compression({
    // Only compress responses larger than 1KB
    threshold: 1024,
    // Custom compression filter
    filter: (req: Request, res: Response) => {
      // Don't compress images, videos, or already compressed content
      const contentType = res.get('Content-Type') || '';
      if (contentType.startsWith('image/') || 
          contentType.startsWith('video/') ||
          contentType.includes('application/octet-stream')) {
        return false;
      }
      return compression.filter(req, res);
    },
    // Optimize compression level for speed vs size trade-off
    level: 6, // Balanced compression
    // Set memory level for better performance
    memLevel: 8
  });
}

// Request deduplication middleware for identical concurrent requests
const pendingRequests = new Map<string, Promise<any>>();

export function requestDeduplicationMiddleware(req: Request, res: Response, next: NextFunction) {
  // Only deduplicate GET requests to specific API endpoints
  if (req.method !== 'GET' || !req.path.startsWith('/api/')) {
    return next();
  }

  const requestKey = `${req.method}:${req.path}:${JSON.stringify(req.query)}:${req.get('Authorization') || 'anonymous'}`;
  
  // Check if identical request is already in progress
  if (pendingRequests.has(requestKey)) {
    // Wait for the existing request to complete
    pendingRequests.get(requestKey)?.then((result) => {
      if (result && !res.headersSent) {
        res.json(result);
      }
    }).catch(() => {
      // If deduplication fails, proceed with normal request
      next();
    });
    return;
  }

  // Store response data for deduplication
  let responseData: any = null;
  const originalJson = res.json.bind(res);
  
  res.json = function(data: any) {
    responseData = data;
    pendingRequests.delete(requestKey);
    return originalJson(data);
  };

  // Create promise for this request
  const requestPromise = new Promise((resolve, reject) => {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve(responseData);
      } else {
        reject(new Error(`Request failed with status ${res.statusCode}`));
      }
    });
    
    res.on('error', reject);
  });

  pendingRequests.set(requestKey, requestPromise);
  
  // Clean up after 30 seconds to prevent memory leaks
  setTimeout(() => {
    pendingRequests.delete(requestKey);
  }, 30000);

  next();
}

// Response caching middleware for static content
const responseCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export function responseCacheMiddleware(ttlMs: number = 300000) { // 5 minutes default
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `${req.path}:${JSON.stringify(req.query)}`;
    const cached = responseCache.get(cacheKey);
    
    // Check if we have valid cached response
    if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
      res.set('X-Cache', 'HIT');
      res.set('X-Cache-TTL', Math.ceil((cached.ttl - (Date.now() - cached.timestamp)) / 1000).toString());
      return res.json(cached.data);
    }

    // Intercept response to cache it
    const originalJson = res.json.bind(res);
    res.json = function(data: any) {
      // Cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        responseCache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl: ttlMs
        });
        
        // Clean up expired entries periodically
        if (responseCache.size > 1000) {
          cleanupCache();
        }
      }
      
      res.set('X-Cache', 'MISS');
      return originalJson(data);
    };

    next();
  };
}

function cleanupCache() {
  const now = Date.now();
  for (const [key, value] of responseCache.entries()) {
    if (now - value.timestamp > value.ttl) {
      responseCache.delete(key);
    }
  }
}

// Security headers middleware
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  // Prevent clickjacking
  res.set('X-Frame-Options', 'DENY');
  
  // XSS protection
  res.set('X-XSS-Protection', '1; mode=block');
  
  // Prevent MIME sniffing
  res.set('X-Content-Type-Options', 'nosniff');
  
  // Referrer policy
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy for API endpoints
  if (req.path.startsWith('/api/')) {
    res.set('Content-Security-Policy', "default-src 'none'");
  }
  
  next();
}

// Request size limiter middleware
export function requestSizeLimiter(maxSizeBytes: number = 10 * 1024 * 1024) { // 10MB default
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('Content-Length') || '0');
    
    if (contentLength > maxSizeBytes) {
      return res.status(413).json({
        error: 'Request entity too large',
        maxSize: maxSizeBytes,
        received: contentLength
      });
    }
    
    next();
  };
}

// Rate limiting per user/IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimitMiddleware(windowMs: number = 60000, maxRequests: number = 100) {
  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.ip || req.get('X-Forwarded-For') || 'unknown';
    const now = Date.now();
    
    let rateLimitInfo = rateLimitMap.get(identifier);
    
    if (!rateLimitInfo || now > rateLimitInfo.resetTime) {
      rateLimitInfo = { count: 0, resetTime: now + windowMs };
      rateLimitMap.set(identifier, rateLimitInfo);
    }
    
    rateLimitInfo.count++;
    
    // Add rate limit headers
    res.set('X-RateLimit-Limit', maxRequests.toString());
    res.set('X-RateLimit-Remaining', Math.max(0, maxRequests - rateLimitInfo.count).toString());
    res.set('X-RateLimit-Reset', Math.ceil(rateLimitInfo.resetTime / 1000).toString());
    
    if (rateLimitInfo.count > maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((rateLimitInfo.resetTime - now) / 1000)
      });
    }
    
    next();
  };
}

// Cleanup expired rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 300000); // Clean up every 5 minutes