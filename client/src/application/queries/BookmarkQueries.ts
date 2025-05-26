/**
 * CQRS Queries for Bookmark Operations
 * Application Layer - Read-Only Operations
 * 
 * Apple Philosophy: "Focus on the essential, eliminate the irrelevant"
 * ✓ Clear Query Intent
 * ✓ Optimized for UI Needs
 * ✓ Cacheable Results
 * ✓ Type-Safe Responses
 */

import { Bookmark } from '../domain/entities/Bookmark';

export interface BookmarkQueryResult {
  bookmarks: Bookmark[];
  totalCount: number;
  hasMore: boolean;
}

export interface BookmarkStatusQuery {
  userId: number;
  modelId: number;
}

export interface BookmarkStatusResult {
  isBookmarked: boolean;
  bookmarkId?: string;
  createdAt?: Date;
}

export interface UserBookmarksQuery {
  userId: number;
  limit?: number;
  offset?: number;
  includeInactive?: boolean;
}

export interface ModelBookmarksQuery {
  modelId: number;
  limit?: number;
  offset?: number;
}

export interface BookmarkStatsQuery {
  userId?: number;
  modelId?: number;
}

export interface BookmarkStatsResult {
  totalBookmarks: number;
  activeBookmarks: number;
  bookmarksThisWeek: number;
  bookmarksThisMonth: number;
}

// Query Handler Interfaces
export interface IBookmarkQueryHandler {
  getBookmarkStatus(query: BookmarkStatusQuery): Promise<BookmarkStatusResult>;
  getUserBookmarks(query: UserBookmarksQuery): Promise<BookmarkQueryResult>;
  getModelBookmarks(query: ModelBookmarksQuery): Promise<BookmarkQueryResult>;
  getBookmarkStats(query: BookmarkStatsQuery): Promise<BookmarkStatsResult>;
}

// Query Implementation
export class BookmarkQueries implements IBookmarkQueryHandler {
  constructor(
    private readonly apiClient: {
      get: (url: string) => Promise<any>;
    }
  ) {}

  async getBookmarkStatus(query: BookmarkStatusQuery): Promise<BookmarkStatusResult> {
    try {
      const response = await this.apiClient.get(
        `/api/bookmarks/${query.userId}/${query.modelId}/status`
      );
      
      return {
        isBookmarked: response.isBookmarked || false,
        bookmarkId: response.bookmarkId,
        createdAt: response.createdAt ? new Date(response.createdAt) : undefined
      };
    } catch (error) {
      console.error('Failed to get bookmark status:', error);
      return { isBookmarked: false };
    }
  }

  async getUserBookmarks(query: UserBookmarksQuery): Promise<BookmarkQueryResult> {
    try {
      const params = new URLSearchParams();
      if (query.limit) params.set('limit', query.limit.toString());
      if (query.offset) params.set('offset', query.offset.toString());
      if (query.includeInactive) params.set('includeInactive', 'true');

      const response = await this.apiClient.get(
        `/api/users/${query.userId}/bookmarks?${params}`
      );

      return {
        bookmarks: response.bookmarks.map((b: any) => Bookmark.fromSnapshot(b)),
        totalCount: response.totalCount || 0,
        hasMore: response.hasMore || false
      };
    } catch (error) {
      console.error('Failed to get user bookmarks:', error);
      return { bookmarks: [], totalCount: 0, hasMore: false };
    }
  }

  async getModelBookmarks(query: ModelBookmarksQuery): Promise<BookmarkQueryResult> {
    try {
      const params = new URLSearchParams();
      if (query.limit) params.set('limit', query.limit.toString());
      if (query.offset) params.set('offset', query.offset.toString());

      const response = await this.apiClient.get(
        `/api/models/${query.modelId}/bookmarks?${params}`
      );

      return {
        bookmarks: response.bookmarks.map((b: any) => Bookmark.fromSnapshot(b)),
        totalCount: response.totalCount || 0,
        hasMore: response.hasMore || false
      };
    } catch (error) {
      console.error('Failed to get model bookmarks:', error);
      return { bookmarks: [], totalCount: 0, hasMore: false };
    }
  }

  async getBookmarkStats(query: BookmarkStatsQuery): Promise<BookmarkStatsResult> {
    try {
      const params = new URLSearchParams();
      if (query.userId) params.set('userId', query.userId.toString());
      if (query.modelId) params.set('modelId', query.modelId.toString());

      const response = await this.apiClient.get(`/api/bookmarks/stats?${params}`);

      return {
        totalBookmarks: response.totalBookmarks || 0,
        activeBookmarks: response.activeBookmarks || 0,
        bookmarksThisWeek: response.bookmarksThisWeek || 0,
        bookmarksThisMonth: response.bookmarksThisMonth || 0
      };
    } catch (error) {
      console.error('Failed to get bookmark stats:', error);
      return {
        totalBookmarks: 0,
        activeBookmarks: 0,
        bookmarksThisWeek: 0,
        bookmarksThisMonth: 0
      };
    }
  }
}