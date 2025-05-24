/**
 * Model Detail Domain Models - Clean Architecture
 * Follows Apple's philosophy of clear, purposeful design
 * Implements Domain-Driven Design principles
 */

/**
 * Core Model Domain Entity
 * Immutable design following Apple's value semantics
 */
export interface ModelEntity {
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
}

/**
 * User Engagement Value Object
 * Encapsulates engagement state following DDD principles
 */
export interface ModelEngagement {
  readonly isLiked: boolean;
  readonly isBookmarked: boolean;
  readonly stats: {
    readonly likeCount: number;
    readonly bookmarkCount: number;
    readonly usageCount: number;
    readonly viewCount: number;
  };
}

/**
 * Model Images Collection
 * Represents paginated image data with proper encapsulation
 */
export interface ModelImages {
  readonly items: readonly ModelImage[];
  readonly pagination: {
    readonly total: number;
    readonly limit: number;
    readonly offset: number;
    readonly hasMore: boolean;
  };
}

/**
 * Individual Model Image Entity
 * Following Apple's clear data contracts
 */
export interface ModelImage {
  readonly id: number;
  readonly prompt: string;
  readonly imageUrl: string;
  readonly model?: string;
  readonly dimensions?: {
    readonly width: number;
    readonly height: number;
  };
  readonly createdAt?: string;
  readonly cost?: number;
}

/**
 * Complete Model Detail Aggregate
 * Central domain entity following DDD aggregate pattern
 */
export interface ModelDetailAggregate {
  readonly model: ModelEntity;
  readonly engagement: ModelEngagement;
  readonly images: ModelImages;
  readonly meta: {
    readonly fetchedAt: string;
    readonly userId?: number;
  };
}

/**
 * Model Detail State Management
 * Follows Apple's predictable state principles
 */
export interface ModelDetailState {
  readonly data: ModelDetailAggregate | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly lastFetched: string | null;
}

/**
 * Model Detail Factory
 * Creates domain objects with proper validation
 */
export class ModelDetailFactory {
  static createEmpty(): ModelDetailState {
    return {
      data: null,
      loading: false,
      error: null,
      lastFetched: null,
    };
  }

  static createLoading(): ModelDetailState {
    return {
      data: null,
      loading: true,
      error: null,
      lastFetched: null,
    };
  }

  static createSuccess(data: ModelDetailAggregate): ModelDetailState {
    return {
      data,
      loading: false,
      error: null,
      lastFetched: new Date().toISOString(),
    };
  }

  static createError(error: string): ModelDetailState {
    return {
      data: null,
      loading: false,
      error,
      lastFetched: null,
    };
  }
}