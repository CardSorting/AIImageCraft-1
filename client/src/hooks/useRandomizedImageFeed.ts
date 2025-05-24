/**
 * Custom Hook: useRandomizedImageFeed
 * Following SOLID principles with Clean Architecture integration
 * Provides randomized, unique image feed functionality for React components
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { type GeneratedImage } from "@shared/schema";
import { DependencyContainer } from "../infrastructure/DependencyContainer";
import { ImageFeed } from "../domain/entities/ImageFeed";

interface UseRandomizedImageFeedOptions {
  userId?: number;
  maxImages?: number;
  autoMarkAsViewed?: boolean;
}

interface UseRandomizedImageFeedResult {
  currentImage: GeneratedImage | null;
  currentIndex: number;
  totalImages: number;
  remainingCount: number;
  hasMoreImages: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  goToNext: () => Promise<void>;
  goToPrevious: () => void;
  goToIndex: (index: number) => void;
  markCurrentAsViewed: () => Promise<void>;
  resetSession: () => void;
  refreshFeed: () => Promise<void>;
  
  // State
  imageFeed: ImageFeed | null;
  sessionId: string;
}

export function useRandomizedImageFeed(
  options: UseRandomizedImageFeedOptions = {}
): UseRandomizedImageFeedResult {
  // Generate stable session ID that persists across component re-renders
  const sessionIdRef = useRef<string>();
  if (!sessionIdRef.current) {
    const container = DependencyContainer.getInstance();
    const randomizationService = container.getRandomizationService();
    sessionIdRef.current = randomizationService.generateSessionSeed();
  }

  // State management
  const [imageFeed, setImageFeed] = useState<ImageFeed | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remainingCount, setRemainingCount] = useState(0);
  const [hasMoreImages, setHasMoreImages] = useState(false);

  // Get application service
  const imageFeedService = DependencyContainer.getInstance().getImageFeedService();

  // Load initial randomized image feed
  const loadImageFeed = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await imageFeedService.getRandomizedImageFeed({
        sessionId: sessionIdRef.current!,
        userId: options.userId,
        maxImages: options.maxImages
      });

      setImageFeed(response.imageFeed);
      setRemainingCount(response.remainingCount);
      setHasMoreImages(response.hasMoreImages);
      setCurrentIndex(0);
    } catch (err) {
      console.error('Failed to load randomized image feed:', err);
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setIsLoading(false);
    }
  }, [imageFeedService, options.userId, options.maxImages]);

  // Initialize feed on mount
  useEffect(() => {
    loadImageFeed();
  }, [loadImageFeed]);

  // Auto-mark as viewed when image changes
  useEffect(() => {
    if (options.autoMarkAsViewed && imageFeed && imageFeed.images[currentIndex]) {
      const currentImage = imageFeed.images[currentIndex];
      markImageAsViewed(currentImage.id);
    }
  }, [currentIndex, imageFeed, options.autoMarkAsViewed]);

  // Mark specific image as viewed
  const markImageAsViewed = useCallback(async (imageId: number) => {
    try {
      await imageFeedService.markImageAsViewed({
        imageId,
        sessionId: sessionIdRef.current!,
        userId: options.userId
      });

      // Update local feed state
      if (imageFeed) {
        imageFeed.markImageAsViewed(imageId);
        setRemainingCount(imageFeed.getRemainingUnseenCount());
      }
    } catch (err) {
      console.error('Failed to mark image as viewed:', err);
    }
  }, [imageFeedService, options.userId, imageFeed]);

  // Navigation actions
  const goToNext = useCallback(async () => {
    if (!imageFeed) return;

    const nextIndex = currentIndex + 1;
    
    if (nextIndex < imageFeed.images.length) {
      // Move to next image in current feed
      setCurrentIndex(nextIndex);
    } else if (hasMoreImages) {
      // Load more images if available
      await loadImageFeed();
    }
  }, [currentIndex, imageFeed, hasMoreImages, loadImageFeed]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const goToIndex = useCallback((index: number) => {
    if (imageFeed && index >= 0 && index < imageFeed.images.length) {
      setCurrentIndex(index);
    }
  }, [imageFeed]);

  const markCurrentAsViewed = useCallback(async () => {
    if (imageFeed && imageFeed.images[currentIndex]) {
      await markImageAsViewed(imageFeed.images[currentIndex].id);
    }
  }, [imageFeed, currentIndex, markImageAsViewed]);

  const resetSession = useCallback(() => {
    const container = DependencyContainer.getInstance();
    const randomizationService = container.getRandomizationService();
    sessionIdRef.current = randomizationService.generateSessionSeed();
    loadImageFeed();
  }, [loadImageFeed]);

  const refreshFeed = useCallback(async () => {
    await loadImageFeed();
  }, [loadImageFeed]);

  // Derived state
  const currentImage = imageFeed?.images[currentIndex] || null;
  const totalImages = imageFeed?.images.length || 0;

  return {
    currentImage,
    currentIndex,
    totalImages,
    remainingCount,
    hasMoreImages,
    isLoading,
    error,
    
    // Actions
    goToNext,
    goToPrevious,
    goToIndex,
    markCurrentAsViewed,
    resetSession,
    refreshFeed,
    
    // State
    imageFeed,
    sessionId: sessionIdRef.current!,
  };
}