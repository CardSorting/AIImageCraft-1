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
      // Import behavior repository for real data analysis
      const { UserBehaviorRepository } = await import('../../infrastructure/repositories/UserBehaviorRepository');
      const behaviorRepo = new UserBehaviorRepository();
      
      // Get real user interaction patterns
      const interactionPattern = await behaviorRepo.getInteractionPattern(userId);
      const categoryAffinities = await behaviorRepo.getUserCategoryAffinities(userId);
      const providerAffinities = await behaviorRepo.getUserProviderAffinities(userId);
      const behaviorProfile = await behaviorRepo.getUserBehaviorProfile(userId);
      const recentInteractions = await behaviorRepo.getUserInteractions(userId, 50, undefined, 30);

      // Build preferences from real data
      const preferences: UserPreferences = {
        preferredCategories: interactionPattern.preferredCategories.length > 0 
          ? interactionPattern.preferredCategories 
          : ['General', 'Photorealistic'],
        preferredProviders: interactionPattern.preferredProviders.length > 0 
          ? interactionPattern.preferredProviders 
          : ['RunDiffusion'],
        preferredStyles: behaviorProfile?.preferredStyles || ['realistic', 'creative'],
        qualityThreshold: interactionPattern.qualityThreshold,
        speedPreference: (behaviorProfile?.speedPreference as 'fast' | 'balanced' | 'quality') || 'balanced',
        complexityLevel: (behaviorProfile?.complexityLevel as 'beginner' | 'intermediate' | 'advanced') || 'intermediate'
      };

      // Build behavior metrics from real interactions
      const behaviorMetrics: UserBehaviorMetrics = {
        totalInteractions: recentInteractions.length,
        averageSessionDuration: Math.round(interactionPattern.averageSessionDuration / 60), // convert to minutes
        mostActiveTimeOfDay: interactionPattern.timeOfDay,
        favoriteFeatures: this.extractFavoriteFeatures(recentInteractions),
        searchPatterns: this.extractSearchPatterns(recentInteractions),
        generationFrequency: this.calculateGenerationFrequency(recentInteractions)
      };

      // Build engagement scores from real affinities
      const categoryAffinityMap = new Map<string, number>();
      categoryAffinities.forEach(affinity => {
        categoryAffinityMap.set(affinity.category, affinity.affinityScore / 100);
      });

      const providerAffinityMap = new Map<string, number>();
      providerAffinities.forEach(affinity => {
        providerAffinityMap.set(affinity.provider, affinity.affinityScore / 100);
      });

      const featureUsageScores = new Map<string, number>();
      featureUsageScores.set('image-generation', this.calculateFeatureUsage(recentInteractions, 'generate'));
      featureUsageScores.set('browsing', this.calculateFeatureUsage(recentInteractions, 'view'));
      featureUsageScores.set('curation', this.calculateFeatureUsage(recentInteractions, 'bookmark'));

      const engagementScores: UserEngagementScores = {
        categoryAffinities: categoryAffinityMap,
        providerAffinities: providerAffinityMap,
        featureUsageScores,
        qualityPreferenceScore: this.calculateQualityPreference(recentInteractions),
        explorationScore: interactionPattern.explorationScore
      };

      return new UserProfile(
        userId,
        preferences,
        behaviorMetrics,
        engagementScores
      );

    } catch (error) {
      console.error('Error building user profile from real data:', error);
      // Return intelligent default profile
      return this.createDefaultUserProfile(userId);
    }
  }

  private extractFavoriteFeatures(interactions: any[]): string[] {
    const featureCounts = interactions.reduce((acc, interaction) => {
      acc[interaction.interactionType] = (acc[interaction.interactionType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(featureCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([feature]) => feature);
  }

  private extractSearchPatterns(interactions: any[]): string[] {
    // Extract patterns from interaction types and timing
    const patterns = ['model-browsing'];
    
    const hasHighEngagement = interactions.some(i => (i.engagementLevel || 5) >= 8);
    if (hasHighEngagement) patterns.push('quality-focused');
    
    const hasBookmarks = interactions.some(i => i.interactionType === 'bookmark');
    if (hasBookmarks) patterns.push('collection-building');
    
    return patterns;
  }

  private calculateGenerationFrequency(interactions: any[]): number {
    const generateInteractions = interactions.filter(i => i.interactionType === 'generate');
    const daysSpan = Math.max(1, interactions.length > 0 ? 
      (Date.now() - new Date(interactions[interactions.length - 1].createdAt).getTime()) / (1000 * 60 * 60 * 24) : 7);
    
    return Math.round((generateInteractions.length / daysSpan) * 7); // per week
  }

  private calculateFeatureUsage(interactions: any[], featureType: string): number {
    const featureInteractions = interactions.filter(i => i.interactionType === featureType);
    return Math.min(1.0, featureInteractions.length / Math.max(1, interactions.length));
  }

  private calculateQualityPreference(interactions: any[]): number {
    const avgEngagement = interactions.reduce((sum, i) => sum + (i.engagementLevel || 5), 0) / Math.max(1, interactions.length);
    return Math.min(1.0, avgEngagement / 10);
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