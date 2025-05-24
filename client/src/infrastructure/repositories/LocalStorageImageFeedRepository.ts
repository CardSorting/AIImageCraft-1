/**
 * Infrastructure Repository: LocalStorageImageFeedRepository
 * Following Dependency Inversion Principle (DIP) - implements domain interface
 * Handles persistence using browser localStorage for client-side state management
 */

import { type GeneratedImage } from "@shared/schema";
import { ViewedImage, type ViewedImageData } from "../../domain/entities/ViewedImage";
import { type IImageFeedRepository } from "../../domain/repositories/IImageFeedRepository";
import { apiRequest } from "../../lib/queryClient";

export class LocalStorageImageFeedRepository implements IImageFeedRepository {
  private readonly VIEWED_IMAGES_KEY = 'aiImageStudio_viewedImages';

  // Query operations (CQRS Read side)
  async getAllImages(): Promise<GeneratedImage[]> {
    // Fetch from API using existing query client
    const response = await apiRequest('/api/images');
    return Array.isArray(response) ? response : [];
  }

  async getViewedImages(sessionId: string, userId?: number): Promise<ViewedImage[]> {
    try {
      const stored = localStorage.getItem(this.VIEWED_IMAGES_KEY);
      if (!stored) return [];

      const viewedData: ViewedImageData[] = JSON.parse(stored);
      
      return viewedData
        .filter(data => {
          // Filter by session and optionally by user
          const matchesSession = data.sessionId === sessionId;
          const matchesUser = userId ? data.userId === userId : true;
          return matchesSession && matchesUser;
        })
        .map(data => ViewedImage.create({
          ...data,
          viewedAt: new Date(data.viewedAt)
        }));
    } catch (error) {
      console.warn('Failed to load viewed images from localStorage:', error);
      return [];
    }
  }

  // Command operations (CQRS Write side)
  async saveViewedImage(viewedImage: ViewedImage): Promise<void> {
    try {
      const existing = await this.getAllStoredViewedImages();
      
      // Avoid duplicates
      const filtered = existing.filter(data => 
        !(data.id === viewedImage.id && data.sessionId === viewedImage.sessionId)
      );

      const updated = [
        ...filtered,
        {
          id: viewedImage.id,
          viewedAt: viewedImage.viewedAt,
          sessionId: viewedImage.sessionId,
          userId: viewedImage.userId
        }
      ];

      // Keep only last 1000 viewed images to prevent localStorage bloat
      const trimmed = updated.slice(-1000);
      
      localStorage.setItem(this.VIEWED_IMAGES_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.warn('Failed to save viewed image to localStorage:', error);
    }
  }

  async clearSessionViewedImages(sessionId: string): Promise<void> {
    try {
      const existing = await this.getAllStoredViewedImages();
      const filtered = existing.filter(data => data.sessionId !== sessionId);
      
      localStorage.setItem(this.VIEWED_IMAGES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.warn('Failed to clear session viewed images:', error);
    }
  }

  private async getAllStoredViewedImages(): Promise<ViewedImageData[]> {
    try {
      const stored = localStorage.getItem(this.VIEWED_IMAGES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to parse stored viewed images:', error);
      return [];
    }
  }
}