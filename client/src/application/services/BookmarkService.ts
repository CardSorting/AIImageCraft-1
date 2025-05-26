/**
 * Bookmark Application Service
 * Apple Philosophy: "Simple, Powerful, Delightful"
 * 
 * ✓ Single Point of Entry for Bookmark Operations
 * ✓ Optimistic UI Updates
 * ✓ Intelligent Caching
 * ✓ Error Recovery
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface BookmarkState {
  isBookmarked: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface BookmarkedModel {
  id: number;
  modelId: string;
  name: string;
  description: string;
  category: string;
  provider: string;
  thumbnail: string;
  rating: number;
  downloads: number;
  likes: number;
  bookmarkedAt: string;
}

export class BookmarkService {
  private readonly queryClient = useQueryClient();

  // React Query Hooks for Bookmark Operations
  useBookmarkStatus(userId: number, modelId: number) {
    return useQuery({
      queryKey: ['bookmark-status', userId, modelId],
      queryFn: async (): Promise<BookmarkState> => {
        try {
          const response = await fetch(`/api/bookmarks/${userId}/${modelId}`);
          if (!response.ok) {
            return { isBookmarked: false, isLoading: false, error: null };
          }
          const data = await response.json();
          return {
            isBookmarked: data.bookmarked || false,
            isLoading: false,
            error: null
          };
        } catch (error) {
          return {
            isBookmarked: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      },
      staleTime: 30 * 1000, // 30 seconds
      refetchOnWindowFocus: false,
    });
  }

  useBookmarkedModels(userId: number) {
    return useQuery({
      queryKey: ['bookmarked-models', userId],
      queryFn: async (): Promise<BookmarkedModel[]> => {
        try {
          const response = await fetch(`/api/models/bookmarked/${userId}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch bookmarked models: ${response.statusText}`);
          }
          return await response.json();
        } catch (error) {
          console.error('Failed to fetch bookmarked models:', error);
          return [];
        }
      },
      staleTime: 0, // Always fresh for bookmark list
      refetchOnWindowFocus: true,
    });
  }

  useToggleBookmark() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async ({ userId, modelId }: { userId: number; modelId: number }) => {
        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, modelId }),
        });

        if (!response.ok) {
          throw new Error(`Failed to toggle bookmark: ${response.statusText}`);
        }

        return await response.json();
      },
      onMutate: async ({ userId, modelId }) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: ['bookmark-status', userId, modelId] });
        await queryClient.cancelQueries({ queryKey: ['bookmarked-models', userId] });

        // Snapshot previous value
        const previousStatus = queryClient.getQueryData(['bookmark-status', userId, modelId]);
        const previousModels = queryClient.getQueryData(['bookmarked-models', userId]);

        // Optimistically update bookmark status
        queryClient.setQueryData(['bookmark-status', userId, modelId], (old: BookmarkState) => ({
          ...old,
          isBookmarked: !old?.isBookmarked,
          isLoading: false,
          error: null
        }));

        return { previousStatus, previousModels };
      },
      onSuccess: (data, { userId, modelId }) => {
        // Update with server response
        queryClient.setQueryData(['bookmark-status', userId, modelId], {
          isBookmarked: data.bookmarked,
          isLoading: false,
          error: null
        });

        // Invalidate and refetch bookmarked models list
        queryClient.invalidateQueries({ queryKey: ['bookmarked-models', userId] });
        queryClient.invalidateQueries({ queryKey: ['/api/models', 'bookmarked'] });
      },
      onError: (error, { userId, modelId }, context) => {
        // Revert optimistic update
        if (context?.previousStatus) {
          queryClient.setQueryData(['bookmark-status', userId, modelId], context.previousStatus);
        }
        if (context?.previousModels) {
          queryClient.setQueryData(['bookmarked-models', userId], context.previousModels);
        }
        console.error('Bookmark toggle failed:', error);
      },
    });
  }

  // Utility methods for direct usage
  async getBookmarkStatus(userId: number, modelId: number): Promise<boolean> {
    try {
      const response = await fetch(`/api/bookmarks/${userId}/${modelId}`);
      if (!response.ok) return false;
      const data = await response.json();
      return data.bookmarked || false;
    } catch (error) {
      console.error('Failed to get bookmark status:', error);
      return false;
    }
  }

  async toggleBookmark(userId: number, modelId: number): Promise<boolean> {
    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, modelId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle bookmark: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Invalidate related queries
      this.queryClient.invalidateQueries({ queryKey: ['bookmark-status', userId, modelId] });
      this.queryClient.invalidateQueries({ queryKey: ['bookmarked-models', userId] });
      this.queryClient.invalidateQueries({ queryKey: ['/api/models', 'bookmarked'] });
      
      return data.bookmarked;
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      throw error;
    }
  }

  // Cache management
  invalidateBookmarkCache(userId: number, modelId?: number): void {
    if (modelId) {
      this.queryClient.invalidateQueries({ queryKey: ['bookmark-status', userId, modelId] });
    }
    this.queryClient.invalidateQueries({ queryKey: ['bookmarked-models', userId] });
    this.queryClient.invalidateQueries({ queryKey: ['/api/models', 'bookmarked'] });
  }

  // Batch operations for performance
  async getMultipleBookmarkStatuses(userId: number, modelIds: number[]): Promise<Record<number, boolean>> {
    try {
      const response = await fetch('/api/bookmarks/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, modelIds }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get bookmark statuses: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get multiple bookmark statuses:', error);
      // Return empty statuses on error
      return modelIds.reduce((acc, modelId) => {
        acc[modelId] = false;
        return acc;
      }, {} as Record<number, boolean>);
    }
  }
}