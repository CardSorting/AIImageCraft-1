/**
 * Model Detail Service - Infrastructure Layer
 * Follows Apple's philosophy of reliable, efficient data access
 * Implements Repository pattern with proper error handling
 */

import { ModelDetailAggregate } from '../../domain/models/ModelDetail';

/**
 * Model Detail API Response Interface
 * Matches backend response structure
 */
interface ModelDetailApiResponse {
  success: boolean;
  data: {
    model: {
      id: number;
      modelId: string;
      name: string;
      description: string;
      category: string;
      provider: string;
      featured: boolean;
      tags: string[];
      createdAt: string;
      updatedAt: string;
    };
    engagement: {
      isLiked: boolean;
      isBookmarked: boolean;
      stats: {
        likeCount: number;
        bookmarkCount: number;
        usageCount: number;
        viewCount: number;
      };
    };
    images: {
      items: any[];
      pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
      };
    };
  };
  meta: {
    modelId: number;
    userId?: number;
    fetchedAt: string;
  };
}

/**
 * Model Detail Service
 * Handles all external API communications
 * Follows Single Responsibility Principle
 */
export class ModelDetailService {
  private readonly baseUrl = '/api/v1/models';

  /**
   * Fetches comprehensive model details
   * Returns authentic data from the API
   */
  async getModelDetail(modelId: number, userId?: number): Promise<ModelDetailAggregate> {
    try {
      const url = `${this.baseUrl}/${modelId}/detail${userId ? `?userId=${userId}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch model details: ${response.status} ${response.statusText}`);
      }

      const data: ModelDetailApiResponse = await response.json();

      if (!data.success) {
        throw new Error('Failed to fetch model details');
      }

      // Transform API response to domain model
      return {
        model: {
          ...data.data.model,
          tags: data.data.model.tags || [],
        },
        engagement: data.data.engagement,
        images: data.data.images,
        meta: {
          fetchedAt: data.meta.fetchedAt,
          userId: data.meta.userId,
        },
      };

    } catch (error) {
      console.error(`[ModelDetailService] Error fetching model ${modelId}:`, error);
      throw error;
    }
  }

  /**
   * Fetches model engagement status
   * Separate endpoint for optimization
   */
  async getModelEngagement(modelId: number, userId: number): Promise<{ isLiked: boolean; isBookmarked: boolean }> {
    try {
      const url = `${this.baseUrl}/${modelId}/engagement?userId=${userId}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch engagement: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch engagement status');
      }

      return {
        isLiked: data.data.isLiked,
        isBookmarked: data.data.isBookmarked,
      };

    } catch (error) {
      console.error(`[ModelDetailService] Error fetching engagement for model ${modelId}:`, error);
      throw error;
    }
  }

  /**
   * Fetches model images with pagination
   * Follows Apple's efficient data loading principles
   */
  async getModelImages(modelId: number, limit = 12, offset = 0): Promise<any> {
    try {
      const url = `${this.baseUrl}/${modelId}/images?limit=${limit}&offset=${offset}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch model images: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch model images');
      }

      return data.data;

    } catch (error) {
      console.error(`[ModelDetailService] Error fetching images for model ${modelId}:`, error);
      throw error;
    }
  }
}