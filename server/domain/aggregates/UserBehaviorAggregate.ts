/**
 * User Behavior Aggregate - Domain-Driven Design
 * Manages user interaction patterns and behavioral learning
 * Following Apple's philosophy of intelligent, adaptive experiences
 */

import { UserProfile, UserPreferences, UserBehaviorMetrics, UserEngagementScores } from '../entities/UserProfile';
import { AIModel } from '@shared/schema';

export interface UserInteractionEvent {
  readonly userId: number;
  readonly modelId: number;
  readonly interactionType: 'view' | 'like' | 'bookmark' | 'generate' | 'share' | 'download';
  readonly engagementLevel: number; // 1-10
  readonly sessionDuration?: number; // seconds
  readonly deviceType?: string;
  readonly referralSource?: string;
  readonly timestamp: Date;
}

export interface BehaviorInsight {
  readonly type: 'category_preference' | 'provider_affinity' | 'quality_threshold' | 'usage_pattern';
  readonly description: string;
  readonly confidence: number; // 0-1
  readonly actionableRecommendation: string;
}

export interface LearningOutcome {
  readonly updatedPreferences: UserPreferences;
  readonly newAffinities: Map<string, number>;
  readonly behaviorInsights: BehaviorInsight[];
  readonly recommendationImprovements: string[];
}

/**
 * Core User Behavior Aggregate
 * Implements sophisticated behavioral learning algorithms
 */
export class UserBehaviorAggregate {
  private interactions: UserInteractionEvent[] = [];
  private learningHistory: LearningOutcome[] = [];

  constructor(
    public readonly userId: number,
    private userProfile: UserProfile
  ) {}

  /**
   * Record a new user interaction and learn from it
   * Apple-style intelligent adaptation
   */
  recordInteraction(interaction: UserInteractionEvent, model: AIModel): LearningOutcome {
    this.interactions.push(interaction);
    
    // Analyze the interaction for behavioral patterns
    const learningOutcome = this.analyzeAndLearn(interaction, model);
    
    // Update user profile based on learning
    this.updateUserProfile(learningOutcome);
    
    // Store learning outcome for future reference
    this.learningHistory.push(learningOutcome);
    
    return learningOutcome;
  }

  /**
   * Analyze interaction patterns and generate learning insights
   */
  private analyzeAndLearn(interaction: UserInteractionEvent, model: AIModel): LearningOutcome {
    const insights: BehaviorInsight[] = [];
    const affinityUpdates = new Map<string, number>();
    const recommendations: string[] = [];

    // Analyze category preference shifts
    const categoryInsight = this.analyzeCategoryInteraction(interaction, model);
    if (categoryInsight) {
      insights.push(categoryInsight);
      affinityUpdates.set(`category_${model.category}`, this.calculateAffinityBoost(interaction));
    }

    // Analyze provider affinity changes
    const providerInsight = this.analyzeProviderInteraction(interaction, model);
    if (providerInsight) {
      insights.push(providerInsight);
      affinityUpdates.set(`provider_${model.provider}`, this.calculateAffinityBoost(interaction));
    }

    // Analyze quality threshold patterns
    const qualityInsight = this.analyzeQualityPatterns(interaction, model);
    if (qualityInsight) {
      insights.push(qualityInsight);
    }

    // Analyze usage timing patterns
    const usageInsight = this.analyzeUsagePatterns(interaction);
    if (usageInsight) {
      insights.push(usageInsight);
    }

    // Generate updated preferences based on learning
    const updatedPreferences = this.generateUpdatedPreferences(interaction, model);

    // Generate recommendation improvements
    recommendations.push(...this.generateRecommendationImprovements(insights));

    return {
      updatedPreferences,
      newAffinities: affinityUpdates,
      behaviorInsights: insights,
      recommendationImprovements: recommendations
    };
  }

  /**
   * Analyze category interaction patterns
   */
  private analyzeCategoryInteraction(interaction: UserInteractionEvent, model: AIModel): BehaviorInsight | null {
    const categoryInteractions = this.interactions.filter(i => 
      this.getModelCategory(i.modelId) === model.category
    );

    if (categoryInteractions.length >= 3) {
      const avgEngagement = categoryInteractions.reduce((sum, i) => sum + i.engagementLevel, 0) / categoryInteractions.length;
      
      if (avgEngagement > 7) {
        return {
          type: 'category_preference',
          description: `Strong preference detected for ${model.category} models`,
          confidence: Math.min(0.9, avgEngagement / 10),
          actionableRecommendation: `Increase ${model.category} model recommendations by 30%`
        };
      }
    }

    return null;
  }

  /**
   * Analyze provider affinity patterns
   */
  private analyzeProviderInteraction(interaction: UserInteractionEvent, model: AIModel): BehaviorInsight | null {
    const providerInteractions = this.interactions.filter(i => 
      this.getModelProvider(i.modelId) === model.provider
    );

    if (providerInteractions.length >= 2) {
      const recentInteractions = providerInteractions.slice(-5);
      const avgEngagement = recentInteractions.reduce((sum, i) => sum + i.engagementLevel, 0) / recentInteractions.length;
      
      if (avgEngagement > 6) {
        return {
          type: 'provider_affinity',
          description: `Growing affinity for ${model.provider} models`,
          confidence: Math.min(0.8, avgEngagement / 10),
          actionableRecommendation: `Prioritize ${model.provider} models in recommendations`
        };
      }
    }

    return null;
  }

  /**
   * Analyze quality threshold patterns
   */
  private analyzeQualityPatterns(interaction: UserInteractionEvent, model: AIModel): BehaviorInsight | null {
    if (interaction.engagementLevel >= 8 && model.rating && model.rating > 80) {
      return {
        type: 'quality_threshold',
        description: 'High engagement with premium quality models detected',
        confidence: 0.7,
        actionableRecommendation: 'Adjust quality threshold to favor higher-rated models'
      };
    }

    return null;
  }

  /**
   * Analyze usage timing patterns
   */
  private analyzeUsagePatterns(interaction: UserInteractionEvent): BehaviorInsight | null {
    const hour = interaction.timestamp.getHours();
    const recentSessions = this.interactions
      .filter(i => i.timestamp.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      .map(i => i.timestamp.getHours());

    if (recentSessions.length >= 5) {
      const hourCounts = recentSessions.reduce((acc, h) => {
        acc[h] = (acc[h] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const mostActiveHour = Object.entries(hourCounts)
        .sort(([,a], [,b]) => b - a)[0];

      if (parseInt(mostActiveHour[0]) === hour && mostActiveHour[1] >= 3) {
        return {
          type: 'usage_pattern',
          description: `Peak usage detected around ${hour}:00`,
          confidence: 0.6,
          actionableRecommendation: `Optimize recommendations for ${hour}:00 usage context`
        };
      }
    }

    return null;
  }

  /**
   * Calculate affinity boost based on interaction type and engagement
   */
  private calculateAffinityBoost(interaction: UserInteractionEvent): number {
    const baseBoosts = {
      view: 0.1,
      like: 0.3,
      bookmark: 0.5,
      generate: 0.7,
      share: 0.4,
      download: 0.6
    };

    const baseBoost = baseBoosts[interaction.interactionType] || 0.1;
    const engagementMultiplier = interaction.engagementLevel / 10;
    
    return Math.min(1.0, baseBoost * engagementMultiplier * 1.5);
  }

  /**
   * Generate updated user preferences based on learning
   */
  private generateUpdatedPreferences(interaction: UserInteractionEvent, model: AIModel): UserPreferences {
    const current = this.userProfile.preferences;
    const affinityBoost = this.calculateAffinityBoost(interaction);

    // Update preferred categories
    const updatedCategories = [...current.preferredCategories];
    if (affinityBoost > 0.3 && !updatedCategories.includes(model.category)) {
      updatedCategories.push(model.category);
    }

    // Update preferred providers
    const updatedProviders = [...current.preferredProviders];
    if (affinityBoost > 0.4 && !updatedProviders.includes(model.provider)) {
      updatedProviders.push(model.provider);
    }

    // Update quality threshold based on high-engagement models
    let updatedQualityThreshold = current.qualityThreshold;
    if (interaction.engagementLevel >= 8 && model.rating && model.rating > current.qualityThreshold) {
      updatedQualityThreshold = Math.min(95, current.qualityThreshold + 5);
    }

    return {
      ...current,
      preferredCategories: updatedCategories.slice(0, 5), // Limit to top 5
      preferredProviders: updatedProviders.slice(0, 3), // Limit to top 3
      qualityThreshold: updatedQualityThreshold
    };
  }

  /**
   * Generate recommendation improvements based on insights
   */
  private generateRecommendationImprovements(insights: BehaviorInsight[]): string[] {
    return insights
      .filter(insight => insight.confidence > 0.6)
      .map(insight => insight.actionableRecommendation);
  }

  /**
   * Update the user profile with learning outcomes
   */
  private updateUserProfile(outcome: LearningOutcome): void {
    // In a real implementation, this would persist to database
    // For now, we update the in-memory profile
    this.userProfile = new UserProfile(
      this.userId,
      outcome.updatedPreferences,
      this.userProfile.behaviorMetrics,
      this.userProfile.engagementScores
    );
  }

  /**
   * Get recent behavioral insights for recommendations
   */
  getRecentInsights(limit: number = 5): BehaviorInsight[] {
    return this.learningHistory
      .slice(-3) // Last 3 learning outcomes
      .flatMap(outcome => outcome.behaviorInsights)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  /**
   * Get interaction history for analysis
   */
  getInteractionHistory(days: number = 30): UserInteractionEvent[] {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.interactions.filter(i => i.timestamp >= cutoff);
  }

  // Helper methods (in real implementation, these would query the database)
  private getModelCategory(modelId: number): string {
    // Placeholder - would lookup model category
    return 'General';
  }

  private getModelProvider(modelId: number): string {
    // Placeholder - would lookup model provider
    return 'RunDiffusion';
  }
}