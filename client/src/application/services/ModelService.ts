/**
 * Model Application Service
 * Following Clean Architecture and Apple's design principles
 * - Single Responsibility: Orchestrates model-related operations
 * - Dependency Inversion: Depends on abstractions, not concretions
 * - Apple Philosophy: Intuitive, reliable, and performant
 */

import { Model } from '@/domain/entities/Model';
import { 
  BookmarkModelCommandImpl, 
  LikeModelCommandImpl, 
  TrackModelInteractionCommandImpl 
} from '@/application/commands/ModelCommands';
import { 
  GetModelsQueryImpl,
  GetPersonalizedModelsQueryImpl,
  SearchModelsQueryImpl,
  ModelFilter,
  ModelSortOptions,
  PaginationOptions
} from '@/application/queries/ModelQueries';

export interface IModelService {
  getModels(filters?: ModelFilter, sortOptions?: ModelSortOptions, pagination?: PaginationOptions): Promise<Model[]>;
  getPersonalizedModels(userId: number, limit?: number): Promise<Model[]>;
  getBookmarkedModels(userId: number): Promise<Model[]>;
  searchModels(query: string, userId?: number): Promise<Model[]>;
  bookmarkModel(userId: number, modelId: number, isCurrentlyBookmarked: boolean): Promise<boolean>;
  likeModel(userId: number, modelId: number, isCurrentlyLiked: boolean): Promise<boolean>;
  trackInteraction(userId: number, modelId: number, type: string, engagementLevel?: number): Promise<void>;
}

export class ModelService implements IModelService {
  async getModels(
    filters?: ModelFilter, 
    sortOptions: ModelSortOptions = { sortBy: 'newest', direction: 'desc' },
    pagination: PaginationOptions = { page: 1, limit: 20 }
  ): Promise<Model[]> {
    const query = new GetModelsQueryImpl(filters, sortOptions, pagination);
    return await query.execute();
  }

  async getPersonalizedModels(userId: number, limit: number = 20): Promise<Model[]> {
    const query = new GetPersonalizedModelsQueryImpl(userId, limit);
    return await query.execute();
  }

  async getBookmarkedModels(userId: number): Promise<Model[]> {
    try {
      const response = await fetch(`/api/models/bookmarked/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch bookmarked models');
      
      const data = await response.json();
      return new GetModelsQueryImpl().transformToModels(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Failed to get bookmarked models:', error);
      return [];
    }
  }

  async searchModels(query: string, userId?: number): Promise<Model[]> {
    const searchQuery = new SearchModelsQueryImpl(query, userId);
    return await searchQuery.execute();
  }

  async bookmarkModel(userId: number, modelId: number, isCurrentlyBookmarked: boolean): Promise<boolean> {
    const command = new BookmarkModelCommandImpl(userId, modelId, isCurrentlyBookmarked);
    
    // Track the interaction for personalization
    await this.trackInteraction(userId, modelId, 'bookmark', 8);
    
    return await command.execute();
  }

  async likeModel(userId: number, modelId: number, isCurrentlyLiked: boolean): Promise<boolean> {
    const command = new LikeModelCommandImpl(userId, modelId, isCurrentlyLiked);
    
    // Track the interaction for personalization
    await this.trackInteraction(userId, modelId, 'like', 7);
    
    return await command.execute();
  }

  async trackInteraction(
    userId: number, 
    modelId: number, 
    type: string, 
    engagementLevel: number = 5
  ): Promise<void> {
    const deviceType = this.getDeviceType();
    const command = new TrackModelInteractionCommandImpl(
      userId, 
      modelId, 
      type as any, 
      engagementLevel, 
      0, 
      deviceType
    );
    
    await command.execute();
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }
}