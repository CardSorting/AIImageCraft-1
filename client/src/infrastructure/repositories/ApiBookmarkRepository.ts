/**
 * API-based Bookmark Repository Implementation
 * Infrastructure Layer - External Service Integration
 * 
 * Apple Philosophy: "Hide complexity, expose simplicity"
 * ✓ Clean Error Handling
 * ✓ Optimistic Caching
 * ✓ Network Resilience
 * ✓ Type Safety
 */

import { Bookmark, BookmarkSnapshot } from '../../domain/entities/Bookmark';
import { BookmarkRepository } from '../../domain/repositories/BookmarkRepository';

export class ApiBookmarkRepository implements BookmarkRepository {
  constructor(
    private readonly baseUrl: string = '',
    private readonly cache = new Map<string, Bookmark>()
  ) {}

  async save(bookmark: Bookmark): Promise<void> {
    try {
      const snapshot = bookmark.toSnapshot();
      
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: snapshot.userId,
          modelId: snapshot.modelId,
          isActive: snapshot.isActive
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save bookmark: ${response.statusText}`);
      }

      // Update cache
      this.cache.set(bookmark.getId(), bookmark);
    } catch (error) {
      console.error('Failed to save bookmark:', error);
      throw error;
    }
  }

  async findById(bookmarkId: string): Promise<Bookmark | null> {
    try {
      // Check cache first
      const cached = this.cache.get(bookmarkId);
      if (cached) {
        return cached;
      }

      const response = await fetch(`/api/bookmarks/${bookmarkId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to find bookmark: ${response.statusText}`);
      }

      const data = await response.json();
      const bookmark = Bookmark.fromSnapshot(data);
      
      // Cache result
      this.cache.set(bookmarkId, bookmark);
      
      return bookmark;
    } catch (error) {
      console.error('Failed to find bookmark by ID:', error);
      return null;
    }
  }

  async findByUserAndModel(userId: number, modelId: number): Promise<Bookmark | null> {
    try {
      const response = await fetch(`/api/bookmarks/${userId}/${modelId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to find bookmark: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.bookmark) {
        return null;
      }

      const bookmark = Bookmark.fromSnapshot(data.bookmark);
      
      // Cache result
      this.cache.set(bookmark.getId(), bookmark);
      
      return bookmark;
    } catch (error) {
      console.error('Failed to find bookmark:', error);
      return null;
    }
  }

  async remove(bookmarkId: string): Promise<void> {
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to remove bookmark: ${response.statusText}`);
      }

      // Remove from cache
      this.cache.delete(bookmarkId);
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
      throw error;
    }
  }

  async findAllByUser(userId: number): Promise<Bookmark[]> {
    try {
      const response = await fetch(`/api/users/${userId}/bookmarks`);
      
      if (!response.ok) {
        throw new Error(`Failed to find user bookmarks: ${response.statusText}`);
      }

      const data = await response.json();
      const bookmarks = data.bookmarks.map((snapshot: BookmarkSnapshot) => 
        Bookmark.fromSnapshot(snapshot)
      );

      // Cache results
      bookmarks.forEach(bookmark => {
        this.cache.set(bookmark.getId(), bookmark);
      });

      return bookmarks;
    } catch (error) {
      console.error('Failed to find user bookmarks:', error);
      return [];
    }
  }

  async findActiveByUser(userId: number): Promise<Bookmark[]> {
    try {
      const response = await fetch(`/api/users/${userId}/bookmarks?active=true`);
      
      if (!response.ok) {
        throw new Error(`Failed to find active bookmarks: ${response.statusText}`);
      }

      const data = await response.json();
      const bookmarks = data.bookmarks.map((snapshot: BookmarkSnapshot) => 
        Bookmark.fromSnapshot(snapshot)
      );

      // Cache results
      bookmarks.forEach(bookmark => {
        this.cache.set(bookmark.getId(), bookmark);
      });

      return bookmarks;
    } catch (error) {
      console.error('Failed to find active bookmarks:', error);
      return [];
    }
  }

  async exists(userId: number, modelId: number): Promise<boolean> {
    try {
      const response = await fetch(`/api/bookmarks/${userId}/${modelId}/exists`);
      
      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.exists || false;
    } catch (error) {
      console.error('Failed to check bookmark existence:', error);
      return false;
    }
  }

  async countByUser(userId: number): Promise<number> {
    try {
      const response = await fetch(`/api/users/${userId}/bookmarks/count`);
      
      if (!response.ok) {
        throw new Error(`Failed to count user bookmarks: ${response.statusText}`);
      }

      const data = await response.json();
      return data.count || 0;
    } catch (error) {
      console.error('Failed to count user bookmarks:', error);
      return 0;
    }
  }

  async countByModel(modelId: number): Promise<number> {
    try {
      const response = await fetch(`/api/models/${modelId}/bookmarks/count`);
      
      if (!response.ok) {
        throw new Error(`Failed to count model bookmarks: ${response.statusText}`);
      }

      const data = await response.json();
      return data.count || 0;
    } catch (error) {
      console.error('Failed to count model bookmarks:', error);
      return 0;
    }
  }

  // Cache management methods
  clearCache(): void {
    this.cache.clear();
  }

  invalidateUserCache(userId: number): void {
    for (const [key, bookmark] of this.cache.entries()) {
      if (bookmark.getUserId() === userId) {
        this.cache.delete(key);
      }
    }
  }

  invalidateModelCache(modelId: number): void {
    for (const [key, bookmark] of this.cache.entries()) {
      if (bookmark.getModelId() === modelId) {
        this.cache.delete(key);
      }
    }
  }
}