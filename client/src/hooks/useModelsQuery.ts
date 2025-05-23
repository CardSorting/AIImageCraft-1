/**
 * Custom hook for models data fetching following SOLID principles
 * Implements proper separation of concerns and prevents routing collisions
 */

import { useQuery } from '@tanstack/react-query';
import { AIModel } from '../../../shared/schema';

export type ModelFilter = 'all' | 'bookmarked' | 'for-you';

interface UseModelsQueryProps {
  filter: ModelFilter;
  sortBy?: string;
  limit?: number;
  userId?: number;
  searchQuery?: string;
}

interface ModelsResponse {
  data: AIModel[];
  meta: {
    filter: string;
    sortBy: string;
    limit: number;
    count: number;
  };
}

/**
 * Hook for fetching models catalog with proper CQRS implementation
 * Follows Single Responsibility Principle
 */
export function useModelsQuery({
  filter,
  sortBy = 'newest',
  limit = 20,
  userId = 1,
  searchQuery
}: UseModelsQueryProps) {
  return useQuery<ModelsResponse>({
    queryKey: ['models', filter, sortBy, limit, userId, searchQuery],
    queryFn: async () => {
      // Use new versioned API endpoints to prevent routing collisions
      let url: string;
      
      switch (filter) {
        case 'bookmarked':
          url = `/api/v1/models/bookmarks/${userId}?limit=${limit}`;
          break;
        case 'for-you':
          url = `/api/v1/models/recommendations/${userId}?limit=${limit}`;
          break;
        default:
          url = `/api/v1/models/catalog?filter=${filter}&sortBy=${sortBy}&limit=${limit}&userId=${userId}`;
      }
      
      if (searchQuery && searchQuery.length > 2) {
        // Fallback to legacy search endpoint for now
        const response = await fetch(`/api/models/search/${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        return {
          data: Array.isArray(data) ? data : [],
          meta: {
            filter: 'search',
            sortBy,
            limit,
            count: Array.isArray(data) ? data.length : 0
          }
        };
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Handle both new structured response and legacy direct array response
      if (result.data !== undefined) {
        return result;
      } else {
        // Legacy response format - wrap in new structure
        const dataArray = Array.isArray(result) ? result : [];
        return {
          data: dataArray,
          meta: {
            filter,
            sortBy,
            limit,
            count: dataArray.length
          }
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Specialized hook for search functionality
 * Follows Open/Closed Principle - extensible for new search features
 */
export function useModelsSearchQuery(searchQuery: string) {
  return useQuery<AIModel[]>({
    queryKey: ['models', 'search', searchQuery],
    queryFn: async () => {
      if (searchQuery.length <= 2) {
        return [];
      }
      
      const response = await fetch(`/api/models/search/${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: searchQuery.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}