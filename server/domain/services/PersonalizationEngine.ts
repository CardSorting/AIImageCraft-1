/**
 * Personalization Engine - Domain Service
 * Following Apple's philosophy of intelligent, seamless user experiences
 * Implements sophisticated recommendation algorithms with Clean Architecture
 */

import { UserProfile } from '../entities/User';
import { AIModelEntity } from '../entities/AIModel';

export interface PersonalizedRecommendation {
  readonly model: AIModelEntity;
  readonly score: number;
  readonly reasoning: string[];
  readonly confidence: number;
  readonly category: 'perfect_match' | 'trending' | 'exploration' | 'quality_upgrade';
}

export interface RecommendationContext {
  readonly sessionDuration?: number;
  readonly currentCategory?: string;
  readonly recentInteractions?: string[];
  readonly timeOfDay?: number;
  readonly deviceType?: 'mobile' | 'tablet' | 'desktop';
}

/**
 * Core Personalization Engine
 * Apple-style intelligent recommendation system
 */
export class PersonalizationEngine {
  
  /**
   * Generate personalized model recommendations
   * Uses sophisticated scoring algorithms inspired by Apple's recommendation systems
   */
  generateRecommendations(
    userProfile: UserProfile,
    availableModels: AIModelEntity[],
    context: RecommendationContext = {},
    limit: number = 20
  ): PersonalizedRecommendation[] {
    
    const recommendations: PersonalizedRecommendation[] = [];
    const userContext = userProfile.getRecommendationContext();
    
    // Score each model for the user
    for (const model of availableModels) {
      const recommendation = this.scoreModelForUser(model, userProfile, userContext, context);
      if (recommendation.score > 30) { // Minimum threshold
        recommendations.push(recommendation);
      }
    }
    
    // Sort by score and apply diversity optimization
    const sortedRecommendations = recommendations
      .sort((a, b) => b.score - a.score);
    
    const diversifiedRecommendations = this.applyDiversityOptimization(
      sortedRecommendations,
      userContext
    );
    
    return diversifiedRecommendations.slice(0, limit);
  }

  /**
   * Score an individual model for a specific user
   * Apple-style multi-factor scoring algorithm
   */
  private scoreModelForUser(
    model: AIModelEntity,
    userProfile: UserProfile,
    userContext: ReturnType<UserProfile['getRecommendationContext']>,
    sessionContext: RecommendationContext
  ): PersonalizedRecommendation {
    
    let score = 0;
    const reasoning: string[] = [];
    let category: PersonalizedRecommendation['category'] = 'exploration';
    
    // Base model appeal
    const baseAppeal = model.calculateAppealScore() * 0.3;
    score += baseAppeal;
    
    // User preference alignment
    const preferenceMatch = model.matchesUserProfile({
      preferredCategories: userContext.primaryInterests,
      preferredProviders: userProfile.preferences.preferredProviders,
      qualityThreshold: userProfile.preferences.qualityThreshold,
      speedPreference: userProfile.preferences.speedPreference
    });
    
    score += preferenceMatch.compatibility * 0.4;
    reasoning.push(...preferenceMatch.reasons);
    
    if (preferenceMatch.compatibility > 80) {
      category = 'perfect_match';
      reasoning.push('Exceptional match for your preferences');
    }
    
    // Expertise level consideration
    const expertiseLevel = userProfile.getExpertiseLevel();
    const expertiseBonus = this.calculateExpertiseBonus(model, expertiseLevel);
    score += expertiseBonus.score;
    if (expertiseBonus.reason) reasoning.push(expertiseBonus.reason);
    
    // Exploration scoring
    if (userContext.explorationWillingness === 'adventurous') {
      const explorationBonus = this.calculateExplorationBonus(model, userProfile);
      score += explorationBonus.score;
      if (explorationBonus.reason) {
        reasoning.push(explorationBonus.reason);
        if (explorationBonus.score > 15) category = 'exploration';
      }
    }
    
    // Trending and popularity boost
    const trendingBonus = this.calculateTrendingBonus(model);
    score += trendingBonus.score;
    if (trendingBonus.reason) {
      reasoning.push(trendingBonus.reason);
      if (trendingBonus.score > 20) category = 'trending';
    }
    
    // Quality upgrade opportunities
    if (model.metrics.qualityRating > userProfile.preferences.qualityThreshold + 15) {
      score += 15;
      category = 'quality_upgrade';
      reasoning.push('Significant quality improvement opportunity');
    }
    
    // Context-aware adjustments
    const contextBonus = this.calculateContextualBonus(model, sessionContext);
    score += contextBonus;
    
    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence(userProfile, model, reasoning.length);
    
    return {
      model,
      score: Math.min(100, Math.round(score)),
      reasoning: reasoning.slice(0, 3), // Top 3 reasons
      confidence,
      category
    };
  }

  /**
   * Calculate expertise-based scoring bonus
   */
  private calculateExpertiseBonus(
    model: AIModelEntity,
    expertiseLevel: string
  ): { score: number; reason?: string } {
    
    const expertiseBonuses = {
      'novice': {
        score: model.category === 'General' ? 15 : 0,
        reason: model.category === 'General' ? 'Perfect for getting started' : undefined
      },
      'intermediate': {
        score: model.capabilities.specialFeatures.length <= 2 ? 10 : 5,
        reason: 'Matches your growing expertise level'
      },
      'expert': {
        score: model.capabilities.specialFeatures.length > 2 ? 15 : 8,
        reason: model.capabilities.specialFeatures.length > 2 ? 'Advanced features for expert use' : undefined
      },
      'power_user': {
        score: 10,
        reason: 'Suitable for power user workflows'
      }
    };
    
    return expertiseBonuses[expertiseLevel as keyof typeof expertiseBonuses] || { score: 0 };
  }

  /**
   * Calculate exploration bonus for adventurous users
   */
  private calculateExplorationBonus(
    model: AIModelEntity,
    userProfile: UserProfile
  ): { score: number; reason?: string } {
    
    const userCategories = Array.from(userProfile.engagementScores.categoryAffinities.keys());
    const isNewCategory = !userCategories.includes(model.category);
    const isNewProvider = !userProfile.preferences.preferredProviders.includes(model.provider);
    
    let score = 0;
    let reason: string | undefined;
    
    if (isNewCategory && model.metrics.qualityRating > 70) {
      score += 20;
      reason = `Discover ${model.category} style models`;
    } else if (isNewProvider && model.metrics.qualityRating > 75) {
      score += 15;
      reason = `Explore ${model.provider} models`;
    } else if (model.featured && model.metrics.qualityRating > 80) {
      score += 10;
      reason = 'Featured high-quality model';
    }
    
    return { score, reason };
  }

  /**
   * Calculate trending and popularity bonus
   */
  private calculateTrendingBonus(model: AIModelEntity): { score: number; reason?: string } {
    if (model.metrics.popularityScore > 85 && model.featured) {
      return { score: 25, reason: 'Trending and highly popular' };
    } else if (model.metrics.popularityScore > 75) {
      return { score: 15, reason: 'Popular among creators' };
    } else if (model.featured) {
      return { score: 10, reason: 'Featured model' };
    }
    
    return { score: 0 };
  }

  /**
   * Calculate contextual bonus based on session context
   */
  private calculateContextualBonus(
    model: AIModelEntity,
    context: RecommendationContext
  ): number {
    let bonus = 0;
    
    // Time-based optimization
    if (context.timeOfDay !== undefined) {
      const hour = context.timeOfDay;
      if ((hour >= 9 && hour <= 17) && model.capabilities.speedTier === 'fast') {
        bonus += 5; // Work hours - prioritize speed
      } else if ((hour >= 18 || hour <= 8) && model.capabilities.qualityTier === 'professional') {
        bonus += 5; // Personal time - prioritize quality
      }
    }
    
    // Device-based optimization
    if (context.deviceType === 'mobile' && model.capabilities.speedTier === 'ultra_fast') {
      bonus += 5; // Mobile users prefer speed
    }
    
    // Session context
    if (context.currentCategory && model.category === context.currentCategory) {
      bonus += 10; // Continue exploring current category
    }
    
    return bonus;
  }

  /**
   * Apply diversity optimization to recommendations
   * Ensures variety in categories and providers
   */
  private applyDiversityOptimization(
    recommendations: PersonalizedRecommendation[],
    userContext: ReturnType<UserProfile['getRecommendationContext']>
  ): PersonalizedRecommendation[] {
    
    if (userContext.explorationWillingness === 'conservative') {
      return recommendations; // Conservative users prefer consistency
    }
    
    const diversified: PersonalizedRecommendation[] = [];
    const usedCategories = new Set<string>();
    const usedProviders = new Set<string>();
    
    // First pass: Add top recommendations ensuring diversity
    for (const rec of recommendations) {
      const categoryCount = Array.from(usedCategories).length;
      const providerCount = Array.from(usedProviders).length;
      
      const shouldAdd = 
        diversified.length < 5 || // Always add top 5
        (!usedCategories.has(rec.model.category) && categoryCount < 4) ||
        (!usedProviders.has(rec.model.provider) && providerCount < 3) ||
        rec.score > 85; // High-quality recommendations regardless
      
      if (shouldAdd) {
        diversified.push(rec);
        usedCategories.add(rec.model.category);
        usedProviders.add(rec.model.provider);
      }
      
      if (diversified.length >= 20) break;
    }
    
    // Second pass: Fill remaining slots with best remaining recommendations
    const remaining = recommendations.filter(r => !diversified.includes(r));
    diversified.push(...remaining.slice(0, 20 - diversified.length));
    
    return diversified;
  }

  /**
   * Calculate recommendation confidence score
   */
  private calculateConfidence(
    userProfile: UserProfile,
    model: AIModelEntity,
    reasoningCount: number
  ): number {
    let confidence = 0.5;
    
    // More interactions = higher confidence
    if (userProfile.behaviorMetrics.totalInteractions > 50) confidence += 0.3;
    else if (userProfile.behaviorMetrics.totalInteractions > 20) confidence += 0.2;
    else if (userProfile.behaviorMetrics.totalInteractions > 5) confidence += 0.1;
    
    // More reasoning = higher confidence
    confidence += Math.min(0.2, reasoningCount * 0.05);
    
    // Model popularity adds confidence
    if (model.metrics.popularityScore > 80) confidence += 0.1;
    
    return Math.min(1.0, confidence);
  }
}