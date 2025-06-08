import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';
import { worldClassStorage } from './world-class-storage';
import { aggressiveMonitor, parallelProcessor, predictiveCache } from './aggressive-optimization';

/**
 * Ultra-Fast API Layer
 * Implements world-class response optimization and parallel request processing
 */

// Ultra-aggressive response optimization middleware
export function ultraFastResponseMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = performance.now();
  
  // Aggressive response headers for maximum performance
  res.set({
    'X-Powered-By': 'Ultra-Fast-API',
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
    'Vary': 'Accept-Encoding',
    'Connection': 'keep-alive'
  });

  // Override res.json for performance monitoring
  const originalJson = res.json;
  res.json = function(data: any) {
    const duration = performance.now() - start;
    res.set('X-Response-Time', `${duration.toFixed(2)}ms`);
    aggressiveMonitor.recordOperation(`api_${req.path.replace(/[^a-zA-Z0-9]/g, '_')}`, duration);
    return originalJson.call(this, data);
  };

  next();
}

// Ultra-fast AI models endpoint
export async function getAIModelsUltraFast(req: Request, res: Response) {
  const start = performance.now();
  
  try {
    const { sortBy = 'newest', category, limit = 50 } = req.query;
    const cacheKey = `ultra_models_${limit}_${sortBy}_${category || 'all'}`;
    
    // Check predictive cache first
    let models = predictiveCache.get(cacheKey);
    
    if (!models) {
      // Use parallel processing for maximum throughput
      models = await parallelProcessor.processRequest(async () => {
        return await worldClassStorage.getAIModels(Number(limit), sortBy as string, category as string);
      });
      
      // Cache with intelligent TTL
      const ttl = sortBy === 'newest' ? 30000 : 120000;
      predictiveCache.set(cacheKey, models, ttl);
    }
    
    const duration = performance.now() - start;
    
    // Ultra-fast response with performance metrics
    res.set({
      'X-Cache': models ? 'HIT' : 'MISS',
      'X-Query-Time': `${duration.toFixed(2)}ms`,
      'X-Items-Count': models.length.toString()
    });
    
    res.json(models);
    
    aggressiveMonitor.recordOperation('ultra_ai_models', duration);
  } catch (error) {
    const duration = performance.now() - start;
    aggressiveMonitor.recordOperation('ultra_ai_models', duration, false);
    console.error("Ultra-fast AI models error:", error);
    res.status(500).json({ error: "Failed to fetch AI models" });
  }
}

// Ultra-fast images endpoint with aggressive optimization
export async function getImagesUltraFast(req: Request, res: Response) {
  const start = performance.now();
  
  try {
    const { limit = 50 } = req.query;
    const cacheKey = `ultra_images_${limit}`;
    
    let images = predictiveCache.get(cacheKey);
    
    if (!images) {
      images = await parallelProcessor.processRequest(async () => {
        return await worldClassStorage.getImages(Number(limit));
      });
      
      // Short cache for dynamic content
      predictiveCache.set(cacheKey, images, 30000);
    }
    
    const duration = performance.now() - start;
    
    res.set({
      'X-Cache': images ? 'HIT' : 'MISS',
      'X-Query-Time': `${duration.toFixed(2)}ms`,
      'X-Images-Count': images.length.toString()
    });
    
    res.json(images);
    
    aggressiveMonitor.recordOperation('ultra_images', duration);
  } catch (error) {
    const duration = performance.now() - start;
    aggressiveMonitor.recordOperation('ultra_images', duration, false);
    console.error("Ultra-fast images error:", error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
}

// Ultra-fast user authentication with predictive caching
export async function getUserUltraFast(req: Request, res: Response) {
  const start = performance.now();
  
  try {
    if (!req.oidc?.isAuthenticated()) {
      return res.json({ isAuthenticated: false, user: null });
    }
    
    const auth0Id = req.oidc.user?.sub;
    if (!auth0Id) {
      return res.json({ isAuthenticated: false, user: null });
    }
    
    const cacheKey = `ultra_user_${auth0Id}`;
    let user = predictiveCache.get(cacheKey);
    
    if (!user) {
      user = await parallelProcessor.processRequest(async () => {
        return await worldClassStorage.getUserByAuth0Id(auth0Id);
      });
      
      // Cache user data for 5 minutes
      if (user) {
        predictiveCache.set(cacheKey, user, 300000);
      }
    }
    
    const duration = performance.now() - start;
    
    res.set({
      'X-Cache': user ? 'HIT' : 'MISS',
      'X-Auth-Time': `${duration.toFixed(2)}ms`
    });
    
    res.json({
      isAuthenticated: true,
      user: user,
      userId: user?.id
    });
    
    aggressiveMonitor.recordOperation('ultra_auth', duration);
  } catch (error) {
    const duration = performance.now() - start;
    aggressiveMonitor.recordOperation('ultra_auth', duration, false);
    console.error("Ultra-fast auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}

// Ultra-fast bookmarks with parallel processing
export async function getBookmarksUltraFast(req: Request, res: Response) {
  const start = performance.now();
  
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;
    const cacheKey = `ultra_bookmarks_${userId}_${limit}`;
    
    let bookmarks = predictiveCache.get(cacheKey);
    
    if (!bookmarks) {
      bookmarks = await parallelProcessor.processRequest(async () => {
        return await worldClassStorage.getBookmarkedModels(Number(userId), Number(limit));
      });
      
      // Cache bookmarks for 2 minutes
      predictiveCache.set(cacheKey, bookmarks, 120000);
    }
    
    const duration = performance.now() - start;
    
    res.set({
      'X-Cache': bookmarks ? 'HIT' : 'MISS',
      'X-Query-Time': `${duration.toFixed(2)}ms`,
      'X-Bookmark-Count': bookmarks.length.toString()
    });
    
    res.json(bookmarks);
    
    aggressiveMonitor.recordOperation('ultra_bookmarks', duration);
  } catch (error) {
    const duration = performance.now() - start;
    aggressiveMonitor.recordOperation('ultra_bookmarks', duration, false);
    console.error("Ultra-fast bookmarks error:", error);
    res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
}

// Ultra-fast credit balance with real-time optimization
export async function getCreditBalanceUltraFast(req: Request, res: Response) {
  const start = performance.now();
  
  try {
    const { userId } = req.params;
    const cacheKey = `ultra_credits_${userId}`;
    
    let balance = predictiveCache.get(cacheKey);
    
    if (!balance) {
      balance = await parallelProcessor.processRequest(async () => {
        return await worldClassStorage.getCreditBalance(Number(userId));
      });
      
      // Short cache for financial data
      if (balance) {
        predictiveCache.set(cacheKey, balance, 15000);
      }
    }
    
    const duration = performance.now() - start;
    
    res.set({
      'X-Cache': balance ? 'HIT' : 'MISS',
      'X-Balance-Query-Time': `${duration.toFixed(2)}ms`,
      'Cache-Control': 'private, max-age=15'
    });
    
    res.json({ 
      balance: balance?.amount || 0,
      accountInfo: {
        balance: balance?.amount || 0,
        version: balance?.version || 1,
        lastUpdated: balance?.last_updated
      }
    });
    
    aggressiveMonitor.recordOperation('ultra_credits', duration);
  } catch (error) {
    const duration = performance.now() - start;
    aggressiveMonitor.recordOperation('ultra_credits', duration, false);
    console.error("Ultra-fast credits error:", error);
    res.status(500).json({ error: "Failed to fetch credit balance" });
  }
}

// Ultra-fast user interactions with batch processing
export async function createUserInteractionUltraFast(req: Request, res: Response) {
  const start = performance.now();
  
  try {
    const interaction = await parallelProcessor.processRequest(async () => {
      return await worldClassStorage.createUserInteraction(req.body);
    });
    
    // Invalidate related caches immediately
    const { userId } = req.body;
    if (userId) {
      // Clear user-specific caches
      predictiveCache.clear();
    }
    
    const duration = performance.now() - start;
    
    res.set({
      'X-Interaction-Time': `${duration.toFixed(2)}ms`,
      'Cache-Control': 'no-cache'
    });
    
    res.json({
      success: true,
      interactionId: interaction.id,
      message: "Interaction tracked successfully"
    });
    
    aggressiveMonitor.recordOperation('ultra_interaction', duration);
  } catch (error) {
    const duration = performance.now() - start;
    aggressiveMonitor.recordOperation('ultra_interaction', duration, false);
    console.error("Ultra-fast interaction error:", error);
    res.status(500).json({ error: "Failed to track interaction" });
  }
}

// Ultra-fast chat sessions with predictive loading
export async function getChatSessionsUltraFast(req: Request, res: Response) {
  const start = performance.now();
  
  try {
    const userId = Number(req.params.userId || 1);
    const { limit = 50 } = req.query;
    const cacheKey = `ultra_chat_${userId}_${limit}`;
    
    let sessions = predictiveCache.get(cacheKey);
    
    if (!sessions) {
      sessions = await parallelProcessor.processRequest(async () => {
        return await worldClassStorage.getChatSessions(userId, Number(limit));
      });
      
      // Cache chat sessions for 1 minute
      predictiveCache.set(cacheKey, sessions, 60000);
    }
    
    const duration = performance.now() - start;
    
    res.set({
      'X-Cache': sessions ? 'HIT' : 'MISS',
      'X-Chat-Query-Time': `${duration.toFixed(2)}ms`,
      'X-Session-Count': sessions.length.toString()
    });
    
    res.json(sessions);
    
    aggressiveMonitor.recordOperation('ultra_chat', duration);
  } catch (error) {
    const duration = performance.now() - start;
    aggressiveMonitor.recordOperation('ultra_chat', duration, false);
    console.error("Ultra-fast chat error:", error);
    res.status(500).json({ error: "Failed to fetch chat sessions" });
  }
}

// Ultra-fast performance metrics endpoint
export async function getPerformanceMetricsUltraFast(req: Request, res: Response) {
  const start = performance.now();
  
  try {
    const metrics = await worldClassStorage.getPerformanceMetrics();
    
    const duration = performance.now() - start;
    
    res.set({
      'X-Metrics-Time': `${duration.toFixed(2)}ms`,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    
    res.json({
      ...metrics,
      responseTime: duration,
      timestamp: new Date().toISOString(),
      systemStatus: metrics.database?.healthy ? 'optimal' : 'degraded'
    });
    
    aggressiveMonitor.recordOperation('ultra_metrics', duration);
  } catch (error) {
    const duration = performance.now() - start;
    aggressiveMonitor.recordOperation('ultra_metrics', duration, false);
    console.error("Ultra-fast metrics error:", error);
    res.status(500).json({ error: "Failed to fetch performance metrics" });
  }
}