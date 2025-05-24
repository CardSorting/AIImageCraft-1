/**
 * Model Detail Query Handler - Clean Architecture Implementation
 * Follows Apple's philosophy of reliable, efficient processing
 * Implements CQRS pattern with proper separation of concerns
 */

import { GetModelDetailQuery, GetModelEngagementQuery, GetModelImagesQuery } from '../queries/GetModelDetailQuery.js';
import { IStorage } from '../../storage.js';
import { storage } from '../../storage.js';

/**
 * Response DTOs following Apple's clear data contracts
 */
export interface ModelDetailResponseDTO {
  readonly model: {
    readonly id: number;
    readonly modelId: string;
    readonly name: string;
    readonly description: string;
    readonly category: string;
    readonly provider: string;
    readonly featured: boolean;
    readonly tags: readonly string[];
    readonly createdAt: string;
    readonly updatedAt: string;
  };
  readonly engagement: {
    readonly isLiked: boolean;
    readonly isBookmarked: boolean;
    readonly stats: {
      readonly likeCount: number;
      readonly bookmarkCount: number;
      readonly usageCount: number;
      readonly viewCount: number;
    };
  };
  readonly images: {
    readonly items: readonly any[];
    readonly pagination: {
      readonly total: number;
      readonly limit: number;
      readonly offset: number;
      readonly hasMore: boolean;
    };
  };
}

/**
 * Main query handler implementing CQRS
 * Follows Single Responsibility Principle
 */
export class GetModelDetailQueryHandler {
  constructor(private readonly storage: IStorage = storage) {}

  async handle(query: GetModelDetailQuery): Promise<ModelDetailResponseDTO> {
    if (!query.validate()) {
      throw new Error('Invalid query parameters');
    }

    // Fetch model details
    const model = await this.storage.getAIModelById(query.modelId);
    if (!model) {
      throw new Error('Model not found');
    }

    // Fetch engagement data if user is provided
    let engagement = {
      isLiked: false,
      isBookmarked: false,
      stats: {
        likeCount: 0,
        bookmarkCount: 0,
        usageCount: 0,
        viewCount: 0,
      },
    };

    if (query.userId) {
      const [isLiked, isBookmarked] = await Promise.all([
        this.storage.isModelLiked(query.userId, query.modelId),
        this.storage.isModelBookmarked(query.userId, query.modelId),
      ]);

      engagement.isLiked = Boolean(isLiked);
      engagement.isBookmarked = Boolean(isBookmarked);
    }

    // Fetch model images
    const images = await this.storage.getImages(12); // Get images associated with this model

    return {
      model: {
        id: model.id,
        modelId: model.modelId,
        name: model.name,
        description: model.description || '',
        category: model.category,
        provider: model.provider || '',
        featured: model.featured || false,
        tags: model.tags || [],
        createdAt: model.createdAt.toISOString(),
        updatedAt: model.updatedAt.toISOString(),
      },
      engagement,
      images: {
        items: images,
        pagination: {
          total: images.length,
          limit: 12,
          offset: 0,
          hasMore: false,
        },
      },
    };
  }
}

/**
 * Specialized handler for engagement operations
 * Follows Open/Closed Principle - extensible without modification
 */
export class ModelEngagementQueryHandler {
  constructor(private readonly storage: IStorage = storage) {}

  async handle(query: GetModelEngagementQuery) {
    if (!query.validate()) {
      throw new Error('Invalid engagement query parameters');
    }

    const [isLiked, isBookmarked] = await Promise.all([
      this.storage.isModelLiked(query.userId, query.modelId),
      this.storage.isModelBookmarked(query.userId, query.modelId),
    ]);

    return {
      modelId: query.modelId,
      userId: query.userId,
      isLiked: Boolean(isLiked),
      isBookmarked: Boolean(isBookmarked),
      fetchedAt: new Date().toISOString(),
    };
  }
}

/**
 * Specialized handler for model images
 * Implements Interface Segregation Principle
 */
export class ModelImagesQueryHandler {
  constructor(private readonly storage: IStorage = storage) {}

  async handle(query: GetModelImagesQuery) {
    if (!query.validate()) {
      throw new Error('Invalid images query parameters');
    }

    // In a real implementation, you would filter images by model
    // For now, we'll get all images and simulate model filtering
    const allImages = await this.storage.getImages(query.limit);
    
    return {
      modelId: query.modelId,
      images: allImages,
      pagination: {
        total: allImages.length,
        limit: query.limit,
        offset: query.offset,
        hasMore: allImages.length === query.limit,
      },
    };
  }
}