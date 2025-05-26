/**
 * Smart Image Cache Hook
 * React hook for managing cached images with automatic updates
 */

import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { imageCache } from '@/services/ImageCacheService';
import type { GeneratedImage } from '@shared/schema';

export interface CacheStats {
  totalImages: number;
  recentImages: number;
  cacheAge: number;
  lastCleanup: number;
}

export function useImageCache() {
  const [cachedImages, setCachedImages] = useState<GeneratedImage[]>([]);
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    totalImages: 0,
    recentImages: 0,
    cacheAge: 0,
    lastCleanup: 0
  });
  const queryClient = useQueryClient();

  // Refresh cached images from service
  const refreshCachedImages = useCallback(() => {
    const images = imageCache.getAllCachedImages();
    setCachedImages(images);
    
    const stats = imageCache.getCacheStats();
    setCacheStats(stats);
  }, []);

  // Cache a new image
  const cacheNewImage = useCallback((image: GeneratedImage) => {
    imageCache.cacheImage(image);
    refreshCachedImages();
    
    // Also invalidate React Query cache to ensure fresh data
    queryClient.invalidateQueries({ queryKey: ['/api/images'] });
    
    console.log(`✨ Smart cache: Added image "${image.prompt.slice(0, 30)}..." to local cache`);
  }, [refreshCachedImages, queryClient]);

  // Get recently cached images
  const getRecentImages = useCallback((hours: number = 24): GeneratedImage[] => {
    return imageCache.getRecentCachedImages(hours);
  }, []);

  // Check if image is cached
  const isImageCached = useCallback((imageId: string): boolean => {
    return imageCache.isImageCached(imageId);
  }, []);

  // Remove image from cache
  const removeFromCache = useCallback((imageId: string) => {
    imageCache.removeCachedImage(imageId);
    refreshCachedImages();
    console.log(`🗑️ Smart cache: Removed image ${imageId} from cache`);
  }, [refreshCachedImages]);

  // Clear entire cache
  const clearCache = useCallback(() => {
    imageCache.clearCache();
    setCachedImages([]);
    setCacheStats({
      totalImages: 0,
      recentImages: 0,
      cacheAge: 0,
      lastCleanup: 0
    });
    console.log('🧹 Smart cache: Cache cleared');
  }, []);

  // Get cache-optimized images (prefers cached over fresh API calls)
  const getCachedOrFreshImages = useCallback(async (apiImages: GeneratedImage[]): Promise<GeneratedImage[]> => {
    const cachedMap = new Map(cachedImages.map(img => [img.id.toString(), img]));
    const optimizedImages: GeneratedImage[] = [];
    
    for (const apiImage of apiImages) {
      const cached = cachedMap.get(apiImage.id.toString());
      if (cached) {
        // Use cached version and update access count
        imageCache.getCachedImage(apiImage.id.toString());
        optimizedImages.push(cached);
      } else {
        // Use API version and cache it for future use
        imageCache.cacheImage(apiImage);
        optimizedImages.push(apiImage);
      }
    }
    
    // Refresh our local state
    refreshCachedImages();
    
    return optimizedImages;
  }, [cachedImages, refreshCachedImages]);

  // Initialize cache on mount
  useEffect(() => {
    refreshCachedImages();
  }, [refreshCachedImages]);

  // Set up periodic refresh
  useEffect(() => {
    const interval = setInterval(refreshCachedImages, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [refreshCachedImages]);

  return {
    // Data
    cachedImages,
    cacheStats,
    
    // Actions
    cacheNewImage,
    getRecentImages,
    isImageCached,
    removeFromCache,
    clearCache,
    getCachedOrFreshImages,
    refreshCachedImages
  };
}

export default useImageCache;