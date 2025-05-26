/**
 * Smart Image Cache Service
 * Manages local caching of recently generated images with intelligent eviction
 */

import type { GeneratedImage } from "@shared/schema";

interface CachedImage extends GeneratedImage {
  cachedAt: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheMetadata {
  totalSize: number;
  lastCleanup: number;
  version: string;
}

export class ImageCacheService {
  private static instance: ImageCacheService;
  private readonly CACHE_KEY = 'dreambee_image_cache';
  private readonly METADATA_KEY = 'dreambee_cache_metadata';
  private readonly MAX_CACHE_SIZE_MB = 50; // 50MB cache limit
  private readonly MAX_CACHE_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
  private readonly CACHE_VERSION = '1.0';

  private constructor() {
    this.initializeCache();
    this.scheduleCleanup();
  }

  static getInstance(): ImageCacheService {
    if (!ImageCacheService.instance) {
      ImageCacheService.instance = new ImageCacheService();
    }
    return ImageCacheService.instance;
  }

  private initializeCache(): void {
    try {
      const metadata = this.getMetadata();
      if (!metadata || metadata.version !== this.CACHE_VERSION) {
        this.clearCache();
        this.setMetadata({
          totalSize: 0,
          lastCleanup: Date.now(),
          version: this.CACHE_VERSION
        });
      }
    } catch (error) {
      console.warn('Failed to initialize image cache:', error);
      this.clearCache();
    }
  }

  private getMetadata(): CacheMetadata | null {
    try {
      const data = localStorage.getItem(this.METADATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private setMetadata(metadata: CacheMetadata): void {
    try {
      localStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.warn('Failed to save cache metadata:', error);
    }
  }

  private getCachedImages(): Map<string, CachedImage> {
    try {
      const data = localStorage.getItem(this.CACHE_KEY);
      const imageMap = new Map<string, CachedImage>();
      
      if (data) {
        const parsed = JSON.parse(data);
        Object.entries(parsed).forEach(([key, value]) => {
          imageMap.set(key, value as CachedImage);
        });
      }
      
      return imageMap;
    } catch (error) {
      console.warn('Failed to load cached images:', error);
      return new Map();
    }
  }

  private setCachedImages(imageMap: Map<string, CachedImage>): void {
    try {
      const obj = Object.fromEntries(imageMap);
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(obj));
    } catch (error) {
      console.warn('Failed to save cached images:', error);
      // If localStorage is full, try to clean up and retry
      this.performCleanup();
      try {
        const cleanObj = Object.fromEntries(imageMap);
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cleanObj));
      } catch (retryError) {
        console.error('Failed to save after cleanup:', retryError);
      }
    }
  }

  /**
   * Cache a newly generated image
   */
  cacheImage(image: GeneratedImage): void {
    try {
      const now = Date.now();
      const cachedImage: CachedImage = {
        ...image,
        cachedAt: now,
        accessCount: 1,
        lastAccessed: now
      };

      const imageMap = this.getCachedImages();
      imageMap.set(image.id.toString(), cachedImage);
      
      this.setCachedImages(imageMap);
      this.updateMetadata();
      
      console.log(`Cached image ${image.id} - Cache size: ${imageMap.size} images`);
    } catch (error) {
      console.warn('Failed to cache image:', error);
    }
  }

  /**
   * Get a cached image and update access statistics
   */
  getCachedImage(imageId: string): CachedImage | null {
    try {
      const imageMap = this.getCachedImages();
      const cachedImage = imageMap.get(imageId);
      
      if (cachedImage) {
        // Update access statistics
        cachedImage.accessCount++;
        cachedImage.lastAccessed = Date.now();
        imageMap.set(imageId, cachedImage);
        this.setCachedImages(imageMap);
        
        return cachedImage;
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to get cached image:', error);
      return null;
    }
  }

  /**
   * Get all cached images for display
   */
  getAllCachedImages(): GeneratedImage[] {
    try {
      const imageMap = this.getCachedImages();
      return Array.from(imageMap.values())
        .sort((a, b) => b.cachedAt - a.cachedAt) // Most recent first
        .map(cachedImage => {
          // Remove cache-specific properties before returning
          const { cachedAt, accessCount, lastAccessed, ...image } = cachedImage;
          return image;
        });
    } catch (error) {
      console.warn('Failed to get all cached images:', error);
      return [];
    }
  }

  /**
   * Get recently cached images (last 24 hours)
   */
  getRecentCachedImages(hours: number = 24): GeneratedImage[] {
    try {
      const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
      const imageMap = this.getCachedImages();
      
      return Array.from(imageMap.values())
        .filter(cachedImage => cachedImage.cachedAt > cutoffTime)
        .sort((a, b) => b.cachedAt - a.cachedAt)
        .map(cachedImage => {
          const { cachedAt, accessCount, lastAccessed, ...image } = cachedImage;
          return image;
        });
    } catch (error) {
      console.warn('Failed to get recent cached images:', error);
      return [];
    }
  }

  /**
   * Check if an image is cached
   */
  isImageCached(imageId: string): boolean {
    try {
      const imageMap = this.getCachedImages();
      return imageMap.has(imageId);
    } catch {
      return false;
    }
  }

  /**
   * Remove a specific image from cache
   */
  removeCachedImage(imageId: string): void {
    try {
      const imageMap = this.getCachedImages();
      if (imageMap.delete(imageId)) {
        this.setCachedImages(imageMap);
        this.updateMetadata();
        console.log(`Removed image ${imageId} from cache`);
      }
    } catch (error) {
      console.warn('Failed to remove cached image:', error);
    }
  }

  /**
   * Perform intelligent cache cleanup
   */
  private performCleanup(): void {
    try {
      const now = Date.now();
      const imageMap = this.getCachedImages();
      const images = Array.from(imageMap.entries());
      
      // Remove expired images
      const nonExpired = images.filter(([_, image]) => 
        now - image.cachedAt < this.MAX_CACHE_AGE_MS
      );
      
      // If still over limit, remove least recently used images
      if (nonExpired.length > 100) { // Max 100 cached images
        nonExpired.sort(([_, a], [__, b]) => {
          // Sort by combination of access count and recency
          const scoreA = a.accessCount * 0.3 + (now - a.lastAccessed) * -0.7;
          const scoreB = b.accessCount * 0.3 + (now - b.lastAccessed) * -0.7;
          return scoreB - scoreA;
        });
        
        nonExpired.splice(100); // Keep only top 100
      }
      
      const cleanedMap = new Map(nonExpired);
      this.setCachedImages(cleanedMap);
      
      const metadata = this.getMetadata() || {
        totalSize: 0,
        lastCleanup: now,
        version: this.CACHE_VERSION
      };
      
      metadata.lastCleanup = now;
      this.setMetadata(metadata);
      
      console.log(`Cache cleanup completed. Removed ${images.length - nonExpired.length} images`);
    } catch (error) {
      console.warn('Failed to perform cache cleanup:', error);
    }
  }

  /**
   * Update cache metadata
   */
  private updateMetadata(): void {
    try {
      const imageMap = this.getCachedImages();
      const metadata: CacheMetadata = {
        totalSize: imageMap.size,
        lastCleanup: this.getMetadata()?.lastCleanup || Date.now(),
        version: this.CACHE_VERSION
      };
      this.setMetadata(metadata);
    } catch (error) {
      console.warn('Failed to update metadata:', error);
    }
  }

  /**
   * Schedule periodic cleanup
   */
  private scheduleCleanup(): void {
    setInterval(() => {
      const metadata = this.getMetadata();
      if (!metadata || Date.now() - metadata.lastCleanup > this.CLEANUP_INTERVAL_MS) {
        this.performCleanup();
      }
    }, this.CLEANUP_INTERVAL_MS);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalImages: number;
    recentImages: number;
    cacheAge: number;
    lastCleanup: number;
  } {
    try {
      const imageMap = this.getCachedImages();
      const metadata = this.getMetadata();
      const recentImages = this.getRecentCachedImages(24);
      
      return {
        totalImages: imageMap.size,
        recentImages: recentImages.length,
        cacheAge: metadata?.lastCleanup ? Date.now() - metadata.lastCleanup : 0,
        lastCleanup: metadata?.lastCleanup || 0
      };
    } catch {
      return {
        totalImages: 0,
        recentImages: 0,
        cacheAge: 0,
        lastCleanup: 0
      };
    }
  }

  /**
   * Clear all cached images
   */
  clearCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      localStorage.removeItem(this.METADATA_KEY);
      console.log('Image cache cleared');
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }
}

export const imageCache = ImageCacheService.getInstance();