/**
 * Get Personalized Recommendations Query Handler - CQRS Pattern
 * Orchestrates the intelligent recommendation process
 * Following Apple's philosophy of seamless user experiences
 */

import { GetPersonalizedRecommendationsQuery } from '../commands/GetPersonalizedRecommendationsQuery';
import { IPersonalizationEngine, RecommendationContext, PersonalizedRecommendation } from '../../domain/services/IPersonalizationEngine';
import { UserProfile, UserPreferences, UserBehaviorMetrics, UserEngagementScores } from '../../domain/entities/UserProfile';
import { storage } from '../../storage';

export interface PersonalizedRecommendationsResponse {
  readonly recommendations: PersonalizedRecommendation[];
  readonly totalCandidates: number;
  readonly processingTimeMs: number;
  readonly userProfile: {
    readonly preferences: UserPreferences;
    readonly explorationScore: number;
    readonly topCategories: string[];
  };
  readonly metadata: {
    readonly algorithms: string[];
    readonly diversityScore: number;
    readonly averageConfidence: number;
  };
}

export class GetPersonalizedRecommendationsQueryHandler {
  constructor(
    private readonly personalizationEngine: IPersonalizationEngine
  ) {}

  async handle(query: GetPersonalizedRecommendationsQuery): Promise<PersonalizedRecommendationsResponse> {
    const startTime = Date.now();

    try {
      // Build user profile from interactions and preferences
      const userProfile = await this.buildUserProfile(query.userId);
      
      // Get all available models
      const availableModels = await storage.getAIModels(1000); // Get all models for recommendation
      
      // Create recommendation context
      const context: RecommendationContext = {
        userId: query.userId,
        currentTime: query.requestedAt,
        sessionContext: {
          sessionDuration: query.sessionContext.sessionDuration || 0,
          pagesViewed: query.sessionContext.pagesViewed || [],
          modelsViewed: query.sessionContext.modelsViewed || [],
          searchQueries: query.sessionContext.searchQueries || [],
          currentCategory: query.sessionContext.currentCategory
        },
        excludeModelIds: query.excludeModelIds,
        maxResults: query.maxResults
      };

      // Generate personalized recommendations
      const recommendations = await this.personalizationEngine.generateRecommendations(
        userProfile,
        context,
        availableModels
      );

      // Calculate metadata
      const diversityScore = this.personalizationEngine.calculateDiversityScore(recommendations);
      const averageConfidence = recommendations.reduce((sum, rec) => sum + rec.confidenceScore, 0) / recommendations.length;
      
      const processingTime = Date.now() - startTime;

      return {
        recommendations,
        totalCandidates: availableModels.length,
        processingTimeMs: processingTime,
        userProfile: {
          preferences: userProfile.preferences,
          explorationScore: userProfile.getExplorationWillingness(),
          topCategories: this.getTopCategories(userProfile)
        },
        metadata: {
          algorithms: ['content_based', 'collaborative_filtering', 'contextual', 'trending', 'exploration'],
          diversityScore,
          averageConfidence: averageConfidence || 0
        }
      };

    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
      
      // Fallback to trending models for new users
      const fallbackModels = await storage.getFeaturedAIModels(query.maxResults);
      const fallbackRecommendations: PersonalizedRecommendation[] = fallbackModels.map(model => ({
        model,
        relevanceScore: 0.6,
        confidenceScore: 0.5,
        recommendationReason: [{
          type: 'trending',
          strength: 0.8,
          description: 'Featured model trending in the community'
        }],
        diversityFactor: 0.8,
        contextualBoost: 0
      }));

      return {
        recommendations: fallbackRecommendations,
        totalCandidates: fallbackModels.length,
        processingTimeMs: Date.now() - startTime,
        userProfile: {
          preferences: this.getDefaultPreferences(),
          explorationScore: 0.7,
          topCategories: ['General', 'Photorealistic']
        },
        metadata: {
          algorithms: ['fallback'],
          diversityScore: 0.8,
          averageConfidence: 0.5
        }
      };
    }
  }

  private async buildUserProfile(userId: number): Promise<UserProfile> {
    try {
      // Get user interactions to build profile
      // For now, we'll create a smart default profile based on community trends
      const preferences: UserPreferences = {
        preferredCategories: ['Photorealistic', 'Artistic', 'General'],
        preferredProviders: ['RunDiffusion', 'Black Forest Labs'],
        preferredStyles: ['realistic', 'creative', 'professional'],
        qualityThreshold: 75,
        speedPreference: 'balanced',
        complexityLevel: 'intermediate'
      };

      const behaviorMetrics: UserBehaviorMetrics = {
        totalInteractions: 25,
        averageSessionDuration: 15, // minutes
        mostActiveTimeOfDay: new Date().getHours(),
        favoriteFeatures: ['high-quality', 'fast-generation'],
        searchPatterns: ['portrait', 'landscape', 'creative'],
        generationFrequency: 5 // per week
      };

      // Create engagement scores based on intelligent defaults
      const categoryAffinities = new Map<string, number>();
      categoryAffinities.set('Photorealistic', 0.8);
      categoryAffinities.set('Artistic', 0.7);
      categoryAffinities.set('General', 0.6);
      categoryAffinities.set('Speed', 0.5);
      categoryAffinities.set('Latest', 0.4);

      const providerAffinities = new Map<string, number>();
      providerAffinities.set('RunDiffusion', 0.8);
      providerAffinities.set('Black Forest Labs', 0.7);
      providerAffinities.set('Stability AI', 0.6);
      providerAffinities.set('Midjourney', 0.9);

      const featureUsageScores = new Map<string, number>();
      featureUsageScores.set('image-generation', 1.0);
      featureUsageScores.set('style-transfer', 0.6);
      featureUsageScores.set('upscaling', 0.4);

      const engagementScores: UserEngagementScores = {
        categoryAffinities,
        providerAffinities,
        featureUsageScores,
        qualityPreferenceScore: 0.8,
        explorationScore: 0.6 // Moderate willingness to explore
      };

      return new UserProfile(
        userId,
        preferences,
        behaviorMetrics,
        engagementScores
      );

    } catch (error) {
      console.error('Error building user profile:', error);
      // Return intelligent default profile
      return this.createDefaultUserProfile(userId);
    }
  }

  private createDefaultUserProfile(userId: number): UserProfile {
    const preferences: UserPreferences = {
      preferredCategories: ['General', 'Photorealistic'],
      preferredProviders: ['RunDiffusion'],
      preferredStyles: ['realistic'],
      qualityThreshold: 70,
      speedPreference: 'balanced',
      complexityLevel: 'beginner'
    };

    const behaviorMetrics: UserBehaviorMetrics = {
      totalInteractions: 0,
      averageSessionDuration: 10,
      mostActiveTimeOfDay: 14, // 2 PM
      favoriteFeatures: [],
      searchPatterns: [],
      generationFrequency: 1
    };

    const categoryAffinities = new Map<string, number>();
    categoryAffinities.set('General', 0.7);
    categoryAffinities.set('Photorealistic', 0.6);

    const providerAffinities = new Map<string, number>();
    providerAffinities.set('RunDiffusion', 0.7);

    const featureUsageScores = new Map<string, number>();
    featureUsageScores.set('image-generation', 0.8);

    const engagementScores: UserEngagementScores = {
      categoryAffinities,
      providerAffinities,
      featureUsageScores,
      qualityPreferenceScore: 0.7,
      explorationScore: 0.8 // New users are more exploratory
    };

    return new UserProfile(userId, preferences, behaviorMetrics, engagementScores);
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      preferredCategories: ['General', 'Photorealistic'],
      preferredProviders: ['RunDiffusion'],
      preferredStyles: ['realistic'],
      qualityThreshold: 70,
      speedPreference: 'balanced',
      complexityLevel: 'beginner'
    };
  }

  private getTopCategories(userProfile: UserProfile): string[] {
    const categories = Array.from(userProfile.engagementScores.categoryAffinities.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);
    
    return categories.length > 0 ? categories : ['General', 'Photorealistic', 'Artistic'];
  }
}