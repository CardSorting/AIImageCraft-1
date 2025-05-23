/**
 * Personalization Engine Interface - Domain Service
 * World-class recommendation system following Apple's design philosophy
 * Implements industry-standard personalization algorithms
 */

import { UserProfile } from '../entities/UserProfile';
import { AIModel } from '@shared/schema';

export interface RecommendationContext {
  readonly userId: number;
  readonly currentTime: Date;
  readonly sessionContext: SessionContext;
  readonly excludeModelIds?: number[];
  readonly maxResults: number;
}

export interface SessionContext {
  readonly sessionDuration: number; // minutes
  readonly pagesViewed: string[];
  readonly modelsViewed: number[];
  readonly searchQueries: string[];
  readonly currentCategory?: string;
}

export interface PersonalizedRecommendation {
  readonly model: AIModel;
  readonly relevanceScore: number; // 0-1
  readonly confidenceScore: number; // 0-1
  readonly recommendationReason: RecommendationReason[];
  readonly diversityFactor: number; // 0-1
  readonly contextualBoost: number; // 0-1
}

export interface RecommendationReason {
  readonly type: 'category_affinity' | 'provider_preference' | 'quality_match' | 
                'behavioral_pattern' | 'trending' | 'similar_users' | 'time_context' |
                'exploration' | 'collaborative_filtering' | 'content_based';
  readonly strength: number; // 0-1
  readonly description: string;
}

export interface RecommendationMetrics {
  readonly totalCandidates: number;
  readonly filteredCandidates: number;
  readonly averageRelevanceScore: number;
  readonly diversityIndex: number;
  readonly processingTimeMs: number;
  readonly algorithmVersions: string[];
}

/**
 * Core Personalization Engine Interface
 * Implements multiple recommendation strategies
 */
export interface IPersonalizationEngine {
  /**
   * Generate personalized recommendations using hybrid approach
   * Combines content-based, collaborative filtering, and contextual algorithms
   */
  generateRecommendations(
    userProfile: UserProfile,
    context: RecommendationContext,
    availableModels: AIModel[]
  ): Promise<PersonalizedRecommendation[]>;

  /**
   * Content-based filtering using model attributes and user preferences
   */
  getContentBasedRecommendations(
    userProfile: UserProfile,
    models: AIModel[],
    limit: number
  ): Promise<PersonalizedRecommendation[]>;

  /**
   * Collaborative filtering based on similar user behaviors
   */
  getCollaborativeFilteringRecommendations(
    userProfile: UserProfile,
    models: AIModel[],
    limit: number
  ): Promise<PersonalizedRecommendation[]>;

  /**
   * Contextual recommendations based on current session and time
   */
  getContextualRecommendations(
    userProfile: UserProfile,
    context: RecommendationContext,
    models: AIModel[],
    limit: number
  ): Promise<PersonalizedRecommendation[]>;

  /**
   * Trending and popularity-based recommendations
   */
  getTrendingRecommendations(
    userProfile: UserProfile,
    models: AIModel[],
    limit: number
  ): Promise<PersonalizedRecommendation[]>;

  /**
   * Exploration recommendations for discovering new content
   */
  getExplorationRecommendations(
    userProfile: UserProfile,
    models: AIModel[],
    limit: number
  ): Promise<PersonalizedRecommendation[]>;

  /**
   * Calculate diversity score for recommendation set
   */
  calculateDiversityScore(recommendations: PersonalizedRecommendation[]): number;

  /**
   * Apply post-processing to optimize recommendation quality
   */
  optimizeRecommendations(
    recommendations: PersonalizedRecommendation[],
    userProfile: UserProfile,
    context: RecommendationContext
  ): PersonalizedRecommendation[];

  /**
   * Update user profile based on interaction feedback
   */
  recordInteractionFeedback(
    userId: number,
    modelId: number,
    interactionType: string,
    engagementLevel: number
  ): Promise<void>;
}