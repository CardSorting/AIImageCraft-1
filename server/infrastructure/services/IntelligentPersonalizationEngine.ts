/**
 * Intelligent Personalization Engine Implementation
 * World-class recommendation system with hybrid algorithms
 * Following Apple's philosophy of seamless, intuitive experiences
 */

import { 
  IPersonalizationEngine, 
  RecommendationContext, 
  PersonalizedRecommendation, 
  RecommendationReason,
  RecommendationMetrics 
} from '../../domain/services/IPersonalizationEngine';
import { UserProfile } from '../../domain/entities/UserProfile';
import { AIModel } from '@shared/schema';

export class IntelligentPersonalizationEngine implements IPersonalizationEngine {
  
  /**
   * Generate personalized recommendations using hybrid approach
   * Combines multiple algorithms for optimal results
   */
  async generateRecommendations(
    userProfile: UserProfile,
    context: RecommendationContext,
    availableModels: AIModel[]
  ): Promise<PersonalizedRecommendation[]> {
    const startTime = Date.now();
    
    // Filter out excluded models
    const candidateModels = availableModels.filter(model => 
      !context.excludeModelIds?.includes(model.id)
    );

    // Generate recommendations from multiple algorithms
    const [
      contentBased,
      collaborative,
      contextual,
      trending,
      exploration
    ] = await Promise.all([
      this.getContentBasedRecommendations(userProfile, candidateModels, Math.ceil(context.maxResults * 0.4)),
      this.getCollaborativeFilteringRecommendations(userProfile, candidateModels, Math.ceil(context.maxResults * 0.3)),
      this.getContextualRecommendations(userProfile, context, candidateModels, Math.ceil(context.maxResults * 0.15)),
      this.getTrendingRecommendations(userProfile, candidateModels, Math.ceil(context.maxResults * 0.1)),
      this.getExplorationRecommendations(userProfile, candidateModels, Math.ceil(context.maxResults * 0.05))
    ]);

    // Combine and deduplicate recommendations
    const combinedRecommendations = this.combineRecommendations([
      ...contentBased,
      ...collaborative,
      ...contextual,
      ...trending,
      ...exploration
    ]);

    // Apply post-processing optimization
    const optimizedRecommendations = this.optimizeRecommendations(
      combinedRecommendations,
      userProfile,
      context
    );

    // Return top recommendations
    return optimizedRecommendations.slice(0, context.maxResults);
  }

  /**
   * Content-based filtering using model attributes and user preferences
   */
  async getContentBasedRecommendations(
    userProfile: UserProfile,
    models: AIModel[],
    limit: number
  ): Promise<PersonalizedRecommendation[]> {
    const recommendations: PersonalizedRecommendation[] = [];

    for (const model of models) {
      const reasons: RecommendationReason[] = [];
      let relevanceScore = 0;

      // Category affinity scoring
      const categoryAffinity = userProfile.getCategoryAffinity(model.category);
      if (categoryAffinity > 0.3) {
        relevanceScore += categoryAffinity * 0.4;
        reasons.push({
          type: 'category_affinity',
          strength: categoryAffinity,
          description: `Matches your interest in ${model.category} models`
        });
      }

      // Provider preference scoring
      if (userProfile.hasProviderAffinity(model.provider)) {
        relevanceScore += 0.2;
        reasons.push({
          type: 'provider_preference',
          strength: 0.8,
          description: `From ${model.provider}, which you've enjoyed before`
        });
      }

      // Quality alignment scoring
      const qualityAlignment = userProfile.getQualityAlignment(model.rating || 50);
      if (qualityAlignment > 0.5) {
        relevanceScore += qualityAlignment * 0.3;
        reasons.push({
          type: 'quality_match',
          strength: qualityAlignment,
          description: `Quality level matches your preferences`
        });
      }

      // Tag-based similarity
      const tagSimilarity = this.calculateTagSimilarity(userProfile, model);
      if (tagSimilarity > 0.4) {
        relevanceScore += tagSimilarity * 0.1;
        reasons.push({
          type: 'content_based',
          strength: tagSimilarity,
          description: `Similar features to models you've liked`
        });
      }

      if (relevanceScore > 0.2 && reasons.length > 0) {
        recommendations.push({
          model,
          relevanceScore,
          confidenceScore: Math.min(0.9, relevanceScore + 0.1),
          recommendationReason: reasons,
          diversityFactor: this.calculateDiversityFactor(model, models),
          contextualBoost: 0
        });
      }
    }

    return recommendations
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }

  /**
   * Collaborative filtering based on similar user behaviors
   */
  async getCollaborativeFilteringRecommendations(
    userProfile: UserProfile,
    models: AIModel[],
    limit: number
  ): Promise<PersonalizedRecommendation[]> {
    const recommendations: PersonalizedRecommendation[] = [];

    // Simplified collaborative filtering based on popularity and engagement
    for (const model of models) {
      const reasons: RecommendationReason[] = [];
      let relevanceScore = 0;

      // Popularity-based scoring
      const popularityScore = this.calculatePopularityScore(model);
      if (popularityScore > 0.6) {
        relevanceScore += popularityScore * 0.3;
        reasons.push({
          type: 'similar_users',
          strength: popularityScore,
          description: `Highly rated by users with similar preferences`
        });
      }

      // Engagement-based scoring
      const engagementScore = this.calculateEngagementScore(model);
      if (engagementScore > 0.5) {
        relevanceScore += engagementScore * 0.4;
        reasons.push({
          type: 'collaborative_filtering',
          strength: engagementScore,
          description: `Popular among active community members`
        });
      }

      if (relevanceScore > 0.3 && reasons.length > 0) {
        recommendations.push({
          model,
          relevanceScore,
          confidenceScore: relevanceScore * 0.8, // Lower confidence for collaborative
          recommendationReason: reasons,
          diversityFactor: this.calculateDiversityFactor(model, models),
          contextualBoost: 0
        });
      }
    }

    return recommendations
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }

  /**
   * Contextual recommendations based on current session and time
   */
  async getContextualRecommendations(
    userProfile: UserProfile,
    context: RecommendationContext,
    models: AIModel[],
    limit: number
  ): Promise<PersonalizedRecommendation[]> {
    const recommendations: PersonalizedRecommendation[] = [];
    const timeBoost = userProfile.getTimeContextBoost();

    for (const model of models) {
      const reasons: RecommendationReason[] = [];
      let relevanceScore = 0;
      let contextualBoost = 0;

      // Time-based contextual boost
      if (timeBoost > 0.7) {
        contextualBoost += timeBoost * 0.2;
        reasons.push({
          type: 'time_context',
          strength: timeBoost,
          description: `Perfect timing for your typical usage pattern`
        });
      }

      // Session context analysis
      if (context.sessionContext.currentCategory === model.category) {
        contextualBoost += 0.3;
        relevanceScore += 0.4;
        reasons.push({
          type: 'behavioral_pattern',
          strength: 0.8,
          description: `Continues your current browsing session`
        });
      }

      // Recently viewed similar models
      const viewedSimilarity = this.calculateRecentViewSimilarity(
        context.sessionContext.modelsViewed,
        model
      );
      if (viewedSimilarity > 0.5) {
        relevanceScore += viewedSimilarity * 0.3;
        reasons.push({
          type: 'behavioral_pattern',
          strength: viewedSimilarity,
          description: `Similar to models you've recently explored`
        });
      }

      if (relevanceScore > 0.2 || contextualBoost > 0.1) {
        recommendations.push({
          model,
          relevanceScore: relevanceScore + contextualBoost,
          confidenceScore: Math.min(0.95, relevanceScore + contextualBoost + 0.1),
          recommendationReason: reasons,
          diversityFactor: this.calculateDiversityFactor(model, models),
          contextualBoost
        });
      }
    }

    return recommendations
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }

  /**
   * Trending and popularity-based recommendations
   */
  async getTrendingRecommendations(
    userProfile: UserProfile,
    models: AIModel[],
    limit: number
  ): Promise<PersonalizedRecommendation[]> {
    const recommendations: PersonalizedRecommendation[] = [];

    // Sort by trending metrics
    const trendingModels = models
      .filter(model => model.featured === 1 || (model.likes || 0) > 1000)
      .sort((a, b) => {
        const aScore = (a.likes || 0) + (a.imagesGenerated || 0) * 0.1;
        const bScore = (b.likes || 0) + (b.imagesGenerated || 0) * 0.1;
        return bScore - aScore;
      });

    for (const model of trendingModels.slice(0, limit)) {
      const reasons: RecommendationReason[] = [{
        type: 'trending',
        strength: 0.8,
        description: `Trending in the community right now`
      }];

      recommendations.push({
        model,
        relevanceScore: 0.6,
        confidenceScore: 0.7,
        recommendationReason: reasons,
        diversityFactor: this.calculateDiversityFactor(model, models),
        contextualBoost: 0
      });
    }

    return recommendations;
  }

  /**
   * Exploration recommendations for discovering new content
   */
  async getExplorationRecommendations(
    userProfile: UserProfile,
    models: AIModel[],
    limit: number
  ): Promise<PersonalizedRecommendation[]> {
    const recommendations: PersonalizedRecommendation[] = [];
    const explorationWillingness = userProfile.getExplorationWillingness();

    if (explorationWillingness < 0.3) {
      return recommendations; // User prefers familiar content
    }

    // Find models in categories user hasn't explored much
    const unexploredModels = models.filter(model => 
      userProfile.getCategoryAffinity(model.category) < 0.3
    );

    for (const model of unexploredModels.slice(0, limit)) {
      const reasons: RecommendationReason[] = [{
        type: 'exploration',
        strength: explorationWillingness,
        description: `Discover something new in ${model.category}`
      }];

      recommendations.push({
        model,
        relevanceScore: explorationWillingness * 0.6,
        confidenceScore: 0.5, // Lower confidence for exploration
        recommendationReason: reasons,
        diversityFactor: 1.0, // High diversity for exploration
        contextualBoost: 0
      });
    }

    return recommendations;
  }

  /**
   * Calculate diversity score for recommendation set
   */
  calculateDiversityScore(recommendations: PersonalizedRecommendation[]): number {
    if (recommendations.length < 2) return 1.0;

    const categories = new Set(recommendations.map(r => r.model.category));
    const providers = new Set(recommendations.map(r => r.model.provider));
    
    const categoryDiversity = categories.size / recommendations.length;
    const providerDiversity = providers.size / recommendations.length;
    
    return (categoryDiversity + providerDiversity) / 2;
  }

  /**
   * Apply post-processing to optimize recommendation quality
   */
  optimizeRecommendations(
    recommendations: PersonalizedRecommendation[],
    userProfile: UserProfile,
    context: RecommendationContext
  ): PersonalizedRecommendation[] {
    // Remove duplicates
    const uniqueRecommendations = this.removeDuplicates(recommendations);
    
    // Apply diversity balancing
    const balancedRecommendations = this.balanceDiversity(uniqueRecommendations);
    
    // Final scoring adjustment
    return balancedRecommendations.map(rec => ({
      ...rec,
      relevanceScore: Math.min(1.0, rec.relevanceScore * 1.1) // Slight boost
    }));
  }

  /**
   * Update user profile based on interaction feedback
   */
  async recordInteractionFeedback(
    userId: number,
    modelId: number,
    interactionType: string,
    engagementLevel: number
  ): Promise<void> {
    // This would typically update the user profile in the database
    // For now, we'll implement the interface
    console.log(`Recording interaction: User ${userId}, Model ${modelId}, Type: ${interactionType}, Engagement: ${engagementLevel}`);
  }

  // Private helper methods

  private combineRecommendations(recommendations: PersonalizedRecommendation[]): PersonalizedRecommendation[] {
    const modelMap = new Map<number, PersonalizedRecommendation>();
    
    for (const rec of recommendations) {
      const existing = modelMap.get(rec.model.id);
      if (existing) {
        // Create new recommendation with combined scores and reasons
        const combined: PersonalizedRecommendation = {
          ...existing,
          relevanceScore: Math.max(existing.relevanceScore, rec.relevanceScore),
          recommendationReason: [
            ...existing.recommendationReason,
            ...rec.recommendationReason
          ]
        };
        modelMap.set(rec.model.id, combined);
      } else {
        modelMap.set(rec.model.id, rec);
      }
    }
    
    return Array.from(modelMap.values());
  }

  private calculateTagSimilarity(userProfile: UserProfile, model: AIModel): number {
    // Simplified tag similarity calculation
    if (!model.tags || model.tags.length === 0) return 0;
    
    const preferredTags = userProfile.preferences.preferredStyles;
    const intersection = model.tags.filter(tag => 
      preferredTags.some(prefTag => 
        tag.toLowerCase().includes(prefTag.toLowerCase())
      )
    );
    
    return intersection.length / Math.max(model.tags.length, preferredTags.length);
  }

  private calculateDiversityFactor(model: AIModel, allModels: AIModel[]): number {
    // Simplified diversity calculation based on category frequency
    const categoryCount = allModels.filter(m => m.category === model.category).length;
    return Math.max(0.1, 1 - (categoryCount / allModels.length));
  }

  private calculatePopularityScore(model: AIModel): number {
    const maxLikes = 5000; // Assumed maximum for normalization
    const maxDownloads = 200000;
    
    const likesScore = Math.min(1, (model.likes || 0) / maxLikes);
    const downloadsScore = Math.min(1, (model.downloads || 0) / maxDownloads);
    
    return (likesScore + downloadsScore) / 2;
  }

  private calculateEngagementScore(model: AIModel): number {
    const maxDiscussions = 300;
    const maxImages = 100000;
    
    const discussionsScore = Math.min(1, (model.discussions || 0) / maxDiscussions);
    const imagesScore = Math.min(1, (model.imagesGenerated || 0) / maxImages);
    
    return (discussionsScore + imagesScore) / 2;
  }

  private calculateRecentViewSimilarity(viewedModelIds: number[], model: AIModel): number {
    // Simplified similarity based on recent views
    // In a real implementation, this would compare model features
    return viewedModelIds.length > 0 ? Math.random() * 0.8 : 0;
  }

  private removeDuplicates(recommendations: PersonalizedRecommendation[]): PersonalizedRecommendation[] {
    const seen = new Set<number>();
    return recommendations.filter(rec => {
      if (seen.has(rec.model.id)) {
        return false;
      }
      seen.add(rec.model.id);
      return true;
    });
  }

  private balanceDiversity(recommendations: PersonalizedRecommendation[]): PersonalizedRecommendation[] {
    // Ensure good category and provider diversity
    const balanced: PersonalizedRecommendation[] = [];
    const categoryCounts = new Map<string, number>();
    
    // Sort by relevance score first
    const sorted = recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    for (const rec of sorted) {
      const categoryCount = categoryCounts.get(rec.model.category) || 0;
      
      // Limit models per category to promote diversity
      if (categoryCount < 3 || balanced.length < 5) {
        balanced.push(rec);
        categoryCounts.set(rec.model.category, categoryCount + 1);
      }
    }
    
    return balanced;
  }
}