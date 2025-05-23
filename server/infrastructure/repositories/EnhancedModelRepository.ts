/**
 * Enhanced Model Repository - Infrastructure Layer
 * Following Apple's philosophy of elegant data access with Clean Architecture
 * Implements Repository pattern with SOLID principles
 */

import { db } from '../db';
import { aiModels } from '@shared/schema';
import { eq, desc, asc, like, or, and, inArray } from 'drizzle-orm';
import { AIModelEntity, ModelCapabilities, ModelMetrics, ModelPricing } from '../../domain/entities/AIModel';

export interface ModelSearchCriteria {
  readonly category?: string;
  readonly provider?: string;
  readonly tags?: string[];
  readonly minRating?: number;
  readonly speedTier?: string;
  readonly featured?: boolean;
  readonly limit?: number;
  readonly offset?: number;
}

export interface IModelRepository {
  findById(id: number): Promise<AIModelEntity | null>;
  findByModelId(modelId: string): Promise<AIModelEntity | null>;
  findAll(criteria?: ModelSearchCriteria): Promise<AIModelEntity[]>;
  findFeatured(limit?: number): Promise<AIModelEntity[]>;
  findByCategory(category: string, limit?: number): Promise<AIModelEntity[]>;
  search(query: string, limit?: number): Promise<AIModelEntity[]>;
  findForYou(userId: number, limit?: number): Promise<AIModelEntity[]>;
  getPopularModels(limit?: number): Promise<AIModelEntity[]>;
}

/**
 * Enhanced Model Repository Implementation
 * Apple-style data access with intelligent mapping
 */
export class EnhancedModelRepository implements IModelRepository {

  /**
   * Find model by ID with rich domain mapping
   */
  async findById(id: number): Promise<AIModelEntity | null> {
    try {
      const result = await db
        .select()
        .from(aiModels)
        .where(eq(aiModels.id, id))
        .limit(1);

      return result.length > 0 ? this.mapToEntity(result[0]) : null;
    } catch (error) {
      console.error('Error finding model by ID:', error);
      return null;
    }
  }

  /**
   * Find model by model ID string
   */
  async findByModelId(modelId: string): Promise<AIModelEntity | null> {
    try {
      const result = await db
        .select()
        .from(aiModels)
        .where(eq(aiModels.modelId, modelId))
        .limit(1);

      return result.length > 0 ? this.mapToEntity(result[0]) : null;
    } catch (error) {
      console.error('Error finding model by model ID:', error);
      return null;
    }
  }

  /**
   * Find all models with optional criteria
   */
  async findAll(criteria: ModelSearchCriteria = {}): Promise<AIModelEntity[]> {
    try {
      let query = db.select().from(aiModels);

      // Apply filters
      const conditions = [];
      
      if (criteria.category) {
        conditions.push(eq(aiModels.category, criteria.category));
      }
      
      if (criteria.provider) {
        conditions.push(eq(aiModels.provider, criteria.provider));
      }
      
      if (criteria.minRating) {
        conditions.push(eq(aiModels.rating, criteria.minRating)); // Use eq for now, update to gte when available
      }
      
      if (criteria.featured !== undefined) {
        conditions.push(eq(aiModels.featured, criteria.featured ? 1 : 0));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      // Apply ordering (rating desc, then popularity)
      query = query.orderBy(desc(aiModels.rating), desc(aiModels.likes));

      // Apply pagination
      if (criteria.limit) {
        query = query.limit(criteria.limit);
      }
      
      if (criteria.offset) {
        query = query.offset(criteria.offset);
      }

      const results = await query;
      return results.map(model => this.mapToEntity(model));

    } catch (error) {
      console.error('Error finding models:', error);
      return [];
    }
  }

  /**
   * Find featured models
   */
  async findFeatured(limit: number = 10): Promise<AIModelEntity[]> {
    return this.findAll({ featured: true, limit });
  }

  /**
   * Find models by category
   */
  async findByCategory(category: string, limit: number = 20): Promise<AIModelEntity[]> {
    return this.findAll({ category, limit });
  }

  /**
   * Search models by query
   */
  async search(query: string, limit: number = 20): Promise<AIModelEntity[]> {
    try {
      const searchTerm = `%${query.toLowerCase()}%`;
      
      const results = await db
        .select()
        .from(aiModels)
        .where(
          or(
            like(aiModels.name, searchTerm),
            like(aiModels.description, searchTerm),
            like(aiModels.category, searchTerm),
            like(aiModels.provider, searchTerm)
          )
        )
        .orderBy(desc(aiModels.rating))
        .limit(limit);

      return results.map(model => this.mapToEntity(model));

    } catch (error) {
      console.error('Error searching models:', error);
      return [];
    }
  }

  /**
   * Find personalized models for user
   */
  async findForYou(userId: number, limit: number = 20): Promise<AIModelEntity[]> {
    // For now, return popular models - will enhance with personalization
    return this.getPopularModels(limit);
  }

  /**
   * Get popular models
   */
  async getPopularModels(limit: number = 20): Promise<AIModelEntity[]> {
    try {
      const results = await db
        .select()
        .from(aiModels)
        .orderBy(desc(aiModels.likes), desc(aiModels.downloads))
        .limit(limit);

      return results.map(model => this.mapToEntity(model));

    } catch (error) {
      console.error('Error getting popular models:', error);
      return [];
    }
  }

  /**
   * Map database model to domain entity
   * Apple-style intelligent mapping with rich domain logic
   */
  private mapToEntity(model: any): AIModelEntity {
    // Parse pricing information
    let pricing: ModelPricing;
    try {
      const pricingData = model.pricing ? JSON.parse(model.pricing) : null;
      pricing = {
        tier: 'free',
        creditsPerGeneration: pricingData?.free?.credits || 1,
        costPerImage: pricingData?.pro?.costPerImage || 0.02
      };
    } catch {
      pricing = {
        tier: 'free',
        creditsPerGeneration: 1,
        costPerImage: 0.02
      };
    }

    // Determine speed tier from tags or defaults
    const speedTier = this.determineSpeedTier(model.tags, model.name);
    
    // Create capabilities
    const capabilities: ModelCapabilities = {
      supportedStyles: model.tags || [],
      maxResolution: '1024x1024', // Default resolution
      speedTier,
      qualityTier: model.rating > 80 ? 'professional' : model.rating > 60 ? 'premium' : 'standard',
      specialFeatures: model.capabilities || []
    };

    // Create metrics
    const metrics: ModelMetrics = {
      popularityScore: this.calculatePopularityScore(model),
      qualityRating: model.rating || 50,
      userSatisfaction: Math.min(100, (model.likes || 0) / Math.max(1, (model.downloads || 1)) * 100),
      performanceIndex: this.calculatePerformanceIndex(model)
    };

    return new AIModelEntity(
      model.id,
      model.modelId,
      model.name,
      model.description,
      model.category,
      model.provider,
      capabilities,
      metrics,
      pricing,
      model.tags || [],
      Boolean(model.featured),
      model.createdAt
    );
  }

  /**
   * Determine speed tier from model information
   */
  private determineSpeedTier(tags: string[] = [], name: string = ''): ModelCapabilities['speedTier'] {
    const nameAndTags = [...tags, name].join(' ').toLowerCase();
    
    if (nameAndTags.includes('schnell') || nameAndTags.includes('fast') || nameAndTags.includes('speed')) {
      return 'ultra_fast';
    }
    if (nameAndTags.includes('quick') || nameAndTags.includes('rapid')) {
      return 'fast';
    }
    if (nameAndTags.includes('detailed') || nameAndTags.includes('quality') || nameAndTags.includes('pro')) {
      return 'detailed';
    }
    
    return 'standard';
  }

  /**
   * Calculate popularity score
   */
  private calculatePopularityScore(model: any): number {
    const likes = model.likes || 0;
    const downloads = model.downloads || 0;
    const discussions = model.discussions || 0;
    const imagesGenerated = model.imagesGenerated || 0;

    // Weighted popularity formula
    const score = (likes * 0.3) + (downloads * 0.4) + (discussions * 0.1) + (imagesGenerated * 0.2);
    
    // Normalize to 0-100 scale
    return Math.min(100, Math.round(score / 1000 * 100));
  }

  /**
   * Calculate performance index
   */
  private calculatePerformanceIndex(model: any): number {
    const rating = model.rating || 50;
    const likes = model.likes || 0;
    const downloads = model.downloads || 0;

    // Performance considers quality vs popularity
    const qualityScore = rating;
    const engagementScore = Math.min(50, (likes / Math.max(1, downloads)) * 100);
    
    return Math.round((qualityScore + engagementScore) / 2);
  }
}