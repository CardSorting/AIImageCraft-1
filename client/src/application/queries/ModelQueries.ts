/**
 * Model Queries - CQRS Query Pattern
 * Following Apple's philosophy of anticipating user needs
 * Optimized for different user contexts and scenarios
 */

import { Model, ModelStatistics } from '@/domain/entities/Model';
import { ModelMapper } from '@/lib/ModelMapper';

export interface Query<TResult> {
  readonly type: string;
  execute(): Promise<TResult>;
}

export interface ModelFilter {
  category?: string;
  tags?: string[];
  provider?: string;
  featured?: boolean;
  qualityTier?: 'premium' | 'standard' | 'basic';
  minEngagementScore?: number;
}

export interface ModelSortOptions {
  sortBy: 'newest' | 'popular' | 'trending' | 'highest_rated' | 'most_liked';
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface GetModelsQuery extends Query<Model[]> {
  readonly type: 'GET_MODELS';
  readonly filters?: ModelFilter;
  readonly sortOptions?: ModelSortOptions;
  readonly pagination?: PaginationOptions;
}

export interface GetPersonalizedModelsQuery extends Query<Model[]> {
  readonly type: 'GET_PERSONALIZED_MODELS';
  readonly userId: number;
  readonly limit?: number;
}

export interface GetBookmarkedModelsQuery extends Query<Model[]> {
  readonly type: 'GET_BOOKMARKED_MODELS';
  readonly userId: number;
  readonly limit?: number;
}

export interface SearchModelsQuery extends Query<Model[]> {
  readonly type: 'SEARCH_MODELS';
  readonly query: string;
  readonly userId?: number;
  readonly limit?: number;
}

export interface GetModelStatisticsQuery extends Query<ModelStatistics> {
  readonly type: 'GET_MODEL_STATISTICS';
  readonly modelId: number;
}

// Query implementations with Apple's "it just works" philosophy
export class GetModelsQueryImpl implements GetModelsQuery {
  readonly type = 'GET_MODELS' as const;

  constructor(
    public readonly filters?: ModelFilter,
    public readonly sortOptions: ModelSortOptions = { sortBy: 'newest', direction: 'desc' },
    public readonly pagination: PaginationOptions = { page: 1, limit: 20 }
  ) {}

  async execute(): Promise<Model[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (this.filters?.category) queryParams.set('category', this.filters.category);
      if (this.sortOptions) queryParams.set('sortBy', this.sortOptions.sortBy);
      queryParams.set('limit', this.pagination.limit.toString());
      queryParams.set('page', this.pagination.page.toString());

      const response = await fetch(`/api/models?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch models');
      
      const data = await response.json();
      return ModelMapper.transformToModels(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Get models query failed:', error);
      return [];
    }
  }


}

export class GetPersonalizedModelsQueryImpl implements GetPersonalizedModelsQuery {
  readonly type = 'GET_PERSONALIZED_MODELS' as const;

  constructor(
    public readonly userId: number,
    public readonly limit: number = 20
  ) {}

  async execute(): Promise<Model[]> {
    try {
      const response = await fetch(`/api/models/for-you/${this.userId}?limit=${this.limit}`);
      if (!response.ok) throw new Error('Failed to fetch personalized models');
      
      const data = await response.json();
      return new GetModelsQueryImpl().transformToModels(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Personalized models query failed:', error);
      // Graceful fallback to general models
      const fallbackQuery = new GetModelsQueryImpl({}, { sortBy: 'popular', direction: 'desc' }, { page: 1, limit: this.limit });
      return fallbackQuery.execute();
    }
  }
}

export class SearchModelsQueryImpl implements SearchModelsQuery {
  readonly type = 'SEARCH_MODELS' as const;

  constructor(
    public readonly query: string,
    public readonly userId?: number,
    public readonly limit: number = 20
  ) {}

  async execute(): Promise<Model[]> {
    if (this.query.length < 2) return [];

    try {
      const response = await fetch(`/api/models/search?q=${encodeURIComponent(this.query)}&limit=${this.limit}`);
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      return new GetModelsQueryImpl().transformToModels(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Search models query failed:', error);
      return [];
    }
  }
}