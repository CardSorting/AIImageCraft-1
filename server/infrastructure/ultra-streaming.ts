import { Response } from 'express';
import { performance } from 'perf_hooks';
import { db } from './database';
import { aggressiveMonitor, predictiveCache } from './aggressive-optimization';

/**
 * Ultra-Aggressive Response Streaming
 * Implements world-class data streaming for large datasets
 */

export class UltraStreamingEngine {
  private static instance: UltraStreamingEngine;
  
  static getInstance(): UltraStreamingEngine {
    if (!UltraStreamingEngine.instance) {
      UltraStreamingEngine.instance = new UltraStreamingEngine();
    }
    return UltraStreamingEngine.instance;
  }

  // Stream large image datasets with progressive loading
  async streamImages(res: Response, limit: number = 50) {
    const start = performance.now();
    
    try {
      // Set streaming headers
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('X-Streaming', 'true');
      
      // Start JSON array
      res.write('[');
      
      let isFirst = true;
      let totalRows = 0;
      const batchSize = 10; // Process in small batches for streaming
      
      for (let offset = 0; offset < limit; offset += batchSize) {
        const currentBatchSize = Math.min(batchSize, limit - offset);
        
        // Ultra-optimized query with minimal data transfer
        const batchQuery = `
          SELECT 
            gi.id, gi.user_id, gi.model_id, 
            SUBSTRING(gi.prompt, 1, 100) as prompt,
            gi.image_url, gi.rarity_tier, gi.rarity_score,
            gi.created_at,
            u.username
          FROM generated_images gi
          LEFT JOIN users u ON gi.user_id = u.id
          WHERE gi.image_url IS NOT NULL
          ORDER BY gi.created_at DESC
          LIMIT $1 OFFSET $2
        `;
        
        const batchStart = performance.now();
        const results = await db.execute(batchQuery, [currentBatchSize, offset]);
        const batchDuration = performance.now() - batchStart;
        
        aggressiveMonitor.recordOperation(`stream_batch_${offset}`, batchDuration);
        
        // Stream each result immediately
        for (const row of results) {
          if (!isFirst) {
            res.write(',');
          }
          res.write(JSON.stringify(row));
          isFirst = false;
          totalRows++;
        }
        
        // Micro-delay to prevent overwhelming the client
        await new Promise(resolve => setImmediate(resolve));
        
        // Break if we've reached the end
        if (results.length < currentBatchSize) {
          break;
        }
      }
      
      // Close JSON array
      res.write(']');
      res.end();
      
      const totalDuration = performance.now() - start;
      aggressiveMonitor.recordOperation('ultra_stream_images', totalDuration);
      
      console.log(`[ULTRA STREAM] Streamed ${totalRows} images in ${totalDuration.toFixed(2)}ms`);
      
    } catch (error) {
      const duration = performance.now() - start;
      aggressiveMonitor.recordOperation('ultra_stream_images', duration, false);
      
      if (!res.headersSent) {
        res.status(500).json({ error: 'Streaming failed' });
      } else {
        res.write(']}'); // Close with error indicator
        res.end();
      }
      throw error;
    }
  }

  // Stream AI models with progressive enhancement
  async streamAIModels(res: Response, limit: number = 50, sortBy: string = 'newest', category?: string) {
    const start = performance.now();
    
    try {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('X-Ultra-Streaming', 'active');
      
      res.write('{"data":[');
      
      let isFirst = true;
      let totalModels = 0;
      const batchSize = 15;
      
      for (let offset = 0; offset < limit; offset += batchSize) {
        const currentBatchSize = Math.min(batchSize, limit - offset);
        
        // Optimized query with intelligent field selection
        let streamQuery = `
          SELECT 
            am.id, am.model_id, am.name, 
            SUBSTRING(am.description, 1, 150) as description,
            am.category, am.provider, am.image_url, am.featured,
            am.created_at,
            COUNT(DISTINCT ul.id) as like_count,
            COUNT(DISTINCT ub.id) as bookmark_count
          FROM ai_models am
          LEFT JOIN user_likes ul ON am.id = ul.model_id
          LEFT JOIN user_bookmarks ub ON am.id = ub.model_id
        `;
        
        const params: any[] = [];
        let paramIndex = 1;
        
        if (category && category !== 'all') {
          streamQuery += ` WHERE am.category = $${paramIndex}`;
          params.push(category);
          paramIndex++;
        }
        
        streamQuery += ` GROUP BY am.id, am.model_id, am.name, am.description, am.category, am.provider, am.image_url, am.featured, am.created_at`;
        
        // Ultra-fast sorting
        switch (sortBy) {
          case 'popular':
            streamQuery += ` ORDER BY like_count DESC, bookmark_count DESC`;
            break;
          case 'trending':
            streamQuery += ` ORDER BY like_count DESC, am.created_at DESC`;
            break;
          case 'newest':
          default:
            streamQuery += ` ORDER BY am.created_at DESC`;
            break;
        }
        
        streamQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(currentBatchSize, offset);
        
        const batchStart = performance.now();
        const results = await db.execute(streamQuery, params);
        const batchDuration = performance.now() - batchStart;
        
        aggressiveMonitor.recordOperation(`stream_models_batch_${offset}`, batchDuration);
        
        // Stream results immediately
        for (const model of results) {
          if (!isFirst) {
            res.write(',');
          }
          res.write(JSON.stringify(model));
          isFirst = false;
          totalModels++;
        }
        
        // Immediate response streaming
        await new Promise(resolve => setImmediate(resolve));
        
        if (results.length < currentBatchSize) {
          break;
        }
      }
      
      // Complete the response
      res.write(`],"meta":{"total":${totalModels},"streamingTime":${(performance.now() - start).toFixed(2)},"cached":false}}`);
      res.end();
      
      const totalDuration = performance.now() - start;
      aggressiveMonitor.recordOperation('ultra_stream_models', totalDuration);
      
      console.log(`[ULTRA STREAM] Streamed ${totalModels} models in ${totalDuration.toFixed(2)}ms`);
      
    } catch (error) {
      const duration = performance.now() - start;
      aggressiveMonitor.recordOperation('ultra_stream_models', duration, false);
      
      if (!res.headersSent) {
        res.status(500).json({ error: 'Model streaming failed' });
      } else {
        res.write(']}');
        res.end();
      }
      throw error;
    }
  }

  // Ultra-fast paginated streaming for large datasets
  async streamPaginated(res: Response, query: string, params: any[], pageSize: number = 20) {
    const start = performance.now();
    
    try {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('X-Pagination-Stream', 'active');
      
      res.write('{"pages":[');
      
      let pageIndex = 0;
      let hasMore = true;
      
      while (hasMore) {
        const offset = pageIndex * pageSize;
        const paginatedQuery = query + ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        const paginatedParams = [...params, pageSize, offset];
        
        const pageStart = performance.now();
        const results = await db.execute(paginatedQuery, paginatedParams);
        const pageDuration = performance.now() - pageStart;
        
        aggressiveMonitor.recordOperation(`stream_page_${pageIndex}`, pageDuration);
        
        if (pageIndex > 0) {
          res.write(',');
        }
        
        res.write(JSON.stringify({
          page: pageIndex,
          data: results,
          count: results.length,
          queryTime: pageDuration.toFixed(2)
        }));
        
        hasMore = results.length === pageSize;
        pageIndex++;
        
        // Prevent infinite loops
        if (pageIndex > 100) {
          hasMore = false;
        }
        
        // Stream immediately
        await new Promise(resolve => setImmediate(resolve));
      }
      
      res.write(`],"meta":{"totalPages":${pageIndex},"streamTime":${(performance.now() - start).toFixed(2)}}}`);
      res.end();
      
      const totalDuration = performance.now() - start;
      aggressiveMonitor.recordOperation('ultra_stream_paginated', totalDuration);
      
    } catch (error) {
      const duration = performance.now() - start;
      aggressiveMonitor.recordOperation('ultra_stream_paginated', duration, false);
      
      if (!res.headersSent) {
        res.status(500).json({ error: 'Paginated streaming failed' });
      }
      throw error;
    }
  }
}

// Ultra-compressed data streaming for maximum throughput
export class DataCompressionEngine {
  static compressImageData(images: any[]): any[] {
    return images.map(img => ({
      id: img.id,
      uid: img.user_id,
      mid: img.model_id,
      p: img.prompt?.substring(0, 50), // Truncate prompt
      url: img.image_url,
      rt: img.rarity_tier,
      rs: img.rarity_score,
      ct: img.created_at,
      un: img.username
    }));
  }

  static compressModelData(models: any[]): any[] {
    return models.map(model => ({
      id: model.id,
      mid: model.model_id,
      n: model.name,
      d: model.description?.substring(0, 100),
      c: model.category,
      p: model.provider,
      img: model.image_url,
      f: model.featured,
      ct: model.created_at,
      lc: model.like_count || 0,
      bc: model.bookmark_count || 0
    }));
  }
}

export const ultraStreaming = UltraStreamingEngine.getInstance();